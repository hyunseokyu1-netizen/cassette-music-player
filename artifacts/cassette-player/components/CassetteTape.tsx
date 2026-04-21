import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, {
  Rect, Circle, Path, Line, Defs,
  LinearGradient, RadialGradient, Stop, G, Ellipse,
} from "react-native-svg";
import { Spool } from "./Spool";
import { SpriteView } from "./SpriteView";
import type { Side } from "@/hooks/useAudioPlayer";
import { hasRetroCassetteAssets, retroPlayerAssets } from "@/constants/retroPlayerAssets";

interface CassetteTapeProps {
  isPlaying: boolean;
  isTransitioning: boolean;
  isFastForward?: boolean;
  isRewind?: boolean;
  progress: number;
  side: Side;
  title: string;
  tracks: string[];
  width?: number;
}

const MAX_SPOOL_R = 40;
const MIN_SPOOL_R = 9;
const SPOOL_BOX = 90;

export function CassetteTape({
  isPlaying, isTransitioning, isFastForward = false, isRewind = false,
  progress, side, title, tracks, width = 340,
}: CassetteTapeProps) {
  if (hasRetroCassetteAssets()) {
    return (
      <ImageCassetteTape
        isPlaying={isPlaying}
        isTransitioning={isTransitioning}
        isFastForward={isFastForward}
        isRewind={isRewind}
        progress={progress}
        side={side}
        title={title}
        tracks={tracks}
        width={width}
      />
    );
  }

  const scale = width / 340;
  const H = Math.round(200 * scale);
  const W = width;

  const s = scale;

  const leftRadius = MIN_SPOOL_R + (1 - progress) * (MAX_SPOOL_R - MIN_SPOOL_R);
  const rightRadius = MIN_SPOOL_R + progress * (MAX_SPOOL_R - MIN_SPOOL_R);

  const leftSpoolCX = 107 * s;
  const leftSpoolCY = 53 * s;
  const rightSpoolCX = 233 * s;
  const rightSpoolCY = 53 * s;

  const winX = 56 * s, winY = 11 * s;
  const winW = 228 * s, winH = 100 * s;
  const winR = 9 * s;
  const winBotY = winY + winH;

  const guideR = 5 * s;
  const leftGuideX = winX + 16 * s;
  const rightGuideX = winX + winW - 16 * s;
  const guideY = winY + winH - 18 * s;

  const screwR = 6 * s;
  const screws = [
    { x: 17 * s, y: 16 * s },
    { x: 323 * s, y: 16 * s },
    { x: 17 * s, y: 184 * s },
    { x: 323 * s, y: 184 * s },
  ];

  const labelX = 32 * s, labelY = 118 * s;
  const labelW = 276 * s, labelH = 72 * s;
  const sideColor = side === "A" ? "#7a2d2d" : "#1e3d6e";
  const sideBg = side === "A" ? "#9e3c3c" : "#2b5499";

  return (
    <View style={{ width: W, height: H }}>
      <Svg width={W} height={H}>
        <Defs>
          <LinearGradient id="bodyGrad" x1="0" y1="0" x2="0.3" y2="1">
            <Stop offset="0%" stopColor="#2e1608" />
            <Stop offset="40%" stopColor="#1c0e04" />
            <Stop offset="100%" stopColor="#120903" />
          </LinearGradient>
          <LinearGradient id="bodyEdge" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#3d2010" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#0d0602" stopOpacity="0.8" />
          </LinearGradient>
          <LinearGradient id="winGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#100804" />
            <Stop offset="100%" stopColor="#080401" />
          </LinearGradient>
          <LinearGradient id="winGlass" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="rgba(255,200,130,0.08)" />
            <Stop offset="35%" stopColor="rgba(255,200,130,0)" />
          </LinearGradient>
          <LinearGradient id="screwGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#6b4020" />
            <Stop offset="100%" stopColor="#2c1408" />
          </LinearGradient>
          <RadialGradient id="labelGrad" cx="50%" cy="50%" r="75%">
            <Stop offset="0%" stopColor="#f0e0c0" />
            <Stop offset="100%" stopColor="#e8d4a8" />
          </RadialGradient>
        </Defs>

        <Rect x={1} y={1} width={W - 2} height={H - 2} rx={15 * s} ry={15 * s}
          fill="url(#bodyGrad)" stroke="#4a2810" strokeWidth={2} />

        <Rect x={6 * s} y={6 * s} width={W - 12 * s} height={H - 12 * s}
          rx={11 * s} ry={11 * s} fill="none"
          stroke="rgba(255,180,80,0.06)" strokeWidth={1} />

        <Rect x={winX} y={winY} width={winW} height={winH} rx={winR} ry={winR}
          fill="url(#winGrad)" stroke="#3d1f08" strokeWidth={2.5} />

        <Rect x={winX + 2} y={winY + 2} width={winW - 4} height={winH / 2}
          rx={winR - 2} ry={winR - 2} fill="url(#winGlass)" />

        <Rect x={winX + 1} y={winY + 1} width={winW - 2} height={winH - 2}
          rx={winR - 1} ry={winR - 1} fill="none"
          stroke="rgba(255,180,80,0.12)" strokeWidth={0.8} />

        <Path
          d={`M ${leftGuideX + guideR * 1.5} ${guideY} L ${rightGuideX - guideR * 1.5} ${guideY}`}
          stroke="#0d0703" strokeWidth={3 * s} strokeLinecap="round" opacity={0.9}
        />
        <Path
          d={`M ${leftGuideX + guideR * 1.5} ${guideY} L ${rightGuideX - guideR * 1.5} ${guideY}`}
          stroke="rgba(120,70,20,0.3)" strokeWidth={1.5 * s} strokeLinecap="round"
        />

        <Circle cx={leftGuideX} cy={guideY} r={guideR}
          fill="#241208" stroke="#4a2810" strokeWidth={1.2} />
        <Circle cx={leftGuideX} cy={guideY} r={guideR * 0.45} fill="#4a2810" />

        <Circle cx={rightGuideX} cy={guideY} r={guideR}
          fill="#241208" stroke="#4a2810" strokeWidth={1.2} />
        <Circle cx={rightGuideX} cy={guideY} r={guideR * 0.45} fill="#4a2810" />

        {[{ x: W / 2 - 9 * s, y: 5 * s }, { x: W / 2 + 9 * s, y: 5 * s }].map((h, i) => (
          <Ellipse key={i} cx={h.x} cy={h.y} rx={5 * s} ry={4 * s}
            fill="#0d0602" stroke="#2e1608" strokeWidth={1} />
        ))}

        {screws.map((sc, i) => (
          <G key={i}>
            <Circle cx={sc.x} cy={sc.y} r={screwR}
              fill="url(#screwGrad)" stroke="#5a3018" strokeWidth={1} />
            <Line x1={sc.x - screwR * 0.55} y1={sc.y - screwR * 0.55}
              x2={sc.x + screwR * 0.55} y2={sc.y + screwR * 0.55}
              stroke="#1a0a04" strokeWidth={1.2} strokeLinecap="round" />
            <Line x1={sc.x + screwR * 0.55} y1={sc.y - screwR * 0.55}
              x2={sc.x - screwR * 0.55} y2={sc.y + screwR * 0.55}
              stroke="#1a0a04" strokeWidth={1.2} strokeLinecap="round" />
          </G>
        ))}

        <Rect x={labelX} y={labelY} width={labelW} height={labelH}
          rx={4 * s} ry={4 * s} fill="url(#labelGrad)"
          stroke="#c8a870" strokeWidth={1.2} />

        <Rect x={labelX} y={labelY} width={labelW} height={18 * s}
          rx={4 * s} ry={4 * s} fill={sideBg} />
        <Rect x={labelX} y={labelY + 14 * s} width={labelW} height={4 * s} fill={sideBg} />

        <Line x1={labelX + 6 * s} y1={labelY + 30 * s}
          x2={labelX + labelW - 6 * s} y2={labelY + 30 * s}
          stroke="rgba(160,120,60,0.4)" strokeWidth={0.8} />
        <Line x1={labelX + 6 * s} y1={labelY + 42 * s}
          x2={labelX + labelW - 6 * s} y2={labelY + 42 * s}
          stroke="rgba(160,120,60,0.25)" strokeWidth={0.6} />
        <Line x1={labelX + 6 * s} y1={labelY + 52 * s}
          x2={labelX + labelW - 6 * s} y2={labelY + 52 * s}
          stroke="rgba(160,120,60,0.25)" strokeWidth={0.6} />

        <Rect x={1} y={1} width={W - 2} height={H - 2} rx={15 * s} ry={15 * s}
          fill="none" stroke="rgba(255,220,140,0.07)" strokeWidth={1} />
      </Svg>

      <View
        style={{
          position: "absolute",
          left: labelX + 8 * s,
          top: labelY + 2 * s,
          width: labelW - 16 * s,
          height: 16 * s,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={[styles.sideLabel, { fontSize: 8 * s, color: "rgba(255,255,255,0.9)" }]}>
          {`◄ SIDE ${side} ►`}
        </Text>
        <Text style={[styles.sideLabel, { fontSize: 7 * s, color: "rgba(255,255,255,0.6)" }]}>
          {isTransitioning ? "■■ LOADING" : isPlaying ? "▶ PLAY" : "■ STOP"}
        </Text>
      </View>

      <View
        style={{
          position: "absolute",
          left: labelX + 6 * s,
          top: labelY + 22 * s,
          width: labelW - 12 * s,
          height: 50 * s,
          flexDirection: "row",
          overflow: "hidden",
        }}
      >
        {(() => {
          const availableH = 42 * s;
          const colW = (labelW - 16 * s) / 2;
          const count = tracks.length;
          const half = Math.ceil(count / 2);
          const rowsPerCol = Math.max(1, half);
          const rawFont = Math.min(7.5 * s, availableH / (rowsPerCol * 1.2));
          const fontSize = Math.max(5, rawFont);
          const lineH = fontSize * 1.2;
          const col1 = tracks.slice(0, half);
          const col2 = tracks.slice(half);
          const renderCol = (items: string[], offset: number) => (
            <View style={{ width: colW, overflow: "hidden" }}>
              {items.length === 0
                ? <Text style={[styles.trackLine, { fontSize, lineHeight: lineH }]}>—</Text>
                : items.map((t, i) => (
                  <Text
                    key={i}
                    style={[styles.trackLine, { fontSize, lineHeight: lineH }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {`${offset + i + 1}. ${t}`}
                  </Text>
                ))
              }
            </View>
          );
          return (
            <>
              {renderCol(col1, 0)}
              <View style={{ width: 1, backgroundColor: "transparent", marginHorizontal: 2 * s }} />
              {renderCol(col2, half)}
            </>
          );
        })()}
      </View>

      <View
        style={{
          position: "absolute",
          left: leftSpoolCX - SPOOL_BOX * s / 2,
          top: leftSpoolCY - SPOOL_BOX * s / 2,
          width: SPOOL_BOX * s,
          height: SPOOL_BOX * s,
        }}
      >
        <Spool
          size={SPOOL_BOX * s}
          radius={leftRadius * s}
          maxRadius={MAX_SPOOL_R * s}
          isPlaying={isPlaying || isTransitioning || isFastForward || isRewind}
          clockwise={isRewind}
          spinFast={isFastForward || isRewind}
        />
      </View>

      <View
        style={{
          position: "absolute",
          left: rightSpoolCX - SPOOL_BOX * s / 2,
          top: rightSpoolCY - SPOOL_BOX * s / 2,
          width: SPOOL_BOX * s,
          height: SPOOL_BOX * s,
        }}
      >
        <Spool
          size={SPOOL_BOX * s}
          radius={rightRadius * s}
          maxRadius={MAX_SPOOL_R * s}
          isPlaying={isPlaying || isTransitioning || isFastForward || isRewind}
          clockwise={isRewind}
          spinFast={isFastForward || isRewind}
        />
      </View>
    </View>
  );
}

function ImageCassetteTape({
  isPlaying,
  isTransitioning,
  isFastForward = false,
  isRewind = false,
  progress,
  side,
  title,
  tracks,
  width = 340,
}: CassetteTapeProps) {
  const { layout, sources } = retroPlayerAssets;
  const height = width / layout.cassetteAspectRatio;
  const status = isTransitioning ? "LOADING" : isPlaying ? "PLAYING" : "STOPPED";
  const leftReelSize = width * layout.leftReel.size;
  const rightReelSize = width * layout.rightReel.size;
  const leftReelX = width * layout.leftReel.x - leftReelSize / 2;
  const leftReelY = height * layout.leftReel.y - leftReelSize / 2;
  const rightReelX = width * layout.rightReel.x - rightReelSize / 2;
  const rightReelY = height * layout.rightReel.y - rightReelSize / 2;
  const labelStyle = {
    left: width * layout.labelArea.x,
    top: height * layout.labelArea.y,
    width: width * layout.labelArea.width,
    height: height * layout.labelArea.height,
  };

  return (
    <View style={{ width, height }}>
      {sources.cassetteBody && (
        <SpriteView crop={sources.cassetteBody} width={width} height={height} />
      )}

      <View style={[styles.reelLayer, { left: leftReelX, top: leftReelY, width: leftReelSize, height: leftReelSize }]}>
        <Spool
          size={leftReelSize}
          radius={leftReelSize / 2}
          maxRadius={leftReelSize / 2}
          isPlaying={isPlaying || isTransitioning || isFastForward || isRewind}
          clockwise={isRewind}
          spinFast={isFastForward || isRewind}
          spriteCrop={sources.leftReel}
        />
      </View>

      <View style={[styles.reelLayer, { left: rightReelX, top: rightReelY, width: rightReelSize, height: rightReelSize }]}>
        <Spool
          size={rightReelSize}
          radius={rightReelSize / 2}
          maxRadius={rightReelSize / 2}
          isPlaying={isPlaying || isTransitioning || isFastForward || isRewind}
          clockwise={isRewind}
          spinFast={isFastForward || isRewind}
          spriteCrop={sources.rightReel}
        />
      </View>

      <View style={[styles.labelOverlay, labelStyle]}>
        <Text style={styles.imageCassetteSide}>SIDE {side}</Text>
        <Text style={styles.imageCassetteStatus}>{status}</Text>
        <Text numberOfLines={1} style={styles.imageCassetteTitle}>
          {title || "Cassette mix"}
        </Text>
        <Text numberOfLines={2} style={styles.imageCassetteTracks}>
          {(tracks.length ? tracks.slice(0, 4) : ["No tracks"]).join("  •  ")}
        </Text>
      </View>

      <View style={[styles.windowShadow, { opacity: 0.08 + progress * 0.18 }]} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  reelLayer: {
    position: "absolute",
  },
  labelOverlay: {
    position: "absolute",
    justifyContent: "flex-start",
    gap: 2,
  },
  imageCassetteSide: {
    color: "#2a241d",
    fontFamily: "Inter_700Bold",
    fontSize: 9,
    letterSpacing: 1.2,
  },
  imageCassetteStatus: {
    color: "rgba(42,36,29,0.7)",
    fontFamily: "Inter_600SemiBold",
    fontSize: 8,
    letterSpacing: 1,
  },
  imageCassetteTitle: {
    color: "#211b16",
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 0.3,
  },
  imageCassetteTracks: {
    color: "rgba(42,36,29,0.72)",
    fontFamily: "Inter_500Medium",
    fontSize: 8,
    lineHeight: 10,
  },
  windowShadow: {
    position: "absolute",
    left: "38%",
    top: "34%",
    width: "24%",
    height: "14%",
    borderRadius: 8,
    backgroundColor: "#000",
  },
  sideLabel: {
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
  },
  trackTitle: {
    color: "#2c1a0e",
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  trackLine: {
    color: "#5c3820",
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
  },
});
