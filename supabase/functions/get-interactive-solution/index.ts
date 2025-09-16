import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

// Secure CORS - only allow your domains
const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080',  // Add the port being used
  'https://yourapp.com',
  'https://app.yourapp.com'
])

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed = origin && allowedOrigins.has(origin)
  
  // For development, be more permissive with localhost
  const isDevelopment = origin && origin.startsWith('http://localhost:')
  
  return {
    'Access-Control-Allow-Origin': isAllowed || isDevelopment ? (origin || '*') : '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'  // Set to false when using wildcard
  }
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Origin validation (more permissive for development)
  const isDevelopment = origin && origin.startsWith('http://localhost:')
  const isAllowed = origin && allowedOrigins.has(origin)
  
  if (origin && !isAllowed && !isDevelopment) {
    console.log(`🚫 Blocked origin: ${origin}`)
    return new Response('Forbidden', { 
      status: 403,
      headers: corsHeaders
    })
  }

  try {
    console.log('🚀 Interactive Solution Edge Function starting...')
    
    // Use anon key + pass through user JWT for RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const userAuth = req.headers.get('authorization') || ''
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { 
        headers: { 
          Authorization: userAuth 
        } 
      }
    })

    // Parse question ID from URL
    const url = new URL(req.url)
    const questionId = url.searchParams.get('questionId')
    
    if (!questionId) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'questionId parameter is required'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      )
    }

    console.log(`🔄 Fetching interactive solution for question: ${questionId}`)

    // Use RPC function that respects RLS policies  
    const { data: renderPayload, error } = await supabase
      .rpc('get_interactive_solution', {
        _question_id: questionId
      })

    if (error) {
      console.error('❌ RPC error:', error)
      throw error
    }

    if (!renderPayload) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'No interactive solution found for this question'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 404 
        }
      )
    }

    console.log('✅ Found interactive solution')

    return new Response(
      JSON.stringify({ 
        success: true,
        questionId,
        renderPayload,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' // Cache longer for solutions
        } 
      }
    )

  } catch (error) {
    console.error('💥 Interactive solution error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: 'Failed to fetch interactive solution'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 500 
      }
    )
  }
})