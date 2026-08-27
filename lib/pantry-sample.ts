import type { PantryStockMeta, StockUnit } from "./pantry-insights";

export type PantryDraftItem = { name: string; quantity: number; unit?: StockUnit };
export type PantrySnapshot = { pantry: string[]; pantryMeta: Record<string, PantryStockMeta> };
export type PantryTemplate = { id: string; name: string; items: Required<PantryDraftItem>[]; createdAt: string };

export function createSamplePantryDraft(items: readonly string[]): PantryDraftItem[] {
  return items.slice(0, 12).map((name) => ({ name, quantity: 1, unit: "adet" }));
}

export function normalizePantryDraft(items: PantryDraftItem[]): Required<PantryDraftItem>[] {
  const unique = new Map<string, Required<PantryDraftItem>>();
  items.forEach((item) => {
    const name = item.name.trim().slice(0, 60);
    const key = name.toLocaleLowerCase("tr-TR");
    const quantity = Math.max(1, Math.min(999, Math.round(Number(item.quantity) || 1)));
    if (name && !unique.has(key)) unique.set(key, { name, quantity, unit: item.unit ?? "adet" });
  });
  return Array.from(unique.values()).slice(0, 12);
}

export function snapshotPantry(pantry: string[], pantryMeta: Record<string, PantryStockMeta>): PantrySnapshot {
  return { pantry: [...pantry], pantryMeta: Object.fromEntries(Object.entries(pantryMeta).map(([name, meta]) => [name, { ...meta }])) };
}

export function createPantryTemplate(name: string, pantry: string[], pantryMeta: Record<string, PantryStockMeta>, id: string, createdAt: string): PantryTemplate | null {
  const cleanName = name.trim().slice(0, 36);
  const items = normalizePantryDraft(pantry.map((item) => ({ name: item, quantity: pantryMeta[item]?.quantity ?? 1, unit: pantryMeta[item]?.unit ?? "adet" })));
  return cleanName && items.length ? { id, name: cleanName, items, createdAt } : null;
}
