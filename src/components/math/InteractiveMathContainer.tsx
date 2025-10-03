import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';

interface InteractiveMathContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  backUrl?: string;
  className?: string;
}

const InteractiveMathContainer: React.FC<InteractiveMathContainerProps> = ({
  title,
  subtitle,
  children,
  backUrl = '/interactive-math',
  className = ''
}) => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-orange-50 via-white to-orange-50'
    } ${className}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 border-b shadow-sm ${
        isDarkMode ? 'bg-gray-800' : 'bg-white/90'
      } backdrop-blur-sm`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate(backUrl)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Math Hub
              </Button>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-2 rounded-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {title}
                  </h1>
                  {subtitle && (
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {children}
      </div>
    </div>
  );
};

export default InteractiveMathContainer;