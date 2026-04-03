import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio, AVPlaybackStatus } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import { useCallback, useEffect, useRef, useState } from "react";

export type Side = "A" | "B";

export interface Track {
  id: string;
  title: string;
  duration: number;
  uri: string;
  filename: string;
}

interface State {
  sideA: Track[];
  sideB: Track[];
  currentSide: Side;
  currentIndex: number;
  currentTrack: Track | null;
  isPlaying: boolean;
  isLoading: boolean;
  isTransitioning: boolean;
  isAdding: boolean;
  position: number;
  duration: number;
  progress: number;
}

interface Actions {
  togglePlayPause: () => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  playTrack: (index: number) => Promise<void>;
  seekTo: (ms: number) => Promise<void>;
  seekForward: (s?: number) => Promise<void>;
  seekBackward: (s?: number) => Promise<void>;
  flipSide: () => Promise<void>;
  addToSide: (side: Side) => Promise<void>;
  removeFromSide: (side: Side, index: number) => void;
  setSide: (side: Side) => void;
}

export type UseAudioPlayerReturn = State & Actions;

const KEY_A = "@cassette_sideA_v3";
const KEY_B = "@cassette_sideB_v3";
const KEY_SIDE = "@cassette_currentSide_v3";
const MAX_TRACKS = 6;

function makeId(uri: string) {
  return uri.replace(/[^a-zA-Z0-9]/g, "").slice(-32);
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  const [sideA, setSideA] = useState<Track[]>([]);
  const [sideB, setSideB] = useState<Track[]>([]);
  const [currentSide, setCurrentSide] = useState<Side>("A");
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [position, setPosition] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const soundRef = useRef<Audio.Sound | null>(null);
  const noiseRef = useRef<Audio.Sound | null>(null);
  const currentIndexRef = useRef<number>(-1);
  const currentSideRef = useRef<Side>("A");
  const sideARef = useRef<Track[]>([]);
  const sideBRef = useRef<Track[]>([]);
  const transitioningRef = useRef<boolean>(false);

  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { currentSideRef.current = currentSide; }, [currentSide]);
  useEffect(() => { sideARef.current = sideA; }, [sideA]);
  useEffect(() => { sideBRef.current = sideB; }, [sideB]);
  useEffect(() => { transitioningRef.current = isTransitioning; }, [isTransitioning]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    (async () => {
      const [a, b, side] = await Promise.all([
        AsyncStorage.getItem(KEY_A),
        AsyncStorage.getItem(KEY_B),
        AsyncStorage.getItem(KEY_SIDE),
      ]);
      if (a) setSideA(JSON.parse(a));
      if (b) setSideB(JSON.parse(b));
      if (side === "A" || side === "B") setCurrentSide(side);
    })();
    return () => {
      soundRef.current?.unloadAsync();
      noiseRef.current?.unloadAsync();
    };
  }, []);

  const getTracks = useCallback(
    (side: Side) => (side === "A" ? sideARef.current : sideBRef.current),
    []
  );

  const playTapeNoise = useCallback(async () => {
    try {
      if (noiseRef.current) {
        await noiseRef.current.stopAsync();
        await noiseRef.current.unloadAsync();
        noiseRef.current = null;
      }
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/sounds/tape-noise.wav"),
        { shouldPlay: true, volume: 0.45 }
      );
      noiseRef.current = sound;
      await new Promise<void>((resolve) => setTimeout(resolve, 2000));
      await sound.stopAsync();
      await sound.unloadAsync();
      noiseRef.current = null;
    } catch {
      await new Promise<void>((resolve) => setTimeout(resolve, 2000));
    }
  }, []);

  const stopCurrent = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch {}
      soundRef.current = null;
    }
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
  }, []);

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    setPosition(status.positionMillis);
    setDuration(status.durationMillis ?? 0);
    setIsPlaying(status.isPlaying);
    if (status.didJustFinish && !transitioningRef.current) {
      const nextIdx = currentIndexRef.current + 1;
      const tracks = getTracks(currentSideRef.current);
      if (nextIdx < tracks.length) {
        setIsTransitioning(true);
        transitioningRef.current = true;
        playTapeNoise().then(() => {
          setIsTransitioning(false);
          transitioningRef.current = false;
          loadAndPlay(nextIdx, currentSideRef.current);
        });
      } else {
        setIsPlaying(false);
        setCurrentIndex(-1);
      }
    }
  }, [getTracks, playTapeNoise]);

  const loadAndPlay = useCallback(
    async (index: number, side: Side) => {
      const tracks = getTracks(side);
      if (index < 0 || index >= tracks.length) return;
      const track = tracks[index];
      setIsLoading(true);
      setCurrentIndex(index);
      setCurrentSide(side);
      setPosition(0);
      setDuration(0);
      try {
        if (soundRef.current) {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }
        const { sound } = await Audio.Sound.createAsync(
          { uri: track.uri },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );
        soundRef.current = sound;
        setIsPlaying(true);
      } catch (err) {
        console.warn("loadAndPlay error", err);
      }
      setIsLoading(false);
    },
    [getTracks, onPlaybackStatusUpdate]
  );

  const togglePlayPause = useCallback(async () => {
    if (isTransitioning) return;
    if (isPlaying) {
      await soundRef.current?.pauseAsync();
      setIsPlaying(false);
    } else if (soundRef.current) {
      await soundRef.current?.playAsync();
      setIsPlaying(true);
    } else {
      const tracks = getTracks(currentSideRef.current);
      if (tracks.length > 0) await loadAndPlay(0, currentSideRef.current);
    }
  }, [isPlaying, isTransitioning, getTracks, loadAndPlay]);

  const playNext = useCallback(async () => {
    if (isTransitioning) return;
    const tracks = getTracks(currentSideRef.current);
    const next = currentIndexRef.current + 1;
    if (next >= tracks.length) return;
    await stopCurrent();
    setIsTransitioning(true);
    transitioningRef.current = true;
    await playTapeNoise();
    setIsTransitioning(false);
    transitioningRef.current = false;
    await loadAndPlay(next, currentSideRef.current);
  }, [isTransitioning, getTracks, stopCurrent, playTapeNoise, loadAndPlay]);

  const playPrevious = useCallback(async () => {
    if (isTransitioning) return;
    if (position > 3000) {
      await soundRef.current?.setPositionAsync(0);
      return;
    }
    const prev = currentIndexRef.current - 1;
    if (prev < 0) return;
    await stopCurrent();
    await loadAndPlay(prev, currentSideRef.current);
  }, [isTransitioning, position, stopCurrent, loadAndPlay]);

  const playTrack = useCallback(
    async (index: number) => {
      if (isTransitioning) return;
      await stopCurrent();
      await loadAndPlay(index, currentSideRef.current);
    },
    [isTransitioning, stopCurrent, loadAndPlay]
  );

  const seekTo = useCallback(async (ms: number) => {
    await soundRef.current?.setPositionAsync(ms);
  }, []);

  const seekForward = useCallback(
    async (s = 10) => {
      const newPos = Math.min(position + s * 1000, duration);
      await soundRef.current?.setPositionAsync(newPos);
    },
    [position, duration]
  );

  const seekBackward = useCallback(
    async (s = 10) => {
      const newPos = Math.max(0, position - s * 1000);
      await soundRef.current?.setPositionAsync(newPos);
    },
    [position]
  );

  const flipSide = useCallback(async () => {
    if (isTransitioning) return;
    await stopCurrent();
    setIsTransitioning(true);
    transitioningRef.current = true;
    await playTapeNoise();
    setIsTransitioning(false);
    transitioningRef.current = false;
    const newSide: Side = currentSideRef.current === "A" ? "B" : "A";
    setCurrentSide(newSide);
    AsyncStorage.setItem(KEY_SIDE, newSide);
    setCurrentIndex(-1);
    const newTracks = getTracks(newSide);
    if (newTracks.length > 0) await loadAndPlay(0, newSide);
  }, [isTransitioning, stopCurrent, playTapeNoise, getTracks, loadAndPlay]);

  const setSide = useCallback(
    (side: Side) => {
      setCurrentSide(side);
      setCurrentIndex(-1);
      AsyncStorage.setItem(KEY_SIDE, side);
    },
    []
  );

  const addToSide = useCallback(
    async (side: Side) => {
      const existing = getTracks(side);
      const remaining = MAX_TRACKS - existing.length;
      if (remaining <= 0) return;
      setIsAdding(true);
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: "audio/*",
          multiple: remaining > 1,
          copyToCacheDirectory: false,
        });
        if (!result.canceled) {
          const newTracks: Track[] = result.assets
            .slice(0, remaining)
            .map((a) => ({
              id: makeId(a.uri),
              title: (a.name ?? a.uri.split("/").pop() ?? "Unknown").replace(/\.[^/.]+$/, ""),
              duration: 0,
              uri: a.uri,
              filename: a.name ?? "",
            }))
            .filter((t) => !existing.find((e) => e.id === t.id));

          const merged = [...existing, ...newTracks];
          if (side === "A") {
            setSideA(merged);
            AsyncStorage.setItem(KEY_A, JSON.stringify(merged));
          } else {
            setSideB(merged);
            AsyncStorage.setItem(KEY_B, JSON.stringify(merged));
          }
        }
      } catch (err) {
        console.warn("addToSide error", err);
      }
      setIsAdding(false);
    },
    [getTracks]
  );

  const removeFromSide = useCallback(
    (side: Side, index: number) => {
      const existing = getTracks(side);
      const updated = existing.filter((_, i) => i !== index);
      if (side === "A") {
        setSideA(updated);
        AsyncStorage.setItem(KEY_A, JSON.stringify(updated));
      } else {
        setSideB(updated);
        AsyncStorage.setItem(KEY_B, JSON.stringify(updated));
      }
      if (currentSideRef.current === side && currentIndexRef.current === index) {
        stopCurrent();
        setCurrentIndex(-1);
      }
    },
    [getTracks, stopCurrent]
  );

  const tracks = currentSide === "A" ? sideA : sideB;
  const currentTrack = currentIndex >= 0 ? tracks[currentIndex] ?? null : null;
  const progress = duration > 0 ? position / duration : 0;

  return {
    sideA, sideB, currentSide, currentIndex, currentTrack,
    isPlaying, isLoading, isTransitioning, isAdding,
    position, duration, progress,
    togglePlayPause, playNext, playPrevious, playTrack,
    seekTo, seekForward, seekBackward,
    flipSide, addToSide, removeFromSide, setSide,
  };
}
