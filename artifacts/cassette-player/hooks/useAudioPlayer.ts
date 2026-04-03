import { Audio, AVPlaybackStatus } from "expo-av";
import * as MediaLibrary from "expo-media-library";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  uri: string;
  filename: string;
}

interface AudioPlayerState {
  tracks: Track[];
  currentIndex: number;
  currentTrack: Track | null;
  isPlaying: boolean;
  isLoading: boolean;
  position: number;
  duration: number;
  progress: number;
  hasPermission: boolean | null;
  permissionDenied: boolean;
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
  requestPermission: () => Promise<void>;
  loadLibrary: () => Promise<void>;
}

export type UseAudioPlayerReturn = AudioPlayerState & AudioPlayerActions;

export function useAudioPlayer(): UseAudioPlayerReturn {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [position, setPosition] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);

  const soundRef = useRef<Audio.Sound | null>(null);
  const currentIndexRef = useRef<number>(-1);
  const tracksRef = useRef<Track[]>([]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const requestPermission = useCallback(async () => {
    if (Platform.OS === "web") {
      setHasPermission(false);
      return;
    }
    const { status } = await MediaLibrary.requestPermissionsAsync();
    const granted = status === "granted";
    setHasPermission(granted);
    if (!granted) {
      setPermissionDenied(true);
    }
  }, []);

  const loadLibrary = useCallback(async () => {
    if (Platform.OS === "web") {
      setTracks([]);
      return;
    }
    try {
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        first: 500,
        sortBy: [MediaLibrary.SortBy.default],
      });

      const loaded: Track[] = media.assets.map((asset) => ({
        id: asset.id,
        title: asset.filename.replace(/\.[^/.]+$/, ""),
        artist: "Unknown Artist",
        album: "Unknown Album",
        duration: asset.duration,
        uri: asset.uri,
        filename: asset.filename,
      }));

      setTracks(loaded);
    } catch (err) {
      console.warn("Failed to load music library", err);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await requestPermission();
    })();
  }, [requestPermission]);

  useEffect(() => {
    if (hasPermission) {
      loadLibrary();
    }
  }, [hasPermission, loadLibrary]);

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    setPosition(status.positionMillis);
    setDuration(status.durationMillis ?? 0);
    setIsPlaying(status.isPlaying);

    if (status.didJustFinish) {
      const nextIndex = currentIndexRef.current + 1;
      if (nextIndex < tracksRef.current.length) {
        loadAndPlayTrack(nextIndex);
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
        setIsLoading(false);
      } catch (err) {
        console.warn("Failed to load track", err);
        setIsLoading(false);
      }
    },
    [onPlaybackStatusUpdate]
  );

  const play = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.playAsync();
      setIsPlaying(true);
    }
  }, []);

  const pause = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    }
  }, []);

  const togglePlayPause = useCallback(async () => {
    if (isPlaying) {
      await pause();
    } else {
      if (soundRef.current) {
        await play();
      } else if (tracks.length > 0) {
        await loadAndPlayTrack(0);
      }
    }
  }, [isPlaying, play, pause, tracks, loadAndPlayTrack]);

  const playNext = useCallback(async () => {
    const next = currentIndexRef.current + 1;
    if (next < tracksRef.current.length) {
      await loadAndPlayTrack(next);
    }
  }, [loadAndPlayTrack]);

  const playPrevious = useCallback(async () => {
    if (position > 3000) {
      if (soundRef.current) {
        await soundRef.current.setPositionAsync(0);
      }
      return;
    }
    const prev = currentIndexRef.current - 1;
    if (prev >= 0) {
      await loadAndPlayTrack(prev);
    }
  }, [position, loadAndPlayTrack]);

  const playTrack = useCallback(
    async (index: number) => {
      await loadAndPlayTrack(index);
    },
    [loadAndPlayTrack]
  );

  const seekTo = useCallback(async (positionMs: number) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(positionMs);
    }
  }, []);

  const seekForward = useCallback(
    async (seconds = 10) => {
      if (soundRef.current) {
        const newPos = Math.min(position + seconds * 1000, duration);
        await soundRef.current.setPositionAsync(newPos);
      }
    },
    [position, duration]
  );

  const seekBackward = useCallback(
    async (seconds = 10) => {
      if (soundRef.current) {
        const newPos = Math.max(0, position - seconds * 1000);
        await soundRef.current.setPositionAsync(newPos);
      }
    },
    [position]
  );

  const progress = duration > 0 ? position / duration : 0;
  const currentTrack = currentIndex >= 0 ? tracks[currentIndex] ?? null : null;

  return {
    tracks,
    currentIndex,
    currentTrack,
    isPlaying,
    isLoading,
    position,
    duration,
    progress,
    hasPermission,
    permissionDenied,
    play,
    pause,
    togglePlayPause,
    playNext,
    playPrevious,
    playTrack,
    seekTo,
    seekForward,
    seekBackward,
    requestPermission,
    loadLibrary,
  };
}
