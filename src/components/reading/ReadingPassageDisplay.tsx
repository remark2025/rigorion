import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Book, Eye, Lightbulb, Map, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Perspective {
  id: string;
  perspective_type: string;
  perspective_title: string;
  perspective_content: string;
  key_quotes: string[];
  analysis_points: string[];
}

interface SimplifiedView {
  simplified_text: string;
  key_terms: Record<string, string>;
  main_ideas: string[];
  structure_outline: string;
  reading_tips: string[];
}

interface IdeaTracer {
  concept_map: {
    central_concept: string;
    related_concepts: Array<{
      concept: string;
      connection: string;
    }>;
    visual_connections: string[];
  };
  theme_progression: {
    progression: Array<{
      section: string;
      theme: string;
      development: string;
    }>;
  };
  argument_structure: {
    claim: string;
    evidence_progression: string[];
    logical_structure: string;
  };
  evidence_tracking: {
    textual_evidence: Array<{
      quote: string;
      supports: string;
      type: string;
    }>;
    pattern_evidence: Array<{
      pattern: string;
      supports: string;
    }>;
  };
}

interface ReadingPassage {
  passage_id: string;
  title: string;
  source: string;
  genre: string;
  difficulty_level: string;
  word_count: number;
  passage_text: string;
}

interface ReadingPassageDisplayProps {
  passage: ReadingPassage;
  perspectives: Perspective[];
  simplifiedView: SimplifiedView;
  ideaTracer: IdeaTracer;
  className?: string;
}

export const ReadingPassageDisplay: React.FC<ReadingPassageDisplayProps> = ({
  passage,
  perspectives,
  simplifiedView,
  ideaTracer,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('passage');
  const [selectedPerspective, setSelectedPerspective] = useState<string | null>(null);

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'difficult': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGenreIcon = (genre: string) => {
    switch (genre) {
      case 'literature': return '📚';
      case 'history': return '🏛️';
      case 'science': return '🔬';
      case 'social_studies': return '🌍';
      default: return '📖';
    }
  };

  const renderPassageView = () => (
    <div className="space-y-6">
      {/* Passage Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-xl font-semibold text-gray-900">{passage.title}</h2>
          <div className="flex gap-2">
            <span className={cn('px-2 py-1 text-xs rounded-full', getDifficultyColor(passage.difficulty_level))}>
              {passage.difficulty_level}
            </span>
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              {passage.word_count} words
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-600 flex items-center gap-2">
          <span className="text-lg">{getGenreIcon(passage.genre)}</span>
          {passage.source}
        </p>
      </div>

      {/* Passage Text */}
      <div className="prose prose-lg max-w-none">
        <div className="bg-gray-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
          <p className="text-gray-800 leading-relaxed whitespace-pre-line">
            {passage.passage_text}
          </p>
        </div>
      </div>
    </div>
  );

  const renderPerspectivesView = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">📖 Multiple Perspectives Analysis</h3>
        <p className="text-sm text-gray-600">Explore different analytical approaches to understand this passage deeply.</p>
      </div>

      {/* Perspective Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {perspectives.map((perspective) => (
          <button
            key={perspective.id}
            onClick={() => setSelectedPerspective(
              selectedPerspective === perspective.id ? null : perspective.id
            )}
            className={cn(
              'p-4 rounded-lg border-2 transition-all duration-200 text-left',
              'hover:shadow-md hover:scale-[1.02]',
              selectedPerspective === perspective.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            )}
          >
            <h4 className="font-medium text-sm mb-2">{perspective.perspective_title}</h4>
            <p className="text-xs text-gray-600">{perspective.perspective_type.replace(/_/g, ' ')}</p>
          </button>
        ))}
      </div>

      {/* Active Perspective Content */}
      {selectedPerspective && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          {perspectives
            .filter(p => p.id === selectedPerspective)
            .map(perspective => (
              <div key={perspective.id}>
                <h4 className="font-semibold text-blue-900 mb-4">{perspective.perspective_title}</h4>
                
                <div className="prose prose-sm max-w-none mb-4">
                  <p className="text-blue-800 leading-relaxed">{perspective.perspective_content}</p>
                </div>

                {/* Key Quotes */}
                {perspective.key_quotes.length > 0 && (
                  <div className="mb-4">
                    <h5 className="font-medium text-blue-900 mb-2">Key Quotes:</h5>
                    <div className="space-y-2">
                      {perspective.key_quotes.map((quote, index) => (
                        <blockquote key={index} className="border-l-3 border-blue-400 pl-3 text-sm italic text-blue-700">
                          "{quote}"
                        </blockquote>
                      ))}
                    </div>
                  </div>
                )}

                {/* Analysis Points */}
                {perspective.analysis_points.length > 0 && (
                  <div>
                    <h5 className="font-medium text-blue-900 mb-2">Key Insights:</h5>
                    <ul className="space-y-1">
                      {perspective.analysis_points.map((point, index) => (
                        <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );

  const renderSimplifiedView = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">💡 Simplified View</h3>
        <p className="text-sm text-gray-600">Easier vocabulary and clear explanations to build understanding.</p>
      </div>

      {/* Simplified Text */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h4 className="font-semibold text-green-900 mb-3">Simplified Version</h4>
        <p className="text-green-800 leading-relaxed">{simplifiedView.simplified_text}</p>
      </div>

      {/* Key Terms */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h4 className="font-semibold text-yellow-900 mb-3">Vocabulary Help</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(simplifiedView.key_terms).map(([term, definition]) => (
            <div key={term} className="bg-white rounded-md p-3 border border-yellow-300">
              <span className="font-medium text-yellow-900">{term}:</span>
              <span className="text-yellow-800 ml-2">{definition}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Ideas */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-3">Main Ideas</h4>
        <ul className="space-y-2">
          {simplifiedView.main_ideas.map((idea, index) => (
            <li key={index} className="text-blue-800 flex items-start gap-2">
              <span className="text-blue-500 font-bold mt-1">{index + 1}.</span>
              <span>{idea}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Reading Tips */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h4 className="font-semibold text-purple-900 mb-3">Reading Tips</h4>
        <ul className="space-y-2">
          {simplifiedView.reading_tips.map((tip, index) => (
            <li key={index} className="text-purple-800 flex items-start gap-2">
              <span className="text-purple-500 mt-1">💡</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderIdeaTracer = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">🗺️ Idea Tracer</h3>
        <p className="text-sm text-gray-600">Visual mapping of concepts, themes, and argument structure.</p>
      </div>

      {/* Concept Map */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
        <h4 className="font-semibold text-indigo-900 mb-4">Concept Map</h4>
        <div className="text-center mb-4">
          <div className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium">
            {ideaTracer.concept_map.central_concept}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ideaTracer.concept_map.related_concepts.map((concept, index) => (
            <div key={index} className="bg-white rounded-md p-4 border border-indigo-300">
              <h5 className="font-medium text-indigo-900">{concept.concept}</h5>
              <p className="text-sm text-indigo-700 mt-1">{concept.connection}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Theme Progression */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
        <h4 className="font-semibold text-orange-900 mb-4">Theme Development</h4>
        <div className="space-y-4">
          {ideaTracer.theme_progression.progression.map((item, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <h5 className="font-medium text-orange-900">{item.section}</h5>
                <p className="text-sm text-orange-800 mt-1">
                  <span className="font-medium">Theme:</span> {item.theme}
                </p>
                <p className="text-sm text-orange-700 mt-1">{item.development}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence Tracking */}
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
        <h4 className="font-semibold text-teal-900 mb-4">Evidence Analysis</h4>
        <div className="space-y-4">
          <div>
            <h5 className="font-medium text-teal-900 mb-2">Textual Evidence</h5>
            <div className="space-y-2">
              {ideaTracer.evidence_tracking.textual_evidence.map((evidence, index) => (
                <div key={index} className="bg-white rounded-md p-3 border border-teal-300">
                  <blockquote className="text-sm italic text-teal-800 mb-1">"{evidence.quote}"</blockquote>
                  <p className="text-xs text-teal-700">
                    <span className="font-medium">Supports:</span> {evidence.supports} 
                    <span className="ml-2 font-medium">Type:</span> {evidence.type}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200', className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="passage" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Passage
          </TabsTrigger>
          <TabsTrigger value="perspectives" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Perspectives
          </TabsTrigger>
          <TabsTrigger value="simplified" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Simplified
          </TabsTrigger>
          <TabsTrigger value="tracer" className="flex items-center gap-2">
            <Map className="w-4 h-4" />
            Idea Tracer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="passage" className="p-6">
          {renderPassageView()}
        </TabsContent>

        <TabsContent value="perspectives" className="p-6">
          {renderPerspectivesView()}
        </TabsContent>

        <TabsContent value="simplified" className="p-6">
          {renderSimplifiedView()}
        </TabsContent>

        <TabsContent value="tracer" className="p-6">
          {renderIdeaTracer()}
        </TabsContent>
      </Tabs>
    </div>
  );
};