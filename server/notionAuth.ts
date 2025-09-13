import type { Express } from "express";
import { storage } from "./storage";

// Notion OAuth configuration for local development
// Use env variable for redirect URI with sensible fallback
const DEFAULT_NOTION_REDIRECT_URI = "http://localhost:3000/api/notion/callback";

interface NotionTokenResponse {
  access_token: string;
  token_type: string;
  bot_id: string;
  workspace_name: string;
  workspace_id: string;
  workspace_icon: string;
  owner: {
    type: string;
    user: {
      id: string;
      name: string;
      avatar_url: string;
      type: string;
      person: {
        email: string;
      };
    };
  };
}

export async function setupNotionAuth(app: Express, isAuthenticated?: any) {
  // OAuth initiation endpoint
  app.get("/api/connect/notion", isAuthenticated || ((req: any, res: any, next: any) => next()), async (req: any, res) => {
    try {
      const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID;
      if (!NOTION_CLIENT_ID) {
        throw new Error("NOTION_CLIENT_ID not configured");
      }

      // Generate a random state parameter for security
      const state = Math.random().toString(36).substring(2, 15);
      
      // Store state in session for verification
      req.session.notionState = state;
      req.session.userId = req.user?.id || req.user?.claims?.sub;
      console.log("Notion OAuth: Storing userId in session:", req.session.userId);

      // Build Notion OAuth URL
      const NOTION_REDIRECT_URI = process.env.NOTION_REDIRECT_URI || DEFAULT_NOTION_REDIRECT_URI;
      const authUrl = new URL("https://api.notion.com/v1/oauth/authorize");
      authUrl.searchParams.set("client_id", NOTION_CLIENT_ID);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("owner", "user");
      authUrl.searchParams.set("redirect_uri", NOTION_REDIRECT_URI);
      authUrl.searchParams.set("state", state);

      res.redirect(authUrl.toString());
    } catch (error) {
      console.error("Error initiating Notion OAuth:", error);
      res.status(500).json({ 
        message: "Failed to initiate Notion connection",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // OAuth callback endpoint
  app.get("/api/notion/callback", async (req: any, res) => {
    try {
      const { code, state, error: notionError } = req.query;

      if (notionError) {
        throw new Error(`Notion OAuth error: ${notionError}`);
      }

      if (!code) {
        throw new Error("Missing authorization code");
      }

      // Verify state parameter for security
      if (!state || state !== req.session.notionState) {
        throw new Error("Invalid state parameter");
      }

      const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID;
      const NOTION_CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET;
      if (!NOTION_CLIENT_ID || !NOTION_CLIENT_SECRET) {
        throw new Error("Notion OAuth credentials not configured");
      }

      // Exchange authorization code for access token
      const NOTION_REDIRECT_URI = process.env.NOTION_REDIRECT_URI || DEFAULT_NOTION_REDIRECT_URI;
      const tokenResponse = await fetch("https://api.notion.com/v1/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${Buffer.from(
            `${NOTION_CLIENT_ID}:${NOTION_CLIENT_SECRET}`
          ).toString("base64")}`,
        },
        body: JSON.stringify({
          grant_type: "authorization_code",
          code: code as string,
          redirect_uri: NOTION_REDIRECT_URI,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new Error(`Token exchange failed: ${errorData.error_description || errorData.error}`);
      }

      const tokenData: NotionTokenResponse = await tokenResponse.json();

      // Store the Notion connection for the user
      const userId = req.session.userId;
      console.log("Notion OAuth callback: Retrieved userId from session:", userId);
      if (!userId) {
        console.log("Session contents:", req.session);
        throw new Error("User session not found");
      }

      await storage.storeNotionConnection({
        userId,
        accessToken: tokenData.access_token,
        workspaceId: tokenData.workspace_id,
        workspaceName: tokenData.workspace_name,
        botId: tokenData.bot_id,
        ownerEmail: tokenData.owner.user.person.email,
        ownerName: tokenData.owner.user.name,
        ownerAvatar: tokenData.owner.user.avatar_url,
      });

      // Clean up session
      delete req.session.notionState;
      delete req.session.userId;

      // Redirect back to dashboard with success
      res.redirect("/dashboard?notion_connected=true");
    } catch (error) {
      console.error("Error in Notion OAuth callback:", error);
      
      // Clean up session
      delete req.session.notionState;
      delete req.session.userId;

      // Redirect with error
      res.redirect(`/dashboard?notion_error=${encodeURIComponent(error instanceof Error ? error.message : "Unknown error")}`);
    }
  });

  // Get current Notion connection status
  app.get("/api/notion/user", isAuthenticated || ((req: any, res: any, next: any) => next()), async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const connection = await storage.getNotionConnection(userId);
      if (!connection) {
        return res.json(null);
      }

      res.json({
        id: connection.workspaceId,
        name: connection.workspaceName,
        email: connection.ownerEmail,
        avatar: connection.ownerAvatar,
      });
    } catch (error) {
      console.error("Error fetching Notion connection:", error);
      res.status(500).json({ message: "Failed to fetch Notion connection" });
    }
  });

  // Disconnect Notion account
  app.post("/api/notion/disconnect", isAuthenticated || ((req: any, res: any, next: any) => next()), async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      await storage.deleteNotionConnection(userId);
      res.json({ message: "Notion account disconnected" });
    } catch (error) {
      console.error("Error disconnecting Notion:", error);
      res.status(500).json({ message: "Failed to disconnect Notion account" });
    }
  });
}