import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  BookOpen, 
  Target, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Lightbulb,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WritingTemplate, WritingPrompt, StudentEssay, TEMPLATE_COLORS } from '@/types/WritingInterface';

interface WritingTemplateBuilderProps {
  template: WritingTemplate;
  prompt: WritingPrompt;
  onEssayUpdate?: (essay: Partial<StudentEssay>) => void;
  className?: string;
}

const WritingTemplateBuilder: React.FC<WritingTemplateBuilderProps> = ({
  template,
  prompt,
  onEssayUpdate,
  className = ""
}) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [sectionContent, setSectionContent] = useState<Record<string, {
    fixedUsed: string[];
    customContent: string[];
  }>>({});
  const [essayContent, setEssayContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);

  const colors = TEMPLATE_COLORS[template.category];
  const currentSection = template.sections[currentSectionIndex];
  const progress = ((currentSectionIndex + 1) / template.sections.length) * 100;

  // Initialize section content
  useEffect(() => {
    const initialContent: Record<string, {fixedUsed: string[]; customContent: string[]}> = {};
    template.sections.forEach(section => {
      initialContent[section.id] = {
        fixedUsed: [],
        customContent: Array(section.customSentences).fill('')
      };
    });
    setSectionContent(initialContent);
  }, [template]);

  // Update word count and essay content
  useEffect(() => {
    let fullEssay = '';
    template.sections.forEach(section => {
      const sectionData = sectionContent[section.id];
      if (sectionData) {
        // Add fixed sentences
        sectionData.fixedUsed.forEach(sentence => {
          fullEssay += sentence + ' ';
        });
        // Add custom sentences
        sectionData.customContent.forEach(custom => {
          if (custom.trim()) {
            fullEssay += custom + ' ';
          }
        });
        fullEssay += '\n\n';
      }
    });
    
    setEssayContent(fullEssay);
    setWordCount(fullEssay.trim().split(/\s+/).length);
    
    // Update parent component
    if (onEssayUpdate) {
      onEssayUpdate({
        content: fullEssay,
        sections: sectionContent,
        wordCount: fullEssay.trim().split(/\s+/).length
      });
    }
  }, [sectionContent, template.sections, onEssayUpdate]);

  const handleFixedSentenceToggle = (sentence: string) => {
    const sectionData = sectionContent[currentSection.id] || { fixedUsed: [], customContent: [] };
    const isUsed = sectionData.fixedUsed.includes(sentence);
    
    setSectionContent(prev => ({
      ...prev,
      [currentSection.id]: {
        ...sectionData,
        fixedUsed: isUsed 
          ? sectionData.fixedUsed.filter(s => s !== sentence)
          : [...sectionData.fixedUsed, sentence]
      }
    }));
  };

  const handleCustomContentChange = (index: number, content: string) => {
    const sectionData = sectionContent[currentSection.id] || { fixedUsed: [], customContent: [] };
    
    setSectionContent(prev => ({
      ...prev,
      [currentSection.id]: {
        ...sectionData,
        customContent: sectionData.customContent.map((c, i) => i === index ? content : c)
      }
    }));
  };

  const getSectionCompletionStatus = (sectionId: string) => {
    const data = sectionContent[sectionId];
    if (!data) return 'empty';
    
    const hasFixedContent = data.fixedUsed.length > 0;
    const hasCustomContent = data.customContent.some(c => c.trim().length > 0);
    
    if (hasFixedContent && hasCustomContent) return 'complete';
    if (hasFixedContent || hasCustomContent) return 'partial';
    return 'empty';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'partial': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default: return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className={`h-5 w-5 ${colors.text}`} />
                {template.name}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
            </div>
            <Badge className={`${colors.bg} ${colors.text}`}>
              {template.category}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Clock className="h-5 w-5 mx-auto mb-1 text-gray-600" />
              <div className="text-sm font-semibold">{template.timeLimit} min</div>
              <div className="text-xs text-gray-600">Time Limit</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Target className="h-5 w-5 mx-auto mb-1 text-gray-600" />
              <div className="text-sm font-semibold">{template.estimatedLength}</div>
              <div className="text-xs text-gray-600">Target Length</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <BookOpen className="h-5 w-5 mx-auto mb-1 text-gray-600" />
              <div className="text-sm font-semibold">{wordCount}</div>
              <div className="text-xs text-gray-600">Current Words</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <CheckCircle className="h-5 w-5 mx-auto mb-1 text-gray-600" />
              <div className="text-sm font-semibold">{Math.round(progress)}%</div>
              <div className="text-xs text-gray-600">Complete</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Writing Prompt */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📝 Writing Prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">{prompt.title}</h3>
            <p className="text-blue-800 leading-relaxed">{prompt.prompt}</p>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {prompt.keywords.map((keyword, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📋 Essay Structure Progress</CardTitle>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {template.sections.map((section, index) => {
              const status = getSectionCompletionStatus(section.id);
              const isActive = index === currentSectionIndex;
              
              return (
                <Button
                  key={section.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentSectionIndex(index)}
                  className={`h-auto py-3 px-2 flex flex-col items-center gap-1 ${
                    isActive ? `${colors.bg} ${colors.text}` : ''
                  }`}
                >
                  {getStatusIcon(status)}
                  <span className="text-xs font-medium">{section.name}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Section Editor */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSectionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className={`h-5 w-5 ${colors.text}`} />
                {currentSection.name}
              </CardTitle>
              <p className="text-sm text-gray-600">{currentSection.description}</p>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="builder" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="builder">🛠️ Builder</TabsTrigger>
                  <TabsTrigger value="guidelines">📋 Guidelines</TabsTrigger>
                  <TabsTrigger value="examples">💡 Examples</TabsTrigger>
                </TabsList>
                
                <TabsContent value="builder" className="space-y-4 mt-4">
                  {/* Fixed Sentences */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Template Sentences (Select to use)
                    </h4>
                    <div className="space-y-2">
                      {currentSection.fixedSentences.map((sentence, index) => {
                        const isSelected = sectionContent[currentSection.id]?.fixedUsed?.includes(sentence);
                        return (
                          <div
                            key={index}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              isSelected 
                                ? `${colors.bg} ${colors.border}` 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleFixedSentenceToggle(sentence)}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                                isSelected ? `${colors.text} ${colors.border}` : 'border-gray-300'
                              }`}>
                                {isSelected && <CheckCircle className="h-3 w-3 fill-current" />}
                              </div>
                              <span className={`text-sm ${isSelected ? colors.text : 'text-gray-700'}`}>
                                {sentence}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Sentences */}
                  {currentSection.customSentences > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Your Custom Sentences ({currentSection.customSentences} slots)
                      </h4>
                      <div className="space-y-3">
                        {Array(currentSection.customSentences).fill(0).map((_, index) => (
                          <div key={index}>
                            <label className="text-sm text-gray-600 mb-1 block">
                              Custom Sentence {index + 1}
                            </label>
                            <Textarea
                              placeholder={`Write your own sentence for the ${currentSection.name.toLowerCase()} section...`}
                              value={sectionContent[currentSection.id]?.customContent?.[index] || ''}
                              onChange={(e) => handleCustomContentChange(index, e.target.value)}
                              className="min-h-[80px] resize-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="guidelines" className="mt-4">
                  <div className="space-y-3">
                    {currentSection.guidelines.map((guideline, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="text-sm text-blue-800">{guideline}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="examples" className="mt-4">
                  <div className="space-y-3">
                    {currentSection.examples.map((example, index) => (
                      <div key={index} className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                        <span className="text-sm text-green-800 font-medium">Example {index + 1}:</span>
                        <p className="text-sm text-green-700 mt-1">{example}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentSectionIndex(Math.max(0, currentSectionIndex - 1))}
          disabled={currentSectionIndex === 0}
        >
          Previous Section
        </Button>
        
        <Button
          onClick={() => setCurrentSectionIndex(Math.min(template.sections.length - 1, currentSectionIndex + 1))}
          disabled={currentSectionIndex === template.sections.length - 1}
          className={colors.bg}
        >
          Next Section
        </Button>
      </div>

      {/* Essay Preview */}
      {essayContent.trim() && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Essay Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 border rounded-lg">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {essayContent}
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
              <span>Word Count: {wordCount} words</span>
              <span>Target: {template.estimatedLength}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WritingTemplateBuilder;