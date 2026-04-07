import React, { useEffect } from "react";
import Animated, {
  cancelAnimation,
  Easing,
  runOnUI,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { View } from "react-native";
import Svg, { Circle, Line, G, Defs, RadialGradient, LinearGradient, Stop } from "react-native-svg";

interface SpoolProps {
  size: number;
  radius: number;
  maxRadius: number;
  isPlaying: boolean;
}

export function Spool({ size, radius, maxRadius, isPlaying }: SpoolProps) {
  const rotation = useSharedValue<number>(0);
  const isPlayingShared = useSharedValue<boolean>(false);
  const radiusShared = useSharedValue<number>(radius);
  const maxRadiusShared = useSharedValue<number>(maxRadius);

  useEffect(() => {
    radiusShared.value = radius;
  }, [radius]);

  useEffect(() => {
    maxRadiusShared.value = maxRadius;
  }, [maxRadius]);

  useEffect(() => {
    isPlayingShared.value = isPlaying;
    if (isPlaying) {
      runOnUI(function () {
        "worklet";
        function step() {
          "worklet";
          const r = radiusShared.value;
          const mr = maxRadiusShared.value;
          const ratio = mr > 0 ? r / mr : 0.5;
          const period = 3000 + ratio * ratio * 15000;
          rotation.value = withTiming(
            rotation.value + 360,
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
      cancelAnimation(rotation);
    }
  }, [isPlaying]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value % 360}deg` }],
  }));

  const cx = size / 2;
  const cy = size / 2;
  const hubR = radius * 0.26;
  const spokeCount = 8;
  const tapeRingWidth = maxRadius - radius;

  const spokes = Array.from({ length: spokeCount }).map((_, i) => {
    const angle = ((i * 360) / spokeCount) * (Math.PI / 180);
    return {
      x1: cx + hubR * 1.1 * Math.cos(angle),
      y1: cy + hubR * 1.1 * Math.sin(angle),
      x2: cx + radius * 0.82 * Math.cos(angle),
      y2: cy + radius * 0.82 * Math.sin(angle),
    };
  });

  const gradId = `rg${Math.round(radius)}`;
  const tapeId = `tape${Math.round(radius)}`;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Defs>
          <RadialGradient id={gradId} cx="38%" cy="32%" r="70%">
            <Stop offset="0%" stopColor="#d8d4c8" />
            <Stop offset="45%" stopColor="#a8a49a" />
            <Stop offset="100%" stopColor="#706c64" />
          </RadialGradient>
          <RadialGradient id={tapeId} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#2a1a0c" />
            <Stop offset="100%" stopColor="#1a0e07" />
          </RadialGradient>
        </Defs>

        {/* Tape wound on reel (dark brown ring) */}
        {tapeRingWidth > 2 && (
          <Circle cx={cx} cy={cy} r={maxRadius - 1}
            fill={`url(#${tapeId})`}
            stroke="#120c06"
            strokeWidth={1.5}
          />
        )}

        {/* Main silver disk */}
        <Circle cx={cx} cy={cy} r={radius}
          fill={`url(#${gradId})`}
          stroke="#505048"
          strokeWidth={1}
        />

        {/* Inner hub ring */}
        <Circle cx={cx} cy={cy} r={radius * 0.56}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={1}
        />

        {/* Dark inner area */}
        <Circle cx={cx} cy={cy} r={radius * 0.55}
          fill="#1e1c18"
          stroke="#282420"
          strokeWidth={1}
        />
      </Svg>

      {/* Rotating spokes layer */}
      <Animated.View style={[{ position: "absolute", width: size, height: size }, animStyle]}>
        <Svg width={size} height={size}>
          {spokes.map((sp, i) => (
            <Line
              key={i}
              x1={sp.x1} y1={sp.y1} x2={sp.x2} y2={sp.y2}
              stroke="#c0bcb0"
              strokeWidth={2}
              strokeLinecap="round"
            />
          ))}
          {/* Hub cap */}
          <Circle cx={cx} cy={cy} r={hubR}
            fill="#989490" stroke="#b0aca4" strokeWidth={1} />
          {/* Hub center screw */}
          <Circle cx={cx} cy={cy} r={hubR * 0.5}
            fill="#585450" />
          <Line x1={cx - hubR * 0.35} y1={cy} x2={cx + hubR * 0.35} y2={cy}
            stroke="rgba(0,0,0,0.4)" strokeWidth={1} strokeLinecap="round" />
          <Line x1={cx} y1={cy - hubR * 0.35} x2={cx} y2={cy + hubR * 0.35}
            stroke="rgba(0,0,0,0.4)" strokeWidth={1} strokeLinecap="round" />
        </Svg>
      </Animated.View>

      {/* Top gloss layer */}
      <Svg width={size} height={size} style={{ position: "absolute" }} pointerEvents="none">
        <Circle cx={cx} cy={cy} r={radius * 0.56}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={radius * 0.08}
        />
      </Svg>
    </View>
  );
}
