import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LeaderboardData } from "@/components/progress/LeaderboardData";
import { FullPageLoader } from "@/components/progress/FullPageLoader";
import { Navigation, User, Users, BookOpen, BarChart, Target, ChevronDown, LogOut, Menu, Clock, Trophy, TrendingUp, FileText } from "lucide-react";
// import { SecureProgressDataProvider } from "@/components/progress/SecureProgressDataProvider"; // Removed to fix caching
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Footer } from '@/components/Footer';
import { useSimpleProgress } from "@/hooks/useSimpleProgress";

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
  }, (_, i) => {
    const date = new Date(Date.now() - (14 - i) * 24 * 3600 * 1000);
    const userAttempted = Math.floor(Math.random() * 30) + 10;
    const globalAverage = Math.floor(Math.random() * 25) + 8;
    const previousDay = i > 0 ? Math.floor(Math.random() * 30) + 10 : userAttempted;
    
    const skills = [
      { name: 'Linear Equations', percentile: 85, contribution: 35 },
      { name: 'Ratios & Proportions', percentile: 95, contribution: 42 },
      { name: 'Vocabulary in Context', percentile: 87, contribution: 28 },
      { name: 'Punctuation & Grammar', percentile: 91, contribution: 38 },
      { name: 'Quadratic Functions', percentile: 58, contribution: 25 },
      { name: 'Main Ideas & Themes', percentile: 89, contribution: 31 },
      { name: 'Standard Conventions', percentile: 84, contribution: 33 }
    ];
    
    const mostPracticedSkill = skills[i % skills.length];
    
    return {
      date: date.toISOString().slice(0, 10),
      attempted: userAttempted,
      globalAverage: globalAverage,
      momentum: userAttempted - previousDay,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      mostPracticedSkill: mostPracticedSkill
    };
  }),
  skillAnalytics: [
    {
      skillId: 'math_1',
      skillName: 'Linear Equations in One Variable',
      chapter: 'Heart of Algebra',
      section: 'Math',
      correct: 18,
      incorrect: 2,
      accuracy: 90,
      averageTime: 1.8,
      percentile: 85,
      improvement: 12
    },
    {
      skillId: 'reading_1', 
      skillName: 'Vocabulary in Context',
      chapter: 'Reading Comprehension',
      section: 'Reading',
      correct: 22,
      incorrect: 3,
      accuracy: 88,
      averageTime: 1.5,
      percentile: 78,
      improvement: 8
    },
    {
      skillId: 'writing_1',
      skillName: 'Standard English Conventions',
      chapter: 'Expression of Ideas',
      section: 'Writing',
      correct: 15,
      incorrect: 5,
      unattempted: 10,
      accuracy: 75,
      averageTime: 2.1,
      percentile: 82,
      improvement: 15,
      solvedProblems: 20,
      practicePerDay: 2.5,
      globalPercentile: 78,
      percentileGrowth: 8
    },
    {
      skillId: 'math_2',
      skillName: 'Quadratic Functions',
      chapter: 'Passport to Advanced Math',
      section: 'Math',
      correct: 12,
      incorrect: 8,
      unattempted: 15,
      accuracy: 60,
      averageTime: 3.2,
      percentile: 72,
      improvement: 5,
      solvedProblems: 20,
      practicePerDay: 1.8,
      globalPercentile: 65,
      percentileGrowth: 12
    },
    {
      skillId: 'reading_2',
      skillName: 'Command of Evidence',
      chapter: 'Information and Ideas',
      section: 'Reading',
      correct: 16,
      incorrect: 4,
      unattempted: 8,
      accuracy: 80,
      averageTime: 2.0,
      percentile: 88,
      improvement: 10,
      solvedProblems: 20,
      practicePerDay: 3.1,
      globalPercentile: 85,
      percentileGrowth: 15
    }
  ]
};

const Progress = () => {
  const navigate = useNavigate();
  const { session, user, profile, signOut } = useAuth();
  const { progressData } = useProgress();
  const { isDarkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([
    { id: '1', name: 'SAT Math', status: 'active', expiresIn: 30 },
    { id: '2', name: 'SAT Reading', status: 'active', expiresIn: 25 },
    { id: '3', name: 'SAT Writing', status: 'active', expiresIn: 20 }
  ]);
  const [selectedCourse, setSelectedCourse] = useState<string>('1');
  const [selectedView, setSelectedView] = useState<'analytics' | 'exam-results' | 'leaderboard'>('analytics');
  const [timeAnalyticsView, setTimeAnalyticsView] = useState<'daily' | 'skills'>('daily');
  const [selectedSkillForAnalytics, setSelectedSkillForAnalytics] = useState<string>('all');
  const queryClient = useQueryClient();

  const { progressData, isLoading: analyticsLoading, error: progressError } = useSimpleProgress();
  
  const currentProgressData = progressData || DUMMY_PROGRESS;
  
  const pages = [
    { name: "Account", path: "/account" },
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
      case "Account":
        return <User className="h-4 w-4 mr-2 text-gray-500" />;
      case "Practice":
        return <BookOpen className="h-4 w-4 mr-2 text-gray-500" />;
      case "Analytics":
        return <BarChart className="h-4 w-4 mr-2 text-gray-500" />;
      case "About us":
        return <Users className="h-4 w-4 mr-2 text-gray-500" />;
      default:
        return null;
    }
  };

  // Removed SecureProgressDataProvider to fix caching
  return (
    <div className="analytics-page">
      <div className={`flex min-h-screen w-full transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-mono-bg'
      }`}>
        <main className={`flex-1 transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-900' : 'bg-mono-bg'
        }`}>
          {/* Debug info for analytics loading */}
          {analyticsLoading && (
            <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white text-center py-2">
              🔄 Loading analytics... (Using real data from interactions)
            </div>
          )}
          {progressError && (
            <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white text-center py-2">
              ❌ Error: {progressError}
            </div>
          )}
          
          <header className={`fixed top-0 left-0 right-0 w-full z-50 border-b shadow-lg transition-all duration-300 bg-white ${analyticsLoading ? 'mt-10' : ''}`}>
            <div className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 flex items-center justify-between min-h-[40px] relative z-10">
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Mobile Hamburger Menu */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden rounded-lg hover:bg-gray-100"
                >
                  <Menu className="h-5 w-5 text-gray-500" />
                </Button>

                {/* Desktop Navigation Dropdown */}
                <DropdownMenu open={isNavDropdownOpen} onOpenChange={setIsNavDropdownOpen}>
                  <DropdownMenuTrigger className="hidden lg:block rounded-lg p-2 transition-colors hover:bg-gray-100">
                    <Navigation className="h-5 w-5 text-gray-500" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 shadow-lg rounded-lg p-2 z-50 bg-white border-orange-200">
                    <ScrollArea className="h-auto max-h-[300px]">
                      {pages.map((page, index) => (
                        <DropdownMenuItem 
                          key={index}
                          className="cursor-pointer py-2 rounded-sm transition-colors hover:bg-gray-100"
                          onClick={() => handleNavigation(page.path)}
                        >
                          {getPageIcon(page.name)}
                          <span className="font-source-sans text-gray-600">{page.name}</span>
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

              {/* Center Tab Menu - Practice Style Buttons */}
              <div className="flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
                <div className="inline-flex items-center rounded-full px-2 py-1 border-2" style={{
                  borderColor: '#EA580C',
                  background: 'rgba(255, 255, 255, 0.9)'
                }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-3 py-1 rounded-full transition-all duration-200 ease-out hover:scale-105 active:scale-95 h-6 text-xs"
                    style={selectedView === 'analytics' ? {
                      background: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)',
                      color: '#000000'
                    } : {
                      color: '#6B7280'
                    }}
                    onClick={() => setSelectedView('analytics')}
                  >
                    <BarChart className="h-3 w-3 mr-1" style={selectedView !== 'analytics' ? {
                      background: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    } : {}} />
                    Analytics
                    {analyticsLoading && (
                      <span className="ml-1 inline-block w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-3 py-1 rounded-full transition-all duration-200 ease-out hover:scale-105 active:scale-95 h-6 text-xs"
                    style={selectedView === 'exam-results' ? {
                      background: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)',
                      color: '#000000'
                    } : {
                      color: '#6B7280'
                    }}
                    onClick={() => setSelectedView('exam-results')}
                  >
                    <FileText className="h-3 w-3 mr-1" style={selectedView !== 'exam-results' ? {
                      background: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    } : {}} />
                    <span className="hidden sm:inline">Exam Report</span>
                    <span className="sm:hidden">Report</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-3 py-1 rounded-full transition-all duration-200 ease-out hover:scale-105 active:scale-95 h-6 text-xs"
                    style={selectedView === 'leaderboard' ? {
                      background: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)',
                      color: '#000000'
                    } : {
                      color: '#6B7280'
                    }}
                    onClick={() => setSelectedView('leaderboard')}
                  >
                    <Trophy className="h-3 w-3 mr-1" style={selectedView !== 'leaderboard' ? {
                      background: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    } : {}} />
                    <span className="hidden sm:inline">Leaderboard</span>
                    <span className="sm:hidden">Board</span>
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 overflow-hidden">
                {/* Course Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs px-2 py-1 h-7 bg-white border-gray-200 hover:bg-gray-50"
                    >
                      <span className="text-gray-600 truncate max-w-[60px] sm:max-w-[100px]">
                        {courses.find(c => c.id === selectedCourse)?.name}
                      </span>
                      <ChevronDown className="ml-1 h-3 w-3 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 shadow-lg rounded-md p-1 z-50 bg-white border-orange-200">
                    <ScrollArea className="h-[150px]">
                      {courses.map((course) => (
                        <DropdownMenuItem 
                          key={course.id}
                          className="cursor-pointer py-2 px-3 rounded-md transition-colors hover:bg-gray-50"
                          onClick={() => setSelectedCourse(course.id)}
                        >
                          <span className="font-source-sans text-sm text-gray-600">{course.name}</span>
                          {selectedCourse === course.id && <span className="ml-auto text-xs">✓</span>}
                        </DropdownMenuItem>
                      ))}
                    </ScrollArea>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="ml-2 flex items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="h-8 w-8 cursor-pointer transition-all hover:ring-2 hover:ring-blue-200">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback className="text-xs bg-blue-500 text-white">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 shadow-lg rounded-md p-1 z-50 bg-white border-orange-200">
                      <DropdownMenuItem 
                        className="cursor-pointer py-2 rounded-sm transition-colors flex items-center text-blue-500 hover:bg-gray-100"
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

          <div className="pt-20">
            <div className="w-full p-6">
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
                            <span className={`text-3xl font-bold ${isDarkMode ? 'text-green-400' : 'text-blue-600'}`}>{currentProgressData.streak}</span>
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
                              strokeDasharray={`${currentProgressData.totalProgressPercent * 2.83} 283`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-xl font-bold ${isDarkMode ? 'text-green-400' : 'text-blue-600'}`}>
                              {currentProgressData.totalProgressPercent}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Projected Score */}
                    <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-0`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>Projected Score</h3>
                          
                          <div className="mb-2">
                            <div className="flex items-baseline gap-2">
                              <span className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-blue-600'}`}>
                                720
                              </span>
                              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                ±35
                              </span>
                            </div>
                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Math (200–800)
                            </div>
                          </div>
                        </div>
                        <Target className={`h-8 w-8 ${isDarkMode ? 'text-green-400/70' : 'text-blue-500/70'}`} />
                      </div>
                    </div>

                    {/* Questions Attempted Today */}
                    <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-0`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Today's Progress</h3>
                          <div className="mt-2">
                            <span className={`text-3xl font-bold ${isDarkMode ? 'text-green-400' : 'text-blue-600'}`}>{currentProgressData.questionsAnsweredToday}</span>
                            <span className={`text-sm ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>questions</span>
                          </div>
                        </div>
                        <Trophy className={`h-8 w-8 ${isDarkMode ? 'text-green-400/70' : 'text-blue-500/70'}`} />
                      </div>
                    </div>
                  </div>

                  {/* SAT Skill Analytics Table - Full Width */}
                  <div className={`p-8 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-0 mt-8`}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {courses.find(c => c.id === selectedCourse)?.name || 'SAT Math'} - Skill Analytics
                      </h3>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                        {currentProgressData.skillAnalytics.filter((skill) => {
                          const selectedCourseName = courses.find(c => c.id === selectedCourse)?.name || 'SAT Math';
                          if (selectedCourseName.includes('Math')) return skill.section === 'Math';
                          if (selectedCourseName.includes('Reading')) return skill.section === 'Reading';
                          if (selectedCourseName.includes('Writing')) return skill.section === 'Writing';
                          return skill.section === 'Math';
                        }).length} Skills
                      </div>
                    </div>
                      
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className={`border-b-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <th className={`text-left py-4 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Skill</th>
                            <th className={`text-left py-4 px-3 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Chapter</th>
                            <th className={`text-center py-4 px-3 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Accuracy</th>
                            <th className={`text-center py-4 px-3 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Solved</th>
                            <th className={`text-center py-4 px-3 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Daily Practice</th>
                            <th className={`text-center py-4 px-3 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Global Percentile</th>
                            <th className={`text-center py-4 px-3 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Growth</th>
                            <th className={`text-center py-4 px-3 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Progress</th>
                            <th className={`text-center py-4 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentProgressData.skillAnalytics
                            .filter((skill) => {
                              const selectedCourseName = courses.find(c => c.id === selectedCourse)?.name || 'SAT Math';
                              if (selectedCourseName.includes('Math')) return skill.section === 'Math';
                              if (selectedCourseName.includes('Reading')) return skill.section === 'Reading';
                              if (selectedCourseName.includes('Writing')) return skill.section === 'Writing';
                              return skill.section === 'Math';
                            })
                            .map((skill) => {
                              const totalAttempted = skill.correct + skill.incorrect;
                              const accuracy = totalAttempted > 0 ? Math.round((skill.correct / totalAttempted) * 100) : 0;
                              const totalQuestions = skill.correct + skill.incorrect + (skill.unattempted || 0);
                              const progress = totalQuestions > 0 ? Math.round((totalAttempted / totalQuestions) * 100) : 0;
                              
                              const getStatus = (acc: number, growth: number) => {
                                if (acc >= 85 && growth >= 10) return { text: "Mastered", color: "text-green-600", bg: "bg-green-100" };
                                if (acc >= 75 && growth >= 5) return { text: "Strong", color: "text-blue-600", bg: "bg-blue-100" };
                                if (acc >= 65 && growth >= 0) return { text: "Learning", color: "text-yellow-600", bg: "bg-yellow-100" };
                                if (acc >= 50) return { text: "Developing", color: "text-orange-600", bg: "bg-orange-100" };
                                return { text: "Needs Focus", color: "text-red-600", bg: "bg-red-100" };
                              };
                              
                              const status = getStatus(accuracy, skill.percentileGrowth || 0);
                              
                              return (
                                <tr key={skill.skillId} className={`border-b ${isDarkMode ? 'border-gray-700/50' : 'border-gray-100'} hover:${isDarkMode ? 'bg-gray-700/30' : 'bg-blue-50/30'} transition-colors`}>
                                  <td className={`py-4 px-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                    <div className="font-medium text-sm">{skill.skillName}</div>
                                  </td>
                                  <td className={`py-4 px-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {skill.chapter}
                                  </td>
                                  <td className="py-4 px-3 text-center">
                                    <span className={`font-bold ${accuracy >= 80 ? 'text-green-600' : accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                      {accuracy}%
                                    </span>
                                  </td>
                                  <td className={`py-4 px-3 text-center font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {skill.solvedProblems || skill.correct + skill.incorrect}
                                  </td>
                                  <td className={`py-4 px-3 text-center font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {(skill.practicePerDay || 2.0).toFixed(1)}
                                  </td>
                                  <td className="py-4 px-3 text-center">
                                    <div className="flex flex-col items-center">
                                      <span className={`font-bold text-lg ${
                                        (skill.globalPercentile || skill.percentile) >= 90 ? 'text-green-600' : 
                                        (skill.globalPercentile || skill.percentile) >= 75 ? 'text-blue-600' : 
                                        (skill.globalPercentile || skill.percentile) >= 50 ? 'text-yellow-600' : 
                                        'text-red-600'
                                      }`}>
                                        {skill.globalPercentile || skill.percentile}th
                                      </span>
                                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {(skill.globalPercentile || skill.percentile) >= 90 ? 'Elite' : 
                                         (skill.globalPercentile || skill.percentile) >= 75 ? 'Strong' : 
                                         (skill.globalPercentile || skill.percentile) >= 50 ? 'Average' : 
                                         'Below Avg'}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-4 px-3 text-center">
                                    <span className={`font-bold ${
                                      (skill.percentileGrowth || skill.improvement) >= 10 ? 'text-green-600' : 
                                      (skill.percentileGrowth || skill.improvement) >= 5 ? 'text-blue-600' : 
                                      (skill.percentileGrowth || skill.improvement) >= 0 ? 'text-yellow-600' : 
                                      'text-red-600'
                                    }`}>
                                      +{skill.percentileGrowth || skill.improvement}%
                                    </span>
                                  </td>
                                  <td className="py-4 px-3 text-center">
                                    <div className="flex flex-col items-center">
                                      <div className={`w-16 h-2 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} overflow-hidden`}>
                                        <div 
                                          className={`h-full rounded-full transition-all duration-300 ${
                                            progress >= 80 ? 'bg-green-500' : progress >= 60 ? 'bg-blue-500' : progress >= 40 ? 'bg-yellow-500' : 'bg-orange-500'
                                          }`}
                                          style={{ width: `${progress}%` }}
                                        ></div>
                                      </div>
                                      <span className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {progress}%
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-4 px-4 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                                      {status.text}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Time Analytics Section */}
                  <div className={`p-8 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-0 mt-8`}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Time Analytics</h3>
                      <div className="flex items-center space-x-4">
                        <div className="flex rounded-lg bg-gray-100 p-1">
                          <button 
                            onClick={() => setTimeAnalyticsView('skills')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                              timeAnalyticsView === 'skills' 
                                ? 'bg-orange-500 text-white shadow-sm' 
                                : 'text-gray-600 hover:text-orange-500'
                            }`}
                          >
                            Skill Practice
                          </button>
                          <button 
                            onClick={() => setTimeAnalyticsView('daily')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                              timeAnalyticsView === 'daily' 
                                ? 'bg-orange-500 text-white shadow-sm' 
                                : 'text-gray-600 hover:text-orange-500'
                            }`}
                          >
                            Daily Performance Trend
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Skill Practice View */}
                    {timeAnalyticsView === 'skills' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Questions practiced per skill over the last 15 days
                          </p>
                          <select 
                            value={selectedSkillForAnalytics}
                            onChange={(e) => setSelectedSkillForAnalytics(e.target.value)}
                            className={`px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-700'}`}
                          >
                            <option value="all">All Skills</option>
                            {currentProgressData.skillAnalytics.slice(0, 10).map((skill) => (
                              <option key={skill.skillId} value={skill.skillId}>
                                {skill.skillName}
                              </option>
                            ))}
                          </select>
                        </div>
                        {currentProgressData.performanceGraph.slice(-15).map((day, index) => {
                          const questionsForSkill = selectedSkillForAnalytics === 'all' 
                            ? day.attempted 
                            : Math.floor(day.attempted * (Math.random() * 0.3 + 0.1));
                          return (
                            <div key={day.date} className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                              <div className="flex items-center space-x-4 min-w-[120px]">
                                <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </div>
                                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {day.dayName}
                                </div>
                              </div>
                              <div className="flex items-center space-x-4 flex-1">
                                <div className="flex items-center space-x-2 flex-1">
                                  <div className="w-full max-w-[300px] bg-gray-200 rounded-full h-4 overflow-hidden">
                                    <div 
                                      className="bg-orange-500 h-4 rounded-full transition-all duration-700 ease-out"
                                      style={{ width: `${Math.min(100, (questionsForSkill / 30) * 100)}%` }}
                                    ></div>
                                  </div>
                                  <span className={`text-sm font-semibold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'} min-w-[35px]`}>
                                    {questionsForSkill}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Daily Performance Trend View */}
                    {timeAnalyticsView === 'daily' && (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={currentProgressData.performanceGraph}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                            <XAxis 
                              dataKey="date" 
                              stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                              fontSize={12}
                              tickFormatter={(value) => {
                                const date = new Date(value);
                                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                              }}
                            />
                            <YAxis 
                              stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                              fontSize={12}
                              label={{ value: 'Questions Attempted', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                            />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                                border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                              }}
                              labelFormatter={(label) => {
                                const date = new Date(label);
                                return date.toLocaleDateString('en-US', { 
                                  weekday: 'long', 
                                  month: 'long', 
                                  day: 'numeric' 
                                });
                              }}
                              formatter={(value, name, props) => {
                                if (name === 'attempted') {
                                  const momentum = props.payload.momentum;
                                  const skill = props.payload.mostPracticedSkill;
                                  const momentumText = momentum > 0 ? `+${momentum}` : momentum.toString();
                                  const momentumColor = momentum > 0 ? '#10b981' : momentum < 0 ? '#ef4444' : '#6b7280';
                                  const percentileColor = skill.percentile >= 90 ? '#10b981' : skill.percentile >= 75 ? '#3b82f6' : skill.percentile >= 50 ? '#eab308' : '#ef4444';
                                  
                                  return [
                                    <div style={{ color: isDarkMode ? '#e5e7eb' : '#374151' }}>
                                      <div className="mb-2">
                                        <strong>Your Performance: {value} questions</strong>
                                      </div>
                                      <div style={{ color: momentumColor, fontSize: '12px', marginBottom: '8px' }}>
                                        Momentum: {momentumText} vs. previous day
                                      </div>
                                      <div className="border-t pt-2" style={{ borderColor: isDarkMode ? '#374151' : '#e5e7eb' }}>
                                        <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                                          Most Practiced Skill:
                                        </div>
                                        <div style={{ fontSize: '11px' }}>
                                          <div>{skill.name}</div>
                                          <div style={{ color: percentileColor, fontWeight: 'bold' }}>
                                            {skill.percentile}th percentile • {skill.contribution}% of today's practice
                                          </div>
                                        </div>
                                      </div>
                                    </div>,
                                    ''
                                  ];
                                }
                                if (name === 'globalAverage') {
                                  return [
                                    <div style={{ color: isDarkMode ? '#fb923c' : '#ea580c' }}>
                                      Global Average: <strong>{value}</strong>
                                    </div>,
                                    ''
                                  ];
                                }
                                return [value, name];
                              }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="attempted" 
                              stroke={isDarkMode ? '#10b981' : '#3b82f6'}
                              strokeWidth={3}
                              dot={{ fill: isDarkMode ? '#10b981' : '#3b82f6', r: 4 }}
                              activeDot={{ r: 6, fill: isDarkMode ? '#10b981' : '#3b82f6' }}
                              name="attempted"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="globalAverage" 
                              stroke={isDarkMode ? '#fb923c' : '#ea580c'}
                              strokeWidth={2}
                              strokeDasharray="5 5"
                              dot={{ fill: isDarkMode ? '#fb923c' : '#ea580c', r: 3 }}
                              activeDot={{ r: 5, fill: isDarkMode ? '#fb923c' : '#ea580c' }}
                              name="globalAverage"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Chart Legend */}
                    {timeAnalyticsView === 'daily' && (
                      <div className="flex items-center justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-0.5 ${isDarkMode ? 'bg-green-400' : 'bg-blue-600'} rounded`}></div>
                          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Your Performance</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-0.5 ${isDarkMode ? 'bg-orange-400' : 'bg-orange-600'} rounded`} style={{ borderStyle: 'dashed' }}></div>
                          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Global Average</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Exam Tests Summary & Key Insights */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 items-start">
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

                        {/* Separator */}
                        <div className={`border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} my-6`}></div>

                        {/* Calibration Analysis */}
                        <div>
                          <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            Calibration (Metacognition)
                          </h4>
                          
                          <div className="space-y-4">
                            {/* Brier Score */}
                            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-indigo-50'}`}>
                              <div className="flex justify-between items-center mb-2">
                                <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Brier Score</span>
                                <span className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>0.15</span>
                              </div>
                              <div className={`w-full bg-gray-200 rounded-full h-2 ${isDarkMode ? 'bg-gray-600' : ''}`}>
                                <div className="h-2 rounded-full transition-all duration-300 bg-green-500" style={{ width: '85%' }}></div>
                              </div>
                              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Target: ≤ 0.20 (Lower is better)</p>
                            </div>

                            {/* Confidence Calibration */}
                            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-purple-50'}`}>
                              <div className="flex justify-between items-center mb-2">
                                <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Confidence Gap</span>
                                <div className="text-center">
                                  <span className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>+3</span>
                                  <span className={`text-sm ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>pp</span>
                                </div>
                              </div>
                              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Slightly overconfident</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Key Insights Radar Chart */}
                    <div className={`p-8 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-0 h-fit`}>
                      <h3 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Key Performance Insights</h3>
                      
                      <div className="space-y-6">
                        {/* Radar Chart */}
                        <div className="h-96">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart 
                              data={[
                                { metric: 'Peak Hours', value: 85, fullMark: 100 },
                                { metric: 'Easy Questions', value: 90, fullMark: 100 },
                                { metric: 'Medium Questions', value: 70, fullMark: 100 },
                                { metric: 'Hard Questions', value: 55, fullMark: 100 },
                                { metric: 'Time Management', value: 78, fullMark: 100 },
                                { metric: 'Consistency', value: 82, fullMark: 100 },
                                { metric: 'Focus Duration', value: 75, fullMark: 100 },
                                { metric: 'Retention Rate', value: 68, fullMark: 100 }
                              ]}
                              margin={{ top: 30, right: 30, bottom: 30, left: 30 }}
                            >
                              <PolarGrid 
                                stroke={isDarkMode ? '#374151' : '#e5e7eb'} 
                                strokeWidth={1.2}
                                gridType="polygon"
                              />
                              <PolarAngleAxis 
                                dataKey="metric" 
                                tick={{ 
                                  fontSize: 13, 
                                  fill: isDarkMode ? '#d1d5db' : '#4b5563',
                                  fontWeight: 600
                                }}
                                tickFormatter={(value) => {
                                  const abbreviations = {
                                    'Peak Hours': 'Peak Hours',
                                    'Easy Questions': 'Easy',
                                    'Medium Questions': 'Medium', 
                                    'Hard Questions': 'Hard',
                                    'Time Management': 'Time Mgmt',
                                    'Consistency': 'Consistency',
                                    'Focus Duration': 'Focus',
                                    'Retention Rate': 'Retention'
                                  };
                                  return abbreviations[value] || value;
                                }}
                              />
                              <PolarRadiusAxis 
                                angle={90} 
                                domain={[0, 100]}
                                tick={false}
                                tickCount={5}
                              />
                              <Radar 
                                name="Performance" 
                                dataKey="value" 
                                stroke={isDarkMode ? '#fb923c' : '#ea580c'}
                                fill={isDarkMode ? '#fb923c' : '#ea580c'}
                                fillOpacity={0.3}
                                strokeWidth={2}
                                dot={{ r: 4, fill: isDarkMode ? '#fb923c' : '#ea580c' }}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Key Insights Text */}
                        <div className="space-y-3">
                          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-orange-500/10 border border-orange-500/20' : 'bg-orange-50 border border-orange-200'}`}>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-orange-400' : 'text-orange-700'}`}>
                              💡 <strong>Focus Area:</strong> Hard questions need more practice (55% accuracy)
                            </p>
                          </div>
                          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'}`}>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                              ✅ <strong>Strength:</strong> Excellent performance on easy questions (90%)
                            </p>
                          </div>
                          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                              📈 <strong>Improvement:</strong> Time management has improved 12% this month
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* Exam Results View */}
              {selectedView === 'exam-results' && (
                <div className="space-y-8">
                  {/* Official SAT Score Report Style */}
                  <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg">
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
                    <div className="p-6">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">Section Scores</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border rounded-lg p-4">
                          <h3 className="font-semibold text-blue-600 mb-3">Reading and Writing</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Reading</span>
                              <span className="font-medium">36/40</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Writing and Language</span>
                              <span className="font-medium">38/44</span>
                            </div>
                            <div className="flex justify-between font-semibold pt-2 border-t">
                              <span>Total</span>
                              <span>720</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <h3 className="font-semibold text-blue-600 mb-3">Math</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Calculator</span>
                              <span className="font-medium">32/38</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">No Calculator</span>
                              <span className="font-medium">18/20</span>
                            </div>
                            <div className="flex justify-between font-semibold pt-2 border-t">
                              <span>Total</span>
                              <span>700</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Detailed Score Analysis */}
                    <div className="p-6 border-t border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">Score Analysis & Recommendations</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Strengths */}
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-green-800 mb-2">Strengths</h3>
                          <ul className="space-y-1 text-sm text-green-700">
                            <li>• Excellent performance in Algebra (95% accuracy)</li>
                            <li>• Strong reading comprehension skills</li>
                            <li>• Consistent time management</li>
                            <li>• High accuracy in grammar questions</li>
                          </ul>
                        </div>
                        
                        {/* Areas for Improvement */}
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-orange-800 mb-2">Focus Areas</h3>
                          <ul className="space-y-1 text-sm text-orange-700">
                            <li>• Geometry word problems (68% accuracy)</li>
                            <li>• Advanced data analysis concepts</li>
                            <li>• Complex reading passages</li>
                            <li>• Time allocation on difficult questions</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    {/* Score Progression */}
                    <div className="p-6 border-t border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">Score Progression</h2>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="font-medium">Practice Test 1</span>
                          <span className="text-lg font-bold text-blue-600">1320</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="font-medium">Practice Test 2</span>
                          <span className="text-lg font-bold text-blue-600">1350</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-blue-100 rounded border-2 border-blue-300">
                          <span className="font-medium">Current Test</span>
                          <span className="text-lg font-bold text-blue-600">1420</span>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-700 font-medium">
                            🎉 Improvement: +100 points from first practice test!
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Next Steps */}
                    <div className="p-6 border-t border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">Recommended Next Steps</h2>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                          <div>
                            <h4 className="font-medium text-gray-800">Focus on Geometry</h4>
                            <p className="text-sm text-gray-600">Complete 20 geometry practice problems daily</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                          <div>
                            <h4 className="font-medium text-gray-800">Improve Reading Speed</h4>
                            <p className="text-sm text-gray-600">Practice timed reading passages (45 seconds per question)</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                          <div>
                            <h4 className="font-medium text-gray-800">Take Weekly Practice Tests</h4>
                            <p className="text-sm text-gray-600">Maintain momentum with full-length practice tests</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Leaderboard View */}
              {selectedView === 'leaderboard' && (
                <LeaderboardData userId={userId || 'guest'} />
              )}
            </div>

            {/* AI Assistant for Progress Page */}
            <AIAnalyzer
              context="progress"
              data={{
                userId,
                progressData: progressData || currentProgressData
              }}
            />
            
            {/* Custom Footer for Analytics Section */}
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Progress;