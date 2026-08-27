import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

import { buildGroceryList, buildPersonalWeeklyPlan, getPersonalRecipeAlternative, initialPantry, initialWeeklyPlan } from "@/lib/lezzet-data";
import { defaultCuisineLocale, getCuisineProfile, isCuisineLocale, type CuisineLocale } from "@/lib/cuisine-locale";
import { getDefaultMarketPrices, type DietaryPreference, type MarketCategoryKey } from "@/lib/seasonal-market";
import { defaultPantryStockMeta, findConsumablePantryItems, getDaysUntilDate, getLowStockShoppingSeeds, getStockUsageAmount, type PantryStockMeta, type StockUnit } from "@/lib/pantry-insights";
import type { ReceiptPurchase } from "@/lib/spending-insights";
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
  receiptPurchases: ReceiptPurchase[];
  kitchenTools: string[];
  sharedListInviteCode: string | null;
  grocery: GroceryItem[];
  weeklyPlan: WeeklyMeal[];
  profile: Profile;
  onboardingComplete: boolean;
  hydrated: boolean;
  toggleFavorite: (id: string) => void;
  addPantryItem: (name: string) => void;
  addPantryItems: (items: { name: string; quantity?: number; unit?: StockUnit; expiresOn?: string }[]) => void;
  resetPantry: () => void;
  loadRegionalSamplePantry: () => void;
  removePantryItem: (name: string) => void;
  toggleFavoriteIngredient: (name: string) => void;
  setExpiryPriority: (name: string, days: number) => void;
  setExpiryDate: (name: string, expiresOn: string) => void;
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
  recordReceiptPurchases: (items: Omit<ReceiptPurchase, "id" | "purchasedOn">[], purchasedOn?: string) => void;
  setSharedListInviteCode: (code: string | null) => void;
  toggleKitchenTool: (tool: string) => void;
  toggleGrocery: (name: string) => void;
  addRecipeToPlan: (id: string) => void;
  createGroceryFromPlan: () => void;
  addLowStockToGrocery: () => string[];
  createPersonalWeeklyPlan: () => void;
  applyPantryWeeklyIdeas: (recipeIds: string[]) => void;
  replaceWeeklyMeal: (day: string, currentRecipeId: string) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  completeOnboarding: (profile: Profile, samplePantry?: string[]) => void;
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
  const [receiptPurchases, setReceiptPurchases] = useState<ReceiptPurchase[]>([]);
  const [kitchenTools, setKitchenTools] = useState<string[]>([]);
  const [sharedListInviteCode, setSharedListInviteCode] = useState<string | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw) as Partial<{ favorites: string[]; pantry: string[]; pantryMeta: Record<string, PantryMeta>; scanHistory: ScanHistoryItem[]; familyMembers: FamilyMember[]; familyProfiles: FamilyProfile[]; recipeFeedback: Record<string, RecipeFeedback>; journalEntries: JournalEntry[]; wearableActivity: WearableActivity | null; weeklyBudget: number; marketPrices: Partial<MarketPrices>; receiptPurchases: ReceiptPurchase[]; kitchenTools: string[]; sharedListInviteCode: string | null; grocery: GroceryItem[]; weeklyPlan: WeeklyMeal[]; profile: Profile; onboardingComplete: boolean }>;
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
        if (saved.receiptPurchases) setReceiptPurchases(saved.receiptPurchases.slice(0, 240));
        if (saved.kitchenTools) setKitchenTools(saved.kitchenTools);
        if (saved.sharedListInviteCode) setSharedListInviteCode(saved.sharedListInviteCode);
        if (saved.onboardingComplete) setOnboardingComplete(true);
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const snapshot = JSON.stringify({ favorites, pantry, pantryMeta, scanHistory, familyMembers, familyProfiles, recipeFeedback, journalEntries, wearableActivity, weeklyBudget, marketPrices, receiptPurchases, kitchenTools, sharedListInviteCode, grocery, weeklyPlan, profile, onboardingComplete });
    AsyncStorage.setItem(STORAGE_KEY, snapshot).catch(() => undefined);
  }, [familyMembers, familyProfiles, favorites, grocery, hydrated, journalEntries, kitchenTools, marketPrices, onboardingComplete, pantry, pantryMeta, profile, receiptPurchases, recipeFeedback, scanHistory, sharedListInviteCode, wearableActivity, weeklyBudget, weeklyPlan]);

  useEffect(() => {
    if (!hydrated) return;
    const lowStock = getLowStockShoppingSeeds(pantry, pantryMeta);
    if (!lowStock.length) return;
    setGrocery((current) => {
      const additions = lowStock.filter((name) => !current.some((item) => item.name.toLocaleLowerCase("tr-TR") === name.toLocaleLowerCase("tr-TR")));
      return additions.length ? [...current, ...additions.map((name) => ({ name, checked: false, updatedBy: "Akıllı kiler", updatedAt: "az önce" }))] : current;
    });
  }, [hydrated, pantry, pantryMeta]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }, []);

  const addPantryItem = useCallback((name: string) => {
    const cleanName = name.trim();
    if (!cleanName) return;
    setPantry((current) => (current.some((item) => item.toLocaleLowerCase("tr-TR") === cleanName.toLocaleLowerCase("tr-TR")) ? current : [...current, cleanName]));
    setPantryMeta((current) => current[cleanName] ? current : { ...current, [cleanName]: { ...defaultPantryStockMeta } });
  }, []);

  const addPantryItems = useCallback((items: { name: string; quantity?: number; unit?: StockUnit; expiresOn?: string }[]) => {
    const cleanItems = items.map((item) => ({ ...item, name: item.name.trim().slice(0, 60) })).filter((item) => item.name.length > 0).slice(0, 40);
    if (!cleanItems.length) return;
    setPantry((current) => cleanItems.reduce<string[]>((next, item) => next.some((name) => name.toLocaleLowerCase("tr-TR") === item.name.toLocaleLowerCase("tr-TR")) ? next : [...next, item.name], current));
    setPantryMeta((current) => cleanItems.reduce<Record<string, PantryMeta>>((next, item) => {
      const existingName = Object.keys(next).find((name) => name.toLocaleLowerCase("tr-TR") === item.name.toLocaleLowerCase("tr-TR"));
      const key = existingName ?? item.name;
      const prior = { ...defaultPantryStockMeta, ...next[key] };
      const expiresInDays = item.expiresOn ? (getDaysUntilDate(item.expiresOn) ?? prior.expiresInDays) : prior.expiresInDays;
      return { ...next, [key]: { ...prior, quantity: Math.max(0, prior.quantity + Math.max(0, item.quantity ?? 1)), unit: item.unit ?? prior.unit, expiresOn: item.expiresOn ?? prior.expiresOn, expiresInDays } };
    }, current));
  }, []);

  const removePantryItem = useCallback((name: string) => { setPantry((current) => current.filter((item) => item !== name)); setPantryMeta((current) => { const { [name]: _, ...rest } = current; return rest; }); }, []);
  const toggleFavoriteIngredient = useCallback((name: string) => setPantryMeta((current) => ({ ...current, [name]: { ...defaultPantryStockMeta, ...current[name], favorite: !current[name]?.favorite } })), []);
  const setExpiryPriority = useCallback((name: string, days: number) => setPantryMeta((current) => ({ ...current, [name]: { ...defaultPantryStockMeta, ...current[name], expiresInDays: days } })), []);
  const setExpiryDate = useCallback((name: string, expiresOn: string) => setPantryMeta((current) => {
    const currentMeta = { ...defaultPantryStockMeta, ...current[name] };
    return { ...current, [name]: { ...currentMeta, expiresOn, expiresInDays: getDaysUntilDate(expiresOn) ?? currentMeta.expiresInDays } };
  }), []);
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
  const recordReceiptPurchases = useCallback((items: Omit<ReceiptPurchase, "id" | "purchasedOn">[], requestedDate?: string) => {
    const purchasedOn = requestedDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) ? requestedDate : new Date().toISOString().slice(0, 10);
    const clean = items.filter((item) => item.name.trim().length > 0 && Number.isFinite(item.amount) && item.amount >= 0).slice(0, 40).map((item, index) => ({ ...item, id: `${Date.now()}-${index}`, name: item.name.trim().slice(0, 180), amount: Math.round(item.amount * 100) / 100, purchasedOn }));
    if (clean.length) setReceiptPurchases((current) => [...clean, ...current].slice(0, 240));
  }, []);
  const toggleKitchenTool = useCallback((tool: string) => setKitchenTools((current) => current.includes(tool) ? current.filter((item) => item !== tool) : [...current, tool]), []);
  const toggleGrocery = useCallback((name: string) => setGrocery((current) => current.map((item) => (item.name === name ? { ...item, checked: !item.checked, updatedBy: "Deniz", updatedAt: "az önce" } : item))), []);

  const addRecipeToPlan = useCallback((recipeId: string) => {
    setWeeklyPlan((current) => {
      if (current.some((item) => item.recipeId === recipeId)) return current;
      return [...current, { day: "Cmt", meal: "Akşam", recipeId }];
    });
  }, []);

  const createGroceryFromPlan = useCallback(() => setGrocery(buildGroceryList(weeklyPlan.map((item) => item.recipeId))), [weeklyPlan]);
  const addLowStockToGrocery = useCallback(() => {
    const seeds = getLowStockShoppingSeeds(pantry, pantryMeta);
    if (!seeds.length) return seeds;
    setGrocery((current) => [...current, ...seeds.filter((name) => !current.some((item) => item.name.toLocaleLowerCase("tr-TR") === name.toLocaleLowerCase("tr-TR"))).map((name) => ({ name, checked: false, updatedBy: "Akıllı kiler", updatedAt: "az önce" }))]);
    return seeds;
  }, [pantry, pantryMeta]);
  const createPersonalWeeklyPlan = useCallback(() => setWeeklyPlan(buildPersonalWeeklyPlan({ pantry, favoriteIngredients: pantry.filter((item) => pantryMeta[item]?.favorite), goal: profile.goal, allergies: profile.allergies, kitchenTools, locale: profile.locale, dietaryPreferences: profile.dietaryPreferences })), [kitchenTools, pantry, pantryMeta, profile.allergies, profile.dietaryPreferences, profile.goal, profile.locale]);
  const applyPantryWeeklyIdeas = useCallback((recipeIds: string[]) => {
    const cuisine = getCuisineProfile(profile.locale);
    const cleanIds = recipeIds.filter((id) => typeof id === "string" && id.trim().length > 0).slice(0, 7);
    if (!cleanIds.length) return;
    setWeeklyPlan(cleanIds.map((recipeId, index) => ({ day: cuisine.days[index], meal: cuisine.meals[index], recipeId })));
  }, [profile.locale]);
  const replaceWeeklyMeal = useCallback((day: string, currentRecipeId: string) => setWeeklyPlan((current) => {
    const input = { pantry, favoriteIngredients: pantry.filter((item) => pantryMeta[item]?.favorite), goal: profile.goal, allergies: profile.allergies, kitchenTools, locale: profile.locale, dietaryPreferences: profile.dietaryPreferences };
    const replacement = getPersonalRecipeAlternative(input, currentRecipeId, current.map((item) => item.recipeId));
    return current.map((item) => item.day === day && item.recipeId === currentRecipeId ? { ...item, recipeId: replacement } : item);
  }), [kitchenTools, pantry, pantryMeta, profile.allergies, profile.dietaryPreferences, profile.goal, profile.locale]);
  const updateProfile = useCallback((patch: Partial<Profile>) => setProfile((current) => ({ ...current, ...patch })), []);
  const resetPantry = useCallback(() => {
    setPantry([]);
    setPantryMeta({});
  }, []);
  const loadRegionalSamplePantry = useCallback(() => {
    const samplePantry = Array.from(getCuisineProfile(profile.locale).pantryHighlights);
    setPantry(samplePantry);
    setPantryMeta(Object.fromEntries(samplePantry.map((name) => [name, { ...defaultPantryStockMeta, quantity: 1, unit: "adet" as const }])));
    setWeeklyPlan(buildPersonalWeeklyPlan({ pantry: samplePantry, favoriteIngredients: [], goal: profile.goal, allergies: profile.allergies, kitchenTools, locale: profile.locale, dietaryPreferences: profile.dietaryPreferences }));
  }, [kitchenTools, profile.allergies, profile.dietaryPreferences, profile.goal, profile.locale]);
  const completeOnboarding = useCallback((nextProfile: Profile, samplePantry: string[] = []) => {
    const cleanPantry = Array.from(new Set(samplePantry.map((item) => item.trim()).filter(Boolean))).slice(0, 12);
    setProfile(nextProfile);
    setPantry(cleanPantry);
    setPantryMeta(Object.fromEntries(cleanPantry.map((name) => [name, { ...defaultPantryStockMeta, quantity: 1, unit: "adet" as const }])));
    setWeeklyPlan(buildPersonalWeeklyPlan({ pantry: cleanPantry, favoriteIngredients: [], goal: nextProfile.goal, allergies: nextProfile.allergies, kitchenTools: [], locale: nextProfile.locale, dietaryPreferences: nextProfile.dietaryPreferences }));
    setOnboardingComplete(true);
  }, []);

  const value = useMemo(() => ({ favorites, pantry, pantryMeta, scanHistory, familyMembers, familyProfiles, recipeFeedback, journalEntries, wearableActivity, weeklyBudget, marketPrices, receiptPurchases, kitchenTools, sharedListInviteCode, grocery, weeklyPlan, profile, onboardingComplete, hydrated, toggleFavorite, addPantryItem, addPantryItems, resetPantry, loadRegionalSamplePantry, removePantryItem, toggleFavoriteIngredient, setExpiryPriority, setExpiryDate, updatePantryStock, consumeRecipeFromPantry, recordScan, removeScan, addFamilyMember, addFamilyProfile, setRecipeFeedback, addJournalEntry, setWearableActivity, setWeeklyBudget, updateMarketPrice, recordReceiptPurchases, setSharedListInviteCode, toggleKitchenTool, toggleGrocery, addRecipeToPlan, createGroceryFromPlan, addLowStockToGrocery, createPersonalWeeklyPlan, applyPantryWeeklyIdeas, replaceWeeklyMeal, updateProfile, completeOnboarding }), [addFamilyMember, addFamilyProfile, addJournalEntry, addLowStockToGrocery, addPantryItem, addPantryItems, addRecipeToPlan, applyPantryWeeklyIdeas, completeOnboarding, consumeRecipeFromPantry, createGroceryFromPlan, createPersonalWeeklyPlan, familyMembers, familyProfiles, favorites, grocery, hydrated, journalEntries, kitchenTools, loadRegionalSamplePantry, marketPrices, onboardingComplete, pantry, pantryMeta, profile, receiptPurchases, recordReceiptPurchases, recipeFeedback, recordScan, removePantryItem, removeScan, replaceWeeklyMeal, resetPantry, setExpiryDate, setExpiryPriority, setRecipeFeedback, setSharedListInviteCode, setWearableActivity, toggleFavorite, toggleFavoriteIngredient, toggleGrocery, toggleKitchenTool, updateMarketPrice, updatePantryStock, updateProfile, wearableActivity, weeklyBudget, weeklyPlan]);

  return <LezzetContext.Provider value={value}>{children}</LezzetContext.Provider>;
}

export function useLezzet() {
  const value = useContext(LezzetContext);
  if (!value) throw new Error("useLezzet must be used within LezzetProvider");
  return value;
}
