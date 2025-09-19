import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import EssayCorrection, { CorrectionMark } from './EssayCorrection';
import { FileText, Eye, Edit3, Clock, Users } from 'lucide-react';

interface SampleWritingQuestionDemoProps {
  className?: string;
}

const SampleWritingQuestionDemo: React.FC<SampleWritingQuestionDemoProps> = ({ className = "" }) => {
  const [activeTab, setActiveTab] = useState<"question" | "student-answer" | "corrections">("question");
  const [showAnswered, setShowAnswered] = useState(false);

  // SAT Writing Question
  const sampleQuestion = {
    id: "writing_001",
    type: "essay" as const,
    prompt: "Technology and Human Connection",
    instruction: "Read the passage below and write an essay in which you explain how the author builds an argument to persuade the audience that social media, despite its benefits, is fundamentally changing human relationships in concerning ways. In your essay, analyze how the author uses one or more of the features listed in the box above (or features of your own choice) to strengthen the logic and persuasiveness of the argument. Be sure that your analysis focuses on the most relevant features of the passage.",
    passage: `In an era where we can instantly connect with anyone, anywhere in the world, we are ironically becoming more isolated than ever before. Social media platforms, once heralded as revolutionary tools for bringing people together, have created a paradox of connection that threatens the very fabric of human relationships.

Consider this: the average American now spends over 2.5 hours daily on social media platforms, yet reports of loneliness and depression have reached unprecedented levels. We have more "friends" and "followers" than ever before, but fewer deep, meaningful relationships. This isn't mere coincidence—it's the inevitable result of substituting quantity for quality in our social interactions.

The architecture of social media platforms is designed to maximize engagement, not meaningful connection. These platforms use sophisticated algorithms that create echo chambers, showing us content that confirms our existing beliefs and isolating us from diverse perspectives. We're not connecting with others; we're connecting with digital mirrors of ourselves.

Moreover, the performative nature of social media has transformed authentic relationships into carefully curated exhibitions. We present idealized versions of ourselves, hiding our vulnerabilities and struggles behind filtered photos and crafted posts. This creates a culture of comparison and inadequacy, where real human connection—with all its messiness and imperfection—becomes increasingly rare.

The solution isn't to abandon technology entirely, but to recognize its limitations and intentionally cultivate genuine human connections. We must resist the allure of digital validation and instead invest in relationships that exist beyond the screen.`,
    timeLimit: 50, // minutes
    wordLimit: 650,
    rubric: {
      reading: "Understanding of source text",
      analysis: "Analysis of author's use of evidence, reasoning, and stylistic elements", 
      writing: "Cohesive written response with precise language"
    }
  };

  // Student's essay response with common errors
  const studentEssay = `In todays digital world, social media has become a big part of our lifes. The author makes several good points about how these platforms effect human relationships. I agree with there argument that social media is changing how we connect with others, but not always in good ways.

The author uses statistics to show that Americans spend alot of time on social media but still feel lonely. This is a strong piece of evidence because it shows the paradox the author is talking about. When people spend 2.5 hours daily on these platforms but still feel isolated, it proves that digital connections are not the same as real ones. The author also mentions that we have more friends online but less meaningful relationships.

Another technique the author uses is talking about algorithms and echo chambers. This is important because it shows how social media companies design their platforms to keep us engaged rather then helping us form real connections. The echo chambers make us only see content that we already agree with, which doesn't help us grow or learn from others. Its like being in a bubble where everyone thinks exactly like you.

The author also discusses how social media makes people perform instead of being authentic. People post perfect pictures and hide their real problems, which creates a culture of comparison. This really resonates with me because I see this all the time on Instagram and Facebook. Everyone looks so happy and successful online, but that's probably not the whole truth.

The authors solution is reasonable - we don't need to completely stop using technology, but we should recognize it's limitations. We need to focus on building real relationships that exist outside of our phones and computers. This means having face-to-face conversations and being vulnerable with people in person.

In conclusion, the author effectively uses evidence, logical reasoning, and relatable examples to convince readers that social media is harming human relationships. The combination of statistics, explanation of how platforms work, and discussion of social pressure creates a compelling argument. While social media has some benefits, we must be careful not to let it replace genuine human connection.`;

  // Detailed corrections with proper teacher-style markup
  const corrections: CorrectionMark[] = [
    {
      type: 'punctuation',
      startIndex: 2,
      endIndex: 8,
      originalText: 'todays',
      correctedText: "today's",
      explanation: 'Possessive nouns require an apostrophe. "Today\'s" shows that the digital world belongs to today.',
      grammarRule: 'Possessive Apostrophe'
    },
    {
      type: 'grammar',
      startIndex: 69,
      endIndex: 74,
      originalText: 'lifes',
      correctedText: 'lives',
      explanation: 'The plural of "life" is "lives," not "lifes." This is an irregular plural form.',
      grammarRule: 'Irregular Plurals'
    },
    {
      type: 'word_choice',
      startIndex: 149,
      endIndex: 155,
      originalText: 'effect',
      correctedText: 'affect',
      explanation: '"Affect" is a verb meaning to influence, while "effect" is a noun meaning a result. Here we need the verb.',
      grammarRule: 'Effect vs. Affect'
    },
    {
      type: 'grammar',
      startIndex: 191,
      endIndex: 196,
      originalText: 'there',
      correctedText: 'their',
      explanation: '"There" indicates location, while "their" shows possession. The argument belongs to the author.',
      grammarRule: 'Homophones: There/Their/They\'re'
    },
    {
      type: 'word_choice',
      startIndex: 286,
      endIndex: 289,
      originalText: 'big',
      correctedText: 'significant',
      explanation: 'Use more academic vocabulary. "Significant" is more precise and formal than "big."',
      grammarRule: 'Academic Word Choice'
    },
    {
      type: 'spelling',
      startIndex: 439,
      endIndex: 444,
      originalText: 'alot',
      correctedText: 'a lot',
      explanation: '"A lot" is always written as two separate words. "Alot" is not a real word.',
      grammarRule: 'Common Spelling Error'
    },
    {
      type: 'word_choice',
      startIndex: 881,
      endIndex: 885,
      originalText: 'less',
      correctedText: 'fewer',
      explanation: 'Use "fewer" with countable nouns (relationships) and "less" with uncountable nouns (time, money).',
      grammarRule: 'Fewer vs. Less'
    },
    {
      type: 'word_choice',
      startIndex: 1106,
      endIndex: 1110,
      originalText: 'then',
      correctedText: 'than',
      explanation: '"Then" refers to time sequence, while "than" is used for comparisons.',
      grammarRule: 'Then vs. Than'
    },
    {
      type: 'grammar',
      startIndex: 1244,
      endIndex: 1247,
      originalText: 'Its',
      correctedText: "It's",
      explanation: '"It\'s" is a contraction meaning "it is," while "its" is possessive. Here we mean "it is like."',
      grammarRule: 'Contractions: It\'s vs. Its'
    },
    {
      type: 'punctuation',
      startIndex: 1673,
      endIndex: 1680,
      originalText: 'authors',
      correctedText: "author's",
      explanation: 'The solution belongs to the author, so we need the possessive form with an apostrophe.',
      grammarRule: 'Possessive Apostrophe'
    },
    {
      type: 'grammar',
      startIndex: 1744,
      endIndex: 1748,
      originalText: "it's",
      correctedText: 'its',
      explanation: 'Here we need the possessive "its" (showing that limitations belong to technology), not the contraction "it\'s."',
      grammarRule: 'Possessive vs. Contraction'
    }
  ];

  const overallFeedback = {
    strengths: [
      "Clear understanding of the author's main argument and supporting evidence",
      "Good identification of rhetorical strategies (statistics, algorithms, authenticity)",
      "Personal connection to the topic shows engagement with the material",
      "Logical essay structure with introduction, body paragraphs, and conclusion",
      "Effective use of specific examples from the passage"
    ],
    weaknesses: [
      "Multiple grammar errors (subject-verb agreement, possessive forms)",
      "Common word confusions (effect/affect, then/than, its/it's)",
      "Informal language choices that weaken academic tone",
      "Some spelling and punctuation mistakes throughout",
      "Could benefit from more sophisticated vocabulary"
    ],
    suggestions: [
      "Proofread carefully for apostrophe usage in possessive nouns",
      "Review the difference between effect (noun) and affect (verb)",
      "Practice using formal academic vocabulary instead of casual language",
      "Double-check contractions vs. possessive forms (it's vs. its)",
      "Read essay aloud to catch grammatical errors before submitting",
      "Use spell-check and grammar tools as a final review step"
    ],
    score: 72
  };

  const handleAnswerQuestion = () => {
    setShowAnswered(true);
    setActiveTab("student-answer");
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              SAT Writing Sample Question - Teacher Correction Demo
            </CardTitle>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              50 minutes
            </Badge>
          </div>
          <p className="text-gray-600">
            Experience how the teacher correction system works with a realistic SAT writing question and student response.
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="question" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Question
          </TabsTrigger>
          <TabsTrigger value="student-answer" className="flex items-center gap-2" disabled={!showAnswered}>
            <Edit3 className="h-4 w-4" />
            Student Answer
          </TabsTrigger>
          <TabsTrigger value="corrections" className="flex items-center gap-2" disabled={!showAnswered}>
            <Eye className="h-4 w-4" />
            Teacher Corrections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="question" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Essay Prompt: {sampleQuestion.prompt}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {sampleQuestion.timeLimit} minutes
                </span>
                <span>{sampleQuestion.wordLimit} words max</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Instructions</h4>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {sampleQuestion.instruction}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Passage to Analyze</h4>
                <div className="bg-gray-50 p-6 rounded-lg border">
                  <div className="prose max-w-none text-sm leading-relaxed">
                    {sampleQuestion.passage.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Scoring Rubric</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h5 className="font-medium text-blue-800 mb-2">Reading (1-4)</h5>
                    <p className="text-xs text-blue-700">{sampleQuestion.rubric.reading}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h5 className="font-medium text-green-800 mb-2">Analysis (1-4)</h5>
                    <p className="text-xs text-green-700">{sampleQuestion.rubric.analysis}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h5 className="font-medium text-purple-800 mb-2">Writing (1-4)</h5>
                    <p className="text-xs text-purple-700">{sampleQuestion.rubric.writing}</p>
                  </div>
                </div>
              </div>

              {!showAnswered && (
                <div className="flex justify-center pt-4">
                  <Button onClick={handleAnswerQuestion} size="lg">
                    View Student Answer & Corrections
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="student-answer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Student's Original Essay Response
              </CardTitle>
              <p className="text-gray-600 text-sm">
                This response contains typical errors found in student essays. The teacher correction system will identify and fix these issues.
              </p>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-6 rounded-lg border">
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-base leading-relaxed">
                    {studentEssay}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between items-center text-sm text-gray-600 bg-white p-4 rounded-lg border">
                <div className="flex gap-6">
                  <span>Word Count: {studentEssay.split(' ').length} words</span>
                  <span>Estimated Time: 45 minutes</span>
                  <span>Initial Grade: C+ (72/100)</span>
                </div>
                <Button 
                  onClick={() => setActiveTab("corrections")}
                  size="sm"
                  className="ml-4"
                >
                  See Teacher Corrections
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="corrections" className="space-y-6">
          <EssayCorrection
            originalEssay={studentEssay}
            corrections={corrections}
            overallFeedback={overallFeedback}
          />
          
          <Card>
            <CardHeader>
              <CardTitle>How This Helps Students</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div>
                <strong>Real-time Learning:</strong>
                <p className="text-gray-700 mt-1">
                  Students see exactly what they did wrong and learn the grammar rules behind each correction.
                </p>
              </div>
              
              <div>
                <strong>Visual Feedback:</strong>
                <p className="text-gray-700 mt-1">
                  The strikethrough and highlighting system mimics how teachers mark papers, making corrections clear and memorable.
                </p>
              </div>

              <div>
                <strong>Comprehensive Analysis:</strong>
                <p className="text-gray-700 mt-1">
                  Students receive both specific corrections and overall feedback on strengths, weaknesses, and improvement strategies.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SampleWritingQuestionDemo;