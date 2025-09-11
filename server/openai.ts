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
  content: string;
  type: string;
}

export async function generateNotionWorkspace(
  prompt: string,
  theme: string = "professional"
): Promise<NotionWorkspaceSpec> {
  try {
    const systemPrompt = `You are an expert Notion workspace designer. Generate a complete, production-ready Notion workspace specification based on the user's requirements.

IMPORTANT GUIDELINES:
- Create sophisticated, enterprise-grade workspaces with advanced features
- Include realistic property types: title, rich_text, select, multi_select, date, checkbox, number, formula, rollup, relation, people, status
- Generate meaningful formulas and rollups that add business value
- Create multiple view types: table, board, calendar, gallery, list, timeline
- Establish proper database relationships (one-to-one, one-to-many, many-to-many)
- Include 5-10 realistic sample data entries per database
- Apply the specified theme: ${theme}
- Ensure all sample data is realistic and contextual (no lorem ipsum)

THEMES:
- professional: Clean, corporate colors, formal structure
- pastel: Soft, muted colors, gentle aesthetics
- dark: Dark backgrounds, high contrast
- fun: Bright colors, playful elements
- light: Bright, minimal, clean
- cheerful: Warm, inviting colors
- loving: Soft pinks and warm tones
- soft: Gentle, rounded aesthetics
- rough: Bold, industrial design

Respond with valid JSON matching the NotionWorkspaceSpec interface.`;

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
