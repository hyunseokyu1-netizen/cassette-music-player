import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Platform,
  ScrollView, Alert, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Icon } from "@/components/Icon";
import { useAudioPlayerContext } from "@/contexts/AudioPlayerContext";
import { Track, Side, MAX_SIDE_MS } from "@/hooks/useAudioPlayer";
import colors from "@/constants/colors";

function formatMs(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function totalMs(tracks: Track[]): number {
  return tracks.reduce((s, t) => s + t.duration, 0);
}

interface TrackItemProps {
  track: Track;
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  side: Side;
  onPlay: () => void;
  onRemove: () => void;
}

function TrackItem({ track, index, isActive, isPlaying, side, onPlay, onRemove }: TrackItemProps) {
  const sideColor = side === "A" ? "#9e3c3c" : "#2b5499";
  return (
    <TouchableOpacity
      style={[styles.trackRow, isActive && { backgroundColor: colors.light.secondary }]}
      onPress={onPlay}
      onLongPress={onRemove}
      activeOpacity={0.7}
      delayLongPress={500}
    >
      <View style={[styles.trackNum, isActive && { backgroundColor: sideColor, borderColor: sideColor }]}>
        {isActive && isPlaying
          ? <Icon name="volume-2" size={13} color="#fff" />
          : <Text style={[styles.trackNumText, isActive && { color: "#fff" }]}>
              {(index + 1).toString().padStart(2, "0")}
            </Text>
        }
      </View>
      <View style={styles.trackInfo}>
        <Text style={[styles.trackName, isActive && { color: colors.light.cassetteBeige }]} numberOfLines={1}>
          {track.title}
        </Text>
      </View>
      <Text style={styles.trackDur}>{track.duration > 0 ? formatMs(track.duration) : "--:--"}</Text>
      <TouchableOpacity
        onPress={onRemove}
        style={styles.removeBtn}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon name="x" size={15} color={colors.light.border} />
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
  const used = totalMs(tracks);
  const remaining = MAX_SIDE_MS - used;
  const fillRatio = Math.min(1, used / MAX_SIDE_MS);
  const isFull = remaining <= 0;

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <View style={[styles.sideBadge, { backgroundColor: sideColor }]}>
          <Text style={styles.sideBadgeText}>SIDE {side}</Text>
        </View>
        <View style={styles.panelHeaderRight}>
          <Text style={[styles.timeUsed, isFull && { color: colors.light.cassetteBeige }]}>
            {formatMs(used)}
          </Text>
          <Text style={styles.timeSep}>/</Text>
          <Text style={styles.timeTotal}>30:00</Text>
        </View>
      </View>

      <View style={styles.tapeBar}>
        <View style={[styles.tapeFill, { width: `${fillRatio * 100}%`, backgroundColor: sideColor }]} />
      </View>

      <Text style={[styles.timeRemaining, isFull && { color: "#c07040" }]}>
        {isFull
          ? "Tape full — 30:00 limit reached"
          : `${formatMs(remaining)} remaining`
        }
      </Text>

      {tracks.map((track, i) => (
        <TrackItem
          key={track.id}
          track={track} index={i} side={side}
          isActive={currentSide === side && currentIndex === i}
          isPlaying={isPlaying}
          onPlay={() => onPlay(i)}
          onRemove={() => onRemove(i)}
        />
      ))}

      {!isFull && (
        <TouchableOpacity
          style={[styles.addBtn, { borderColor: sideColor }, isAdding && styles.addBtnLoading]}
          onPress={onAdd}
          disabled={isAdding}
          activeOpacity={0.8}
        >
          {isAdding ? (
            <View style={styles.addingRow}>
              <ActivityIndicator size="small" color={sideColor} />
              <Text style={[styles.addBtnText, { color: sideColor }]}>Loading track durations…</Text>
            </View>
          ) : (
            <View style={styles.addingRow}>
              <Icon name="plus" size={16} color={sideColor} />
              <Text style={[styles.addBtnText, { color: sideColor }]}>Add Audio Files</Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      {tracks.length === 0 && !isAdding && (
        <View style={styles.emptyState}>
          <Icon name="music" size={36} color={colors.light.mutedForeground} />
          <Text style={styles.emptyStateText}>No tracks on Side {side}</Text>
          <Text style={styles.emptyStateHint}>Tap "Add Audio Files" to load songs</Text>
        </View>
      )}
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

  const handleAdd = (side: Side) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addToSide(side);
  };

  const aUsed = totalMs(sideA);
  const bUsed = totalMs(sideB);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} activeOpacity={0.7}>
          <Icon name="arrow-left" size={22} color={colors.light.cassetteBeige} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LIBRARY</Text>
        <View style={styles.iconBtn} />
      </View>

      <View style={styles.tabs}>
        {(["A", "B"] as Side[]).map((s) => {
          const active = tab === s;
          const borderC = s === "A" ? "#9e3c3c" : "#2b5499";
          const used = s === "A" ? aUsed : bUsed;
          const pct = Math.min(100, Math.round((used / MAX_SIDE_MS) * 100));
          return (
            <TouchableOpacity
              key={s}
              style={[styles.tab, active && { borderBottomColor: borderC, borderBottomWidth: 2 }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTab(s); }}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, active && styles.activeTabText]}>SIDE {s}</Text>
              <Text style={[styles.tabPct, active && { color: borderC }]}>{pct}%</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: bottomPad + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {tab === "A"
          ? <SidePanel
              side="A" tracks={sideA}
              currentSide={currentSide} currentIndex={currentIndex}
              isPlaying={isPlaying} isAdding={isAdding}
              onPlay={(i) => handlePlay("A", i)}
              onRemove={(i) => handleRemove("A", i)}
              onAdd={() => handleAdd("A")}
            />
          : <SidePanel
              side="B" tracks={sideB}
              currentSide={currentSide} currentIndex={currentIndex}
              isPlaying={isPlaying} isAdding={isAdding}
              onPlay={(i) => handlePlay("B", i)}
              onRemove={(i) => handleRemove("B", i)}
              onAdd={() => handleAdd("B")}
            />
        }

        <View style={styles.hint}>
          <Icon name="info" size={13} color={colors.light.mutedForeground} />
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
  headerTitle: { color: colors.light.mutedForeground, fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 3 },

  tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.light.border },
  tab: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: 12, gap: 8, borderBottomWidth: 2, borderBottomColor: "transparent",
  },
  tabText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.light.mutedForeground, letterSpacing: 2 },
  activeTabText: { color: colors.light.cassetteCream },
  tabPct: { fontSize: 11, fontFamily: "Inter_500Medium", color: colors.light.mutedForeground },

  scroll: { flex: 1 },
  panel: { paddingHorizontal: 16, paddingTop: 16 },

  panelHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  sideBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  sideBadgeText: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  panelHeaderRight: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "flex-end", gap: 4,
  },
  timeUsed: { color: colors.light.cassetteCream, fontSize: 15, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  timeSep: { color: colors.light.mutedForeground, fontSize: 13 },
  timeTotal: { color: colors.light.mutedForeground, fontSize: 13, fontFamily: "Inter_400Regular" },

  tapeBar: {
    height: 5, backgroundColor: colors.light.secondary,
    borderRadius: 3, overflow: "hidden", marginBottom: 6,
  },
  tapeFill: { height: "100%", borderRadius: 3 },

  timeRemaining: {
    color: colors.light.mutedForeground, fontSize: 11,
    fontFamily: "Inter_400Regular", marginBottom: 14,
  },

  trackRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 12, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: colors.light.border,
  },
  trackNum: {
    width: 34, height: 34, borderRadius: 17,
    borderWidth: 1, borderColor: colors.light.border,
    backgroundColor: colors.light.card,
    alignItems: "center", justifyContent: "center",
  },
  trackNumText: { color: colors.light.mutedForeground, fontSize: 11, fontFamily: "Inter_500Medium" },
  trackInfo: { flex: 1 },
  trackName: { color: colors.light.cassetteCream, fontSize: 14, fontFamily: "Inter_500Medium", letterSpacing: 0.2 },
  trackDur: { color: colors.light.mutedForeground, fontSize: 11, fontFamily: "Inter_400Regular", letterSpacing: 0.5, minWidth: 38, textAlign: "right" },
  removeBtn: { padding: 4 },

  addBtn: {
    marginTop: 16, borderWidth: 1.5, borderRadius: 10,
    paddingVertical: 14, paddingHorizontal: 20, alignItems: "center",
  },
  addBtnLoading: { opacity: 0.75 },
  addingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  addBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  emptyState: {
    alignItems: "center", paddingVertical: 40, gap: 10,
  },
  emptyStateText: { color: colors.light.cassetteCream, fontSize: 16, fontFamily: "Inter_600SemiBold" },
  emptyStateHint: { color: colors.light.mutedForeground, fontSize: 13, fontFamily: "Inter_400Regular" },

  hint: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginTop: 16, paddingHorizontal: 20, justifyContent: "center",
  },
  hintText: { color: colors.light.mutedForeground, fontSize: 12, fontFamily: "Inter_400Regular" },
});
