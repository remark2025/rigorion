import { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Calendar, AlertTriangle, CheckCircle, Clock, Crown } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export const SubscriptionStatus = () => {
  const {
    hasAccess,
    isPaid,
    accessLevel,
    status,
    subscription,
    loading,
    error,
    cancelSubscription,
    reactivateSubscription,
    openBillingPortal,
  } = useSubscription();

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const navigate = useNavigate();

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
    if (isPaid) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Premium Active</Badge>;
    }
    return <Badge variant="outline" className="bg-blue-100 text-blue-800">
      {accessLevel?.charAt(0).toUpperCase() + accessLevel?.slice(1)} Version
    </Badge>;
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
          {/* Current Plan Status */}
          {accessLevel === 'free' && (
            <Alert className="bg-blue-50 border-blue-200">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <div className="font-medium">{accessLevel?.charAt(0).toUpperCase() + accessLevel?.slice(1)} Version Active</div>
                <div className="text-sm text-gray-600 mt-1">
                  You have access to limited practice questions and basic features. Upgrade to Premium for unlimited access and advanced features.
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
                  <p className="text-sm font-medium">Plan</p>
                  <p className="text-sm text-gray-600 capitalize">
                    {accessLevel} {accessLevel !== 'free' ? 'Plan' : 'Version'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm text-gray-600 capitalize">{status}</p>
                </div>
              </div>
              
              {(isPaid || accessLevel === 'premium') && subscription.current_period_end && (
                <>
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Next Payment</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(subscription.current_period_end)}
                      </p>
                    </div>
                  </div>
                  
                  {subscription.cancel_at_period_end && (
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <div>
                        <p className="text-sm font-medium text-yellow-700">Cancellation</p>
                        <p className="text-sm text-yellow-600">
                          Ends {formatDate(subscription.current_period_end)}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {accessLevel === 'free' && (
                <div className="flex items-center gap-3">
                  <Crown className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Upgrade Benefits</p>
                    <p className="text-sm text-gray-600">Unlimited access & features</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          {(isPaid || accessLevel === 'premium') && (
            <div className="w-full space-y-2">
              {/* Main buttons row */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleBillingPortal}
                  disabled={actionLoading === 'billing'}
                  className="flex-1"
                >
                  {actionLoading === 'billing' ? "Loading..." : "Manage Billing"}
                </Button>
                
                {subscription?.cancel_at_period_end ? (
                  <Button
                    onClick={handleReactivate}
                    disabled={actionLoading === 'reactivate'}
                    className="bg-green-600 hover:bg-green-700 flex-1"
                  >
                    {actionLoading === 'reactivate' ? "Processing..." : "Reactivate Subscription"}
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={handleCancel}
                    disabled={actionLoading === 'cancel'}
                    className="flex-1"
                  >
                    {actionLoading === 'cancel' ? "Processing..." : "Unsubscribe"}
                  </Button>
                )}
              </div>
              
              {/* Warning for unsubscribe */}
              {!subscription?.cancel_at_period_end && (
                <div className="text-xs text-gray-500 text-center">
                  Unsubscribe will cancel at the end of your billing period
                </div>
              )}
            </div>
          )}

          {accessLevel === 'free' && (
            <Alert className="mt-4">
              <AlertDescription className="text-center">
                <p className="font-medium mb-2">Upgrade to Premium</p>
                <p className="text-sm text-gray-600 mb-3">
                  Get unlimited practice questions, detailed analytics, and advanced features.
                </p>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => window.open('https://buy.stripe.com/test_3cI5kFak1gaN6zo3e0gIo00', '_blank')}
                >
                  Upgrade Now
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};