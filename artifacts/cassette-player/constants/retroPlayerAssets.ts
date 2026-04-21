import type { ImageSourcePropType } from "react-native";

const SPRITE = require("../assets/images/retro-player/Gemini_Generated_Image_r08fy8r08fy8r08f.png");
const SHEET_W = 1440;
const SHEET_H = 2970;

export interface SpriteCrop {
  source: ImageSourcePropType;
  sheetW: number;
  sheetH: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface RetroPlayerAssetSources {
  cassetteBody?: SpriteCrop;
  leftReel?: SpriteCrop;
  rightReel?: SpriteCrop;
  rewindButton?: SpriteCrop;
  playButton?: SpriteCrop;
  playButtonActive?: SpriteCrop;
  fastForwardButton?: SpriteCrop;
}

export interface RetroPlayerLayout {
  cassetteAspectRatio: number;
  leftReel: { x: number; y: number; size: number };
  rightReel: { x: number; y: number; size: number };
  labelArea: { x: number; y: number; width: number; height: number };
}

export interface RetroPlayerAssetPack {
  enabled: boolean;
  sources: RetroPlayerAssetSources;
  layout: RetroPlayerLayout;
}

function crop(x: number, y: number, w: number, h: number): SpriteCrop {
  return { source: SPRITE, sheetW: SHEET_W, sheetH: SHEET_H, x, y, w, h };
}

export const retroPlayerAssets: RetroPlayerAssetPack = {
  enabled: true,
  sources: {
    cassetteBody:      crop(0,   0,    1440, 1039),
    leftReel:          crop(0,   1039, 720,  742),
    rightReel:         crop(720, 1039, 720,  742),
    rewindButton:      crop(0,   1782, 720,  475),
    playButton:        crop(720, 1782, 720,  475),
    playButtonActive:  crop(0,   2257, 720,  475),
    fastForwardButton: crop(720, 2257, 720,  475),
  },
  layout: {
    // 카세트 본체 종횡비 (1440 / 1039 ≈ 1.386)
    cassetteAspectRatio: 1440 / 1039,
    // 릴 중심 위치 및 크기 (카세트 표시 폭 대비 비율)
    leftReel:  { x: 0.27, y: 0.40, size: 0.25 },
    rightReel: { x: 0.73, y: 0.40, size: 0.25 },
    // 곡 목록 레이블 영역
    labelArea: { x: 0.18, y: 0.52, width: 0.64, height: 0.32 },
  },
};

export function hasRetroCassetteAssets(): boolean {
  return Boolean(
    retroPlayerAssets.enabled &&
      retroPlayerAssets.sources.cassetteBody &&
      retroPlayerAssets.sources.leftReel &&
      retroPlayerAssets.sources.rightReel
  );
}

export function hasRetroControlAssets(): boolean {
  return Boolean(
    retroPlayerAssets.enabled &&
      retroPlayerAssets.sources.rewindButton &&
      retroPlayerAssets.sources.playButton &&
      retroPlayerAssets.sources.playButtonActive &&
      retroPlayerAssets.sources.fastForwardButton
  );
}
