import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface SolutionStep {
  title: string;
  description: string;
  formula?: string;
  calculation?: string;
  result?: string;
  insights?: string[];
}

interface SolutionPanelProps {
  title?: string;
  steps: SolutionStep[];
  isOpen: boolean;
  className?: string;
}

const SolutionPanel: React.FC<SolutionPanelProps> = ({
  title = "📐 Step-by-Step Solution",
  steps,
  isOpen,
  className = ''
}) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`${
      isOpen ? 'block' : 'hidden'
    } ${className}`}>
      <div className={`backdrop-blur-sm rounded-xl p-8 border shadow-lg mt-6 ${
        isDarkMode 
          ? 'bg-gray-800/90 border-gray-700' 
          : 'bg-white/90 border-orange-200'
      }`}>
        <h2 className={`text-2xl font-bold mb-6 text-center ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {title}
        </h2>
        
        {steps.map((step, index) => (
          <div key={index} className={`mb-6 p-6 rounded-lg border-l-4 border-orange-500 ${
            isDarkMode ? 'bg-gray-700/50' : 'bg-orange-50'
          }`}>
            <h3 className="text-lg font-semibold mb-3 text-orange-600">
              Step {index + 1}: {step.title}
            </h3>
            
            <p className={`mb-4 leading-relaxed ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {step.description}
            </p>
            
            {step.formula && (
              <div className={`p-4 rounded-lg font-mono text-lg border mb-4 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-600 text-gray-200' 
                  : 'bg-white border-orange-200 text-gray-900'
              }`}>
                {step.formula}
              </div>
            )}
            
            {step.calculation && (
              <div className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <p className="font-semibold text-orange-600 mb-2">Calculation:</p>
                <p className="font-mono bg-orange-100 dark:bg-orange-900/30 p-3 rounded border">
                  {step.calculation}
                </p>
              </div>
            )}
            
            {step.result && (
              <div className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <p className="font-semibold text-orange-600 mb-2">Result:</p>
                <p className="font-bold text-lg text-orange-600">{step.result}</p>
              </div>
            )}
            
            {step.insights && step.insights.length > 0 && (
              <div className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <p className="font-semibold text-orange-600 mb-2">💡 Key Insights:</p>
                <ul className="list-disc list-inside space-y-1">
                  {step.insights.map((insight, i) => (
                    <li key={i} className="leading-relaxed">{insight}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
        
        <div className={`mt-8 p-6 rounded-lg border ${
          isDarkMode 
            ? 'bg-orange-900/20 border-orange-600' 
            : 'bg-orange-50 border-orange-300'
        }`}>
          <h3 className="text-lg font-semibold mb-3 text-orange-600 flex items-center gap-2">
            🎯 Mathematical Mastery
          </h3>
          <div className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <p>• <strong>Understanding:</strong> Visualize the relationship between variables</p>
            <p>• <strong>Application:</strong> Apply formulas to solve real-world problems</p>
            <p>• <strong>Analysis:</strong> Interpret results and their physical meaning</p>
            <p>• <strong>Connection:</strong> Link mathematical concepts to practical scenarios</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionPanel;