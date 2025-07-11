
interface DeepSeekResponse {
  analysis: string;
  success: boolean;
}

interface DeepSeekRequest {
  query: string;
  context: string;
}

const DEEPSEEK_API_KEY = "f6a4c847a62a4ea5a260c013913c286b";
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

export const analyzeWithDeepSeek = async (request: DeepSeekRequest): Promise<DeepSeekResponse> => {
  try {
    const systemPrompt = getSystemPrompt(request.context);
    
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: request.query
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      return {
        analysis: data.choices[0].message.content,
        success: true
      };
    } else {
      throw new Error('No response from AI');
    }
  } catch (error) {
    console.error('DeepSeek API error:', error);
    
    // Fallback response
    return {
      analysis: `I'm here to help you with your ${request.context === 'study_plan_generation' ? 'study planning' : 'learning'} needs! While I'm having trouble connecting right now, I can still provide guidance. Please describe your learning goals, subjects you're working on, or specific challenges you're facing, and I'll do my best to help you create an effective study plan.`,
      success: false
    };
  }
};

function getSystemPrompt(context: string): string {
  switch (context) {
    case 'study_plan_generation':
      return `You are an expert educational AI assistant specialized in creating personalized study plans for students. Your role is to:

1. Analyze the student's goals, subjects, and available time
2. Create structured, actionable study plans with specific timelines
3. Provide learning strategies tailored to different subjects (SAT, ACT, AP courses, etc.)
4. Suggest effective study techniques and resources
5. Help students balance multiple subjects and extracurricular activities

Always respond with practical, encouraging advice formatted in a clear, organized manner. Include specific recommendations for daily/weekly schedules when appropriate.`;

    case 'practice':
      return `You are an AI tutor helping students with practice questions and learning. Provide:

1. Explanations for concepts students are struggling with
2. Study strategies for improving performance
3. Tips for time management during practice
4. Encouragement and motivation
5. Suggestions for areas that need more focus

Keep responses concise but helpful, focusing on actionable advice.`;

    default:
      return `You are a helpful AI educational assistant. Provide clear, encouraging, and practical advice to help students achieve their learning goals.`;
  }
}
