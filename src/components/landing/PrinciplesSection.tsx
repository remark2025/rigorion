
import React, { useState, useEffect } from 'react';
import { Calculator, Brain, Timer, Shield, BarChart3, Users, Target, Gamepad2, Settings, CheckCircle, TrendingUp, Zap } from 'lucide-react';
import { PaymentModal } from '@/components/payment/PaymentModal';

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

  // Split features into two rows of 6
  const firstRow = FEATURES.slice(0, 6);
  const secondRow = FEATURES.slice(6, 12);

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-12">
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

        {/* First Row - Moving Left */}
        <div className="mb-8 overflow-hidden">
          <div 
            className={`flex gap-4 ${!isPaused ? 'animate-slide-left' : ''}`}
            style={{ width: 'calc(300px * 12)' }}
          >
            {/* Duplicate the row for infinite scroll effect */}
            {[...firstRow, ...firstRow].map((feature, index) => (
              <div
                key={`row1-${feature.id}-${index}`}
                className={`flex-shrink-0 w-72 bg-white rounded-xl p-5 transition-all duration-500 cursor-pointer ${
                  hoveredCard === feature.id 
                    ? 'shadow-2xl scale-105 bg-gradient-to-br from-white to-blue-50 border-2 border-[#3B82F6]/20' 
                    : 'shadow-lg hover:shadow-xl'
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
                      ? 'bg-[#3B82F6] text-white shadow-lg' 
                      : 'bg-gray-50 text-[#3B82F6]'
                  }`}>
                    {feature.icon}
                  </div>
                  
                  {/* Title */}
                  <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                    hoveredCard === feature.id ? 'text-[#3B82F6]' : 'text-gray-800'
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
        </div>

        {/* Second Row - Moving Right */}
        <div className="mb-16 overflow-hidden">
          <div 
            className={`flex gap-4 ${!isPaused ? 'animate-slide-right' : ''}`}
            style={{ width: 'calc(300px * 12)' }}
          >
            {/* Duplicate the row for infinite scroll effect */}
            {[...secondRow, ...secondRow].map((feature, index) => (
              <div
                key={`row2-${feature.id}-${index}`}
                className={`flex-shrink-0 w-72 bg-white rounded-xl p-5 transition-all duration-500 cursor-pointer ${
                  hoveredCard === feature.id 
                    ? 'shadow-2xl scale-105 bg-gradient-to-br from-white to-blue-50 border-2 border-[#3B82F6]/20' 
                    : 'shadow-lg hover:shadow-xl'
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
                      ? 'bg-[#3B82F6] text-white shadow-lg' 
                      : 'bg-gray-50 text-[#3B82F6]'
                  }`}>
                    {feature.icon}
                  </div>
                  
                  {/* Title */}
                  <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                    hoveredCard === feature.id ? 'text-[#3B82F6]' : 'text-gray-800'
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
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-6">
            Experience all these features and more in your personalized SAT preparation journey.
          </p>
          <button 
            onClick={() => setShowPaymentModal(true)}
            className="bg-white hover:bg-gray-50 text-[#3B82F6] border border-[#3B82F6] hover:border-[#1D4ED8] font-medium px-8 py-3 rounded-full transition-all duration-300 hover:scale-105"
          >
            Start Your Free Trial
          </button>
        </div>
      </div>
      
      <PaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)}
        planType="monthly"
        amount="49.99"
      />

      <style jsx>{`
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
      `}</style>
    </section>
  );
};
