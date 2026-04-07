import React, { useRef, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import * as Haptics from "expo-haptics";
import colors from "@/constants/colors";

interface ControlButtonsProps {
  isPlaying: boolean;
  isLoading: boolean;
  hasTracks: boolean;
  onPlayPause: () => void;
  onFastForward: (seconds: number) => void;
  onRewind: (seconds: number) => void;
}

export function ControlButtons({
  isPlaying, isLoading, hasTracks,
  onPlayPause, onFastForward, onRewind,
}: ControlButtonsProps) {
  const ffRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rwRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStart = useRef(0);

  const getSeek = () => {
    const held = Date.now() - holdStart.current;
    if (held < 800) return 3;
    if (held < 2500) return 7;
    return 15;
  };

  const startFF = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    holdStart.current = Date.now();
    onFastForward(getSeek());
    ffRef.current = setInterval(() => onFastForward(getSeek()), 180);
  }, [onFastForward]);

  const stopFF = () => {
    if (ffRef.current) { clearInterval(ffRef.current); ffRef.current = null; }
  };

  const startRW = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    holdStart.current = Date.now();
    onRewind(getSeek());
    rwRef.current = setInterval(() => onRewind(getSeek()), 180);
  }, [onRewind]);

  const stopRW = () => {
    if (rwRef.current) { clearInterval(rwRef.current); rwRef.current = null; }
  };

  return (
    <View style={styles.row}>
      <Pressable
        onPressIn={startRW}
        onPressOut={stopRW}
        disabled={!hasTracks}
        style={({ pressed }) => [styles.sideBtn, !hasTracks && styles.disabled, pressed && styles.pressed]}
      >
        <Text style={[styles.sideBtnText, !hasTracks && styles.disabledText]}>{"◄◄"}</Text>
      </Pressable>

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPlayPause();
        }}
        disabled={!hasTracks}
        style={({ pressed }) => [styles.playBtn, !hasTracks && styles.playBtnDisabled, pressed && styles.playBtnPressed]}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.playBtnText}>{isPlaying ? "‖" : "▶"}</Text>
        )}
      </Pressable>

      <Pressable
        onPressIn={startFF}
        onPressOut={stopFF}
        disabled={!hasTracks}
        style={({ pressed }) => [styles.sideBtn, !hasTracks && styles.disabled, pressed && styles.pressed]}
      >
        <Text style={[styles.sideBtnText, !hasTracks && styles.disabledText]}>{"▶▶"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },

  sideBtn: {
    width: 68,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.light.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sideBtnText: {
    fontSize: 16,
    color: colors.light.text,
    fontFamily: "Inter_700Bold",
  },
  pressed: {
    opacity: 0.6,
    transform: [{ scale: 0.96 }],
  },
  disabled: {
    opacity: 0.35,
  },
  disabledText: {
    color: colors.light.mutedForeground,
  },

  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  playBtnDisabled: {
    backgroundColor: colors.light.secondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  playBtnPressed: {
    transform: [{ scale: 0.93 }],
    shadowOpacity: 0.2,
  },
  playBtnText: {
    fontSize: 28,
    color: "#ffffff",
    fontFamily: "Inter_700Bold",
    lineHeight: 32,
  },
});
