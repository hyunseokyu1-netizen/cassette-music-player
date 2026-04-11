import React from "react";
import { View, Text, StyleSheet } from "react-native";
import colors from "@/constants/colors";

const TAPE_MS = 30 * 60 * 1000;

interface ProgressBarProps {
  tapePosition: number;
  trackTitle?: string;
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function ProgressBar({ tapePosition, trackTitle }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(tapePosition, TAPE_MS));
  const progress = clamped / TAPE_MS;

  return (
    <View style={styles.container}>
      <View style={styles.infoRow}>
        <Text style={styles.trackName} numberOfLines={1}>
          {trackTitle ?? ""}
        </Text>
        <Text style={styles.timeDisplay}>
          {formatTime(clamped)} / {formatTime(TAPE_MS)}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        <View
          style={[
            styles.thumb,
            { left: `${Math.max(0, Math.min(progress * 100 - 1.5, 98.5))}%` },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  trackName: {
    flex: 1,
    color: "#2c1a0e",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
  timeDisplay: {
    color: colors.light.timeText,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.5,
    flexShrink: 0,
  },
  track: {
    height: 3,
    backgroundColor: colors.light.progressTrack,
    borderRadius: 2,
    position: "relative",
    overflow: "visible",
  },
  fill: {
    height: "100%",
    backgroundColor: colors.light.progressFill,
    borderRadius: 2,
  },
  thumb: {
    position: "absolute",
    top: -6,
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: colors.light.progressFill,
    borderWidth: 2.5,
    borderColor: colors.light.btnPlayBottom,
    elevation: 2,
    shadowColor: "rgba(80,40,10,0.2)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
  },
});
