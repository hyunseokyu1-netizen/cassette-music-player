import React, { useRef } from "react";
import {
  View, TouchableOpacity, StyleSheet, ActivityIndicator,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Icon } from "@/components/Icon";
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
  isPlaying, isLoading, hasTracks,
  onPlayPause, onNext, onPrevious, onFastForward, onRewind,
}: ControlButtonsProps) {
  const ffRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rwRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tap = (fn: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fn();
  };

  const startFF = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFastForward();
    ffRef.current = setInterval(onFastForward, 500);
  };
  const stopFF = () => { if (ffRef.current) { clearInterval(ffRef.current); ffRef.current = null; } };

  const startRW = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRewind();
    rwRef.current = setInterval(onRewind, 500);
  };
  const stopRW = () => { if (rwRef.current) { clearInterval(rwRef.current); rwRef.current = null; } };

  const iconColor = (active: boolean) =>
    active ? colors.light.cassetteBeige : colors.light.mutedForeground;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.btn, styles.small]}
          onPress={() => tap(onPrevious)}
          disabled={!hasTracks}
          activeOpacity={0.7}
        >
          <Icon name="skip-back" size={19} color={iconColor(hasTracks)} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.small]}
          onPressIn={startRW} onPressOut={stopRW}
          disabled={!hasTracks} activeOpacity={0.7}
        >
          <Icon name="rewind" size={19} color={iconColor(hasTracks)} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.play]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onPlayPause(); }}
          disabled={!hasTracks || isLoading}
          activeOpacity={0.8}
        >
          {isLoading
            ? <ActivityIndicator color={colors.light.cassetteDark} size="small" />
            : <Icon name={isPlaying ? "pause" : "play"} size={26} color={colors.light.cassetteDark} />
          }
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.small]}
          onPressIn={startFF} onPressOut={stopFF}
          disabled={!hasTracks} activeOpacity={0.7}
        >
          <Icon name="fast-forward" size={19} color={iconColor(hasTracks)} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.small]}
          onPress={() => tap(onNext)}
          disabled={!hasTracks} activeOpacity={0.7}
        >
          <Icon name="skip-forward" size={19} color={iconColor(hasTracks)} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", paddingHorizontal: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  btn: { alignItems: "center", justifyContent: "center", borderRadius: 50 },
  small: {
    width: 50, height: 50,
    backgroundColor: colors.light.secondary,
    borderWidth: 1, borderColor: colors.light.border,
  },
  play: {
    width: 68, height: 68,
    backgroundColor: colors.light.cassetteBeige,
    borderWidth: 2, borderColor: colors.light.cassetteLabelBorder,
    elevation: 6,
  },
});
