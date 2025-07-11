import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
const prompts = ["Help me create a study plan for SAT Math preparation", "I need to master calculus in 3 months, what's the best approach?", "Design a schedule for AP Chemistry with my busy extracurriculars", "How can I improve my reading comprehension for the ACT?", "Create a physics study guide for my upcoming exam", "I want to learn programming while studying for finals", "Help me balance multiple AP courses effectively", "What's the best way to prepare for college entrance exams?"];
const AnimatedPrompts: React.FC = () => {
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentPrompt(prev => (prev + 1) % prompts.length);
        setIsVisible(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  return <div className="flex flex-col items-center gap-4 mt-8">
      
      <div className="relative h-16 flex items-center justify-center">
        <div className={cn('absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out', isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4')}>
          
        </div>
      </div>
    </div>;
};
export default AnimatedPrompts;