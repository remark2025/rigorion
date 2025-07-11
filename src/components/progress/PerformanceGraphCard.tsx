import { Card } from "@/components/ui/card";
import { ProgressChart } from "./ProgressChart";
import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';
import { useTheme } from "@/contexts/ThemeContext";

interface PerformanceDataPoint {
  date: string;
  attempted: number;
}

interface PerformanceGraphCardProps {
  data?: PerformanceDataPoint[];
}

export const PerformanceGraphCard = ({
  data: propData
}: PerformanceGraphCardProps) => {
  const { isDarkMode } = useTheme();
  const [performanceData, setPerformanceData] = useState<PerformanceDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { session } = useAuth();

  useEffect(() => {
    // If we have data passed as prop, use that
    if (propData && propData.length > 0) {
      setPerformanceData(propData);
      return;
    }
    
    const fetchPerformanceData = async () => {
      setIsLoading(true);
      
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://eantvimmgdmxzwrjwrop.supabase.co";
        const authToken = session?.access_token;
        
        // First attempt: Direct fetch with CORS headers
        try {
          console.log("Attempting direct fetch for performance data");
          
          const headers: Record<string, string> = {
            "Content-Type": "application/json",
            "Accept": "application/json"
          };
          
          if (authToken) {
            headers.Authorization = `Bearer ${authToken}`;
          }
          
          const response = await fetch(`${supabaseUrl}/functions/v1/get-performance`, {
            method: "GET",
            headers,
            credentials: "omit",
            mode: "cors"
          });
          
          if (!response.ok) {
            throw new Error(`Error fetching performance data: ${response.status}`);
          }
          
          const data = await response.json();
          console.log("Performance data fetched:", data);

          if (data && Array.isArray(data.performance_graph)) {
            setPerformanceData(data.performance_graph);
            return;
          }
        } catch (directError) {
          console.warn("Direct fetch for performance data failed:", directError);
          
          // Second attempt: Use invoke method
          try {
            console.log("Attempting invoke for performance data");
            
            const { data, error } = await supabase.functions.invoke('get-performance', {
              headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
            });
            
            if (error) {
              throw error;
            }
            
            if (data && Array.isArray(data.performance_graph)) {
              setPerformanceData(data.performance_graph);
              return;
            }
          } catch (invokeError) {
            console.error("Invoke method for performance data failed:", invokeError);
          }
        }
        
        // If both methods fail, use fallback data
        generateFallbackData();
      } catch (error) {
        console.error('Failed to fetch performance data:', error);
        toast.error("Could not load performance data. Using sample data.");
        generateFallbackData();
      } finally {
        setIsLoading(false);
      }
    };

    const generateFallbackData = () => {
      const today = new Date();
      const dummyData = [];
      
      // Generate last 15 days with a realistic pattern
      for (let i = 14; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const formattedDate = date.toISOString().split('T')[0];
        
        // Create a pattern with more realistic data
        let attempted = 0;
        
        if (i % 7 === 0 || i % 7 === 1) {
          // Weekend days have more activity
          attempted = Math.floor(Math.random() * 20) + 15;
        } else if (i % 7 === 3) {
          // Mid-week dip
          attempted = Math.floor(Math.random() * 10) + 5;
        } else {
          // Regular days
          attempted = Math.floor(Math.random() * 15) + 10;
        }
        
        dummyData.push({
          date: formattedDate,
          attempted,
        });
      }
      
      setPerformanceData(dummyData);
    };

    fetchPerformanceData();
  }, [propData, session]);

  const displayData = (propData && propData.length > 0) ? propData : performanceData;
  
  // Debug logging
  console.log("PerformanceGraphCard propData:", propData);
  console.log("PerformanceGraphCard performanceData:", performanceData);
  console.log("PerformanceGraphCard displayData:", displayData);
  console.log("PerformanceGraphCard displayData length:", displayData?.length);

  // Calculate if there's a trend by comparing the last 3 days to the previous 3 days
  const calculateTrend = () => {
    if (displayData.length < 6) return {
      trend: 0,
      percentage: 0
    };
    const recentDays = displayData.slice(-3).reduce((sum, item) => sum + item.attempted, 0);
    const previousDays = displayData.slice(-6, -3).reduce((sum, item) => sum + item.attempted, 0);
    if (previousDays === 0) return {
      trend: 0,
      percentage: 0
    };
    const percentChange = (recentDays - previousDays) / previousDays * 100;
    return {
      trend: Math.sign(percentChange),
      percentage: Math.abs(Math.round(percentChange))
    };
  };
  
  const trend = calculateTrend();

  // Calculate average questions per day
  const averageQuestions = displayData.length > 0 
    ? Math.round(displayData.reduce((sum, item) => sum + item.attempted, 0) / displayData.length) 
    : 0;
  
  // Update the loading state UI
  if (isLoading) {
    return (
      <Card className={`p-6 transition-all duration-300 h-[480px] ${
        isDarkMode 
          ? 'bg-transparent border-green-500/30 text-green-400' 
          : 'bg-white hover:shadow-lg'
      }`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-lg font-semibold ${
            isDarkMode ? 'text-green-400' : 'text-gray-800'
          }`}>Performance Analysis</h3>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className={`w-8 h-8 border-4 border-t-transparent rounded-full animate-spin ${
              isDarkMode ? 'border-green-400' : 'border-gray-400'
            }`}></div>
            <p className={isDarkMode ? 'text-green-400/70' : 'text-gray-500'}>Loading performance data...</p>
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: "easeOut" }
        }
      }}
      initial="hidden"
      animate="visible"
      className="h-[480px]"
    >
      <Card className={`p-6 transition-all duration-300 h-full ${
        isDarkMode 
          ? 'bg-transparent border-green-500/30 text-green-400' 
          : 'bg-white/50 backdrop-blur-sm hover:shadow-lg'
      }`}>
        <div className="flex justify-between items-center mb-4">
          <div className={`text-sm font-medium ${
            isDarkMode ? 'text-green-400' : 'text-gray-600'
          }`}>
            Avg: {averageQuestions} questions/day
          </div>
          
          {trend.trend !== 0 && (
            <div className={`flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded-full ${
              trend.trend > 0 
                ? isDarkMode 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-emerald-100 text-emerald-700'
                : isDarkMode 
                  ? 'bg-red-500/20 text-red-400' 
                  : 'bg-rose-100 text-rose-700'
            }`}>
              {trend.trend > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              <span>{trend.percentage}%</span>
            </div>
          )}
        </div>
        <ProgressChart data={displayData} />
      </Card>
    </motion.div>
  );
};
