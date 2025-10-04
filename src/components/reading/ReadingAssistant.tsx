import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, Eye, EyeOff, FileText,
  Lightbulb, X, Clock, Check, Target, 
  Play, Pause, Settings, ChevronLeft, 
  ChevronRight, TrendingUp, Award, Flame,
  ArrowLeft, ChevronUp, ChevronDown, GripVertical
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { readingService } from '@/services/readingService';
import { PassageContent, PassageMetadata } from '@/data/reading/types';
import { CATEGORIES } from '@/data/reading/categories';

// Category themes - using new architecture
const CATEGORY_THEMES = CATEGORIES;

// Get all passage metadata
const PASSAGE_METADATA = readingService.getAllPassages();

// Fetch passage content using the new service
const fetchPassageById = async (id: number): Promise<PassageContent | null> => {
  return await readingService.getPassageContent(id);
};

const ReadingAssistant: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [userProgress, setUserProgress] = useState<Record<number, any>>({});
  const [selectedPassage, setSelectedPassage] = useState<any>(null);
  const [isLoadingPassage, setIsLoadingPassage] = useState(false);
  const [view, setView] = useState('selection');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [filterCompletion, setFilterCompletion] = useState('All');
 
  const [displayText, setDisplayText] = useState('');
  const [fontSize, setFontSize] = useState('16px');
  const [fontFamily, setFontFamily] = useState('Georgia');
  const [showSettings, setShowSettings] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [eliminated, setEliminated] = useState<Record<number, Record<number, boolean>>>({});
  const [showHint, setShowHint] = useState<Record<number, boolean>>({});
  const [passageWidth, setPassageWidth] = useState(65); // percentage
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isResizing, setIsResizing] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [highlights, setHighlights] = useState({ evidence: true, toneShifters: true, transitions: true, difficult: true });
  const [activeTooltip, setActiveTooltip] = useState<any>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fontOptions = ['Georgia', 'Times New Roman', 'Arial', 'Helvetica', 'Verdana', 'Courier New'];
  const fontSizeOptions = [{ label: '14px', value: '14px' }, { label: '16px', value: '16px' }, { label: '18px', value: '18px' }, { label: '20px', value: '20px' }];

  const questionTypes = [
    { value: 'main-idea', label: 'Main Idea', color: 'bg-orange-100 text-orange-800' },
    { value: 'inference', label: 'Inference', color: 'bg-orange-100 text-orange-800' },
    { value: 'evidence', label: 'Evidence', color: 'bg-orange-200 text-orange-900' },
    { value: 'vocabulary', label: 'Vocabulary', color: 'bg-orange-100 text-orange-800' },
    { value: 'purpose', label: 'Purpose', color: 'bg-orange-200 text-orange-900' },
    { value: 'tone', label: 'Tone/Attitude', color: 'bg-orange-100 text-orange-800' }
  ];

  const highlightCategories = [
    { id: 'evidence', label: '🟡 Evidence', color: 'rgba(251, 146, 60, 0.3)' },
    { id: 'toneShifters', label: '🩷 Tone Shifters', color: 'rgba(251, 146, 60, 0.4)' },
    { id: 'transitions', label: '🔵 Transitions', color: 'rgba(251, 146, 60, 0.2)' },
    { id: 'difficult', label: '🟣 Vocabulary', color: 'transparent', underline: true }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('sat-reading-progress');
    if (saved) setUserProgress(JSON.parse(saved));
  }, []);

  const saveProgress = (passageId: number, updates: any) => {
    const newProgress = {
      ...userProgress,
      [passageId]: {
        ...(userProgress[passageId] || {}),
        ...updates,
        lastAccessed: new Date().toISOString()
      }
    };
    setUserProgress(newProgress);
    localStorage.setItem('sat-reading-progress', JSON.stringify(newProgress));
  };

  const calculateStats = () => {
    const passages = Object.values(userProgress);
    const completed = passages.filter((p: any) => p.status === 'completed').length;
    const totalAnswered = passages.reduce((sum: number, p: any) => sum + (p.questionsCorrect?.length || 0), 0);
    const totalQuestions = passages.reduce((sum: number, p: any) => sum + (p.questionsAnswered?.length || 0), 0);
    const avgAccuracy = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;
   
    let streak = 0;
    const sortedDates = passages
      .map((p: any) => new Date(p.lastAccessed).toDateString())
      .filter((date, idx, arr) => arr.indexOf(date) === idx)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
   
    for (let i = 0; i < sortedDates.length; i++) {
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - i);
      if (sortedDates.includes(checkDate.toDateString())) {
        streak++;
      } else {
        break;
      }
    }

    return { completed, total: readingService.getAllPassages().length, avgAccuracy, streak };
  };

  const stats = calculateStats();

  const calculateStars = (passageData: any) => {
    if (!passageData || !passageData.questionsAnswered) return 0;
    const total = passageData.questionsAnswered.length;
    const correct = passageData.questionsCorrect?.length || 0;
    const accuracy = total > 0 ? (correct / total) * 100 : 0;
    const attempts = passageData.attempts || 1;
   
    if (accuracy === 100 && attempts === 1) return 5;
    if (accuracy === 100) return 4;
    if (accuracy >= 80) return 3;
    if (accuracy >= 60) return 2;
    if (accuracy >= 40) return 1;
    return 0;
  };

  const getPassageProgress = (passageId: number) => {
    const progress = userProgress[passageId];
    if (!progress) return { status: 'not-started', progress: 0, stars: 0, accuracy: 0 };
   
    const metadata = readingService.getPassageMetadata(passageId);
    const total = metadata?.questionCount || 0;
    const answered = progress.questionsAnswered?.length || 0;
    const correct = progress.questionsCorrect?.length || 0;
    const progressPercent = total > 0 ? Math.round((answered / total) * 100) : 0;
    const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;
   
    return {
      status: progressPercent === 100 ? 'completed' : answered > 0 ? 'in-progress' : 'not-started',
      progress: progressPercent,
      stars: calculateStars(progress),
      accuracy,
      attempts: progress.attempts || 0
    };
  };

  // Get filtered passages using the reading service
  const filteredPassages = (() => {
    // Start with all passages
    let passages = readingService.getAllPassages();
    
    // Apply search filter first if there's a search term
    if (searchTerm.trim()) {
      passages = readingService.searchPassages(searchTerm);
    }
    
    // Then apply category, difficulty, and completion filters
    return passages.filter(passage => {
      const categoryMatch = filterCategory === 'All' || passage.category === filterCategory;
      const difficultyMatch = filterDifficulty === 'All' || passage.difficulty === filterDifficulty;
      
      let completionMatch = true;
      if (filterCompletion !== 'All') {
        const progress = getPassageProgress(passage.id);
        completionMatch = filterCompletion === 'Completed' 
          ? progress.status === 'completed' 
          : progress.status !== 'completed';
      }
      
      return categoryMatch && difficultyMatch && completionMatch;
    });
  })();

  const filteredCategorized = filteredPassages.reduce((acc: Record<string, any[]>, passage) => {
    if (!acc[passage.category]) acc[passage.category] = [];
    acc[passage.category].push(passage);
    return acc;
  }, {});

  const loadPassage = async (passageId: number) => {
    setIsLoadingPassage(true);
    try {
      const passage = await fetchPassageById(passageId);
      if (passage) {
        setSelectedPassage(passage);
       
        // Apply PRE-STORED highlights immediately
        const highlighted = applyHighlights(passage.text, passage.highlights);
        setDisplayText(highlighted);
       
        setView('reading');
        setAnswers({});
        setEliminated({});
        setTimer(0);
        setCurrentQuestionIndex(0);
       
        const currentProgress = userProgress[passageId] || {};
        saveProgress(passageId, {
          status: currentProgress.status || 'in-progress',
          attempts: (currentProgress.attempts || 0) + 1,
          questionsAnswered: currentProgress.questionsAnswered || [],
          questionsCorrect: currentProgress.questionsCorrect || []
        });
      }
    } catch (error) {
      console.error('Error loading passage:', error);
    } finally {
      setIsLoadingPassage(false);
    }
  };

  // Apply pre-stored highlights to text
  const applyHighlights = (text: string, highlightData: any) => {
    const positions: any[] = [];
   
    // Add evidence highlights
    highlightData.evidence.forEach((phrase: string) => {
      let startIndex = 0;
      while (true) {
        const index = text.toLowerCase().indexOf(phrase.toLowerCase(), startIndex);
        if (index === -1) break;
        positions.push({
          start: index,
          end: index + phrase.length,
          text: text.substring(index, index + phrase.length),
          type: 'evidence'
        });
        startIndex = index + phrase.length;
      }
    });

    // Add tone shifters
    highlightData.toneShifters.forEach((phrase: string) => {
      let startIndex = 0;
      while (true) {
        const index = text.toLowerCase().indexOf(phrase.toLowerCase(), startIndex);
        if (index === -1) break;
        positions.push({
          start: index,
          end: index + phrase.length,
          text: text.substring(index, index + phrase.length),
          type: 'toneShifters'
        });
        startIndex = index + phrase.length;
      }
    });

    // Add transitions
    highlightData.transitions.forEach((phrase: string) => {
      let startIndex = 0;
      while (true) {
        const index = text.toLowerCase().indexOf(phrase.toLowerCase(), startIndex);
        if (index === -1) break;
        positions.push({
          start: index,
          end: index + phrase.length,
          text: text.substring(index, index + phrase.length),
          type: 'transitions'
        });
        startIndex = index + phrase.length;
      }
    });

    // Add difficult words
    Object.keys(highlightData.difficult).forEach(word => {
      let startIndex = 0;
      while (true) {
        const index = text.toLowerCase().indexOf(word.toLowerCase(), startIndex);
        if (index === -1) break;
        positions.push({
          start: index,
          end: index + word.length,
          text: text.substring(index, index + word.length),
          type: 'difficult',
          explanation: highlightData.difficult[word]
        });
        startIndex = index + word.length;
      }
    });

    // Sort and remove overlaps
    positions.sort((a, b) => {
      if (a.start !== b.start) return a.start - b.start;
      return (b.end - b.start) - (a.end - a.start);
    });

    const filtered: any[] = [];
    for (const pos of positions) {
      const overlaps = filtered.some(existing =>
        (pos.start >= existing.start && pos.start < existing.end) ||
        (pos.end > existing.start && pos.end <= existing.end) ||
        (pos.start <= existing.start && pos.end >= existing.end)
      );
      if (!overlaps) filtered.push(pos);
    }

    // Build HTML
    let result = '';
    let lastIndex = 0;

    filtered.forEach(pos => {
      result += text.substring(lastIndex, pos.start);
     
      const colorMap: Record<string, string> = {
        evidence: 'rgba(251, 146, 60, 0.3)',
        toneShifters: 'rgba(251, 146, 60, 0.4)',
        transitions: 'rgba(251, 146, 60, 0.2)',
        difficult: 'transparent'
      };
     
      const color = colorMap[pos.type];
      const style = pos.type === 'difficult'
        ? 'text-decoration: underline; text-decoration-style: dotted; text-decoration-thickness: 2px; text-decoration-color: #ea580c; cursor: help;'
        : `background-color: ${color}; padding: 2px 0; border-radius: 2px;`;
     
      const escapedText = pos.text.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      const dataExplanation = pos.explanation ? ` data-explanation="${pos.explanation.replace(/"/g, '&quot;')}"` : '';
      result += `<mark data-type="${pos.type}" data-text="${escapedText}"${dataExplanation} style="${style}">${pos.text}</mark>`;
     
      lastIndex = pos.end;
    });

    result += text.substring(lastIndex);
    return result;
  };

  const getDisplayTextContent = () => {
    if (!displayText) return '';
   
    let display = displayText;
   
    if (!highlights.evidence) {
      display = display.replace(/<mark data-type="evidence"[^>]*>(.*?)<\/mark>/g, '$1');
    }
    if (!highlights.toneShifters) {
      display = display.replace(/<mark data-type="toneShifters"[^>]*>(.*?)<\/mark>/g, '$1');
    }
    if (!highlights.transitions) {
      display = display.replace(/<mark data-type="transitions"[^>]*>(.*?)<\/mark>/g, '$1');
    }
    if (!highlights.difficult) {
      display = display.replace(/<mark data-type="difficult"[^>]*>(.*?)<\/mark>/g, '$1');
    }
   
    return display;
  };

  const handleMouseOver = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'MARK' && target.getAttribute('data-type') === 'difficult') {
      const explanation = target.getAttribute('data-explanation');
      const text = target.getAttribute('data-text');
     
      if (explanation) {
        const rect = target.getBoundingClientRect();
        const container = target.closest('.passage-container');
        if (!container) return;
        const containerRect = container.getBoundingClientRect();
       
        setTooltipPosition({
          top: rect.top - containerRect.top - 10,
          left: rect.left - containerRect.left + rect.width / 2
        });
       
        setActiveTooltip({ text, explanation });
      }
    }
  };

  const handleMouseOut = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'MARK' && target.getAttribute('data-type') === 'difficult') {
      const relatedTarget = e.relatedTarget as HTMLElement;
      if (!relatedTarget || !relatedTarget.closest('.simplifier-tooltip')) {
        setActiveTooltip(null);
      }
    }
  };

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const selectAnswer = (questionId: number, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
   
    if (selectedPassage) {
      const question = selectedPassage.questions.find((q: any) => q.id === questionId);
      const isCorrect = question.correctAnswer === optionIndex;
      const currentProgress = userProgress[selectedPassage.id] || {};
      const questionsAnswered = [...new Set([...(currentProgress.questionsAnswered || []), questionId])];
      const questionsCorrect = isCorrect
        ? [...new Set([...(currentProgress.questionsCorrect || []), questionId])]
        : (currentProgress.questionsCorrect || []).filter((id: number) => id !== questionId);
     
      saveProgress(selectedPassage.id, {
        questionsAnswered,
        questionsCorrect,
        status: questionsAnswered.length === selectedPassage.questions.length ? 'completed' : 'in-progress'
      });
      
      // Auto-focus next question
      setTimeout(() => {
        if (currentQuestionIndex < selectedPassage.questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
      }, 500);
    }
  };

  const toggleEliminate = (questionId: number, optionIndex: number) => {
    setEliminated(prev => ({
      ...prev,
      [questionId]: { ...(prev[questionId] || {}), [optionIndex]: !(prev[questionId]?.[optionIndex] || false) }
    }));
  };

  const toggleHighlight = (category: string) => {
    setHighlights(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const continueReading = readingService.getAllPassages()
    .filter(p => getPassageProgress(p.id).status === 'in-progress')
    .sort((a, b) => {
      const aTime = userProgress[a.id]?.lastAccessed || '';
      const bTime = userProgress[b.id]?.lastAccessed || '';
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    })
    .slice(0, 5);

  const PassageCard: React.FC<{ passage: any; size?: string }> = ({ passage, size = 'normal' }) => {
    const [isHovered, setIsHovered] = useState(false);
    const progress = getPassageProgress(passage.id);
   
    return (
      <div
        className={`rounded-xl overflow-hidden cursor-pointer transition-all duration-300 bg-white border border-gray-200 ${
          size === 'large' ? 'h-[20.7rem]' : 'h-[19.4rem]'
        } ${isHovered ? 'card-shimmer shadow-xl z-10' : 'shadow-sm hover:shadow-md'}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => loadPassage(passage.id)}
      >
        {/* Image Section - Fills top portion */}
        <div className="h-40 relative overflow-hidden">
          <img
            src={passage.imageUrl}
            alt={passage.title}
            className="w-full h-full object-cover"
          />
          {progress.status === 'not-started' && (
            <div className="absolute top-2 right-2">
              <span className="px-2 py-1 bg-orange-500 text-white rounded-full text-xs font-medium">NEW</span>
            </div>
          )}
          {progress.status === 'completed' && progress.stars === 5 && (
            <div className="absolute top-2 right-2">
              <span className="text-2xl">🏆</span>
            </div>
          )}
        </div>
       
        {/* Content Section - Below image */}
        <div className="p-4 flex flex-col justify-between h-32">
          <div>
            {/* Title - thin and clean, positioned below image */}
            <h3 className={`font-light text-lg mb-4 line-clamp-2 leading-tight ${
              isHovered ? 'shimmer-title' : 'text-gray-900'
            }`}>
              {passage.title}
            </h3>
          </div>
          
          {/* Progress section */}
          <div className="space-y-2">
            {/* Progress bar */}
            <div className="w-full">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-light text-gray-500">Progress</span>
                <span className="text-xs font-light text-gray-700">{progress.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div
                  className="bg-green-500 rounded-full h-1 transition-all duration-500"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
            </div>
            
            {/* Accuracy */}
            {progress.accuracy > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-xs font-light text-gray-500">Accuracy</span>
                <span className="text-xs font-medium text-orange-600">{progress.accuracy}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const CategoryRow: React.FC<{ category: string; passages: any[] }> = ({ category, passages }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
   
    const scroll = (direction: string) => {
      if (scrollRef.current) {
        scrollRef.current.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' });
      }
    };
   
    return (
      <div className="mb-8">
        <h2 className={`text-2xl font-bold mb-4 flex items-center gap-2 px-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <span>📖</span>
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
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pl-6"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {passages.map(passage => (
              <div key={passage.id} className="flex-shrink-0 w-[230px]">
                <PassageCard passage={passage} />
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

  const nextPassageInCategory = () => {
    if (!selectedPassage) return null;
    const currentCategory = readingService.getPassageMetadata(selectedPassage.id)?.category;
    if (!currentCategory) return null;
    
    const categoryPassages = readingService.getPassagesByCategory(currentCategory);
    const currentIndex = categoryPassages.findIndex(p => p.id === selectedPassage.id);
    const nextIndex = (currentIndex + 1) % categoryPassages.length;
    return categoryPassages[nextIndex];
  };

  const previousPassageInCategory = () => {
    if (!selectedPassage) return null;
    const currentCategory = readingService.getPassageMetadata(selectedPassage.id)?.category;
    if (!currentCategory) return null;
    
    const categoryPassages = readingService.getPassagesByCategory(currentCategory);
    const currentIndex = categoryPassages.findIndex(p => p.id === selectedPassage.id);
    const prevIndex = (currentIndex - 1 + categoryPassages.length) % categoryPassages.length;
    return categoryPassages[prevIndex];
  };

  if (view === 'selection') {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <style dangerouslySetInnerHTML={{ __html: `
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .animate-fadeIn { animation: fadeIn 0.3s ease-in; }
          .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
          
          @keyframes shimmer {
            0% { background-position: -200px 0; }
            100% { background-position: calc(200px + 100%) 0; }
          }
          
          .shiver-text {
            background: linear-gradient(90deg, #ea580c 0%, #fb923c 50%, #ea580c 100%);
            background-size: 200px 100%;
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: shimmer 2s infinite linear;
            font-weight: bold;
            display: inline-block;
          }
          
          .card-shimmer {
            position: relative;
            overflow: hidden;
          }
          
          .card-shimmer::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, 
              transparent 0%, 
              transparent 40%, 
              rgba(234, 88, 12, 0.15) 45%, 
              rgba(192, 192, 192, 0.3) 50%, 
              rgba(234, 88, 12, 0.15) 55%, 
              transparent 60%, 
              transparent 100%);
            animation: diagonalShimmer 2s ease-in-out infinite;
            z-index: 1;
            pointer-events: none;
          }
          
          @keyframes diagonalShimmer {
            0% { transform: translate(-100%, 100%); }
            100% { transform: translate(100%, -100%); }
          }
          
          .shimmer-title {
            background: linear-gradient(90deg, #ea580c 0%, #fb923c 50%, #ea580c 100%);
            background-size: 200px 100%;
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: shimmer 2s infinite linear;
          }
        `}} />
       
        {/* Fixed Header - Full Width */}
        <div className={`fixed top-0 left-0 right-0 z-50 border-b shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="w-full px-6 py-4">
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
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">
                        <span className="shiver-text">SAT Reading</span> Practice
                      </h1>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Interactive Reading Comprehension
                      </p>
                    </div>
                  </div>
                </div>
               
                <div className={`flex items-center gap-6 backdrop-blur-sm px-6 py-3 rounded-full ${isDarkMode ? 'bg-gray-700/50' : 'bg-white/80'}`}>
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="font-bold">{stats.streak}</span>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Day Streak</span>
                  </div>
                  <div className={`w-px h-6 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span className="font-bold">{stats.avgAccuracy}%</span>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg</span>
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

        {/* Content with top padding for fixed header */}
        <div className="pt-20">
          <div className="w-full max-w-none">
            {/* Search and Filters */}
          <div className={`mb-8 backdrop-blur-sm p-4 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
            <div className="flex flex-wrap gap-8 items-center">
              <div className="w-80">
                <input
                  type="text"
                  placeholder="🔍 Search passages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full px-4 py-2 rounded-full border transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:border-orange-500' 
                      : 'bg-white text-gray-900 placeholder-gray-500 border-gray-300 focus:border-orange-500'
                  } focus:outline-none shadow-sm`}
                />
              </div>
             
              <div className="flex gap-4">
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
                <option value="Science">🔬 Science</option>
                <option value="History">📜 History</option>
                <option value="Literature">📖 Literature</option>
                <option value="Social Science">🧠 Social Science</option>
                <option value="Technology">💻 Technology</option>
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
              
              <select
                value={filterCompletion}
                onChange={(e) => setFilterCompletion(e.target.value)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white border-gray-600 focus:border-orange-500' 
                    : 'bg-white text-gray-900 border-gray-300 focus:border-orange-500'
                } focus:outline-none`}
              >
                <option value="All">All Status</option>
                <option value="Completed">Completed</option>
                <option value="Not Completed">Not Completed</option>
              </select>

              {(searchTerm || filterCategory !== 'All' || filterDifficulty !== 'All' || filterCompletion !== 'All') && (
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCategory('All');
                    setFilterDifficulty('All');
                    setFilterCompletion('All');
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Clear Filters
                </Button>
              )}
              </div>
            </div>
           
            <div className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Showing {filteredPassages.length} of {readingService.getAllPassages().length} passages
            </div>
          </div>

          {continueReading.length > 0 && (
            <div className="mb-8">
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>📚 Continue Reading</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 px-6">
                {continueReading.map(passage => (
                  <PassageCard key={passage.id} passage={passage} />
                ))}
              </div>
            </div>
          )}

          {Object.keys(filteredCategorized).length === 0 ? (
            <div className="text-center py-16">
              <p className={`text-2xl mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No passages found</p>
              <p className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>Try adjusting your search or filters</p>
            </div>
          ) : (
            Object.entries(filteredCategorized).map(([category, passages]) => (
              <CategoryRow key={category} category={category} passages={passages} />
            ))
          )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Header - Full Width */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="w-full px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setView('selection')} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Passages
              </Button>
              
              {/* Navigation within category */}
              <div className="flex items-center gap-2 border-l pl-4 ml-4">
                <Button
                  onClick={() => {
                    const prev = previousPassageInCategory();
                    if (prev) loadPassage(prev.id);
                  }}
                  variant="outline"
                  size="sm"
                  disabled={!previousPassageInCategory()}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm px-2 text-gray-600">
                  {selectedPassage && readingService.getPassageMetadata(selectedPassage.id)?.category}
                </span>
                <Button
                  onClick={() => {
                    const next = nextPassageInCategory();
                    if (next) loadPassage(next.id);
                  }}
                  variant="outline"
                  size="sm"
                  disabled={!nextPassageInCategory()}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              {/* SAT Reading title with shiver effect */}
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-light text-gray-900">
                  <span className="shiver-text">SAT Reading</span>
                </h2>
              </div>
            </div>
           
            <div className="flex items-center gap-4">
              {/* Highlight Toggles */}
              <div className="flex gap-2">
                {highlightCategories.map(cat => (
                  <Button
                    key={cat.id}
                    onClick={() => toggleHighlight(cat.id)}
                    variant="outline"
                    size="sm"
                    className={`text-sm font-medium transition-all ${
                      highlights[cat.id as keyof typeof highlights]
                        ? 'bg-orange-100 text-orange-800 border-orange-400 hover:bg-orange-200'
                        : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {highlights[cat.id as keyof typeof highlights] ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                    {cat.label}
                  </Button>
                ))}
              </div>
             
              <div className="flex items-center gap-2">
                {isTimerRunning ? (
                  <Pause className="w-5 h-5 text-red-500 cursor-pointer" onClick={() => setIsTimerRunning(false)} />
                ) : (
                  <Play className="w-5 h-5 text-green-500 cursor-pointer" onClick={() => setIsTimerRunning(true)} />
                )}
                <Clock className="w-4 h-4" />
                <span className="font-mono">{formatTime(timer)}</span>
              </div>
             
              <Button 
                onClick={() => setShowSettings(!showSettings)} 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Font
              </Button>
            </div>
          </div>

          {showSettings && (
            <div className="mt-4 pt-4 border-t flex gap-4">
              <div>
                <label className="text-sm block mb-1">Font</label>
                <select 
                  value={fontFamily} 
                  onChange={(e) => setFontFamily(e.target.value)} 
                  className="px-3 py-1 border rounded"
                >
                  {fontOptions.map(font => <option key={font} value={font}>{font}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm block mb-1">Size</label>
                <select 
                  value={fontSize} 
                  onChange={(e) => setFontSize(e.target.value)} 
                  className="px-3 py-1 border rounded"
                >
                  {fontSizeOptions.map(size => <option key={size.value} value={size.value}>{size.label}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Content with top padding for fixed header */}
      <div className="pt-16">
        <div className="w-full flex h-[calc(100vh-4rem)] relative">
          {/* Reading Panel */}
          <div className="p-6 border-r border-gray-200 overflow-y-auto" style={{ width: `${passageWidth}%` }}>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              {selectedPassage?.title}
            </h3>
            <div className="passage-container relative">
              <div
                className="p-4 whitespace-pre-wrap leading-relaxed text-gray-900 bg-white"
                style={{ fontFamily, fontSize }}
                dangerouslySetInnerHTML={{ __html: getDisplayTextContent() }}
                onMouseOver={handleMouseOver}
                onMouseOut={handleMouseOut}
              />
             
              {activeTooltip && (
                <div
                  className="simplifier-tooltip absolute z-50 rounded-lg shadow-2xl border p-4 bg-white border-gray-200"
                  style={{
                    top: `${tooltipPosition.top}px`,
                    left: `${tooltipPosition.left}px`,
                    transform: 'translate(-50%, -100%)',
                    maxWidth: '320px'
                  }}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  <div className="mb-2">
                    <span className="font-semibold text-orange-600 text-sm">{activeTooltip.text}</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {activeTooltip.explanation}
                  </p>
                  <div 
                    className="absolute w-3 h-3 border-b border-r bg-white border-gray-200" 
                    style={{ bottom: '-6px', left: '50%', transform: 'translateX(-50%) rotate(45deg)' }} 
                  />
                </div>
              )}
            </div>
          </div>

          {/* Resizer */}
          <div 
            className="w-1 bg-gray-300 hover:bg-orange-400 cursor-col-resize transition-colors flex items-center justify-center group"
            onMouseDown={(e) => {
              setIsResizing(true);
              const startX = e.clientX;
              const startWidth = passageWidth;
              
              const handleMouseMove = (e: MouseEvent) => {
                const deltaX = e.clientX - startX;
                const containerWidth = window.innerWidth;
                const newWidth = startWidth + (deltaX / containerWidth) * 100;
                setPassageWidth(Math.max(30, Math.min(80, newWidth)));
              };
              
              const handleMouseUp = () => {
                setIsResizing(false);
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          >
            <GripVertical className="w-3 h-3 text-gray-500 group-hover:text-orange-500 transition-colors" />
          </div>
          
          {/* Questions Panel */}
          <div className="flex-1 p-6 bg-white flex flex-col" style={{ width: `${100 - passageWidth}%` }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="p-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 min-w-[60px] text-center">
                  {currentQuestionIndex + 1} of {selectedPassage?.questions.length || 0}
                </span>
                <button
                  onClick={() => setCurrentQuestionIndex(Math.min((selectedPassage?.questions.length || 1) - 1, currentQuestionIndex + 1))}
                  disabled={currentQuestionIndex >= (selectedPassage?.questions.length || 1) - 1}
                  className="p-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {selectedPassage?.questions.map((q: any, idx: number) => {
                if (idx !== currentQuestionIndex) return null;
                const typeInfo = questionTypes.find(t => t.value === q.type);
                const isCorrect = answers[q.id] === q.correctAnswer;
                const hasAnswered = answers[q.id] !== undefined;
               
                return (
                  <div key={q.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex gap-2 mb-2">
                      <span className="font-bold text-orange-600">{idx + 1}.</span>
                      <div className="flex-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs ${typeInfo?.color} mb-2`}>
                          {typeInfo?.label}
                        </span>
                        <p className="text-sm mb-2 text-gray-800">{q.text}</p>
                       
                        <div className="space-y-1">
                          {q.options.map((opt: string, optIdx: number) => {
                            const isEliminated = eliminated[q.id]?.[optIdx];
                            const isSelected = answers[q.id] === optIdx;
                            const isThisCorrect = q.correctAnswer === optIdx;
                           
                            return (
                              <div
                                key={optIdx}
                                className={`flex items-center gap-2 p-2 rounded border transition-colors ${
                                  isEliminated ? 'opacity-50 line-through' :
                                  isSelected && hasAnswered && isCorrect ? 'bg-green-100 border-green-400' :
                                  isSelected && hasAnswered ? 'bg-red-100 border-red-400' :
                                  isSelected ? 'bg-orange-100 border-orange-400' : 
                                  'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <Button
                                  onClick={() => toggleEliminate(q.id, optIdx)}
                                  variant="ghost"
                                  size="sm"
                                  className="p-1 h-auto"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                                <button 
                                  onClick={() => selectAnswer(q.id, optIdx)} 
                                  className="flex-1 text-left text-sm text-gray-800"
                                >
                                  <span className="font-medium">{String.fromCharCode(65 + optIdx)}.</span> {opt}
                                </button>
                                {hasAnswered && isThisCorrect && <Check className="w-4 h-4 text-green-600" />}
                              </div>
                            );
                          })}
                        </div>
                       
                        {!showHint[q.id] && (
                          <Button
                            onClick={() => setShowHint(prev => ({ ...prev, [q.id]: true }))}
                            className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white"
                            size="sm"
                          >
                            <Lightbulb className="w-3 h-3 mr-1" />
                            Hint
                          </Button>
                        )}
                       
                        {showHint[q.id] && (
                          <div className="mt-2 p-2 rounded text-xs border-l-4 border-orange-500 bg-orange-50 text-gray-700">
                            <p className="font-semibold text-orange-600 mb-1 flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              HINT
                            </p>
                            <p>{q.hint}</p>
                          </div>
                        )}
                       
                        {hasAnswered && (
                          <div className={`mt-2 p-2 rounded text-xs ${
                            isCorrect 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {isCorrect ? '✓ Correct!' : `✗ Incorrect. Answer: ${String.fromCharCode(65 + q.correctAnswer)}`}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingAssistant;