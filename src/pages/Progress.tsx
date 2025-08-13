import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LeaderboardData } from "@/components/progress/LeaderboardData";
import { FullPageLoader } from "@/components/progress/FullPageLoader";
import { Navigation, Bell, Home, Users, BookOpen, BarChart, Target, ChevronDown, LogOut, Moon, Sun, Menu, Clock, Trophy, TrendingUp } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/contexts/ThemeContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar } from 'recharts';

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


const Progress = () => {
  const navigate = useNavigate();
  const { session, user, profile, signOut } = useAuth();
  const { progressData } = useProgress();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);
  const [courses, setCourses] = useState<Course[]>([
    { id: '1', name: 'SAT Math', status: 'active', expiresIn: 30 },
    { id: '2', name: 'SAT Reading', status: 'active', expiresIn: 25 },
    { id: '3', name: 'SAT Writing', status: 'active', expiresIn: 20 }
  ]);
  const [selectedCourse, setSelectedCourse] = useState<string>('1');
  const [selectedView, setSelectedView] = useState<'analytics' | 'exam-results' | 'leaderboard'>('analytics');
  const queryClient = useQueryClient();
  
  // Add refreshProgressData function to invalidate progress data cache
  const refreshProgressData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['userProgress'] });
  }, [queryClient]);
  
  const pages = [
    { name: "Home", path: "/" },
    { name: "Practice", path: "/practice" },
    { name: "Analytics", path: "/analytics" },
    { name: "About us", path: "/about" },
  ];
  
  const userId = session?.user?.id;
  const isAuthenticated = !!userId;

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsNavDropdownOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
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
  
  
  
  return (
    <SecureProgressDataProvider fallbackData={DUMMY_PROGRESS} showLoadingState={true}>
      <div className={`flex min-h-screen w-full transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-mono-bg'
      }`}>
        <main className={`flex-1 transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-900' : 'bg-mono-bg'
        }`}>
          <header className={`fixed top-0 left-0 right-0 w-full z-50 border-b px-1 sm:px-2 md:px-4 py-2 sm:py-3 flex items-center justify-between shadow-sm transition-all duration-300 overflow-hidden ${
            isDarkMode ? 'bg-gray-900 border-green-500/30' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Mobile Hamburger Menu */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
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
              
              {/* SAT Premium Logo */}
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
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className={`rounded-full ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4 text-green-400" />
                ) : (
                  <Moon className="h-4 w-4 text-blue-600" />
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`relative rounded-full ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                  >
                    <Bell className={`h-4 w-4 ${isDarkMode ? 'text-green-400' : 'text-blue-600'}`} />
                    {hasNotifications && (
                      <span className="absolute top-1 right-1.5 w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={`w-80 shadow-lg rounded-lg p-2 z-50 ${
                  isDarkMode ? 'bg-gray-900 border-green-500/30' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex justify-between items-center mb-2 px-2">
                    <h3 className={`font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Notifications</h3>
                    <Button variant="ghost" size="sm" className={`text-xs ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>
                      Mark all as read
                    </Button>
                  </div>
                  <DropdownMenuSeparator className={isDarkMode ? 'bg-green-500/30' : ''} />
                  <ScrollArea className="h-64">
                    <div className={`p-2 text-sm rounded-md mb-2 ${
                      isDarkMode ? 'bg-gray-800' : 'bg-blue-50'
                    }`}>
                      <p className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Progress milestone reached!</p>
                      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>You've completed 75% of your course material.</p>
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>1 hour ago</p>
                    </div>
                  </ScrollArea>
                  <DropdownMenuSeparator className={isDarkMode ? 'bg-green-500/30' : ''} />
                  <Button variant="ghost" size="sm" className={`w-full text-center text-sm mt-1 ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600'}`}>
                    View all notifications
                  </Button>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Course Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={selectedView === 'exam-results' || selectedView === 'leaderboard'}
                    className={`rounded-full bg-transparent transition-colors flex ${
                      isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                    } ${selectedCourse !== '1' ? (isDarkMode ? 'text-green-300 bg-green-900/20' : 'text-blue-600 bg-blue-50') : ''}`}
                  >
                    <BookOpen className={`h-4 w-4 mr-1 ${isDarkMode ? 'text-green-400' : 'text-blue-600'}`} />
                    <span className={`font-thin text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {courses.find(c => c.id === selectedCourse)?.name || 'SAT Math'}
                    </span>
                    <ChevronDown className={`ml-1 h-3 w-3 transition-transform ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={`w-56 shadow-lg rounded-lg p-2 z-50 ${
                  isDarkMode ? 'bg-gray-900 border-green-500/30' : 'bg-white border-gray-200'
                }`}>
                  <ScrollArea className="h-[150px]">
                    {courses.map((course) => (
                      <DropdownMenuItem 
                        key={course.id}
                        className={`cursor-pointer py-2 px-3 rounded-md transition-colors ${
                          isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                        } ${selectedCourse === course.id ? (isDarkMode ? 'bg-gray-800' : 'bg-gray-100') : ''}`}
                        onClick={() => setSelectedCourse(course.id)}
                      >
                        <span className={`font-source-sans text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{course.name}</span>
                        {selectedCourse === course.id && <span className="ml-auto text-xs">✓</span>}
                      </DropdownMenuItem>
                    ))}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>

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

          <div className="pt-20">
            <div className="container mx-auto p-6">
              {/* Modern Radio Buttons for Analytics/Exam Results/Leaders Board */}
              <div className="mb-8 flex justify-center">
                <div className="inline-flex items-center rounded-full p-1 bg-white shadow-lg border border-gray-100">
                  <button
                    onClick={() => setSelectedView('analytics')}
                    className={`px-6 py-3 rounded-full transition-all duration-300 text-sm font-semibold ${
                      selectedView === 'analytics'
                        ? 'bg-blue-600 text-white shadow-md transform scale-105'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    Analytics
                  </button>
                  <button
                    onClick={() => setSelectedView('exam-results')}
                    className={`px-6 py-3 rounded-full transition-all duration-300 text-sm font-semibold ${
                      selectedView === 'exam-results'
                        ? 'bg-blue-600 text-white shadow-md transform scale-105'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    Exam Results
                  </button>
                  <button
                    onClick={() => setSelectedView('leaderboard')}
                    className={`px-6 py-3 rounded-full transition-all duration-300 text-sm font-semibold ${
                      selectedView === 'leaderboard'
                        ? 'bg-blue-600 text-white shadow-md transform scale-105'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    Leaders Board
                  </button>
                </div>
              </div>

              {/* Analytics View */}
              {selectedView === 'analytics' && (
                <div className="space-y-8">
                  {/* Top Row: Stats Cards around Total Progress */}
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Days to Exam */}
                    <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-0`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Days to Exam</h3>
                          <div className="mt-2">
                            <span className={`text-3xl font-bold ${isDarkMode ? 'text-green-400' : 'text-blue-600'}`}>45</span>
                            <span className={`text-sm ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>days</span>
                          </div>
                        </div>
                        <Clock className={`h-8 w-8 ${isDarkMode ? 'text-green-400/70' : 'text-blue-500/70'}`} />
                      </div>
                    </div>

                    {/* Streak */}
                    <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-0`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Current Streak</h3>
                          <div className="mt-2">
                            <span className={`text-3xl font-bold ${isDarkMode ? 'text-green-400' : 'text-blue-600'}`}>{DUMMY_PROGRESS.streak}</span>
                            <span className={`text-sm ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>days</span>
                          </div>
                        </div>
                        <TrendingUp className={`h-8 w-8 ${isDarkMode ? 'text-green-400/70' : 'text-blue-500/70'}`} />
                      </div>
                    </div>

                    {/* Total Progress - Center with larger size */}
                    <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border-0 lg:col-span-1`}>
                      <div className="text-center">
                        <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>Total Progress</h3>
                        <div className="relative w-24 h-24 mx-auto">
                          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                              strokeWidth="8"
                              fill="none"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              stroke={isDarkMode ? '#10b981' : '#3b82f6'}
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray={`${DUMMY_PROGRESS.totalProgressPercent * 2.83} 283`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-xl font-bold ${isDarkMode ? 'text-green-400' : 'text-blue-600'}`}>
                              {DUMMY_PROGRESS.totalProgressPercent}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Projected Score */}
                    <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-0`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Projected Score</h3>
                          <div className="mt-2">
                            <span className={`text-3xl font-bold ${isDarkMode ? 'text-green-400' : 'text-blue-600'}`}>{DUMMY_PROGRESS.projectedScore}</span>
                            <span className={`text-sm ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>/100</span>
                          </div>
                        </div>
                        <Target className={`h-8 w-8 ${isDarkMode ? 'text-green-400/70' : 'text-blue-500/70'}`} />
                      </div>
                    </div>

                    {/* Global Ranking */}
                    <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-0`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Global Ranking</h3>
                          <div className="mt-2">
                            <span className={`text-3xl font-bold ${isDarkMode ? 'text-green-400' : 'text-blue-600'}`}>#{DUMMY_PROGRESS.rank}</span>
                            <span className={`text-sm ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>worldwide</span>
                          </div>
                        </div>
                        <Trophy className={`h-8 w-8 ${isDarkMode ? 'text-green-400/70' : 'text-blue-500/70'}`} />
                      </div>
                    </div>
                  </div>

                  {/* Minimalistic Separator */}
                  <div className={`border-t ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'}`}></div>

                  {/* Chapter Performance Table - Full Width */}
                  <div className={`p-8 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-0`}>
                    <h3 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Chapter Performance Analysis</h3>
                      
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className={`border-b-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <th className={`text-left py-4 px-6 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Chapter</th>
                            <th className={`text-center py-4 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Accuracy</th>
                            <th className={`text-center py-4 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Avg Speed</th>
                            <th className={`text-center py-4 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Accuracy Percentile</th>
                            <th className={`text-center py-4 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Progress</th>
                            <th className={`text-center py-4 px-6 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Remark</th>
                          </tr>
                        </thead>
                        <tbody>
                          {DUMMY_PROGRESS.chapterPerformance.map((chapter) => {
                            const accuracy = Math.round((chapter.correct / (chapter.correct + chapter.incorrect)) * 100);
                            const avgSpeed = (Math.random() * 2 + 0.8).toFixed(1); // questions per minute
                            const accuracyPercentile = Math.floor(Math.random() * 40 + 60);
                            const progress = Math.round(((chapter.correct + chapter.incorrect) / (chapter.correct + chapter.incorrect + chapter.unattempted)) * 100);
                            
                            // Generate remark based on performance
                            const getRemark = (acc: number, perc: number) => {
                              if (acc >= 85 && perc >= 80) return { text: "Excellent", color: "text-green-600" };
                              if (acc >= 75 && perc >= 70) return { text: "Good", color: "text-blue-600" };
                              if (acc >= 65 && perc >= 60) return { text: "Average", color: "text-yellow-600" };
                              if (acc >= 50) return { text: "Needs Work", color: "text-orange-600" };
                              return { text: "Focus Required", color: "text-red-600" };
                            };
                            
                            const remark = getRemark(accuracy, accuracyPercentile);
                            
                            return (
                              <tr key={chapter.chapterId} className={`border-b ${isDarkMode ? 'border-gray-700/50' : 'border-gray-100'} hover:${isDarkMode ? 'bg-gray-700/30' : 'bg-blue-50/30'} transition-colors`}>
                                <td className={`py-4 px-6 font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                  {chapter.chapterName}
                                </td>
                                <td className="py-4 px-4 text-center">
                                  <span className={`font-bold text-lg ${accuracy >= 80 ? 'text-green-600' : accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {accuracy}%
                                  </span>
                                </td>
                                <td className={`py-4 px-4 text-center font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {avgSpeed} <span className="text-xs text-gray-500">q/min</span>
                                </td>
                                <td className="py-4 px-4 text-center">
                                  <span className={`font-bold ${accuracyPercentile >= 80 ? 'text-green-600' : accuracyPercentile >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {accuracyPercentile}th
                                  </span>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className={`flex-1 bg-gray-200 rounded-full h-3 ${isDarkMode ? 'bg-gray-700' : ''}`}>
                                      <div 
                                        className={`h-3 rounded-full transition-all duration-500 ${
                                          progress >= 80 ? 'bg-green-500' : progress >= 60 ? 'bg-blue-500' : 'bg-yellow-500'
                                        }`}
                                        style={{ width: `${progress}%` }}
                                      ></div>
                                    </div>
                                    <span className={`text-sm font-medium min-w-[45px] ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {progress}%
                                    </span>
                                  </div>
                                </td>
                                <td className="py-4 px-6 text-center">
                                  <span className={`font-semibold px-3 py-1 rounded-full text-sm ${remark.color} ${
                                    isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                                  }`}>
                                    {remark.text}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Daily Performance Chart */}
                  <div className={`p-8 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-0 mt-8`}>
                    <h3 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Daily Performance Trend</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={DUMMY_PROGRESS.performanceGraph}>
                          <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                          <XAxis 
                            dataKey="date" 
                            stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                            fontSize={12}
                          />
                          <YAxis 
                            stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                            fontSize={12}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                              border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                              borderRadius: '8px'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="attempted" 
                            stroke={isDarkMode ? '#10b981' : '#3b82f6'}
                            strokeWidth={3}
                            dot={{ fill: isDarkMode ? '#10b981' : '#3b82f6', r: 4 }}
                            activeDot={{ r: 6, fill: isDarkMode ? '#10b981' : '#3b82f6' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Exam Tests Summary & Global Analysis */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                    {/* Left Column - Exam Tests Status Summary */}
                    <div className={`p-8 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-0`}>
                      <h3 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Exam Tests Summary</h3>
                      
                      <div className="space-y-4">
                        {/* Practice Tests Completed */}
                        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
                          <div className="flex justify-between items-center mb-2">
                            <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Practice Tests Completed</span>
                            <span className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-blue-600'}`}>12</span>
                          </div>
                          <div className={`w-full bg-gray-200 rounded-full h-2 ${isDarkMode ? 'bg-gray-600' : ''}`}>
                            <div className={`h-2 rounded-full transition-all duration-300 ${isDarkMode ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: '80%' }}></div>
                          </div>
                          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Target: 15 tests</p>
                        </div>

                        {/* Average Score */}
                        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-green-50'}`}>
                          <div className="flex justify-between items-center">
                            <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Average Test Score</span>
                            <span className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>1385</span>
                          </div>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>+45 from last month</p>
                        </div>

                        {/* Best Score */}
                        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-yellow-50'}`}>
                          <div className="flex justify-between items-center">
                            <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Best Score</span>
                            <span className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>1520</span>
                          </div>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Achieved on March 10, 2024</p>
                        </div>

                        {/* Time Management */}
                        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-purple-50'}`}>
                          <div className="flex justify-between items-center">
                            <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Avg. Test Duration</span>
                            <span className={`text-2xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>3h 2m</span>
                          </div>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Within time limit</p>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Global Analysis */}
                    <div className={`p-8 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-0`}>
                      <h3 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Global Analysis</h3>
                      
                      <div className="space-y-6">
                        {/* Performance Distribution */}
                        <div>
                          <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Score Distribution</h4>
                          <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsBarChart data={[
                                { range: '1200-1300', count: 2 },
                                { range: '1300-1400', count: 5 },
                                { range: '1400-1500', count: 4 },
                                { range: '1500-1600', count: 1 }
                              ]}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                                <XAxis 
                                  dataKey="range" 
                                  stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                                  fontSize={12}
                                />
                                <YAxis 
                                  stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                                  fontSize={12}
                                />
                                <Tooltip 
                                  contentStyle={{
                                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                                    border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                                    borderRadius: '8px'
                                  }}
                                />
                                <Bar dataKey="count" fill={isDarkMode ? '#10b981' : '#3b82f6'} radius={[4, 4, 0, 0]} />
                              </RechartsBarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Strengths & Weaknesses */}
                        <div>
                          <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Key Insights</h4>
                          <div className="space-y-3">
                            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'} border-l-4 border-green-500`}>
                              <p className={`text-sm font-medium ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>Strong Areas</p>
                              <p className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Algebra, Data Analysis</p>
                            </div>
                            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'} border-l-4 border-yellow-500`}>
                              <p className={`text-sm font-medium ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>Improvement Areas</p>
                              <p className={`text-xs ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>Advanced Math, Writing & Language</p>
                            </div>
                            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'} border-l-4 border-blue-500`}>
                              <p className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>Recommendation</p>
                              <p className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Focus on geometry and grammar rules</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Section */}
                  <footer className={`mt-16 py-12 px-8 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} border-t-4 ${isDarkMode ? 'border-green-500' : 'border-blue-500'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* About Section */}
                      <div>
                        <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-green-400' : 'text-blue-600'}`}>SAT® Premium</h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                          Your comprehensive SAT preparation platform. Track your progress, analyze your performance, and achieve your target score with our advanced analytics and personalized insights.
                        </p>
                      </div>

                      {/* Quick Links */}
                      <div>
                        <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Quick Links</h4>
                        <ul className="space-y-2">
                          <li><a href="/practice" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-green-400' : 'text-gray-600 hover:text-blue-600'} transition-colors`}>Practice Tests</a></li>
                          <li><a href="/analytics" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-green-400' : 'text-gray-600 hover:text-blue-600'} transition-colors`}>Analytics Dashboard</a></li>
                          <li><a href="/leaderboard" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-green-400' : 'text-gray-600 hover:text-blue-600'} transition-colors`}>Leaderboard</a></li>
                          <li><a href="/about" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-green-400' : 'text-gray-600 hover:text-blue-600'} transition-colors`}>About Us</a></li>
                        </ul>
                      </div>

                      {/* Statistics */}
                      <div>
                        <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Platform Stats</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Students</span>
                            <span className={`text-sm font-bold ${isDarkMode ? 'text-green-400' : 'text-blue-600'}`}>50,000+</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tests Completed</span>
                            <span className={`text-sm font-bold ${isDarkMode ? 'text-green-400' : 'text-blue-600'}`}>1.2M+</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg. Score Improvement</span>
                            <span className={`text-sm font-bold ${isDarkMode ? 'text-green-400' : 'text-blue-600'}`}>+180 pts</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Copyright */}
                    <div className={`mt-8 pt-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} text-center`}>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        © 2024 SAT Premium. All rights reserved. SAT® is a trademark of the College Board.
                      </p>
                    </div>
                  </footer>
                </div>
              )}

              {/* Exam Results View - SAT Style */}
              {selectedView === 'exam-results' && (
                <div className="space-y-8">
                  {/* Official SAT Score Report Style */}
                  <div className={`bg-white border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg`}>
                    {/* Header - Official SAT Style */}
                    <div className="bg-blue-900 text-white p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h1 className="text-2xl font-bold">SAT® Score Report</h1>
                          <p className="text-blue-200 mt-1">Official Practice Test Results</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">Test Date: March 15, 2024</p>
                          <p className="text-sm">Registration Number: 12345678</p>
                        </div>
                      </div>
                    </div>

                    {/* Student Info */}
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-800 mb-3">Student Information</h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Name</p>
                          <p className="font-medium">{profile?.name || 'John Doe'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Test Center</p>
                          <p className="font-medium">Online Practice Test</p>
                        </div>
                      </div>
                    </div>

                    {/* Total Score */}
                    <div className="p-6 border-b border-gray-200 bg-blue-50">
                      <div className="text-center">
                        <h2 className="text-2xl font-bold text-blue-900 mb-2">Total SAT Score</h2>
                        <div className="text-6xl font-bold text-blue-600 mb-2">1420</div>
                        <p className="text-gray-600">Out of 1600</p>
                        <div className="mt-4 bg-white rounded-lg p-3 inline-block">
                          <div className="flex items-center space-x-8">
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Evidence-Based Reading and Writing</p>
                              <p className="text-2xl font-bold text-blue-600">720</p>
                              <p className="text-xs text-gray-500">200-800</p>
                            </div>
                            <div className="text-4xl text-gray-300">+</div>
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Math</p>
                              <p className="text-2xl font-bold text-blue-600">700</p>
                              <p className="text-xs text-gray-500">200-800</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section Scores */}
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">Section Scores</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Reading and Writing */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-gray-800 mb-3">Evidence-Based Reading and Writing</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span>Reading Test Score</span>
                              <span className="font-medium">36</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Writing and Language Test Score</span>
                              <span className="font-medium">35</span>
                            </div>
                            <div className="border-t pt-2">
                              <div className="flex justify-between font-semibold">
                                <span>Section Score</span>
                                <span>720</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Math */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-gray-800 mb-3">Math</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span>Calculator</span>
                              <span className="font-medium">34</span>
                            </div>
                            <div className="flex justify-between">
                              <span>No Calculator</span>
                              <span className="font-medium">18</span>
                            </div>
                            <div className="border-t pt-2">
                              <div className="flex justify-between font-semibold">
                                <span>Section Score</span>
                                <span>700</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Subscores */}
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">Subscores (1-15)</h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded">
                          <p className="text-sm text-gray-600">Command of Evidence</p>
                          <p className="text-xl font-bold text-blue-600">13</p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded">
                          <p className="text-sm text-gray-600">Words in Context</p>
                          <p className="text-xl font-bold text-blue-600">14</p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded">
                          <p className="text-sm text-gray-600">Expression of Ideas</p>
                          <p className="text-xl font-bold text-blue-600">12</p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded">
                          <p className="text-sm text-gray-600">Standard English</p>
                          <p className="text-xl font-bold text-blue-600">13</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded">
                          <p className="text-sm text-gray-600">Heart of Algebra</p>
                          <p className="text-xl font-bold text-green-600">14</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded">
                          <p className="text-sm text-gray-600">Problem Solving</p>
                          <p className="text-xl font-bold text-green-600">13</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded">
                          <p className="text-sm text-gray-600">Passport to Adv Math</p>
                          <p className="text-xl font-bold text-green-600">12</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded">
                          <p className="text-sm text-gray-600">Additional Topics</p>
                          <p className="text-xl font-bold text-green-600">11</p>
                        </div>
                      </div>
                    </div>

                    {/* Cross-Test Scores */}
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">Cross-Test Scores (10-40)</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-2">Analysis in History/Social Studies</p>
                          <p className="text-3xl font-bold text-purple-600">32</p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-2">Analysis in Science</p>
                          <p className="text-3xl font-bold text-orange-600">30</p>
                        </div>
                      </div>
                    </div>

                    {/* Percentiles */}
                    <div className="p-6">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">Percentiles Compared to SAT Test-Takers</h2>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-sm text-gray-600">Total Score</p>
                            <p className="text-2xl font-bold text-yellow-600">95th</p>
                            <p className="text-xs text-gray-500">percentile</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">EBRW</p>
                            <p className="text-2xl font-bold text-yellow-600">92nd</p>
                            <p className="text-xs text-gray-500">percentile</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Math</p>
                            <p className="text-2xl font-bold text-yellow-600">97th</p>
                            <p className="text-xs text-gray-500">percentile</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-100 p-4 text-center text-sm text-gray-600">
                      <p>This score report shows your performance on this practice test. Scores are valid for practice purposes only.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Leaders Board View */}
              {selectedView === 'leaderboard' && (
                <LeaderboardData userId={userId || 'guest'} />
              )}
            </div>

            {/* AI Assistant for Progress Page */}
            <AIAnalyzer
              context="progress"
              data={{
                userId,
                progressData: progressData || DUMMY_PROGRESS
              }}
            />
          </div>
        </main>
      </div>
    </SecureProgressDataProvider>
  );
};

export default Progress;
