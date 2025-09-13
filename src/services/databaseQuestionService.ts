// Service to fetch questions from the new Supabase database schema
import { supabase } from '@/integrations/supabase/client';
import { Question } from '@/types/QuestionInterface';

export interface DatabaseQuestion {
  id: string;
  public_id: string;
  content: string;
  question_type: string;
  subject: string;
  topic?: string;
  subtopic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  choices?: any[];
  correct_answer: string;
  solution_text?: string;
  explanation?: string;
  hint?: string;
  calculator_allowed: boolean;
  estimated_time?: number;
  key_phrases?: string[];
  has_interactive: boolean;
  status: string;
  
  // Related data
  content_packs?: {
    title: string;
    slug: string;
  };
  passages?: {
    title: string;
    content: string;
    reference_id: string;
  };
  graphs?: {
    title: string;
    svg_data?: string;
    is_interactive: boolean;
  };
  solution_steps?: Array<{
    step_number: number;
    title: string;
    description: string;
    step_type: string;
    explanation: string;
    hint?: string;
    from_expression?: any;
    to_expression?: any;
  }>;
  interactive_solutions?: Array<{
    id: string;
    solution_type: string;
    has_interactive_graph: boolean;
    graph_config?: any;
    parameters?: any[];
    interactive_steps?: any[];
    assessment_points?: any[];
    render_payload?: any;
  }>;
}

export class DatabaseQuestionService {
  /**
   * Fetch questions from the new database schema
   */
  async fetchQuestions(limit = 50): Promise<Question[]> {
    try {
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
        .limit(limit);

      if (error) {
        console.error('Error fetching questions from database:', error);
        throw error;
      }

      if (!questions || questions.length === 0) {
        console.warn('No questions found in database');
        return [];
      }

      console.log(`✅ Fetched ${questions.length} questions from database`);
      
      // Transform database questions to frontend format
      return questions.map(q => this.transformDatabaseQuestion(q));
      
    } catch (error) {
      console.error('Database service error:', error);
      throw error;
    }
  }

  /**
   * Fetch a specific question by public_id
   */
  async fetchQuestion(publicId: string): Promise<Question | null> {
    try {
      const { data: question, error } = await supabase
        .from('questions')
        .select(`
          *,
          content_packs!inner(title, slug),
          passages(title, content, reference_id),
          graphs(title, svg_data, is_interactive),
          solution_steps(step_number, title, description, step_type, explanation, hint, from_expression, to_expression),
          interactive_solutions(id, solution_type, has_interactive_graph, graph_config, parameters, interactive_steps, assessment_points, render_payload)
        `)
        .eq('public_id', publicId)
        .eq('status', 'published')
        .single();

      if (error) {
        console.error(`Error fetching question ${publicId}:`, error);
        return null;
      }

      return this.transformDatabaseQuestion(question);
      
    } catch (error) {
      console.error('Database service error:', error);
      return null;
    }
  }

  /**
   * Transform database question to frontend Question interface
   */
  private transformDatabaseQuestion(dbQuestion: any): Question {
    // Sort solution steps by step_number
    const solutionSteps = (dbQuestion.solution_steps || [])
      .sort((a: any, b: any) => a.step_number - b.step_number)
      .map((step: any) => step.explanation || step.description || step.title);

    // Transform choices if they exist
    const choices = dbQuestion.choices ? 
      (Array.isArray(dbQuestion.choices) ? 
        dbQuestion.choices.map((choice: any) => choice.text || choice) :
        Object.values(dbQuestion.choices).map((choice: any) => choice.text || choice)
      ) : [];

    // Get interactive solution data
    const interactiveSolution = dbQuestion.interactive_solutions?.[0];
    
    const transformedQuestion: Question = {
      id: dbQuestion.public_id,
      number: 0, // We'll need to assign this based on order or context
      content: dbQuestion.content,
      difficulty: dbQuestion.difficulty as 'easy' | 'medium' | 'hard',
      chapter: dbQuestion.topic || 'General',
      module: this.mapSubjectToModule(dbQuestion.subject),
      bookmarked: false, // This would come from user preferences
      examNumber: 1, // This would need to be determined based on content pack or other logic
      
      // Answer data
      choices,
      correctAnswer: dbQuestion.correct_answer,
      solution: dbQuestion.solution_text || '',
      explanation: dbQuestion.explanation || '',
      hint: dbQuestion.hint || '',
      
      // Solution steps
      solutionSteps,
      
      // Calculator
      calculatorAllowed: dbQuestion.calculator_allowed,
      
      // Interactive features
      ...(interactiveSolution && {
        interactiveSolution: {
          hasInteractiveGraph: interactiveSolution.has_interactive_graph,
          graphConfig: interactiveSolution.graph_config,
          parameters: interactiveSolution.parameters || [],
          solutionSteps: this.transformInteractiveSteps(dbQuestion.solution_steps || []),
          renderPayload: interactiveSolution.render_payload
        }
      }),
      
      // Passage if exists
      ...(dbQuestion.passages && {
        passage: {
          title: dbQuestion.passages.title,
          content: dbQuestion.passages.content,
          source: dbQuestion.content_packs?.title || 'Database'
        }
      }),
      
      // Additional metadata
      quote: {
        text: "Success is the sum of small efforts repeated day in and day out.",
        source: "Robert Collier"
      }
    };

    return transformedQuestion;
  }

  /**
   * Map database subject to frontend module format
   */
  private mapSubjectToModule(subject: string): string {
    const moduleMap: Record<string, string> = {
      'math': 'All SAT Math',
      'reading': 'SAT Reading',
      'writing': 'SAT Writing',
      'science': 'SAT Science'
    };
    
    return moduleMap[subject] || 'General';
  }

  /**
   * Transform database solution steps to interactive format
   */
  private transformInteractiveSteps(steps: any[]): any[] {
    return steps.map((step, index) => ({
      id: `step-${step.step_number || index + 1}`,
      title: step.title,
      description: step.description,
      fromExpression: step.from_expression,
      toExpression: step.to_expression,
      explanation: step.explanation,
      hint: step.hint
    }));
  }

  /**
   * Test database connection and return basic info
   */
  async testConnection(): Promise<{ success: boolean; questionCount: number; sampleQuestion?: any }> {
    try {
      const { data: questions, error, count } = await supabase
        .from('questions')
        .select('public_id, content, has_interactive', { count: 'exact' })
        .eq('status', 'published')
        .limit(1);

      if (error) {
        return { success: false, questionCount: 0 };
      }

      return {
        success: true,
        questionCount: count || 0,
        sampleQuestion: questions?.[0] || null
      };
    } catch (error) {
      console.error('Connection test failed:', error);
      return { success: false, questionCount: 0 };
    }
  }
}

export const databaseQuestionService = new DatabaseQuestionService();