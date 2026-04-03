import React, { useRef } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  GestureResponderEvent,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import colors from "@/constants/colors";

interface ControlButtonsProps {
  isPlaying: boolean;
  isLoading: boolean;
  hasTracks: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onFastForward: () => void;
  onRewind: () => void;
}

export function ControlButtons({
  isPlaying,
  isLoading,
  hasTracks,
  onPlayPause,
  onNext,
  onPrevious,
  onFastForward,
  onRewind,
}: ControlButtonsProps) {
  const ffIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rwIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handlePress = (action: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    action();
  };

  const handlePlayPause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPlayPause();
  };

  const startFastForward = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFastForward();
    ffIntervalRef.current = setInterval(() => {
      onFastForward();
    }, 500);
  };

  const stopFastForward = () => {
    if (ffIntervalRef.current) {
      clearInterval(ffIntervalRef.current);
      ffIntervalRef.current = null;
    }
  };

  const startRewind = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRewind();
    rwIntervalRef.current = setInterval(() => {
      onRewind();
    }, 500);
  };

  const stopRewind = () => {
    if (rwIntervalRef.current) {
      clearInterval(rwIntervalRef.current);
      rwIntervalRef.current = null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.button, styles.smallButton]}
          onPress={() => handlePress(onPrevious)}
          disabled={!hasTracks}
          activeOpacity={0.7}
        >
          <Feather
            name="skip-back"
            size={20}
            color={hasTracks ? colors.light.cassetteBeige : colors.light.mutedForeground}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.smallButton]}
          onPressIn={startRewind}
          onPressOut={stopRewind}
          disabled={!hasTracks}
          activeOpacity={0.7}
        >
          <Feather
            name="rewind"
            size={20}
            color={hasTracks ? colors.light.cassetteBeige : colors.light.mutedForeground}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.playButton]}
          onPress={handlePlayPause}
          disabled={!hasTracks || isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.light.cassetteDark} size="small" />
          ) : (
            <Feather
              name={isPlaying ? "pause" : "play"}
              size={28}
              color={colors.light.cassetteDark}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.smallButton]}
          onPressIn={startFastForward}
          onPressOut={stopFastForward}
          disabled={!hasTracks}
          activeOpacity={0.7}
        >
          <Feather
            name="fast-forward"
            size={20}
            color={hasTracks ? colors.light.cassetteBeige : colors.light.mutedForeground}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.smallButton]}
          onPress={() => handlePress(onNext)}
          disabled={!hasTracks}
          activeOpacity={0.7}
        >
          <Feather
            name="skip-forward"
            size={20}
            color={hasTracks ? colors.light.cassetteBeige : colors.light.mutedForeground}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
  },
  smallButton: {
    width: 48,
    height: 48,
    backgroundColor: colors.light.secondary,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  playButton: {
    width: 68,
    height: 68,
    backgroundColor: colors.light.cassetteBeige,
    borderWidth: 2,
    borderColor: colors.light.cassetteLabelBorder,
    shadowColor: colors.light.cassetteBeige,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
