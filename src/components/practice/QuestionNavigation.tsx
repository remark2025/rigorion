
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, ArrowRight as GoIcon } from "lucide-react";

interface QuestionNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  goToQuestion: string;
  onGoToQuestionChange: (value: string) => void;
  onGoToQuestion: () => void;
  currentIndex: number;
  totalQuestions: number;
  questionId?: string;
}

export const QuestionNavigation = ({
  onPrevious,
  onNext,
  goToQuestion,
  onGoToQuestionChange,
  onGoToQuestion,
  currentIndex,
  totalQuestions,
  questionId,
}: QuestionNavigationProps) => {
  return (
    <div className="flex items-center justify-between mt-8 gap-4">
      <Button
        variant="outline"
        onClick={onPrevious}
        className="!rounded-l-full !rounded-r-none border-[#48D1CC] bg-[#48D1CC] hover:bg-[#48D1CC]/90"
        disabled={currentIndex === 0}
      >
        <ArrowLeft className="h-4 w-4 text-black font-normal" />
      </Button>

      <div className="flex-1 max-w-[300px] flex items-center gap-2">
        <span className="text-sm text-gray-600">
          Question {currentIndex + 1} of {totalQuestions}
          {questionId && <span className="ml-2 text-xs text-gray-500">({questionId})</span>}
        </span>
        <div className="relative flex-1">
          <Input
            type="number"
            placeholder="Go to question..."
            value={goToQuestion}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || (Number(value) >= 1 && Number(value) <= totalQuestions)) {
                onGoToQuestionChange(value);
              }
            }}
            min={1}
            max={totalQuestions}
            className="rounded-full border-[#48D1CC] pr-10"
            onKeyUp={(e) => e.key === "Enter" && onGoToQuestion()}
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-[#48D1CC]/10"
            onClick={onGoToQuestion}
          >
            <GoIcon className="h-4 w-4 text-black font-normal" />
          </Button>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={onNext}
        className="!rounded-r-full !rounded-l-none border-[#48D1CC] bg-[#48D1CC] hover:bg-[#48D1CC]/90"
        disabled={currentIndex === totalQuestions - 1}
      >
        <ArrowRight className="h-4 w-4 text-black font-normal" />
      </Button>
    </div>
  );
};

export default QuestionNavigation;
