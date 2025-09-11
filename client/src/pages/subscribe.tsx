import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { 
  Check, 
  Crown, 
  ArrowLeft,
  Shield,
  CreditCard,
  Zap
} from "lucide-react";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "You are now subscribed to Pro!",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || !elements}
        className="w-full"
        size="lg"
        data-testid="button-subscribe-submit"
      >
        <Crown className="w-4 h-4 mr-2" />
        Subscribe to Pro
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe to a plan.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    if (isAuthenticated) {
      // Create subscription as soon as the page loads
      apiRequest("POST", "/api/create-subscription")
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Subscription creation error:', error);
          toast({
            title: "Subscription Error",
            description: error.message || "Failed to initialize subscription. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
        });
    }
  }, [isAuthenticated, authLoading, toast]);

  const proFeatures = [
    "80 workspaces per month",
    "All premium templates",
    "Custom themes and styling",
    "Priority customer support",
    "Advanced workspace features",
    "CSV export functionality",
    "Workspace collaboration tools",
    "Advanced analytics dashboard"
  ];

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="space-y-6">
              <Skeleton className="h-64" />
              <Skeleton className="h-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CardContent className="p-12">
                <div className="w-16 h-16 bg-destructive/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Payment Setup Error</h3>
                <p className="text-muted-foreground mb-6">
                  We're having trouble setting up your subscription. This might be due to payment processing configuration.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" onClick={() => window.history.back()}>
                    Go Back
                  </Button>
                  <Button onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.history.back()}
                data-testid="button-back-subscribe"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
            <h1 className="text-3xl font-bold mb-2" data-testid="text-subscribe-title">
              Upgrade to Pro
            </h1>
            <p className="text-muted-foreground">
              Unlock unlimited potential with advanced features and priority support.
            </p>
          </div>

          {/* Current Plan Status */}
          {user && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">Current Plan</h3>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="capitalize">
                        {user.subscriptionStatus || 'Free'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {user.monthlyUsage || 0} / {user.usageLimit || 3} workspaces used
                      </span>
                    </div>
                  </div>
                  {user.subscriptionStatus === 'active' && (
                    <Badge variant="secondary">
                      <Crown className="w-3 h-3 mr-1" />
                      Pro Member
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pro Plan Details */}
          <Card className="mb-6 border-2 border-primary">
            <CardHeader>
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 bg-primary/10 px-3 py-1 rounded-full mb-3">
                  <Crown className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">Pro Plan</span>
                </div>
                <CardTitle className="text-2xl">$29<span className="text-lg text-muted-foreground">/month</span></CardTitle>
                <p className="text-muted-foreground">Everything you need for professional workspace creation</p>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {proFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-chart-2/10 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-chart-2" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Payment Benefits */}
              <div className="bg-muted/20 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Shield className="w-5 h-5 text-chart-2" />
                  <span className="font-semibold">Secure Payment</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Industry-standard encryption</li>
                  <li>• No setup fees or hidden charges</li>
                  <li>• Cancel anytime with full refund policy</li>
                  <li>• 14-day money-back guarantee</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Payment Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <SubscribeForm />
              </Elements>
              
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Shield className="w-4 h-4" />
                    <span>SSL Secured</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="w-4 h-4" />
                    <span>Instant Access</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Check className="w-4 h-4" />
                    <span>Money Back Guarantee</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">Can I cancel anytime?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes, you can cancel your subscription at any time. You'll continue to have Pro access until the end of your billing period.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">What happens to my workspaces if I downgrade?</h4>
                <p className="text-sm text-muted-foreground">
                  Your existing workspaces will remain intact. You'll just be limited to the free plan's monthly creation limit going forward.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Do you offer refunds?</h4>
                <p className="text-sm text-muted-foreground">
                  We offer a 14-day money-back guarantee. If you're not satisfied, contact support for a full refund.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
