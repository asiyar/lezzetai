# Mevsimsel Paketler, Diyet Filtreleri ve Yerel Market Tasarımı

## Ürün davranışı

LezzetAI her dil-bölge için ilkbahar, yaz, sonbahar ve kış paketleri taşır. Tüm desteklenen bölgeler Kuzey Yarımküre’de olduğundan varsayılan sezon cihaz tarihinden belirlenir. Kullanıcı sezon paketini ana sayfa ve Keşfet üzerinden görür; otomatik planlama bu paketteki tarifleri önceliklendirir ancak kiler, alerji, seçili diyet ve ekipman kurallarını ihlal etmez.

Her tarif `vegan`, `vegetarian` ve `gluten-free` etiketleriyle tanımlanır. Vegan seçimi yalnızca vegan tarifleri, vejetaryen seçimi hem vejetaryen hem vegan tarifleri, glutensiz seçimi yalnızca glutensiz tarifleri kabul eder. Birden fazla tercih aynı anda seçildiğinde tüm koşullar karşılanır. Uygun tarif yoksa kullanıcıya sessizce uygunsuz içerik göstermek yerine açıklayıcı boş durum sunulur.

| Bölge | Para birimi | Varsayılan market kategorileri | Mevsim yaklaşımı |
|---|---|---|---|
| Türkiye | TRY | Sebze & meyve, bakliyat, süt ürünleri, et & balık, temel gıda | Pazar ürünleri, zeytinyağlılar, bakliyat ve mevsim yeşillikleri |
| Birleşik Krallık | GBP | Produce, pantry, dairy, protein, bakery | Kök sebzeler, pırasa, bezelye, tepsi yemekleri |
| Almanya | EUR | Obst & Gemüse, Vorrat, Milchprodukte, Protein, Bäckerei | Kuşkonmaz, patates, mantar, lahana ve kök sebzeler |
| İspanya | EUR | Fruta y verdura, despensa, lácteos, proteína, panadería | Akdeniz sebzeleri, bakliyat, pirinç ve zeytinyağı |
| Fransa | EUR | Fruits et légumes, épicerie, produits laitiers, protéines, boulangerie | Mevsim sebzeleri, pırasa, mercimek, fırın yemekleri |

## Yerelleştirme kapsamı

Ortak metinler tek bir sözlükte anahtarlarla tutulur. Sekmeler, Bugün, Keşfet, AI Şef, Plan, Profil, Kiler, Alışveriş Listesi, tarif ayrıntısı, canlı pişirme, tarama, giyilebilirler, günlük, koleksiyonlar, mutfak araçları, onboarding ve gizlilik yüzeyleri seçili locale üzerinden bu sözlüğü kullanır. Tarif içerikleri zaten bölgesel katalogda kullanıcı dilinde saklanır.

## Kaynak temeli

Mevsim eksenleri Avrupa Komisyonu’nun Akdeniz/ılıman/okyanusal ürün takvimi, Birleşik Krallık üretim rehberi ve Türkiye mevsim rehberiyle oluşturulmuştur.[1] [2] [3]

## Kaynaklar

[1] [European Commission — Fruit and vegetables calendar](https://agriculture.ec.europa.eu/farming/crops/fruit-and-vegetables/calendar_en)

[2] [Vegetarian Society — Seasonal UK grown produce](https://vegsoc.org/blog/seasonal-uk-grown-produce/)

[3] [Gıda Kurtarma Derneği — Mevsim Rehberi](https://gktd.org/1027-2/)
