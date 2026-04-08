import React, { useCallback, useMemo } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Platform,
} from "react-native";
import Animated, {
  useSharedValue, withSequence, withTiming, useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { CassetteTape } from "@/components/CassetteTape";
import { ControlButtons } from "@/components/ControlButtons";
import { ProgressBar } from "@/components/ProgressBar";
import { Icon } from "@/components/Icon";
import { useAudioPlayerContext } from "@/contexts/AudioPlayerContext";
import { TrackItem } from "@/hooks/useAudioPlayer";
import colors from "@/constants/colors";

export default function PlayerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    sideA, sideB, currentSide, currentTrack, currentItemIdx,
    isPlaying, isLoading, isPlayingNoise, position,
    togglePlayPause,
    seekForward, seekBackward, flipSide,
  } = useAudioPlayerContext();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const scaleX = useSharedValue(1);

  const handleFlip = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    scaleX.value = withSequence(
      withTiming(0, { duration: 180 }),
      withTiming(1, { duration: 180 })
    );
    setTimeout(() => flipSide(), 180);
  }, [flipSide]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: scaleX.value }] }));

  const sideATracks = sideA.filter((it): it is TrackItem => it.type === "track");
  const sideBTracks = sideB.filter((it): it is TrackItem => it.type === "track");
  const activeItems = currentSide === "A" ? sideA : sideB;
  const activeTracks = currentSide === "A" ? sideATracks : sideBTracks;
  const hasTracks = activeTracks.length > 0;
  const trackTitles = activeTracks.map((t) => t.title);
  const sideColor = currentSide === "A" ? "#c0524a" : "#4a80c0";

  const tapePosition = useMemo(() => {
    if (currentItemIdx < 0) return 0;
    const beforeMs = activeItems
      .slice(0, currentItemIdx)
      .reduce((s, it) => s + it.duration, 0);
    return beforeMs + position;
  }, [activeItems, currentItemIdx, position]);

  return (
    <View style={[styles.screen, { paddingTop: topPad, paddingBottom: bottomPad }]}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/library")} style={styles.btn} activeOpacity={0.7}>
          <Icon name="list" size={22} color={colors.light.foreground} />
        </TouchableOpacity>
        <View style={[styles.sidePill, { borderColor: sideColor }]}>
          <Text style={[styles.sidePillText, { color: sideColor }]}>SIDE {currentSide}</Text>
        </View>
        <View style={styles.btn} />
      </View>

      {/* Player card */}
      <View style={styles.playerCard}>

        {/* Cassette */}
        <Animated.View style={[styles.cassetteWrapper, animStyle]}>
          <CassetteTape
            isPlaying={isPlaying}
            isTransitioning={isPlayingNoise}
            progress={tapePosition / (30 * 60 * 1000)}
            side={currentSide}
            title={currentTrack?.title ?? ""}
            tracks={trackTitles}
            width={304}
          />
        </Animated.View>

        {/* Track info */}
        <View style={styles.trackInfo}>
          {isPlayingNoise ? (
            <View style={styles.noiseRow}>
              <View style={styles.dot} />
              <Text style={styles.noiseText}>TAPE NOISE</Text>
              <View style={styles.dot} />
            </View>
          ) : (
            <Text style={styles.trackTitle} numberOfLines={2}>
              {currentTrack?.title ?? (hasTracks ? "Tap PLAY to start" : "Open library to add tracks")}
            </Text>
          )}
          <View style={styles.sideRow}>
            <Text style={[styles.sideCount, sideATracks.length > 0 && { color: "#c0524a" }]}>
              {`A: ${sideATracks.length} tracks`}
            </Text>
            <Text style={styles.sideDot}>·</Text>
            <Text style={[styles.sideCount, sideBTracks.length > 0 && { color: "#4a80c0" }]}>
              {`B: ${sideBTracks.length} tracks`}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <ProgressBar tapePosition={tapePosition} />

        {/* Controls */}
        <View style={styles.controls}>
          <ControlButtons
            isPlaying={isPlaying}
            isLoading={isLoading}
            hasTracks={hasTracks}
            onPlayPause={togglePlayPause}
            onFastForward={(s) => seekForward(s)}
            onRewind={(s) => seekBackward(s)}
          />
        </View>

      </View>

      {/* Footer flip */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleFlip}
          style={styles.flipBtn}
          activeOpacity={0.8}
          disabled={isPlayingNoise}
        >
          <Icon name="refresh-cw" size={13} color={colors.light.foreground} />
          <Text style={styles.flipText}>FLIP TO SIDE {currentSide === "A" ? "B" : "A"}</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.light.background,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  btn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  sidePill: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 5,
  },
  sidePillText: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 2.5 },

  playerCard: {
    marginHorizontal: 16,
    backgroundColor: colors.light.card,
    borderRadius: 28,
    paddingTop: 20,
    paddingBottom: 24,
    shadowColor: "#8a7a60",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
  },

  cassetteWrapper: {
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },

  trackInfo: {
    paddingHorizontal: 28,
    alignItems: "center",
    gap: 5,
    marginBottom: 16,
    minHeight: 46,
    justifyContent: "center",
  },
  trackTitle: {
    color: colors.light.foreground,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  noiseRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  noiseText: {
    color: colors.light.mutedForeground,
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 3,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.light.primary,
    opacity: 0.6,
  },
  sideRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sideCount: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: colors.light.mutedForeground,
    letterSpacing: 0.5,
  },
  sideDot: { color: colors.light.mutedForeground, fontSize: 11 },

  controls: { marginTop: 20 },

  footer: { alignItems: "center", paddingVertical: 16 },
  flipBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: colors.light.card,
    borderWidth: 1,
    borderColor: colors.light.border,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: "#8a7a60",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  flipText: {
    color: colors.light.foreground,
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
});
