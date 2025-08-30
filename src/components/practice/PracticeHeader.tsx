import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Target, Navigation, ChevronDown, LogOut, Filter, BookOpen, Clock, User, Users, BarChart, Menu, Settings, Timer, TrendingUp, Hand, Coffee, GraduationCap, Type, CheckCircle, BookMarked } from "lucide-react";
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
import { SAT_SKILLS_STRUCTURE } from "@/data/satSkills";

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
  activeTab?: "problem" | "solution" | "quote";
  setActiveTab?: (tab: "problem" | "solution" | "quote") => void;
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
  onSettingsChange,
  activeTab,
  setActiveTab
}: PracticeHeaderProps) => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { isDarkMode } = useTheme();
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);
  const [isChapterDropdownOpen, setIsChapterDropdownOpen] = useState(false);
  const [isModuleDropdownOpen, setIsModuleDropdownOpen] = useState(false);
  const [isExamDropdownOpen, setIsExamDropdownOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<string>("All Chapters");
  const [selectedModule, setSelectedModule] = useState<string>("All Modules");
  const [selectedExam, setSelectedExam] = useState<number | null>(null);

  const pages = [
    { name: "Account", path: "/account" },
    { name: "Practice", path: "/practice" },
    { name: "Analytics", path: "/analytics" },
    { name: "About us", path: "/about" },
  ];

  // Generate chapters from SAT skills structure
  const chapters = [
    "All Chapters",
    ...Object.values(SAT_SKILLS_STRUCTURE).flatMap(section => 
      section.domains.map(domain => domain.title)
    )
  ];

  const exams = [
    "All Exams",
    "Exam 3",
    "Exam 5",
    "Exam 7", 
    "Exam 8",
    "Exam 12"
  ];

  const modules = [
    "All Modules",
    "math",
    "reading", 
    "writing"
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
        module: selectedModule === "All Modules" ? undefined : selectedModule,
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
        module: module === "All Modules" ? undefined : module,
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
      
      const moduleValue = selectedModule === "All Modules" ? undefined : selectedModule;
      
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
    setSelectedModule("All Modules");
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
    if (selectedModule !== "All Modules") {
      filters.push(selectedModule);
    }
    
    return filters.length > 0 ? filters.join(" • ") : "All Questions";
  };

  const hasActiveFilters = () => {
    return selectedExam !== null || selectedChapter !== "All Chapters" || selectedModule !== "All Modules";
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
    <header 
      className="fixed top-0 left-0 right-0 w-full z-50 border-b shadow-lg transition-all duration-300 animate-header-shiver"
      style={{
        background: isDarkMode 
          ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.85) 0%, rgba(139, 92, 246, 0.8) 20%, rgba(99, 102, 241, 0.85) 40%, rgba(79, 70, 229, 0.9) 60%, rgba(55, 65, 81, 0.8) 80%, rgba(31, 41, 55, 0.85) 100%)'
          : 'linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(226, 232, 240, 0.85) 15%, rgba(203, 213, 225, 0.9) 30%, rgba(148, 163, 184, 0.85) 45%, rgba(59, 130, 246, 0.9) 65%, rgba(37, 99, 235, 0.8) 85%, rgba(29, 78, 216, 0.85) 100%)',
        borderColor: isDarkMode ? 'rgba(139, 92, 246, 0.4)' : 'rgba(37, 99, 235, 0.3)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: isDarkMode 
          ? '0 8px 32px rgba(139, 92, 246, 0.2), 0 0 40px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          : '0 8px 32px rgba(37, 99, 235, 0.2), 0 0 40px rgba(148, 163, 184, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        animation: 'header-shiver 60s ease-in-out infinite',
        border: '1px solid rgba(255, 255, 255, 0.18)'
      }}
    >
      
      {/* Main Header Content */}
      <div className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 flex items-center justify-between min-h-[48px]">
      <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
        {/* Mobile Hamburger Menu */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="lg:hidden rounded-lg transition-all duration-200 ease-out hover:scale-105 active:scale-95 hover:bg-white/20 text-white"
        >
          <Menu className="h-5 w-5 text-white" />
        </Button>

        {/* Desktop Navigation Dropdown */}
        <DropdownMenu open={isNavDropdownOpen} onOpenChange={setIsNavDropdownOpen}>
          <DropdownMenuTrigger className={`hidden lg:block rounded-lg p-2 transition-all duration-200 ease-out hover:scale-105 active:scale-95 ${
            isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
          }`}>
            <Navigation className={`h-5 w-5 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className={`w-56 shadow-xl rounded-lg p-2 z-[60] ${
            isDarkMode ? 'bg-gray-900 border-green-500/30' : 'bg-white border-gray-200'
          }`} sideOffset={5}>
            <ScrollArea className="h-auto max-h-[300px]">
              {pages.map((page, index) => (
                <DropdownMenuItem 
                  key={index}
                  className={`cursor-pointer py-2 rounded-sm transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] flex items-center ${
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
        
        {/* Tab Menu - Centered */}
        {activeTab && setActiveTab && (
          <div className="hidden lg:flex items-center">
            <div className={`inline-flex items-center rounded-full px-2 py-1 border ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <Button
                variant="ghost"
                size="sm"
                className={`px-3 py-1 rounded-full transition-all duration-200 ease-out hover:scale-105 active:scale-95 h-6 text-xs ${activeTab === "problem" 
                  ? isDarkMode 
                    ? "text-green-400 bg-gray-700 shadow-sm" 
                    : "text-blue-600 bg-blue-100 shadow-sm"
                  : isDarkMode
                    ? "text-gray-400 hover:text-green-300 hover:bg-gray-700"
                    : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"}`}
                onClick={() => setActiveTab("problem")}
              >
                <Target className="h-3 w-3 mr-1" />
                Problem
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`px-3 py-1 rounded-full transition-all duration-200 ease-out hover:scale-105 active:scale-95 h-6 text-xs ${activeTab === "solution" 
                  ? isDarkMode 
                    ? "text-green-400 bg-gray-700 shadow-sm" 
                    : "text-blue-600 bg-blue-100 shadow-sm"
                  : isDarkMode
                    ? "text-gray-400 hover:text-green-300 hover:bg-gray-700"
                    : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"}`}
                onClick={() => setActiveTab("solution")}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Solution
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`px-3 py-1 rounded-full transition-all duration-200 ease-out hover:scale-105 active:scale-95 h-6 text-xs ${activeTab === "quote" 
                  ? isDarkMode 
                    ? "text-green-400 bg-gray-700 shadow-sm" 
                    : "text-blue-600 bg-blue-100 shadow-sm"
                  : isDarkMode
                    ? "text-gray-400 hover:text-green-300 hover:bg-gray-700"
                    : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"}`}
                onClick={() => setActiveTab("quote")}
              >
                <BookMarked className="h-3 w-3 mr-1" />
                Idea
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-1 sm:gap-2 overflow-hidden min-w-0 flex-shrink-0">
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
          }`} sideOffset={5} avoidCollisions={true}>
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
        <div className="hidden md:flex items-center gap-1 flex-shrink-0">
          {/* Module Filter - Desktop */}
          <DropdownMenu open={isModuleDropdownOpen} onOpenChange={setIsModuleDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-full bg-transparent transition-colors flex w-[100px] min-w-[100px] max-w-[100px] justify-center overflow-hidden hover:bg-white/20 text-white ${selectedModule !== "All Modules" ? 'bg-white/30' : ''}`}
              >
                <BookOpen className="h-4 w-4 mr-1 flex-shrink-0 text-white" />
                <span className="font-thin text-xs truncate max-w-[50px] text-white">
                  {selectedModule === "All Modules" ? "All" : selectedModule}
                </span>
                <ChevronDown className={`ml-1 h-3 w-3 flex-shrink-0 transition-transform ${isModuleDropdownOpen ? "rotate-180" : ""} text-white/80`} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={`w-56 shadow-lg rounded-lg p-2 z-50 ${
              isDarkMode ? 'bg-gray-900 border-green-500/30' : 'bg-white border-gray-200'
            }`} sideOffset={5} avoidCollisions={true}>
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
                className={`rounded-full bg-transparent transition-colors flex w-[80px] min-w-[80px] max-w-[80px] justify-center overflow-hidden hover:bg-white/20 text-white ${selectedExam !== null ? 'bg-white/30' : ''}`}
              >
                <Target className="h-4 w-4 mr-1 flex-shrink-0 text-white" />
                <span className="font-thin text-xs truncate max-w-[40px] text-white">
                  {selectedExam !== null ? `E${selectedExam}` : "All"}
                </span>
                <ChevronDown className={`ml-1 h-3 w-3 flex-shrink-0 transition-transform ${isExamDropdownOpen ? "rotate-180" : ""} text-white/80`} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={`w-56 shadow-lg rounded-lg p-2 z-50 ${
              isDarkMode ? 'bg-gray-900 border-green-500/30' : 'bg-white border-gray-200'
            }`} sideOffset={5} avoidCollisions={true}>
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
                className={`rounded-full bg-transparent transition-colors flex w-[120px] min-w-[120px] max-w-[120px] justify-center overflow-hidden ${
                  isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                } ${selectedChapter !== "All Chapters" ? (isDarkMode ? 'text-green-300 bg-green-900/20' : 'text-blue-600 bg-blue-50') : ''}`}
              >
                <BookOpen className={`h-4 w-4 mr-1 flex-shrink-0 ${isDarkMode ? 'text-green-400' : 'text-blue-600'}`} />
                <span className={`font-thin text-xs truncate max-w-[70px] ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {selectedChapter === "All Chapters" ? "All" : selectedChapter}
                </span>
                <ChevronDown className={`ml-1 h-3 w-3 flex-shrink-0 transition-transform ${isChapterDropdownOpen ? "rotate-180" : ""} ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={`w-64 shadow-lg rounded-lg p-2 z-50 ${
              isDarkMode ? 'bg-gray-900 border-green-500/30' : 'bg-white border-gray-200'
            }`} sideOffset={5} avoidCollisions={true}>
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
            } hover:bg-white/20 text-white`}
          >
            {getModeIcon(mode)}
            <span>{mode === "manual" ? "Manual" : mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
          </button>
        </div>

        <div className="ml-2 flex items-center flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-8 w-8 cursor-pointer transition-all hover:ring-2 hover:ring-white/50">
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
            }`} sideOffset={5} avoidCollisions={true}>
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
      </div>
    </header>
    
    {/* Custom CSS for header shivering animation */}
    <style>{`
      @keyframes header-shiver {
        0%, 100% { transform: translateX(0px) scale(1); }
        10% { transform: translateX(1px) scale(1.002); }
        20% { transform: translateX(-1px) scale(0.998); }
        30% { transform: translateX(1px) scale(1.001); }
        40% { transform: translateX(0px) scale(1); }
        50% { transform: translateX(-1px) scale(1.001); }
        60% { transform: translateX(1px) scale(0.999); }
        70% { transform: translateX(-1px) scale(1.002); }
        80% { transform: translateX(1px) scale(0.998); }
        90% { transform: translateX(0px) scale(1.001); }
      }
      
      .animate-header-shiver {
        animation: header-shiver 60s ease-in-out infinite;
      }
    `}</style>
  );
};

export default PracticeHeader;
