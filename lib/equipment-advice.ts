export type EquipmentAwareRecipe = { toolTimes: Record<string, number>; fallbackMethod: string };

export function getEquipmentAdvice(recipe: EquipmentAwareRecipe, kitchenTools: string[]) {
  const available = Object.entries(recipe.toolTimes).filter(([tool]) => kitchenTools.includes(tool)).sort(([, a], [, b]) => a - b);
  if (available.length) {
    const [tool, minutes] = available[0];
    return { available: true, tool, minutes, text: `En hızlı seçeneğin ${tool}: yaklaşık ${minutes} dakikada hazır.` };
  }
  const [tool, minutes] = Object.entries(recipe.toolTimes).sort(([, a], [, b]) => a - b)[0];
  return { available: false, tool, minutes, text: recipe.fallbackMethod };
}
