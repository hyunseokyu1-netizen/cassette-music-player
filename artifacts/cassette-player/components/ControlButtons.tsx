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

function SideButton({
  label,
  onPressIn,
  onPressOut,
  disabled,
}: {
  label: string;
  onPressIn?: () => void;
  onPressOut?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      style={({ pressed }) => [
        styles.sideBtn,
        pressed && styles.sideBtnPressed,
        disabled && styles.btnDisabled,
      ]}
    >
      <Text style={[styles.sideIcon, disabled && styles.iconDisabled]}>{label}</Text>
    </Pressable>
  );
}

function PlayButton({
  isPlaying,
  isLoading,
  disabled,
  onPress,
}: {
  isPlaying: boolean;
  isLoading: boolean;
  disabled?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.playBtn,
        pressed && styles.playBtnPressed,
        disabled && styles.btnDisabled,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#ffffff" />
      ) : (
        <Text style={styles.playIcon}>{isPlaying ? "‖" : "▶"}</Text>
      )}
    </Pressable>
  );
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
    <View style={styles.container}>
      <View style={styles.row}>
        <SideButton label="◄◄" onPressIn={startRW} onPressOut={stopRW} disabled={!hasTracks} />
        <PlayButton
          isPlaying={isPlaying}
          isLoading={isLoading}
          disabled={!hasTracks}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onPlayPause();
          }}
        />
        <SideButton label="▶▶" onPressIn={startFF} onPressOut={stopFF} disabled={!hasTracks} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: colors.light.card,
    borderRadius: 40,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
  },

  sideBtn: {
    width: 72,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.light.secondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  sideBtnPressed: {
    backgroundColor: colors.light.muted,
    transform: [{ scale: 0.96 }],
  },
  sideIcon: {
    fontSize: 18,
    color: colors.light.foreground,
    fontFamily: "Inter_700Bold",
  },

  playBtn: {
    width: 100,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.light.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  playBtnPressed: {
    transform: [{ scale: 0.95 }],
    shadowOpacity: 0.2,
    elevation: 2,
  },
  playIcon: {
    fontSize: 26,
    color: "#ffffff",
    fontFamily: "Inter_700Bold",
  },

  btnDisabled: {
    opacity: 0.35,
  },
  iconDisabled: {
    color: colors.light.mutedForeground,
  },
});
