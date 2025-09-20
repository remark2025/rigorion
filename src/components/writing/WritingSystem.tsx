import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  FileText,
  Clock,
  Download,
  Share,
  Save,
  Eye,
  Edit,
  CheckCircle
} from 'lucide-react';
import { WritingTemplate, WritingPrompt, StudentEssay, TEMPLATE_COLORS, CorrectionMark, SATWritingScore } from '@/types/WritingInterface';
import WritingTemplateSelector from './WritingTemplateSelector';
import EnhancedWritingTemplateBuilder from './EnhancedWritingTemplateBuilder';
import EssayCorrection from './EssayCorrection';
import { aiGrammarService } from '@/services/aiGrammarService';

interface WritingSystemProps {
  className?: string;
  onEssayComplete?: (essay: StudentEssay) => void;
  initialTemplate?: WritingTemplate;
  initialPrompt?: WritingPrompt;
}

type ViewMode = 'selector' | 'builder' | 'preview';

const WritingSystem: React.FC<WritingSystemProps> = ({
  className = "",
  onEssayComplete,
  initialTemplate,
  initialPrompt
}) => {
  const [currentView, setCurrentView] = useState<ViewMode>('selector');
  const [selectedTemplate, setSelectedTemplate] = useState<WritingTemplate | null>(initialTemplate || null);
  const [selectedPrompt, setSelectedPrompt] = useState<WritingPrompt | null>(initialPrompt || null);
  const [currentEssay, setCurrentEssay] = useState<Partial<StudentEssay>>({});
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showCorrections, setShowCorrections] = useState(false);
  const [corrections, setCorrections] = useState<CorrectionMark[]>([]);
  const [satScore, setSatScore] = useState<SATWritingScore | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Timer effect
  useEffect(() => {
    if (currentView === 'builder' && startTime) {
      const interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentView, startTime]);

  // Initialize with template and prompt if provided
  useEffect(() => {
    if (initialTemplate && initialPrompt) {
      setSelectedTemplate(initialTemplate);
      setSelectedPrompt(initialPrompt);
      setCurrentView('builder');
      setStartTime(new Date());
    }
  }, [initialTemplate, initialPrompt]);

  const handleTemplateSelect = (template: WritingTemplate, prompt: WritingPrompt) => {
    setSelectedTemplate(template);
    setSelectedPrompt(prompt);
    setCurrentView('builder');
    setStartTime(new Date());
  };

  const handleEssayUpdate = (essayUpdate: Partial<StudentEssay>) => {
    setCurrentEssay(prev => ({ ...prev, ...essayUpdate }));
  };

  const handleBackToSelector = () => {
    setCurrentView('selector');
    setSelectedTemplate(null);
    setSelectedPrompt(null);
    setCurrentEssay({});
    setStartTime(null);
    setTimeSpent(0);
  };

  const handlePreviewEssay = () => {
    setCurrentView('preview');
  };

  // Removed evaluation functionality for now

  const handleSaveEssay = () => {
    if (selectedTemplate && selectedPrompt) {
      const completedEssay: StudentEssay = {
        id: `essay_${Date.now()}`,
        templateId: selectedTemplate.id,
        promptId: selectedPrompt.id,
        content: currentEssay.content || '',
        sections: currentEssay.sections || {},
        wordCount: currentEssay.wordCount || 0,
        timeSpent: timeSpent,
        createdAt: new Date().toISOString(),
        status: 'completed'
      };
      
      if (onEssayComplete) {
        onEssayComplete(completedEssay);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (): string => {
    if (!selectedTemplate) return 'text-gray-600';
    const timeLimit = selectedTemplate.timeLimit * 60; // Convert to seconds
    if (timeSpent >= timeLimit) return 'text-red-600';
    if (timeSpent >= timeLimit * 0.8) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Request AI analysis of the essay
  const requestFeedback = async () => {
    if (!currentEssay.content?.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const result = await aiGrammarService.analyzeEssay(currentEssay.content);
      setCorrections(result.corrections);
      setSatScore(result.satScore);
      setAnalysisComplete(true);
      setShowCorrections(true);
    } catch (error) {
      console.error('Failed to analyze essay:', error);
      // Could show error message to user
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateOverallFeedback = (essayText: string) => {
    const wordCount = essayText.split(' ').length;
    const score = Math.min(95, Math.max(60, 75 + Math.floor(Math.random() * 20)));
    
    return {
      strengths: [
        "Clear thesis statement and essay structure",
        "Good use of examples to support arguments",
        "Appropriate length and organization"
      ],
      weaknesses: [
        "Some grammar errors that affect readability",
        "Could use more varied vocabulary",
        "Consider stronger transitional phrases"
      ],
      suggestions: [
        "Proofread for common grammar mistakes",
        "Use a thesaurus to find more precise words",
        "Practice writing complex sentences",
        "Read your essay aloud to check flow"
      ],
      score
    };
  };

  const renderHeader = () => {
    if (currentView === 'selector') return null;

    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToSelector}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h2 className="text-xl font-bold">{selectedTemplate?.name}</h2>
                <p className="text-gray-600">{selectedPrompt?.title}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {selectedTemplate && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span className={getTimeColor()}>
                    {formatTime(timeSpent)} / {selectedTemplate.timeLimit}:00
                  </span>
                </div>
              )}
              
              <div className="flex gap-2">
                {currentView === 'builder' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviewEssay}
                      disabled={!currentEssay.content?.trim()}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={requestFeedback}
                      disabled={!currentEssay.content?.trim() || isAnalyzing}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Get Feedback
                        </>
                      )}
                    </Button>
                  </>
                )}
                
                {currentView === 'preview' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentView('builder')}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    {!analysisComplete ? (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={requestFeedback}
                        disabled={isAnalyzing}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Get AI Feedback
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        variant={showCorrections ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowCorrections(!showCorrections)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {showCorrections ? 'Hide' : 'Show'} Corrections
                      </Button>
                    )}
                  </>
                )}
                
                <Button
                  size="sm"
                  onClick={handleSaveEssay}
                  disabled={!currentEssay.content?.trim()}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Essay
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'selector':
        return (
          <WritingTemplateSelector
            onTemplateSelect={handleTemplateSelect}
            className={className}
          />
        );
      
      case 'builder':
        if (!selectedTemplate || !selectedPrompt) return null;
        return (
          <EnhancedWritingTemplateBuilder
            template={selectedTemplate}
            prompt={selectedPrompt}
            onEssayUpdate={handleEssayUpdate}
            className={className}
          />
        );
      
      case 'preview':
        if (!selectedTemplate || !selectedPrompt || !currentEssay.content) return null;
        
        const feedback = generateOverallFeedback(currentEssay.content);
        
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Essay Review
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">{selectedPrompt.title}</h3>
                  <p className="text-gray-600 text-sm">{selectedPrompt.prompt}</p>
                </div>
                
                <Tabs value={showCorrections ? "corrected" : "original"} onValueChange={(value) => setShowCorrections(value === "corrected")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="original" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Original Essay
                    </TabsTrigger>
                    <TabsTrigger value="corrected" className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Teacher Corrections
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="original" className="mt-6">
                    <div className="prose max-w-none">
                      <div className="bg-white p-8 border rounded-lg shadow-sm">
                        <div className="whitespace-pre-wrap text-base leading-relaxed">
                          {currentEssay.content}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-between items-center text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                      <div className="flex gap-6">
                        <span>Word Count: {currentEssay.wordCount} words</span>
                        <span>Time Spent: {formatTime(timeSpent)}</span>
                        <span>Template: {selectedTemplate.name}</span>
                      </div>
                      <span className="text-xs">
                        Generated on {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="corrected" className="mt-6">
                    {analysisComplete && corrections.length > 0 ? (
                      <EssayCorrection
                        originalEssay={currentEssay.content}
                        corrections={corrections}
                        satScore={satScore || undefined}
                        overallFeedback={feedback}
                        onCorrectionApply={(id) => console.log('Applied correction:', id)}
                        onCorrectionReject={(id) => console.log('Rejected correction:', id)}
                      />
                    ) : (
                      <div className="text-center py-12">
                        <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Yet</h3>
                        <p className="text-gray-600 mb-4">Click "Get AI Feedback" to analyze your essay for grammar, style, and SAT Writing conventions.</p>
                        <Button
                          onClick={requestFeedback}
                          disabled={isAnalyzing}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isAnalyzing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Analyzing Essay...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Get AI Feedback
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        );
      
      
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4 py-6">
        {renderHeader()}
        {renderCurrentView()}
      </div>
    </div>
  );
};

export default WritingSystem;