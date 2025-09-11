import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { 
  Layers, 
  Menu, 
  LogOut, 
  User, 
  MessageSquare, 
  Database, 
  CreditCard,
  Settings
} from "lucide-react";

export function Header() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2" data-testid="link-logo">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Layers className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">Nicer SaaS</span>
        </Link>
        
        {/* Desktop Navigation */}
        {isAuthenticated ? (
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/chat">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground" data-testid="nav-link-chat">
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat
              </Button>
            </Link>
            <Link href="/templates">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground" data-testid="nav-link-templates">
                <Database className="w-4 h-4 mr-2" />
                Templates
              </Button>
            </Link>
            {user?.subscriptionStatus === 'free' && (
              <Link href="/subscribe">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground" data-testid="nav-link-upgrade">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Upgrade
                </Button>
              </Link>
            )}
          </nav>
        ) : (
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#templates" className="text-muted-foreground hover:text-foreground transition-colors">
              Templates
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
          </nav>
        )}

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center space-x-3">
          {isLoading ? (
            <div className="w-8 h-8 bg-muted animate-pulse rounded-full" />
          ) : isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {user?.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                )}
                <span className="text-sm font-medium" data-testid="text-user-name">
                  {user?.firstName || user?.email?.split('@')[0] || 'User'}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleSignOut}
                data-testid="button-sign-out"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" data-testid="button-sign-in" asChild>
                <a href="/api/login">Sign In</a>
              </Button>
              <Button data-testid="button-get-started" asChild>
                <a href="/api/login">Get Started</a>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="sm" data-testid="button-mobile-menu">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px]">
            <div className="flex flex-col space-y-4 mt-6">
              {isAuthenticated ? (
                <>
                  {/* User Info */}
                  <div className="flex items-center space-x-3 pb-4 border-b border-border">
                    {user?.profileImageUrl ? (
                      <img 
                        src={user.profileImageUrl} 
                        alt="Profile" 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium" data-testid="text-mobile-user-name">
                        {user?.firstName || user?.email?.split('@')[0] || 'User'}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {user?.subscriptionStatus || 'Free'} Plan
                      </div>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <Link href="/chat" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Chat
                    </Button>
                  </Link>
                  <Link href="/templates" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Database className="w-4 h-4 mr-2" />
                      Templates
                    </Button>
                  </Link>
                  {user?.subscriptionStatus === 'free' && (
                    <Link href="/subscribe" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Upgrade to Pro
                      </Button>
                    </Link>
                  )}
                  
                  <div className="pt-4 border-t border-border">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-destructive"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <a href="#features" className="text-left px-4 py-2 hover:bg-accent rounded-lg transition-colors">
                    Features
                  </a>
                  <a href="#templates" className="text-left px-4 py-2 hover:bg-accent rounded-lg transition-colors">
                    Templates
                  </a>
                  <a href="#pricing" className="text-left px-4 py-2 hover:bg-accent rounded-lg transition-colors">
                    Pricing
                  </a>
                  <div className="pt-4 border-t border-border space-y-2">
                    <Button variant="outline" className="w-full" asChild>
                      <a href="/api/login">Sign In</a>
                    </Button>
                    <Button className="w-full" asChild>
                      <a href="/api/login">Get Started</a>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
