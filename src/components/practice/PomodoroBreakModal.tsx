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
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-2xl">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="p-8 text-center"
        >
          {/* Break Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
            className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg"
          >
            <Coffee className="h-10 w-10 text-white" />
          </motion.div>

          {/* Title */}
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-4"
          >
            Break Time!
          </motion.h2>

          {/* Timer */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-full px-6 py-3 shadow-md">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-mono font-bold text-gray-800">
                {formatTime(breakTimeRemaining)}
              </span>
            </div>
          </motion.div>

          {/* Break Tip */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mb-8"
          >
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-md">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700 leading-relaxed text-left">
                  {currentTip}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Resume Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <Button
              onClick={onResume}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-full px-8 py-3 shadow-lg transform transition-all duration-200 hover:scale-105"
            >
              <Play className="h-5 w-5 mr-2" />
              Resume Session
            </Button>
          </motion.div>

          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full opacity-60"></div>
          <div className="absolute bottom-6 left-6 w-3 h-3 bg-indigo-400 rounded-full opacity-40"></div>
          <div className="absolute top-1/3 right-8 w-1 h-1 bg-blue-300 rounded-full opacity-80"></div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default PomodoroBreakModal;