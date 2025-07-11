
import { Card } from "@/components/ui/card";
import { Clock, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

interface DifficultyStatProps {
  title: string;
  correct: number;
  total: number;
  avgTime: string;
  color: string;
}

export const DifficultyStatCard = ({
  stat
}: {
  stat: DifficultyStatProps;
}) => {
  const { isDarkMode } = useTheme();
  const {
    title,
    correct,
    total,
    avgTime,
    color
  } = stat;
  
  const accuracy = Math.round(correct / total * 100);
  
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
      }}
    >
      <Card className={`p-6 hover:shadow-lg transition-all duration-300 ${
        isDarkMode ? 'bg-gray-900 border-green-500/30 shadow-none' : 'shadow-md border-0'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          isDarkMode ? 'text-green-400' : ''
        }`}>{title}</h3>
        <div className="space-y-6">
          <div>
            <div className={`flex justify-between text-sm mb-2 ${
              isDarkMode ? 'text-green-400' : 'text-gray-600'
            }`}>
              <span>Accuracy</span>
              <span className="font-medium">{accuracy}%</span>
            </div>
            <motion.div 
              initial={{ scaleX: 0 }} 
              animate={{ scaleX: 1 }} 
              transition={{ duration: 1, ease: "easeOut" }} 
              style={{ originX: 0 }}
            >
              <div className={`relative h-1.5 rounded-full overflow-hidden ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                <div
                  className="absolute top-0 left-0 h-full transition-all duration-500 rounded-full animate-pulse-subtle"
                  style={{
                    width: `${accuracy}%`,
                    backgroundColor: isDarkMode 
                      ? '#22c55e' // Green for dark mode
                      : title.toLowerCase().includes('easy') 
                        ? '#93c5fd' // light blue
                        : title.toLowerCase().includes('medium')
                          ? '#60a5fa' // medium blue
                          : '#3b82f6' // darker blue
                  }}
                />
              </div>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className={`flex items-center gap-3 p-3 rounded-lg py-3 ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <Clock className={`h-5 w-5 ${
                isDarkMode ? 'text-green-400' : 'text-gray-500'
              }`} />
              <div>
                <p className={`text-xs ${
                  isDarkMode ? 'text-green-400/70' : 'text-gray-500'
                }`}>Avg Time</p>
                <p className={`font-medium ${
                  isDarkMode ? 'text-green-400' : ''
                }`}>{avgTime}</p>
              </div>
            </div>
            
            <div className={`flex items-center gap-3 p-3 rounded-lg ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <CheckCircle className={`h-5 w-5 ${
                isDarkMode ? 'text-green-400' : 'text-gray-500'
              }`} />
              <div>
                <p className={`text-xs ${
                  isDarkMode ? 'text-green-400/70' : 'text-gray-500'
                }`}>Completed</p>
                <p className={`font-medium ${
                  isDarkMode ? 'text-green-400' : ''
                }`}>{correct}/{total}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export const DifficultyStatsGrid = ({
  stats
}: {
  stats: DifficultyStatProps[];
}) => {
  return (
    <motion.div 
      className="grid grid-cols-1 lg:grid-cols-3 gap-6" 
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            when: "beforeChildren",
            staggerChildren: 0.1
          }
        }
      }} 
      initial="hidden" 
      animate="visible"
    >
      {stats.map((stat, index) => (
        <DifficultyStatCard key={index} stat={stat} />
      ))}
    </motion.div>
  );
};
