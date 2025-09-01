
import React, { useState, useEffect } from 'react';
import { Calculator, Brain, Timer, Shield, BarChart3, Users, Target, Gamepad2, Settings, CheckCircle, TrendingUp, Zap } from 'lucide-react';
import { FinalPaymentModal } from '@/components/payment/FinalPaymentModal';

type FeatureType = {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  image: string;
};

const FEATURES: FeatureType[] = [
  {
    id: 1,
    title: "Most Comprehensive SAT Coverage",
    description: "5000+ Solved problems across all SAT sections with detailed explanations",
    icon: <Calculator className="h-8 w-8" />,
    image: "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=300&h=200&fit=crop"
  },
  {
    id: 2,
    title: "AI-Trained SAT Writing Examiner",
    description: "Advanced AI that evaluates and provides feedback on your writing like a real examiner",
    icon: <Brain className="h-8 w-8" />,
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300&h=200&fit=crop"
  },
  {
    id: 3,
    title: "5 Modes of Practice",
    description: "Timer, Level-based, Manual, Pomodoro, and Exam modes for every learning style",
    icon: <Timer className="h-8 w-8" />,
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&h=200&fit=crop"
  },
  {
    id: 4,
    title: "Military-Grade Security",
    description: "End-to-end encryption with secure offline access and data integrity protection",
    icon: <Shield className="h-8 w-8" />,
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=300&h=200&fit=crop"
  },
  {
    id: 5,
    title: "Advanced Analytics Dashboard",
    description: "Comprehensive performance tracking with 15+ metrics and visual progress charts",
    icon: <BarChart3 className="h-8 w-8" />,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop"
  },
  {
    id: 6,
    title: "Global Leaderboard System",
    description: "Compete with 5000+ students worldwide with weekly and monthly rankings",
    icon: <Users className="h-8 w-8" />,
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&h=200&fit=crop"
  },
  {
    id: 7,
    title: "Intelligent Goal Setting",
    description: "AI-powered objective tracking with personalized targets and achievement notifications",
    icon: <Target className="h-8 w-8" />,
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=300&h=200&fit=crop"
  },
  {
    id: 8,
    title: "Gamified Learning Experience",
    description: "Streak tracking, achievements, and rewards system to keep you motivated",
    icon: <Gamepad2 className="h-8 w-8" />,
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&h=200&fit=crop"
  },
  {
    id: 9,
    title: "Advanced Customization",
    description: "9+ font options, dynamic sizing, color schemes, and personalized themes",
    icon: <Settings className="h-8 w-8" />,
    image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=300&h=200&fit=crop"
  },
  {
    id: 10,
    title: "12 Full-Length Mock Tests",
    description: "Complete SAT simulations with realistic timing and comprehensive scoring",
    icon: <CheckCircle className="h-8 w-8" />,
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&h=200&fit=crop"
  },
  {
    id: 11,
    title: "Real-Time Performance Insights",
    description: "Instant feedback with chapter-wise analysis and difficulty-based statistics",
    icon: <TrendingUp className="h-8 w-8" />,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop"
  },
  {
    id: 12,
    title: "Offline-First Architecture",
    description: "Practice anywhere with secure offline access and automatic synchronization",
    icon: <Zap className="h-8 w-8" />,
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=200&fit=crop"
  }
];

export const PrinciplesSection = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use single row of features
  const displayFeatures = FEATURES.slice(0, 6);

  return (
    <section className="py-20 bg-white overflow-hidden w-full">
      <div className="w-full px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            <span className="italic font-script text-black" style={{ fontFamily: 'Dancing Script, cursive' }}>
              What Stands Academic Arc Apart
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover the innovative features and technologies that make Academic Arc the most advanced SAT preparation platform available today.
          </p>
        </div>

        {/* Single Row - Moving Left */}
        <div className="mb-8 overflow-hidden relative">
          <div 
            className={`flex gap-4 transition-all duration-500 ease-in-out ${!isPaused ? 'animate-slide-left' : ''}`}
            style={{ width: 'calc(300px * 12)' }}
          >
            {/* Duplicate the row for infinite scroll effect */}
            {[...displayFeatures, ...displayFeatures].map((feature, index) => (
              <div
                key={`row1-${feature.id}-${index}`}
                className={`flex-shrink-0 w-72 bg-white/90 backdrop-blur-lg rounded-xl p-5 transition-all duration-500 cursor-pointer border border-gray-200/50 ${
                  hoveredCard === feature.id 
                    ? 'shadow-2xl scale-105 bg-gradient-to-br from-white/95 to-orange-50/80 border-2 border-orange-500/30' 
                    : 'shadow-lg hover:shadow-xl hover:border-orange-200/50'
                }`}
                onMouseEnter={() => {
                  setHoveredCard(feature.id);
                  setIsPaused(true);
                }}
                onMouseLeave={() => {
                  setHoveredCard(null);
                  setIsPaused(false);
                }}
              >
                {/* Image */}
                <div className="mb-4 overflow-hidden rounded-lg">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className={`w-full h-40 object-cover transition-all duration-500 ${
                      hoveredCard === feature.id ? 'scale-110 brightness-110' : ''
                    }`}
                  />
                </div>
                
                {/* Content */}
                <div className="text-center">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-3 transition-all duration-300 ${
                    hoveredCard === feature.id 
                      ? 'bg-orange-500 text-white shadow-lg' 
                      : 'bg-orange-50 text-orange-500'
                  }`}>
                    {feature.icon}
                  </div>
                  
                  {/* Title */}
                  <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                    hoveredCard === feature.id ? 'text-orange-500' : 'text-gray-800'
                  }`}>
                    {feature.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Navigation Buttons */}
          <button 
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center text-white z-30 shadow-lg transition-all duration-300 hover:scale-110"
            onClick={() => {
              setCurrentIndex(prev => (prev - 1 + displayFeatures.length) % displayFeatures.length);
              setIsPaused(true);
              setTimeout(() => setIsPaused(false), 3000);
            }}
            aria-label="Previous feature"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center text-white z-30 shadow-lg transition-all duration-300 hover:scale-110"
            onClick={() => {
              setCurrentIndex(prev => (prev + 1) % displayFeatures.length);
              setIsPaused(true);
              setTimeout(() => setIsPaused(false), 3000);
            }}
            aria-label="Next feature"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>


        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-6">
            Experience all these features and more in your personalized SAT preparation journey.
          </p>
          <button 
            onClick={() => setShowPaymentModal(true)}
            className="text-white font-medium px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 50%, #ffa726 100%)',
              backgroundSize: '200% 200%',
              animation: 'gradientShift 3s ease-in-out infinite'
            }}
          >
            Start Your Free Trial
          </button>
        </div>
      </div>
      
      <FinalPaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)}
        planType="monthly"
        amount="49.99"
      />

      <style>{`
        @keyframes slide-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes slide-right {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }

        .animate-slide-left {
          animation: slide-left 60s linear infinite;
        }

        .animate-slide-right {
          animation: slide-right 60s linear infinite;
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
      `}</style>
    </section>
  );
};
