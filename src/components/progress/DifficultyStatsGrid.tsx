
import React from 'react';
import { useTheme } from "@/contexts/ThemeContext";

interface DifficultyStatsGridProps {
  stats: {
    easy: number;
    medium: number;
    hard: number;
    total: number;
  } | Array<{
    title: string;
    correct: number;
    total: number;
    avgTime: string;
    color: string;
  }>;
}

export const DifficultyStatsGrid: React.FC<DifficultyStatsGridProps> = ({ stats }) => {
  const { isDarkMode } = useTheme();
  
  // Check if we're dealing with the array format or the object format
  if (Array.isArray(stats)) {
    return (
      <div className="grid grid-cols-3 gap-4 w-full">
        {stats.map((item, index) => (
          <div 
            key={index} 
            className={`${item.color} p-4 rounded-lg ${
              isDarkMode ? 'border border-green-500/30' : ''
            }`}
          >
            <h4 className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-green-400' : ''
            }`}>
              {item.title}
            </h4>
            <p className={`text-2xl font-bold ${
              isDarkMode ? 'text-green-400' : ''
            }`}>{item.correct}</p>
            <p className={`text-xs ${
              isDarkMode ? 'text-green-400/70' : ''
            }`}>
              {item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0}% of total
            </p>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-green-400/70' : ''
            }`}>Avg. time: {item.avgTime}</p>
          </div>
        ))}
      </div>
    );
  }
  
  // Original format
  const calculatePercentage = (value: number) => {
    return stats.total > 0 ? Math.round((value / stats.total) * 100) : 0;
  };

  return (
    <div className="grid grid-cols-3 gap-4 w-full">
      <div className={`p-4 rounded-lg ${
        isDarkMode ? 'bg-gray-800 border border-green-500/30' : 'bg-green-50'
      }`}>
        <h4 className={`text-sm font-medium mb-1 ${
          isDarkMode ? 'text-green-400' : 'text-green-700'
        }`}>Easy</h4>
        <p className={`text-2xl font-bold ${
          isDarkMode ? 'text-green-400' : 'text-green-600'
        }`}>{stats.easy}</p>
        <p className={`text-xs ${
          isDarkMode ? 'text-green-400/70' : 'text-green-600'
        }`}>{calculatePercentage(stats.easy)}% of total</p>
      </div>
      
      <div className={`p-4 rounded-lg ${
        isDarkMode ? 'bg-gray-800 border border-green-500/30' : 'bg-yellow-50'
      }`}>
        <h4 className={`text-sm font-medium mb-1 ${
          isDarkMode ? 'text-green-400' : 'text-yellow-700'
        }`}>Medium</h4>
        <p className={`text-2xl font-bold ${
          isDarkMode ? 'text-green-400' : 'text-yellow-600'
        }`}>{stats.medium}</p>
        <p className={`text-xs ${
          isDarkMode ? 'text-green-400/70' : 'text-yellow-600'
        }`}>{calculatePercentage(stats.medium)}% of total</p>
      </div>
      
      <div className={`p-4 rounded-lg ${
        isDarkMode ? 'bg-gray-800 border border-green-500/30' : 'bg-red-50'
      }`}>
        <h4 className={`text-sm font-medium mb-1 ${
          isDarkMode ? 'text-green-400' : 'text-red-700'
        }`}>Hard</h4>
        <p className={`text-2xl font-bold ${
          isDarkMode ? 'text-green-400' : 'text-red-600'
        }`}>{stats.hard}</p>
        <p className={`text-xs ${
          isDarkMode ? 'text-green-400/70' : 'text-red-600'
        }`}>{calculatePercentage(stats.hard)}% of total</p>
      </div>
    </div>
  );
};
