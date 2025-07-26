
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, BarChart2, MessageCircle, Bot, Music, Send, X, Pause, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/ThemeContext";
import { useAudio } from "@/contexts/AudioContext";
import { CommunityStats } from "./CommunityStats";
import { SoundsModal } from "./SoundsModal";
import { AIAssistantModal } from "./AIAssistantModal";
import { submitFeedback } from "@/services/feedbackService";
import { useToast } from "@/hooks/use-toast";

interface PracticeFooterProps {
  onToggleCommunityStats: () => void;
  onPrevious: () => void;
  onNext: () => void;
  currentQuestionIndex: number;
  totalQuestions: number;
  showGoToInput: boolean;
  setShowGoToInput: (show: boolean) => void;
  targetQuestion: string;
  setTargetQuestion: (target: string) => void;
  handleGoToQuestion: () => void;
  inputError: string;
  currentQuestionId?: string;
  showCommunityStats: boolean;
  currentQuestionTopic?: string;
  userProgress?: any;
}

const PracticeFooter = ({
  onToggleCommunityStats,
  onPrevious,
  onNext,
  currentQuestionIndex,
  totalQuestions,
  showGoToInput,
  setShowGoToInput,
  targetQuestion,
  setTargetQuestion,
  handleGoToQuestion,
  inputError,
  currentQuestionId = "sample-question",
  showCommunityStats,
  currentQuestionTopic = "General",
  userProgress,
}: PracticeFooterProps) => {
  const { isDarkMode } = useTheme();
  const { toast } = useToast();
  const { currentSound, isPlaying, pauseSound, resumeSound } = useAudio();
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [showSoundsModal, setShowSoundsModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  
  const handleAudioToggle = () => {
    if (isPlaying) {
      pauseSound();
    } else {
      resumeSound();
    }
  };
  
  const handleSubmitComment = async () => {
    if (!comment.trim()) return;
    
    try {
      await submitFeedback({
        questionId: currentQuestionId,
        comment: comment.trim(),
        timestamp: new Date().toISOString()
      });
      
      // Reset and close
      setComment("");
      setShowComments(false);
      
      // Show success toast
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! It helps us improve.",
        variant: "default"
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      {/* Footer Navigation */}
      <div className={`fixed bottom-0 left-0 right-0 border-t transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900 border-green-500/30' : 'bg-white border-gray-200'
      } z-10`}>
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          {/* Left: Comment + Community Stats */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center gap-2 transition-colors ${
                isDarkMode ? 'text-green-400 hover:text-green-300 hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <MessageCircle className={`h-4 w-4 ${
                isDarkMode 
                  ? 'text-green-400' 
                  : 'text-blue-600'
              }`} />
              <span className={`hidden sm:inline ${isDarkMode ? 'text-green-400' : 'text-gray-700'}`}>Comments</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCommunityStats}
              className={`flex items-center gap-2 transition-colors ${
                isDarkMode ? 'text-green-400 hover:text-green-300 hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <BarChart2 className={`h-4 w-4 ${
                isDarkMode 
                  ? 'text-green-400' 
                  : 'text-blue-600'
              }`} />
              <span className={`hidden sm:inline ${isDarkMode ? 'text-green-400' : 'text-gray-700'}`}>Community Stats</span>
            </Button>
          </div>

          {/* Center: Navigation Controls */}
          <div className="flex items-center gap-3">
            {/* Previous Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrevious}
              disabled={currentQuestionIndex === 0}
              className={`flex items-center gap-2 transition-colors rounded-full ${
                isDarkMode 
                  ? 'bg-gray-900 text-green-400 hover:bg-gray-800 disabled:bg-gray-900 disabled:text-green-600/50' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {/* Question Counter & Go To */}
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium px-3 py-1 rounded-full border ${
                isDarkMode ? 'bg-gray-900 text-green-400 border-green-500/30' : 'bg-gray-100 text-gray-700'
              }`}>
                {currentQuestionIndex + 1} of {totalQuestions}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGoToInput(!showGoToInput)}
                className={`p-2 transition-colors ${
                  isDarkMode ? 'text-green-400 hover:text-green-300 hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Search className={`h-4 w-4 ${
                  isDarkMode 
                    ? 'text-green-400' 
                    : 'text-blue-600'
                }`} />
              </Button>
            </div>

            {/* Next Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onNext}
              disabled={currentQuestionIndex === totalQuestions - 1}
              className={`flex items-center gap-2 transition-colors rounded-full ${
                isDarkMode 
                  ? 'bg-gray-900 text-green-400 hover:bg-gray-800 disabled:bg-gray-900 disabled:text-green-600/50' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400'
              }`}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Right: Music + AI */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSoundsModal(true)}
                className={`flex items-center gap-2 transition-colors ${
                  isDarkMode ? 'text-green-400 hover:text-green-300 hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Music className={`h-4 w-4 ${
                  isDarkMode 
                    ? 'text-green-400' 
                    : 'text-blue-600'
                }`} />
                <span className={`hidden sm:inline ${isDarkMode ? 'text-green-400' : 'text-gray-700'}`}>Sounds</span>
              </Button>
              
              {/* Pause/Resume button when there's a current sound */}
              {currentSound && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAudioToggle}
                  className={`p-2 transition-colors ${
                    isDarkMode ? 'text-green-400 hover:text-green-300 hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  title={isPlaying ? "Pause audio" : "Resume audio"}
                >
                  {isPlaying ? (
                    <Pause className={`h-4 w-4 ${
                      isDarkMode 
                        ? 'text-green-400' 
                        : 'text-blue-600'
                    }`} />
                  ) : (
                    <Play className={`h-4 w-4 ${
                      isDarkMode 
                        ? 'text-green-400' 
                        : 'text-blue-600'
                    }`} />
                  )}
                </Button>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAIModal(true)}
              className={`flex items-center gap-2 transition-colors ${
                isDarkMode ? 'text-green-400 hover:text-green-300 hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Bot className={`h-4 w-4 ${
                isDarkMode 
                  ? 'text-green-400' 
                  : 'text-blue-600'
              }`} />
              <span className={`hidden sm:inline ${isDarkMode ? 'text-green-400' : 'text-gray-700'}`}>AI</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Community Stats Display */}
      {showCommunityStats && (
        <div className={`fixed bottom-24 left-4 animate-in fade-in slide-in-from-left-5 z-20`}>
          <CommunityStats questionId={currentQuestionId} />
        </div>
      )}

      {/* Comments Input */}
      {showComments && (
        <div className={`fixed bottom-24 left-4 border rounded-lg shadow-lg p-4 w-80 max-w-[calc(100vw-2rem)] animate-in fade-in slide-in-from-bottom-5 z-20 transition-colors ${
          isDarkMode ? 'bg-gray-900 border-green-500/30' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-gray-900'}`}>Share your feedback</h4>
            <Button
              onClick={() => setShowComments(false)}
              variant="ghost"
              className={`p-1 h-6 w-6 rounded-full ${
                isDarkMode ? 'hover:bg-gray-800 text-green-500' : 'hover:bg-gray-100 text-gray-500'
              }`}
              size="sm"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us what you think about this question..."
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 resize-none transition-colors ${
              isDarkMode 
                ? 'bg-gray-900 border-green-500/30 text-green-400 placeholder-green-600 focus:ring-green-500 focus:border-green-500' 
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-transparent'
            }`}
            rows={3}
            maxLength={500}
          />
          
          <div className="flex justify-between items-center mt-3">
            <span className={`text-xs ${isDarkMode ? 'text-green-500' : 'text-gray-500'}`}>{comment.length}/500</span>
            <Button
              onClick={handleSubmitComment}
              disabled={!comment.trim()}
              className={`rounded-full px-4 py-1 h-8 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                isDarkMode 
                  ? 'bg-green-600 hover:bg-green-700 text-white border-green-500/30' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              size="sm"
            >
              <Send className="h-3 w-3" />
              <span className="text-xs">Send</span>
            </Button>
          </div>
        </div>
      )}

      {/* Go to Question Popup */}
      {showGoToInput && (
        <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 border rounded-lg shadow-lg p-4 w-64 animate-in fade-in slide-in-from-bottom-5 z-20 transition-colors ${
          isDarkMode ? 'bg-gray-900 border-green-500/30' : 'bg-white border-gray-300'
        }`}>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                max={totalQuestions}
                value={targetQuestion}
                onChange={(e) => {
                  setTargetQuestion(e.target.value);
                }}
                className={`w-full px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-900 border-green-500/30 text-green-400 placeholder-green-600' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder={`Enter question (1-${totalQuestions})`}
                onKeyPress={(e) => e.key === 'Enter' && handleGoToQuestion()}
              />
            </div>
            {inputError && (
              <div className="text-sm text-red-500">{inputError}</div>
            )}
            <Button 
              variant="default" 
              size="sm" 
              className={`w-full transition-colors ${
                isDarkMode 
                  ? 'bg-green-600 hover:bg-green-700 text-white border-green-500/30' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              onClick={handleGoToQuestion}
            >
              Go
            </Button>
          </div>
        </div>
      )}

      {/* Sounds Modal */}
      <SoundsModal 
        open={showSoundsModal} 
        onOpenChange={setShowSoundsModal} 
      />

      {/* AI Assistant Modal */}
      <AIAssistantModal
        open={showAIModal}
        onOpenChange={setShowAIModal}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        currentQuestionTopic={currentQuestionTopic}
        userProgress={userProgress}
      />
    </>
  );
};

export default PracticeFooter;
