
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timer, Layers, Hand, Clock, FileText, X, Zap } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface ModeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetMode: (mode: "timer" | "level" | "manual" | "pomodoro" | "exam", duration?: number, level?: "easy" | "medium" | "hard") => void;
}

const ModeDialog = ({ open, onOpenChange, onSetMode }: ModeDialogProps) => {
  const { isDarkMode } = useTheme();
  const [selectedMode, setSelectedMode] = useState<"timer" | "level" | "manual" | "pomodoro" | "exam">("timer");
  const [timerDuration, setTimerDuration] = useState(30); // Default minutes
  const [selectedLevel, setSelectedLevel] = useState<"easy" | "medium" | "hard">("easy");

  const handleSetMode = () => {
    let finalDuration: number | undefined;
    
    switch(selectedMode) {
      case "timer":
        finalDuration = timerDuration * 60; // Convert to seconds
        break;
      case "pomodoro":
        finalDuration = 1500; // 25 minutes in seconds
        break;
      case "exam":
        finalDuration = 3600; // 1 hour in seconds
        break;
      default:
        finalDuration = undefined;
    }
    
    onSetMode(selectedMode, finalDuration, selectedMode === "level" ? selectedLevel : undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`sm:max-w-xl p-0 overflow-hidden rounded-xl transition-colors ${
          isDarkMode ? 'bg-gray-900 border border-green-500/30' : 'bg-orange-50 border border-orange-200'
        }`}
      >
        <div className="p-6">
          <div className="mb-3">
            <DialogTitle className={`text-xl font-medium ${
              isDarkMode ? 'text-green-400' : 'text-orange-800'
            }`}>Select Practice Mode</DialogTitle>
          </div>
          
          <div className="mb-6">
            <Tabs defaultValue={selectedMode} className="w-full" onValueChange={(value) => setSelectedMode(value as any)}>
              <TabsList className={`flex w-full rounded-lg p-1 ${
                isDarkMode ? 'bg-gray-800' : 'bg-orange-100'
              }`}>
                <TabsTrigger 
                  value="timer" 
                  className={`flex-1 rounded-md ${
                    isDarkMode 
                      ? 'data-[state=active]:bg-gray-900 data-[state=active]:text-green-400 text-gray-400' 
                      : 'data-[state=active]:bg-orange-200 data-[state=active]:text-orange-800 text-orange-600'
                  }`}
                >
                  <Zap className="h-4 w-4 mr-1" style={{
                    background: isDarkMode ? '' : 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)',
                    WebkitBackgroundClip: isDarkMode ? 'unset' : 'text',
                    WebkitTextFillColor: isDarkMode ? 'inherit' : 'transparent',
                    backgroundClip: isDarkMode ? 'unset' : 'text'
                  }} />
                  Timer
                </TabsTrigger>
                <TabsTrigger 
                  value="level" 
                  className={`flex-1 rounded-md ${
                    isDarkMode 
                      ? 'data-[state=active]:bg-gray-900 data-[state=active]:text-green-400 text-gray-400' 
                      : 'data-[state=active]:bg-orange-200 data-[state=active]:text-orange-800 text-orange-600'
                  }`}
                >
                  <Layers className="h-4 w-4 mr-1" style={{
                    background: isDarkMode ? '' : 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)',
                    WebkitBackgroundClip: isDarkMode ? 'unset' : 'text',
                    WebkitTextFillColor: isDarkMode ? 'inherit' : 'transparent',
                    backgroundClip: isDarkMode ? 'unset' : 'text'
                  }} />
                  Level
                </TabsTrigger>
                <TabsTrigger 
                  value="manual" 
                  className={`flex-1 rounded-md ${
                    isDarkMode 
                      ? 'data-[state=active]:bg-gray-900 data-[state=active]:text-green-400 text-gray-400' 
                      : 'data-[state=active]:bg-orange-200 data-[state=active]:text-orange-800 text-orange-600'
                  }`}
                >
                  <Hand className="h-4 w-4 mr-1" style={{
                    background: isDarkMode ? '' : 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)',
                    WebkitBackgroundClip: isDarkMode ? 'unset' : 'text',
                    WebkitTextFillColor: isDarkMode ? 'inherit' : 'transparent',
                    backgroundClip: isDarkMode ? 'unset' : 'text'
                  }} />
                  Manual
                </TabsTrigger>
                <TabsTrigger 
                  value="pomodoro" 
                  className={`flex-1 rounded-md ${
                    isDarkMode 
                      ? 'data-[state=active]:bg-gray-900 data-[state=active]:text-green-400 text-gray-400' 
                      : 'data-[state=active]:bg-orange-200 data-[state=active]:text-orange-800 text-orange-600'
                  }`}
                >
                  <Clock className="h-4 w-4 mr-1" style={{
                    background: isDarkMode ? '' : 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)',
                    WebkitBackgroundClip: isDarkMode ? 'unset' : 'text',
                    WebkitTextFillColor: isDarkMode ? 'inherit' : 'transparent',
                    backgroundClip: isDarkMode ? 'unset' : 'text'
                  }} />
                  Pomodoro
                </TabsTrigger>
                <TabsTrigger 
                  value="exam" 
                  className={`flex-1 rounded-md ${
                    isDarkMode 
                      ? 'data-[state=active]:bg-gray-900 data-[state=active]:text-green-400 text-gray-400' 
                      : 'data-[state=active]:bg-orange-200 data-[state=active]:text-orange-800 text-orange-600'
                  }`}
                >
                  <FileText className="h-4 w-4 mr-1" style={{
                    background: isDarkMode ? '' : 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)',
                    WebkitBackgroundClip: isDarkMode ? 'unset' : 'text',
                    WebkitTextFillColor: isDarkMode ? 'inherit' : 'transparent',
                    backgroundClip: isDarkMode ? 'unset' : 'text'
                  }} />
                  Exam
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="mb-6">
            {selectedMode === "timer" && (
              <div>
                <Label className={`mb-2 block ${
                  isDarkMode ? 'text-green-400' : 'text-orange-700'
                }`}>Set Timer (Minutes)</Label>
                <Input
                  type="number"
                  placeholder="Minutes"
                  value={timerDuration}
                  onChange={(e) => setTimerDuration(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  className={`w-full rounded-xl ${
                    isDarkMode 
                      ? 'bg-gray-800 border-green-500/30 text-green-400 placeholder-green-600' 
                      : 'bg-orange-50 border-orange-200 text-orange-800 placeholder-orange-500'
                  }`}
                />
                <p className={`text-sm mt-2 ${
                  isDarkMode ? 'text-green-500' : 'text-orange-600'
                }`}>Auto-advances to next question when timer expires</p>
              </div>
            )}

            {selectedMode === "level" && (
              <div>
                <Label className={`mb-3 block ${
                  isDarkMode ? 'text-green-400' : 'text-orange-700'
                }`}>Select Difficulty Level</Label>
                <RadioGroup 
                  value={selectedLevel} 
                  onValueChange={(value) => setSelectedLevel(value as "easy" | "medium" | "hard")}
                  className="flex flex-col space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="easy" id="easy" />
                    <Label htmlFor="easy" className={isDarkMode ? 'text-green-400' : 'text-orange-700'}>Easy - Beginner level questions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium" className={isDarkMode ? 'text-green-400' : 'text-orange-700'}>Medium - Intermediate level questions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hard" id="hard" />
                    <Label htmlFor="hard" className={isDarkMode ? 'text-green-400' : 'text-orange-700'}>Hard - Advanced level questions</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {selectedMode === "pomodoro" && (
              <div>
                <Label className={`mb-2 block ${
                  isDarkMode ? 'text-green-400' : 'text-orange-700'
                }`}>Pomodoro Session</Label>
                <p className={`text-sm ${
                  isDarkMode ? 'text-green-500' : 'text-orange-600'
                }`}>25-minute focused study sessions with 5-minute breaks</p>
              </div>
            )}

            {selectedMode === "exam" && (
              <div>
                <Label className={`mb-2 block ${
                  isDarkMode ? 'text-green-400' : 'text-orange-700'
                }`}>Exam Mode</Label>
                <p className={`text-sm ${
                  isDarkMode ? 'text-green-500' : 'text-orange-600'
                }`}>1-hour timed practice session</p>
              </div>
            )}

            {selectedMode === "manual" && (
              <div>
                <Label className={`mb-2 block ${
                  isDarkMode ? 'text-green-400' : 'text-orange-700'
                }`}>Manual Mode</Label>
                <p className={`text-sm ${
                  isDarkMode ? 'text-green-500' : 'text-orange-600'
                }`}>Navigate questions at your own pace</p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleSetMode}
              className="rounded-xl px-16 py-2 transition-colors text-black font-semibold"
              style={{
                background: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)'
              }}
            >
              Set Mode
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModeDialog;
