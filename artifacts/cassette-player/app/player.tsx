import React, { useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Platform,
} from "react-native";
import Animated, {
  useSharedValue, withSequence, withTiming, useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { CassetteTape } from "@/components/CassetteTape";
import { ControlButtons } from "@/components/ControlButtons";
import { ProgressBar } from "@/components/ProgressBar";
import { useAudioPlayerContext } from "@/contexts/AudioPlayerContext";
import colors from "@/constants/colors";

export default function PlayerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    sideA, sideB, currentSide, currentTrack,
    isPlaying, isLoading, isTransitioning, progress,
    position, duration,
    togglePlayPause, playNext, playPrevious, seekForward, seekBackward, flipSide,
  } = useAudioPlayerContext();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const cassetteScaleX = useSharedValue(1);

  const handleFlip = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    cassetteScaleX.value = withSequence(
      withTiming(0, { duration: 180 }),
      withTiming(1, { duration: 180 })
    );
    setTimeout(() => {
      flipSide();
    }, 180);
  }, [flipSide]);

  const cassetteAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: cassetteScaleX.value }],
  }));

  const activeTracks = currentSide === "A" ? sideA : sideB;
  const trackTitles = activeTracks.map((t) => t.title);
  const hasTracksCurrent = activeTracks.length > 0;
  const sideA_count = sideA.length;
  const sideB_count = sideB.length;

  const sideColor = currentSide === "A" ? "#c0524a" : "#4a80c0";

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/library")}
          style={styles.headerBtn} activeOpacity={0.7}
        >
          <Feather name="list" size={21} color={colors.light.cassetteBeige} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={[styles.sidePill, { borderColor: sideColor }]}>
            <Text style={[styles.sidePillText, { color: sideColor }]}>
              SIDE {currentSide}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleFlip}
          style={styles.headerBtn} activeOpacity={0.7}
          disabled={isTransitioning}
        >
          <Feather
            name="refresh-cw"
            size={20}
            color={isTransitioning ? colors.light.mutedForeground : colors.light.cassetteBeige}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.cassetteWrapper}>
        <Animated.View style={cassetteAnimStyle}>
          <CassetteTape
            isPlaying={isPlaying}
            isTransitioning={isTransitioning}
            progress={progress}
            side={currentSide}
            title={currentTrack?.title ?? ""}
            tracks={trackTitles}
            width={304}
          />
        </Animated.View>
      </View>

      <View style={styles.trackInfo}>
        {isTransitioning ? (
          <View style={styles.transitionRow}>
            <View style={styles.noiseDot} />
            <Text style={styles.transitionText}>TAPE NOISE</Text>
            <View style={styles.noiseDot} />
          </View>
        ) : (
          <Text style={styles.trackTitle} numberOfLines={2}>
            {currentTrack?.title ?? (hasTracksCurrent ? "Tap play to start" : "Open library to add tracks")}
          </Text>
        )}
        <View style={styles.sideRow}>
          <Text style={[styles.sideCount, sideA_count > 0 && { color: "#c0524a" }]}>
            {`A: ${sideA_count}/6`}
          </Text>
          <Text style={styles.sideDivider}>·</Text>
          <Text style={[styles.sideCount, sideB_count > 0 && { color: "#4a80c0" }]}>
            {`B: ${sideB_count}/6`}
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <ProgressBar position={position} duration={duration} progress={progress} />
      </View>

      <View style={styles.controlsContainer}>
        <ControlButtons
          isPlaying={isPlaying}
          isLoading={isLoading || isTransitioning}
          hasTracks={hasTracksCurrent}
          onPlayPause={togglePlayPause}
          onNext={playNext}
          onPrevious={playPrevious}
          onFastForward={seekForward}
          onRewind={seekBackward}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleFlip}
          style={styles.flipButton}
          activeOpacity={0.8}
          disabled={isTransitioning}
        >
          <Feather name="refresh-cw" size={14} color={colors.light.cassetteDark} />
          <Text style={styles.flipText}>FLIP TO SIDE {currentSide === "A" ? "B" : "A"}</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    alignItems: "center",
  },
  sidePill: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  sidePillText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  cassetteWrapper: {
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  trackInfo: {
    paddingHorizontal: 28,
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
    minHeight: 52,
    justifyContent: "center",
  },
  trackTitle: {
    color: colors.light.cassetteCream,
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    letterSpacing: 0.4,
  },
  transitionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  transitionText: {
    color: colors.light.cassetteBeige,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 3,
  },
  noiseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.light.cassetteBeige,
    opacity: 0.7,
  },
  sideRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sideCount: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: colors.light.mutedForeground,
    letterSpacing: 0.5,
  },
  sideDivider: {
    color: colors.light.mutedForeground,
    fontSize: 12,
  },
  progressContainer: {
    marginBottom: 20,
  },
  controlsContainer: {
    marginBottom: 16,
  },
  footer: {
    alignItems: "center",
  },
  flipButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: colors.light.cassetteBeige,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  flipText: {
    color: colors.light.cassetteDark,
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
});
