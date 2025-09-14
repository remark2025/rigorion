import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Simple User Analytics: Starting...')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user ID from URL params or auth
    const url = new URL(req.url)
    const userId = url.searchParams.get('userId')
    
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

    // Get all interactions for this user
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
      // Return default values for new users
      return new Response(JSON.stringify({
        success: true,
        data: {
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
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Calculate basic metrics from real data
    const correctAnswers = interactions.filter(i => i.is_correct).length
    const incorrectAnswers = totalInteractions - correctAnswers
    const averageScore = Math.round((correctAnswers / totalInteractions) * 100)
    
    // Calculate timing metrics
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

    // Calculate difficulty-based performance
    const easyInteractions = interactions.filter(i => i.level === 'easy')
    const mediumInteractions = interactions.filter(i => i.level === 'medium') 
    const hardInteractions = interactions.filter(i => i.level === 'hard')

    const easyCorrect = easyInteractions.filter(i => i.is_correct).length
    const mediumCorrect = mediumInteractions.filter(i => i.is_correct).length
    const hardCorrect = hardInteractions.filter(i => i.is_correct).length

    const easyAccuracy = easyInteractions.length > 0 ? Math.round((easyCorrect / easyInteractions.length) * 100) : 0
    const mediumAccuracy = mediumInteractions.length > 0 ? Math.round((mediumCorrect / mediumInteractions.length) * 100) : 0
    const hardAccuracy = hardInteractions.length > 0 ? Math.round((hardCorrect / hardInteractions.length) * 100) : 0

    const easyAvgTime = easyInteractions.length > 0
      ? Math.round((easyInteractions.reduce((sum, i) => sum + (i.duration_seconds || 0), 0) / easyInteractions.length) * 10) / 10
      : 0
    const mediumAvgTime = mediumInteractions.length > 0
      ? Math.round((mediumInteractions.reduce((sum, i) => sum + (i.duration_seconds || 0), 0) / mediumInteractions.length) * 10) / 10
      : 0
    const hardAvgTime = hardInteractions.length > 0
      ? Math.round((hardInteractions.reduce((sum, i) => sum + (i.duration_seconds || 0), 0) / hardInteractions.length) * 10) / 10
      : 0

    // Generate 15-day performance graph
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

    // Generate skill analytics based on topics/modules
    const skillAnalytics = []
    const skillMap = new Map()
    
    interactions.forEach(interaction => {
      const skillKey = interaction.topic || interaction.module || 'General Practice'
      if (!skillMap.has(skillKey)) {
        skillMap.set(skillKey, {
          correct: 0,
          incorrect: 0,
          total: 0,
          totalTime: 0
        })
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

    let skillIndex = 0
    for (const [skillName, skillData] of skillMap.entries()) {
      const accuracy = Math.round((skillData.correct / skillData.total) * 100)
      const avgTime = Math.round((skillData.totalTime / skillData.total) * 10) / 10
      
      skillAnalytics.push({
        skillId: `skill_${skillIndex++}`,
        skillName: skillName,
        chapter: skillName,
        section: skillName.toLowerCase().includes('math') ? 'Math' : 'General',
        correct: skillData.correct,
        incorrect: skillData.incorrect,
        accuracy: accuracy,
        averageTime: avgTime,
        percentile: Math.min(95, Math.max(5, accuracy + Math.floor(Math.random() * 20) - 10)), // Rough percentile
        improvement: Math.floor(Math.random() * 20) - 5 // Random improvement
      })
    }

    // Calculate streak (simplified - consecutive days with activity)
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
      } else if (i > 0) { // Allow for today to not have activity yet
        break
      }
    }

    // Prepare final response in exact format expected by Progress page
    const analyticsData = {
      userId,
      totalProgressPercent: Math.min(100, Math.round((totalInteractions / 100) * 100)), 
      correctAnswers,
      incorrectAnswers,
      unattemptedQuestions: Math.max(0, 100 - totalInteractions), // Assume 100 total questions
      questionsAnsweredToday,
      streak,
      averageScore,
      rank: Math.max(1, 1000 - (averageScore * 10)), // Rough ranking based on score
      projectedScore: Math.min(1600, Math.max(400, 400 + (averageScore * 12))), // SAT score estimate
      speed: Math.min(100, Math.max(0, 100 - Math.round(averageTime * 2))), // Speed percentile
      
      // Difficulty-based metrics
      easyAccuracy,
      easyAvgTime,
      easyCompleted: easyInteractions.length,
      easyTotal: 50, // Placeholder total
      mediumAccuracy,
      mediumAvgTime,
      mediumCompleted: mediumInteractions.length,
      mediumTotal: 50,
      hardAccuracy,
      hardAvgTime, 
      hardCompleted: hardInteractions.length,
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
      dataSource: 'real_interactions',
      calculatedAt: new Date().toISOString(),
      totalInteractions
    }

    console.log(`✅ Analytics calculated:`, {
      correctAnswers,
      totalInteractions,
      averageScore,
      questionsAnsweredToday,
      performanceGraphDays: performanceGraph.length,
      skillCount: skillAnalytics.length
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
    console.error('💥 Analytics error:', error)
    
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