import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreditCard, Shield, Lock, Check } from "lucide-react";
import CryptoPayment from '@/components/endpoints/CryptoPayment';

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
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId: planType === 'yearly' ? 'price_1QLmVDSKTQLErzjMTOWBVPJF' : 'price_1QLmUWSKTQLErzjMhqVJCQNx',
          successUrl: `${window.location.origin}/payment-success`,
          cancelUrl: `${window.location.origin}`
        },
      });
      
      if (error) {
        console.error("Payment error:", error);
        toast.error("Failed to create payment session");
        return;
      }
      
      if (data?.url) {
        window.open(data.url, '_blank');
        onClose();
      }
    } catch (error) {
      console.error("Error creating payment:", error);
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="text-center pb-6">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Complete Your Subscription
          </DialogTitle>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mt-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span>Secure and encrypted payment</span>
          </div>
        </DialogHeader>

        {/* Plan Summary */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-900">
                {planType === 'yearly' ? 'Annual Plan' : 'Monthly Plan'}
              </h3>
              <p className="text-sm text-gray-600">
                {planType === 'yearly' ? 'Save 20% with yearly billing' : 'Billed monthly'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">${amount}</div>
              <div className="text-sm text-gray-600">
                {planType === 'yearly' ? '/year' : '/month'}
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="cards" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Card
            </TabsTrigger>
            <TabsTrigger value="paypal">PayPal</TabsTrigger>
            <TabsTrigger value="googlepay">Google Pay</TabsTrigger>
            <TabsTrigger value="crypto">Crypto</TabsTrigger>
          </TabsList>

          <TabsContent value="cards" className="space-y-6">
            {/* Existing Cards */}
            {paymentMethods.filter(pm => pm.type === 'card').length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Saved Cards</h3>
                <div className="grid grid-cols-1 gap-4">
                  {paymentMethods.filter(pm => pm.type === 'card').map(card => (
                    <Card key={card.id} className="border-2 hover:border-blue-300 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-5 w-5 text-gray-400" />
                            <div>
                              <div className="font-medium">
                                {card.details.brand} •••• {card.details.last4}
                              </div>
                              <div className="text-sm text-gray-600">
                                Expires {card.details.expiry}
                              </div>
                            </div>
                          </div>
                          <Button onClick={handleStripePayment} disabled={loading}>
                            {loading ? "Processing..." : "Pay Now"}
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
                  <Label htmlFor="card-name">Cardholder Name</Label>
                  <Input
                    id="card-name"
                    placeholder="Enter full name"
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
                    <Label htmlFor="card-expiry">Expiry Date</Label>
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
                className="w-full" 
                onClick={newCard.name && newCard.number && newCard.expiry && newCard.cvc ? handleStripePayment : handleAddCard}
                disabled={loading}
              >
                <Lock className="h-4 w-4 mr-2" />
                {loading ? "Processing..." : `Pay $${amount} Securely`}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="paypal" className="space-y-6">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded text-white text-xs font-bold flex items-center justify-center">
                    PP
                  </div>
                  PayPal
                </CardTitle>
                <CardDescription>
                  Pay securely with your PayPal account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-2xl font-bold">${amount}</div>
                  <p className="text-sm text-gray-600">
                    You'll be redirected to PayPal to complete your payment
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => toast.info("PayPal integration coming soon")}>
                  Continue with PayPal
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="googlepay" className="space-y-6">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <div className="w-8 h-8 bg-red-500 rounded text-white text-xs font-bold flex items-center justify-center">
                    G
                  </div>
                  Google Pay
                </CardTitle>
                <CardDescription>
                  Pay quickly and securely with Google Pay
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-2xl font-bold">${amount}</div>
                  <p className="text-sm text-gray-600">
                    Fast, secure payment with Google Pay
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-gray-900 hover:bg-gray-800" onClick={() => toast.info("Google Pay integration coming soon")}>
                  Pay with Google Pay
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="crypto" className="space-y-6">
            <CryptoPayment />
          </TabsContent>
        </Tabs>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-6 pt-6 border-t text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>SSL Encrypted</span>
          </div>
          <div className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            <span>PCI Compliant</span>
          </div>
          <div className="flex items-center gap-1">
            <Check className="h-3 w-3" />
            <span>30-Day Guarantee</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};