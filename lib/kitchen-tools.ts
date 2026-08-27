export const kitchenToolCatalog = [
  { name: "Tava", icon: "flame.fill", note: "Sote, kızartma ve hızlı yemekler" },
  { name: "Tencere", icon: "clock", note: "Çorba, makarna ve sulu yemekler" },
  { name: "Fırın", icon: "cabinet.fill", note: "Fırın yemekleri, sebzeler ve tepsiler" },
  { name: "Air Fryer", icon: "sparkles", note: "Az yağlı ve pratik pişirme" },
  { name: "Düdüklü tencere", icon: "clock", note: "Bakliyat ve uzun pişen yemekler" },
  { name: "Wok", icon: "flame.fill", note: "Yüksek ısıda hızlı sebze ve erişte" },
  { name: "Döküm tencere", icon: "cabinet.fill", note: "Yavaş pişen güveç ve fırın yemekleri" },
  { name: "Mikrodalga", icon: "sparkles", note: "Hızlı ısıtma ve küçük porsiyonlar" },
  { name: "Pirinç pişirici", icon: "clock", note: "Pirinç, tahıl ve buharda sebze" },
  { name: "Yavaş pişirici", icon: "clock", note: "Ön hazırlıklı, düşük ısıda tarifler" },
  { name: "Blender", icon: "sparkles", note: "Çorba, sos ve smoothie" },
  { name: "Mutfak robotu", icon: "sparkles", note: "Doğrama, rendeleme ve hamur işleri" },
  { name: "Buharlı pişirici", icon: "leaf.fill", note: "Hafif sebze, balık ve köfte" },
  { name: "Elektrikli ızgara", icon: "flame.fill", note: "Izgara sebze, et ve sandviç" },
  { name: "Tost makinesi", icon: "cabinet.fill", note: "Sandviç, gözleme ve hızlı atıştırmalık" },
] as const;

export const kitchenToolNames = kitchenToolCatalog.map((tool) => tool.name);
export type KitchenToolName = (typeof kitchenToolCatalog)[number]["name"];
