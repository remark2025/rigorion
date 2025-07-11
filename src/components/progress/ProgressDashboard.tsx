
import { Card } from "@/components/ui/card";
import { Calendar, Zap, Trophy, Target } from 'lucide-react';
import { ChapterProgress } from "./ChapterProgress";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { StatsCardGrid } from "./StatsCard";
import { TotalProgressCard } from "./TotalProgressCard";
import { PerformanceGraphCard } from "./PerformanceGraphCard";
import { DifficultyStatsGrid } from "./DifficultyStatsGrid";
import { TestMocksList } from "./TestMocksList";
import { AnimatedContainer, AnimatedItem } from "./AnimationWrappers";
import { ProjectedScore } from "@/components/stats/ProjectedScore";
import { UserProgressData } from "@/types/progress";
import { useState, useEffect } from "react";
import { Footer } from "@/components/Footer";
import { GlobalAnalysisCard } from "./GlobalAnalysisCard";
import { useTheme } from "@/contexts/ThemeContext";

interface ProgressDashboardProps {
  period: string;
  type: string;
  className?: string;
  userData: UserProgressData;
  visibleSections?: Record<string, boolean>;
}

export const ProgressDashboard = ({
  period,
  type,
  className,
  userData,
  visibleSections = {
    totalProgress: true,
    performanceGraph: true,
    difficultyStats: true,
    chapterProgress: true
  }
}: ProgressDashboardProps) => {
  const { isDarkMode } = useTheme();
  const [examDate, setExamDate] = useState<Date | null>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  const daysToExam = examDate ? Math.ceil((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 30;
  
  useEffect(() => {
    // Log the received user data for debugging
    console.log("ProgressDashboard received userData:", userData);
  }, [userData]);
  
  // Mock tests data
  const mockTests = [{
    id: '1',
    name: 'Mock Test 1',
    status: 'completed' as const,
    score: 92,
    date: '2024-03-15'
  }, {
    id: '2',
    name: 'Mock Test 2',
    status: 'completed' as const,
    score: 87,
    date: '2024-03-20'
  }, {
    id: '3',
    name: 'Mock Test 3',
    status: 'in-progress' as const
  }, {
    id: '4',
    name: 'Mock Test 4',
    status: 'incomplete' as const
  }, {
    id: '5',
    name: 'Mock Test 5',
    status: 'unattempted' as const
  }];

  // Stats data with updated styling and content
  const stats = [{
    title: "Days to Exam",
    value: `${daysToExam} days`,
    icon: Calendar,
    color: isDarkMode ? "text-green-400" : "text-blue-500",
    isCalendar: true,
    onSelect: setExamDate,
    selectedDate: examDate
  }, {
    title: "Streak",
    value: `${userData.streak} days`,
    icon: Zap,
    color: isDarkMode ? "text-green-400" : "text-blue-500"
  }, {
    title: "Recommended Problems/Day",
    value: "25",
    icon: Target,
    color: isDarkMode ? "text-green-400" : "text-blue-500"
  }, {
    title: "Rank",
    value: `#${userData.rank}`,
    icon: Trophy,
    color: isDarkMode ? "text-green-400" : "text-blue-500"
  }, {
    component: () => <ProjectedScore score={userData.projectedScore} />
  }];

  // Update the difficulty stats colors to use light blue instead of orange
  const difficultyStats = [{
    title: "Easy Questions",
    correct: userData.easyCompleted,
    total: userData.easyTotal,
    avgTime: `${userData.easyAvgTime.toFixed(1)} min`,
    color: isDarkMode ? "bg-gray-800 border border-green-500/30" : "bg-blue-100"
  }, {
    title: "Medium Questions",
    correct: userData.mediumCompleted,
    total: userData.mediumTotal,
    avgTime: `${userData.mediumAvgTime.toFixed(1)} min`,
    color: isDarkMode ? "bg-gray-800 border border-green-500/30" : "bg-blue-200"
  }, {
    title: "Hard Questions",
    correct: userData.hardCompleted,
    total: userData.hardTotal,
    avgTime: `${userData.hardAvgTime.toFixed(1)} min`,
    color: isDarkMode ? "bg-gray-800 border border-green-500/30" : "bg-blue-300"
  }];

  return (
    <AnimatedContainer className={cn("space-y-6 px-2 sm:px-4 md:px-6", className)}>
      {/* Stats Cards */}
      <div className="flex justify-center">
        <div className="w-full">
          <StatsCardGrid stats={stats} />
        </div>
      </div>
      
      {/* Layout change: Total Progress and Chapter Progress side by side */}
      <AnimatedContainer className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Total Progress Card */}
        <AnimatedItem>
          <TotalProgressCard 
            totalQuestions={userData.correctAnswers + userData.incorrectAnswers + userData.unattemptedQuestions} 
            correctQuestions={userData.correctAnswers} 
            incorrectQuestions={userData.incorrectAnswers} 
            unattemptedQuestions={userData.unattemptedQuestions} 
            alwaysVisible={true}
          />
        </AnimatedItem>
        
        {/* Chapter Progress - now placed beside the total progress */}
        {visibleSections.chapterProgress && (
          <AnimatedItem>
            <Card className={`p-6 border h-[480px] overflow-hidden ${
              isDarkMode ? 'bg-gray-900 border-green-500/30 text-green-400' : 'bg-white border-gray-50'
            }`}>
              <ChapterProgress chapters={userData.chapterPerformance} />
            </Card>
          </AnimatedItem>
        )}
      </AnimatedContainer>

      {/* Performance Graph - Full width */}
      <AnimatedItem>
        <PerformanceGraphCard data={userData.performanceGraph} />
      </AnimatedItem>

      {/* Mock Tests and Global Analysis side by side */}
      <AnimatedContainer className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <AnimatedItem>
          <TestMocksList tests={mockTests} />
        </AnimatedItem>
        
        <AnimatedItem>
          <GlobalAnalysisCard 
            percentile={85}
            averageDaily={15}
            yourDaily={25}
            totalUsersCount={5280}
          />
        </AnimatedItem>
      </AnimatedContainer>

      {/* Difficulty Stats */}
      <DifficultyStatsGrid stats={difficultyStats} />

      <Footer />
      
      <style>
        {`
        @media (max-width: 640px) {
          .recharts-responsive-container {
            height: 250px !important;
          }
          
          .recharts-text {
            font-size: 10px;
          }
        }
        
        @media (max-width: 480px) {
          .recharts-responsive-container {
            height: 200px !important;
          }
          
          h3 {
            font-size: 16px;
          }
          
          table {
            font-size: 12px;
          }
          
          .recharts-surface {
            overflow: visible;
          }
        }
        
        /* Add animation for the ripple effect */
        @keyframes pulse-subtle {
          0% {
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.8;
          }
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 3s infinite ease-in-out;
        }
        `}
      </style>
    </AnimatedContainer>
  );
};

export default ProgressDashboard;
