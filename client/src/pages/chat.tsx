import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { WorkspacePreview } from "@/components/workspace/WorkspacePreview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { 
  ArrowLeft, 
  ExternalLink, 
  RefreshCw, 
  Settings, 
  Save,
  Loader2,
  Sparkles
} from "lucide-react";
import type { Workspace } from "@shared/schema";

export default function Chat() {
  const params = useParams();
  const workspaceId = params.workspaceId;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedTheme, setSelectedTheme] = useState("professional");
  const [workspaceTitle, setWorkspaceTitle] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [includeContent, setIncludeContent] = useState(true);
  const [contentDensity, setContentDensity] = useState<"minimal" | "moderate" | "rich">("moderate");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: workspace, isLoading: workspaceLoading } = useQuery<Workspace>({
    queryKey: ["/api/workspaces", workspaceId],
    enabled: !!workspaceId && isAuthenticated,
    retry: false,
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    },
    onSuccess: (data) => {
      if (data) {
        setSelectedTheme(data.theme || "professional");
        setWorkspaceTitle(data.title);
        setWorkspaceDescription(data.description || "");
      }
    }
  });

  const createWorkspaceMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; prompt: string; theme: string; includeContent: boolean; contentDensity: "minimal" | "moderate" | "rich" }) => {
      const response = await apiRequest("POST", "/api/workspaces", data);
      return response.json();
    },
    onSuccess: (newWorkspace) => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces"] });
      toast({
        title: "Workspace Created",
        description: "Your workspace has been generated successfully!",
      });
      // Navigate to the new workspace
      window.location.href = `/chat/${newWorkspace.id}`;
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to create workspace",
          variant: "destructive",
        });
      }
    },
  });

  const refineWorkspaceMutation = useMutation({
    mutationFn: async (refinementPrompt: string) => {
      const response = await apiRequest("POST", `/api/workspaces/${workspaceId}/refine`, {
        refinementPrompt
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces", workspaceId] });
      toast({
        title: "Workspace Refined",
        description: "Your workspace has been updated successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to refine workspace",
        variant: "destructive",
      });
    },
  });

  const deployWorkspaceMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/workspaces/${workspaceId}/deploy`);
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces", workspaceId] });
      const notionUser = data.notionUser;
      toast({
        title: "Workspace Deployed Successfully",
        description: `Your workspace has been deployed to Notion workspace: ${notionUser?.name || 'Unknown'} (${notionUser?.email || 'Unknown email'})`,
      });
    },
    onError: (error: any) => {
      let errorMessage = error.message || "Failed to deploy workspace to Notion";
      
      // Handle validation errors with detailed feedback
      if (error.errors && Array.isArray(error.errors)) {
        errorMessage = `Notion API Validation Failed:\n${error.errors.slice(0, 3).join('\n')}${error.errors.length > 3 ? '\n...and more' : ''}`;
      } else if (error.error) {
        // Use detailed error from server
        errorMessage = `${error.error}\n\n${error.suggestion || ''}`;
      }
      
      toast({
        title: "Deployment Failed", 
        description: errorMessage,
        variant: "destructive",
        duration: 10000, // Give users time to read detailed messages
      });
    },
  });

  const handleCreateWorkspace = async (prompt: string) => {
    if (!workspaceTitle.trim()) {
      toast({
        title: "Missing Title",
        description: "Please provide a title for your workspace",
        variant: "destructive",
      });
      return;
    }

    createWorkspaceMutation.mutate({
      title: workspaceTitle,
      description: workspaceDescription,
      prompt,
      theme: selectedTheme,
      includeContent,
      contentDensity
    });
  };

  const handleRefineWorkspace = async (refinementPrompt: string) => {
    if (!workspaceId) return;
    refineWorkspaceMutation.mutate(refinementPrompt);
  };

  const handleDeployWorkspace = () => {
    if (!workspaceId) return;
    deployWorkspaceMutation.mutate();
  };

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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid lg:grid-cols-2 gap-8">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.history.back()}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-chat-title">
                {workspace ? `Editing: ${workspace.title}` : "New Workspace"}
              </h1>
              {workspace && (
                <div className="flex items-center space-x-2 mt-1">
                  <Badge 
                    variant={workspace.status === 'completed' ? 'default' : 
                           workspace.status === 'deployed' ? 'secondary' : 
                           workspace.status === 'failed' ? 'destructive' : 'outline'}
                    data-testid="badge-workspace-status"
                  >
                    {workspace.status}
                  </Badge>
                  {workspace.theme && (
                    <Badge variant="outline">{workspace.theme}</Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {workspace && workspace.status === 'completed' && (
            <Button 
              onClick={handleDeployWorkspace}
              disabled={deployWorkspaceMutation.isPending}
              data-testid="button-deploy-workspace"
            >
              {deployWorkspaceMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4 mr-2" />
              )}
              Deploy to Notion
            </Button>
          )}
        </div>

        {/* Workspace Configuration (for new workspaces) */}
        {!workspace && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Workspace Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  value={workspaceTitle}
                  onChange={(e) => setWorkspaceTitle(e.target.value)}
                  placeholder="e.g., Marketing Team CRM"
                  className="w-full bg-input border border-border px-3 py-2 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  data-testid="input-workspace-title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={workspaceDescription}
                  onChange={(e) => setWorkspaceDescription(e.target.value)}
                  placeholder="Brief description of what this workspace will be used for..."
                  rows={2}
                  className="w-full bg-input border border-border px-3 py-2 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  data-testid="textarea-workspace-description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Theme</label>
                <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                  <SelectTrigger data-testid="select-theme">
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
              
              {/* Aesthetic Controls */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <label className="text-sm font-medium">Include AI-generated content</label>
                  </div>
                  <Switch
                    checked={includeContent}
                    onCheckedChange={setIncludeContent}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Content Density</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={contentDensity === "minimal" ? "default" : "outline"}
                      onClick={() => setContentDensity("minimal")}
                      size="sm"
                    >
                      Minimal
                    </Button>
                    <Button
                      variant={contentDensity === "moderate" ? "default" : "outline"}
                      onClick={() => setContentDensity("moderate")}
                      size="sm"
                    >
                      Moderate
                    </Button>
                    <Button
                      variant={contentDensity === "rich" ? "default" : "outline"}
                      onClick={() => setContentDensity("rich")}
                      size="sm"
                    >
                      Rich
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {contentDensity === "minimal" && "Clean structure with placeholder guidance"}
                    {contentDensity === "moderate" && "Realistic sample data with 3-5 examples per database"}
                    {contentDensity === "rich" && "Complete business scenarios with 8-10 comprehensive examples"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Chat Interface */}
          <div>
            <ChatInterface
              workspaceId={workspaceId}
              onCreateWorkspace={handleCreateWorkspace}
              onRefineWorkspace={handleRefineWorkspace}
              isCreating={createWorkspaceMutation.isPending}
              isRefining={refineWorkspaceMutation.isPending}
              hasWorkspace={!!workspace}
            />
          </div>

          {/* Workspace Preview */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Workspace Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {workspaceLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-8" />
                      ))}
                    </div>
                  </div>
                ) : workspace && workspace.aiResponse ? (
                  <WorkspacePreview workspace={workspace} />
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <RefreshCw className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">No Preview Available</h3>
                    <p className="text-muted-foreground">
                      {workspace 
                        ? "Workspace generation in progress..."
                        : "Start a conversation to generate your workspace"
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
