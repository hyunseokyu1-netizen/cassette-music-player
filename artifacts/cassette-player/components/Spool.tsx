import React, { useEffect } from "react";
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
  useAnimatedStyle,
} from "react-native-reanimated";
import { View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import colors from "@/constants/colors";

interface SpoolProps {
  size: number;
  isPlaying: boolean;
  radius: number;
}

export function Spool({ size, isPlaying, radius }: SpoolProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (isPlaying) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1800, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      cancelAnimation(rotation);
    }
  }, [isPlaying]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const cx = size / 2;
  const cy = size / 2;
  const hubRadius = radius * 0.32;
  const spokeCount = 5;

  const spokeLines = Array.from({ length: spokeCount }).map((_, i) => {
    const angle = (i * 360) / spokeCount;
    const rad = (angle * Math.PI) / 180;
    const innerR = hubRadius;
    const outerR = radius * 0.52;
    return {
      x1: cx + innerR * Math.cos(rad),
      y1: cy + innerR * Math.sin(rad),
      x2: cx + outerR * Math.cos(rad),
      y2: cy + outerR * Math.sin(rad),
    };
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ position: "absolute", top: 0, left: 0 }}>
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          fill={colors.light.cassetteReel}
          stroke={colors.light.cassetteReelSpoke}
          strokeWidth={1.5}
        />
        <Circle
          cx={cx}
          cy={cy}
          r={radius * 0.55}
          fill={colors.light.cassetteWindow}
          stroke={colors.light.cassetteReelSpoke}
          strokeWidth={1}
        />
      </Svg>

      <Animated.View
        style={[
          {
            position: "absolute",
            width: size,
            height: size,
            top: 0,
            left: 0,
          },
          animatedStyle,
        ]}
      >
        <Svg width={size} height={size}>
          {spokeLines.map((line, i) => (
            <Line
              key={i}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={colors.light.cassetteReelSpoke}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          ))}
          <Circle
            cx={cx}
            cy={cy}
            r={hubRadius}
            fill={colors.light.cassetteReelSpoke}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}
