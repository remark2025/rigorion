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
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, if-none-match',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'  // Set to false when using wildcard
  }
}

// Simple hash function for ETag generation
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
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
    console.log('🚀 Secure Edge Function: get-questions-secure starting...')
    
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

    console.log('🔄 Fetching questions using RLS+RPC...')

    // Parse query parameters for pagination and filtering
    const url = new URL(req.url)
    const packId = url.searchParams.get('packId')
    const since = url.searchParams.get('since')
    const limit = Math.min(Number(url.searchParams.get('limit') || 500), 1000) // Cap at 1000
    const cursor = url.searchParams.get('cursor')

    // Use RPC function that respects RLS policies
    const { data: questions, error } = await supabase
      .rpc('get_question_cards', {
        _pack_id: packId || null,
        _since: since || null,
        _limit: limit,
        _cursor: cursor || null
      })

    if (error) {
      console.error('❌ RPC error:', error)
      throw error
    }

    console.log(`✅ Found ${questions?.length || 0} questions`)

    // Generate ETag for caching (based on update timestamps)
    const timestamps = questions?.map(q => q.updated_at).join(',') || ''
    const etag = `"v:${simpleHash(timestamps)}"`
    
    // Check if client has current version
    const ifNoneMatch = req.headers.get('if-none-match')
    if (ifNoneMatch === etag && questions?.length > 0) {
      console.log('✅ Client has current version, returning 304')
      return new Response(null, {
        status: 304,
        headers: {
          ...corsHeaders,
          'ETag': etag,
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=86400'
        }
      })
    }

    // Transform slim question cards (no sensitive data like answers or solutions)
    const transformedQuestions = questions?.map(q => ({
      id: q.id,
      number: q.number,
      content: q.content,
      difficulty: q.difficulty,
      chapter: q.topic || 'Math',
      module: q.subject === 'math' ? 'All SAT Math' : 'SAT Practice',
      bookmarked: false,
      examNumber: 1,
      
      // Choices (safe to include for practice)
      choices: Array.isArray(q.choices) ? 
        q.choices.map((choice: any) => choice.text || choice) : [],
      
      // Calculator setting
      calculatorAllowed: q.calculator_allowed || false,
      
      // Interactive flag (details loaded separately)
      hasInteractive: q.has_interactive || false,
      
      // Metadata for sync/pagination
      updatedAt: q.updated_at
    })) || []

    // Add pagination cursor for next request
    const nextCursor = questions?.length === limit ? 
      questions[questions.length - 1]?.updated_at : null

    return new Response(
      JSON.stringify({ 
        questions: transformedQuestions,
        success: true,
        count: transformedQuestions.length,
        pagination: {
          hasMore: questions?.length === limit,
          nextCursor,
          limit
        },
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'ETag': etag,
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=86400'
        } 
      }
    )

  } catch (error) {
    console.error('💥 Edge function error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: 'Failed to fetch questions'
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