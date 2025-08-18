import { supabase } from "@/integrations/supabase/client";

export interface FeedbackData {
  questionId?: string;
  comment: string;
  rating?: number;
  feedbackType?: 'general' | 'bug' | 'suggestion' | 'question';
  userEmail?: string;
  userName?: string;
  timestamp?: string;
}

export const submitFeedback = async (feedback: FeedbackData): Promise<void> => {
  try {
    console.log("Submitting feedback:", feedback);
    
    // Submit via edge function for better error handling and security
    const { data, error } = await supabase.functions.invoke('submit-feedback', {
      body: {
        questionId: feedback.questionId,
        comment: feedback.comment,
        rating: feedback.rating,
        feedbackType: feedback.feedbackType || 'general',
        userEmail: feedback.userEmail,
        userName: feedback.userName,
        pageUrl: window.location.href
      }
    });

    if (error) {
      console.error('Feedback submission error:', error);
      
      // Handle rate limiting specifically
      if (error.message?.includes('Daily feedback limit reached')) {
        throw new Error('You have reached the daily feedback limit (5 per day). Please try again tomorrow.');
      }
      
      throw new Error(error.message || 'Failed to submit feedback');
    }

    console.log('Feedback submitted successfully:', data);
    
    // Also store locally as backup
    const existingFeedback = JSON.parse(localStorage.getItem('studentFeedback') || '[]');
    existingFeedback.push({
      ...feedback,
      timestamp: new Date().toISOString(),
      submitted: true
    });
    localStorage.setItem('studentFeedback', JSON.stringify(existingFeedback));
    
  } catch (error) {
    console.error("Error submitting feedback:", error);
    
    // Fallback: store locally if submission fails
    const existingFeedback = JSON.parse(localStorage.getItem('studentFeedback') || '[]');
    existingFeedback.push({
      ...feedback,
      timestamp: new Date().toISOString(),
      submitted: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    localStorage.setItem('studentFeedback', JSON.stringify(existingFeedback));
    
    throw new Error("Failed to submit feedback. Saved locally for retry.");
  }
};

export const getFeedback = (): FeedbackData[] => {
  try {
    return JSON.parse(localStorage.getItem('studentFeedback') || '[]');
  } catch (error) {
    console.error("Error retrieving feedback:", error);
    return [];
  }
};