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
  apiVersion: "2025-08-27.basil",
}) : null;

// Notion workspace deployment function
async function deployWorkspaceToNotion(notion: any, workspaceData: any): Promise<string> {
  try {
    // Create a main workspace page
    const parentPage = await notion.pages.create({
      parent: {
        type: "page_id",
        page_id: process.env.NOTION_PAGE_ID || await getUserNotionPageId(notion)
      },
      properties: {
        title: {
          title: [
            {
              text: {
                content: workspaceData.title || "Generated Workspace"
              }
            }
          ]
        }
      },
      children: [
        {
          object: "block",
          type: "heading_1",
          heading_1: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: workspaceData.title || "Generated Workspace"
                }
              }
            ]
          }
        },
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: workspaceData.description || "AI-generated workspace created with Nicer SaaS"
                }
              }
            ]
          }
        }
      ]
    });

    // Create databases from the workspace data
    if (workspaceData.databases && Array.isArray(workspaceData.databases)) {
      const databasePromises = workspaceData.databases.map(async (db: any) => {
        // Transform properties to Notion format
        const notionProperties: any = {};
        
        if (db.properties && Array.isArray(db.properties)) {
          db.properties.forEach((prop: any) => {
            const propName = prop.name || prop.title || "Untitled";
            switch (prop.type) {
              case "text":
              case "title":
                notionProperties[propName] = { title: {} };
                break;
              case "number":
                notionProperties[propName] = { number: { format: "number" } };
                break;
              case "select":
                notionProperties[propName] = { 
                  select: { 
                    options: (prop.options || []).map((opt: any) => ({
                      name: opt.name || opt,
                      color: opt.color || "default"
                    }))
                  }
                };
                break;
              case "multiselect":
              case "multi_select":
                notionProperties[propName] = { 
                  multi_select: { 
                    options: (prop.options || []).map((opt: any) => ({
                      name: opt.name || opt,
                      color: opt.color || "default"
                    }))
                  }
                };
                break;
              case "date":
                notionProperties[propName] = { date: {} };
                break;
              case "checkbox":
                notionProperties[propName] = { checkbox: {} };
                break;
              case "url":
                notionProperties[propName] = { url: {} };
                break;
              case "email":
                notionProperties[propName] = { email: {} };
                break;
              case "phone":
                notionProperties[propName] = { phone_number: {} };
                break;
              case "formula":
                notionProperties[propName] = { 
                  formula: { expression: prop.formula || "1" }
                };
                break;
              case "relation":
                // Skip relations for now as they require target database
                break;
              default:
                notionProperties[propName] = { rich_text: {} };
            }
          });
        }

        // Ensure at least one property exists (Notion requirement)
        if (Object.keys(notionProperties).length === 0) {
          notionProperties["Name"] = { title: {} };
        }

        return await notion.databases.create({
          parent: {
            type: "page_id",
            page_id: parentPage.id
          },
          title: [
            {
              type: "text",
              text: {
                content: db.title || db.name || "Database"
              }
            }
          ],
          properties: notionProperties
        });
      });

      await Promise.all(databasePromises);
    }

    return parentPage.url;
  } catch (error) {
    console.error("Error deploying to Notion:", error);
    throw new Error(`Failed to deploy workspace to Notion: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Helper function to get user's default Notion page ID
async function getUserNotionPageId(notion: any): Promise<string> {
  try {
    const response = await notion.search({
      filter: {
        value: "page",
        property: "object"
      },
      sort: {
        direction: "descending",
        timestamp: "last_edited_time"
      },
      page_size: 1
    });
    
    if (response.results && response.results.length > 0) {
      return response.results[0].id;
    }
    
    throw new Error("No accessible pages found in Notion workspace");
  } catch (error) {
    throw new Error("Could not find a suitable parent page in Notion");
  }
}

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
      if ((user.monthlyUsage || 0) >= (user.usageLimit || 3)) {
        return res.status(403).json({ 
          message: "Monthly usage limit reached. Please upgrade your plan.",
          usageLimit: user.usageLimit || 3,
          currentUsage: user.monthlyUsage || 0
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
          validatedData.theme || "professional"
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
      
      // Parse the AI-generated workspace data and deploy to Notion
      let workspaceData;
      try {
        workspaceData = typeof workspace.aiResponse === 'string' 
          ? JSON.parse(workspace.aiResponse)
          : workspace.aiResponse;
      } catch (error) {
        console.error("Error parsing workspace data:", error);
        return res.status(400).json({ message: "Invalid workspace data format" });
      }
      
      const notionUrl = await deployWorkspaceToNotion(notion, workspaceData);
      
      const updatedWorkspace = await storage.updateWorkspace(workspace.id, {
        status: "deployed",
        notionPageId: notionUrl // Store the Notion page URL
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

  // Initialize templates if none exist
  const initializeTemplates = async () => {
    try {
      const existingTemplates = await storage.getTemplates();
      if (existingTemplates.length === 0) {
        const defaultTemplates = [
          {
            title: "SaaS CRM System",
            description: "Complete customer relationship management with lead tracking, deal pipeline, and revenue analytics.",
            category: "business",
            prompt: "Create a comprehensive SaaS CRM system with lead tracking, deal pipeline management, revenue analytics, churn rate calculations, and customer communication logs.",
            tags: ["Leads Database", "Deal Pipeline", "Analytics"],
            preview: {
              databases: 3,
              properties: 25,
              views: 8
            },
            isPublic: true,
            usageCount: 0
          },
          {
            title: "Project Management Hub",
            description: "Task boards, timelines, resource allocation, and team coordination in one workspace.",
            category: "productivity",
            prompt: "Build a project management workspace with task boards, timeline views, resource allocation, team coordination, milestone tracking, and progress reporting.",
            tags: ["Kanban Boards", "Timeline", "Resources"],
            preview: {
              databases: 4,
              properties: 20,
              views: 6
            },
            isPublic: true,
            usageCount: 0
          },
          {
            title: "Content Calendar",
            description: "Multi-platform content planning with collaboration tools and performance analytics.",
            category: "marketing",
            prompt: "Create a content calendar workspace for multi-platform content planning, collaboration tools, publishing schedules, performance analytics, and content ideation.",
            tags: ["Multi-Platform", "Collaboration", "Analytics"],
            preview: {
              databases: 3,
              properties: 18,
              views: 5
            },
            isPublic: true,
            usageCount: 0
          },
          {
            title: "Life Organization System",
            description: "Habit tracking, goal management, and personal productivity system for life organization.",
            category: "personal",
            prompt: "Design a personal life organization system with habit tracking, goal management, daily journaling, mood tracking, and personal productivity metrics.",
            tags: ["Habit Tracker", "Goals", "Journal"],
            preview: {
              databases: 4,
              properties: 22,
              views: 7
            },
            isPublic: true,
            usageCount: 0
          },
          {
            title: "E-commerce Operations",
            description: "Product catalog, order management, inventory tracking, and customer support system.",
            category: "business",
            prompt: "Build an e-commerce operations workspace with product catalog, order management, inventory tracking, customer support tickets, and sales analytics.",
            tags: ["Products", "Orders", "Inventory"],
            preview: {
              databases: 5,
              properties: 30,
              views: 10
            },
            isPublic: true,
            usageCount: 0
          }
        ];
        
        for (const template of defaultTemplates) {
          await storage.createTemplate(template);
        }
        console.log('Initialized default templates');
      }
    } catch (error) {
      console.error('Error initializing templates:', error);
    }
  };
  
  // Initialize templates on startup
  await initializeTemplates();

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
      const templateId = req.params.id;
      
      // Handle both database templates and featured templates
      let template;
      let prompt;
      let title;
      let description;
      
      if (templateId.startsWith('featured-')) {
        // Handle featured templates with hardcoded data
        const featuredTemplates = {
          'featured-crm': {
            title: 'SaaS CRM System',
            description: 'Complete customer relationship management with lead tracking, deal pipeline, and revenue analytics.',
            prompt: 'Create a comprehensive SaaS CRM system with lead tracking, deal pipeline management, revenue analytics, churn rate calculations, and customer communication logs.'
          },
          'featured-project': {
            title: 'Project Management Hub', 
            description: 'Task boards, timelines, resource allocation, and team coordination in one workspace.',
            prompt: 'Build a project management workspace with task boards, timeline views, resource allocation, team coordination, milestone tracking, and progress reporting.'
          },
          'featured-content': {
            title: 'Content Calendar',
            description: 'Multi-platform content planning with collaboration tools and performance analytics.',
            prompt: 'Create a content calendar workspace for multi-platform content planning, collaboration tools, publishing schedules, performance analytics, and content ideation.'
          },
          'featured-personal': {
            title: 'Life Organization System',
            description: 'Habit tracking, goal management, and personal productivity system for life organization.',
            prompt: 'Design a personal life organization system with habit tracking, goal management, daily journaling, mood tracking, and personal productivity metrics.'
          },
          'featured-ecommerce': {
            title: 'E-commerce Operations',
            description: 'Product catalog, order management, inventory tracking, and customer support system.',
            prompt: 'Build an e-commerce operations workspace with product catalog, order management, inventory tracking, customer support tickets, and sales analytics.'
          }
        };
        
        const featuredTemplate = featuredTemplates[templateId as keyof typeof featuredTemplates];
        if (!featuredTemplate) {
          return res.status(404).json({ message: "Featured template not found" });
        }
        
        title = featuredTemplate.title;
        description = featuredTemplate.description;
        prompt = featuredTemplate.prompt;
      } else {
        // Handle database templates
        template = await storage.getTemplate(templateId);
        if (!template) {
          return res.status(404).json({ message: "Template not found" });
        }
        title = template.title;
        description = template.description;
        prompt = template.prompt;
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check usage limits
      if ((user.monthlyUsage || 0) >= (user.usageLimit || 3)) {
        return res.status(403).json({ 
          message: "Monthly usage limit reached. Please upgrade your plan.",
          usageLimit: user.usageLimit || 3,
          currentUsage: user.monthlyUsage || 0
        });
      }

      // Create workspace from template
      const workspace = await storage.createWorkspace({
        userId,
        title,
        description,
        prompt,
        theme: req.body.theme || "professional",
        templateId: templateId.startsWith('featured-') ? undefined : templateId,
        status: "generating"
      });

      // Generate AI response
      try {
        const aiResponse = await generateNotionWorkspace(
          prompt,
          req.body.theme || "professional"
        );

        const updatedWorkspace = await storage.updateWorkspace(workspace.id, {
          aiResponse,
          status: "completed"
        });

        // Increment template usage only for database templates
        if (template) {
          await storage.incrementTemplateUsage(template.id);
        }
        
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
