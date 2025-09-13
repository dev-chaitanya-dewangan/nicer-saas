import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
dotenv.config();

async function findNotionPages() {
  const token = process.env.NOTION_ACCESS_TOKEN;
  
  if (!token) {
    console.error('❌ NOTION_ACCESS_TOKEN not found in environment');
    return;
  }

  console.log('🔍 Finding your Notion pages...\n');
  
  const client = new Client({ auth: token });
  
  try {
    // Get user info
    const user = await client.users.me();
    console.log('✅ Connected as:', user.name);
    console.log('   Type:', user.type);
    console.log('   Workspace:', user.bot?.owner?.workspace_name || 'Unknown');
    console.log('');

    // Search for accessible pages and databases
    console.log('📋 Accessible pages and databases:');
    
    const searchResults = await client.search({
      filter: {
        property: 'object',
        value: 'page'
      }
    });

    if (searchResults.results.length === 0) {
      console.log('   No pages found. Make sure you\'ve shared pages with this integration.');
    } else {
      searchResults.results.forEach((page, index) => {
        const title = page.properties.title?.title?.[0]?.plain_text || 'Untitled';
        const url = page.url;
        const id = page.id;
        console.log(`   ${index + 1}. ${title}`);
        console.log(`      ID: ${id}`);
        console.log(`      URL: ${url}`);
        console.log('');
      });
    }

    // Also search for databases
    console.log('🗄️ Accessible databases:');
    const dbResults = await client.search({
      filter: {
        property: 'object',
        value: 'data_source'
      }
    });

    if (dbResults.results.length === 0) {
      console.log('   No databases found.');
    } else {
      dbResults.results.forEach((db, index) => {
        const title = db.title?.[0]?.plain_text || 'Untitled Database';
        const id = db.id;
        console.log(`   ${index + 1}. ${title}`);
        console.log(`      ID: ${id}`);
        console.log('');
      });
    }

    console.log('💡 To use any of these pages, update your .env file:');
    console.log('   NOTION_PAGE_ID=your-chosen-page-id-here');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. Your token is valid');
    console.log('   2. You\'ve shared pages/databases with this integration');
  }
}

findNotionPages();