import { z } from "zod";

import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import * as db from "./db";

const chefInput = z.object({
  request: z.string().trim().min(3).max(800),
  pantry: z.array(z.string().trim().min(1).max(80)).max(30),
  goal: z.string().trim().min(1).max(120),
  allergies: z.array(z.string().trim().min(1).max(80)).max(10),
  people: z.number().int().min(1).max(8),
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

const sharedListInput = z.object({
  inviteCode: z.string().trim().min(1).max(64).optional(),
  title: z.string().trim().min(1).max(120),
  ownerName: z.string().trim().min(1).max(80),
  seedItems: z.array(z.string().trim().min(1).max(180)).max(80),
});

const fallbackScan: { ingredients: { name: string; category: string; confidence: "Yüksek" | "Orta" }[]; suggestedPrompt: string; safetyNote: string } = {
  ingredients: [{ name: "Fotoğraftaki malzemeler", category: "Kontrol gerekli", confidence: "Orta" }],
  suggestedPrompt: "Fotoğraftaki malzemelerle 25 dakikada dengeli bir tarif öner.",
  safetyNote: "Tanıma tahminidir; alerjen veya içerik kararlarından önce malzemeleri kontrol et.",
};

function normalizeScan(content: string | null | undefined) {
  if (!content) return fallbackScan;
  try {
    const parsed = JSON.parse(content) as Partial<typeof fallbackScan>;
    const rawIngredients: unknown[] = Array.isArray(parsed.ingredients) ? parsed.ingredients : [];
    const ingredients = rawIngredients
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
      .map((item) => ({
        name: typeof item.name === "string" ? item.name.trim().slice(0, 60) : "",
        category: typeof item.category === "string" ? item.category.trim().slice(0, 40) : "Diğer",
        confidence: (item.confidence === "Yüksek" ? "Yüksek" : "Orta") as "Yüksek" | "Orta",
      }))
      .filter((item) => item.name.length > 0)
      .slice(0, 12);
    return {
      ingredients: ingredients.length ? ingredients : fallbackScan.ingredients,
      suggestedPrompt: typeof parsed.suggestedPrompt === "string" && parsed.suggestedPrompt.trim() ? parsed.suggestedPrompt.trim().slice(0, 360) : fallbackScan.suggestedPrompt,
      safetyNote: typeof parsed.safetyNote === "string" && parsed.safetyNote.trim() ? parsed.safetyNote.trim().slice(0, 220) : fallbackScan.safetyNote,
    };
  } catch { return fallbackScan; }
}

function normalizeChefRecipe(content: string | null | undefined) {
  if (!content) return fallbackRecipe;
  try {
    const parsed = JSON.parse(content) as Partial<typeof fallbackRecipe>;
    const positiveNumber = (value: unknown, fallback: number) => typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.round(value) : fallback;
    const list = (value: unknown, fallback: string[]) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).slice(0, 8) : fallback;
    return {
      title: typeof parsed.title === "string" && parsed.title.trim() ? parsed.title.trim().slice(0, 90) : fallbackRecipe.title,
      description: typeof parsed.description === "string" && parsed.description.trim() ? parsed.description.trim().slice(0, 240) : fallbackRecipe.description,
      prepMinutes: positiveNumber(parsed.prepMinutes, fallbackRecipe.prepMinutes),
      calories: positiveNumber(parsed.calories, fallbackRecipe.calories),
      protein: positiveNumber(parsed.protein, fallbackRecipe.protein),
      ingredients: list(parsed.ingredients, fallbackRecipe.ingredients),
      steps: list(parsed.steps, fallbackRecipe.steps),
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
          { role: "system", content: "Sen LezzetAI'nin Türkçe konuşan mutfak asistanısın. Kullanıcının hedefini, kilerindekileri, kişi sayısını ve alerjenlerini dikkate al. Tıbbi veya kesin sağlık iddiaları yapma; alerjen içeren bir bileşen kullanma. Yalnızca geçerli JSON döndür: {title, description, prepMinutes, calories, protein, ingredients, steps, chefNote}. ingredients 4-8 kısa madde; steps 3-6 açık adım olmalı. Kalori ve protein değerlerinin tahmini olduğunu chefNote içinde belirtme." },
          { role: "user", content: `İstek: ${input.request}\nKiler: ${input.pantry.join(", ") || "Belirtilmedi"}\nHedef: ${input.goal}\nKişi sayısı: ${input.people}\nKaçınılacaklar: ${input.allergies.join(", ") || "Yok"}` },
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
          { role: "system", content: "Sen LezzetAI'nin görsel malzeme tanıma yardımcısısın. Fotoğrafta görünen, mutfakta kullanılabilecek malzemeleri Türkçe listele. Görünmeyen veya belirsiz malzemeyi kesinmiş gibi yazma. Marka, ambalaj ve kişi isimlerini yok say. Sadece geçerli JSON döndür: {ingredients:[{name,category,confidence}],suggestedPrompt,safetyNote}. confidence yalnızca 'Yüksek' veya 'Orta' olabilir. En fazla 12 malzeme döndür. safetyNote kısa ve kullanıcıya görüntünün tahmini olduğunu hatırlatsın." },
          { role: "user", content: [{ type: "text", text: "Bu fotoğraftaki malzemeleri tanı ve eldeki malzemelere uygun bir tarif istemi hazırla." }, { type: "image_url", image_url: { url: upload.url, detail: "low" } }] },
        ],
        response_format: { type: "json_object" },
      });
      return normalizeScan(response.choices[0]?.message?.content as string | null | undefined);
    }),
  }),
  familyList: router({
    bootstrap: publicProcedure.input(sharedListInput).mutation(({ input }) => db.getOrCreateFamilyList(input)),
    get: publicProcedure.input(z.object({ inviteCode: z.string().trim().min(1).max(64) })).query(({ input }) => db.getFamilyListByCode(input.inviteCode)),
    updateItem: publicProcedure.input(z.object({ inviteCode: z.string().trim().min(1).max(64), name: z.string().trim().min(1).max(180), checked: z.boolean(), updatedBy: z.string().trim().min(1).max(80) })).mutation(({ input }) => db.updateFamilyListItem(input)),
  }),
});

export type AppRouter = typeof appRouter;
