import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

// In-memory cache with TTL (2-5 minute cache per user)
const analyticsCache = new Map<string, { data: any, expiresAt: number }>()
const CACHE_TTL_MS = 3 * 60 * 1000 // 3 minutes

// Cache invalidation tracking
const userLastInteraction = new Map<string, number>()

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Cached User Analytics: Starting...')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user ID from URL params or auth
    const url = new URL(req.url)
    const userId = url.searchParams.get('userId')
    const bustCache = url.searchParams.get('bustCache') === 'true'
    
    if (!userId) {
      return new Response(JSON.stringify({ 
        error: 'User ID required',
        success: false 
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      })
    }

    console.log(`📊 Processing analytics for user: ${userId}`)

    // Check cache first (unless bust requested)
    const cacheKey = `analytics_${userId}`
    const now = Date.now()
    
    if (!bustCache) {
      const cached = analyticsCache.get(cacheKey)
      if (cached && cached.expiresAt > now) {
        console.log('⚡ Returning cached analytics')
        return new Response(JSON.stringify({
          success: true,
          data: { ...cached.data, dataSource: 'cache', cachedAt: new Date(cached.expiresAt - CACHE_TTL_MS).toISOString() }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // Check if we need to invalidate cache based on new interactions
    const { data: lastInteraction } = await supabase
      .from('question_interactions')
      .select('attempted_at')
      .eq('user_id', userId)
      .order('attempted_at', { ascending: false })
      .limit(1)
      .single()

    const lastInteractionTime = lastInteraction ? new Date(lastInteraction.attempted_at).getTime() : 0
    const cachedLastInteraction = userLastInteraction.get(userId) || 0

    // If there's a new interaction since we last cached, invalidate cache
    if (lastInteractionTime > cachedLastInteraction) {
      console.log('🔄 Cache invalidated due to new interaction')
      analyticsCache.delete(cacheKey)
      userLastInteraction.set(userId, lastInteractionTime)
    }

    // Get all interactions for this user (if not cached or invalidated)
    const { data: interactions, error } = await supabase
      .from('question_interactions')
      .select('*')
      .eq('user_id', userId)
      .order('attempted_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching interactions:', error)
      throw error
    }

    const totalInteractions = interactions?.length || 0
    console.log(`✅ Found ${totalInteractions} interactions`)

    if (totalInteractions === 0) {
      // Cache default values for new users
      const defaultData = {
        userId,
        totalProgressPercent: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        unattemptedQuestions: 100,
        questionsAnsweredToday: 0,
        streak: 0,
        averageScore: 0,
        rank: 1000,
        projectedScore: 400,
        speed: 50,
        easyAccuracy: 0,
        easyAvgTime: 0,
        easyCompleted: 0,
        easyTotal: 50,
        mediumAccuracy: 0,
        mediumAvgTime: 0,
        mediumCompleted: 0,
        mediumTotal: 50,
        hardAccuracy: 0,
        hardAvgTime: 0,
        hardCompleted: 0,
        hardTotal: 30,
        averageTime: 0,
        correctAnswerAvgTime: 0,
        incorrectAnswerAvgTime: 0,
        longestQuestionTime: 0,
        performanceGraph: [],
        skillAnalytics: [],
        dataSource: 'no_interactions'
      }

      // Cache for shorter time for new users (they might start practicing soon)
      analyticsCache.set(cacheKey, { 
        data: defaultData, 
        expiresAt: now + (30 * 1000) // 30 seconds for new users
      })

      return new Response(JSON.stringify({
        success: true,
        data: defaultData
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Calculate analytics (same logic as original but with optimizations)
    console.log('🧮 Computing analytics...')
    
    const correctAnswers = interactions.filter(i => i.is_correct).length
    const incorrectAnswers = totalInteractions - correctAnswers
    const averageScore = Math.round((correctAnswers / totalInteractions) * 100)
    
    // Optimized timing calculations
    const totalTime = interactions.reduce((sum, i) => sum + (i.duration_seconds || 0), 0)
    const averageTime = Math.round((totalTime / totalInteractions) * 10) / 10
    
    const correctInteractions = interactions.filter(i => i.is_correct)
    const incorrectInteractions = interactions.filter(i => !i.is_correct)
    
    const correctAnswerAvgTime = correctInteractions.length > 0
      ? Math.round((correctInteractions.reduce((sum, i) => sum + (i.duration_seconds || 0), 0) / correctInteractions.length) * 10) / 10
      : 0
      
    const incorrectAnswerAvgTime = incorrectInteractions.length > 0
      ? Math.round((incorrectInteractions.reduce((sum, i) => sum + (i.duration_seconds || 0), 0) / incorrectInteractions.length) * 10) / 10
      : 0
    
    const longestQuestionTime = Math.max(...interactions.map(i => i.duration_seconds || 0))
    
    // Calculate questions answered today
    const today = new Date().toISOString().split('T')[0]
    const questionsAnsweredToday = interactions.filter(i => 
      i.attempted_at?.startsWith(today)
    ).length

    // Calculate difficulty-based performance (optimized)
    const difficultyStats = ['easy', 'medium', 'hard'].reduce((acc, level) => {
      const levelInteractions = interactions.filter(i => i.level === level)
      const levelCorrect = levelInteractions.filter(i => i.is_correct).length
      
      acc[`${level}Interactions`] = levelInteractions
      acc[`${level}Accuracy`] = levelInteractions.length > 0 ? Math.round((levelCorrect / levelInteractions.length) * 100) : 0
      acc[`${level}AvgTime`] = levelInteractions.length > 0
        ? Math.round((levelInteractions.reduce((sum, i) => sum + (i.duration_seconds || 0), 0) / levelInteractions.length) * 10) / 10
        : 0
      
      return acc
    }, {} as any)

    // Generate optimized 15-day performance graph
    const performanceGraph = []
    for (let i = 14; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayInteractions = interactions.filter(interaction => 
        interaction.attempted_at?.startsWith(dateStr)
      )
      
      performanceGraph.push({
        date: dateStr,
        attempted: dayInteractions.length,
        globalAverage: Math.floor(Math.random() * 10) + 8, // Placeholder
        momentum: i > 0 ? dayInteractions.length - (performanceGraph[performanceGraph.length - 1]?.attempted || 0) : 0,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        mostPracticedSkill: {
          name: 'Mixed Practice',
          percentile: dayInteractions.length > 0 
            ? Math.round((dayInteractions.filter(i => i.is_correct).length / dayInteractions.length) * 100) 
            : 0,
          contribution: dayInteractions.length
        }
      })
    }

    // Generate optimized skill analytics
    const skillMap = new Map()
    interactions.forEach(interaction => {
      const skillKey = interaction.topic || interaction.module || 'General Practice'
      if (!skillMap.has(skillKey)) {
        skillMap.set(skillKey, { correct: 0, incorrect: 0, total: 0, totalTime: 0 })
      }
      
      const skill = skillMap.get(skillKey)
      skill.total++
      skill.totalTime += interaction.duration_seconds || 0
      
      if (interaction.is_correct) {
        skill.correct++
      } else {
        skill.incorrect++
      }
    })

    const skillAnalytics = Array.from(skillMap.entries()).map(([skillName, skillData], index) => {
      const accuracy = Math.round((skillData.correct / skillData.total) * 100)
      const avgTime = Math.round((skillData.totalTime / skillData.total) * 10) / 10
      
      return {
        skillId: `skill_${index}`,
        skillName: skillName,
        chapter: skillName,
        section: skillName.toLowerCase().includes('math') ? 'Math' : 'General',
        correct: skillData.correct,
        incorrect: skillData.incorrect,
        accuracy: accuracy,
        averageTime: avgTime,
        percentile: Math.min(95, Math.max(5, accuracy + Math.floor(Math.random() * 20) - 10)),
        improvement: Math.floor(Math.random() * 20) - 5
      }
    })

    // Calculate streak (optimized)
    let streak = 0
    const today_date = new Date()
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today_date.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = checkDate.toISOString().split('T')[0]
      const hasActivity = interactions.some(interaction => 
        interaction.attempted_at?.startsWith(dateStr)
      )
      
      if (hasActivity) {
        streak++
      } else if (i > 0) {
        break
      }
    }

    // Prepare final response
    const analyticsData = {
      userId,
      totalProgressPercent: Math.min(100, Math.round((totalInteractions / 100) * 100)), 
      correctAnswers,
      incorrectAnswers,
      unattemptedQuestions: Math.max(0, 100 - totalInteractions),
      questionsAnsweredToday,
      streak,
      averageScore,
      rank: Math.max(1, 1000 - (averageScore * 10)),
      projectedScore: Math.min(1600, Math.max(400, 400 + (averageScore * 12))),
      speed: Math.min(100, Math.max(0, 100 - Math.round(averageTime * 2))),
      
      // Difficulty-based metrics
      easyAccuracy: difficultyStats.easyAccuracy,
      easyAvgTime: difficultyStats.easyAvgTime,
      easyCompleted: difficultyStats.easyInteractions.length,
      easyTotal: 50,
      mediumAccuracy: difficultyStats.mediumAccuracy,
      mediumAvgTime: difficultyStats.mediumAvgTime,
      mediumCompleted: difficultyStats.mediumInteractions.length,
      mediumTotal: 50,
      hardAccuracy: difficultyStats.hardAccuracy,
      hardAvgTime: difficultyStats.hardAvgTime,
      hardCompleted: difficultyStats.hardInteractions.length,
      hardTotal: 30,
      
      // Timing analytics
      averageTime,
      correctAnswerAvgTime,
      incorrectAnswerAvgTime,
      longestQuestionTime,
      
      // Performance graph and skills
      performanceGraph,
      skillAnalytics,
      
      // Metadata
      dataSource: 'computed_cached',
      calculatedAt: new Date().toISOString(),
      totalInteractions
    }

    // Cache the result
    analyticsCache.set(cacheKey, { 
      data: analyticsData, 
      expiresAt: now + CACHE_TTL_MS
    })

    console.log(`✅ Analytics computed and cached:`, {
      correctAnswers,
      totalInteractions,
      averageScore,
      questionsAnsweredToday,
      cacheExpiresIn: `${CACHE_TTL_MS / 1000}s`
    })

    return new Response(
      JSON.stringify({ 
        success: true,
        data: analyticsData
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('💥 Cached analytics error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        success: false
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