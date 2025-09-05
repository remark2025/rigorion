import { StripePriceManager } from "@/components/payment/StripePriceManager";
import { PaymentDebug } from "@/components/payment/PaymentDebug";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const StripeTest = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Stripe Integration Testing</h1>
          <p className="text-gray-600">
            Manage your Stripe prices and test payment flows
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <StripePriceManager />
          </div>
          
          <div>
            <PaymentDebug />
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Setup Instructions</CardTitle>
                <CardDescription>
                  Steps to complete your Stripe integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <strong>1. Add Stripe Secret Key</strong>
                  <p className="text-gray-600">
                    Go to Supabase Dashboard → Edge Functions → Secrets and add:
                    <code className="bg-gray-100 px-1 rounded">STRIPE_SECRET_KEY</code>
                  </p>
                </div>
                
                <div>
                  <strong>2. Create/List Prices</strong>
                  <p className="text-gray-600">
                    Use the Price Manager to create or list existing prices for your product
                  </p>
                </div>
                
                <div>
                  <strong>3. Test Payments</strong>
                  <p className="text-gray-600">
                    Copy the price IDs and test them using the Payment Debug component
                  </p>
                </div>
                
                <div>
                  <strong>4. Update Code</strong>
                  <p className="text-gray-600">
                    Replace the placeholder price IDs in PaymentModal.tsx with your real ones
                  </p>
                </div>
                
                <div>
                  <strong>5. Setup Webhooks</strong>
                  <p className="text-gray-600">
                    In Stripe Dashboard, add webhook endpoint:<br/>
                    <code className="bg-gray-100 px-1 rounded text-xs">
                      https://your-project.supabase.co/functions/v1/stripe-webhook
                    </code>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripeTest;