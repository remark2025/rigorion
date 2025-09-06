import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Clock, 
  Target, 
  BookOpen,
  Search,
  Filter,
  ArrowRight,
  Star,
  Users,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import { WritingTemplate, WritingPrompt, TEMPLATE_COLORS } from '@/types/WritingInterface';
import { writingTemplates, writingPrompts, getPromptsByTemplate } from '@/data/writingTemplates';

interface WritingTemplateSelectorProps {
  onTemplateSelect: (template: WritingTemplate, prompt: WritingPrompt) => void;
  className?: string;
}

const WritingTemplateSelector: React.FC<WritingTemplateSelectorProps> = ({
  onTemplateSelect,
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<WritingTemplate | null>(null);
  const [availablePrompts, setAvailablePrompts] = useState<WritingPrompt[]>([]);

  // Filter templates based on search and filters
  const filteredTemplates = writingTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Get unique categories and difficulties
  const categories = ['all', ...Array.from(new Set(writingTemplates.map(t => t.category)))];
  const difficulties = ['all', ...Array.from(new Set(writingTemplates.map(t => t.difficulty)))];

  const handleTemplateClick = (template: WritingTemplate) => {
    setSelectedTemplate(template);
    const prompts = getPromptsByTemplate(template.id);
    setAvailablePrompts(prompts);
  };

  const handlePromptSelect = (prompt: WritingPrompt) => {
    if (selectedTemplate) {
      onTemplateSelect(selectedTemplate, prompt);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTemplateIcon = (category: string) => {
    switch (category) {
      case 'argumentative': return '🎯';
      case 'analysis': return '🔍';
      case 'compare-contrast': return '⚖️';
      case 'problem-solution': return '💡';
      case 'cause-effect': return '🔄';
      case 'narrative': return '📖';
      case 'expository': return '📊';
      default: return '📝';
    }
  };

  if (selectedTemplate) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Back Button */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => {
              setSelectedTemplate(null);
              setAvailablePrompts([]);
            }}
          >
            ← Back to Templates
          </Button>
          <div>
            <h2 className="text-xl font-bold">{selectedTemplate.name}</h2>
            <p className="text-gray-600">{selectedTemplate.description}</p>
          </div>
        </div>

        {/* Template Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{getTemplateIcon(selectedTemplate.category)}</span>
              Template Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Clock className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                <div className="font-semibold">{selectedTemplate.timeLimit} min</div>
                <div className="text-sm text-gray-600">Time Limit</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Target className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                <div className="font-semibold">{selectedTemplate.estimatedLength}</div>
                <div className="text-sm text-gray-600">Word Count</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <BookOpen className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                <div className="font-semibold">{selectedTemplate.sections.length}</div>
                <div className="text-sm text-gray-600">Sections</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                <Badge className={getDifficultyColor(selectedTemplate.difficulty)}>
                  {selectedTemplate.difficulty}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Structure */}
        <Card>
          <CardHeader>
            <CardTitle>Essay Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedTemplate.sections.map((section, index) => (
                <div key={section.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{section.name}</h4>
                    <p className="text-sm text-gray-600">{section.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">{section.fixedSentences.length} template sentences</div>
                    <div className="text-sm text-gray-600">{section.customSentences} custom sentences</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Available Prompts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Choose Your Writing Prompt ({availablePrompts.length} available)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {availablePrompts.map((prompt) => (
                <div key={prompt.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                     onClick={() => handlePromptSelect(prompt)}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{prompt.title}</h3>
                      <p className="text-gray-700 text-sm leading-relaxed mb-3">{prompt.prompt}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-4" />
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {prompt.keywords.map((keyword, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getDifficultyColor(prompt.difficulty)}>
                        {prompt.difficulty}
                      </Badge>
                      <span className="text-sm text-gray-600">{prompt.topic}</span>
                    </div>
                    <Button size="sm">
                      Start Writing →
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {availablePrompts.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Prompts Available</h3>
                <p className="text-gray-500">Prompts for this template are coming soon.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Choose Your Essay Template</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select from 7 structured essay templates, each designed to help you write clear, 
          well-organized essays with guided assistance and example sentences.
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Categories</option>
                {categories.slice(1).map(category => (
                  <option key={category} value={category}>
                    {category.replace('-', ' ')}
                  </option>
                ))}
              </select>
              <select 
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Levels</option>
                {difficulties.slice(1).map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const colors = TEMPLATE_COLORS[template.category];
          const prompts = getPromptsByTemplate(template.id);
          
          return (
            <Card key={template.id} 
                  className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-200"
                  onClick={() => handleTemplateClick(template)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getTemplateIcon(template.category)}</span>
                      <Badge className={`${colors.bg} ${colors.text} text-xs`}>
                        {template.category.replace('-', ' ')}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mb-1">{template.name}</CardTitle>
                    <p className="text-sm text-gray-600 leading-relaxed">{template.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="h-4 w-4" />
                      {template.timeLimit} min
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Target className="h-4 w-4" />
                      {template.estimatedLength}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <BookOpen className="h-4 w-4" />
                      {template.sections.length} sections
                    </div>
                    <Badge className={getDifficultyColor(template.difficulty)}>
                      {template.difficulty}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <FileText className="h-4 w-4" />
                      {prompts.length} prompts available
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <Star className="h-4 w-4" />
                      Popular
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4" variant="outline">
                    <span>Select Template</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Templates Found</h3>
          <p className="text-gray-500">Try adjusting your search or filters to find templates.</p>
        </div>
      )}

      {/* Features Overview */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4 text-center">What You Get With Each Template</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-semibold mb-1">Structured Sections</h4>
              <p className="text-sm text-gray-600">Pre-organized sections with clear purposes and guidelines</p>
            </div>
            <div className="text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-semibold mb-1">Template Sentences</h4>
              <p className="text-sm text-gray-600">Choose from proven sentence starters and transitions</p>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-semibold mb-1">Guided Writing</h4>
              <p className="text-sm text-gray-600">Examples, prompts, and suggestions for every section</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WritingTemplateSelector;