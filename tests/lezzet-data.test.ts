import { describe, expect, it } from "vitest";

import { buildShoppingShareMessage, uniqueShoppingItems } from "../lib/meal-planning";
import { buildPersonalWeekPlan, findPersonalMenuAlternative } from "../lib/personal-menu";

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
    const menuRecipes = [{ id: "nohut", title: "Nohut kasesi", subtitle: "Rokalı", ingredients: ["Nohut", "Roka"], tags: ["Vegan"], protein: 21, calories: 450, minutes: 20 }, { id: "somon", title: "Somon tabağı", subtitle: "Limonlu", ingredients: ["Somon"], tags: ["Protein"], protein: 38, calories: 560, minutes: 30 }];
    const plan = buildPersonalWeekPlan(menuRecipes, { pantry: ["Nohut", "Roka"], favoriteIngredients: ["Roka"], goal: "Protein odağı", allergies: ["somon"] });
    expect(plan).toHaveLength(7);
    expect(plan.every((entry) => entry.recipeId === "nohut")).toBe(true);
  });

  it("menü yenileme eyleminde mevcut tariften farklı ve alerjensiz bir alternatif seçer", () => {
    const menuRecipes = [{ id: "nohut", title: "Nohut kasesi", subtitle: "Rokalı", ingredients: ["Nohut", "Roka"], tags: ["Vegan"], protein: 21, calories: 450, minutes: 20 }, { id: "mercimek", title: "Mercimek tabağı", subtitle: "Limonlu", ingredients: ["Mercimek", "Limon"], tags: ["Protein"], protein: 23, calories: 430, minutes: 25 }];
    const alternative = findPersonalMenuAlternative(menuRecipes, { pantry: ["Nohut"], favoriteIngredients: [], goal: "Dengeli beslenme", allergies: [] }, "nohut", ["nohut"]);
    expect(alternative).toBe("mercimek");
  });
});
