import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { router } from "expo-router";
import { useState } from "react";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { LocalizedText as Text } from "@/components/localized-text";
import { ScreenContainer } from "@/components/screen-container";
import { useLezzet } from "@/lib/lezzet-context";
import { allergenOptions } from "@/lib/seasonal-market";

export default function AllergyPreferencesScreen() {
  const { profile, updateProfile } = useLezzet();
  const [custom, setCustom] = useState("");
  const toggle = (item: string) => updateProfile({ allergies: profile.allergies.includes(item) ? profile.allergies.filter((allergy) => allergy !== item) : [...profile.allergies, item] });
  const addCustom = () => {
    const value = custom.trim();
    if (!value || profile.allergies.some((item) => item.toLocaleLowerCase(profile.locale) === value.toLocaleLowerCase(profile.locale))) return;
    updateProfile({ allergies: [...profile.allergies, value] });
    setCustom("");
  };
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="flex-1" containerClassName="bg-background"><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
    <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && styles.pressed]}><IconSymbol name="chevron.left" size={20} color="#1E4D3A" /><Text style={styles.backText}>Profil</Text></Pressable>
    <View style={styles.hero}><View style={styles.heroIcon}><IconSymbol name="exclamationmark.triangle.fill" size={22} color="#FFFFFF" /></View><Text style={styles.kicker}>GÜVENLİK TERCİHLERİ</Text><Text style={styles.title}>Alerjenlerini belirle</Text><Text style={styles.subtitle}>Seçimlerin tarif ayrıntısında içerik eşleşmesi ve çapraz temas kontrolü olarak gösterilir. Bu bilgi, paket etiketinin yerine geçmez.</Text></View>
    <View style={styles.notice}><IconSymbol name="sparkles" size={18} color="#9D4F20" /><Text style={styles.noticeText}>Alerjen içermeyen bir tarifte bile ortak tava, kesme tahtası veya servis aracı çapraz temas riski oluşturabilir.</Text></View>
    <View style={styles.list}>{allergenOptions.map((item) => { const active = profile.allergies.includes(item); return <Pressable key={item} onPress={() => toggle(item)} style={({ pressed }) => [styles.option, active && styles.optionActive, pressed && styles.pressed]}><View style={[styles.mark, active && styles.markActive]}>{active ? <IconSymbol name="checkmark.circle.fill" size={18} color="#FFFFFF" /> : null}</View><Text style={[styles.optionText, active && styles.optionTextActive]}>{item}</Text></Pressable>; })}</View>
    <View style={styles.custom}><Text style={styles.customTitle}>Başka bir alerjen ekle</Text><View style={styles.customRow}><TextInput value={custom} onChangeText={setCustom} onSubmitEditing={addCustom} placeholder="Örn. hardal" placeholderTextColor="#87918B" returnKeyType="done" style={styles.input} /><Pressable onPress={addCustom} style={({ pressed }) => [styles.add, pressed && styles.pressed]}><Text style={styles.addText}>Ekle</Text></Pressable></View></View>
    {profile.allergies.length ? <View style={styles.selected}><Text style={styles.selectedTitle}>Aktif alerjenler</Text><View style={styles.chips}>{profile.allergies.map((item) => <Pressable key={item} onPress={() => toggle(item)} style={styles.chip}><Text style={styles.chipText}>{item}</Text><IconSymbol name="xmark" size={14} color="#1E4D3A" /></Pressable>)}</View></View> : null}
    <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.done, pressed && styles.pressed]}><Text style={styles.doneText}>Tercihlerimi kaydet</Text><IconSymbol name="checkmark.circle.fill" size={18} color="#FFFFFF" /></Pressable>
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 36, gap: 17 }, pressed: { opacity: 0.72 }, back: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 5, minHeight: 40, paddingHorizontal: 11, borderRadius: 13, backgroundColor: "#E8F0E5" }, backText: { color: "#1E4D3A", fontSize: 12, fontWeight: "900" }, hero: { gap: 7 }, heroIcon: { width: 46, height: 46, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "#B7652E" }, kicker: { color: "#6B756F", fontSize: 10, fontWeight: "900", letterSpacing: 1.1, marginTop: 5 }, title: { color: "#1E2521", fontSize: 30, lineHeight: 36, fontWeight: "900", letterSpacing: -0.9 }, subtitle: { color: "#52705E", fontSize: 13, lineHeight: 19, fontWeight: "600" }, notice: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 18, backgroundColor: "#FFF4EA", borderWidth: 1, borderColor: "#F3D4BC" }, noticeText: { flex: 1, color: "#83542F", fontSize: 11, lineHeight: 16, fontWeight: "700" }, list: { gap: 8 }, option: { minHeight: 54, flexDirection: "row", alignItems: "center", gap: 11, paddingHorizontal: 13, borderRadius: 17, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EAE7E0" }, optionActive: { backgroundColor: "#1E4D3A", borderColor: "#1E4D3A" }, mark: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: "#B5C0B7", alignItems: "center", justifyContent: "center" }, markActive: { backgroundColor: "#F4A261", borderColor: "#F4A261" }, optionText: { color: "#1E2521", fontSize: 14, fontWeight: "800" }, optionTextActive: { color: "#FFFFFF" }, custom: { gap: 8, padding: 14, borderRadius: 19, backgroundColor: "#F5F8F3", borderWidth: 1, borderColor: "#D5E3D3" }, customTitle: { color: "#1E2521", fontSize: 13, fontWeight: "900" }, customRow: { flexDirection: "row", gap: 8 }, input: { flex: 1, height: 44, borderRadius: 12, paddingHorizontal: 12, color: "#1E2521", fontSize: 13, backgroundColor: "#FFFFFF" }, add: { minWidth: 58, alignItems: "center", justifyContent: "center", borderRadius: 12, paddingHorizontal: 11, backgroundColor: "#DDE8DA" }, addText: { color: "#1E4D3A", fontSize: 12, fontWeight: "900" }, selected: { gap: 9 }, selectedTitle: { color: "#1E2521", fontSize: 14, fontWeight: "900" }, chips: { flexDirection: "row", flexWrap: "wrap", gap: 7 }, chip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 12, backgroundColor: "#DDE8DA" }, chipText: { color: "#1E4D3A", fontSize: 11, fontWeight: "800" }, done: { minHeight: 52, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#1E4D3A", marginTop: 3 }, doneText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
});
