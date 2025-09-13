# Notion OAuth Setup Guide

## Why you're getting "invalid_client" error

The error occurs because you're using incorrect credentials for OAuth. The values in your `.env.local` are:
- **NOTION_CLIENT_ID**: Currently set to a page ID (wrong)
- **NOTION_CLIENT_SECRET**: Currently set to an integration token (wrong)

## How to fix it

### Step 1: Create a Notion OAuth Integration
1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Fill in:
   - Name: "NicerSaaS OAuth"
   - Type: "Public"
   - Redirect URIs: Add `http://localhost:3000/api/notion/callback`
4. Click "Save"

### Step 2: Get your OAuth credentials
After creating the integration, you'll see:
- **OAuth Client ID**: Copy this value
- **OAuth Client Secret**: Copy this value (keep it secure!)

### Step 3: Update your environment file
Replace the values in `.env.local`:

```bash
NOTION_CLIENT_ID=your_actual_oauth_client_id
NOTION_CLIENT_SECRET=your_actual_oauth_client_secret
```

### Step 4: Test the connection
1. Restart your development server
2. Go to http://localhost:3000/dashboard
3. Click "Connect" under Notion Account
4. Authorize the integration

## Important Notes

- **OAuth Client ID** format: Usually starts with something like `12345678-1234-1234-1234-123456789abc`
- **OAuth Client Secret** format: A long string of random characters
- **Integration Token** (NOTION_ACCESS_TOKEN) is different - this is for direct API access, not OAuth
- **Page ID** is different - this identifies a specific Notion page

## Troubleshooting

If you still get errors:
1. Make sure the redirect URI in your Notion integration settings matches exactly: `http://localhost:3000/api/notion/callback`
2. Ensure your integration is set to "Public" type
3. Double-check that you're copying the OAuth credentials, not the integration token
4. Restart your development server after making changes