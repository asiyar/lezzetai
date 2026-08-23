import type { ImageSourcePropType } from "react-native";
import { uniqueShoppingItems } from "@/lib/meal-planning";
import { buildPersonalWeekPlan, findPersonalMenuAlternative } from "@/lib/personal-menu";
import { getEquipmentAdvice as getAdvice } from "@/lib/equipment-advice";

export type Recipe = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  minutes: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  estimatedCost: number;
  difficulty: "Kolay" | "Orta";
  tools: string[];
  toolTimes: Record<string, number>;
  fallbackMethod: string;
  image: ImageSourcePropType;
  accent: string;
  ingredients: string[];
  steps: string[];
  tags: string[];
};

export const recipes: Recipe[] = [
  {
    id: "yesil-enerji-kasesi",
    title: "Yeşil Enerji Kasesi",
    subtitle: "Avokado, nohut ve limonlu tahin sos",
    category: "Hızlı & Dengeli",
    minutes: 18,
    calories: 480,
    protein: 20,
    carbs: 42,
    fat: 22,
    estimatedCost: 155,
    difficulty: "Kolay",
    tools: ["Tava", "Tencere"],
    toolTimes: { "Tava": 18, "Tencere": 22 },
    fallbackMethod: "Tava yoksa nohudu küçük bir tencerede 5 dakika ısıtıp kâsede servis edebilirsin.",
    image: require("../assets/images/food/enerji-kasesi.jpg"),
    accent: "#DDE8DA",
    ingredients: ["1 su bardağı haşlanmış nohut", "Yarım avokado", "1 küçük salatalık", "2 avuç roka", "3 yemek kaşığı tahin", "Yarım limon", "1 çay kaşığı kimyon"],
    steps: ["Nohutları kimyon ve bir tutam tuzla tavada 4 dakika ısıt.", "Rokayı, dilimlenmiş salatalığı ve avokadoyu geniş bir kâsede birleştir.", "Tahin, limon suyu ve iki kaşık suyu pürüzsüz olana kadar çırp.", "Sıcak nohutları ekle, sosu gezdir ve taze otlarla servis et."],
    tags: ["Vegan", "Lif zengini", "18 dk"],
  },
  {
    id: "firin-domatesli-yumurta",
    title: "Fırın Domatesli Yumurta",
    subtitle: "Fesleğenli yoğurt ve kızarmış ekmekle",
    category: "Kahvaltı",
    minutes: 24,
    calories: 365,
    protein: 24,
    carbs: 31,
    fat: 18,
    estimatedCost: 130,
    difficulty: "Kolay",
    tools: ["Fırın", "Air Fryer"],
    toolTimes: { "Air Fryer": 18, "Fırın": 24 },
    fallbackMethod: "Fırın veya air fryer yoksa domates ve yumurtayı kapaklı tavada kısık ateşte pişir.",
    image: require("../assets/images/food/firin-domates.jpg"),
    accent: "#FCE6D2",
    ingredients: ["2 yumurta", "10 çeri domates", "1 diş sarımsak", "2 yemek kaşığı yoğurt", "1 dilim tam tahıllı ekmek", "Taze fesleğen"],
    steps: ["Domatesleri sarımsak ve zeytinyağıyla 200 derecede 12 dakika pişir.", "Domateslerin arasına iki yumurtayı dikkatle kır.", "Yumurtalar dilediğin kıvama gelene kadar 6-8 dakika daha fırınla.", "Yoğurt, fesleğen ve kızarmış ekmekle servis et."],
    tags: ["Yüksek protein", "24 dk", "Kahvaltı"],
  },
  {
    id: "akdeniz-mezze-tabagi",
    title: "Akdeniz Mezze Tabağı",
    subtitle: "Renkli sebzeler, yoğurtlu dip ve zeytinyağı",
    category: "Paylaşmalık",
    minutes: 28,
    calories: 420,
    protein: 16,
    carbs: 48,
    fat: 20,
    estimatedCost: 210,
    difficulty: "Orta",
    tools: ["Fırın", "Air Fryer"],
    toolTimes: { "Air Fryer": 20, "Fırın": 28 },
    fallbackMethod: "Fırın veya air fryer yoksa sebzeleri ince dilimleyip tavada parti parti yumuşatabilirsin.",
    image: require("../assets/images/food/mezze.jpg"),
    accent: "#F9E2DB",
    ingredients: ["2 patlıcan", "1 pancar", "1 kâse süzme yoğurt", "Yarım limon", "Maydanoz", "Zeytinyağı", "Taze ekmek"],
    steps: ["Patlıcan ve pancarı zeytinyağıyla 200 derecede yumuşayana kadar fırınla.", "Yoğurdu limon suyu ve tuzla karıştır.", "Sebzeleri, yoğurtlu dip ve taze otlarla bir servis tabağında birleştir.", "Üzerine zeytinyağı gezdirip ılık ekmekle sun."],
    tags: ["Sebze ağırlıklı", "Paylaşmalık", "28 dk"],
  },
  {
    id: "akdeniz-somon-tabagi",
    title: "Akdeniz Somon Tabağı",
    subtitle: "Fırın sebzeleri ve limonlu yeşilliklerle",
    category: "Akşam Yemeği",
    minutes: 30,
    calories: 560,
    protein: 38,
    carbs: 28,
    fat: 29,
    estimatedCost: 310,
    difficulty: "Orta",
    tools: ["Fırın", "Air Fryer", "Tava"],
    toolTimes: { "Air Fryer": 18, "Tava": 18, "Fırın": 30 },
    fallbackMethod: "Fırın veya air fryer yoksa somonu yapışmaz tavada orta ateşte her yüzünü 4-5 dakika pişir.",
    image: require("../assets/images/food/akdeniz-tabagi.jpg"),
    accent: "#E0ECE8",
    ingredients: ["150 g somon", "1 küçük kabak", "1 kırmızı biber", "10 çeri domates", "Yarım limon", "Taze dereotu", "1 avuç roka"],
    steps: ["Sebzeleri zeytinyağıyla harmanlayıp 200 derecede 15 dakika fırınla.", "Somonu tuz, limon kabuğu ve dereotuyla tatlandır.", "Somonu sebzelerin yanına koyup 10-12 dakika daha pişir.", "Roka ve limon dilimleriyle tazeleyerek servis et."],
    tags: ["Omega-3", "Yüksek protein", "30 dk"],
  },
];

export const categories = ["Tümü", "Hızlı & Dengeli", "Kahvaltı", "Akşam Yemeği", "Paylaşmalık"];

export const initialPantry = ["Nohut", "Yumurta", "Roka", "Yoğurt", "Limon", "Domates"];

export const initialWeeklyPlan = [
  { day: "Pzt", meal: "Akşam", recipeId: "yesil-enerji-kasesi" },
  { day: "Sal", meal: "Öğle", recipeId: "firin-domatesli-yumurta" },
  { day: "Çar", meal: "Akşam", recipeId: "akdeniz-somon-tabagi" },
  { day: "Per", meal: "Akşam", recipeId: "akdeniz-mezze-tabagi" },
];

export function buildPersonalWeeklyPlan(input: { pantry: string[]; favoriteIngredients: string[]; goal: string; allergies: string[]; kitchenTools: string[] }) {
  return buildPersonalWeekPlan(recipes, input);
}

export function getPersonalRecipeAlternative(input: { pantry: string[]; favoriteIngredients: string[]; goal: string; allergies: string[]; kitchenTools: string[] }, currentRecipeId: string, occupiedRecipeIds: string[]) {
  return findPersonalMenuAlternative(recipes, input, currentRecipeId, occupiedRecipeIds);
}

export function getEquipmentAdvice(recipe: Recipe, kitchenTools: string[]) {
  return getAdvice(recipe, kitchenTools);
}

export function buildGroceryList(recipeIds: string[]) {
  const selectedRecipes = recipeIds
    .map((id) => recipes.find((recipe) => recipe.id === id))
    .filter((recipe): recipe is Recipe => Boolean(recipe));

  return uniqueShoppingItems(selectedRecipes).map((name) => ({ name, checked: false }));
}

export function getRecipe(id?: string) {
  return recipes.find((recipe) => recipe.id === id) ?? recipes[0];
}
