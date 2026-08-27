import { Pressable, ScrollView, Share, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useMemo, useState } from "react";

import { LocalizedText as Text } from "@/components/localized-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ScreenContainer } from "@/components/screen-container";
import { useLezzet } from "@/lib/lezzet-context";
import { getLowStockShoppingSeeds } from "@/lib/pantry-insights";
import { formatLocalCurrency, getMarketCategoryKey, getMarketCategoryLabel } from "@/lib/seasonal-market";

export default function SmartShoppingScreen() {
  const { pantry, pantryMeta, profile, marketPrices, grocery, addLowStockToGrocery } = useLezzet();
  const [message, setMessage] = useState<string | null>(null);
  const lowItems = useMemo(() => getLowStockShoppingSeeds(pantry, pantryMeta), [pantry, pantryMeta]);
  const total = useMemo(() => lowItems.reduce((sum, item) => sum + marketPrices[profile.locale][getMarketCategoryKey(item)], 0), [lowItems, marketPrices, profile.locale]);
  const transfer = () => {
    const added = addLowStockToGrocery();
    setMessage(added.length ? `${added.length} düşük stok ürünü alışveriş listene eklendi.` : "Şu anda otomatik aktarılacak düşük stok ürünü yok.");
  };
  const share = async () => {
    const list = lowItems.length ? lowItems.map((item) => `□ ${item}`).join("\n") : grocery.map((item) => `${item.checked ? "✓" : "□"} ${item.name}`).join("\n");
    await Share.share({ title: "Akıllı alışveriş listem", message: `LezzetAI · düşük stok alışveriş listem\n\n${list || "Liste boş."}` });
  };
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="flex-1" containerClassName="bg-background"><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.header}><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && { opacity: 0.6 }]}><IconSymbol name="chevron.left" size={23} color="#1E4D3A" /></Pressable><View style={{ flex: 1 }}><Text style={styles.eyebrow}>KİLER OTOMASYONU</Text><Text style={styles.title}>Akıllı alışveriş</Text></View><View style={styles.basket}><IconSymbol name="cart.fill" size={19} color="#FFFFFF" /></View></View>
    <View style={styles.hero}><View style={styles.heroIcon}><IconSymbol name="sparkles" size={22} color="#1E4D3A" /></View><Text style={styles.heroTitle}>{lowItems.length ? `${lowItems.length} ürün yenilenmeyi bekliyor` : "Kilerin dengede görünüyor"}</Text><Text style={styles.heroText}>Kilerde eşiğin altına düşen ürünler otomatik olarak burada toplanır. İstersen bir dokunuşla aktif alışveriş listene ekle ve paylaş.</Text><Text style={styles.heroValue}>≈ {formatLocalCurrency(total, profile.locale)}</Text></View>
    <View style={styles.list}>{lowItems.length ? lowItems.map((item) => { const key = getMarketCategoryKey(item); return <View key={item} style={styles.row}><View style={styles.rowIcon}><IconSymbol name="exclamationmark.triangle.fill" size={17} color="#B7652E" /></View><View style={{ flex: 1 }}><Text style={styles.name}>{item}</Text><Text style={styles.meta}>{getMarketCategoryLabel(key, profile.locale)} · eşik {pantryMeta[item]?.lowStockThreshold ?? 1} · mevcut {pantryMeta[item]?.quantity ?? 0} {pantryMeta[item]?.unit ?? "adet"}</Text></View><Text style={styles.cost}>{formatLocalCurrency(marketPrices[profile.locale][key], profile.locale)}</Text></View>; }) : <View style={styles.empty}><IconSymbol name="checkmark.circle.fill" size={28} color="#2D7A55" /><Text style={styles.emptyText}>Düşük stok ürünü yok. Kilerdeki miktarlar değiştiğinde bu liste otomatik güncellenir.</Text></View>}</View>
    <Pressable onPress={transfer} style={({ pressed }) => [styles.transfer, pressed && { opacity: 0.84 }]}><IconSymbol name="cart.fill" size={20} color="#FFFFFF" /><Text style={styles.transferText}>Akıllı listeye aktar</Text></Pressable>
    <Pressable onPress={share} style={({ pressed }) => [styles.share, pressed && { opacity: 0.7 }]}><IconSymbol name="paperplane.fill" size={19} color="#1E4D3A" /><Text style={styles.shareText}>Listeyi tek dokunuşla paylaş</Text></Pressable>
    {message ? <View style={styles.message}><IconSymbol name="checkmark.circle.fill" size={17} color="#2D7A55" /><Text style={styles.messageText}>{message}</Text></View> : null}
    <Pressable onPress={() => router.push("/shopping-list" as never)} style={({ pressed }) => [styles.manage, pressed && { opacity: 0.7 }]}><Text style={styles.manageText}>Aktif alışveriş listesini aç</Text><IconSymbol name="chevron.right" size={17} color="#1E4D3A" /></Pressable>
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 16 }, header: { flexDirection: "row", alignItems: "center", gap: 12 }, back: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EAE7E0" }, eyebrow: { color: "#6B756F", fontSize: 10, letterSpacing: 1, fontWeight: "900" }, title: { color: "#1E2521", fontSize: 25, lineHeight: 30, fontWeight: "900" }, basket: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#1E4D3A" }, hero: { gap: 7, padding: 18, borderRadius: 23, backgroundColor: "#DDE8DA", borderWidth: 1, borderColor: "#C9DCC4" }, heroIcon: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" }, heroTitle: { color: "#1E4D3A", fontSize: 17, fontWeight: "900", marginTop: 3 }, heroText: { color: "#52705E", fontSize: 11, lineHeight: 16 }, heroValue: { color: "#1E2521", fontSize: 20, fontWeight: "900", marginTop: 3 }, list: { overflow: "hidden", borderRadius: 21, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EAE7E0" }, row: { minHeight: 70, flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderBottomWidth: 1, borderBottomColor: "#F0EEE9" }, rowIcon: { width: 33, height: 33, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: "#FFF1E4" }, name: { color: "#1E2521", fontSize: 13, fontWeight: "900" }, meta: { color: "#6B756F", fontSize: 10, marginTop: 3 }, cost: { color: "#1E4D3A", fontSize: 11, fontWeight: "900" }, empty: { padding: 26, gap: 8, alignItems: "center" }, emptyText: { color: "#52705E", fontSize: 12, lineHeight: 18, textAlign: "center" }, transfer: { minHeight: 52, borderRadius: 17, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, backgroundColor: "#1E4D3A" }, transferText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" }, share: { minHeight: 48, borderRadius: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#C9DCC4" }, shareText: { color: "#1E4D3A", fontSize: 13, fontWeight: "900" }, message: { flexDirection: "row", gap: 8, padding: 12, borderRadius: 15, backgroundColor: "#EEF5EC" }, messageText: { flex: 1, color: "#2D7A55", fontSize: 11, lineHeight: 16, fontWeight: "800" }, manage: { minHeight: 45, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 13, borderRadius: 15, backgroundColor: "#FFF4EA" }, manageText: { color: "#89502B", fontSize: 12, fontWeight: "900" },
});
