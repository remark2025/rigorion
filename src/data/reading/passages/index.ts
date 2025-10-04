import { PassageContent } from '../types';

// Science passages
import { climateChangePassage } from './science/climate-change';

// Technology passages  
import { digitalPrivacyPassage } from './technology/digital-privacy';

// Create a registry of all passages
const PASSAGE_REGISTRY: Record<number, PassageContent> = {
  1: climateChangePassage,
  11: digitalPrivacyPassage,
  // Add more passages as they're created
};

export const getPassageContent = async (id: number): Promise<PassageContent | null> => {
  // Simulate API delay for realistic loading experience
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const passage = PASSAGE_REGISTRY[id];
  return passage || null;
};

export const getAllPassageIds = (): number[] => {
  return Object.keys(PASSAGE_REGISTRY).map(id => parseInt(id));
};

// For development - add passages easily
export const addPassage = (passage: PassageContent): void => {
  PASSAGE_REGISTRY[passage.id] = passage;
};

export * from './science/climate-change';
export * from './technology/digital-privacy';