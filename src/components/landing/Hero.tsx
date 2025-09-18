import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { FinalPaymentModal } from "@/components/payment/FinalPaymentModal";

export const Hero = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  
  return (
    <section className="relative pt-20 pb-64 overflow-hidden">
      {/* Charcoal and Silver Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800/60 via-gray-600/40 to-gray-300/30"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Welcome Message */}
          <div className="mb-12 max-w-3xl w-full">
            <p className="text-3xl leading-relaxed mb-8 italic" style={{
              fontFamily: 'Dancing Script, "Caveat", "Patrick Hand", "Architects Daughter", cursive, sans-serif',
              fontWeight: '300',
              letterSpacing: '0.03em'
            }}>
              <span style={{
                background: 'linear-gradient(45deg, #C0C0C0, #E5E5E5, #F5F5F5, #FFFFFF, #F5F5F5, #E5E5E5, #C0C0C0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 10px rgba(255, 255, 255, 0.3), 0 0 20px rgba(192, 192, 192, 0.2)',
                filter: 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.1))'
              }}>
                Stop Searching,
              </span>
              {' '}
              <span style={{
                background: 'linear-gradient(45deg, #FF6B35, #FF8C42, #FFA726, #000000)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 10px rgba(255, 165, 0, 0.3), 0 0 20px rgba(255, 107, 53, 0.2)',
                filter: 'drop-shadow(0 2px 4px rgba(255, 140, 66, 0.1))'
              }}>
                Start Improving
              </span>
            </p>
          </div>
          
          {/* Action button */}
          <div className="flex items-center justify-center mb-8">
            <Button 
              onClick={() => setShowPaymentModal(true)}
              className="text-black font-medium px-8 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 50%, #ffa726 100%)',
                backgroundSize: '200% 200%',
                animation: 'gradientShift 3s ease-in-out infinite'
              }}
            >
              <span className="relative z-10">Start Now</span>
              <div className="absolute inset-0 rounded-full border-2 border-black opacity-70 animate-[borderShimmer_2s_linear_infinite]"></div>
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
        
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        @keyframes borderShimmer {
          0% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.02);
          }
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
        }
      `}</style>
    </section>
  );
};
