import { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Calendar, AlertTriangle, CheckCircle, Clock, Crown } from "lucide-react";

export const SubscriptionStatus = () => {
  const {
    hasAccess,
    isTrialing,
    isPaid,
    trialEndsAt,
    trialDaysRemaining,
    status,
    subscription,
    loading,
    error,
    cancelSubscription,
    reactivateSubscription,
    openBillingPortal,
  } = useSubscription();

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleCancel = async () => {
    setActionLoading('cancel');
    try {
      await cancelSubscription();
    } catch (err) {
      // Error handled in hook
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivate = async () => {
    setActionLoading('reactivate');
    try {
      await reactivateSubscription();
    } catch (err) {
      // Error handled in hook
    } finally {
      setActionLoading(null);
    }
  };

  const handleBillingPortal = async () => {
    setActionLoading('billing');
    try {
      await openBillingPortal();
    } catch (err) {
      // Error handled in hook
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-gray-600">Loading subscription status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load subscription status: {error}
        </AlertDescription>
      </Alert>
    );
  }

  const getStatusBadge = () => {
    if (isTrialing) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Free Trial</Badge>;
    }
    if (isPaid) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
    }
    return <Badge variant="outline">No Subscription</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      <Card className="border-2 border-blue-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-blue-600" />
              Subscription Status
            </CardTitle>
            {getStatusBadge()}
          </div>
          <CardDescription>
            Manage your subscription and billing preferences
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Trial Status */}
          {isTrialing && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium">Free Trial Active</div>
                <div className="text-sm text-gray-600 mt-1">
                  {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''} remaining until {formatDate(trialEndsAt!)}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Paid Subscription Status */}
          {isPaid && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium">Premium Access Active</div>
                <div className="text-sm text-gray-600 mt-1">
                  You have full access to all premium features
                  {subscription?.cancel_at_period_end && (
                    <span className="text-yellow-600 font-medium"> (Cancels at period end)</span>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* No Access */}
          {!hasAccess && (
            <Alert className="bg-gray-50 border-gray-200">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium">No Active Subscription</div>
                <div className="text-sm text-gray-600 mt-1">
                  Subscribe to access premium features and unlimited practice questions
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Subscription Details */}
          {subscription && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm text-gray-600 capitalize">{status}</p>
                </div>
              </div>
              
              {subscription.current_period_end && (
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Next billing date</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(subscription.current_period_end)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-2">
          {isPaid && (
            <>
              <Button
                variant="outline"
                onClick={handleBillingPortal}
                disabled={actionLoading === 'billing'}
              >
                {actionLoading === 'billing' ? "Loading..." : "Manage Billing"}
              </Button>
              
              {subscription?.cancel_at_period_end ? (
                <Button
                  onClick={handleReactivate}
                  disabled={actionLoading === 'reactivate'}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {actionLoading === 'reactivate' ? "Processing..." : "Reactivate Subscription"}
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={actionLoading === 'cancel'}
                >
                  {actionLoading === 'cancel' ? "Processing..." : "Cancel Subscription"}
                </Button>
              )}
            </>
          )}

          {isTrialing && (
            <Alert className="mt-4">
              <AlertDescription className="text-center">
                <p className="font-medium mb-2">Enjoying your trial?</p>
                <p className="text-sm text-gray-600 mb-3">
                  Subscribe now to continue accessing all premium features after your trial ends.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Subscribe Now
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};