import { Children, isValidElement, type ReactNode } from "react";
import { Text as NativeText, type TextProps } from "react-native";

import type { CuisineLocale } from "@/lib/cuisine-locale";
import { useLezzet } from "@/lib/lezzet-context";

type Translation = Partial<Record<CuisineLocale, string>>;

const strings: Record<string, Translation> = {
  "MUTFAK PUSULASI · BUGÜN": { "en-GB": "KITCHEN COMPASS · TODAY", "de-DE": "KÜCHENKOMPASS · HEUTE", "es-ES": "BRÚJULA DE COCINA · HOY", "fr-FR": "BOUSSOLE CULINAIRE · AUJOURD’HUI" },
  "Günün akışını": { "en-GB": "Shape your day", "de-DE": "Gestalte deinen", "es-ES": "Define el ritmo", "fr-FR": "Créez le rythme" },
  "sen belirle.": { "en-GB": "in the kitchen.", "de-DE": "Küchentag.", "es-ES": "de tu cocina.", "fr-FR": "de votre cuisine." },
  "BUGÜNÜN ÖNERİSİ": { "en-GB": "TODAY’S PICK", "de-DE": "TIPP DES TAGES", "es-ES": "RECOMENDACIÓN DE HOY", "fr-FR": "SUGGESTION DU JOUR" },
  "KİLER ODAKLI": { "en-GB": "PANTRY-LED", "de-DE": "VORRATSORIENTIERT", "es-ES": "DE LA DESPENSA", "fr-FR": "GARDE-MANGER" },
  "Tarifi aç": { "en-GB": "Open recipe", "de-DE": "Rezept öffnen", "es-ES": "Abrir receta", "fr-FR": "Ouvrir la recette" },
  "GÜNLÜK YAKIT": { "en-GB": "DAILY FUEL", "de-DE": "TAGESENERGIE", "es-ES": "ENERGÍA DIARIA", "fr-FR": "ÉNERGIE DU JOUR" },
  "kcal hedef": { "en-GB": "kcal target", "de-DE": "kcal Ziel", "es-ES": "objetivo kcal", "fr-FR": "objectif kcal" },
  "tamam": { "en-GB": "done", "de-DE": "erreicht", "es-ES": "hecho", "fr-FR": "atteint" },
  "Karbonhidrat": { "en-GB": "Carbs", "de-DE": "Kohlenhydrate", "es-ES": "Carbohidratos", "fr-FR": "Glucides" },
  "Yağ": { "en-GB": "Fat", "de-DE": "Fett", "es-ES": "Grasas", "fr-FR": "Lipides" },
  "AI ŞEF": { "en-GB": "AI CHEF", "de-DE": "KI-CHEF", "es-ES": "CHEF IA", "fr-FR": "CHEF IA" },
  "Bir fikri": { "en-GB": "Turn an idea", "de-DE": "Mach aus einer Idee", "es-ES": "Convierte una idea", "fr-FR": "Transformez une idée" },
  "sofraya dönüştür.": { "en-GB": "into a meal.", "de-DE": "eine Mahlzeit.", "es-ES": "en un plato.", "fr-FR": "en repas." },
  "Tara & pişir": { "en-GB": "Scan & cook", "de-DE": "Scannen & kochen", "es-ES": "Escanea y cocina", "fr-FR": "Scanner & cuisiner" },
  "Kiler radarı": { "en-GB": "Pantry radar", "de-DE": "Vorratsradar", "es-ES": "Radar de despensa", "fr-FR": "Radar du garde-manger" },
  "KİŞİSEL MUTFAK KOÇU": { "en-GB": "PERSONAL KITCHEN COACH", "de-DE": "PERSÖNLICHER KÜCHENCOACH", "es-ES": "COACH DE COCINA PERSONAL", "fr-FR": "COACH CULINAIRE PERSONNEL" },
  "HAFTANIN GÖRÜNÜMÜ": { "en-GB": "WEEKLY VIEW", "de-DE": "WOCHENÜBERSICHT", "es-ES": "VISTA SEMANAL", "fr-FR": "VUE HEBDOMADAIRE" },
  "Menünü akıllıca planla.": { "en-GB": "Plan your menu wisely.", "de-DE": "Plane dein Menü clever.", "es-ES": "Planifica tu menú mejor.", "fr-FR": "Planifiez votre menu intelligemment." },
  "Tarif planı kuruluyor": { "en-GB": "Building your recipe plan", "de-DE": "Rezeptplan wird erstellt", "es-ES": "Creando tu plan de receta", "fr-FR": "Création de votre plan de recette" },
  "Kiler, hedef ve süre dengeleniyor.": { "en-GB": "Balancing pantry, goals and time.", "de-DE": "Vorrat, Ziele und Zeit werden abgestimmt.", "es-ES": "Equilibrando despensa, objetivos y tiempo.", "fr-FR": "Équilibre entre réserves, objectifs et temps." },
  "ŞEFİN TARİF PLANI": { "en-GB": "CHEF’S RECIPE PLAN", "de-DE": "REZEPTPLAN DES CHEFS", "es-ES": "PLAN DEL CHEF", "fr-FR": "PLAN DE RECETTE DU CHEF" },
  "Süre": { "en-GB": "Time", "de-DE": "Zeit", "es-ES": "Tiempo", "fr-FR": "Temps" },
  "Enerji": { "en-GB": "Energy", "de-DE": "Energie", "es-ES": "Energía", "fr-FR": "Énergie" },
  "MALZEME PALETİ": { "en-GB": "INGREDIENT PALETTE", "de-DE": "ZUTATENPALETTE", "es-ES": "PALETA DE INGREDIENTES", "fr-FR": "PALETTE D’INGRÉDIENTS" },
  "PİŞİRME AKIŞI": { "en-GB": "COOKING FLOW", "de-DE": "KOCHABLAUF", "es-ES": "FLUJO DE COCCIÓN", "fr-FR": "DÉROULÉ DE CUISSON" },
  "Bu tarifi planıma ekle": { "en-GB": "Add this recipe to my plan", "de-DE": "Dieses Rezept in meinen Plan", "es-ES": "Añadir esta receta a mi plan", "fr-FR": "Ajouter cette recette à mon menu" },
  "HAFTALIK BÜTÇE": { "en-GB": "WEEKLY BUDGET", "de-DE": "WOCHENBUDGET", "es-ES": "PRESUPUESTO SEMANAL", "fr-FR": "BUDGET HEBDOMADAIRE" },
  "Limit aşıldı": { "en-GB": "Over budget", "de-DE": "Budget überschritten", "es-ES": "Límite superado", "fr-FR": "Budget dépassé" },
  "Plan dahilinde": { "en-GB": "On plan", "de-DE": "Im Plan", "es-ES": "Dentro del plan", "fr-FR": "Dans le plan" },
  "Sıfır atık koçu": { "en-GB": "Zero-waste coach", "de-DE": "Zero-Waste-Coach", "es-ES": "Coach cero residuos", "fr-FR": "Coach anti-gaspi" },
  "Aile planı": { "en-GB": "Family plan", "de-DE": "Familienplan", "es-ES": "Plan familiar", "fr-FR": "Plan famille" },
  "Alternatif": { "en-GB": "Alternative", "de-DE": "Alternative", "es-ES": "Alternativa", "fr-FR": "Alternative" },
  "Alışveriş listesini hazırla": { "en-GB": "Prepare shopping list", "de-DE": "Einkaufsliste erstellen", "es-ES": "Preparar lista de compra", "fr-FR": "Préparer la liste de courses" },
  "MARKET ÖZETİ": { "en-GB": "SHOPPING SUMMARY", "de-DE": "EINKAUFSÜBERSICHT", "es-ES": "RESUMEN DE COMPRA", "fr-FR": "RÉSUMÉ DES COURSES" },
  "Plan tahmini": { "en-GB": "Plan estimate", "de-DE": "Plan-Schätzung", "es-ES": "Estimación del plan", "fr-FR": "Estimation du menu" },
  "Alışveriş listesi": { "en-GB": "Shopping list", "de-DE": "Einkaufsliste", "es-ES": "Lista de compra", "fr-FR": "Liste de courses" },
  "Hazırlık durumu": { "en-GB": "Progress", "de-DE": "Fortschritt", "es-ES": "Progreso", "fr-FR": "Avancement" },
  "Aile çalışma alanı": { "en-GB": "Family workspace", "de-DE": "Familienbereich", "es-ES": "Espacio familiar", "fr-FR": "Espace famille" },
  "Ailenle paylaş": { "en-GB": "Share with family", "de-DE": "Mit Familie teilen", "es-ES": "Compartir con la familia", "fr-FR": "Partager en famille" },
  "Beslenme hedefin": { "en-GB": "Your nutrition goal", "de-DE": "Dein Ernährungsziel", "es-ES": "Tu objetivo nutricional", "fr-FR": "Votre objectif nutritionnel" },
  "Tercihlerin": { "en-GB": "Your preferences", "de-DE": "Deine Präferenzen", "es-ES": "Tus preferencias", "fr-FR": "Vos préférences" },
  "Dil ve mutfak bölgesi": { "en-GB": "Language & cuisine region", "de-DE": "Sprache & Küchenregion", "es-ES": "Idioma y región culinaria", "fr-FR": "Langue et région culinaire" },
  "Beslenme filtreleri": { "en-GB": "Diet filters", "de-DE": "Ernährungsfilter", "es-ES": "Filtros dietéticos", "fr-FR": "Filtres alimentaires" },
  "MUTFAK GÜNLÜĞÜ": { "en-GB": "KITCHEN JOURNAL", "de-DE": "KÜCHENTAGEBUCH", "es-ES": "DIARIO DE COCINA", "fr-FR": "JOURNAL DE CUISINE" },
  "Şef koleksiyonları": { "en-GB": "Chef collections", "de-DE": "Chef-Kollektionen", "es-ES": "Colecciones del chef", "fr-FR": "Collections du chef" },
  "KÜRATÖRLÜ TARİFLER": { "en-GB": "CURATED RECIPES", "de-DE": "KURATIERTE REZEPTE", "es-ES": "RECETAS SELECCIONADAS", "fr-FR": "RECETTES SÉLECTIONNÉES" },
  "Dil ve mutfak bölgen": { "en-GB": "Your language & cuisine region", "de-DE": "Deine Sprache & Küchenregion", "es-ES": "Tu idioma y región culinaria", "fr-FR": "Votre langue et région culinaire" },
  "MUTFAĞIN": { "en-GB": "YOUR KITCHEN", "de-DE": "DEINE KÜCHE", "es-ES": "TU COCINA", "fr-FR": "VOTRE CUISINE" },
  "Hangi araçlar sende var?": { "en-GB": "Which tools do you have?", "de-DE": "Welche Geräte hast du?", "es-ES": "¿Qué utensilios tienes?", "fr-FR": "Quels ustensiles avez-vous ?" },
  "Fotoğrafla tanı": { "en-GB": "Identify by photo", "de-DE": "Per Foto erkennen", "es-ES": "Identificar por foto", "fr-FR": "Identifier par photo" },
  "LEZZETAI’YE HOŞ GELDİN": { "en-GB": "WELCOME TO LEZZETAI", "de-DE": "WILLKOMMEN BEI LEZZETAI", "es-ES": "BIENVENIDO A LEZZETAI", "fr-FR": "BIENVENUE SUR LEZZETAI" },
  "Günlük enerji hedefi": { "en-GB": "Daily energy target", "de-DE": "Tägliches Energieziel", "es-ES": "Objetivo de energía diario", "fr-FR": "Objectif d’énergie quotidien" },
};

export function translateText(source: string, locale: CuisineLocale) { return strings[source]?.[locale] ?? source; }

function translateChildren(children: ReactNode, locale: CuisineLocale): ReactNode {
  if (typeof children === "string") return translateText(children, locale);
  return Children.map(children, (child) => isValidElement<{ children?: ReactNode }>(child) ? child : child);
}

export function LocalizedText({ children, ...props }: TextProps) {
  const { profile } = useLezzet();
  return <NativeText {...props}>{translateChildren(children, profile.locale)}</NativeText>;
}
