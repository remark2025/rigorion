import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubscriptionStatus {
  hasAccess: boolean;
  isPaid: boolean;
  accessLevel: 'free' | 'paid';
  status: string;
  subscription?: any;
}

export const useSubscription = () => {
  const { session } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    hasAccess: false,
    isPaid: false,
    accessLevel: 'free',
    status: 'free'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSubscription = async () => {
    if (!session) {
      setSubscriptionStatus({
        hasAccess: false,
        isPaid: false,
        accessLevel: 'free',
        status: 'free'
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
        isPaid: data.access_level === 'paid',
        accessLevel: data.access_level,
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
      if (!session?.user?.id) {
        toast.error('User not authenticated');
        throw new Error('No user found');
      }

      // Use RPC function to cancel subscription
      const { data, error } = await supabase.rpc('cancel_user_subscription', {
        user_uuid: session.user.id
      });

      if (error) {
        console.error('Cancel subscription error:', error);
        toast.error('Failed to cancel subscription');
        throw error;
      }

      toast.success('Subscription cancelled successfully. You will retain access until the end of your billing period.');
      await checkSubscription(); // Refresh status
      return data;
    } catch (err) {
      console.error('Cancel subscription error:', err);
      throw err;
    }
  };

  const reactivateSubscription = async () => {
    try {
      if (!session?.user?.id) {
        toast.error('User not authenticated');
        throw new Error('No user found');
      }

      // Use RPC function to reactivate subscription
      const { data, error } = await supabase.rpc('reactivate_user_subscription', {
        user_uuid: session.user.id
      });

      if (error) {
        console.error('Reactivate subscription error:', error);
        toast.error('Failed to reactivate subscription');
        throw error;
      }

      toast.success('Subscription reactivated successfully!');
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