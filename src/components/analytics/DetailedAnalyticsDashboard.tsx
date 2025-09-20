import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  BookOpen, 
  Clock, 
  Target, 
  Award, 
  Brain, 
  BarChart3,
  Calendar,
  Trophy,
  Zap,
  CheckCircle,
  AlertTriangle,
  Activity,
  Timer,
  Lightbulb,
  LineChart
} from 'lucide-react';
import FallbackAnalyticsService, { CourseAnalytics, DetailedSkillAnalytics } from '@/services/fallbackAnalytics';
import { useTheme } from '@/contexts/ThemeContext';

interface DetailedAnalyticsDashboardProps {
  userId?: string;
}

const DetailedAnalyticsDashboard: React.FC<DetailedAnalyticsDashboardProps> = ({ userId }) => {
  const { isDarkMode } = useTheme();
  const [selectedCourse, setSelectedCourse] = useState<'Math' | 'Reading' | 'Writing'>('Math');
  const [courseAnalytics, setCourseAnalytics] = useState<CourseAnalytics[]>([]);
  const [overallProgress, setOverallProgress] = useState<any>(null);
  const [performanceTrend, setPerformanceTrend] = useState<any[]>([]);
  const [realTestData, setRealTestData] = useState<any[]>([]);
  const [performanceAnalytics, setPerformanceAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load comprehensive analytics data
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const courses = FallbackAnalyticsService.getAllCourseAnalytics();
        const progress = FallbackAnalyticsService.getOverallProgress();
        const trend = FallbackAnalyticsService.getPerformanceTrendData();
        
        // Mock real test data
        const mockRealTests = [
          { testNo: 1, date: '2024-01-15', satResult: 1380, satMath: 720, satWR: 660, improvement: 0 },
          { testNo: 2, date: '2024-02-20', satResult: 1420, satMath: 750, satWR: 670, improvement: 40 },
          { testNo: 3, date: '2024-03-18', satResult: 1480, satMath: 780, satWR: 700, improvement: 60 },
          { testNo: 4, date: '2024-04-22', satResult: 1510, satMath: 790, satWR: 720, improvement: 30 },
        ];

        // Mock performance analytics data
        const mockPerformanceAnalytics = {
          highPerformanceHours: [
            { hour: '9-10 AM', accuracy: 92, questionCount: 45 },
            { hour: '2-3 PM', accuracy: 88, questionCount: 38 },
            { hour: '7-8 PM', accuracy: 85, questionCount: 52 },
          ],
          difficultyAccuracy: {
            easy: { accuracy: 95, avgTime: 1.2, confidence: 88 },
            medium: { accuracy: 78, avgTime: 2.1, confidence: 72 },
            hard: { accuracy: 62, avgTime: 3.8, confidence: 54 },
          },
          metacognitionData: [
            { confidence: 90, accuracy: 88, category: 'High Confidence' },
            { confidence: 75, accuracy: 76, category: 'Medium Confidence' },
            { confidence: 45, accuracy: 52, category: 'Low Confidence' },
          ]
        };
        
        setCourseAnalytics(courses);
        setOverallProgress(progress);
        setPerformanceTrend(trend);
        setRealTestData(mockRealTests);
        setPerformanceAnalytics(mockPerformanceAnalytics);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [userId]);

  const getCurrentCourseData = (): CourseAnalytics | null => {
    return courseAnalytics.find(course => course.section === selectedCourse) || null;
  };

  const getMasteryColor = (level: string) => {
    switch (level) {
      case 'Advanced': return 'bg-green-500';
      case 'Proficient': return 'bg-blue-500';
      case 'Developing': return 'bg-yellow-500';
      case 'Beginner': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'Improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'Declining': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <BarChart3 className="h-4 w-4 text-blue-500" />;
    }
  };

  const currentCourse = getCurrentCourseData();

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-64 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">📊 SAT Analytics Dashboard</h1>
        <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Comprehensive performance insights and skill tracking
        </p>
      </div>

      {/* Overall Progress Summary */}
      {overallProgress && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Questions</p>
                  <p className="text-3xl font-bold">{overallProgress.totalQuestionsAttempted}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Overall Accuracy</p>
                  <p className="text-3xl font-bold">{overallProgress.overallAccuracy}%</p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Study Streak</p>
                  <p className="text-3xl font-bold">{overallProgress.studyStreakDays} days</p>
                </div>
                <Zap className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Estimated Score</p>
                  <p className="text-3xl font-bold">{overallProgress.estimatedScoreRange}</p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Course Selection */}
      <div className="mb-6">
        <div className="flex space-x-2">
          {['Math', 'Reading', 'Writing'].map((course) => (
            <Button
              key={course}
              onClick={() => setSelectedCourse(course as any)}
              variant={selectedCourse === course ? 'default' : 'outline'}
              className={`px-6 py-2 ${
                selectedCourse === course
                  ? 'bg-blue-600 text-white'
                  : isDarkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {course}
            </Button>
          ))}
        </div>
      </div>

      {/* Course Overview */}
      {currentCourse && (
        <div className="mb-8">
          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-purple-500" />
                {currentCourse.courseName} Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Overall Accuracy</p>
                    <div className="flex items-center gap-2">
                      <Progress value={currentCourse.overallAccuracy} className="flex-1" />
                      <span className="text-lg font-semibold">{currentCourse.overallAccuracy}%</span>
                    </div>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Questions Attempted</p>
                    <p className="text-2xl font-bold">{currentCourse.totalQuestionsAttempted}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Time Spent</p>
                    <p className="text-2xl font-bold">{Math.round(currentCourse.totalTimeSpent / 60)} hours</p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Current Level</p>
                    <Badge className="bg-blue-100 text-blue-800">{currentCourse.currentLevel}</Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Progress</p>
                    <div className="flex items-center gap-2">
                      <Progress value={(currentCourse.chaptersCompleted / currentCourse.totalChapters) * 100} className="flex-1" />
                      <span className="text-sm">{currentCourse.chaptersCompleted}/{currentCourse.totalChapters}</span>
                    </div>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Weekly Progress</p>
                    <p className="text-2xl font-bold">{currentCourse.weeklyProgress}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Skills Breakdown */}
      {currentCourse && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">📚 Chapter-by-Chapter Analysis</h2>
          <div className="space-y-6">
            {currentCourse.skills.map((skill: DetailedSkillAnalytics) => (
              <Card key={skill.skillId} className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        {skill.skillName}
                      </CardTitle>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {skill.chapter} • {skill.section}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getMasteryColor(skill.masteryLevel)} text-white`}>
                        {skill.masteryLevel}
                      </Badge>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Percentile: {skill.percentile}%
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Performance Stats */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm uppercase tracking-wide">Performance</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Correct:</span>
                          <span className="font-semibold text-green-600">{skill.correct}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Incorrect:</span>
                          <span className="font-semibold text-red-600">{skill.incorrect}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Unattempted:</span>
                          <span className="font-semibold text-gray-500">{skill.unattempted}</span>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="flex justify-between">
                            <span className="text-sm">Accuracy:</span>
                            <span className="font-semibold">{Math.round((skill.correct / (skill.correct + skill.incorrect)) * 100)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Metrics */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm uppercase tracking-wide">Progress</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getTrendIcon(skill.accuracyTrend)}
                          <span className="text-sm">{skill.accuracyTrend}</span>
                        </div>
                        <div>
                          <span className="text-sm">Practice/Day:</span>
                          <span className="ml-2 font-semibold">{skill.practicePerDay}</span>
                        </div>
                        <div>
                          <span className="text-sm">Streak:</span>
                          <span className="ml-2 font-semibold">{skill.studyStreak} days</span>
                        </div>
                        <div>
                          <span className="text-sm">Avg Time:</span>
                          <span className="ml-2 font-semibold">{skill.averageTime}min</span>
                        </div>
                      </div>
                    </div>

                    {/* Concept Mastery */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm uppercase tracking-wide">Concept Mastery</h4>
                      <div className="space-y-3">
                        {skill.conceptMastery.slice(0, 3).map((concept, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs">{concept.concept}</span>
                              <span className="text-xs font-semibold">{concept.mastery}%</span>
                            </div>
                            <Progress value={concept.mastery} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm uppercase tracking-wide">Next Steps</h4>
                      <div className="space-y-2">
                        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500">
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Next Milestone</p>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{skill.nextMilestone}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500">
                          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Recommendation</p>
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">{skill.recommendedAction}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Strengths and Weaknesses */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-semibold text-sm mb-2 text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Strongest Concepts
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {skill.strongestConcepts.map((concept, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            {concept}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-semibold text-sm mb-2 text-orange-600 flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4" />
                        Areas for Improvement
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {skill.weakestConcepts.map((concept, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                            {concept}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* REAL TEST Analytics Table */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          REAL TEST Analytics
        </h2>
        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className="text-left py-3 px-4 font-semibold">Test No</th>
                    <th className="text-left py-3 px-4 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 font-semibold">SAT Result</th>
                    <th className="text-left py-3 px-4 font-semibold">SAT Math</th>
                    <th className="text-left py-3 px-4 font-semibold">SAT W+R</th>
                    <th className="text-left py-3 px-4 font-semibold">Improvement (Percentile)</th>
                  </tr>
                </thead>
                <tbody>
                  {realTestData.map((test, index) => (
                    <tr key={index} className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} hover:bg-gray-50 dark:hover:bg-gray-700/50`}>
                      <td className="py-3 px-4 font-medium">{test.testNo}</td>
                      <td className="py-3 px-4">{new Date(test.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">{test.satResult}</td>
                      <td className="py-3 px-4">{test.satMath}</td>
                      <td className="py-3 px-4">{test.satWR}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {test.improvement > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : test.improvement < 0 ? (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          ) : (
                            <BarChart3 className="h-4 w-4 text-gray-500" />
                          )}
                          <span className={`font-medium ${
                            test.improvement > 0 ? 'text-green-600 dark:text-green-400' :
                            test.improvement < 0 ? 'text-red-600 dark:text-red-400' :
                            'text-gray-600 dark:text-gray-400'
                          }`}>
                            {test.improvement > 0 ? '+' : ''}{test.improvement}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Analytics */}
      {performanceAnalytics && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Activity className="h-6 w-6 text-purple-500" />
            Performance Analytics
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* High Performance Hours */}
            <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  High Performance Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceAnalytics.highPerformanceHours.map((hour, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <div>
                        <p className="font-medium">{hour.hour}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{hour.questionCount} questions</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{hour.accuracy}%</p>
                        <div className="w-16">
                          <Progress value={hour.accuracy} className="h-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Problem Difficulty Accuracy */}
            <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  Accuracy by Difficulty
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(performanceAnalytics.difficultyAccuracy).map(([difficulty, data]: [string, any]) => (
                    <div key={difficulty} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium capitalize">{difficulty} Problems</span>
                        <span className="font-bold">{data.accuracy}%</span>
                      </div>
                      <Progress value={data.accuracy} className="h-2 mb-2" />
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>Avg Time: {data.avgTime}min</span>
                        <span>Confidence: {data.confidence}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Metacognition Confidence Correlation */}
          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Metacognition: Confidence vs Accuracy Correlation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {performanceAnalytics.metacognitionData.map((item, index) => (
                  <div key={index} className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <h4 className="font-semibold mb-3">{item.category}</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Confidence</p>
                        <div className="flex items-center gap-2">
                          <Progress value={item.confidence} className="flex-1 h-2" />
                          <span className="text-sm font-medium">{item.confidence}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Accuracy</p>
                        <div className="flex items-center gap-2">
                          <Progress value={item.accuracy} className="flex-1 h-2" />
                          <span className="text-sm font-medium">{item.accuracy}%</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Correlation: {Math.abs(item.confidence - item.accuracy) <= 10 ? 'Strong' : 'Moderate'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Course Recommendations */}
      {currentCourse && (
        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Personalized Recommendations for {selectedCourse}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">📈 Focus Areas</h4>
                <ul className="space-y-2">
                  {currentCourse.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm">{rec}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">🎯 Study Plan</h4>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium text-sm">Daily Goal</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Practice 15-20 questions per day</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium text-sm">Weekly Target</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Complete 2-3 chapter sections</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium text-sm">Next Assessment</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Practice test in 2 weeks</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DetailedAnalyticsDashboard;