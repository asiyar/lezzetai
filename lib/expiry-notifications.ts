import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});

type ExpiryItem = { name: string; expiresInDays: number };
type LowStockItem = { name: string; quantity: number; unit: string; frequent?: boolean };

export async function enableExpiryNotifications(items: ExpiryItem[], lowStockItems: LowStockItem[] = []) {
  if (Platform.OS === "web") return { status: "web" as const, count: 0 };
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("freshness", { name: "Tazelik uyarıları", importance: Notifications.AndroidImportance.DEFAULT, vibrationPattern: [0, 180] });
    await Notifications.setNotificationChannelAsync("pantry-stock", { name: "Kiler stok uyarıları", importance: Notifications.AndroidImportance.DEFAULT, vibrationPattern: [0, 180] });
  }
  const current = await Notifications.getPermissionsAsync();
  const permission = current.status === "granted" ? current : await Notifications.requestPermissionsAsync();
  if (permission.status !== "granted") return { status: "denied" as const, count: 0 };
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(scheduled.filter((notification) => notification.content.data?.kind === "expiry" || notification.content.data?.kind === "low-stock").map((notification) => Notifications.cancelScheduledNotificationAsync(notification.identifier)));
  const urgentItems = items.filter((item) => item.expiresInDays <= 2).slice(0, 4);
  await Promise.all(urgentItems.map((item) => Notifications.scheduleNotificationAsync({
    content: { title: "LezzetAI · Tazelik hatırlatması", body: `${item.name} için bugün bir tarif planlamayı düşünebilirsin.`, data: { kind: "expiry", itemName: item.name, url: "/pantry" }, sound: false },
    trigger: item.expiresInDays <= 1 ? null : { type: Notifications.SchedulableTriggerInputTypes.DATE, date: nextMorning() },
  })));
  const urgentStock = lowStockItems.slice(0, 3);
  await Promise.all(urgentStock.map((item) => Notifications.scheduleNotificationAsync({
    content: { title: "LezzetAI · Kiler uyarısı", body: `${item.name} ${item.quantity} ${item.unit} seviyesinde${item.frequent ? "; sık kullandığın için yakında yenilemen iyi olur." : "."}`, data: { kind: "low-stock", itemName: item.name, url: "/(tabs)/pantry" }, sound: false },
    trigger: null,
  })));
  return { status: "granted" as const, count: urgentItems.length + urgentStock.length };
}

function nextMorning() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(9, 0, 0, 0);
  return date;
}
