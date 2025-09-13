// Edge Function to get questions directly from database
// This bypasses PostgREST completely

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
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
        content_packs!inner(title, slug),
        passages(title, content, reference_id),
        graphs(title, svg_data, is_interactive),
        solution_steps(step_number, title, description, step_type, explanation, hint, from_expression, to_expression),
        interactive_solutions(id, solution_type, has_interactive_graph, graph_config, parameters, interactive_steps, assessment_points, render_payload)
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Database error:', error)
      throw error
    }

    console.log(`✅ Found ${questions?.length || 0} questions`)

    // Transform for frontend
    const transformedQuestions = questions?.map(q => ({
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
      
      // Interactive solution
      ...(q.interactive_solutions?.[0] && {
        interactiveSolution: {
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
        }
      }),
      
      // Quote for consistency
      quote: {
        text: "Mathematics is not about numbers, equations, computations, or algorithms: it is about understanding.",
        source: "William Paul Thurston"
      }
    })) || []

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
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})