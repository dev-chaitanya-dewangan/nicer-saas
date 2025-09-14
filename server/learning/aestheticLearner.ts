// server/learning/aestheticLearner.ts

import { storage } from "../storage";

// Interface for user interaction data
interface UserInteractionData {
  userId: string;
  workspaceId: string;
  prompt: string;
  selectedContent: boolean;
  contentDensity: "minimal" | "moderate" | "rich";
  modifications: string[];
  finalRating?: number;
  industryContext?: string;
  createdAt: Date;
}

// Interface for aesthetic suggestions
interface AestheticSuggestions {
  recommendedContentDensity: "minimal" | "moderate" | "rich";
  recommendedIncludeContent: boolean;
  recommendedTheme?: string;
  industryInsights: Record<string, number>;
}

// Interface for user aesthetic profile
interface AestheticProfile {
  preferredContentDensity: "minimal" | "moderate" | "rich";
  preferredIncludeContent: boolean;
  preferredThemes: string[];
  industryPreferences: Record<string, number>;
  usagePatterns: {
    avgWorkspacesPerWeek: number;
    preferredCategories: string[];
    lastActive: Date;
  };
}

export class AestheticLearner {
  // Track user interaction for learning
  async learnFromInteraction(data: UserInteractionData): Promise<void> {
    try {
      // Store the interaction data
      await storage.trackAestheticInteraction(data);
      
      // Update user's aesthetic profile based on this interaction
      await this.updateUserAestheticProfile(data.userId, data);
      
      console.log(`Tracked aesthetic interaction for user ${data.userId}`);
    } catch (error) {
      console.warn("Error tracking aesthetic interaction:", error);
      // Don't throw error as this is non-critical functionality
    }
  }

  // Improve future generations based on user behavior
  async refineAestheticSuggestions(userId: string, prompt: string): Promise<AestheticSuggestions> {
    try {
      // Get user's aesthetic preferences
      const preferences = await storage.getUserAestheticPreferences(userId);
      
      // Analyze prompt for industry context
      const industryContext = this.analyzeIndustryContext(prompt);
      
      // Determine recommendations based on user history
      const suggestions: AestheticSuggestions = {
        recommendedContentDensity: this.determineContentDensity(preferences),
        recommendedIncludeContent: this.determineIncludeContent(preferences),
        industryInsights: this.analyzeIndustryPreferences(preferences, industryContext),
        recommendedTheme: this.suggestTheme(preferences)
      };
      
      return suggestions;
    } catch (error) {
      console.warn("Error refining aesthetic suggestions:", error);
      // Return default recommendations
      return {
        recommendedContentDensity: "moderate",
        recommendedIncludeContent: true,
        industryInsights: {},
        recommendedTheme: "professional"
      };
    }
  }

  // Build user aesthetic profile
  async buildUserAestheticProfile(userId: string): Promise<AestheticProfile> {
    try {
      // Get user's aesthetic preferences
      const preferences = await storage.getUserAestheticPreferences(userId);
      
      // Get user's workspaces for pattern analysis
      const workspaces = await storage.getUserWorkspaces(userId);
      
      // Build profile
      const profile: AestheticProfile = {
        preferredContentDensity: this.determineContentDensity(preferences),
        preferredIncludeContent: this.determineIncludeContent(preferences),
        preferredThemes: this.extractPreferredThemes(workspaces),
        industryPreferences: preferences.industryPreferences || {},
        usagePatterns: this.analyzeUsagePatterns(workspaces)
      };
      
      return profile;
    } catch (error) {
      console.warn("Error building user aesthetic profile:", error);
      // Return default profile
      return {
        preferredContentDensity: "moderate",
        preferredIncludeContent: true,
        preferredThemes: ["professional"],
        industryPreferences: {},
        usagePatterns: {
          avgWorkspacesPerWeek: 0,
          preferredCategories: [],
          lastActive: new Date()
        }
      };
    }
  }

  // Private helper methods
  
  private async updateUserAestheticProfile(userId: string, interaction: UserInteractionData): Promise<void> {
    // This method would update a dedicated user profile table
    // For now, we're storing data in workspace metadata
    console.log(`Updating aesthetic profile for user ${userId}`);
  }

  private analyzeIndustryContext(prompt: string): string {
    const promptLower = prompt.toLowerCase();
    
    if (promptLower.includes('startup') || promptLower.includes('tech') || promptLower.includes('innovat')) {
      return 'startup';
    }
    
    if (promptLower.includes('design') || promptLower.includes('creative') || promptLower.includes('agency')) {
      return 'creative';
    }
    
    if (promptLower.includes('enterprise') || promptLower.includes('corporate') || promptLower.includes('company')) {
      return 'enterprise';
    }
    
    if (promptLower.includes('personal') || promptLower.includes('life') || promptLower.includes('habit')) {
      return 'personal';
    }
    
    // Default to enterprise if no specific industry detected
    return 'enterprise';
  }

  private determineContentDensity(preferences: any): "minimal" | "moderate" | "rich" {
    if (!preferences.contentDensityPreferences) {
      return "moderate";
    }
    
    // Find the most frequently used content density
    const densities = preferences.contentDensityPreferences;
    let maxCount = 0;
    let preferredDensity: "minimal" | "moderate" | "rich" = "moderate";
    
    for (const [density, count] of Object.entries(densities)) {
      if (typeof count === 'number' && count > maxCount) {
        maxCount = count;
        preferredDensity = density as "minimal" | "moderate" | "rich";
      }
    }
    
    return preferredDensity;
  }

  private determineIncludeContent(preferences: any): boolean {
    if (typeof preferences.includeContentPreferences !== 'number') {
      return true;
    }
    
    // If user has selected content more than 50% of the time, recommend including it
    return preferences.includeContentPreferences > 0;
  }

  private analyzeIndustryPreferences(preferences: any, currentIndustry: string): Record<string, number> {
    if (!preferences.industryPreferences) {
      return { [currentIndustry]: 1 };
    }
    
    // Add current industry to preferences if not present
    const industryPrefs = { ...preferences.industryPreferences };
    if (!industryPrefs[currentIndustry]) {
      industryPrefs[currentIndustry] = 1;
    }
    
    return industryPrefs;
  }

  private suggestTheme(preferences: any): string {
    // For now, return a default theme
    // In a more advanced implementation, this would analyze theme preferences
    return "professional";
  }

  private extractPreferredThemes(workspaces: any[]): string[] {
    const themes: string[] = [];
    const themeCount: Record<string, number> = {};
    
    workspaces.forEach(workspace => {
      if (workspace.theme) {
        themeCount[workspace.theme] = (themeCount[workspace.theme] || 0) + 1;
      }
    });
    
    // Sort themes by usage count
    const sortedThemes = Object.entries(themeCount)
      .sort((a, b) => b[1] - a[1])
      .map(([theme]) => theme);
    
    return sortedThemes.length > 0 ? sortedThemes : ["professional"];
  }

  private analyzeUsagePatterns(workspaces: any[]): AestheticProfile['usagePatterns'] {
    if (workspaces.length === 0) {
      return {
        avgWorkspacesPerWeek: 0,
        preferredCategories: [],
        lastActive: new Date()
      };
    }
    
    // Calculate average workspaces per week
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentWorkspaces = workspaces.filter(w => 
      new Date(w.createdAt) >= weekAgo
    );
    
    // Extract categories from templates
    const categories: string[] = [];
    const categoryCount: Record<string, number> = {};
    
    workspaces.forEach(workspace => {
      if (workspace.templateId) {
        // In a real implementation, we would fetch the template to get its category
        // For now, we'll use a placeholder
        const category = "business"; // This would be dynamic
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      }
    });
    
    const preferredCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);
    
    return {
      avgWorkspacesPerWeek: recentWorkspaces.length,
      preferredCategories,
      lastActive: new Date(workspaces[0].createdAt) // Most recent workspace
    };
  }
}

// Export a singleton instance
export const aestheticLearner = new AestheticLearner();