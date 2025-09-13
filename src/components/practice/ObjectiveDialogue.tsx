import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface ObjectiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetObjective: (type: "questions" | "time", value: number) => void;
  maxQuestions?: number;
}

const ObjectiveDialog = ({ open, onOpenChange, onSetObjective, maxQuestions = 300 }: ObjectiveDialogProps) => {
  const { isDarkMode } = useTheme();
  const [objectiveType, setObjectiveType] = useState<"questions" | "time">("questions");
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [timeInMinutes, setTimeInMinutes] = useState<number>(30);
  const [questionCountInput, setQuestionCountInput] = useState<string>("10");
  const [timeInput, setTimeInput] = useState<string>("30");
  const [questionError, setQuestionError] = useState<string>("");
  const [timeError, setTimeError] = useState<string>("");

  const validateInput = (value: string, type: "questions" | "time") => {
    // Clear error first
    if (type === "questions") {
      setQuestionError("");
    } else {
      setTimeError("");
    }

    // Allow empty string during typing
    if (value === "") {
      return true;
    }

    // Check for non-numeric characters
    if (!/^\d+$/.test(value)) {
      const errorMsg = `Please enter a valid number between 1-${type === "questions" ? maxQuestions : 1440}`;
      if (type === "questions") {
        setQuestionError(errorMsg);
      } else {
        setTimeError(errorMsg);
      }
      return false;
    }

    const parsed = parseInt(value);
    const max = type === "questions" ? maxQuestions : 1440; // 24 hours max for time

    // Check for negative or zero
    if (parsed < 1) {
      const errorMsg = `Please enter a valid number between 1-${max}`;
      if (type === "questions") {
        setQuestionError(errorMsg);
      } else {
        setTimeError(errorMsg);
      }
      return false;
    }

    // Check for exceeding maximum
    if (parsed > max) {
      const errorMsg = `Please enter a valid number between 1-${max}`;
      if (type === "questions") {
        setQuestionError(errorMsg);
      } else {
        setTimeError(errorMsg);
      }
      return false;
    }

    return true;
  };

  const handleQuestionCountChange = (value: string) => {
    // Only allow digits and empty string
    if (value === "" || /^\d+$/.test(value)) {
      setQuestionCountInput(value);
      
      if (validateInput(value, "questions")) {
        const parsed = parseInt(value);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= maxQuestions) {
          setQuestionCount(parsed);
        }
      }
    }
  };

  const handleQuestionCountBlur = () => {
    if (questionCountInput === "") {
      setQuestionCountInput("1");
      setQuestionCount(1);
      setQuestionError("");
      return;
    }

    const parsed = parseInt(questionCountInput);
    if (isNaN(parsed) || parsed < 1) {
      setQuestionCountInput("1");
      setQuestionCount(1);
      setQuestionError("");
    } else if (parsed > maxQuestions) {
      setQuestionCountInput(maxQuestions.toString());
      setQuestionCount(maxQuestions);
      setQuestionError("");
    } else {
      setQuestionCount(parsed);
      setQuestionError("");
    }
  };

  const handleTimeChange = (value: string) => {
    // Only allow digits and empty string
    if (value === "" || /^\d+$/.test(value)) {
      setTimeInput(value);
      
      if (validateInput(value, "time")) {
        const parsed = parseInt(value);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 1440) {
          setTimeInMinutes(parsed);
        }
      }
    }
  };

  const handleTimeBlur = () => {
    if (timeInput === "") {
      setTimeInput("1");
      setTimeInMinutes(1);
      setTimeError("");
      return;
    }

    const parsed = parseInt(timeInput);
    if (isNaN(parsed) || parsed < 1) {
      setTimeInput("1");
      setTimeInMinutes(1);
      setTimeError("");
    } else if (parsed > 1440) {
      setTimeInput("1440");
      setTimeInMinutes(1440);
      setTimeError("");
    } else {
      setTimeInMinutes(parsed);
      setTimeError("");
    }
  };

  const handleSetObjective = () => {
    // Ensure final validation before setting objective
    handleQuestionCountBlur();
    handleTimeBlur();
    
    // Check if there are any errors
    if (questionError || timeError) {
      return; // Don't proceed if there are validation errors
    }
    
    if (objectiveType === "questions") {
      const finalQuestionCount = Math.max(1, Math.min(maxQuestions, parseInt(questionCountInput) || 1));
      onSetObjective("questions", finalQuestionCount);
    } else {
      const finalTimeInMinutes = Math.max(1, Math.min(1440, parseInt(timeInput) || 1));
      onSetObjective("time", finalTimeInMinutes * 60); // Convert to seconds
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-md p-0 overflow-hidden rounded-xl transition-colors ${
        isDarkMode ? 'bg-gray-900 border border-green-500/30' : 'bg-white border border-gray-200'
      }`}>
        <div className="p-6">
          <div className="mb-3">
            <DialogTitle className={`text-xl font-medium ${
              isDarkMode ? 'text-green-400' : 'text-black'
            }`}>Set Your Practice Objective</DialogTitle>
          </div>
          
          <Tabs defaultValue="questions" onValueChange={(value) => setObjectiveType(value as "questions" | "time")} className="mb-6">
            <TabsList className={`grid w-full grid-cols-2 rounded-lg p-1 ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <TabsTrigger value="questions" className={`rounded-md ${
                isDarkMode 
                  ? 'data-[state=active]:bg-gray-900 data-[state=active]:text-green-400 text-gray-400' 
                  : 'data-[state=active]:bg-white data-[state=active]:text-black text-gray-600'
              }`}>Questions</TabsTrigger>
              <TabsTrigger value="time" className={`rounded-md ${
                isDarkMode 
                  ? 'data-[state=active]:bg-gray-900 data-[state=active]:text-green-400 text-gray-400' 
                  : 'data-[state=active]:bg-white data-[state=active]:text-black text-gray-600'
              }`}>Time</TabsTrigger>
            </TabsList>
            
            <TabsContent value="questions" className="mt-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder={`Number of questions (1-${maxQuestions})`}
                  value={questionCountInput}
                  onChange={(e) => handleQuestionCountChange(e.target.value)}
                  onBlur={handleQuestionCountBlur}
                  className={`w-full rounded-xl transition-colors ${
                    questionError 
                      ? 'border-blue-500 focus:border-blue-500' 
                      : isDarkMode 
                        ? 'bg-gray-800 border-green-500/30 text-green-400 placeholder-green-600' 
                        : 'bg-white border-gray-300 text-black placeholder-gray-500'
                  }`}
                />
                {questionError && (
                  <p className="text-blue-500 text-xs mt-1">{questionError}</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="time" className="mt-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Minutes (1-1440)"
                  value={timeInput}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  onBlur={handleTimeBlur}
                  className={`w-full rounded-xl transition-colors ${
                    timeError 
                      ? 'border-blue-500 focus:border-blue-500' 
                      : isDarkMode 
                        ? 'bg-gray-800 border-green-500/30 text-green-400 placeholder-green-600' 
                        : 'bg-white border-gray-300 text-black placeholder-gray-500'
                  }`}
                />
                {timeError && (
                  <p className="text-blue-500 text-xs mt-1">{timeError}</p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button 
              onClick={handleSetObjective}
              className="rounded-xl px-16 py-2 transition-colors text-black font-semibold"
              style={{
                background: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)'
              }}
            >
              Set Objective
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ObjectiveDialog;
