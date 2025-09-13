import type { Express } from "express";
import { createServer, type Server } from "http";
// Remove duplicate import since it's already imported later in the file

// Use local auth for development, Replit auth for production
const isDevelopment = process.env.NODE_ENV === "development";

// Dynamically import the appropriate auth module
let authModulePromise: Promise<any>;

if (isDevelopment) {
  authModulePromise = import("./localAuth");
} else {
  authModulePromise = import("./replitAuth");
}

import {
  getUncachableNotionClient,
  setCurrentUserId,
  clearCurrentUserId,
} from "./notionClient";
import { setupNotionAuth } from "./notionAuth";
import {
  generateNotionWorkspace,
  refineWorkspaceSpec,
  generateChatResponse,
  validateWorkspaceSpec,
} from "./openai";
import {
  insertWorkspaceSchema,
  insertConversationSchema,
} from "@shared/schema-sqlite";
import { z } from "zod";
import { storage } from "./storage";

// Get Notion user information
async function getNotionUserInfo(notion: any) {
  try {
    const user = await notion.users.me();
    return {
      email:
        user.person?.email || user.bot?.owner?.user?.person?.email || "Unknown",
      name: user.name || "Unknown User",
      id: user.id,
    };
  } catch (error) {
    console.error("Error getting Notion user info:", error);
    return { email: "Unknown", name: "Unknown User", id: "unknown" };
  }
}

// Enhanced rate limiting with exponential backoff
async function rateLimitWithBackoff(
  operation: () => Promise<any>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<any> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // Check if it's a rate limit error
      const isRateLimitError =
        error.status === 429 ||
        error.code === "rate_limited" ||
        (error.message && error.message.includes("rate limit"));

      // If it's a rate limit error and we have retries left, wait and retry
      if (isRateLimitError && attempt < maxRetries) {
        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        console.log(
          `Rate limit hit. Retrying in ${delay}ms (attempt ${attempt + 1}/${
            maxRetries + 1
          })`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // If it's not a rate limit error or we're out of retries, throw the error
      throw error;
    }
  }

  throw lastError;
}

// Notion workspace deployment function with improved rate limiting
async function deployWorkspaceToNotion(
  notion: any,
  workspaceData: any,
  userInfo?: any
): Promise<{ url: string; notionUser: any }> {
  try {
    // Create a main workspace page with rate limiting
    const parentPage = await rateLimitWithBackoff(() =>
      notion.pages.create({
        parent: {
          type: "page_id",
          page_id: process.env.NOTION_PAGE_ID || getUserNotionPageId(notion),
        },
        properties: {
          title: {
            title: [
              {
                text: {
                  content: workspaceData.title || "Generated Workspace",
                },
              },
            ],
          },
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
                    content: workspaceData.title || "Generated Workspace",
                  },
                },
              ],
            },
          },
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [
                {
                  type: "text",
                  text: {
                    content:
                      workspaceData.description ||
                      "AI-generated workspace created with Nicer SaaS",
                  },
                },
              ],
            },
          },
        ],
      })
    );

    // Create databases from the workspace data
    if (workspaceData.databases && Array.isArray(workspaceData.databases)) {
      // Create databases sequentially with enhanced rate limiting
      for (let index = 0; index < workspaceData.databases.length; index++) {
        const db = workspaceData.databases[index];
        try {
          console.log(
            `Creating database ${index + 1}/${
              workspaceData.databases.length
            }: ${db.title || db.name || "Untitled"}`
          );

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
                        color: opt.color || "default",
                      })),
                    },
                  };
                  break;
                case "multiselect":
                case "multi_select":
                  notionProperties[propName] = {
                    multi_select: {
                      options: (prop.options || []).map((opt: any) => ({
                        name: opt.name || opt,
                        color: opt.color || "default",
                      })),
                    },
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
                    formula: { expression: prop.formula || "1" },
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

          // Create database with rate limiting and retry mechanism
          await rateLimitWithBackoff(() =>
            notion.databases.create({
              parent: {
                type: "page_id",
                page_id: parentPage.id,
              },
              title: [
                {
                  type: "text",
                  text: {
                    content: db.title || db.name || "Database",
                  },
                },
              ],
              properties: notionProperties,
            })
          );

          // Progressive delay to prevent rate limiting - increase delay for complex templates
          const baseDelay = 500;
          const complexityFactor = Math.min(workspaceData.databases.length, 10); // Cap complexity factor
          const delay = baseDelay + index * complexityFactor * 100;
          console.log(`Waiting ${delay}ms before next database creation`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } catch (dbError: any) {
          console.error(
            `Error creating database "${db.title || db.name}":`,
            dbError
          );

          // If it's a rate limit error, throw it to stop the entire process
          if (
            dbError.status === 429 ||
            dbError.code === "rate_limited" ||
            (dbError.message && dbError.message.includes("rate limit"))
          ) {
            throw new Error(
              `Rate limit exceeded while creating database "${
                db.title || db.name
              }". Please try again later.`
            );
          }

          // Continue with other databases even if one fails
          // (no need for continue statement here since we're at the end of the loop)
        }
      }
    }

    // Get Notion user information
    const notionUser = userInfo || (await getNotionUserInfo(notion));
    console.log(
      `Workspace deployed to Notion account: ${notionUser.email} (${notionUser.name})`
    );

    return { url: parentPage.url, notionUser };
  } catch (error) {
    console.error("Error deploying to Notion:", error);
    throw new Error(
      `Failed to deploy workspace to Notion: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// Helper function to get user's default Notion page ID
async function getUserNotionPageId(notion: any): Promise<string> {
  try {
    const response = await notion.search({
      filter: {
        value: "page",
        property: "object",
      },
      sort: {
        direction: "descending",
        timestamp: "last_edited_time",
      },
      page_size: 1,
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
  const authModule = await authModulePromise;
  const { setupAuth, isAuthenticated } = authModule;
  await setupAuth(app);

  // Setup Notion OAuth
  await setupNotionAuth(app, (app as any).isAuthenticated);

  // Make isAuthenticated available to all routes
  (app as any).isAuthenticated = isAuthenticated;

  // Auth routes
  app.get(
    "/api/auth/user",
    (app as any).isAuthenticated,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        res.json(user);
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Failed to fetch user" });
      }
    }
  );

  // Workspace routes
  app.get(
    "/api/workspaces",
    (app as any).isAuthenticated,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const workspaces = await storage.getUserWorkspaces(userId);
        res.json(workspaces);
      } catch (error) {
        console.error("Error fetching workspaces:", error);
        res.status(500).json({ message: "Failed to fetch workspaces" });
      }
    }
  );

  app.post(
    "/api/workspaces",
    (app as any).isAuthenticated,
    async (req: any, res) => {
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
            currentUsage: user.monthlyUsage || 0,
          });
        }

        const validatedData = insertWorkspaceSchema.parse({
          ...req.body,
          userId,
          status: "generating",
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
            status: "completed",
          });

          // Increment user usage
          await storage.updateUserUsage(userId, 1);

          res.json(updatedWorkspace);
        } catch (aiError) {
          console.error("AI generation error:", aiError);
          await storage.updateWorkspace(workspace.id, {
            status: "failed",
          });
          res
            .status(500)
            .json({ message: "Failed to generate workspace specification" });
        }
      } catch (error) {
        console.error("Error creating workspace:", error);
        if (error instanceof z.ZodError) {
          res
            .status(400)
            .json({ message: "Invalid input", errors: error.errors });
        } else {
          res.status(500).json({ message: "Failed to create workspace" });
        }
      }
    }
  );

  app.get(
    "/api/workspaces/:id",
    (app as any).isAuthenticated,
    async (req: any, res) => {
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
    }
  );

  app.post(
    "/api/workspaces/:id/deploy",
    (app as any).isAuthenticated,
    async (req: any, res) => {
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
          return res
            .status(400)
            .json({ message: "Workspace specification not ready" });
        }

        setCurrentUserId(userId);

        try {
          const notion = await getUncachableNotionClient();

          // Parse the AI-generated workspace data and deploy to Notion
          let workspaceData;
          try {
            workspaceData =
              typeof workspace.aiResponse === "string"
                ? JSON.parse(workspace.aiResponse)
                : workspace.aiResponse;
          } catch (error) {
            console.error("Error parsing workspace data:", error);
            return res
              .status(400)
              .json({ message: "Invalid workspace data format" });
          }

          // Validate workspace specification against Notion API requirements
          const validation = validateWorkspaceSpec(workspaceData);
          if (!validation.valid) {
            console.error("Workspace validation failed:", validation.errors);
            return res.status(400).json({
              message:
                "Workspace specification is incompatible with Notion API",
              errors: validation.errors,
              warnings: validation.warnings,
            });
          }

          // Log validation warnings if any
          if (validation.warnings.length > 0) {
            console.warn("Workspace validation warnings:", validation.warnings);
          }

          // Get Notion user info first for logging and response
          const notionUser = await getNotionUserInfo(notion);
          console.log(
            `Deploying workspace "${
              workspaceData.title || "Untitled"
            }" to Notion account: ${notionUser.email} (${notionUser.name})`
          );

          const deployResult = await deployWorkspaceToNotion(
            notion,
            workspaceData,
            notionUser
          );

          const updatedWorkspace = await storage.updateWorkspace(workspace.id, {
            status: "deployed",
            notionPageId: deployResult.url, // Store the Notion page URL
          });

          // Clear user context
          clearCurrentUserId();

          // Include Notion user info in response for frontend display
          res.json({
            ...updatedWorkspace,
            notionUser: deployResult.notionUser,
          });
        } catch (error) {
          clearCurrentUserId();
          throw error;
        }
      } catch (error) {
        console.error("Error deploying workspace:", error);

        // Provide detailed error information for debugging
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        const isAuthError =
          errorMessage.includes("X_REPLIT_TOKEN") ||
          errorMessage.includes("Notion not connected");
        const isRateLimitError =
          errorMessage.includes("rate limit") ||
          errorMessage.includes("Rate limit") ||
          errorMessage.includes("429");

        res.status(500).json({
          message: "Failed to deploy workspace to Notion",
          error: errorMessage,
          suggestion: isAuthError
            ? "Please check your Notion integration settings. For local development, ensure NOTION_ACCESS_TOKEN is set in your environment variables."
            : isRateLimitError
            ? "Notion API rate limit exceeded. Please try again in a few minutes. For complex workspaces, consider that Notion has strict rate limits on database creation (~3 requests per second)."
            : "Please check the workspace specification for compatibility issues with Notion API.",
          docs: isAuthError
            ? "https://developers.notion.com/docs/authorization"
            : isRateLimitError
            ? "https://developers.notion.com/reference/status-codes#rate-limits"
            : "https://developers.notion.com/reference/property-value-object",
        });
      }
    }
  );

  app.post(
    "/api/workspaces/:id/refine",
    (app as any).isAuthenticated,
    async (req: any, res) => {
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
          return res
            .status(400)
            .json({ message: "No workspace specification to refine" });
        }

        const refinedSpec = await refineWorkspaceSpec(
          workspace.aiResponse as any,
          refinementPrompt
        );

        const updatedWorkspace = await storage.updateWorkspace(workspace.id, {
          aiResponse: refinedSpec,
          status: "completed",
        });

        res.json(updatedWorkspace);
      } catch (error) {
        console.error("Error refining workspace:", error);
        res.status(500).json({ message: "Failed to refine workspace" });
      }
    }
  );

  // Initialize templates if none exist
  const initializeTemplates = async () => {
    try {
      const existingTemplates = await storage.getTemplates();
      if (existingTemplates.length === 0) {
        const defaultTemplates = [
          {
            title: "SaaS CRM System",
            description:
              "Complete customer relationship management with lead tracking, deal pipeline, and revenue analytics.",
            category: "business",
            prompt:
              "Create a comprehensive SaaS CRM system with lead tracking, deal pipeline management, revenue analytics, churn rate calculations, and customer communication logs.",
            tags: JSON.stringify([
              "Leads Database",
              "Deal Pipeline",
              "Analytics",
            ]),
            preview: JSON.stringify({
              databases: 3,
              properties: 25,
              views: 8,
            }),
            isPublic: true,
            usageCount: 0,
          },
          {
            title: "Project Management Hub",
            description:
              "Task boards, timelines, resource allocation, and team coordination in one workspace.",
            category: "productivity",
            prompt:
              "Build a project management workspace with task boards, timeline views, resource allocation, team coordination, milestone tracking, and progress reporting.",
            tags: JSON.stringify(["Kanban Boards", "Timeline", "Resources"]),
            preview: JSON.stringify({
              databases: 4,
              properties: 20,
              views: 6,
            }),
            isPublic: true,
            usageCount: 0,
          },
          {
            title: "Content Calendar",
            description:
              "Multi-platform content planning with collaboration tools and performance analytics.",
            category: "marketing",
            prompt:
              "Create a content calendar workspace for multi-platform content planning, collaboration tools, publishing schedules, performance analytics, and content ideation.",
            tags: JSON.stringify([
              "Multi-Platform",
              "Collaboration",
              "Analytics",
            ]),
            preview: JSON.stringify({
              databases: 3,
              properties: 18,
              views: 5,
            }),
            isPublic: true,
            usageCount: 0,
          },
          {
            title: "Life Organization System",
            description:
              "Habit tracking, goal management, and personal productivity system for life organization.",
            category: "personal",
            prompt:
              "Design a personal life organization system with habit tracking, goal management, daily journaling, mood tracking, and personal productivity metrics.",
            tags: JSON.stringify(["Habit Tracker", "Goals", "Journal"]),
            preview: JSON.stringify({
              databases: 4,
              properties: 22,
              views: 7,
            }),
            isPublic: true,
            usageCount: 0,
          },
          {
            title: "E-commerce Operations",
            description:
              "Product catalog, order management, inventory tracking, and customer support system.",
            category: "business",
            prompt:
              "Build an e-commerce operations workspace with product catalog, order management, inventory tracking, customer support tickets, and sales analytics.",
            tags: JSON.stringify(["Products", "Orders", "Inventory"]),
            preview: JSON.stringify({
              databases: 5,
              properties: 30,
              views: 10,
            }),
            isPublic: true,
            usageCount: 0,
          },
        ];

        for (const template of defaultTemplates) {
          await storage.createTemplate(template);
        }
        console.log("Initialized default templates");
      }
    } catch (error) {
      console.error("Error initializing templates:", error);
    }
  };

  // Initialize templates on startup
  await initializeTemplates();

  // Template routes
  app.get("/api/templates", async (req, res) => {
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

  app.get("/api/templates/:id", async (req, res) => {
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

  app.post(
    "/api/templates/:id/use",
    (app as any).isAuthenticated,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const templateId = req.params.id;

        // Handle both database templates and featured templates
        let template;
        let prompt;
        let title;
        let description;

        if (templateId.startsWith("featured-")) {
          // Handle featured templates with hardcoded data
          const featuredTemplates = {
            "featured-crm": {
              title: "SaaS CRM System",
              description:
                "Complete customer relationship management with lead tracking, deal pipeline, and revenue analytics.",
              prompt:
                "Create a comprehensive SaaS CRM system with lead tracking, deal pipeline management, revenue analytics, churn rate calculations, and customer communication logs.",
            },
            "featured-project": {
              title: "Project Management Hub",
              description:
                "Task boards, timelines, resource allocation, and team coordination in one workspace.",
              prompt:
                "Build a project management workspace with task boards, timeline views, resource allocation, team coordination, milestone tracking, and progress reporting.",
            },
            "featured-content": {
              title: "Content Calendar",
              description:
                "Multi-platform content planning with collaboration tools and performance analytics.",
              prompt:
                "Create a content calendar workspace for multi-platform content planning, collaboration tools, publishing schedules, performance analytics, and content ideation.",
            },
            "featured-personal": {
              title: "Life Organization System",
              description:
                "Habit tracking, goal management, and personal productivity system for life organization.",
              prompt:
                "Design a personal life organization system with habit tracking, goal management, daily journaling, mood tracking, and personal productivity metrics.",
            },
            "featured-ecommerce": {
              title: "E-commerce Operations",
              description:
                "Product catalog, order management, inventory tracking, and customer support system.",
              prompt:
                "Build an e-commerce operations workspace with product catalog, order management, inventory tracking, customer support tickets, and sales analytics.",
            },
          };

          const featuredTemplate =
            featuredTemplates[templateId as keyof typeof featuredTemplates];
          if (!featuredTemplate) {
            return res
              .status(404)
              .json({ message: "Featured template not found" });
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
            currentUsage: user.monthlyUsage || 0,
          });
        }

        // Create workspace from template
        const workspace = await storage.createWorkspace({
          userId,
          title,
          description,
          prompt,
          theme: req.body.theme || "professional",
          templateId: templateId.startsWith("featured-")
            ? undefined
            : templateId,
          status: "generating",
        });

        // Generate AI response
        try {
          const aiResponse = await generateNotionWorkspace(
            prompt,
            req.body.theme || "professional"
          );

          const updatedWorkspace = await storage.updateWorkspace(workspace.id, {
            aiResponse,
            status: "completed",
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
            status: "failed",
          });
          res
            .status(500)
            .json({ message: "Failed to generate workspace from template" });
        }
      } catch (error) {
        console.error("Error using template:", error);
        res.status(500).json({ message: "Failed to use template" });
      }
    }
  );

  // Chat routes
  app.post("/api/chat", (app as any).isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { messages, workspaceId } = req.body;

      const chatResponse = await generateChatResponse(messages);

      // Save conversation if workspaceId provided
      if (workspaceId) {
        const updatedMessages = [
          ...messages,
          {
            role: "assistant",
            content: chatResponse,
            timestamp: new Date().toISOString(),
          },
        ];

        // Try to update existing conversation or create new one
        try {
          const existingConversations = await storage.getUserConversations(
            userId
          );
          const workspaceConversation = existingConversations.find(
            (c) => c.workspaceId === workspaceId
          );

          if (workspaceConversation) {
            await storage.updateConversation(
              workspaceConversation.id,
              updatedMessages
            );
          } else {
            await storage.createConversation({
              userId,
              workspaceId,
              messages: updatedMessages,
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

  const httpServer = createServer(app);
  return httpServer;
}
