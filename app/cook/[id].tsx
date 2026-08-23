import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import * as Speech from "expo-speech";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { ScreenContainer } from "@/components/screen-container";
import { getRecipe } from "@/lib/lezzet-data";

export default function CookModeScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const recipe = getRecipe(params.id);
  const [stepIndex, setStepIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const step = recipe.steps[stepIndex];
  useEffect(() => { if (!running) return; const timer = setInterval(() => setSeconds((value) => value + 1), 1000); return () => clearInterval(timer); }, [running]);
  useEffect(() => () => { Speech.stop(); }, []);
  const speakStep = async () => { await Speech.stop(); Speech.speak(`Adım ${stepIndex + 1}. ${step}`, { language: "tr-TR", rate: 0.92 }); };
  const next = () => { if (stepIndex < recipe.steps.length - 1) setStepIndex((index) => index + 1); else { setRunning(false); Speech.stop(); } };
  const time = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="flex-1" containerClassName="bg-background"><View style={styles.content}>
    <View style={styles.header}><Pressable onPress={() => router.back()} style={styles.back}><IconSymbol name="chevron.left" size={23} color="#1E4D3A" /></Pressable><View style={{ flex: 1 }}><Text style={styles.eyebrow}>CANLI PİŞİRME</Text><Text style={styles.recipeTitle} numberOfLines={1}>{recipe.title}</Text></View><Text style={styles.timer}>{time}</Text></View>
    <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${((stepIndex + 1) / recipe.steps.length) * 100}%` }]} /></View><Text style={styles.progressLabel}>ADIM {stepIndex + 1} / {recipe.steps.length}</Text>
    <View style={styles.stepCard}><View style={styles.stepCircle}><Text style={styles.stepCircleText}>{stepIndex + 1}</Text></View><Text style={styles.stepText}>{step}</Text></View>
    <View style={styles.tip}><IconSymbol name="sparkles" size={18} color="#B7652E" /><Text style={styles.tipText}>{stepIndex === 0 ? "Önce tüm malzemeleri kolayca ulaşabileceğin şekilde hazırla." : "Adımı tamamladığında devam et; ritmi sen belirliyorsun."}</Text></View>
    <View style={styles.controls}><Pressable onPress={() => setRunning((value) => !value)} style={({ pressed }) => [styles.timerControl, pressed && { opacity: 0.7 }]}><IconSymbol name={running ? "xmark" : "clock"} size={19} color="#1E4D3A" /><Text style={styles.timerControlText}>{running ? "Sayacı durdur" : "Sayacı başlat"}</Text></Pressable><Pressable onPress={speakStep} style={({ pressed }) => [styles.voiceControl, pressed && { opacity: 0.7 }]}><IconSymbol name="sparkles" size={19} color="#FFFFFF" /><Text style={styles.voiceControlText}>Adımı seslendir</Text></Pressable></View>
    <View style={styles.bottom}><Pressable onPress={() => setStepIndex((index) => Math.max(0, index - 1))} disabled={stepIndex === 0} style={[styles.secondary, stepIndex === 0 && { opacity: 0.35 }]}><Text style={styles.secondaryText}>Geri</Text></Pressable><Pressable onPress={next} style={styles.primary}><Text style={styles.primaryText}>{stepIndex === recipe.steps.length - 1 ? "Bitir" : "Sonraki adım"}</Text><IconSymbol name="chevron.right" size={19} color="#FFFFFF" /></Pressable></View>
    <Text style={styles.note}>Sesli rehber için cihaz sesinin açık olması gerekir.</Text>
  </View></ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: 20, gap: 18 }, header: { flexDirection: "row", alignItems: "center", gap: 11 }, back: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#DDE8DA", alignItems: "center", justifyContent: "center" }, eyebrow: { color: "#6B756F", fontSize: 10, fontWeight: "900", letterSpacing: 1 }, recipeTitle: { color: "#1E2521", fontSize: 16, fontWeight: "800", marginTop: 2 }, timer: { color: "#1E4D3A", fontVariant: ["tabular-nums"], fontSize: 18, fontWeight: "900" }, progressTrack: { height: 7, borderRadius: 4, backgroundColor: "#DDE8DA", overflow: "hidden", marginTop: 3 }, progressFill: { height: "100%", borderRadius: 4, backgroundColor: "#1E4D3A" }, progressLabel: { color: "#6B756F", fontSize: 11, fontWeight: "900", letterSpacing: 0.8, textAlign: "center", marginTop: -10 }, stepCard: { flex: 1, minHeight: 275, borderRadius: 28, justifyContent: "center", alignItems: "center", padding: 28, backgroundColor: "#1E4D3A" }, stepCircle: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", backgroundColor: "#F4A261", marginBottom: 20 }, stepCircleText: { color: "#FFFFFF", fontSize: 28, fontWeight: "900" }, stepText: { color: "#FFFFFF", fontSize: 22, lineHeight: 31, fontWeight: "700", textAlign: "center", letterSpacing: -0.35 }, tip: { flexDirection: "row", gap: 9, padding: 13, borderRadius: 17, backgroundColor: "#FCE6D2" }, tipText: { flex: 1, color: "#89502B", fontSize: 12, lineHeight: 17, fontWeight: "600" }, controls: { flexDirection: "row", gap: 9 }, timerControl: { flex: 1, minHeight: 47, borderRadius: 15, backgroundColor: "#DDE8DA", alignItems: "center", justifyContent: "center", gap: 5 }, timerControlText: { color: "#1E4D3A", fontSize: 11, fontWeight: "800" }, voiceControl: { flex: 1, minHeight: 47, borderRadius: 15, backgroundColor: "#1E4D3A", alignItems: "center", justifyContent: "center", gap: 5 }, voiceControlText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" }, bottom: { flexDirection: "row", gap: 10 }, secondary: { flex: 0.36, minHeight: 53, borderRadius: 16, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#C9DCC4", alignItems: "center", justifyContent: "center" }, secondaryText: { color: "#1E4D3A", fontSize: 14, fontWeight: "800" }, primary: { flex: 0.64, minHeight: 53, borderRadius: 16, backgroundColor: "#1E4D3A", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }, primaryText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" }, note: { color: "#6B756F", fontSize: 10, textAlign: "center", marginTop: -8 },
});
