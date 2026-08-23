# LezzetAI — Mobil Arayüz Tasarım Planı

## Ürün Yönü

LezzetAI, kullanıcıların eldeki malzemeleri, beslenme hedeflerini ve günlük zamanlarını birlikte değerlendiren bir yapay zekâ mutfak asistanıdır. Tasarım, **tek elle kullanılabilir 9:16 portre deneyimi**, sakin bir premium mutfak editoryali ve iOS insan arayüzü ilkeleri üzerine kurulur. Arayüz; ilk açılışta faydayı görünür kılar, sonra kullanıcıyı kısa yollardan “Bugün ne pişirsem?” sorusunun yanıtına götürür.

## Ekran Listesi

| Ekran | Ana içerik ve işlev | Yerleşim yaklaşımı |
|---|---|---|
| Karşılama / profil kurulumu | Beslenme hedefi, sevilen mutfaklar, alerjenler ve kişi sayısı seçimleri | Sayfa altına sabitlenen ana CTA ile kısa, kart tabanlı adımlar |
| Bugün | Günün önerisi, hedef özeti, hızlı yapay zekâ istemleri, trend tarifler | Üstte kişisel karşılama; dikey kaydırmalı, geniş dokunma alanlı kartlar |
| Keşfet | Kategoriler, filtreler, kaydedilen trendler ve tarif arama | Arama alanı üstte sabit; kategori çipleri ve iki sütunlu keşif alanı |
| Yapay Zekâ Şefi | Serbest metin komutu, malzemeden tarif üretimi, öğün alternatifi | Konuşma hissi veren öneri kartları, altta büyük tek satırlı istem alanı |
| Tarif Detayı | Görsel, besin özeti, süre, malzeme listesi, adım adım pişirme modu | Büyük kapak alanından sonra bölümlere ayrılmış dikey akış; kaydet/alışveriş CTA’sı alt bölgede |
| Haftalık Plan | Kahvaltı, öğle, akşam bölümleri ve günlere dağıtılmış menü | Yatay gün seçici, gün içi öğün kartları ve yapay zekâ ile plan yenileme aksiyonu |
| Alışveriş Listesi | Plan kaynaklı gruplanmış malzemeler, satın alındı durumu, porsiyon ayarı | Bölüm başlıkları, büyük onay kutuları ve paylaşılabilir liste |
| Kilerim | Kullanıcının elindeki malzemeler, son kullanma önceliği ve öneriler | Malzeme çipleri; “fotoğrafla ekle” ana aksiyonu; stok kalemleri alt sayfada |
| Profil ve tercihler | Hedefler, alerjenler, mutfak tercihleri, bildirim ve görünüm ayarları | iOS ayar listesi hiyerarşisi; kritik tercihler ilk bölümde |

## Birincil Kullanıcı Akışları

| Amaç | Akış |
|---|---|
| Hızlı yemek önerisi almak | Bugün → “Elimde ne var?” → malzemeleri yaz veya seç → Yapay Zekâ Şefi önerileri → Tarif Detayı → pişirmeye başla |
| Haftalık menü hazırlamak | Haftalık Plan → hedef/kişi sayısını kontrol et → “Planı oluştur” → gün ve öğünleri incele → Alışveriş Listesi oluştur |
| Malzemeyi değerlendirmek | Kilerim → “Malzeme ekle” → malzemeyi seç → yaklaşan son kullanma önceliğini gör → sıfır atık tarif önerisini aç |
| Diyet hedefini korumak | Bugün → günlük hedef özeti → uygun öneriyi seç → Tarif Detayı’nda porsiyonu ayarla → plana veya favorilere kaydet |

## Bilgi Mimarisi ve Gezinme

Alt sekme çubuğu beş temel alan içerir: **Bugün**, **Keşfet**, ortada yükseltilmiş **AI Şef**, **Plan**, **Profil**. Kilerim ve Alışveriş Listesi, Bugün ve Plan içindeki görünür kısayollardan açılan ikincil sayfalardır. Bu düzen, en sık eylemi başparmak erişim alanında tutar ve nadir ayarları öne çıkarmadan erişilebilir bırakır.

## Renk ve Görsel Dil

| Tasarım öğesi | Renk | Kullanım |
|---|---|---|
| Zeytin yeşili | `#1E4D3A` | Birincil eylemler, aktif durumlar ve marka vurgusu |
| Adaçayı | `#DDE8DA` | Yumuşak arka plan blokları, beslenme göstergeleri |
| Kayısı | `#F4A261` | Yapay zekâ önerileri, sıcak vurgu ve zaman bilgisi |
| Krem | `#FBF8F2` | Ana arka plan; editoryal ve sıcak yüzey hissi |
| Kömür | `#1E2521` | Başlıklar ve yüksek kontrastlı metin |
| Sisli gri | `#6B756F` | Açıklamalar, ikincil etiketler, ayırıcılar |

Kartlar 20–24 px köşe yarıçapına, ince sıcak gri sınırlara ve çok hafif gölgeye sahip olur. Görseller, gerçekçi yemek fotoğrafları yerine derinlik ve tazelik hissi veren editoryal yemek kompozisyonları ile desteklenir. İkon dili, iOS’ta SF Symbols karakterini koruyacak şekilde basit, çizgisel ve tek renkli kullanılır.

## Erişilebilirlik ve Etkileşim Kuralları

Tüm ana hedefler en az 44 pt dokunma alanına sahip olmalı, metin kontrastı okunabilirliği korumalı ve durum değişiklikleri hem renk hem metinle anlaşılmalıdır. Birincil aksiyonlar ekran altı erişim alanında konumlanır. Hızlı geri bildirim için hafif dokunsal tepkiler, seçimlerde belirgin durum değişimi ve yükleme anlarında açıklayıcı metin kullanılır.
