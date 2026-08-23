import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});

type ExpiryItem = { name: string; expiresInDays: number };

export async function enableExpiryNotifications(items: ExpiryItem[]) {
  if (Platform.OS === "web") return { status: "web" as const, count: 0 };
  if (Platform.OS === "android") await Notifications.setNotificationChannelAsync("freshness", { name: "Tazelik uyarıları", importance: Notifications.AndroidImportance.DEFAULT, vibrationPattern: [0, 180] });
  const current = await Notifications.getPermissionsAsync();
  const permission = current.status === "granted" ? current : await Notifications.requestPermissionsAsync();
  if (permission.status !== "granted") return { status: "denied" as const, count: 0 };
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(scheduled.filter((notification) => notification.content.data?.kind === "expiry").map((notification) => Notifications.cancelScheduledNotificationAsync(notification.identifier)));
  const urgentItems = items.filter((item) => item.expiresInDays <= 2).slice(0, 4);
  await Promise.all(urgentItems.map((item) => Notifications.scheduleNotificationAsync({
    content: { title: "LezzetAI · Tazelik hatırlatması", body: `${item.name} için bugün bir tarif planlamayı düşünebilirsin.`, data: { kind: "expiry", itemName: item.name, url: "/pantry" }, sound: false },
    trigger: item.expiresInDays <= 1 ? null : { type: Notifications.SchedulableTriggerInputTypes.DATE, date: nextMorning() },
  })));
  return { status: "granted" as const, count: urgentItems.length };
}

function nextMorning() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(9, 0, 0, 0);
  return date;
}
