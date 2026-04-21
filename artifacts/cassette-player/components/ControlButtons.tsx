import React, { useCallback } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import * as Haptics from "expo-haptics";
import colors from "@/constants/colors";
import { hasRetroControlAssets, retroPlayerAssets, type SpriteCrop } from "@/constants/retroPlayerAssets";
import { SpriteView } from "./SpriteView";

interface ControlButtonsProps {
  isPlaying: boolean;
  isLoading: boolean;
  hasTracks: boolean;
  onPlayPause: () => void;
  onFFStart: () => void;
  onFFStop: () => void;
  onRWStart: () => void;
  onRWStop: () => void;
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
            <ActivityIndicator size="small" color={colors.light.cassetteBeige} />
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
          {active && <View style={styles.led} />}
        </View>
      )}
    </Pressable>
  );
}

export function ControlButtons({
  isPlaying, isLoading, hasTracks,
  onPlayPause, onFFStart, onFFStop, onRWStart, onRWStop,
}: ControlButtonsProps) {
  const handleFFStart = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFFStart();
  }, [onFFStart]);

  const handleFFStop = useCallback(() => {
    onFFStop();
  }, [onFFStop]);

  const handleRWStart = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRWStart();
  }, [onRWStart]);

  const handleRWStop = useCallback(() => {
    onRWStop();
  }, [onRWStop]);

  if (hasRetroControlAssets()) {
    return (
      <RetroImageControlButtons
        isPlaying={isPlaying}
        isLoading={isLoading}
        hasTracks={hasTracks}
        onPlayPause={onPlayPause}
        onFFStart={handleFFStart}
        onFFStop={handleFFStop}
        onRWStart={handleRWStart}
        onRWStop={handleRWStop}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        <View style={styles.panelRidge} />
        <View style={styles.row}>
          <DeckButton
            label="◄◄"
            subLabel="REW"
            onPressIn={handleRWStart}
            onPressOut={handleRWStop}
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
            onPressIn={handleFFStart}
            onPressOut={handleFFStop}
            disabled={!hasTracks}
          />
        </View>
      </View>
    </View>
  );
}

function RetroImageControlButtons({
  isPlaying,
  isLoading,
  hasTracks,
  onPlayPause,
  onFFStart,
  onFFStop,
  onRWStart,
  onRWStop,
}: ControlButtonsProps) {
  const { sources } = retroPlayerAssets;

  return (
    <View style={styles.retroContainer}>
      <View style={styles.retroRow}>
        <RetroImageButton
          label="REWIND"
          crop={sources.rewindButton}
          disabled={!hasTracks}
          onPressIn={onRWStart}
          onPressOut={onRWStop}
        />
        <RetroImageButton
          label={isPlaying ? "PLAYING" : "PLAY"}
          crop={isPlaying ? sources.playButtonActive : sources.playButton}
          disabled={!hasTracks}
          loading={isLoading}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onPlayPause();
          }}
        />
        <RetroImageButton
          label="FAST FORWARD"
          crop={sources.fastForwardButton}
          disabled={!hasTracks}
          onPressIn={onFFStart}
          onPressOut={onFFStop}
        />
      </View>
    </View>
  );
}

function RetroImageButton({
  label,
  crop,
  onPress,
  onPressIn,
  onPressOut,
  disabled,
  loading,
}: {
  label: string;
  crop?: SpriteCrop;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      style={({ pressed }) => [
        styles.retroButtonWrap,
        disabled && styles.retroButtonDisabled,
        pressed && styles.retroButtonPressed,
      ]}
    >
      {loading ? (
        <View style={styles.retroLoading}>
          <ActivityIndicator size="small" color={colors.light.cassetteBeige} />
        </View>
      ) : crop ? (
        <SpriteView crop={crop} width={96} />
      ) : null}
      <Text style={styles.retroButtonLabel}>{label}</Text>
    </Pressable>
  );
}

const BTN_BG = "#3a2510";
const BTN_TOP = "#5c3820";
const BTN_BOTTOM = "#1a0e06";
const BTN_ACTIVE_BG = "#6b3412";
const BTN_ACTIVE_TOP = "#a05828";

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  retroContainer: {
    paddingHorizontal: 16,
  },
  retroRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    gap: 16,
  },
  retroButtonWrap: {
    width: 118,
    alignItems: "center",
    gap: 8,
  },
  retroButtonPressed: {
    transform: [{ translateY: 2 }],
  },
  retroButtonDisabled: {
    opacity: 0.38,
  },
  retroButtonImage: {
    width: 96,
    height: 96,
  },
  retroButtonLabel: {
    color: colors.light.cassetteBeige,
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.2,
    textAlign: "center",
  },
  retroLoading: {
    width: 96,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: colors.light.card,
  },
  panel: {
    backgroundColor: colors.light.card,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderTopWidth: 2,
    borderLeftWidth: 1,
    borderTopColor: colors.light.border,
    borderLeftColor: colors.light.border,
    borderBottomWidth: 3,
    borderRightWidth: 2,
    borderBottomColor: colors.light.cassetteDark,
    borderRightColor: colors.light.cassetteDark,
    width: "100%",
  },
  panelRidge: {
    position: "absolute",
    top: 0,
    left: 20,
    right: 20,
    height: 3,
    backgroundColor: colors.light.border,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    opacity: 0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },

  button: {
    width: 68,
    height: 60,
    borderRadius: 6,
    backgroundColor: BTN_BG,
    borderTopWidth: 2,
    borderLeftWidth: 1,
    borderTopColor: BTN_TOP,
    borderLeftColor: BTN_TOP,
    borderBottomWidth: 3,
    borderRightWidth: 2,
    borderBottomColor: BTN_BOTTOM,
    borderRightColor: BTN_BOTTOM,
  },
  buttonLarge: {
    width: 84,
    height: 72,
    borderRadius: 8,
  },
  buttonPressed: {
    borderTopColor: BTN_BOTTOM,
    borderLeftColor: BTN_BOTTOM,
    borderBottomColor: BTN_TOP,
    borderRightColor: BTN_TOP,
    transform: [{ translateY: 2 }],
  },
  buttonActive: {
    backgroundColor: BTN_ACTIVE_BG,
    borderTopColor: BTN_ACTIVE_TOP,
    borderLeftColor: BTN_ACTIVE_TOP,
    borderBottomColor: BTN_BOTTOM,
    borderRightColor: BTN_BOTTOM,
  },
  buttonDisabled: {
    opacity: 0.35,
  },

  buttonInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    position: "relative",
  },

  label: {
    fontSize: 20,
    color: colors.light.mutedForeground,
    fontFamily: "Inter_700Bold",
    lineHeight: 24,
  },
  labelLarge: {
    fontSize: 26,
    lineHeight: 30,
  },
  labelActive: {
    color: colors.light.cassetteBeige,
  },
  labelPressed: {
    opacity: 0.75,
  },
  labelDisabled: {
    color: colors.light.border,
  },

  subLabel: {
    fontSize: 8,
    color: colors.light.mutedForeground,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
    opacity: 0.6,
  },
  subLabelActive: {
    color: colors.light.cassetteBeige,
    opacity: 0.8,
  },
  subLabelDisabled: {
    color: colors.light.border,
  },

  led: {
    position: "absolute",
    top: 4,
    right: 5,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.light.cassetteBeige,
    opacity: 0.9,
  },
});
