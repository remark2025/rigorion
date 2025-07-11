
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Set up CORS headers to match other functions
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing required environment variables");
    }

    // Create Supabase client with the provided auth header
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: { Authorization: authHeader || '' }
        }
      }
    );
    
    // Try to get the user from the token if it exists
    let userId = "anonymous";
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        if (!error && user) {
          userId = user.id;
        }
      } catch (error) {
        console.log("Error getting user from token:", error);
      }
    }

    console.log("Generating performance data for user:", userId);

    // Generate performance data
    const performanceData = generatePerformanceData(userId);

    return new Response(
      JSON.stringify(performanceData), 
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});

function generatePerformanceData(userId: string) {
  const today = new Date();
  const performanceGraph = [];
  
  // Generate last 15 days of data
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
    
    performanceGraph.push({
      date: formattedDate,
      attempted,
    });
  }

  return {
    userId,
    performance_graph: performanceGraph
  };
}
