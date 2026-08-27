import { describe, expect, it } from "vitest";

import { buildShoppingShareMessage, buildWeeklyPlanShareMessage, uniqueShoppingItems } from "../lib/meal-planning";
import { buildPersonalWeekPlan, findPersonalMenuAlternative } from "../lib/personal-menu";
import { getEquipmentAdvice } from "../lib/equipment-advice";
import { getRecipeEstimate, scaleIngredientList } from "../lib/culinary-utils";
import { getAdaptiveTargets } from "../lib/wearable-utils";
import { getCuisineProfile } from "../lib/cuisine-locale";
import { formatLocalCurrency, getCurrentSeason, getDefaultMarketPrices, getDirectAllergenMatches, getMarketCategory, getMarketCategoryKey, getSeasonalPackage, recipeMatchesDiet } from "../lib/seasonal-market";
import { getDaysUntilDate, getEffectiveExpiryDays, getLowStockShoppingSeeds, getPantryOverview, getStockUsageAmount, ingredientMatchesPantry } from "../lib/pantry-insights";
import { kitchenToolCatalog } from "../lib/kitchen-tools";
import { regionalRecipeExpansion } from "../lib/regional-recipe-expansion";
import { summarizeReceiptSpending } from "../lib/spending-insights";
import { normalizeBarcodeInput } from "../lib/barcode";
import { buildPantryWeekIdeas } from "../lib/pantry-weekly-ideas";

describe("LezzetAI haftalık planlama", () => {
  it("planlanan öğünlerde yinelenen malzemeleri tek alışveriş kalemine indirger", () => {
    const items = uniqueShoppingItems([
      { ingredients: ["Nohut", "Yarım limon", "Roka"] },
      { ingredients: ["Yarım limon", "Yoğurt", "Nohut"] },
    ]);
    expect(items).toEqual(["Nohut", "Yarım limon", "Roka", "Yoğurt"]);
  });

  it("boş veya yalnızca boşluk içeren malzemeleri alışveriş listesine eklemez", () => {
    const items = uniqueShoppingItems([{ ingredients: [" ", "Domates", " domates "] }]);
    expect(items).toEqual(["Domates"]);
  });

  it("aile paylaşımı için işaret durumunu koruyan anlaşılır bir liste metni üretir", () => {
    const message = buildShoppingShareMessage("Haftasonu alışverişi", [{ name: "Domates", checked: true }, { name: "Yoğurt", checked: false }]);
    expect(message).toContain("Haftasonu alışverişi");
    expect(message).toContain("✓ Domates");
    expect(message).toContain("○ Yoğurt");
  });

  it("haftalık yemek planını gün, öğün ve süreyle mesajlaşmaya uygun bir metne dönüştürür", () => {
    const message = buildWeeklyPlanShareMessage([{ day: "Pzt", meal: "Akşam", title: "Mercimek Çorbası", minutes: 32 }]);
    expect(message).toContain("Pzt Akşam: Mercimek Çorbası (32 dk)");
    expect(message).toContain("LezzetAI ile hazırlandı.");
  });

  it("kişisel haftalık menüde yedi gün üretir ve belirlenen alerjeni içeren tarifi dışarıda bırakır", () => {
    const menuRecipes = [{ id: "nohut", title: "Nohut kasesi", subtitle: "Rokalı", ingredients: ["Nohut", "Roka"], tags: ["Vegan"], protein: 21, calories: 450, minutes: 20, tools: ["Tava"] }, { id: "somon", title: "Somon tabağı", subtitle: "Limonlu", ingredients: ["Somon"], tags: ["Protein"], protein: 38, calories: 560, minutes: 30, tools: ["Fırın"] }];
    const plan = buildPersonalWeekPlan(menuRecipes, { pantry: ["Nohut", "Roka"], favoriteIngredients: ["Roka"], goal: "Protein odağı", allergies: ["somon"], kitchenTools: ["Tava"] });
    expect(plan).toHaveLength(7);
    expect(plan.every((entry) => entry.recipeId === "nohut")).toBe(true);
  });

  it("menü yenileme eyleminde mevcut tariften farklı ve alerjensiz bir alternatif seçer", () => {
    const menuRecipes = [{ id: "nohut", title: "Nohut kasesi", subtitle: "Rokalı", ingredients: ["Nohut", "Roka"], tags: ["Vegan"], protein: 21, calories: 450, minutes: 20, tools: ["Tava"] }, { id: "mercimek", title: "Mercimek tabağı", subtitle: "Limonlu", ingredients: ["Mercimek", "Limon"], tags: ["Protein"], protein: 23, calories: 430, minutes: 25, tools: ["Tava"] }];
    const alternative = findPersonalMenuAlternative(menuRecipes, { pantry: ["Nohut"], favoriteIngredients: [], goal: "Dengeli beslenme", allergies: [], kitchenTools: ["Tava"] }, "nohut", ["nohut"]);
    expect(alternative).toBe("mercimek");
  });

  it("seçilen mutfak ekipmanına uyan tarifleri haftalık menüde önceliklendirir", () => {
    const menuRecipes = [{ id: "tava", title: "Tavada sebze", subtitle: "Hızlı", ingredients: ["Kabak"], tags: [], protein: 12, calories: 360, minutes: 15, tools: ["Tava"] }, { id: "firin", title: "Fırın sebze", subtitle: "Yavaş", ingredients: ["Kabak"], tags: [], protein: 12, calories: 360, minutes: 30, tools: ["Fırın"] }];
    const plan = buildPersonalWeekPlan(menuRecipes, { pantry: [], favoriteIngredients: [], goal: "Dengeli beslenme", allergies: [], kitchenTools: ["Fırın"] });
    expect(plan.every((entry) => entry.recipeId === "firin")).toBe(true);
  });

  it("en hızlı mevcut ekipmanı önerir, hiçbiri yoksa alternatif yöntemi döndürür", () => {
    const recipe = { toolTimes: { "Fırın": 26, "Air Fryer": 18 }, fallbackMethod: "Kapaklı tavada kısık ateşte pişir." };
    expect(getEquipmentAdvice(recipe, ["Fırın", "Air Fryer"])).toMatchObject({ available: true, tool: "Air Fryer", minutes: 18 });
    expect(getEquipmentAdvice(recipe, ["Tencere"])).toMatchObject({ available: false, tool: "Air Fryer", text: "Kapaklı tavada kısık ateşte pişir." });
  });

  it("porsiyonu ölçülü malzemelerde ölçekler ve tarif maliyetini kişi sayısına göre günceller", () => {
    expect(scaleIngredientList(["2 yumurta", "Yarım limon"], 4)).toEqual(["4 yumurta", "Yarım limon"]);
    expect(getRecipeEstimate(155, 4)).toBe(310);
  });

  it("aktif enerji verisini günlük kalori ve makro hedefine ölçülü biçimde yansıtır", () => {
    expect(getAdaptiveTargets(1850, 400)).toEqual({ calories: 2050, adjustment: 200, protein: 128, carbs: 256, fat: 57 });
  });

  it("seçilen dil-bölge için kendi kiler ve ekipman profilini döndürür", () => {
    const german = getCuisineProfile("de-DE");
    const spanish = getCuisineProfile("es-ES");
    expect(german.region).toBe("Deutschland");
    expect(german.pantryHighlights).toContain("Kartoffeln");
    expect(german.recommendedTools).toContain("Großer Topf");
    expect(spanish.region).toBe("España");
    expect(spanish.pantryHighlights).toContain("Garbanzos");
  });

  it("bölgesel otomatik planı seçilen dilin gün etiketleri ve tarifleriyle oluşturur", () => {
    const german = getCuisineProfile("de-DE");
    const regionalRecipes = [
      { id: "de-linsen", title: "Linseneintopf", subtitle: "Kartoffeln", ingredients: ["Linsen"], tags: [], protein: 23, calories: 440, minutes: 30, tools: ["Großer Topf"], cuisine: "de-DE" },
      { id: "tr-mercimek", title: "Mercimek Çorbası", subtitle: "Limonlu", ingredients: ["Mercimek"], tags: [], protein: 18, calories: 330, minutes: 30, tools: ["Tencere"], cuisine: "tr-TR" },
    ];
    const plan = buildPersonalWeekPlan(regionalRecipes, { pantry: [], favoriteIngredients: [], goal: "Ausgewogene Ernährung", allergies: [], kitchenTools: [], locale: "de-DE" }, { days: german.days, meals: german.meals });
    expect(plan).toHaveLength(7);
    expect(plan[0].day).toBe("Mo");
    expect(plan.every((entry) => entry.recipeId.startsWith("de-"))).toBe(true);
  });

  it("cihaz tarihini kuzey yarımküre mevsimine çevirir ve bölgeye özgü paketi döndürür", () => {
    expect(getCurrentSeason(new Date("2026-07-12T12:00:00Z"))).toBe("summer");
    expect(getCurrentSeason(new Date("2026-12-12T12:00:00Z"))).toBe("winter");
    expect(getSeasonalPackage("es-ES", "summer").ingredients).toContain("Tomates");
    expect(getSeasonalPackage("tr-TR", "winter").ingredients).toContain("Pırasa");
  });

  it("vegan, vejetaryen ve glutensiz filtrelerini birlikte uygular", () => {
    expect(recipeMatchesDiet(["vegan", "gluten-free"], ["vegan", "vegetarian", "gluten-free"])).toBe(true);
    expect(recipeMatchesDiet(["vegetarian"], ["vegan"])).toBe(false);
    expect(recipeMatchesDiet(["vegan"], ["vegetarian"])).toBe(true);
  });

  it("market kategorisini ve maliyeti seçilen ülkenin dil ve para biçiminde üretir", () => {
    expect(getMarketCategory("Tomates", "es-ES")).toBe("Fruta y verdura");
    expect(getMarketCategory("Cheddar", "en-GB")).toBe("Dairy");
    expect(formatLocalCurrency(12, "en-GB")).toContain("£");
    expect(formatLocalCurrency(12, "de-DE")).toContain("€");
  });

  it("profil alerjenlerini tarif malzemelerindeki eş anlamlılarla tespit eder", () => {
    const matches = getDirectAllergenMatches(["Cheddar", "Yulaf", "Domates"], ["Süt", "Buğday / gluten", "Balık"]);
    expect(matches).toEqual(["Süt", "Buğday / gluten"]);
  });

  it("kaydedilebilir yerel fiyat modelinde her ürün reyon anahtarına ayrılır", () => {
    expect(getMarketCategoryKey("Somon")).toBe("protein");
    expect(getMarketCategoryKey("Pırasa")).toBe("produce");
    expect(getDefaultMarketPrices("tr-TR").protein).toBeGreaterThan(getDefaultMarketPrices("tr-TR").bakery);
  });

  it("her dil-bölge için temel sekize ek olarak en az on iki ayrıntılı yöresel tarif ve geniş araç kataloğu sunar", () => {
    (["tr-TR", "en-GB", "de-DE", "es-ES", "fr-FR"] as const).forEach((locale) => expect(regionalRecipeExpansion.filter((recipe) => recipe.cuisine === locale).length).toBeGreaterThanOrEqual(12));
    expect(kitchenToolCatalog.length).toBeGreaterThanOrEqual(15);
    expect(kitchenToolCatalog.map((tool) => tool.name)).toContain("Düdüklü tencere");
  });

  it("kiler eşleşmesi, stok seviyesi ve porsiyona göre tüketim miktarını hesaplar", () => {
    const pantry = ["Nohut", "Domates"];
    const meta = { Nohut: { favorite: false, expiresInDays: 5, quantity: 1, unit: "paket" as const, lowStockThreshold: 1, uses: 3 }, Domates: { favorite: false, expiresInDays: 2, quantity: 5, unit: "adet" as const, lowStockThreshold: 2, uses: 0 } };
    const overview = getPantryOverview([{ id: "guiso", ingredients: ["250 g nohut", "2 domates", "soğan"] }], pantry, meta, 4);
    expect(ingredientMatchesPantry("250 g nohut", "Nohut")).toBe(true);
    expect(overview.cookableRecipeCount).toBe(1);
    expect(overview.lowStock).toContain("Nohut");
    expect(overview.frequentLowStock).toContain("Nohut");
    expect(getStockUsageAmount(4, "paket")).toBe(2);
    expect(getStockUsageAmount(4, "g")).toBe(200);
  });

  it("etiketteki gerçek son kullanma tarihini güncel kalan gün hesabında önceliklendirir", () => {
    const now = new Date("2026-08-27T10:00:00");
    expect(getDaysUntilDate("2026-08-30", now)).toBe(3);
    expect(getEffectiveExpiryDays({ favorite: false, expiresInDays: 12, expiresOn: "2026-08-30", quantity: 1, unit: "adet", lowStockThreshold: 1, uses: 0 }, now)).toBe(3);
  });

  it("azalan ve biten kiler ürünlerini alışveriş listesi tohumu olarak ayırır", () => {
    const pantry = ["Yumurta", "Yoğurt", "Mercimek"];
    const meta = {
      Yumurta: { favorite: false, expiresInDays: 7, quantity: 2, unit: "adet" as const, lowStockThreshold: 2, uses: 1 },
      Yoğurt: { favorite: false, expiresInDays: 4, quantity: 300, unit: "g" as const, lowStockThreshold: 150, uses: 0 },
      Mercimek: { favorite: false, expiresInDays: 20, quantity: 0, unit: "paket" as const, lowStockThreshold: 1, uses: 3 },
    };
    expect(getLowStockShoppingSeeds(pantry, meta)).toEqual(["Yumurta", "Mercimek"]);
  });

  it("fiş harcama analizi veri yokken örnek veya tahmini tutar üretmez", () => {
    expect(summarizeReceiptSpending([])).toEqual({ total: 0, categories: [], topCategory: null, purchaseCount: 0 });
  });

  it("onaylı gerçek fiş satırlarını kategoriye göre toplar ve en yüksek kategoriyi bulur", () => {
    const summary = summarizeReceiptSpending([
      { id: "1", name: "Yoğurt", categoryKey: "Süt ürünleri", amount: 42, purchasedOn: "2026-08-20" },
      { id: "2", name: "Peynir", categoryKey: "Süt ürünleri", amount: 58, purchasedOn: "2026-08-20" },
      { id: "3", name: "Domates", categoryKey: "Sebze & meyve", amount: 25, purchasedOn: "2026-08-20" },
    ]);
    expect(summary.total).toBe(125);
    expect(summary.topCategory).toMatchObject({ key: "Süt ürünleri", amount: 100, count: 2, share: 80 });
    expect(summary.categories[1]).toMatchObject({ key: "Sebze & meyve", amount: 25, share: 20 });
  });

  it("barkod girdisini yalnızca geçerli EAN/UPC rakamlarına indirger", () => {
    expect(normalizeBarcodeInput("869-0504 123456")).toBe("8690504123456");
    expect(normalizeBarcodeInput("barkod yok")).toBeNull();
    expect(normalizeBarcodeInput("1234567")).toBeNull();
  });

  it("kiler fikir planı yalnızca eşleşen tarifleri sıralar ve yaklaşan ürünleri öne alır", () => {
    const ideas = buildPantryWeekIdeas([
      { id: "corba", title: "Mercimek çorbası", ingredients: ["Mercimek", "Soğan"], minutes: 30 },
      { id: "salata", title: "Rokalı salata", ingredients: ["Roka", "Limon"], minutes: 12 },
      { id: "uyumsuz", title: "Mantar sote", ingredients: ["Mantar"], minutes: 15 },
    ], ["Mercimek", "Roka"], { Mercimek: { favorite: false, expiresInDays: 1, quantity: 1, unit: "paket", lowStockThreshold: 1, uses: 0 }, Roka: { favorite: false, expiresInDays: 5, quantity: 1, unit: "adet", lowStockThreshold: 1, uses: 0 } }, 2);
    expect(ideas.map((idea) => idea.id)).toEqual(["corba", "salata"]);
    expect(ideas[0].expiringMatches).toEqual(["Mercimek"]);
    expect(ideas[0].missingIngredients).toContain("Soğan");
  });
});
