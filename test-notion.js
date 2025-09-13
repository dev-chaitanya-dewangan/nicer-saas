import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
dotenv.config();

async function testNotionConnection() {
  const token = process.env.NOTION_ACCESS_TOKEN;
  
  if (!token) {
    console.error('❌ NOTION_ACCESS_TOKEN not found in environment');
    return;
  }

  console.log('🔍 Testing Notion connection with token:', token.substring(0, 10) + '...');
  
  const client = new Client({ auth: token });
  
  try {
    // Test basic connection
    const user = await client.users.me();
    console.log('✅ Connection successful!');
    console.log('   User:', user.name);
    console.log('   Type:', user.type);
    
    if (user.type === 'bot') {
      console.log('   Workspace:', user.bot?.owner?.workspace_name || 'Unknown');
    }
    
    // Test page access
    const pageId = process.env.NOTION_PAGE_ID;
    if (pageId) {
      const page = await client.pages.retrieve({ page_id: pageId });
      console.log('✅ Page access successful:', page.properties.title?.title?.[0]?.plain_text || 'Untitled');
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n💡 Make sure to:');
    console.log('   1. Use a valid integration token from https://www.notion.so/my-integrations');
    console.log('   2. Share your target page/database with the integration');
  }
}

testNotionConnection();