import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { FinalPaymentModal } from "@/components/payment/FinalPaymentModal";
import { BookOpen, Timer, Zap } from 'lucide-react';

export const Hero = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const navigate = useNavigate();

  return (
    <section className="relative pt-20 pb-64 overflow-hidden">
      {/* Charcoal and Silver Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800/60 via-gray-600/40 to-gray-300/30"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Welcome Message */}
          <div className="mb-12 max-w-3xl w-full">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Master the SAT with
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                Interactive Learning
              </span>
            </h1>
            <p className="text-xl text-gray-200 leading-relaxed mb-8 font-light">
              Experience step-by-step math solutions, multi-perspective reading analysis, 
              and comprehensive practice tests. Achieve your target score with personalized guidance.
            </p>
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-8 w-full max-w-2xl">
            {/* Practice Questions Button */}
            <Button 
              onClick={() => navigate('/practice')}
              variant="outline" 
              className="w-full sm:w-auto px-6 py-4 bg-white/95 text-gray-800 hover:bg-white border-2 border-white/20 hover:border-white transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Practice Questions</div>
                <div className="text-sm text-gray-600">Step-by-step solutions</div>
              </div>
            </Button>
            
            {/* Mock Test Button */}
            <Button 
              onClick={() => navigate('/mock-test')}
              variant="outline"
              className="w-full sm:w-auto px-6 py-4 bg-white/95 text-gray-800 hover:bg-white border-2 border-white/20 hover:border-white transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Timer className="mr-2 h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Mock Test</div>
                <div className="text-sm text-gray-600">Timed practice exam</div>
              </div>
            </Button>
            
            {/* Premium Button */}
            <Button 
              onClick={() => setShowPaymentModal(true)}
              className="w-full sm:w-auto px-6 py-4 text-white font-semibold border-2 border-transparent transform hover:scale-105 transition-all duration-300 shadow-lg relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 50%, #ffa726 100%)',
                backgroundSize: '200% 200%',
                animation: 'gradientShift 3s ease-in-out infinite'
              }}
            >
              <Zap className="mr-2 h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Go Premium</div>
                <div className="text-sm opacity-90">Unlock everything</div>
              </div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700"></div>
            </Button>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="text-orange-400 text-2xl mb-2">📊</div>
              <h3 className="text-white font-semibold mb-2">Interactive Step Builders</h3>
              <p className="text-gray-300 text-sm">Learn math with guided, step-by-step solutions</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="text-orange-400 text-2xl mb-2">📖</div>
              <h3 className="text-white font-semibold mb-2">Multi-Perspective Reading</h3>
              <p className="text-gray-300 text-sm">Analyze passages from multiple viewpoints</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="text-orange-400 text-2xl mb-2">⏱️</div>
              <h3 className="text-white font-semibold mb-2">Real SAT Experience</h3>
              <p className="text-gray-300 text-sm">Timed tests with authentic question formats</p>
            </div>
          </div>
        </div>
      </div>
      
      <FinalPaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)}
        planType="monthly"
        amount="49.99"
      />
      
      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
    </section>
  );
};