import type { ImageSourcePropType } from "react-native";

import { getCuisineProfile, type CuisineLocale } from "@/lib/cuisine-locale";
import { getEquipmentAdvice as getAdvice } from "@/lib/equipment-advice";
import { uniqueShoppingItems } from "@/lib/meal-planning";
import { buildPersonalWeekPlan, findPersonalMenuAlternative } from "@/lib/personal-menu";

export type Recipe = {
  id: string; cuisine: CuisineLocale; title: string; subtitle: string; category: string; minutes: number; calories: number; protein: number; carbs: number; fat: number; estimatedCost: number; difficulty: "Kolay" | "Orta"; tools: string[]; toolTimes: Record<string, number>; fallbackMethod: string; image: ImageSourcePropType; accent: string; ingredients: string[]; steps: string[]; tags: string[];
};

const images = [
  require("../assets/images/food/enerji-kasesi.jpg"),
  require("../assets/images/food/firin-domates.jpg"),
  require("../assets/images/food/mezze.jpg"),
  require("../assets/images/food/akdeniz-tabagi.jpg"),
];

function makeRecipe(cuisine: CuisineLocale, id: string, title: string, subtitle: string, category: string, minutes: number, calories: number, protein: number, tools: string[], ingredients: string[], steps: string[], imageIndex: number): Recipe {
  return { id, cuisine, title, subtitle, category, minutes, calories, protein, carbs: Math.max(20, Math.round(calories * 0.11)), fat: Math.max(8, Math.round(calories * 0.035)), estimatedCost: Math.round(75 + calories * 0.28), difficulty: minutes > 34 ? "Orta" : "Kolay", tools, toolTimes: Object.fromEntries(tools.map((tool) => [tool, minutes])), fallbackMethod: "Use a covered pan over a gentle heat as a simple alternative.", image: images[imageIndex % images.length], accent: ["#DDE8DA", "#FCE6D2", "#F9E2DB", "#E0ECE8"][imageIndex % 4], ingredients, steps, tags: [cuisine, category, `${minutes} dk`] };
}

export const recipes: Recipe[] = [
  makeRecipe("tr-TR", "tr-mercimek", "Mercimek Çorbası", "Kimyonlu, limonlu ev çorbası", "Çorba", 32, 330, 17, ["Tencere", "Blender"], ["Kırmızı mercimek", "Soğan", "Havuç", "Kimyon", "Limon"], ["Soğan ve havucu yumuşat.", "Mercimeği ekleyip pişir.", "Blenderdan geçirip limonla servis et."], 0),
  makeRecipe("tr-TR", "tr-fasulye", "Zeytinyağlı Taze Fasulye", "Domatesli ve hafif", "Zeytinyağlı", 40, 290, 9, ["Tencere"], ["Taze fasulye", "Domates", "Soğan", "Zeytinyağı"], ["Soğanı zeytinyağında çevir.", "Fasulye ve domatesi ekle.", "Kısık ateşte yumuşat."], 2),
  makeRecipe("tr-TR", "tr-bulgur", "Sebzeli Bulgur Pilavı", "Biber, domates ve yoğurtla", "Hızlı", 26, 410, 13, ["Tencere", "Tava"], ["Bulgur", "Domates", "Yeşil biber", "Yoğurt"], ["Sebzeleri sotele.", "Bulgur ve suyu ekle.", "Demlendirip yoğurtla sun."], 1),
  makeRecipe("tr-TR", "tr-kofte", "Fırın Köfte ve Sebze", "Patates, kabak ve domatesle", "Akşam", 38, 540, 34, ["Fırın", "Air Fryer"], ["Köfte", "Patates", "Kabak", "Domates"], ["Sebzeleri tepsiye yay.", "Köfteleri baharatla.", "Kızarana kadar fırınla."], 3),
  makeRecipe("en-GB", "en-shepherds-pie", "Vegetable Shepherd’s Pie", "Lentils, peas and a golden potato topping", "Comfort dinner", 42, 520, 23, ["Oven", "Large pot", "Potato masher"], ["Green lentils", "Potatoes", "Peas", "Carrots", "Cheddar"], ["Cook lentils with carrots and peas.", "Mash the potatoes until smooth.", "Layer and bake until golden."], 3),
  makeRecipe("en-GB", "en-leek-soup", "Leek & Potato Soup", "A creamy weekday soup with oats", "Soup", 30, 345, 13, ["Large pot", "Blender"], ["Leeks", "Potatoes", "Oats", "Vegetable stock"], ["Soften leeks in a pot.", "Simmer with potato and stock.", "Blend until smooth."], 0),
  makeRecipe("en-GB", "en-traybake", "Roasted Veg Tray Bake", "Root vegetables, beans and herbs", "Tray bake", 35, 430, 18, ["Oven", "Tray"], ["Carrots", "Parsnips", "Potatoes", "White beans"], ["Season vegetables with herbs.", "Roast until caramelised.", "Fold in warm beans."], 2),
  makeRecipe("en-GB", "en-cod-peas", "Baked Cod with Peas", "Lemon potatoes and garden peas", "Dinner", 28, 505, 37, ["Oven", "Tray"], ["Cod", "Potatoes", "Peas", "Lemon"], ["Roast lemon potatoes.", "Add cod and peas.", "Bake until the fish flakes."], 1),
  makeRecipe("de-DE", "de-linseneintopf", "Linseneintopf", "Herzhafter Linsentopf mit Wurzelgemüse", "Eintopf", 38, 445, 24, ["Großer Topf"], ["Linsen", "Kartoffeln", "Karotten", "Sellerie"], ["Gemüse klein schneiden.", "Linsen und Brühe zugeben.", "Sanft köcheln lassen."], 0),
  makeRecipe("de-DE", "de-pilz-spaetzle", "Pilz-Spätzle", "Mit Kräutern und einer leichten Rahmsauce", "Pfannengericht", 25, 530, 20, ["Pfanne", "Großer Topf"], ["Spätzle", "Champignons", "Zwiebel", "Schnittlauch"], ["Spätzle kurz kochen.", "Pilze goldbraun braten.", "Mit Kräutern verbinden."], 1),
  makeRecipe("de-DE", "de-ofengemuese", "Ofengemüse mit Kräuterquark", "Kartoffeln, Rote Bete und saisonales Gemüse", "Ofengericht", 36, 425, 19, ["Ofen", "Backblech"], ["Kartoffeln", "Rote Bete", "Karotten", "Quark"], ["Gemüse würzen.", "Auf dem Blech rösten.", "Mit Kräuterquark servieren."], 2),
  makeRecipe("de-DE", "de-spargel-risotto", "Spargel-Risotto", "Cremiger Reis mit grünem Spargel", "Saisonal", 33, 485, 16, ["Großer Topf", "Pfanne"], ["Risottoreis", "Grüner Spargel", "Parmesan", "Zitrone"], ["Reis glasig dünsten.", "Brühe nach und nach einrühren.", "Spargel und Parmesan unterheben."], 3),
  makeRecipe("es-ES", "es-garbanzos", "Espinacas con Garbanzos", "Garbanzos y espinacas con ajo y pimentón", "Legumbres", 24, 410, 19, ["Sartén amplia", "Olla"], ["Garbanzos", "Espinacas", "Ajo", "Pimentón"], ["Dora el ajo.", "Añade garbanzos y pimentón.", "Incorpora las espinacas."], 0),
  makeRecipe("es-ES", "es-tortilla", "Tortilla de Patatas y Verduras", "Patata, calabacín y huevo en una sartén", "Sartén", 30, 470, 22, ["Sartén amplia"], ["Patatas", "Calabacín", "Huevos", "Cebolla"], ["Cocina patata y calabacín.", "Mezcla con huevo.", "Cuaja por ambos lados."], 1),
  makeRecipe("es-ES", "es-paella", "Paella de Verduras", "Arroz con judías, pimiento y azafrán", "Arroz", 36, 465, 15, ["Sartén amplia"], ["Arroz", "Judías verdes", "Pimiento", "Azafrán"], ["Prepara un sofrito.", "Añade arroz y caldo.", "Cocina sin remover."], 3),
  makeRecipe("es-ES", "es-gazpacho", "Gazpacho con Tostada", "Sopa fría de tomate con garbanzos crujientes", "Ligero", 18, 350, 14, ["Batidora", "Sartén"], ["Tomates", "Pepino", "Pimiento", "Garbanzos"], ["Tritura las verduras.", "Tuesta los garbanzos.", "Sirve frío."], 2),
  makeRecipe("fr-FR", "fr-ratatouille", "Ratatouille Provençale", "Légumes mijotés à l’huile d’olive et aux herbes", "Légumes", 38, 360, 12, ["Casserole", "Poêle"], ["Aubergine", "Courgette", "Tomates", "Poivron"], ["Faire revenir les légumes.", "Ajouter tomates et herbes.", "Laisser mijoter."], 2),
  makeRecipe("fr-FR", "fr-potage", "Potage Poireaux-Pommes de Terre", "Velouté simple et réconfortant", "Soupe", 30, 335, 13, ["Casserole", "Blender"], ["Poireaux", "Pommes de terre", "Bouillon", "Ciboulette"], ["Faire fondre les poireaux.", "Ajouter pommes de terre et bouillon.", "Mixer doucement."], 0),
  makeRecipe("fr-FR", "fr-quiche", "Quiche aux Légumes", "Courgette, champignons et fromage", "Four", 40, 515, 25, ["Four", "Plat à gratin"], ["Pâte brisée", "Courgette", "Champignons", "Œufs"], ["Garnir la pâte.", "Ajouter les œufs et le fromage.", "Cuire jusqu’à dorure."], 1),
  makeRecipe("fr-FR", "fr-lentilles", "Salade de Lentilles", "Carottes rôties et vinaigrette moutardée", "Léger", 27, 430, 22, ["Casserole", "Four"], ["Lentilles", "Carottes", "Moutarde", "Persil"], ["Cuire les lentilles.", "Rôtir les carottes.", "Mélanger avec la vinaigrette."], 3),
];

export function getRecipesForLocale(locale?: CuisineLocale) { return recipes.filter((item) => item.cuisine === (locale ?? "tr-TR")); }
export function getCategoriesForLocale(locale?: CuisineLocale) { const profile = getCuisineProfile(locale); return [profile.ui.all, ...Array.from(new Set(getRecipesForLocale(profile.code).map((item) => item.category)))]; }
export const categories = getCategoriesForLocale("tr-TR");
export const initialPantry = ["Nohut", "Yumurta", "Roka", "Yoğurt", "Limon", "Domates"];
export const initialWeeklyPlan = [{ day: "Pzt", meal: "Akşam", recipeId: "tr-mercimek" }, { day: "Sal", meal: "Öğle", recipeId: "tr-fasulye" }, { day: "Çar", meal: "Akşam", recipeId: "tr-bulgur" }, { day: "Per", meal: "Akşam", recipeId: "tr-kofte" }];
export function buildPersonalWeeklyPlan(input: { pantry: string[]; favoriteIngredients: string[]; goal: string; allergies: string[]; kitchenTools: string[]; locale?: CuisineLocale }) { const profile = getCuisineProfile(input.locale); return buildPersonalWeekPlan(getRecipesForLocale(profile.code), input, { days: profile.days, meals: profile.meals }); }
export function getPersonalRecipeAlternative(input: { pantry: string[]; favoriteIngredients: string[]; goal: string; allergies: string[]; kitchenTools: string[]; locale?: CuisineLocale }, currentRecipeId: string, occupiedRecipeIds: string[]) { return findPersonalMenuAlternative(getRecipesForLocale(input.locale), input, currentRecipeId, occupiedRecipeIds); }
export function getEquipmentAdvice(recipe: Recipe, kitchenTools: string[]) { return getAdvice(recipe, kitchenTools); }
export function buildGroceryList(recipeIds: string[]) { return uniqueShoppingItems(recipeIds.map((id) => recipes.find((item) => item.id === id)).filter((item): item is Recipe => Boolean(item))).map((name) => ({ name, checked: false })); }
export function getRecipe(id?: string) { return recipes.find((item) => item.id === id) ?? getRecipesForLocale("tr-TR")[0]; }
