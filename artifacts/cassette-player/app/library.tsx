import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useAudioPlayerContext } from "@/contexts/AudioPlayerContext";
import { Track } from "@/hooks/useAudioPlayer";
import colors from "@/constants/colors";

function formatDuration(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

interface TrackItemProps {
  track: Track;
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  onPress: () => void;
}

function TrackItem({ track, index, isActive, isPlaying, onPress }: TrackItemProps) {
  return (
    <TouchableOpacity
      style={[styles.trackItem, isActive && styles.activeTrack]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.trackNum, isActive && styles.activeTrackNum]}>
        {isActive && isPlaying ? (
          <Feather name="volume-2" size={14} color={colors.light.cassetteDark} />
        ) : (
          <Text style={[styles.trackNumText, isActive && styles.activeTrackNumText]}>
            {(index + 1).toString().padStart(2, "0")}
          </Text>
        )}
      </View>
      <View style={styles.trackDetails}>
        <Text
          style={[styles.trackTitle, isActive && styles.activeTrackTitle]}
          numberOfLines={1}
        >
          {track.title}
        </Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {track.artist}
        </Text>
      </View>
      <Text style={styles.trackDuration}>{formatDuration(track.duration)}</Text>
    </TouchableOpacity>
  );
}

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState<string>("");
  const {
    tracks,
    currentIndex,
    isPlaying,
    playTrack,
    hasPermission,
    permissionDenied,
    requestPermission,
  } = useAudioPlayerContext();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const filteredTracks = search.trim()
    ? tracks.filter(
        (t) =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.artist.toLowerCase().includes(search.toLowerCase())
      )
    : tracks;

  const handleTrackPress = (index: number) => {
    const realIndex = tracks.indexOf(filteredTracks[index]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    playTrack(realIndex);
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color={colors.light.cassetteBeige} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LIBRARY</Text>
        <View style={styles.backBtn} />
      </View>

      {permissionDenied ? (
        <View style={styles.emptyContainer}>
          <Feather name="lock" size={48} color={colors.light.mutedForeground} />
          <Text style={styles.emptyTitle}>Permission Required</Text>
          <Text style={styles.emptyText}>
            Allow access to your music library to browse and play songs.
          </Text>
          <TouchableOpacity
            style={styles.permBtn}
            onPress={requestPermission}
            activeOpacity={0.8}
          >
            <Text style={styles.permBtnText}>Grant Access</Text>
          </TouchableOpacity>
        </View>
      ) : hasPermission === false ? (
        <View style={styles.emptyContainer}>
          <Feather name="music" size={48} color={colors.light.mutedForeground} />
          <Text style={styles.emptyTitle}>Music Not Supported</Text>
          <Text style={styles.emptyText}>
            Local music library is not available on this platform.
          </Text>
        </View>
      ) : tracks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="inbox" size={48} color={colors.light.mutedForeground} />
          <Text style={styles.emptyTitle}>No Music Found</Text>
          <Text style={styles.emptyText}>
            Add music files to your device to see them here.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.searchContainer}>
            <Feather name="search" size={16} color={colors.light.mutedForeground} />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search songs..."
              placeholderTextColor={colors.light.mutedForeground}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")} activeOpacity={0.7}>
                <Feather name="x" size={16} color={colors.light.mutedForeground} />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.countText}>
            {filteredTracks.length} tracks
          </Text>

          <FlatList
            data={filteredTracks}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => {
              const realIndex = tracks.indexOf(item);
              return (
                <TrackItem
                  track={item}
                  index={realIndex}
                  isActive={realIndex === currentIndex}
                  isPlaying={isPlaying}
                  onPress={() => handleTrackPress(index)}
                />
              );
            }}
            contentContainerStyle={{ paddingBottom: bottomPad + 16 }}
            showsVerticalScrollIndicator={false}
            scrollEnabled={filteredTracks.length > 0}
          />
        </>
      )}
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
  backBtn: {
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: colors.light.secondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  searchInput: {
    flex: 1,
    color: colors.light.cassetteCream,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
  countText: {
    color: colors.light.mutedForeground,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  trackItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
    gap: 12,
  },
  activeTrack: {
    backgroundColor: colors.light.secondary,
  },
  trackNum: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.light.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  activeTrackNum: {
    backgroundColor: colors.light.cassetteBeige,
    borderColor: colors.light.cassetteLabelBorder,
  },
  trackNumText: {
    color: colors.light.mutedForeground,
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  activeTrackNumText: {
    color: colors.light.cassetteDark,
  },
  trackDetails: {
    flex: 1,
    gap: 3,
  },
  trackTitle: {
    color: colors.light.cassetteCream,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.2,
  },
  activeTrackTitle: {
    color: colors.light.cassetteBeige,
    fontFamily: "Inter_700Bold",
  },
  trackArtist: {
    color: colors.light.mutedForeground,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  trackDuration: {
    color: colors.light.mutedForeground,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyTitle: {
    color: colors.light.cassetteCream,
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  emptyText: {
    color: colors.light.mutedForeground,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  permBtn: {
    marginTop: 8,
    backgroundColor: colors.light.cassetteBeige,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permBtnText: {
    color: colors.light.cassetteDark,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});
