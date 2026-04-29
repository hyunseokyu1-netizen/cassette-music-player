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
