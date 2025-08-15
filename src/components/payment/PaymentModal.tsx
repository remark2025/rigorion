import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreditCard, Shield, Lock, Check, Star, Trophy, Zap, Sparkles, ArrowRight, CheckCircle } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planType?: 'monthly' | 'yearly';
  amount?: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'googlepay';
  details: any;
}

export const PaymentModal = ({ isOpen, onClose, planType = 'monthly', amount = '49.99' }: PaymentModalProps) => {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState("cards");
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: 'card-1', type: 'card', details: { last4: '4242', expiry: '12/24', brand: 'Visa' } },
  ]);
  const [newCard, setNewCard] = useState({ number: '', expiry: '', cvc: '', name: '' });
  const [saveCard, setSaveCard] = useState(false);

  const handleStripePayment = async () => {
    if (!session) {
      toast.error("Please sign in to continue with payment");
      return;
    }
    
    try {
      setLoading(true);
      
      // Use Stripe payment link directly
      const paymentUrl = "https://buy.stripe.com/test_3cI5kFak1gaN6zo3e0gIo00";
      
      // Add customer email as prefill if available
      const customerEmail = session.user?.email;
      const urlWithParams = customerEmail 
        ? `${paymentUrl}?prefilled_email=${encodeURIComponent(customerEmail)}`
        : paymentUrl;
      
      // Open payment link in new tab
      window.open(urlWithParams, '_blank');
      onClose();
      
      toast.success("Redirecting to payment...");
    } catch (error) {
      console.error("Error opening payment:", error);
      toast.error("Something went wrong with the payment");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = () => {
    if (newCard.number.length < 13 || !newCard.expiry || newCard.cvc.length < 3 || !newCard.name) {
      toast.error("Please enter valid card details");
      return;
    }
    
    const newCardDetails = {
      id: `card-${paymentMethods.length + 1}`,
      type: 'card' as const,
      details: {
        last4: newCard.number.slice(-4),
        expiry: newCard.expiry,
        brand: detectCardBrand(newCard.number),
        name: newCard.name
      }
    };
    
    setPaymentMethods([...paymentMethods, newCardDetails]);
    setNewCard({ number: '', expiry: '', cvc: '', name: '' });
    toast.success("Card added successfully");
  };
  
  const detectCardBrand = (number: string): string => {
    if (number.startsWith('4')) return 'Visa';
    if (['51', '52', '53', '54', '55'].includes(number.substring(0, 2))) return 'MasterCard';
    if (['34', '37'].includes(number.substring(0, 2))) return 'American Express';
    return 'Card';
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
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
            <span className="text-xs text-gray-500">Official Payment Partner</span>
          </div>
        </DialogHeader>

        {/* Plan Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-gray-900">
                {planType === 'yearly' ? 'Annual Subscription' : 'Monthly Subscription'}
              </h3>
              <p className="text-sm text-gray-600">Recurring billing • Cancel anytime</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-medium text-gray-900">${amount}</div>
              <div className="text-sm text-gray-500">
                {planType === 'yearly' ? '/year' : '/month'}
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1 mb-6">
            <TabsTrigger value="cards" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Credit Card
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cards" className="space-y-6">
            {/* Existing Cards */}
            {paymentMethods.filter(pm => pm.type === 'card').length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Saved Cards</h3>
                <div className="grid grid-cols-1 gap-4">
                  {paymentMethods.filter(pm => pm.type === 'card').map(card => (
                    <Card key={card.id} className="border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-5 w-5 text-gray-400" />
                            <div>
                              <div className="font-medium text-gray-900">
                                {card.details.brand} •••• {card.details.last4}
                              </div>
                              <div className="text-sm text-gray-500">
                                Expires {card.details.expiry}
                              </div>
                            </div>
                          </div>
                          <Button 
                            onClick={handleStripePayment} 
                            disabled={loading}
                            className="bg-gray-900 hover:bg-gray-800 text-white"
                          >
                            {loading ? "Processing..." : "Subscribe Now"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Card */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">
                {paymentMethods.filter(pm => pm.type === 'card').length > 0 ? 'Add New Card' : 'Card Details'}
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="card-name">Name</Label>
                  <Input
                    id="card-name"
                    placeholder="Full name"
                    value={newCard.name}
                    onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input
                    id="card-number"
                    placeholder="1234 5678 9012 3456"
                    value={newCard.number}
                    onChange={(e) => setNewCard({ ...newCard, number: formatCardNumber(e.target.value) })}
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="card-expiry">Expiry</Label>
                    <Input
                      id="card-expiry"
                      placeholder="MM/YY"
                      value={newCard.expiry}
                      onChange={(e) => setNewCard({ ...newCard, expiry: formatExpiry(e.target.value) })}
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="card-cvc">CVC</Label>
                    <Input
                      id="card-cvc"
                      placeholder="123"
                      value={newCard.cvc}
                      onChange={(e) => setNewCard({ ...newCard, cvc: e.target.value.replace(/\D/g, '') })}
                      maxLength={4}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="save-card" 
                    checked={saveCard} 
                    onCheckedChange={(checked) => setSaveCard(checked === true)}
                  />
                  <Label htmlFor="save-card" className="text-sm">
                    Save this card for future payments
                  </Label>
                </div>
              </div>
              <Button 
                className="w-full bg-gray-900 hover:bg-gray-800 text-white" 
                onClick={newCard.name && newCard.number && newCard.expiry && newCard.cvc ? handleStripePayment : handleAddCard}
                disabled={loading}
              >
                {loading ? "Processing..." : `Subscribe for $${amount}/${planType === 'yearly' ? 'year' : 'month'}`}
              </Button>
            </div>
          </TabsContent>

        </Tabs>

        {/* Security */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-center mb-3">
            <p className="text-sm text-gray-600 font-medium">Secured by Stripe</p>
            <p className="text-xs text-gray-500">Trusted by millions of businesses worldwide</p>
          </div>
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-green-600" />
              <span>Bank-level Security</span>
            </div>
            <div className="flex items-center gap-1">
              <Lock className="h-3 w-3 text-blue-600" />
              <span>PCI DSS Level 1</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-3 w-3 text-purple-600" />
              <span>30-Day Guarantee</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};