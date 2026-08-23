import { describe, expect, it } from "vitest";

import { uniqueShoppingItems } from "../lib/meal-planning";

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
});
