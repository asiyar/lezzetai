export type IngredientRecipe = { ingredients: string[] };

export function uniqueShoppingItems(recipeList: IngredientRecipe[]) {
  const seen = new Set<string>();
  return recipeList.flatMap((recipe) => recipe.ingredients).filter((ingredient) => {
    const normalized = ingredient.trim().toLocaleLowerCase("tr-TR");
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}
