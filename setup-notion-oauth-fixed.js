#!/usr/bin/env node

/**
 * Notion OAuth Setup Helper
 * 
 * This script helps verify your Notion OAuth configuration
 * Run: node setup-notion-oauth-fixed.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Checking Notion OAuth Configuration...\\n');

// Check environment variables
const envPath = path.join(__dirname, '.env.local');

// Read .env.local
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.log('❌ .env.local file not found');
  process.exit(1);
}

// Extract current values
const clientIdMatch = envContent.match(/NOTION_CLIENT_ID=(.+)/);
const clientSecretMatch = envContent.match(/NOTION_CLIENT_SECRET=(.+)/);

const currentClientId = clientIdMatch ? clientIdMatch[1].trim() : '';
const currentClientSecret = clientSecretMatch ? clientSecretMatch[1].trim() : '';

console.log('📋 Current Configuration:');
console.log(`   NOTION_CLIENT_ID: ${currentClientId === 'your_actual_oauth_client_id_here' ? '❌ NOT SET' : '✅ Set'}`);
console.log(`   NOTION_CLIENT_SECRET: ${currentClientSecret === 'your_actual_oauth_client_secret_here' ? '❌ NOT SET' : '✅ Set'}\\n`);

if (currentClientId.includes('24ed872b') || currentClientSecret.includes('secret_tHoE')) {
  console.log('🚨 ERROR: You are using integration token/page ID instead of OAuth credentials!');
  console.log('   These values will cause "invalid_client" errors.\\n');
}

if (currentClientId === 'your_actual_oauth_client_id_here' || currentClientSecret === 'your_actual_oauth_client_secret_here') {
  console.log('🎯 Next Steps:');
  console.log('   1. Go to: https://www.notion.so/my-integrations');
  console.log('   2. Click "New integration"');
  console.log('   3. Set Type to "Public"');
  console.log('   4. Add Redirect URI: http://localhost:3000/api/notion/callback');
  console.log('   5. Copy the OAuth Client ID and Client Secret');
  console.log('   6. Replace the placeholder values in .env.local');
  console.log('   7. Restart your development server\\n');
  
  console.log('💡 OAuth credentials format:');
  console.log('   Client ID: 12345678-1234-1234-1234-123456789abc');
  console.log('   Client Secret: A long random string (different from integration token)');
}

console.log('✅ Once configured, restart your server with:');
console.log('   npm run dev\\n');
