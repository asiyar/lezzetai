import { getEffectiveExpiryDays, ingredientMatchesPantry, type PantryStockMeta } from "./pantry-insights";

export type PantryIdeaRecipe = { id: string; title: string; ingredients: string[]; minutes: number };
export type PantryWeekIdea = PantryIdeaRecipe & { matchedPantry: string[]; missingIngredients: string[]; expiringMatches: string[]; score: number };

export function buildPantryWeekIdeas(recipes: PantryIdeaRecipe[], pantry: string[], pantryMeta: Record<string, PantryStockMeta>, days = 7): PantryWeekIdea[] {
  const ranked = recipes.map((recipe) => {
    const matchedPantry = pantry.filter((item) => recipe.ingredients.some((ingredient) => ingredientMatchesPantry(ingredient, item)));
    const expiringMatches = matchedPantry.filter((item) => getEffectiveExpiryDays(pantryMeta[item]) <= 2);
    const missingIngredients = recipe.ingredients.filter((ingredient) => !pantry.some((item) => ingredientMatchesPantry(ingredient, item))).slice(0, 3);
    return { ...recipe, matchedPantry, expiringMatches, missingIngredients, score: matchedPantry.length * 5 + expiringMatches.length * 8 - missingIngredients.length };
  }).filter((recipe) => recipe.matchedPantry.length > 0).sort((a, b) => b.score - a.score || a.minutes - b.minutes);
  if (!ranked.length) return [];
  return Array.from({ length: days }, (_, index) => ranked[index % ranked.length]);
}
