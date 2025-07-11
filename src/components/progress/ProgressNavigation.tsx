
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Settings, ChevronDown, Sun, Moon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TimePeriod } from "@/types/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";

type VisibleSections = {
  totalProgress: boolean;
  performanceGraph: boolean;
  difficultyStats: boolean;
  chapterProgress: boolean;
  timeManagement: boolean;
  goals: boolean;
};

interface ProgressNavigationProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  setPeriod: (period: TimePeriod) => void;
  visibleSections: VisibleSections;
  setVisibleSections: (sections: Record<string, boolean>) => void;
  selectedCourse?: string;
  setSelectedCourse?: (courseId: string) => void;
  courses?: Array<{
    id: string;
    name: string;
    status: 'active' | 'expired';
    expiresIn: number;
  }>;
}

export const ProgressNavigation: React.FC<ProgressNavigationProps> = ({
  sidebarOpen,
  setSidebarOpen,
  setPeriod,
  visibleSections,
  setVisibleSections,
  selectedCourse,
  setSelectedCourse,
  courses = []
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center space-x-4">
        
        
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Theme Toggle - Single Icon */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className={`rounded-full ${
            isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
          }`}
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5 text-green-400" />
          ) : (
            <Moon className="h-5 w-5 text-gray-600" />
          )}
        </Button>

        {/* Course Selection Dropdown with Expiry Badge - Modern Rounded Styling */}
        {courses.length > 0 && setSelectedCourse && (
          <div className="relative">
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className={`w-[180px] rounded-full shadow-sm border focus:ring-0 focus:ring-offset-0 ${
                isDarkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 border-green-500/30 text-green-400 focus:border-green-500/50' 
                  : 'bg-white hover:bg-gray-50 border-gray-200 focus:border-blue-300'
              }`}>
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent className={`rounded-lg ${isDarkMode ? 'bg-gray-800 border-green-500/30' : 'bg-white'}`}>
                {courses.map(course => (
                  <SelectItem 
                    key={course.id} 
                    value={course.id} 
                    className={`rounded-md flex items-center justify-between ${
                      isDarkMode ? 'text-green-400 hover:bg-gray-700' : ''
                    }`}
                  >
                    <span>{course.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Green Badge for Active Course Expiry */}
            {courses.find(c => c.id === selectedCourse)?.status === 'active' && (
              <Badge className={`absolute -top-2 -right-2 rounded-full course-expiry-badge ${
                isDarkMode ? 'bg-green-500 text-gray-900' : ''
              }`}>
                {courses.find(c => c.id === selectedCourse)?.expiresIn} days
              </Badge>
            )}
          </div>
        )}
        
      </div>
    </div>
  );
};

export default ProgressNavigation;
