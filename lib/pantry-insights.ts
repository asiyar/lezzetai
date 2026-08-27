export type StockUnit = "adet" | "g" | "ml" | "paket";

export type PantryStockMeta = {
  favorite: boolean;
  expiresInDays: number;
  expiresOn?: string;
  quantity: number;
  unit: StockUnit;
  lowStockThreshold: number;
  uses: number;
};

export type RecipeLike = { id: string; ingredients: string[] };

export const defaultPantryStockMeta: PantryStockMeta = { favorite: false, expiresInDays: 5, quantity: 1, unit: "adet", lowStockThreshold: 1, uses: 0 };

export function getDaysUntilDate(isoDate: string, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return null;
  const target = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
}

export function getEffectiveExpiryDays(meta: PantryStockMeta | undefined, now = new Date()) {
  const dateDays = meta?.expiresOn ? getDaysUntilDate(meta.expiresOn, now) : null;
  return dateDays ?? meta?.expiresInDays ?? defaultPantryStockMeta.expiresInDays;
}

export function getExpiringPantryItems(pantry: string[], meta: Record<string, PantryStockMeta>, days = 3, now = new Date()) {
  return pantry.filter((item) => getEffectiveExpiryDays(meta[item], now) <= days).sort((a, b) => getEffectiveExpiryDays(meta[a], now) - getEffectiveExpiryDays(meta[b], now));
}

export function getLowStockShoppingSeeds(pantry: string[], meta: Record<string, PantryStockMeta>) {
  return pantry.filter((item) => (meta[item]?.quantity ?? 0) <= (meta[item]?.lowStockThreshold ?? defaultPantryStockMeta.lowStockThreshold));
}

export function normalizeFoodName(value: string) {
  return value.toLocaleLowerCase("tr-TR").replace(/[ıİ]/g, "i").replace(/[^a-z0-9çğöşüéàèêîôûñ]/gi, " ").trim();
}

export function ingredientMatchesPantry(ingredient: string, pantryName: string) {
  const ingredientWords = normalizeFoodName(ingredient).split(/\s+/).filter((word) => word.length >= 3);
  const pantryWords = normalizeFoodName(pantryName).split(/\s+/).filter((word) => word.length >= 3);
  return pantryWords.some((word) => ingredientWords.includes(word)) || ingredientWords.some((word) => pantryWords.includes(word));
}

export function findMissingIngredients(ingredients: string[], pantry: string[]) {
  return ingredients.filter((ingredient) => !pantry.some((item) => ingredientMatchesPantry(ingredient, item)));
}

export function getRecipePantryMatches(recipe: RecipeLike, pantry: string[]) {
  const matched = pantry.filter((item) => recipe.ingredients.some((ingredient) => ingredientMatchesPantry(ingredient, item)));
  return { matched, matchCount: matched.length, canCook: matched.length >= Math.min(2, recipe.ingredients.length) };
}

export function getPantryOverview(recipes: RecipeLike[], pantry: string[], meta: Record<string, PantryStockMeta>, people: number) {
  const cookableRecipes = recipes.filter((recipe) => getRecipePantryMatches(recipe, pantry).canCook);
  const usableUnits = pantry.reduce((sum, item) => sum + Math.max(0, meta[item]?.quantity ?? 0), 0);
  const meals = Math.max(0, Math.floor(usableUnits / Math.max(2, people)));
  const lowStock = pantry.filter((item) => (meta[item]?.quantity ?? 0) <= (meta[item]?.lowStockThreshold ?? 1));
  const frequentLowStock = lowStock.filter((item) => (meta[item]?.uses ?? 0) >= 3);
  return { cookableRecipeCount: cookableRecipes.length, estimatedMeals: meals, estimatedDays: Math.floor(meals / 2), lowStock, frequentLowStock };
}

export function findConsumablePantryItems(ingredients: string[], pantry: string[]) {
  return pantry.filter((item) => ingredients.some((ingredient) => ingredientMatchesPantry(ingredient, item)));
}

export function getStockUsageAmount(portions: number, unit: StockUnit) {
  const portionFactor = Math.max(0.5, portions / 2);
  if (unit === "g") return Math.max(50, Math.round(100 * portionFactor));
  if (unit === "ml") return Math.max(50, Math.round(100 * portionFactor));
  return Math.max(1, Math.ceil(portionFactor));
}
