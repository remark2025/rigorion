import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "sonner";
import { CreditCard, Shield, Lock, Check, ArrowRight } from "lucide-react";

interface SimplePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planType?: 'monthly' | 'yearly';
  amount?: string;
}

export const SimplePaymentModal = ({ isOpen, onClose, planType = 'monthly', amount = '49.99' }: SimplePaymentModalProps) => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleStripePayment = async () => {
    console.log("Subscribe button clicked!"); // Debug log
    
    try {
      setLoading(true);
      console.log("Loading state set to true"); // Debug log
      
      // Use Stripe payment link directly
      const paymentUrl = "https://buy.stripe.com/test_3cI5kFak1gaN6zo3e0gIo00";
      
      // Add customer email as prefill if available and user is signed in
      const customerEmail = session?.user?.email;
      console.log("Customer email:", customerEmail); // Debug log
      
      const urlWithParams = customerEmail 
        ? `${paymentUrl}?prefilled_email=${encodeURIComponent(customerEmail)}`
        : paymentUrl;
      
      console.log("Opening URL:", urlWithParams); // Debug log
      
      // Open payment link in new tab
      const newWindow = window.open(urlWithParams, '_blank');
      
      // Check if popup was blocked
      if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
        console.log("Popup was blocked"); // Debug log
        toast.error("Popup blocked! Please allow popups and try again.");
        return;
      }
      
      console.log("Payment window opened successfully"); // Debug log
      onClose();
      toast.success("Redirecting to Stripe payment...");
      
    } catch (error) {
      console.error("Error opening payment:", error);
      toast.error("Something went wrong with the payment");
    } finally {
      setLoading(false);
      console.log("Loading state set to false"); // Debug log
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader className="text-center pb-6">
          <DialogTitle className="text-2xl font-medium text-gray-900">
            Subscribe to Premium
          </DialogTitle>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="text-sm text-gray-600">Powered by</span>
            <div className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium">
              <Shield className="h-3 w-3" />
              <span>Stripe</span>
            </div>
            <span className="text-xs text-gray-500">Secure Payment</span>
          </div>
        </DialogHeader>

        {/* Plan Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">${amount}</div>
            <div className="text-lg font-medium text-gray-800 mb-1">
              {planType === 'yearly' ? 'Annual Subscription' : 'Monthly Subscription'}
            </div>
            <div className="text-sm text-gray-600 mb-4">
              Recurring billing • Cancel anytime
            </div>
            
            {/* Features */}
            <div className="space-y-2 text-sm text-left">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Unlimited practice questions</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Detailed analytics & progress tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>AI-powered explanations</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Priority customer support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <Button 
          onClick={handleStripePayment}
          disabled={loading}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-lg"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscribe Now
              <ArrowRight className="h-4 w-4" />
            </div>
          )}
        </Button>

        {/* Security */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-center mb-3">
            <p className="text-sm text-gray-600 font-medium">Secured by Stripe</p>
            <p className="text-xs text-gray-500">Industry-leading payment security</p>
          </div>
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-green-600" />
              <span>256-bit SSL</span>
            </div>
            <div className="flex items-center gap-1">
              <Lock className="h-3 w-3 text-blue-600" />
              <span>PCI Compliant</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-3 w-3 text-purple-600" />
              <span>Cancel Anytime</span>
            </div>
          </div>
        </div>

        {/* User Info */}
        {session?.user?.email && (
          <div className="text-center text-sm text-gray-600 mt-4">
            Subscribing as: <span className="font-medium">{session.user.email}</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};