import { Alert, Pressable, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import * as Speech from "expo-speech";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { LocalizedText as Text } from "@/components/localized-text";
import { ScreenContainer } from "@/components/screen-container";
import { getRecipe } from "@/lib/lezzet-data";
import { useLezzet } from "@/lib/lezzet-context";

export default function CookModeScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const recipe = getRecipe(params.id);
  const { profile, consumeRecipeFromPantry } = useLezzet();
  const [stepIndex, setStepIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [stockNotice, setStockNotice] = useState<string | null>(null);
  const step = recipe.steps[stepIndex];
  useEffect(() => { if (!running) return; const timer = setInterval(() => setSeconds((value) => value + 1), 1000); return () => clearInterval(timer); }, [running]);
  useEffect(() => () => { Speech.stop(); }, []);
  const speakStep = async () => { await Speech.stop(); Speech.speak(`${stepIndex + 1}. ${step}`, { language: profile.locale, rate: 0.92 }); };
  const completeRecipe = () => {
    setRunning(false); Speech.stop();
    Alert.alert("Tarif tamamlandı", "Tarifte kullanılan ve kilerinde eşleşen malzemeleri seçili kişi sayısına göre stoktan düşmek ister misin?", [
      { text: "Şimdi değil", style: "cancel", onPress: () => setStockNotice("Tarif tamamlandı. Kiler stokları değiştirilmedi.") },
      { text: "Kilerden düş", onPress: () => { const consumed = consumeRecipeFromPantry(recipe.ingredients, profile.people); setStockNotice(consumed.length ? `${consumed.join(", ")} kilerinden düşüldü.` : "Bu tarif için kilerinde eşleşen malzeme bulunamadı."); } },
    ]);
  };
  const next = () => { if (stepIndex < recipe.steps.length - 1) setStepIndex((index) => index + 1); else completeRecipe(); };
  const time = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const completion = ((stepIndex + 1) / recipe.steps.length) * 100;
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="flex-1" containerClassName="bg-background"><View style={styles.content}>
    <View style={styles.header}><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && { opacity: 0.6 }]}><IconSymbol name="chevron.left" size={23} color="#FFFFFF" /></Pressable><View style={{ flex: 1 }}><Text style={styles.eyebrow}>CANLI PİŞİRME · {Math.round(completion)}% TAMAM</Text><Text style={styles.recipeTitle} numberOfLines={1}>{recipe.title}</Text></View><View style={styles.timerPill}><View style={[styles.timerSignal, running && styles.timerSignalLive]} /><Text style={styles.timer}>{time}</Text></View></View>
    <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${completion}%` }]} /></View>
    <View style={styles.stage}><View style={styles.stageTop}><Text style={styles.stageKicker}>ŞİMDİ YAP</Text><Text style={styles.stageCounter}>{String(stepIndex + 1).padStart(2, "0")}<Text style={styles.stageTotal}> / {String(recipe.steps.length).padStart(2, "0")}</Text></Text></View><View style={styles.stepOrb}><Text style={styles.stepOrbText}>{stepIndex + 1}</Text></View><Text style={styles.stepText}>{step}</Text><View style={styles.stageBottom}><View style={styles.focusLine} /><Text style={styles.focusText}>{running ? "Zaman kayıyor, ritmi koru." : "Hazır olduğunda sayacı başlat."}</Text></View></View>
    <View style={styles.tip}><View style={styles.tipIcon}><IconSymbol name="sparkles" size={17} color="#B7652E" /></View><View style={{ flex: 1 }}><Text style={styles.tipKicker}>ŞEFİN NOTU</Text><Text style={styles.tipText}>{stepIndex === 0 ? "Başlamadan önce malzemeleri tezgâhta sıralamak akışı hızlandırır." : "Baskı yapma; adımı tamamladığında ilerle. İyi yemek ritimle olur."}</Text></View></View>
    {stockNotice ? <View style={styles.stockNotice}><IconSymbol name="cabinet.fill" size={17} color="#1E4D3A" /><Text style={styles.stockNoticeText}>{stockNotice}</Text></View> : null}
    <View style={styles.utilityRow}><Pressable onPress={() => setRunning((value) => !value)} style={({ pressed }) => [styles.utility, pressed && { opacity: 0.72 }]}><IconSymbol name={running ? "xmark" : "clock"} size={18} color="#1E4D3A" /><Text style={styles.utilityText}>{running ? "Duraklat" : "Sayaç"}</Text></Pressable><Pressable onPress={speakStep} style={({ pressed }) => [styles.utility, pressed && { opacity: 0.72 }]}><IconSymbol name="sparkles" size={18} color="#1E4D3A" /><Text style={styles.utilityText}>Sesli rehber</Text></Pressable></View>
    <View style={styles.bottom}><Pressable onPress={() => setStepIndex((index) => Math.max(0, index - 1))} disabled={stepIndex === 0} style={[styles.previous, stepIndex === 0 && { opacity: 0.32 }]}><Text style={styles.previousText}>Geri</Text></Pressable><Pressable onPress={next} style={({ pressed }) => [styles.next, pressed && { opacity: 0.86, transform: [{ scale: 0.985 }] }]}><Text style={styles.nextText}>{stepIndex === recipe.steps.length - 1 ? "Tarifi tamamla" : "Sonraki adım"}</Text><IconSymbol name="chevron.right" size={19} color="#FFFFFF" /></Pressable></View>
  </View></ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: 20, gap: 16, backgroundColor: "#112D22" }, header: { flexDirection: "row", alignItems: "center", gap: 11 }, back: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#285C47", alignItems: "center", justifyContent: "center" }, eyebrow: { color: "#9CC8AE", fontSize: 9, fontWeight: "900", letterSpacing: 1.12 }, recipeTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", marginTop: 3 }, timerPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 9, paddingVertical: 7, borderRadius: 12, backgroundColor: "#1E4D3A" }, timerSignal: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#6D9E80" }, timerSignalLive: { backgroundColor: "#F4A261" }, timer: { color: "#FFFFFF", fontVariant: ["tabular-nums"], fontSize: 14, fontWeight: "900" }, progressTrack: { height: 4, borderRadius: 4, overflow: "hidden", backgroundColor: "#315543" }, progressFill: { height: "100%", borderRadius: 4, backgroundColor: "#F4A261" },
  stage: { flex: 1, minHeight: 330, borderRadius: 31, padding: 22, backgroundColor: "#1B4A37", justifyContent: "space-between", overflow: "hidden" }, stageTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }, stageKicker: { color: "#A4CFB4", fontSize: 10, fontWeight: "900", letterSpacing: 1.25 }, stageCounter: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" }, stageTotal: { color: "#91BBA1", fontSize: 12 }, stepOrb: { width: 83, height: 83, borderRadius: 42, alignItems: "center", justifyContent: "center", backgroundColor: "#F4A261", borderWidth: 10, borderColor: "rgba(244,162,97,0.16)", alignSelf: "center", marginTop: 3 }, stepOrbText: { color: "#FFFFFF", fontSize: 31, fontWeight: "900" }, stepText: { color: "#FFFFFF", fontSize: 25, lineHeight: 33, letterSpacing: -0.65, fontWeight: "800", textAlign: "center", paddingHorizontal: 6 }, stageBottom: { alignItems: "center", gap: 9 }, focusLine: { height: 1, width: 70, backgroundColor: "#528568" }, focusText: { color: "#B5D2BD", fontSize: 11, fontWeight: "700" },
  tip: { flexDirection: "row", gap: 10, padding: 13, borderRadius: 18, backgroundColor: "#FCE6D2" }, tipIcon: { width: 32, height: 32, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: "#FFF3E8" }, tipKicker: { color: "#A45F33", fontSize: 9, fontWeight: "900", letterSpacing: 0.9 }, tipText: { color: "#7E4B2A", fontSize: 11, lineHeight: 16, fontWeight: "700", marginTop: 2 }, utilityRow: { flexDirection: "row", gap: 9 }, utility: { flex: 1, minHeight: 47, borderRadius: 15, alignItems: "center", justifyContent: "center", gap: 5, flexDirection: "row", backgroundColor: "#E8F1E7" }, utilityText: { color: "#1E4D3A", fontSize: 11, fontWeight: "900" }, bottom: { flexDirection: "row", gap: 10 }, previous: { flex: 0.32, minHeight: 54, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "#285C47" }, previousText: { color: "#DDE8DA", fontSize: 14, fontWeight: "800" }, next: { flex: 0.68, minHeight: 54, borderRadius: 17, alignItems: "center", justifyContent: "center", gap: 8, flexDirection: "row", backgroundColor: "#F4A261" }, nextText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  stockNotice: { minHeight: 42, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, borderRadius: 14, backgroundColor: "#DDE8DA" }, stockNoticeText: { flex: 1, color: "#1E4D3A", fontSize: 11, lineHeight: 16, fontWeight: "800" },
});
