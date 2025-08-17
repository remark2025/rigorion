import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LeaderboardData } from "@/components/progress/LeaderboardData";
import { FullPageLoader } from "@/components/progress/FullPageLoader";
import { Navigation, User, Users, BookOpen, BarChart, Target, ChevronDown, LogOut, Menu, Clock, Trophy, TrendingUp } from "lucide-react";
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

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
    
    // Most practiced skills rotation
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
    // SAT Math Skills
    {
      skillId: 'math_1',
      skillName: 'Linear Equations in One Variable',
      chapter: 'Heart of Algebra',
      section: 'Math',
      correct: 18,
      incorrect: 2,
      unattempted: 5,
      solvedProblems: 20,
      practicePerDay: 3.2,
      percentileGrowth: +12,
      globalPercentile: 85,
    },
    {
      skillId: 'math_2',
      skillName: 'Systems of Linear Equations',
      chapter: 'Heart of Algebra',
      section: 'Math',
      correct: 12,
      incorrect: 4,
      unattempted: 8,
      solvedProblems: 16,
      practicePerDay: 2.1,
      percentileGrowth: +8,
      globalPercentile: 72,
    },
    {
      skillId: 'math_3',
      skillName: 'Quadratic Functions',
      chapter: 'Passport to Advanced Math',
      section: 'Math',
      correct: 8,
      incorrect: 6,
      unattempted: 12,
      solvedProblems: 14,
      practicePerDay: 1.8,
      percentileGrowth: -3,
      globalPercentile: 58,
    },
    {
      skillId: 'math_4',
      skillName: 'Polynomial Expressions',
      chapter: 'Passport to Advanced Math',
      section: 'Math',
      correct: 15,
      incorrect: 3,
      unattempted: 7,
      solvedProblems: 18,
      practicePerDay: 2.7,
      percentileGrowth: +15,
      globalPercentile: 88,
    },
    {
      skillId: 'math_5',
      skillName: 'Ratios and Proportions',
      chapter: 'Problem Solving & Data Analysis',
      section: 'Math',
      correct: 22,
      incorrect: 1,
      unattempted: 2,
      solvedProblems: 23,
      practicePerDay: 4.1,
      percentileGrowth: +20,
      globalPercentile: 95,
    },
    {
      skillId: 'math_6',
      skillName: 'Statistics and Probability',
      chapter: 'Problem Solving & Data Analysis',
      section: 'Math',
      correct: 14,
      incorrect: 5,
      unattempted: 6,
      solvedProblems: 19,
      practicePerDay: 2.9,
      percentileGrowth: +5,
      globalPercentile: 79,
    },
    {
      skillId: 'math_7',
      skillName: 'Geometry and Trigonometry',
      chapter: 'Additional Topics in Math',
      section: 'Math',
      correct: 9,
      incorrect: 7,
      unattempted: 9,
      solvedProblems: 16,
      practicePerDay: 1.6,
      percentileGrowth: -8,
      globalPercentile: 45,
    },
    {
      skillId: 'math_8',
      skillName: 'Complex Numbers',
      chapter: 'Additional Topics in Math',
      section: 'Math',
      correct: 6,
      incorrect: 4,
      unattempted: 15,
      solvedProblems: 10,
      practicePerDay: 1.2,
      percentileGrowth: -5,
      globalPercentile: 32,
    },
    // SAT Reading Skills
    {
      skillId: 'read_1',
      skillName: 'Main Ideas and Central Themes',
      chapter: 'Information and Ideas',
      section: 'Reading',
      correct: 16,
      incorrect: 3,
      unattempted: 6,
      solvedProblems: 19,
      practicePerDay: 2.8,
      percentileGrowth: +18,
      globalPercentile: 89,
    },
    {
      skillId: 'read_2',
      skillName: 'Supporting Details and Evidence',
      chapter: 'Information and Ideas',
      section: 'Reading',
      correct: 20,
      incorrect: 2,
      unattempted: 3,
      solvedProblems: 22,
      practicePerDay: 3.5,
      percentileGrowth: +22,
      globalPercentile: 93,
    },
    {
      skillId: 'read_3',
      skillName: 'Inferences and Implications',
      chapter: 'Information and Ideas',
      section: 'Reading',
      correct: 11,
      incorrect: 6,
      unattempted: 8,
      solvedProblems: 17,
      practicePerDay: 2.3,
      percentileGrowth: +2,
      globalPercentile: 64,
    },
    {
      skillId: 'read_4',
      skillName: 'Vocabulary in Context',
      chapter: 'Craft and Structure',
      section: 'Reading',
      correct: 18,
      incorrect: 4,
      unattempted: 3,
      solvedProblems: 22,
      practicePerDay: 3.7,
      percentileGrowth: +16,
      globalPercentile: 87,
    },
    {
      skillId: 'read_5',
      skillName: 'Text Structure and Purpose',
      chapter: 'Craft and Structure',
      section: 'Reading',
      correct: 13,
      incorrect: 5,
      unattempted: 7,
      solvedProblems: 18,
      practicePerDay: 2.4,
      percentileGrowth: +7,
      globalPercentile: 76,
    },
    {
      skillId: 'read_6',
      skillName: 'Point of View and Perspective',
      chapter: 'Craft and Structure',
      section: 'Reading',
      correct: 9,
      incorrect: 8,
      unattempted: 8,
      solvedProblems: 17,
      practicePerDay: 2.1,
      percentileGrowth: -4,
      globalPercentile: 52,
    },
    {
      skillId: 'read_7',
      skillName: 'Quantitative Information',
      chapter: 'Integration of Knowledge',
      section: 'Reading',
      correct: 7,
      incorrect: 6,
      unattempted: 12,
      solvedProblems: 13,
      practicePerDay: 1.5,
      percentileGrowth: -7,
      globalPercentile: 38,
    },
    {
      skillId: 'read_8',
      skillName: 'Comparing Dual Passages',
      chapter: 'Integration of Knowledge',
      section: 'Reading',
      correct: 10,
      incorrect: 7,
      unattempted: 8,
      solvedProblems: 17,
      practicePerDay: 2.0,
      percentileGrowth: +1,
      globalPercentile: 68,
    },
    // SAT Writing Skills
    {
      skillId: 'write_1',
      skillName: 'Standard English Conventions',
      chapter: 'Language & Usage',
      section: 'Writing',
      correct: 17,
      incorrect: 3,
      unattempted: 5,
      solvedProblems: 20,
      practicePerDay: 3.1,
      percentileGrowth: +14,
      globalPercentile: 84,
    },
    {
      skillId: 'write_2',
      skillName: 'Sentence Structure',
      chapter: 'Language & Usage',
      section: 'Writing',
      correct: 14,
      incorrect: 4,
      unattempted: 7,
      solvedProblems: 18,
      practicePerDay: 2.6,
      percentileGrowth: +9,
      globalPercentile: 78,
    },
    {
      skillId: 'write_3',
      skillName: 'Punctuation and Grammar',
      chapter: 'Language & Usage',
      section: 'Writing',
      correct: 19,
      incorrect: 2,
      unattempted: 4,
      solvedProblems: 21,
      practicePerDay: 3.4,
      percentileGrowth: +19,
      globalPercentile: 91,
    },
    {
      skillId: 'write_4',
      skillName: 'Rhetorical Strategy',
      chapter: 'Expression of Ideas',
      section: 'Writing',
      correct: 12,
      incorrect: 5,
      unattempted: 8,
      solvedProblems: 17,
      practicePerDay: 2.2,
      percentileGrowth: +4,
      globalPercentile: 71,
    },
    {
      skillId: 'write_5',
      skillName: 'Organization and Transitions',
      chapter: 'Expression of Ideas',
      section: 'Writing',
      correct: 15,
      incorrect: 3,
      unattempted: 7,
      solvedProblems: 18,
      practicePerDay: 2.8,
      percentileGrowth: +11,
      globalPercentile: 82,
    },
    {
      skillId: 'write_6',
      skillName: 'Effective Language Use',
      chapter: 'Expression of Ideas',
      section: 'Writing',
      correct: 11,
      incorrect: 6,
      unattempted: 8,
      solvedProblems: 17,
      practicePerDay: 2.1,
      percentileGrowth: +3,
      globalPercentile: 67,
    },
    {
      skillId: 'write_7',
      skillName: 'Style and Tone',
      chapter: 'Expression of Ideas',
      section: 'Writing',
      correct: 8,
      incorrect: 7,
      unattempted: 10,
      solvedProblems: 15,
      practicePerDay: 1.7,
      percentileGrowth: -6,
      globalPercentile: 43,
    },
    {
      skillId: 'write_8',
      skillName: 'Quantitative Information',
      chapter: 'Expression of Ideas',
      section: 'Writing',
      correct: 13,
      incorrect: 4,
      unattempted: 8,
      solvedProblems: 17,
      practicePerDay: 2.5,
      percentileGrowth: +8,
      globalPercentile: 75,
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
  const queryClient = useQueryClient();
  
  // Add refreshProgressData function to invalidate progress data cache
  const refreshProgressData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['userProgress'] });
  }, [queryClient]);
  
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
                        <div className="flex-1">
                          <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>Projected Score</h3>
                          
                          {/* Current Subject Score */}
                          <div className="mb-2">
                            <div className="flex items-baseline gap-2">
                              <span className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-blue-600'}`}>
                                {(() => {
                                  const selectedCourseName = courses.find(c => c.id === selectedCourse)?.name || 'SAT Math';
                                  if (selectedCourseName.includes('Math')) return '720';
                                  if (selectedCourseName.includes('Reading')) return '680';
                                  if (selectedCourseName.includes('Writing')) return '700';
                                  return '720';
                                })()}
                              </span>
                              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                ±{(() => {
                                  const selectedCourseName = courses.find(c => c.id === selectedCourse)?.name || 'SAT Math';
                                  if (selectedCourseName.includes('Math')) return '35';
                                  if (selectedCourseName.includes('Reading')) return '40';
                                  if (selectedCourseName.includes('Writing')) return '30';
                                  return '35';
                                })()}
                              </span>
                            </div>
                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {courses.find(c => c.id === selectedCourse)?.name.split(' ')[1] || 'Math'} (200–800)
                            </div>
                          </div>

                          {/* Total Score */}
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex items-baseline gap-2">
                              <span className={`text-lg font-semibold ${isDarkMode ? 'text-green-300' : 'text-blue-500'}`}>1420</span>
                              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>±50</span>
                            </div>
                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total (400–1600)</div>
                          </div>
                        </div>
                        <Target className={`h-8 w-8 ${isDarkMode ? 'text-green-400/70' : 'text-blue-500/70'} ml-2`} />
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

                  {/* SAT Skill Analytics Table - Full Width */}
                  <div className={`p-8 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-0`}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {courses.find(c => c.id === selectedCourse)?.name || 'SAT Math'} - Skill Analytics
                      </h3>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                        {DUMMY_PROGRESS.skillAnalytics.filter((skill) => {
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
                          {DUMMY_PROGRESS.skillAnalytics
                            .filter((skill) => {
                              const selectedCourseName = courses.find(c => c.id === selectedCourse)?.name || 'SAT Math';
                              if (selectedCourseName.includes('Math')) return skill.section === 'Math';
                              if (selectedCourseName.includes('Reading')) return skill.section === 'Reading';
                              if (selectedCourseName.includes('Writing')) return skill.section === 'Writing';
                              return skill.section === 'Math'; // Default to Math if no match
                            })
                            .map((skill) => {
                            const accuracy = Math.round((skill.correct / (skill.correct + skill.incorrect)) * 100);
                            const progress = Math.round(((skill.correct + skill.incorrect) / (skill.correct + skill.incorrect + skill.unattempted)) * 100);
                            
                            // Generate status based on performance
                            const getStatus = (acc: number, growth: number) => {
                              if (acc >= 85 && growth >= 10) return { text: "Mastered", color: "text-green-600", bg: "bg-green-100" };
                              if (acc >= 75 && growth >= 5) return { text: "Strong", color: "text-blue-600", bg: "bg-blue-100" };
                              if (acc >= 65 && growth >= 0) return { text: "Learning", color: "text-yellow-600", bg: "bg-yellow-100" };
                              if (acc >= 50) return { text: "Developing", color: "text-orange-600", bg: "bg-orange-100" };
                              return { text: "Needs Focus", color: "text-red-600", bg: "bg-red-100" };
                            };
                            
                            const status = getStatus(accuracy, skill.percentileGrowth);
                            
                            // Section color coding
                            const getSectionColor = (section: string) => {
                              switch(section) {
                                case 'Math': return isDarkMode ? 'text-blue-400' : 'text-blue-600';
                                case 'Reading': return isDarkMode ? 'text-green-400' : 'text-green-600';
                                case 'Writing': return isDarkMode ? 'text-purple-400' : 'text-purple-600';
                                default: return isDarkMode ? 'text-gray-400' : 'text-gray-600';
                              }
                            };
                            
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
                                  {skill.solvedProblems}
                                </td>
                                <td className={`py-4 px-3 text-center font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {skill.practicePerDay.toFixed(1)}
                                </td>
                                <td className="py-4 px-3 text-center">
                                  <div className="flex flex-col items-center">
                                    <span className={`font-bold text-lg ${
                                      skill.globalPercentile >= 90 ? 'text-green-600' : 
                                      skill.globalPercentile >= 75 ? 'text-blue-600' : 
                                      skill.globalPercentile >= 50 ? 'text-yellow-600' : 
                                      'text-red-600'
                                    }`}>
                                      {skill.globalPercentile}th
                                    </span>
                                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                      {skill.globalPercentile >= 90 ? 'Elite' : 
                                       skill.globalPercentile >= 75 ? 'Strong' : 
                                       skill.globalPercentile >= 50 ? 'Average' : 
                                       'Below Avg'}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-4 px-3 text-center">
                                  <span className={`font-bold ${skill.percentileGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {skill.percentileGrowth > 0 ? '+' : ''}{skill.percentileGrowth}
                                  </span>
                                </td>
                                <td className="py-4 px-3">
                                  <div className="flex items-center gap-2">
                                    <div className={`flex-1 bg-gray-200 rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : ''}`}>
                                      <div 
                                        className={`h-2 rounded-full transition-all duration-500 ${
                                          progress >= 80 ? 'bg-green-500' : progress >= 60 ? 'bg-blue-500' : 'bg-yellow-500'
                                        }`}
                                        style={{ width: `${progress}%` }}
                                      ></div>
                                    </div>
                                    <span className={`text-xs font-medium min-w-[35px] ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {progress}%
                                    </span>
                                  </div>
                                </td>
                                <td className="py-4 px-4 text-center">
                                  <span className={`font-semibold px-2 py-1 rounded-full text-xs ${status.color} ${
                                    isDarkMode ? 'bg-gray-700' : status.bg
                                  }`}>
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
                          {/* User Performance Line */}
                          <Line 
                            type="monotone" 
                            dataKey="attempted" 
                            stroke={isDarkMode ? '#10b981' : '#3b82f6'}
                            strokeWidth={3}
                            dot={{ fill: isDarkMode ? '#10b981' : '#3b82f6', r: 4 }}
                            activeDot={{ r: 6, fill: isDarkMode ? '#10b981' : '#3b82f6' }}
                            name="attempted"
                          />
                          {/* Global Average Line */}
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

                    {/* Chart Legend */}
                    <div className="flex items-center justify-center gap-6 mt-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-0.5 ${isDarkMode ? 'bg-green-400' : 'bg-blue-600'} rounded`}></div>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Your Performance</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-0.5 ${isDarkMode ? 'bg-orange-400' : 'bg-orange-600'} rounded border-dashed border-t-2`} style={{ borderStyle: 'dashed' }}></div>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Global Average</span>
                      </div>
                    </div>
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
                          <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Calibration (Metacognition)
                          </h4>
                          
                          <div className="space-y-4">
                            {/* Brier Score */}
                            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-indigo-50'}`}>
                              <div className="flex justify-between items-center mb-2">
                                <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Brier Score</span>
                                <span className={`text-2xl font-bold ${
                                  0.15 <= 0.20 ? (isDarkMode ? 'text-green-400' : 'text-green-600') :
                                  0.15 <= 0.30 ? (isDarkMode ? 'text-yellow-400' : 'text-yellow-600') :
                                  (isDarkMode ? 'text-red-400' : 'text-red-600')
                                }`}>0.15</span>
                              </div>
                              <div className={`w-full bg-gray-200 rounded-full h-2 ${isDarkMode ? 'bg-gray-600' : ''}`}>
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    0.15 <= 0.20 ? 'bg-green-500' : 
                                    0.15 <= 0.30 ? 'bg-yellow-500' : 
                                    'bg-red-500'
                                  }`} 
                                  style={{ width: `${Math.max(5, (1 - 0.15) * 100)}%` }}
                                ></div>
                              </div>
                              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Target: ≤ 0.20 (Lower is better)
                              </p>
                            </div>

                            {/* Confidence Calibration */}
                            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-purple-50'}`}>
                              <div className="flex justify-between items-center mb-2">
                                <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Confidence Gap</span>
                                <div className="text-center">
                                  <span className={`text-2xl font-bold ${
                                    Math.abs(3) < 5 ? (isDarkMode ? 'text-green-400' : 'text-green-600') :
                                    Math.abs(3) < 10 ? (isDarkMode ? 'text-yellow-400' : 'text-yellow-600') :
                                    (isDarkMode ? 'text-red-400' : 'text-red-600')
                                  }`}>+3</span>
                                  <span className={`text-sm ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>pp</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Under</span>
                                <div className={`flex-1 h-2 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} relative`}>
                                  {/* Zero line */}
                                  <div className="absolute left-1/2 top-0 w-0.5 h-2 bg-gray-400 transform -translate-x-0.5"></div>
                                  {/* Confidence gap indicator */}
                                  <div 
                                    className={`absolute top-0 h-2 w-1 rounded ${
                                      3 > 0 ? 'bg-orange-500' : 'bg-blue-500'
                                    }`}
                                    style={{ 
                                      left: `${50 + (3 / 20) * 50}%`,
                                      transform: 'translateX(-50%)'
                                    }}
                                  ></div>
                                </div>
                                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Over</span>
                              </div>
                              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Target: |gap| &lt; 5pp • {3 > 0 ? 'Slightly overconfident' : 'Slightly underconfident'}
                              </p>
                            </div>

                            {/* Confidence Distribution */}
                            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-cyan-50'}`}>
                              <div className="flex justify-between items-center mb-3">
                                <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Confidence Pattern</span>
                                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Last 50 questions</span>
                              </div>
                              
                              {/* Confidence level breakdown */}
                              <div className="space-y-2">
                                {[
                                  { level: 5, label: 'Very Sure', count: 18, accuracy: 89 },
                                  { level: 4, label: 'Sure', count: 15, accuracy: 80 },
                                  { level: 3, label: 'Neutral', count: 12, accuracy: 67 },
                                  { level: 2, label: 'Unsure', count: 3, accuracy: 33 },
                                  { level: 1, label: 'Guessing', count: 2, accuracy: 50 }
                                ].map((conf) => {
                                  const calibrationGap = conf.accuracy - (conf.level * 20);
                                  return (
                                    <div key={conf.level} className="flex items-center gap-3">
                                      <span className={`text-xs w-16 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {conf.label}
                                      </span>
                                      <div className="flex-1 flex items-center gap-2">
                                        <div className={`w-full bg-gray-200 rounded-full h-1.5 ${isDarkMode ? 'bg-gray-600' : ''}`}>
                                          <div 
                                            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
                                            style={{ width: `${(conf.count / 50) * 100}%` }}
                                          ></div>
                                        </div>
                                        <span className={`text-xs min-w-[30px] ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                          {conf.count}
                                        </span>
                                        <span className={`text-xs min-w-[35px] font-medium ${
                                          Math.abs(calibrationGap) < 10 ? 'text-green-600' : 
                                          Math.abs(calibrationGap) < 20 ? 'text-yellow-600' : 
                                          'text-red-600'
                                        }`}>
                                          {conf.accuracy}%
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              
                              <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Good calibration: confidence matches actual accuracy
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Key Insights Radar Chart */}
                    <div className={`p-8 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-0 h-fit`}>
                      <h3 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Key Performance Insights</h3>
                      
                      <div className="space-y-6">
                        {/* Radar Chart - Professional Enlarged */}
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
                                  // Abbreviate long metric names for better display
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
                                tick={{ 
                                  fontSize: 12, 
                                  fill: isDarkMode ? '#9ca3af' : '#6b7280',
                                  fontWeight: 500
                                }}
                                tickCount={6}
                              />
                              <Radar
                                name="Performance"
                                dataKey="value"
                                stroke={isDarkMode ? '#10b981' : '#3b82f6'}
                                fill={isDarkMode ? '#10b981' : '#3b82f6'}
                                fillOpacity={0.12}
                                strokeWidth={4}
                                dot={{ 
                                  r: 6, 
                                  fill: isDarkMode ? '#10b981' : '#3b82f6',
                                  strokeWidth: 3,
                                  stroke: isDarkMode ? '#064e3b' : '#1e40af'
                                }}
                                activeDot={{
                                  r: 8,
                                  fill: isDarkMode ? '#34d399' : '#60a5fa',
                                  strokeWidth: 3,
                                  stroke: isDarkMode ? '#064e3b' : '#1e40af'
                                }}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Performance Breakdown */}
                        <div className="space-y-3">
                          <h4 className={`font-semibold text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Performance Breakdown</h4>
                          
                          {/* Peak Performance Hours */}
                          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'} border-l-4 border-green-500`}>
                            <div className="flex justify-between items-center">
                              <div>
                                <p className={`text-sm font-medium ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>Peak Hours</p>
                                <p className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>2:00 PM - 4:00 PM</p>
                              </div>
                              <span className={`text-lg font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>85%</span>
                            </div>
                          </div>

                          {/* Time Distribution */}
                          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'} border-l-4 border-blue-500`}>
                            <div className="flex justify-between items-center">
                              <div>
                                <p className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>Time per Difficulty</p>
                                <p className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Easy: 45s • Med: 78s • Hard: 125s</p>
                              </div>
                              <span className={`text-lg font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>78%</span>
                            </div>
                          </div>

                          {/* Focus & Consistency */}
                          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'} border-l-4 border-purple-500`}>
                            <div className="flex justify-between items-center">
                              <div>
                                <p className={`text-sm font-medium ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>Focus Duration</p>
                                <p className={`text-xs ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>Avg: 45 min sessions</p>
                              </div>
                              <span className={`text-lg font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>75%</span>
                            </div>
                          </div>

                          {/* Improvement Areas */}
                          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-orange-900/30' : 'bg-orange-50'} border-l-4 border-orange-500`}>
                            <div className="flex justify-between items-center">
                              <div>
                                <p className={`text-sm font-medium ${isDarkMode ? 'text-orange-300' : 'text-orange-700'}`}>Hard Questions</p>
                                <p className={`text-xs ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>Focus area for improvement</p>
                              </div>
                              <span className={`text-lg font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>55%</span>
                            </div>
                          </div>

                          {/* Knowledge Retention */}
                          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-red-900/30' : 'bg-red-50'} border-l-4 border-red-500`}>
                            <div className="flex justify-between items-center">
                              <div>
                                <p className={`text-sm font-medium ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>Retention Rate</p>
                                <p className={`text-xs ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>Knowledge decay over 7 days</p>
                              </div>
                              <span className={`text-lg font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>68%</span>
                            </div>
                          </div>

                          {/* Emotional Analytics */}
                          <div className="mt-6">
                            <h4 className={`font-semibold text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Emotional Analytics</h4>
                            
                            {/* Emotional Distribution */}
                            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'} border-l-4 border-yellow-500 mb-3`}>
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className={`text-sm font-medium ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>Emotional Balance</p>
                                  <p className={`text-xs ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>😊 65% • 😐 25% • 😰 10%</p>
                                </div>
                                <span className={`text-lg font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>Positive</span>
                              </div>
                            </div>

                            {/* Confidence vs Performance */}
                            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'} border-l-4 border-indigo-500 mb-3`}>
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className={`text-sm font-medium ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>Confidence Calibration</p>
                                  <p className={`text-xs ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>Avg confidence: 3.8/5 • Accuracy: 72%</p>
                                </div>
                                <span className={`text-lg font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>Well-calibrated</span>
                              </div>
                            </div>

                            {/* Stress Impact */}
                            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-pink-900/30' : 'bg-pink-50'} border-l-4 border-pink-500`}>
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className={`text-sm font-medium ${isDarkMode ? 'text-pink-300' : 'text-pink-700'}`}>Stress Impact</p>
                                  <p className={`text-xs ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`}>When stressed: -15% accuracy</p>
                                </div>
                                <span className={`text-lg font-bold ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`}>Moderate</span>
                              </div>
                            </div>

                            {/* Key Insight */}
                            <div className={`mt-4 p-4 rounded-lg border-2 border-dashed ${
                              isDarkMode ? 'border-gray-600 bg-gray-800/50' : 'border-gray-300 bg-gray-50'
                            }`}>
                              <div className="flex items-start gap-3">
                                <div className="text-2xl">💡</div>
                                <div>
                                  <h5 className={`font-semibold text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                    Emotional Intelligence Insight
                                  </h5>
                                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    You perform best when confident (😊) with 85% accuracy. Try stress management 
                                    techniques during practice to improve performance when feeling anxious.
                                  </p>
                                </div>
                              </div>
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
