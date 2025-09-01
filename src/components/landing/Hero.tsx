import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { FinalPaymentModal } from "@/components/payment/FinalPaymentModal";

export const Hero = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  
  return (
    <section className="relative pt-20 pb-48 overflow-hidden">
      {/* Clean White Overlay */}
      <div className="absolute inset-0 bg-white/40"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Welcome Message */}
          <div className="mb-12 max-w-3xl w-full">
            <p className="text-xl text-gray-700 leading-relaxed mb-8 font-light">
              Master the SAT with our comprehensive preparation platform. 
              Achieve your target score with personalized practice and expert guidance.
            </p>
          </div>
          
          {/* Action button */}
          <div className="flex items-center justify-center mb-8">
            <Button 
              onClick={() => setShowPaymentModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-full shadow-sm"
            >
              Start Now
            </Button>
          </div>
        </div>
      </div>
      
      <FinalPaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)}
        planType="monthly"
        amount="49.99"
      />
      
      {/* Custom CSS for smooth fade animations */}
      <style>{`
        @keyframes fade-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        
        @keyframes fade-out {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 8s ease-in-out forwards;
        }
        
        .animate-fade-out {
          animation: fade-out 8s ease-in-out forwards;
        }
      `}</style>
    </section>
  );
};
