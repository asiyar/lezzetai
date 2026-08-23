export type PersonalMenuRecipe = { id: string; title: string; subtitle: string; ingredients: string[]; tags: string[]; protein: number; calories: number; minutes: number };

export type PersonalMenuInput = { pantry: string[]; favoriteIngredients: string[]; goal: string; allergies: string[] };

export function rankPersonalRecipes(recipes: PersonalMenuRecipe[], input: PersonalMenuInput) {
  const normalize = (value: string) => value.toLocaleLowerCase("tr-TR");
  const pantryTokens = [...input.pantry, ...input.favoriteIngredients].map(normalize);
  const allergies = input.allergies.map(normalize);
  const goal = normalize(input.goal);
  const score = (recipe: PersonalMenuRecipe) => {
    const text = normalize(`${recipe.title} ${recipe.subtitle} ${recipe.ingredients.join(" ")} ${recipe.tags.join(" ")}`);
    if (allergies.some((allergy) => text.includes(allergy))) return -1000;
    const pantryScore = pantryTokens.reduce((total, token) => total + (token.length > 2 && text.includes(token) ? 3 : 0), 0);
    return pantryScore + (goal.includes("protein") && recipe.protein >= 20 ? 4 : 0) + (goal.includes("sebze") && (text.includes("sebze") || text.includes("roka") || text.includes("pancar")) ? 4 : 0) + (goal.includes("denge") && recipe.calories >= 350 && recipe.calories <= 560 ? 2 : 0) - recipe.minutes / 100;
  };
  const safeRecipes = recipes.filter((recipe) => score(recipe) > -1000);
  return (safeRecipes.length ? safeRecipes : recipes).slice().sort((a, b) => score(b) - score(a));
}

export function buildPersonalWeekPlan(recipes: PersonalMenuRecipe[], input: PersonalMenuInput) {
  const ordered = rankPersonalRecipes(recipes, input);
  const days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  const meals = ["Akşam", "Öğle", "Akşam", "Akşam", "Öğle", "Akşam", "Öğle"];
  return days.map((day, index) => ({ day, meal: meals[index], recipeId: ordered[index % ordered.length].id }));
}

export function findPersonalMenuAlternative(recipes: PersonalMenuRecipe[], input: PersonalMenuInput, currentRecipeId: string, occupiedRecipeIds: string[]) {
  const ordered = rankPersonalRecipes(recipes, input);
  return ordered.find((recipe) => recipe.id !== currentRecipeId && !occupiedRecipeIds.includes(recipe.id))?.id
    ?? ordered.find((recipe) => recipe.id !== currentRecipeId)?.id
    ?? currentRecipeId;
}
