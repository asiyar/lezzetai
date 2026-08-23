import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { useMemo, useState } from "react";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { RecipeCard } from "@/components/recipe-card";
import { ScreenContainer } from "@/components/screen-container";
import { categories, recipes } from "@/lib/lezzet-data";
import { useLezzet } from "@/lib/lezzet-context";

export default function DiscoverScreen() {
  const [category, setCategory] = useState("Tümü");
  const [query, setQuery] = useState("");
  const { favorites, toggleFavorite } = useLezzet();
  const filtered = useMemo(() => recipes.filter((recipe) => (category === "Tümü" || recipe.category === category) && `${recipe.title} ${recipe.subtitle}`.toLocaleLowerCase("tr-TR").includes(query.toLocaleLowerCase("tr-TR"))), [category, query]);

  return (
    <ScreenContainer className="flex-1" containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View><Text style={styles.eyebrow}>İLHAM AL</Text><Text style={styles.title}>Keşfet</Text></View>
        <View style={styles.search}><IconSymbol name="magnifyingglass" size={21} color="#6B756F" /><TextInput value={query} onChangeText={setQuery} placeholder="Tarif, malzeme ya da mutfak ara" placeholderTextColor="#8A938E" returnKeyType="search" style={styles.input} /></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {categories.map((item) => <Pressable key={item} onPress={() => setCategory(item)} style={({ pressed }) => [styles.chip, category === item && styles.chipActive, pressed && { opacity: 0.7 }]}><Text style={[styles.chipText, category === item && styles.chipTextActive]}>{item}</Text></Pressable>)}
        </ScrollView>
        <View style={styles.resultsRow}><Text style={styles.resultLabel}>{filtered.length} tarif bulundu</Text><Pressable style={({ pressed }) => [styles.filter, pressed && { opacity: 0.6 }]}><IconSymbol name="slider.horizontal.3" size={18} color="#1E4D3A" /><Text style={styles.filterText}>Filtrele</Text></Pressable></View>
        <View style={styles.list}>
          {filtered.map((recipe) => <RecipeCard key={recipe.id} compact recipe={recipe} isFavorite={favorites.includes(recipe.id)} onToggleFavorite={() => toggleFavorite(recipe.id)} onPress={() => router.push(`/recipe/${recipe.id}` as never)} />)}
          {filtered.length === 0 ? <View style={styles.empty}><IconSymbol name="magnifyingglass" size={26} color="#6B756F" /><Text style={styles.emptyTitle}>Aramana uygun tarif bulunamadı.</Text><Text style={styles.emptyText}>Başka bir malzeme ya da kategori deneyebilirsin.</Text></View> : null}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 32, gap: 18 }, eyebrow: { color: "#6B756F", fontSize: 11, fontWeight: "800", letterSpacing: 1.1 }, title: { color: "#1E2521", fontSize: 30, lineHeight: 36, fontWeight: "800", letterSpacing: -0.8, marginTop: 2 },
  search: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 52, borderRadius: 16, backgroundColor: "#FFFFFF", borderColor: "#EAE7E0", borderWidth: 1, paddingHorizontal: 14 }, input: { flex: 1, color: "#1E2521", fontSize: 14, paddingVertical: 10 },
  chips: { gap: 8, paddingRight: 20 }, chip: { borderRadius: 18, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EAE7E0", paddingHorizontal: 14, paddingVertical: 9 }, chipActive: { backgroundColor: "#1E4D3A", borderColor: "#1E4D3A" }, chipText: { color: "#58635C", fontWeight: "700", fontSize: 13 }, chipTextActive: { color: "#FFFFFF" },
  resultsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 2 }, resultLabel: { color: "#6B756F", fontSize: 13, fontWeight: "700" }, filter: { flexDirection: "row", gap: 5, alignItems: "center", minHeight: 36 }, filterText: { color: "#1E4D3A", fontSize: 13, fontWeight: "800" }, list: { gap: 12 },
  empty: { backgroundColor: "#FFFFFF", borderRadius: 22, padding: 28, alignItems: "center", gap: 8, borderWidth: 1, borderColor: "#EAE7E0" }, emptyTitle: { color: "#1E2521", fontWeight: "800", fontSize: 15, textAlign: "center" }, emptyText: { color: "#6B756F", fontSize: 13, textAlign: "center", lineHeight: 19 },
});
