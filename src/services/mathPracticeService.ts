import { MATH_MODULE_METADATA, getMathModuleContent } from '@/data/math';
import type { MathModule, MathModuleMetadata } from '@/data/math';

class MathPracticeService {
  private static instance: MathPracticeService;
  private moduleCache = new Map<string, MathModule>();

  private constructor() {}

  static getInstance(): MathPracticeService {
    if (!MathPracticeService.instance) {
      MathPracticeService.instance = new MathPracticeService();
    }
    return MathPracticeService.instance;
  }

  getAllModules(): MathModuleMetadata[] {
    return MATH_MODULE_METADATA;
  }

  getModuleMetadata(id: string): MathModuleMetadata | undefined {
    return MATH_MODULE_METADATA.find(module => module.id === id);
  }

  async getModuleById(id: string): Promise<MathModule | null> {
    if (this.moduleCache.has(id)) {
      return this.moduleCache.get(id)!;
    }

    const module = await getMathModuleContent(id);
    if (module) {
      this.moduleCache.set(id, module);
    }
    return module;
  }

  searchModules(query: string): MathModuleMetadata[] {
    const term = query.trim().toLowerCase();
    if (!term) return MATH_MODULE_METADATA;

    return MATH_MODULE_METADATA.filter(module =>
      module.title.toLowerCase().includes(term) ||
      module.description.toLowerCase().includes(term) ||
      module.tags?.some(tag => tag.toLowerCase().includes(term))
    );
  }

  filterModules(filters: {
    category?: string;
    difficulty?: string;
  }): MathModuleMetadata[] {
    let modules = MATH_MODULE_METADATA;

    if (filters.category && filters.category !== 'All') {
      modules = modules.filter(module => module.category === filters.category);
    }

    if (filters.difficulty && filters.difficulty !== 'All') {
      modules = modules.filter(module => module.difficulty === filters.difficulty);
    }

    return modules;
  }
}

export const mathPracticeService = MathPracticeService.getInstance();

