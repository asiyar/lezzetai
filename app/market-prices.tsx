import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { LocalizedText as Text } from "@/components/localized-text";
import { ScreenContainer } from "@/components/screen-container";
import { useLezzet } from "@/lib/lezzet-context";
import { formatLocalCurrency, getDefaultMarketPrices, getMarketCategoryLabel, type MarketCategoryKey } from "@/lib/seasonal-market";
import { getCuisineProfile } from "@/lib/cuisine-locale";

const categories: MarketCategoryKey[] = ["produce", "pantry", "dairy", "protein", "bakery"];

export default function MarketPricesScreen() {
  const { profile, marketPrices, updateMarketPrice } = useLezzet();
  const cuisine = getCuisineProfile(profile.locale);
  const stored = marketPrices[profile.locale];
  const [draft, setDraft] = useState<Record<MarketCategoryKey, string>>(() => Object.fromEntries(categories.map((key) => [key, String(stored[key])])) as Record<MarketCategoryKey, string>);
  useEffect(() => setDraft(Object.fromEntries(categories.map((key) => [key, String(marketPrices[profile.locale][key])])) as Record<MarketCategoryKey, string>), [marketPrices, profile.locale]);
  const total = useMemo(() => categories.reduce((sum, key) => sum + (Number(draft[key].replace(",", ".")) || 0), 0), [draft]);
  const save = () => { categories.forEach((key) => updateMarketPrice(profile.locale, key, Number(draft[key].replace(",", ".")) || 0)); router.back(); };
  const reset = () => { const defaults = getDefaultMarketPrices(profile.locale); setDraft(Object.fromEntries(categories.map((key) => [key, String(defaults[key])])) as Record<MarketCategoryKey, string>); };
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="flex-1" containerClassName="bg-background"><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
    <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && styles.pressed]}><IconSymbol name="chevron.left" size={20} color="#1E4D3A" /><Text style={styles.backText}>Profil</Text></Pressable>
    <View style={styles.hero}><View style={styles.heroIcon}><IconSymbol name="cart.fill" size={22} color="#FFFFFF" /></View><Text style={styles.kicker}>{cuisine.flag} {cuisine.region.toLocaleUpperCase(profile.locale)}</Text><Text style={styles.title}>Yerel market fiyatların</Text><Text style={styles.subtitle}>Her reyon için ortalama ürün maliyetini gir. Bu değerler alışveriş listesi ve haftalık plan tahmininde kullanılır.</Text></View>
    <View style={styles.total}><Text style={styles.totalLabel}>REYON ORTALAMASI</Text><Text style={styles.totalValue}>{formatLocalCurrency(total / categories.length, profile.locale)}</Text><Text style={styles.totalNote}>kaydedilmemiş taslak ortalaması</Text></View>
    <View style={styles.list}>{categories.map((key) => <View key={key} style={styles.row}><View style={styles.rowIcon}><IconSymbol name={key === "produce" ? "leaf.fill" : key === "protein" ? "flame.fill" : "cart.fill"} size={18} color="#1E4D3A" /></View><View style={{ flex: 1 }}><Text style={styles.rowTitle}>{getMarketCategoryLabel(key, profile.locale)}</Text><Text style={styles.rowHint}>ortalama ürün maliyeti</Text></View><TextInput value={draft[key]} onChangeText={(value) => setDraft((current) => ({ ...current, [key]: value.replace(/[^0-9,.]/g, "") }))} keyboardType="decimal-pad" selectTextOnFocus style={styles.priceInput} /><Text style={styles.currency}>{formatLocalCurrency(0, profile.locale).replace(/[0-9.,\s]/g, "")}</Text></View>)}</View>
    <Pressable onPress={reset} style={({ pressed }) => [styles.reset, pressed && styles.pressed]}><Text style={styles.resetText}>Bölge varsayılanlarına dön</Text></Pressable>
    <Pressable onPress={save} style={({ pressed }) => [styles.save, pressed && styles.pressed]}><Text style={styles.saveText}>Fiyatları kaydet</Text><IconSymbol name="checkmark.circle.fill" size={18} color="#FFFFFF" /></Pressable>
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 36, gap: 17 }, pressed: { opacity: 0.72 }, back: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 5, minHeight: 40, paddingHorizontal: 11, borderRadius: 13, backgroundColor: "#E8F0E5" }, backText: { color: "#1E4D3A", fontSize: 12, fontWeight: "900" }, hero: { gap: 7 }, heroIcon: { width: 46, height: 46, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "#1E4D3A" }, kicker: { color: "#52705E", fontSize: 10, fontWeight: "900", letterSpacing: 1.1, marginTop: 5 }, title: { color: "#1E2521", fontSize: 30, lineHeight: 36, fontWeight: "900", letterSpacing: -0.9 }, subtitle: { color: "#52705E", fontSize: 13, lineHeight: 19, fontWeight: "600" }, total: { padding: 15, borderRadius: 20, backgroundColor: "#173E2F", gap: 3 }, totalLabel: { color: "#A8CDB3", fontSize: 9, fontWeight: "900", letterSpacing: 1 }, totalValue: { color: "#FFFFFF", fontSize: 25, fontWeight: "900" }, totalNote: { color: "#DDE8DA", fontSize: 10, fontWeight: "700" }, list: { gap: 9 }, row: { minHeight: 66, flexDirection: "row", alignItems: "center", gap: 10, padding: 11, borderRadius: 18, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EAE7E0" }, rowIcon: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#DDE8DA" }, rowTitle: { color: "#1E2521", fontSize: 13, fontWeight: "900" }, rowHint: { color: "#6B756F", fontSize: 10, marginTop: 2, fontWeight: "600" }, priceInput: { width: 50, height: 38, textAlign: "right", color: "#1E2521", fontSize: 15, fontWeight: "900", borderBottomWidth: 1, borderBottomColor: "#C9DCC4" }, currency: { color: "#52705E", fontSize: 11, fontWeight: "900", minWidth: 16 }, reset: { minHeight: 42, alignItems: "center", justifyContent: "center" }, resetText: { color: "#1E4D3A", fontSize: 12, fontWeight: "900" }, save: { minHeight: 53, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#1E4D3A" }, saveText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
});
