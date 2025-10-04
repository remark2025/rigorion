import { PassageContent, PassageMetadata } from '@/data/reading/types';
import { PASSAGE_METADATA, getPassageContent } from '@/data/reading';

export class ReadingService {
  private static instance: ReadingService;
  private passageCache: Map<number, PassageContent> = new Map();

  private constructor() {}

  static getInstance(): ReadingService {
    if (!ReadingService.instance) {
      ReadingService.instance = new ReadingService();
    }
    return ReadingService.instance;
  }

  // Get all passage metadata for display
  getAllPassages(): PassageMetadata[] {
    return PASSAGE_METADATA;
  }

  // Get passages by category
  getPassagesByCategory(category: string): PassageMetadata[] {
    return PASSAGE_METADATA.filter(passage => passage.category === category);
  }

  // Get passage metadata by ID
  getPassageMetadata(id: number): PassageMetadata | undefined {
    return PASSAGE_METADATA.find(passage => passage.id === id);
  }

  // Get full passage content with caching
  async getPassageContent(id: number): Promise<PassageContent | null> {
    // Check cache first
    if (this.passageCache.has(id)) {
      return this.passageCache.get(id)!;
    }

    try {
      const content = await getPassageContent(id);
      if (content) {
        this.passageCache.set(id, content);
      }
      return content;
    } catch (error) {
      console.error(`Failed to load passage ${id}:`, error);
      return null;
    }
  }

  // Search passages by title or tags
  searchPassages(query: string): PassageMetadata[] {
    const lowercaseQuery = query.toLowerCase();
    return PASSAGE_METADATA.filter(passage => 
      passage.title.toLowerCase().includes(lowercaseQuery) ||
      passage.description?.toLowerCase().includes(lowercaseQuery) ||
      passage.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Filter passages
  filterPassages(filters: {
    category?: string;
    difficulty?: string;
    completion?: string;
    userProgress?: Record<number, any>;
  }): PassageMetadata[] {
    let filtered = PASSAGE_METADATA;

    if (filters.category && filters.category !== 'All') {
      filtered = filtered.filter(passage => passage.category === filters.category);
    }

    if (filters.difficulty && filters.difficulty !== 'All') {
      filtered = filtered.filter(passage => passage.difficulty === filters.difficulty);
    }

    if (filters.completion && filters.completion !== 'All' && filters.userProgress) {
      filtered = filtered.filter(passage => {
        const progress = filters.userProgress![passage.id];
        const isCompleted = progress?.status === 'completed';
        
        return filters.completion === 'Completed' ? isCompleted : !isCompleted;
      });
    }

    return filtered;
  }

  // Get statistics
  getStatistics(): {
    totalPassages: number;
    categoryCounts: Record<string, number>;
    difficultyCounts: Record<string, number>;
  } {
    const categoryCounts: Record<string, number> = {};
    const difficultyCounts: Record<string, number> = {};

    PASSAGE_METADATA.forEach(passage => {
      categoryCounts[passage.category] = (categoryCounts[passage.category] || 0) + 1;
      difficultyCounts[passage.difficulty] = (difficultyCounts[passage.difficulty] || 0) + 1;
    });

    return {
      totalPassages: PASSAGE_METADATA.length,
      categoryCounts,
      difficultyCounts
    };
  }
}

// Export singleton instance
export const readingService = ReadingService.getInstance();