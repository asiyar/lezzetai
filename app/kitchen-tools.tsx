import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { ScreenContainer } from "@/components/screen-container";
import { useLezzet } from "@/lib/lezzet-context";

const tools = [
  { name: "Tava", icon: "flame.fill" as const, note: "Sote, kızartma ve hızlı tarifler" },
  { name: "Fırın", icon: "cabinet.fill" as const, note: "Fırın yemekleri ve sebzeler" },
  { name: "Air Fryer", icon: "sparkles" as const, note: "Az yağlı, pratik pişirme" },
  { name: "Tencere", icon: "clock" as const, note: "Çorba, makarna ve tencere yemeği" },
];

export default function KitchenToolsScreen() {
  const { kitchenTools, toggleKitchenTool } = useLezzet();
  return <ScreenContainer className="flex-1" containerClassName="bg-background"><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
    <View style={styles.topRow}><Pressable onPress={() => router.back()} hitSlop={10} style={styles.back}><IconSymbol name="chevron.left" size={21} color="#1E4D3A" /></Pressable><Text style={styles.topLabel}>MUTFAĞIN</Text></View>
    <Text style={styles.title}>Hangi araçlar sende var?</Text><Text style={styles.subtitle}>Seçtiklerin, yalnızca yapabileceğin tarifleri ve alternatifleri öne çıkarmamı sağlar.</Text>
    <ImageBackground source={{ uri: "/manus-storage/lezzetai-kitchen-tools_ee97bad0.jpg" }} imageStyle={styles.heroImage} style={styles.hero}><View style={styles.heroOverlay}><View style={styles.heroPill}><IconSymbol name="sparkles" size={15} color="#1E4D3A" /><Text style={styles.heroPillText}>MUTFAĞINA UYGUN</Text></View><Text style={styles.heroTitle}>{kitchenTools.length ? `${kitchenTools.length} araç seçtin` : "Pişirme tarzını tanıyalım"}</Text></View></ImageBackground>
    <View style={styles.toolsHead}><Text style={styles.sectionTitle}>Pişirme araçların</Text><Text style={styles.count}>{kitchenTools.length}/4 seçili</Text></View>
    <View style={styles.grid}>{tools.map((tool) => { const selected = kitchenTools.includes(tool.name); return <Pressable key={tool.name} onPress={() => toggleKitchenTool(tool.name)} style={({ pressed }) => [styles.toolCard, selected && styles.toolCardSelected, pressed && { opacity: 0.74, transform: [{ scale: 0.98 }] }]}><View style={[styles.toolIcon, selected && styles.toolIconSelected]}><IconSymbol name={tool.icon} size={24} color={selected ? "#FFFFFF" : "#1E4D3A"} /></View><Text style={[styles.toolName, selected && styles.toolNameSelected]}>{tool.name}</Text><Text style={[styles.toolNote, selected && styles.toolNoteSelected]}>{tool.note}</Text><View style={[styles.selectMark, selected && styles.selectMarkSelected]}>{selected ? <IconSymbol name="checkmark.circle.fill" size={18} color="#FFFFFF" /> : null}</View></Pressable>; })}</View>
    <View style={styles.info}><IconSymbol name="leaf.fill" size={18} color="#1E4D3A" /><Text style={styles.infoText}>Araç seçmezsen temel ocak ve tencere yöntemleri varsayılır. Seçimlerini istediğin zaman güncelleyebilirsin.</Text></View>
    <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.done, pressed && { opacity: 0.84, transform: [{ scale: 0.985 }] }]}><Text style={styles.doneText}>Seçimlerimi kullan</Text><IconSymbol name="chevron.right" size={19} color="#FFFFFF" /></Pressable>
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 34, gap: 16 }, topRow: { flexDirection: "row", alignItems: "center", gap: 10 }, back: { width: 38, height: 38, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "#DDE8DA" }, topLabel: { color: "#6B756F", fontSize: 10, fontWeight: "900", letterSpacing: 1 }, title: { color: "#1E2521", fontSize: 28, lineHeight: 34, fontWeight: "800", letterSpacing: -0.65, marginTop: 2 }, subtitle: { color: "#6B756F", fontSize: 13, lineHeight: 19, marginTop: -8 },
  hero: { height: 176, overflow: "hidden", borderRadius: 24, justifyContent: "flex-end", backgroundColor: "#1E4D3A" }, heroImage: { borderRadius: 24 }, heroOverlay: { gap: 8, padding: 16, backgroundColor: "rgba(18, 48, 36, 0.42)" }, heroPill: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 99, backgroundColor: "#FFFFFF" }, heroPillText: { color: "#1E4D3A", fontSize: 9, fontWeight: "900", letterSpacing: 0.5 }, heroTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "800", letterSpacing: -0.35 },
  toolsHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 2 }, sectionTitle: { color: "#1E2521", fontSize: 16, fontWeight: "800" }, count: { color: "#6B756F", fontSize: 11, fontWeight: "700" }, grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 }, toolCard: { width: "48.5%", minHeight: 168, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EAE7E0", borderRadius: 20, padding: 13, gap: 7 }, toolCardSelected: { backgroundColor: "#1E4D3A", borderColor: "#1E4D3A" }, toolIcon: { width: 43, height: 43, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#DDE8DA" }, toolIconSelected: { backgroundColor: "#34684F" }, toolName: { color: "#1E2521", fontSize: 14, fontWeight: "800", marginTop: 2 }, toolNameSelected: { color: "#FFFFFF" }, toolNote: { color: "#6B756F", fontSize: 10, lineHeight: 14, flex: 1 }, toolNoteSelected: { color: "#DDE8DA" }, selectMark: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: "#B8C2BA", alignSelf: "flex-end", alignItems: "center", justifyContent: "center" }, selectMarkSelected: { backgroundColor: "#F4A261", borderColor: "#F4A261" },
  info: { flexDirection: "row", alignItems: "flex-start", gap: 9, padding: 13, borderRadius: 17, backgroundColor: "#DDE8DA" }, infoText: { flex: 1, color: "#52705E", fontSize: 11, lineHeight: 16, fontWeight: "600" }, done: { minHeight: 52, borderRadius: 16, backgroundColor: "#1E4D3A", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }, doneText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
});
