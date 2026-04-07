import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Platform,
  ScrollView, Modal, TextInput, ActivityIndicator, KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Icon } from "@/components/Icon";
import { useAudioPlayerContext } from "@/contexts/AudioPlayerContext";
import { SideItem, TrackItem, NoiseItem, Side, MAX_SIDE_MS } from "@/hooks/useAudioPlayer";
import colors from "@/constants/colors";

function formatMs(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function totalMs(items: SideItem[]) {
  return items.reduce((s, it) => s + it.duration, 0);
}

const PRESETS_MS = [500, 1000, 2000, 3000, 5000, 10000];

interface NoiseEditModalProps {
  visible: boolean;
  noise: NoiseItem | null;
  side: Side;
  onSave: (side: Side, noiseId: string, ms: number) => void;
  onClose: () => void;
}

function NoiseEditModal({ visible, noise, side, onSave, onClose }: NoiseEditModalProps) {
  const [custom, setCustom] = useState("");

  const handlePreset = (ms: number) => {
    if (!noise) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSave(side, noise.id, ms);
    onClose();
  };

  const handleCustomSave = () => {
    if (!noise) return;
    const sec = parseFloat(custom.replace(",", "."));
    if (isNaN(sec) || sec <= 0) return;
    onSave(side, noise.id, Math.round(sec * 1000));
    setCustom("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Noise Duration</Text>
          <Text style={styles.modalSub}>
            Current: {noise ? `${(noise.duration / 1000).toFixed(1)}s` : "—"}
          </Text>
          <View style={styles.presetGrid}>
            {PRESETS_MS.map((ms) => {
              const active = noise?.duration === ms;
              return (
                <TouchableOpacity
                  key={ms}
                  style={[styles.presetBtn, active && styles.presetBtnActive]}
                  onPress={() => handlePreset(ms)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.presetText, active && styles.presetTextActive]}>
                    {ms < 1000 ? `${ms / 1000}s` : `${ms / 1000}s`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.customLabel}>Custom (seconds)</Text>
          <View style={styles.customRow}>
            <TextInput
              style={styles.customInput}
              value={custom}
              onChangeText={setCustom}
              keyboardType="decimal-pad"
              placeholder="e.g. 4.5"
              placeholderTextColor={colors.light.mutedForeground}
              returnKeyType="done"
              onSubmitEditing={handleCustomSave}
            />
            <TouchableOpacity
              style={styles.customSaveBtn}
              onPress={handleCustomSave}
              activeOpacity={0.8}
            >
              <Text style={styles.customSaveTxt}>Set</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.modalCloseTxt}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

interface SidePanelProps {
  side: Side;
  items: SideItem[];
  currentSide: Side;
  currentItemIdx: number;
  isPlaying: boolean;
  isPlayingNoise: boolean;
  isAdding: boolean;
  onPlayItem: (idx: number) => void;
  onRemoveTrack: (trackId: string) => void;
  onEditNoise: (noise: NoiseItem) => void;
  onAdd: () => void;
}

function SidePanel({
  side, items, currentSide, currentItemIdx, isPlaying, isPlayingNoise,
  isAdding, onPlayItem, onRemoveTrack, onEditNoise, onAdd,
}: SidePanelProps) {
  const used = totalMs(items);
  const remaining = MAX_SIDE_MS - used;
  const fillRatio = Math.min(1, used / MAX_SIDE_MS);
  const isFull = remaining <= 0;
  const trackCount = items.filter((it) => it.type === "track").length;
  let trackNum = 0;

  return (
    <View style={styles.panel}>
      <View style={styles.tapeBuilderRow}>
        <Text style={styles.tapeBuilderLabel}>TAPE Builder</Text>
        <Text style={[styles.tapeTime, isFull && { color: colors.light.primary }]}>
          {formatMs(used)} / 30:00
        </Text>
      </View>

      <View style={styles.tapeBar}>
        <View style={[styles.tapeFill, { width: `${fillRatio * 100}%` }]} />
      </View>

      {items.map((item, itemIdx) => {
        const isCurrentItem = currentSide === side && currentItemIdx === itemIdx;
        const isActive = isCurrentItem;

        if (item.type === "noise") {
          const isLastItem = itemIdx === items.length - 1;
          const fillMs = isLastItem ? MAX_SIDE_MS - (used - item.duration) : null;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.noiseRow, isActive && styles.noiseRowActive]}
              onPress={() => !isLastItem && onEditNoise(item)}
              activeOpacity={isLastItem ? 1 : 0.7}
            >
              <Text style={styles.noiseDash}>—</Text>
              <Text style={styles.noiseLabelText}>
                {isLastItem
                  ? `테이프 끝까지  ${formatMs(fillMs!)}`
                  : `노이즈  ${(item.duration / 1000).toFixed(1)}초`
                }
              </Text>
              {!isLastItem && (
                <View style={styles.noiseEditDots}>
                  <Text style={styles.dotsText}>···</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        } else {
          trackNum++;
          const isPlayingThis = isActive && isPlaying && !isPlayingNoise;
          return (
            <View key={item.id} style={[styles.trackRow, isActive && !isPlayingNoise && styles.trackRowActive]}>
              <TouchableOpacity
                style={styles.trackPlayArea}
                onPress={() => onPlayItem(itemIdx)}
                activeOpacity={0.7}
              >
                <View style={[styles.trackDot, isPlayingThis && styles.trackDotActive]}>
                  {isPlayingThis
                    ? <Icon name="volume-2" size={10} color="#fff" />
                    : null
                  }
                </View>
                <Text style={[styles.trackName, isActive && styles.trackNameActive]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.trackDurText}>
                  ({item.duration > 0 ? formatMs(item.duration) : "--:--"})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => onRemoveTrack(item.id)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Icon name="align-justify" size={16} color={colors.light.border} />
              </TouchableOpacity>
            </View>
          );
        }
      })}

      {!isFull && (
        <TouchableOpacity
          style={[styles.addBtn, isAdding && styles.addBtnDisabled]}
          onPress={onAdd}
          disabled={isAdding}
          activeOpacity={0.85}
        >
          {isAdding ? (
            <View style={styles.addRow}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.addTxt}>Loading track durations…</Text>
            </View>
          ) : (
            <View style={styles.addRow}>
              <Icon name="plus" size={16} color="#fff" />
              <Text style={styles.addTxt}>+ 트랙 추가</Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      {trackCount === 0 && !isAdding && (
        <View style={styles.emptyState}>
          <Icon name="music" size={36} color={colors.light.border} />
          <Text style={styles.emptyTxt}>Side {side}에 곡이 없습니다</Text>
          <Text style={styles.emptyHint}>아래 버튼으로 음악 파일을 추가하세요</Text>
        </View>
      )}
    </View>
  );
}

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [tab, setTab] = useState<Side>("A");
  const [editingNoise, setEditingNoise] = useState<{ noise: NoiseItem; side: Side } | null>(null);

  const {
    sideA, sideB, currentSide, currentItemIdx, isPlaying, isPlayingNoise, isAdding,
    playItemAt, addToSide, removeTrackItem, updateNoiseDuration, setSide,
  } = useAudioPlayerContext();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handlePlayItem = (side: Side, itemIdx: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSide(side);
    playItemAt(itemIdx);
    router.back();
  };

  const handleRemove = (side: Side, trackId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    removeTrackItem(side, trackId);
  };

  const handleEditNoise = (side: Side, noise: NoiseItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingNoise({ noise, side });
  };

  const aMs = totalMs(sideA);
  const bMs = totalMs(sideB);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} activeOpacity={0.7}>
          <Icon name="arrow-left" size={22} color={colors.light.mutedForeground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LIBRARY</Text>
        <View style={styles.iconBtn} />
      </View>

      <View style={styles.tabs}>
        {(["A", "B"] as Side[]).map((s) => {
          const active = tab === s;
          const ms = s === "A" ? aMs : bMs;
          return (
            <TouchableOpacity
              key={s}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTab(s); }}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {s} SIDE
              </Text>
              <Text style={[styles.tabTime, active && styles.tabTimeActive]}>
                {formatMs(ms)} / 30:00
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: bottomPad + 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {tab === "A"
          ? <SidePanel
              side="A" items={sideA}
              currentSide={currentSide} currentItemIdx={currentItemIdx}
              isPlaying={isPlaying} isPlayingNoise={isPlayingNoise} isAdding={isAdding}
              onPlayItem={(idx) => handlePlayItem("A", idx)}
              onRemoveTrack={(id) => handleRemove("A", id)}
              onEditNoise={(n) => handleEditNoise("A", n)}
              onAdd={() => addToSide("A")}
            />
          : <SidePanel
              side="B" items={sideB}
              currentSide={currentSide} currentItemIdx={currentItemIdx}
              isPlaying={isPlaying} isPlayingNoise={isPlayingNoise} isAdding={isAdding}
              onPlayItem={(idx) => handlePlayItem("B", idx)}
              onRemoveTrack={(id) => handleRemove("B", id)}
              onEditNoise={(n) => handleEditNoise("B", n)}
              onAdd={() => addToSide("B")}
            />
        }
      </ScrollView>

      <NoiseEditModal
        visible={!!editingNoise}
        noise={editingNoise?.noise ?? null}
        side={editingNoise?.side ?? "A"}
        onSave={updateNoiseDuration}
        onClose={() => setEditingNoise(null)}
      />
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
    flexDirection: "row",
    backgroundColor: colors.light.card,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: colors.light.primary,
  },
  tabText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: colors.light.mutedForeground,
    letterSpacing: 1,
  },
  tabTextActive: {
    color: "#fff",
  },
  tabTime: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: colors.light.mutedForeground,
    marginTop: 1,
  },
  tabTimeActive: {
    color: "rgba(255,255,255,0.8)",
  },

  scroll: { flex: 1 },
  panel: { paddingHorizontal: 16, paddingTop: 8 },

  tapeBuilderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  tapeBuilderLabel: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: colors.light.text,
    letterSpacing: 0.5,
  },
  tapeTime: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: colors.light.mutedForeground,
  },

  tapeBar: {
    height: 5,
    backgroundColor: colors.light.secondary,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 12,
  },
  tapeFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: colors.light.primary,
  },

  noiseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  noiseRowActive: { backgroundColor: "rgba(240,120,40,0.06)" },
  noiseDash: {
    color: colors.light.mutedForeground,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    width: 16,
    textAlign: "center",
  },
  noiseLabelText: {
    flex: 1,
    color: colors.light.mutedForeground,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  noiseEditDots: {
    padding: 4,
  },
  dotsText: {
    color: colors.light.border,
    fontSize: 14,
    letterSpacing: 2,
  },

  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  trackRowActive: { backgroundColor: "rgba(240,120,40,0.06)" },
  trackPlayArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 13,
    paddingLeft: 4,
  },
  trackDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.light.text,
    alignItems: "center",
    justifyContent: "center",
  },
  trackDotActive: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.light.primary,
  },
  trackName: {
    flex: 1,
    color: colors.light.text,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.1,
  },
  trackNameActive: {
    color: colors.light.primary,
    fontFamily: "Inter_600SemiBold",
  },
  trackDurText: {
    color: colors.light.mutedForeground,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  removeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 40,
  },

  addBtn: {
    marginTop: 20,
    backgroundColor: colors.light.primary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: colors.light.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addBtnDisabled: { opacity: 0.6 },
  addRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  addTxt: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },

  emptyState: { alignItems: "center", paddingVertical: 48, gap: 10 },
  emptyTxt: { color: colors.light.text, fontSize: 16, fontFamily: "Inter_600SemiBold" },
  emptyHint: { color: colors.light.mutedForeground, fontSize: 13, fontFamily: "Inter_400Regular" },

  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  modalSheet: {
    backgroundColor: colors.light.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.light.border, alignSelf: "center", marginBottom: 20,
  },
  modalTitle: {
    color: colors.light.text, fontSize: 18,
    fontFamily: "Inter_700Bold", marginBottom: 4,
  },
  modalSub: {
    color: colors.light.mutedForeground, fontSize: 13,
    fontFamily: "Inter_400Regular", marginBottom: 20,
  },
  presetGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  presetBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.light.border,
    backgroundColor: colors.light.background,
  },
  presetBtnActive: {
    backgroundColor: colors.light.primary,
    borderColor: colors.light.primary,
  },
  presetText: {
    color: colors.light.text,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  presetTextActive: {
    color: "#fff",
  },
  customLabel: {
    color: colors.light.mutedForeground, fontSize: 12,
    fontFamily: "Inter_500Medium", letterSpacing: 0.5, marginBottom: 10,
  },
  customRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  customInput: {
    flex: 1, height: 48, borderRadius: 12,
    borderWidth: 1.5, borderColor: colors.light.border,
    paddingHorizontal: 14,
    color: colors.light.text,
    backgroundColor: colors.light.background,
    fontFamily: "Inter_500Medium", fontSize: 15,
  },
  customSaveBtn: {
    height: 48, paddingHorizontal: 22, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    backgroundColor: colors.light.primary,
  },
  customSaveTxt: { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
  modalCloseBtn: { alignItems: "center", paddingVertical: 8 },
  modalCloseTxt: { color: colors.light.mutedForeground, fontSize: 14, fontFamily: "Inter_500Medium" },
});
