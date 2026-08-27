import type { CuisineLocale } from "./cuisine-locale";

export type Season = "spring" | "summer" | "autumn" | "winter";
export type DietaryTag = "vegan" | "vegetarian" | "gluten-free";
export type DietaryPreference = DietaryTag;
export type MarketCategoryKey = "produce" | "pantry" | "dairy" | "protein" | "bakery";

export const allergenOptions = ["Süt", "Yumurta", "Balık", "Kabuklu deniz ürünü", "Yer fıstığı", "Sert kabuklu yemiş", "Soya", "Susam", "Buğday / gluten"] as const;

const allergenAliases: Record<string, string[]> = {
  "Süt": ["süt", "yoğurt", "yogurt", "milk", "cream", "cheddar", "parmesan", "quark", "fromage", "lait", "butter", "tereyağı", "peynir", "cheese"],
  "Yumurta": ["yumurta", "huevo", "huevos", "egg", "oeuf", "œuf", "ei"],
  "Balık": ["balık", "somon", "salmon", "cod", "fish", "poisson", "pescado"],
  "Kabuklu deniz ürünü": ["karides", "shrimp", "prawn", "shellfish", "crab", "mussel", "crevette", "marisco"],
  "Yer fıstığı": ["fıstık", "peanut", "cacahuete", "erdnuss", "arachide"],
  "Sert kabuklu yemiş": ["badem", "ceviz", "fındık", "almond", "walnut", "hazelnut", "mandel", "noix"],
  "Soya": ["soya", "soy"],
  "Susam": ["susam", "sesame", "sésame"],
  "Buğday / gluten": ["buğday", "gluten", "bulgur", "ekmek", "bread", "brot", "pasta", "spätzle", "pâte", "oats", "yulaf"],
};

export function getDirectAllergenMatches(ingredients: string[], selectedAllergies: string[]) {
  const ingredientText = ingredients.join(" ").toLocaleLowerCase("tr-TR");
  return selectedAllergies.filter((allergen) => (allergenAliases[allergen] ?? [allergen.toLocaleLowerCase("tr-TR")]).some((alias) => ingredientText.includes(alias)));
}

export const crossContactChecklist = ["Çalışma yüzeyini ve ekipmanı sıcak, sabunlu suyla temizle.", "Alerjen içermeyen öğünü önce hazırla ve ayrı servis aracı kullan.", "Paketli malzemelerin etiketini ve ‘içerebilir’ uyarılarını kontrol et."];

export const dietaryOptions: { id: DietaryTag; labels: Record<CuisineLocale, string> }[] = [
  { id: "vegan", labels: { "tr-TR": "Vegan", "en-GB": "Vegan", "de-DE": "Vegan", "es-ES": "Vegano", "fr-FR": "Végan" } },
  { id: "vegetarian", labels: { "tr-TR": "Vejetaryen", "en-GB": "Vegetarian", "de-DE": "Vegetarisch", "es-ES": "Vegetariano", "fr-FR": "Végétarien" } },
  { id: "gluten-free", labels: { "tr-TR": "Glutensiz", "en-GB": "Gluten-free", "de-DE": "Glutenfrei", "es-ES": "Sin gluten", "fr-FR": "Sans gluten" } },
];

const seasonNames: Record<CuisineLocale, Record<Season, string>> = {
  "tr-TR": { spring: "İlkbahar", summer: "Yaz", autumn: "Sonbahar", winter: "Kış" },
  "en-GB": { spring: "Spring", summer: "Summer", autumn: "Autumn", winter: "Winter" },
  "de-DE": { spring: "Frühling", summer: "Sommer", autumn: "Herbst", winter: "Winter" },
  "es-ES": { spring: "Primavera", summer: "Verano", autumn: "Otoño", winter: "Invierno" },
  "fr-FR": { spring: "Printemps", summer: "Été", autumn: "Automne", winter: "Hiver" },
};

export function getSeasonName(locale: CuisineLocale, season: Season) { return seasonNames[locale][season]; }

export function getCurrentSeason(date = new Date()): Season {
  const month = date.getMonth() + 1;
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

type SeasonalPackage = { title: string; subtitle: string; ingredients: string[]; rituals: string[] };

const seasonalPackages: Record<CuisineLocale, Record<Season, SeasonalPackage>> = {
  "tr-TR": {
    spring: { title: "Ege Baharı", subtitle: "Enginar, bakla, bezelye ve taze otlarla hafif sofralar", ingredients: ["Enginar", "Bakla", "Bezelye", "Semizotu"], rituals: ["Zeytinyağlılar", "Taze otlar"] },
    summer: { title: "Yaz Pazarı", subtitle: "Domates, patlıcan, biber ve taze fasulyeyle serin tarifler", ingredients: ["Domates", "Patlıcan", "Kabak", "Biber"], rituals: ["Zeytinyağlı", "Yoğurtlu eşlikçi"] },
    autumn: { title: "Hasat Sofrası", subtitle: "Balkabağı, mantar, kereviz ve üzümle geçiş mevsimi", ingredients: ["Balkabağı", "Mantar", "Kereviz", "Üzüm"], rituals: ["Fırın yemekleri", "Bakliyat"] },
    winter: { title: "Kış Tenceresi", subtitle: "Pırasa, ıspanak, lahana ve narenciyeyle sıcak ev yemekleri", ingredients: ["Pırasa", "Ispanak", "Lahana", "Portakal"], rituals: ["Çorba", "Tencere yemeği"] },
  },
  "en-GB": {
    spring: { title: "British Spring Market", subtitle: "Asparagus, peas and new potatoes for brighter plates", ingredients: ["Asparagus", "Peas", "Radishes", "New potatoes"], rituals: ["Light suppers", "Fresh herbs"] },
    summer: { title: "Garden Summer", subtitle: "Courgettes, beans, tomatoes and berries from the garden", ingredients: ["Courgettes", "Runner beans", "Tomatoes", "Strawberries"], rituals: ["Tray bakes", "Picnic plates"] },
    autumn: { title: "Harvest Table", subtitle: "Apples, mushrooms, beetroot and squash for cosy cooking", ingredients: ["Apples", "Mushrooms", "Beetroot", "Squash"], rituals: ["Roasting", "One-pot meals"] },
    winter: { title: "Winter Larder", subtitle: "Leeks, cabbage, carrots and parsnips for warming dinners", ingredients: ["Leeks", "Cabbage", "Carrots", "Parsnips"], rituals: ["Soups", "Bakes"] },
  },
  "de-DE": {
    spring: { title: "Spargelzeit", subtitle: "Spargel, Spinat und Lauch für frische Alltagsküche", ingredients: ["Spargel", "Spinat", "Lauch", "Erbsen"], rituals: ["Pfannengerichte", "Kräuterquark"] },
    summer: { title: "Sommergarten", subtitle: "Tomaten, Zucchini und Bohnen für leichte Teller", ingredients: ["Tomaten", "Zucchini", "Bohnen", "Kirschen"], rituals: ["Salate", "Ofengemüse"] },
    autumn: { title: "Ernteküche", subtitle: "Kürbis, Rote Bete und Pilze für herzhafte Gerichte", ingredients: ["Kürbis", "Rote Bete", "Pilze", "Kohl"], rituals: ["Eintopf", "Backblech"] },
    winter: { title: "Wintervorrat", subtitle: "Lauch, Wurzelgemüse und Kohl für warme Töpfe", ingredients: ["Lauch", "Karotten", "Kartoffeln", "Kohl"], rituals: ["Eintopf", "Suppen"] },
  },
  "es-ES": {
    spring: { title: "Primavera Mediterránea", subtitle: "Alcachofas, espárragos y habas con aceite de oliva", ingredients: ["Alcachofas", "Espárragos", "Habas", "Espinacas"], rituals: ["Tapas vegetales", "Sofrito"] },
    summer: { title: "Huerta de Verano", subtitle: "Tomate, berenjena, calabacín y pimiento para platos frescos", ingredients: ["Tomates", "Berenjenas", "Calabacín", "Pimientos"], rituals: ["Gazpacho", "Arroz"] },
    autumn: { title: "Cosecha de Otoño", subtitle: "Calabaza, remolacha y judías para cocina mediterránea", ingredients: ["Calabaza", "Remolacha", "Judías", "Uvas"], rituals: ["Legumbres", "Horno"] },
    winter: { title: "Invierno Mediterráneo", subtitle: "Acelga, alcachofa, brócoli y cítricos de temporada", ingredients: ["Acelga", "Alcachofas", "Brócoli", "Naranjas"], rituals: ["Guisos", "Cuchara"] },
  },
  "fr-FR": {
    spring: { title: "Printemps au Marché", subtitle: "Asperges, poireaux et épinards pour une cuisine légère", ingredients: ["Asperges", "Poireaux", "Épinards", "Petits pois"], rituals: ["Herbes fraîches", "Poêlée"] },
    summer: { title: "Potager d’Été", subtitle: "Tomates, courgettes et haricots pour les assiettes du soleil", ingredients: ["Tomates", "Courgettes", "Haricots", "Abricots"], rituals: ["Ratatouille", "Salades"] },
    autumn: { title: "Table des Récoltes", subtitle: "Potimarron, betterave et brocoli pour des plats généreux", ingredients: ["Potimarron", "Betteraves", "Brocoli", "Champignons"], rituals: ["Gratin", "Lentilles"] },
    winter: { title: "Cuisine d’Hiver", subtitle: "Poireaux, carottes et choux pour les plats familiaux", ingredients: ["Poireaux", "Carottes", "Choux", "Courges"], rituals: ["Potage", "Mijoté"] },
  },
};

export function getSeasonalPackage(locale: CuisineLocale, season = getCurrentSeason()) { return seasonalPackages[locale][season]; }

const currencyByLocale: Record<CuisineLocale, { code: "TRY" | "GBP" | "EUR"; locale: string }> = {
  "tr-TR": { code: "TRY", locale: "tr-TR" },
  "en-GB": { code: "GBP", locale: "en-GB" },
  "de-DE": { code: "EUR", locale: "de-DE" },
  "es-ES": { code: "EUR", locale: "es-ES" },
  "fr-FR": { code: "EUR", locale: "fr-FR" },
};

export function formatLocalCurrency(value: number, locale: CuisineLocale) {
  const currency = currencyByLocale[locale];
  return new Intl.NumberFormat(currency.locale, { style: "currency", currency: currency.code, maximumFractionDigits: 0 }).format(value);
}

export function toLocalMarketEstimate(value: number, locale: CuisineLocale) {
  const multiplier: Record<CuisineLocale, number> = { "tr-TR": 1, "en-GB": 0.024, "de-DE": 0.028, "es-ES": 0.028, "fr-FR": 0.028 };
  return Math.max(1, Math.round(value * multiplier[locale]));
}

const categoryLabels: Record<CuisineLocale, Record<MarketCategoryKey, string>> = {
  "tr-TR": { produce: "Sebze & meyve", pantry: "Bakliyat & temel gıda", dairy: "Süt ürünleri", protein: "Et & balık", bakery: "Fırın & ekmek" },
  "en-GB": { produce: "Produce", pantry: "Pantry", dairy: "Dairy", protein: "Protein", bakery: "Bakery" },
  "de-DE": { produce: "Obst & Gemüse", pantry: "Vorrat", dairy: "Milchprodukte", protein: "Protein", bakery: "Bäckerei" },
  "es-ES": { produce: "Fruta y verdura", pantry: "Despensa", dairy: "Lácteos", protein: "Proteína", bakery: "Panadería" },
  "fr-FR": { produce: "Fruits et légumes", pantry: "Épicerie", dairy: "Produits laitiers", protein: "Protéines", bakery: "Boulangerie" },
};

const defaultMarketPrices: Record<CuisineLocale, Record<MarketCategoryKey, number>> = {
  "tr-TR": { produce: 22, pantry: 18, dairy: 34, protein: 48, bakery: 16 },
  "en-GB": { produce: 2, pantry: 2, dairy: 3, protein: 5, bakery: 2 },
  "de-DE": { produce: 2, pantry: 2, dairy: 3, protein: 5, bakery: 2 },
  "es-ES": { produce: 2, pantry: 2, dairy: 3, protein: 5, bakery: 2 },
  "fr-FR": { produce: 2, pantry: 2, dairy: 3, protein: 5, bakery: 2 },
};

export function getMarketCategoryKey(item: string): MarketCategoryKey {
  const value = item.toLocaleLowerCase("tr-TR");
  if (produceWords.some((word) => value.includes(word))) return "produce";
  if (dairyWords.some((word) => value.includes(word))) return "dairy";
  if (proteinWords.some((word) => value.includes(word))) return "protein";
  if (bakeryWords.some((word) => value.includes(word))) return "bakery";
  return "pantry";
}

export function getMarketCategoryLabel(key: MarketCategoryKey, locale: CuisineLocale) { return categoryLabels[locale][key]; }
export function getDefaultMarketPrices(locale: CuisineLocale) { return defaultMarketPrices[locale]; }

const produceWords = ["domates", "tomat", "tomate", "carrot", "havuç", "kabak", "courget", "zucchini", "patates", "kartoff", "potato", "pırasa", "leek", "poireau", "lauch", "ıspanak", "spinach", "espinaca", "épinard", "biber", "pepper", "pimiento", "poivron", "mantar", "mushroom", "champignon", "seta", "lenteja", "mercimek", "linsen", "lentil"];
const dairyWords = ["yoğurt", "yoghurt", "joghur", "fromage", "cheddar", "quark", "parmesan", "cream", "süt", "milk", "lait"];
const proteinWords = ["köfte", "cod", "somon", "salmon", "fish", "balık", "pescado", "poisson", "meat", "et", "fleisch"];
const bakeryWords = ["ekmek", "bread", "brot", "pan", "pâte", "spätzle", "bulgur", "rice", "reis", "arroz"];

export function getMarketCategory(item: string, locale: CuisineLocale) {
  return getMarketCategoryLabel(getMarketCategoryKey(item), locale);
}

export function recipeMatchesDiet(tags: DietaryTag[], selected: DietaryPreference[]) {
  if (!selected.length) return true;
  return selected.every((diet) => diet === "vegetarian" ? tags.includes("vegetarian") || tags.includes("vegan") : tags.includes(diet));
}
