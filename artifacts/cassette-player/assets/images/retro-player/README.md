# Retro Player Assets

Drop the user-provided transparent PNG slices here and then wire them in:

- `cassette-body.png`
- `reel-left.png`
- `reel-right.png`
- `btn-rewind.png`
- `btn-play.png`
- `btn-play-active.png`
- `btn-ff.png`

After adding the files, update:

- [constants/retroPlayerAssets.ts](../../../constants/retroPlayerAssets.ts)

Set `enabled: true` and replace the commented example `require(...)` lines with the actual imports.
