import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, Check, X, Loader2, Sun, Moon, Copy, FileText,
  Bold, Italic, Underline, Link, AlignLeft, AlignCenter, 
  AlignRight, List, ListOrdered, IndentDecrease, IndentIncrease,
  Palette, MoveVertical, Clock, Award, ArrowLeft, Target, BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { aiGrammarService } from '@/services/aiGrammarService';
import { CorrectionMark, SATWritingScore } from '@/types/WritingInterface';
import EssayCorrection from './EssayCorrection';

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
  const [suggestions, setSuggestions] = useState<CorrectionMark[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLineSpacing, setShowLineSpacing] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<CorrectionMark | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0, isBelow: false });
  const [satScore, setSatScore] = useState<SATWritingScore | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

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

  const categories = [
    { id: 'all', label: 'All', color: 'bg-orange-500' },
    { id: 'grammar', label: 'Grammar', color: 'bg-blue-500' },
    { id: 'spelling', label: 'Spelling', color: 'bg-red-500' },
    { id: 'punctuation', label: 'Punctuation', color: 'bg-yellow-500' },
    { id: 'style', label: 'Style', color: 'bg-green-500' },
    { id: 'clarity', label: 'Clarity', color: 'bg-indigo-500' }
  ];

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000'
  ];

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

  const lineSpacings = [
    { value: '1', label: '1.0' },
    { value: '1.15', label: '1.15' },
    { value: '1.5', label: '1.5' },
    { value: '2', label: '2.0' }
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
      
      setActiveTooltip(null);
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      const marks = tempDiv.querySelectorAll('mark');
      marks.forEach(mark => {
        const textNode = document.createTextNode(mark.textContent || '');
        mark.parentNode?.replaceChild(textNode, mark);
      });
      
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

  // Analyze text
  const analyzeText = async () => {
    if (!text.trim()) {
      setError('Please enter some text to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setSuggestions([]);

    try {
      const result = await aiGrammarService.analyzeEssay(text);
      setSuggestions(result.corrections);
      setSatScore(result.satScore);
      setAnalysisComplete(true);
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze text. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Apply suggestion
  const applySuggestion = (suggestion: CorrectionMark) => {
    if (!editorRef.current) return;
    
    let content = editorRef.current.innerHTML;
    content = content.replace(/<mark[^>]*>(.*?)<\/mark>/g, '$1');
    
    const issueText = suggestion.originalText;
    const replacementText = suggestion.correctedText;
    
    if (content.includes(issueText)) {
      content = content.replace(issueText, replacementText);
      editorRef.current.innerHTML = content;
      updateContent();
      
      setSuggestions(suggestions.filter(s => s.id !== suggestion.id));
      
      if (activeTooltip && activeTooltip.id === suggestion.id) {
        setActiveTooltip(null);
      }
    }
  };

  // Dismiss suggestion
  const dismissSuggestion = (suggestion: CorrectionMark) => {
    setSuggestions(suggestions.filter(s => s.id !== suggestion.id));
    if (activeTooltip && activeTooltip.id === suggestion.id) {
      setActiveTooltip(null);
    }
  };

  const filteredSuggestions = activeCategory === 'all' 
    ? suggestions 
    : suggestions.filter(s => s.type === activeCategory);

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.color : 'bg-gray-500';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const wordCount = text.trim() ? text.trim().split(/\\s+/).length : 0;

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
          ? isDarkMode ? 'bg-orange-600 text-white' : 'bg-orange-500 text-white'
          : isDarkMode 
            ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
            : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  const ToolbarSeparator = () => (
    <div className={`w-px h-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
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
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SAT Writing Editor</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Professional Writing Analysis</p>
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

      <div className="container mx-auto px-4 py-6">
        {/* Prompt Section */}
        {prompt && (
          <div className={`rounded-xl shadow-lg p-6 mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-orange-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Writing Prompt</h2>
            </div>
            
            {prompt.passage && (
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Passage:</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {prompt.passage}
                </p>
              </div>
            )}
            
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <h3 className="font-medium text-orange-900 dark:text-orange-300 mb-2">Question:</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {prompt.question}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Editor Panel */}
          <div className={`xl:col-span-2 rounded-xl shadow-lg p-6 relative ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Your Essay
              </h2>
              <div className="flex gap-2">
                <Button
                  onClick={analyzeText}
                  disabled={isAnalyzing || !text.trim()}
                  className={`${
                    isAnalyzing || !text.trim()
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze Essay
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Formatting Toolbar */}
            <div className={`flex flex-wrap items-center gap-1 p-2 mb-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-300'
            }`}>
              <select
                onChange={(e) => formatText('fontName', e.target.value)}
                defaultValue="Times New Roman"
                className={`px-2 py-1 rounded text-sm ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 border-gray-600' 
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
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
                className={`px-2 py-1 rounded text-sm ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 border-gray-600' 
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
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
            
            {/* Rich Text Editor */}
            <div
              ref={editorRef}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onInput={updateContent}
              onPaste={handlePaste}
              className={`w-full h-96 p-4 rounded-lg border transition-colors overflow-y-auto focus:outline-none focus:ring-2 ${
                isDarkMode 
                  ? 'bg-gray-900 border-gray-700 text-white focus:ring-orange-500' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-orange-400'
              }`}
              style={{ 
                minHeight: '24rem',
                fontFamily: 'Times New Roman, serif',
                fontSize: '16px',
                lineHeight: '1.5'
              }}
              placeholder="Start writing your essay here..."
            />
            
            <div className="mt-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {text.length} characters • {wordCount} words
                </span>
                {prompt?.expectedLength && (
                  <span className={`text-xs px-2 py-1 rounded ${
                    wordCount >= 400 && wordCount <= 600 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    Target: {prompt.expectedLength}
                  </span>
                )}
              </div>
              
              {onSubmit && (
                <Button
                  onClick={() => onSubmit(text, timeSpent)}
                  disabled={!text.trim()}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                >
                  Submit Essay
                </Button>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Analysis Panel */}
          <div className={`rounded-xl shadow-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-orange-500" />
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Writing Analysis
              </h2>
            </div>

            {/* SAT Score Display */}
            {satScore && (
              <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {satScore.total}/100
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">SAT Writing Score</div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Grammar:</span>
                    <span className="text-sm font-medium">{satScore.traits.grammar}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Structure:</span>
                    <span className="text-sm font-medium">{satScore.traits.structure}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Concision:</span>
                    <span className="text-sm font-medium">{satScore.traits.concision}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Rhetoric:</span>
                    <span className="text-sm font-medium">{satScore.traits.rhetoric}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    activeCategory === category.id
                      ? `${category.color} text-white`
                      : isDarkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                  {suggestions.filter(s => category.id === 'all' || s.type === category.id).length > 0 && (
                    <span className="ml-1">
                      ({suggestions.filter(s => category.id === 'all' || s.type === category.id).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Suggestions List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredSuggestions.length === 0 ? (
                <div className={`text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {suggestions.length === 0 
                    ? 'Click "Analyze Essay" to get writing suggestions'
                    : 'No suggestions in this category'}
                </div>
              ) : (
                filteredSuggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.id}
                    className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                      isDarkMode 
                        ? 'bg-gray-900 border-gray-700 hover:border-gray-600' 
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(suggestion.type)}`}>
                        {suggestion.type}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => applySuggestion(suggestion)}
                          className="p-1 rounded hover:bg-green-500/20 text-green-500 transition-colors"
                          title="Apply suggestion"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => dismissSuggestion(suggestion)}
                          className="p-1 rounded hover:bg-red-500/20 text-red-500 transition-colors"
                          title="Dismiss"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`line-through ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                          {suggestion.originalText}
                        </span>
                        <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>→</span>
                        <span className={`font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                          {suggestion.correctedText}
                        </span>
                      </div>
                      
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {suggestion.explanation}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Analysis Results */}
        {analysisComplete && suggestions.length > 0 && (
          <div className="mt-6">
            <EssayCorrection
              originalEssay={text}
              corrections={suggestions}
              satScore={satScore || undefined}
              overallFeedback={{
                strengths: ["Essay analyzed by SAT Writing AI"],
                weaknesses: ["Review highlighted corrections for improvements"],
                suggestions: ["Apply suggested changes to strengthen your writing"]
              }}
              onCorrectionApply={(id) => {
                const suggestion = suggestions.find(s => s.id === id);
                if (suggestion) applySuggestion(suggestion);
              }}
              onCorrectionReject={(id) => {
                const suggestion = suggestions.find(s => s.id === id);
                if (suggestion) dismissSuggestion(suggestion);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SATWritingEditor;