import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coffee, Play, Clock, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PomodoroBreakModalProps {
  open: boolean;
  onResume: () => void;
  breakTimeRemaining: number;
}

const breakTips = [
  "💧 Stay hydrated! Drink a glass of water to keep your brain sharp.",
  "👀 Look away from your screen and focus on something 20 feet away for 20 seconds.",
  "🧘 Take 5 deep breaths to oxygenate your brain and reduce stress.",
  "🚶 Stand up and do some light stretching to improve circulation.",
  "🌱 Step outside for a moment of fresh air if possible.",
  "💪 Do 10 push-ups or jumping jacks to get your blood flowing.",
  "🎵 Listen to your favorite song to boost your mood.",
  "📝 Jot down one thing you're grateful for today.",
  "🤔 Reflect on what you've learned in the last session.",
  "☕ Make yourself a warm drink - tea or coffee can help you refocus.",
  "🎯 Set a small intention for your next study session.",
  "🔄 Do some neck and shoulder rolls to release tension."
];

const PomodoroBreakModal = ({ open, onResume, breakTimeRemaining }: PomodoroBreakModalProps) => {
  const [currentTip, setCurrentTip] = useState("");

  useEffect(() => {
    if (open) {
      // Pick a random break tip when modal opens
      const randomTip = breakTips[Math.floor(Math.random() * breakTips.length)];
      setCurrentTip(randomTip);
    }
  }, [open]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-white border-gray-200">
        <div className="p-6 text-center">
          {/* Break Icon */}
          <div className="mx-auto mb-6 w-16 h-16 rounded-full flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)'
          }}>
            <Coffee className="h-8 w-8 text-white" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-black mb-4">
            Break Time!
          </h2>

          {/* Timer */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-gray-50 rounded-full px-6 py-3 border border-gray-200">
              <Clock className="h-5 w-5 text-gray-600" />
              <span className="text-xl font-mono font-bold text-black">
                {formatTime(breakTimeRemaining)}
              </span>
            </div>
          </div>

          {/* Break Tip */}
          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-black leading-relaxed text-left">
                  {currentTip}
                </p>
              </div>
            </div>
          </div>

          {/* Resume Button */}
          <Button
            onClick={onResume}
            className="text-black font-semibold rounded-xl px-8 py-3 transition-all duration-200 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)'
            }}
          >
            <Play className="h-5 w-5 mr-2" />
            Resume Session
          </Button>

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PomodoroBreakModal;