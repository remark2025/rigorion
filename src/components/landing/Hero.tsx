import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { PaymentModal } from "@/components/payment/PaymentModal";

export const Hero = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Array of background images to cycle through (using all available images in resources)
  const backgroundImages = [
    '/resources/4k-white-two-skyscrapers-j25128ysdyqlmeo6.jpg',
    '/resources/corner-building-for-4k-white-background-tsx7c82luhg36ygy.jpg',
    '/resources/white-abstract-fading-horse-os2b11l2drnjvlqz.jpg'
  ];

  // Cycle through images every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % backgroundImages.length
      );
    }, 30000); // Change image every 30 seconds

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  
  return (
    <section className="relative pt-16 pb-32 overflow-hidden">
      {/* Animated Background Images with Fade Effect */}
      {backgroundImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50 animate-fade-in-out ${
            index === currentImageIndex ? 'animate-fade-in' : 'animate-fade-out'
          }`}
          style={{
            backgroundImage: `url('${image}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            animationDuration: '8s',
            animationFillMode: 'forwards'
          }}
        />
      ))}
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-white/70"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Welcome Message */}
          <div className="mb-12 max-w-3xl w-full">
            <h1 className="text-6xl font-bold text-gray-900 mb-6">
              SAT Premium
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed mb-8">
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
      
      <PaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)}
        planType="monthly"
        amount="49.99"
      />
      
      {/* Custom CSS for smooth fade animations */}
      <style jsx>{`
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
