// Temporary service using Supabase functions to bypass schema cache issue
import { supabase } from '@/integrations/supabase/client';
import { Question } from '@/types/QuestionInterface';

export class FunctionQuestionService {
  /**
   * Get sample question using Supabase function (bypasses schema cache)
   */
  async getSampleQuestion(): Promise<Question | null> {
    try {
      console.log('🔧 Using function-based access to bypass schema cache...');
      
      const { data, error } = await supabase.rpc('get_sample_question');
      
      if (error) {
        console.error('❌ Function call failed:', error);
        return null;
      }
      
      if (!data) {
        console.warn('⚠️ No data returned from function');
        return null;
      }
      
      console.log('✅ Function call successful, raw data:', data);
      
      // Transform the function result to Question format
      const question: Question = {
        id: data.public_id,
        number: 1,
        content: data.content,
        difficulty: data.difficulty as 'easy' | 'medium' | 'hard',
        chapter: 'Interactive Math',
        module: 'All SAT Math',
        bookmarked: false,
        examNumber: 1,
        
        // Answer data
        choices: data.choices ? 
          (Array.isArray(data.choices) ? 
            data.choices.map((choice: any) => choice.text || choice) :
            Object.values(data.choices).map((choice: any) => choice.text || choice)
          ) : [],
        correctAnswer: data.correct_answer,
        solution: data.solution_text || '',
        explanation: data.explanation || '',
        hint: data.hint || '',
        
        // Solution steps from database
        solutionSteps: data.solution_steps ? 
          data.solution_steps.map((step: any) => step.explanation || step.description || step.title) : [],
        
        // Calculator
        calculatorAllowed: data.calculator_allowed || false,
        
        // Interactive solution
        ...(data.interactive_solution && {
          interactiveSolution: {
            hasInteractiveGraph: data.interactive_solution.has_interactive_graph,
            renderPayload: data.interactive_solution.render_payload,
            // Add some basic structure for compatibility
            graphConfig: data.interactive_solution.render_payload?.graph || {},
            parameters: data.interactive_solution.render_payload?.parameters || [],
            solutionSteps: data.solution_steps?.map((step: any, index: number) => ({
              id: `step-${step.step_number || index + 1}`,
              title: step.title,
              description: step.description,
              explanation: step.explanation
            })) || []
          }
        }),
        
        // Quote for consistency
        quote: {
          text: "Mathematics is not about numbers, equations, computations, or algorithms: it is about understanding.",
          source: "William Paul Thurston"
        }
      };
      
      console.log('🎯 Transformed question for frontend:', question);
      return question;
      
    } catch (error) {
      console.error('💥 Function service exception:', error);
      return null;
    }
  }

  /**
   * Test if the function is available
   */
  async testFunction(): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('get_sample_question');
      return !error;
    } catch (error) {
      console.error('Function test failed:', error);
      return false;
    }
  }
}

export const functionQuestionService = new FunctionQuestionService();