
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, MessageCircle, Bot } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/ThemeContext";

interface PracticeFooterProps {
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
}

const PracticeFooter = ({
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
}: PracticeFooterProps) => {
  const { isDarkMode } = useTheme();

  return (
    <>
      {/* Footer Navigation */}
      <div 
        className="fixed bottom-0 left-0 right-0 border-t transition-colors duration-300 z-10"
        style={{
          backgroundImage: 'url(/resources/mywall.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          borderColor: 'rgba(255, 107, 53, 0.3)',
          backdropFilter: 'blur(2px) saturate(120%)',
          WebkitBackdropFilter: 'blur(2px) saturate(120%)',
          boxShadow: '0 -8px 32px rgba(255, 107, 53, 0.2), 0 0 40px rgba(255, 140, 66, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.18)'
        }}
      >
        <div className="flex items-center justify-center px-4 sm:px-6 py-3 relative z-10">
          {/* Navigation Controls Only */}
          <div className="flex items-center gap-4">
            {/* Previous Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 transition-colors rounded-full bg-white/20 text-white hover:bg-white/30 disabled:bg-white/10 disabled:text-white/50"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {/* Question Counter & Go To */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium px-3 py-1 rounded-full bg-white/20 text-white border border-white/30">
                {currentQuestionIndex + 1} of {totalQuestions}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGoToInput(!showGoToInput)}
                className="p-2 transition-colors text-white hover:bg-white/20"
              >
                <Search className="h-4 w-4 text-orange-500" />
              </Button>
            </div>

            {/* Next Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onNext}
              disabled={currentQuestionIndex === totalQuestions - 1}
              className="flex items-center gap-2 transition-colors rounded-full bg-white/20 text-white hover:bg-white/30 disabled:bg-white/10 disabled:text-white/50"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Feedback Icon - Left Bottom Corner */}
      <div className="fixed bottom-6 left-6 z-30">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-2 border-white/20"
          style={{
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4), 0 0 20px rgba(59, 130, 246, 0.2)'
          }}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>


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
              <div className="text-sm text-blue-500">{inputError}</div>
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

    </>
  );
};

export default PracticeFooter;
