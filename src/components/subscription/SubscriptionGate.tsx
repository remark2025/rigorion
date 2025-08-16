import { ReactNode } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FinalPaymentModal } from '@/components/payment/FinalPaymentModal';
import { useState } from 'react';
import { Crown, Lock, Sparkles, Clock } from "lucide-react";

interface SubscriptionGateProps {
  children: ReactNode;
  feature?: string;
  fallback?: ReactNode;
}

export const SubscriptionGate = ({ children, feature, fallback }: SubscriptionGateProps) => {
  const { hasAccess, isPaid, accessLevel, loading } = useSubscription();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Checking access...</span>
      </div>
    );
  }

  // User has premium access - show content
  if (hasAccess && isPaid) {
    return <>{children}</>;
  }

  // Custom fallback provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default premium feature gate
  return (
    <div className="p-8">
      <Card className="max-w-md mx-auto border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Crown className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-xl text-gray-800">
            Premium Feature
          </CardTitle>
          <CardDescription className="text-gray-600">
            {feature ? `${feature} requires` : 'This feature requires'} a premium subscription
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span>Unlimited practice questions</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span>AI-powered explanations</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span>Detailed progress analytics</span>
            </div>
          </div>
          
          <div className="pt-4">
            <Button 
              onClick={() => setShowPaymentModal(true)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Instant access to all features
            </p>
          </div>
        </CardContent>
      </Card>
      
      <FinalPaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        planType="monthly"
        amount="49.99"
      />
    </div>
  );
};