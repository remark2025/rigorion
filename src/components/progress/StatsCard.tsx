
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { ProjectedScore } from "@/components/stats/ProjectedScore";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface StatProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
  backgroundColor?: string;
  transparent?: boolean;
  fill?: boolean;
  onSelect?: (date: Date) => void;
  isCalendar?: boolean;
  selectedDate?: Date | null;
}

interface StatsCardProps {
  stat: StatProps | {
    component: React.ComponentType;
  };
  index: number;
}

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export const StatsCard = ({
  stat,
  index
}: StatsCardProps) => {
  const { isDarkMode } = useTheme();
  
  if ('component' in stat) {
    const Component = stat.component;
    return <Component />;
  }

  const {
    title,
    value,
    icon: Icon,
    color,
    isCalendar,
    onSelect,
    selectedDate
  } = stat;

  if (isCalendar) {
    return (
      <Card className={`transition-all duration-300 border shadow-sm rounded-lg w-full h-24 ${
        isDarkMode 
          ? 'border-green-500/30 bg-gray-900' 
          : 'border-gray-200 bg-white'
      }`}>
        <div className="flex flex-col items-center justify-center p-2 text-center h-full">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="w-full text-sm font-normal p-0 hover:bg-transparent flex flex-col items-center gap-1 h-full">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-green-500/20' : 'bg-blue-50'
                }`}>
                  <Calendar className={`h-4 w-4 strokeWidth={1.5} ${
                    isDarkMode ? 'text-green-400' : 'text-blue-500'
                  }`} />
                </div>
                <div>
                  <p className={`text-xs ${
                    isDarkMode ? 'text-green-400/70' : 'text-gray-500'
                  }`}>{title}</p>
                  <p className={`text-xs font-semibold ${
                    isDarkMode ? 'text-green-400' : 'text-gray-900'
                  }`}>{value}</p>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border bg-white shadow-lg" align="start">
              <DatePicker 
                mode="single" 
                selected={selectedDate} 
                onSelect={onSelect}
                disabled={(date) => date < new Date()}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </Card>
    );
  }

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
          <Icon className={`h-4 w-4 strokeWidth={1.5} ${
            isDarkMode ? 'text-green-400' : 'text-blue-500'
          }`} />
        </div>
        <div>
          <p className={`text-xs ${
            isDarkMode ? 'text-green-400/70' : 'text-gray-500'
          }`}>{title}</p>
          <p className={`text-xs font-semibold ${
            isDarkMode ? 'text-green-400' : 'text-gray-900'
          }`}>{value}</p>
        </div>
      </div>
    </Card>
  );
};

export const StatsCardGrid = ({
  stats
}: {
  stats: Array<StatProps | { component: React.ComponentType; }>;
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
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
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full max-w-[98%] md:max-w-[95%] mx-auto"
    >
      {stats.map((stat, index) => (
        <motion.div 
          key={index}
          variants={itemVariants}
          className="w-full"
        >
          <StatsCard stat={stat} index={index} />
        </motion.div>
      ))}
    </motion.div>
  );
};
