import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

import { buildGroceryList, initialPantry, initialWeeklyPlan } from "@/lib/lezzet-data";

type GroceryItem = { name: string; checked: boolean; updatedBy?: string; updatedAt?: string };
type WeeklyMeal = { day: string; meal: string; recipeId: string };
type Profile = { goal: string; people: number; calories: number; allergies: string[] };
type PantryMeta = { favorite: boolean; expiresInDays: number };
type ScanHistoryItem = { id: string; ingredients: string[]; createdAt: string; recipePrompt: string };
type FamilyMember = { id: string; name: string; color: string };

type LezzetContextValue = {
  favorites: string[];
  pantry: string[];
  pantryMeta: Record<string, PantryMeta>;
  scanHistory: ScanHistoryItem[];
  familyMembers: FamilyMember[];
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
  recordScan: (scan: { ingredients: { name: string }[]; suggestedPrompt: string }) => void;
  removeScan: (id: string) => void;
  addFamilyMember: (name: string) => void;
  toggleGrocery: (name: string) => void;
  addRecipeToPlan: (id: string) => void;
  createGroceryFromPlan: () => void;
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
  const [profile, setProfile] = useState<Profile>({ goal: "Dengeli beslenme", people: 2, calories: 1850, allergies: ["Fıstık"] });
  const [pantryMeta, setPantryMeta] = useState<Record<string, PantryMeta>>({ Roka: { favorite: true, expiresInDays: 1 }, Domates: { favorite: false, expiresInDays: 2 }, Yoğurt: { favorite: false, expiresInDays: 4 }, Limon: { favorite: true, expiresInDays: 6 } });
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([{ id: "deniz", name: "Deniz", color: "#1E4D3A" }, { id: "ayse", name: "Ayşe", color: "#B7652E" }]);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw) as Partial<{ favorites: string[]; pantry: string[]; pantryMeta: Record<string, PantryMeta>; scanHistory: ScanHistoryItem[]; familyMembers: FamilyMember[]; grocery: GroceryItem[]; weeklyPlan: WeeklyMeal[]; profile: Profile; onboardingComplete: boolean }>;
        if (saved.favorites) setFavorites(saved.favorites);
        if (saved.pantry) setPantry(saved.pantry);
        if (saved.grocery) setGrocery(saved.grocery);
        if (saved.weeklyPlan) setWeeklyPlan(saved.weeklyPlan);
        if (saved.profile) setProfile(saved.profile);
        if (saved.pantryMeta) setPantryMeta(saved.pantryMeta);
        if (saved.scanHistory) setScanHistory(saved.scanHistory);
        if (saved.familyMembers) setFamilyMembers(saved.familyMembers);
        if (saved.onboardingComplete) setOnboardingComplete(true);
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const snapshot = JSON.stringify({ favorites, pantry, pantryMeta, scanHistory, familyMembers, grocery, weeklyPlan, profile, onboardingComplete });
    AsyncStorage.setItem(STORAGE_KEY, snapshot).catch(() => undefined);
  }, [familyMembers, favorites, grocery, hydrated, onboardingComplete, pantry, pantryMeta, profile, scanHistory, weeklyPlan]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }, []);

  const addPantryItem = useCallback((name: string) => {
    const cleanName = name.trim();
    if (!cleanName) return;
    setPantry((current) => (current.some((item) => item.toLocaleLowerCase("tr-TR") === cleanName.toLocaleLowerCase("tr-TR")) ? current : [...current, cleanName]));
    setPantryMeta((current) => current[cleanName] ? current : { ...current, [cleanName]: { favorite: false, expiresInDays: 5 } });
  }, []);

  const removePantryItem = useCallback((name: string) => { setPantry((current) => current.filter((item) => item !== name)); setPantryMeta((current) => { const { [name]: _, ...rest } = current; return rest; }); }, []);
  const toggleFavoriteIngredient = useCallback((name: string) => setPantryMeta((current) => ({ ...current, [name]: { favorite: !current[name]?.favorite, expiresInDays: current[name]?.expiresInDays ?? 5 } })), []);
  const setExpiryPriority = useCallback((name: string, days: number) => setPantryMeta((current) => ({ ...current, [name]: { favorite: current[name]?.favorite ?? false, expiresInDays: days } })), []);
  const recordScan = useCallback((scan: { ingredients: { name: string }[]; suggestedPrompt: string }) => setScanHistory((current) => [{ id: `${Date.now()}`, ingredients: scan.ingredients.map((item) => item.name).slice(0, 8), createdAt: "Az önce", recipePrompt: scan.suggestedPrompt }, ...current].slice(0, 8)), []);
  const removeScan = useCallback((id: string) => setScanHistory((current) => current.filter((scan) => scan.id !== id)), []);
  const addFamilyMember = useCallback((name: string) => { const cleanName = name.trim(); if (!cleanName) return; setFamilyMembers((current) => current.some((member) => member.name.toLocaleLowerCase("tr-TR") === cleanName.toLocaleLowerCase("tr-TR")) ? current : [...current, { id: `${Date.now()}`, name: cleanName, color: "#6B756F" }]); }, []);
  const toggleGrocery = useCallback((name: string) => setGrocery((current) => current.map((item) => (item.name === name ? { ...item, checked: !item.checked, updatedBy: "Deniz", updatedAt: "az önce" } : item))), []);

  const addRecipeToPlan = useCallback((recipeId: string) => {
    setWeeklyPlan((current) => {
      if (current.some((item) => item.recipeId === recipeId)) return current;
      return [...current, { day: "Cmt", meal: "Akşam", recipeId }];
    });
  }, []);

  const createGroceryFromPlan = useCallback(() => setGrocery(buildGroceryList(weeklyPlan.map((item) => item.recipeId))), [weeklyPlan]);
  const updateProfile = useCallback((patch: Partial<Profile>) => setProfile((current) => ({ ...current, ...patch })), []);
  const completeOnboarding = useCallback((nextProfile: Profile) => { setProfile(nextProfile); setOnboardingComplete(true); }, []);

  const value = useMemo(() => ({ favorites, pantry, pantryMeta, scanHistory, familyMembers, grocery, weeklyPlan, profile, onboardingComplete, hydrated, toggleFavorite, addPantryItem, removePantryItem, toggleFavoriteIngredient, setExpiryPriority, recordScan, removeScan, addFamilyMember, toggleGrocery, addRecipeToPlan, createGroceryFromPlan, updateProfile, completeOnboarding }), [addFamilyMember, addPantryItem, addRecipeToPlan, completeOnboarding, createGroceryFromPlan, familyMembers, favorites, grocery, hydrated, onboardingComplete, pantry, pantryMeta, profile, recordScan, removePantryItem, removeScan, setExpiryPriority, scanHistory, toggleFavorite, toggleFavoriteIngredient, toggleGrocery, updateProfile, weeklyPlan]);

  return <LezzetContext.Provider value={value}>{children}</LezzetContext.Provider>;
}

export function useLezzet() {
  const value = useContext(LezzetContext);
  if (!value) throw new Error("useLezzet must be used within LezzetProvider");
  return value;
}
