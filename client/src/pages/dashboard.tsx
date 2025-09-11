import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Plus, 
  MessageSquare, 
  ExternalLink, 
  Calendar, 
  TrendingUp,
  Users,
  Database,
  Layout,
  Clock
} from "lucide-react";
import type { Workspace, User } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

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

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: workspaces, isLoading: workspacesLoading } = useQuery<Workspace[]>({
    queryKey: ["/api/workspaces"],
    enabled: isAuthenticated,
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
  });

  if (authLoading || userLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const usagePercentage = user ? (user.monthlyUsage / user.usageLimit) * 100 : 0;
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = usagePercentage >= 100;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-welcome">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
          </h1>
          <p className="text-muted-foreground">
            Create amazing Notion workspaces with AI or choose from our template library.
          </p>
        </div>

        {/* Usage Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Usage</p>
                  <p className="text-2xl font-bold" data-testid="text-usage-count">
                    {user?.monthlyUsage || 0} / {user?.usageLimit || 3}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${isAtLimit ? 'bg-destructive/10' : isNearLimit ? 'bg-chart-3/10' : 'bg-chart-2/10'}`}>
                  <TrendingUp className={`w-5 h-5 ${isAtLimit ? 'text-destructive' : isNearLimit ? 'text-chart-3' : 'text-chart-2'}`} />
                </div>
              </div>
              {isNearLimit && (
                <div className="mt-2">
                  <Badge variant={isAtLimit ? "destructive" : "secondary"}>
                    {isAtLimit ? "Limit Reached" : "Near Limit"}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Workspaces Created</p>
                  <p className="text-2xl font-bold" data-testid="text-workspace-count">
                    {workspaces?.length || 0}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Layout className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Subscription</p>
                  <p className="text-2xl font-bold capitalize" data-testid="text-subscription-status">
                    {user?.subscriptionStatus || 'Free'}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-chart-4/10">
                  <Users className="w-5 h-5 text-chart-4" />
                </div>
              </div>
              {user?.subscriptionStatus === 'free' && (
                <div className="mt-2">
                  <Link href="/subscribe">
                    <Button size="sm" variant="outline" data-testid="button-upgrade">
                      Upgrade
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/chat">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Start New Chat</h3>
                    <p className="text-muted-foreground">
                      Describe your workspace needs and let AI create it for you
                    </p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/templates">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg bg-chart-2/10">
                    <Database className="w-6 h-6 text-chart-2" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Browse Templates</h3>
                    <p className="text-muted-foreground">
                      Choose from professionally designed workspace templates
                    </p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Recent Workspaces */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Workspaces</h2>
            <Link href="/chat">
              <Button data-testid="button-create-workspace">
                <Plus className="w-4 h-4 mr-2" />
                Create Workspace
              </Button>
            </Link>
          </div>

          {workspacesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : workspaces && workspaces.length > 0 ? (
            <div className="space-y-4">
              {workspaces.slice(0, 5).map((workspace) => (
                <Card key={workspace.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg" data-testid={`text-workspace-title-${workspace.id}`}>
                            {workspace.title}
                          </h3>
                          <Badge 
                            variant={workspace.status === 'completed' ? 'default' : 
                                   workspace.status === 'deployed' ? 'secondary' : 
                                   workspace.status === 'failed' ? 'destructive' : 'outline'}
                          >
                            {workspace.status}
                          </Badge>
                          {workspace.theme && (
                            <Badge variant="outline">{workspace.theme}</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-3">{workspace.description}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(workspace.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link href={`/chat/${workspace.id}`}>
                          <Button variant="outline" size="sm" data-testid={`button-edit-${workspace.id}`}>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                        {workspace.status === 'completed' && (
                          <Button size="sm" data-testid={`button-deploy-${workspace.id}`}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Deploy
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-muted/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Layout className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">No workspaces yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Get started by creating your first AI-powered Notion workspace
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/chat">
                      <Button data-testid="button-start-chat">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Start with Chat
                      </Button>
                    </Link>
                    <Link href="/templates">
                      <Button variant="outline" data-testid="button-browse-templates">
                        <Database className="w-4 h-4 mr-2" />
                        Browse Templates
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
