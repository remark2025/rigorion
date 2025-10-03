import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from '@/contexts/ThemeContext';

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
}

interface ControlAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface StatDisplay {
  label: string;
  value: string;
  unit?: string;
}

interface ControlPanelProps {
  title?: string;
  sliders?: SliderControlProps[];
  actions?: ControlAction[];
  stats?: StatDisplay[];
  legend?: Array<{ color: string; label: string }>;
  children?: React.ReactNode;
  className?: string;
}

export const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  min,
  max,
  step,
  unit = '',
  onChange
}) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="mb-6">
      <label className={`block mb-2 font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {label}
      </label>
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className={`flex-1 h-2 rounded-lg appearance-none cursor-pointer ${
            isDarkMode ? 'bg-gray-700' : 'bg-orange-100'
          }`}
          style={{
            background: `linear-gradient(to right, #ea580c 0%, #ea580c ${((value - min) / (max - min)) * 100}%, ${isDarkMode ? '#374151' : '#fed7aa'} ${((value - min) / (max - min)) * 100}%, ${isDarkMode ? '#374151' : '#fed7aa'} 100%)`
          }}
        />
        <Badge variant="outline" className="min-w-[80px] text-center bg-orange-50 text-orange-800 border-orange-300">
          {value}{unit}
        </Badge>
      </div>
      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ea580c 0%, #fb923c 100%);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(234, 88, 12, 0.5);
          border: 2px solid white;
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ea580c 0%, #fb923c 100%);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(234, 88, 12, 0.5);
          border: 2px solid white;
        }
      `}</style>
    </div>
  );
};

const ControlPanel: React.FC<ControlPanelProps> = ({
  title,
  sliders = [],
  actions = [],
  stats = [],
  legend = [],
  children,
  className = ''
}) => {
  const { isDarkMode } = useTheme();
  
  const getButtonStyles = (variant: string = 'primary') => {
    const baseStyles = "w-full mb-3 font-semibold transition-all duration-300 transform hover:scale-105";
    
    switch (variant) {
      case 'primary':
        return `${baseStyles} bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl`;
      case 'secondary':
        return `${baseStyles} ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-900 border-gray-300'} border-2 hover:bg-gray-200`;
      case 'success':
        return `${baseStyles} bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg`;
      case 'warning':
        return `${baseStyles} bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 shadow-lg`;
      default:
        return `${baseStyles} bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg`;
    }
  };
  
  return (
    <div className={`backdrop-blur-sm rounded-xl p-6 border shadow-lg ${
      isDarkMode 
        ? 'bg-gray-800/90 border-gray-700' 
        : 'bg-white/90 border-orange-200'
    } ${className}`}>
      {title && (
        <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          ⚙️ {title}
        </h3>
      )}
      
      {/* Sliders */}
      {sliders.map((slider, index) => (
        <SliderControl key={index} {...slider} />
      ))}
      
      {/* Action Buttons */}
      {actions.length > 0 && (
        <div className="mb-6">
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              disabled={action.disabled}
              className={getButtonStyles(action.variant)}
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </Button>
          ))}
        </div>
      )}
      
      {/* Statistics */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className={`p-3 rounded-lg border ${
              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-orange-50 border-orange-200'
            }`}>
              <div className={`text-xs font-medium mb-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {stat.label}
              </div>
              <div className="text-lg font-bold text-orange-600">
                {stat.value}{stat.unit || ''}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Legend */}
      {legend.length > 0 && (
        <div className={`p-4 rounded-lg border ${
          isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-orange-50 border-orange-200'
        }`}>
          <h4 className={`text-sm font-semibold mb-3 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Legend
          </h4>
          {legend.map((item, index) => (
            <div key={index} className="flex items-center gap-3 mb-2">
              <div
                className="w-5 h-5 rounded border"
                style={{ backgroundColor: item.color }}
              />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}
      
      {/* Custom Children */}
      {children}
    </div>
  );
};

export default ControlPanel;