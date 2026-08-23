import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { ScreenContainer } from "@/components/screen-container";
import { useLezzet } from "@/lib/lezzet-context";

export default function ShoppingListScreen() {
  const { grocery, toggleGrocery } = useLezzet();
  const completed = grocery.filter((item) => item.checked).length;
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="flex-1" containerClassName="bg-background"><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
    <View style={styles.header}><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && { opacity: 0.55 }]}><IconSymbol name="chevron.left" size={23} color="#1E4D3A" /></Pressable><View style={{ flex: 1 }}><Text style={styles.eyebrow}>BU HAFTA</Text><Text style={styles.title}>Alışveriş listesi</Text></View></View>
    <View style={styles.progress}><View style={{ flex: 1 }}><Text style={styles.progressTitle}>Hazırlık durumu</Text><Text style={styles.progressText}>{completed}/{grocery.length} ürün işaretlendi</Text></View><View style={styles.progressBadge}><Text style={styles.progressNumber}>{grocery.length ? Math.round(completed / grocery.length * 100) : 0}%</Text></View></View>
    <View style={styles.list}>{grocery.map((item) => <Pressable key={item.name} onPress={() => toggleGrocery(item.name)} style={({ pressed }) => [styles.item, item.checked && styles.itemChecked, pressed && { opacity: 0.7 }]}><View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>{item.checked ? <IconSymbol name="checkmark.circle.fill" size={20} color="#FFFFFF" /> : null}</View><Text style={[styles.itemText, item.checked && styles.itemTextChecked]}>{item.name}</Text></Pressable>)}</View>
    <View style={styles.footer}><IconSymbol name="sparkles" size={18} color="#1E4D3A" /><Text style={styles.footerText}>Bu liste, haftalık planındaki tariflerden otomatik oluştu.</Text></View>
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 20 }, header: { flexDirection: "row", alignItems: "center", gap: 12 }, back: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EAE7E0", alignItems: "center", justifyContent: "center" }, eyebrow: { color: "#6B756F", fontSize: 10, fontWeight: "800", letterSpacing: 1 }, title: { color: "#1E2521", fontSize: 25, lineHeight: 30, fontWeight: "800", letterSpacing: -0.55 },
  progress: { minHeight: 88, flexDirection: "row", alignItems: "center", gap: 13, backgroundColor: "#1E4D3A", borderRadius: 22, paddingHorizontal: 17 }, progressTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" }, progressText: { color: "#DDE8DA", fontSize: 12, marginTop: 3 }, progressBadge: { width: 51, height: 51, borderRadius: 26, backgroundColor: "#34684F", alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#F4A261" }, progressNumber: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" },
  list: { backgroundColor: "#FFFFFF", overflow: "hidden", borderRadius: 20, borderWidth: 1, borderColor: "#EAE7E0" }, item: { minHeight: 58, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: "#F0EEE9" }, itemChecked: { backgroundColor: "#F5F8F3" }, checkbox: { width: 22, height: 22, borderRadius: 7, borderWidth: 2, borderColor: "#B4C0B7", alignItems: "center", justifyContent: "center" }, checkboxChecked: { backgroundColor: "#2D7A55", borderColor: "#2D7A55" }, itemText: { color: "#1E2521", fontSize: 14, fontWeight: "700", flex: 1 }, itemTextChecked: { color: "#839088", textDecorationLine: "line-through" }, footer: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#DDE8DA", borderRadius: 16, padding: 13 }, footerText: { color: "#52705E", fontSize: 12, lineHeight: 17, flex: 1, fontWeight: "600" },
});
