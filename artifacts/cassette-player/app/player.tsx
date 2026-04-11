import React, { useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Platform,
} from "react-native";
import Animated, {
  useSharedValue, withSequence, withTiming, useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Svg, Defs, Pattern, Rect } from "react-native-svg";
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
    sideA, sideB, currentSide, currentTrack,
    isPlaying, isLoading, isPlayingNoise, tapePosition,
    togglePlayPause,
    seekForward, seekBackward, startFastForward, stopFastForward, flipSide,
  } = useAudioPlayerContext();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const scaleX = useSharedValue(1);

  const handleFlip = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const currentTapePos = tapePosition;
    scaleX.value = withSequence(
      withTiming(0, { duration: 180 }),
      withTiming(1, { duration: 180 })
    );
    setTimeout(() => flipSide(currentTapePos), 180);
  }, [flipSide, tapePosition]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: scaleX.value }] }));

  const sideATracks = sideA.filter((it): it is TrackItem => it.type === "track");
  const sideBTracks = sideB.filter((it): it is TrackItem => it.type === "track");
  const activeTracks = currentSide === "A" ? sideATracks : sideBTracks;
  const hasTracks = activeTracks.length > 0;
  const trackTitles = activeTracks.map((t) => t.title);
  const sideColor = currentSide === "A" ? "#c0524a" : "#4a80c0";

  return (
    <View style={[styles.outerBg, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      {/* 종이 질감 grain 오버레이 */}
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <Pattern id="grain" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
            <Rect width="4" height="4" fill="transparent" />
            <Rect x="0" y="0" width="1" height="1" fill="rgba(120,80,20,0.05)" />
            <Rect x="2" y="2" width="1" height="1" fill="rgba(120,80,20,0.03)" />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#grain)" />
      </Svg>

      <View style={styles.safeWrap}>
        <View style={styles.card}>

          {/* ── 헤더 ── */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.push("/library")} style={styles.headerBtn} activeOpacity={0.7}>
              <Icon name="list" size={22} color={colors.light.flipBtnText} />
            </TouchableOpacity>
            <View style={[styles.sidePill, { borderColor: sideColor }]}>
              <Text style={[styles.sidePillText, { color: sideColor }]}>SIDE {currentSide}</Text>
            </View>
            <TouchableOpacity onPress={handleFlip} style={styles.headerBtn} activeOpacity={0.7} disabled={isPlayingNoise}>
              <Icon name="refresh-cw" size={20}
                color={isPlayingNoise ? colors.light.btnFlatBorder : colors.light.flipBtnText} />
            </TouchableOpacity>
          </View>

          {/* ── 카세트 ── */}
          <View style={styles.cassetteWrapper}>
            <Animated.View style={animStyle}>
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
          </View>

          {/* ── 컨트롤 버튼 ── */}
          <View style={styles.controls}>
            <ControlButtons
              isPlaying={isPlaying}
              isLoading={isLoading}
              hasTracks={hasTracks}
              onPlayPause={togglePlayPause}
              onFastForward={(s) => seekForward(s)}
              onRewind={(s) => seekBackward(s)}
              onFFStart={startFastForward}
              onFFStop={stopFastForward}
            />
          </View>

          {/* ── 트랙 정보 + 진행바 ── */}
          <View style={styles.progressSection}>
            <ProgressBar
              tapePosition={tapePosition}
              trackTitle={currentTrack?.title ?? (hasTracks ? "" : "라이브러리에서 트랙을 추가하세요")}
            />
          </View>

          {/* ── 플립 버튼 ── */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={handleFlip} style={styles.flipBtn} activeOpacity={0.8} disabled={isPlayingNoise}>
              <Icon name="refresh-cw" size={13} color={colors.light.flipBtnText} />
              <Text style={styles.flipBtnText}>Flip to Side {currentSide === "A" ? "B" : "A"}</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerBg: {
    flex: 1,
    backgroundColor: colors.light.playerBg,
    justifyContent: "center",
  },
  safeWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  card: {
    width: "100%",
    backgroundColor: colors.light.playerCard,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.light.playerCardBorder,
    paddingTop: 12,
    paddingBottom: 20,
    elevation: 8,
    shadowColor: "rgba(80,40,10,0.2)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerBtn: {
    width: 44, height: 44, alignItems: "center", justifyContent: "center",
  },
  sidePill: {
    borderWidth: 1.5, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 4,
  },
  sidePillText: {
    fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 2,
  },
  cassetteWrapper: {
    alignItems: "center",
    paddingVertical: 8,
  },
  controls: {
    marginTop: 10,
    marginBottom: 8,
  },
  progressSection: {
    paddingHorizontal: 28,
    marginTop: 8,
    marginBottom: 12,
  },
  footer: {
    alignItems: "center",
    paddingTop: 4,
  },
  flipBtn: {
    flexDirection: "row", alignItems: "center", gap: 7,
    backgroundColor: colors.light.flipBtnBg,
    borderWidth: 1, borderColor: colors.light.flipBtnBorder,
    paddingHorizontal: 22, paddingVertical: 9,
    borderRadius: 22,
  },
  flipBtnText: {
    color: colors.light.flipBtnText,
    fontSize: 12, fontFamily: "Inter_700Bold", letterSpacing: 1.5,
  },
});
