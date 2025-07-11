
import React, { useState, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AISearchBarProps {
  onAIAnalyze?: (query: string) => void;
  className?: string;
  placeholder?: string;
  animatedPlaceholders?: string[];
}

const AISearchBar: React.FC<AISearchBarProps> = ({
  onAIAnalyze,
  className,
  placeholder = 'Describe your study goals and subjects...',
  animatedPlaceholders
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(placeholder);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [isTabVisible, setIsTabVisible] = useState(true);

  // Tab visibility detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      const wasHidden = !isTabVisible;
      const isNowVisible = !document.hidden;
      
      setIsTabVisible(isNowVisible);
      
      // If tab was hidden and is now visible, reset to current placeholder without cycling
      if (wasHidden && isNowVisible && animatedPlaceholders && animatedPlaceholders.length > 0) {
        // Stay on current placeholder index, don't fast-forward
        setCurrentPlaceholder(animatedPlaceholders[placeholderIndex]);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isTabVisible, animatedPlaceholders, placeholderIndex]);

  // Blinking cursor effect
  useEffect(() => {
    if (isFocused || query.trim()) {
      setShowCursor(false);
      return;
    }

    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530); // Blink every 530ms

    return () => clearInterval(cursorInterval);
  }, [isFocused, query, isTyping]);

  // Typing animation for current placeholder
  useEffect(() => {
    if (!currentPlaceholder || isFocused || query.trim() || !isTabVisible) {
      setDisplayedText(currentPlaceholder);
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    setDisplayedText('');
    let index = 0;

    // Small delay before starting to type
    const startDelay = setTimeout(() => {
      const typingInterval = setInterval(() => {
        // Stop typing if tab becomes hidden
        if (document.hidden) {
          clearInterval(typingInterval);
          setIsTyping(false);
          return;
        }
        
        if (index < currentPlaceholder.length) {
          setDisplayedText(currentPlaceholder.slice(0, index + 1));
          index++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
        }
      }, 60); // Type each character every 60ms for more realistic speed

      return () => clearInterval(typingInterval);
    }, 200); // 200ms delay before starting

    return () => clearTimeout(startDelay);
  }, [currentPlaceholder, isFocused, query, isTabVisible]);

  // Animate placeholder text if animatedPlaceholders is provided
  useEffect(() => {
    if (!animatedPlaceholders || animatedPlaceholders.length === 0 || isFocused || query.trim() || !isTabVisible) {
      return;
    }

    const interval = setInterval(() => {
      // Only update if tab is still visible
      if (document.hidden) return;
      
      setPlaceholderIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % animatedPlaceholders.length;
        setCurrentPlaceholder(animatedPlaceholders[nextIndex]);
        return nextIndex;
      });
    }, 5000); // Change placeholder every 5 seconds

    return () => clearInterval(interval);
  }, [animatedPlaceholders, isFocused, query, isTabVisible]);

  // Set initial placeholder
  useEffect(() => {
    if (animatedPlaceholders && animatedPlaceholders.length > 0) {
      setCurrentPlaceholder(animatedPlaceholders[0]);
    } else {
      setCurrentPlaceholder(placeholder);
    }
  }, [animatedPlaceholders, placeholder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    if (onAIAnalyze) {
      onAIAnalyze(query);
      setQuery(''); // Clear input after submission
    }
  };

  return (
    <div className={cn('relative w-full max-w-6xl mx-auto', className)}>
      <div className="relative flex flex-col gap-3 p-4">
        
        {/* AI Mode Header */}
        <div className="flex items-center justify-center gap-2 mb-1">
          <h3 className="font-semibold bg-gradient-to-r from-[#8A0303] to-red-600 bg-clip-text text-transparent text-sm">
            Your AI Guide
          </h3>
          <Sparkles className="h-4 w-4 text-red-500 animate-pulse" />
        </div>

        {/* Integrated Input and Submit Row */}
        <form onSubmit={handleSubmit} className="w-full">
          <div className={cn(
            'relative flex items-center h-12 rounded-full border bg-transparent transition-all duration-300',
            'border-gray-300 focus-within:border-[#8A0303]',
            isFocused ? 'border-[#8A0303]' : 'border-gray-300'
          )}>
            <Input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={displayedText + (showCursor && !isFocused && !query.trim() ? '|' : '')}
              className={cn(
                'flex-1 bg-transparent h-full px-5 rounded-full text-base border-0',
                'focus:ring-0 focus:outline-none focus:ring-offset-0 focus-visible:ring-0',
                'focus:border-transparent focus-visible:border-transparent',
                'placeholder:text-gray-400 focus:placeholder:text-gray-500',
                'font-normal placeholder:font-light resize-none shadow-none transition-all duration-500'
              )}
              style={{ boxShadow: 'none' }}
            />
            
            {/* Vertical Separator */}
            <div className="h-6 w-px bg-gray-300 mx-2" />
            
            {/* Integrated Send Button */}
            <Button
              type="submit"
              disabled={!query.trim()}
              className={cn(
                'rounded-full h-8 w-8 mr-2 p-0 transition-all duration-300 ease-out',
                'hover:scale-110 transform-gpu disabled:scale-100 disabled:opacity-50',
                'flex items-center justify-center shrink-0',
                'bg-white hover:bg-gray-50 text-[#8A0303] border border-[#8A0303] hover:border-[#6b0202]'
              )}
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AISearchBar;
