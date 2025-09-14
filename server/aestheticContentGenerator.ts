// server/aestheticContentGenerator.ts

export interface AestheticContentSpec {
  themeColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  iconSet: string[];
  contentStyle: 'professional' | 'creative' | 'minimal' | 'playful';
  visualHierarchy: {
    headers: string[];
    callouts: AestheticCallout[];
    dividers: string[];
  };
}

export interface AestheticCallout {
  type: 'info' | 'success' | 'warning' | 'tip';
  color: string;
  emoji: string;
  content: string;
}

// Aesthetic content generation engine
export class AestheticContentEngine {
  // Generate aesthetic content based on industry context and content density
  static generateAestheticContent(
    prompt: string,
    industryContext: string,
    contentDensity: 'minimal' | 'moderate' | 'rich'
  ): AestheticContentSpec {
    // Determine theme colors based on industry context
    const themeColors = this.getThemeColorsForIndustry(industryContext);
    
    // Determine icon set based on industry context
    const iconSet = this.getIconSetForIndustry(industryContext);
    
    // Determine content style based on industry context
    const contentStyle = this.getContentStyleForIndustry(industryContext);
    
    // Generate visual hierarchy elements
    const visualHierarchy = this.generateVisualHierarchy(industryContext, contentDensity);
    
    return {
      themeColors,
      iconSet,
      contentStyle,
      visualHierarchy
    };
  }
  
  // Get theme colors based on industry context
  private static getThemeColorsForIndustry(industryContext: string): AestheticContentSpec['themeColors'] {
    const colorPalettes: Record<string, AestheticContentSpec['themeColors']> = {
      startup: {
        primary: '#6366f1',    // Indigo - bold and innovative
        secondary: '#8b5cf6',  // Violet - creative and energetic
        accent: '#ec4899',     // Pink - attention-grabbing
        background: '#f8fafc', // Light - clean and modern
        text: '#0f172a'        // Dark - high contrast
      },
      creative: {
        primary: '#f59e0b',    // Amber - warm and inviting
        secondary: '#ef4444',  // Red - passionate and bold
        accent: '#10b981',     // Emerald - fresh and creative
        background: '#fefce8', // Yellow - bright and energetic
        text: '#1e293b'        // Dark - readable
      },
      enterprise: {
        primary: '#3b82f6',    // Blue - trustworthy and professional
        secondary: '#10b981',  // Emerald - growth and success
        accent: '#8b5cf6',     // Violet - innovation
        background: '#f1f5f9', // Light blue-gray - corporate and clean
        text: '#0f172a'        // Dark - professional
      },
      personal: {
        primary: '#06b6d4',    // Cyan - friendly and approachable
        secondary: '#8b5cf6',  // Violet - creative and personal
        accent: '#f59e0b',     // Amber - warm and inviting
        background: '#f0f9ff', // Light cyan - calm and personal
        text: '#1e293b'        // Dark - readable
      }
    };
    
    return colorPalettes[industryContext] || colorPalettes.enterprise;
  }
  
  // Get icon set based on industry context
  private static getIconSetForIndustry(industryContext: string): string[] {
    const iconSets: Record<string, string[]> = {
      startup: ['🚀', '💡', '📊', '🎯', '🔥', '💼', '📈', '💰', '👥', '⚡'],
      creative: ['🎨', '🎭', '📷', '🎬', '🎭', '🖌️', '🌈', '🌟', '💬', '✍️'],
      enterprise: ['🏢', '💼', '📋', '📊', '📈', '🔒', '✅', '👥', '🎯', '🔧'],
      personal: ['🏠', '🧘', '📚', '🎯', '📅', '✅', '📈', '💡', '❤️', '🗓️']
    };
    
    return iconSets[industryContext] || iconSets.enterprise;
  }
  
  // Get content style based on industry context
  private static getContentStyleForIndustry(industryContext: string): AestheticContentSpec['contentStyle'] {
    const styleMap: Record<string, AestheticContentSpec['contentStyle']> = {
      startup: 'professional',
      creative: 'creative',
      enterprise: 'professional',
      personal: 'playful'
    };
    
    return styleMap[industryContext] || 'professional';
  }
  
  // Generate visual hierarchy elements based on industry and content density
  private static generateVisualHierarchy(
    industryContext: string,
    contentDensity: 'minimal' | 'moderate' | 'rich'
  ): AestheticContentSpec['visualHierarchy'] {
    const headers = this.generateHeadersForIndustry(industryContext, contentDensity);
    const callouts = this.generateCalloutsForIndustry(industryContext, contentDensity);
    const dividers = this.generateDividersForIndustry(industryContext);
    
    return {
      headers,
      callouts,
      dividers
    };
  }
  
  // Generate headers based on industry and content density
  private static generateHeadersForIndustry(
    industryContext: string,
    contentDensity: 'minimal' | 'moderate' | 'rich'
  ): string[] {
    const headerTemplates: Record<string, Record<string, string[]>> = {
      startup: {
        minimal: ['Project Overview', 'Key Metrics', 'Next Steps'],
        moderate: ['Project Overview', 'Key Metrics', 'Milestones', 'Team', 'Next Steps'],
        rich: ['Project Overview', 'Key Metrics', 'Milestones', 'Team', 'Resources', 'Risks', 'Next Steps', 'Timeline']
      },
      creative: {
        minimal: ['Project Brief', 'Creative Direction', 'Deliverables'],
        moderate: ['Project Brief', 'Creative Direction', 'Deliverables', 'Timeline', 'Team'],
        rich: ['Project Brief', 'Creative Direction', 'Deliverables', 'Timeline', 'Team', 'Inspiration', 'Assets', 'Feedback']
      },
      enterprise: {
        minimal: ['Project Summary', 'Objectives', 'Key Results'],
        moderate: ['Project Summary', 'Objectives', 'Key Results', 'Timeline', 'Stakeholders'],
        rich: ['Project Summary', 'Objectives', 'Key Results', 'Timeline', 'Stakeholders', 'Budget', 'Risks', 'Dependencies']
      },
      personal: {
        minimal: ['Goals', 'Tasks', 'Progress'],
        moderate: ['Goals', 'Tasks', 'Progress', 'Schedule', 'Resources'],
        rich: ['Goals', 'Tasks', 'Progress', 'Schedule', 'Resources', 'Notes', 'Reflections', 'Habits']
      }
    };
    
    return headerTemplates[industryContext]?.[contentDensity] || headerTemplates.enterprise[contentDensity];
  }
  
  // Generate callouts based on industry and content density
  private static generateCalloutsForIndustry(
    industryContext: string,
    contentDensity: 'minimal' | 'moderate' | 'rich'
  ): AestheticCallout[] {
    const calloutTemplates: Record<string, Record<string, AestheticCallout[]>> = {
      startup: {
        minimal: [
          { type: 'tip', color: 'blue', emoji: '💡', content: 'Pro tip: Validate your assumptions early' }
        ],
        moderate: [
          { type: 'tip', color: 'blue', emoji: '💡', content: 'Pro tip: Validate your assumptions early' },
          { type: 'info', color: 'green', emoji: '✅', content: 'Milestone achieved: First prototype completed' }
        ],
        rich: [
          { type: 'tip', color: 'blue', emoji: '💡', content: 'Pro tip: Validate your assumptions early' },
          { type: 'info', color: 'green', emoji: '✅', content: 'Milestone achieved: First prototype completed' },
          { type: 'warning', color: 'yellow', emoji: '⚠️', content: 'Risk: Market timing may be challenging' },
          { type: 'success', color: 'green', emoji: '🎉', content: 'Success: User feedback exceeds expectations' }
        ]
      },
      creative: {
        minimal: [
          { type: 'tip', color: 'yellow', emoji: '🎨', content: 'Creative tip: Explore multiple concepts before refining' }
        ],
        moderate: [
          { type: 'tip', color: 'yellow', emoji: '🎨', content: 'Creative tip: Explore multiple concepts before refining' },
          { type: 'info', color: 'blue', emoji: '📅', content: 'Deadline reminder: Client review tomorrow' }
        ],
        rich: [
          { type: 'tip', color: 'yellow', emoji: '🎨', content: 'Creative tip: Explore multiple concepts before refining' },
          { type: 'info', color: 'blue', emoji: '📅', content: 'Deadline reminder: Client review tomorrow' },
          { type: 'warning', color: 'red', emoji: '⏰', content: 'Warning: Running behind schedule on deliverables' },
          { type: 'success', color: 'green', emoji: '🌟', content: 'Inspiration: Recent award-winning campaign for reference' }
        ]
      },
      enterprise: {
        minimal: [
          { type: 'info', color: 'blue', emoji: '📋', content: 'Process reminder: Follow change management protocol' }
        ],
        moderate: [
          { type: 'info', color: 'blue', emoji: '📋', content: 'Process reminder: Follow change management protocol' },
          { type: 'tip', color: 'green', emoji: '✅', content: 'Best practice: Document all decisions for audit trail' }
        ],
        rich: [
          { type: 'info', color: 'blue', emoji: '📋', content: 'Process reminder: Follow change management protocol' },
          { type: 'tip', color: 'green', emoji: '✅', content: 'Best practice: Document all decisions for audit trail' },
          { type: 'warning', color: 'yellow', emoji: '⚠️', content: 'Compliance alert: Upcoming regulatory changes to consider' },
          { type: 'success', color: 'green', emoji: '🏆', content: 'Achievement: Department exceeded Q1 targets' }
        ]
      },
      personal: {
        minimal: [
          { type: 'tip', color: 'blue', emoji: '💡', content: 'Personal tip: Start with the most challenging task' }
        ],
        moderate: [
          { type: 'tip', color: 'blue', emoji: '💡', content: 'Personal tip: Start with the most challenging task' },
          { type: 'info', color: 'green', emoji: '✅', content: 'Progress: Completed 3 out of 5 weekly goals' }
        ],
        rich: [
          { type: 'tip', color: 'blue', emoji: '💡', content: 'Personal tip: Start with the most challenging task' },
          { type: 'info', color: 'green', emoji: '✅', content: 'Progress: Completed 3 out of 5 weekly goals' },
          { type: 'warning', color: 'yellow', emoji: '⏰', content: 'Reminder: Appointment with mentor this Friday' },
          { type: 'success', color: 'green', emoji: '🎉', content: 'Celebration: Reached fitness milestone this week' }
        ]
      }
    };
    
    return calloutTemplates[industryContext]?.[contentDensity] || calloutTemplates.enterprise[contentDensity];
  }
  
  // Generate dividers based on industry
  private static generateDividersForIndustry(industryContext: string): string[] {
    const dividerTemplates: Record<string, string[]> = {
      startup: ['---', '===', '***'],
      creative: ['~-~-~', '✿ ✿ ✿', '✦ ✦ ✦'],
      enterprise: ['---', '===', '‾‾‾'],
      personal: ['• • •', '⋆ ⋆ ⋆', '⁘ ⁘ ⁘']
    };
    
    return dividerTemplates[industryContext] || dividerTemplates.enterprise;
  }
}