import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { api } from '@lib/api/client';

let initialized = false;

export async function initNotifications() {
  if (initialized) return;
  initialized = true;
  // Show notifications even when app is foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  try {
    // Request permissions on iOS; Android auto-granted but safe to call
    await Notifications.requestPermissionsAsync();
  } catch {}
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('assignments', {
        name: 'Assignments',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        enableVibrate: true,
        enableLights: true,
      });
    } catch {}
  }
}

type AssignmentInfo = { taskId: number; orderId?: number; title?: string; body?: string };

export async function notifyAssignment(info: AssignmentInfo) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: info.title || 'Tugas baru ditugaskan',
        body: info.body || `Ada tugas baru untuk Anda${info.orderId ? ` (Order #${info.orderId})` : ''}.`,
        sound: 'default',
        data: { type: 'task.assigned', taskId: info.taskId, orderId: info.orderId },
      },
      trigger: null, // show immediately
      ...(Platform.OS === 'android' ? { channelId: 'assignments' as any } : {}),
    } as any);
  } catch (e) {
    // non-fatal
  }
}

export async function registerPushTokenWithBackend(authToken: string) {
  try {
    // Try Expo push token first (works without FCM if projectId is configured)
    let expoProjectId: string | undefined;
    try {
      const c: any = Constants as any;
      expoProjectId = c?.expoConfig?.extra?.eas?.projectId || c?.manifest2?.extra?.eas?.projectId || c?.manifest?.extra?.eas?.projectId || process.env.EXPO_PUBLIC_EXPO_PROJECT_ID;
    } catch {}
    if (expoProjectId) {
      const { data: expoToken } = await Notifications.getExpoPushTokenAsync({ projectId: expoProjectId } as any);
      if (expoToken) {
        await api.push.register(authToken, { token: expoToken, provider: 'expo', platform: 'android' });
        return { provider: 'expo', token: expoToken } as const;
      }
    }
    // Fallback to device token (Android FCM)
    const dev = await Notifications.getDevicePushTokenAsync({} as any);
    const fcmToken = (dev?.data || dev as any)?.token || (dev as any)?.data;
    if (fcmToken) {
      await api.push.register(authToken, { token: String(fcmToken), provider: 'fcm', platform: 'android' });
      return { provider: 'fcm', token: String(fcmToken) } as const;
    }
  } catch (e) {
    // ignore failure to register
  }
  return null;
}
