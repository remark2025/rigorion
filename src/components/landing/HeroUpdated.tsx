import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { FinalPaymentModal } from "@/components/payment/FinalPaymentModal";
import { BookOpen, Timer, Zap, PenTool, Calculator } from 'lucide-react';

export const Hero = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const navigate = useNavigate();
  const rippleButtonRef = useRef<HTMLButtonElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  const handleRippleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = rippleButtonRef.current;
    const message = messageRef.current;
    if (!button || !message) return;

    // Create click ripple effect
    const ripple = document.createElement('span');
    ripple.classList.add('click-ripple');
    
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 800);

    // Show message
    message.classList.remove('show');
    void message.offsetWidth; // Trigger reflow
    message.classList.add('show');

    // Open payment modal after a brief delay
    setTimeout(() => {
      setShowPaymentModal(true);
    }, 600);
  };

  return (
    <section className="relative pt-20 pb-64 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/resources/junior.png)'
        }}
      ></div>
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
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-8 w-full max-w-3xl">
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
            
            {/* AI Writing Button */}
            <Button 
              onClick={() => navigate('/sat-writing-demo')}
              variant="outline"
              className="w-full sm:w-auto px-6 py-4 bg-white/95 text-gray-800 hover:bg-white border-2 border-white/20 hover:border-white transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <PenTool className="mr-2 h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">AI Writing</div>
                <div className="text-sm text-gray-600">Smart essay feedback</div>
              </div>
            </Button>
            
            {/* Reading Assistance Button */}
            <Button 
              onClick={() => navigate('/reading-assistant')}
              variant="outline"
              className="w-full sm:w-auto px-6 py-4 bg-white/95 text-gray-800 hover:bg-white border-2 border-white/20 hover:border-white transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Reading Assistant</div>
                <div className="text-sm text-gray-600">Interactive comprehension</div>
              </div>
            </Button>
            
            {/* Interactive Math Button */}
            <Button 
              onClick={() => navigate('/interactive-math')}
              variant="outline"
              className="w-full sm:w-auto px-6 py-4 bg-white/95 text-gray-800 hover:bg-white border-2 border-white/20 hover:border-white transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Calculator className="mr-2 h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Interactive Math</div>
                <div className="text-sm text-gray-600">Visual math tools</div>
              </div>
            </Button>
            
            {/* SAT Exams Button */}
            <Button 
              onClick={() => navigate('/sat-exams')}
              variant="outline"
              className="w-full sm:w-auto px-6 py-4 bg-white/95 text-gray-800 hover:bg-white border-2 border-white/20 hover:border-white transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Timer className="mr-2 h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">SAT Exams</div>
                <div className="text-sm text-gray-600">Official practice tests</div>
              </div>
            </Button>
            
            {/* Premium Rippling Button */}
            <div className="relative button-container">
              {/* Click Message */}
              <div 
                ref={messageRef}
                className="click-message absolute -top-12 left-1/2 transform -translate-x-1/2 text-orange-500 text-lg font-bold opacity-0 pointer-events-none whitespace-nowrap"
                style={{
                  textShadow: '0 0 10px rgba(255, 136, 0, 0.5)'
                }}
              >
                Premium Unlocked! ⚡
              </div>
              
              {/* Glow Effect */}
              <div className="glow absolute -inset-1 rounded-full z-0 blur-md opacity-60"
                style={{
                  background: 'linear-gradient(135deg, #c0c0c0, #ff8800, #c0c0c0)',
                  backgroundSize: '200% 200%',
                  animation: 'glowPulse 4s ease-in-out infinite'
                }}
              ></div>
              
              {/* Main Button */}
              <button
                ref={rippleButtonRef}
                onClick={handleRippleClick}
                className="ripple-button relative w-full sm:w-auto px-6 py-4 font-bold border-2 border-black rounded-full cursor-pointer uppercase tracking-widest shadow-lg transition-all duration-400 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #c0c0c0 0%, #ff8800 50%, #c0c0c0 100%)',
                  backgroundSize: '200% 200%',
                  animation: 'gentleRipple 4s ease-in-out infinite',
                  color: '#000000',
                  fontSize: '16px',
                  boxShadow: '0 10px 30px rgba(255, 136, 0, 0.3)'
                }}
              >
                <div className="flex items-center relative z-10">
                  <Zap className="mr-2 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">
                      <span className="shimmer-text">Go Premium</span>
                    </div>
                    <div className="text-sm opacity-90">
                      <span className="shimmer-text">Unlock everything</span>
                    </div>
                  </div>
                </div>
              </button>
            </div>
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
        
        /* Gentle ripple background animation */
        @keyframes gentleRipple {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        /* Pulse ripple effect */
        @keyframes pulseRipple {
          0% {
            width: 0;
            height: 0;
            opacity: 0.8;
          }
          50% {
            width: 300px;
            height: 300px;
            opacity: 0.4;
          }
          100% {
            width: 400px;
            height: 400px;
            opacity: 0;
          }
        }

        /* Click ripple effect */
        .click-ripple {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 136, 0, 0.6) 0%, rgba(192, 192, 192, 0.4) 50%, transparent 70%);
          transform: scale(0);
          animation: clickRippleAnimation 0.8s ease-out;
          pointer-events: none;
        }

        @keyframes clickRippleAnimation {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }

        /* Shimmer text effect */
        .shimmer-text {
          position: relative;
          background: linear-gradient(90deg, #000000 0%, #ff8800 50%, #c0c0c0 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s ease-in-out infinite;
        }

        @keyframes shimmer {
          0%, 100% {
            background-position: 0% center;
          }
          50% {
            background-position: 200% center;
          }
        }

        /* Click message animation */
        .click-message.show {
          animation: fadeInOut 1.2s ease-out;
        }

        @keyframes fadeInOut {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(0);
          }
          30% {
            opacity: 1;
            transform: translateX(-50%) translateY(-10px);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-25px);
          }
        }

        /* Glow effect */
        @keyframes glowPulse {
          0%, 100% {
            opacity: 0.4;
            background-position: 0% 50%;
          }
          50% {
            opacity: 0.7;
            background-position: 100% 50%;
          }
        }

        /* Button pseudo-elements for ripple effects */
        .ripple-button::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 136, 0, 0.3) 0%, transparent 70%);
          transform: translate(-50%, -50%);
          animation: pulseRipple 3s ease-out infinite;
        }

        .ripple-button::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(192, 192, 192, 0.3) 0%, transparent 70%);
          transform: translate(-50%, -50%);
          animation: pulseRipple 3s ease-out infinite 1.5s;
        }

        .ripple-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(255, 136, 0, 0.5);
          background: linear-gradient(135deg, #ff8800 0%, #c0c0c0 50%, #ff8800 100%) !important;
        }

        .ripple-button:active {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(255, 136, 0, 0.4);
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
    </section>
  );
};