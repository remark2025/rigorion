import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreditCard, Shield, Check, ArrowRight, Quote } from "lucide-react";

interface FinalPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planType?: 'monthly' | 'yearly';
  amount?: string;
}

export const FinalPaymentModal = ({ isOpen, onClose, planType = 'monthly', amount = '49.99' }: FinalPaymentModalProps) => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleStripePayment = async () => {
    try {
      setLoading(true);
      
      // First, ensure customer exists in our database
      if (session?.user) {
        try {
          const { data, error } = await supabase.functions.invoke('create-customer', {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            }
          });
          
          if (error) {
            console.warn("Customer creation error:", error);
          } else {
            console.log("Customer creation success:", data);
          }
        } catch (error) {
          console.warn("Customer creation warning:", error);
          // Continue with payment even if customer creation fails
        }
      }
      
      // Use Stripe payment link directly
      const paymentUrl = "https://buy.stripe.com/test_3cI5kFak1gaN6zo3e0gIo00";
      
      // Add customer email as prefill if available and user is signed in
      const customerEmail = session?.user?.email;
      const urlWithParams = customerEmail 
        ? `${paymentUrl}?prefilled_email=${encodeURIComponent(customerEmail)}`
        : paymentUrl;
      
      // Open payment link in new tab
      const newWindow = window.open(urlWithParams, '_blank');
      
      // Check if popup was blocked
      if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
        toast.error("Popup blocked! Please allow popups and try again.");
        return;
      }
      
      onClose();
      toast.success("Redirecting to secure payment...");
      
    } catch (error) {
      console.error("Error opening payment:", error);
      toast.error("Something went wrong with the payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gray-800 border border-gray-600 shadow-lg">
        <DialogHeader className="text-center pb-2">
          <DialogTitle className="text-xl font-bold text-gray-100 mb-1">
            Upgrade to Premium
          </DialogTitle>
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-gray-300">Secured by Stripe</span>
          </div>
        </DialogHeader>

        {/* Plan Summary */}
        <div className="bg-gray-700 rounded-lg p-4 mb-4 border border-gray-600">
          <div className="text-center mb-3">
            <div className="text-3xl font-bold text-gray-100 mb-1">${amount}</div>
            <div className="text-sm font-medium text-gray-200">
              {planType === 'yearly' ? 'Annual Plan' : 'Monthly Plan'}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Cancel anytime • 30-day guarantee
            </div>
          </div>
          
          {/* Features */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-orange-500" />
              <span className="text-gray-200">Unlimited practice questions</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-orange-500" />
              <span className="text-gray-200">AI-powered analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-orange-500" />
              <span className="text-gray-200">Personalized recommendations</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-orange-500" />
              <span className="text-gray-200">Priority support</span>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <Button 
          onClick={handleStripePayment}
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-lg"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span>Subscribe Now</span>
            </div>
          )}
        </Button>

        {/* Security & Trust */}
        <div className="mt-3 pt-3 border-t border-gray-600">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-orange-500" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-3 w-3 text-orange-500" />
              <span>30-Day Guarantee</span>
            </div>
            <div className="flex items-center gap-1">
              <CreditCard className="h-3 w-3 text-orange-500" />
              <span>Safe Checkout</span>
            </div>
          </div>
        </div>

        {/* User Info */}
        {session?.user?.email && (
          <div className="text-center text-xs text-gray-400 mt-2">
            Subscribing as: <span className="font-medium text-gray-200">{session.user.email}</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};