import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zmsqscxqxlhhehzwbylv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inptc3FzY3hxeGxoaGVoendieWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNjIwNDksImV4cCI6MjA3MDgzODA0OX0.ns8hcVCVuE81-kepvptKwfQtU4fs6_2EaPOZ2whEOIQ';

async function insertInteractiveQuestion() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    console.log('🧹 Cleaning up existing CORE questions...');
    
    // First, get the existing CORE-001 question ID if it exists
    const { data: existingQuestion } = await supabase
      .from('questions')
      .select('id')
      .eq('public_id', 'CORE-001')
      .single();
    
    if (existingQuestion) {
      // Delete existing interactive solutions for this question
      await supabase
        .from('interactive_solutions')
        .delete()
        .eq('question_id', existingQuestion.id);
        
      console.log('✅ Cleaned up existing interactive solutions');
    }

    // Update the existing CORE-001 question to have interactive capabilities
    const { error: updateError } = await supabase
      .from('questions')
      .update({
        has_interactive: true,
        content: 'If 3x + 5 = 17, what is the value of x?'
      })
      .eq('public_id', 'CORE-001');

    if (updateError) {
      console.error('❌ Error updating question:', updateError);
      return;
    }

    console.log('✅ Updated CORE-001 question to be interactive');

    // Now insert the interactive solution
    const { error: iError } = await supabase
      .from('interactive_solutions')
      .insert({
        question_id: existingQuestion.id,
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
      });

    if (iError) {
      console.error('❌ Interactive solution error:', iError);
      return;
    }

    console.log('✅ Interactive solution inserted successfully!');
    console.log('🎉 CORE-001 now has interactive capabilities with renderPayload');
    
    // Verify by fetching the question back
    const { data: verifyQuestion } = await supabase
      .from('questions')
      .select(`
        *,
        interactive_solutions(*)
      `)
      .eq('public_id', 'CORE-001')
      .single();
      
    console.log('🔍 Verification - CORE-001 interactive_solutions:', verifyQuestion?.interactive_solutions);

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

insertInteractiveQuestion();