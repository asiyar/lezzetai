# LezzetAI Abonelik ve Mağaza İnceleme Notu

Bu not, 28 Ağustos 2026 itibarıyla resmî mağaza ve Expo belgelerinden çıkarılan uygulama kararlarını kaydeder. Buradaki ilkeler, kullanıcıya sunulan fiyat ve deneme bilgisinin mağazadan canlı alınmasına kadar abonelik duvarının yalnızca önizleme durumunda tutulmasını gerektirir.

## Uygulanacak abonelik ilkeleri

| Konu | Uygulama kararı | Kaynak |
|---|---|---|
| Deneme dönemi | Yedi günlük ücretsiz deneme yalnızca App Store Connect ve Play Console içinde tanımlı, kullanıcıya açıkça sunulan otomatik yenilenen ürün teklifinden gelir. | [Apple][1] [Google][2] |
| Yenileme | Deneme bittiğinde yalnızca kullanıcının seçtiği aylık veya yıllık plan, mağazanın satın alma ekranında onayladığı fiyatla yenilenebilir. Varsayılan yıllık plana otomatik geçiş uygulanmaz. | [Apple][3] [Google][2] |
| Paywall açıklamaları | Plan adı, dönem, deneme süresi, deneme sonrası tam ve yerel para birimli yenileme fiyatı, otomatik yenileme ve iptal/abonelik yönetimi bilgisi görünür olmalıdır. | [Apple][1] [Google][2] |
| Mevcut aboneler | Satın alımları geri yükleme ve aboneliği mağaza üzerinden yönetme eylemleri sunulur. | [Apple][1] [Google][4] |
| Uygulama içi ödeme | Dijital özellik ve içerik erişimi için iOS'ta StoreKit, Android'de Google Play Billing kullanılır. Expo Go yerel satın alma modüllerini desteklemez; özel geliştirme yapısı gerekir. | [Expo][5] |

## İnceleme riskleri ve kontrol noktaları

Apple, çalışan uygulama, tam mağaza metadatası, etkin arka uç, açıklayıcı inceleme notları ve işleyen uygulama içi satın alma ürünleri bekler. Gizli veya hazır olmayan özellikler ile gerçek uygulamayı göstermeyen ekran görüntüleri reddedilebilir. Apple ayrıca sağlıkla ilgili iddiaları desteklemeyi ve belirsizse kullanıcıyı profesyonel yardım almaya yönlendirmeyi ister. LezzetAI, beslenme önerilerinin tıbbi karar olmadığı uyarısını korumalıdır. [3]

Google Play, uygulama içi ekranlar, açıklama, görseller ve fiyat teklifinin doğru ve yanıltıcı olmamasını; deneme sonrası ücretin açıkça anlatılmasını; kullanıcıdan habersiz veya geri döndürülemez ayar değişikliği yapılmamasını ister. [2] [6]

## Gönderimden önce kullanıcının tamamlaması gerekenler

1. Apple Developer Program ve Google Play Developer hesap sözleşmeleri, doğrulaması ve ödeme profili tamamlanmış olmalıdır.
2. Her mağazada aynı işlevi temsil eden aylık ve yıllık abonelik ürünleri ile uygun yedi günlük deneme teklifi oluşturulmalı; gerçek ürün kimlikleri, fiyatları, bölgeleri ve deneme koşulları belirlenmelidir.
3. Uygulama için herkese açık gizlilik politikası, kullanım koşulları, destek ve veri silme isteği sayfaları yayınlanmalıdır.
4. StoreKit / Google Play test kullanıcılarıyla gerçek satın alma, iptal, yenileme, geri yükleme ve erişim geri çekilme senaryoları test edilmelidir.
5. App Review Notes alanına abonelik ürünleri, test yolu, kamera/fiş/AI akışı ve sağlık uyarılarının kısa açıklaması yazılmalıdır.

## Mimarî seçenekler

| Seçenek | Güçlü yön | Sınır | Kurulum |
|---|---|---|---|
| Mağaza API'leri doğrudan | Ek ödeme aracısı olmadan StoreKit ve Play Billing ile çalışır. | Sunucu tarafı makbuz doğrulama, abonelik yaşam döngüsü ve bildirimleri ayrıca kurulur. | Daha yüksek |
| Yönetilen abonelik servisi | İki mağaza için ürün, makbuz ve abonelik durumunu tek katmanda yönetir. | Hizmet hesabı, ürün eşleme ve üçüncü taraf işlem sözleşmesi gerekir. | Orta |

İki seçenek de kullanıcı seçmeden etkinleştirilmez. Ödeme ve yenileme yalnızca mağazanın yerel satın alma arayüzünde kullanıcının açık onayıyla yapılır.

[1]: https://developer.apple.com/app-store/subscriptions/ "Apple — Auto-renewable subscriptions"
[2]: https://support.google.com/googleplay/android-developer/answer/12154973?hl=en "Google Play — Understanding subscriptions"
[3]: https://developer.apple.com/app-store/review/guidelines/ "Apple — App Review Guidelines"
[4]: https://developer.android.com/google/play/billing/subscriptions "Android Developers — About subscriptions"
[5]: https://docs.expo.dev/guides/in-app-purchases/ "Expo — Using in-app purchases"
[6]: https://play.google.com/about/privacy-security-deception/deceptive-behavior/deceptive-settings/ "Google Play — Deceptive behavior"
