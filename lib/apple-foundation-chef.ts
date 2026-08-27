import { Platform } from "react-native";
import { getCuisineProfile, type CuisineLocale } from "@/lib/cuisine-locale";

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

export async function generateAppleChefRecipe(input: { request: string; pantry: string[]; goal: string; allergies: string[]; people: number; kitchenTools: string[]; locale: CuisineLocale; usePantryOnly?: boolean }): Promise<AppleChefRecipe> {
  const foundation = getFoundationModels();
  if (!foundation) throw new Error("Apple Intelligence bu cihazda kullanılamıyor.");
  const cuisine = getCuisineProfile(input.locale);
  const { object } = await foundation.generateObject<AppleChefRecipe>({
    instructions: `You create safe, detailed and practical regional recipes for LezzetAI. Reply entirely in ${cuisine.language} for ${cuisine.region} cuisine, using authentic everyday regional food context. Do not use allergens. Use quantities and units for the stated people count, with 5-12 ingredients and 5-8 complete steps. Each step must have a practical time, heat, temperature or texture cue where useful. If pantry-only is selected, use only the supplied pantry plus water, salt, pepper and basic oil. Return only the requested schema.`,
    prompt: `Request: ${input.request}\nCuisine region: ${cuisine.region}\nPantry: ${input.pantry.join(", ") || "Not specified"}\nPantry-only request: ${input.usePantryOnly ? "Yes" : "No"}\nGoal: ${input.goal}\nAllergies: ${input.allergies.join(", ") || "None"}\nPeople: ${input.people}\nEquipment: ${input.kitchenTools.join(", ") || "Basic pot and pan"}`,
    schema: { type: "object", required: ["title", "description", "prepMinutes", "calories", "protein", "ingredients", "steps", "chefNote"], properties: { title: { type: "string", minLength: 3, maxLength: 70 }, description: { type: "string", minLength: 12, maxLength: 220 }, prepMinutes: { type: "number", minimum: 5, maximum: 180 }, calories: { type: "number", minimum: 50, maximum: 1800 }, protein: { type: "number", minimum: 0, maximum: 160 }, ingredients: { type: "array", minItems: 5, maxItems: 12, items: { type: "string", minLength: 2, maxLength: 90 } }, steps: { type: "array", minItems: 5, maxItems: 8, items: { type: "string", minLength: 14, maxLength: 240 } }, chefNote: { type: "string", minLength: 8, maxLength: 220 } } },
  });
  return object;
}
