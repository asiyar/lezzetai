import { router } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";

const UPDATED_AT = "24 Ağustos 2026";

type PolicySectionProps = {
  title: string;
  children: ReactNode;
};

function PolicySection({ title, children }: PolicySectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function PolicyItem({ children }: { children: ReactNode }) {
  return (
    <View style={styles.itemRow}>
      <View style={styles.bullet} />
      <Text style={styles.bodyText}>{children}</Text>
    </View>
  );
}

export default function PrivacyScreen() {
  return (
    <ScreenContainer className="flex-1" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel="Önceki ekrana dön">
            <Text style={styles.backButtonText}>Geri</Text>
          </Pressable>
          <View style={styles.badge}><Text style={styles.badgeText}>GİZLİLİK</Text></View>
          <Text style={styles.title}>Verilerinin kontrolü sende.</Text>
          <Text style={styles.lead}>Bu metin, LezzetAI’nin hangi verileri hangi özellik için kullandığını sade biçimde açıklar.</Text>
          <Text style={styles.updated}>Son güncelleme: {UPDATED_AT}</Text>
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Önemli not</Text>
          <Text style={styles.noticeText}>LezzetAI bir tıbbi cihaz değildir; beslenme ve aktivite özetleri yalnızca kişisel planlamayı desteklemek içindir. Tıbbi kararlar için bir sağlık profesyoneline başvur.</Text>
        </View>

        <PolicySection title="Topladığımız veriler">
          <PolicyItem>Diyet hedefleri, alerjen tercihleri, kişi sayısı, kiler içeriği, menü planı, tarif geri bildirimleri ve mutfak günlüğü varsayılan olarak yalnızca cihazındaki uygulama depolamasında tutulur.</PolicyItem>
          <PolicyItem>Fotoğraftan malzeme veya ekipman tanımayı seçtiğinde, seçtiğin görsel analiz edilmek üzere güvenli uygulama sunucusuna gönderilir. Görsel, yalnızca talep ettiğin tanıma ve öneri sonucunu üretmek için işlenir.</PolicyItem>
          <PolicyItem>AI Şef’e gönderdiğin metin, seçtiğin malzemeler ve isteğe bağlı fotoğraflar tarif yanıtı üretmek için sunucu tarafındaki yapay zekâ hizmetlerine iletilir.</PolicyItem>
          <PolicyItem>Ortak alışveriş listesine katılırsan liste adı, ürünler, ürün durumları, katılımcı görünür adları ve davet koduna bağlı liste verileri senkronizasyon için bulut veritabanında tutulur.</PolicyItem>
          <PolicyItem>HealthKit veya Health Connect erişimini açıkça onaylarsan yalnızca adım ve aktif enerji özeti okunur. Bu veriler günlük kalori ve makro hedefini uyarlamak için kullanılır; uygulama bu sağlık verilerini satmaz veya reklam amacıyla kullanmaz.</PolicyItem>
        </PolicySection>

        <PolicySection title="İzinler ve seçimlerin">
          <PolicyItem>Kamera ve fotoğraf izni, yalnızca sen fotoğraf tarama akışını başlattığında malzeme ya da ekipman görseli seçmek içindir.</PolicyItem>
          <PolicyItem>Bildirim izni, son kullanma öncelikleri ve planlanmış mutfak hatırlatıcıları için kullanılır.</PolicyItem>
          <PolicyItem>HealthKit veya Health Connect izni isteğe bağlıdır. İzni cihazının ayarlarından istediğin an geri çekebilirsin; LezzetAI sağlık verisi yazmaz.</PolicyItem>
          <PolicyItem>Mikrofon, kişi listesi, konum veya reklam kimliği izni istenmez.</PolicyItem>
        </PolicySection>

        <PolicySection title="Paylaşım, saklama ve güvenlik">
          <PolicyItem>Veriler reklam ağlarına satılmaz veya davranışsal reklamcılık amacıyla paylaşılmaz.</PolicyItem>
          <PolicyItem>Yapay zekâ yanıtı için gereken istek verileri, seçtiğin özelliği sağlamak amacıyla ilgili hizmet sağlayıcılarla işlenebilir. Paylaşım özelliği dışında yerel planlama verilerin cihazından otomatik olarak paylaşılmaz.</PolicyItem>
          <PolicyItem>Cihazındaki yerel verileri uygulamayı kaldırarak veya uygulama içi verileri temizleyerek silebilirsin. Ortak alışveriş listesi verileri için yayınlanacak destek kanalı üzerinden silme talebi sunulacaktır.</PolicyItem>
          <PolicyItem>Veri akışlarını sınırlandırmak, yalnızca gerekli izinleri istemek ve yetkisiz erişim riskini azaltmak için makul teknik ve organizasyonel önlemler uygulanır.</PolicyItem>
        </PolicySection>

        <PolicySection title="Yayın öncesi iletişim bilgisi">
          <Text style={styles.bodyText}>Mağaza yayını tamamlanmadan önce bu ekrana doğrulanmış destek ve veri silme iletişim adresi eklenecektir. Aynı erişilebilir gizlilik bağlantısı App Store ve Google Play listelemelerinde kullanılacaktır.</Text>
        </PolicySection>

        <Text style={styles.footer}>LezzetAI · Kişisel mutfak asistanı</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40, gap: 20 },
  header: { gap: 10, paddingTop: 4 },
  backButton: { alignSelf: "flex-start", minHeight: 40, justifyContent: "center", paddingHorizontal: 14, borderRadius: 14, backgroundColor: "#E8F0E5" },
  backButtonText: { color: "#1E4D3A", fontSize: 13, fontWeight: "800" },
  pressed: { opacity: 0.66 },
  badge: { alignSelf: "flex-start", borderRadius: 10, backgroundColor: "#FCE2CD", paddingHorizontal: 10, paddingVertical: 6, marginTop: 8 },
  badgeText: { color: "#9D4F20", fontSize: 10, fontWeight: "900", letterSpacing: 1.1 },
  title: { color: "#1E2521", fontSize: 31, lineHeight: 37, fontWeight: "900", letterSpacing: -1.1 },
  lead: { color: "#52705E", fontSize: 15, lineHeight: 22, fontWeight: "600" },
  updated: { color: "#87918B", fontSize: 11, fontWeight: "700" },
  notice: { gap: 7, padding: 16, borderRadius: 20, backgroundColor: "#FFF4EA", borderWidth: 1, borderColor: "#F3D4BC" },
  noticeTitle: { color: "#9D4F20", fontSize: 14, fontWeight: "900" },
  noticeText: { color: "#83542F", fontSize: 12, lineHeight: 18, fontWeight: "600" },
  section: { gap: 10, padding: 17, borderRadius: 22, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EAE7E0" },
  sectionTitle: { color: "#1E4D3A", fontSize: 16, fontWeight: "900", letterSpacing: -0.2 },
  sectionBody: { gap: 10 },
  itemRow: { flexDirection: "row", alignItems: "flex-start", gap: 9 },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 6, backgroundColor: "#D8783E" },
  bodyText: { flex: 1, color: "#4F5B54", fontSize: 12, lineHeight: 18, fontWeight: "600" },
  footer: { color: "#87918B", textAlign: "center", fontSize: 11, fontWeight: "700", marginTop: 4 },
});
