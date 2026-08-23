import { describe, expect, it } from "vitest";

import { buildShoppingShareMessage, uniqueShoppingItems } from "../lib/meal-planning";

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
});
