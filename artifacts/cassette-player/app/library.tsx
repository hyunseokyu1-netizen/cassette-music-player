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
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useAudioPlayerContext } from "@/contexts/AudioPlayerContext";
import { Track } from "@/hooks/useAudioPlayer";
import colors from "@/constants/colors";

function formatDuration(seconds: number): string {
  if (!seconds) return "--:--";
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

interface TrackItemProps {
  track: Track;
  displayIndex: number;
  isActive: boolean;
  isPlaying: boolean;
  onPress: () => void;
  onRemove: () => void;
}

function TrackItem({ track, displayIndex, isActive, isPlaying, onPress, onRemove }: TrackItemProps) {
  return (
    <TouchableOpacity
      style={[styles.trackItem, isActive && styles.activeTrack]}
      onPress={onPress}
      onLongPress={onRemove}
      activeOpacity={0.7}
      delayLongPress={600}
    >
      <View style={[styles.trackNum, isActive && styles.activeTrackNum]}>
        {isActive && isPlaying ? (
          <Feather name="volume-2" size={14} color={colors.light.cassetteDark} />
        ) : (
          <Text style={[styles.trackNumText, isActive && styles.activeTrackNumText]}>
            {(displayIndex + 1).toString().padStart(2, "0")}
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
          {track.folderName}
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
    allTracks,
    folders,
    selectedFolderId,
    currentIndex,
    isPlaying,
    isAdding,
    playTrack,
    addFiles,
    removeTrack,
    clearAll,
    selectFolder,
  } = useAudioPlayerContext();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const filteredTracks = search.trim()
    ? tracks.filter(
        (t) =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.folderName.toLowerCase().includes(search.toLowerCase())
      )
    : tracks;

  const handleTrackPress = (filteredIndex: number) => {
    const track = filteredTracks[filteredIndex];
    const realIndex = tracks.findIndex((t) => t.id === track.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    playTrack(realIndex);
    router.back();
  };

  const handleRemove = (track: Track) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Remove Track", `Remove "${track.title}" from library?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeTrack(track.id),
      },
    ]);
  };

  const handleClearAll = () => {
    Alert.alert("Clear Library", "Remove all tracks?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear All", style: "destructive", onPress: clearAll },
    ]);
  };

  const handleFolderSelect = (folderId: string | null) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    selectFolder(folderId);
    setShowFolders(false);
    setSearch("");
  };

  const handleAddFiles = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await addFiles();
  };

  const selectedFolder = folders.find((f) => f.id === selectedFolderId);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={colors.light.cassetteBeige} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LIBRARY</Text>
        <View style={styles.headerRight}>
          {folders.length > 0 && (
            <TouchableOpacity
              onPress={() => setShowFolders(!showFolders)}
              style={styles.iconBtn}
              activeOpacity={0.7}
            >
              <Feather
                name="folder"
                size={19}
                color={selectedFolderId ? colors.light.cassetteBeige : colors.light.mutedForeground}
              />
            </TouchableOpacity>
          )}
          {allTracks.length > 0 && (
            <TouchableOpacity onPress={handleClearAll} style={styles.iconBtn} activeOpacity={0.7}>
              <Feather name="trash-2" size={19} color={colors.light.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showFolders && folders.length > 0 && (
        <View style={styles.folderPanel}>
          <Text style={styles.folderPanelTitle}>SELECT FOLDER</Text>
          <ScrollView style={styles.folderScroll} showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.folderItem, !selectedFolderId && styles.activeFolderItem]}
              onPress={() => handleFolderSelect(null)}
              activeOpacity={0.7}
            >
              <Feather
                name="music"
                size={15}
                color={!selectedFolderId ? colors.light.cassetteDark : colors.light.cassetteBeige}
              />
              <Text
                style={[styles.folderName, !selectedFolderId && styles.activeFolderName]}
                numberOfLines={1}
              >
                All Music
              </Text>
              <Text style={[styles.folderCount, !selectedFolderId && styles.activeFolderCount]}>
                {allTracks.length}
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
                  size={15}
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
          <Feather name="folder" size={12} color={colors.light.cassetteDark} />
          <Text style={styles.folderBadgeText} numberOfLines={1}>
            {selectedFolder.title}
          </Text>
          <TouchableOpacity onPress={() => handleFolderSelect(null)} activeOpacity={0.7}>
            <Feather name="x" size={12} color={colors.light.cassetteDark} />
          </TouchableOpacity>
        </View>
      )}

      {allTracks.length > 0 && (
        <View style={styles.searchContainer}>
          <Feather name="search" size={15} color={colors.light.mutedForeground} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search songs..."
            placeholderTextColor={colors.light.mutedForeground}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")} activeOpacity={0.7}>
              <Feather name="x" size={15} color={colors.light.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {allTracks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="music" size={52} color={colors.light.mutedForeground} />
          <Text style={styles.emptyTitle}>No Music Yet</Text>
          <Text style={styles.emptyText}>
            Tap the button below to pick audio files from your device.
          </Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={handleAddFiles}
            disabled={isAdding}
            activeOpacity={0.8}
          >
            {isAdding ? (
              <ActivityIndicator color={colors.light.cassetteDark} size="small" />
            ) : (
              <>
                <Feather name="plus" size={18} color={colors.light.cassetteDark} />
                <Text style={styles.addBtnText}>Add Music Files</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.listHeader}>
            <Text style={styles.countText}>{filteredTracks.length} tracks</Text>
            <TouchableOpacity
              style={styles.addBtnSmall}
              onPress={handleAddFiles}
              disabled={isAdding}
              activeOpacity={0.8}
            >
              {isAdding ? (
                <ActivityIndicator color={colors.light.cassetteDark} size="small" />
              ) : (
                <>
                  <Feather name="plus" size={14} color={colors.light.cassetteDark} />
                  <Text style={styles.addBtnSmallText}>Add Files</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <FlatList
            data={filteredTracks}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => {
              const realIndex = tracks.findIndex((t) => t.id === item.id);
              return (
                <TrackItem
                  track={item}
                  displayIndex={index}
                  isActive={realIndex === currentIndex}
                  isPlaying={isPlaying}
                  onPress={() => handleTrackPress(index)}
                  onRemove={() => handleRemove(item)}
                />
              );
            }}
            contentContainerStyle={{ paddingBottom: bottomPad + 16 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No Results</Text>
                <Text style={styles.emptyText}>No tracks match your search.</Text>
              </View>
            }
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: colors.light.mutedForeground,
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 3,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  folderPanel: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: colors.light.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.light.border,
    maxHeight: 200,
    padding: 6,
  },
  folderPanelTitle: {
    color: colors.light.mutedForeground,
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  folderScroll: { flexGrow: 0 },
  folderItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
  },
  activeFolderItem: { backgroundColor: colors.light.cassetteBeige },
  folderName: {
    flex: 1,
    color: colors.light.cassetteCream,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  activeFolderName: { color: colors.light.cassetteDark, fontFamily: "Inter_700Bold" },
  folderCount: { color: colors.light.mutedForeground, fontSize: 12 },
  activeFolderCount: { color: colors.light.cassetteAccent, fontFamily: "Inter_600SemiBold" },
  folderBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: colors.light.cassetteBeige,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
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
    marginBottom: 4,
    backgroundColor: colors.light.secondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
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
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  countText: {
    color: colors.light.mutedForeground,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.5,
  },
  addBtnSmall: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.light.cassetteBeige,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 36,
    justifyContent: "center",
  },
  addBtnSmallText: {
    color: colors.light.cassetteDark,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
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
  activeTrack: { backgroundColor: colors.light.secondary },
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
  trackNumText: { color: colors.light.mutedForeground, fontSize: 11, fontFamily: "Inter_500Medium" },
  activeTrackNumText: { color: colors.light.cassetteDark },
  trackDetails: { flex: 1, gap: 3 },
  trackTitle: {
    color: colors.light.cassetteCream,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.2,
  },
  activeTrackTitle: { color: colors.light.cassetteBeige, fontFamily: "Inter_700Bold" },
  trackMeta: { color: colors.light.mutedForeground, fontSize: 12, fontFamily: "Inter_400Regular" },
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
    paddingVertical: 60,
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
  addBtn: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.light.cassetteBeige,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 8,
    minWidth: 48,
    justifyContent: "center",
  },
  addBtnText: {
    color: colors.light.cassetteDark,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});
