
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import confetti from 'canvas-confetti';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  // Trigger confetti effect when the component mounts
  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    
    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };
    
    const confettiInterval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      
      if (timeLeft <= 0) {
        return clearInterval(confettiInterval);
      }
      
      const particleCount = 50 * (timeLeft / duration);
      
      // since particles fall down, start a bit higher than random
      confetti({
        particleCount,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
      });
    }, 250);
    
    return () => clearInterval(confettiInterval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="p-8 bg-white rounded-xl shadow-xl max-w-lg w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle size={50} className="text-green-500" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. Your module access has been activated.
        </p>
        
        <div className="space-y-6 mb-8">
          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
            <h3 className="font-medium text-green-800 mb-2">Order Summary</h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Module</span>
              <span className="font-medium">Introduction to Calculus</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-600">Date</span>
              <span className="font-medium">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-left">
            <h3 className="font-medium text-blue-800 mb-2">What's Next?</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <div className="bg-blue-100 p-1 rounded-full mr-2 mt-0.5">
                  <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Access your module from your dashboard</span>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-100 p-1 rounded-full mr-2 mt-0.5">
                  <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Complete your first chapter to track progress</span>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-100 p-1 rounded-full mr-2 mt-0.5">
                  <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Explore practice questions and solutions</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => navigate('/practice')} 
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex-1"
          >
            Go to Module
            <ArrowRight size={16} className="ml-2" />
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/')} 
            className="flex-1"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
