import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreditCard, Calendar, DollarSign, AlertTriangle, CheckCircle } from "lucide-react";

interface SubscriptionManagerProps {
  subscription?: {
    id: string;
    status: string;
    current_period_end: string;
    plan: {
      amount: number;
      currency: string;
      interval: string;
    };
  };
}

export const SubscriptionManager = ({ subscription }: SubscriptionManagerProps) => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleCancelSubscription = async () => {
    if (!session || !subscription) {
      toast.error("No active subscription found");
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: {
          subscriptionId: subscription.id
        },
      });
      
      if (error) {
        console.error("Cancellation error:", error);
        toast.error("Failed to cancel subscription");
        return;
      }
      
      toast.success("Subscription cancelled successfully");
      // Refresh the page or update the subscription state
      window.location.reload();
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error("Something went wrong with the cancellation");
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    if (!session) {
      toast.error("Please sign in to manage billing");
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: {
          returnUrl: window.location.href
        },
      });
      
      if (error) {
        console.error("Portal error:", error);
        toast.error("Failed to open billing portal");
        return;
      }
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error("Error opening billing portal:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription
          </CardTitle>
          <CardDescription>
            No active subscription found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            You don't have an active subscription. Subscribe to access premium features.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription
          </div>
          <Badge className={getStatusColor(subscription.status)}>
            {subscription.status}
          </Badge>
        </CardTitle>
        <CardDescription>
          Manage your subscription and billing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm font-medium">Amount</p>
              <p className="text-sm text-gray-600">
                {formatAmount(subscription.plan.amount, subscription.plan.currency)} / {subscription.plan.interval}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm font-medium">Next billing date</p>
              <p className="text-sm text-gray-600">
                {formatDate(subscription.current_period_end)}
              </p>
            </div>
          </div>
        </div>

        {subscription.status === 'active' && (
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <p className="text-sm text-green-800">
              Your subscription is active and will renew automatically.
            </p>
          </div>
        )}

        {subscription.status === 'canceled' && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              Your subscription has been canceled and will end on {formatDate(subscription.current_period_end)}.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleManageBilling}
          disabled={loading}
          className="flex-1"
        >
          {loading ? "Loading..." : "Manage Billing"}
        </Button>
        {subscription.status === 'active' && (
          <Button
            variant="destructive"
            onClick={handleCancelSubscription}
            disabled={loading}
            className="flex-1"
          >
            {loading ? "Canceling..." : "Cancel Subscription"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};