
import { ChevronRight, Star } from "lucide-react";
import { 
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table";
import type { LeaderboardEntry } from '@/services/types/progressTypes';
import { useTheme } from "@/contexts/ThemeContext";

interface LeaderboardTableProps {
  data: LeaderboardEntry[];
}

export const LeaderboardTable = ({ data }: LeaderboardTableProps) => {
  const { isDarkMode } = useTheme();
  
  console.log("LeaderboardTable received data:", data.length, "entries");
  
  return (
    <div className={`rounded-xl p-6 ${
      isDarkMode ? 'bg-gray-700' : 'bg-white'
    }`}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className={isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}>
            <TableRow>
              <TableHead className={`px-4 py-3 text-left text-sm font-medium ${
                isDarkMode ? 'text-green-300' : 'text-gray-600'
              }`}>Rank</TableHead>
              <TableHead className={`px-4 py-3 text-left text-sm font-medium ${
                isDarkMode ? 'text-green-300' : 'text-gray-600'
              }`}>User</TableHead>
              <TableHead className={`px-4 py-3 text-left text-sm font-medium ${
                isDarkMode ? 'text-green-300' : 'text-gray-600'
              }`}>Problems</TableHead>
              <TableHead className={`px-4 py-3 text-left text-sm font-medium ${
                isDarkMode ? 'text-green-300' : 'text-gray-600'
              }`}>Accuracy</TableHead>
              <TableHead className={`px-4 py-3 text-left text-sm font-medium ${
                isDarkMode ? 'text-green-300' : 'text-gray-600'
              }`}>Streak</TableHead>
              <TableHead className={`px-4 py-3 text-left text-sm font-medium ${
                isDarkMode ? 'text-green-300' : 'text-gray-600'
              }`}>Projected Score</TableHead>
              <TableHead className={`px-4 py-3 text-left text-sm font-medium ${
                isDarkMode ? 'text-green-300' : 'text-gray-600'
              }`}>Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((user, index) => (
              <TableRow 
                key={index} 
                className={`transition-colors ${
                  isDarkMode 
                    ? `hover:bg-gray-600 ${
                        user.isCurrentUser ? "bg-green-500/10 font-medium border border-green-500/30" : ""
                      }` 
                    : `hover:bg-gray-50 ${
                        user.isCurrentUser ? "bg-blue-50/50 font-medium" : ""
                      }`
                }`}
              >
                <TableCell className={`border-t px-4 py-3 ${
                  isDarkMode ? 'border-green-500/20 text-green-300' : 'border-gray-100'
                }`}>
                  <div className="flex items-center">
                    <span className={`font-bold ${
                      user.rank === 1 ? "text-amber-500" :
                      user.rank === 2 ? "text-gray-500" :
                      user.rank === 3 ? "text-amber-700" : 
                      isDarkMode ? "text-green-300" : ""
                    }`}>
                      {user.rank}
                    </span>
                    {user.rank <= 3 && (
                      <Star className={`ml-2 h-4 w-4 ${
                        user.rank === 1 ? "text-amber-500 fill-amber-500" :
                        user.rank === 2 ? "text-gray-500 fill-gray-500" :
                        user.rank === 3 ? "text-amber-700 fill-amber-700" : ""
                      }`} />
                    )}
                  </div>
                </TableCell>
                <TableCell className={`border-t px-4 py-3 ${
                  isDarkMode ? 'border-green-500/20 text-green-300' : 'border-gray-100'
                }`}>{user.name}</TableCell>
                <TableCell className={`border-t px-4 py-3 ${
                  isDarkMode ? 'border-green-500/20 text-green-300' : 'border-gray-100'
                }`}>{user.problems}</TableCell>
                <TableCell className={`border-t px-4 py-3 ${
                  isDarkMode ? 'border-green-500/20 text-green-300' : 'border-gray-100'
                }`}>{user.accuracy}</TableCell>
                <TableCell className={`border-t px-4 py-3 ${
                  isDarkMode ? 'border-green-500/20 text-green-300' : 'border-gray-100'
                }`}>
                  {user.streak || 0} days
                </TableCell>
                <TableCell className={`border-t px-4 py-3 ${
                  isDarkMode ? 'border-green-500/20 text-green-300' : 'border-gray-100'
                }`}>
                  <div className="flex items-center">
                    {user.score}
                    {user.rank <= 3 && (
                      <Star className="ml-2 h-4 w-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                </TableCell>
                <TableCell className={`border-t px-4 py-3 ${
                  isDarkMode ? 'border-green-500/20' : 'border-gray-100'
                }`}>
                  <div className={`flex items-center ${
                    user.trend > 0 ? "text-emerald-500" : 
                    user.trend < 0 ? "text-rose-500" : "text-gray-500"
                  }`}>
                    {user.trend > 0 && "+"}
                    {user.trend}%
                    {user.trend !== 0 && (
                      <ChevronRight 
                        className={`h-4 w-4 ml-1 ${
                          user.trend > 0 ? "rotate-90" : "rotate-270"
                        }`}
                      />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
