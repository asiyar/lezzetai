import { describe, expect, it } from "vitest";

import { buildShoppingShareMessage, uniqueShoppingItems } from "../lib/meal-planning";
import { buildPersonalWeekPlan, findPersonalMenuAlternative } from "../lib/personal-menu";
import { getEquipmentAdvice } from "../lib/equipment-advice";
import { getRecipeEstimate, scaleIngredientList } from "../lib/culinary-utils";
import { getAdaptiveTargets } from "../lib/wearable-utils";

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
});
