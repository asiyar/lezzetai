import { z } from "zod";

import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import * as db from "./db";
import { kitchenToolNames } from "../lib/kitchen-tools";
import { transcribeAudio } from "./_core/voiceTranscription";

const chefInput = z.object({
  request: z.string().trim().min(3).max(800),
  pantry: z.array(z.string().trim().min(1).max(80)).max(30),
  goal: z.string().trim().min(1).max(120),
  allergies: z.array(z.string().trim().min(1).max(80)).max(10),
  people: z.number().int().min(1).max(12),
  kitchenTools: z.array(z.string().trim().min(1).max(40)).max(10),
  locale: z.enum(["tr-TR", "en-GB", "de-DE", "es-ES", "fr-FR"]),
  usePantryOnly: z.boolean().default(false),
});

const fallbackRecipe = {
  title: "Limonlu Nohut & Roka Kasesi",
  description: "Elindeki malzemelerle hazırlanabilen dengeli, pratik bir akşam seçeneği.",
  prepMinutes: 18,
  calories: 460,
  protein: 19,
  ingredients: ["1 su bardağı haşlanmış nohut", "2 avuç roka", "Yarım limon", "2 kaşık yoğurt", "Zeytinyağı ve baharatlar"],
  steps: ["Nohudu baharatlarla kısa süre tavada ısıt.", "Roka ve limonu kâsede birleştir.", "Yoğurdu ince bir sos kıvamına getirip üzerine gezdir.", "Sıcak nohudu ekleyip hemen servis et."],
  chefNote: "Porsiyonu büyütmek istersen yanına tam tahıllı ekmek ekleyebilirsin.",
};

const scanInput = z.object({
  imageBase64: z.string().min(100).max(7_000_000),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
});

const voiceInput = z.object({
  audioBase64: z.string().min(100).max(8_000_000),
  mimeType: z.enum(["audio/webm", "audio/m4a", "audio/mp4", "audio/wav", "audio/mpeg"]),
  language: z.enum(["tr", "en", "de", "es", "fr"]),
});

const sharedListInput = z.object({
  inviteCode: z.string().trim().min(1).max(64).optional(),
  title: z.string().trim().min(1).max(120),
  ownerName: z.string().trim().min(1).max(80),
  seedItems: z.array(z.string().trim().min(1).max(180)).max(80),
});

const sharedPantryItemInput = z.object({
  inviteCode: z.string().trim().min(1).max(64),
  name: z.string().trim().min(1).max(180),
  quantity: z.number().finite().min(0).max(10_000),
  unit: z.enum(["adet", "g", "ml", "paket"]),
  expiresOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  barcode: z.string().trim().min(8).max(64).optional(),
  updatedBy: z.string().trim().min(1).max(80),
});

const barcodeInput = z.object({ code: z.string().trim().regex(/^\d{8,14}$/, "Geçerli bir EAN/UPC barkodu okutun.") });

type ScannedIngredient = { name: string; category: string; confidence: "Yüksek" | "Orta"; quantity: number; unit: "adet" | "g" | "ml" | "paket"; quantityConfidence: "Yüksek" | "Orta" | "Düşük"; lineTotal?: number };
const fallbackScan: { ingredients: ScannedIngredient[]; suggestedPrompt: string; safetyNote: string } = {
  ingredients: [{ name: "Fotoğraftaki malzemeler", category: "Kontrol gerekli", confidence: "Orta", quantity: 1, unit: "adet", quantityConfidence: "Düşük" }],
  suggestedPrompt: "Fotoğraftaki malzemelerle 25 dakikada dengeli bir tarif öner.",
  safetyNote: "Tanıma tahminidir; alerjen veya içerik kararlarından önce malzemeleri kontrol et.",
};

const fallbackEquipmentScan = { tools: [] as string[], uncertain: [] as string[], note: "Tanıma tahminidir; eklenen ekipmanları kullanmadan önce kontrol et." };

function normalizeEquipmentScan(content: string | null | undefined) {
  if (!content) return fallbackEquipmentScan;
  try {
    const parsed = JSON.parse(content) as { tools?: unknown; uncertain?: unknown; note?: unknown };
    const tools = Array.isArray(parsed.tools) ? parsed.tools.filter((item): item is string => typeof item === "string" && kitchenToolNames.includes(item as (typeof kitchenToolNames)[number])).slice(0, 8) : [];
    const uncertain = Array.isArray(parsed.uncertain) ? parsed.uncertain.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim().slice(0, 50)).slice(0, 4) : [];
    return { tools, uncertain, note: typeof parsed.note === "string" && parsed.note.trim() ? parsed.note.trim().slice(0, 180) : fallbackEquipmentScan.note };
  } catch { return fallbackEquipmentScan; }
}

function normalizeScan(content: string | null | undefined, limit = 12) {
  if (!content) return fallbackScan;
  try {
    const parsed = JSON.parse(content) as Partial<typeof fallbackScan> & { storeName?: unknown; receiptDate?: unknown; receiptTotal?: unknown };
    const rawIngredients: unknown[] = Array.isArray(parsed.ingredients) ? parsed.ingredients : [];
    const ingredients = rawIngredients
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
      .map((item) => ({
        name: typeof item.name === "string" ? item.name.trim().slice(0, 60) : "",
        category: typeof item.category === "string" ? item.category.trim().slice(0, 40) : "Diğer",
        confidence: (item.confidence === "Yüksek" ? "Yüksek" : "Orta") as "Yüksek" | "Orta",
        quantity: typeof item.quantity === "number" && Number.isFinite(item.quantity) && item.quantity > 0 ? Math.min(10_000, Math.round(item.quantity)) : 1,
        unit: (["adet", "g", "ml", "paket"] as const).includes(item.unit as "adet" | "g" | "ml" | "paket") ? item.unit as "adet" | "g" | "ml" | "paket" : "adet",
        quantityConfidence: (["Yüksek", "Orta", "Düşük"] as const).includes(item.quantityConfidence as "Yüksek" | "Orta" | "Düşük") ? item.quantityConfidence as "Yüksek" | "Orta" | "Düşük" : "Düşük",
        lineTotal: typeof item.lineTotal === "number" && Number.isFinite(item.lineTotal) && item.lineTotal >= 0 ? Math.round(item.lineTotal * 100) / 100 : undefined,
      }))
      .filter((item) => item.name.length > 0)
      .slice(0, limit);
    return {
      ingredients: ingredients.length ? ingredients : fallbackScan.ingredients,
      suggestedPrompt: typeof parsed.suggestedPrompt === "string" && parsed.suggestedPrompt.trim() ? parsed.suggestedPrompt.trim().slice(0, 360) : fallbackScan.suggestedPrompt,
      safetyNote: typeof parsed.safetyNote === "string" && parsed.safetyNote.trim() ? parsed.safetyNote.trim().slice(0, 220) : fallbackScan.safetyNote,
      storeName: typeof parsed.storeName === "string" && parsed.storeName.trim() ? parsed.storeName.trim().slice(0, 100) : undefined,
      receiptDate: typeof parsed.receiptDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(parsed.receiptDate) ? parsed.receiptDate : undefined,
      receiptTotal: typeof parsed.receiptTotal === "number" && Number.isFinite(parsed.receiptTotal) && parsed.receiptTotal >= 0 ? Math.round(parsed.receiptTotal * 100) / 100 : undefined,
    };
  } catch { return fallbackScan; }
}

function normalizeChefRecipe(content: string | null | undefined) {
  if (!content) return fallbackRecipe;
  try {
    const parsed = JSON.parse(content) as Partial<typeof fallbackRecipe>;
    const positiveNumber = (value: unknown, fallback: number) => typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.round(value) : fallback;
    const list = (value: unknown, fallback: string[], maximum: number) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).slice(0, maximum) : fallback;
    return {
      title: typeof parsed.title === "string" && parsed.title.trim() ? parsed.title.trim().slice(0, 90) : fallbackRecipe.title,
      description: typeof parsed.description === "string" && parsed.description.trim() ? parsed.description.trim().slice(0, 240) : fallbackRecipe.description,
      prepMinutes: positiveNumber(parsed.prepMinutes, fallbackRecipe.prepMinutes),
      calories: positiveNumber(parsed.calories, fallbackRecipe.calories),
      protein: positiveNumber(parsed.protein, fallbackRecipe.protein),
      ingredients: list(parsed.ingredients, fallbackRecipe.ingredients, 12),
      steps: list(parsed.steps, fallbackRecipe.steps, 8),
      chefNote: typeof parsed.chefNote === "string" && parsed.chefNote.trim() ? parsed.chefNote.trim().slice(0, 220) : fallbackRecipe.chefNote,
    };
  } catch { return fallbackRecipe; }
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  chef: router({
    suggest: publicProcedure.input(chefInput).mutation(async ({ input }) => {
      const response = await invokeLLM({
        model: "gpt-5-mini",
        messages: [
          { role: "system", content: `You are LezzetAI's regional home-cooking assistant. Reply entirely in the user's selected locale (${input.locale}) and plan a recipe that genuinely belongs to that region's everyday food culture: tr-TR Türkiye, en-GB United Kingdom, de-DE Deutschland, es-ES España, fr-FR France. Do not substitute a Turkish default dish for a German, Spanish, French or British profile. Respect goals, pantry, people, allergens and owned kitchen tools. Suggest only recipes possible with owned tools; if none are supplied, assume a basic pan and pot. Make no medical or certain health claims and do not include allergens. Return valid JSON only: {title, description, prepMinutes, calories, protein, ingredients, steps, chefNote}. Give 5-12 ingredients with clear quantity and unit for ${input.people} people, and 5-8 complete steps. Every step should contain a concrete action and, where useful, a time, texture, heat or temperature cue. If pantry-only is true, use only listed pantry ingredients plus water, salt, pepper and basic oil; if that cannot form a safe recipe, explain the smallest missing item in chefNote instead of inventing pantry items.` },
          { role: "user", content: `Request: ${input.request}\nSelected locale and cuisine: ${input.locale}\nPantry: ${input.pantry.join(", ") || "Not specified"}\nPantry-only request: ${input.usePantryOnly ? "Yes — do not add outside ingredients." : "No — additions are acceptable."}\nGoal: ${input.goal}\nPeople: ${input.people}\nAvoid: ${input.allergies.join(", ") || "None"}\nAvailable equipment: ${input.kitchenTools.join(", ") || "Not specified"}` },
        ],
        response_format: { type: "json_object" },
      });
      return normalizeChefRecipe(response.choices[0]?.message?.content as string | null | undefined);
    }),
    scanIngredients: publicProcedure.input(scanInput).mutation(async ({ input }) => {
      const imageBytes = Buffer.from(input.imageBase64, "base64");
      if (imageBytes.length < 100 || imageBytes.length > 5_000_000) throw new Error("Fotoğraf boyutu desteklenen sınırın dışında.");
      const extension = input.mimeType === "image/png" ? "png" : input.mimeType === "image/webp" ? "webp" : "jpg";
      const upload = await storagePut(`ingredient-scans/scan.${extension}`, imageBytes, input.mimeType);
      const response = await invokeLLM({
        model: "gemini-3-flash-preview",
        messages: [
          { role: "system", content: "Sen LezzetAI'nin görsel malzeme tanıma yardımcısısın. Fotoğrafta görünen, mutfakta kullanılabilecek malzemeleri Türkçe listele. Görünmeyen veya belirsiz malzemeyi kesinmiş gibi yazma. Marka, ambalaj ve kişi isimlerini yok say. Sadece geçerli JSON döndür: {ingredients:[{name,category,confidence,quantity,unit,quantityConfidence}],suggestedPrompt,safetyNote}. confidence yalnızca 'Yüksek' veya 'Orta' olabilir. unit yalnızca 'adet', 'g', 'ml' veya 'paket' olabilir. quantity tek bir fotoğrafa dayalı yaklaşık tahmindir; net değilse 1 ve 'Düşük' döndür. quantityConfidence yalnızca 'Yüksek', 'Orta' veya 'Düşük' olabilir. En fazla 12 malzeme döndür. safetyNote kısa ve kullanıcıya kimlik/miktar tahminlerini onaylamasını hatırlatsın." },
          { role: "user", content: [{ type: "text", text: "Bu fotoğraftaki malzemeleri, görünür adetlerini ya da yaklaşık paket/ağırlıklarını tanı. Sonucu kullanıcı kilerine eklemeden önce onaylayacak." }, { type: "image_url", image_url: { url: upload.url, detail: "low" } }] },
        ],
        response_format: { type: "json_object" },
      });
      return normalizeScan(response.choices[0]?.message?.content as string | null | undefined);
    }),
    scanReceipt: publicProcedure.input(scanInput).mutation(async ({ input }) => {
      const imageBytes = Buffer.from(input.imageBase64, "base64");
      if (imageBytes.length < 100 || imageBytes.length > 5_000_000) throw new Error("Fiş fotoğrafı desteklenen boyut sınırının dışında.");
      const extension = input.mimeType === "image/png" ? "png" : input.mimeType === "image/webp" ? "webp" : "jpg";
      const upload = await storagePut(`receipt-scans/receipt.${extension}`, imageBytes, input.mimeType);
      const response = await invokeLLM({
        model: "gemini-3-flash-preview",
        messages: [
          { role: "system", content: "Sen LezzetAI'nin market fişi tanıma yardımcısısın. Fiş fotoğrafındaki yalnızca açıkça okunabilen tüketilebilir gıda ve içecek ürünlerini Türkçe listele. Görünmeyen ürün, fiyat veya miktar uydurma. Sadece geçerli JSON döndür: {ingredients:[{name,category,confidence,quantity,unit,quantityConfidence,lineTotal?}],storeName?,receiptDate?,receiptTotal?,suggestedPrompt,safetyNote}. lineTotal yalnızca ürün satırının toplam fiyatı açıkça okunuyorsa sayısal değer olarak yaz; birim fiyat, vergi, indirim, poşet ve depozitoyu satıra ürün olarak ekleme. storeName yalnızca açıksa, receiptDate yalnızca YYYY-MM-DD biçimine güvenle dönüştürülebiliyorsa ve receiptTotal yalnızca genel toplam açıksa yaz; aksi halde ilgili alanı tamamen atla. Ürün miktarı/sayısı satırda açıkça görünmüyorsa quantity=1, unit='adet', quantityConfidence='Düşük' kullan. confidence yalnızca 'Yüksek' veya 'Orta'; unit yalnızca 'adet', 'g', 'ml' veya 'paket'; quantityConfidence yalnızca 'Yüksek', 'Orta' veya 'Düşük' olabilir. En çok 40 ürün döndür. safetyNote, kullanıcının ürünleri, fiyatları ve miktarları kilerine ya da geçmişine kaydetmeden önce doğrulaması gerektiğini söylesin." },
          { role: "user", content: [{ type: "text", text: "Bu market fişindeki gıda ürünlerini; yalnızca net görünen miktar, satır fiyatı, mağaza ve tarih bilgileriyle tanı. Sonuçların tamamı kullanıcı onayıyla kaydedilecek." }, { type: "image_url", image_url: { url: upload.url, detail: "high" } }] },
        ],
        response_format: { type: "json_object" },
      });
      return normalizeScan(response.choices[0]?.message?.content as string | null | undefined, 40);
    }),
    scanEquipment: publicProcedure.input(scanInput).mutation(async ({ input }) => {
      const imageBytes = Buffer.from(input.imageBase64, "base64");
      if (imageBytes.length < 100 || imageBytes.length > 5_000_000) throw new Error("Fotoğraf boyutu desteklenen sınırın dışında.");
      const extension = input.mimeType === "image/png" ? "png" : input.mimeType === "image/webp" ? "webp" : "jpg";
      const upload = await storagePut(`equipment-scans/scan.${extension}`, imageBytes, input.mimeType);
      const response = await invokeLLM({
        model: "gemini-3-flash-preview",
        messages: [
          { role: "system", content: `Sen LezzetAI'nin görsel mutfak ekipmanı tanıma yardımcısın. Fotoğrafta açıkça görülen araçlardan yalnızca şu izinli değerleri kullan: ${kitchenToolNames.join(", ")}. Belirsiz araçları uncertain dizisine yaz; kesinmiş gibi söyleme. Yalnızca geçerli JSON döndür: {tools:string[],uncertain:string[],note:string}.` },
          { role: "user", content: [{ type: "text", text: "Bu mutfak fotoğrafındaki pişirme ekipmanlarını tanı." }, { type: "image_url", image_url: { url: upload.url, detail: "low" } }] },
        ],
        response_format: { type: "json_object" },
      });
      return normalizeEquipmentScan(response.choices[0]?.message?.content as string | null | undefined);
    }),
  }),
  familyList: router({
    bootstrap: publicProcedure.input(sharedListInput).mutation(({ input }) => db.getOrCreateFamilyList(input)),
    get: publicProcedure.input(z.object({ inviteCode: z.string().trim().min(1).max(64) })).query(({ input }) => db.getFamilyListByCode(input.inviteCode)),
    updateItem: publicProcedure.input(z.object({ inviteCode: z.string().trim().min(1).max(64), name: z.string().trim().min(1).max(180), checked: z.boolean(), updatedBy: z.string().trim().min(1).max(80) })).mutation(({ input }) => db.updateFamilyListItem(input)),
  }),
  familyPantry: router({
    get: publicProcedure.input(z.object({ inviteCode: z.string().trim().min(1).max(64) })).query(({ input }) => db.getFamilyPantryByCode(input.inviteCode)),
    upsert: publicProcedure.input(sharedPantryItemInput).mutation(({ input }) => db.upsertFamilyPantryItem(input)),
    remove: publicProcedure.input(z.object({ inviteCode: z.string().trim().min(1).max(64), name: z.string().trim().min(1).max(180) })).mutation(({ input }) => db.removeFamilyPantryItem(input)),
  }),
  barcode: router({
    lookup: publicProcedure.input(barcodeInput).query(async ({ input }) => {
      const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(input.code)}?fields=product_name,product_name_tr,brands,quantity,categories_tags,allergens_tags`;
      const response = await fetch(url, { headers: { "User-Agent": "LezzetAI/1.0 (pantry barcode lookup)" } });
      if (!response.ok) throw new Error("Barkod bilgisi şu an alınamadı.");
      const data = await response.json() as { status?: number; product?: Record<string, unknown> };
      const product = data.product ?? {};
      const name = [product.product_name_tr, product.product_name].find((item): item is string => typeof item === "string" && item.trim().length > 0)?.trim();
      return {
        found: data.status === 1 && Boolean(name),
        barcode: input.code,
        name: name?.slice(0, 180) ?? "",
        brand: typeof product.brands === "string" ? product.brands.slice(0, 100) : "",
        quantityText: typeof product.quantity === "string" ? product.quantity.slice(0, 40) : "",
        categories: Array.isArray(product.categories_tags) ? product.categories_tags.filter((item): item is string => typeof item === "string").slice(0, 4) : [],
        allergens: Array.isArray(product.allergens_tags) ? product.allergens_tags.filter((item): item is string => typeof item === "string").slice(0, 8) : [],
      };
    }),
  }),
  voice: router({
    transcribe: publicProcedure.input(voiceInput).mutation(async ({ input, ctx }) => {
      const audioBytes = Buffer.from(input.audioBase64, "base64");
      if (audioBytes.length < 100 || audioBytes.length > 6_000_000) throw new Error("Ses kaydı desteklenen boyut sınırının dışında.");
      const extension = input.mimeType === "audio/webm" ? "webm" : input.mimeType === "audio/wav" ? "wav" : input.mimeType === "audio/mpeg" ? "mp3" : "m4a";
      const upload = await storagePut(`voice-search/recording.${extension}`, audioBytes, input.mimeType);
      const host = ctx.req.headers.host;
      if (!host) throw new Error("Ses kaydı adresi oluşturulamadı.");
      const protocol = ctx.req.headers["x-forwarded-proto"] === "https" ? "https" : ctx.req.protocol;
      const result = await transcribeAudio({ audioUrl: `${protocol}://${host}${upload.url}`, language: input.language, prompt: "LezzetAI için malzeme, tarif veya alışveriş aramasını yazıya çevir." });
      if ("error" in result) throw new Error(result.error);
      return { text: result.text.trim().slice(0, 500), language: result.language };
    }),
  }),
});

export type AppRouter = typeof appRouter;
