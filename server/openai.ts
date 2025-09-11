import { GoogleGenAI } from "@google/genai";

// Using Gemini AI for workspace generation with free API key
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface NotionWorkspaceSpec {
  title: string;
  description: string;
  databases: NotionDatabase[];
  pages: NotionPage[];
  theme: string;
  layout: string;
}

export interface NotionDatabase {
  name: string;
  description: string;
  properties: NotionProperty[];
  views: NotionView[];
  relations: NotionRelation[];
  sampleData: any[];
}

export interface NotionProperty {
  name: string;
  type: string;
  config?: any;
}

export interface NotionView {
  name: string;
  type: string;
  filters?: any[];
  sorts?: any[];
  layout?: string;
}

export interface NotionRelation {
  property: string;
  relatedDatabase: string;
  type: string;
}

export interface NotionPage {
  title: string;
  content: string | object | any[];
  type: string;
}

// Notion API validation utilities
function validateNotionProperty(property: NotionProperty): { valid: boolean; error?: string } {
  const validTypes = ['title', 'rich_text', 'number', 'select', 'multi_select', 'date', 'people', 'files', 'checkbox', 'url', 'email', 'phone_number', 'formula', 'rollup', 'relation', 'created_time', 'created_by', 'last_edited_time', 'last_edited_by', 'status'];
  
  if (!validTypes.includes(property.type)) {
    return { valid: false, error: `Invalid property type: ${property.type}` };
  }
  
  if (property.name.length > 2000) {
    return { valid: false, error: `Property name too long: ${property.name}` };
  }
  
  return { valid: true };
}

function validateNotionDatabase(database: NotionDatabase): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (database.properties.length > 100) {
    errors.push(`Database "${database.name}" has too many properties (${database.properties.length}). Notion limits to 100.`);
  }
  
  database.properties.forEach((prop, index) => {
    const validation = validateNotionProperty(prop);
    if (!validation.valid) {
      errors.push(`Property ${index + 1} in "${database.name}": ${validation.error}`);
    }
  });
  
  if (database.name.length > 2000) {
    errors.push(`Database name too long: ${database.name}`);
  }
  
  return { valid: errors.length === 0, errors };
}

export function validateWorkspaceSpec(spec: NotionWorkspaceSpec): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validate databases
  spec.databases?.forEach((database, index) => {
    const validation = validateNotionDatabase(database);
    if (!validation.valid) {
      errors.push(...validation.errors);
    }
    
    // Check for title property
    const hasTitle = database.properties.some(prop => prop.type === 'title');
    if (!hasTitle) {
      errors.push(`Database "${database.name}" missing required title property`);
    }
    
    // Warn about complex formulas
    database.properties.forEach(prop => {
      if (prop.type === 'formula' && prop.config?.expression && prop.config.expression.length > 2000) {
        warnings.push(`Formula in "${database.name}.${prop.name}" may be too complex`);
      }
    });
  });
  
  // Validate pages
  spec.pages?.forEach((page, index) => {
    if (page.title.length > 2000) {
      errors.push(`Page "${page.title}" title too long`);
    }
  });
  
  return { valid: errors.length === 0, errors, warnings };
}

export async function generateNotionWorkspace(
  prompt: string,
  theme: string = "professional"
): Promise<NotionWorkspaceSpec> {
  try {
    const systemPrompt = `You are an expert Notion workspace designer who creates VISUALLY STUNNING, professional workspaces. Generate a complete, production-ready Notion workspace that is both functionally powerful AND aesthetically extraordinary.

🎨 AESTHETIC EXCELLENCE REQUIREMENTS:
- Create visually stunning layouts with perfect balance and hierarchy
- Use strategic emoji icons (🎯📊💼📈📋✨🔥💡🎉📌) for visual interest
- Include rich callout blocks with different colors for key information
- Add visual dividers and proper spacing for breathing room
- Create elegant page covers and icons where appropriate
- Design with modern, minimalist principles - clean and uncluttered
- Use Notion's color system strategically (never overwhelming)

📋 DATABASE SOPHISTICATION:
- Include realistic property types: title, rich_text, select, multi_select, date, checkbox, number, formula, rollup, relation, people, status
- Create meaningful formulas (progress calculations, status summaries, automated categorization)
- Generate intelligent rollups that provide business insights
- Add calculated fields that enhance productivity
- Include proper validation constraints

🔗 ADVANCED RELATIONSHIPS:
- Establish sophisticated database relationships
- Create interconnected workflows across databases
- Design relational structures that mirror real business processes
- Include bidirectional relations where appropriate

📊 VIEW VARIETY & INTELLIGENCE:
- Create multiple strategic views: table, board (Kanban), calendar, gallery, list, timeline
- Design filtered views for different use cases (by status, priority, team, etc.)
- Add smart sorting and grouping for maximum productivity
- Include both overview and detail-focused views

✨ SAMPLE DATA EXCELLENCE:
- Generate 5-8 realistic, contextual sample entries per database
- Use real business scenarios, not placeholder text
- Include varied status types, priorities, and completion states
- Make data interconnected through relations
- Use professional names, realistic dates, and meaningful values

🎯 THEME APPLICATION (${theme}):
- professional: Clean corporate aesthetics, structured layouts, business icons
- pastel: Soft muted colors, gentle gradients, calm visual elements
- dark: High contrast, sophisticated dark themes, premium feel
- fun: Bright energetic colors, playful emoji, dynamic layouts
- light: Bright minimal design, lots of white space, crisp typography
- cheerful: Warm inviting colors, positive emoji, friendly layouts
- loving: Soft pinks/warm tones, heart icons, nurturing design
- soft: Gentle rounded aesthetics, subtle colors, comfortable layouts
- rough: Bold industrial design, strong contrasts, powerful imagery

📝 CONTENT REQUIREMENTS:
- Page content should be rich markdown strings with headers, callouts, and formatting
- Include helpful instructions and templates for users to expand
- Add navigation elements and clear section organization
- Create reusable templates within pages

🚀 VALIDATION & COMPATIBILITY:
- Ensure all property types are valid Notion API types
- Respect Notion's limits (100 properties max per database)
- Use Unicode-safe text throughout
- Validate all select/multi-select options are properly formatted

Respond ONLY with valid JSON matching the NotionWorkspaceSpec interface. Make it BEAUTIFUL and FUNCTIONAL.`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
      contents: prompt,
    });

    const result = JSON.parse(response.text || "{}");
    return result as NotionWorkspaceSpec;
  } catch (error) {
    console.error("Error generating workspace:", error);
    throw new Error("Failed to generate Notion workspace specification");
  }
}

export async function refineWorkspaceSpec(
  currentSpec: NotionWorkspaceSpec,
  refinementPrompt: string
): Promise<NotionWorkspaceSpec> {
  try {
    const systemPrompt = `You are refining an existing Notion workspace specification. Make the requested changes while maintaining the overall structure and quality.

Current workspace specification:
${JSON.stringify(currentSpec, null, 2)}

Apply the following refinements and return the updated specification as valid JSON:`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
      contents: refinementPrompt,
    });

    const result = JSON.parse(response.text || "{}");
    return result as NotionWorkspaceSpec;
  } catch (error) {
    console.error("Error refining workspace:", error);
    throw new Error("Failed to refine workspace specification");
  }
}

export async function generateChatResponse(
  messages: any[],
  context?: any
): Promise<string> {
  try {
    const systemPrompt = `You are an AI assistant for Nicer SaaS, a platform that creates Notion workspaces from natural language.

Your role:
- Help users describe their workspace requirements clearly
- Suggest improvements and additional features
- Explain Notion concepts and capabilities
- Guide users through the workspace creation process
- Be encouraging and helpful

Keep responses concise but informative. Focus on understanding the user's needs and helping them create the best possible workspace.`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: messages.map(msg => `${msg.role}: ${msg.content}`).join('\n'),
    });

    return response.text || "";
  } catch (error) {
    console.error("Error generating chat response:", error);
    throw new Error("Failed to generate chat response");
  }
}
