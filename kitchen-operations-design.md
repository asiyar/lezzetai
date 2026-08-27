# LezzetAI Mutfak Operasyonları — Tasarım Sözleşmesi

## Kiler modeli

Kiler öğesi; ad, miktar, birim, düşük stok eşiği, son kullanma önceliği, favori ve kullanım sayısını taşır. Fotoğraftan algılanan adet ya da ağırlık **yaklaşık** olarak gösterilir; kullanıcı, “Kilere ekle” eylemiyle sonucu onaylamadan envantere yazılmaz. Tek görüntüden kesin gramaj çıkarılamayacağı için belirsiz tahminler güven derecesiyle birlikte sunulur.

Tarif tamamlandığında uygulama, tarifte geçen ve kullanıcının kilerinde bulunan öğeleri porsiyon katsayısına göre düşmek üzere önerir. Kullanıcı “Tarifi tamamla” eylemiyle bu düşümü onaylar; doğruluk için düzenleme geçmişi ve el ile miktar güncelleme yolu korunur. Bu yaklaşım, envanterin sessizce hatalı güncellenmesini önler.

## İçgörüler ve uyarılar

Kiler özeti; mevcut malzemelerle uygun tarif sayısını, bunun yaklaşık öğün karşılığını ve kişi sayısına göre tahmini gün sayısını gösterir. Düşük stok; miktarın kullanıcının minimum eşiğine eşit veya altında olmasıdır. Sık kullanılan ve düşük stokta olan ürünler hem satır içinde ünlem rozetiyle hem de kullanıcı izin verirse yerel bildirimle gösterilir.

## Tarif ve AI ilkesi

Her dil-bölge kataloğunda en az yirmi yöresel tarif bulunur. Tarif adları ve yöresel bağlam araştırma kaynaklarıyla doğrulanır; malzeme miktarları ile talimatlar telifli tarifleri kopyalamadan uygulama için özgün biçimde yazılır. “Daha fazla tarif” eylemi kullanıcıdan yemek tarzını, süre/ekipman kısıtını ve yalnızca kilerindeki malzemelerle mi çalışmak istediğini sorar; ardından bu bağlamı AI Şef’e iletir.

## Ekipman ve kişi sayısı

Ekipman seçimi tava, tencere ve fırının ötesinde basınçlı tencere, wok, döküm tencere, mikrodalga, pirinç pişirici, yavaş pişirici, blender, mutfak robotu, buharlı pişirici, elektrikli ızgara ve tost makinesini içerir. Kişi sayısı 1–12 aralığında ayarlanabilir; tarif, stok düşümü ve maliyet tahminleri aynı porsiyon katsayısını kullanır.

## Araştırma kaynakları

Bölgesel tarif adı ve mutfak bağlamı için [regional-recipe-expansion-research.md](./regional-recipe-expansion-research.md) içindeki Türkiye Kültür Portalı, Germanfoods, Spain.info, Library of Congress ve VisitBritain kaynakları kullanılır. Çapraz temas uyarı ilkeleri için [allergen-safety-research.md](./allergen-safety-research.md) içindeki FDA, Food Standards Scotland ve FARE kaynakları izlenir.
