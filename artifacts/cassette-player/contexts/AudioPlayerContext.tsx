import React, { createContext, useContext, ReactNode } from "react";
import { useAudioPlayer, UseAudioPlayerReturn } from "@/hooks/useAudioPlayer";

const AudioPlayerContext = createContext<UseAudioPlayerReturn | null>(null);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const player = useAudioPlayer();
  return (
    <AudioPlayerContext.Provider value={player}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayerContext(): UseAudioPlayerReturn {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error("useAudioPlayerContext must be used inside AudioPlayerProvider");
  return ctx;
}
