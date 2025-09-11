import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { AuthButtons } from "@/components/auth/AuthButtons";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Sparkles, 
  Palette, 
  Database, 
  ExternalLink, 
  LayoutTemplate, 
  Eye, 
  Users, 
  KanbanSquare, 
  Calendar, 
  Target, 
  ShoppingCart, 
  Plus,
  Play,
  MessageCircle,
  LayoutDashboard,
  Table,
  BarChart,
  Check,
  Shield,
  RefreshCw,
  Clock,
  CreditCard,
  UserCheck,
  Brain,
  Activity,
  Layers,
  Github,
  Twitter,
  Linkedin,
  Mail
} from "lucide-react";

export default function Landing() {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const templates = [
    {
      id: "crm",
      title: "SaaS CRM System",
      description: "Complete customer relationship management with lead tracking, deal pipeline, and revenue analytics.",
      category: "Business",
      icon: Users,
      tags: ["Leads Database", "Deal Pipeline", "Analytics"],
      color: "chart-1"
    },
    {
      id: "project",
      title: "Project Management",
      description: "Task boards, timelines, resource allocation, and team coordination in one workspace.",
      category: "Productivity",
      icon: KanbanSquare,
      tags: ["Kanban Boards", "Timeline", "Resources"],
      color: "chart-2"
    },
    {
      id: "content",
      title: "Content Calendar",
      description: "Multi-platform content planning with collaboration tools and performance analytics.",
      category: "Marketing",
      icon: Calendar,
      tags: ["Multi-Platform", "Collaboration", "Analytics"],
      color: "chart-3"
    },
    {
      id: "personal",
      title: "Life Organization",
      description: "Habit tracking, goal management, and personal productivity system for life organization.",
      category: "Personal",
      icon: Target,
      tags: ["Habit Tracker", "Goals", "Journal"],
      color: "chart-4"
    },
    {
      id: "ecommerce",
      title: "E-commerce Hub",
      description: "Product catalog, order management, inventory tracking, and customer support system.",
      category: "Business",
      icon: ShoppingCart,
      tags: ["Products", "Orders", "Inventory"],
      color: "chart-5"
    }
  ];

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Generation",
      description: "Advanced prompt interpretation that understands entities, relationships, and aesthetics to create sophisticated workspaces.",
      color: "primary"
    },
    {
      icon: Palette,
      title: "9 Professional Themes",
      description: "Choose from professional, pastel, dark, fun, and more theme options with customizable density and visual polish.",
      color: "chart-2"
    },
    {
      icon: Database,
      title: "Complex Database Generation",
      description: "Creates databases with formulas, rollups, relations, and multiple view types including kanban, calendar, and timeline.",
      color: "chart-3"
    },
    {
      icon: ExternalLink,
      title: "One-Click Deployment",
      description: "Secure OAuth integration with Notion for instant workspace deployment with full functionality and sample data.",
      color: "chart-4"
    },
    {
      icon: LayoutTemplate,
      title: "LayoutTemplate Library",
      description: "Pre-built templates for CRM, project management, content calendars, and more with guided prompt suggestions.",
      color: "chart-5"
    },
    {
      icon: Eye,
      title: "Real-time Preview",
      description: "Visual workspace preview before deployment with modification options and iterative refinement capabilities.",
      color: "primary"
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: 0,
      description: "Perfect for trying out the platform",
      features: [
        "3 workspaces per month",
        "Basic templates",
        "Community access",
        "Standard themes"
      ],
      buttonText: "Get Started Free",
      buttonVariant: "outline" as const
    },
    {
      name: "Pro",
      price: 29,
      description: "For professionals and small teams",
      features: [
        "80 workspaces per month",
        "All premium templates",
        "Custom themes",
        "Priority support",
        "Advanced features",
        "CSV export"
      ],
      buttonText: "Upgrade to Pro",
      buttonVariant: "default" as const,
      popular: true
    },
    {
      name: "Enterprise",
      price: 99,
      description: "For large teams and organizations",
      features: [
        "Unlimited workspaces",
        "Custom integrations",
        "Dedicated support",
        "SSO integration",
        "Custom branding",
        "API access"
      ],
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Transform Ideas into
            <span className="gradient-text block mt-2">Professional Notion Workspaces</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
            Turn natural language descriptions into sophisticated, production-ready Notion dashboards with AI. 
            No design skills required—just describe what you need.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="text-lg font-semibold"
              data-testid="button-try-demo"
            >
              <Play className="w-5 h-5 mr-2" />
              Try Demo
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg font-semibold"
              data-testid="button-view-templates"
            >
              <LayoutTemplate className="w-5 h-5 mr-2" />
              View Templates
            </Button>
          </div>

          {/* Auth Options */}
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Quick Start</h3>
              <AuthButtons />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Demo Preview */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Chat Interface Preview */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">AI Chat Interface</h3>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-destructive rounded-full"></div>
                  <div className="w-3 h-3 bg-chart-3 rounded-full"></div>
                  <div className="w-3 h-3 bg-chart-2 rounded-full"></div>
                </div>
              </div>
              
              <div className="space-y-4 h-64 overflow-y-auto bg-muted/20 rounded-lg p-4">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg max-w-xs">
                    I need a CRM system for my SaaS startup with lead tracking, deal pipeline, and revenue analytics
                  </div>
                </div>
                
                {/* AI Response */}
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <Card className="max-w-md">
                    <CardContent className="p-4">
                      <p className="mb-2">Perfect! I'll create a comprehensive SaaS CRM with:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Leads database with qualification scoring</li>
                        <li>• Deal pipeline with stage tracking</li>
                        <li>• Revenue analytics with MRR calculations</li>
                        <li>• Churn rate formulas and metrics</li>
                      </ul>
                      <p className="mt-2 text-sm">Generating workspace... <span className="animate-pulse">●</span></p>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div className="mt-4 flex items-center space-x-2">
                <input 
                  type="text" 
                  placeholder="Describe your workspace needs..." 
                  className="flex-1 bg-input border border-border px-4 py-2 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  data-testid="input-chat-demo"
                />
                <Button data-testid="button-send-demo">
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Workspace Preview */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Before */}
            <Card>
              <CardContent className="p-6">
                <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-muted-foreground" />
                  <span>Natural Language Input</span>
                </h4>
                <div className="bg-muted/20 rounded-lg p-4 text-muted-foreground italic">
                  "I need a project management system for my marketing team with task boards, 
                  content calendar, and team collaboration features"
                </div>
              </CardContent>
            </Card>

            {/* After */}
            <Card>
              <CardContent className="p-6">
                <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <LayoutDashboard className="w-5 h-5 text-primary" />
                  <span>Generated Workspace</span>
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Table className="w-4 h-4 text-chart-1" />
                    <span>Tasks Database (Kanban View)</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-chart-2" />
                    <span>Content Calendar (Timeline View)</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Users className="w-4 h-4 text-chart-3" />
                    <span>Team Directory (Gallery View)</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <BarChart className="w-4 h-4 text-chart-4" />
                    <span>Analytics Dashboard</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create professional Notion workspaces in minutes, not hours
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 bg-${feature.color}/10 rounded-lg flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">LayoutTemplate Library</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start with professionally designed templates or create custom workspaces from scratch
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
            
            {/* Custom LayoutTemplate */}
            <Card className="border-dashed hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
                <div className="w-12 h-12 bg-muted/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">Create Custom</h3>
                <p className="text-muted-foreground text-sm">
                  Describe your needs and let AI create a completely custom workspace tailored to your requirements.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your workspace creation needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={plan.popular ? "border-2 border-primary relative" : ""}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                    <div className="text-3xl font-bold mb-2">
                      ${plan.price}<span className="text-lg text-muted-foreground">/month</span>
                    </div>
                    <p className="text-muted-foreground">{plan.description}</p>
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-chart-2" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    variant={plan.buttonVariant}
                    className="w-full"
                    data-testid={`button-${plan.name.toLowerCase()}-plan`}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Billing Integration Info */}
          <Card className="mt-8 bg-muted/20">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-chart-2" />
                  <span className="text-sm">Secure payments with Stripe</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-5 h-5 text-chart-2" />
                  <span className="text-sm">Cancel anytime</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-chart-2" />
                  <span className="text-sm">14-day money back guarantee</span>
                </div>
              </div>
              <p className="text-muted-foreground text-sm">
                All plans include secure Notion OAuth integration and one-click workspace deployment
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Integration Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Seamless Integrations</h2>
          <p className="text-xl text-muted-foreground mb-12">
            Connect with the tools you already use and love
          </p>

          {/* Notion Integration Highlight */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Layers className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold">→</div>
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4.459 4.208c.746.606 1.026.56 2.428.467l13.215-.913c.467-.056.56-.28.467-.746L20.09.648c-.093-.467-.28-.56-.747-.467L6.887.181c-.467.093-.746.467-.746.934L6.141 3.74c0 .467.186.746.318.468zM3.775 7.179c-.093-.467.186-.84.653-.84l14.853-.373c.467-.093.747.093.747.56l.373 11.695c0 .467-.28.747-.747.747l-1.773.093c-.467.093-.747-.093-.747-.56l-.373-9.922c-.093-.467-.28-.654-.747-.56L4.988 8.019c-.467.093-.747-.28-.654-.747L3.775 7.18zm11.695 4.006c.093 1.12.746 1.773 1.866 1.773 1.12-.093 1.773-.746 1.773-1.866-.093-1.12-.746-1.773-1.866-1.773-1.12.093-1.773.746-1.773 1.866z"/>
                  </svg>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-3">Notion OAuth Integration</h3>
              <p className="text-muted-foreground mb-6">
                Secure authentication with your Notion workspace for instant deployment of generated templates with full functionality.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="bg-muted/20 rounded-lg p-3">
                  <Shield className="w-4 h-4 text-chart-2 mb-2" />
                  <div className="font-semibold">Secure OAuth</div>
                  <div className="text-muted-foreground">Industry-standard authentication</div>
                </div>
                <div className="bg-muted/20 rounded-lg p-3">
                  <ExternalLink className="w-4 h-4 text-chart-3 mb-2" />
                  <div className="font-semibold">Instant Deploy</div>
                  <div className="text-muted-foreground">One-click workspace creation</div>
                </div>
                <div className="bg-muted/20 rounded-lg p-3">
                  <Database className="w-4 h-4 text-chart-4 mb-2" />
                  <div className="font-semibold">Full Features</div>
                  <div className="text-muted-foreground">Formulas, relations, views</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Other Integrations */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 bg-muted/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="font-semibold text-sm">Stripe</div>
                <div className="text-muted-foreground text-xs">Payment processing</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 bg-muted/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="font-semibold text-sm">Replit Auth</div>
                <div className="text-muted-foreground text-xs">User authentication</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 bg-muted/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Brain className="w-4 h-4" />
                </div>
                <div className="font-semibold text-sm">OpenRouter</div>
                <div className="text-muted-foreground text-xs">AI generation</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 bg-muted/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="font-semibold text-sm">Analytics</div>
                <div className="text-muted-foreground text-xs">Usage tracking</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                  <Layers className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold">Nicer SaaS</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Transform natural language into professional Notion workspaces with AI-powered generation.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#templates" className="hover:text-foreground transition-colors">Templates</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API Documentation</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Status</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-muted-foreground mb-4 md:mb-0">
              © 2024 Nicer SaaS. All rights reserved.
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
