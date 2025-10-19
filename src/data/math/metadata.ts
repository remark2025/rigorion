import { MathModuleMetadata } from './types';

export const MATH_MODULE_METADATA: MathModuleMetadata[] = [
  {
    id: 'math-linear-equations',
    title: 'Linear Equations Explorer',
    skill: 'Linear Equations in One Variable',
    category: 'Algebra',
    difficulty: 'Easy',
    questionCount: 6,
    imageUrl: '/resources/sphere-3d-model-3840x2160-10993.jpg',
    description: 'Transform standard form to slope-intercept, interpret slope, and model word problems.',
    estimatedTime: 12,
    tags: ['slope', 'graphing', 'modeling'],
    previewEquation: '3x + 2y = 12'
  },
  {
    id: 'math-quadratic-functions',
    title: 'Quadratic Functions Workshop',
    skill: 'Quadratic Functions',
    category: 'Algebra',
    difficulty: 'Medium',
    questionCount: 6,
    imageUrl: '/resources/hero5.webp',
    description: 'Analyze parabolas, convert between forms, and solve SAT-style quadratic questions.',
    estimatedTime: 15,
    tags: ['vertex', 'factoring', 'parabolas'],
    previewEquation: 'y = 2x^2 - 8x + 6'
  }
];

export const getMathModulesByCategory = (category: string): MathModuleMetadata[] =>
  MATH_MODULE_METADATA.filter(module => module.category === category);

export const getMathModuleMetadata = (id: string): MathModuleMetadata | undefined =>
  MATH_MODULE_METADATA.find(module => module.id === id);

export const getAllMathCategories = (): string[] =>
  [...new Set(MATH_MODULE_METADATA.map(module => module.category))];

