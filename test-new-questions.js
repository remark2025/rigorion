// Test script to verify new sample questions are accessible via Supabase
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zmsqscxqxlhhehzwbylv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inptc3FzY3hxeGxoaGVoendieWx2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTI2MjA0OSwiZXhwIjoyMDcwODM4MDQ5fQ.jO6Ma55TN_3S3KL2GWAtYWWBau_XhSuaQDnAi7EO3Xk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testNewQuestions() {
  try {
    console.log('Testing database connection and new sample questions...');
    
    // Test 1: Check if new tables exist and get questions
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select(`
        public_id,
        content,
        difficulty,
        has_interactive,
        choices,
        correct_answer,
        solution_text,
        content_packs!inner(title)
      `)
      .limit(5);
    
    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
      return;
    }
    
    console.log('✅ Successfully connected to database');
    console.log(`Found ${questions?.length || 0} questions in database:`);
    
    questions?.forEach(q => {
      console.log(`- ID: ${q.public_id}`);
      console.log(`  Content: ${q.content.substring(0, 80)}...`);
      console.log(`  Interactive: ${q.has_interactive ? 'Yes' : 'No'}`);
      console.log(`  Pack: ${q.content_packs?.title}`);
      console.log(`  Choices: ${q.choices ? Object.keys(q.choices).length : 0}`);
      console.log('');
    });
    
    // Test 2: Check for our specific sample question with full data
    const { data: sampleQuestion, error: sampleError } = await supabase
      .from('questions')
      .select(`
        *,
        interactive_solutions(*),
        solution_steps(*),
        content_packs(title),
        passages(title, content),
        graphs(title, svg_data, is_interactive)
      `)
      .eq('public_id', 'MATH-ALG-QUAD-001')
      .single();
    
    if (!sampleError && sampleQuestion) {
      console.log('🎯 FOUND THE NEW INTERACTIVE SAMPLE QUESTION!');
      console.log(`Question ID: ${sampleQuestion.public_id}`);
      console.log(`Content: ${sampleQuestion.content}`);
      console.log(`Pack: ${sampleQuestion.content_packs?.title}`);
      console.log(`Interactive: ${sampleQuestion.has_interactive}`);
      console.log(`Difficulty: ${sampleQuestion.difficulty}`);
      console.log(`Choices: ${sampleQuestion.choices?.length || 0} options`);
      console.log(`Solution Steps: ${sampleQuestion.solution_steps?.length || 0}`);
      console.log(`Interactive Solutions: ${sampleQuestion.interactive_solutions?.length || 0}`);
      console.log(`Passage: ${sampleQuestion.passages?.title || 'None'}`);
      console.log(`Graph: ${sampleQuestion.graphs?.title || 'None'}`);
      
      if (sampleQuestion.interactive_solutions?.[0]?.render_payload) {
        console.log('✅ Render payload is available for frontend!');
        console.log('Render payload preview:', JSON.stringify(sampleQuestion.interactive_solutions[0].render_payload, null, 2));
      }
      
      // This is the structure we need for the frontend
      console.log('\n📊 FRONTEND-READY STRUCTURE:');
      console.log(JSON.stringify({
        id: sampleQuestion.public_id,
        content: sampleQuestion.content,
        difficulty: sampleQuestion.difficulty,
        choices: sampleQuestion.choices,
        correctAnswer: sampleQuestion.correct_answer,
        solution: sampleQuestion.solution_text,
        explanation: sampleQuestion.explanation,
        hint: sampleQuestion.hint,
        hasInteractive: sampleQuestion.has_interactive,
        interactiveSolution: sampleQuestion.interactive_solutions?.[0] || null,
        solutionSteps: sampleQuestion.solution_steps || [],
        passage: sampleQuestion.passages || null
      }, null, 2));
    } else {
      console.log('❌ Could not find the new sample question');
      if (sampleError) console.error('Error:', sampleError);
    }
    
  } catch (error) {
    console.error('Connection error:', error);
  }
}

testNewQuestions();