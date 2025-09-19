import React from 'react';
import { ThemeProvider } from "@/contexts/ThemeContext";
import SampleWritingQuestionDemo from '@/components/writing/SampleWritingQuestionDemo';

const WritingCorrectionDemo = () => {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8">
          <SampleWritingQuestionDemo />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default WritingCorrectionDemo;