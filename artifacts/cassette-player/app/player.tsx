import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { CassetteTape } from "@/components/CassetteTape";
import { ControlButtons } from "@/components/ControlButtons";
import { ProgressBar } from "@/components/ProgressBar";
import { useAudioPlayerContext } from "@/contexts/AudioPlayerContext";
import colors from "@/constants/colors";

export default function PlayerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    currentTrack,
    isPlaying,
    isLoading,
    progress,
    position,
    duration,
    tracks,
    togglePlayPause,
    playNext,
    playPrevious,
    seekForward,
    seekBackward,
  } = useAudioPlayerContext();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/library")}
          style={styles.headerBtn}
          activeOpacity={0.7}
        >
          <Feather name="list" size={22} color={colors.light.cassetteBeige} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NOW PLAYING</Text>
        <View style={styles.headerBtn} />
      </View>

      <View style={styles.cassetteContainer}>
        <CassetteTape
          isPlaying={isPlaying}
          progress={progress}
          title={currentTrack?.title ?? "No Track"}
          artist={currentTrack?.folderName ?? "Open Library to add songs"}
          width={300}
        />
      </View>

      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={2}>
          {currentTrack?.title ?? "No Track Selected"}
        </Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {currentTrack?.folderName ?? "Open Library to add music files"}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <ProgressBar position={position} duration={duration} progress={progress} />
      </View>

      <View style={styles.controlsContainer}>
        <ControlButtons
          isPlaying={isPlaying}
          isLoading={isLoading}
          hasTracks={tracks.length > 0}
          onPlayPause={togglePlayPause}
          onNext={playNext}
          onPrevious={playPrevious}
          onFastForward={seekForward}
          onRewind={seekBackward}
        />
      </View>

      <View style={styles.footer}>
        <View style={styles.reel}>
          <View style={[styles.reelDot, { opacity: isPlaying ? 1 : 0.3 }]} />
          <Text style={styles.reelText}>{isPlaying ? "PLAYING" : "PAUSED"}</Text>
          <View style={[styles.reelDot, { opacity: isPlaying ? 1 : 0.3 }]} />
        </View>
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
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: colors.light.mutedForeground,
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 3,
  },
  cassetteContainer: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  trackInfo: {
    paddingHorizontal: 28,
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },
  trackTitle: {
    color: colors.light.cassetteCream,
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  trackArtist: {
    color: colors.light.mutedForeground,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  progressContainer: {
    marginBottom: 24,
  },
  controlsContainer: {
    marginBottom: 20,
  },
  footer: {
    alignItems: "center",
    paddingBottom: 8,
  },
  reel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.light.cassetteBeige,
  },
  reelText: {
    color: colors.light.mutedForeground,
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 3,
  },
});
