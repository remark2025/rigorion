// Main export file for reading data
export * from './types';
export * from './categories';
export * from './metadata';
export * from './passages';

// Convenience exports
export { PASSAGE_METADATA, getPassagesByCategory, getPassageById, getAllCategories } from './metadata';
export { CATEGORIES, getCategoryInfo } from './categories';
export { getPassageContent, getAllPassageIds } from './passages';