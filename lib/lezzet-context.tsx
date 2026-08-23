import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

import { buildGroceryList, initialPantry, initialWeeklyPlan } from "@/lib/lezzet-data";

type GroceryItem = { name: string; checked: boolean };
type WeeklyMeal = { day: string; meal: string; recipeId: string };
type Profile = { goal: string; people: number; calories: number; allergies: string[] };

type LezzetContextValue = {
  favorites: string[];
  pantry: string[];
  grocery: GroceryItem[];
  weeklyPlan: WeeklyMeal[];
  profile: Profile;
  onboardingComplete: boolean;
  hydrated: boolean;
  toggleFavorite: (id: string) => void;
  addPantryItem: (name: string) => void;
  removePantryItem: (name: string) => void;
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
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw) as Partial<{ favorites: string[]; pantry: string[]; grocery: GroceryItem[]; weeklyPlan: WeeklyMeal[]; profile: Profile; onboardingComplete: boolean }>;
        if (saved.favorites) setFavorites(saved.favorites);
        if (saved.pantry) setPantry(saved.pantry);
        if (saved.grocery) setGrocery(saved.grocery);
        if (saved.weeklyPlan) setWeeklyPlan(saved.weeklyPlan);
        if (saved.profile) setProfile(saved.profile);
        if (saved.onboardingComplete) setOnboardingComplete(true);
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const snapshot = JSON.stringify({ favorites, pantry, grocery, weeklyPlan, profile, onboardingComplete });
    AsyncStorage.setItem(STORAGE_KEY, snapshot).catch(() => undefined);
  }, [favorites, grocery, hydrated, onboardingComplete, pantry, profile, weeklyPlan]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }, []);

  const addPantryItem = useCallback((name: string) => {
    const cleanName = name.trim();
    if (!cleanName) return;
    setPantry((current) => (current.some((item) => item.toLocaleLowerCase("tr-TR") === cleanName.toLocaleLowerCase("tr-TR")) ? current : [...current, cleanName]));
  }, []);

  const removePantryItem = useCallback((name: string) => setPantry((current) => current.filter((item) => item !== name)), []);
  const toggleGrocery = useCallback((name: string) => setGrocery((current) => current.map((item) => (item.name === name ? { ...item, checked: !item.checked } : item))), []);

  const addRecipeToPlan = useCallback((recipeId: string) => {
    setWeeklyPlan((current) => {
      if (current.some((item) => item.recipeId === recipeId)) return current;
      return [...current, { day: "Cmt", meal: "Akşam", recipeId }];
    });
  }, []);

  const createGroceryFromPlan = useCallback(() => setGrocery(buildGroceryList(weeklyPlan.map((item) => item.recipeId))), [weeklyPlan]);
  const updateProfile = useCallback((patch: Partial<Profile>) => setProfile((current) => ({ ...current, ...patch })), []);
  const completeOnboarding = useCallback((nextProfile: Profile) => { setProfile(nextProfile); setOnboardingComplete(true); }, []);

  const value = useMemo(() => ({ favorites, pantry, grocery, weeklyPlan, profile, onboardingComplete, hydrated, toggleFavorite, addPantryItem, removePantryItem, toggleGrocery, addRecipeToPlan, createGroceryFromPlan, updateProfile, completeOnboarding }), [addPantryItem, addRecipeToPlan, completeOnboarding, createGroceryFromPlan, favorites, grocery, hydrated, onboardingComplete, pantry, profile, removePantryItem, toggleFavorite, toggleGrocery, updateProfile, weeklyPlan]);

  return <LezzetContext.Provider value={value}>{children}</LezzetContext.Provider>;
}

export function useLezzet() {
  const value = useContext(LezzetContext);
  if (!value) throw new Error("useLezzet must be used within LezzetProvider");
  return value;
}
