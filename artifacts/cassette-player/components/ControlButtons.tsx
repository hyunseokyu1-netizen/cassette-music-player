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
  onFFStart: () => void;
  onFFStop: () => void;
}

function FlatButton({
  label,
  onPress,
  onPressIn,
  onPressOut,
  disabled,
}: {
  label: string;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      style={({ pressed }) => [
        styles.flatBtn,
        pressed && styles.flatBtnPressed,
        disabled && styles.btnDisabled,
      ]}
    >
      <Text style={[styles.flatLabel, disabled && styles.labelDisabled]}>{label}</Text>
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
  onPress: () => void;
}) {
  return (
    // overflow:hidden으로 Android 리플 클리핑
    <View style={[styles.playBtnClip, disabled && styles.btnDisabled]}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.playBtn,
          pressed && styles.playBtnPressed,
        ]}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.light.btnPlayIcon} />
        ) : (
          <Text style={styles.playLabel}>{isPlaying ? "❚❚" : "▶"}</Text>
        )}
      </Pressable>
    </View>
  );
}

export function ControlButtons({
  isPlaying, isLoading, hasTracks,
  onPlayPause, onFastForward, onRewind, onFFStart, onFFStop,
}: ControlButtonsProps) {
  const rwRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStart = useRef(0);

  const getSeek = () => {
    const held = Date.now() - holdStart.current;
    if (held < 800) return 3;
    if (held < 2500) return 7;
    return 15;
  };

  const handleFFStart = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFFStart();
  }, [onFFStart]);

  const handleFFStop = useCallback(() => {
    onFFStop();
  }, [onFFStop]);

  const startRW = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    holdStart.current = Date.now();
    onRewind(getSeek());
    rwRef.current = setInterval(() => onRewind(getSeek()), 300);
  }, [onRewind]);

  const stopRW = () => {
    if (rwRef.current) { clearInterval(rwRef.current); rwRef.current = null; }
  };

  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        <View style={styles.row}>
          <FlatButton
            label="◄◄"
            onPressIn={startRW}
            onPressOut={stopRW}
            disabled={!hasTracks}
          />
          <PlayButton
            isPlaying={isPlaying}
            isLoading={isLoading}
            disabled={!hasTracks}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onPlayPause();
            }}
          />
          <FlatButton
            label="▶▶"
            onPressIn={handleFFStart}
            onPressOut={handleFFStop}
            disabled={!hasTracks}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  panel: {
    backgroundColor: colors.light.controlPanel,
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.light.controlPanelBorder,
    width: "100%",
    elevation: 2,
    shadowColor: "rgba(80,40,10,0.12)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },

  // REW / FF 플랫 버튼
  flatBtn: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.light.btnFlat,
    borderWidth: 1,
    borderColor: colors.light.btnFlatBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  flatBtnPressed: {
    backgroundColor: colors.light.btnFlatPressed,
    transform: [{ scale: 0.96 }],
  },
  flatLabel: {
    fontSize: 18,
    color: colors.light.btnFlatIcon,
    fontFamily: "Inter_700Bold",
    lineHeight: 22,
  },

  // PLAY / PAUSE 오렌지 버튼
  playBtnClip: {
    borderRadius: 32,
    overflow: "hidden",
  },
  playBtn: {
    width: 72,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.light.btnPlay,
    borderTopWidth: 2,
    borderTopColor: colors.light.btnPlayTop,
    borderBottomWidth: 3,
    borderBottomColor: colors.light.btnPlayBottom,
    borderLeftWidth: 1,
    borderLeftColor: "#e88030",
    borderRightWidth: 1,
    borderRightColor: colors.light.btnPlayBottom,
    alignItems: "center",
    justifyContent: "center",
  },
  playBtnPressed: {
    borderTopColor: colors.light.btnPlayBottom,
    borderBottomColor: colors.light.btnPlayTop,
    transform: [{ translateY: 2 }],
  },
  playLabel: {
    fontSize: 26,
    color: colors.light.btnPlayIcon,
    fontFamily: "Inter_700Bold",
    lineHeight: 32,
  },

  btnDisabled: {
    opacity: 0.38,
  },
  labelDisabled: {
    opacity: 0.5,
  },
});
