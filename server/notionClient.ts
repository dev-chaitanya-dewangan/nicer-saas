import { Client } from '@notionhq/client';
import { storage } from './storage';

let connectionSettings: any;

async function getAccessToken() {
  // Check if we're in a request context with authenticated user
  if (typeof global !== 'undefined' && (global as any).currentUserId) {
    const userId = (global as any).currentUserId;
    const connection = await storage.getNotionConnection(userId);
    if (connection?.accessToken) {
      return connection.accessToken;
    }
  }

  // Local development fallback - use NOTION_ACCESS_TOKEN from environment
  if (process.env.NOTION_ACCESS_TOKEN) {
    return process.env.NOTION_ACCESS_TOKEN;
  }
  
  // Replit environment authentication (fallback for production)
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('Notion not connected. Please connect your Notion account first.');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=notion',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Notion not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableNotionClient() {
  const accessToken = await getAccessToken();
  return new Client({ auth: accessToken });
}

// Helper function to set current user context
export function setCurrentUserId(userId: string) {
  if (typeof global !== 'undefined') {
    (global as any).currentUserId = userId;
  }
}

// Helper function to clear current user context
export function clearCurrentUserId() {
  if (typeof global !== 'undefined') {
    delete (global as any).currentUserId;
  }
}
