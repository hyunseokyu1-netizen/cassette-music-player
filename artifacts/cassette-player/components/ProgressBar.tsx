import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import colors from "@/constants/colors";

interface ProgressBarProps {
  position: number;
  duration: number;
  progress: number;
  onSeek?: (progress: number) => void;
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function ProgressBar({ position, duration, progress }: ProgressBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        <View
          style={[styles.thumb, { left: `${Math.max(0, Math.min(progress * 100 - 1.5, 98.5))}%` }]}
        />
      </View>
      <View style={styles.times}>
        <Text style={styles.time}>{formatTime(position)}</Text>
        <Text style={styles.time}>{formatTime(duration)}</Text>
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
    backgroundColor: colors.light.cassetteBeige,
    borderRadius: 2,
  },
  thumb: {
    position: "absolute",
    top: -5,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.light.cassetteBeige,
    borderWidth: 2,
    borderColor: colors.light.cassetteLabelBorder,
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
});
