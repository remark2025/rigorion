import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Book, Clock, Users, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Perspective {
  id: string;
  perspective_type: string;
  perspective_title: string;
  perspective_content: string;
}

interface PerspectivesDisplayProps {
  perspectives: Perspective[];
  className?: string;
}

export const PerspectivesDisplay: React.FC<PerspectivesDisplayProps> = ({
  perspectives,
  className = ''
}) => {
  const [activePerspective, setActivePerspective] = useState<string | null>(null);

  const getPerspectiveIcon = (type: string) => {
    switch (type) {
      case 'author_intent': return <Book className="w-5 h-5" />;
      case 'literary_criticism': return <Eye className="w-5 h-5" />;
      case 'historical_context': return <Clock className="w-5 h-5" />;
      case 'historical_significance': return <Clock className="w-5 h-5" />;
      case 'rhetorical_analysis': return <Users className="w-5 h-5" />;
      case 'contemporary_relevance': return <Lightbulb className="w-5 h-5" />;
      default: return <Eye className="w-5 h-5" />;
    }
  };

  const getPerspectiveColor = (type: string) => {
    switch (type) {
      case 'author_intent': return 'border-blue-200 bg-blue-50 text-blue-800';
      case 'literary_criticism': return 'border-purple-200 bg-purple-50 text-purple-800';
      case 'historical_context': return 'border-amber-200 bg-amber-50 text-amber-800';
      case 'historical_significance': return 'border-orange-200 bg-orange-50 text-orange-800';
      case 'rhetorical_analysis': return 'border-green-200 bg-green-50 text-green-800';
      case 'contemporary_relevance': return 'border-rose-200 bg-rose-50 text-rose-800';
      default: return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const getPerspectiveDescription = (type: string) => {
    switch (type) {
      case 'author_intent':
        return 'What the author intended to convey and the literary techniques used';
      case 'literary_criticism':
        return 'Critical analysis from various literary theory perspectives';
      case 'historical_context':
        return 'Historical background and cultural context of the time period';
      case 'historical_significance':
        return 'Why this text was important in its historical moment';
      case 'rhetorical_analysis':
        return 'How the author uses rhetorical strategies to persuade the audience';
      case 'contemporary_relevance':
        return 'How this text relates to modern issues and perspectives';
      default:
        return 'Additional analytical perspective on the text';
    }
  };

  if (!perspectives || perspectives.length === 0) {
    return null;
  }

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 p-6', className)}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          📖 Multiple Perspectives Analysis
        </h3>
        <p className="text-sm text-gray-600">
          Explore different analytical approaches to deepen your understanding of this passage.
        </p>
      </div>

      {/* Perspective Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {perspectives.map((perspective) => (
          <button
            key={perspective.id}
            onClick={() => setActivePerspective(
              activePerspective === perspective.id ? null : perspective.id
            )}
            className={cn(
              'p-4 rounded-lg border-2 transition-all duration-200 text-left',
              'hover:shadow-md hover:scale-[1.02]',
              activePerspective === perspective.id
                ? getPerspectiveColor(perspective.perspective_type)
                : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
            )}
          >
            <div className="flex items-center gap-3 mb-2">
              {getPerspectiveIcon(perspective.perspective_type)}
              <h4 className="font-medium text-sm">
                {perspective.perspective_title}
              </h4>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              {getPerspectiveDescription(perspective.perspective_type)}
            </p>
          </button>
        ))}
      </div>

      {/* Active Perspective Content */}
      {activePerspective && (
        <div className="transition-all duration-300 ease-in-out">
          {perspectives
            .filter(p => p.id === activePerspective)
            .map(perspective => (
              <div
                key={perspective.id}
                className={cn(
                  'p-6 rounded-lg border-2',
                  getPerspectiveColor(perspective.perspective_type)
                )}
              >
                <div className="flex items-center gap-3 mb-4">
                  {getPerspectiveIcon(perspective.perspective_type)}
                  <h4 className="font-semibold text-lg">
                    {perspective.perspective_title}
                  </h4>
                </div>
                
                <div className="prose prose-sm max-w-none">
                  <p className="leading-relaxed whitespace-pre-line">
                    {perspective.perspective_content}
                  </p>
                </div>

                {/* Perspective Type Badge */}
                <div className="mt-4 pt-4 border-t border-current border-opacity-20">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-50">
                    {perspective.perspective_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Analysis
                  </span>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Help Text */}
      {!activePerspective && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">
                How to Use Multiple Perspectives
              </h4>
              <p className="text-sm text-blue-800 leading-relaxed">
                Click on any perspective above to view a detailed analysis. Each perspective 
                offers a different lens through which to understand the passage, helping you 
                develop a more comprehensive interpretation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const currentIndex = perspectives.findIndex(p => p.id === activePerspective);
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : perspectives.length - 1;
            setActivePerspective(perspectives[prevIndex].id);
          }}
          disabled={!activePerspective}
        >
          Previous Perspective
        </Button>
        
        <span className="text-sm text-gray-600">
          {perspectives.length} perspective{perspectives.length !== 1 ? 's' : ''} available
        </span>
        
        <Button
          size="sm"
          onClick={() => {
            const currentIndex = perspectives.findIndex(p => p.id === activePerspective);
            const nextIndex = currentIndex < perspectives.length - 1 ? currentIndex + 1 : 0;
            setActivePerspective(perspectives[nextIndex].id);
          }}
          disabled={!activePerspective}
        >
          Next Perspective
        </Button>
      </div>
    </div>
  );
};