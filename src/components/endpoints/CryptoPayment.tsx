
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const cryptoCurrencies = [
  { value: "BTC", label: "Bitcoin" },
  { value: "ETH", label: "Ethereum" },
  { value: "USDT", label: "Tether" },
  { value: "XRP", label: "XRP" },
  { value: "LTC", label: "Litecoin" },
];

export default function CryptoPayment() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("49.99");
  const [currency, setCurrency] = useState("EUR");
  const [cryptoCurrency, setCryptoCurrency] = useState("BTC");
  
  const handlePayment = async () => {
    if (!session) {
      toast.error("Please sign in to continue with payment");
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-nowpayments', {
        body: {
          priceAmount: parseFloat(amount),
          currency: currency,
          cryptoCurrency: cryptoCurrency,
          successUrl: `${window.location.origin}/payment-success`,
          cancelUrl: `${window.location.origin}/payment`
        },
      });

      if (error) {
        console.error("Crypto payment error:", error);
        toast.error("Failed to create crypto payment session");
        return;
      }
      
      if (data?.url) {
        // Open payment in a new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error("Error creating crypto payment:", error);
      toast.error("Something went wrong with the crypto payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Pay with Cryptocurrency</CardTitle>
        <CardDescription>
          Securely pay using various cryptocurrencies via NOWPayments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="flex">
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="rounded-r-none"
              />
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-20 rounded-l-none border-l-0">
                  <SelectValue placeholder="EUR" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="crypto-currency">Pay with</Label>
            <Select value={cryptoCurrency} onValueChange={setCryptoCurrency}>
              <SelectTrigger id="crypto-currency" className="w-full">
                <SelectValue placeholder="Select cryptocurrency" />
              </SelectTrigger>
              <SelectContent>
                {cryptoCurrencies.map((crypto) => (
                  <SelectItem key={crypto.value} value={crypto.value}>
                    {crypto.label} ({crypto.value})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handlePayment} 
          disabled={loading || !amount || parseFloat(amount) <= 0}
          className="w-full"
        >
          {loading ? "Processing..." : `Pay ${amount} ${currency} with ${cryptoCurrency}`}
        </Button>
      </CardFooter>
    </Card>
  );
}
