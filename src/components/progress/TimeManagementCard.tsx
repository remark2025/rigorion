
import { Card } from "@/components/ui/card";
import { Clock, Target, Brain, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

interface TimeManagementProps {
  avgTimePerQuestion: string;
  avgTimeCorrect: string;
  avgTimeIncorrect: string;
  longestQuestion: string;
}

export const TimeManagementCard = ({ 
  timeManagementStats 
}: { 
  timeManagementStats: TimeManagementProps 
}) => {
  const { isDarkMode } = useTheme();
  
  const items = [
    {
      label: "Average Time per Question",
      value: timeManagementStats.avgTimePerQuestion,
      icon: Clock,
      color: isDarkMode ? "text-green-400" : "text-purple-600"
    },
    {
      label: "Correct Answers Avg Time",
      value: timeManagementStats.avgTimeCorrect,
      icon: Target,
      color: isDarkMode ? "text-green-400" : "text-emerald-500"
    },
    {
      label: "Incorrect Answers Avg Time",
      value: timeManagementStats.avgTimeIncorrect,
      icon: Brain,
      color: isDarkMode ? "text-green-400" : "text-rose-500"
    },
    {
      label: "Longest Question Time",
      value: timeManagementStats.longestQuestion,
      icon: Zap,
      color: isDarkMode ? "text-green-400" : "text-amber-500"
    }
  ];

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: "easeOut"
          }
        }
      }}
    >
      <Card className={`p-6 transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gray-900 border-green-500/30 shadow-none' 
          : 'shadow-md hover:shadow-lg border-0'
      }`}>
        <h3 className={`text-lg font-semibold mb-6 ${
          isDarkMode ? 'text-green-400' : ''
        }`}>Time Management</h3>
        <div className="space-y-5">
          {items.map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                }`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <span className={`font-medium ${
                  isDarkMode ? 'text-green-400' : 'text-gray-700'
                }`}>{item.label}</span>
              </div>
              <span className={`font-semibold ${
                isDarkMode ? 'text-green-400' : 'text-gray-900'
              }`}>{item.value}</span>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};
