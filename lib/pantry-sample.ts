import type { PantryStockMeta, StockUnit } from "./pantry-insights";

export type PantryDraftItem = { name: string; quantity: number; unit?: StockUnit };
export type PantrySnapshot = { pantry: string[]; pantryMeta: Record<string, PantryStockMeta> };
export type PantryTemplate = { id: string; name: string; items: Required<PantryDraftItem>[]; tags: string[]; createdAt: string };
export type PantryNutritionSummary = { itemCount: number; totalQuantity: number; proteinSources: string[]; produceItems: string[]; fibreSources: string[]; dairyItems: string[]; uncategorized: string[] };

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

export function normalizeTemplateTags(tags: string[] | string) {
  const values = Array.isArray(tags) ? tags : tags.split(",");
  const unique = new Map<string, string>();
  values.forEach((tag) => { const clean = tag.trim().replace(/\s+/g, " ").slice(0, 24); if (clean) unique.set(clean.toLocaleLowerCase("tr-TR"), clean); });
  return Array.from(unique.values()).slice(0, 6);
}

export function createPantryTemplate(name: string, pantry: string[], pantryMeta: Record<string, PantryStockMeta>, id: string, createdAt: string, tags: string[] | string = []): PantryTemplate | null {
  const cleanName = name.trim().slice(0, 36);
  const items = normalizePantryDraft(pantry.map((item) => ({ name: item, quantity: pantryMeta[item]?.quantity ?? 1, unit: pantryMeta[item]?.unit ?? "adet" })));
  return cleanName && items.length ? { id, name: cleanName, items, tags: normalizeTemplateTags(tags), createdAt } : null;
}

const matches = (name: string, words: string[]) => words.some((word) => name.toLocaleLowerCase("tr-TR").includes(word));
export function getPantryNutritionSummary(items: PantryDraftItem[]): PantryNutritionSummary {
  const names = normalizePantryDraft(items).map((item) => item.name);
  const proteinSources = names.filter((name) => matches(name, ["mercimek", "nohut", "fasulye", "bezelye", "yumurta", "yoğurt", "peynir", "tavuk", "balık", "somon", "ton", "tofu", "et", "kurubaklagil"]));
  const produceItems = names.filter((name) => matches(name, ["domates", "soğan", "havuç", "kabak", "mantar", "roka", "ıspanak", "pırasa", "limon", "elma", "muz", "biber", "patates", "lahana", "sebze", "meyve"]));
  const fibreSources = names.filter((name) => matches(name, ["bulgur", "yulaf", "mercimek", "nohut", "fasulye", "tam", "pirinç", "makarna", "ekmek", "arpa", "quinoa"]));
  const dairyItems = names.filter((name) => matches(name, ["yoğurt", "peynir", "süt", "kefir", "tereyağ", "cheddar", "fromage"]));
  const categorised = new Set([...proteinSources, ...produceItems, ...fibreSources, ...dairyItems]);
  return { itemCount: names.length, totalQuantity: normalizePantryDraft(items).reduce((sum, item) => sum + item.quantity, 0), proteinSources, produceItems, fibreSources, dairyItems, uncategorized: names.filter((name) => !categorised.has(name)) };
}

export function buildPantryTemplateShareMessage(template: PantryTemplate) {
  const tagText = template.tags.length ? `\nEtiketler: ${template.tags.map((tag) => `#${tag}`).join(" ")}` : "";
  return `LezzetAI kiler şablonu: ${template.name}${tagText}\n\n${template.items.map((item) => `• ${item.quantity} ${item.unit} ${item.name}`).join("\n")}\n\nLezzetAI ile paylaşıldı.`;
}
