export type IngredientRecipe = { ingredients: string[] };
export type ShoppingShareItem = { name: string; checked: boolean };

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
