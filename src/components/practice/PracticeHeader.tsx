import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Target, Navigation, ChevronDown, LogOut, Filter, BookOpen, Clock, User, Users, Menu, Settings, Timer, TrendingUp, Hand, Coffee, GraduationCap, Type, CheckCircle, BookMarked, Home } from "lucide-react";
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
  onOpenSounds?: () => void;
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
  activeTab?: "problem" | "solution" | "quote" | "grid";
  setActiveTab?: (tab: "problem" | "solution" | "quote" | "grid") => void;
  mode?: string;
}

export const PracticeHeader = ({ 
  onToggleSidebar, 
  onOpenObjective, 
  onOpenMode,
  onOpenSounds, 
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
    { name: "Home", path: "/" },
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
      case "Home":
        return <Home className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />;
      case "Account":
        return <User className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />;
      case "Practice":
        return <BookOpen className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />;
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
        return <Timer className="h-4 w-4 mr-1 text-black" />;
      case "level":
        return <TrendingUp className="h-4 w-4 mr-1 text-black" />;
      case "manual":
        return <Hand className="h-4 w-4 mr-1 text-black" />;
      case "pomodoro":
        return <Coffee className="h-4 w-4 mr-1 text-black" />;
      case "exam":
        return <GraduationCap className="h-4 w-4 mr-1 text-black" />;
      default:
        return <Clock className="h-4 w-4 mr-1 text-black" />;
    }
  };

  return (
    <header 
      className="fixed top-0 left-0 right-0 w-full z-50 border-b shadow-lg transition-all duration-300 animate-header-shiver"
      style={{
        backgroundImage: 'url(/resources/whaiteone.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        borderBottom: '2px solid transparent',
        borderImage: 'linear-gradient(90deg, #FB923C 0%, #000000 50%, #EA580C 100%) 1',
        backdropFilter: 'blur(2px) saturate(120%)',
        WebkitBackdropFilter: 'blur(2px) saturate(120%)'
      }}
    >
      {/* Main Header Content */}
      <div className="px-1 sm:px-2 md:px-4 py-1 sm:py-2 flex items-center justify-between min-h-[40px] relative z-10">
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
            <div className="inline-flex items-center rounded-full px-2 py-1 border-2" style={{
              borderColor: '#EA580C',
              background: 'rgba(255, 255, 255, 0.9)'
            }}>
              <Button
                variant="ghost"
                size="sm"
                className="px-3 py-1 rounded-full transition-all duration-200 ease-out hover:scale-105 active:scale-95 h-6 text-xs"
                style={activeTab === "problem" ? {
                  background: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)',
                  color: '#000000'
                } : {
                  color: '#6B7280'
                }}
                onClick={() => setActiveTab("problem")}
              >
                <Target className="h-3 w-3 mr-1" style={activeTab !== "problem" ? {
                  background: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                } : {}} />
                Problem
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="px-3 py-1 rounded-full transition-all duration-200 ease-out hover:scale-105 active:scale-95 h-6 text-xs"
                style={(mode === "exam" ? activeTab === "grid" : activeTab === "solution") ? {
                  background: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)',
                  color: '#000000'
                } : {
                  color: '#6B7280'
                }}
                onClick={() => setActiveTab(mode === "exam" ? "grid" : "solution")}
              >
                <CheckCircle className="h-3 w-3 mr-1" style={(mode === "exam" ? activeTab !== "grid" : activeTab !== "solution") ? {
                  background: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                } : {}} />
                {mode === "exam" ? "Grid" : "Solution"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="px-3 py-1 rounded-full transition-all duration-200 ease-out hover:scale-105 active:scale-95 h-6 text-xs"
                style={activeTab === "quote" ? {
                  background: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)',
                  color: '#000000'
                } : {
                  color: '#6B7280'
                }}
                onClick={() => setActiveTab("quote")}
              >
                <BookMarked className="h-3 w-3 mr-1" style={activeTab !== "quote" ? {
                  background: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                } : {}} />
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
              className="md:hidden rounded-full transition-colors hover:scale-105 text-black font-semibold h-7 w-7"
              style={{
                background: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)',
                boxShadow: '0 2px 4px rgba(251, 146, 60, 0.3)'
              }}
            >
              <Filter className="h-4 w-4 text-black" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 shadow-lg rounded-lg p-2 z-50 bg-orange-50 border-orange-200" sideOffset={5} avoidCollisions={true}>
            <ScrollArea className="h-[350px]">
            <div className={`px-3 py-2 text-sm font-semibold border-b mb-2 ${
              isDarkMode ? 'text-gray-300 border-gray-700' : 'text-gray-700 border-gray-200'
            }`}>
              Filters
            </div>
            
            {/* Mobile Module Selection - Horizontal */}
            <div className="mb-3">
              <div className={`text-xs font-medium mb-2 px-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Module</div>
              <div className="flex gap-1 px-3 overflow-x-auto pb-2">
                {modules.map((module) => (
                  <Button
                    key={module}
                    variant="outline"
                    size="sm"
                    className={`flex-shrink-0 text-xs px-3 py-1 h-7 rounded-full transition-colors ${
                      selectedModule === module ? 'bg-orange-100 border-orange-300 text-orange-800' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => handleModuleFilter(module)}
                  >
                    {module}
                  </Button>
                ))}
              </div>
            </div>

            {/* Mobile Chapter Selection - Horizontal with Scrolling */}
            <div className="mb-3">
              <div className={`text-xs font-medium mb-2 px-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Chapter</div>
              <div className="px-3">
                <ScrollArea className="w-full">
                  <div className="flex gap-1 pb-2 min-w-max">
                    {chapters.map((chapter, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className={`flex-shrink-0 text-xs px-3 py-1 h-7 rounded-full transition-colors whitespace-nowrap ${
                          selectedChapter === chapter ? 'bg-orange-100 border-orange-300 text-orange-800' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                        onClick={() => handleChapterFilter(chapter)}
                      >
                        {chapter}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
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
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>


        {/* Desktop Individual Filter Buttons - Just Exam */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          {/* Mock Test Button - Desktop */}
          <DropdownMenu open={isExamDropdownOpen} onOpenChange={setIsExamDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full transition-colors flex min-w-[120px] justify-center overflow-hidden hover:scale-105 text-black font-semibold px-4 h-7"
                style={{
                  background: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)'
                }}
              >
                <Target className="h-4 w-4 mr-2 flex-shrink-0 text-black" />
                <span className="font-semibold text-sm text-black">
                  {selectedExam !== null ? `Mock Test E${selectedExam}` : "Mock Test"}
                </span>
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
        </div>

        
        {/* Desktop Action Buttons - 5 Main Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {/* Button 1: Chapter Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full transition-colors hover:scale-105 text-black font-semibold px-4 min-w-[100px] h-7"
                style={{
                  background: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)'
                }}
              >
                <BookOpen className="h-4 w-4 mr-2 text-black" />
                <span className="text-sm text-black truncate max-w-[80px]">
                  {selectedChapter === "All Chapters" ? "Chapter" : selectedChapter}
                </span>
                <ChevronDown className="ml-1 h-3 w-3 text-black" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 shadow-lg rounded-lg p-4 z-50">
              <div className="space-y-4">
                <div className="text-sm font-semibold text-gray-700 mb-3">Select Chapter</div>
                
                {/* Chapter Filter - Horizontal with Scrolling */}
                <div>
                  <ScrollArea className="w-full">
                    <div className="flex gap-1 pb-2 min-w-max">
                      {chapters.map((chapter, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className={`flex-shrink-0 text-xs px-3 py-1 h-7 rounded-full transition-colors whitespace-nowrap ${
                            selectedChapter === chapter ? 'bg-orange-100 border-orange-300 text-orange-800' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                          }`}
                          onClick={() => handleChapterFilter(chapter)}
                        >
                          {chapter}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Button 2: Settings */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full transition-colors hover:scale-105 text-black font-semibold px-4 h-7"
                style={{
                  background: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)'
                }}
              >
                <Settings className="h-4 w-4 mr-2 text-black" />
                <span className="text-sm text-black">Settings</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 shadow-lg rounded-lg p-2 z-50">
              <div className="space-y-3">
                <div className="px-3 py-2 text-sm font-semibold border-b">Settings</div>
                
                <DropdownMenuItem>
                  <Type className="h-4 w-4 mr-2 text-orange-500" />
                  <span className="text-sm">Font Settings</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={onOpenSounds}>
                  <BookOpen className="h-4 w-4 mr-2 text-orange-500" />
                  <span className="text-sm">Sound Settings</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Button 3: Practice Mode */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full transition-colors hover:scale-105 text-black font-semibold px-4 h-7"
                style={{
                  background: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)'
                }}
              >
                {getModeIcon(mode)}
                <span className="text-sm text-black ml-1">Practice Mode</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 shadow-lg rounded-lg p-2 z-50">
              <div className="space-y-2">
                <div className="px-3 py-2 text-sm font-semibold border-b">Practice</div>
                
                <DropdownMenuItem onClick={onOpenMode}>
                  <Timer className="h-4 w-4 mr-2 text-orange-500" />
                  <span className="text-sm">Change Mode</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={onOpenObjective}>
                  <Target className="h-4 w-4 mr-2 text-orange-500" />
                  <span className="text-sm">Objectives</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

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
  );
};

export default PracticeHeader;
