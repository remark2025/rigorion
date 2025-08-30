import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw, SkipForward, Volume2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mathSounds } from '@/utils/mathSounds';

// Simplified animation scenes
const SIMPLE_SCENES = [
  {
    id: 'scene-1',
    title: 'Step 1: Identify the Equation',
    content: '2x² - 8x + 6 = 0',
    description: "Let's solve this quadratic equation step by step",
    color: '#6366F1'
  },
  {
    id: 'scene-2', 
    title: 'Step 2: Identify Coefficients',
    content: 'a = 2, b = -8, c = 6',
    description: 'From the standard form ax² + bx + c = 0',
    color: '#8B5CF6'
  },
  {
    id: 'scene-3',
    title: 'Step 3: Apply Quadratic Formula',
    content: 'x = (-b ± √(b² - 4ac)) / 2a',
    description: 'Using the quadratic formula to find solutions',
    color: '#F59E0B'
  },
  {
    id: 'scene-4',
    title: 'Step 4: Substitute Values',
    content: 'x = (8 ± √(64 - 48)) / 4',
    description: 'Substituting our coefficients into the formula',
    color: '#10B981'
  },
  {
    id: 'scene-5',
    title: 'Step 5: Simplify',
    content: 'x = (8 ± 4) / 4',
    description: 'Simplifying the discriminant: √16 = 4',
    color: '#EF4444'
  },
  {
    id: 'scene-6',
    title: 'Step 6: Final Solutions',
    content: 'x₁ = 3, x₂ = 1',
    description: 'Our final answers: x = 3 and x = 1',
    color: '#10B981'
  }
];

interface SimpleMotionExplainerProps {
  title?: string;
  className?: string;
}

export const SimpleMotionExplainer: React.FC<SimpleMotionExplainerProps> = ({
  title = "Quadratic Formula Step-by-Step",
  className = ""
}) => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const currentScene = SIMPLE_SCENES[currentSceneIndex];
  const progress = ((currentSceneIndex + 1) / SIMPLE_SCENES.length) * 100;

  const nextScene = async () => {
    if (soundEnabled) {
      await mathSounds.playStepComplete();
    }
    
    if (currentSceneIndex < SIMPLE_SCENES.length - 1) {
      setCurrentSceneIndex(currentSceneIndex + 1);
    } else {
      setIsPlaying(false);
      if (soundEnabled) {
        await mathSounds.playVictory();
      }
    }
  };

  const prevScene = async () => {
    if (soundEnabled) {
      await mathSounds.playParameterChange();
    }
    
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex(currentSceneIndex - 1);
    }
  };

  const resetAnimation = async () => {
    if (soundEnabled) {
      await mathSounds.playReset();
    }
    setIsPlaying(false);
    setCurrentSceneIndex(0);
  };

  const toggleAutoPlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      // Auto-advance every 3 seconds when playing
      const interval = setInterval(() => {
        setCurrentSceneIndex(prev => {
          if (prev < SIMPLE_SCENES.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            clearInterval(interval);
            return prev;
          }
        });
      }, 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      <Card className="border-2 shadow-xl" style={{ borderColor: '#6366F1' }}>
        <CardHeader 
          className="border-b-2 p-6"
          style={{
            borderColor: '#6366F1',
            background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)'
          }}
        >
          <CardTitle className="flex items-center justify-between text-white">
            <span className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              🎬 {title}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Volume2 className="h-4 w-4" />
                {soundEnabled ? 'On' : 'Off'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAutoPlay}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? 'Pause' : 'Auto Play'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetAnimation}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardTitle>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm text-white/80 mb-2">
              <span>Step {currentSceneIndex + 1} of {SIMPLE_SCENES.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Animation Canvas */}
          <div className="relative h-96 bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScene.id}
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.h2 
                  className="text-2xl font-bold mb-4"
                  style={{ color: currentScene.color }}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  {currentScene.title}
                </motion.h2>
                
                <motion.div 
                  className="text-4xl font-mono font-bold mb-4 p-6 rounded-xl border-2 bg-white/80 shadow-lg"
                  style={{ 
                    borderColor: currentScene.color,
                    color: currentScene.color 
                  }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6, type: 'spring' }}
                >
                  {currentScene.content}
                </motion.div>
                
                <motion.p 
                  className="text-lg max-w-md"
                  style={{ color: '#6B7280' }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  {currentScene.description}
                </motion.p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between p-4 bg-blue-50 border-t-2" style={{ borderColor: '#6366F1' }}>
            <Button
              onClick={prevScene}
              disabled={currentSceneIndex === 0}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              ← Previous
            </Button>
            
            <div className="text-center">
              <p className="text-lg font-semibold" style={{ color: '#6366F1' }}>
                {currentScene.title}
              </p>
            </div>
            
            <Button
              onClick={nextScene}
              disabled={currentSceneIndex === SIMPLE_SCENES.length - 1}
              variant="outline"  
              size="sm"
              className="flex items-center gap-2"
            >
              Next →
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Completion Message */}
      {currentSceneIndex === SIMPLE_SCENES.length - 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-4 text-center p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl border-2 border-green-300"
        >
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="text-xl font-bold text-green-800 mb-2">
            Congratulations! You've completed the quadratic formula walkthrough!
          </h3>
          <p className="text-green-700">
            You now understand how to solve quadratic equations step by step using the quadratic formula.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SimpleMotionExplainer;