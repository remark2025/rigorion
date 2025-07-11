
import { Button } from "@/components/ui/button";
import { BookMarked, CheckCircle, Target } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface PracticeTabSelectorProps {
  activeTab: "problem" | "solution" | "quote";
  setActiveTab: (tab: "problem" | "solution" | "quote") => void;
  className?: string;
}

const PracticeTabSelector = ({ activeTab, setActiveTab, className = "" }: PracticeTabSelectorProps) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`flex justify-center w-full ${className}`}>
      <div className={`inline-flex items-start rounded-full pt-0 pb-3 px-2 border ${
        isDarkMode ? 'bg-gray-900 border-green-500/30' : 'bg-white border-gray-200'
      }`}>
        <Button
          variant="ghost"
          size="sm"
          className={`px-3 py-1 rounded-full transition-all h-7 ${activeTab === "problem" 
            ? isDarkMode 
              ? "text-green-400 bg-gray-800" 
              : "text-blue-600 bg-blue-50"
            : isDarkMode
              ? "text-green-400 hover:text-green-300 hover:bg-gray-800"
              : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"}`}
          onClick={() => setActiveTab("problem")}
        >
          <Target className={`h-3.5 w-3.5 mr-1 ${
            isDarkMode ? 'text-green-400' : 'text-gray-400'
          }`} />
          Problem
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`px-3 py-1 rounded-full transition-all h-7 ${activeTab === "solution" 
            ? isDarkMode 
              ? "text-green-400 bg-gray-800" 
              : "text-blue-600 bg-blue-50"
            : isDarkMode
              ? "text-green-400 hover:text-green-300 hover:bg-gray-800"
              : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"}`}
          onClick={() => setActiveTab("solution")}
        >
          <CheckCircle className={`h-3.5 w-3.5 mr-1 ${
            isDarkMode ? 'text-green-400' : 'text-gray-400'
          }`} />
          Solution
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`px-3 py-1 rounded-full transition-all h-7 ${activeTab === "quote" 
            ? isDarkMode 
              ? "text-green-400 bg-gray-800" 
              : "text-blue-600 bg-blue-50"
            : isDarkMode
              ? "text-green-400 hover:text-green-300 hover:bg-gray-800"
              : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"}`}
          onClick={() => setActiveTab("quote")}
        >
          <BookMarked className={`h-3.5 w-3.5 mr-1 ${
            isDarkMode ? 'text-green-400' : 'text-gray-400'
          }`} />
          Idea
        </Button>
      </div>
    </div>
  );
};

export default PracticeTabSelector;
