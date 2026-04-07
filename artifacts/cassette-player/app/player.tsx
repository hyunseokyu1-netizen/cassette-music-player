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

  const tapePosition = useMemo(() => {
    if (currentItemIdx < 0) return 0;
    const beforeMs = activeItems
      .slice(0, currentItemIdx)
      .reduce((s, it) => s + it.duration, 0);
    return beforeMs + position;
  }, [activeItems, currentItemIdx, position]);

  const trackIdx = activeTracks.findIndex((t) => t.id === currentTrack?.id);
  const trackLabel = hasTracks
    ? `${trackIdx >= 0 ? trackIdx + 1 : "—"} / ${activeTracks.length}`
    : "";

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/library")} style={styles.btn} activeOpacity={0.7}>
          <Icon name="list" size={22} color={colors.light.mutedForeground} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerLabel}>CASSETTE PLAYER</Text>
        </View>
        <TouchableOpacity onPress={handleFlip} style={styles.btn} activeOpacity={0.7} disabled={isPlayingNoise}>
          <Icon name="settings" size={20} color={isPlayingNoise ? colors.light.border : colors.light.mutedForeground} />
        </TouchableOpacity>
      </View>

      <View style={styles.cassetteWrapper}>
        <Animated.View style={animStyle}>
          <CassetteTape
            isPlaying={isPlaying}
            isTransitioning={isPlayingNoise}
            progress={tapePosition / (30 * 60 * 1000)}
            side={currentSide}
            title={currentTrack?.title ?? ""}
            tracks={trackTitles}
            width={310}
          />
        </Animated.View>
      </View>

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

      <View style={styles.trackInfo}>
        {isPlayingNoise ? (
          <View style={styles.noiseRow}>
            <View style={styles.dot} />
            <Text style={styles.noiseText}>TAPE NOISE</Text>
            <View style={styles.dot} />
          </View>
        ) : (
          <>
            <Text style={styles.trackTitle} numberOfLines={1}>
              {currentTrack?.title ?? (hasTracks ? "Tap PLAY to start" : "Open library to add tracks")}
            </Text>
            {hasTracks && currentTrack && (
              <View style={styles.trackMeta}>
                <Text style={styles.trackPos}>
                  {`${Math.floor(position / 60000)}:${String(Math.floor((position % 60000) / 1000)).padStart(2, "0")}`}
                </Text>
                <Text style={styles.trackMetaSep}>{trackLabel}</Text>
                <Text style={styles.trackDur}>
                  {`${Math.floor(currentTrack.duration / 60000)}:${String(Math.floor((currentTrack.duration % 60000) / 1000)).padStart(2, "0")}`}
                </Text>
              </View>
            )}
          </>
        )}
      </View>

      <ProgressBar tapePosition={tapePosition} />

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleFlip}
          style={[styles.flipBtn, isPlayingNoise && styles.flipBtnDisabled]}
          activeOpacity={0.8}
          disabled={isPlayingNoise}
        >
          <Icon name="refresh-cw" size={14} color={isPlayingNoise ? colors.light.mutedForeground : "#fff"} />
          <Text style={[styles.flipText, isPlayingNoise && styles.flipTextDisabled]}>
            Flip to {currentSide === "A" ? "B" : "A"} Side
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  btn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerLabel: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: colors.light.mutedForeground,
    letterSpacing: 2.5,
  },
  cassetteWrapper: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  controls: {
    paddingVertical: 20,
  },
  trackInfo: {
    paddingHorizontal: 28,
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
    minHeight: 56,
    justifyContent: "center",
  },
  trackTitle: {
    color: colors.light.text,
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    letterSpacing: 0.2,
  },
  trackMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  trackPos: {
    color: colors.light.mutedForeground,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
  },
  trackMetaSep: {
    color: colors.light.border,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  trackDur: {
    color: colors.light.mutedForeground,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
  },
  noiseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  noiseText: {
    color: colors.light.mutedForeground,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 3,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.light.primary,
    opacity: 0.7,
  },
  footer: {
    alignItems: "center",
    paddingTop: 20,
  },
  flipBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.light.primary,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 30,
    shadowColor: colors.light.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  flipBtnDisabled: {
    backgroundColor: colors.light.secondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  flipText: {
    color: "#ffffff",
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  flipTextDisabled: {
    color: colors.light.mutedForeground,
  },
});
