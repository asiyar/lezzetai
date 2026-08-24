export type AdaptiveTargets = { calories: number; protein: number; carbs: number; fat: number; adjustment: number };

export function getAdaptiveTargets(baselineCalories: number, activeCalories: number): AdaptiveTargets {
  const adjustment = Math.max(0, Math.round(activeCalories * 0.5));
  const calories = baselineCalories + adjustment;
  return { calories, adjustment, protein: Math.round((calories * 0.25) / 4), carbs: Math.round((calories * 0.5) / 4), fat: Math.round((calories * 0.25) / 9) };
}
