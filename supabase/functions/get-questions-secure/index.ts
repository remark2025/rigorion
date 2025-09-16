import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

// Simple in-memory rate limiter (use Redis in production)
const rateLimiter = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(identifier: string, limit: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now()
  const key = identifier
  const record = rateLimiter.get(key)
  
  if (!record || now > record.resetTime) {
    rateLimiter.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (record.count >= limit) {
    return false
  }
  
  record.count++
  return true
}

function getRateLimitHeaders(identifier: string): Record<string, string> {
  const record = rateLimiter.get(identifier)
  if (!record) return {}
  
  const remaining = Math.max(0, 100 - record.count)
  const resetIn = Math.max(0, Math.ceil((record.resetTime - Date.now()) / 1000))
  
  return {
    'X-RateLimit-Limit': '100',
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': resetIn.toString()
  }
}

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
  const shouldAllow = isAllowed || isDevelopment
  
  if (!shouldAllow) {
    // Strict CORS: No headers for disallowed origins
    return {
      'Vary': 'Origin'
    }
  }
  
  return {
    'Access-Control-Allow-Origin': origin || '',
    'Access-Control-Allow-Headers': 'authorization, content-type, if-none-match',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Expose-Headers': 'ETag, Cache-Control',
    'Vary': 'Origin'
  }
}

// SHA-256 hash function for strong ETags
async function sha256Hash(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = new Uint8Array(hashBuffer)
  const hashHex = Array.from(hashArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  return hashHex.substring(0, 16) // First 16 chars for brevity
}

// Canonicalize JSON for stable hashing
function canonicalizeData(questions: any[]): string {
  // Sort and extract only the fields that affect content
  const canonical = questions
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(q => ({
      id: q.id,
      content: q.content,
      updated_at: q.updated_at
    }))
  return JSON.stringify(canonical, Object.keys(canonical[0] || {}).sort())
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Strict origin validation
  const isDevelopment = origin && origin.startsWith('http://localhost:')
  const isAllowed = origin && allowedOrigins.has(origin)
  
  if (origin && !isAllowed && !isDevelopment) {
    console.log(`🚫 Blocked origin: ${origin}`)
    return new Response('Forbidden', { 
      status: 403,
      headers: { 'Vary': 'Origin' }  // No CORS headers for blocked origins
    })
  }

  try {
    console.log('🚀 Secure Edge Function: get-questions-secure starting...')
    
    // Rate limiting (by IP and optional user)
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                    req.headers.get('x-real-ip') || 
                    'unknown'
    const userAuth = req.headers.get('authorization') || ''
    const userToken = userAuth.replace('Bearer ', '').substring(0, 10) // First 10 chars for grouping
    const rateLimitKey = userToken ? `user:${userToken}` : `ip:${clientIP}`
    
    if (!checkRateLimit(rateLimitKey)) {
      console.log(`🚫 Rate limit exceeded for: ${rateLimitKey}`)
      return new Response('Too Many Requests', {
        status: 429,
        headers: {
          ...corsHeaders,
          ...getRateLimitHeaders(rateLimitKey),
          'Retry-After': '60'
        }
      })
    }
    
    // Use anon key + pass through user JWT for RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    
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
    
    // Parse composite cursor: "updated_at,id"
    const cursor = url.searchParams.get('cursor')
    const [cursorUpdatedAt, cursorId] = cursor ? cursor.split(',') : [null, null]

    // Use RPC function that respects RLS policies
    const { data: questions, error } = await supabase
      .rpc('get_question_cards', {
        _pack_id: packId || null,
        _since: since || null,
        _limit: limit,
        _cursor_updated_at: cursorUpdatedAt || null,
        _cursor_id: cursorId || null
      })

    if (error) {
      console.error('❌ RPC error:', error)
      throw error
    }

    console.log(`✅ Found ${questions?.length || 0} questions`)

    // Generate strong ETag using SHA-256 of canonical data
    const canonicalData = canonicalizeData(questions || [])
    const contentHash = await sha256Hash(canonicalData)
    const etag = `"${contentHash}"`
    
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

    // Add composite pagination cursor for next request
    const nextCursor = questions?.length === limit ? 
      `${questions[questions.length - 1]?.updated_at},${questions[questions.length - 1]?.id}` : null

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
          ...getRateLimitHeaders(rateLimitKey),
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