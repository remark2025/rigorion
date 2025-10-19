import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LearningShowcaseCard from "@/components/shared/LearningShowcaseCard";
import { ArrowLeft, Calendar, Clock, Trophy, Star } from 'lucide-react';

interface SATExam {
  id: string;
  title: string;
  examType: 'Official SAT' | 'Practice Test' | 'Mock Test';
  status: 'not-started' | 'in-progress' | 'completed';
  completionDate?: string;
  score?: number;
  imageUrl: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: string;
  sections: string[];
}

const SATExamHub: React.FC = () => {
  const navigate = useNavigate();

  // Generate 24 SAT exams with varied data
  const generateSATExams = (): SATExam[] => {
    const examTypes: Array<'Official SAT' | 'Practice Test' | 'Mock Test'> = ['Official SAT', 'Practice Test', 'Mock Test'];
    const statuses: Array<'not-started' | 'in-progress' | 'completed'> = ['not-started', 'in-progress', 'completed'];
    const difficulties: Array<'Easy' | 'Medium' | 'Hard'> = ['Easy', 'Medium', 'Hard'];
    const imageUrls = [
      '/resources/hero 5.webp',
      '/resources/wallpaper.webp',
      '/resources/mywall.jpg',
      '/resources/whiteone.jpg.jpg'
    ];

    return Array.from({ length: 24 }, (_, index) => {
      const examNumber = index + 1;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const examType = examTypes[Math.floor(Math.random() * examTypes.length)];
      
      return {
        id: `sat-exam-${examNumber}`,
        title: `SAT Test ${examNumber}`,
        examType,
        status,
        completionDate: status === 'completed' 
          ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
          : undefined,
        score: status === 'completed' 
          ? Math.floor(Math.random() * 400) + 1200 // Score between 1200-1600
          : undefined,
        imageUrl: imageUrls[index % imageUrls.length],
        difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
        duration: '3h 15min',
        sections: ['Reading & Writing', 'Math']
      };
    });
  };

  const [exams] = useState<SATExam[]>(generateSATExams());

  const handleStartExam = (exam: SATExam) => {
    if (exam.status === 'not-started' || exam.status === 'in-progress') {
      navigate('/sat-mock-test', { state: { examId: exam.id, examTitle: exam.title } });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600 text-white';
      case 'in-progress':
        return 'bg-orange-500 text-white';
      case 'not-started':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Hard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusOverlay = (exam: SATExam) => {
    if (exam.status === 'completed' && exam.score && exam.score >= 1500) {
      return <Trophy className="h-6 w-6 text-yellow-500" />;
    }
    if (exam.status === 'completed') {
      return <Star className="h-6 w-6 text-green-500" />;
    }
    if (exam.status === 'not-started') {
      return <Badge className="bg-blue-600 text-white text-xs px-2 py-1">NEW</Badge>;
    }
    if (exam.status === 'in-progress') {
      return <Badge className="bg-orange-500 text-white text-xs px-2 py-1">RESUME</Badge>;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Button 
            onClick={() => navigate('/practice')} 
            variant="outline"
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Practice
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              SAT Digital Exams
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Take official SAT practice tests and mock exams to prepare for the real test. 
              Each exam simulates the actual SAT digital format with timed sections.
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">
              {exams.filter(e => e.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed Exams</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-orange-600">
              {exams.filter(e => e.status === 'in-progress').length}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">
              {exams.filter(e => e.status === 'completed' && e.score).reduce((avg, e) => avg + (e.score || 0), 0) / exams.filter(e => e.status === 'completed' && e.score).length || 0}
            </div>
            <div className="text-sm text-gray-600">Average Score</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-purple-600">24</div>
            <div className="text-sm text-gray-600">Total Available</div>
          </div>
        </div>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {exams.map((exam) => (
            <LearningShowcaseCard
              key={exam.id}
              imageSrc={exam.imageUrl}
              imageAlt={exam.title}
              onClick={() => handleStartExam(exam)}
              topRightOverlay={getStatusOverlay(exam)}
              className="min-h-[22rem] hover:shadow-xl transition-all duration-300"
              bodyClassName="justify-between"
            >
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {exam.title}
                  </h3>
                  <Badge 
                    className={`${getStatusColor(exam.status)} text-xs px-2 py-1 mb-2`}
                  >
                    {exam.status.charAt(0).toUpperCase() + exam.status.slice(1).replace('-', ' ')}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="font-medium">{exam.examType}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{exam.duration}</span>
                  </div>

                  {exam.completionDate && (
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Completed: {exam.completionDate}</span>
                    </div>
                  )}

                  {exam.score && (
                    <div className="flex items-center text-gray-600">
                      <Star className="h-4 w-4 mr-2" />
                      <span className="font-semibold">Score: {exam.score}/1600</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Badge className={`${getDifficultyColor(exam.difficulty)} text-xs`}>
                    {exam.difficulty}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {exam.sections.join(' • ')}
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  className={`w-full ${
                    exam.status === 'completed' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : exam.status === 'in-progress'
                      ? 'bg-orange-500 hover:bg-orange-600'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartExam(exam);
                  }}
                  disabled={exam.status === 'completed'}
                >
                  {exam.status === 'completed' 
                    ? 'View Results' 
                    : exam.status === 'in-progress'
                    ? 'Resume Test'
                    : 'Start Test'
                  }
                </Button>
              </div>
            </LearningShowcaseCard>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-gray-600">
          <p className="text-sm">
            All exams follow the official SAT Digital format with adaptive testing and precise timing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SATExamHub;