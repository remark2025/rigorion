import { secureQuestionService } from "@/services/secureQuestionService";
import { getInteractiveSolution as getStaticSolution } from "@/data/interactiveSolutions";

/**
 * Lazy loader for interactive solutions
 * Tries database first, then falls back to static solutions
 */
class InteractiveLoader {
  private cache = new Map<string, any>();

  async loadInteractiveSolution(questionId: string): Promise<any | null> {
    // Check cache first
    if (this.cache.has(questionId)) {
      return this.cache.get(questionId);
    }

    try {
      // Try to get from database first
      console.log(`🎨 Loading interactive solution for ${questionId}...`);
      
      const dbSolution = await secureQuestionService.getInteractiveSolution(questionId);
      
      if (dbSolution) {
        console.log(`✅ Loaded interactive solution from database for ${questionId}`);
        this.cache.set(questionId, dbSolution);
        return dbSolution;
      }

      // Fall back to static solution
      const staticSolution = getStaticSolution(questionId);
      
      if (staticSolution) {
        console.log(`✅ Loaded interactive solution from static file for ${questionId}`);
        
        // Extract renderPayload if it exists, otherwise use the whole solution
        const renderPayload = staticSolution.renderPayload || {
          solutionSteps: staticSolution.solutionSteps || [],
          algebraSteps: staticSolution.algebraSteps || false,
          showWork: staticSolution.showWork || false,
          allowInputValidation: staticSolution.allowInputValidation || false,
          graphConfig: staticSolution.graphConfig,
          parameters: staticSolution.parameters || []
        };
        
        this.cache.set(questionId, renderPayload);
        return renderPayload;
      }

      console.log(`❌ No interactive solution found for ${questionId}`);
      return null;

    } catch (error) {
      console.error(`❌ Error loading interactive solution for ${questionId}:`, error);
      
      // Always try static fallback on error
      const staticSolution = getStaticSolution(questionId);
      if (staticSolution) {
        const renderPayload = staticSolution.renderPayload || staticSolution;
        this.cache.set(questionId, renderPayload);
        return renderPayload;
      }
      
      return null;
    }
  }

  /**
   * Preload interactive solutions for a list of questions
   */
  async preloadSolutions(questionIds: string[]): Promise<void> {
    const uncachedIds = questionIds.filter(id => !this.cache.has(id));
    
    if (uncachedIds.length === 0) {
      return;
    }

    console.log(`🔄 Preloading ${uncachedIds.length} interactive solutions...`);
    
    // Load in parallel with rate limiting
    const BATCH_SIZE = 5;
    for (let i = 0; i < uncachedIds.length; i += BATCH_SIZE) {
      const batch = uncachedIds.slice(i, i + BATCH_SIZE);
      
      await Promise.allSettled(
        batch.map(id => this.loadInteractiveSolution(id))
      );
      
      // Small delay to avoid overwhelming the server
      if (i + BATCH_SIZE < uncachedIds.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`✅ Preloading complete`);
  }

  /**
   * Clear the cache (useful for testing or memory management)
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 Interactive solution cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const interactiveLoader = new InteractiveLoader();