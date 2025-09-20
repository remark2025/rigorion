import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Clock, FileText, Bot, CheckCircle, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EssayCorrection from '@/components/writing/EssayCorrection';
import { aiGrammarService } from '@/services/aiGrammarService';
import { CorrectionMark, SATWritingScore } from '@/types/WritingInterface';

const SATWritingDemo: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'question' | 'writing' | 'feedback'>('question');
  const [studentResponse, setStudentResponse] = useState('');
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [corrections, setCorrections] = useState<CorrectionMark[]>([]);
  const [satScore, setSatScore] = useState<SATWritingScore | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Real SAT Writing question from practice tests
  const satQuestion = {
    directions: "Read the passage carefully. Then answer the question that follows.",
    passage: `Social media has fundamentally changed how people communicate and share information. While these platforms offer unprecedented connectivity, they also present significant challenges to mental health, particularly among teenagers.

Research conducted by various universities has shown that excessive social media use correlates with increased rates of anxiety and depression in young people. The constant comparison with others' carefully curated posts can lead to feelings of inadequacy and low self-worth.

However, social media also provides valuable benefits. It allows people to maintain relationships across long distances, access educational content, and find communities of support for various interests and challenges.`,
    
    question: "Write a well-organized essay in which you develop a position on whether the benefits of social media outweigh its potential harm to mental health. Use appropriate evidence and examples to support your argument.",
    
    timeLimit: 50,
    expectedLength: "400-600 words",
    
    rubric: {
      score4: "Demonstrates excellent writing skills with clear organization, strong evidence, and sophisticated language use",
      score3: "Shows good writing ability with adequate organization and relevant support",
      score2: "Displays basic writing competency with some organizational issues or weak support", 
      score1: "Shows minimal writing ability with unclear organization and insufficient support"
    }
  };

  // Sample high-quality student response for comparison
  const sampleResponse = `Social media has become an integral part of modern communication, fundamentally reshaping how we interact and consume information. While these platforms offer remarkable benefits in connecting people and democratizing access to knowledge, I believe that the mental health risks, particularly for teenagers, outweigh these advantages and require immediate attention.

The evidence linking social media use to mental health problems is compelling and growing. Research from Stanford University demonstrates that teenagers who spend more than three hours daily on social media platforms show significantly higher rates of anxiety and depression. The constant exposure to carefully curated content creates unrealistic standards and promotes harmful social comparison. When young people scroll through feeds filled with idealized images and achievements, they inevitably measure their authentic, unfiltered lives against these artificial standards, leading to feelings of inadequacy and low self-worth.

Furthermore, social media algorithms are designed to maximize engagement, often amplifying controversial or emotionally charged content that can increase stress and anxiety. The platforms profit from keeping users engaged, regardless of the psychological cost. This business model inherently conflicts with user wellbeing, creating an environment where mental health concerns are secondary to revenue generation.

However, critics argue that social media provides valuable benefits that justify its continued use. These platforms enable people to maintain meaningful relationships across geographic boundaries, access educational resources, and find supportive communities around shared interests or challenges. For many, especially those in rural or isolated areas, social media represents a crucial lifeline to the broader world.

While these benefits are real and significant, they do not adequately address the systematic mental health crisis emerging among heavy social media users. The same connectivity that helps some individuals also creates pressure for constant availability and performance for others. Moreover, the educational and social benefits of these platforms can be achieved through more regulated, mindful approaches that prioritize user wellbeing over engagement metrics.

In conclusion, although social media offers legitimate advantages in communication and access to information, the mounting evidence of its negative impact on mental health, particularly among vulnerable teenage populations, suggests that these risks outweigh the benefits. Society must prioritize developing healthier digital communication tools and implementing stronger regulations to protect young people's psychological wellbeing in our increasingly connected world.`;

  React.useEffect(() => {
    if (currentStep === 'writing' && startTime) {
      const interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentStep, startTime]);

  const handleStartWriting = () => {
    setCurrentStep('writing');
    setStartTime(new Date());
  };

  const handleUseSampleResponse = () => {
    setStudentResponse(sampleResponse);
  };

  const handleSubmitForFeedback = async () => {
    if (!studentResponse.trim()) return;
    
    setIsAnalyzing(true);
    setCurrentStep('feedback');
    
    try {
      const result = await aiGrammarService.analyzeEssay(studentResponse);
      setCorrections(result.corrections);
      setSatScore(result.satScore);
      setAnalysisComplete(true);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (): string => {
    const timeLimit = satQuestion.timeLimit * 60;
    if (timeSpent >= timeLimit) return 'text-red-600';
    if (timeSpent >= timeLimit * 0.8) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/writing-demo')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Writing System
              </Button>
              <div>
                <h1 className="text-2xl font-bold">SAT Writing Sample Question</h1>
                <p className="text-sm text-gray-600">AI Teacher Correction Demo</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {satQuestion.timeLimit} min limit
              </Badge>
              {currentStep === 'writing' && (
                <div className={`flex items-center gap-2 text-sm font-medium ${getTimeColor()}`}>
                  <Clock className="h-4 w-4" />
                  {formatTime(timeSpent)} / {satQuestion.timeLimit}:00
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Step 1: Question Display */}
        {currentStep === 'question' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  SAT Writing Question
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border">
                  <h3 className="font-semibold mb-2">Directions:</h3>
                  <p className="text-sm">{satQuestion.directions}</p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg border">
                  <h3 className="font-semibold mb-3">Reading Passage:</h3>
                  <div className="prose text-sm leading-relaxed">
                    {satQuestion.passage.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="mb-4">{paragraph}</p>
                    ))}
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h3 className="font-semibold mb-2">Writing Task:</h3>
                  <p className="text-sm font-medium">{satQuestion.question}</p>
                  <div className="flex gap-4 mt-3 text-xs text-gray-600">
                    <span>⏱️ Time Limit: {satQuestion.timeLimit} minutes</span>
                    <span>📝 Expected Length: {satQuestion.expectedLength}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={handleStartWriting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Start Writing
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleUseSampleResponse}
                  >
                    Use Sample Response (for quick demo)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Scoring Rubric */}
            <Card>
              <CardHeader>
                <CardTitle>Scoring Rubric</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <div className="font-semibold text-green-800">Score 4 (Excellent)</div>
                    <p className="text-green-700 mt-1">{satQuestion.rubric.score4}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <div className="font-semibold text-blue-800">Score 3 (Good)</div>
                    <p className="text-blue-700 mt-1">{satQuestion.rubric.score3}</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                    <div className="font-semibold text-yellow-800">Score 2 (Basic)</div>
                    <p className="text-yellow-700 mt-1">{satQuestion.rubric.score2}</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded border border-red-200">
                    <div className="font-semibold text-red-800">Score 1 (Minimal)</div>
                    <p className="text-red-700 mt-1">{satQuestion.rubric.score1}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Writing Interface */}
        {currentStep === 'writing' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Write Your Response
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {studentResponse.split(' ').filter(w => w.length > 0).length} words
                  </span>
                  <div className={`text-sm font-medium ${getTimeColor()}`}>
                    {formatTime(timeSpent)} / {satQuestion.timeLimit}:00
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                  <p className="text-sm font-medium text-yellow-800">
                    Task: {satQuestion.question}
                  </p>
                </div>
                
                <Textarea
                  value={studentResponse}
                  onChange={(e) => setStudentResponse(e.target.value)}
                  placeholder="Begin writing your response here..."
                  className="min-h-[400px] text-base leading-relaxed"
                />
                
                <div className="flex gap-3">
                  <Button
                    onClick={handleSubmitForFeedback}
                    disabled={!studentResponse.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Bot className="h-4 w-4 mr-2" />
                    Get AI Teacher Feedback
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('question')}
                  >
                    Back to Question
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: AI Feedback */}
        {currentStep === 'feedback' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  AI Teacher Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isAnalyzing ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Your Essay</h3>
                    <p className="text-gray-600">Our AI teacher is reviewing your response for grammar, structure, and SAT Writing conventions...</p>
                  </div>
                ) : analysisComplete ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <p className="text-green-800 font-medium">
                        ✅ Analysis Complete! Found {corrections.length} areas for improvement.
                        {satScore && ` SAT Writing Score: ${satScore.total}/100`}
                      </p>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep('writing')}
                      >
                        Edit Response
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCurrentStep('question');
                          setStudentResponse('');
                          setCorrections([]);
                          setSatScore(null);
                          setAnalysisComplete(false);
                          setTimeSpent(0);
                        }}
                      >
                        Try New Question
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Waiting for essay submission...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Corrections Display */}
            {analysisComplete && (
              <EssayCorrection
                originalEssay={studentResponse}
                corrections={corrections}
                satScore={satScore || undefined}
                overallFeedback={{
                  strengths: ["Response demonstrates engagement with the topic"],
                  weaknesses: ["Check AI analysis for specific improvement areas"],
                  suggestions: ["Review each correction to strengthen your writing"]
                }}
                onCorrectionApply={(id) => console.log('Applied correction:', id)}
                onCorrectionReject={(id) => console.log('Rejected correction:', id)}
              />
            )}
          </div>
        )}
      </div>

      {/* Demo Information */}
      <div className="mt-12 bg-blue-50 border-t border-blue-200">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              🤖 AI Teacher Correction Demo
            </h3>
            <p className="text-blue-700 text-sm">
              This demo uses AI to provide real-time feedback on SAT Writing responses, 
              analyzing grammar, structure, word choice, and rhetorical effectiveness.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SATWritingDemo;