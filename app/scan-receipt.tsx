import { Alert, Image, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";

import { LocalizedText as Text } from "@/components/localized-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useLezzet } from "@/lib/lezzet-context";
import type { StockUnit } from "@/lib/pantry-insights";

type ReceiptResult = { ingredients: { name: string; category: string; confidence: "Yüksek" | "Orta"; quantity: number; unit: StockUnit; quantityConfidence: "Yüksek" | "Orta" | "Düşük"; lineTotal?: number }[]; safetyNote: string; storeName?: string; receiptDate?: string; receiptTotal?: number };

export default function ScanReceiptScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<ReceiptResult | null>(null);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const { addPantryItems, recordReceiptPurchases } = useLezzet();
  const scan = trpc.chef.scanReceipt.useMutation({ onSuccess: (data) => { setResult(data); setPrices(Object.fromEntries(data.ingredients.map((item, index) => [`${item.name}-${index}`, item.lineTotal === undefined ? "" : String(item.lineTotal)]))); } });

  const chooseReceipt = async (source: "camera" | "library") => {
    const options = { mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, quality: 0.85, base64: true };
    if (source === "camera") {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (permission.status !== "granted") { Alert.alert("Kamera izni gerekli", "Fişi taramak için kamera izni vermelisin."); return; }
    }
    const selection = source === "camera" ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
    if (selection.canceled) return;
    const asset = selection.assets[0];
    if (!asset.base64) { Alert.alert("Fiş okunamadı", "Fişi düz ve aydınlık bir zeminde yeniden çekmeyi dene."); return; }
    setImageUri(asset.uri); setResult(null); setPrices({});
    await scan.mutateAsync({ imageBase64: asset.base64, mimeType: asset.mimeType === "image/png" ? "image/png" : asset.mimeType === "image/webp" ? "image/webp" : "image/jpeg" });
  };

  const addAll = () => {
    if (!result?.ingredients.length) return;
    addPantryItems(result.ingredients.map((item) => ({ name: item.name, quantity: item.quantity, unit: item.unit })));
    const approvedPrices = result.ingredients.flatMap((item, index) => { const raw = prices[`${item.name}-${index}`]?.replace(",", ".").trim(); const amount = Number(raw); return raw && Number.isFinite(amount) && amount >= 0 ? [{ name: item.name, categoryKey: item.category || "Diğer", amount, storeName: result.storeName }] : []; });
    recordReceiptPurchases(approvedPrices, result.receiptDate);
    Alert.alert("Kiler güncellendi", `${result.ingredients.length} ürün yaklaşık miktarıyla kilere eklendi.${approvedPrices.length ? ` ${approvedPrices.length} gerçek satır fiyatı analiz geçmişine kaydedildi.` : " Fiyat görünmeyen satırlar analiz geçmişine eklenmedi."} Son kullanma tarihlerini Kiler ekranından ekleyebilirsin.`);
    router.replace("/(tabs)/pantry" as never);
  };

  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="flex-1" containerClassName="bg-background"><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.header}><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && { opacity: 0.6 }]}><IconSymbol name="chevron.left" size={23} color="#1E4D3A" /></Pressable><View style={{ flex: 1 }}><Text style={styles.eyebrow}>TOPLU KİLER EKLEME</Text><Text style={styles.title}>Market fişini tara</Text></View></View>
    {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" /> : <View style={styles.empty}><View style={styles.emptyIcon}><IconSymbol name="doc.text.viewfinder" size={36} color="#1E4D3A" /></View><Text style={styles.emptyTitle}>Fişin tamamını kadraja al.</Text><Text style={styles.emptyText}>Işık yansımasını azalt, tüm ürün satırlarının net göründüğünden emin ol. Kişisel ve ödeme bilgileri ürün listesine eklenmez.</Text></View>}
    <View style={styles.actions}><Pressable onPress={() => chooseReceipt("camera")} disabled={scan.isPending} style={({ pressed }) => [styles.primary, (pressed || scan.isPending) && { opacity: 0.75 }]}><IconSymbol name="camera.fill" size={20} color="#FFFFFF" /><Text style={styles.primaryText}>{scan.isPending ? "Fiş inceleniyor" : "Fiş fotoğrafı çek"}</Text></Pressable><Pressable onPress={() => chooseReceipt("library")} disabled={scan.isPending} style={({ pressed }) => [styles.secondary, (pressed || scan.isPending) && { opacity: 0.7 }]}><IconSymbol name="photo" size={19} color="#1E4D3A" /><Text style={styles.secondaryText}>Galeriden seç</Text></Pressable></View>
    {scan.isError ? <View style={styles.error}><Text style={styles.errorTitle}>Fişi şu an okuyamadık.</Text><Text style={styles.errorText}>Satırları daha net gösteren bir fotoğrafla yeniden dene.</Text></View> : null}
    {result ? <View style={styles.result}><View style={styles.resultHead}><View><Text style={styles.label}>TANINAN GIDA ÜRÜNLERİ</Text><Text style={styles.resultTitle}>{result.ingredients.length} ürün onayını bekliyor</Text><Text style={styles.receiptMeta}>{[result.storeName, result.receiptDate, result.receiptTotal === undefined ? undefined : `Toplam ≈ ${result.receiptTotal}`].filter(Boolean).join(" · ") || "Mağaza/tarih okunamadı"}</Text></View><View style={styles.resultIcon}><IconSymbol name="checkmark.circle.fill" size={21} color="#2D7A55" /></View></View><View style={styles.list}>{result.ingredients.map((item, index) => <View key={`${item.name}-${index}`} style={styles.row}><View style={styles.rowMark}><IconSymbol name="cart.fill" size={16} color="#1E4D3A" /></View><View style={{ flex: 1 }}><Text style={styles.name}>{item.name}</Text><Text style={styles.meta}>{item.category} · ≈ {item.quantity} {item.unit} · {item.quantityConfidence} miktar güveni</Text></View><View style={styles.priceArea}><Text style={styles.priceLabel}>SATIR FİYATI</Text><TextInput value={prices[`${item.name}-${index}`] ?? ""} onChangeText={(value) => setPrices((current) => ({ ...current, [`${item.name}-${index}`]: value }))} placeholder="—" placeholderTextColor="#87918B" keyboardType="decimal-pad" style={styles.priceInput} /></View></View>)}</View><View style={styles.note}><IconSymbol name="exclamationmark.triangle.fill" size={16} color="#B7652E" /><Text style={styles.noteText}>{result.safetyNote} Boş bıraktığın fiyatlar kaydedilmez.</Text></View><Pressable onPress={addAll} style={({ pressed }) => [styles.addAll, pressed && { opacity: 0.85 }]}><Text style={styles.addAllText}>Kontrol ettim: kilere ve geçmişe kaydet</Text><IconSymbol name="cabinet.fill" size={20} color="#FFFFFF" /></Pressable></View> : null}
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 18 }, header: { flexDirection: "row", alignItems: "center", gap: 12 }, back: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EAE7E0", alignItems: "center", justifyContent: "center" }, eyebrow: { color: "#6B756F", fontSize: 10, fontWeight: "900", letterSpacing: 1 }, title: { color: "#1E2521", fontSize: 25, lineHeight: 30, fontWeight: "900", letterSpacing: -0.55 }, preview: { width: "100%", height: 270, borderRadius: 24, backgroundColor: "#F5F8F3" }, empty: { minHeight: 270, padding: 26, justifyContent: "center", alignItems: "center", backgroundColor: "#DDE8DA", borderRadius: 24 }, emptyIcon: { width: 70, height: 70, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF", marginBottom: 12 }, emptyTitle: { color: "#1E2521", fontSize: 16, fontWeight: "900", textAlign: "center" }, emptyText: { color: "#52705E", fontSize: 12, lineHeight: 18, textAlign: "center", marginTop: 6 }, actions: { gap: 9 }, primary: { minHeight: 52, borderRadius: 17, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, backgroundColor: "#1E4D3A" }, primaryText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" }, secondary: { minHeight: 48, borderRadius: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 7, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#C9DCC4" }, secondaryText: { color: "#1E4D3A", fontSize: 13, fontWeight: "900" }, error: { padding: 14, borderRadius: 18, backgroundColor: "#FDE7E4" }, errorTitle: { color: "#9D332A", fontSize: 14, fontWeight: "900" }, errorText: { color: "#B54C40", fontSize: 11, marginTop: 3 }, result: { padding: 16, gap: 13, borderRadius: 23, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#C9DCC4" }, resultHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, label: { color: "#1E4D3A", fontSize: 9, fontWeight: "900", letterSpacing: 0.9 }, resultTitle: { color: "#1E2521", fontSize: 18, fontWeight: "900", marginTop: 3 }, receiptMeta: { color: "#6B756F", fontSize: 10, marginTop: 4 }, resultIcon: { width: 38, height: 38, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "#DDE8DA" }, list: { gap: 7 }, row: { minHeight: 62, flexDirection: "row", alignItems: "center", gap: 9, padding: 10, borderRadius: 14, backgroundColor: "#F5F8F3" }, rowMark: { width: 28, height: 28, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#DDE8DA" }, name: { color: "#1E2521", fontSize: 13, fontWeight: "900" }, meta: { color: "#6B756F", fontSize: 10, marginTop: 2 }, priceArea: { width: 62, alignItems: "flex-end" }, priceLabel: { color: "#6B756F", fontSize: 7, fontWeight: "900", letterSpacing: 0.4, marginBottom: 3 }, priceInput: { width: 58, height: 29, borderRadius: 8, backgroundColor: "#FFFFFF", paddingHorizontal: 7, color: "#1E4D3A", fontSize: 12, fontWeight: "900", textAlign: "right" }, note: { flexDirection: "row", gap: 8, padding: 10, borderRadius: 13, backgroundColor: "#FFF1E4" }, noteText: { flex: 1, color: "#89502B", fontSize: 10, lineHeight: 15 }, addAll: { minHeight: 51, borderRadius: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, backgroundColor: "#B7652E" }, addAllText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
});
