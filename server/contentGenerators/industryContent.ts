// server/contentGenerators/industryContent.ts

export const industryTemplates = {
  startup: {
    crm: {
      companies: ['TechFlow Solutions', 'CloudSync Pro', 'DataVision AI', 'NextGen Labs', 'InnovateX'],
      deals: [
        { name: 'Series A - TechFlow', value: '$2.5M', stage: 'Negotiation', probability: '70%' },
        { name: 'Seed Round - CloudSync', value: '$500K', stage: 'Due Diligence', probability: '85%' },
        { name: 'Partnership - DataVision', value: '$1.2M', stage: 'Proposal', probability: '60%' },
        { name: 'Enterprise Deal - NextGen', value: '$750K', stage: 'Demo', probability: '40%' },
        { name: 'Strategic Alliance - InnovateX', value: '$3M', stage: 'Initial Contact', probability: '25%' }
      ],
      contacts: [
        { name: 'Sarah Chen', role: 'CTO', company: 'TechFlow Solutions', email: 's.chen@techflow.com', lastContact: '2024-01-15' },
        { name: 'Michael Rodriguez', role: 'Founder', company: 'CloudSync Pro', email: 'm.rodriguez@cloudsync.com', lastContact: '2024-01-10' },
        { name: 'Jennifer Kim', role: 'VP Sales', company: 'DataVision AI', email: 'j.kim@datavision.com', lastContact: '2024-01-05' },
        { name: 'David Thompson', role: 'CEO', company: 'NextGen Labs', email: 'd.thompson@nextgen.com', lastContact: '2024-01-20' },
        { name: 'Emma Wilson', role: 'COO', company: 'InnovateX', email: 'e.wilson@innovatex.com', lastContact: '2024-01-12' }
      ]
    },
    productRoadmap: {
      features: [
        { name: 'AI-Powered Analytics Dashboard', priority: 'High', status: 'In Development', quarter: 'Q2 2024' },
        { name: 'Mobile App Beta Release', priority: 'High', status: 'Testing', quarter: 'Q1 2024' },
        { name: 'API Integrations', priority: 'Medium', status: 'Planning', quarter: 'Q3 2024' },
        { name: 'Advanced Reporting Module', priority: 'Medium', status: 'Backlog', quarter: 'Q4 2024' },
        { name: 'White-label Solution', priority: 'Low', status: 'Ideation', quarter: 'Q1 2025' }
      ],
      milestones: [
        { name: 'Beta Launch', date: '2024-03-15', status: 'On Track' },
        { name: 'Series A Funding', date: '2024-05-30', status: 'At Risk' },
        { name: 'Enterprise Client Win', date: '2024-06-30', status: 'On Track' },
        { name: 'Market Expansion', date: '2024-09-30', status: 'Planning' }
      ]
    }
  },
  creative: {
    contentCalendar: {
      posts: [
        { title: 'Behind the Scenes: Design Process', platform: 'Instagram', status: 'Scheduled', date: '2024-02-01' },
        { title: 'Client Success Story: TechFlow', platform: 'LinkedIn', status: 'Draft', date: '2024-02-05' },
        { title: '5 Design Trends for 2024', platform: 'Twitter', status: 'Published', date: '2024-01-20' },
        { title: 'Case Study: Brand Identity for CloudSync', platform: 'Portfolio', status: 'In Progress', date: '2024-02-10' },
        { title: 'Team Spotlight: Meet Our Designers', platform: 'Instagram', status: 'Planned', date: '2024-02-15' }
      ],
      campaigns: [
        { name: 'Valentine\'s Day Promotion', startDate: '2024-02-01', endDate: '2024-02-14', status: 'Active' },
        { name: 'New Portfolio Launch', startDate: '2024-03-01', endDate: '2024-03-31', status: 'Planning' },
        { name: 'Summer Campaign', startDate: '2024-06-01', endDate: '2024-08-31', status: 'Ideation' }
      ]
    },
    projectTracker: {
      projects: [
        { name: 'Brand Identity for TechFlow', client: 'TechFlow Solutions', deadline: '2024-03-15', status: 'In Progress', progress: '65%' },
        { name: 'Website Redesign for CloudSync', client: 'CloudSync Pro', deadline: '2024-02-28', status: 'Review', progress: '90%' },
        { name: 'Social Media Assets for DataVision', client: 'DataVision AI', deadline: '2024-02-10', status: 'Completed', progress: '100%' },
        { name: 'Packaging Design for NextGen', client: 'NextGen Labs', deadline: '2024-04-30', status: 'Briefing', progress: '10%' }
      ],
      resources: [
        { name: 'Adobe Creative Suite License', type: 'Software', status: 'Active' },
        { name: 'Stock Photo Subscription', type: 'Service', status: 'Active' },
        { name: 'MacBook Pro for Designer', type: 'Hardware', status: 'Ordered' }
      ]
    }
  },
  enterprise: {
    projectManagement: {
      projects: [
        { name: 'ERP System Implementation', department: 'IT', startDate: '2024-01-01', endDate: '2024-06-30', status: 'In Progress', budget: '$500K' },
        { name: 'Office Relocation', department: 'Operations', startDate: '2024-03-01', endDate: '2024-05-31', status: 'Planning', budget: '$250K' },
        { name: 'Employee Training Program', department: 'HR', startDate: '2024-02-01', endDate: '2024-12-31', status: 'Active', budget: '$100K' },
        { name: 'Cybersecurity Audit', department: 'Security', startDate: '2024-04-01', endDate: '2024-06-30', status: 'Scheduled', budget: '$75K' }
      ],
      resources: [
        { name: 'Project Manager - John Smith', type: 'Personnel', allocation: '50%' },
        { name: 'Consulting Firm - McKinsey', type: 'External', allocation: '30%' },
        { name: 'Software License - MS Project', type: 'Tools', allocation: '100%' }
      ]
    },
    riskManagement: {
      risks: [
        { name: 'Data Breach', category: 'Security', likelihood: 'Medium', impact: 'High', mitigation: 'Implement multi-factor authentication' },
        { name: 'Budget Overrun', category: 'Financial', likelihood: 'High', impact: 'Medium', mitigation: 'Weekly budget reviews' },
        { name: 'Key Person Departure', category: 'HR', likelihood: 'Low', impact: 'High', mitigation: 'Succession planning' },
        { name: 'Regulatory Changes', category: 'Compliance', likelihood: 'Medium', impact: 'Medium', mitigation: 'Legal review quarterly' }
      ],
      compliance: [
        { name: 'GDPR Compliance', deadline: '2024-05-25', status: 'Compliant' },
        { name: 'SOX Reporting', deadline: '2024-03-15', status: 'In Progress' },
        { name: 'ISO Certification', deadline: '2024-12-31', status: 'Planning' }
      ]
    }
  },
  personal: {
    habitTracker: {
      habits: [
        { name: 'Morning Meditation', category: 'Mindfulness', streak: 42, target: 'Daily' },
        { name: 'Read 30 Minutes', category: 'Learning', streak: 15, target: 'Daily' },
        { name: 'Exercise', category: 'Health', streak: 8, target: '5 times/week' },
        { name: 'No Social Media', category: 'Focus', streak: 3, target: 'Weekdays' }
      ],
      goals: [
        { name: 'Learn Spanish', category: 'Learning', progress: '25%', deadline: '2024-12-31' },
        { name: 'Save $10,000', category: 'Finance', progress: '60%', deadline: '2024-12-31' },
        { name: 'Run Marathon', category: 'Health', progress: '15%', deadline: '2024-10-15' }
      ]
    },
    lifeOrganization: {
      tasks: [
        { name: 'Schedule Dentist Appointment', priority: 'High', dueDate: '2024-01-31', status: 'Pending' },
        { name: 'Organize Photos', priority: 'Low', dueDate: '2024-02-29', status: 'Backlog' },
        { name: 'Renew Driver\'s License', priority: 'Medium', dueDate: '2024-03-15', status: 'In Progress' }
      ],
      events: [
        { name: 'Parent-Teacher Conference', date: '2024-02-10', type: 'Personal' },
        { name: 'Friend\'s Birthday Party', date: '2024-02-18', type: 'Social' },
        { name: 'Annual Health Checkup', date: '2024-03-05', type: 'Health' }
      ]
    }
  }
};

// Function to get industry-specific sample data
export function getIndustrySampleData(industry: string, templateType: string, contentDensity: 'minimal' | 'moderate' | 'rich'): any[] {
  const industryData = industryTemplates[industry as keyof typeof industryTemplates];
  
  if (!industryData) {
    return []; // Return empty array if industry not found
  }
  
  const templateData = industryData[templateType as keyof typeof industryTemplates.startup];
  
  if (!templateData) {
    return []; // Return empty array if template type not found
  }
  
  // Convert the template data to an array of items based on content density
  let sampleData: any[] = [];
  
  if (templateType === 'crm') {
    // For CRM, we have companies, deals, and contacts
    const companies = templateData.companies || [];
    const deals = templateData.deals || [];
    const contacts = templateData.contacts || [];
    
    switch (contentDensity) {
      case 'minimal':
        sampleData = [
          { type: 'company', data: companies.slice(0, 1) },
          { type: 'deal', data: deals.slice(0, 1) },
          { type: 'contact', data: contacts.slice(0, 1) }
        ];
        break;
      case 'moderate':
        sampleData = [
          { type: 'company', data: companies.slice(0, 3) },
          { type: 'deal', data: deals.slice(0, 3) },
          { type: 'contact', data: contacts.slice(0, 3) }
        ];
        break;
      case 'rich':
        sampleData = [
          { type: 'company', data: companies },
          { type: 'deal', data: deals },
          { type: 'contact', data: contacts }
        ];
        break;
    }
  } else {
    // For other template types, we just need to limit the data based on content density
    const entries = Object.keys(templateData).reduce((acc, key) => {
      if (Array.isArray(templateData[key])) {
        acc = acc.concat(templateData[key].map((item: any) => ({ ...item, category: key })));
      }
      return acc;
    }, []);
    
    switch (contentDensity) {
      case 'minimal':
        sampleData = entries.slice(0, 2);
        break;
      case 'moderate':
        sampleData = entries.slice(0, 4);
        break;
      case 'rich':
        sampleData = entries;
        break;
    }
  }
  
  return sampleData;
}

// Function to generate visual content flows for specific templates
export function generateVisualContentFlow(industry: string, templateType: string, contentDensity: 'minimal' | 'moderate' | 'rich'): any {
  const visualFlows: Record<string, Record<string, any>> = {
    creative: {
      contentCalendar: {
        minimal: {
          title: "📅 Social Media Calendar - February 2024",
          icon: "📅",
          cover: "gradient-blue-purple",
          contentBlocks: [
            {
              type: "callout",
              color: "blue",
              emoji: "💡",
              content: "💡 **Pro Tip**: Schedule posts 2 weeks ahead for consistent engagement"
            },
            {
              type: "divider"
            },
            {
              type: "heading_2",
              content: "🎯 This Week's Focus"
            },
            {
              type: "bulleted_list_item",
              content: "🔥 Product Launch Campaign - Feb 15"
            },
            {
              type: "bulleted_list_item",
              content: "📊 Analytics Review - Feb 20"
            }
          ]
        },
        moderate: {
          title: "📅 Social Media Calendar - February 2024",
          icon: "📅",
          cover: "gradient-blue-purple",
          contentBlocks: [
            {
              type: "callout",
              color: "blue",
              emoji: "💡",
              content: "💡 **Pro Tip**: Schedule posts 2 weeks ahead for consistent engagement"
            },
            {
              type: "divider"
            },
            {
              type: "heading_2",
              content: "🎯 High Priority"
            },
            {
              type: "bulleted_list_item",
              content: "🔥 Product Launch Campaign - Feb 15"
            },
            {
              type: "bulleted_list_item",
              content: "📊 Year-in-Review Post - Feb 28"
            },
            {
              type: "divider"
            },
            {
              type: "heading_2",
              content: "📝 Content Ideas"
            },
            {
              type: "bulleted_list_item",
              content: "Behind-the-scenes team story"
            },
            {
              type: "bulleted_list_item",
              content: "Customer testimonial spotlight"
            }
          ]
        },
        rich: {
          title: "📅 Social Media Calendar - February 2024",
          icon: "📅",
          cover: "gradient-blue-purple",
          contentBlocks: [
            {
              type: "callout",
              color: "blue",
              emoji: "💡",
              content: "💡 **Pro Tip**: Schedule posts 2 weeks ahead for consistent engagement"
            },
            {
              type: "divider"
            },
            {
              type: "heading_1",
              content: "📅 February 2024 Content Calendar"
            },
            {
              type: "heading_2",
              content: "🎯 Week 1: Product Launch"
            },
            {
              type: "columns",
              layout: "3-column",
              content: [
                {
                  title: "📱 Instagram",
                  items: [
                    "Behind-the-scenes story",
                    "Product teaser carousel"
                  ]
                },
                {
                  title: "💼 LinkedIn",
                  items: [
                    "Team announcement post",
                    "Employee spotlight"
                  ]
                },
                {
                  title: "🐦 Twitter",
                  items: [
                    "Feature teaser thread",
                    "Engagement poll"
                  ]
                }
              ]
            },
            {
              type: "divider"
            },
            {
              type: "heading_2",
              content: "💡 Week 2: Educational Content"
            },
            {
              type: "columns",
              layout: "3-column",
              content: [
                {
                  title: "📊 Blog",
                  items: [
                    "\"5 Ways to Improve Productivity\"",
                    "Industry trends analysis"
                  ]
                },
                {
                  type: "heading_2",
                  content: "🎥 YouTube"
                },
                {
                  title: "📧 Newsletter",
                  items: [
                    "Monthly insights",
                    "Subscriber spotlight"
                  ]
                }
              ]
            },
            {
              type: "divider"
            },
            {
              type: "heading_2",
              content: "📈 Analytics"
            },
            {
              type: "columns",
              layout: "2-column",
              content: [
                {
                  title: "Engagement Rate",
                  items: [
                    "Current: 4.2%",
                    "Target: 6.0%"
                  ]
                },
                {
                  title: "Best Posting Time",
                  items: [
                    "Tue-Thu 2-4pm",
                    "Sat 10am-12pm"
                  ]
                }
              ]
            }
          ]
        }
      }
    },
    startup: {
      productRoadmap: {
        minimal: {
          title: "🚀 Product Roadmap - Q1-Q2 2024",
          icon: "🚀",
          cover: "gradient-indigo-violet",
          contentBlocks: [
            {
              type: "callout",
              color: "purple",
              emoji: "🎯",
              content: "🎯 **Focus**: Deliver core features for beta launch"
            },
            {
              type: "divider"
            },
            {
              type: "heading_2",
              content: "📅 Key Milestones"
            },
            {
              type: "bulleted_list_item",
              content: "Beta Launch - Mar 15"
            }
          ]
        },
        moderate: {
          title: "🚀 Product Roadmap - Q1-Q2 2024",
          icon: "🚀",
          cover: "gradient-indigo-violet",
          contentBlocks: [
            {
              type: "callout",
              color: "purple",
              emoji: "🎯",
              content: "🎯 **Focus**: Deliver core features for beta launch"
            },
            {
              type: "divider"
            },
            {
              type: "heading_2",
              content: "📅 Key Milestones"
            },
            {
              type: "bulleted_list_item",
              content: "Beta Launch - Mar 15"
            },
            {
              type: "bulleted_list_item",
              content: "Series A Funding - May 30"
            },
            {
              type: "divider"
            },
            {
              type: "heading_2",
              content: "✨ Priority Features"
            },
            {
              type: "bulleted_list_item",
              content: "AI-Powered Analytics Dashboard"
            },
            {
              type: "bulleted_list_item",
              content: "Mobile App Beta Release"
            }
          ]
        },
        rich: {
          title: "🚀 Product Roadmap - Q1-Q2 2024",
          icon: "🚀",
          cover: "gradient-indigo-violet",
          contentBlocks: [
            {
              type: "callout",
              color: "purple",
              emoji: "🎯",
              content: "🎯 **Focus**: Deliver core features for beta launch"
            },
            {
              type: "divider"
            },
            {
              type: "heading_1",
              content: "🚀 Product Roadmap - Q1-Q2 2024"
            },
            {
              type: "heading_2",
              content: "📅 Q1 2024 - Foundation Phase"
            },
            {
              type: "columns",
              layout: "3-column",
              content: [
                {
                  title: "🎯 High Priority",
                  items: [
                    "AI-Powered Analytics Dashboard",
                    "Mobile App Beta Release"
                  ]
                },
                {
                  title: "📝 Medium Priority",
                  items: [
                    "API Integrations",
                    "User Onboarding Flow"
                  ]
                },
                {
                  title: "💭 Backlog",
                  items: [
                    "Advanced Reporting Module",
                    "White-label Solution"
                  ]
                }
              ]
            },
            {
              type: "divider"
            },
            {
              type: "heading_2",
              content: "📅 Q2 2024 - Growth Phase"
            },
            {
              type: "columns",
              layout: "3-column",
              content: [
                {
                  title: "🎯 Key Milestones",
                  items: [
                    "Beta Launch - Mar 15",
                    "Series A Funding - May 30",
                    "Enterprise Client Win - Jun 30"
                  ]
                },
                {
                  title: "📈 Success Metrics",
                  items: [
                    "1000 Active Users",
                    "95% User Satisfaction",
                    "$2.5M ARR Run Rate"
                  ]
                },
                {
                  title: "⚠️ Key Risks",
                  items: [
                    "Talent Acquisition",
                    "Competitive Pressure",
                    "Technical Scalability"
                  ]
                }
              ]
            }
          ]
        }
      }
    }
  };

  // Return the appropriate visual flow or a default structure
  return visualFlows[industry]?.[templateType]?.[contentDensity] || {
    title: `${templateType} - ${industry}`,
    contentBlocks: []
  };
}

// Function to detect industry context from prompt
export function detectIndustryContext(prompt: string): string {
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
