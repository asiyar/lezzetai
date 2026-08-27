import { Alert, Platform, Pressable, StyleSheet } from "react-native";
import { useAudioRecorder, useAudioRecorderState, RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync } from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useLezzet } from "@/lib/lezzet-context";

type VoiceInputButtonProps = { onText: (text: string) => void; disabled?: boolean; label?: string };

export function VoiceInputButton({ onText, disabled = false, label = "Sesli dikte" }: VoiceInputButtonProps) {
  const { profile } = useLezzet();
  const recorder = useAudioRecorder(RecordingPresets.LOW_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const transcribe = trpc.voice.transcribe.useMutation({
    onSuccess: (result) => {
      if (!result.text) { Alert.alert("Ses anlaşılamadı", "Daha kısa ve net bir kayıtla tekrar deneyebilirsin."); return; }
      onText(result.text);
    },
    onError: () => Alert.alert("Sesli giriş kullanılamadı", "Kayıt yazıya çevrilemedi. Metni yazarak devam edebilirsin."),
  });

  const start = async () => {
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) { Alert.alert("Mikrofon izni gerekli", "Sesle yazmak için mikrofon erişimine izin vermelisin."); return; }
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch { Alert.alert("Kayıt başlatılamadı", "Mikrofonu kullanan başka bir uygulamayı kapatıp tekrar deneyebilirsin."); }
  };

  const stopAndTranscribe = async () => {
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) throw new Error("missing recording");
      const audioBase64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      if (!audioBase64 || audioBase64.length > 8_000_000) { Alert.alert("Kayıt çok uzun", "Lütfen en fazla kısa bir cümle olacak şekilde yeniden dene."); return; }
      const language = profile.locale.split("-")[0] as "tr" | "en" | "de" | "es" | "fr";
      transcribe.mutate({ audioBase64, mimeType: Platform.OS === "web" ? "audio/webm" : "audio/m4a", language });
    } catch { Alert.alert("Kayıt okunamadı", "Ses kaydı tamamlanamadı. Metni yazarak devam edebilirsin."); }
  };

  const isBusy = disabled || transcribe.isPending;
  return <Pressable accessibilityRole="button" accessibilityLabel={recorderState.isRecording ? "Ses kaydını bitir" : label} onPress={recorderState.isRecording ? stopAndTranscribe : start} disabled={isBusy} style={({ pressed }) => [styles.button, recorderState.isRecording && styles.recording, (pressed || isBusy) && styles.dim]}><IconSymbol name="mic.fill" size={18} color={recorderState.isRecording ? "#FFFFFF" : "#1E4D3A"} /></Pressable>;
}

const styles = StyleSheet.create({
  button: { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "#DDE8DA" },
  recording: { backgroundColor: "#C84D40" },
  dim: { opacity: 0.65 },
});
