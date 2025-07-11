
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface GlobalAnalysisProps {
  percentile: number;
  averageDaily: number;
  yourDaily: number;
  totalUsersCount: number;
}

export const GlobalAnalysisCard = ({
  percentile = 85,
  averageDaily = 15,
  yourDaily = 25,
  totalUsersCount = 5280
}: GlobalAnalysisProps) => {
  const { isDarkMode } = useTheme();
  
  // Determine the color and message based on percentile
  const getPercentileColor = () => {
    if (isDarkMode) {
      if (percentile >= 90) return "text-green-400";
      if (percentile >= 70) return "text-green-400";
      if (percentile >= 50) return "text-yellow-400";
      return "text-red-400";
    } else {
      if (percentile >= 90) return "text-green-500";
      if (percentile >= 70) return "text-blue-500";
      if (percentile >= 50) return "text-yellow-500";
      return "text-red-500";
    }
  };

  const getPercentileMessage = () => {
    if (percentile >= 90) return "Exceptional! You're in the top performers.";
    if (percentile >= 70) return "Great work! You're ahead of most students.";
    if (percentile >= 50) return "You're making good progress.";
    if (percentile >= 30) return "You're on the right track.";
    return "Keep going, there's room for improvement.";
  };

  return (
    <Card className={`border h-[480px] ${
      isDarkMode 
        ? 'bg-transparent border-green-500/30 text-green-400' 
        : 'bg-white border-gray-50'
    }`}>
      <CardContent className="p-6">
        <div className="flex flex-col space-y-5 h-full">
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${
              isDarkMode ? 'text-green-400' : ''
            }`}>Global Analysis</h3>
            <div className="flex items-center gap-1">
              <Users className={`h-4 w-4 ${
                isDarkMode ? 'text-green-400' : 'text-blue-400'
              }`} />
              <span className={`text-sm ${
                isDarkMode ? 'text-green-400/70' : 'text-gray-500'
              }`}>{totalUsersCount.toLocaleString()} students</span>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <span className={`text-sm ${
                isDarkMode ? 'text-green-400' : 'text-gray-600'
              }`}>Your Effort Percentile</span>
              <span className={`text-xl font-bold ${getPercentileColor()}`}>{percentile}%</span>
            </div>
            
            <div className={`relative h-2 w-full rounded-full overflow-hidden ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <div 
                className={`absolute top-0 left-0 h-full rounded-full ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-gray-600 to-green-400' 
                    : 'bg-gradient-to-r from-gray-200 to-blue-300'
                }`}
                style={{ width: `${percentile}%` }}
              />
            </div>
            
            <p className={`text-sm italic mt-1 ${
              isDarkMode ? 'text-green-400/70' : 'text-gray-600'
            }`}>{getPercentileMessage()}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className={`flex flex-col p-3 rounded-lg ${
              isDarkMode ? 'bg-gray-800 border border-green-500/30' : 'bg-blue-50'
            }`}>
              <span className={`text-sm ${
                isDarkMode ? 'text-green-400' : 'text-gray-600'
              }`}>Your Daily Average</span>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className={`h-4 w-4 ${
                  isDarkMode ? 'text-green-400' : 'text-blue-500'
                }`} />
                <span className={`text-lg font-semibold ${
                  isDarkMode ? 'text-green-400' : ''
                }`}>{yourDaily} questions</span>
              </div>
            </div>
            
            <div className={`flex flex-col p-3 rounded-lg ${
              isDarkMode ? 'bg-gray-800 border border-green-500/30' : 'bg-gray-50'
            }`}>
              <span className={`text-sm ${
                isDarkMode ? 'text-green-400' : 'text-gray-600'
              }`}>Global Daily Average</span>
              <div className="flex items-center gap-1 mt-1">
                <Users className={`h-4 w-4 ${
                  isDarkMode ? 'text-green-400' : 'text-gray-500'
                }`} />
                <span className={`text-lg font-semibold ${
                  isDarkMode ? 'text-green-400' : ''
                }`}>{averageDaily} questions</span>
              </div>
            </div>
          </div>
          
          {/* Separator line */}
          <div className={`w-full h-px ${
            isDarkMode ? 'bg-green-500/30' : 'bg-gray-200'
          } mt-6`}></div>
          
          {/* Side by side layout for Objective Accomplishment and Strength Areas */}
          <div className="grid grid-cols-2 gap-6 mt-6 relative">
            {/* Objective Accomplishment */}
            <div>
              <h4 className={`text-md font-medium mb-2 ${
                isDarkMode ? 'text-green-400' : ''
              }`}>Objective Accomplishment</h4>
              <div className="flex flex-col space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm ${
                      isDarkMode ? 'text-green-400/70' : 'text-gray-600'
                    }`}>Objectives Set</span>
                    <span className={`text-sm font-medium ${
                      isDarkMode ? 'text-green-400' : ''
                    }`}>4</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm ${
                      isDarkMode ? 'text-green-400/70' : 'text-gray-600'
                    }`}>Objectives Completed</span>
                    <span className={`text-sm font-medium ${
                      isDarkMode ? 'text-green-400' : ''
                    }`}>3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${
                      isDarkMode ? 'text-green-400/70' : 'text-gray-600'
                    }`}>Completion Rate</span>
                    <span className={`text-sm font-medium ${
                      isDarkMode ? 'text-green-400' : 'text-green-500'
                    }`}>75%</span>
                  </div>
                </div>
                
                <div className={`relative h-2 w-full rounded-full overflow-hidden ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <div 
                    className={`absolute top-0 left-0 h-full rounded-full ${
                      isDarkMode ? 'bg-green-400' : 'bg-green-500'
                    }`}
                    style={{ width: '75%' }}
                  />
                </div>
              </div>
            </div>
            
            {/* Vertical separator */}
            <div className={`absolute left-1/2 top-0 bottom-0 w-px ${
              isDarkMode ? 'bg-green-500/30' : 'bg-gray-200'
            } transform -translate-x-1/2`}></div>
            
            {/* Strength Areas */}
            <div>
              <h4 className={`text-md font-medium mb-2 ${
                isDarkMode ? 'text-green-400' : ''
              }`}>Strength Areas</h4>
              <ul className="space-y-1">
                <li className={`text-sm flex items-center gap-2 ${
                  isDarkMode ? 'text-green-400/70' : 'text-gray-600'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    isDarkMode ? 'bg-green-400' : 'bg-green-500'
                  }`}></span>
                  Quantitative Reasoning (92%)
                </li>
                <li className={`text-sm flex items-center gap-2 ${
                  isDarkMode ? 'text-green-400/70' : 'text-gray-600'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    isDarkMode ? 'bg-green-400' : 'bg-green-500'
                  }`}></span>
                  Geometry (88%)
                </li>
                <li className={`text-sm flex items-center gap-2 ${
                  isDarkMode ? 'text-green-400/70' : 'text-gray-600'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    isDarkMode ? 'bg-blue-400' : 'bg-blue-500'
                  }`}></span>
                  Verbal Reasoning (78%)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GlobalAnalysisCard;
