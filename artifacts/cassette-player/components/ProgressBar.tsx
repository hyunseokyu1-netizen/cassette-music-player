import React from "react";
import { View, Text, StyleSheet } from "react-native";
import colors from "@/constants/colors";

const TAPE_MS = 30 * 60 * 1000;

interface ProgressBarProps {
  tapePosition: number;
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function ProgressBar({ tapePosition }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(tapePosition, TAPE_MS));
  const progress = clamped / TAPE_MS;
  const remaining = TAPE_MS - clamped;

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        <View
          style={[
            styles.thumb,
            { left: `${Math.max(0, Math.min(progress * 100 - 1.5, 98.5))}%` },
          ]}
        />
      </View>
      <View style={styles.times}>
        <Text style={styles.time}>{formatTime(clamped)}</Text>
        <Text style={[styles.time, styles.remaining]}>-{formatTime(remaining)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    gap: 8,
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
    borderWidth: 2,
    borderColor: colors.light.background,
  },
  times: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  time: {
    fontSize: 11,
    color: colors.light.mutedForeground,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.5,
  },
  remaining: {
    color: colors.light.foreground,
    fontFamily: "Inter_600SemiBold",
  },
});
