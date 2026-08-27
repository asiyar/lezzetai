import type { CuisineLocale } from "./cuisine-locale";

type SampleCopy = { title: string; text: string; addTitle: string; addText: string; emptyTitle: string; emptyText: string };

const copy: Record<CuisineLocale, SampleCopy> = {
  "tr-TR": { title: "Kilerini birlikte başlatalım.", text: "İstersen seçtiğin bölgenin mutfağına uygun örnek ürünleri ekleyerek uygulamayı hemen deneyebilirsin.", addTitle: "Örnek kilerle başla", addText: "Bölgesel malzemeleri ekle", emptyTitle: "Boş kilerle devam et", emptyText: "Ürünlerimi kendim ekleyeceğim" },
  "en-GB": { title: "Let’s start your pantry together.", text: "If you like, add sample products suited to your selected cuisine region and try the app straight away.", addTitle: "Start with a sample pantry", addText: "Add regional ingredients", emptyTitle: "Continue with an empty pantry", emptyText: "I’ll add my own products" },
  "de-DE": { title: "Starten wir deinen Vorrat gemeinsam.", text: "Wenn du möchtest, fügen wir Beispielprodukte passend zu deiner Küchenregion hinzu, damit du die App sofort ausprobieren kannst.", addTitle: "Mit Beispielvorrat starten", addText: "Regionale Zutaten hinzufügen", emptyTitle: "Mit leerem Vorrat fortfahren", emptyText: "Ich füge eigene Produkte hinzu" },
  "es-ES": { title: "Empecemos tu despensa juntos.", text: "Si quieres, añade productos de ejemplo para tu región culinaria y prueba la aplicación enseguida.", addTitle: "Empezar con una despensa de ejemplo", addText: "Añadir ingredientes regionales", emptyTitle: "Continuar con la despensa vacía", emptyText: "Añadiré mis propios productos" },
  "fr-FR": { title: "Commençons votre garde-manger ensemble.", text: "Si vous le souhaitez, ajoutez des produits d’exemple adaptés à votre région culinaire pour essayer l’application immédiatement.", addTitle: "Commencer avec un garde-manger d’exemple", addText: "Ajouter des ingrédients régionaux", emptyTitle: "Continuer avec un garde-manger vide", emptyText: "J’ajouterai mes propres produits" },
};

export function getOnboardingSampleCopy(locale: CuisineLocale) { return copy[locale]; }
