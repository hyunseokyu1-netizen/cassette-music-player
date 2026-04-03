import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, {
  Rect,
  Circle,
  Path,
  Defs,
  RadialGradient,
  Stop,
  G,
  Ellipse,
  Line,
} from "react-native-svg";
import { Spool } from "./Spool";
import colors from "@/constants/colors";

interface CassetteTapeProps {
  isPlaying: boolean;
  progress: number;
  title: string;
  artist: string;
  width?: number;
}

export function CassetteTape({
  isPlaying,
  progress,
  title,
  artist,
  width = 320,
}: CassetteTapeProps) {
  const height = width * 0.65;

  const spoolAreaY = height * 0.25;
  const leftSpoolCX = width * 0.28;
  const rightSpoolCX = width * 0.72;
  const spoolCY = spoolAreaY + height * 0.18;

  const maxSpoolRadius = width * 0.14;
  const minSpoolRadius = width * 0.06;

  const leftRadius = maxSpoolRadius - progress * (maxSpoolRadius - minSpoolRadius);
  const rightRadius = minSpoolRadius + progress * (maxSpoolRadius - minSpoolRadius);

  const leftSpoolSize = leftRadius * 2.2;
  const rightSpoolSize = rightRadius * 2.2;

  const windowW = width * 0.54;
  const windowH = height * 0.32;
  const windowX = (width - windowW) / 2;
  const windowY = spoolCY - windowH / 2;
  const windowR = 8;

  const labelW = width * 0.8;
  const labelH = height * 0.28;
  const labelX = (width - labelW) / 2;
  const labelY = height * 0.62;

  const screwR = width * 0.025;
  const screwPositions = [
    { x: width * 0.1, y: height * 0.12 },
    { x: width * 0.9, y: height * 0.12 },
    { x: width * 0.1, y: height * 0.88 },
    { x: width * 0.9, y: height * 0.88 },
  ];

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <RadialGradient id="bodyGrad" cx="50%" cy="30%" r="70%">
            <Stop offset="0%" stopColor="#5c3820" />
            <Stop offset="100%" stopColor="#2c1a0e" />
          </RadialGradient>
          <RadialGradient id="windowGrad" cx="50%" cy="40%" r="60%">
            <Stop offset="0%" stopColor="#1a0f07" />
            <Stop offset="100%" stopColor="#0d0804" />
          </RadialGradient>
        </Defs>

        <Rect
          x={2}
          y={2}
          width={width - 4}
          height={height - 4}
          rx={16}
          ry={16}
          fill="url(#bodyGrad)"
          stroke={colors.light.border}
          strokeWidth={2}
        />

        <Rect
          x={width * 0.04}
          y={height * 0.07}
          width={width * 0.92}
          height={height * 0.86}
          rx={10}
          ry={10}
          fill="none"
          stroke={colors.light.cassetteReelSpoke}
          strokeWidth={0.8}
          opacity={0.4}
        />

        {screwPositions.map((pos, i) => (
          <G key={i}>
            <Circle
              cx={pos.x}
              cy={pos.y}
              r={screwR}
              fill={colors.light.cassetteScrew}
              stroke={colors.light.border}
              strokeWidth={0.8}
            />
            <Line
              x1={pos.x - screwR * 0.6}
              y1={pos.y}
              x2={pos.x + screwR * 0.6}
              y2={pos.y}
              stroke={colors.light.cassetteWindow}
              strokeWidth={1}
              strokeLinecap="round"
            />
          </G>
        ))}

        <Rect
          x={windowX}
          y={windowY}
          width={windowW}
          height={windowH}
          rx={windowR}
          ry={windowR}
          fill="url(#windowGrad)"
          stroke={colors.light.border}
          strokeWidth={1.5}
          opacity={0.95}
        />

        <Rect
          x={windowX + 2}
          y={windowY + 2}
          width={windowW - 4}
          height={windowH - 4}
          rx={windowR - 2}
          ry={windowR - 2}
          fill="none"
          stroke={colors.light.cassetteReelSpoke}
          strokeWidth={0.6}
          opacity={0.3}
        />

        <Path
          d={`M ${width * 0.3} ${spoolCY + 5} Q ${width * 0.5} ${spoolCY + height * 0.07} ${width * 0.7} ${spoolCY + 5}`}
          stroke={colors.light.tape}
          strokeWidth={2.5}
          fill="none"
          opacity={0.6}
        />

        <Rect
          x={labelX}
          y={labelY}
          width={labelW}
          height={labelH}
          rx={4}
          ry={4}
          fill={colors.light.cassetteCream}
          stroke={colors.light.cassetteLabelBorder}
          strokeWidth={1.5}
        />

        <Rect
          x={labelX + 4}
          y={labelY + 4}
          width={labelW - 8}
          height={labelH - 8}
          rx={2}
          ry={2}
          fill="none"
          stroke={colors.light.cassetteLabelBorder}
          strokeWidth={0.7}
          opacity={0.5}
        />

        <Rect
          x={labelX + 8}
          y={labelY + 8}
          width={labelW - 16}
          height={4}
          rx={2}
          fill={colors.light.cassetteAccent}
          opacity={0.6}
        />
      </Svg>

      <View
        style={[
          StyleSheet.absoluteFill,
          {
            alignItems: "center",
            justifyContent: "center",
            top: labelY + 14,
            bottom: height - (labelY + labelH) + 8,
            left: labelX + 10,
            right: width - (labelX + labelW) + 10,
          },
        ]}
      >
        <Text
          style={{
            color: colors.light.cassetteDark,
            fontSize: 11,
            fontWeight: "700" as const,
            textAlign: "center",
            letterSpacing: 1.5,
            textTransform: "uppercase",
          }}
          numberOfLines={1}
        >
          {title || "No Track"}
        </Text>
        <Text
          style={{
            color: colors.light.cassetteAccent,
            fontSize: 9,
            fontWeight: "500" as const,
            textAlign: "center",
            marginTop: 2,
            letterSpacing: 0.8,
          }}
          numberOfLines={1}
        >
          {artist}
        </Text>
      </View>

      <View
        style={{
          position: "absolute",
          left: leftSpoolCX - leftSpoolSize / 2,
          top: spoolCY - leftSpoolSize / 2,
          width: leftSpoolSize,
          height: leftSpoolSize,
        }}
      >
        <Spool size={leftSpoolSize} isPlaying={isPlaying} radius={leftRadius} />
      </View>

      <View
        style={{
          position: "absolute",
          left: rightSpoolCX - rightSpoolSize / 2,
          top: spoolCY - rightSpoolSize / 2,
          width: rightSpoolSize,
          height: rightSpoolSize,
        }}
      >
        <Spool size={rightSpoolSize} isPlaying={isPlaying} radius={rightRadius} />
      </View>
    </View>
  );
}
