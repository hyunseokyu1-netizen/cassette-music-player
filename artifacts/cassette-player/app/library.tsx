import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Platform,
  ScrollView, Alert, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useAudioPlayerContext } from "@/contexts/AudioPlayerContext";
import { Track, Side } from "@/hooks/useAudioPlayer";
import colors from "@/constants/colors";

const MAX = 6;

function formatDur(s: number): string {
  if (!s) return "--:--";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

interface SlotProps {
  track: Track | null;
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  side: Side;
  onPlay: () => void;
  onRemove: () => void;
  onAdd: () => void;
}

function TrackSlot({ track, index, isActive, isPlaying, side, onPlay, onRemove, onAdd }: SlotProps) {
  const sideColor = side === "A" ? "#9e3c3c" : "#2b5499";
  if (!track) {
    return (
      <TouchableOpacity style={styles.emptySlot} onPress={onAdd} activeOpacity={0.7}>
        <View style={[styles.slotNum, { borderColor: "#3d2010" }]}>
          <Text style={styles.slotNumText}>{(index + 1).toString().padStart(2, "0")}</Text>
        </View>
        <Text style={styles.emptySlotText}>Add track</Text>
        <Feather name="plus" size={18} color={colors.light.border} />
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity
      style={[styles.trackSlot, isActive && { backgroundColor: colors.light.secondary }]}
      onPress={onPlay}
      onLongPress={onRemove}
      activeOpacity={0.7}
      delayLongPress={500}
    >
      <View style={[styles.slotNum, isActive && { backgroundColor: sideColor, borderColor: sideColor }]}>
        {isActive && isPlaying ? (
          <Feather name="volume-2" size={13} color="#fff" />
        ) : (
          <Text style={[styles.slotNumText, isActive && { color: "#fff" }]}>
            {(index + 1).toString().padStart(2, "0")}
          </Text>
        )}
      </View>
      <Text style={[styles.trackName, isActive && { color: colors.light.cassetteBeige }]} numberOfLines={1}>
        {track.title}
      </Text>
      <Text style={styles.trackDur}>{formatDur(track.duration)}</Text>
      <TouchableOpacity onPress={onRemove} style={styles.removeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Feather name="x" size={14} color={colors.light.border} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

interface SidePanelProps {
  side: Side;
  tracks: Track[];
  currentSide: Side;
  currentIndex: number;
  isPlaying: boolean;
  isAdding: boolean;
  onPlay: (i: number) => void;
  onRemove: (i: number) => void;
  onAdd: () => void;
}

function SidePanel({ side, tracks, currentSide, currentIndex, isPlaying, isAdding, onPlay, onRemove, onAdd }: SidePanelProps) {
  const sideColor = side === "A" ? "#9e3c3c" : "#2b5499";
  const slots = Array.from({ length: MAX }, (_, i) => tracks[i] ?? null);
  const filled = tracks.length;

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <View style={[styles.sideBadge, { backgroundColor: sideColor }]}>
          <Text style={styles.sideBadgeText}>SIDE {side}</Text>
        </View>
        <Text style={[styles.panelCount, filled === MAX && { color: colors.light.cassetteBeige }]}>
          {filled}/{MAX} tracks
        </Text>
        {filled < MAX && (
          <TouchableOpacity
            style={[styles.addAllBtn, { borderColor: sideColor }]}
            onPress={onAdd}
            disabled={isAdding}
            activeOpacity={0.8}
          >
            {isAdding ? (
              <ActivityIndicator size="small" color={sideColor} />
            ) : (
              <>
                <Feather name="plus" size={13} color={sideColor} />
                <Text style={[styles.addAllText, { color: sideColor }]}>Add Files</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {slots.map((track, i) => (
        <TrackSlot
          key={i}
          track={track}
          index={i}
          side={side}
          isActive={currentSide === side && currentIndex === i}
          isPlaying={isPlaying}
          onPlay={() => onPlay(i)}
          onRemove={() => onRemove(i)}
          onAdd={onAdd}
        />
      ))}
    </View>
  );
}

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [tab, setTab] = useState<Side>("A");

  const {
    sideA, sideB, currentSide, currentIndex, isPlaying, isAdding,
    playTrack, addToSide, removeFromSide, setSide,
  } = useAudioPlayerContext();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handlePlay = (side: Side, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSide(side);
    playTrack(index);
    router.back();
  };

  const handleRemove = (side: Side, index: number) => {
    const tracks = side === "A" ? sideA : sideB;
    const track = tracks[index];
    if (!track) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Remove Track", `Remove "${track.title}" from Side ${side}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => removeFromSide(side, index) },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={colors.light.cassetteBeige} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LIBRARY</Text>
        <View style={styles.iconBtn} />
      </View>

      <View style={styles.tabs}>
        {(["A", "B"] as Side[]).map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.tab, tab === s && styles.activeTab,
              tab === s && { borderBottomColor: s === "A" ? "#9e3c3c" : "#2b5499" }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTab(s); }}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, tab === s && styles.activeTabText]}>
              SIDE {s}
            </Text>
            <Text style={[styles.tabCount,
              tab === s && { color: s === "A" ? "#c0524a" : "#4a80c0" }]}>
              {(s === "A" ? sideA : sideB).length}/{MAX}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: bottomPad + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {tab === "A" ? (
          <SidePanel
            side="A" tracks={sideA}
            currentSide={currentSide} currentIndex={currentIndex}
            isPlaying={isPlaying} isAdding={isAdding}
            onPlay={(i) => handlePlay("A", i)}
            onRemove={(i) => handleRemove("A", i)}
            onAdd={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); addToSide("A"); }}
          />
        ) : (
          <SidePanel
            side="B" tracks={sideB}
            currentSide={currentSide} currentIndex={currentIndex}
            isPlaying={isPlaying} isAdding={isAdding}
            onPlay={(i) => handlePlay("B", i)}
            onRemove={(i) => handleRemove("B", i)}
            onAdd={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); addToSide("B"); }}
          />
        )}

        <View style={styles.hint}>
          <Feather name="info" size={13} color={colors.light.mutedForeground} />
          <Text style={styles.hintText}>Long press a track to remove it</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 10,
  },
  iconBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerTitle: {
    color: colors.light.mutedForeground, fontSize: 11,
    fontFamily: "Inter_600SemiBold", letterSpacing: 3,
  },
  tabs: {
    flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.light.border,
  },
  tab: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: 12, gap: 8, borderBottomWidth: 2, borderBottomColor: "transparent",
  },
  activeTab: {},
  tabText: {
    fontSize: 12, fontFamily: "Inter_600SemiBold",
    color: colors.light.mutedForeground, letterSpacing: 2,
  },
  activeTabText: { color: colors.light.cassetteCream },
  tabCount: {
    fontSize: 11, fontFamily: "Inter_500Medium",
    color: colors.light.mutedForeground,
  },
  scroll: { flex: 1 },
  panel: { paddingHorizontal: 16, paddingTop: 16 },
  panelHeader: {
    flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12,
  },
  sideBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4,
  },
  sideBadgeText: {
    color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 2,
  },
  panelCount: {
    flex: 1, color: colors.light.mutedForeground, fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  addAllBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 5,
    minWidth: 36, justifyContent: "center",
  },
  addAllText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  emptySlot: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 12, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: colors.light.border,
    opacity: 0.5,
  },
  emptySlotText: {
    flex: 1, color: colors.light.mutedForeground, fontSize: 13,
    fontFamily: "Inter_400Regular", fontStyle: "italic",
  },
  trackSlot: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 12, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: colors.light.border,
  },
  slotNum: {
    width: 34, height: 34, borderRadius: 17, borderWidth: 1,
    borderColor: colors.light.border, backgroundColor: colors.light.card,
    alignItems: "center", justifyContent: "center",
  },
  slotNumText: { color: colors.light.mutedForeground, fontSize: 11, fontFamily: "Inter_500Medium" },
  trackName: {
    flex: 1, color: colors.light.cassetteCream, fontSize: 14,
    fontFamily: "Inter_500Medium", letterSpacing: 0.2,
  },
  trackDur: {
    color: colors.light.mutedForeground, fontSize: 11,
    fontFamily: "Inter_400Regular", letterSpacing: 0.5,
  },
  removeBtn: { padding: 4 },
  hint: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginTop: 16, paddingHorizontal: 20, justifyContent: "center",
  },
  hintText: {
    color: colors.light.mutedForeground, fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
