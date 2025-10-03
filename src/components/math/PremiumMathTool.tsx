import React from 'react';
import { Calculator, Lock } from 'lucide-react';
import InteractiveMathContainer from './InteractiveMathContainer';
import PremiumGate from './shared/PremiumGate';
import { useTheme } from '@/contexts/ThemeContext';

interface PremiumMathToolProps {
  title: string;
  description: string;
  category: string;
  toolName: string;
}

const PremiumMathTool: React.FC<PremiumMathToolProps> = ({
  title,
  description,
  category,
  toolName
}) => {
  const { isDarkMode } = useTheme();
  
  // Mock interactive content for demonstration
  const MockInteractiveContent = () => (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Mock Canvas */}
      <div className="xl:col-span-2">
        <div className={`relative rounded-xl p-6 border shadow-lg h-96 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-orange-200'
        }`}>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Calculator className={`w-16 h-16 mx-auto mb-4 ${
                isDarkMode ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <h3 className={`text-xl font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Interactive {title}
              </h3>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Advanced mathematical visualization and interaction tools
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mock Controls */}
      <div className={`rounded-xl p-6 border shadow-lg ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-orange-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Interactive Controls
        </h3>
        
        {/* Mock sliders */}
        <div className="space-y-4">
          {['Parameter A', 'Parameter B', 'Parameter C'].map((param, index) => (
            <div key={index}>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {param}
              </label>
              <div className={`h-6 rounded-lg ${
                isDarkMode ? 'bg-gray-700' : 'bg-orange-100'
              }`} />
            </div>
          ))}
        </div>
        
        {/* Mock buttons */}
        <div className="mt-6 space-y-3">
          <div className={`h-10 rounded-lg ${
            isDarkMode ? 'bg-gray-700' : 'bg-orange-100'
          }`} />
          <div className={`h-10 rounded-lg ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
          }`} />
        </div>
        
        {/* Mock stats */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((_, index) => (
            <div key={index} className={`p-3 rounded-lg ${
              isDarkMode ? 'bg-gray-700' : 'bg-orange-50'
            }`}>
              <div className={`h-4 rounded mb-1 ${
                isDarkMode ? 'bg-gray-600' : 'bg-orange-200'
              }`} />
              <div className={`h-3 rounded w-2/3 ${
                isDarkMode ? 'bg-gray-600' : 'bg-orange-200'
              }`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <InteractiveMathContainer
      title={title}
      subtitle={`${category} • Premium Interactive Tool`}
    >
      <PremiumGate 
        feature={toolName}
        description={`Unlock ${title} and 25+ other interactive math tools with Premium. ${description}`}
      >
        <MockInteractiveContent />
      </PremiumGate>
    </InteractiveMathContainer>
  );
};

export default PremiumMathTool;