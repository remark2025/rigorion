
import { Card } from "@/components/ui/card";
import { Target } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface ProjectedScoreProps {
  score?: number;
}

export const ProjectedScore = ({
  score = 92
}: ProjectedScoreProps) => {
  const { isDarkMode } = useTheme();
  
  return (
    <Card className={`transition-all duration-300 border shadow-sm rounded-lg w-full h-24 ${
      isDarkMode 
        ? 'border-green-500/30 bg-gray-900' 
        : 'border-gray-200 bg-white'
    }`}>
      <div className="flex flex-col items-center justify-center p-2 text-center h-full">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
          isDarkMode ? 'bg-green-500/20' : 'bg-blue-50'
        }`}>
          <Target className={`h-4 w-4 strokeWidth={1.5} ${
            isDarkMode ? 'text-green-400' : 'text-blue-500'
          }`} />
        </div>
        <div>
          <p className={`text-xs ${
            isDarkMode ? 'text-green-400/70' : 'text-gray-500'
          }`}>Projected Score</p>
          <p className={`text-xs font-semibold ${
            isDarkMode ? 'text-green-400' : 'text-gray-900'
          }`}>{score}%</p>
        </div>
      </div>
    </Card>
  );
};
