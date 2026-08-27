import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { router } from "expo-router";
import { useState } from "react";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { LocalizedText as Text } from "@/components/localized-text";
import { ScreenContainer } from "@/components/screen-container";
import { useLezzet } from "@/lib/lezzet-context";
import { getCuisineProfile } from "@/lib/cuisine-locale";
import { getOnboardingSampleCopy } from "@/lib/onboarding-sample-copy";
import { createSamplePantryDraft, type PantryDraftItem } from "@/lib/pantry-sample";

export default function SamplePantryPreviewScreen() {
  const { profile, loadRegionalSamplePantry } = useLezzet();
  const cuisine = getCuisineProfile(profile.locale);
  const copy = getOnboardingSampleCopy(profile.locale);
  const [items, setItems] = useState<PantryDraftItem[]>(() => createSamplePantryDraft(cuisine.pantryHighlights));
  const updateItem = (index: number, patch: Partial<PantryDraftItem>) => setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  const removeItem = (index: number) => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  const addItem = () => setItems((current) => current.length >= 12 ? current : [...current, { name: "", quantity: 1, unit: "adet" }]);
  const apply = () => { loadRegionalSamplePantry(items); router.replace("/(tabs)/profile" as never); };
  return <ScreenContainer className="flex-1" containerClassName="bg-background"><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
    <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && { opacity: 0.7 }]}><IconSymbol name="chevron.left" size={18} color="#1E4D3A" /><Text style={styles.backText}>Profil</Text></Pressable>
    <View style={styles.heroIcon}><IconSymbol name="sparkles" size={26} color="#F4A261" /></View><Text style={styles.title}>{copy.editTitle}</Text><Text style={styles.subtitle}>{copy.editText}</Text>
    <View style={styles.notice}><Text style={styles.noticeTitle}>{cuisine.flag} {cuisine.region}</Text><Text style={styles.noticeText}>Kaydedildiğinde mevcut kiler ürünlerin yerine geçer ve ilk hafta planın bu ürünlerle yenilenir.</Text></View>
    <View style={styles.list}>{items.map((item, index) => <View key={`${item.name}-${index}`} style={styles.row}><TextInput value={item.name} onChangeText={(name) => updateItem(index, { name })} placeholder={copy.itemPlaceholder} placeholderTextColor="#87918B" style={styles.input} returnKeyType="done" /><View style={styles.counter}><Pressable onPress={() => updateItem(index, { quantity: Math.max(1, item.quantity - 1) })} style={styles.counterButton}><Text style={styles.counterText}>−</Text></Pressable><Text style={styles.quantity}>{item.quantity}</Text><Pressable onPress={() => updateItem(index, { quantity: Math.min(999, item.quantity + 1) })} style={styles.counterButton}><Text style={styles.counterText}>+</Text></Pressable></View><Pressable onPress={() => removeItem(index)} style={({ pressed }) => [styles.remove, pressed && { opacity: 0.65 }]}><Text style={styles.removeText}>{copy.remove}</Text></Pressable></View>)}</View>
    <Pressable onPress={addItem} style={({ pressed }) => [styles.add, pressed && { opacity: 0.7 }]}><Text style={styles.addText}>+ {copy.addItem}</Text></Pressable>
    <Pressable onPress={apply} style={({ pressed }) => [styles.apply, pressed && { opacity: 0.84, transform: [{ scale: 0.985 }] }]}><Text style={styles.applyText}>{copy.apply}</Text><IconSymbol name="chevron.right" size={20} color="#FFFFFF" /></Pressable>
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { padding: 20, paddingBottom: 34, gap: 14 }, back: { alignSelf: "flex-start", minHeight: 36, flexDirection: "row", alignItems: "center", gap: 4, paddingRight: 9 }, backText: { color: "#1E4D3A", fontSize: 13, fontWeight: "800" }, heroIcon: { width: 52, height: 52, borderRadius: 18, backgroundColor: "#1E4D3A", alignItems: "center", justifyContent: "center", marginTop: 6 }, title: { color: "#1E2521", fontSize: 27, lineHeight: 33, letterSpacing: -0.7, fontWeight: "900" }, subtitle: { color: "#6B756F", fontSize: 13, lineHeight: 19, marginTop: -6 }, notice: { gap: 4, padding: 14, borderRadius: 18, backgroundColor: "#FFF4EA", borderWidth: 1, borderColor: "#F3D4BC" }, noticeTitle: { color: "#9D4F20", fontSize: 11, fontWeight: "900", letterSpacing: 0.6 }, noticeText: { color: "#784A28", fontSize: 11, lineHeight: 16 }, list: { gap: 8 }, row: { flexDirection: "row", alignItems: "center", gap: 7, padding: 8, borderRadius: 15, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EAE7E0" }, input: { flex: 1, minWidth: 52, color: "#1E2521", paddingVertical: 6, fontSize: 13, fontWeight: "700" }, counter: { flexDirection: "row", alignItems: "center", gap: 6 }, counterButton: { width: 26, height: 26, borderRadius: 9, backgroundColor: "#DDE8DA", alignItems: "center", justifyContent: "center" }, counterText: { color: "#1E4D3A", fontSize: 18, lineHeight: 21, fontWeight: "800" }, quantity: { width: 18, textAlign: "center", color: "#1E2521", fontSize: 13, fontWeight: "900" }, remove: { paddingVertical: 6, paddingHorizontal: 3 }, removeText: { color: "#B54C40", fontSize: 10, fontWeight: "800" }, add: { height: 42, alignItems: "center", justifyContent: "center", borderRadius: 14, borderWidth: 1, borderColor: "#92B69A", borderStyle: "dashed" }, addText: { color: "#1E4D3A", fontSize: 13, fontWeight: "800" }, apply: { height: 54, marginTop: 4, borderRadius: 17, backgroundColor: "#1E4D3A", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }, applyText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" } });
