import { PassageContent } from '../types';

// Science passages
import { climateChangePassage } from './science/climate-change';
import { quantumComputingPassage } from './science/quantum-computing';

// Technology passages  
import { digitalPrivacyPassage } from './technology/digital-privacy';
import { artificialIntelligencePassage } from './technology/artificial-intelligence';

// History passages
import { spaceRacePassage } from './history/space-race';

// Literature passages
import { comingOfAgePassage } from './literature/coming-of-age';

// Social Studies passages
import { urbanPlanningPassage } from './social-studies/urban-planning';

// Create a registry of all passages
const PASSAGE_REGISTRY: Record<number, PassageContent> = {
  1: climateChangePassage,
  5: quantumComputingPassage,
  6: spaceRacePassage,
  7: comingOfAgePassage,
  8: artificialIntelligencePassage,
  9: urbanPlanningPassage,
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
export * from './science/quantum-computing';
export * from './technology/digital-privacy';
export * from './technology/artificial-intelligence';
export * from './history/space-race';
export * from './literature/coming-of-age';
export * from './social-studies/urban-planning';