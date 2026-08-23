import { z } from "zod";

import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

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
  }),
});

export type AppRouter = typeof appRouter;
