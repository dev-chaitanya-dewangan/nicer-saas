# Notion OAuth Setup Guide for Developers

This guide explains how to properly set up Notion OAuth for the Nicer SaaS application.

## Overview

Nicer SaaS uses Notion OAuth to allow users to connect their Notion accounts and deploy AI-generated workspaces directly to their Notion workspace.

## Prerequisites

1. A Notion account
2. Access to https://www.notion.so/my-integrations

## Step-by-Step Setup

### 1. Create a Notion Integration

1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Fill in the integration details:
   - **Name**: Choose a descriptive name (e.g., "Nicer SaaS OAuth")
   - **Logo**: Optional, but recommended for better user experience
   - **Workspace**: Select the workspace where you want to develop/test

### 2. Configure Integration Settings

1. Set the integration type to **"Public"**
2. Add the redirect URI:
   ```
   http://localhost:3000/api/notion/callback
   ```
   (For production, you'll also need to add your production callback URL)

### 3. Get OAuth Credentials

After creating the integration, you'll see:
- **OAuth Client ID**: A UUID (e.g., `12345678-1234-1234-1234-123456789abc`)
- **OAuth Client Secret**: A long random string

**Important**: These are NOT the same as:
- Integration Token (used for direct API access)
- Page ID (identifies a specific Notion page)

### 4. Configure Environment Variables

Update your `.env.local` file with the correct credentials:

```bash
# Notion OAuth Configuration
NOTION_CLIENT_ID=your_actual_oauth_client_id_here
NOTION_CLIENT_SECRET=your_actual_oauth_client_secret_here
```

Example of correct format:
```bash
NOTION_CLIENT_ID=12345678-1234-1234-1234-123456789abc
NOTION_CLIENT_SECRET=secret_Xabcdefghijklmnopqrstuvwxyz123456
```

### 5. Test the Connection

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the dashboard
3. Click the "Connect" button in the Notion Account card
4. You should be redirected to Notion for authorization
5. After granting permissions, you should be redirected back to your dashboard with a success message

## Common Issues and Solutions

### "invalid_client" Error

**Cause**: Using incorrect credentials (integration token instead of OAuth credentials)

**Solution**: 
1. Verify you're using the OAuth Client ID and Client Secret
2. Ensure they match the format described above
3. Make sure the integration type is set to "Public"

### Redirect URI Mismatch

**Cause**: The redirect URI in your Notion integration doesn't match the application's callback URL

**Solution**:
1. Check that your redirect URI exactly matches:
   `http://localhost:3000/api/notion/callback`
2. Note that trailing slashes or protocol differences will cause issues

### "access_denied" Error

**Cause**: User cancelled the OAuth authorization flow

**Solution**: 
1. The user needs to grant permissions to connect their Notion account
2. Explain to users that this permission is required to deploy workspaces

## Security Best Practices

1. **Never commit credentials to version control**
   - Keep `.env.local` in `.gitignore`
   - Use `.env.local.example` as a template

2. **Environment-specific credentials**
   - Use different credentials for development and production
   - Store production credentials securely

3. **Regular credential rotation**
   - Rotate OAuth client secrets periodically
   - Immediately revoke compromised credentials

## Production Deployment

For production deployment:

1. Add your production callback URL to the integration:
   ```
   https://yourdomain.com/api/notion/callback
   ```

2. Update environment variables in your production environment

3. Test the OAuth flow in production

## Troubleshooting

### Verify Current Configuration

Run the setup verification script:
```bash
node setup-notion-oauth-fixed.js
```

### Check Server Logs

Look for error messages in the server console:
```bash
npm run dev
```

### Reset Connection

If you need to reset the connection:
1. Click "Disconnect" in the dashboard
2. Revoke the integration from Notion (in the integration settings)
3. Create a new integration if needed
4. Update credentials in `.env.local`

## Additional Resources

- [Notion OAuth Documentation](https://developers.notion.com/docs/authorization)
- [Notion API Reference](https://developers.notion.com/reference/intro)
- [OAuth 2.0 Specification](https://tools.ietf.org/html/rfc6749)