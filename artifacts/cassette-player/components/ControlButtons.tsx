import React, { useRef, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, Pressable, ActivityIndicator,
} from "react-native";
import * as Haptics from "expo-haptics";

interface ControlButtonsProps {
  isPlaying: boolean;
  isLoading: boolean;
  isPlayingNoise: boolean;
  hasTracks: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onFastForward: (seconds: number) => void;
  onRewind: (seconds: number) => void;
}

function DeckButton({
  label,
  subLabel,
  onPress,
  onPressIn,
  onPressOut,
  active,
  disabled,
  isLoading,
  wide,
}: {
  label: string;
  subLabel?: string;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  active?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  wide?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        wide && styles.buttonWide,
        pressed && styles.buttonPressed,
        active && styles.buttonActive,
        disabled && styles.buttonDisabled,
      ]}
    >
      {({ pressed }) => (
        <View style={styles.buttonInner}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#c8c4b0" />
          ) : (
            <>
              <Text style={[
                styles.buttonLabel,
                active && styles.buttonLabelActive,
                disabled && styles.buttonLabelDisabled,
                pressed && styles.buttonLabelPressed,
              ]}>
                {label}
              </Text>
              {subLabel ? (
                <Text style={[
                  styles.buttonSubLabel,
                  active && styles.buttonLabelActive,
                  disabled && styles.buttonLabelDisabled,
                ]}>
                  {subLabel}
                </Text>
              ) : null}
            </>
          )}
          {active && <View style={styles.activeLed} />}
        </View>
      )}
    </Pressable>
  );
}

export function ControlButtons({
  isPlaying, isLoading, isPlayingNoise, hasTracks,
  onPlay, onPause, onStop, onFastForward, onRewind,
}: ControlButtonsProps) {
  const ffIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rwIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStartRef = useRef<number>(0);

  const clearFF = () => {
    if (ffIntervalRef.current) { clearInterval(ffIntervalRef.current); ffIntervalRef.current = null; }
  };
  const clearRW = () => {
    if (rwIntervalRef.current) { clearInterval(rwIntervalRef.current); rwIntervalRef.current = null; }
  };

  const getSeekSeconds = () => {
    const held = Date.now() - holdStartRef.current;
    if (held < 800) return 3;
    if (held < 2500) return 6;
    return 12;
  };

  const startFF = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    holdStartRef.current = Date.now();
    onFastForward(getSeekSeconds());
    ffIntervalRef.current = setInterval(() => {
      onFastForward(getSeekSeconds());
    }, 180);
  }, [onFastForward]);

  const startRW = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    holdStartRef.current = Date.now();
    onRewind(getSeekSeconds());
    rwIntervalRef.current = setInterval(() => {
      onRewind(getSeekSeconds());
    }, 180);
  }, [onRewind]);

  const disabled = !hasTracks;

  return (
    <View style={styles.panel}>
      <View style={styles.panelInner}>
        <View style={styles.row}>
          <DeckButton
            label="■"
            subLabel="STOP"
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onStop(); }}
            disabled={disabled}
          />
          <DeckButton
            label="◄◄"
            subLabel="REW"
            onPressIn={startRW}
            onPressOut={clearRW}
            disabled={disabled}
          />
          <DeckButton
            label="▶"
            subLabel="PLAY"
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onPlay(); }}
            active={isPlaying && !isPlayingNoise}
            disabled={disabled}
            isLoading={isLoading}
            wide
          />
          <DeckButton
            label="‖"
            subLabel="PAUSE"
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPause(); }}
            active={!isPlaying && !isPlayingNoise && hasTracks}
            disabled={disabled}
          />
          <DeckButton
            label="▶▶"
            subLabel="FF"
            onPressIn={startFF}
            onPressOut={clearFF}
            disabled={disabled}
          />
        </View>
      </View>
      <View style={styles.panelBase} />
    </View>
  );
}

const PANEL_BG = "#252530";
const BTN_BASE = "#3a3a50";
const BTN_HIGHLIGHT = "#5c5c78";
const BTN_SHADOW = "#14141e";
const BTN_ACTIVE_BG = "#2a2a44";
const BTN_ACTIVE_GLOW = "#8878ff";
const LABEL_COLOR = "#b0aec8";
const LABEL_ACTIVE = "#ffffff";
const LABEL_DISABLED = "#555566";

const styles = StyleSheet.create({
  panel: {
    alignItems: "center",
  },
  panelInner: {
    backgroundColor: PANEL_BG,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: "#3a3a50",
    borderLeftColor: "#3a3a50",
    borderBottomWidth: 3,
    borderRightWidth: 2,
    borderBottomColor: "#0e0e18",
    borderRightColor: "#0e0e18",
  },
  panelBase: {
    height: 5,
    backgroundColor: "#0e0e18",
    width: "80%",
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  button: {
    width: 52,
    height: 56,
    borderRadius: 5,
    backgroundColor: BTN_BASE,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: BTN_HIGHLIGHT,
    borderLeftColor: BTN_HIGHLIGHT,
    borderBottomWidth: 3,
    borderRightWidth: 2,
    borderBottomColor: BTN_SHADOW,
    borderRightColor: BTN_SHADOW,
    overflow: "visible",
  },
  buttonWide: {
    width: 62,
  },
  buttonPressed: {
    backgroundColor: "#2e2e40",
    borderTopColor: BTN_SHADOW,
    borderLeftColor: BTN_SHADOW,
    borderBottomColor: BTN_HIGHLIGHT,
    borderRightColor: BTN_HIGHLIGHT,
    transform: [{ translateY: 1 }],
  },
  buttonActive: {
    backgroundColor: BTN_ACTIVE_BG,
    borderTopColor: BTN_ACTIVE_GLOW,
    borderLeftColor: BTN_ACTIVE_GLOW,
    borderBottomColor: BTN_SHADOW,
    borderRightColor: BTN_SHADOW,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    position: "relative",
  },
  buttonLabel: {
    fontSize: 20,
    color: LABEL_COLOR,
    fontFamily: "Inter_700Bold",
    lineHeight: 24,
  },
  buttonSubLabel: {
    fontSize: 8,
    color: LABEL_COLOR,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
    opacity: 0.65,
  },
  buttonLabelActive: {
    color: LABEL_ACTIVE,
  },
  buttonLabelDisabled: {
    color: LABEL_DISABLED,
  },
  buttonLabelPressed: {
    opacity: 0.8,
  },
  activeLed: {
    position: "absolute",
    top: 3,
    right: 4,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#00ff88",
    shadowColor: "#00ff88",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
  },
});
