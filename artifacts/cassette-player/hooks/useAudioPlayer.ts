import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio, AVPlaybackStatus } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

export type Side = "A" | "B";

export interface TrackItem {
  id: string;
  type: "track";
  title: string;
  duration: number;
  uri: string;
}

export interface NoiseItem {
  id: string;
  type: "noise";
  duration: number;
}

export type SideItem = TrackItem | NoiseItem;

export const MAX_SIDE_MS = 30 * 60 * 1000;
export const DEFAULT_NOISE_MS = 2000;
const NOISE_CHUNK_MS = 2200;

const KEY_A = "@cassette_items_A_v1";
const KEY_B = "@cassette_items_B_v1";
const KEY_SIDE = "@cassette_side_v1";

function genId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}
function trackId(uri: string) {
  return `track_${uri.replace(/[^a-zA-Z0-9]/g, "").slice(-24)}`;
}
function totalMs(items: SideItem[]) {
  return items.reduce((s, i) => s + i.duration, 0);
}

async function loadFileDuration(uri: string): Promise<number> {
  try {
    const { sound, status } = await Audio.Sound.createAsync({ uri }, { shouldPlay: false });
    let dur = 0;
    if (status.isLoaded && status.durationMillis) {
      dur = status.durationMillis;
    } else {
      await new Promise((r) => setTimeout(r, 300));
      const s2 = await sound.getStatusAsync();
      if (s2.isLoaded && s2.durationMillis) dur = s2.durationMillis;
    }
    await sound.unloadAsync();
    return dur;
  } catch {
    return 0;
  }
}

export interface UseAudioPlayerReturn {
  sideA: SideItem[];
  sideB: SideItem[];
  currentSide: Side;
  currentItemIdx: number;
  currentTrack: TrackItem | null;
  isPlaying: boolean;
  isPlayingNoise: boolean;
  isLoading: boolean;
  isAdding: boolean;
  position: number;
  duration: number;
  progress: number;
  togglePlayPause: () => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stopPlayback: () => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  playItemAt: (idx: number) => Promise<void>;
  seekTo: (ms: number) => Promise<void>;
  seekForward: (s?: number) => Promise<void>;
  seekBackward: (s?: number) => Promise<void>;
  setPlaybackRate: (rate: number) => Promise<void>;
  flipSide: () => Promise<void>;
  addToSide: (side: Side) => Promise<void>;
  removeTrackItem: (side: Side, trackId: string) => void;
  updateNoiseDuration: (side: Side, noiseId: string, ms: number) => void;
  setSide: (side: Side) => void;
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  const [sideA, setSideA] = useState<SideItem[]>([]);
  const [sideB, setSideB] = useState<SideItem[]>([]);
  const [currentSide, setCurrentSide] = useState<Side>("A");
  const [currentItemIdx, setCurrentItemIdx] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingNoise, setIsPlayingNoise] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const soundRef = useRef<Audio.Sound | null>(null);
  const noiseRef = useRef<Audio.Sound | null>(null);
  const itemIdxRef = useRef(-1);
  const sideRef = useRef<Side>("A");
  const sideARef = useRef<SideItem[]>([]);
  const sideBRef = useRef<SideItem[]>([]);
  const cancelRef = useRef(false);

  useEffect(() => { itemIdxRef.current = currentItemIdx; }, [currentItemIdx]);
  useEffect(() => { sideRef.current = currentSide; }, [currentSide]);
  useEffect(() => { sideARef.current = sideA; }, [sideA]);
  useEffect(() => { sideBRef.current = sideB; }, [sideB]);

  const getItems = useCallback((side: Side): SideItem[] =>
    side === "A" ? sideARef.current : sideBRef.current, []);

  const saveItems = useCallback((side: Side, items: SideItem[]) => {
    if (side === "A") { setSideA(items); AsyncStorage.setItem(KEY_A, JSON.stringify(items)); }
    else { setSideB(items); AsyncStorage.setItem(KEY_B, JSON.stringify(items)); }
  }, []);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false, staysActiveInBackground: true,
      playsInSilentModeIOS: true, shouldDuckAndroid: true, playThroughEarpieceAndroid: false,
    });
    (async () => {
      const [a, b, side] = await Promise.all([
        AsyncStorage.getItem(KEY_A), AsyncStorage.getItem(KEY_B), AsyncStorage.getItem(KEY_SIDE),
      ]);
      if (a) setSideA(JSON.parse(a));
      if (b) setSideB(JSON.parse(b));
      if (side === "A" || side === "B") setCurrentSide(side as Side);
    })();
    return () => { soundRef.current?.unloadAsync(); noiseRef.current?.unloadAsync(); };
  }, []);

  const stopTrack = async () => {
    if (soundRef.current) {
      try { await soundRef.current.stopAsync(); await soundRef.current.unloadAsync(); } catch {}
      soundRef.current = null;
    }
  };

  const stopNoise = async () => {
    if (noiseRef.current) {
      try { await noiseRef.current.stopAsync(); await noiseRef.current.unloadAsync(); } catch {}
      noiseRef.current = null;
    }
  };

  const cancelAll = useCallback(async () => {
    cancelRef.current = true;
    await Promise.all([stopTrack(), stopNoise()]);
    setIsPlaying(false);
    setIsPlayingNoise(false);
    setPosition(0);
    setDuration(0);
  }, []);

  const playNoiseChunk = async (ms: number) => {
    const actual = Math.min(ms, NOISE_CHUNK_MS);
    try {
      await stopNoise();
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/sounds/tape-noise.wav"),
        { shouldPlay: true, volume: 0.45 }
      );
      noiseRef.current = sound;
      await new Promise<void>((r) => setTimeout(r, actual));
      await sound.stopAsync().catch(() => {});
      await sound.unloadAsync().catch(() => {});
      noiseRef.current = null;
    } catch {
      await new Promise<void>((r) => setTimeout(r, actual));
    }
  };

  const playNoiseDuration = async (durationMs: number): Promise<boolean> => {
    let left = durationMs;
    while (left > 0 && !cancelRef.current) {
      await playNoiseChunk(Math.min(left, NOISE_CHUNK_MS));
      left -= NOISE_CHUNK_MS;
    }
    return !cancelRef.current;
  };

  const playItemAtRef = useRef<((idx: number) => Promise<void>) | null>(null);

  const advance = useCallback(() => {
    if (cancelRef.current) return;
    const items = getItems(sideRef.current);
    const next = itemIdxRef.current + 1;
    if (next >= items.length) {
      const used = totalMs(items);
      const fillMs = MAX_SIDE_MS - used;
      if (fillMs > 1000) {
        setCurrentItemIdx(-1);
        itemIdxRef.current = -1;
        setIsPlayingNoise(true);
        setIsPlaying(true);
        playNoiseDuration(fillMs).then((done) => {
          setIsPlayingNoise(false);
          if (done) {
            setIsPlaying(false);
            setCurrentItemIdx(-1);
            itemIdxRef.current = -1;
          }
        });
      } else {
        setIsPlaying(false);
        setIsPlayingNoise(false);
        setCurrentItemIdx(-1);
        itemIdxRef.current = -1;
      }
      return;
    }
    playItemAtRef.current?.(next);
  }, [getItems]);

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    setPosition(status.positionMillis);
    setDuration(status.durationMillis ?? 0);
    setIsPlaying(status.isPlaying);
    if (status.didJustFinish && !cancelRef.current) advance();
  }, [advance]);

  const playItemAt = useCallback(async (idx: number) => {
    if (cancelRef.current) return;
    const items = getItems(sideRef.current);
    if (idx < 0 || idx >= items.length) return;
    const item = items[idx];
    setCurrentItemIdx(idx);
    itemIdxRef.current = idx;

    if (item.type === "noise") {
      setIsPlayingNoise(true);
      setIsPlaying(true);
      setPosition(0);
      setDuration(item.duration);
      const done = await playNoiseDuration(item.duration);
      setIsPlayingNoise(false);
      if (done) advance();
    } else {
      setIsPlayingNoise(false);
      setIsLoading(true);
      setPosition(0);
      setDuration(0);
      try {
        await stopTrack();
        const { sound } = await Audio.Sound.createAsync(
          { uri: item.uri },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );
        soundRef.current = sound;
        setIsPlaying(true);
      } catch (err) {
        console.warn("playItemAt error:", err);
        if (!cancelRef.current) advance();
      }
      setIsLoading(false);
    }
  }, [getItems, advance, onPlaybackStatusUpdate]);

  useEffect(() => { playItemAtRef.current = playItemAt; }, [playItemAt]);

  const play = useCallback(async () => {
    if (isPlayingNoise) return;
    if (isPlaying) return;
    if (soundRef.current) {
      cancelRef.current = false;
      await soundRef.current.playAsync();
      setIsPlaying(true);
    } else {
      const items = getItems(sideRef.current);
      if (!items.length) return;
      cancelRef.current = false;
      await playItemAtRef.current?.(0);
    }
  }, [isPlaying, isPlayingNoise, getItems]);

  const pause = useCallback(async () => {
    if (isPlayingNoise) {
      cancelRef.current = true;
      await stopNoise();
      setIsPlayingNoise(false);
      setIsPlaying(false);
      return;
    }
    if (!isPlaying) return;
    await soundRef.current?.pauseAsync();
    setIsPlaying(false);
  }, [isPlaying, isPlayingNoise]);

  const stopPlayback = useCallback(async () => {
    await cancelAll();
    setCurrentItemIdx(-1);
    itemIdxRef.current = -1;
  }, [cancelAll]);

  const togglePlayPause = useCallback(async () => {
    if (isPlaying || isPlayingNoise) await pause();
    else await play();
  }, [isPlaying, isPlayingNoise, play, pause]);

  const findNextTrack = (items: SideItem[], from: number) => {
    for (let i = from + 1; i < items.length; i++)
      if (items[i].type === "track") return i;
    return -1;
  };
  const findPrevTrack = (items: SideItem[], from: number) => {
    for (let i = from - 1; i >= 0; i--)
      if (items[i].type === "track") return i;
    return -1;
  };

  const playNext = useCallback(async () => {
    const items = getItems(sideRef.current);
    const nextTrackIdx = findNextTrack(items, itemIdxRef.current);
    if (nextTrackIdx === -1) return;
    const startIdx =
      nextTrackIdx > 0 && items[nextTrackIdx - 1].type === "noise"
        ? nextTrackIdx - 1
        : nextTrackIdx;
    await cancelAll();
    cancelRef.current = false;
    await playItemAtRef.current?.(startIdx);
  }, [getItems, cancelAll]);

  const playPrevious = useCallback(async () => {
    if (position > 3000 && soundRef.current) {
      await soundRef.current.setPositionAsync(0);
      return;
    }
    const items = getItems(sideRef.current);
    const cur = itemIdxRef.current;
    const curItem = items[cur];
    const fromIdx = !curItem || curItem.type === "noise"
      ? findPrevTrack(items, cur)
      : findPrevTrack(items, cur);
    if (fromIdx === -1) return;
    const startIdx =
      fromIdx > 0 && items[fromIdx - 1].type === "noise"
        ? fromIdx - 1
        : fromIdx;
    await cancelAll();
    cancelRef.current = false;
    await playItemAtRef.current?.(startIdx);
  }, [position, getItems, cancelAll]);

  const seekTo = useCallback(async (ms: number) => {
    await soundRef.current?.setPositionAsync(ms);
  }, []);
  const seekForward = useCallback(async (s = 10) => {
    await soundRef.current?.setPositionAsync(Math.min(position + s * 1000, duration));
  }, [position, duration]);
  const seekBackward = useCallback(async (s = 10) => {
    await soundRef.current?.setPositionAsync(Math.max(0, position - s * 1000));
  }, [position]);
  const setPlaybackRate = useCallback(async (rate: number) => {
    await soundRef.current?.setRateAsync(rate, true);
  }, []);

  const flipSide = useCallback(async () => {
    await cancelAll();
    cancelRef.current = false;
    setIsPlayingNoise(true);
    setIsPlaying(true);
    const done = await playNoiseDuration(DEFAULT_NOISE_MS);
    setIsPlayingNoise(false);
    if (!done) return;
    const newSide: Side = sideRef.current === "A" ? "B" : "A";
    setCurrentSide(newSide);
    sideRef.current = newSide;
    AsyncStorage.setItem(KEY_SIDE, newSide);
    setCurrentItemIdx(-1);
    itemIdxRef.current = -1;
    const newItems = getItems(newSide);
    if (newItems.length > 0) { cancelRef.current = false; await playItemAtRef.current?.(0); }
  }, [cancelAll, getItems]);

  const setSide = useCallback((side: Side) => {
    cancelRef.current = true;
    setCurrentSide(side);
    sideRef.current = side;
    setCurrentItemIdx(-1);
    itemIdxRef.current = -1;
    AsyncStorage.setItem(KEY_SIDE, side);
  }, []);

  const addToSide = useCallback(async (side: Side) => {
    const existing = getItems(side);
    const usedMs = totalMs(existing);
    if (usedMs >= MAX_SIDE_MS) {
      Alert.alert("Tape Full", `Side ${side} has already reached the 30-minute limit.`);
      return;
    }
    setIsAdding(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*", multiple: true, copyToCacheDirectory: false,
      });
      if (!result.canceled) {
        const withDur = await Promise.all(
          result.assets.map(async (a) => ({
            id: trackId(a.uri),
            type: "track" as const,
            title: (a.name ?? a.uri.split("/").pop() ?? "Unknown").replace(/\.[^/.]+$/, ""),
            duration: await loadFileDuration(a.uri),
            uri: a.uri,
          }))
        );

        let items = [...existing];
        let runningMs = usedMs;
        let skipped = 0;

        for (const track of withDur) {
          if (items.find((it) => it.id === track.id)) continue;
          const isEmpty = items.length === 0;
          const addMs = track.duration + DEFAULT_NOISE_MS + (isEmpty ? DEFAULT_NOISE_MS : 0);
          if (runningMs + addMs > MAX_SIDE_MS) {
            skipped++;
            continue;
          }
          if (isEmpty) {
            items.push({ id: genId("n"), type: "noise", duration: DEFAULT_NOISE_MS });
            items.push(track);
            items.push({ id: genId("n"), type: "noise", duration: DEFAULT_NOISE_MS });
          } else {
            items.push(track);
            items.push({ id: genId("n"), type: "noise", duration: DEFAULT_NOISE_MS });
          }
          runningMs += addMs;
        }

        if (skipped > 0) {
          Alert.alert(
            "Time Limit Reached",
            `${skipped} track${skipped > 1 ? "s were" : " was"} not added — Side ${side} would exceed 30 minutes.`
          );
        }
        if (items.length !== existing.length) saveItems(side, items);
      }
    } catch (err) {
      console.warn("addToSide error:", err);
    }
    setIsAdding(false);
  }, [getItems, saveItems]);

  const removeTrackItem = useCallback((side: Side, tId: string) => {
    const items = getItems(side);
    const idx = items.findIndex((it) => it.id === tId);
    if (idx === -1) return;
    const updated = [...items];
    const removeFrom = idx > 0 && updated[idx - 1].type === "noise" ? idx - 1 : idx;
    updated.splice(removeFrom, removeFrom < idx ? 2 : 1);
    const hasTrack = updated.some((it) => it.type === "track");
    saveItems(side, hasTrack ? updated : []);
    if (sideRef.current === side && itemIdxRef.current >= removeFrom) {
      cancelRef.current = true;
      stopTrack();
      setIsPlaying(false);
      setIsPlayingNoise(false);
      setCurrentItemIdx(-1);
      itemIdxRef.current = -1;
    }
  }, [getItems, saveItems]);

  const updateNoiseDuration = useCallback((side: Side, noiseId: string, ms: number) => {
    const items = getItems(side);
    const updated = items.map((it) =>
      it.id === noiseId && it.type === "noise"
        ? { ...it, duration: Math.max(200, Math.min(ms, MAX_SIDE_MS)) }
        : it
    );
    if (totalMs(updated) > MAX_SIDE_MS) {
      Alert.alert("Time Limit", "This noise duration would push the tape over 30 minutes.");
      return;
    }
    saveItems(side, updated);
  }, [getItems, saveItems]);

  const activeItems = currentSide === "A" ? sideA : sideB;
  const currentItem = currentItemIdx >= 0 ? activeItems[currentItemIdx] ?? null : null;
  const currentTrack = currentItem?.type === "track" ? currentItem : null;
  const progress = duration > 0 ? position / duration : 0;

  return {
    sideA, sideB, currentSide, currentItemIdx, currentTrack,
    isPlaying, isPlayingNoise, isLoading, isAdding,
    position, duration, progress,
    togglePlayPause, play, pause, stopPlayback,
    playNext, playPrevious, playItemAt,
    seekTo, seekForward, seekBackward, setPlaybackRate,
    flipSide, addToSide, removeTrackItem, updateNoiseDuration, setSide,
  };
}
