export type IngredientRecipe = { ingredients: string[] };
export type ShoppingShareItem = { name: string; checked: boolean };
export type WeeklyPlanShareItem = { day: string; meal: string; title: string; minutes: number };

export function uniqueShoppingItems(recipeList: IngredientRecipe[]) {
  const seen = new Set<string>();
  return recipeList.flatMap((recipe) => recipe.ingredients).filter((ingredient) => {
    const normalized = ingredient.trim().toLocaleLowerCase("tr-TR");
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

export function buildShoppingShareMessage(title: string, items: ShoppingShareItem[]) {
  const safeTitle = title.trim() || "Aile alışveriş listesi";
  const list = items.map((item) => `${item.checked ? "✓" : "○"} ${item.name}`).join("\n");
  return `${safeTitle}\n\n${list}\n\nLezzetAI ile hazırlandı.`;
}

export function buildWeeklyPlanShareMessage(items: WeeklyPlanShareItem[]) {
  const list = items.map((item) => `• ${item.day} ${item.meal}: ${item.title} (${item.minutes} dk)`).join("\n");
  return `Bu haftanın LezzetAI yemek planı\n\n${list}\n\nLezzetAI ile hazırlandı.`;
}
