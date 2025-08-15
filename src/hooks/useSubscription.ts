import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubscriptionStatus {
  hasAccess: boolean;
  isTrialing: boolean;
  isPaid: boolean;
  trialEndsAt?: string;
  trialDaysRemaining?: number;
  status: string;
  subscription?: any;
}

export const useSubscription = () => {
  const { session } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    hasAccess: false,
    isTrialing: false,
    isPaid: false,
    status: 'none'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSubscription = async () => {
    if (!session) {
      setSubscriptionStatus({
        hasAccess: false,
        isTrialing: false,
        isPaid: false,
        status: 'none'
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-subscription-status');

      if (error) {
        console.error('Subscription check error:', error);
        setError(error.message);
        return;
      }

      setSubscriptionStatus({
        hasAccess: data.has_premium_access,
        isTrialing: data.is_trialing,
        isPaid: data.status === 'active' && !data.is_trialing,
        trialEndsAt: data.trial_ends_at,
        trialDaysRemaining: data.trial_days_remaining,
        status: data.status,
        subscription: data
      });
      setError(null);
    } catch (err) {
      console.error('Subscription check failed:', err);
      setError('Failed to check subscription status');
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-billing', {
        body: { action: 'cancel_subscription' }
      });

      if (error) {
        toast.error('Failed to cancel subscription');
        throw error;
      }

      toast.success(data.message);
      await checkSubscription(); // Refresh status
      return data;
    } catch (err) {
      console.error('Cancel subscription error:', err);
      throw err;
    }
  };

  const reactivateSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-billing', {
        body: { action: 'reactivate_subscription' }
      });

      if (error) {
        toast.error('Failed to reactivate subscription');
        throw error;
      }

      toast.success(data.message);
      await checkSubscription(); // Refresh status
      return data;
    } catch (err) {
      console.error('Reactivate subscription error:', err);
      throw err;
    }
  };

  const openBillingPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        body: { return_url: window.location.origin + '/account' }
      });

      if (error) {
        toast.error('Failed to open billing portal');
        throw error;
      }

      window.open(data.url, '_blank');
    } catch (err) {
      console.error('Billing portal error:', err);
      throw err;
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [session]);

  return {
    ...subscriptionStatus,
    loading,
    error,
    checkSubscription,
    cancelSubscription,
    reactivateSubscription,
    openBillingPortal,
  };
};