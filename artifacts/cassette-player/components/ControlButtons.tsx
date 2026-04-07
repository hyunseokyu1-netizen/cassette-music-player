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

  const disabled = !hasTracks;

  return (
    <View style={styles.strip}>

      {/* REW */}
      <Pressable
        onPressIn={startRW}
        onPressOut={stopRW}
        disabled={disabled}
        style={({ pressed }) => [styles.sideZone, pressed && styles.sideZonePressed]}
      >
        <Text style={[styles.sideIcon, disabled && styles.iconDisabled]}>◄◄</Text>
      </Pressable>

      {/* PLAY / PAUSE */}
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPlayPause();
        }}
        disabled={disabled}
        style={({ pressed }) => [
          styles.playBtn,
          pressed && styles.playBtnPressed,
          disabled && styles.playBtnDisabled,
        ]}
      >
        {isLoading
          ? <ActivityIndicator size="small" color="#fff" />
          : <Text style={styles.playIcon}>{isPlaying ? "‖" : "▶"}</Text>
        }
      </Pressable>

      {/* FF */}
      <Pressable
        onPressIn={startFF}
        onPressOut={stopFF}
        disabled={disabled}
        style={({ pressed }) => [styles.sideZone, pressed && styles.sideZonePressed]}
      >
        <Text style={[styles.sideIcon, disabled && styles.iconDisabled]}>▶▶</Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 40,
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: "#A09070",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
  },

  sideZone: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 54,
    borderRadius: 27,
  },
  sideZonePressed: {
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  sideIcon: {
    fontSize: 16,
    color: colors.light.foreground,
    fontFamily: "Inter_700Bold",
    opacity: 0.7,
  },

  playBtn: {
    width: 110,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#B86010",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  playBtnPressed: {
    transform: [{ scale: 0.95 }],
    shadowOpacity: 0.2,
    elevation: 3,
  },
  playBtnDisabled: {
    backgroundColor: "#D8CEBC",
    shadowOpacity: 0,
    elevation: 0,
  },
  playIcon: {
    fontSize: 26,
    color: "#ffffff",
    fontFamily: "Inter_700Bold",
  },

  iconDisabled: {
    opacity: 0.3,
  },
});
