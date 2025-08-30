import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, FileText, Sparkles, Target, BookOpen, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import WritingTemplateBuilder from '@/components/writing/WritingTemplateBuilder';
import AIEvaluator from '@/components/writing/AIEvaluator';
import { writingTemplates, writingPrompts, getTemplateById, getPromptById } from '@/data/writingTemplates';
import { StudentEssay, AIEvaluation, TEMPLATE_COLORS } from '@/types/WritingInterface';

const WritingSolutionDemo: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  const [selectedTemplateId, setSelectedTemplateId] = useState('argumentative-5-paragraph');
  const [selectedPromptId, setSelectedPromptId] = useState('social-media-mental-health');
  const [currentEssay, setCurrentEssay] = useState<Partial<StudentEssay>>({});
  
  const selectedTemplate = getTemplateById(selectedTemplateId);
  const selectedPrompt = getPromptById(selectedPromptId);

  // Sample AI Evaluation for demo
  const sampleEvaluation: AIEvaluation = {
    essayId: 'demo-essay-001',
    overallScore: 3.2,
    structureScore: 3.5,
    coherenceScore: 3.0,
    developmentScore: 3.0,
    languageScore: 3.3,
    feedback: {
      strengths: [
        'Clear thesis statement with specific position',
        'Good use of template structure for organization',
        'Effective transition words between paragraphs',
        'Relevant examples support main arguments'
      ],
      improvements: [
        'Could provide more specific evidence and statistics',
        'Some custom sentences need stronger connection to thesis',
        'Counterargument section could be more detailed',
        'Conclusion could better emphasize call to action'
      ],
      specificSuggestions: [
        {
          section: 'Body Paragraph 1',
          issue: 'Missing specific evidence',
          suggestion: 'Add concrete statistics or research findings to support your claim about mental health impacts',
          example: 'Studies show that 70% of teenagers report increased anxiety when social media use exceeds 3 hours daily.'
        },
        {
          section: 'Counterargument',
          issue: 'Weak refutation',
          suggestion: 'Strengthen your counterargument by acknowledging valid points before refuting them',
          example: 'While social media can facilitate learning through educational content, the negative impacts on focus and well-being outweigh these benefits.'
        }
      ]
    },
    templateUsage: {
      sectionsCompleted: 4,
      sectionsTotal: 5,
      fixedSentencesUsed: 8,
      fixedSentencesAvailable: 15,
      transitionsUsed: ['Furthermore', 'However', 'In conclusion'],
      missingElements: ['Strong call to action', 'Additional supporting evidence']
    },
    nextSteps: [
      'Complete the conclusion section with a compelling call to action',
      'Add specific statistics to strengthen your first body paragraph',
      'Review template guidelines for the counterargument section',
      'Practice using more transition phrases from the template'
    ]
  };

  const handleEssayUpdate = (essay: Partial<StudentEssay>) => {
    setCurrentEssay(essay);
  };

  const getCompatiblePrompts = (templateId: string) => {
    return writingPrompts.filter(prompt => prompt.templateIds.includes(templateId));
  };

  if (!selectedTemplate || !selectedPrompt) {
    return <div>Loading...</div>;
  }

  const templateColors = TEMPLATE_COLORS[selectedTemplate.category];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-b shadow-sm`}>
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
              <div>
                <h1 className="text-2xl font-bold">✍️ Interactive Writing Templates</h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Master SAT writing with structured templates and AI feedback
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Demo Mode
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Introduction */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              SAT Writing Template System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Our interactive writing system provides structured templates with fixed sentence frameworks 
              to help you master SAT essay writing. Each template includes guided sentence structures, 
              transition phrases, and AI-powered evaluation to improve your writing skills.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl mb-2">🏗️</div>
                <h3 className="font-semibold mb-1">Template Builder</h3>
                <p className="text-sm text-gray-600">
                  Fixed sentence structures with custom content slots
                </p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl mb-2">🤖</div>
                <h3 className="font-semibold mb-1">AI Evaluator</h3>
                <p className="text-sm text-gray-600">
                  Intelligent feedback on structure, coherence, and development
                </p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl mb-2">📊</div>
                <h3 className="font-semibold mb-1">Progress Tracking</h3>
                <p className="text-sm text-gray-600">
                  Real-time analysis of template usage and completion
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template and Prompt Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🎯 Template & Prompt Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Writing Template</label>
                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {writingTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${TEMPLATE_COLORS[template.category].bg} ${TEMPLATE_COLORS[template.category].text}`}>
                            {template.category}
                          </Badge>
                          {template.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Writing Prompt</label>
                <Select value={selectedPromptId} onValueChange={setSelectedPromptId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getCompatiblePrompts(selectedTemplateId).map(prompt => (
                      <SelectItem key={prompt.id} value={prompt.id}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {prompt.difficulty}
                          </Badge>
                          {prompt.title}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Template Info */}
            <div className="mt-4 p-4 border rounded-lg" style={{ backgroundColor: `${templateColors.hex}10`, borderColor: templateColors.hex + '30' }}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold mb-1">{selectedTemplate.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{selectedTemplate.description}</p>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>📊 {selectedTemplate.difficulty}</span>
                    <span>⏱️ {selectedTemplate.timeLimit} minutes</span>
                    <span>📝 {selectedTemplate.estimatedLength}</span>
                  </div>
                </div>
                <Badge className={`${templateColors.bg} ${templateColors.text}`}>
                  {selectedTemplate.sections.length} Sections
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="builder" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="builder" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Template Builder
            </TabsTrigger>
            <TabsTrigger value="evaluation" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              AI Evaluation
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Resources
            </TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="mt-6">
            <WritingTemplateBuilder
              template={selectedTemplate}
              prompt={selectedPrompt}
              onEssayUpdate={handleEssayUpdate}
            />
          </TabsContent>

          <TabsContent value="evaluation" className="mt-6">
            <div className="mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    AI Writing Assessment Demo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    This demo shows how our AI evaluator provides detailed feedback on essay structure, 
                    template usage, and writing quality. In the full version, evaluation is based on your actual essay content.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <AIEvaluator evaluation={sampleEvaluation} />
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <div className="grid gap-6">
              {/* Template Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>📚 Available Template Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(TEMPLATE_COLORS).map(([category, colors]) => {
                      const categoryTemplates = writingTemplates.filter(t => t.category === category);
                      return (
                        <div key={category} className={`p-4 border rounded-lg ${colors.bg}`}>
                          <h3 className={`font-semibold mb-2 ${colors.text} capitalize`}>
                            {category.replace('-', ' & ')}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {categoryTemplates[0]?.description || 'Template category description'}
                          </p>
                          <div className="text-xs text-gray-500">
                            {categoryTemplates.length} template{categoryTemplates.length !== 1 ? 's' : ''} available
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Scoring Criteria */}
              <Card>
                <CardHeader>
                  <CardTitle>🎯 AI Evaluation Criteria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(selectedTemplate.scoringCriteria).map(([category, criteria]) => (
                      <div key={category}>
                        <h4 className="font-semibold mb-3 capitalize flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          {category}
                        </h4>
                        <ul className="space-y-2">
                          {criteria.map((criterion, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                              <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              {criterion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Transition Phrases */}
              <Card>
                <CardHeader>
                  <CardTitle>🔗 Available Transition Phrases</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(selectedTemplate.transitionPhrases).map(([type, phrases]) => (
                      <div key={type} className="border rounded-lg p-3">
                        <h4 className="font-semibold mb-2 capitalize text-sm">
                          {type.replace('_', ' ')}
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {phrases.map((phrase, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {phrase}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Technical Info */}
        <div className="mt-8 text-center">
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Built with React, TypeScript, AI evaluation, and structured template system
          </p>
        </div>
      </div>
    </div>
  );
};

export default WritingSolutionDemo;