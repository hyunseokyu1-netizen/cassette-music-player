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

const PANEL_BG = "#EAE2D8";
const BTN_BG = "#E2D9CE";
const BTN_SHADOW = "#C4B8A8";
const BTN_HIGHLIGHT = "#F5F0E8";
const BTN_ACTIVE_BG = "#c47a38";
const BTN_ACTIVE_SHADOW = "#9a5c20";
const BTN_ACTIVE_HIGHLIGHT = "#e8a060";
const LABEL_COLOR = "#6b4a2e";
const LABEL_ACTIVE = "#ffffff";
const LABEL_DISABLED = "#C4B8A8";

function DeckButton({
  label,
  subLabel,
  onPress,
  onPressIn,
  onPressOut,
  active,
  disabled,
  isLoading,
  size,
}: {
  label: string;
  subLabel: string;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  active?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  size?: "normal" | "large";
}) {
  const isLarge = size === "large";
  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        isLarge && styles.buttonLarge,
        pressed && styles.buttonPressed,
        active && styles.buttonActive,
        disabled && styles.buttonDisabled,
      ]}
    >
      {({ pressed }) => (
        <View style={styles.buttonInner}>
          {isLoading ? (
            <ActivityIndicator size="small" color={BTN_ACTIVE_BG} />
          ) : (
            <>
              <Text style={[
                styles.label,
                isLarge && styles.labelLarge,
                active && styles.labelActive,
                pressed && !disabled && styles.labelPressed,
                disabled && styles.labelDisabled,
              ]}>
                {label}
              </Text>
              <Text style={[
                styles.subLabel,
                active && styles.subLabelActive,
                disabled && styles.subLabelDisabled,
              ]}>
                {subLabel}
              </Text>
            </>
          )}
        </View>
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
      <View style={styles.panel}>
        <View style={styles.row}>
          <DeckButton
            label="◄◄"
            subLabel="REW"
            onPressIn={startRW}
            onPressOut={stopRW}
            disabled={!hasTracks}
          />
          <DeckButton
            label={isPlaying ? "‖" : "▶"}
            subLabel={isPlaying ? "PAUSE" : "PLAY"}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onPlayPause();
            }}
            active={isPlaying}
            disabled={!hasTracks}
            isLoading={isLoading}
            size="large"
          />
          <DeckButton
            label="▶▶"
            subLabel="FF"
            onPressIn={startFF}
            onPressOut={stopFF}
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
    backgroundColor: PANEL_BG,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 28,
    width: "100%",
    shadowColor: "#A09080",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: BTN_HIGHLIGHT,
    borderLeftColor: BTN_HIGHLIGHT,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: "#C8BBAA",
    borderRightColor: "#C8BBAA",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },

  button: {
    width: 72,
    height: 62,
    borderRadius: 14,
    backgroundColor: BTN_BG,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: BTN_HIGHLIGHT,
    borderLeftColor: BTN_HIGHLIGHT,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomColor: BTN_SHADOW,
    borderRightColor: BTN_SHADOW,
    shadowColor: "#A09080",
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonLarge: {
    width: 90,
    height: 76,
    borderRadius: 18,
  },
  buttonPressed: {
    borderTopColor: BTN_SHADOW,
    borderLeftColor: BTN_SHADOW,
    borderBottomColor: BTN_HIGHLIGHT,
    borderRightColor: BTN_HIGHLIGHT,
    transform: [{ translateY: 1 }],
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.1,
    elevation: 1,
  },
  buttonActive: {
    backgroundColor: BTN_ACTIVE_BG,
    borderTopColor: BTN_ACTIVE_HIGHLIGHT,
    borderLeftColor: BTN_ACTIVE_HIGHLIGHT,
    borderBottomColor: BTN_ACTIVE_SHADOW,
    borderRightColor: BTN_ACTIVE_SHADOW,
  },
  buttonDisabled: {
    opacity: 0.45,
  },

  buttonInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  label: {
    fontSize: 20,
    color: LABEL_COLOR,
    fontFamily: "Inter_700Bold",
    lineHeight: 24,
  },
  labelLarge: {
    fontSize: 28,
    lineHeight: 32,
  },
  labelActive: {
    color: LABEL_ACTIVE,
  },
  labelPressed: {
    opacity: 0.7,
  },
  labelDisabled: {
    color: LABEL_DISABLED,
  },

  subLabel: {
    fontSize: 8,
    color: LABEL_COLOR,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
    opacity: 0.55,
  },
  subLabelActive: {
    color: LABEL_ACTIVE,
    opacity: 0.85,
  },
  subLabelDisabled: {
    color: LABEL_DISABLED,
  },
});
