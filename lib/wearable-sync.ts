import { Platform } from "react-native";

export type WearableActivity = { source: "Apple Health" | "Health Connect"; steps: number; activeCalories: number; workoutMinutes: number; syncedAt: string };

function sumQuantity(samples: unknown) {
  const values = Array.isArray(samples) ? samples : (samples as { samples?: unknown[]; records?: unknown[]; result?: unknown[] })?.samples ?? (samples as { records?: unknown[] })?.records ?? (samples as { result?: unknown[] })?.result ?? [];
  return values.reduce((sum: number, sample: any) => sum + Number(sample?.quantity ?? sample?.value ?? sample?.energy?.inKilocalories ?? 0), 0);
}

export async function syncWearableActivity(): Promise<WearableActivity> {
  if (Platform.OS === "ios") {
    const health = require("@kingstinct/react-native-healthkit") as any;
    await health.requestAuthorization({ toRead: ["HKQuantityTypeIdentifierStepCount", "HKQuantityTypeIdentifierActiveEnergyBurned"] });
    const steps = health.queryQuantitySamples ? await health.queryQuantitySamples("HKQuantityTypeIdentifierStepCount") : await health.getMostRecentQuantitySample("HKQuantityTypeIdentifierStepCount");
    const calories = health.queryQuantitySamples ? await health.queryQuantitySamples("HKQuantityTypeIdentifierActiveEnergyBurned") : await health.getMostRecentQuantitySample("HKQuantityTypeIdentifierActiveEnergyBurned");
    return { source: "Apple Health", steps: Math.round(sumQuantity(steps)), activeCalories: Math.round(sumQuantity(calories)), workoutMinutes: 0, syncedAt: "Az önce" };
  }
  if (Platform.OS === "android") {
    const healthConnect = require("react-native-health-connect") as any;
    const initialized = await healthConnect.initialize();
    if (!initialized) throw new Error("Health Connect kullanıma hazır değil.");
    await healthConnect.requestPermission([{ accessType: "read", recordType: "Steps" }, { accessType: "read", recordType: "ActiveCaloriesBurned" }]);
    const startTime = new Date(); startTime.setHours(0, 0, 0, 0);
    const filter = { timeRangeFilter: { operator: "between", startTime: startTime.toISOString(), endTime: new Date().toISOString() } };
    const [steps, calories] = await Promise.all([healthConnect.readRecords("Steps", filter), healthConnect.readRecords("ActiveCaloriesBurned", filter)]);
    const stepValues = Array.isArray(steps?.records) ? steps.records.reduce((sum: number, item: any) => sum + Number(item?.count ?? 0), 0) : sumQuantity(steps);
    return { source: "Health Connect", steps: Math.round(stepValues), activeCalories: Math.round(sumQuantity(calories)), workoutMinutes: 0, syncedAt: "Az önce" };
  }
  throw new Error("Giyilebilir cihaz senkronizasyonu yalnızca iOS veya Android’de kullanılabilir.");
}
