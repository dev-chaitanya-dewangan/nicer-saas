import {
  users,
  workspaces,
  templates,
  conversations,
  notionConnections,
  type User,
  type UpsertUser,
  type Workspace,
  type InsertWorkspace,
  type Template,
  type InsertTemplate,
  type Conversation,
  type InsertConversation,
  type NotionConnection as SchemaNotionConnection,
} from "@shared/schema-sqlite";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

// Interface for storage operations - using the schema type
export type NotionConnection = SchemaNotionConnection;

// Interface for aesthetic learning data
interface AestheticLearningData {
  userId: string;
  workspaceId: string;
  prompt: string;
  selectedContent: boolean;
  contentDensity: "minimal" | "moderate" | "rich";
  modifications: string[];
  finalRating?: number;
  industryContext?: string;
  createdAt: Date;
}

export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserUsage(userId: string, increment: number): Promise<User>;
  resetMonthlyUsage(userId: string): Promise<User>;

  // Workspace operations
  createWorkspace(workspace: InsertWorkspace): Promise<Workspace>;
  getWorkspace(id: string): Promise<Workspace | undefined>;
  getUserWorkspaces(userId: string): Promise<Workspace[]>;
  updateWorkspace(id: string, updates: Partial<Workspace>): Promise<Workspace>;
  deleteWorkspace(id: string): Promise<void>;

  // Template operations
  getTemplates(): Promise<Template[]>;
  getTemplate(id: string): Promise<Template | undefined>;
  getTemplatesByCategory(category: string): Promise<Template[]>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  incrementTemplateUsage(id: string): Promise<void>;

  // Conversation operations
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversation(id: string): Promise<Conversation | undefined>;
  getUserConversations(userId: string): Promise<Conversation[]>;
  updateConversation(id: string, messages: any[]): Promise<Conversation>;

  // Notion connection operations
  storeNotionConnection(connection: NotionConnection): Promise<void>;
  getNotionConnection(userId: string): Promise<NotionConnection | undefined>;
  deleteNotionConnection(userId: string): Promise<void>;

  // Aesthetic learning operations
  trackAestheticInteraction(data: AestheticLearningData): Promise<void>;
  getUserAestheticPreferences(userId: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    // @ts-ignore
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // @ts-ignore
    const result = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  }

  async updateUserUsage(userId: string, increment: number): Promise<User> {
    // @ts-ignore
    const result = await db
      .update(users)
      .set({
        monthlyUsage: sql`${users.monthlyUsage} + ${increment}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async resetMonthlyUsage(userId: string): Promise<User> {
    // @ts-ignore
    const result = await db
      .update(users)
      .set({
        monthlyUsage: 0,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  // Workspace operations
  async createWorkspace(workspace: InsertWorkspace): Promise<Workspace> {
    // @ts-ignore
    const result = await db.insert(workspaces).values(workspace).returning();
    return result[0];
  }

  async getWorkspace(id: string): Promise<Workspace | undefined> {
    // @ts-ignore
    const result = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, id));
    return result[0];
  }

  async getUserWorkspaces(userId: string): Promise<Workspace[]> {
    // @ts-ignore
    return await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.userId, userId))
      .orderBy(desc(workspaces.createdAt));
  }

  async updateWorkspace(
    id: string,
    updates: Partial<Workspace>
  ): Promise<Workspace> {
    // @ts-ignore
    const result = await db
      .update(workspaces)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(workspaces.id, id))
      .returning();
    return result[0];
  }

  async deleteWorkspace(id: string): Promise<void> {
    // @ts-ignore
    await db.delete(workspaces).where(eq(workspaces.id, id));
  }

  // Template operations
  async getTemplates(): Promise<Template[]> {
    // @ts-ignore
    return await db
      .select()
      .from(templates)
      .where(eq(templates.isPublic, true))
      .orderBy(desc(templates.usageCount));
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    // @ts-ignore
    const result = await db
      .select()
      .from(templates)
      .where(eq(templates.id, id));
    return result[0];
  }

  async getTemplatesByCategory(category: string): Promise<Template[]> {
    // @ts-ignore
    return await db
      .select()
      .from(templates)
      .where(
        and(eq(templates.category, category), eq(templates.isPublic, true))
      )
      .orderBy(desc(templates.usageCount));
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    // @ts-ignore
    const result = await db.insert(templates).values(template).returning();
    return result[0];
  }

  async incrementTemplateUsage(id: string): Promise<void> {
    // @ts-ignore
    await db
      .update(templates)
      .set({
        usageCount: sql`${templates.usageCount} + 1`,
      })
      .where(eq(templates.id, id));
  }

  // Conversation operations
  async createConversation(
    conversation: InsertConversation
  ): Promise<Conversation> {
    // @ts-ignore
    const result = await db
      .insert(conversations)
      .values(conversation)
      .returning();
    return result[0];
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    // @ts-ignore
    const result = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));
    return result[0];
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    // @ts-ignore
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt));
  }

  async updateConversation(id: string, messages: any[]): Promise<Conversation> {
    // @ts-ignore
    const result = await db
      .update(conversations)
      .set({
        messages,
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, id))
      .returning();
    return result[0];
  }

  // Notion connection operations
  async storeNotionConnection(connection: NotionConnection): Promise<void> {
    // @ts-ignore
    await db
      .insert(notionConnections)
      .values({
        ...connection,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: notionConnections.userId,
        set: {
          ...connection,
          updatedAt: new Date(),
        },
      });
  }

  async getNotionConnection(
    userId: string
  ): Promise<NotionConnection | undefined> {
    // @ts-ignore
    const result = await db
      .select()
      .from(notionConnections)
      .where(eq(notionConnections.userId, userId));
    return result[0];
  }

  async deleteNotionConnection(userId: string): Promise<void> {
    // @ts-ignore
    await db
      .delete(notionConnections)
      .where(eq(notionConnections.userId, userId));
  }
  
  // Aesthetic learning operations
  async trackAestheticInteraction(data: AestheticLearningData): Promise<void> {
    // Store aesthetic interaction data in the workspace metadata
    // @ts-ignore
    await db
      .update(workspaces)
      .set({
        metadata: sql`json_patch(ifnull(${workspaces.metadata}, '{}'), ${JSON.stringify({
          aestheticLearning: {
            prompt: data.prompt,
            selectedContent: data.selectedContent,
            contentDensity: data.contentDensity,
            modifications: data.modifications,
            finalRating: data.finalRating,
            industryContext: data.industryContext,
            createdAt: data.createdAt
          }
        })})`,
        updatedAt: new Date(),
      })
      .where(eq(workspaces.id, data.workspaceId));
  }

  async getUserAestheticPreferences(userId: string): Promise<any> {
    // Retrieve user's aesthetic preferences from their workspaces
    // @ts-ignore
    const result = await db
      .select({ metadata: workspaces.metadata })
      .from(workspaces)
      .where(eq(workspaces.userId, userId));
    
    // Extract aesthetic preferences from metadata
    const preferences: any = {
      contentDensityPreferences: {},
      includeContentPreferences: 0,
      industryPreferences: {}
    };
    
    result.forEach((workspace: any) => {
      if (workspace.metadata && workspace.metadata.aestheticLearning) {
        const learningData = workspace.metadata.aestheticLearning;
        
        // Count content density preferences
        if (preferences.contentDensityPreferences[learningData.contentDensity]) {
          preferences.contentDensityPreferences[learningData.contentDensity]++;
        } else {
          preferences.contentDensityPreferences[learningData.contentDensity] = 1;
        }
        
        // Count include content preferences
        if (learningData.selectedContent) {
          preferences.includeContentPreferences++;
        }
        
        // Count industry preferences
        if (learningData.industryContext) {
          if (preferences.industryPreferences[learningData.industryContext]) {
            preferences.industryPreferences[learningData.industryContext]++;
          } else {
            preferences.industryPreferences[learningData.industryContext] = 1;
          }
        }
      }
    });
    
    return preferences;
  }
}

export const storage = new DatabaseStorage();
