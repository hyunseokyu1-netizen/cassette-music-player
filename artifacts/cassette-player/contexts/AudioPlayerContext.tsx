import * as Notifications from "expo-notifications";
import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useAudioPlayer, UseAudioPlayerReturn } from "@/hooks/useAudioPlayer";

const AudioPlayerContext = createContext<UseAudioPlayerReturn | null>(null);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const player = useAudioPlayer();

  // 알림 액션 버튼(⏸/▶/⏭) 응답 리스너
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const action = response.actionIdentifier;
      if (action === "pause") player.pause();
      else if (action === "play") player.play();
      else if (action === "next") player.playNext();
    });
    return () => sub.remove();
  }, [player.pause, player.play, player.playNext]);

  return (
    <AudioPlayerContext.Provider value={player}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayerContext(): UseAudioPlayerReturn {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error("useAudioPlayerContext must be inside AudioPlayerProvider");
  return ctx;
}
