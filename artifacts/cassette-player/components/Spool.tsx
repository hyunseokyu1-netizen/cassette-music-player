import React, { useEffect } from "react";
import Animated, {
  cancelAnimation,
  Easing,
  runOnUI,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Line, G, Defs, RadialGradient, Stop } from "react-native-svg";
import colors from "@/constants/colors";
import type { SpriteCrop } from "@/constants/retroPlayerAssets";
import { SpriteView } from "./SpriteView";

interface SpoolProps {
  size: number;
  radius: number;
  maxRadius: number;
  isPlaying: boolean;
  clockwise?: boolean;
  spinFast?: boolean;
  spriteCrop?: SpriteCrop;
}

export function Spool({
  size,
  radius,
  maxRadius,
  isPlaying,
  clockwise = true,
  spinFast = false,
  spriteCrop,
}: SpoolProps) {
  const rotation = useSharedValue<number>(0);
  const isPlayingShared = useSharedValue<boolean>(false);
  const radiusShared = useSharedValue<number>(radius);
  const maxRadiusShared = useSharedValue<number>(maxRadius);
  const clockwiseShared = useSharedValue<boolean>(clockwise);
  const spinFastShared = useSharedValue<boolean>(spinFast);

  useEffect(() => { clockwiseShared.value = clockwise; }, [clockwise]);
  useEffect(() => { spinFastShared.value = spinFast; }, [spinFast]);

  useEffect(() => {
    radiusShared.value = radius;
  }, [radius]);

  useEffect(() => {
    maxRadiusShared.value = maxRadius;
  }, [maxRadius]);

  useEffect(() => {
    isPlayingShared.value = isPlaying;
    if (isPlaying) {
      // spinFast 또는 clockwise 변경 시 기존 애니메이션 즉시 취소 후 재시작
      runOnUI(function () {
        "worklet";
        cancelAnimation(rotation);
        function step() {
          "worklet";
          const r = radiusShared.value;
          const mr = maxRadiusShared.value;
          const ratio = mr > 0 ? r / mr : 0.5;
          const period = spinFastShared.value
            ? 250
            : 3000 + ratio * ratio * 15000;
          rotation.value = withTiming(
            rotation.value + (clockwiseShared.value ? 360 : -360),
            { duration: period, easing: Easing.linear },
            function (finished) {
              "worklet";
              if (finished && isPlayingShared.value) {
                step();
              }
            }
          );
        }
        step();
      })();
    } else {
      runOnUI(function () {
        "worklet";
        cancelAnimation(rotation);
      })();
    }
  }, [isPlaying, spinFast, clockwise]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value % 360}deg` }],
  }));

  const cx = size / 2;
  const cy = size / 2;
  const hubR = radius * 0.28;
  const spokeCount = 5;

  const spokes = Array.from({ length: spokeCount }).map((_, i) => {
    const angle = ((i * 360) / spokeCount) * (Math.PI / 180);
    return {
      x1: cx + hubR * Math.cos(angle),
      y1: cy + hubR * Math.sin(angle),
      x2: cx + radius * 0.78 * Math.cos(angle),
      y2: cy + radius * 0.78 * Math.sin(angle),
    };
  });

  return (
    <View style={{ width: size, height: size }}>
      {spriteCrop ? (
        <Animated.View style={[styles.imageLayer, { width: size, height: size }, animStyle]}>
          <SpriteView crop={spriteCrop} width={size} height={size} />
        </Animated.View>
      ) : (
        <>
          <Svg width={size} height={size} style={{ position: "absolute" }}>
            <Defs>
              <RadialGradient id={`rg${Math.round(radius)}`} cx="40%" cy="35%" r="65%">
                <Stop offset="0%" stopColor="#5c3820" />
                <Stop offset="100%" stopColor="#1a0d05" />
              </RadialGradient>
            </Defs>
            <Circle
              cx={cx} cy={cy} r={radius}
              fill={`url(#rg${Math.round(radius)})`}
              stroke="#3d2010"
              strokeWidth={1.5}
            />
            <Circle
              cx={cx} cy={cy} r={radius * 0.58}
              fill="#120a03"
              stroke="#2e1808"
              strokeWidth={1}
            />
          </Svg>

          <Animated.View style={[{ position: "absolute", width: size, height: size }, animStyle]}>
            <Svg width={size} height={size}>
              {spokes.map((s, i) => (
                <Line
                  key={i}
                  x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
                  stroke="#6b3e1e"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                />
              ))}
              <Circle cx={cx} cy={cy} r={hubR} fill="#6b3e1e" stroke="#8b5a2b" strokeWidth={1} />
              <Circle cx={cx} cy={cy} r={hubR * 0.45} fill="#1a0d05" />
            </Svg>
          </Animated.View>

          <Svg width={size} height={size} style={{ position: "absolute" }} pointerEvents="none">
            <Circle
              cx={cx} cy={cy} r={radius * 0.57}
              fill="none"
              stroke="rgba(255,200,120,0.04)"
              strokeWidth={radius * 0.1}
            />
          </Svg>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  imageLayer: {
    position: "absolute",
  },
});
