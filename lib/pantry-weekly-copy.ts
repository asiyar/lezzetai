import type { CuisineLocale } from "./cuisine-locale";

type PantryWeeklyCopy = {
  alertTitle: string;
  alertText: string;
  emptyTitle: string;
  emptyText: string;
  openPantry: string;
  eyebrow: string;
  title: string;
  filterLabel: string;
  profileFilter: string;
  allFilter: string;
  pantryPrefix: string;
  missingPrefix: string;
  noExtras: string;
  priorityPrefix: string;
  note: string;
  applyTitle: string;
  applyText: string;
  supports: (count: number) => string;
  summary: (region: string) => string;
};

const copy: Record<CuisineLocale, PantryWeeklyCopy> = {
  "tr-TR": { alertTitle: "Haftalık plan güncellendi", alertText: "Kiler eşleşmeleri öne alınarak hazırlanan fikirler planına eklendi.", emptyTitle: "Kiler eşleşmesi bulunamadı", emptyText: "Haftalık fikirler yalnızca kilerinde eşleşen malzemesi olan tariflerden oluşur. Kilerine birkaç ürün eklediğinde burada gerçek eşleşmeler görürsün.", openPantry: "Kileri aç", eyebrow: "KİLER ODAKLI MENÜ", title: "Bu haftanın fikirleri", filterLabel: "YEMEK TERCİHİ FİLTRESİ", profileFilter: "Tercihlerim", allFilter: "Tümü", pantryPrefix: "Kilerde", missingPrefix: "Eksik olabilir", noExtras: "Ek malzeme görünmüyor", priorityPrefix: "Öncelik", note: "Bu plan fikir sunar. Pişirmeden önce stok miktarını, etiket bilgisini ve son kullanma tarihini kontrol et.", applyTitle: "Bu fikirleri haftalık planıma uygula", applyText: "Yedi günlük menünü kiler odağıyla güncelle.", supports: (count) => `${count} kiler malzemesi planı destekliyor`, summary: (region) => `Tarifler seçili ${region} mutfağı, beslenme tercihlerin ve kiler eşleşmelerine göre sıralandı.` },
  "en-GB": { alertTitle: "Weekly plan updated", alertText: "Ideas prioritising your pantry matches have been added to your plan.", emptyTitle: "No pantry match found", emptyText: "Weekly ideas only include recipes that match an ingredient in your pantry. Add a few items to see real matches here.", openPantry: "Open pantry", eyebrow: "PANTRY-LED MENU", title: "Ideas for this week", filterLabel: "DIETARY FILTER", profileFilter: "My preferences", allFilter: "All", pantryPrefix: "In pantry", missingPrefix: "May need", noExtras: "No additional ingredients shown", priorityPrefix: "Priority", note: "This plan offers ideas. Check stock amounts, labels and use-by dates before cooking.", applyTitle: "Use these ideas in my weekly plan", applyText: "Update your seven-day menu around your pantry.", supports: (count) => `${count} pantry ingredients support this plan`, summary: (region) => `Recipes are ordered around ${region} cuisine, your dietary preferences and pantry matches.` },
  "de-DE": { alertTitle: "Wochenplan aktualisiert", alertText: "Ideen mit Vorrats-Treffern wurden deinem Plan hinzugefügt.", emptyTitle: "Kein Vorrats-Treffer gefunden", emptyText: "Wöchentliche Ideen enthalten nur Rezepte mit passenden Vorratszutaten. Füge einige Zutaten hinzu, um hier echte Treffer zu sehen.", openPantry: "Vorrat öffnen", eyebrow: "VORRATS-MENÜ", title: "Ideen für diese Woche", filterLabel: "ERNÄHRUNGSFILTER", profileFilter: "Meine Präferenzen", allFilter: "Alle", pantryPrefix: "Im Vorrat", missingPrefix: "Möglicherweise nötig", noExtras: "Keine weiteren Zutaten angezeigt", priorityPrefix: "Priorität", note: "Dieser Plan bietet Ideen. Prüfe vor dem Kochen Mengen, Etiketten und Verbrauchsdaten.", applyTitle: "Diese Ideen in meinen Wochenplan übernehmen", applyText: "Aktualisiere dein Sieben-Tage-Menü mit deinem Vorrat.", supports: (count) => `${count} Vorratszutaten unterstützen diesen Plan`, summary: (region) => `Rezepte werden nach ${region}-Küche, deinen Ernährungspräferenzen und Vorrats-Treffern sortiert.` },
  "es-ES": { alertTitle: "Plan semanal actualizado", alertText: "Las ideas que priorizan los ingredientes de tu despensa se añadieron al plan.", emptyTitle: "No se encontró coincidencia en la despensa", emptyText: "Las ideas semanales solo incluyen recetas que coinciden con ingredientes de tu despensa. Añade algunos productos para ver coincidencias reales.", openPantry: "Abrir despensa", eyebrow: "MENÚ DE DESPENSA", title: "Ideas para esta semana", filterLabel: "FILTRO DIETÉTICO", profileFilter: "Mis preferencias", allFilter: "Todo", pantryPrefix: "En despensa", missingPrefix: "Podría faltar", noExtras: "No aparecen ingredientes adicionales", priorityPrefix: "Prioridad", note: "Este plan propone ideas. Comprueba cantidades, etiquetas y fechas de caducidad antes de cocinar.", applyTitle: "Usar estas ideas en mi plan semanal", applyText: "Actualiza tu menú de siete días con tu despensa.", supports: (count) => `${count} ingredientes de despensa respaldan este plan`, summary: (region) => `Las recetas se ordenan según la cocina de ${region}, tus preferencias y las coincidencias de despensa.` },
  "fr-FR": { alertTitle: "Menu hebdomadaire mis à jour", alertText: "Les idées qui privilégient les produits de votre garde-manger ont été ajoutées au menu.", emptyTitle: "Aucune correspondance dans le garde-manger", emptyText: "Les idées hebdomadaires ne contiennent que des recettes correspondant à un ingrédient de votre garde-manger. Ajoutez quelques produits pour voir de vraies correspondances.", openPantry: "Ouvrir le garde-manger", eyebrow: "MENU DU GARDE-MANGER", title: "Idées pour cette semaine", filterLabel: "FILTRE ALIMENTAIRE", profileFilter: "Mes préférences", allFilter: "Tout", pantryPrefix: "Dans le garde-manger", missingPrefix: "Peut manquer", noExtras: "Aucun autre ingrédient indiqué", priorityPrefix: "Priorité", note: "Ce plan propose des idées. Vérifiez les quantités, étiquettes et dates limites avant de cuisiner.", applyTitle: "Ajouter ces idées à mon menu hebdomadaire", applyText: "Mettez à jour votre menu de sept jours autour du garde-manger.", supports: (count) => `${count} ingrédients du garde-manger soutiennent ce menu`, summary: (region) => `Les recettes sont classées selon la cuisine de ${region}, vos préférences alimentaires et les correspondances du garde-manger.` },
};

export function getPantryWeeklyCopy(locale: CuisineLocale) { return copy[locale]; }
