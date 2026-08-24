import { Platform } from "react-native";

export type AppleChefAvailability = "available" | "unavailable";
export type AppleChefRecipe = { title: string; description: string; prepMinutes: number; calories: number; protein: number; ingredients: string[]; steps: string[]; chefNote: string };

function getFoundationModels() {
  if (Platform.OS !== "ios") return null;
  try { return require("@ratley/react-native-apple-foundation-models") as typeof import("@ratley/react-native-apple-foundation-models"); } catch { return null; }
}

export async function getAppleChefAvailability(): Promise<AppleChefAvailability> {
  const foundation = getFoundationModels();
  if (!foundation) return "unavailable";
  const availability = await foundation.getTextModelAvailability();
  return availability.status === "available" ? "available" : "unavailable";
}

export async function generateAppleChefRecipe(input: { request: string; pantry: string[]; goal: string; allergies: string[]; people: number; kitchenTools: string[] }): Promise<AppleChefRecipe> {
  const foundation = getFoundationModels();
  if (!foundation) throw new Error("Apple Intelligence bu cihazda kullanılamıyor.");
  const { object } = await foundation.generateObject<AppleChefRecipe>({
    instructions: "Sen LezzetAI için güvenli, uygulanabilir ve kısa Türkçe tarif planları oluşturan bir mutfak asistanısın. Alerjenleri kesinlikle kullanma. Yanıt yalnızca verilen şemaya uygun olmalı.",
    prompt: `İstek: ${input.request}\nKiler: ${input.pantry.join(", ") || "Belirtilmedi"}\nHedef: ${input.goal}\nAlerjenler: ${input.allergies.join(", ") || "Yok"}\nKişi: ${input.people}\nEkipmanlar: ${input.kitchenTools.join(", ") || "Temel ekipman"}`,
    schema: { type: "object", required: ["title", "description", "prepMinutes", "calories", "protein", "ingredients", "steps", "chefNote"], properties: { title: { type: "string", minLength: 3, maxLength: 70 }, description: { type: "string", minLength: 12, maxLength: 220 }, prepMinutes: { type: "number", minimum: 5, maximum: 180 }, calories: { type: "number", minimum: 50, maximum: 1800 }, protein: { type: "number", minimum: 0, maximum: 160 }, ingredients: { type: "array", minItems: 2, maxItems: 10, items: { type: "string", minLength: 2, maxLength: 70 } }, steps: { type: "array", minItems: 2, maxItems: 6, items: { type: "string", minLength: 8, maxLength: 180 } }, chefNote: { type: "string", minLength: 8, maxLength: 180 } } },
  });
  return object;
}
