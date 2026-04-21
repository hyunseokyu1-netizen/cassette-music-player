# Cassette Hybrid Concept

## Goal

Create a retro cassette player UI that keeps the tactile, worn paper-and-plastic mood of the reference image while preserving live interaction for reel motion, tape progress, play-state glow, and side switching.

## Recommended Layer Model

1. Static body image
   Use a high resolution cassette/deck image as the visual base.

2. Dynamic reel layer
   Place left and right reel assets on top of the body image and animate rotation independently.

3. Window motion layer
   Add subtle tape-shadow movement and gloss inside the center window only.

4. Text overlay layer
   Render title, side badge, elapsed time, and optional small metadata in React Native text.

5. Control state layer
   Swap button states or add glow overlays for `PLAY`, `REW`, and `FF`.

## Coordinate Strategy

- Use a single fixed aspect ratio for the cassette area.
- Define reel centers and control hit areas as percentages, not raw pixels.
- Keep all moving parts inside a `CassetteTapeImage` component so `player.tsx` stays mostly unchanged.

## Proposed Implementation Split

- `components/CassetteTape.tsx`
  Replace SVG body drawing with image-based layering.

- `components/Spool.tsx`
  Keep rotation logic, but allow image-render mode instead of SVG spokes.

- `components/ControlButtons.tsx`
  Replace generic deck buttons with image-backed hardware buttons.

- `constants/colors.ts`
  Shift palette toward warm paper, oxidized metal, amber glow, and muted charcoal.

## Visual Notes

- Paper should read as aged, fibrous, and slightly stained.
- Plastic should feel smoked and dense, not glossy-modern.
- Motion should be quiet and smooth, with no sharp UI-style transitions.
- The active play state should feel like a small analog bulb, not a neon LED.

