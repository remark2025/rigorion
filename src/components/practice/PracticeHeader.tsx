import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Target, Navigation, ChevronDown, LogOut, Filter, BookOpen, Clock, User, Users, BarChart, Menu, Settings, Timer, TrendingUp, Hand, Coffee, GraduationCap, Type } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/contexts/ThemeContext";
import FormattingToolbar from "./FormattingToolbar";

interface PracticeHeaderProps {
  onToggleSidebar: () => void;
  onOpenObjective: () => void;
  onOpenMode: () => void;
  mode: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onFilterChange?: (filters: { chapter?: string; module?: string; exam?: number | null }) => void;
  settings?: {
    fontFamily: string;
    fontSize: number;
    colorStyle: string;
    textColor: string;
  };
  onSettingsChange?: (key: string, value: string | number) => void;
}

export const PracticeHeader = ({ 
  onToggleSidebar, 
  onOpenObjective, 
  onOpenMode, 
  mode,
  sidebarOpen,
  setSidebarOpen,
  onFilterChange,
  settings = {
    fontFamily: 'inter',
    fontSize: 14,
    colorStyle: 'plain',
    textColor: '#374151'
  },
  onSettingsChange
}: PracticeHeaderProps) => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { isDarkMode } = useTheme();
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);
  const [isChapterDropdownOpen, setIsChapterDropdownOpen] = useState(false);
  const [isModuleDropdownOpen, setIsModuleDropdownOpen] = useState(false);
  const [isExamDropdownOpen, setIsExamDropdownOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<string>("All Chapters");
  const [selectedModule, setSelectedModule] = useState<string>("All SAT Math");
  const [selectedExam, setSelectedExam] = useState<number | null>(null);

  const pages = [
    { name: "Account", path: "/account" },
    { name: "Practice", path: "/practice" },
    { name: "Analytics", path: "/analytics" },
    { name: "About us", path: "/about" },
  ];

  const chapters = [
    "All Chapters",
    "Chapter 1",
    "Chapter 2", 
    "Chapter 3",
    "Chapter 4",
    "Chapter 5"
  ];

  const exams = [
    "All Exams",
    "Exam 1",
    "Exam 2",
    "Exam 3",
    "Exam 4",
    "Exam 5",
    "Exam 6",
    "Exam 7",
    "Exam 8",
    "Exam 9",
    "Exam 10",
    "Exam 11",
    "Exam 12"
  ];

  const modules = [
    "All SAT Math",
    "SAT Reading",
    "SAT Writing"
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleChapterFilter = (chapter: string) => {
    console.log("PracticeHeader - Chapter filter selected:", chapter);
    setSelectedChapter(chapter);
    setIsChapterDropdownOpen(false);
    
    if (onFilterChange) {
      let chapterNumber: string | undefined;
      if (chapter !== "All Chapters") {
        const match = chapter.match(/Chapter (\d+)/);
        chapterNumber = match ? match[1] : undefined;
      }
      
      onFilterChange({
        chapter: chapterNumber,
        module: selectedModule === "All SAT Math" ? undefined : selectedModule,
        exam: selectedExam
      });
    }
  };

  const handleModuleFilter = (module: string) => {
    console.log("PracticeHeader - Module filter selected:", module);
    setSelectedModule(module);
    setIsModuleDropdownOpen(false);
    
    if (onFilterChange) {
      let chapterNumber: string | undefined;
      if (selectedChapter !== "All Chapters") {
        const match = selectedChapter.match(/Chapter (\d+)/);
        chapterNumber = match ? match[1] : undefined;
      }
      
      onFilterChange({
        chapter: chapterNumber,
        module: module === "All SAT Math" ? undefined : module,
        exam: selectedExam
      });
    }
  };

  const handleExamFilter = (exam: string) => {
    console.log("PracticeHeader - Exam filter selected:", exam);
    setIsExamDropdownOpen(false);
    
    if (onFilterChange) {
      let examNumber: number | null = null;
      if (exam !== "All Exams") {
        const match = exam.match(/Exam (\d+)/);
        examNumber = match ? parseInt(match[1]) : null;
      }

      // Get current chapter and module values
      let chapterNumber: string | undefined;
      if (selectedChapter !== "All Chapters") {
        const match = selectedChapter.match(/Chapter (\d+)/);
        chapterNumber = match ? match[1] : undefined;
      }
      
      const moduleValue = selectedModule === "All SAT Math" ? undefined : selectedModule;
      
      setSelectedExam(examNumber);
      
      onFilterChange({
        chapter: chapterNumber,
        module: moduleValue,
        exam: examNumber
      });
    }
  };

  const handleClearAllFilters = () => {
    console.log("PracticeHeader - Clearing all filters");
    setSelectedChapter("All Chapters");
    setSelectedModule("All SAT Math");
    setSelectedExam(null);
    
    if (onFilterChange) {
      onFilterChange({
        chapter: undefined,
        module: undefined,
        exam: null
      });
    }
  };

  const getUserInitials = (): string => {
    if (profile?.name) {
      return profile.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return user?.email?.substring(0, 2).toUpperCase() || 'U';
  };

  const getPageIcon = (pageName: string) => {
    switch (pageName) {
      case "Account":
        return <User className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />;
      case "Practice":
        return <BookOpen className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />;
      case "Analytics":
        return <BarChart className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />;
      case "About us":
        return <Users className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />;
      default:
        return null;
    }
  };

  const getActiveFilterText = () => {
    if (selectedExam !== null) {
      return `Exam ${selectedExam}`;
    }
    
    const filters = [];
    if (selectedChapter !== "All Chapters") {
      filters.push(selectedChapter);
    }
    if (selectedModule !== "All SAT Math") {
      filters.push(selectedModule);
    }
    
    return filters.length > 0 ? filters.join(" • ") : "All Questions";
  };

  const hasActiveFilters = () => {
    return selectedExam !== null || selectedChapter !== "All Chapters" || selectedModule !== "All SAT Math";
  };

  const getModeIcon = (currentMode: string) => {
    switch (currentMode) {
      case "timer":
        return <Timer className={`h-4 w-4 mr-1 ${isDarkMode ? 'text-green-400' : 'text-blue-600'}`} />;
      case "level":
        return <TrendingUp className={`h-4 w-4 mr-1 ${isDarkMode ? 'text-green-400' : 'text-blue-600'}`} />;
      case "manual":
        return <Hand className={`h-4 w-4 mr-1 ${isDarkMode ? 'text-green-400' : 'text-blue-600'}`} />;
      case "pomodoro":
        return <Coffee className={`h-4 w-4 mr-1 ${isDarkMode ? 'text-green-400' : 'text-blue-600'}`} />;
      case "exam":
        return <GraduationCap className={`h-4 w-4 mr-1 ${isDarkMode ? 'text-green-400' : 'text-blue-600'}`} />;
      default:
        return <Clock className={`h-4 w-4 mr-1 ${isDarkMode ? 'text-green-400' : 'text-blue-600'}`} />;
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 w-full z-50 border-b px-1 sm:px-2 md:px-4 py-2 sm:py-3 flex items-center justify-between shadow-sm transition-all duration-300 overflow-hidden ${
      isDarkMode ? 'bg-gray-900 border-green-500/30' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Mobile Hamburger Menu */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className={`lg:hidden rounded-lg ${
            isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
          }`}
        >
          <Menu className={`h-5 w-5 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`} />
        </Button>

        {/* Desktop Navigation Dropdown */}
        <DropdownMenu open={isNavDropdownOpen} onOpenChange={setIsNavDropdownOpen}>
          <DropdownMenuTrigger className={`hidden lg:block rounded-lg p-2 transition-colors ${
            isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
          }`}>
            <Navigation className={`h-5 w-5 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className={`w-56 shadow-lg rounded-lg p-2 z-50 ${
            isDarkMode ? 'bg-gray-900 border-green-500/30' : 'bg-white border-gray-200'
          }`}>
            <ScrollArea className="h-auto max-h-[300px]">
              {pages.map((page, index) => (
                <DropdownMenuItem 
                  key={index}
                  className={`cursor-pointer py-2 rounded-sm transition-colors flex items-center ${
                    isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handleNavigation(page.path)}
                >
                  {getPageIcon(page.name)}
                  <span className={`font-source-sans ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{page.name}</span>
                </DropdownMenuItem>
              ))}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center">
          <h1 className="text-base sm:text-lg font-semibold tracking-wide bg-gradient-to-r from-gray-300 via-blue-400 to-blue-500 bg-clip-text text-transparent">
            SAT
            <span className="text-[8px] font-bold text-gray-400 border border-gray-300 rounded-full w-2.5 h-2.5 inline-flex items-center justify-center leading-none ml-0.5 mr-1 align-top">
              ®
            </span>
            Premium
          </h1>
        </div>
      </div>
      
      <div className="flex items-center gap-1 sm:gap-2 overflow-hidden">
        <FormattingToolbar 
          settings={settings}
          onSettingsChange={onSettingsChange}
        />


        {/* Mobile Filter Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`md:hidden rounded-full transition-colors ${
                isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              } ${hasActiveFilters() ? (isDarkMode ? 'text-green-300 bg-green-900/20' : 'text-blue-600 bg-blue-50') : ''}`}
            >
              <Filter className={`h-4 w-4 ${isDarkMode ? 'text-green-400' : 'text-blue-600'}`} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={`w-64 shadow-lg rounded-lg p-2 z-50 ${
            isDarkMode ? 'bg-gray-900 border-green-500/30' : 'bg-white border-gray-200'
          }`}>
            <div className={`px-3 py-2 text-sm font-semibold border-b mb-2 ${
              isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-700 border-gray-200'
            }`}>
              Filters
            </div>
            
            {/* Mobile Module Selection */}
            <div className="mb-3">
              <div className={`text-xs font-medium mb-1 px-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Module</div>
              {modules.map((module) => (
                <DropdownMenuItem 
                  key={module}
                  className={`cursor-pointer py-2 px-3 rounded-md transition-colors ${
                    isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                  } ${selectedModule === module ? (isDarkMode ? 'bg-gray-800' : 'bg-gray-100') : ''}`}
                  onClick={() => handleModuleFilter(module)}
                >
                  <BookOpen className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-green-400' : 'text-blue-600'}`} />
                  <span className={`font-source-sans text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{module}</span>
                  {selectedModule === module && <span className="ml-auto text-xs">✓</span>}
                </DropdownMenuItem>
              ))}
            </div>

            {/* Mobile Exam Selection */}
            <div className="mb-3">
              <div className={`text-xs font-medium mb-1 px-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Exams</div>
              <ScrollArea className="h-[120px]">
                {exams.slice(0, 8).map((exam, index) => (
                  <DropdownMenuItem 
                    key={index}
                    className={`cursor-pointer py-2 px-3 rounded-md transition-colors ${
                      isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                    } ${(selectedExam === null && exam === "All Exams") || (selectedExam !== null && exam === `Exam ${selectedExam}`) ? (isDarkMode ? 'bg-gray-800' : 'bg-gray-100') : ''}`}
                    onClick={() => handleExamFilter(exam)}
                  >
                    <Target className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-green-400' : 'text-blue-600'}`} />
                    <span className={`font-source-sans text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{exam}</span>
                    {((selectedExam === null && exam === "All Exams") || (selectedExam !== null && exam === `Exam ${selectedExam}`)) && <span className="ml-auto text-xs">✓</span>}
                  </DropdownMenuItem>
                ))}
              </ScrollArea>
            </div>

            {/* Mobile Chapter Selection */}
            <div>
              <div className={`text-xs font-medium mb-1 px-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Chapters</div>
              {chapters.map((chapter, index) => (
                <DropdownMenuItem 
                  key={index}
                  className={`cursor-pointer py-2 px-3 rounded-md transition-colors ${
                    isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                  } ${selectedChapter === chapter ? (isDarkMode ? 'bg-gray-800' : 'bg-gray-100') : ''}`}
                  onClick={() => handleChapterFilter(chapter)}
                >
                  <BookOpen className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-green-400' : 'text-blue-600'}`} />
                  <span className={`font-source-sans text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{chapter}</span>
                  {selectedChapter === chapter && <span className="ml-auto text-xs">✓</span>}
                </DropdownMenuItem>
              ))}
            </div>

            <DropdownMenuSeparator className={isDarkMode ? 'bg-green-500/30' : ''} />
            
            {/* Clear All Filters Button */}
            {hasActiveFilters() && (
              <DropdownMenuItem 
                className={`cursor-pointer py-2 px-3 rounded-md transition-colors text-center ${
                  isDarkMode ? 'hover:bg-gray-800 text-blue-400' : 'hover:bg-gray-50 text-blue-600'
                }`}
                onClick={handleClearAllFilters}
              >
                Clear All Filters
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>


        {/* Desktop Individual Filter Buttons */}
        <div className="hidden md:flex items-center gap-1">
          {/* Module Filter - Desktop */}
          <DropdownMenu open={isModuleDropdownOpen} onOpenChange={setIsModuleDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-full bg-transparent transition-colors flex ${
                  isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                } ${selectedModule !== "All SAT Math" ? (isDarkMode ? 'text-green-300 bg-green-900/20' : 'text-blue-600 bg-blue-50') : ''}`}
              >
                <BookOpen className={`h-4 w-4 mr-1 ${isDarkMode ? 'text-green-400' : 'text-blue-600'}`} />
                <span className={`font-thin text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {selectedModule === "All SAT Math" ? "All SAT Math" : selectedModule}
                </span>
                <ChevronDown className={`ml-1 h-3 w-3 transition-transform ${isModuleDropdownOpen ? "rotate-180" : ""} ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={`w-56 shadow-lg rounded-lg p-2 z-50 ${
              isDarkMode ? 'bg-gray-900 border-green-500/30' : 'bg-white border-gray-200'
            }`}>
              <ScrollArea className="h-[150px]">
                {modules.map((module) => (
                  <DropdownMenuItem 
                    key={module}
                    className={`cursor-pointer py-2 px-3 rounded-md transition-colors ${
                      isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                    } ${selectedModule === module ? (isDarkMode ? 'bg-gray-800' : 'bg-gray-100') : ''}`}
                    onClick={() => handleModuleFilter(module)}
                  >
                    <span className={`font-source-sans text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{module}</span>
                    {selectedModule === module && <span className="ml-auto text-xs">✓</span>}
                  </DropdownMenuItem>
                ))}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Exams Filter - Desktop */}
          <DropdownMenu open={isExamDropdownOpen} onOpenChange={setIsExamDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-full bg-transparent transition-colors flex ${
                  isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                } ${selectedExam !== null ? (isDarkMode ? 'text-green-300 bg-green-900/20' : 'text-blue-600 bg-blue-50') : ''}`}
              >
                <Target className={`h-4 w-4 mr-1 ${isDarkMode ? 'text-green-400' : 'text-blue-600'}`} />
                <span className={`font-thin text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {selectedExam !== null ? `Exam ${selectedExam}` : "All Exams"}
                </span>
                <ChevronDown className={`ml-1 h-3 w-3 transition-transform ${isExamDropdownOpen ? "rotate-180" : ""} ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={`w-56 shadow-lg rounded-lg p-2 z-50 ${
              isDarkMode ? 'bg-gray-900 border-green-500/30' : 'bg-white border-gray-200'
            }`}>
              <ScrollArea className="h-[300px]">
                {exams.map((exam, index) => (
                  <DropdownMenuItem 
                    key={index}
                    className={`cursor-pointer py-2 px-3 rounded-md transition-colors ${
                      isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                    } ${(selectedExam === null && exam === "All Exams") || (selectedExam !== null && exam === `Exam ${selectedExam}`) ? (isDarkMode ? 'bg-gray-800' : 'bg-gray-100') : ''}`}
                    onClick={() => handleExamFilter(exam)}
                  >
                    <span className={`font-source-sans text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{exam}</span>
                    {((selectedExam === null && exam === "All Exams") || (selectedExam !== null && exam === `Exam ${selectedExam}`)) && <span className="ml-auto text-xs">✓</span>}
                  </DropdownMenuItem>
                ))}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Chapters Filter - Desktop */}
          <DropdownMenu open={isChapterDropdownOpen} onOpenChange={setIsChapterDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-full bg-transparent transition-colors flex ${
                  isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                } ${selectedChapter !== "All Chapters" ? (isDarkMode ? 'text-green-300 bg-green-900/20' : 'text-blue-600 bg-blue-50') : ''}`}
              >
                <BookOpen className={`h-4 w-4 mr-1 ${isDarkMode ? 'text-green-400' : 'text-blue-600'}`} />
                <span className={`font-thin text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {selectedChapter}
                </span>
                <ChevronDown className={`ml-1 h-3 w-3 transition-transform ${isChapterDropdownOpen ? "rotate-180" : ""} ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={`w-64 shadow-lg rounded-lg p-2 z-50 ${
              isDarkMode ? 'bg-gray-900 border-green-500/30' : 'bg-white border-gray-200'
            }`}>
              <ScrollArea className="h-[300px]">
                {chapters.map((chapter, index) => (
                  <DropdownMenuItem 
                    key={index}
                    className={`cursor-pointer py-2 px-3 rounded-md transition-colors ${
                      isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                    } ${selectedChapter === chapter ? (isDarkMode ? 'bg-gray-800' : 'bg-gray-100') : ''}`}
                    onClick={() => handleChapterFilter(chapter)}
                  >
                    <span className={`font-source-sans text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{chapter}</span>
                    {selectedChapter === chapter && <span className="ml-auto text-xs">✓</span>}
                  </DropdownMenuItem>
                ))}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        
        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenObjective}
            className={`rounded-full bg-transparent transition-colors ${
              isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
            }`}
          >
            <Target className={`h-4 w-4 mr-1 ${isDarkMode ? 'text-green-400' : 'text-blue-600'}`} />
            <span className={`font-thin text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Objectives</span>
          </Button>
          
          <button
            onClick={onOpenMode}
            className={`px-2 py-1 rounded-full bg-transparent transition-colors text-xs font-thin flex items-center ${
              mode !== "manual" 
                ? (isDarkMode ? "text-green-300 bg-green-900/20" : "text-blue-600 bg-blue-50") 
                : ""
            } ${
              isDarkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            {getModeIcon(mode)}
            <span>{mode === "manual" ? "Manual" : mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
          </button>
        </div>

        <div className="ml-2 flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className={`h-8 w-8 cursor-pointer transition-all ${
                isDarkMode ? 'hover:ring-2 hover:ring-green-400' : 'hover:ring-2 hover:ring-blue-200'
              }`}>
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className={`text-xs ${
                  isDarkMode ? 'bg-green-600 text-white' : 'bg-blue-500 text-white'
                }`}>
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={`w-48 shadow-lg rounded-md p-1 z-50 ${
              isDarkMode ? 'bg-gray-900 border-green-500/30' : 'bg-white border-gray-200'
            }`}>
              <DropdownMenuItem 
                className={`cursor-pointer py-2 rounded-sm transition-colors flex items-center text-blue-500 ${
                  isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default PracticeHeader;
