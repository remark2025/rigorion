import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Brain, Search, Lightbulb, Bot, FileText, Target, Zap, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockReadingService } from '@/services/mockReadingAnalysis';
import { cn } from '@/lib/utils';

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
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute left-[15%] top-[-25%] h-80 w-80 rounded-full bg-purple-500/30 blur-3xl" />
        <div className="absolute bottom-[-15%] right-[-10%] h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
      </div>

      <header className="relative border-b border-white/10 bg-gradient-to-b from-transparent via-white/5 to-transparent">
        <div className="mx-auto w-full max-w-6xl px-6 pb-12 pt-16 text-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wider text-white/70">
              <Badge variant="secondary" className="bg-white/10 text-white">
                <Bot className="mr-1 h-3.5 w-3.5" />
                AI Powered
              </Badge>
              {wordCount > 0 && (
                <Badge variant="outline" className="border-white/20 text-white/80">
                  <FileText className="mr-1 h-3.5 w-3.5" />
                  {wordCount} words
                </Badge>
              )}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <Badge variant="outline" className="w-fit border-white/20 bg-white/10 text-white/90">
                Reading Intelligence Suite
              </Badge>
              <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
                SAT Reading AI Workbench
              </h1>
              <p className="max-w-2xl text-sm text-white/80 md:text-base">
                Paste any SAT reading passage and let the analyzer surface patterns, simplify dense language,
                and generate targeted practice questions. Built for elite reading strategy sessions.
              </p>
            </div>
            <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80 shadow-lg backdrop-blur">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-300" />
                <span>Live pattern analysis in under 10 seconds</span>
              </div>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-emerald-300" />
                <span>Auto-simplified summaries with tone + purpose insights</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-sky-300" />
                <span>Evidence-backed question breakdowns and pacing tips</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-20">
        {/* Reading Input Interface */}
        <Card className="border-none bg-white/95 shadow-xl backdrop-blur-sm">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="flex flex-wrap items-center justify-between gap-4 text-slate-900">
              <span className="flex items-center gap-2 text-base font-semibold">
                <FileText className="h-5 w-5 text-purple-500" />
                Reading Passage
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUseSample}
                  disabled={isAnalyzing}
                  className="border-slate-200 text-slate-700 transition hover:border-purple-200 hover:bg-purple-50"
                >
                  Use Sample Passage
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearPassage}
                  disabled={isAnalyzing}
                  className="border-slate-200 text-slate-700 transition hover:border-slate-200 hover:bg-slate-50"
                >
                  Clear
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <Textarea
              value={passageText}
              onChange={(e) => setPassageText(e.target.value)}
              placeholder="Paste or type a reading passage here for AI analysis..."
              className="min-h-[320px] rounded-xl border border-slate-200 bg-slate-50/60 text-base leading-relaxed shadow-inner focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
            />

            <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
              <div className="flex flex-wrap items-center gap-3 text-slate-500">
                <span>{wordCount > 0 ? wordCount + " words" : "Paste a passage to begin analysis"}</span>
                {wordCount > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      wordCount < 200 && "bg-amber-100 text-amber-700",
                      wordCount > 800 && "bg-rose-100 text-rose-700",
                      wordCount >= 200 && wordCount <= 800 && "bg-emerald-100 text-emerald-700",
                    )}
                  >
                    {wordCount < 200
                      ? "Needs more context"
                      : wordCount > 800
                        ? "Consider trimming"
                        : "Ideal length"}
                  </span>
                )}
              </div>

              <Button
                onClick={handleAnalyzePassage}
                disabled={!passageText.trim() || isAnalyzing}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-60"
              >
                {isAnalyzing ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-b-transparent" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4" />
                    Analyze Passage
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>


        {/* Analysis Results */}
        {(isAnalyzing || analysis) && (
          <Card className="border-none bg-white/95 shadow-xl backdrop-blur-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Brain className="h-5 w-5 text-purple-500" />
                AI Reading Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {isAnalyzing ? (
                <div className="space-y-3 py-10 text-center">
                  <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-purple-500/60 border-b-transparent" />
                  <h3 className="text-lg font-medium text-slate-900">Analyzing Reading Passage</h3>
                  <p className="text-sm text-slate-500">AI is identifying patterns, simplifying concepts, and tracing key ideas...</p>
                </div>
              ) : analysis ? (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4 gap-2 rounded-xl bg-slate-100 p-1">
                    <TabsTrigger value="patterns" className="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-slate-600 transition data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow">
                      <Search className="h-4 w-4" />
                      Patterns
                    </TabsTrigger>
                    <TabsTrigger value="simplifier" className="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-slate-600 transition data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow">
                      <Lightbulb className="h-4 w-4" />
                      Simplifier
                    </TabsTrigger>
                    <TabsTrigger value="ideas" className="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-slate-600 transition data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow">
                      <Target className="h-4 w-4" />
                      Idea Tracer
                    </TabsTrigger>
                    <TabsTrigger value="questions" className="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-slate-600 transition data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow">
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
          <Card className="border-none bg-white/95 shadow-lg backdrop-blur-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Brain className="h-5 w-5" />
                AI Reading Analysis Features
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
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
      </main>

      {/* Demo Information */}
      <div className="border-t border-white/10 py-12">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h3 className="text-xl font-semibold text-white">🧠 AI Reading Analyzer</h3>
          <p className="mt-3 text-sm text-slate-300">
            Advanced AI analysis for reading comprehension - pattern recognition, text simplification,
            and idea tracing to master SAT Reading passages.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIReadingAnalyzer;