import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
  ScrollView,
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
        <Text style={styles.trackMeta} numberOfLines={1}>
          {track.album}
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
  const [showFolders, setShowFolders] = useState<boolean>(false);
  const {
    tracks,
    folders,
    selectedFolderId,
    currentIndex,
    isPlaying,
    playTrack,
    hasPermission,
    permissionDenied,
    requestPermission,
    selectFolder,
  } = useAudioPlayerContext();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const filteredTracks = search.trim()
    ? tracks.filter(
        (t) =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.album.toLowerCase().includes(search.toLowerCase())
      )
    : tracks;

  const handleTrackPress = (filteredIndex: number) => {
    const track = filteredTracks[filteredIndex];
    const realIndex = tracks.findIndex((t) => t.id === track.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    playTrack(realIndex);
    router.back();
  };

  const handleFolderSelect = (folderId: string | null) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    selectFolder(folderId);
    setShowFolders(false);
    setSearch("");
  };

  const selectedFolder = folders.find((f) => f.id === selectedFolderId);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconBtn}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color={colors.light.cassetteBeige} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LIBRARY</Text>
        <TouchableOpacity
          onPress={() => setShowFolders(!showFolders)}
          style={styles.iconBtn}
          activeOpacity={0.7}
        >
          <Feather
            name="folder"
            size={20}
            color={selectedFolderId ? colors.light.cassetteBeige : colors.light.mutedForeground}
          />
        </TouchableOpacity>
      </View>

      {permissionDenied ? (
        <View style={styles.emptyContainer}>
          <Feather name="lock" size={48} color={colors.light.mutedForeground} />
          <Text style={styles.emptyTitle}>Permission Required</Text>
          <Text style={styles.emptyText}>
            Allow access to your music library to browse and play songs.
          </Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission} activeOpacity={0.8}>
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
      ) : (
        <>
          {showFolders && folders.length > 0 && (
            <View style={styles.folderPanel}>
              <Text style={styles.folderPanelTitle}>SELECT FOLDER</Text>
              <ScrollView
                style={styles.folderScroll}
                showsVerticalScrollIndicator={false}
              >
                <TouchableOpacity
                  style={[styles.folderItem, !selectedFolderId && styles.activeFolderItem]}
                  onPress={() => handleFolderSelect(null)}
                  activeOpacity={0.7}
                >
                  <Feather
                    name="music"
                    size={16}
                    color={!selectedFolderId ? colors.light.cassetteDark : colors.light.cassetteBeige}
                  />
                  <Text
                    style={[styles.folderName, !selectedFolderId && styles.activeFolderName]}
                    numberOfLines={1}
                  >
                    All Music
                  </Text>
                  <Text style={[styles.folderCount, !selectedFolderId && styles.activeFolderCount]}>
                    {tracks.length + (selectedFolderId ? 0 : 0)}
                  </Text>
                </TouchableOpacity>
                {folders.map((folder) => (
                  <TouchableOpacity
                    key={folder.id}
                    style={[
                      styles.folderItem,
                      selectedFolderId === folder.id && styles.activeFolderItem,
                    ]}
                    onPress={() => handleFolderSelect(folder.id)}
                    activeOpacity={0.7}
                  >
                    <Feather
                      name="folder"
                      size={16}
                      color={
                        selectedFolderId === folder.id
                          ? colors.light.cassetteDark
                          : colors.light.cassetteBeige
                      }
                    />
                    <Text
                      style={[
                        styles.folderName,
                        selectedFolderId === folder.id && styles.activeFolderName,
                      ]}
                      numberOfLines={1}
                    >
                      {folder.title}
                    </Text>
                    <Text
                      style={[
                        styles.folderCount,
                        selectedFolderId === folder.id && styles.activeFolderCount,
                      ]}
                    >
                      {folder.trackCount}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {selectedFolder && (
            <View style={styles.folderBadge}>
              <Feather name="folder" size={13} color={colors.light.cassetteDark} />
              <Text style={styles.folderBadgeText} numberOfLines={1}>
                {selectedFolder.title}
              </Text>
              <TouchableOpacity
                onPress={() => handleFolderSelect(null)}
                activeOpacity={0.7}
              >
                <Feather name="x" size={13} color={colors.light.cassetteDark} />
              </TouchableOpacity>
            </View>
          )}

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

          <Text style={styles.countText}>{filteredTracks.length} tracks</Text>

          {filteredTracks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="inbox" size={48} color={colors.light.mutedForeground} />
              <Text style={styles.emptyTitle}>No Music Found</Text>
              <Text style={styles.emptyText}>
                {search ? "No tracks match your search." : "Add music files to your device."}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredTracks}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => {
                const realIndex = tracks.findIndex((t) => t.id === item.id);
                return (
                  <TrackItem
                    track={item}
                    index={index}
                    isActive={realIndex === currentIndex}
                    isPlaying={isPlaying}
                    onPress={() => handleTrackPress(index)}
                  />
                );
              }}
              contentContainerStyle={{ paddingBottom: bottomPad + 16 }}
              showsVerticalScrollIndicator={false}
            />
          )}
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
  iconBtn: {
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
  folderPanel: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: colors.light.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.light.border,
    maxHeight: 220,
    padding: 8,
  },
  folderPanelTitle: {
    color: colors.light.mutedForeground,
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
    paddingHorizontal: 8,
    paddingBottom: 6,
  },
  folderScroll: {
    flexGrow: 0,
  },
  folderItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 6,
  },
  activeFolderItem: {
    backgroundColor: colors.light.cassetteBeige,
  },
  folderName: {
    flex: 1,
    color: colors.light.cassetteCream,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  activeFolderName: {
    color: colors.light.cassetteDark,
    fontFamily: "Inter_700Bold",
  },
  folderCount: {
    color: colors.light.mutedForeground,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  activeFolderCount: {
    color: colors.light.cassetteAccent,
    fontFamily: "Inter_600SemiBold",
  },
  folderBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: colors.light.cassetteBeige,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  folderBadgeText: {
    color: colors.light.cassetteDark,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    maxWidth: 200,
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
  trackMeta: {
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
