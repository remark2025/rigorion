import { supabase } from "@/lib/supabase";

export interface FeedbackData {
  questionId: string;
  comment: string;
  timestamp: string;
}

export const submitFeedback = async (feedback: FeedbackData): Promise<void> => {
  try {
    // For now, log to console - later you can implement database storage
    console.log("Feedback submitted:", feedback);
    
    // TODO: Store in database
    // const { error } = await supabase
    //   .from('feedback')
    //   .insert([{
    //     question_id: feedback.questionId,
    //     comment: feedback.comment,
    //     created_at: feedback.timestamp
    //   }]);
    
    // if (error) throw error;
    
    // For demo purposes, store in localStorage
    const existingFeedback = JSON.parse(localStorage.getItem('studentFeedback') || '[]');
    existingFeedback.push(feedback);
    localStorage.setItem('studentFeedback', JSON.stringify(existingFeedback));
    
  } catch (error) {
    console.error("Error submitting feedback:", error);
    throw new Error("Failed to submit feedback");
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