import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { ScreenContainer } from "@/components/screen-container";
import { getRecipe } from "@/lib/lezzet-data";
import { useLezzet } from "@/lib/lezzet-context";

export default function PlanScreen() {
  const { weeklyPlan, createGroceryFromPlan } = useLezzet();
  const days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

  return <ScreenContainer className="flex-1" containerClassName="bg-background"><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
    <View><Text style={styles.eyebrow}>HAFTANIN RİTMİ</Text><Text style={styles.title}>Yemek planın</Text></View>
    <View style={styles.dayStrip}>{days.map((day, index) => <View key={day} style={[styles.day, index === 0 && styles.dayActive]}><Text style={[styles.dayName, index === 0 && styles.dayNameActive]}>{day}</Text><Text style={[styles.dayNumber, index === 0 && styles.dayNumberActive]}>{18 + index}</Text></View>)}</View>
    <View style={styles.summary}><View style={styles.summaryIcon}><IconSymbol name="sparkles" size={22} color="#1E4D3A" /></View><View style={{ flex: 1 }}><Text style={styles.summaryTitle}>Haftan dengeli görünüyor</Text><Text style={styles.summaryText}>4 öğün planlandı, alışverişin neredeyse hazır.</Text></View></View>
    <View style={styles.timeline}>{weeklyPlan.map((item) => { const recipe = getRecipe(item.recipeId); return <Pressable key={`${item.day}-${item.recipeId}`} onPress={() => router.push(`/recipe/${recipe.id}` as never)} style={({ pressed }) => [styles.mealCard, pressed && { opacity: 0.75 }]}><View style={styles.mealDate}><Text style={styles.mealDay}>{item.day}</Text><Text style={styles.mealType}>{item.meal}</Text></View><View style={styles.mealDivider} /><View style={{ flex: 1 }}><Text style={styles.mealTitle}>{recipe.title}</Text><Text style={styles.mealMeta}>{recipe.minutes} dk · {recipe.calories} kcal</Text></View><IconSymbol name="chevron.right" size={19} color="#1E4D3A" /></Pressable>; })}</View>
    <Pressable onPress={() => { createGroceryFromPlan(); router.push("/shopping-list" as never); }} style={({ pressed }) => [styles.shoppingCta, pressed && { opacity: 0.85, transform: [{ scale: 0.985 }] }]}><View style={styles.shoppingIcon}><IconSymbol name="cart.fill" size={22} color="#FFFFFF" /></View><View style={{ flex: 1 }}><Text style={styles.shoppingTitle}>Alışveriş listesini hazırla</Text><Text style={styles.shoppingText}>Planındaki tüm malzemeleri tek listede topla.</Text></View><IconSymbol name="chevron.right" size={20} color="#FFFFFF" /></Pressable>
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 32, gap: 20 }, eyebrow: { color: "#6B756F", fontSize: 11, fontWeight: "800", letterSpacing: 1.1 }, title: { color: "#1E2521", fontSize: 30, lineHeight: 36, fontWeight: "800", letterSpacing: -0.8, marginTop: 2 },
  dayStrip: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#FFFFFF", borderRadius: 20, padding: 8, borderWidth: 1, borderColor: "#EAE7E0" }, day: { flex: 1, alignItems: "center", gap: 4, paddingVertical: 8, borderRadius: 14 }, dayActive: { backgroundColor: "#1E4D3A" }, dayName: { fontSize: 10, color: "#6B756F", fontWeight: "800" }, dayNameActive: { color: "#DDE8DA" }, dayNumber: { color: "#1E2521", fontSize: 15, fontWeight: "800" }, dayNumberActive: { color: "#FFFFFF" },
  summary: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#DDE8DA", borderRadius: 20, padding: 15 }, summaryIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#FBF8F2", alignItems: "center", justifyContent: "center" }, summaryTitle: { color: "#1E2521", fontWeight: "800", fontSize: 15 }, summaryText: { color: "#52705E", fontSize: 12, lineHeight: 17, marginTop: 2 },
  timeline: { gap: 10 }, mealCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 19, borderWidth: 1, borderColor: "#EAE7E0", padding: 14, gap: 12 }, mealDate: { width: 47, gap: 2 }, mealDay: { color: "#1E4D3A", fontSize: 13, fontWeight: "900" }, mealType: { color: "#6B756F", fontSize: 10, fontWeight: "700" }, mealDivider: { width: 1, height: 34, backgroundColor: "#EAE7E0" }, mealTitle: { color: "#1E2521", fontSize: 14, fontWeight: "800" }, mealMeta: { color: "#6B756F", fontSize: 11, marginTop: 3, fontWeight: "600" },
  shoppingCta: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#1E4D3A", borderRadius: 22, padding: 16, marginTop: 4 }, shoppingIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#34684F", alignItems: "center", justifyContent: "center" }, shoppingTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" }, shoppingText: { color: "#DDE8DA", fontSize: 11, lineHeight: 16, marginTop: 2 },
});
