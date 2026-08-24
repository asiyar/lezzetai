# Tasarım ve Apple Yapay Zekâ Araştırma Notu

## Apple Foundation Models Framework

Apple’ın Foundation Models framework’ü, Apple Intelligence’ı çalıştıran cihaz üzeri temel modele erişim sağlayan yerel bir Swift arayüzüdür. Apple’ın resmî duyurusu, çıkarımın geliştiriciler için maliyetsiz olduğunu belirtir. Bu yaklaşım internet bağlantısı ve ayrı bir model API anahtarı olmadan çalışabilen, gizlilik odaklı iOS özellikleri için uygundur.

LezzetAI açısından bu çerçeve, iOS 26 ve Apple Intelligence destekli cihazlarda “AI Şef” isteklerinin yerelde işlenmesi için güçlü bir seçenek oluşturur. Ancak mevcut Expo/React Native katmanı Swift’e doğrudan erişemez; özel bir yerel modül ve özel iOS geliştirme yapısı gerekir. Ayrıca Android’de kullanılmaz. Bu nedenle ürün stratejisi, mevcut çapraz platform yapay zekâ hizmetini ana seçenek olarak koruyup Apple cihazlarında Foundation Models’i yerel hızlandırma/fallback olarak sunmaktır.

React Native/Expo tarafında açık kaynak köprüler mevcuttur. `@ratley/react-native-apple-foundation-models`, Expo’da yerel derleme gerektiren doğrudan bir Foundation Models köprüsü sunar; kullanılabilirlik denetimi, tek seferlik metin üretimi ve yapılandırılmış çıktı yöntemleri sağlar. Topluluk sağlayıcısı `@react-native-ai/apple` ise iOS 26+ üzerinde Apple Intelligence’ın cihaz üzeri modellerine yönelik daha geniş bir React Native/Expo sağlayıcı yaklaşımı sunar. LezzetAI’nin mevcut tarif şeması için doğrudan ve küçük yüzeyli köprü tercih edilmelidir; desteklenmeyen iOS sürümleri, Android ve web için mevcut sunucu tarafı AI Şef geri dönüşü korunacaktır.

## OpenELM Değerlendirmesi

Apple’ın OpenELM ailesi açık model araştırması olarak yayınlanmıştır. Mobil uygulama içine doğrudan dağıtım için model boyutu, çalışma zamanı, performans doğrulaması ve lisans/dağıtım incelemesi gerekir. Bu aşamada LezzetAI’nin gerçek zamanlı tarif üretim kalitesini güvenilir biçimde karşılayacağı doğrulanmadığı için ilk entegrasyon tercihi değildir.

## Ücretsiz Tasarım Referansları

Appllama, App Store örneklerinden akış ve ekran hiyerarşisi için güçlü bir referans havuzu sunar. Bu kaynaklardaki ortak faydalı ilkeler; tek odaklı ekranlar, büyük tipografik hiyerarşi, kararlı boşluk sistemi, yumuşak yüzey katmanları ve işlevi destekleyen kısa hareketlerdir. LezzetAI bu ilkeleri kendi zeytin yeşili, kayısı ve krem kimliğiyle özgün biçimde uygulamalıdır; üçüncü taraf ekranlar veya marka unsurları kopyalanmamalıdır.

Mobbin, çok geniş mobil ekran ve akış arşiviyle ücretsiz kayıt üzerinden referans araştırması için değerlendirilebilir. Page Flows ise akış kaydı ve etkileşim analizi açısından güçlü olsa da tam erişimi ücretlidir; ücretsiz araştırma kaynağı olarak önceliklendirilmemelidir. Uygulama tasarımında kaynaklar yalnızca problemi çözmek için incelenmeli, görsel varlık veya ekran düzeni birebir kopyalanmamalıdır.

## Kaynaklar

1. Apple Developer — Foundation Models: https://developer.apple.com/documentation/foundationmodels
2. Apple Newsroom — Foundation Models framework: https://www.apple.com/newsroom/2025/09/apples-foundation-models-framework-unlocks-new-intelligent-app-experiences/
3. Apple Machine Learning Research — OpenELM: https://machinelearning.apple.com/research/openelm
4. Appllama: https://appllama.io/
5. Mobbin: https://mobbin.com/
6. Page Flows: https://pageflows.com/
7. React Native Apple Foundation Models: https://github.com/ratley/react-native-apple-foundation-models
8. Vercel AI SDK Community Provider — React Native Apple: https://ai-sdk.dev/providers/community-providers/react-native-apple
