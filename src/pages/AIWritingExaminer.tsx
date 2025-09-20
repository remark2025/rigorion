import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Clock, FileText, Bot, CheckCircle, Award, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EssayCorrection from '@/components/writing/EssayCorrection';
import { aiGrammarService } from '@/services/aiGrammarService';
import { CorrectionMark, SATWritingScore } from '@/types/WritingInterface';

const AIWritingExaminer: React.FC = () => {
  const navigate = useNavigate();
  const [studentEssay, setStudentEssay] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [corrections, setCorrections] = useState<CorrectionMark[]>([]);
  const [satScore, setSatScore] = useState<SATWritingScore | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const latestEssayRef = useRef(studentEssay);

  const resetAnalysisState = useCallback(() => {
    setCorrections([]);
    setSatScore(null);
    setAnalysisComplete(false);
  }, []);

  const handleEssayChange = useCallback((value: string) => {
    latestEssayRef.current = value;
    setStudentEssay(value);
    resetAnalysisState();
  }, [resetAnalysisState]);

  // Sample essay for quick testing
  const sampleEssay = `Social media has become a integral part of modern communication, fundamentally reshaping how we interact and consume information. While these platforms offer remarkable benefits in connecting people and democratizing access to knowledge, I believe that the mental health risks, particularly for teenagers, outweigh these advantages and require immediate attention.

The evidence linking social media use to mental health problems are compelling and growing. Research from Stanford University demonstrates that teenagers who spend more than three hours daily on social media platforms show significantly higher rates of anxiety and depression. The constant exposure to carefully curated content creates unrealistic standards and promotes harmful social comparison.

Furthermore, social media algorithms are designed to maximize engagement, often amplifying controversial or emotionally charged content that can increase stress and anxiety. The platforms profit from keeping users engaged, regardless of the psychological cost. This business model inherently conflicts with user wellbeing, creating an environment where mental health concerns are secondary to revenue generation.

However, critics argue that social media provides valuable benefits that justify its continued use. These platforms enable people to maintain meaningful relationships across geographic boundaries, access educational resources, and find supportive communities around shared interests or challenges.

In conclusion, although social media offers legitimate advantages in communication and access to information, the mounting evidence of its negative impact on mental health, particularly among vulnerable teenage populations, suggests that these risks outweigh the benefits.`;

  const handleAnalyzeEssay = async () => {
    const trimmedEssay = studentEssay.trim();
    if (!trimmedEssay) return;

    const essaySnapshot = studentEssay;
    setIsAnalyzing(true);
    try {
      const result = await aiGrammarService.analyzeEssay(essaySnapshot);
      if (latestEssayRef.current !== essaySnapshot) {
        return;
      }
      setCorrections(result.corrections);
      setSatScore(result.satScore);
      setAnalysisComplete(true);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUseSample = () => {
    handleEssayChange(sampleEssay);
  };

  const handleClearEssay = () => {
    handleEssayChange('');
  };

  const normalizedEssay = studentEssay.trim();
  const wordCount = normalizedEssay ? normalizedEssay.split(/\s+/).length : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
              <div>
                <h1 className="text-2xl font-bold">🤖 AI Writing Examiner</h1>
                <p className="text-sm text-gray-600">Professional SAT Writing Analysis</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Bot className="h-4 w-4" />
                Google Gemma AI
              </Badge>
              {wordCount > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {wordCount} words
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Writing Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Write Your Essay
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUseSample}
                  disabled={isAnalyzing}
                >
                  Use Sample Essay
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearEssay}
                  disabled={isAnalyzing}
                >
                  Clear
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                value={studentEssay}
                onChange={(e) => handleEssayChange(e.target.value)}
                placeholder="Paste or type your essay here for AI analysis..."
                className="min-h-[300px] text-base leading-relaxed"
              />
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {wordCount > 0 ? `${wordCount} words` : 'Start typing...'}
                  {wordCount > 0 && (
                    <span className={`ml-2 ${
                      wordCount >= 300 && wordCount <= 600 
                        ? 'text-green-600' 
                        : wordCount < 300 
                          ? 'text-yellow-600' 
                          : 'text-red-600'
                    }`}>
                      {wordCount < 300 ? '(Too short)' : 
                       wordCount > 600 ? '(Too long)' : 
                       '(Good length)'}
                    </span>
                  )}
                </div>
                
                <Button
                  onClick={handleAnalyzeEssay}
                  disabled={!studentEssay.trim() || isAnalyzing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Bot className="h-4 w-4 mr-2" />
                      Get AI Analysis
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {(isAnalyzing || analysisComplete) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-500" />
                AI Writing Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isAnalyzing ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Your Essay</h3>
                  <p className="text-gray-600">AI is examining grammar, structure, word choice, and SAT Writing conventions...</p>
                </div>
              ) : analysisComplete ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="text-green-800 font-medium">
                        ✅ Analysis Complete! Found {corrections.length} areas for improvement.
                      </p>
                      {satScore && (
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          {satScore.total}/100
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={resetAnalysisState}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Analyze Again
                    </Button>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}

        {/* AI Corrections Display */}
        {analysisComplete && (
          <EssayCorrection
            originalEssay={studentEssay}
            corrections={corrections}
            satScore={satScore || undefined}
            overallFeedback={{
              strengths: ["Essay analyzed by AI writing examiner"],
              weaknesses: ["Review highlighted corrections for improvements"],
              suggestions: ["Apply suggested changes to strengthen your writing"]
            }}
            onCorrectionApply={(id) => console.log('Applied correction:', id)}
            onCorrectionReject={(id) => console.log('Rejected correction:', id)}
          />
        )}

        {/* Usage Instructions */}
        {!studentEssay && !analysisComplete && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">1. Write or Paste</h3>
                    <p className="text-gray-600">Enter your essay (300-600 words recommended)</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
                    <Bot className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">2. AI Analysis</h3>
                    <p className="text-gray-600">Get instant feedback on grammar, style, and structure</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 rounded-full p-2 flex-shrink-0">
                    <Award className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">3. Improve</h3>
                    <p className="text-gray-600">Apply corrections and see your SAT Writing score</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Demo Information */}
      <div className="mt-12 bg-blue-50 border-t border-blue-200">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              🤖 AI Writing Examiner
            </h3>
            <p className="text-blue-700 text-sm">
              Powered by Google Gemma AI - Professional-grade writing analysis 
              focused on SAT Writing standards and conventions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIWritingExaminer;