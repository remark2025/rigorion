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
    console.log('🚀 Starting MINIMAL database population test...')
    
    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Skip reading request body entirely to avoid iteration error
    console.log('📦 Skipping request body processing...')
    
    // Get pack ID - use fallback directly to avoid any potential issues
    const packId = '123e4567-e89b-12d3-a456-426614174000' // hardcoded UUID

    // HARDCODED SINGLE QUESTION TEST
    const questionData = {
      public_id: 'CORE-001-TEST',
      pack_id: packId,
      question_number: 4000,
      content: 'If 3x + 5 = 17, what is the value of x?',
      question_type: 'multiple_choice',
      subject: 'math',
      topic: 'Linear Equations',
      subtopic: null,
      difficulty: 'easy',
      choices: [
        {"id": "A", "text": "3"},
        {"id": "B", "text": "4"},
        {"id": "C", "text": "5"},
        {"id": "D", "text": "6"}
      ],
      correct_answer: '4',
      solution_text: '3x + 5 = 17 → 3x = 12 → x = 4',
      explanation: 'Solving for x: subtract 5 from both sides, then divide by 3.',
      hint: 'To solve for x, first subtract 5 from both sides, then divide by 3.',
      calculator_allowed: false,
      estimated_time: 60,
      key_phrases: [],
      has_interactive: true,
      status: 'published'
    }

    console.log('💾 Inserting hardcoded test question...')
    
    // Clean up existing test question
    await supabase
      .from('questions')
      .delete()
      .eq('public_id', 'CORE-001-TEST')

    // Insert the test question
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .insert(questionData)
      .select('id')
      .single()

    if (questionError) {
      console.error('❌ Question error:', questionError)
      throw new Error(`Question insert failed: ${questionError.message}`)
    }

    console.log('✅ Question inserted:', question.id)

    // Insert interactive solution - SIMPLIFIED
    const interactiveSolutionData = {
      question_id: question.id,
      has_interactive_graph: false,
      render_payload: {
        "algebraSteps": true,
        "showWork": true,
        "allowInputValidation": true,
        "solutionSteps": [
          {
            "id": "step-1",
            "title": "Start with the Equation",
            "explanation": "We have 3x + 5 = 17"
          },
          {
            "id": "step-2", 
            "title": "Subtract 5",
            "explanation": "3x = 12"
          },
          {
            "id": "step-3",
            "title": "Divide by 3", 
            "explanation": "x = 4"
          }
        ]
      }
    }

    console.log('💾 Inserting interactive solution...')
    
    const { error: interactiveError } = await supabase
      .from('interactive_solutions')
      .insert(interactiveSolutionData)

    if (interactiveError) {
      console.error('❌ Interactive solution error:', interactiveError)
      console.log('⚠️ Continuing without interactive solution...')
    } else {
      console.log('✅ Interactive solution inserted')
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        results: {
          questionsInserted: 1,
          interactiveSolutionsInserted: interactiveError ? 0 : 1,
          errors: interactiveError ? [`Interactive: ${interactiveError.message}`] : []
        },
        message: "Test question inserted successfully"
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
        success: false,
        error: error.message,
        details: 'Failed to insert test question'
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