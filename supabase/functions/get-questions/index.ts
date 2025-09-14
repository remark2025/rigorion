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
    console.log('🚀 Edge Function: get-questions starting...')
    
    // Create Supabase client with service role key for direct database access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🔄 Fetching questions directly from database...')

    // Query the database directly using service role (bypasses RLS)
    const { data: questions, error } = await supabase
      .from('questions')
      .select(`
        *,
        interactive_solutions(*)
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Database error:', error)
      throw error
    }

    console.log(`✅ Found ${questions?.length || 0} questions`)
    
    // Debug: Log the raw data for MATH-LINEAR-001
    const linearQuestion = questions?.find(q => q.public_id === 'MATH-LINEAR-001')
    if (linearQuestion) {
      console.log('🔍 Raw MATH-LINEAR-001 data:', JSON.stringify({
        id: linearQuestion.id,
        public_id: linearQuestion.public_id,
        has_interactive: linearQuestion.has_interactive,
        interactive_solutions: linearQuestion.interactive_solutions
      }, null, 2))
    }

    // Transform for frontend
    const transformedQuestions = questions?.map(q => {
      console.log(`🔧 Processing question ${q.public_id}:`)
      console.log(`   - has_interactive: ${q.has_interactive}`)
      console.log(`   - interactive_solutions count: ${q.interactive_solutions?.length || 0}`)
      if (q.interactive_solutions?.[0]) {
        console.log(`   - has_interactive_graph: ${q.interactive_solutions[0].has_interactive_graph}`)
        console.log(`   - render_payload exists: ${q.interactive_solutions[0].render_payload ? 'YES' : 'NO'}`)
      }
      
      const result = {
        id: q.public_id,
        number: 1,
        content: q.content,
        difficulty: q.difficulty,
        chapter: q.topic || 'Interactive Math',
        module: 'All SAT Math',
        bookmarked: false,
        examNumber: 1,
      
        // Choices
        choices: q.choices ? 
          (Array.isArray(q.choices) ? 
            q.choices.map((choice: any) => choice.text || choice) :
            Object.values(q.choices).map((choice: any) => choice.text || choice)
          ) : [],
        
        // Answer data
        correctAnswer: q.correct_answer,
        solution: q.solution_text || '',
        explanation: q.explanation || '',
        hint: q.hint || '',
        
        // Solution steps
        solutionSteps: q.solution_steps ? 
          q.solution_steps
            .sort((a: any, b: any) => a.step_number - b.step_number)
            .map((step: any) => step.explanation || step.description || step.title) : [],
        
        // Calculator
        calculatorAllowed: q.calculator_allowed || false,
        
        // Interactive solution - explicit mapping
        interactiveSolution: q.interactive_solutions?.[0] ? {
          hasInteractiveGraph: q.interactive_solutions[0].has_interactive_graph,
          graphConfig: q.interactive_solutions[0].graph_config,
          parameters: q.interactive_solutions[0].parameters || [],
          renderPayload: q.interactive_solutions[0].render_payload,
          solutionSteps: q.solution_steps ? 
            q.solution_steps.map((step: any, index: number) => ({
              id: `step-${step.step_number || index + 1}`,
              title: step.title,
              description: step.description,
              explanation: step.explanation,
              hint: step.hint
            })) : []
        } : undefined,
        
        // Quote for consistency
        quote: {
          text: "Mathematics is not about numbers, equations, computations, or algorithms: it is about understanding.",
          source: "William Paul Thurston"
        }
      }
      
      console.log(`   ✅ Question ${q.public_id} transformed with interactiveSolution: ${result.interactiveSolution ? 'YES' : 'NO'}`)
      return result
    }) || []

    console.log(`🎯 Transformed ${transformedQuestions.length} questions for frontend`)

    return new Response(
      JSON.stringify({ 
        questions: transformedQuestions,
        success: true,
        count: transformedQuestions.length 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('💥 Edge function error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        success: false,
        questions: [] 
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