import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { RecipeCard } from "@/components/recipe-card";
import { SectionTitle } from "@/components/section-title";
import { ScreenContainer } from "@/components/screen-container";
import { recipes } from "@/lib/lezzet-data";
import { useLezzet } from "@/lib/lezzet-context";

export default function TodayScreen() {
  const { favorites, pantry, profile, toggleFavorite } = useLezzet();
  const heroRecipe = recipes[0];

  return (
    <ScreenContainer className="flex-1" containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>GÜNAYDIN, DENİZ</Text>
            <Text style={styles.greeting}>Bugün ne iyi gelir?</Text>
          </View>
          <Pressable onPress={() => router.push("/(tabs)/profile" as never)} style={({ pressed }) => [styles.avatar, pressed && { opacity: 0.65 }]}>
            <Text style={styles.avatarText}>D</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => router.push(`/recipe/${heroRecipe.id}` as never)} style={({ pressed }) => [styles.hero, pressed && styles.pressed]}>
          <Image source={heroRecipe.image} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroShade} />
          <View style={styles.heroTag}>
            <IconSymbol name="sparkles" size={14} color="#1E4D3A" />
            <Text style={styles.heroTagText}>AI ŞEFİN SEÇTİ</Text>
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>Kilerindeki malzemelerle dengeli bir öğün</Text>
            <View style={styles.heroMeta}>
              <Text style={styles.heroMetaText}>{heroRecipe.minutes} dakika</Text>
              <View style={styles.dot} />
              <Text style={styles.heroMetaText}>{heroRecipe.calories} kcal</Text>
            </View>
          </View>
        </Pressable>

        <View style={styles.metrics}>
          <View style={styles.metricCopy}>
            <Text style={styles.metricTitle}>Günün dengesi</Text>
            <Text style={styles.metricSubtitle}>{profile.calories} kcal hedefinden 1.120 kaldı</Text>
          </View>
          <View style={styles.ringOuter}><View style={styles.ringInner}><Text style={styles.ringText}>39%</Text></View></View>
        </View>

        <View style={styles.quickRow}>
          <Pressable onPress={() => router.push("/(tabs)/chef" as never)} style={({ pressed }) => [styles.quickCard, styles.quickPrimary, pressed && styles.pressed]}>
            <View style={styles.quickIcon}><IconSymbol name="sparkles" size={21} color="#1E4D3A" /></View>
            <View><Text style={styles.quickTitle}>Bana fikir ver</Text><Text style={styles.quickSub}>AI Şef ile konuş</Text></View>
          </Pressable>
          <Pressable onPress={() => router.push("/pantry" as never)} style={({ pressed }) => [styles.quickCard, pressed && styles.pressed]}>
            <View style={[styles.quickIcon, { backgroundColor: "#FCE6D2" }]}><IconSymbol name="cabinet.fill" size={20} color="#B7652E" /></View>
            <View><Text style={styles.quickTitle}>Kilerim</Text><Text style={styles.quickSub}>{pantry.length} malzeme</Text></View>
          </Pressable>
        </View>

        <View style={styles.sectionWrap}>
          <SectionTitle title="Sana göre seçtik" action="Tümünü gör" onPress={() => router.push("/(tabs)/discover" as never)} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCards}>
            {recipes.slice(1).map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} isFavorite={favorites.includes(recipe.id)} onToggleFavorite={() => toggleFavorite(recipe.id)} onPress={() => router.push(`/recipe/${recipe.id}` as never)} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.pantryBanner}>
          <View style={styles.pantryBannerIcon}><IconSymbol name="leaf.fill" size={22} color="#1E4D3A" /></View>
          <View style={styles.pantryBannerCopy}><Text style={styles.pantryBannerTitle}>Sıfır atık ipucu</Text><Text style={styles.pantryBannerText}>Roka ve limonunu bugün değerlendirebilirsin.</Text></View>
          <Pressable onPress={() => router.push("/pantry" as never)} style={({ pressed }) => [styles.pantryArrow, pressed && { opacity: 0.6 }]}><IconSymbol name="chevron.right" size={20} color="#1E4D3A" /></Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 36, gap: 24 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: { color: "#6B756F", fontSize: 11, fontWeight: "800", letterSpacing: 1.1 },
  greeting: { color: "#1E2521", fontSize: 26, lineHeight: 32, fontWeight: "800", letterSpacing: -0.7, marginTop: 2 },
  avatar: { alignItems: "center", justifyContent: "center", width: 42, height: 42, borderRadius: 21, backgroundColor: "#1E4D3A", borderWidth: 3, borderColor: "#DDE8DA" },
  avatarText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  hero: { height: 248, borderRadius: 28, overflow: "hidden", position: "relative", justifyContent: "space-between", padding: 18 },
  heroImage: { ...StyleSheet.absoluteFillObject, width: undefined, height: undefined },
  heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "#0C251A", opacity: 0.38 },
  heroTag: { alignSelf: "flex-start", flexDirection: "row", gap: 6, alignItems: "center", backgroundColor: "#FBF8F2", borderRadius: 14, paddingHorizontal: 10, paddingVertical: 7 },
  heroTagText: { color: "#1E4D3A", fontSize: 10, fontWeight: "900", letterSpacing: 0.65 },
  heroCopy: { gap: 7 },
  heroTitle: { color: "#FFFFFF", fontSize: 26, fontWeight: "800", lineHeight: 32, maxWidth: "90%", letterSpacing: -0.6 },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  heroMetaText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  dot: { width: 4, height: 4, borderRadius: 4, backgroundColor: "#FFFFFF" },
  metrics: { minHeight: 94, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#1E4D3A", borderRadius: 24, paddingHorizontal: 18, paddingVertical: 15 },
  metricCopy: { flex: 1, paddingRight: 12 },
  metricTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
  metricSubtitle: { color: "#DDE8DA", fontSize: 12, lineHeight: 17, marginTop: 3 },
  ringOuter: { width: 64, height: 64, borderRadius: 32, borderWidth: 6, borderColor: "#F4A261", alignItems: "center", justifyContent: "center" },
  ringInner: { width: 45, height: 45, borderRadius: 23, backgroundColor: "#2E634C", alignItems: "center", justifyContent: "center" },
  ringText: { color: "#FFFFFF", fontWeight: "900", fontSize: 13 },
  quickRow: { flexDirection: "row", gap: 12 },
  quickCard: { flex: 1, minHeight: 83, borderRadius: 20, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EAE7E0", padding: 13, gap: 8 },
  quickPrimary: { backgroundColor: "#DDE8DA", borderColor: "#C9DCC4" },
  quickIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#FBF8F2" },
  quickTitle: { color: "#1E2521", fontSize: 14, fontWeight: "800" },
  quickSub: { color: "#6B756F", fontSize: 11, fontWeight: "600", marginTop: 2 },
  sectionWrap: { marginTop: 2 },
  horizontalCards: { gap: 12, paddingRight: 20 },
  pantryBanner: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EAE7E0", borderRadius: 22, padding: 14, gap: 12 },
  pantryBannerIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#DDE8DA", alignItems: "center", justifyContent: "center" },
  pantryBannerCopy: { flex: 1 },
  pantryBannerTitle: { color: "#1E2521", fontWeight: "800", fontSize: 14 },
  pantryBannerText: { color: "#6B756F", fontSize: 12, lineHeight: 17, marginTop: 2 },
  pantryArrow: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  pressed: { opacity: 0.86, transform: [{ scale: 0.985 }] },
});
