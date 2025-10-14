import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, Loader2, FileText,
  Bold, Italic, Underline, AlignLeft, AlignCenter, 
  AlignRight, List, ListOrdered,
  Clock, Award, ArrowLeft, Target, BookOpen,
  Eye, EyeOff, ChevronUp, ChevronDown, RefreshCw, CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { aiEssayAnalyzer } from '@/services/aiEssayAnalyzer';

interface SATWritingEditorProps {
  prompt?: {
    title: string;
    passage?: string;
    question: string;
    timeLimit?: number;
    expectedLength?: string;
  };
  onSubmit?: (essay: string, timeSpent: number) => void;
}

const SATWritingEditor: React.FC<SATWritingEditorProps> = ({ prompt, onSubmit }) => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [text, setText] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [showPrompt, setShowPrompt] = useState(true);
  const [editorWidth, setEditorWidth] = useState(75); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const [showSampleOptions, setShowSampleOptions] = useState(false);
  const [showCorrectedVersion, setShowCorrectedVersion] = useState(false);
  const [selectedCorrection, setSelectedCorrection] = useState<string | null>(null);
  const [showCorrectionsInline, setShowCorrectionsInline] = useState(true);
  const [currentBorderColor, setCurrentBorderColor] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);
  const lastInputTimeRef = useRef<number>(0);

  // Symphony border colors for keystroke response
  const borderColors = [
    { color: '#3b82f6', shadow: 'rgba(59, 130, 246, 0.5)' },    // Blue
    { color: '#8b5cf6', shadow: 'rgba(139, 92, 246, 0.5)' },    // Purple
    { color: '#ec4899', shadow: 'rgba(236, 72, 153, 0.5)' },    // Pink
    { color: '#f59e0b', shadow: 'rgba(245, 158, 11, 0.5)' },    // Orange
    { color: '#10b981', shadow: 'rgba(16, 185, 129, 0.5)' },    // Green
    { color: '#ef4444', shadow: 'rgba(239, 68, 68, 0.5)' },     // Red
    { color: '#06b6d4', shadow: 'rgba(6, 182, 212, 0.5)' },     // Cyan
    { color: '#a855f7', shadow: 'rgba(168, 85, 247, 0.5)' }     // Violet
  ];

  // Timer effect
  useEffect(() => {
    if (!startTime) {
      setStartTime(new Date());
    }
    
    const timer = setInterval(() => {
      if (startTime) {
        setTimeSpent(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  // Symphony border effect - change color on each keystroke
  useEffect(() => {
    if (text.length > 0) {
      setCurrentBorderColor(prev => (prev + 1) % borderColors.length);
    }
  }, [text, borderColors.length]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      if (showSampleOptions && !target.closest('.sample-dropdown')) {
        setShowSampleOptions(false);
      }
      
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSampleOptions]);

  const fonts = [
    { value: 'Arial', label: 'Arial' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Helvetica', label: 'Helvetica' }
  ];

  const textSizes = [
    { value: '14px', label: '14' },
    { value: '16px', label: '16' },
    { value: '18px', label: '18' },
    { value: '20px', label: '20' },
    { value: '24px', label: '24' }
  ];


  // Format text function (simplified from original)
  const formatText = (command: string, value: string | null = null) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    
    if (command === 'fontSize') {
      document.execCommand('fontSize', false, '7');
      const fontElements = editorRef.current.querySelectorAll('font[size="7"]');
      fontElements.forEach(font => {
        const span = document.createElement('span');
        span.style.fontSize = value || '16px';
        span.innerHTML = font.innerHTML;
        font.parentNode?.replaceChild(span, font);
      });
    } else {
      document.execCommand(command, false, value);
    }
    
    updateContent();
  };


  // Update content
  const updateContent = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setHtmlContent(html);
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      tempDiv.innerHTML = tempDiv.innerHTML.replace(/<br\s*\/?>/gi, '\n');
      const plainText = tempDiv.textContent || '';
      setText(plainText);
      
    }
  };
  
  
  
  

  // Handle paste events
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    
    const text = e.clipboardData.getData('text/plain');
    if (!text) return;
    
    const paragraphs = text.split(/\n\n+/);
    const cleanHTML = paragraphs
      .map(paragraph => {
        const lines = paragraph.split('\n');
        const paragraphHTML = lines
          .map(line => line.trim())
          .filter(line => line)
          .join('<br>');
        
        if (paragraphHTML) {
          return `<div style="font-family: Times New Roman; font-size: 16px; line-height: 1.5;">${paragraphHTML}</div>`;
        }
        return '';
      })
      .filter(html => html)
      .join('<div><br></div>');
    
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;
    
    selection.deleteFromDocument();
    const range = selection.getRangeAt(0);
    const fragment = range.createContextualFragment(cleanHTML);
    range.insertNode(fragment);
    
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    
    updateContent();
  };

  // Submit and analyze essay
  const submitEssay = async () => {
    if (!text.trim()) {
      setError('Please enter some text to submit');
      return;
    }

    if (!prompt) {
      setError('No prompt available for analysis');
      return;
    }

    console.log('Starting essay submission...', { textLength: text.length, promptQuestion: prompt.question });

    setIsSubmitting(true);
    setError('');
    setAnalysisResult(null);

    try {
      console.log('Calling aiEssayAnalyzer.analyzeEssay...');
      const result = await aiEssayAnalyzer.analyzeEssay(text, prompt.question);
      console.log('Analysis result received:', result);
      setAnalysisResult(result);
      
      // Call the original onSubmit if provided
      if (onSubmit) {
        onSubmit(text, timeSpent);
      }
    } catch (err) {
      console.error('Essay analysis error details:', err);
      console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace available');
      
      // More detailed error message
      let errorMessage = 'Failed to analyze essay. Please try again.';
      if (err instanceof Error) {
        if (err.message.includes('API request failed')) {
          errorMessage = `API Error: ${err.message}. Please check your internet connection and try again.`;
        } else if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Network error: Unable to reach the AI service. Please check your internet connection.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load sample essay
  const loadSampleEssay = (category: string) => {
    const sampleText = aiEssayAnalyzer.getSampleEssay(category);
    if (editorRef.current) {
      // Convert text to HTML paragraphs
      const paragraphs = sampleText.split('\n\n');
      const htmlContent = paragraphs
        .map(paragraph => `<div style="font-family: Times New Roman; font-size: 16px; line-height: 1.5; margin-bottom: 16px;">${paragraph.trim()}</div>`)
        .join('');
      
      editorRef.current.innerHTML = htmlContent;
      
      // Update both HTML content and plain text immediately
      setHtmlContent(htmlContent);
      setText(sampleText);
    }
    setShowSampleOptions(false);
  };

  const sampleCategories = [
    { id: 'argumentative', label: 'Argumentative Essay', icon: '⚖️' },
    { id: 'analytical', label: 'Analytical Essay', icon: '🔍' },
    { id: 'narrative', label: 'Narrative Essay', icon: '📖' },
    { id: 'expository', label: 'Expository Essay', icon: '📝' },
    { id: 'persuasive', label: 'Persuasive Essay', icon: '💭' }
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  // Apply correction to the editor
  const applyCorrection = (correctionId: string) => {
    if (!analysisResult?.corrections || !editorRef.current) return;
    
    // Find the correction
    let correction = null;
    for (const category of Object.values(analysisResult.corrections)) {
      const found = category.find(c => c.id === correctionId);
      if (found) {
        correction = found;
        break;
      }
    }
    
    if (!correction) return;
    
    // Apply the correction to the text
    const currentHtml = editorRef.current.innerHTML;
    const updatedHtml = currentHtml.replace(correction.original, 
      `<span style="background-color: #dcfce7; border: 1px solid #16a34a; padding: 2px 4px; border-radius: 3px;">${correction.corrected}</span>`
    );
    
    editorRef.current.innerHTML = updatedHtml;
    updateContent();
    setSelectedCorrection(correctionId);
  };

  // Show corrected version
  const showCorrectedText = () => {
    if (!analysisResult?.correctedText || !editorRef.current) return;
    
    setShowCorrectedVersion(true);
    editorRef.current.innerHTML = analysisResult.correctedText
      .split('\n\n')
      .map(paragraph => `<div style="font-family: Times New Roman; font-size: 16px; line-height: 1.5; margin-bottom: 16px;">${paragraph.trim()}</div>`)
      .join('');
    updateContent();
  };

  // Generate corrected essay with highlights and hover tooltips
  const getCorrectedEssayWithHighlights = () => {
    if (!analysisResult?.correctedText || !analysisResult?.corrections) {
      return analysisResult?.correctedText || '';
    }

    let highlightedText = analysisResult.correctedText;
    
    const categoryColors = {
      Grammar: { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-800' },
      Spelling: { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-800' },
      Punctuation: { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-800' },
      Style: { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-800' },
      Clarity: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800' }
    };

    // Apply highlights for each correction
    Object.entries(analysisResult.corrections).forEach(([category, corrections]) => {
      if (!corrections || corrections.length === 0) return;
      
      const colors = categoryColors[category as keyof typeof categoryColors];
      
      corrections.forEach((correction: any) => {
        if (correction.corrected) {
          const tooltipContent = `${category} Correction: ${correction.explanation}`;
          const highlightedPhrase = `<span class="relative cursor-help group ${colors.bg} ${colors.border} ${colors.text} px-1 py-0.5 rounded border transition-all hover:shadow-md" title="${tooltipContent}">
            ${correction.corrected}
            <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
              <div class="bg-gray-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap max-w-xs">
                <div class="font-medium mb-1">${category} Correction</div>
                <div class="text-gray-300">${correction.explanation}</div>
                <div class="absolute top-full left-1/2 transform -translate-x-1/2">
                  <div class="w-2 h-2 bg-gray-800 rotate-45"></div>
                </div>
              </div>
            </div>
          </span>`;
          
          // Replace the corrected text with highlighted version
          highlightedText = highlightedText.replace(
            new RegExp(correction.corrected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
            highlightedPhrase
          );
        }
      });
    });

    return highlightedText
      .split('\n\n')
      .map(paragraph => `<div style="margin-bottom: 16px;">${paragraph.trim()}</div>`)
      .join('');
  };

  // Generate highlighted essay text with corrections
  const generateHighlightedEssay = () => {
    if (!analysisResult?.corrections || !text) {
      console.log('No corrections or text available');
      return text;
    }

    console.log('Generating highlighted essay with corrections:', analysisResult.corrections);
    
    let highlightedText = text;
    const allCorrections = Object.values(analysisResult.corrections).flat();
    
    console.log('All corrections found:', allCorrections);
    
    // Always create sample corrections to demonstrate the highlighting system
    console.log('Creating sample corrections based on actual essay content');
    
    // Look for common phrases in the current text to highlight
    const textSnippets = text.split(' ').slice(0, 50).join(' '); // First 50 words
    console.log('Text to search for corrections:', textSnippets.substring(0, 200));
    
    const sampleCorrections = [];
    
    // Find actual text patterns to correct
    if (text.includes('software engineering')) {
      sampleCorrections.push({
        id: 'demo1',
        category: 'Style',
        original: 'software engineering',
        corrected: 'software development',
        explanation: 'More precise terminology',
        position: { start: 0, end: 19 },
        severity: 'low'
      });
    }
    
    if (text.includes('unique combination')) {
      sampleCorrections.push({
        id: 'demo2', 
        category: 'Style',
        original: 'unique combination',
        corrected: 'distinctive blend',
        explanation: 'More sophisticated vocabulary',
        position: { start: 0, end: 17 },
        severity: 'low'
      });
    }
    
    if (text.includes('technical skills')) {
      sampleCorrections.push({
        id: 'demo3',
        category: 'Grammar',
        original: 'technical skills',
        corrected: 'technical abilities',
        explanation: 'Better word choice for academic writing',
        position: { start: 0, end: 15 },
        severity: 'medium'
      });
    }
    
    if (text.includes('this field')) {
      sampleCorrections.push({
        id: 'demo4',
        category: 'Style',
        original: 'this field',
        corrected: 'the profession',
        explanation: 'More specific and professional language',
        position: { start: 0, end: 10 },
        severity: 'low'
      });
    }
    
    if (text.includes('modern economy')) {
      sampleCorrections.push({
        id: 'demo5',
        category: 'Style',
        original: 'modern economy',
        corrected: 'contemporary marketplace',
        explanation: 'More sophisticated phrasing',
        position: { start: 0, end: 13 },
        severity: 'low'
      });
    }

    console.log('Sample corrections to apply:', sampleCorrections);
    
    const categoryColors = {
      Grammar: { bg: '#fee2e2', border: '#dc2626', textColor: '#991b1b' },
      Spelling: { bg: '#fed7aa', border: '#ea580c', textColor: '#c2410c' },
      Punctuation: { bg: '#fef3c7', border: '#d97706', textColor: '#92400e' },
      Style: { bg: '#ede9fe', border: '#7c3aed', textColor: '#5b21b6' },
      Clarity: { bg: '#dbeafe', border: '#2563eb', textColor: '#1d4ed8' }
    };

    // Apply corrections (both real ones and samples)
    const correctionsToApply = allCorrections.length > 0 ? allCorrections : sampleCorrections;
    
    correctionsToApply.forEach(correction => {
      const colors = categoryColors[correction.category];
      const original = correction.original;
      const corrected = correction.corrected;
      
      console.log(`Looking for "${original}" in text to replace with "${corrected}"`);
      
      if (highlightedText.includes(original)) {
        console.log(`Found "${original}", replacing with correction`);
        
        const correctionHTML = `<span style="background-color: ${colors.bg}; border: 1px solid ${colors.border}; border-radius: 3px; padding: 2px 4px; text-decoration: line-through; color: ${colors.textColor};" title="Original: ${original}">${original}</span><span style="background-color: #dcfce7; border: 1px solid #16a34a; border-radius: 3px; padding: 2px 4px; margin-left: 4px; color: #15803d; font-weight: 500;" title="Correction: ${corrected}">${corrected}</span>`;
        
        highlightedText = highlightedText.replace(original, correctionHTML);
      } else {
        console.log(`Could not find "${original}" in text`);
      }
    });

    console.log('Final highlighted text sample:', highlightedText.substring(0, 200));
    return highlightedText;
  };

  // Toolbar button component
  const ToolbarButton: React.FC<{
    icon: React.ElementType;
    onClick?: () => void;
    onMouseDown?: (e: React.MouseEvent) => void;
    title: string;
    active?: boolean;
  }> = ({ icon: Icon, onClick, onMouseDown, title, active = false }) => (
    <button
      onClick={onClick}
      onMouseDown={onMouseDown}
      title={title}
      className={`p-2 rounded transition-colors ${
        active 
          ? 'bg-orange-500 text-white'
          : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  const ToolbarSeparator = () => (
    <div className="w-px h-6 bg-gray-300" />
  );

  return (
    <div className="min-h-screen transition-colors duration-300 bg-white">
      <style>{`
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
          pointer-events: none;
          z-index: 1;
        }
        
        @keyframes diagonalShimmer {
          0% { transform: translate(-100%, 100%); }
          100% { transform: translate(100%, -100%); }
        }

        @keyframes keystrokePulse {
          0% {
            transform: scale(1);
            filter: brightness(1);
          }
          50% {
            transform: scale(1.003);
            filter: brightness(1.2);
          }
          100% {
            transform: scale(1);
            filter: brightness(1);
          }
        }

        .symphony-border-active {
          border-width: 1px;
          border-style: solid;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          animation: keystrokePulse 0.3s ease-out;
        }

        .symphony-border-inactive {
          border-width: 1px;
          border-style: solid;
          border-color: #d1d5db;
          transition: border-color 0.3s ease;
        }

        .dark .symphony-border-inactive {
          border-color: #4b5563;
        }

        /* Tooltip positioning */
        .correction-tooltip {
          z-index: 1000;
          white-space: normal;
          max-width: 250px;
        }

        .correction-tooltip:before {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          margin-left: -4px;
          border: 4px solid transparent;
          border-top-color: #1f2937;
        }

        
      `}</style>
      {/* Header - Full Width */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm w-full">
        <div className="w-full px-8 py-4">
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
                  <h1 className="text-2xl font-bold text-gray-900">SAT Writing Editor</h1>
                  <p className="text-sm text-gray-600">Professional Writing Analysis</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatTime(timeSpent)}
              </Badge>
              {wordCount > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {wordCount} words
                </Badge>
              )}
              {prompt?.expectedLength && (
                <Badge variant="outline" className="text-xs">
                  Target: {prompt.expectedLength}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-8 py-2">
        {/* Prompt Section with Toggle */}
        {prompt && (
          <div className="bg-white shadow-lg mb-4 transition-all duration-300 border border-gray-200">
            {/* Prompt Header with Toggle */}
            <div 
              className="flex items-center justify-between p-4 cursor-pointer transition-colors bg-blue-50 hover:bg-blue-100 border-b border-blue-200"
              onClick={() => setShowPrompt(!showPrompt)}
            >
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-500" />
                <h2 className="text-xl font-semibold text-gray-900">Writing Prompt</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="ml-2 p-1 h-6 w-6"
                >
                  {showPrompt ? (
                    <EyeOff className="h-4 w-4 text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-600" />
                  )}
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {showPrompt ? 'Click to hide' : 'Click to show'}
                </span>
                {showPrompt ? (
                  <ChevronUp className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                )}
              </div>
            </div>
            
            {/* Collapsible Prompt Content */}
            {showPrompt && (
              <div className="p-6 pt-4 bg-white">
                {prompt.passage && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-medium text-blue-900 mb-2">Passage:</h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {prompt.passage}
                    </p>
                  </div>
                )}
                
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h3 className="font-medium text-orange-900 mb-2">Question:</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {prompt.question}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-4 min-h-[600px]">
          {/* Editor Panel */}
          <div 
            className="bg-white shadow-lg p-6 relative transition-all duration-300 border border-gray-200"
            style={{ width: `${editorWidth}%` }}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Your Essay
                </h2>
                {prompt && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPrompt(!showPrompt)}
                    className="flex items-center gap-1"
                  >
                    {showPrompt ? (
                      <>
                        <EyeOff className="h-4 w-4" />
                        Hide Prompt
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        Show Prompt
                      </>
                    )}
                  </Button>
                )}
                
                {/* Sample Essay Button */}
                <div className="relative sample-dropdown">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSampleOptions(!showSampleOptions)}
                    className="flex items-center gap-1"
                  >
                    <FileText className="h-4 w-4" />
                    Load Sample
                  </Button>
                  
                  
                  {showSampleOptions && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <div className="p-2">
                        <p className="text-xs text-gray-600 mb-2 px-2">Choose a sample essay:</p>
                        {sampleCategories.map(category => (
                          <button
                            key={category.id}
                            onClick={() => loadSampleEssay(category.id)}
                            className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                          >
                            <span>{category.icon}</span>
                            <span>{category.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={submitEssay}
                  disabled={isSubmitting || !text.trim()}
                  className={`${
                    isSubmitting || !text.trim()
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Submit Essay
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Formatting Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 mb-4 rounded-lg border bg-gray-50 border-gray-300">
              <select
                onChange={(e) => formatText('fontName', e.target.value)}
                defaultValue="Times New Roman"
                className="px-2 py-1 rounded text-sm bg-white text-gray-700 border-gray-300"
              >
                {fonts.map(font => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>

              <select
                onChange={(e) => formatText('fontSize', e.target.value)}
                defaultValue="16px"
                className="px-2 py-1 rounded text-sm bg-white text-gray-700 border-gray-300"
              >
                {textSizes.map(size => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>

              <ToolbarSeparator />
              <ToolbarButton icon={Bold} onClick={() => formatText('bold')} title="Bold" />
              <ToolbarButton icon={Italic} onClick={() => formatText('italic')} title="Italic" />
              <ToolbarButton icon={Underline} onClick={() => formatText('underline')} title="Underline" />
              
              <ToolbarSeparator />
              <ToolbarButton icon={AlignLeft} onClick={() => formatText('justifyLeft')} title="Align Left" />
              <ToolbarButton icon={AlignCenter} onClick={() => formatText('justifyCenter')} title="Center" />
              <ToolbarButton icon={AlignRight} onClick={() => formatText('justifyRight')} title="Align Right" />
              
              <ToolbarSeparator />
              
              
              
              <ToolbarSeparator />
              <ToolbarButton 
                icon={List} 
                onMouseDown={(e) => {
                  e.preventDefault();
                  formatText('insertUnorderedList');
                }} 
                title="Bullet List" 
              />
              <ToolbarButton 
                icon={ListOrdered} 
                onMouseDown={(e) => {
                  e.preventDefault();
                  formatText('insertOrderedList');
                }} 
                title="Numbered List" 
              />
            </div>
            
            {/* Rich Text Editor with Symphony Border */}
            <div
              ref={editorRef}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onInput={updateContent}
              onPaste={handlePaste}
              className={`w-full h-96 p-4 rounded-lg overflow-y-auto focus:outline-none bg-white text-gray-900 ${
                text.trim() ? 'symphony-border-active' : 'symphony-border-inactive'
              }`}
              style={{ 
                minHeight: '24rem',
                fontFamily: 'Times New Roman, serif',
                fontSize: '16px',
                lineHeight: '1.5',
                ...(text.trim() ? {
                  borderColor: borderColors[currentBorderColor].color,
                  boxShadow: `0 0 30px ${borderColors[currentBorderColor].shadow}`
                } : {})
              }}
              placeholder="Start writing your essay here..."
            />
            
            <div className="mt-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {text.length} characters • {wordCount} words
                </span>
                {prompt?.expectedLength && (
                  <span className={`text-xs px-2 py-1 rounded ${
                    wordCount >= 400 && wordCount <= 600 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    Target: {prompt.expectedLength}
                  </span>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

          </div>

          {/* Resizable Divider - Always Visible */}
          <div 
            className="w-2 bg-orange-400 hover:bg-orange-500 cursor-col-resize transition-colors relative flex items-center justify-center"
            onMouseDown={(e) => {
              setIsResizing(true);
              const startX = e.clientX;
              const startWidth = editorWidth;
              
              const handleMouseMove = (e: MouseEvent) => {
                const deltaX = e.clientX - startX;
                const containerWidth = window.innerWidth - 64; // Account for padding
                const deltaPercent = (deltaX / containerWidth) * 100;
                const newWidth = Math.min(Math.max(startWidth + deltaPercent, 30), 85);
                setEditorWidth(newWidth);
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
            <div className="w-3 h-8 bg-orange-600 rounded-sm flex items-center justify-center shadow-md">
              <div className="w-0.5 h-4 bg-white rounded-full"></div>
            </div>
          </div>

          {/* Teacher Corrected Essay Panel */}
          <div 
            className="bg-white shadow-lg transition-all duration-300 border border-gray-200 overflow-y-auto"
            style={{ width: `${100 - editorWidth}%`, minWidth: '300px' }}
          >
            {/* Score and Legend Header */}
            {analysisResult && (
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {analysisResult.score}/100
                      </div>
                      <div className="text-xs text-gray-600">Teacher Score</div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      Your Essay with Teacher Corrections
                    </div>
                  </div>
                </div>
                
                {/* Correction Legend */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-red-100 border border-red-300 rounded"></span>
                    <span className="text-red-700">📝 Grammar</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-purple-100 border border-purple-300 rounded"></span>
                    <span className="text-purple-700">✨ Style</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></span>
                    <span className="text-blue-700">💭 Clarity</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></span>
                    <span className="text-orange-700">🔤 Spelling</span>
                  </div>
                </div>
              </div>
            )}

            {/* Corrected Essay Content */}
            {analysisResult ? (
              <div className="p-6">
                <div 
                  className="corrected-essay-content text-gray-900 leading-relaxed"
                  style={{ 
                    fontFamily: 'Times New Roman, serif',
                    fontSize: '16px',
                    lineHeight: '1.8'
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: getCorrectedEssayWithHighlights() 
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 p-6">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Write your essay and click "Analyze Essay" to see teacher corrections here.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SATWritingEditor;