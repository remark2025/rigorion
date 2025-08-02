import React, { useState, useEffect } from 'react';

interface TypingAnimationProps {
  text: string;
  speed?: number;
  className?: string;
  isHTML?: boolean;
  onComplete?: () => void;
  style?: React.CSSProperties;
}

const TypingAnimation: React.FC<TypingAnimationProps> = ({ 
  text, 
  speed = 20, // Faster for solutions
  className = "",
  isHTML = false,
  onComplete,
  style
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Strip HTML for character counting but preserve for display
  const stripHTML = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const textLength = isHTML ? stripHTML(text).length : text.length;

  useEffect(() => {
    if (currentIndex < textLength) {
      const timer = setTimeout(() => {
        if (isHTML) {
          // For HTML content, we need to build it incrementally
          const plainText = stripHTML(text);
          const currentChar = plainText[currentIndex];
          
          // Find where this character appears in the original HTML
          let htmlIndex = 0;
          let plainIndex = 0;
          let result = '';
          
          while (htmlIndex < text.length && plainIndex <= currentIndex) {
            const char = text[htmlIndex];
            if (char === '<') {
              // Skip HTML tag
              const tagEnd = text.indexOf('>', htmlIndex);
              if (tagEnd !== -1) {
                result += text.substring(htmlIndex, tagEnd + 1);
                htmlIndex = tagEnd + 1;
              } else {
                htmlIndex++;
              }
            } else {
              result += char;
              if (char !== ' ' && char !== '\n' && char !== '\r' && char !== '\t') {
                plainIndex++;
              }
              htmlIndex++;
            }
          }
          setDisplayText(result);
        } else {
          setDisplayText(prev => prev + text[currentIndex]);
        }
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, text, speed, isHTML, textLength, isComplete, onComplete]);

  useEffect(() => {
    setDisplayText('');
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  if (isHTML) {
    return (
      <div className={className} style={style}>
        <div dangerouslySetInnerHTML={{ __html: displayText }} />
        {currentIndex < textLength && (
          <span className="animate-pulse text-blue-500 ml-1 text-lg">|</span>
        )}
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      {displayText}
      {currentIndex < textLength && (
        <span className="animate-pulse text-blue-500 ml-1">|</span>
      )}
    </div>
  );
};

export default TypingAnimation;