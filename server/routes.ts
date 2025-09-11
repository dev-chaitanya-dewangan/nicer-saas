import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { getUncachableNotionClient } from "./notionClient";
import { generateNotionWorkspace, refineWorkspaceSpec, generateChatResponse } from "./openai";
import { insertWorkspaceSchema, insertConversationSchema } from "@shared/schema";
import { z } from "zod";

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not provided - payment features will be disabled');
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
}) : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Workspace routes
  app.get('/api/workspaces', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const workspaces = await storage.getUserWorkspaces(userId);
      res.json(workspaces);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      res.status(500).json({ message: "Failed to fetch workspaces" });
    }
  });

  app.post('/api/workspaces', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check usage limits
      if (user.monthlyUsage >= user.usageLimit) {
        return res.status(403).json({ 
          message: "Monthly usage limit reached. Please upgrade your plan.",
          usageLimit: user.usageLimit,
          currentUsage: user.monthlyUsage
        });
      }

      const validatedData = insertWorkspaceSchema.parse({
        ...req.body,
        userId,
        status: "generating"
      });

      const workspace = await storage.createWorkspace(validatedData);

      // Generate AI workspace specification
      try {
        const aiResponse = await generateNotionWorkspace(
          validatedData.prompt,
          validatedData.theme
        );

        const updatedWorkspace = await storage.updateWorkspace(workspace.id, {
          aiResponse,
          status: "completed"
        });

        // Increment user usage
        await storage.updateUserUsage(userId, 1);

        res.json(updatedWorkspace);
      } catch (aiError) {
        console.error("AI generation error:", aiError);
        await storage.updateWorkspace(workspace.id, {
          status: "failed"
        });
        res.status(500).json({ message: "Failed to generate workspace specification" });
      }
    } catch (error) {
      console.error("Error creating workspace:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create workspace" });
      }
    }
  });

  app.get('/api/workspaces/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const workspace = await storage.getWorkspace(req.params.id);
      
      if (!workspace) {
        return res.status(404).json({ message: "Workspace not found" });
      }

      if (workspace.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(workspace);
    } catch (error) {
      console.error("Error fetching workspace:", error);
      res.status(500).json({ message: "Failed to fetch workspace" });
    }
  });

  app.post('/api/workspaces/:id/deploy', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const workspace = await storage.getWorkspace(req.params.id);
      
      if (!workspace) {
        return res.status(404).json({ message: "Workspace not found" });
      }

      if (workspace.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (!workspace.aiResponse) {
        return res.status(400).json({ message: "Workspace specification not ready" });
      }

      const notion = await getUncachableNotionClient();
      
      // TODO: Implement Notion workspace deployment
      // This would involve creating databases, pages, and properties in Notion
      // For now, we'll simulate the deployment
      
      const updatedWorkspace = await storage.updateWorkspace(workspace.id, {
        status: "deployed",
        notionPageId: "simulated-page-id" // Replace with actual Notion page ID
      });

      res.json(updatedWorkspace);
    } catch (error) {
      console.error("Error deploying workspace:", error);
      res.status(500).json({ message: "Failed to deploy workspace to Notion" });
    }
  });

  app.post('/api/workspaces/:id/refine', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { refinementPrompt } = req.body;
      const workspace = await storage.getWorkspace(req.params.id);
      
      if (!workspace) {
        return res.status(404).json({ message: "Workspace not found" });
      }

      if (workspace.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (!workspace.aiResponse) {
        return res.status(400).json({ message: "No workspace specification to refine" });
      }

      const refinedSpec = await refineWorkspaceSpec(
        workspace.aiResponse as any,
        refinementPrompt
      );

      const updatedWorkspace = await storage.updateWorkspace(workspace.id, {
        aiResponse: refinedSpec,
        status: "completed"
      });

      res.json(updatedWorkspace);
    } catch (error) {
      console.error("Error refining workspace:", error);
      res.status(500).json({ message: "Failed to refine workspace" });
    }
  });

  // Template routes
  app.get('/api/templates', async (req, res) => {
    try {
      const { category } = req.query;
      const templates = category 
        ? await storage.getTemplatesByCategory(category as string)
        : await storage.getTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get('/api/templates/:id', async (req, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  app.post('/api/templates/:id/use', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const template = await storage.getTemplate(req.params.id);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check usage limits
      if (user.monthlyUsage >= user.usageLimit) {
        return res.status(403).json({ 
          message: "Monthly usage limit reached. Please upgrade your plan.",
          usageLimit: user.usageLimit,
          currentUsage: user.monthlyUsage
        });
      }

      // Create workspace from template
      const workspace = await storage.createWorkspace({
        userId,
        title: template.title,
        description: template.description,
        prompt: template.prompt,
        theme: req.body.theme || "professional",
        templateId: template.id,
        status: "generating"
      });

      // Generate AI response
      try {
        const aiResponse = await generateNotionWorkspace(
          template.prompt,
          req.body.theme || "professional"
        );

        const updatedWorkspace = await storage.updateWorkspace(workspace.id, {
          aiResponse,
          status: "completed"
        });

        // Increment template usage and user usage
        await storage.incrementTemplateUsage(template.id);
        await storage.updateUserUsage(userId, 1);

        res.json(updatedWorkspace);
      } catch (aiError) {
        console.error("AI generation error:", aiError);
        await storage.updateWorkspace(workspace.id, {
          status: "failed"
        });
        res.status(500).json({ message: "Failed to generate workspace from template" });
      }
    } catch (error) {
      console.error("Error using template:", error);
      res.status(500).json({ message: "Failed to use template" });
    }
  });

  // Chat routes
  app.post('/api/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { messages, workspaceId } = req.body;

      const chatResponse = await generateChatResponse(messages);

      // Save conversation if workspaceId provided
      if (workspaceId) {
        const updatedMessages = [...messages, {
          role: "assistant",
          content: chatResponse,
          timestamp: new Date().toISOString()
        }];

        // Try to update existing conversation or create new one
        try {
          const existingConversations = await storage.getUserConversations(userId);
          const workspaceConversation = existingConversations.find(c => c.workspaceId === workspaceId);
          
          if (workspaceConversation) {
            await storage.updateConversation(workspaceConversation.id, updatedMessages);
          } else {
            await storage.createConversation({
              userId,
              workspaceId,
              messages: updatedMessages
            });
          }
        } catch (convError) {
          console.error("Error saving conversation:", convError);
          // Continue with response even if conversation save fails
        }
      }

      res.json({ response: chatResponse });
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // Stripe subscription routes (only if Stripe is configured)
  if (stripe) {
    app.post('/api/create-subscription', isAuthenticated, async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        let user = await storage.getUser(userId);

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        if (user.stripeSubscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
          return res.send({
            subscriptionId: subscription.id,
            clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
          });
        }
        
        if (!user.email) {
          return res.status(400).json({ message: 'No user email on file' });
        }

        const customer = await stripe.customers.create({
          email: user.email,
          name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email,
        });

        const subscription = await stripe.subscriptions.create({
          customer: customer.id,
          items: [{
            price: process.env.STRIPE_PRICE_ID || 'price_default', // User needs to set this
          }],
          payment_behavior: 'default_incomplete',
          expand: ['latest_invoice.payment_intent'],
        });

        await storage.updateUserStripeInfo(userId, customer.id, subscription.id);
    
        res.send({
          subscriptionId: subscription.id,
          clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
        });
      } catch (error: any) {
        console.error("Stripe subscription error:", error);
        return res.status(400).send({ error: { message: error.message } });
      }
    });
  } else {
    // Placeholder route if Stripe not configured
    app.post('/api/create-subscription', (req, res) => {
      res.status(503).json({ message: "Payment processing not configured. Please set STRIPE_SECRET_KEY." });
    });
  }

  const httpServer = createServer(app);
  return httpServer;
}
