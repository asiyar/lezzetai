export type PersonalMenuRecipe = { id: string; title: string; subtitle: string; ingredients: string[]; tags: string[]; protein: number; calories: number; minutes: number; tools: string[]; cuisine?: string };

export type PersonalMenuInput = { pantry: string[]; favoriteIngredients: string[]; goal: string; allergies: string[]; kitchenTools: string[]; locale?: string };

export function rankPersonalRecipes(recipes: PersonalMenuRecipe[], input: PersonalMenuInput) {
  const normalize = (value: string) => value.toLocaleLowerCase("tr-TR");
  const pantryTokens = [...input.pantry, ...input.favoriteIngredients].map(normalize);
  const allergies = input.allergies.map(normalize);
  const goal = normalize(input.goal);
  const score = (recipe: PersonalMenuRecipe) => {
    const text = normalize(`${recipe.title} ${recipe.subtitle} ${recipe.ingredients.join(" ")} ${recipe.tags.join(" ")}`);
    if (allergies.some((allergy) => text.includes(allergy))) return -1000;
    const pantryScore = pantryTokens.reduce((total, token) => total + (token.length > 2 && text.includes(token) ? 3 : 0), 0);
    const balancedGoal = ["denge", "balanced", "ausgewogen", "equilibrada", "équilibré"].some((token) => goal.includes(token));
    const vegetableGoal = ["sebze", "vegetable", "gemüse", "verdura", "légume"].some((token) => goal.includes(token));
    const regionalScore = input.locale && recipe.cuisine === input.locale ? 12 : 0;
    return regionalScore + pantryScore + (goal.includes("protein") && recipe.protein >= 20 ? 4 : 0) + (vegetableGoal && (text.includes("sebze") || text.includes("vegetable") || text.includes("gemüse") || text.includes("verdura") || text.includes("légume")) ? 4 : 0) + (balancedGoal && recipe.calories >= 350 && recipe.calories <= 560 ? 2 : 0) - recipe.minutes / 100;
  };
  const localRecipes = input.locale ? recipes.filter((recipe) => recipe.cuisine === input.locale) : [];
  const candidateRecipes = localRecipes.length ? localRecipes : recipes;
  const safeRecipes = candidateRecipes.filter((recipe) => score(recipe) > -1000);
  const equipmentMatched = input.kitchenTools.length ? safeRecipes.filter((recipe) => recipe.tools.some((tool) => input.kitchenTools.includes(tool))) : safeRecipes;
  return (equipmentMatched.length ? equipmentMatched : safeRecipes.length ? safeRecipes : candidateRecipes).slice().sort((a, b) => score(b) - score(a));
}

export function buildPersonalWeekPlan(recipes: PersonalMenuRecipe[], input: PersonalMenuInput, labels?: { days: readonly string[]; meals: readonly string[] }) {
  const ordered = rankPersonalRecipes(recipes, input);
  const days = labels?.days ?? ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  const meals = labels?.meals ?? ["Akşam", "Öğle", "Akşam", "Akşam", "Öğle", "Akşam", "Öğle"];
  return days.map((day, index) => ({ day, meal: meals[index], recipeId: ordered[index % ordered.length].id }));
}

export function findPersonalMenuAlternative(recipes: PersonalMenuRecipe[], input: PersonalMenuInput, currentRecipeId: string, occupiedRecipeIds: string[]) {
  const ordered = rankPersonalRecipes(recipes, input);
  return ordered.find((recipe) => recipe.id !== currentRecipeId && !occupiedRecipeIds.includes(recipe.id))?.id
    ?? ordered.find((recipe) => recipe.id !== currentRecipeId)?.id
    ?? currentRecipeId;
}
