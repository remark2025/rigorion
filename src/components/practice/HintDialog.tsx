
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Lightbulb } from "lucide-react";

interface HintDialogProps {
  hint?: string;
  currentQuestionIndex: number;
}

const HintDialog = ({ hint = "Try breaking down the problem into smaller parts.", currentQuestionIndex }: HintDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hintsUsed, setHintsUsed] = useState<number[]>([]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && !hintsUsed.includes(currentQuestionIndex)) {
      setHintsUsed([...hintsUsed, currentQuestionIndex]);
    }
  };

  // Glowing effect for the lamp icon
  const isHintUsed = hintsUsed.includes(currentQuestionIndex);

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="p-1 h-6 rounded-full"
        >
          <Lightbulb className="h-4 w-4 text-blue-600" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="sm:max-w-[425px] bg-white animate-in fade-in slide-in-from-top-1 duration-300">
        <div className="text-center font-medium mb-2">Hint</div>
        
        <div className="py-2">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-blue-800">{hint || "Think about the problem carefully"}</p>
          </div>
          
          {isHintUsed && (
            <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>You've viewed this hint before</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-end mt-2">
          <Button onClick={() => setIsOpen(false)} variant="outline" size="sm">
            Got it
          </Button>
        </div>
      </PopoverContent>
      
      <style>
        {`
          @keyframes glow {
            0% {
              box-shadow: 0 0 5px 2px rgba(249, 215, 28, 0.2);
            }
            50% {
              box-shadow: 0 0 8px 4px rgba(249, 215, 28, 0.4);
            }
            100% {
              box-shadow: 0 0 5px 2px rgba(249, 215, 28, 0.2);
            }
          }
          
          .hint-glow {
            animation: glow 10s infinite ease-in-out;
          }
        `}
      </style>
    </Popover>
  );
};

export default HintDialog;
