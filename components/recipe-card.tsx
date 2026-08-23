import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import type { Recipe } from "@/lib/lezzet-data";

export function RecipeCard({ recipe, compact = false, isFavorite = false, onPress, onToggleFavorite }: { recipe: Recipe; compact?: boolean; isFavorite?: boolean; onPress: () => void; onToggleFavorite?: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, compact && styles.compactCard, pressed && styles.pressed]}>
      <Image source={recipe.image} style={[styles.image, compact && styles.compactImage]} resizeMode="cover" />
      <View style={styles.content}>
        <View style={styles.topline}>
          <Text style={styles.category}>{recipe.category}</Text>
          {onToggleFavorite ? (
            <Pressable onPress={onToggleFavorite} hitSlop={8} style={({ pressed }) => [styles.favorite, pressed && styles.iconPressed]}>
              <IconSymbol name={isFavorite ? "heart.fill" : "heart"} size={18} color={isFavorite ? "#D4553E" : "#6B756F"} />
            </Pressable>
          ) : null}
        </View>
        <Text style={styles.title} numberOfLines={compact ? 1 : 2}>{recipe.title}</Text>
        {!compact ? <Text style={styles.subtitle} numberOfLines={2}>{recipe.subtitle}</Text> : null}
        <View style={styles.metaRow}>
          <View style={styles.meta}><IconSymbol name="clock" size={14} color="#6B756F" /><Text style={styles.metaText}>{recipe.minutes} dk</Text></View>
          <View style={styles.meta}><IconSymbol name="flame.fill" size={14} color="#E77B4D" /><Text style={styles.metaText}>{recipe.calories} kcal</Text></View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { width: 244, backgroundColor: "#FFFFFF", borderRadius: 24, overflow: "hidden", borderWidth: 1, borderColor: "#ECEAE4", shadowColor: "#1E2521", shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  compactCard: { width: "100%", flexDirection: "row", borderRadius: 20, minHeight: 112 },
  image: { width: "100%", height: 150 },
  compactImage: { width: 104, height: "100%" },
  content: { flex: 1, padding: 14, gap: 6 },
  topline: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  category: { fontSize: 11, lineHeight: 16, fontWeight: "700", letterSpacing: 0.25, color: "#1E4D3A", textTransform: "uppercase", flex: 1 },
  favorite: { paddingLeft: 6, paddingVertical: 2 },
  title: { color: "#1E2521", fontWeight: "800", fontSize: 16, lineHeight: 21 },
  subtitle: { color: "#6B756F", fontSize: 12, lineHeight: 17 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 11, marginTop: "auto" },
  meta: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { color: "#6B756F", fontSize: 12, fontWeight: "600" },
  pressed: { opacity: 0.84, transform: [{ scale: 0.985 }] },
  iconPressed: { opacity: 0.62 },
});
