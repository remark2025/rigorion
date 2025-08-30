import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw, SkipForward, Volume2 } from 'lucide-react';
import { mathSounds } from '@/utils/mathSounds';

// Motion Canvas-inspired animation system
interface MathScene {
  id: string;
  duration: number;
  elements: MathElement[];
  narration: string;
  soundEffect?: 'success' | 'step' | 'hint' | 'error';
}

interface MathElement {
  id: string;
  type: 'equation' | 'arrow' | 'highlight' | 'text' | 'shape' | 'number';
  content: string;
  position: { x: number; y: number };
  style: {
    fontSize?: number;
    color?: string;
    opacity?: number;
    scale?: number;
    rotation?: number;
  };
  animation: {
    type: 'fadeIn' | 'slideIn' | 'scaleIn' | 'typewriter' | 'morph' | 'highlight' | 'bounce';
    delay: number;
    duration: number;
    ease?: string;
  };
  exitAnimation?: {
    type: 'fadeOut' | 'slideOut' | 'scaleOut' | 'dissolve';
    delay: number;
    duration: number;
  };
}

// Sample quadratic formula explanation
const QUADRATIC_EXPLANATION: MathScene[] = [
  {
    id: 'scene-1',
    duration: 3000,
    narration: "Let's solve this quadratic equation step by step",
    elements: [
      {
        id: 'original-equation',
        type: 'equation',
        content: '2x² - 8x + 6 = 0',
        position: { x: 50, y: 30 },
        style: { fontSize: 32, color: '#6366F1', opacity: 0 },
        animation: {
          type: 'typewriter',
          delay: 500,
          duration: 2000
        }
      },
      {
        id: 'title',
        type: 'text',
        content: 'Quadratic Equation',
        position: { x: 50, y: 10 },
        style: { fontSize: 24, color: '#8B5CF6', opacity: 0 },
        animation: {
          type: 'fadeIn',
          delay: 0,
          duration: 1000
        }
      }
    ]
  },
  {
    id: 'scene-2',
    duration: 4000,
    narration: "First, let's identify the coefficients a, b, and c",
    soundEffect: 'step',
    elements: [
      {
        id: 'original-equation',
        type: 'equation',
        content: '2x² - 8x + 6 = 0',
        position: { x: 50, y: 20 },
        style: { fontSize: 28, color: '#6366F1' },
        animation: {
          type: 'slideIn',
          delay: 0,
          duration: 800
        }
      },
      {
        id: 'coefficient-a',
        type: 'highlight',
        content: '2',
        position: { x: 35, y: 20 },
        style: { fontSize: 28, color: '#F59E0B', opacity: 0, scale: 1.5 },
        animation: {
          type: 'bounce',
          delay: 1000,
          duration: 600
        }
      },
      {
        id: 'label-a',
        type: 'text',
        content: 'a = 2',
        position: { x: 20, y: 50 },
        style: { fontSize: 20, color: '#F59E0B', opacity: 0 },
        animation: {
          type: 'slideIn',
          delay: 1200,
          duration: 500
        }
      },
      {
        id: 'coefficient-b',
        type: 'highlight',
        content: '-8',
        position: { x: 50, y: 20 },
        style: { fontSize: 28, color: '#10B981', opacity: 0, scale: 1.5 },
        animation: {
          type: 'bounce',
          delay: 2000,
          duration: 600
        }
      },
      {
        id: 'label-b',
        type: 'text',
        content: 'b = -8',
        position: { x: 45, y: 50 },
        style: { fontSize: 20, color: '#10B981', opacity: 0 },
        animation: {
          type: 'slideIn',
          delay: 2200,
          duration: 500
        }
      },
      {
        id: 'coefficient-c',
        type: 'highlight',
        content: '6',
        position: { x: 68, y: 20 },
        style: { fontSize: 28, color: '#EF4444', opacity: 0, scale: 1.5 },
        animation: {
          type: 'bounce',
          delay: 3000,
          duration: 600
        }
      },
      {
        id: 'label-c',
        type: 'text',
        content: 'c = 6',
        position: { x: 70, y: 50 },
        style: { fontSize: 20, color: '#EF4444', opacity: 0 },
        animation: {
          type: 'slideIn',
          delay: 3200,
          duration: 500
        }
      }
    ]
  },
  {
    id: 'scene-3',
    duration: 5000,
    narration: "Now we'll use the quadratic formula to find the solutions",
    soundEffect: 'success',
    elements: [
      {
        id: 'formula',
        type: 'equation',
        content: 'x = (-b ± √(b² - 4ac)) / 2a',
        position: { x: 50, y: 30 },
        style: { fontSize: 28, color: '#6366F1', opacity: 0 },
        animation: {
          type: 'scaleIn',
          delay: 500,
          duration: 1500
        }
      },
      {
        id: 'substitution',
        type: 'equation', 
        content: 'x = (8 ± √(64 - 48)) / 4',
        position: { x: 50, y: 50 },
        style: { fontSize: 24, color: '#8B5CF6', opacity: 0 },
        animation: {
          type: 'typewriter',
          delay: 2500,
          duration: 2000
        }
      },
      {
        id: 'simplified',
        type: 'equation',
        content: 'x = (8 ± √16) / 4 = (8 ± 4) / 4',
        position: { x: 50, y: 70 },
        style: { fontSize: 22, color: '#10B981', opacity: 0 },
        animation: {
          type: 'fadeIn',
          delay: 4000,
          duration: 800
        }
      }
    ]
  },
  {
    id: 'scene-4',
    duration: 3000,
    narration: "Therefore, our solutions are x = 3 and x = 1",
    soundEffect: 'success',
    elements: [
      {
        id: 'solution-1',
        type: 'equation',
        content: 'x₁ = (8 + 4) / 4 = 3',
        position: { x: 30, y: 40 },
        style: { fontSize: 24, color: '#F59E0B', opacity: 0 },
        animation: {
          type: 'slideIn',
          delay: 500,
          duration: 1000
        }
      },
      {
        id: 'solution-2',
        type: 'equation',
        content: 'x₂ = (8 - 4) / 4 = 1',
        position: { x: 70, y: 40 },
        style: { fontSize: 24, color: '#EF4444', opacity: 0 },
        animation: {
          type: 'slideIn',
          delay: 1500,
          duration: 1000
        }
      },
      {
        id: 'celebration',
        type: 'text',
        content: '🎉 Solution Complete! 🎉',
        position: { x: 50, y: 70 },
        style: { fontSize: 28, color: '#10B981', opacity: 0 },
        animation: {
          type: 'bounce',
          delay: 2200,
          duration: 800
        }
      }
    ]
  }
];

// Animation variants
const getAnimationVariant = (animation: MathElement['animation'], element: MathElement) => {
  const { type, delay, duration } = animation;
  
  const baseTransition = {
    delay: delay / 1000,
    duration: duration / 1000,
    ease: animation.ease || 'easeOut'
  };

  switch (type) {
    case 'fadeIn':
      return {
        hidden: { opacity: 0 },
        visible: { 
          opacity: element.style.opacity || 1,
          transition: baseTransition
        }
      };
    
    case 'slideIn':
      return {
        hidden: { opacity: 0, x: -50 },
        visible: { 
          opacity: element.style.opacity || 1,
          x: 0,
          transition: baseTransition
        }
      };
    
    case 'scaleIn':
      return {
        hidden: { opacity: 0, scale: 0.5 },
        visible: { 
          opacity: element.style.opacity || 1,
          scale: element.style.scale || 1,
          transition: { ...baseTransition, type: 'spring', stiffness: 300 }
        }
      };
    
    case 'typewriter':
      return {
        hidden: { width: 0 },
        visible: { 
          width: 'auto',
          transition: { ...baseTransition, ease: 'linear' }
        }
      };
    
    case 'bounce':
      return {
        hidden: { opacity: 0, scale: 0 },
        visible: { 
          opacity: element.style.opacity || 1,
          scale: element.style.scale || 1,
          transition: { 
            ...baseTransition, 
            type: 'spring', 
            stiffness: 500,
            damping: 15
          }
        }
      };
    
    case 'highlight':
      return {
        hidden: { backgroundColor: 'transparent' },
        visible: { 
          backgroundColor: element.style.color + '20',
          transition: { ...baseTransition, repeat: 3, repeatType: 'reverse' as const }
        }
      };
    
    default:
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: baseTransition }
      };
  }
};

interface MotionMathExplainerProps {
  scenes: MathScene[];
  title: string;
  className?: string;
}

export const MotionMathExplainer: React.FC<MotionMathExplainerProps> = ({
  scenes,
  title,
  className = ""
}) => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [progress, setProgress] = useState(0);
  const controls = useAnimation();
  const sceneTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentScene = scenes[currentSceneIndex];
  const totalDuration = scenes.reduce((sum, scene) => sum + scene.duration, 0);

  const playScene = async (sceneIndex: number) => {
    const scene = scenes[sceneIndex];
    if (!scene) return;

    if (soundEnabled && scene.soundEffect) {
      switch (scene.soundEffect) {
        case 'success':
          await mathSounds.playSuccess();
          break;
        case 'step':
          await mathSounds.playStepComplete();
          break;
        case 'hint':
          await mathSounds.playHint();
          break;
        case 'error':
          await mathSounds.playError();
          break;
      }
    }

    // Auto-advance to next scene
    sceneTimeoutRef.current = setTimeout(() => {
      if (sceneIndex < scenes.length - 1) {
        setCurrentSceneIndex(sceneIndex + 1);
      } else {
        setIsPlaying(false);
        if (soundEnabled) {
          mathSounds.playVictory();
        }
      }
    }, scene.duration);
  };

  const togglePlayback = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (sceneTimeoutRef.current) {
        clearTimeout(sceneTimeoutRef.current);
      }
    } else {
      setIsPlaying(true);
      playScene(currentSceneIndex);
    }
  };

  const resetAnimation = async () => {
    if (soundEnabled) {
      await mathSounds.playReset();
    }
    setIsPlaying(false);
    setCurrentSceneIndex(0);
    setProgress(0);
    if (sceneTimeoutRef.current) {
      clearTimeout(sceneTimeoutRef.current);
    }
  };

  const skipToNext = () => {
    if (currentSceneIndex < scenes.length - 1) {
      setCurrentSceneIndex(currentSceneIndex + 1);
      if (sceneTimeoutRef.current) {
        clearTimeout(sceneTimeoutRef.current);
      }
      if (isPlaying) {
        playScene(currentSceneIndex + 1);
      }
    }
  };

  useEffect(() => {
    if (isPlaying) {
      playScene(currentSceneIndex);
    }
    
    return () => {
      if (sceneTimeoutRef.current) {
        clearTimeout(sceneTimeoutRef.current);
      }
    };
  }, [currentSceneIndex, isPlaying]);

  // Update progress
  useEffect(() => {
    const elapsed = scenes.slice(0, currentSceneIndex).reduce((sum, scene) => sum + scene.duration, 0);
    setProgress((elapsed / totalDuration) * 100);
  }, [currentSceneIndex]);

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
            <span className="text-xl font-bold">🎬 {title}</span>
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
                onClick={togglePlayback}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={skipToNext}
                disabled={currentSceneIndex >= scenes.length - 1}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 disabled:opacity-50"
              >
                <SkipForward className="h-4 w-4" />
                Next
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
              <span>Scene {currentSceneIndex + 1} of {scenes.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Animation Canvas */}
          <div className="relative h-96 bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden">
            <AnimatePresence mode="wait">
              {currentScene && (
                <motion.div
                  key={currentScene.id}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentScene.elements.map((element) => (
                    <motion.div
                      key={element.id}
                      className="absolute font-mono flex items-center justify-center text-center"
                      style={{
                        left: `${element.position.x}%`,
                        top: `${element.position.y}%`,
                        transform: 'translate(-50%, -50%)',
                        fontSize: element.style.fontSize,
                        color: element.style.color,
                        fontWeight: element.type === 'equation' ? 'bold' : 'normal'
                      }}
                      variants={getAnimationVariant(element.animation, element)}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                    >
                      {element.content}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Narration */}
          <div className="p-4 bg-blue-50 border-t-2" style={{ borderColor: '#6366F1' }}>
            <p className="text-center text-lg" style={{ color: '#6366F1' }}>
              {currentScene?.narration}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Demo component
export const QuadraticExplainerDemo: React.FC = () => {
  return (
    <MotionMathExplainer
      scenes={QUADRATIC_EXPLANATION}
      title="Quadratic Formula Step-by-Step"
      className="max-w-4xl mx-auto"
    />
  );
};

export default MotionMathExplainer;