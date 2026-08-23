import { Pressable, StyleSheet, Text, View } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";

export function SectionTitle({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {action ? <Pressable onPress={onPress} style={({ pressed }) => [styles.action, pressed && { opacity: 0.6 }]}><Text style={styles.actionText}>{action}</Text><IconSymbol name="chevron.right" size={14} color="#1E4D3A" /></Pressable> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  title: { color: "#1E2521", fontSize: 21, fontWeight: "800", letterSpacing: -0.3 },
  action: { flexDirection: "row", alignItems: "center", gap: 1, minHeight: 38, justifyContent: "flex-end" },
  actionText: { color: "#1E4D3A", fontSize: 13, fontWeight: "800" },
});
