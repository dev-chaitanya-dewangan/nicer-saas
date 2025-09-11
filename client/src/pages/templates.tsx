import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Search, 
  Plus, 
  Filter,
  Users,
  KanbanSquare,
  Calendar,
  Target,
  ShoppingCart,
  Briefcase,
  GraduationCap,
  Heart,
  Palette
} from "lucide-react";
import type { Template } from "@shared/schema";

export default function Templates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("professional");

  const { data: templates, isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates", selectedCategory !== "all" ? selectedCategory : undefined],
    retry: false,
  });

  const useTemplateMutation = useMutation({
    mutationFn: async ({ templateId, theme }: { templateId: string; theme: string }) => {
      const response = await apiRequest("POST", `/api/templates/${templateId}/use`, { theme });
      return response.json();
    },
    onSuccess: (workspace) => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces"] });
      toast({
        title: "Template Applied",
        description: "Your workspace has been created from the template!",
      });
      // Navigate to the new workspace
      window.location.href = `/chat/${workspace.id}`;
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to apply template",
        variant: "destructive",
      });
    },
  });

  const categories = [
    { value: "all", label: "All Templates", icon: Palette },
    { value: "business", label: "Business", icon: Briefcase },
    { value: "productivity", label: "Productivity", icon: KanbanSquare },
    { value: "marketing", label: "Marketing", icon: Calendar },
    { value: "personal", label: "Personal", icon: Heart },
    { value: "education", label: "Education", icon: GraduationCap },
  ];

  const themes = [
    { value: "professional", label: "Professional" },
    { value: "pastel", label: "Pastel" },
    { value: "dark", label: "Dark" },
    { value: "fun", label: "Fun" },
    { value: "light", label: "Light" },
    { value: "cheerful", label: "Cheerful" },
    { value: "loving", label: "Loving" },
    { value: "soft", label: "Soft" },
    { value: "rough", label: "Rough" }
  ];

  const featuredTemplates = [
    {
      id: "featured-crm",
      title: "SaaS CRM System",
      description: "Complete customer relationship management with lead tracking, deal pipeline, and revenue analytics.",
      category: "Business",
      icon: Users,
      tags: ["Leads Database", "Deal Pipeline", "Analytics"],
      color: "chart-1",
      prompt: "Create a comprehensive SaaS CRM system with lead tracking, deal pipeline management, revenue analytics, churn rate calculations, and customer communication logs."
    },
    {
      id: "featured-project",
      title: "Project Management Hub",
      description: "Task boards, timelines, resource allocation, and team coordination in one workspace.",
      category: "Productivity",
      icon: KanbanSquare,
      tags: ["Kanban Boards", "Timeline", "Resources"],
      color: "chart-2",
      prompt: "Build a project management workspace with task boards, timeline views, resource allocation, team coordination, milestone tracking, and progress reporting."
    },
    {
      id: "featured-content",
      title: "Content Calendar",
      description: "Multi-platform content planning with collaboration tools and performance analytics.",
      category: "Marketing",
      icon: Calendar,
      tags: ["Multi-Platform", "Collaboration", "Analytics"],
      color: "chart-3",
      prompt: "Create a content calendar workspace for multi-platform content planning, collaboration tools, publishing schedules, performance analytics, and content ideation."
    },
    {
      id: "featured-personal",
      title: "Life Organization System",
      description: "Habit tracking, goal management, and personal productivity system for life organization.",
      category: "Personal",
      icon: Target,
      tags: ["Habit Tracker", "Goals", "Journal"],
      color: "chart-4",
      prompt: "Design a personal life organization system with habit tracking, goal management, daily journaling, mood tracking, and personal productivity metrics."
    },
    {
      id: "featured-ecommerce",
      title: "E-commerce Operations",
      description: "Product catalog, order management, inventory tracking, and customer support system.",
      category: "Business",
      icon: ShoppingCart,
      tags: ["Products", "Orders", "Inventory"],
      color: "chart-5",
      prompt: "Build an e-commerce operations workspace with product catalog, order management, inventory tracking, customer support tickets, and sales analytics."
    }
  ];

  // Combine database templates with featured templates if database is empty
  const allTemplates = templates && templates.length > 0 
    ? templates.map(t => ({ ...t, tags: t.tags || [] }))
    : [
        ...featuredTemplates,
        ...(templates || []).map(t => ({ ...t, tags: t.tags || [] }))
      ];

  const filteredTemplates = allTemplates.filter(template => {
    const matchesCategory = selectedCategory === "all" || 
      template.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !searchQuery || 
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const handleUseTemplate = (template: any) => {
    useTemplateMutation.mutate({
      templateId: template.id,
      theme: selectedTheme
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-templates-title">Template Library</h1>
          <p className="text-muted-foreground">
            Choose from professionally designed templates to jumpstart your Notion workspace creation.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-templates"
              />
            </div>
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full lg:w-48" data-testid="select-category">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  <div className="flex items-center space-x-2">
                    <category.icon className="w-4 h-4" />
                    <span>{category.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTheme} onValueChange={setSelectedTheme}>
            <SelectTrigger className="w-full lg:w-48" data-testid="select-template-theme">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {themes.map((theme) => (
                <SelectItem key={theme.value} value={theme.value}>
                  {theme.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : filteredTemplates.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={() => handleUseTemplate(template)}
                isLoading={useTemplateMutation.isPending}
                selectedTheme={selectedTheme}
              />
            ))}
            
            {/* Custom Template Option */}
            <Card className="border-dashed hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[280px]">
                <div className="w-12 h-12 bg-muted/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  Create Custom Workspace
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Start from scratch and describe exactly what you need. Our AI will create a custom workspace tailored to your requirements.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/chat'}
                  data-testid="button-create-custom"
                >
                  Start Chat
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-muted/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No Templates Found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery 
                  ? `No templates match "${searchQuery}" in the ${selectedCategory} category.`
                  : `No templates available in the ${selectedCategory} category.`
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </Button>
                <Button onClick={() => window.location.href = '/chat'} data-testid="button-create-custom-fallback">
                  Create Custom Workspace
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="bg-muted/20">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Need Something Specific?</h2>
              <p className="text-muted-foreground mb-6">
                Can't find the perfect template? Describe your exact needs and let our AI create a completely custom workspace for you.
              </p>
              <Button size="lg" onClick={() => window.location.href = '/chat'} data-testid="button-start-custom-chat">
                Start Custom Chat
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
