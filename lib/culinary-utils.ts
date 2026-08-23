export function scaleIngredientList(ingredients: string[], portions: number, basePortions = 2) {
  const multiplier = portions / basePortions;
  return ingredients.map((ingredient) => ingredient.replace(/^(\d+(?:[.,]\d+)?)/, (value) => {
    const number = Number(value.replace(",", "."));
    const scaled = Math.round(number * multiplier * 10) / 10;
    return String(scaled).replace(".", ",");
  }));
}

export function formatTry(value: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value);
}

export function getRecipeEstimate(baseCost: number, portions: number) {
  return Math.round(baseCost * (portions / 2));
}
