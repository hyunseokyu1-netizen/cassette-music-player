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
        disabled && styles.playBtnDisabled,
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
  );
}

const CARD_BG = colors.light.card;
const BTN_BG = colors.light.background;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 24,
  },

  sideBtn: {
    width: 76,
    height: 52,
    borderRadius: 26,
    backgroundColor: BTN_BG,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8a7a60",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
  },
  sideBtnPressed: {
    shadowOpacity: 0.06,
    elevation: 1,
    transform: [{ scale: 0.97 }],
  },
  sideIcon: {
    fontSize: 17,
    color: colors.light.foreground,
    fontFamily: "Inter_700Bold",
  },

  playBtn: {
    width: 108,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#C06010",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255,200,100,0.3)",
  },
  playBtnPressed: {
    shadowOpacity: 0.15,
    elevation: 2,
    transform: [{ scale: 0.96 }],
  },
  playBtnDisabled: {
    backgroundColor: colors.light.muted,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    elevation: 1,
  },
  playIcon: {
    fontSize: 26,
    color: "#ffffff",
    fontFamily: "Inter_700Bold",
  },

  btnDisabled: {
    opacity: 0.4,
    shadowOpacity: 0.04,
    elevation: 1,
  },
  iconDisabled: {
    color: colors.light.mutedForeground,
  },
});
