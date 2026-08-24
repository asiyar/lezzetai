# LezzetAI — iOS ve Android Yayın Hazırlık Raporu

**Denetim tarihi:** 24 Ağustos 2026  
**Hedef sürüm:** `1.0.0` · iOS derleme `1` · Android `versionCode 1`

> **Hukuki not:** Bu belge teknik yayın hazırlığı ve çalışma taslağıdır; resmî hukuki tavsiye değildir. Gizlilik metni, veri saklama süreleri ve mağaza beyanları yayına gönderilmeden önce ürün sahibi tarafından doğrulanmalı; gerektiğinde yetkin bir hukuk uzmanı tarafından incelenmelidir.

## 1. Teknik durum

| Alan | Durum | Doğrulanan ayrıntı |
|---|---|---|
| Expo/React Native uyumluluğu | Hazır | Expo SDK `54.0.37` uyumluluk denetimi temiz sonuç verdi. |
| iOS kimliği | Hazır | Paket kimliği `com.lezzetai.mobile`, şema `lezzetai`, derleme numarası `1`. |
| Android kimliği | Hazır | Paket kimliği `com.lezzetai.mobile`, `versionCode 1`, `minSdk 26`, `compileSdk 36`, `targetSdk 36`. |
| Fotoğraf izinleri | Hazır | iOS’ta kamera ve fotoğraf kitaplığı kullanım metinleri var. Mikrofon kullanım metni üretilmiyor. |
| Sağlık izinleri | Hazır | iOS HealthKit açıklamaları ve yetkilendirmesi; Android `READ_STEPS` ve `READ_ACTIVE_CALORIES_BURNED` izinleri doğrulandı. |
| Gereksiz Android izinleri | Hazır | `RECORD_AUDIO` ve `SYSTEM_ALERT_WINDOW` açık biçimde engelleniyor. |
| Yerel modüller | Hazır, cihaz testi bekler | HealthKit, Health Connect ve Apple Foundation Models özel yerel iOS/Android derlemesi ister; Expo Go ile doğrulanamaz. |
| Yönetilen kaynak yapısı | Hazır | Denetim için üretilen `ios/` ve `android/` klasörleri kaldırıldı; EAS/Expo ön derleme akışı kaynak yapı olarak korunuyor. |

## 2. Çalıştırılan doğrulamalar

| Denetim | Sonuç |
|---|---|
| `pnpm install --frozen-lockfile` | Başarılı. |
| `pnpm test` | 9 test başarılı; 1 mevcut yetkilendirme testi atlandı. |
| `pnpm check` | Başarılı; TypeScript hatası yok. |
| `npx expo install --check` | Başarılı; SDK bağımlılıkları güncel. |
| `npx expo config --type public --json` | Başarılı; kimlik, sürüm ve eklentiler çözümlendi. |
| `npx expo prebuild --clean --no-install` | Başarılı; iOS ve Android yerel yapılandırması üretildi ve incelendi. |
| `npx expo export --platform ios` | Başarılı; iOS Hermes paketi üretildi. |
| `npx expo export --platform android` | Başarılı; Android Hermes paketi üretildi. |
| `npx expo export --platform web` | Başarılı; `/privacy` dâhil statik rotalar üretildi. |

## 3. Yayın öncesi düzeltmeler

Yalnızca fotoğraf tarama kullanan akışlarda `expo-image-picker` mikrofon izni kapatıldı. Böylece iOS üretim dosyasında `NSMicrophoneUsageDescription` yer almıyor; Android’de mikrofon ve sistem uyarı penceresi izinleri engelleniyor. Kullanılmayan ses/video bağımlılıkları kaldırıldı. SDK bağımlılıkları Expo `54.0.37` sürüm ailesine güncellendi; `expo-font` ve `expo-web-browser` yapılandırma eklentileri eklendi.

Uygulama kimliği yayın için `com.lezzetai.mobile` olarak sabitlendi. `lezzetai` derin bağlantı şeması, iOS derleme numarası `1` ve Android `versionCode` değeri `1` eklendi. İlk mağaza paketi bu kimliklerle imzalanmalıdır; bundan sonraki her mağaza paketi için ilgili derleme numarası artırılmalıdır.

## 4. Gizlilik ve sağlık verisi kapsamı

Uygulama içindeki **Profil → Gizlilik ve veriler** bağlantısı ile `/privacy` rotası eklendi. Metin; cihaz içi tercihler, isteğe bağlı fotoğraf analizi, AI Şef istekleri, ortak alışveriş listesi senkronizasyonu, HealthKit/Health Connect adım ve aktif enerji erişimi ile izin seçimlerini açıklar.

Apple, App Store Connect’te geliştiricinin ve üçüncü taraf kod ortaklarının topladığı veri türleri ile kullanım amaçlarının açıklanmasını ister. Cihaz dışında kısa isteği karşılamaktan daha uzun süre erişilebilir kalacak veriler “toplanmış” sayılır; HealthKit kaynaklı sağlık verisi de açıkça tanımlanmış veri türleri arasındadır. [1]

Google Play, sağlık verisine erişen veya sağlık özelliği sunan uygulamalar için herkesin erişebileceği, coğrafi olarak kısıtlanmamış ve PDF olmayan gizlilik politikası URL’si ile uygulama içinde gizlilik bağlantısı ister. [2] LezzetAI’nin `/privacy` rotası teknik olarak hazırdır; ancak mağaza gönderiminden önce bu rota gerçek, kalıcı bir alan adına yayımlanmalı ve destek/veri silme iletişim bilgisi eklenmelidir.

## 5. Mağaza beyanı için önerilen gerçek veri envanteri

> Bu tablo, kod ve ürün akışlarının denetiminden çıkarılmış taslaktır. Yalnızca gerçek sunucu saklama ve üçüncü taraf işleme davranışları doğrulandıktan sonra App Store Connect ve Play Console’a girilmelidir.

| Veri / yetki | Nerede işlenir | Amaç | Mağaza beyanı için başlangıç noktası |
|---|---|---|---|
| Diyet tercihleri, alerjenler, kiler, plan, tarif geri bildirimi | Cihaz içi uygulama depolaması | Kişiselleştirme | Cihazda kalıyorsa Apple için “collected” değildir; uygulama fonksiyonu olarak iç gizlilik metninde açıklanmalıdır. [1] |
| Tarama fotoğrafı | Kullanıcı eylemiyle sunucu AI isteği | Malzeme/ekipman tanıma | Fotoğraf/video; uygulama işlevselliği. Saklama süresi ve sağlayıcı işleme şartı doğrulanmalıdır. |
| AI Şef metni, seçilen malzemeler, isteğe bağlı görsel | Sunucu AI isteği | Tarif ve öneri üretimi | Kullanıcı içeriği / diğer kullanıcı içeriği; uygulama işlevselliği. |
| Ortak liste öğeleri ve katılımcı görünür adları | Bulut veritabanı | Aile listesi eşitleme | Kullanıcı içeriği ve varsa ad; uygulama işlevselliği. Silme yolu belirlenmelidir. |
| Adım ve aktif enerji özeti | Kullanıcı izniyle HealthKit/Health Connect | Kalori ve makro hedefini uyarlama | Sağlık ve fitness verisi; reklam, pazarlama veya veri madenciliği için kullanılmamalıdır. [3] |
| Bildirim tercihi | Cihaz | Son kullanma ve plan hatırlatıcısı | Uygulama işlevselliği. |

## 6. App Store Connect — tamamlanması gerekenler

Apple, yeni uygulama gönderiminde eksiksiz, doğru meta veri, işlevsel URL’ler ve cihaz üzerinde test edilmiş kararlı bir paket bekler. [4] Uygulama henüz imzalı bir iOS arşivi veya gerçek cihaz doğrulamasından geçmediği için bu aşama **tamamlanmış değildir**.

| Gerekli adım | Sahip | Durum |
|---|---|---|
| Apple Developer hesabı ve `com.lezzetai.mobile` App ID kaydı | Ürün sahibi | Bekliyor |
| HealthKit yeteneğinin doğru ekip imzasıyla doğrulanması | Ürün sahibi / iOS derleme | Bekliyor |
| App Store Connect kaydı, kategori, yaş derecelendirmesi, ülke ve fiyatlandırma | Ürün sahibi | Bekliyor |
| Başlık, alt başlık, anahtar kelimeler, tam açıklama, destek URL’si ve gizlilik URL’si | Ürün sahibi | Bekliyor |
| Gerçek uygulama ekran görüntüleri ve inceleme notları | Ürün sahibi / ürün ekibi | Bekliyor |
| App Privacy etiketi: fotoğraflar, kullanıcı içeriği, sağlık/fitness verisi ve ortak liste verileri | Ürün sahibi | Bekliyor |
| iOS 26 + Apple Intelligence destekli gerçek cihazda Foundation Models geri dönüş akış testi | Ürün ekibi | Bekliyor |
| TestFlight paketi, gerçek cihaz duman testi ve App Review gönderimi | Ürün sahibi | Bekliyor |

## 7. Google Play Console — tamamlanması gerekenler

Google, Health Connect kullanan uygulamalar için Play Console’da **Data safety** ve **Health Apps declaration** formlarının tamamlanmasını ister. İzin verilen her veri türü için ayrıntılı kullanıcı yararı gerekçesi verilmelidir. [5] Sağlık özellikleri olan veya sağlık verisine erişen uygulamalar için bu form test kanalları da dâhil zorunludur. [6]

| Gerekli adım | LezzetAI için taslak |
|---|---|
| Health Apps kategorileri | **Activity and fitness** ve **Nutrition and weight management** seçilmelidir. Tıbbi cihaz seçilmemelidir. |
| `READ_STEPS` gerekçesi | Kullanıcının isteğe bağlı adım özetini okuyarak günlük enerji hedefini daha gerçekçi uyarlamak; veri yazılmıyor, paylaşılmıyor ve reklam için kullanılmıyor. |
| `READ_ACTIVE_CALORIES_BURNED` gerekçesi | Kullanıcının isteğe bağlı aktif enerji özetini okuyarak kalori ve makro hedefini uyarlamak; veri yazılmıyor, paylaşılmıyor ve reklam için kullanılmıyor. |
| Data safety | Fotoğraf işleme, AI istekleri, ortak liste bulut verisi ve isteğe bağlı sağlık/fitness verisi, gerçek sunucu saklama davranışıyla eşleştirilerek girilmelidir. |
| Mağaza listelemesi | Uygulama adı, kısa/tam açıklama, kategori, e-posta destek adresi, gizlilik URL’si, ekran görüntüleri ve özellik grafiği gerekir. |
| Yayın paketi | Google Play Console sahibi hesabıyla imzalı Android App Bundle üretimi, iç test ve inceleme gönderimi gerekir. |

## 8. Bu akşamki yayın için karar noktası

Teknik kaynak ve platform paketleme denetimi **yeşil** durumdadır. Buna rağmen mağaza üretim yayını için üç dış bağımlılık vardır: gerçek Apple/Google geliştirici hesabı ve imzalama yetkisi, kalıcı kamuya açık gizlilik/destek URL’si, gerçek cihazda imzalı paket testi. Ayrıca Google’ın Health Apps beyanı incelemeye tabidir; bu nedenle aynı akşam üretim görünürlüğü garanti edilemez. [5] [6]

Bu bağımlılıklar sağlandığında izlenecek sıra şudur:

1. Gizlilik rotasını kalıcı alan adına yayımlayın; destek ve veri silme iletişim bilgisini ekleyin.
2. Apple Developer ve Google Play Console’da `com.lezzetai.mobile` kimliğini oluşturun.
3. İmzalı iOS ve Android üretim paketlerini oluşturun; fiziksel cihazlarda HealthKit/Health Connect, kamera, bildirim, AI Şef geri dönüşü ve ortak liste akışlarını deneyin.
4. App Store Connect ve Play Console meta verisi ile veri beyanlarını tamamlayın.
5. Apple için TestFlight/App Review, Android için iç test/inceleme gönderimi yapın.

## Kaynaklar

[1]: https://developer.apple.com/app-store/app-privacy-details/ "Apple — App privacy details"
[2]: https://support.google.com/googleplay/android-developer/answer/16679511?hl=en "Google Play — Health Content and Services"
[3]: https://developer.apple.com/health-fitness/ "Apple — Health and fitness apps"
[4]: https://developer.apple.com/app-store/review/guidelines/ "Apple — App Review Guidelines"
[5]: https://developer.android.com/health-and-fitness/health-connect/publish "Android Developers — Publish your health app on Google Play"
[6]: https://support.google.com/googleplay/android-developer/answer/14738291?hl=en "Google Play — Health apps declaration form"
