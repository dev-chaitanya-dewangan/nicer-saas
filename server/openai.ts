import { GoogleGenerativeAI } from "@google/generative-ai";
import { detectIndustryContext, detectTemplateType, getIndustrySampleData, generateVisualContentFlow, getContentDensitySpecs } from "./contentGenerators/industryContent";
import { AestheticContentEngine } from "./aestheticContentGenerator";
import { aestheticLearner } from "./learning/aestheticLearner";

// Using Gemini AI for workspace generation with free API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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
  // Guard against missing properties array
  const properties = Array.isArray(database.properties) ? database.properties : [];

  if (properties.length > 100) {
    errors.push(`Database "${database.name}" has too many properties (${properties.length}). Notion limits to 100.`);
  }

  properties.forEach((prop, index) => {
    const validation = validateNotionProperty(prop);
    if (!validation.valid) {
      errors.push(`Property ${index + 1} in "${database.name}": ${validation.error}`);
    }
  });

  if ((database.name || '').length > 2000) {
    errors.push(`Database name too long: ${database.name}`);
  }

  return { valid: errors.length === 0, errors };
}

export function validateWorkspaceSpec(spec: NotionWorkspaceSpec): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate databases
  spec.databases?.forEach((database) => {
    const validation = validateNotionDatabase(database);
    if (!validation.valid) {
      errors.push(...validation.errors);
    }

    const properties = Array.isArray(database.properties) ? database.properties : [];
    // Check for title property
    const hasTitle = properties.some(prop => prop.type === 'title');
    if (!hasTitle) {
      errors.push(`Database "${database.name}" missing required title property`);
    }

    // Warn about complex formulas
    properties.forEach(prop => {
      if (prop.type === 'formula' && prop.config?.expression && prop.config.expression.length > 2000) {
        warnings.push(`Formula in "${database.name}.${prop.name}" may be too complex`);
      }
    });
  });

  // Validate pages
  spec.pages?.forEach((page) => {
    const title = page.title ?? '';
    if (typeof title !== 'string' || title.length === 0) {
      errors.push('A page is missing a valid title');
    } else if (title.length > 2000) {
      errors.push(`Page "${title}" title too long`);
    }
  });

  return { valid: errors.length === 0, errors, warnings };
}



// Enhanced validation to check for aesthetic elements
function validateAestheticElements(workspaceSpec: NotionWorkspaceSpec, aestheticContent: any): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Convert workspace to JSON string for searching
  const workspaceJson = JSON.stringify(workspaceSpec);
  
  // Check for required emojis
  const requiredEmojis = aestheticContent.iconSet;
  for (const emoji of requiredEmojis) {
    if (!workspaceJson.includes(emoji)) {
      issues.push(`Missing required emoji: ${emoji}`);
    }
  }
  
  // Check for callout blocks
  const calloutCount = (workspaceJson.match(/"type":\s*"callout"/g) || []).length;
  if (calloutCount < aestheticContent.visualHierarchy.callouts.length) {
    issues.push(`Insufficient callout blocks. Expected: ${aestheticContent.visualHierarchy.callouts.length}, Found: ${calloutCount}`);
  }
  
  // Check for visual hierarchy headers
  const headerCount = (workspaceJson.match(/"type":\s*"heading_(1|2|3)"/g) || []).length;
  if (headerCount < aestheticContent.visualHierarchy.headers.length) {
    issues.push(`Insufficient headers. Expected at least: ${aestheticContent.visualHierarchy.headers.length}, Found: ${headerCount}`);
  }
  
  return { valid: issues.length === 0, issues };
}

export async function generateNotionWorkspace(
  prompt: string,
  theme: string = "professional",
  includeContent: boolean = true,
  contentDensity: "minimal" | "moderate" | "rich" = "moderate",
  userId?: string
): Promise<NotionWorkspaceSpec> {
  try {
    // Detect industry context from prompt
    const industryContext = detectIndustryContext(prompt);
    
    // If we have a userId, get personalized aesthetic suggestions
    let personalizedDensity = contentDensity;
    let personalizedIncludeContent = includeContent;
    let personalizedTheme = theme;
    
    if (userId) {
      try {
        const suggestions = await aestheticLearner.refineAestheticSuggestions(userId, prompt);
        personalizedDensity = suggestions.recommendedContentDensity;
        personalizedIncludeContent = suggestions.recommendedIncludeContent;
        if (suggestions.recommendedTheme) {
          personalizedTheme = suggestions.recommendedTheme;
        }
      } catch (error) {
        console.warn("Failed to get personalized aesthetic suggestions:", error);
      }
    }
    
    // Generate aesthetic content specifications
    const aestheticContent = AestheticContentEngine.generateAestheticContent(
      prompt,
      industryContext,
      personalizedDensity
    );
    
    // Determine template type based on prompt keywords
    const templateType = detectTemplateType(prompt);
    
    // Get industry-specific sample data if content is to be included
    let industrySampleData: any[] = [];
    if (personalizedIncludeContent) {
      industrySampleData = getIndustrySampleData(industryContext, templateType, personalizedDensity);
    }
    
    // Generate visual content flow for enhanced page layouts
    const visualContentFlow = generateVisualContentFlow(industryContext, templateType, personalizedDensity);
    
    // Get content density specifications
    const densitySpecs = getContentDensitySpecs(personalizedDensity);
    
    // Build the visual hierarchy callout specifications\n    const calloutSpecs = aestheticContent.visualHierarchy.callouts.map((callout: any, index: number) => \n      `${index + 1}. Type: ${callout.type}, Color: ${callout.color}, Emoji: ${callout.emoji}, Content: \"${callout.content}\"`\n    ).join(\"\\n     \");

    // Build the system prompt with all aesthetic specifications
    const systemPrompt = `You are an expert Notion workspace designer who creates VISUALLY STUNNING, professional workspaces. Generate a complete, production-ready Notion workspace that is both functionally powerful AND aesthetically extraordinary.

STRUCTURED AESTHETIC INSTRUCTIONS:
Follow these exact specifications for aesthetic elements:

1. VISUAL HIERARCHY IMPLEMENTATION:
   - Use these headers in page content: ${aestheticContent.visualHierarchy.headers.join(', ')}
   - Include exactly ${aestheticContent.visualHierarchy.callouts.length} callout blocks with these specifications:
     ${calloutSpecs}
   - Use these dividers between content sections: ${aestheticContent.visualHierarchy.dividers.join(', ')}

2. COLOR AND ICON APPLICATION:
   - Primary color (${aestheticContent.themeColors.primary}) for main headers and important elements
   - Secondary color (${aestheticContent.themeColors.secondary}) for subheaders and secondary elements
   - Accent color (${aestheticContent.themeColors.accent}) for highlights and key metrics
   - Incorporate these icons strategically: ${aestheticContent.iconSet.join(', ')}

3. CONTENT DENSITY REQUIREMENTS (${personalizedDensity}):
   - Generate ${densitySpecs.databaseEntries} sample entries per database
   - Create ${densitySpecs.pageContentDepth}
   - Use ${densitySpecs.sampleDataDetail}

4. INDUSTRY-SPECIFIC CONTENT IMPLEMENTATION (${industryContext}):
   - Use terminology and scenarios appropriate for the ${industryContext} industry
   - Apply business models and processes specific to ${industryContext}
   - Use realistic company names and examples for the ${industryContext} sector

5. ${personalizedIncludeContent ? 
`SAMPLE DATA POPULATION:
   Use the provided sample data to populate databases with realistic entries. For each database:
   - Create entries that match the sample data structure
   - Ensure data is interconnected through relations where appropriate
   - Use realistic values and scenarios from the sample data
   - Include all fields with meaningful content, not just placeholders

   Sample Data (${personalizedDensity} density):
   ${JSON.stringify(industrySampleData, null, 2)}` : 
`EMPTY TEMPLATES ONLY:
   Generate clean templates without sample data as user requested empty workspace.
   Include only property definitions and view configurations, no sample entries.`}

6. NOTION-SPECIFIC FORMATTING REQUIREMENTS:
   - Preserve all emojis exactly as provided (${aestheticContent.iconSet.join(', ')})
   - Use callout blocks for important information with appropriate colors:
     * Blue callouts for tips and information
     * Green callouts for success and completion
     * Yellow callouts for warnings and cautions
     * Purple callouts for strategic insights
   - Structure page content with clear visual hierarchy:
     * H1 headers for main page titles
     * H2 headers for major sections
     * H3 headers for subsections
   - Use column layouts for comparative information
   - Include divider blocks between major sections
   - Use bullet points and numbered lists for itemized content
   - Apply bold and italic formatting strategically for emphasis

7. VISUAL CONTENT FLOW IMPLEMENTATION:
   Structure page content following this visual flow pattern:
   
   ${JSON.stringify(visualContentFlow, null, 2)}
   
   Implementation Requirements:
   - Use the exact content blocks specified in the visual flow
   - Maintain the specified layout structures (columns, callouts, etc.)
   - Preserve all emojis and formatting exactly as shown
   - Ensure content flows logically from one section to the next
   - Use appropriate Notion block types for each content element

🎯 THEME APPLICATION (${personalizedTheme}):
- professional: Clean corporate aesthetics, structured layouts, business icons
- pastel: Soft muted colors, gentle gradients, calm visual elements
- dark: High contrast, sophisticated dark themes, premium feel
- fun: Bright energetic colors, playful emoji, dynamic layouts
- light: Bright minimal design, lots of white space, crisp typography
- cheerful: Warm inviting colors, positive emoji, friendly layouts
- loving: Soft pinks/warm tones, heart icons, nurturing design
- soft: Gentle rounded aesthetics, subtle colors, comfortable layouts
- rough: Bold industrial design, strong contrasts, powerful imagery

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

🚀 VALIDATION & COMPATIBILITY:
- Ensure all property types are valid Notion API types
- Respect Notion's limits (100 properties max per database)
- Use Unicode-safe text throughout
- Validate all select/multi-select options are properly formatted

Respond ONLY with valid JSON matching the NotionWorkspaceSpec interface. Make it BEAUTIFUL and FUNCTIONAL.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
      },
      systemInstruction: systemPrompt,
    });
    const response = await result.response;

    const parsedResult = JSON.parse(response.text() || "{}") as NotionWorkspaceSpec;
    
    // Validate that the generated workspace includes aesthetic elements
    const validation = validateAestheticElements(parsedResult, aestheticContent);
    if (!validation.valid) {
      console.warn("Aesthetic validation issues:", validation.issues);
      // Note: We're not throwing an error here as we want to return the workspace even if aesthetic validation fails
    }
    
    return parsedResult;
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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{ text: refinementPrompt }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
      },
      systemInstruction: systemPrompt,
    });
    const response = await result.response;

    const parsedResult = JSON.parse(response.text() || "{}");
    return parsedResult as NotionWorkspaceSpec;
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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chat = model.startChat({
      history: messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }))
    });
    
    const result = await chat.sendMessage("");
    const response = await result.response;

    return response.text || "";
  } catch (error) {
    console.error("Error generating chat response:", error);
    throw new Error("Failed to generate chat response");
  }
}
