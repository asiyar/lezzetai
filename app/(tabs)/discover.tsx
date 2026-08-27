import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { LocalizedText as Text } from "@/components/localized-text";
import { RecipeCard } from "@/components/recipe-card";
import { ScreenContainer } from "@/components/screen-container";
import { VoiceInputButton } from "@/components/voice-input-button";
import { getCategoriesForLocale, getRecipesForPreferences } from "@/lib/lezzet-data";
import { useLezzet } from "@/lib/lezzet-context";
import { getCuisineProfile } from "@/lib/cuisine-locale";
import { dietaryOptions, getCurrentSeason, getSeasonName, getSeasonalPackage, type DietaryPreference } from "@/lib/seasonal-market";

export default function DiscoverScreen() {
  const { favorites, toggleFavorite, profile, updateProfile } = useLezzet();
  const cuisine = getCuisineProfile(profile.locale);
  const season = getCurrentSeason();
  const seasonalPackage = getSeasonalPackage(profile.locale, season);
  const [category, setCategory] = useState<string>(cuisine.ui.all);
  const [query, setQuery] = useState("");
  const categories = useMemo(() => getCategoriesForLocale(profile.locale), [profile.locale]);
  const regionalRecipes = useMemo(() => getRecipesForPreferences(profile.locale, profile.dietaryPreferences, season), [profile.dietaryPreferences, profile.locale, season]);
  const seasonalFavorites = useMemo(() => regionalRecipes.slice(0, 3), [regionalRecipes]);
  useEffect(() => setCategory(cuisine.ui.all), [cuisine.ui.all]);
  const filtered = useMemo(() => regionalRecipes.filter((recipe) => (category === cuisine.ui.all || recipe.category === category) && `${recipe.title} ${recipe.subtitle} ${recipe.ingredients.join(" ")}`.toLocaleLowerCase(profile.locale).includes(query.toLocaleLowerCase(profile.locale))), [category, cuisine.ui.all, profile.locale, query, regionalRecipes]);

  return (
    <ScreenContainer className="flex-1" containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View><Text style={styles.eyebrow}>{cuisine.ui.exploreEyebrow}</Text><Text style={styles.title}>{cuisine.ui.discover}</Text><Text style={styles.regionLabel}>{cuisine.flag} {cuisine.region} · {regionalRecipes.length} local recipes</Text></View>
        <View style={styles.seasonCard}><View style={styles.seasonHead}><View><Text style={styles.seasonKicker}>{getSeasonName(profile.locale, season).toLocaleUpperCase(profile.locale)}</Text><Text style={styles.seasonTitle}>{seasonalPackage.title}</Text></View><IconSymbol name="leaf.fill" size={21} color="#1E4D3A" /></View><Text style={styles.seasonText}>{seasonalPackage.subtitle}</Text><Text style={styles.seasonIngredients}>{seasonalPackage.ingredients.join(" · ")}</Text></View>
        <View style={styles.search}><IconSymbol name="magnifyingglass" size={21} color="#6B756F" /><TextInput value={query} onChangeText={setQuery} placeholder={cuisine.ui.search} placeholderTextColor="#8A938E" returnKeyType="search" style={styles.input} /><VoiceInputButton onText={setQuery} label="Tarif aramasını sesle yaz" /></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dietChips}>{dietaryOptions.map((option) => { const active = profile.dietaryPreferences.includes(option.id); const toggle = () => updateProfile({ dietaryPreferences: active ? profile.dietaryPreferences.filter((item) => item !== option.id) : [...profile.dietaryPreferences, option.id] as DietaryPreference[] }); return <Pressable key={option.id} onPress={toggle} style={({ pressed }) => [styles.dietChip, active && styles.dietChipActive, pressed && { opacity: 0.7 }]}><IconSymbol name="leaf.fill" size={14} color={active ? "#FFFFFF" : "#1E4D3A"} /><Text style={[styles.dietText, active && styles.dietTextActive]}>{option.labels[profile.locale]}</Text></Pressable>; })}</ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {categories.map((item) => <Pressable key={item} onPress={() => setCategory(item)} style={({ pressed }) => [styles.chip, category === item && styles.chipActive, pressed && { opacity: 0.7 }]}><Text style={[styles.chipText, category === item && styles.chipTextActive]}>{item}</Text></Pressable>)}
        </ScrollView>
        <View style={styles.favoritesSection}><View style={styles.favoriteHead}><View><Text style={styles.favoriteKicker}>MEVSİMİN SEÇKİSİ</Text><Text style={styles.favoriteTitle}>Favorilerine ekle</Text></View><IconSymbol name="heart.fill" size={20} color="#D4553E" /></View><Text style={styles.favoriteText}>{seasonalPackage.title} için seçilen yerel tarifler.</Text><View style={styles.favoriteList}>{seasonalFavorites.map((recipe) => <RecipeCard key={`seasonal-${recipe.id}`} compact recipe={recipe} isFavorite={favorites.includes(recipe.id)} onToggleFavorite={() => toggleFavorite(recipe.id)} onPress={() => router.push(`/recipe/${recipe.id}` as never)} />)}</View></View>
        <View style={styles.resultsRow}><Text style={styles.resultLabel}>{filtered.length} {cuisine.ui.recipesFound}</Text><Pressable style={({ pressed }) => [styles.filter, pressed && { opacity: 0.6 }]}><IconSymbol name="slider.horizontal.3" size={18} color="#1E4D3A" /><Text style={styles.filterText}>{cuisine.ui.filter}</Text></Pressable></View>
        <View style={styles.list}>
          {filtered.map((recipe) => <RecipeCard key={recipe.id} compact recipe={recipe} isFavorite={favorites.includes(recipe.id)} onToggleFavorite={() => toggleFavorite(recipe.id)} onPress={() => router.push(`/recipe/${recipe.id}` as never)} />)}
          {filtered.length === 0 ? <View style={styles.empty}><IconSymbol name="magnifyingglass" size={26} color="#6B756F" /><Text style={styles.emptyTitle}>No matching local recipe found.</Text><Text style={styles.emptyText}>Clear a diet filter or try another ingredient.</Text></View> : null}
          <Pressable onPress={() => router.push({ pathname: "/(tabs)/chef", params: { prompt: "Daha fazla yöresel, ayrıntılı tarif istiyorum. Süremi ve pişirme tarzımı seçmeme yardımcı ol." } } as never)} style={({ pressed }) => [styles.chefCta, pressed && { opacity: 0.78, transform: [{ scale: 0.985 }] }]}><View style={styles.chefCtaIcon}><IconSymbol name="sparkles" size={18} color="#FFFFFF" /></View><View style={{ flex: 1 }}><Text style={styles.chefCtaTitle}>Daha fazla tarif mi arıyorsun?</Text><Text style={styles.chefCtaText}>AI Şef’e süre, tarz ve yalnızca kilerinle çalışma tercihini söyle.</Text></View><IconSymbol name="chevron.right" size={18} color="#1E4D3A" /></Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 32, gap: 18 }, eyebrow: { color: "#6B756F", fontSize: 11, fontWeight: "800", letterSpacing: 1.1 }, title: { color: "#1E2521", fontSize: 30, lineHeight: 36, fontWeight: "800", letterSpacing: -0.8, marginTop: 2 }, regionLabel: { color: "#52705E", fontSize: 11, fontWeight: "800", marginTop: 5 }, seasonCard: { gap: 5, padding: 14, borderRadius: 20, backgroundColor: "#EEF5EC", borderWidth: 1, borderColor: "#D2E4CF" }, seasonHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, seasonKicker: { color: "#52705E", fontSize: 9, fontWeight: "900", letterSpacing: 1 }, seasonTitle: { color: "#1E2521", fontSize: 16, fontWeight: "900", marginTop: 2 }, seasonText: { color: "#52705E", fontSize: 11, lineHeight: 16, fontWeight: "600" }, seasonIngredients: { color: "#1E4D3A", fontSize: 10, lineHeight: 15, fontWeight: "900" }, dietChips: { gap: 8, paddingRight: 20, marginTop: -5 }, dietChip: { minHeight: 34, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 11, borderRadius: 13, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#C9DCC4" }, dietChipActive: { backgroundColor: "#1E4D3A", borderColor: "#1E4D3A" }, dietText: { color: "#1E4D3A", fontSize: 10, fontWeight: "900" }, dietTextActive: { color: "#FFFFFF" },
  search: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 52, borderRadius: 16, backgroundColor: "#FFFFFF", borderColor: "#EAE7E0", borderWidth: 1, paddingHorizontal: 14 }, input: { flex: 1, color: "#1E2521", fontSize: 14, paddingVertical: 10 },
  chips: { gap: 8, paddingRight: 20 }, chip: { borderRadius: 18, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EAE7E0", paddingHorizontal: 14, paddingVertical: 9 }, chipActive: { backgroundColor: "#1E4D3A", borderColor: "#1E4D3A" }, chipText: { color: "#58635C", fontWeight: "700", fontSize: 13 }, chipTextActive: { color: "#FFFFFF" },
  resultsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 2 }, resultLabel: { color: "#6B756F", fontSize: 13, fontWeight: "700" }, filter: { flexDirection: "row", gap: 5, alignItems: "center", minHeight: 36 }, filterText: { color: "#1E4D3A", fontSize: 13, fontWeight: "800" }, list: { gap: 12 },
  favoritesSection: { gap: 10, padding: 14, borderRadius: 22, backgroundColor: "#FFF4EA", borderWidth: 1, borderColor: "#F3D4BC" }, favoriteHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, favoriteKicker: { color: "#9D4F20", fontSize: 9, fontWeight: "900", letterSpacing: 1 }, favoriteTitle: { color: "#1E2521", fontSize: 17, fontWeight: "900", marginTop: 2 }, favoriteText: { color: "#83542F", fontSize: 11, lineHeight: 16, fontWeight: "600" }, favoriteList: { gap: 8 }, empty: { backgroundColor: "#FFFFFF", borderRadius: 22, padding: 28, alignItems: "center", gap: 8, borderWidth: 1, borderColor: "#EAE7E0" }, emptyTitle: { color: "#1E2521", fontWeight: "800", fontSize: 15, textAlign: "center" }, emptyText: { color: "#6B756F", fontSize: 13, textAlign: "center", lineHeight: 19 },
  chefCta: { minHeight: 76, flexDirection: "row", alignItems: "center", gap: 10, padding: 13, borderRadius: 20, backgroundColor: "#DDE8DA", borderWidth: 1, borderColor: "#C9DCC4" }, chefCtaIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: "#1E4D3A", alignItems: "center", justifyContent: "center" }, chefCtaTitle: { color: "#1E4D3A", fontSize: 13, fontWeight: "900" }, chefCtaText: { color: "#52705E", fontSize: 10, lineHeight: 15, marginTop: 2, fontWeight: "600" },
});
