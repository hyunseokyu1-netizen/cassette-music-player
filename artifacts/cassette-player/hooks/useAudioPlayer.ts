import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio, AVPlaybackStatus } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import { useCallback, useEffect, useRef, useState } from "react";

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  uri: string;
  filename: string;
  folderName: string;
}

export interface MusicFolder {
  id: string;
  title: string;
  trackCount: number;
}

const STORAGE_KEY = "@cassette_tracks";

function extractFolderName(uri: string): string {
  try {
    const decoded = decodeURIComponent(uri);
    const parts = decoded.split("/");
    if (parts.length >= 2) {
      return parts[parts.length - 2] || "Music";
    }
  } catch {}
  return "Music";
}

function makeTrackId(uri: string): string {
  return uri.replace(/[^a-zA-Z0-9]/g, "_").slice(-40);
}

interface AudioPlayerState {
  tracks: Track[];
  allTracks: Track[];
  folders: MusicFolder[];
  selectedFolderId: string | null;
  currentIndex: number;
  currentTrack: Track | null;
  isPlaying: boolean;
  isLoading: boolean;
  isAdding: boolean;
  position: number;
  duration: number;
  progress: number;
}

interface AudioPlayerActions {
  play: () => Promise<void>;
  pause: () => Promise<void>;
  togglePlayPause: () => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  playTrack: (index: number) => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  seekForward: (seconds?: number) => Promise<void>;
  seekBackward: (seconds?: number) => Promise<void>;
  addFiles: () => Promise<void>;
  removeTrack: (id: string) => void;
  clearAll: () => void;
  selectFolder: (folderId: string | null) => void;
}

export type UseAudioPlayerReturn = AudioPlayerState & AudioPlayerActions;

export function useAudioPlayer(): UseAudioPlayerReturn {
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [folders, setFolders] = useState<MusicFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [position, setPosition] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const soundRef = useRef<Audio.Sound | null>(null);
  const currentIndexRef = useRef<number>(-1);
  const tracksRef = useRef<Track[]>([]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  const buildFolders = useCallback((trackList: Track[]): MusicFolder[] => {
    const map = new Map<string, number>();
    for (const t of trackList) {
      map.set(t.folderName, (map.get(t.folderName) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([title, count]) => ({
      id: title,
      title,
      trackCount: count,
    }));
  }, []);

  const applyAll = useCallback(
    (loaded: Track[], folderId: string | null) => {
      setAllTracks(loaded);
      const filtered =
        folderId === null ? loaded : loaded.filter((t) => t.folderName === folderId);
      setTracks(filtered);
      setFolders(buildFolders(loaded));
    },
    [buildFolders]
  );

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved: Track[] = JSON.parse(raw);
        applyAll(saved, null);
      }
    })();
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  const persist = useCallback(async (list: Track[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }, []);

  const addFiles = useCallback(async () => {
    setIsAdding(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        multiple: true,
        copyToCacheDirectory: false,
      });

      if (result.canceled) {
        setIsAdding(false);
        return;
      }

      const newTracks: Track[] = result.assets.map((asset) => {
        const filename = asset.name ?? asset.uri.split("/").pop() ?? "Unknown";
        const folderName = extractFolderName(asset.uri);
        return {
          id: makeTrackId(asset.uri),
          title: filename.replace(/\.[^/.]+$/, ""),
          artist: "Unknown Artist",
          album: folderName,
          duration: 0,
          uri: asset.uri,
          filename,
          folderName,
        };
      });

      const merged = [...allTracks];
      for (const t of newTracks) {
        if (!merged.find((x) => x.id === t.id)) {
          merged.push(t);
        }
      }

      await persist(merged);
      applyAll(merged, selectedFolderId);
    } catch (err) {
      console.warn("addFiles error", err);
    }
    setIsAdding(false);
  }, [allTracks, selectedFolderId, applyAll, persist]);

  const removeTrack = useCallback(
    (id: string) => {
      const updated = allTracks.filter((t) => t.id !== id);
      persist(updated);
      applyAll(updated, selectedFolderId);
      setCurrentIndex(-1);
    },
    [allTracks, selectedFolderId, applyAll, persist]
  );

  const clearAll = useCallback(() => {
    persist([]);
    setAllTracks([]);
    setTracks([]);
    setFolders([]);
    setCurrentIndex(-1);
    soundRef.current?.stopAsync();
    soundRef.current?.unloadAsync();
    soundRef.current = null;
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
  }, [persist]);

  const selectFolder = useCallback(
    (folderId: string | null) => {
      setSelectedFolderId(folderId);
      setTracks(
        folderId === null ? allTracks : allTracks.filter((t) => t.folderName === folderId)
      );
      setCurrentIndex(-1);
    },
    [allTracks]
  );

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    setPosition(status.positionMillis);
    setDuration(status.durationMillis ?? 0);
    setIsPlaying(status.isPlaying);
    if (status.didJustFinish) {
      const next = currentIndexRef.current + 1;
      if (next < tracksRef.current.length) {
        loadAndPlayTrack(next);
      } else {
        setIsPlaying(false);
        setPosition(0);
      }
    }
  }, []);

  const loadAndPlayTrack = useCallback(
    async (index: number) => {
      if (index < 0 || index >= tracksRef.current.length) return;
      const track = tracksRef.current[index];
      setIsLoading(true);
      setCurrentIndex(index);
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
        console.warn("loadAndPlayTrack error", err);
      }
      setIsLoading(false);
    },
    [onPlaybackStatusUpdate]
  );

  const play = useCallback(async () => {
    await soundRef.current?.playAsync();
    setIsPlaying(true);
  }, []);

  const pause = useCallback(async () => {
    await soundRef.current?.pauseAsync();
    setIsPlaying(false);
  }, []);

  const togglePlayPause = useCallback(async () => {
    if (isPlaying) {
      await pause();
    } else if (soundRef.current) {
      await play();
    } else if (tracks.length > 0) {
      await loadAndPlayTrack(0);
    }
  }, [isPlaying, play, pause, tracks, loadAndPlayTrack]);

  const playNext = useCallback(async () => {
    const next = currentIndexRef.current + 1;
    if (next < tracksRef.current.length) await loadAndPlayTrack(next);
  }, [loadAndPlayTrack]);

  const playPrevious = useCallback(async () => {
    if (position > 3000) {
      await soundRef.current?.setPositionAsync(0);
      return;
    }
    const prev = currentIndexRef.current - 1;
    if (prev >= 0) await loadAndPlayTrack(prev);
  }, [position, loadAndPlayTrack]);

  const playTrack = useCallback(
    async (index: number) => {
      await loadAndPlayTrack(index);
    },
    [loadAndPlayTrack]
  );

  const seekTo = useCallback(async (ms: number) => {
    await soundRef.current?.setPositionAsync(ms);
  }, []);

  const seekForward = useCallback(
    async (seconds = 10) => {
      const newPos = Math.min(position + seconds * 1000, duration);
      await soundRef.current?.setPositionAsync(newPos);
    },
    [position, duration]
  );

  const seekBackward = useCallback(
    async (seconds = 10) => {
      const newPos = Math.max(0, position - seconds * 1000);
      await soundRef.current?.setPositionAsync(newPos);
    },
    [position]
  );

  const progress = duration > 0 ? position / duration : 0;
  const currentTrack = currentIndex >= 0 ? tracks[currentIndex] ?? null : null;

  return {
    tracks,
    allTracks,
    folders,
    selectedFolderId,
    currentIndex,
    currentTrack,
    isPlaying,
    isLoading,
    isAdding,
    position,
    duration,
    progress,
    play,
    pause,
    togglePlayPause,
    playNext,
    playPrevious,
    playTrack,
    seekTo,
    seekForward,
    seekBackward,
    addFiles,
    removeTrack,
    clearAll,
    selectFolder,
  };
}
