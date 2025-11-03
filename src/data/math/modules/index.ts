import { MathModule } from '../types';

import { linearEquationsModule } from './algebra/linear-equations';
import { quadraticFunctionsModule } from './algebra/quadratic-functions';
import { circleGeometryModule } from './geometry/circle-geometry';

const MODULE_REGISTRY: Record<string, MathModule> = {
  [linearEquationsModule.id]: linearEquationsModule,
  [quadraticFunctionsModule.id]: quadraticFunctionsModule,
  [circleGeometryModule.id]: circleGeometryModule,
};

export const getMathModuleContent = async (id: string): Promise<MathModule | null> => {
  // Simulate a lightweight asynchronous read to mirror service APIs
  await new Promise(resolve => setTimeout(resolve, 150));
  return MODULE_REGISTRY[id] ?? null;
};

export const getAllMathModuleIds = (): string[] => Object.keys(MODULE_REGISTRY);

export const addMathModule = (module: MathModule): void => {
  MODULE_REGISTRY[module.id] = module;
};

export * from './algebra/linear-equations';
export * from './algebra/quadratic-functions';
export * from './geometry/circle-geometry';

