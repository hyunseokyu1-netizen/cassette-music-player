import React from "react";
import { View, Text, StyleSheet } from "react-native";
import colors from "@/constants/colors";

const TAPE_MS = 30 * 60 * 1000;

interface ProgressBarProps {
  tapePosition: number;
  currentTrackPosition?: number;
  currentTrackDuration?: number;
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function ProgressBar({ tapePosition, currentTrackPosition = 0, currentTrackDuration = 0 }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(tapePosition, TAPE_MS));
  const progress = clamped / TAPE_MS;

  const showTrack = currentTrackDuration > 0;
  const trackProgress = showTrack ? Math.min(1, currentTrackPosition / currentTrackDuration) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        <View style={[styles.thumb, { left: `${Math.max(0, Math.min(progress * 100 - 1.5, 98.5))}%` }]} />
      </View>
      <View style={styles.times}>
        <Text style={styles.time}>{formatTime(clamped)}</Text>
        <Text style={styles.timeDivider}>/ 30:00</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    gap: 6,
  },
  track: {
    height: 4,
    backgroundColor: colors.light.secondary,
    borderRadius: 2,
    position: "relative",
    overflow: "visible",
  },
  fill: {
    height: "100%",
    backgroundColor: colors.light.primary,
    borderRadius: 2,
  },
  thumb: {
    position: "absolute",
    top: -5,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.light.primary,
    borderWidth: 3,
    borderColor: colors.light.card,
    shadowColor: colors.light.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3,
  },
  times: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  time: {
    fontSize: 13,
    color: colors.light.text,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
  },
  timeDivider: {
    fontSize: 11,
    color: colors.light.mutedForeground,
    fontFamily: "Inter_400Regular",
  },
});
