import type { ImageSourcePropType } from "react-native";
import { uniqueShoppingItems } from "@/lib/meal-planning";
import { buildPersonalWeekPlan } from "@/lib/personal-menu";

export type Recipe = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  minutes: number;
  calories: number;
  protein: number;
  difficulty: "Kolay" | "Orta";
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
    difficulty: "Kolay",
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
    difficulty: "Kolay",
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
    difficulty: "Orta",
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
    difficulty: "Orta",
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

export function buildPersonalWeeklyPlan(input: { pantry: string[]; favoriteIngredients: string[]; goal: string; allergies: string[] }) {
  return buildPersonalWeekPlan(recipes, input);
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
