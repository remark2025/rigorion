import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const PaymentDebug = () => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [monthlyPriceId, setMonthlyPriceId] = useState('');
  const [yearlyPriceId, setYearlyPriceId] = useState('');

  const testPayment = async (priceId: string, planType: string) => {
    if (!session) {
      toast.error("Please sign in to test payment");
      return;
    }

    if (!priceId) {
      toast.error("Please enter a price ID");
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId: priceId,
          successUrl: `${window.location.origin}/payment-success`,
          cancelUrl: `${window.location.origin}`
        },
      });
      
      if (error) {
        console.error("Payment error:", error);
        toast.error(`Failed to create payment session: ${error.message}`);
        return;
      }
      
      if (data?.url) {
        toast.success("Redirecting to payment...");
        window.open(data.url, '_blank');
      } else {
        toast.error("No payment URL received");
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      toast.error("Something went wrong with the payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Payment Testing</CardTitle>
        <CardDescription>
          Test Stripe subscription payments with your price IDs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="monthly-price">Monthly Price ID</Label>
          <Input
            id="monthly-price"
            placeholder="price_1ABC..."
            value={monthlyPriceId}
            onChange={(e) => setMonthlyPriceId(e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="yearly-price">Yearly Price ID</Label>
          <Input
            id="yearly-price"
            placeholder="price_1XYZ..."
            value={yearlyPriceId}
            onChange={(e) => setYearlyPriceId(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Button
            onClick={() => testPayment(monthlyPriceId, 'monthly')}
            disabled={loading || !monthlyPriceId}
            className="w-full"
            variant="outline"
          >
            {loading ? "Processing..." : "Test Monthly Subscription"}
          </Button>
          
          <Button
            onClick={() => testPayment(yearlyPriceId, 'yearly')}
            disabled={loading || !yearlyPriceId}
            className="w-full"
            variant="outline"
          >
            {loading ? "Processing..." : "Test Yearly Subscription"}
          </Button>
        </div>

        <div className="text-xs text-gray-600 space-y-1">
          <p><strong>Test Cards:</strong></p>
          <p>Visa: 4242 4242 4242 4242</p>
          <p>Mastercard: 5555 5555 5555 4444</p>
          <p>Any future date, any CVC</p>
        </div>
      </CardContent>
    </Card>
  );
};