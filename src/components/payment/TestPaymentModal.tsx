import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TestPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestPaymentModal = ({ isOpen, onClose }: TestPaymentModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleTestClick = () => {
    console.log("TEST: Button clicked!");
    alert("Test button clicked! Check console for logs.");
    
    setLoading(true);
    console.log("TEST: Loading set to true");
    
    // Test the Stripe URL directly
    const testUrl = "https://buy.stripe.com/test_3cI5kFak1gaN6zo3e0gIo00";
    console.log("TEST: Opening URL:", testUrl);
    
    try {
      const newWindow = window.open(testUrl, '_blank');
      console.log("TEST: Window object:", newWindow);
      
      if (newWindow) {
        console.log("TEST: Window opened successfully");
        toast.success("Payment window opened!");
      } else {
        console.log("TEST: Window was blocked");
        toast.error("Popup blocked!");
      }
    } catch (error) {
      console.error("TEST: Error opening window:", error);
      toast.error("Error opening payment window");
    }
    
    setTimeout(() => {
      setLoading(false);
      console.log("TEST: Loading set to false");
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader className="text-center pb-6">
          <DialogTitle className="text-2xl font-medium text-gray-900">
            Test Payment Modal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-center text-gray-600">
            This is a test modal to debug the payment button issue.
          </p>
          
          <Button 
            onClick={handleTestClick}
            disabled={loading}
            className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium"
          >
            {loading ? "Testing..." : "Test Payment Button"}
          </Button>
          
          <Button 
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};