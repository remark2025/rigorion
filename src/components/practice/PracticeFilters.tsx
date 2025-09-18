import React, { useState, useEffect } from 'react';
import FilterButton from '@/components/ui/FilterButton';
import { Question } from '@/types/QuestionInterface';

interface PracticeFiltersProps {
  questions: Question[];
  onFilteredQuestionsChange: (filtered: Question[]) => void;
  className?: string;
}

export const PracticeFilters: React.FC<PracticeFiltersProps> = ({
  questions,
  onFilteredQuestionsChange,
  className = ''
}) => {
  const [activeFilters, setActiveFilters] = useState<{
    module: string[];
    level: string[];
    topic: string[];
  }>({
    module: [],
    level: [],
    topic: []
  });

  // Generate filter options from available questions
  const filterOptions = {
    module: [
      { id: 'math', label: '🔢 Math' },
      { id: 'reading', label: '📖 Reading' },
      { id: 'writing', label: '✏️ Writing' }
    ],
    level: [
      { id: 'easy', label: '🟢 Easy' },
      { id: 'medium', label: '🟡 Medium' },
      { id: 'difficult', label: '🔴 Hard' }
    ],
    topic: [
      { id: 'algebra', label: 'Algebra' },
      { id: 'geometry', label: 'Geometry' },
      { id: 'quadratic', label: 'Quadratic Equations' },
      { id: 'linear', label: 'Linear Equations' },
      { id: 'literature', label: 'Literary Analysis' },
      { id: 'history', label: 'Historical Analysis' },
      { id: 'science', label: 'Scientific Analysis' },
      { id: 'grammar', label: 'Grammar & Usage' }
    ]
  };

  // Apply filters whenever activeFilters or questions change
  useEffect(() => {
    let filtered = [...questions];

    // Apply module filter
    if (activeFilters.module.length > 0) {
      filtered = filtered.filter(q => 
        activeFilters.module.includes(q.module?.toLowerCase() || '')
      );
    }

    // Apply level filter
    if (activeFilters.level.length > 0) {
      filtered = filtered.filter(q => 
        activeFilters.level.includes(q.level?.toLowerCase() || '')
      );
    }

    // Apply topic filter
    if (activeFilters.topic.length > 0) {
      filtered = filtered.filter(q => 
        activeFilters.topic.some(topic => 
          q.topic?.toLowerCase().includes(topic.toLowerCase())
        )
      );
    }

    onFilteredQuestionsChange(filtered);
  }, [activeFilters, questions, onFilteredQuestionsChange]);

  const handleModuleFilterChange = (selectedFilters: string[]) => {
    setActiveFilters(prev => ({ ...prev, module: selectedFilters }));
  };

  const handleLevelFilterChange = (selectedFilters: string[]) => {
    setActiveFilters(prev => ({ ...prev, level: selectedFilters }));
  };

  const handleTopicFilterChange = (selectedFilters: string[]) => {
    setActiveFilters(prev => ({ ...prev, topic: selectedFilters }));
  };

  const clearAllFilters = () => {
    setActiveFilters({ module: [], level: [], topic: [] });
  };

  const totalActiveFilters = activeFilters.module.length + activeFilters.level.length + activeFilters.topic.length;

  return (
    <div className={`flex flex-wrap gap-3 items-center ${className}`}>
      {/* Filter Controls */}
      <FilterButton
        options={filterOptions.module}
        onFilterChange={handleModuleFilterChange}
        className="flex-shrink-0"
      />
      
      <FilterButton
        options={filterOptions.level}
        onFilterChange={handleLevelFilterChange}
        className="flex-shrink-0"
      />
      
      <FilterButton
        options={filterOptions.topic}
        onFilterChange={handleTopicFilterChange}
        className="flex-shrink-0"
      />

      {/* Clear Filters Button */}
      {totalActiveFilters > 0 && (
        <button
          onClick={clearAllFilters}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 underline transition-colors"
        >
          Clear all ({totalActiveFilters})
        </button>
      )}

      {/* Results Count */}
      <div className="text-sm text-gray-500 ml-auto">
        {questions.length} question{questions.length !== 1 ? 's' : ''} found
      </div>
    </div>
  );
};