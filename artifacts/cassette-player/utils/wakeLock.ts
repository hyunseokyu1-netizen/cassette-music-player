import { NativeModules, Platform } from "react-native";

const { WakeLock } = NativeModules;

export function acquireWakeLock() {
  if (Platform.OS === "android" && WakeLock) {
    WakeLock.acquire();
  }
}

export function releaseWakeLock() {
  if (Platform.OS === "android" && WakeLock) {
    WakeLock.release();
  }
}

// Foreground Service: Android Doze 완전 제외 (JS 스레드 스로틀링 방지)
export function startForegroundService(title: string) {
  if (Platform.OS === "android" && WakeLock) {
    WakeLock.startService(title);
  }
}

export function stopForegroundService() {
  if (Platform.OS === "android" && WakeLock) {
    WakeLock.stopService();
  }
}
