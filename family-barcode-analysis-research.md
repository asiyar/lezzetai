# Aile Kileri, Barkod ve Harcama Analizi Araştırma Notu

## Barkodla Paketli Ürün Ekleme

Open Food Facts’in resmî belgeleri, mobil uygulamalarda ürün barkodu ile salt-okunur sorgu yapılabildiğini; ürün adı, marka, içerik ve beslenme alanlarının sonuçta eksik olabileceğini belirtir. Bu nedenle LezzetAI barkod sonucunu kesin kayıt olarak değil, **kullanıcı onayıyla düzenlenebilir bir taslak** olarak kullanacaktır. Her tarama yalnızca kullanıcının gerçek zamanlı eylemi ile gerçekleşecek; toplu sorgu veya arka plan taraması yapılmayacaktır.

Ürün sorgusu sunucu üzerinden şu sınırlı alanlarla yapılacaktır: ürün adı, marka, miktar etiketi, kategoriler, alerjen etiketleri ve barkod. Kayıt için kullanıcı ürün adını, miktarını ve son kullanma tarihini kontrol edip onaylayacaktır. Ürün bulunamazsa barkod korunacak, kullanıcıya hızlı manuel giriş verilecektir.

## Ortak Aile Çalışma Alanı

Mevcut davet kodlu aile listesi, ortak çalışma alanı kimliği olarak kullanılabilir. Ortak kilerde yalnızca davet koduna katılan kişiler ürün ekleyebilir, miktarı ve son kullanma tarihini güncelleyebilir. Her değişiklikte yapan kişi ve güncelleme zamanı görünür olmalıdır. İlk sürümde veri, kullanıcıların açıkça seçtiği ortak alanda saklanır; kişisel kiler otomatik olarak paylaşılmaz.

## Harcama Analizi

Analiz yalnızca kullanıcının fişten onaylayarak kaydettiği fiyatlara dayanır. Boş veri setinde tahmini veya uydurma harcama grafiği gösterilmez. Kategori toplamı, işlem sayısı, toplam tutar ve pay hesaplanır; en yüksek kategori açıkça vurgulanır. Kullanıcı fiyat girmedikçe analiz boş durum ve fiş tarama çağrısı gösterir.

## Kaynaklar

1. [Open Food Facts API Introduction](https://openfoodfacts.github.io/openfoodfacts-server/api/)
2. [Open Food Facts – Barkod ile Ürün Sorgulama Eğitimi](https://openfoodfacts.github.io/openfoodfacts-server/api/tutorial-off-api/)
3. [Open Food Facts – Data, API and SDKs](https://world.openfoodfacts.org/data)
