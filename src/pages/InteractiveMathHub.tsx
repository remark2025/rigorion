import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, BookOpen, ChevronLeft, ChevronRight, 
  TrendingUp, Award, Flame, Calculator, Play,
  Zap, Triangle, BarChart3, Waves, Rocket, Variable
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';

// Math topic categories with themed icons
const MATH_CATEGORIES = {
  Algebra: { icon: Variable, color: "#ea580c" },
  Geometry: { icon: Triangle, color: "#ea580c" },
  Statistics: { icon: BarChart3, color: "#ea580c" },
  Trigonometry: { icon: Waves, color: "#ea580c" },
  Physics: { icon: Rocket, color: "#ea580c" },
  "Advanced Math": { icon: Zap, color: "#ea580c" }
};

// Interactive math tools metadata
const MATH_TOOLS = [
  {
    id: 'projectile-motion',
    title: 'Projectile Motion',
    category: 'Physics',
    difficulty: 'Medium',
    description: 'Visualize physics in motion with interactive trajectories',
    toolCount: 1,
    imageUrl: '/resources/junior.png',
    isPremium: false,
    route: '/interactive-math/projectile-motion'
  },
  {
    id: 'quadratic-grapher',
    title: 'Quadratic Functions',
    category: 'Algebra',
    difficulty: 'Easy',
    description: 'Explore parabolas and their transformations',
    toolCount: 3,
    imageUrl: '/resources/junior.png',
    isPremium: true,
    route: '/interactive-math/quadratic-grapher'
  },
  {
    id: 'trigonometry-circle',
    title: 'Unit Circle Explorer',
    category: 'Trigonometry',
    difficulty: 'Medium',
    description: 'Master trigonometric functions visually',
    toolCount: 4,
    imageUrl: '/resources/junior.png',
    isPremium: true,
    route: '/interactive-math/trig-circle'
  },
  {
    id: 'linear-transformations',
    title: 'Linear Transformations',
    category: 'Geometry',
    difficulty: 'Hard',
    description: 'Understand matrix operations through visualization',
    toolCount: 5,
    imageUrl: '/resources/junior.png',
    isPremium: true,
    route: '/interactive-math/linear-transforms'
  },
  {
    id: 'statistics-visualizer',
    title: 'Data Visualization',
    category: 'Statistics',
    difficulty: 'Medium',
    description: 'Interactive charts and probability distributions',
    toolCount: 6,
    imageUrl: '/resources/junior.png',
    isPremium: true,
    route: '/interactive-math/statistics'
  },
  {
    id: 'calculus-derivatives',
    title: 'Calculus Explorer',
    category: 'Advanced Math',
    difficulty: 'Hard',
    description: 'Visualize derivatives and integrals',
    toolCount: 4,
    imageUrl: '/resources/junior.png',
    isPremium: true,
    route: '/interactive-math/calculus'
  },
  {
    id: 'coordinate-geometry',
    title: 'Coordinate Geometry',
    category: 'Geometry',
    difficulty: 'Easy',
    description: 'Points, lines, and shapes in the coordinate plane',
    toolCount: 3,
    imageUrl: '/resources/junior.png',
    isPremium: true,
    route: '/interactive-math/coordinate-geometry'
  },
  {
    id: 'exponential-functions',
    title: 'Exponential & Logarithmic Functions',
    category: 'Algebra',
    difficulty: 'Medium',
    description: 'Growth and decay in mathematical models',
    toolCount: 3,
    imageUrl: '/resources/junior.png',
    isPremium: true,
    route: '/interactive-math/exponential'
  }
];

const InteractiveMathHub: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');

  // Mock user progress - in real app this would come from state/API
  const userProgress = {
    'projectile-motion': { completed: true, stars: 4, accuracy: 92 }
  };

  const calculateStats = () => {
    const completed = Object.values(userProgress).filter((p: any) => p.completed).length;
    const totalTools = MATH_TOOLS.length;
    const avgAccuracy = Object.values(userProgress).reduce((sum: number, p: any) => sum + (p.accuracy || 0), 0) / Object.values(userProgress).length || 0;
    const streak = 3; // Mock streak
    
    return { completed, total: totalTools, avgAccuracy: Math.round(avgAccuracy), streak };
  };

  const stats = calculateStats();

  const filteredTools = MATH_TOOLS.filter(tool => {
    const matchesSearch = tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || tool.category === filterCategory;
    const matchesDifficulty = filterDifficulty === 'All' || tool.difficulty === filterDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const categorizedTools = filteredTools.reduce((acc: Record<string, any[]>, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  }, {});

  const getToolProgress = (toolId: string) => {
    const progress = userProgress[toolId];
    return {
      completed: progress?.completed || false,
      stars: progress?.stars || 0,
      accuracy: progress?.accuracy || 0
    };
  };

  const ToolCard: React.FC<{ tool: any; size?: string }> = ({ tool, size = 'normal' }) => {
    const [isHovered, setIsHovered] = useState(false);
    const progress = getToolProgress(tool.id);
    const IconComponent = MATH_CATEGORIES[tool.category as keyof typeof MATH_CATEGORIES]?.icon || Calculator;

    const handleClick = () => {
      if (tool.isPremium) {
        // Navigate to premium tool page which will show premium gate
        navigate(tool.route);
      } else {
        navigate(tool.route);
      }
    };

    return (
      <div
        className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
          size === 'large' ? 'h-64' : 'h-48'
        } ${isHovered ? 'scale-105 shadow-2xl z-10' : 'shadow-lg'} ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        {/* Background Image */}
        <img
          src={tool.imageUrl}
          alt={tool.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Orange Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-orange-600/90 via-orange-500/60 to-orange-400/40" />
        
        {/* Premium Lock Overlay */}
        {tool.isPremium && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="bg-orange-500/90 backdrop-blur-sm rounded-full p-4">
              <div className="text-white text-2xl">🔒</div>
            </div>
          </div>
        )}
        
        {/* Content */}
        <div className="relative h-full p-4 flex flex-col justify-between text-white">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              {!tool.isPremium && progress.completed && (
                <span className="text-2xl drop-shadow-lg">✅</span>
              )}
              {tool.isPremium && (
                <Badge className="bg-orange-600 text-white border-none">Premium</Badge>
              )}
            </div>
            
            <h3 className={`font-bold mb-2 drop-shadow-lg ${size === 'large' ? 'text-xl' : 'text-lg'} line-clamp-2`}>
              {tool.title}
            </h3>
            
            <p className="text-sm text-white/90 mb-3 drop-shadow line-clamp-2">
              {tool.description}
            </p>
            
            {!isHovered && !tool.isPremium && progress.completed && (
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < progress.stars ? 'text-yellow-400 drop-shadow' : 'text-white/30'}>⭐</span>
                  ))}
                  <span className="text-sm ml-2 font-semibold drop-shadow">{progress.accuracy}%</span>
                </div>
              </div>
            )}
          </div>
          
          {isHovered && (
            <div className="space-y-2 animate-fadeIn">
              <div className="text-sm space-y-1 drop-shadow-lg font-medium">
                <p>📊 {tool.difficulty} • {tool.toolCount} interactive tools</p>
                <p>📁 Category: {tool.category}</p>
                {!tool.isPremium && progress.accuracy > 0 && (
                  <p>🎯 Best Score: {progress.accuracy}%</p>
                )}
              </div>
            </div>
          )}
          
          <button className="mt-2 w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
            {tool.isPremium ? (
              <>🔓 Upgrade to Access</>
            ) : progress.completed ? (
              <>↻ Practice Again</>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start Learning
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  const CategoryRow: React.FC<{ category: string; tools: any[] }> = ({ category, tools }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const IconComponent = MATH_CATEGORIES[category as keyof typeof MATH_CATEGORIES]?.icon || Calculator;
    
    const scroll = (direction: string) => {
      if (scrollRef.current) {
        scrollRef.current.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' });
      }
    };
    
    return (
      <div className="mb-8">
        <h2 className={`text-2xl font-bold mb-4 flex items-center gap-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          <IconComponent className="w-8 h-8 text-orange-500" />
          <span>{category}</span>
        </h2>
        
        <div className="relative group">
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-orange-500/80 hover:bg-orange-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {tools.map(tool => (
              <div key={tool.id} className="flex-shrink-0 w-64">
                <ToolCard tool={tool} />
              </div>
            ))}
          </div>
          
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-orange-500/80 hover:bg-orange-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-orange-50 via-white to-orange-50'
    } p-6`}>
      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-in; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}} />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`sticky top-0 z-10 border-b shadow-sm mb-8 -mx-6 px-6 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white/90'
        } backdrop-blur-sm`}>
          <div className="container mx-auto py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/practice')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Practice
                </Button>
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-2 rounded-lg">
                    <Calculator className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className={`text-3xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      🧮 Interactive Math Hub
                    </h1>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Master Mathematics Through Visual Learning
                    </p>
                  </div>
                </div>
              </div>
              
              <div className={`flex items-center gap-6 backdrop-blur-sm px-6 py-3 rounded-full ${
                isDarkMode ? 'bg-gray-700/50' : 'bg-white/80'
              }`}>
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="font-bold">{stats.streak}</span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Day Streak</span>
                </div>
                <div className={`w-px h-6 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="font-bold">{stats.avgAccuracy}%</span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Score</span>
                </div>
                <div className={`w-px h-6 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-orange-500" />
                  <span className="font-bold">{stats.completed}/{stats.total}</span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Complete</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className={`mb-8 backdrop-blur-sm rounded-xl p-4 ${
          isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
        }`}>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="🔍 Search math tools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:border-orange-500' 
                    : 'bg-white text-gray-900 placeholder-gray-500 border-gray-300 focus:border-orange-500'
                } focus:outline-none`}
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 text-white border-gray-600 focus:border-orange-500' 
                  : 'bg-white text-gray-900 border-gray-300 focus:border-orange-500'
              } focus:outline-none`}
            >
              <option value="All">All Categories</option>
              {Object.keys(MATH_CATEGORIES).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 text-white border-gray-600 focus:border-orange-500' 
                  : 'bg-white text-gray-900 border-gray-300 focus:border-orange-500'
              } focus:outline-none`}
            >
              <option value="All">All Levels</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            {(searchTerm || filterCategory !== 'All' || filterDifficulty !== 'All') && (
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('All');
                  setFilterDifficulty('All');
                }}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Clear Filters
              </Button>
            )}
          </div>
          
          <div className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Showing {filteredTools.length} of {MATH_TOOLS.length} interactive tools
          </div>
        </div>

        {/* Categories */}
        {Object.keys(categorizedTools).length === 0 ? (
          <div className="text-center py-16">
            <Calculator className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <p className={`text-2xl mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No tools found</p>
            <p className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>Try adjusting your search or filters</p>
          </div>
        ) : (
          Object.entries(categorizedTools).map(([category, tools]) => (
            <CategoryRow key={category} category={category} tools={tools} />
          ))
        )}
      </div>
    </div>
  );
};

export default InteractiveMathHub;