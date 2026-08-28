export type SubscriptionPeriod = "monthly" | "annual";

export const subscriptionPeriods: Record<SubscriptionPeriod, { label: string; cadence: string }> = {
  monthly: { label: "Aylık Premium", cadence: "Her ay yenilenir" },
  annual: { label: "Yıllık Premium", cadence: "Her yıl yenilenir" },
};

export function getTrialDisclosure(period: SubscriptionPeriod) {
  const plan = period === "annual" ? "yıllık" : "aylık";
  return `7 günlük ücretsiz deneme, uygun yeni kullanıcılar için geçerlidir. Deneme bitiminde, seçtiğin ${plan} planın mağazada onayladığın yerel fiyatla otomatik yenilenir. Dilediğin zaman mağaza abonelik ayarlarından iptal edebilirsin.`;
}

export function isMockPurchaseEnabled(value = process.env.EXPO_PUBLIC_ENABLE_MOCK_PURCHASES ?? "true", environment = process.env.NODE_ENV) {
  return environment !== "production" && value === "true";
}

export function isTransparentTrialDisclosure(value: string) {
  const text = value.toLocaleLowerCase("tr-TR");
  return text.includes("7 günlük") && text.includes("seçtiğin") && text.includes("yerel fiyat") && text.includes("otomatik yenilenir") && text.includes("iptal");
}
