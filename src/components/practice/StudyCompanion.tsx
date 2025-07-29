import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

interface StudyCompanionProps {
  companionType: string;
  correctAnswers?: number;
  incorrectAnswers?: number;
  currentTheme?: any;
  isCorrect?: boolean | null;
  selectedAnswer?: string | null;
}

const StudyCompanion: React.FC<StudyCompanionProps> = ({
  companionType,
  correctAnswers = 0,
  incorrectAnswers = 0,
  currentTheme,
  isCorrect = null,
  selectedAnswer = null
}) => {
  const { isDarkMode } = useTheme();
  const [currentState, setCurrentState] = useState<'idle' | 'encouraging' | 'celebrating' | 'thinking' | 'sympathetic'>('idle');
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [lastAnswerState, setLastAnswerState] = useState<{isCorrect: boolean | null, answer: string | null}>({
    isCorrect: null,
    answer: null
  });
  const [messageQueue, setMessageQueue] = useState<Array<{message: string, state: string, duration: number}>>([]);

  // Companion definitions with different states
  const COMPANIONS = {
    cat: {
      idle: '🐱',
      encouraging: '😺',
      celebrating: '😻',
      thinking: '🤔',
      sympathetic: '😿',
      messages: {
        correct: [
          'Purrfect! 🎉', 'Meow-velous work!', 'You\'re the cat\'s meow!', 'Paw-some job!',
          'Cat-astrophically good! 😻', 'Fur-tastic answer!', 'You\'re kitten me - amazing!', 
          'Claw-some intelligence! 🧠', 'Purr-fection achieved!', 'Meow that\'s smart! 🎯'
        ],
        incorrect: [
          'Don\'t give up! 💪', 'Meow better next time!', 'Keep your paws moving!', 'Every cat has 9 lives!',
          'Fur-get that mistake! 😸', 'Paws and reflect, then try again!', 'Even cats miss the mouse sometimes!',
          'Scratch that - you\'ll get it! 💪', 'Meow-ke it happen next time!', 'Purr-severe through this!'
        ],
        encouragement: [
          'You\'ve got this! 🌟', 'Believe in yourself!', 'Paws-itivity wins!', 'Meow is your moment!',
          'Stay paw-sitive! ✨', 'Claw your way to success!', 'Purr-fect focus ahead!', 'Meow or never!'
        ],
        milestone: ['Amazing streak! 🏆', 'Cat-egory champion! 🎯', 'You\'re on fire! 🔥', 'Purr-fect mastery! 👑']
      }
    },
    owl: {
      idle: '🦉',
      encouraging: '🦉',
      celebrating: '🎓',
      thinking: '🤓',
      sympathetic: '😔',
      messages: {
        correct: ['Wise choice! 🧠', 'Hoot hoot! Brilliant!', 'Owl-standing work!', 'You\'re so wise!'],
        incorrect: ['Learn from mistakes 📚', 'Wisdom takes time', 'Hoot! Try again!', 'Even owls miss sometimes'],
        encouragement: ['Stay focused! 🎯', 'Knowledge is power!', 'Hoot hoot! You can do it!', 'Wise up and win!'],
        milestone: ['Scholarly excellence! 📖', 'Wisdom achieved! 🎓', 'Hoot! Perfect streak!']
      }
    },
    fox: {
      idle: '🦊',
      encouraging: '😊',
      celebrating: '🎉',
      thinking: '🤔',
      sympathetic: '😞',
      messages: {
        correct: ['Clever fox! 🧠', 'Sly and smart!', 'Fox-tastic work!', 'Too clever by half!'],
        incorrect: ['Cunning comeback time! 💪', 'Foxes are resilient!', 'Sly retry needed!', 'Clever foxes learn fast!'],
        encouragement: ['Be sly and smart! 🎯', 'Foxes never give up!', 'Clever thinking ahead!', 'Outsmart this one!'],
        milestone: ['Cunning champion! 🏆', 'Fox intelligence! 🧠', 'Sly streak continues!']
      }
    },
    dolphin: {
      idle: '🐬',
      encouraging: '😊',
      celebrating: '🌊',
      thinking: '🤔',
      sympathetic: '😔',
      messages: {
        correct: ['Dolphin-itely right! 🌊', 'Swimming in success!', 'Smooth as dolphin!', 'Fin-tastic job!'],
        incorrect: ['Dive deeper! 💙', 'Dolphins are smart!', 'Splash back stronger!', 'Swim through challenges!'],
        encouragement: ['Swim to victory! 🏊', 'Dolphins are brilliant!', 'Dive into knowledge!', 'Smooth sailing ahead!'],
        milestone: ['Ocean of knowledge! 🌊', 'Dolphin genius! 🧠', 'Swimming champion!']
      }
    },
    robot: {
      idle: '🤖',
      encouraging: '⚡',
      celebrating: '🎯',
      thinking: '💻',
      sympathetic: '😐',
      messages: {
        correct: ['CORRECT.EXE ✅', 'System: Success!', 'Robot approved! 🤖', 'Computing... PERFECT!'],
        incorrect: ['ERROR 404: Try again', 'Recalibrating...', 'System retry needed', 'Debug mode: ON'],
        encouragement: ['BOOST.EXE activated! ⚡', 'Processing power: MAX', 'System confidence: HIGH', 'Execute excellence!'],
        milestone: ['ACHIEVEMENT UNLOCKED! 🏆', 'System overload: SUCCESS', 'Robot efficiency: 100%']
      }
    },
    dragon: {
      idle: '🐉',
      encouraging: '🔥',
      celebrating: '👑',
      thinking: '🤔',
      sympathetic: '😤',
      messages: {
        correct: ['Dragon power! 🔥', 'Legendary answer!', 'Mythical wisdom!', 'Dragon-approved! 👑'],
        incorrect: ['Dragons rise again! 🔥', 'Legendary comeback!', 'Breathe fire, try again!', 'Dragons never quit!'],
        encouragement: ['Unleash your power! ⚡', 'Be legendary!', 'Dragon strength within!', 'Roar to victory! 🦁'],
        milestone: ['LEGENDARY STATUS! 👑', 'Dragon mastery! 🐉', 'Mythical achievement!']
      }
    }
  };

  const companion = COMPANIONS[companionType as keyof typeof COMPANIONS] || COMPANIONS.cat;

  // Animation variants
  const companionVariants = {
    idle: {
      scale: 1,
      rotate: 0,
      y: 0,
      transition: { duration: 0.5 }
    },
    bounce: {
      scale: [1, 1.2, 1],
      y: [0, -10, 0],
      transition: { duration: 0.6, times: [0, 0.5, 1] }
    },
    celebrate: {
      scale: [1, 1.3, 1.1],
      rotate: [0, 10, -10, 0],
      transition: { duration: 0.8, times: [0, 0.3, 0.7, 1] }
    },
    sympathetic: {
      scale: [1, 0.9, 1],
      y: [0, 5, 0],
      transition: { duration: 0.8, repeat: 2 }
    },
    thinking: {
      rotate: [0, 5, -5, 0],
      transition: { duration: 1, repeat: Infinity }
    },
    hover: {
      scale: 1.1,
      y: -5,
      transition: { duration: 0.3 }
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.8 }
  };

  // Enhanced reaction system - triggers on EVERY answer change
  useEffect(() => {
    // Check if there's a new answer (either correct or incorrect)
    if (isCorrect !== lastAnswerState.isCorrect || selectedAnswer !== lastAnswerState.answer) {
      // Only react if we have an actual answer (not null)
      if (isCorrect !== null && selectedAnswer !== null) {
        
        if (isCorrect) {
          // CORRECT ANSWER REACTION
          console.log('🎉 Companion reacting to CORRECT answer!');
          setCurrentState('celebrating');
          const messages = companion.messages.correct;
          const randomMessage = messages[Math.floor(Math.random() * messages.length)];
          setMessage(randomMessage);
          setShowMessage(true);
          
          // Extended celebration duration
          setTimeout(() => {
            setCurrentState('idle');
            setShowMessage(false);
          }, 5000); // 5 seconds for correct answers
          
        } else {
          // INCORRECT ANSWER REACTION  
          console.log('😔 Companion reacting to INCORRECT answer!');
          setCurrentState('sympathetic');
          const messages = companion.messages.incorrect;
          const randomMessage = messages[Math.floor(Math.random() * messages.length)];
          setMessage(randomMessage);
          setShowMessage(true);
          
          // Extended sympathy + encouragement sequence
          setTimeout(() => {
            setCurrentState('encouraging');
            const encouragementMessages = companion.messages.encouragement;
            const encouragement = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
            setMessage(encouragement);
            
            setTimeout(() => {
              setCurrentState('idle');
              setShowMessage(false);
            }, 4000); // Additional 4 seconds of encouragement
          }, 3000); // 3 seconds of sympathy first
        }
      }
      
      // Update last answer state
      setLastAnswerState({
        isCorrect: isCorrect,
        answer: selectedAnswer
      });
    }
  }, [isCorrect, selectedAnswer, lastAnswerState, companion.messages]);

  // Milestone celebrations
  useEffect(() => {
    if (correctAnswers > 0 && correctAnswers % 5 === 0) {
      setCurrentState('celebrating');
      const messages = companion.messages.milestone;
      setMessage(messages[Math.floor(Math.random() * messages.length)]);
      setShowMessage(true);
      
      setTimeout(() => {
        setCurrentState('idle');
        setShowMessage(false);
      }, 4000);
    }
  }, [correctAnswers]);

  // Random encouragement
  useEffect(() => {
    const encouragementTimer = setInterval(() => {
      if (currentState === 'idle' && Math.random() < 0.3) {
        setCurrentState('encouraging');
        const messages = companion.messages.encouragement;
        setMessage(messages[Math.floor(Math.random() * messages.length)]);
        setShowMessage(true);
        
        setTimeout(() => {
          setCurrentState('idle');
          setShowMessage(false);
        }, 3000);
      }
    }, 15000); // Every 15 seconds

    return () => clearInterval(encouragementTimer);
  }, [currentState]);

  const getAnimationVariant = () => {
    if (isHovered) return 'hover';
    switch (currentState) {
      case 'celebrating': return 'celebrate';
      case 'sympathetic': return 'sympathetic';
      case 'thinking': return 'thinking';
      case 'encouraging': return 'bounce';
      default: return 'idle';
    }
  };

  const getCurrentEmoji = () => {
    switch (currentState) {
      case 'celebrating': return companion.celebrating;
      case 'sympathetic': return companion.sympathetic;
      case 'thinking': return companion.thinking;
      case 'encouraging': return companion.encouraging;
      default: return companion.idle;
    }
  };

  return (
    <div className="fixed top-32 right-4 z-50">
      {/* Speech Bubble */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`absolute -left-48 -top-2 w-44 p-3 rounded-xl shadow-lg border-2 ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-600 text-green-400' 
                : `bg-white/95 backdrop-blur-sm ${currentTheme?.border} text-gray-800`
            }`}
          >
            <div className="text-sm font-medium text-center">
              {message}
            </div>
            {/* Speech bubble arrow */}
            <div 
              className={`absolute top-4 -right-2 w-4 h-4 rotate-45 ${
                isDarkMode ? 'bg-gray-800 border-r-2 border-b-2 border-gray-600' : `bg-white ${currentTheme?.border} border-r-2 border-b-2`
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Companion */}
      <motion.div
        variants={companionVariants}
        animate={getAnimationVariant()}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={() => {
          if (currentState === 'idle') {
            setCurrentState('encouraging');
            const messages = companion.messages.encouragement;
            setMessage(messages[Math.floor(Math.random() * messages.length)]);
            setShowMessage(true);
            
            setTimeout(() => {
              setCurrentState('idle');
              setShowMessage(false);
            }, 3000);
          }
        }}
        className={`
          w-16 h-16 rounded-full flex items-center justify-center cursor-pointer
          ${isDarkMode ? 'bg-gray-800 border-2 border-gray-600' : `bg-white/90 backdrop-blur-sm border-2 ${currentTheme?.border}`}
          shadow-lg hover:shadow-xl transition-shadow duration-300
        `}
      >
        <span className="text-2xl select-none">
          {getCurrentEmoji()}
        </span>
      </motion.div>

      {/* Floating particles on celebration */}
      <AnimatePresence>
        {currentState === 'celebrating' && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 1, 
                  scale: 0,
                  x: 32, 
                  y: 32,
                  rotate: 0 
                }}
                animate={{ 
                  opacity: 0, 
                  scale: 1,
                  x: 32 + (Math.random() - 0.5) * 100,
                  y: 32 + (Math.random() - 0.5) * 100,
                  rotate: 360 
                }}
                exit={{ opacity: 0 }}
                transition={{ 
                  duration: 2,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
                className="absolute text-yellow-400 text-lg"
              >
                ✨
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudyCompanion;