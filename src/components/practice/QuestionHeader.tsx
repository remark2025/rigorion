import React from 'react';

interface QuestionHeaderProps {
  questionNumber: number;
  className?: string;
  chapter?: string;
}

const QuestionHeader: React.FC<QuestionHeaderProps> = ({ 
  questionNumber, 
  className = "",
  chapter
}) => {
  return (
    <div className={`mb-3 ${className}`} style={{ marginTop: '16px', marginBottom: '10px' }}>
      <h3 
        id={`q-${questionNumber}`}
        className="flex items-center w-full"
        style={{ height: '24px' }}
      >
        {/* Number Badge */}
        <div 
          className="flex items-center justify-center text-white font-bold flex-shrink-0"
          style={{
            backgroundColor: '#111',
            fontSize: '12px',
            lineHeight: '1.1',
            padding: '0 8px',
            height: '24px',
            borderRadius: '2px',
            fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            minWidth: 'fit-content'
          }}
        >
          {questionNumber}
        </div>

        {/* Rule Bar with Chapter Title */}
        <div 
          className="flex-1 ml-2 mr-3 flex items-center justify-start pl-4"
          style={{
            backgroundColor: '#CFCFCF',
            height: '24px',
            borderRadius: '2px'
          }}
        >
          {chapter && (
            <span className="text-sm font-semibold text-blue-700">
              {chapter}
            </span>
          )}
        </div>
      </h3>
    </div>
  );
};

export default QuestionHeader;