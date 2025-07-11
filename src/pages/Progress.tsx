import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { TabsList, Tabs, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { ProgressDashboard } from "@/components/progress/ProgressDashboard";
import { LeaderboardData } from "@/components/progress/LeaderboardData";
import { FullPageLoader } from "@/components/progress/FullPageLoader";
import type { TimePeriod, ProgressTab } from "@/types/progress";
import { TrendingUp, Trophy, Navigation, Bell, Home, Users, BookOpen, BarChart } from "lucide-react";
import { ProgressNavigation } from "@/components/progress/ProgressNavigation";
import { SecureProgressDataProvider } from "@/components/progress/SecureProgressDataProvider";
import { useProgress } from "@/contexts/ProgressContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import AIAnalyzer from "@/components/ai/AIAnalyzer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/contexts/ThemeContext";

// Define the VisibleSections type to match the structure
type VisibleSections = {
  totalProgress: boolean;
  performanceGraph: boolean;
  difficultyStats: boolean;
  chapterProgress: boolean;
  timeManagement: boolean;
  goals: boolean;
};

// Define course type
type Course = {
  id: string;
  name: string;
  status: 'active' | 'expired';
  expiresIn: number;
};

const DUMMY_PROGRESS = {
  userId: 'dummy',
  totalProgressPercent: 75,
  correctAnswers: 53,
  incorrectAnswers: 21,
  unattemptedQuestions: 56,
  questionsAnsweredToday: 12,
  streak: 7,
  averageScore: 92,
  rank: 120,
  projectedScore: 92,
  speed: 85,
  easyAccuracy: 90,
  easyAvgTime: 1.5,
  easyCompleted: 45,
  easyTotal: 50,
  mediumAccuracy: 70,
  mediumAvgTime: 2.5,
  mediumCompleted: 35,
  mediumTotal: 50,
  hardAccuracy: 83,
  hardAvgTime: 4.0,
  hardCompleted: 25,
  hardTotal: 30,
  goalAchievementPercent: 75,
  averageTime: 2.5,
  correctAnswerAvgTime: 2.0,
  incorrectAnswerAvgTime: 3.5,
  longestQuestionTime: 8.0,
  performanceGraph: Array.from({
    length: 15
  }, (_, i) => ({
    date: new Date(Date.now() - (14 - i) * 24 * 3600 * 1000).toISOString().slice(0, 10),
    attempted: Math.floor(Math.random() * 30) + 10
  })),
  chapterPerformance: [
    {
      chapterId: '1',
      chapterName: 'Chapter 1',
      correct: 12,
      incorrect: 3,
      unattempted: 5,
    },
    {
      chapterId: '2',
      chapterName: 'Chapter 2',
      correct: 8,
      incorrect: 2,
      unattempted: 5,
    },
    {
      chapterId: '3',
      chapterName: 'Chapter 3',
      correct: 10,
      incorrect: 5,
      unattempted: 10,
    },
    {
      chapterId: '4',
      chapterName: 'Chapter 4',
      correct: 20,
      incorrect: 4,
      unattempted: 6,
    },
    {
      chapterId: '5',
      chapterName: 'Chapter 5',
      correct: 5,
      incorrect: 3,
      unattempted: 10,
    },
    {
      chapterId: '6',
      chapterName: 'Chapter 6',
      correct: 14,
      incorrect: 1,
      unattempted: 5,
    },
    {
      chapterId: '7',
      chapterName: 'Chapter 7',
      correct: 9,
      incorrect: 6,
      unattempted: 5,
    },
    {
      chapterId: '8',
      chapterName: 'Chapter 8',
      correct: 11,
      incorrect: 3,
      unattempted: 6,
    },
    {
      chapterId: '9',
      chapterName: 'Chapter 9',
      correct: 7,
      incorrect: 4,
      unattempted: 9,
    },
    {
      chapterId: '10',
      chapterName: 'Chapter 10',
      correct: 13,
      incorrect: 2,
      unattempted: 5,
    },
    {
      chapterId: '11',
      chapterName: 'Chapter 11',
      correct: 6,
      incorrect: 3,
      unattempted: 11,
    },
    {
      chapterId: '12',
      chapterName: 'Chapter 12',
      correct: 15,
      incorrect: 5,
      unattempted: 5,
    },
    {
      chapterId: '13',
      chapterName: 'Chapter 13',
      correct: 8,
      incorrect: 7,
      unattempted: 5,
    },
    {
      chapterId: '14',
      chapterName: 'Chapter 14',
      correct: 10,
      incorrect: 4,
      unattempted: 6,
    },
    {
      chapterId: '15',
      chapterName: 'Chapter 15',
      correct: 9,
      incorrect: 3,
      unattempted: 8,
    },
  ],
  goals: [{
    id: '1',
    title: 'Complete 100 Questions',
    targetValue: 100,
    currentValue: 75,
    dueDate: '2024-05-01'
  }, {
    id: '2',
    title: 'Achieve 90% in Hard Questions',
    targetValue: 90,
    currentValue: 83,
    dueDate: '2024-05-15'
  }]
};

// Create a wrapper component to use the context
const ProgressContent = () => {
  const { progressData, isLoading } = useProgress();
  const [period, setPeriod] = useState<TimePeriod>("weekly");
  const [activeTab, setActiveTab] = useState<ProgressTab>("performance");
  const [visibleSections, setVisibleSections] = useState<VisibleSections>({
    totalProgress: true,
    performanceGraph: true,
    difficultyStats: true,
    chapterProgress: true,
    timeManagement: true,
    goals: true
  });
  
  // Create a handler that matches the expected type
  const handleSetVisibleSections = (sections: Record<string, boolean>) => {
    setVisibleSections(prev => ({
      ...prev,
      ...sections
    }));
  };
  
  if (isLoading || !progressData) {
    return <FullPageLoader />;
  }
  
  return (
    <TabsContent value="performance">
      <ProgressDashboard 
        period={period} 
        type="performance" 
        userData={progressData} 
        className="[&_path]:stroke-mono-accent [&_.recharts-area]:fill-gradient-to-b [&_.recharts-area]:from-mono-hover [&_.recharts-area]:to-mono-bg [&_.recharts-bar]:fill-gradient-to-b [&_.recharts-bar]:from-mono-text [&_.recharts-bar]:to-mono-accent [&_.recharts-line]:stroke-mono-accent" 
        visibleSections={visibleSections} 
      />
    </TabsContent>
  );
};

const Progress = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { progressData } = useProgress();
  const { isDarkMode } = useTheme();
  const [period, setPeriod] = useState<TimePeriod>("weekly");
  const [activeTab, setActiveTab] = useState<ProgressTab>("performance");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);
  const [courses, setCourses] = useState<Course[]>([
    { id: '1', name: 'SAT Math', status: 'active', expiresIn: 30 },
    { id: '2', name: 'SAT Reading', status: 'active', expiresIn: 25 },
    { id: '3', name: 'SAT Writing', status: 'active', expiresIn: 20 }
  ]);
  const [selectedCourse, setSelectedCourse] = useState<string>('1');
  const queryClient = useQueryClient();
  
  // Add refreshProgressData function to invalidate progress data cache
  const refreshProgressData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['userProgress'] });
  }, [queryClient]);
  
  const navigationItems = [
    { name: "Home", path: "/" },
    { name: "Practice", path: "/practice" },
    { name: "Progress", path: "/progress" },
    { name: "About us", path: "/about" },
  ];
  
  const userId = session?.user?.id;
  const isAuthenticated = !!userId;

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsNavDropdownOpen(false);
  };

  const getNavigationIcon = (itemName: string) => {
    switch (itemName) {
      case "Home":
        return <Home className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />;
      case "Practice":
        return <BookOpen className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />;
      case "Progress":
        return <BarChart className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />;
      case "About us":
        return <Users className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />;
      default:
        return null;
    }
  };
  
  const [visibleSections, setVisibleSections] = useState<VisibleSections>({
    totalProgress: true,
    // Always visible
    performanceGraph: true,
    difficultyStats: true,
    chapterProgress: true,
    timeManagement: true,
    goals: true
  });
  
  // Create a handler that matches the expected type
  const handleSetVisibleSections = (sections: Record<string, boolean>) => {
    setVisibleSections(prev => ({
      ...prev,
      ...sections
    }));
  };
  
  
  return (
    <SecureProgressDataProvider fallbackData={DUMMY_PROGRESS} showLoadingState={true}>
      <div className={`flex min-h-screen w-full transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-mono-bg'
      }`}>
        <main className={`flex-1 transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-900' : 'bg-mono-bg'
        }`}>
          <header className={`sticky top-0 z-50 border-b px-4 h-14 shadow-sm transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-900 border-green-500/30' : 'bg-white border-gray-200'
          }`}>
            <div className="container mx-auto flex h-full items-center justify-between">
              <div className="flex items-center gap-4">
                <DropdownMenu open={isNavDropdownOpen} onOpenChange={setIsNavDropdownOpen}>
                  <DropdownMenuTrigger className={`rounded-lg p-2 ${
                    isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                  } transition-colors`}>
                    <Navigation className={`h-5 w-5 ${
                      isDarkMode ? 'text-green-400' : 'text-gray-500'
                    }`} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className={`w-56 border shadow-lg rounded-lg p-2 ${
                    isDarkMode ? 'bg-gray-800 border-green-500/30' : 'bg-white border-gray-200'
                  }`}>
                    <ScrollArea className="h-auto max-h-[300px]">
                      {navigationItems.map((item, index) => (
                        <DropdownMenuItem 
                          key={index}
                          className={`cursor-pointer py-2 rounded-sm transition-colors flex items-center ${
                            isDarkMode ? 'hover:bg-gray-700 text-green-400' : 'hover:bg-gray-100 text-[#304455]'
                          }`}
                          onClick={() => handleNavigation(item.path)}
                        >
                          {getNavigationIcon(item.name)}
                          <span className={`font-source-sans ${
                            isDarkMode ? 'text-green-400' : 'text-[#304455]'
                          }`}>{item.name}</span>
                        </DropdownMenuItem>
                      ))}
                    </ScrollArea>
                  </DropdownMenuContent>
                </DropdownMenu>
                <h2 className={`text-xl font-bold ${
                  isDarkMode ? 'text-green-400' : 'text-gray-800'
                }`}>Progress Dashboard</h2>
              </div>

              <div className="flex items-center gap-3">
                {/* Notification Bell */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`relative rounded-full ${
                        isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                      }`}
                    >
                      <Bell className={`h-5 w-5 ${
                        isDarkMode ? 'text-green-400' : 'text-gray-600'
                      }`} />
                      {hasNotifications && (
                        <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className={`w-80 border shadow-lg rounded-lg p-2 ${
                    isDarkMode ? 'bg-gray-800 border-green-500/30' : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex justify-between items-center mb-2 px-2">
                      <h3 className={`font-semibold ${
                        isDarkMode ? 'text-green-400' : 'text-gray-900'
                      }`}>Notifications</h3>
                      <Button variant="ghost" size="sm" className={`text-xs ${
                        isDarkMode ? 'text-green-400 hover:text-green-300' : 'text-blue-500 hover:text-blue-700'
                      }`}>
                        Mark all as read
                      </Button>
                    </div>
                    <DropdownMenuSeparator className={isDarkMode ? 'bg-green-500/30' : 'bg-gray-200'} />
                    <ScrollArea className="h-64">
                      <div className={`p-2 text-sm rounded-md mb-2 ${
                        isDarkMode ? 'bg-gray-700' : 'bg-blue-50'
                      }`}>
                        <p className={`font-medium ${
                          isDarkMode ? 'text-green-400' : ''
                        }`}>Progress milestone reached!</p>
                        <p className={
                          isDarkMode ? 'text-green-300' : 'text-gray-600'
                        }>You've completed 75% of your course material.</p>
                        <p className={`text-xs mt-1 ${
                          isDarkMode ? 'text-green-400/70' : 'text-gray-500'
                        }`}>1 hour ago</p>
                      </div>
                      <div className={`p-2 text-sm mb-2 ${
                        isDarkMode ? '' : ''
                      }`}>
                        <p className={`font-medium ${
                          isDarkMode ? 'text-green-400' : ''
                        }`}>Weekly report available</p>
                        <p className={
                          isDarkMode ? 'text-green-300' : 'text-gray-600'
                        }>Your performance report for this week is ready.</p>
                        <p className={`text-xs mt-1 ${
                          isDarkMode ? 'text-green-400/70' : 'text-gray-500'
                        }`}>1 day ago</p>
                      </div>
                      <div className={`p-2 text-sm mb-2 ${
                        isDarkMode ? '' : ''
                      }`}>
                        <p className={`font-medium ${
                          isDarkMode ? 'text-green-400' : ''
                        }`}>New goal suggestion</p>
                        <p className={
                          isDarkMode ? 'text-green-300' : 'text-gray-600'
                        }>We've suggested a new goal based on your progress.</p>
                        <p className={`text-xs mt-1 ${
                          isDarkMode ? 'text-green-400/70' : 'text-gray-500'
                        }`}>2 days ago</p>
                      </div>
                    </ScrollArea>
                    <DropdownMenuSeparator className={isDarkMode ? 'bg-green-500/30' : 'bg-gray-200'} />
                    <Button variant="ghost" size="sm" className={`w-full text-center text-sm mt-1 ${
                      isDarkMode ? 'text-green-400 hover:text-green-300' : ''
                    }`}>
                      View all notifications
                    </Button>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <ProgressNavigation 
                  sidebarOpen={sidebarOpen}
                  setSidebarOpen={setSidebarOpen}
                  setPeriod={(value: TimePeriod) => setPeriod(value)}
                  visibleSections={visibleSections}
                  setVisibleSections={handleSetVisibleSections}
                  selectedCourse={selectedCourse}
                  setSelectedCourse={setSelectedCourse}
                  courses={courses}
                />
              </div>
            </div>
          </header>

          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={value => setActiveTab(value as ProgressTab)} className="w-full">
            <div className="container mx-auto p-6">
              <div className="mb-6 flex flex-col items-center gap-4">
                <div className="flex justify-center w-full">
                  <div className={`inline-flex items-center rounded-full p-1 border ${
                    isDarkMode ? 'bg-gray-900 border-green-500/30' : 'bg-white border-gray-200'
                  }`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`px-4 py-2 rounded-full transition-all h-8 flex items-center gap-2 ${activeTab === "performance" 
                        ? isDarkMode 
                          ? "text-green-400 bg-gray-800" 
                          : "text-blue-600 bg-blue-50"
                        : isDarkMode
                          ? "text-green-400 hover:text-green-300 hover:bg-gray-800"
                          : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"}`}
                      onClick={() => setActiveTab("performance")}
                    >
                      <TrendingUp className={`h-4 w-4 ${
                        isDarkMode ? 'text-green-400' : 'text-gray-400'
                      }`} />
                      <span className="hidden sm:inline">Performance</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`px-4 py-2 rounded-full transition-all h-8 flex items-center gap-2 ${activeTab === "leaderboard" 
                        ? isDarkMode 
                          ? "text-green-400 bg-gray-800" 
                          : "text-blue-600 bg-blue-50"
                        : isDarkMode
                          ? "text-green-400 hover:text-green-300 hover:bg-gray-800"
                          : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"}`}
                      onClick={() => setActiveTab("leaderboard")}
                    >
                      <Trophy className={`h-4 w-4 ${
                        isDarkMode ? 'text-green-400' : 'text-gray-400'
                      }`} />
                      <span className="hidden sm:inline">Leaderboard</span>
                    </Button>
                  </div>
                </div>
              </div>
              
              <TabsContent value="performance">
                <ProgressContent />
              </TabsContent>
              
              <TabsContent value="leaderboard">
                <LeaderboardData userId={userId || 'guest'} />
              </TabsContent>
            </div>
          </Tabs>

          {/* AI Assistant for Progress Page */}
          <AIAnalyzer
            context="progress"
            data={{
              userId,
              progressData: progressData || DUMMY_PROGRESS,
              activeTab,
              period
            }}
          />
        </main>
      </div>
    </SecureProgressDataProvider>
  );
};

export default Progress;
