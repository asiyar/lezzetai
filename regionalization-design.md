# LezzetAI Çok Dilli Bölgesel Mutfak Tasarımı

## Desteklenen varsayılan dil-bölge profilleri

| Kod | Dil ve varsayılan bölge | Mutfak başlangıç noktası | Plan araçları |
|---|---|---|---|
| `tr-TR` | Türkçe · Türkiye | Bakliyat, bulgur, yoğurt, zeytinyağlılar, ev yemekleri | Tencere, düdüklü tencere, tava, fırın tepsisi, çorba blenderı |
| `en-GB` | English · United Kingdom | Kök sebzeler, bezelye, pırasa, yulaf, fırın yemekleri | Fırın, graten kabı, patates ezici, büyük tencere |
| `de-DE` | Deutsch · Deutschland | Patates, mantar, lahana, elma, mercimek güveçleri | Büyük tencere, fırın tepsisi, tava, rende |
| `es-ES` | Español · España | Zeytinyağı, domates, sarımsak, pirinç, bakliyat | Geniş tava, pirinç tavası, blender, fırın tepsisi |
| `fr-FR` | Français · France | Mevsim sebzeleri, pırasa, mercimek, peynirli fırın yemekleri | Fırın, graten kabı, sos tenceresi, tava |

## Ürün kuralları

Seçilen profil, uygulama metinlerinin temel dilini ve varsayılan tarif kataloğunu belirler. Haftalık plan sıralaması önce alerji güvenliği ve kullanıcının seçtiği ekipmanı korur; daha sonra seçilen bölgenin tariflerine ağırlık verir; en son kiler, favori malzemeler, hedef makrolar ve süreyle ince ayar yapar. Böylece bir kullanıcı Almanca seçtiğinde Türkiye’ye ait varsayılan tariflerle dolu bir plan görmez; aynı zamanda kullanıcı kendi kilerine farklı bir malzeme eklediğinde plan bunu yok saymaz.

Her profil dört özgün günlük tarif, bölgeye uygun kiler öncelikleri ve tavsiye edilen ekipman seti taşır. Yedi günlük menü, bu katalogdan tekrarları en düşük tutarak oluşturulur. Alternatif tarif eylemi önce aynı bölge içinden, aynı alerji ve ekipman koşullarını sağlayan farklı bir seçeneği dener.

## Kalıcılık ve geçiş davranışı

Dil-bölge kodu, kullanıcı profili içinde cihazda saklanır. Eski kayıtlar `tr-TR` ile güvenli biçimde açılır. Kullanıcı dili değiştirdiğinde mevcut plan silinmez; “bölgesel planı yenile” eylemi ile yeni bölgeye ait yedi günlük plan oluşturulur. Bu, kullanıcının devam eden alışveriş listesini istemeden değiştirmeyi önler.

## Kullanıcı yüzeyleri

Onboarding akışına ilk adım olarak dil-bölge seçimi eklenir. Profilde aynı seçim “Dil ve mutfak bölgesi” satırından her zaman değiştirilebilir. Plan ekranı seçili bölgenin bayrağı, bölgesel plan açıklaması, önerilen araçları ve bir eylemle görünürleştirir. Keşfet ekranı yalnızca ilgili bölge tariflerini listeler ve aramayı seçili locale ile normalize eder.
