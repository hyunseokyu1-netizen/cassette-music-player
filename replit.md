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
- **Key packages**: expo-av (audio playback), expo-media-library (local music), react-native-svg (cassette SVG), react-native-reanimated (spool animations), expo-haptics (feedback)
- **Architecture**: 
  - `contexts/AudioPlayerContext.tsx` — shared audio state provider
  - `hooks/useAudioPlayer.ts` — all audio/playback logic
  - `components/CassetteTape.tsx` — main cassette SVG with label
  - `components/Spool.tsx` — animated reel component
  - `components/ControlButtons.tsx` — playback controls
  - `components/ProgressBar.tsx` — progress display
  - `app/player.tsx` — main player screen
  - `app/library.tsx` — music library browser
  - `constants/colors.ts` — vintage brown/beige color theme
