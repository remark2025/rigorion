import { useState } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { QuestionsProvider } from "@/contexts/QuestionsContext";
import PracticeContent from "@/components/practice/PracticeContent";
import CommentSection from "@/components/practice/CommentSection";

const Practice = () => {
  const [settings, setSettings] = useState({
    fontFamily: "Inter",
    fontSize: 14,
    colorStyle: "plain" as const,
    emphasis: {
      bold: false,
      italic: false,
      underline: false,
      highlight: false
    }
  });

  const handleSettingsChange = (key: any, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <ThemeProvider>
      <QuestionsProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
          {/* Main content area */}
          <div className="p-0">
            <PracticeContent 
              settings={settings} 
              onSettingsChange={handleSettingsChange}
            />
          </div>
          
        </div>
      </QuestionsProvider>
    </ThemeProvider>
  );
};

export default Practice;
