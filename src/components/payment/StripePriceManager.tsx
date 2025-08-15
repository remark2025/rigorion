import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Price {
  id: string;
  amount: number;
  currency: string;
  interval: string;
  interval_count: number;
}

export const StripePriceManager = () => {
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState<Price[]>([]);
  const [monthlyAmount, setMonthlyAmount] = useState('49.99');
  const [yearlyAmount, setYearlyAmount] = useState('499.99');
  const productId = 'prod_SsAAlSX01V9Yvh';

  const listExistingPrices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-prices', {
        body: {
          action: 'list_prices',
          productId: productId
        }
      });

      if (error) {
        toast.error(`Error: ${error.message}`);
        return;
      }

      setPrices(data.prices || []);
      toast.success(`Found ${data.prices?.length || 0} existing prices`);
    } catch (error) {
      console.error('Error listing prices:', error);
      toast.error('Failed to list prices');
    } finally {
      setLoading(false);
    }
  };

  const createPrices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-prices', {
        body: {
          action: 'create_prices',
          productId: productId,
          monthlyAmount: parseFloat(monthlyAmount),
          yearlyAmount: parseFloat(yearlyAmount),
          currency: 'usd'
        }
      });

      if (error) {
        toast.error(`Error: ${error.message}`);
        return;
      }

      toast.success('Prices created successfully!');
      console.log('Created prices:', data);
      
      // Show the price IDs to copy
      toast.success(`Monthly: ${data.monthly_price.id}`, { duration: 10000 });
      toast.success(`Yearly: ${data.yearly_price.id}`, { duration: 10000 });
      
      // Refresh the list
      await listExistingPrices();
    } catch (error) {
      console.error('Error creating prices:', error);
      toast.error('Failed to create prices');
    } finally {
      setLoading(false);
    }
  };

  const copyPriceId = (priceId: string) => {
    navigator.clipboard.writeText(priceId);
    toast.success(`Copied: ${priceId}`);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Stripe Price Manager</CardTitle>
          <CardDescription>
            Product ID: {productId}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={listExistingPrices} 
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? "Loading..." : "List Existing Prices"}
          </Button>

          {prices.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Existing Prices:</h3>
              {prices.map((price) => (
                <div 
                  key={price.id} 
                  className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-gray-50"
                  onClick={() => copyPriceId(price.id)}
                >
                  <div>
                    <span className="font-mono text-sm">{price.id}</span>
                    <div className="text-sm text-gray-600">
                      ${(price.amount / 100).toFixed(2)} / {price.interval}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">Click to copy</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create New Prices</CardTitle>
          <CardDescription>
            Create monthly and yearly subscription prices for your product
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="monthly">Monthly Price ($)</Label>
              <Input
                id="monthly"
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(e.target.value)}
                placeholder="49.99"
              />
            </div>
            <div>
              <Label htmlFor="yearly">Yearly Price ($)</Label>
              <Input
                id="yearly"
                value={yearlyAmount}
                onChange={(e) => setYearlyAmount(e.target.value)}
                placeholder="499.99"
              />
            </div>
          </div>

          <Button 
            onClick={createPrices} 
            disabled={loading}
            className="w-full"
          >
            {loading ? "Creating..." : "Create Prices"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};