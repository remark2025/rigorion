import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LearningShowcaseCard from "@/components/shared/LearningShowcaseCard";
import {
  Calculator, ArrowLeft, ChevronLeft, ChevronRight,
  Clock, Target, Award, TrendingUp, BookOpen, Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { SAT_MATH_SKILLS, getAllMathCategories, getMathSkillsByCategory, MathSkill } from '@/data/mathSkills';

const SATMath: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [selectedSkill, setSelectedSkill] = useState<MathSkill | null>(null);
  const [view, setView] = useState('selection');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');

  const categories = ['All', ...getAllMathCategories()];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  const filteredSkills = SAT_MATH_SKILLS.filter(skill => {
    const matchesSearch = skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'All' || skill.category === filterCategory;
    const matchesDifficulty = filterDifficulty === 'All' || skill.difficulty === filterDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Algebra': return 'bg-blue-100 text-blue-800';
      case 'Geometry': return 'bg-purple-100 text-purple-800';
      case 'Statistics': return 'bg-orange-100 text-orange-800';
      case 'Functions': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const startPractice = (skill: MathSkill) => {
    // Navigate to practice page with skill filter
    navigate('/practice', { state: { mathSkill: skill } });
  };

  const SkillCard: React.FC<{ skill: MathSkill; size?: 'normal' | 'large' }> = ({ 
    skill, 
    size = 'normal' 
  }) => {
    const cardHeight = size === 'large' ? 'min-h-[20.7rem]' : 'min-h-[19.4rem]';

    return (
      <LearningShowcaseCard
        imageSrc={skill.imageUrl}
        imageAlt={skill.title}
        onClick={() => startPractice(skill)}
        topRightOverlay={
          <Badge className={getDifficultyColor(skill.difficulty)}>{skill.difficulty}</Badge>
        }
        className={cardHeight}
        bodyClassName="justify-between"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className={getCategoryColor(skill.category)}>
              {skill.category}
            </Badge>
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="mr-1 h-3 w-3" />
              {skill.estimatedTime}m
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {skill.title}
          </h3>

          <p className="text-sm text-gray-600 line-clamp-2">
            {skill.description}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-500">
              <Target className="mr-1 h-4 w-4" />
              {skill.questionCount} questions
            </div>
          </div>

          <Button
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white transition hover:from-blue-600 hover:to-blue-700"
            onClick={(e) => {
              e.stopPropagation();
              startPractice(skill);
            }}
          >
            <Play className="mr-2 h-4 w-4" />
            Start Practice
          </Button>
        </div>
      </LearningShowcaseCard>
    );
  };

  const CategorySection: React.FC<{ category: string }> = ({ category }) => {
    const skills = getMathSkillsByCategory(category);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
      if (scrollRef.current) {
        const scrollAmount = 320;
        scrollRef.current.scrollBy({
          left: direction === 'left' ? -scrollAmount : scrollAmount,
          behavior: 'smooth'
        });
      }
    };

    return (
      <div className="mb-8">
        <h2 className={`text-2xl font-bold mb-4 flex items-center gap-2 px-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <Calculator className="w-6 h-6" />
          <span>{category}</span>
        </h2>
       
        <div className="relative group">
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-blue-500/80 hover:bg-blue-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
         
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pl-6"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {skills.map(skill => (
              <div key={skill.id} className="flex-shrink-0 w-80">
                <SkillCard skill={skill} />
              </div>
            ))}
          </div>
         
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-blue-500/80 hover:bg-blue-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    );
  };

  if (view === 'selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        {/* Fixed Header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
          <div className="w-full px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => navigate('/')} 
                  variant="outline"
                  className="flex items-center gap-2 text-blue-600 border-gray-300 hover:bg-blue-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </div>

              {/* Search and Filters */}
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Search skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {difficulties.map(diff => (
                    <option key={diff} value={diff}>{diff}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="pt-20 pb-8">
          {/* Hero Section */}
          <div className="text-center py-12 px-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              SAT Math Practice
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Master all 20 essential SAT Math skills with targeted practice
            </p>
          </div>

          {/* Skills by Category */}
          {searchTerm || filterCategory !== 'All' || filterDifficulty !== 'All' ? (
            // Filtered Results
            <div className="px-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                Search Results ({filteredSkills.length} skills)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredSkills.map(skill => (
                  <SkillCard key={skill.id} skill={skill} />
                ))}
              </div>
            </div>
          ) : (
            // Category Sections
            <div className="space-y-12">
              {getAllMathCategories().map(category => (
                <CategorySection key={category} category={category} />
              ))}
            </div>
          )}
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .animate-fadeIn { animation: fadeIn 0.3s ease-in; }
          .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
          
          @keyframes shimmer {
            0% { background-position: -200px 0; }
            100% { background-position: calc(200px + 100%) 0; }
          }
          
          .card-shimmer {
            background: linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.1) 50%, transparent 100%);
            background-size: 200px 100%;
            animation: shimmer 2s infinite linear;
          }
        `}} />
      </div>
    );
  }

  return null;
};

export default SATMath;