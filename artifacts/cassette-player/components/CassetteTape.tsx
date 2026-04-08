import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, {
  Rect, Circle, Path, Line, Defs,
  LinearGradient, RadialGradient, Stop, G, Ellipse,
} from "react-native-svg";
import { Spool } from "./Spool";
import type { Side } from "@/hooks/useAudioPlayer";

interface CassetteTapeProps {
  isPlaying: boolean;
  isTransitioning: boolean;
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
  isPlaying, isTransitioning, progress, side, title, tracks, width = 340,
}: CassetteTapeProps) {
  const scale = width / 340;
  const H = Math.round(200 * scale);
  const W = width;
  const s = scale;

  const leftRadius = MIN_SPOOL_R + (1 - progress) * (MAX_SPOOL_R - MIN_SPOOL_R);
  const rightRadius = MIN_SPOOL_R + progress * (MAX_SPOOL_R - MIN_SPOOL_R);

  const leftSpoolCX = 107 * s;
  const leftSpoolCY = 107 * s;
  const rightSpoolCX = 233 * s;
  const rightSpoolCY = 107 * s;

  const labelX = 26 * s, labelY = 8 * s;
  const labelW = 288 * s, labelH = 52 * s;

  const winX = 28 * s, winY = 65 * s;
  const winW = 284 * s, winH = 92 * s;
  const winR = 6 * s;

  const guideR = 5 * s;
  const leftGuideX = winX + 20 * s;
  const rightGuideX = winX + winW - 20 * s;
  const guideY = winY + winH - 14 * s;

  const screwR = 6 * s;
  const screws = [
    { x: 14 * s, y: 14 * s },
    { x: 326 * s, y: 14 * s },
    { x: 14 * s, y: 186 * s },
    { x: 326 * s, y: 186 * s },
  ];

  const mechY = winY + winH + 6 * s;
  const holes = [
    { x: 70 * s }, { x: 110 * s }, { x: 170 * s }, { x: 230 * s }, { x: 270 * s },
  ];

  const sideColor = side === "A" ? "#9e3c3c" : "#2b5499";
  const sideLightColor = side === "A" ? "#c05050" : "#3a6abb";

  return (
    <View style={{ width: W, height: H }}>
      <Svg width={W} height={H}>
        <Defs>
          <LinearGradient id="bodyGrad" x1="0" y1="0" x2="0.2" y2="1">
            <Stop offset="0%" stopColor="#242220" />
            <Stop offset="35%" stopColor="#1a1816" />
            <Stop offset="100%" stopColor="#121010" />
          </LinearGradient>
          <LinearGradient id="bodySheen" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="rgba(255,255,255,0.04)" />
            <Stop offset="50%" stopColor="rgba(255,255,255,0.0)" />
            <Stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
          </LinearGradient>
          <LinearGradient id="labelGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#f8f3e8" />
            <Stop offset="100%" stopColor="#ece5d5" />
          </LinearGradient>
          <LinearGradient id="winGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#0e0d0b" />
            <Stop offset="100%" stopColor="#090807" />
          </LinearGradient>
          <LinearGradient id="winGlass" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="rgba(255,220,150,0.06)" />
            <Stop offset="40%" stopColor="rgba(0,0,0,0)" />
          </LinearGradient>
          <LinearGradient id="screwGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#b8b0a0" />
            <Stop offset="50%" stopColor="#888078" />
            <Stop offset="100%" stopColor="#605850" />
          </LinearGradient>
          <LinearGradient id="guideGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#a09888" />
            <Stop offset="100%" stopColor="#504840" />
          </LinearGradient>
          <RadialGradient id="screwRad" cx="35%" cy="35%" r="65%">
            <Stop offset="0%" stopColor="#c0b8a8" />
            <Stop offset="100%" stopColor="#585050" />
          </RadialGradient>
        </Defs>

        {/* Main body */}
        <Rect x={1} y={1} width={W - 2} height={H - 2} rx={13 * s} ry={13 * s}
          fill="url(#bodyGrad)" stroke="#2e2c28" strokeWidth={1.5} />

        {/* Body sheen */}
        <Rect x={1} y={1} width={W - 2} height={H - 2} rx={13 * s} ry={13 * s}
          fill="url(#bodySheen)" />

        {/* Label background */}
        <Rect x={labelX} y={labelY} width={labelW} height={labelH}
          rx={4 * s} ry={4 * s}
          fill="url(#labelGrad)" stroke="#c8bfa8" strokeWidth={0.8} />

        {/* Label top stripe (side color) */}
        <Rect x={labelX} y={labelY} width={labelW} height={10 * s}
          rx={4 * s} ry={4 * s} fill={sideColor} opacity={0.85} />
        <Rect x={labelX} y={labelY + 6 * s} width={labelW} height={4 * s} fill={sideColor} opacity={0.85} />

        {/* Label ruling lines */}
        <Line x1={labelX + 8 * s} y1={labelY + 28 * s}
          x2={labelX + labelW - 8 * s} y2={labelY + 28 * s}
          stroke="rgba(120,100,60,0.25)" strokeWidth={0.6} />
        <Line x1={labelX + 8 * s} y1={labelY + 38 * s}
          x2={labelX + labelW - 8 * s} y2={labelY + 38 * s}
          stroke="rgba(120,100,60,0.18)" strokeWidth={0.5} />

        {/* Side indicator pill on label */}
        <Rect x={labelX + 8 * s} y={labelY + 14 * s}
          width={22 * s} height={26 * s} rx={3 * s} ry={3 * s}
          fill={sideLightColor} opacity={0.9} />

        {/* "90" tape length indicator on right */}
        <Rect x={labelX + labelW - 32 * s} y={labelY + 14 * s}
          width={24 * s} height={26 * s} rx={3 * s} ry={3 * s}
          fill="rgba(0,0,0,0.08)" />

        {/* Window opening */}
        <Rect x={winX} y={winY} width={winW} height={winH}
          rx={winR} ry={winR}
          fill="url(#winGrad)" stroke="#0a0908" strokeWidth={2} />

        {/* Window inner bevel */}
        <Rect x={winX + 2} y={winY + 2} width={winW - 4} height={winH - 4}
          rx={winR - 1} ry={winR - 1} fill="none"
          stroke="rgba(255,200,100,0.06)" strokeWidth={1} />

        {/* Window glass sheen */}
        <Rect x={winX + 2} y={winY + 2} width={winW - 4} height={winH / 3}
          rx={winR - 1} ry={winR - 1} fill="url(#winGlass)" />

        {/* Window outer bevel (light top edge) */}
        <Path
          d={`M ${winX + winR} ${winY} L ${winX + winW - winR} ${winY}`}
          stroke="rgba(255,255,255,0.08)" strokeWidth={1.2} strokeLinecap="round" />

        {/* Tape path line */}
        <Path
          d={`M ${leftGuideX + guideR * 1.6} ${guideY} L ${rightGuideX - guideR * 1.6} ${guideY}`}
          stroke="#1a1208" strokeWidth={3.5 * s} strokeLinecap="round" opacity={0.95} />
        <Path
          d={`M ${leftGuideX + guideR * 1.6} ${guideY} L ${rightGuideX - guideR * 1.6} ${guideY}`}
          stroke="rgba(140,90,30,0.25)" strokeWidth={1.5 * s} strokeLinecap="round" />

        {/* Guide rollers */}
        <Circle cx={leftGuideX} cy={guideY} r={guideR}
          fill="url(#guideGrad)" stroke="#303028" strokeWidth={1} />
        <Circle cx={leftGuideX} cy={guideY} r={guideR * 0.42} fill="#282420" />
        <Circle cx={rightGuideX} cy={guideY} r={guideR}
          fill="url(#guideGrad)" stroke="#303028" strokeWidth={1} />
        <Circle cx={rightGuideX} cy={guideY} r={guideR * 0.42} fill="#282420" />

        {/* Mechanism area below window */}
        {/* Center notch / head gap */}
        <Rect x={W / 2 - 18 * s} y={mechY} width={36 * s} height={20 * s}
          rx={3 * s} ry={3 * s} fill="#0a0908" stroke="#252320" strokeWidth={1} />

        {/* Drive spindle access holes */}
        {holes.map((h, i) => (
          <Ellipse key={i} cx={h.x} cy={mechY + 10 * s} rx={6 * s} ry={7 * s}
            fill="#0a0908" stroke="#252320" strokeWidth={1} />
        ))}

        {/* Corner screws */}
        {screws.map((sc, i) => (
          <G key={i}>
            <Circle cx={sc.x} cy={sc.y} r={screwR}
              fill="url(#screwRad)" stroke="#3a3830" strokeWidth={0.8} />
            <Line x1={sc.x - screwR * 0.6} y1={sc.y}
              x2={sc.x + screwR * 0.6} y2={sc.y}
              stroke="rgba(0,0,0,0.5)" strokeWidth={1.2} strokeLinecap="round" />
            <Line x1={sc.x} y1={sc.y - screwR * 0.6}
              x2={sc.x} y2={sc.y + screwR * 0.6}
              stroke="rgba(0,0,0,0.5)" strokeWidth={1.2} strokeLinecap="round" />
          </G>
        ))}

        {/* Outer highlight rim */}
        <Rect x={2} y={2} width={W - 4} height={H - 4} rx={12 * s} ry={12 * s}
          fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
      </Svg>

      {/* Label text overlays */}
      <View style={{
        position: "absolute",
        left: labelX + 36 * s,
        top: labelY + 13 * s,
        right: 40 * s,
      }}>
        <Text style={[styles.sideBadgeText, { fontSize: 7 * s, color: sideColor }]}>
          {`SIDE ${side}`}
        </Text>
        <Text style={[styles.trackTitle, { fontSize: 10 * s }]} numberOfLines={1}>
          {title || "NO TRACK LOADED"}
        </Text>
      </View>

      {/* Side letter in pill */}
      <View style={{
        position: "absolute",
        left: labelX + 8 * s,
        top: labelY + 14 * s,
        width: 22 * s,
        height: 26 * s,
        alignItems: "center",
        justifyContent: "center",
      }}>
        <Text style={[styles.sideLetter, { fontSize: 14 * s }]}>{side}</Text>
      </View>

      {/* "90" text */}
      <View style={{
        position: "absolute",
        right: (W - labelX - labelW) + 4 * s,
        top: labelY + 14 * s,
        width: 24 * s,
        height: 26 * s,
        alignItems: "center",
        justifyContent: "center",
      }}>
        <Text style={[styles.tapeLen, { fontSize: 9 * s }]}>90</Text>
      </View>

      {/* Status indicator */}
      <View style={{
        position: "absolute",
        left: winX + 8 * s,
        top: winY + 6 * s,
      }}>
        <Text style={[styles.statusText, { fontSize: 7 * s }]}>
          {isTransitioning ? "■■ LOADING" : isPlaying ? "▶ PLAY" : "■ STOP"}
        </Text>
      </View>

      {/* Left spool */}
      <View style={{
        position: "absolute",
        left: leftSpoolCX - SPOOL_BOX * s / 2,
        top: leftSpoolCY - SPOOL_BOX * s / 2,
        width: SPOOL_BOX * s,
        height: SPOOL_BOX * s,
      }}>
        <Spool
          size={SPOOL_BOX * s}
          radius={leftRadius * s}
          maxRadius={MAX_SPOOL_R * s}
          isPlaying={isPlaying || isTransitioning}
        />
      </View>

      {/* Right spool */}
      <View style={{
        position: "absolute",
        left: rightSpoolCX - SPOOL_BOX * s / 2,
        top: rightSpoolCY - SPOOL_BOX * s / 2,
        width: SPOOL_BOX * s,
        height: SPOOL_BOX * s,
      }}>
        <Spool
          size={SPOOL_BOX * s}
          radius={rightRadius * s}
          maxRadius={MAX_SPOOL_R * s}
          isPlaying={isPlaying || isTransitioning}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sideBadgeText: {
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  trackTitle: {
    color: "#2c1a0e",
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  sideLetter: {
    color: "#ffffff",
    fontFamily: "Inter_700Bold",
  },
  tapeLen: {
    color: "#5c4428",
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  statusText: {
    color: "rgba(180,160,100,0.5)",
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
});
