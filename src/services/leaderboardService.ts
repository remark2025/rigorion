
import { supabase } from '@/lib/supabase';
import { LeaderboardEntry } from './types/progressTypes';
import { toast } from 'sonner';

let leaderboardCache: LeaderboardEntry[] | null = null;
const SUPABASE_URL = "https://eantvimmgdmxzwrjwrop.supabase.co";

export async function getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
  try {
    // Use cache if available
    if (leaderboardCache) {
      return leaderboardCache;
    }

    // Get auth token for all requests
    const { data: { session } } = await supabase.auth.getSession();
    const authToken = session?.access_token;
    
    // First attempt: direct fetch with CORS headers
    try {
      console.log("Attempting direct fetch for leaderboard data");
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/get-leaderboard`, {
        method: 'GET',
        headers,
        credentials: 'omit',
        mode: 'cors'
      });
      
      if (response.ok) {
        const leaderboardData = await response.json();
        
        if (leaderboardData && leaderboardData.length > 0) {
          const formattedData = formatLeaderboardData(leaderboardData);
          leaderboardCache = formattedData;
          return formattedData;
        }
      } else {
        console.warn("Direct fetch for leaderboard failed:", response.status, response.statusText);
        throw new Error("Direct fetch failed");
      }
    } catch (directFetchError) {
      console.warn("Direct fetch method failed:", directFetchError);
      
      // Second attempt: Use supabase.functions.invoke method
      try {
        console.log("Attempting invoke method for leaderboard");
        const { data: leaderboardData, error } = await supabase.functions.invoke('get-leaderboard', {
          body: { limit },
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
        });

        if (error) {
          console.error('Edge function invoke error:', error);
          throw error;
        }

        if (leaderboardData && leaderboardData.length > 0) {
          const formattedData = formatLeaderboardData(leaderboardData);
          leaderboardCache = formattedData;
          return formattedData;
        } else {
          throw new Error("No leaderboard data returned from invoke");
        }
      } catch (invokeError) {
        console.error('All fetch methods failed for leaderboard:', invokeError);
        toast.error("Couldn't load leaderboard data. Using sample data.");
      }
    }

    // Fallback: Generate more realistic dummy data
    return generateFallbackLeaderboardData(limit);
  } catch (error) {
    console.error('Error in leaderboard service:', error);
    toast.error("Error loading leaderboard. Using sample data.");
    return generateFallbackLeaderboardData(limit);
  }
}

// Helper function to format leaderboard data consistently
function formatLeaderboardData(data: any[]): LeaderboardEntry[] {
  return data.map((entry: any, index: number) => ({
    rank: entry.rank || index + 1,
    name: entry.name || entry.user_name || 'Unknown',
    problems: entry.problems_solved || entry.problems || 0,
    accuracy: typeof entry.accuracy === 'string' ? entry.accuracy : `${entry.accuracy || 0}%`,
    score: entry.projected_score || entry.score || 0,
    trend: entry.trend_percent_change || entry.trend || 0,
    streak: entry.streak_days || entry.streak || 0,
    isCurrentUser: entry.is_current_user || false
  }));
}

// Generate fallback leaderboard data
function generateFallbackLeaderboardData(limit: number): LeaderboardEntry[] {
  console.log("Generating fallback leaderboard data");
  
  const dummyNames = [
    'Alex Zhang', 'Maria Rodriguez', 'David Kim', 'Jessica Taylor', 
    'Raj Patel', 'Sophie Chen', 'James Wilson', 'Emma Johnson', 
    'Michael Brown', 'Omar Hassan', 'Priya Sharma', 'Kenji Tanaka',
    'Sarah Miller', 'Carlos Gomez', 'Aisha Abdullah', 'Ryan Park',
    'Fatima Al-Farsi', 'Diego Hernandez', 'Wei Li', 'Hannah Smith'
  ];
  
  // Determine where to place the current user
  const currentUserRank = Math.floor(Math.random() * Math.min(10, limit)) + 1;
  
  const entries: LeaderboardEntry[] = [];
  
  for (let i = 1; i <= limit; i++) {
    const isCurrentUser = i === currentUserRank;
    const baseScore = 1000 - ((i-1) * (900/limit));
    
    entries.push({
      rank: i,
      name: isCurrentUser ? 'You' : dummyNames[i % dummyNames.length],
      problems: Math.floor(baseScore / 10) + Math.floor(Math.random() * 20),
      accuracy: `${Math.floor(98 - ((i-1) * (15/limit)))}%`,
      score: Math.floor(baseScore),
      trend: Math.floor(Math.random() * 20) - (i > limit/2 ? 10 : 5), // Higher ranks tend to have positive trends
      streak: Math.floor(Math.random() * 15) + (i <= 3 ? 10 : 0), // Top 3 have higher streaks
      isCurrentUser
    });
  }
  
  // Sort by score to ensure proper ranking
  leaderboardCache = entries.sort((a, b) => b.score - a.score);
  return leaderboardCache;
}
