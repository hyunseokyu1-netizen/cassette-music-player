# 🎵 Cassette Tape Music Player

> A vintage 1980s-style cassette tape music player for Android, built with Expo (React Native).

[한국어 README →](./README.ko.md)

---

## Overview

Cassette Tape Music Player brings the nostalgic feel of analog cassette tapes to your Android device. Load your own music files into Side A and Side B — just like a real cassette — and enjoy the authentic cassette experience with animated reels, tape noise, and flip animations.

## Screenshots

<p align="center">
  <img src="./screenshots/player-side-a.png" width="28%" alt="Player - Side A" />
  &nbsp;&nbsp;
  <img src="./screenshots/library.png" width="28%" alt="Library" />
  &nbsp;&nbsp;
  <img src="./screenshots/player-side-b.png" width="28%" alt="Player - Side B (Playing)" />
</p>
<p align="center">
  <em>Player (Side A) &nbsp;·&nbsp; Library &nbsp;·&nbsp; Player (Side B, Playing)</em>
</p>

## Features

- **A/B Side System** — 6 tracks per side, just like a real cassette tape
- **Realistic Spool Animation** — reel rotation speed is physically accurate (smaller radius = faster spin), powered by Reanimated worklets
- **Tape Noise** — authentic tape hiss plays between every track change
- **Cassette Flip Animation** — smooth scaleX flip animation when switching between Side A and Side B
- **Background Audio** — continues playing when the screen is off or the app is in the background (via Foreground Service on Android)
- **Track Persistence** — your track list is saved across app restarts via AsyncStorage
- **FF / REW** — fast-forward and rewind with immediate reel speed response
- **Vintage UI** — warm brown/beige color theme inspired by 1980s cassette players

## Tech Stack

| Category | Package |
|---|---|
| Framework | Expo (React Native) |
| Audio | expo-av |
| Animation | react-native-reanimated |
| SVG UI | react-native-svg |
| File Picker | expo-document-picker |
| Background Service | expo-notifications (Foreground Service) |
| Persistence | @react-native-async-storage/async-storage |
| Haptics | expo-haptics |

## Project Structure

```
artifacts/cassette-player/
├── app/
│   ├── player.tsx          # Main player screen
│   └── library.tsx         # A/B track management (6 slots per side)
├── components/
│   ├── CassetteTape.tsx    # SVG cassette body (gradients, screws, rollers, label)
│   ├── Spool.tsx           # Animated reel with physics-based rotation
│   ├── ControlButtons.tsx  # Playback controls (Play, Pause, FF, REW, Flip)
│   └── ProgressBar.tsx     # Track progress display
├── contexts/
│   └── AudioPlayerContext.tsx  # Shared audio state provider
├── hooks/
│   └── useAudioPlayer.ts   # A/B side logic, tape noise, file picker, persistence
└── constants/
    └── colors.ts           # Vintage color theme
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- Expo CLI (`npm install -g expo-cli`)
- Android device or emulator

### Installation

```bash
# Clone the repository
git clone https://github.com/hyunseokyu1-netizen/cassette-music-player.git
cd cassette-music-player

# Install dependencies
pnpm install

# Navigate to the app
cd artifacts/cassette-player
pnpm install
```

### Run

```bash
# Start Expo development server
npx expo start

# Run on Android
npx expo run:android
```

### Build (Production APK)

```bash
# Using EAS Build
eas build --platform android --profile production
```

## How to Use

1. Open the **Library** tab
2. Tap a slot on **Side A** or **Side B** to add a music file
3. Go back to the **Player** tab
4. Press **Play** — the cassette reels will start spinning
5. Use the **Flip** button to switch between Side A and Side B

## Notes

- Uses `expo-document-picker` for file selection (no storage permissions required in Expo Go)
- Does **not** use `expo-media-library` (breaks in Expo Go due to AUDIO permission conflicts)
- Background audio is handled via `expo-notifications` Foreground Service to survive Android Doze mode

## License

MIT
