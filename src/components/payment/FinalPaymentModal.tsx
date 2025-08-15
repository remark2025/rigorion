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
          await supabase.functions.invoke('create-customer');
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
      <DialogContent className="max-w-lg bg-gradient-to-br from-gray-50 to-white border-2 border-blue-200 shadow-xl">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-800 mb-2">
            Invest in Your Future
          </DialogTitle>
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-gray-600">Secured by Stripe</span>
          </div>
        </DialogHeader>

        {/* Inspiring Quote Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-100">
          <div className="flex items-start gap-3">
            <Quote className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
            <div>
              <blockquote className="text-gray-700 font-medium italic text-lg leading-relaxed mb-3">
                "An investment in knowledge pays the best interest. The more you learn today, the more you earn tomorrow."
              </blockquote>
              <cite className="text-blue-600 text-sm font-semibold">— Benjamin Franklin (adapted)</cite>
            </div>
          </div>
        </div>

        {/* Plan Summary */}
        <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200 shadow-sm">
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-gray-800 mb-2">${amount}</div>
            <div className="text-lg font-semibold text-gray-700 mb-1">
              {planType === 'yearly' ? 'Annual Investment' : 'Monthly Investment'}
            </div>
            <div className="text-sm text-gray-500">
              Cancel anytime • 30-day guarantee
            </div>
          </div>
          
          {/* Features */}
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                <Check className="h-3 w-3 text-blue-600" />
              </div>
              <span className="text-gray-700">Unlimited practice questions & explanations</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                <Check className="h-3 w-3 text-blue-600" />
              </div>
              <span className="text-gray-700">AI-powered performance analytics</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                <Check className="h-3 w-3 text-blue-600" />
              </div>
              <span className="text-gray-700">Personalized study recommendations</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                <Check className="h-3 w-3 text-blue-600" />
              </div>
              <span className="text-gray-700">Priority support & score improvement guarantee</span>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <Button 
          onClick={handleStripePayment}
          disabled={loading}
          className="w-full h-14 bg-white hover:bg-gray-50 border-2 border-blue-300 hover:border-blue-400 text-blue-600 hover:text-blue-700 font-semibold text-lg transition-all duration-200 shadow-sm hover:shadow-md"
        >
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5" />
              <span>Start My Investment Journey</span>
              <ArrowRight className="h-5 w-5" />
            </div>
          )}
        </Button>

        {/* Security & Trust */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-green-500" />
              <span>Bank-level Security</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-3 w-3 text-blue-500" />
              <span>30-Day Guarantee</span>
            </div>
            <div className="flex items-center gap-1">
              <CreditCard className="h-3 w-3 text-purple-500" />
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>

        {/* User Info */}
        {session?.user?.email && (
          <div className="text-center text-sm text-gray-600 mt-4 bg-gray-50 rounded-lg py-2 px-4">
            Investing as: <span className="font-medium text-blue-600">{session.user.email}</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};