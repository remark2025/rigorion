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
    console.log('🚀 Simple Progress: Starting...')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user ID from URL params
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

    console.log(`📊 Getting progress for user: ${userId}`)

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

    // Calculate metrics from real interactions
    const correctAnswers = interactions?.filter(i => i.is_correct).length || 0
    const incorrectAnswers = totalInteractions - correctAnswers
    const averageScore = totalInteractions > 0 ? Math.round((correctAnswers / totalInteractions) * 100) : 0
    
    // Timing calculations
    const totalTime = interactions?.reduce((sum, i) => sum + (i.duration_seconds || 0), 0) || 0
    const averageTime = totalInteractions > 0 ? Math.round((totalTime / totalInteractions) * 10) / 10 : 0
    
    const correctInteractions = interactions?.filter(i => i.is_correct) || []
    const incorrectInteractions = interactions?.filter(i => !i.is_correct) || []
    
    const correctAnswerAvgTime = correctInteractions.length > 0
      ? Math.round((correctInteractions.reduce((sum, i) => sum + (i.duration_seconds || 0), 0) / correctInteractions.length) * 10) / 10
      : 0
      
    const incorrectAnswerAvgTime = incorrectInteractions.length > 0
      ? Math.round((incorrectInteractions.reduce((sum, i) => sum + (i.duration_seconds || 0), 0) / incorrectInteractions.length) * 10) / 10
      : 0
    
    const longestQuestionTime = interactions?.length > 0 
      ? Math.max(...interactions.map(i => i.duration_seconds || 0))
      : 0

    // Questions answered today
    const today = new Date().toISOString().split('T')[0]
    const questionsAnsweredToday = interactions?.filter(i => 
      i.attempted_at?.startsWith(today)
    ).length || 0

    // Generate 15-day performance graph with real data
    const performanceGraph = []
    for (let i = 14; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayInteractions = interactions?.filter(interaction => 
        interaction.attempted_at?.startsWith(dateStr)
      ) || []
      
      const dayCorrect = dayInteractions.filter(i => i.is_correct).length
      const dayAccuracy = dayInteractions.length > 0 ? Math.round((dayCorrect / dayInteractions.length) * 100) : 0
      
      performanceGraph.push({
        date: dateStr,
        attempted: dayInteractions.length,
        globalAverage: Math.floor(Math.random() * 10) + 12, // Mock global average
        momentum: i < 14 ? dayInteractions.length - (performanceGraph[performanceGraph.length - 1]?.attempted || 0) : 0,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        mostPracticedSkill: {
          name: 'Mixed Practice',
          percentile: dayAccuracy,
          contribution: dayInteractions.length
        }
      })
    }

    // Generate skill analytics from real data with improved categorization
    const skillMap = new Map()
    interactions?.forEach(interaction => {
      // Better skill name resolution
      let skillName = interaction.topic || 
                     `${interaction.module || 'General'} ${interaction.level || 'Practice'}`
      
      // Better section mapping
      const section = interaction.module === 'math' ? 'Math' : 
                     interaction.module === 'reading' ? 'Reading' : 
                     interaction.module === 'writing' ? 'Writing' : 
                     interaction.question_type ? `${interaction.question_type}` : 'General'
      
      // Create unique skill key with better grouping
      const skillKey = `${skillName}_${section}_${interaction.level || 'mixed'}`
      
      if (!skillMap.has(skillKey)) {
        skillMap.set(skillKey, {
          skillName,
          section,
          level: interaction.level || 'mixed',
          correct: 0,
          incorrect: 0,
          totalTime: 0,
          interactions: [],
          questionTypes: new Set(),
          practiceModes: new Set()
        })
      }
      
      const skill = skillMap.get(skillKey)
      skill.interactions.push(interaction)
      skill.totalTime += interaction.duration_seconds || 0
      
      // Track question types and practice modes for better insights
      if (interaction.question_type) skill.questionTypes.add(interaction.question_type)
      if (interaction.practice_mode) skill.practiceModes.add(interaction.practice_mode)
      
      if (interaction.is_correct) {
        skill.correct++
      } else {
        skill.incorrect++
      }
    })

    const skillAnalytics = []
    let skillIndex = 0
    
    for (const [skillKey, skillData] of skillMap.entries()) {
      const total = skillData.correct + skillData.incorrect
      const accuracy = total > 0 ? Math.round((skillData.correct / total) * 100) : 0
      const avgTime = total > 0 ? Math.round((skillData.totalTime / total) * 10) / 10 : 0
      
      // Calculate improvement trend by comparing first half vs second half of attempts
      const halfwayPoint = Math.ceil(skillData.interactions.length / 2)
      const firstHalf = skillData.interactions.slice(0, halfwayPoint)
      const secondHalf = skillData.interactions.slice(halfwayPoint)
      
      const firstHalfAccuracy = firstHalf.length > 0 ? 
        Math.round((firstHalf.filter(i => i.is_correct).length / firstHalf.length) * 100) : 0
      const secondHalfAccuracy = secondHalf.length > 0 ? 
        Math.round((secondHalf.filter(i => i.is_correct).length / secondHalf.length) * 100) : 0
      
      const improvement = secondHalfAccuracy - firstHalfAccuracy
      
      // Calculate percentile based on accuracy compared to other skills
      const percentile = Math.min(95, Math.max(10, accuracy))
      
      skillAnalytics.push({
        skillId: `skill_${skillIndex++}`,
        skillName: skillData.skillName,
        chapter: skillData.skillName,
        section: skillData.section,
        level: skillData.level,
        correct: skillData.correct,
        incorrect: skillData.incorrect,
        accuracy: accuracy,
        averageTime: avgTime,
        percentile: percentile,
        improvement: improvement,
        totalAttempts: total,
        questionTypes: Array.from(skillData.questionTypes),
        practiceModes: Array.from(skillData.practiceModes),
        recentPerformance: secondHalfAccuracy,
        consistencyScore: Math.round(100 - (Math.abs(improvement) * 2)) // More consistent = less variation
      })
    }

    // Return data in EXACT format expected by Progress page (same as DUMMY_PROGRESS)
    const progressData = {
      userId,
      totalProgressPercent: Math.min(100, Math.round((totalInteractions / 50) * 100)), // Assume 50 total for now
      correctAnswers,
      incorrectAnswers,
      unattemptedQuestions: Math.max(0, 100 - totalInteractions),
      questionsAnsweredToday,
      streak: (() => {
        // Calculate real streak based on consecutive days with correct answers
        const sortedInteractions = interactions?.sort((a, b) => 
          new Date(b.attempted_at).getTime() - new Date(a.attempted_at).getTime()
        ) || []
        
        let currentStreak = 0
        const seenDates = new Set()
        
        for (const interaction of sortedInteractions) {
          const dateStr = interaction.attempted_at?.split('T')[0]
          if (!dateStr || seenDates.has(dateStr)) continue
          
          seenDates.add(dateStr)
          
          // Check if there were any correct answers on this day
          const dayInteractions = interactions?.filter(i => 
            i.attempted_at?.startsWith(dateStr)
          ) || []
          const hasCorrectAnswer = dayInteractions.some(i => i.is_correct)
          
          if (hasCorrectAnswer) {
            currentStreak++
          } else {
            break // Streak broken
          }
        }
        
        return currentStreak
      })(),
      averageScore,
      rank: Math.max(1, 500 - averageScore * 4), // Mock ranking
      projectedScore: Math.min(1600, Math.max(400, 400 + averageScore * 12)),
      speed: Math.min(100, Math.max(20, 100 - averageTime * 2)),
      
      // Calculate real difficulty-based breakdowns
      easyAccuracy: (() => {
        const easyInteractions = interactions?.filter(i => i.level === 'easy') || []
        return easyInteractions.length > 0 ? 
          Math.round((easyInteractions.filter(i => i.is_correct).length / easyInteractions.length) * 100) : 0
      })(),
      easyAvgTime: (() => {
        const easyInteractions = interactions?.filter(i => i.level === 'easy') || []
        return easyInteractions.length > 0 ?
          Math.round((easyInteractions.reduce((sum, i) => sum + (i.duration_seconds || 0), 0) / easyInteractions.length) * 10) / 10 : 0
      })(),
      easyCompleted: interactions?.filter(i => i.level === 'easy').length || 0,
      easyTotal: Math.max(50, interactions?.filter(i => i.level === 'easy').length || 0),
      
      mediumAccuracy: (() => {
        const mediumInteractions = interactions?.filter(i => i.level === 'medium') || []
        return mediumInteractions.length > 0 ? 
          Math.round((mediumInteractions.filter(i => i.is_correct).length / mediumInteractions.length) * 100) : 0
      })(),
      mediumAvgTime: (() => {
        const mediumInteractions = interactions?.filter(i => i.level === 'medium') || []
        return mediumInteractions.length > 0 ?
          Math.round((mediumInteractions.reduce((sum, i) => sum + (i.duration_seconds || 0), 0) / mediumInteractions.length) * 10) / 10 : 0
      })(),
      mediumCompleted: interactions?.filter(i => i.level === 'medium').length || 0,
      mediumTotal: Math.max(50, interactions?.filter(i => i.level === 'medium').length || 0),
      
      hardAccuracy: (() => {
        const hardInteractions = interactions?.filter(i => i.level === 'difficult' || i.level === 'hard') || []
        return hardInteractions.length > 0 ? 
          Math.round((hardInteractions.filter(i => i.is_correct).length / hardInteractions.length) * 100) : 0
      })(),
      hardAvgTime: (() => {
        const hardInteractions = interactions?.filter(i => i.level === 'difficult' || i.level === 'hard') || []
        return hardInteractions.length > 0 ?
          Math.round((hardInteractions.reduce((sum, i) => sum + (i.duration_seconds || 0), 0) / hardInteractions.length) * 10) / 10 : 0
      })(),
      hardCompleted: interactions?.filter(i => i.level === 'difficult' || i.level === 'hard').length || 0,
      hardTotal: Math.max(30, interactions?.filter(i => i.level === 'difficult' || i.level === 'hard').length || 0),
      
      goalAchievementPercent: Math.round(averageScore * 0.8),
      averageTime,
      correctAnswerAvgTime,
      incorrectAnswerAvgTime,
      longestQuestionTime,
      
      // Performance data
      performanceGraph,
      skillAnalytics,
      
      // Metadata
      dataSource: 'real_interactions',
      totalInteractions
    }

    console.log(`✅ Progress data calculated for ${totalInteractions} interactions`)

    return new Response(
      JSON.stringify({ 
        success: true,
        data: progressData
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('💥 Progress error:', error)
    
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