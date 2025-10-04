import { CategoryInfo } from './types';

export const CATEGORIES: Record<string, CategoryInfo> = {
  Science: { 
    name: 'Science', 
    icon: '🔬', 
    color: '#EA580C',
    description: 'Scientific discoveries, research, and technological innovations'
  },
  History: { 
    name: 'History', 
    icon: '📜', 
    color: '#EA580C',
    description: 'Historical events, periods, and cultural movements'
  },
  Literature: { 
    name: 'Literature', 
    icon: '📖', 
    color: '#EA580C',
    description: 'Literary works, authors, and creative writing analysis'
  },
  'Social Science': { 
    name: 'Social Science', 
    icon: '🧠', 
    color: '#EA580C',
    description: 'Psychology, sociology, economics, and human behavior'
  },
  Technology: { 
    name: 'Technology', 
    icon: '💻', 
    color: '#EA580C',
    description: 'Digital innovation, AI, and technological impact on society'
  }
};

export const getCategoryInfo = (categoryName: string): CategoryInfo => {
  return CATEGORIES[categoryName] || CATEGORIES.Science;
};