
interface ObjectiveData {
  type: "questions" | "time";
  value: number;
}

const OBJECTIVE_STORAGE_KEY = 'practice_objective';

export const saveObjective = (objective: ObjectiveData): void => {
  try {
    localStorage.setItem(OBJECTIVE_STORAGE_KEY, JSON.stringify(objective));
  } catch (error) {
    console.error('Failed to save objective:', error);
  }
};

export const loadObjective = (): ObjectiveData | null => {
  try {
    const stored = localStorage.getItem(OBJECTIVE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load objective:', error);
    return null;
  }
};

export const clearObjective = (): void => {
  try {
    localStorage.removeItem(OBJECTIVE_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear objective:', error);
  }
};
