
import { useState, useEffect } from "react";
import { getLeaderboard } from "@/services/leaderboardService";
import { LeaderboardTable } from "./LeaderboardTable";
import { Card } from "@/components/ui/card";
import { EmptyProgressState } from "./EmptyProgressState";
import type { LeaderboardEntry } from '@/services/types/progressTypes';
import { useTheme } from "@/contexts/ThemeContext";

// Sample leaderboard data - 12+ entries for scrolling
const SAMPLE_LEADERBOARD_DATA: LeaderboardEntry[] = [
  { rank: 1, name: 'Alex Zhang', problems: 156, accuracy: '98%', score: 1480, trend: 12, streak: 15, isCurrentUser: false },
  { rank: 2, name: 'Maria Rodriguez', problems: 142, accuracy: '96%', score: 1465, trend: 8, streak: 12, isCurrentUser: false },
  { rank: 3, name: 'You', problems: 138, accuracy: '94%', score: 1445, trend: 15, streak: 10, isCurrentUser: true },
  { rank: 4, name: 'David Kim', problems: 134, accuracy: '93%', score: 1420, trend: 5, streak: 8, isCurrentUser: false },
  { rank: 5, name: 'Jessica Taylor', problems: 129, accuracy: '91%', score: 1395, trend: -2, streak: 6, isCurrentUser: false },
  { rank: 6, name: 'Raj Patel', problems: 125, accuracy: '90%', score: 1375, trend: 7, streak: 9, isCurrentUser: false },
  { rank: 7, name: 'Sophie Chen', problems: 121, accuracy: '89%', score: 1350, trend: 3, streak: 4, isCurrentUser: false },
  { rank: 8, name: 'James Wilson', problems: 118, accuracy: '87%', score: 1325, trend: -1, streak: 2, isCurrentUser: false },
  { rank: 9, name: 'Emma Johnson', problems: 115, accuracy: '86%', score: 1300, trend: 6, streak: 7, isCurrentUser: false },
  { rank: 10, name: 'Michael Brown', problems: 112, accuracy: '85%', score: 1275, trend: -3, streak: 1, isCurrentUser: false },
  { rank: 11, name: 'Sarah Davis', problems: 108, accuracy: '84%', score: 1250, trend: 4, streak: 5, isCurrentUser: false },
  { rank: 12, name: 'Chris Lee', problems: 105, accuracy: '83%', score: 1225, trend: 2, streak: 3, isCurrentUser: false },
  { rank: 13, name: 'Nicole White', problems: 102, accuracy: '82%', score: 1200, trend: -1, streak: 2, isCurrentUser: false },
  { rank: 14, name: 'Ryan Garcia', problems: 98, accuracy: '81%', score: 1175, trend: 1, streak: 1, isCurrentUser: false },
  { rank: 15, name: 'Ashley Martinez', problems: 95, accuracy: '80%', score: 1150, trend: 3, streak: 4, isCurrentUser: false },
  { rank: 16, name: 'Kevin Thompson', problems: 92, accuracy: '79%', score: 1125, trend: -2, streak: 0, isCurrentUser: false },
  { rank: 17, name: 'Michelle Lopez', problems: 89, accuracy: '78%', score: 1100, trend: 0, streak: 2, isCurrentUser: false },
  { rank: 18, name: 'Tyler Anderson', problems: 86, accuracy: '77%', score: 1075, trend: 1, streak: 1, isCurrentUser: false },
  { rank: 19, name: 'Amanda Clark', problems: 83, accuracy: '76%', score: 1050, trend: -1, streak: 0, isCurrentUser: false },
  { rank: 20, name: 'Jordan Moore', problems: 80, accuracy: '75%', score: 1025, trend: 2, streak: 3, isCurrentUser: false }
];

export const LeaderboardData = ({ userId }: { userId: string }) => {
  const { isDarkMode } = useTheme();
  const [data, setData] = useState<LeaderboardEntry[]>(SAMPLE_LEADERBOARD_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('week');

  console.log("LeaderboardData component rendered with data:", data.length, "items");

  // For now, always use sample data to ensure leaderboard renders
  useEffect(() => {
    console.log("LeaderboardData useEffect triggered");
    // Ensure data is always set to sample data
    setData(SAMPLE_LEADERBOARD_DATA);
    setIsLoading(false);
    setError(null);
  }, [period, userId]);

  if (isLoading) {
    return (
      <Card className={`p-6 ${
        isDarkMode ? 'bg-gray-800 border-orange-500/30' : 'bg-white border-orange-100'
      }`}>
        <div className="py-8 flex justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className={`w-8 h-8 border-4 border-t-transparent rounded-full animate-spin ${
              isDarkMode ? 'border-orange-500' : 'border-orange-500'
            }`}></div>
            <p className={isDarkMode ? 'text-orange-300' : 'text-gray-500'}>
              Loading leaderboard data...
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-6 ${
        isDarkMode ? 'bg-gray-800 border-orange-500/30' : 'bg-white border-orange-100'
      }`}>
        <div className="py-8 flex justify-center text-red-500">
          <div className="text-center">
            <p className="font-medium">Error loading leaderboard data</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        </div>
      </Card>
    );
  }

  if (data.length === 0) {
    console.log("Data length is 0, showing empty state");
    return <EmptyProgressState message="No leaderboard data available" />;
  }

  console.log("Rendering leaderboard with data:", data);

  return (
    <div className="space-y-6">
      <Card className={`p-6 ${
        isDarkMode ? 'bg-gray-800 border-orange-500/30' : 'bg-white border-orange-100'
      }`}>
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center">
          <h3 className={`text-lg font-medium mb-4 sm:mb-0 ${
            isDarkMode ? 'text-orange-400' : 'text-gray-900'
          }`}>Student Leaderboard</h3>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => setPeriod('week')} 
              className={`px-4 py-1 rounded-full text-sm transition-colors ${
                period === 'week' 
                  ? isDarkMode 
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                    : 'bg-orange-100 text-orange-600'
                  : isDarkMode
                    ? 'bg-gray-700 text-orange-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              This Week
            </button>
            <button 
              onClick={() => setPeriod('month')} 
              className={`px-4 py-1 rounded-full text-sm transition-colors ${
                period === 'month' 
                  ? isDarkMode 
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                    : 'bg-orange-100 text-orange-600'
                  : isDarkMode
                    ? 'bg-gray-700 text-orange-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              This Month
            </button>
            <button 
              onClick={() => setPeriod('all')} 
              className={`px-4 py-1 rounded-full text-sm transition-colors ${
                period === 'all' 
                  ? isDarkMode 
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                    : 'bg-orange-100 text-orange-600'
                  : isDarkMode
                    ? 'bg-gray-700 text-orange-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Time
            </button>
          </div>
        </div>
        
        <LeaderboardTable data={data} />
      </Card>
    </div>
  );
};
