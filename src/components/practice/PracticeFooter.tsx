
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
          backgroundImage: 'url(/resources/whaiteone.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          borderTop: '2px solid transparent',
          borderImage: 'linear-gradient(90deg, #FB923C 0%, #000000 50%, #EA580C 100%) 1',
          backdropFilter: 'blur(2px) saturate(120%)',
          WebkitBackdropFilter: 'blur(2px) saturate(120%)'
        }}
      >
        <div className="flex items-center justify-center px-4 sm:px-6 py-2 relative z-10">
          {/* Navigation Controls Only */}
          <div className="flex items-center gap-4">
            {/* Previous Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 transition-colors rounded-full hover:scale-105 text-black font-semibold px-4 h-8 disabled:opacity-50"
              style={{
                background: currentQuestionIndex === 0 ? '#E5E7EB' : 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)'
              }}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="text-sm">Previous</span>
            </Button>

            {/* Question Counter & Go To */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium px-3 py-1 rounded-full text-black border h-8 flex items-center" style={{
                background: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)',
                borderColor: '#EA580C'
              }}>
                {currentQuestionIndex + 1} of {totalQuestions}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGoToInput(!showGoToInput)}
                className="p-2 transition-colors hover:scale-105 text-black font-semibold rounded-full h-8 w-8"
                style={{
                  background: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)'
                }}
              >
                <Search className="h-4 w-4 text-black" />
              </Button>
            </div>

            {/* Next Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onNext}
              disabled={currentQuestionIndex === totalQuestions - 1}
              className="flex items-center gap-2 transition-colors rounded-full hover:scale-105 text-black font-semibold px-4 h-8 disabled:opacity-50"
              style={{
                background: currentQuestionIndex === totalQuestions - 1 ? '#E5E7EB' : 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)'
              }}
            >
              <span className="text-sm">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Feedback Icon - Left Bottom Corner */}
      <div className="fixed bottom-6 left-6 z-30">
        <Button
          size="sm"
          className="h-8 w-8 rounded-full transition-all duration-300 hover:scale-110 text-black font-semibold"
          style={{
            background: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)'
          }}
        >
          <MessageCircle className="h-4 w-4 text-black" />
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
