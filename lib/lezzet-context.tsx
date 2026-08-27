import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

import { buildGroceryList, buildPersonalWeeklyPlan, getPersonalRecipeAlternative, initialPantry, initialWeeklyPlan } from "@/lib/lezzet-data";
import { defaultCuisineLocale, isCuisineLocale, type CuisineLocale } from "@/lib/cuisine-locale";
import { getDefaultMarketPrices, type DietaryPreference, type MarketCategoryKey } from "@/lib/seasonal-market";
import { defaultPantryStockMeta, findConsumablePantryItems, getStockUsageAmount, type PantryStockMeta, type StockUnit } from "@/lib/pantry-insights";
import type { WearableActivity } from "@/lib/wearable-sync";

type GroceryItem = { name: string; checked: boolean; updatedBy?: string; updatedAt?: string };
type WeeklyMeal = { day: string; meal: string; recipeId: string };
type Profile = { goal: string; people: number; calories: number; allergies: string[]; locale: CuisineLocale; dietaryPreferences: DietaryPreference[] };
type PantryMeta = PantryStockMeta;
type ScanHistoryItem = { id: string; ingredients: string[]; createdAt: string; recipePrompt: string };
type FamilyMember = { id: string; name: string; color: string };
type FamilyProfile = { id: string; name: string; goal: string; allergies: string[] };
type RecipeFeedback = { liked?: boolean; difficulty?: "Kolay" | "Tam kararında" | "Zor" };
type JournalEntry = { id: string; recipeId: string; note: string; photoUri?: string; createdAt: string };
type MarketPrices = Record<CuisineLocale, Record<MarketCategoryKey, number>>;

const makeDefaultMarketPrices = (): MarketPrices => ({
  "tr-TR": { ...getDefaultMarketPrices("tr-TR") }, "en-GB": { ...getDefaultMarketPrices("en-GB") }, "de-DE": { ...getDefaultMarketPrices("de-DE") }, "es-ES": { ...getDefaultMarketPrices("es-ES") }, "fr-FR": { ...getDefaultMarketPrices("fr-FR") },
});

type LezzetContextValue = {
  favorites: string[];
  pantry: string[];
  pantryMeta: Record<string, PantryMeta>;
  scanHistory: ScanHistoryItem[];
  familyMembers: FamilyMember[];
  familyProfiles: FamilyProfile[];
  recipeFeedback: Record<string, RecipeFeedback>;
  journalEntries: JournalEntry[];
  wearableActivity: WearableActivity | null;
  weeklyBudget: number;
  marketPrices: MarketPrices;
  kitchenTools: string[];
  sharedListInviteCode: string | null;
  grocery: GroceryItem[];
  weeklyPlan: WeeklyMeal[];
  profile: Profile;
  onboardingComplete: boolean;
  hydrated: boolean;
  toggleFavorite: (id: string) => void;
  addPantryItem: (name: string) => void;
  removePantryItem: (name: string) => void;
  toggleFavoriteIngredient: (name: string) => void;
  setExpiryPriority: (name: string, days: number) => void;
  updatePantryStock: (name: string, patch: Partial<Pick<PantryMeta, "quantity" | "unit" | "lowStockThreshold">>) => void;
  consumeRecipeFromPantry: (ingredients: string[], portions: number) => string[];
  recordScan: (scan: { ingredients: { name: string }[]; suggestedPrompt: string }) => void;
  removeScan: (id: string) => void;
  addFamilyMember: (name: string) => void;
  addFamilyProfile: (profile: Omit<FamilyProfile, "id">) => void;
  setRecipeFeedback: (recipeId: string, feedback: RecipeFeedback) => void;
  addJournalEntry: (recipeId: string, note: string, photoUri?: string) => void;
  setWearableActivity: (activity: WearableActivity | null) => void;
  setWeeklyBudget: (amount: number) => void;
  updateMarketPrice: (locale: CuisineLocale, category: MarketCategoryKey, amount: number) => void;
  setSharedListInviteCode: (code: string | null) => void;
  toggleKitchenTool: (tool: string) => void;
  toggleGrocery: (name: string) => void;
  addRecipeToPlan: (id: string) => void;
  createGroceryFromPlan: () => void;
  createPersonalWeeklyPlan: () => void;
  replaceWeeklyMeal: (day: string, currentRecipeId: string) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  completeOnboarding: (profile: Profile) => void;
};

const STORAGE_KEY = "lezzetai:state:v1";
const LezzetContext = createContext<LezzetContextValue | null>(null);

export function LezzetProvider({ children }: PropsWithChildren) {
  const [favorites, setFavorites] = useState<string[]>(["yesil-enerji-kasesi"]);
  const [pantry, setPantry] = useState<string[]>(initialPantry);
  const [grocery, setGrocery] = useState<GroceryItem[]>(buildGroceryList(initialWeeklyPlan.map((item) => item.recipeId)));
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyMeal[]>(initialWeeklyPlan);
  const [profile, setProfile] = useState<Profile>({ goal: "Dengeli beslenme", people: 2, calories: 1850, allergies: ["Fıstık"], locale: defaultCuisineLocale, dietaryPreferences: [] });
  const [pantryMeta, setPantryMeta] = useState<Record<string, PantryMeta>>({ Roka: { ...defaultPantryStockMeta, favorite: true, expiresInDays: 1, quantity: 2, lowStockThreshold: 1 }, Domates: { ...defaultPantryStockMeta, expiresInDays: 2, quantity: 5, lowStockThreshold: 2 }, Yoğurt: { ...defaultPantryStockMeta, expiresInDays: 4, quantity: 500, unit: "g", lowStockThreshold: 150 }, Limon: { ...defaultPantryStockMeta, favorite: true, expiresInDays: 6, quantity: 3, lowStockThreshold: 1 } });
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([{ id: "deniz", name: "Deniz", color: "#1E4D3A" }, { id: "ayse", name: "Ayşe", color: "#B7652E" }]);
  const [familyProfiles, setFamilyProfiles] = useState<FamilyProfile[]>([{ id: "deniz", name: "Deniz", goal: "Dengeli beslenme", allergies: ["Fıstık"] }]);
  const [recipeFeedback, setRecipeFeedbackState] = useState<Record<string, RecipeFeedback>>({});
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [wearableActivity, setWearableActivityState] = useState<WearableActivity | null>(null);
  const [weeklyBudget, setWeeklyBudget] = useState(1200);
  const [marketPrices, setMarketPrices] = useState<MarketPrices>(makeDefaultMarketPrices);
  const [kitchenTools, setKitchenTools] = useState<string[]>([]);
  const [sharedListInviteCode, setSharedListInviteCode] = useState<string | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw) as Partial<{ favorites: string[]; pantry: string[]; pantryMeta: Record<string, PantryMeta>; scanHistory: ScanHistoryItem[]; familyMembers: FamilyMember[]; familyProfiles: FamilyProfile[]; recipeFeedback: Record<string, RecipeFeedback>; journalEntries: JournalEntry[]; wearableActivity: WearableActivity | null; weeklyBudget: number; marketPrices: Partial<MarketPrices>; kitchenTools: string[]; sharedListInviteCode: string | null; grocery: GroceryItem[]; weeklyPlan: WeeklyMeal[]; profile: Profile; onboardingComplete: boolean }>;
        if (saved.favorites) setFavorites(saved.favorites);
        if (saved.pantry) setPantry(saved.pantry);
        if (saved.grocery) setGrocery(saved.grocery);
        if (saved.weeklyPlan) setWeeklyPlan(saved.weeklyPlan);
        if (saved.profile) setProfile({ ...saved.profile, locale: isCuisineLocale(saved.profile.locale) ? saved.profile.locale : defaultCuisineLocale, dietaryPreferences: saved.profile.dietaryPreferences ?? [] });
        if (saved.pantryMeta) setPantryMeta(Object.fromEntries(Object.entries(saved.pantryMeta).map(([name, meta]) => [name, { ...defaultPantryStockMeta, ...meta }])));
        if (saved.scanHistory) setScanHistory(saved.scanHistory);
        if (saved.familyMembers) setFamilyMembers(saved.familyMembers);
        if (saved.familyProfiles) setFamilyProfiles(saved.familyProfiles);
        if (saved.recipeFeedback) setRecipeFeedbackState(saved.recipeFeedback);
        if (saved.journalEntries) setJournalEntries(saved.journalEntries);
        if (saved.wearableActivity) setWearableActivityState(saved.wearableActivity);
        if (saved.weeklyBudget) setWeeklyBudget(saved.weeklyBudget);
        if (saved.marketPrices) setMarketPrices((current) => ({ ...current, ...saved.marketPrices, "tr-TR": { ...current["tr-TR"], ...saved.marketPrices?.["tr-TR"] }, "en-GB": { ...current["en-GB"], ...saved.marketPrices?.["en-GB"] }, "de-DE": { ...current["de-DE"], ...saved.marketPrices?.["de-DE"] }, "es-ES": { ...current["es-ES"], ...saved.marketPrices?.["es-ES"] }, "fr-FR": { ...current["fr-FR"], ...saved.marketPrices?.["fr-FR"] } }));
        if (saved.kitchenTools) setKitchenTools(saved.kitchenTools);
        if (saved.sharedListInviteCode) setSharedListInviteCode(saved.sharedListInviteCode);
        if (saved.onboardingComplete) setOnboardingComplete(true);
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const snapshot = JSON.stringify({ favorites, pantry, pantryMeta, scanHistory, familyMembers, familyProfiles, recipeFeedback, journalEntries, wearableActivity, weeklyBudget, marketPrices, kitchenTools, sharedListInviteCode, grocery, weeklyPlan, profile, onboardingComplete });
    AsyncStorage.setItem(STORAGE_KEY, snapshot).catch(() => undefined);
  }, [familyMembers, familyProfiles, favorites, grocery, hydrated, journalEntries, kitchenTools, marketPrices, onboardingComplete, pantry, pantryMeta, profile, recipeFeedback, scanHistory, sharedListInviteCode, wearableActivity, weeklyBudget, weeklyPlan]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }, []);

  const addPantryItem = useCallback((name: string) => {
    const cleanName = name.trim();
    if (!cleanName) return;
    setPantry((current) => (current.some((item) => item.toLocaleLowerCase("tr-TR") === cleanName.toLocaleLowerCase("tr-TR")) ? current : [...current, cleanName]));
    setPantryMeta((current) => current[cleanName] ? current : { ...current, [cleanName]: { ...defaultPantryStockMeta } });
  }, []);

  const removePantryItem = useCallback((name: string) => { setPantry((current) => current.filter((item) => item !== name)); setPantryMeta((current) => { const { [name]: _, ...rest } = current; return rest; }); }, []);
  const toggleFavoriteIngredient = useCallback((name: string) => setPantryMeta((current) => ({ ...current, [name]: { ...defaultPantryStockMeta, ...current[name], favorite: !current[name]?.favorite } })), []);
  const setExpiryPriority = useCallback((name: string, days: number) => setPantryMeta((current) => ({ ...current, [name]: { ...defaultPantryStockMeta, ...current[name], expiresInDays: days } })), []);
  const updatePantryStock = useCallback((name: string, patch: Partial<Pick<PantryMeta, "quantity" | "unit" | "lowStockThreshold">>) => setPantryMeta((current) => ({ ...current, [name]: { ...defaultPantryStockMeta, ...current[name], ...patch, quantity: Math.max(0, patch.quantity ?? current[name]?.quantity ?? defaultPantryStockMeta.quantity), lowStockThreshold: Math.max(0, patch.lowStockThreshold ?? current[name]?.lowStockThreshold ?? defaultPantryStockMeta.lowStockThreshold) } })), []);
  const consumeRecipeFromPantry = useCallback((ingredients: string[], portions: number) => {
    const consumable = findConsumablePantryItems(ingredients, pantry);
    setPantryMeta((current) => ({ ...current, ...Object.fromEntries(consumable.map((name) => { const item = { ...defaultPantryStockMeta, ...current[name] }; return [name, { ...item, quantity: Math.max(0, item.quantity - getStockUsageAmount(portions, item.unit)), uses: item.uses + 1 }]; })) }));
    return consumable;
  }, [pantry]);
  const recordScan = useCallback((scan: { ingredients: { name: string }[]; suggestedPrompt: string }) => setScanHistory((current) => [{ id: `${Date.now()}`, ingredients: scan.ingredients.map((item) => item.name).slice(0, 8), createdAt: "Az önce", recipePrompt: scan.suggestedPrompt }, ...current].slice(0, 8)), []);
  const removeScan = useCallback((id: string) => setScanHistory((current) => current.filter((scan) => scan.id !== id)), []);
  const addFamilyMember = useCallback((name: string) => { const cleanName = name.trim(); if (!cleanName) return; setFamilyMembers((current) => current.some((member) => member.name.toLocaleLowerCase("tr-TR") === cleanName.toLocaleLowerCase("tr-TR")) ? current : [...current, { id: `${Date.now()}`, name: cleanName, color: "#6B756F" }]); }, []);
  const addFamilyProfile = useCallback((next: Omit<FamilyProfile, "id">) => setFamilyProfiles((current) => [...current, { ...next, id: `${Date.now()}` }]), []);
  const setRecipeFeedback = useCallback((recipeId: string, feedback: RecipeFeedback) => setRecipeFeedbackState((current) => ({ ...current, [recipeId]: { ...current[recipeId], ...feedback } })), []);
  const addJournalEntry = useCallback((recipeId: string, note: string, photoUri?: string) => setJournalEntries((current) => [{ id: `${Date.now()}`, recipeId, note: note.trim() || "Tarif başarıyla pişirildi.", photoUri, createdAt: "Bugün" }, ...current].slice(0, 30)), []);
  const setWearableActivity = useCallback((activity: WearableActivity | null) => setWearableActivityState(activity), []);
  const updateMarketPrice = useCallback((locale: CuisineLocale, category: MarketCategoryKey, amount: number) => setMarketPrices((current) => ({ ...current, [locale]: { ...current[locale], [category]: Math.max(0, Math.round(amount)) } })), []);
  const toggleKitchenTool = useCallback((tool: string) => setKitchenTools((current) => current.includes(tool) ? current.filter((item) => item !== tool) : [...current, tool]), []);
  const toggleGrocery = useCallback((name: string) => setGrocery((current) => current.map((item) => (item.name === name ? { ...item, checked: !item.checked, updatedBy: "Deniz", updatedAt: "az önce" } : item))), []);

  const addRecipeToPlan = useCallback((recipeId: string) => {
    setWeeklyPlan((current) => {
      if (current.some((item) => item.recipeId === recipeId)) return current;
      return [...current, { day: "Cmt", meal: "Akşam", recipeId }];
    });
  }, []);

  const createGroceryFromPlan = useCallback(() => setGrocery(buildGroceryList(weeklyPlan.map((item) => item.recipeId))), [weeklyPlan]);
  const createPersonalWeeklyPlan = useCallback(() => setWeeklyPlan(buildPersonalWeeklyPlan({ pantry, favoriteIngredients: pantry.filter((item) => pantryMeta[item]?.favorite), goal: profile.goal, allergies: profile.allergies, kitchenTools, locale: profile.locale, dietaryPreferences: profile.dietaryPreferences })), [kitchenTools, pantry, pantryMeta, profile.allergies, profile.dietaryPreferences, profile.goal, profile.locale]);
  const replaceWeeklyMeal = useCallback((day: string, currentRecipeId: string) => setWeeklyPlan((current) => {
    const input = { pantry, favoriteIngredients: pantry.filter((item) => pantryMeta[item]?.favorite), goal: profile.goal, allergies: profile.allergies, kitchenTools, locale: profile.locale, dietaryPreferences: profile.dietaryPreferences };
    const replacement = getPersonalRecipeAlternative(input, currentRecipeId, current.map((item) => item.recipeId));
    return current.map((item) => item.day === day && item.recipeId === currentRecipeId ? { ...item, recipeId: replacement } : item);
  }), [kitchenTools, pantry, pantryMeta, profile.allergies, profile.dietaryPreferences, profile.goal, profile.locale]);
  const updateProfile = useCallback((patch: Partial<Profile>) => setProfile((current) => ({ ...current, ...patch })), []);
  const completeOnboarding = useCallback((nextProfile: Profile) => { setProfile(nextProfile); setOnboardingComplete(true); }, []);

  const value = useMemo(() => ({ favorites, pantry, pantryMeta, scanHistory, familyMembers, familyProfiles, recipeFeedback, journalEntries, wearableActivity, weeklyBudget, marketPrices, kitchenTools, sharedListInviteCode, grocery, weeklyPlan, profile, onboardingComplete, hydrated, toggleFavorite, addPantryItem, removePantryItem, toggleFavoriteIngredient, setExpiryPriority, updatePantryStock, consumeRecipeFromPantry, recordScan, removeScan, addFamilyMember, addFamilyProfile, setRecipeFeedback, addJournalEntry, setWearableActivity, setWeeklyBudget, updateMarketPrice, setSharedListInviteCode, toggleKitchenTool, toggleGrocery, addRecipeToPlan, createGroceryFromPlan, createPersonalWeeklyPlan, replaceWeeklyMeal, updateProfile, completeOnboarding }), [addFamilyMember, addFamilyProfile, addJournalEntry, addPantryItem, addRecipeToPlan, completeOnboarding, consumeRecipeFromPantry, createGroceryFromPlan, createPersonalWeeklyPlan, familyMembers, familyProfiles, favorites, grocery, hydrated, journalEntries, kitchenTools, marketPrices, onboardingComplete, pantry, pantryMeta, profile, recipeFeedback, recordScan, removePantryItem, removeScan, replaceWeeklyMeal, setExpiryPriority, setRecipeFeedback, setSharedListInviteCode, setWearableActivity, toggleFavorite, toggleFavoriteIngredient, toggleGrocery, toggleKitchenTool, updateMarketPrice, updatePantryStock, updateProfile, wearableActivity, weeklyBudget, weeklyPlan]);

  return <LezzetContext.Provider value={value}>{children}</LezzetContext.Provider>;
}

export function useLezzet() {
  const value = useContext(LezzetContext);
  if (!value) throw new Error("useLezzet must be used within LezzetProvider");
  return value;
}
