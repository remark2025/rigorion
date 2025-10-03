import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Crown, Zap, Star, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';

interface PremiumGateProps {
  feature: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

// Mock subscription hook - in real app this would check actual subscription status
const useSubscription = () => {
  // For demo purposes, always return false to show premium gates
  return {
    isPremium: false,
    tier: 'free' as const
  };
};

const PremiumGate: React.FC<PremiumGateProps> = ({
  feature,
  description = "Access this premium feature with your subscription",
  children,
  className = ''
}) => {
  const { isPremium } = useSubscription();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Blurred content */}
      <div className="filter blur-sm pointer-events-none select-none">
        {children}
      </div>
      
      {/* Premium overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`max-w-md w-full mx-4 backdrop-blur-sm rounded-2xl p-8 border shadow-2xl ${
          isDarkMode 
            ? 'bg-gray-800/95 border-orange-600' 
            : 'bg-white/95 border-orange-300'
        }`}>
          {/* Premium icon */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-none px-4 py-1 text-sm font-semibold">
              <Star className="w-3 h-3 mr-1" />
              PREMIUM FEATURE
            </Badge>
          </div>
          
          {/* Content */}
          <div className="text-center">
            <h3 className={`text-xl font-bold mb-3 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              🔒 Unlock {feature}
            </h3>
            
            <p className={`text-sm leading-relaxed mb-6 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {description}
            </p>
            
            {/* Premium benefits */}
            <div className={`text-left mb-6 p-4 rounded-lg ${
              isDarkMode ? 'bg-orange-900/20' : 'bg-orange-50'
            }`}>
              <p className="text-orange-600 font-semibold mb-2 text-sm">✨ Premium includes:</p>
              <ul className={`text-sm space-y-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <li>• 25+ Interactive Math Tools</li>
                <li>• Advanced Physics Simulations</li>
                <li>• Step-by-step Solutions</li>
                <li>• Progress Tracking & Analytics</li>
                <li>• Custom Scenario Builder</li>
                <li>• Export Results & Reports</li>
              </ul>
            </div>
            
            {/* CTA Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/payment')}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 font-semibold py-3 text-base transform hover:scale-105 transition-all duration-200"
              >
                <Zap className="w-4 h-4 mr-2" />
                Upgrade to Premium
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              <Button
                onClick={() => navigate('/practice')}
                variant="outline"
                className={`w-full ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Back to Free Content
              </Button>
            </div>
            
            {/* Pricing hint */}
            <p className={`text-xs mt-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Starting at $9.99/month • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumGate;