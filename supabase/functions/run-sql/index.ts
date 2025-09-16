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
    console.log('🚀 Running SQL to insert interactive questions...')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🧹 Cleaning up existing CORE questions...')
    
    // Delete existing interactive solutions first
    await supabase
      .from('interactive_solutions')
      .delete()
      .in('question_id', supabase.from('questions').select('id').like('public_id', 'CORE-%'))
    
    // Delete existing CORE questions
    await supabase
      .from('questions')
      .delete()
      .like('public_id', 'CORE-%')

    console.log('💾 Inserting new interactive question...')
    
    // Insert the question
    const { data: question, error: qError } = await supabase
      .from('questions')
      .insert({
        public_id: 'CORE-001-INTERACTIVE',
        pack_id: 'ecc14889-72b7-4e19-87a2-ceef01918429',
        question_number: 5001,
        content: 'If 3x + 5 = 17, what is the value of x?',
        question_type: 'multiple_choice',
        subject: 'math',
        topic: 'Linear Equations',
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
        has_interactive: true,
        status: 'published'
      })
      .select('id')
      .single()

    if (qError) {
      console.error('❌ Question insert error:', qError)
      throw new Error(`Question insert failed: ${qError.message}`)
    }

    console.log('✅ Question inserted with ID:', question.id)

    console.log('💾 Inserting interactive solution...')
    
    // Insert the interactive solution
    const { error: iError } = await supabase
      .from('interactive_solutions')
      .insert({
        question_id: question.id,
        has_interactive_graph: false,
        render_payload: {
          solutionSteps: [
            {
              id: "step-1",
              title: "Start with the Equation",
              explanation: "We have the linear equation 3x + 5 = 17"
            },
            {
              id: "step-2",
              title: "Subtract 5 from Both Sides",
              explanation: "Subtracting 5 from both sides: (3x + 5) - 5 = 17 - 5 which gives us 3x = 12"
            },
            {
              id: "step-3",
              title: "Divide Both Sides by 3",
              explanation: "Dividing both sides by 3: 3x ÷ 3 = 12 ÷ 3 which gives us x = 4"
            }
          ],
          algebraSteps: true,
          showWork: true,
          allowInputValidation: true
        }
      })

    if (iError) {
      console.error('❌ Interactive solution error:', iError)
      console.log('⚠️ Continuing without interactive solution...')
    } else {
      console.log('✅ Interactive solution inserted')
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Interactive question and solution inserted successfully",
        questionId: question.id,
        hasInteractiveSolution: !iError
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('💥 Error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: 'Failed to insert interactive question'
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