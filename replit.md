# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### Cassette Tape Music Player (`artifacts/cassette-player`)

- **Type**: Expo (React Native) mobile app
- **Preview path**: `/`
- **Description**: Vintage 1980s cassette tape music player for Android with animated cassette UI
- **Key packages**: expo-av (audio), expo-document-picker (file selection, no permissions needed in Expo Go), react-native-svg (SVG cassette body), react-native-reanimated (spool rotation worklets), expo-haptics, @react-native-async-storage/async-storage
- **Features**:
  - A/B side system: Side A = 6 tracks, Side B = 6 tracks (like a real cassette)
  - Tape noise (assets/sounds/tape-noise.wav, 2.2s) plays between every track change
  - Spool rotation speed is physically accurate: smaller radius = faster spin (worklet-based recursive withTiming)
  - Cassette flip animation (scaleX 0→1→0) when switching sides
- **Architecture**: 
  - `contexts/AudioPlayerContext.tsx` — shared audio state provider
  - `hooks/useAudioPlayer.ts` — A/B side logic, tape noise playback, document picker, AsyncStorage persistence
  - `components/CassetteTape.tsx` — realistic SVG cassette body (gradients, screws, guide rollers, label)
  - `components/Spool.tsx` — animated reel with worklet-callback rotation (realistic physics-based speed)
  - `components/ControlButtons.tsx` — playback controls
  - `components/ProgressBar.tsx` — progress display
  - `app/player.tsx` — main player screen with side indicator + flip button + flip animation
  - `app/library.tsx` — A/B slot-based track management (6 slots per side)
  - `constants/colors.ts` — vintage brown/beige color theme
- **Do NOT use**: expo-media-library (breaks in Expo Go due to AUDIO permission), useEffect from react-native-reanimated
