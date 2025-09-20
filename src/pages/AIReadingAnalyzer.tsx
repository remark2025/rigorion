import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Brain, Search, Lightbulb, Bot, FileText, Target, Zap, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockReadingService } from '@/services/mockReadingAnalysis';

interface ReadingAnalysis {
  patterns: Array<{
    type: string;
    description: string;
    examples: string[];
    importance: 'high' | 'medium' | 'low';
  }>;
  simplification: {
    mainIdea: string;
    keyPoints: string[];
    summary: string;
    readingLevel: string;
  };
  ideaTracing: Array<{
    idea: string;
    development: string[];
    connections: string[];
    evidence: string[];
  }>;
  questions: Array<{
    type: string;
    question: string;
    answer: string;
    explanation: string;
  }>;
}

const AIReadingAnalyzer: React.FC = () => {
  const navigate = useNavigate();
  const [passageText, setPassageText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ReadingAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState('patterns');

  // Sample SAT reading passage
  const samplePassage = `The concept of artificial intelligence has evolved dramatically since its inception in the 1950s. What began as simple computational algorithms designed to mimic human reasoning has transformed into sophisticated systems capable of learning, adapting, and even creating original content.

Early AI research focused primarily on rule-based systems, where programmers explicitly coded instructions for every possible scenario. These expert systems, while groundbreaking for their time, were limited by their inability to handle unexpected situations or learn from new data. The breakthrough came with the development of machine learning algorithms that could identify patterns in data and improve their performance over time.

The current era of AI is dominated by deep learning neural networks, inspired by the structure of the human brain. These systems can process vast amounts of information simultaneously, recognizing complex patterns that would be impossible for traditional programming approaches. From image recognition to natural language processing, deep learning has enabled AI to tackle problems once thought to be uniquely human.

However, this rapid advancement has also raised important questions about the future relationship between humans and machines. As AI systems become more capable, concerns about job displacement, privacy, and the potential for misuse have grown. Some experts argue that we need robust ethical frameworks to guide AI development, while others believe that the benefits far outweigh the risks.

The integration of AI into daily life continues to accelerate. Smart phones use AI for voice recognition and photo organization. Streaming services employ sophisticated algorithms to recommend content. Even automobiles are beginning to incorporate AI-driven autonomous driving capabilities. This ubiquity suggests that understanding AI is no longer optional but essential for navigating the modern world.

Looking ahead, the next frontier in AI development appears to be artificial general intelligence (AGI) – systems that can understand, learn, and apply knowledge across a wide range of tasks, similar to human intelligence. While this goal remains elusive, recent advances in large language models and multimodal AI systems suggest that we may be closer than previously thought. The implications of achieving AGI would be profound, potentially revolutionizing everything from scientific research to creative endeavors.`;

  const handleAnalyzePassage = async () => {
    if (!passageText.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      // Use mock reading analysis service
      const analysisResult = await mockReadingService.analyzePassage(passageText);
      setAnalysis(analysisResult);
    } catch (error) {
      console.error('Analysis failed:', error);
      // Fallback to default analysis
      const fallbackAnalysis = mockReadingService.getInstantAnalysis('default passage');
      setAnalysis(fallbackAnalysis);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUseSample = () => {
    setPassageText(samplePassage);
  };

  const handleClearPassage = () => {
    setPassageText('');
    setAnalysis(null);
  };

  const wordCount = passageText.split(' ').filter(w => w.length > 0).length;

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
                <h1 className="text-2xl font-bold">🧠 AI Reading Analyzer</h1>
                <p className="text-sm text-gray-600">Pattern Recognition • Simplifier • Idea Tracer</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Bot className="h-4 w-4" />
                AI Powered
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
        {/* Reading Input Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Reading Passage
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUseSample}
                  disabled={isAnalyzing}
                >
                  Use Sample Passage
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearPassage}
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
                value={passageText}
                onChange={(e) => setPassageText(e.target.value)}
                placeholder="Paste or type a reading passage here for AI analysis..."
                className="min-h-[300px] text-base leading-relaxed"
              />
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {wordCount > 0 ? `${wordCount} words` : 'Paste passage...'}
                  {wordCount > 0 && (
                    <span className={`ml-2 ${
                      wordCount >= 200 && wordCount <= 800 
                        ? 'text-green-600' 
                        : wordCount < 200 
                          ? 'text-yellow-600' 
                          : 'text-red-600'
                    }`}>
                      {wordCount < 200 ? '(Too short)' : 
                       wordCount > 800 ? '(Too long)' : 
                       '(Good length)'}
                    </span>
                  )}
                </div>
                
                <Button
                  onClick={handleAnalyzePassage}
                  disabled={!passageText.trim() || isAnalyzing}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Analyze Passage
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {(isAnalyzing || analysis) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                AI Reading Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isAnalyzing ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Reading Passage</h3>
                  <p className="text-gray-600">AI is identifying patterns, simplifying concepts, and tracing key ideas...</p>
                </div>
              ) : analysis ? (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="patterns" className="flex items-center gap-1">
                      <Search className="h-4 w-4" />
                      Patterns
                    </TabsTrigger>
                    <TabsTrigger value="simplifier" className="flex items-center gap-1">
                      <Lightbulb className="h-4 w-4" />
                      Simplifier
                    </TabsTrigger>
                    <TabsTrigger value="ideas" className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      Idea Tracer
                    </TabsTrigger>
                    <TabsTrigger value="questions" className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      Questions
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="patterns" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Search className="h-5 w-5 text-blue-500" />
                        Pattern Recognition
                      </h3>
                      {analysis.patterns.map((pattern, index) => (
                        <Card key={index} className="border-l-4 border-l-blue-500">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-blue-800">{pattern.type}</h4>
                              <Badge variant={pattern.importance === 'high' ? 'default' : 'secondary'}>
                                {pattern.importance}
                              </Badge>
                            </div>
                            <p className="text-gray-700 mb-3">{pattern.description}</p>
                            <div className="bg-blue-50 p-3 rounded">
                              <p className="text-sm font-medium text-blue-800 mb-1">Examples:</p>
                              <ul className="text-sm text-blue-700 space-y-1">
                                {pattern.examples.map((example, i) => (
                                  <li key={i}>• {example}</li>
                                ))}
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="simplifier" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-green-500" />
                        Passage Simplifier
                      </h3>
                      
                      <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-4">
                          <h4 className="font-semibold text-green-800 mb-2">Main Idea</h4>
                          <p className="text-gray-700">{analysis.simplification.mainIdea}</p>
                        </CardContent>
                      </Card>

                      <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-4">
                          <h4 className="font-semibold text-green-800 mb-2">Key Points</h4>
                          <ul className="space-y-2">
                            {analysis.simplification.keyPoints.map((point, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-green-600 font-bold">{index + 1}.</span>
                                <span className="text-gray-700">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-4">
                          <h4 className="font-semibold text-green-800 mb-2">Simple Summary</h4>
                          <p className="text-gray-700">{analysis.simplification.summary}</p>
                          <div className="mt-3 flex items-center gap-2">
                            <Badge variant="outline">{analysis.simplification.readingLevel}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="ideas" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Target className="h-5 w-5 text-orange-500" />
                        Idea Tracer
                      </h3>
                      {analysis.ideaTracing.map((trace, index) => (
                        <Card key={index} className="border-l-4 border-l-orange-500">
                          <CardContent className="pt-4">
                            <h4 className="font-semibold text-orange-800 mb-3">{trace.idea}</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <h5 className="font-medium text-orange-700 mb-2">Development</h5>
                                <ul className="space-y-1">
                                  {trace.development.map((dev, i) => (
                                    <li key={i} className="text-sm text-gray-600">• {dev}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h5 className="font-medium text-orange-700 mb-2">Connections</h5>
                                <ul className="space-y-1">
                                  {trace.connections.map((conn, i) => (
                                    <li key={i} className="text-sm text-gray-600">• {conn}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h5 className="font-medium text-orange-700 mb-2">Evidence</h5>
                                <ul className="space-y-1">
                                  {trace.evidence.map((ev, i) => (
                                    <li key={i} className="text-sm text-gray-600">• {ev}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="questions" className="mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Eye className="h-5 w-5 text-purple-500" />
                        Practice Questions
                      </h3>
                      {analysis.questions.map((q, index) => (
                        <Card key={index} className="border-l-4 border-l-purple-500">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between mb-2">
                              <Badge variant="outline">{q.type}</Badge>
                            </div>
                            <h4 className="font-semibold text-purple-800 mb-2">{q.question}</h4>
                            <div className="bg-purple-50 p-3 rounded mb-3">
                              <p className="text-purple-700 font-medium">{q.answer}</p>
                            </div>
                            <p className="text-sm text-gray-600">{q.explanation}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              ) : null}
            </CardContent>
          </Card>
        )}

        {/* Usage Instructions */}
        {!passageText && !analysis && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Reading Analysis Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                    <Search className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Pattern Recognition</h3>
                    <p className="text-gray-600">Identifies structural patterns, cause-effect relationships, and organizational schemes</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
                    <Lightbulb className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Simplifier</h3>
                    <p className="text-gray-600">Breaks down complex passages into main ideas, key points, and simple summaries</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-orange-100 rounded-full p-2 flex-shrink-0">
                    <Target className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Idea Tracer</h3>
                    <p className="text-gray-600">Tracks how key ideas develop throughout the passage and connect to each other</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 rounded-full p-2 flex-shrink-0">
                    <Eye className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Practice Questions</h3>
                    <p className="text-gray-600">Generates SAT-style questions with detailed explanations and answer strategies</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Demo Information */}
      <div className="mt-12 bg-purple-50 border-t border-purple-200">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-purple-900 mb-2">
              🧠 AI Reading Analyzer
            </h3>
            <p className="text-purple-700 text-sm">
              Advanced AI analysis for reading comprehension - Pattern recognition, text simplification, 
              and idea tracing to master SAT Reading passages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIReadingAnalyzer;