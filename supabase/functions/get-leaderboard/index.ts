
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Set up CORS headers to allow all origins
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    
    // Create Supabase client - using anon key is OK for reading leaderboard data
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader || '' } }
      }
    );

    // Get optional parameters from request
    let limit = 10;
    let userId = null;

    if (req.method === "POST") {
      try {
        const body = await req.json();
        limit = body.limit || 10;
        userId = body.userId || null;
      } catch (e) {
        console.log("Could not parse JSON body");
      }
    }

    // For this demo, we'll generate static leaderboard data
    // In a real app, you would query your database
    const leaderboardData = generateLeaderboardData(userId, limit);

    return new Response(
      JSON.stringify(leaderboardData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
        status: 200 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
        status: 500 
      }
    );
  }
});

function generateLeaderboardData(currentUserId: string | null = null, limit = 10) {
  // Create an array of random users
  const leaderboard = [];
  
  // Randomly insert the current user between ranks 1-10
  const currentUserRank = Math.floor(Math.random() * Math.min(10, limit)) + 1;
  
  for (let i = 1; i <= limit; i++) {
    const isCurrentUser = i === currentUserRank;
    const baseScore = 1000 - ((i-1) * (900/limit));
    
    leaderboard.push({
      user_id: isCurrentUser ? currentUserId : `user-${i}`,
      name: isCurrentUser ? 'You' : `User ${i}`,
      problems_solved: Math.floor(baseScore / 10) + Math.floor(Math.random() * 20),
      accuracy: Math.floor(98 - ((i-1) * (15/limit))),
      score: Math.floor(baseScore),
      trend_percent_change: Math.floor(Math.random() * 20) - (i > limit/2 ? 10 : 5),
      streak_days: Math.floor(Math.random() * 15) + (i <= 3 ? 10 : 0),
      is_current_user: isCurrentUser
    });
  }
  
  // Sort by score
  return leaderboard.sort((a, b) => b.score - a.score);
}
