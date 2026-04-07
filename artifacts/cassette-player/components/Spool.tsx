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
import Svg, { Circle, Line, Path, Defs, RadialGradient, LinearGradient, Stop } from "react-native-svg";

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

  useEffect(() => { radiusShared.value = radius; }, [radius]);
  useEffect(() => { maxRadiusShared.value = maxRadius; }, [maxRadius]);

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
              if (finished && isPlayingShared.value) { step(); }
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
  const hubR = radius * 0.28;
  const spokeCount = 8;
  const tapeRingWidth = maxRadius - radius;

  const spokes = Array.from({ length: spokeCount }).map((_, i) => {
    const angle = ((i * 360) / spokeCount) * (Math.PI / 180);
    return {
      x1: cx + hubR * 1.15 * Math.cos(angle),
      y1: cy + hubR * 1.15 * Math.sin(angle),
      x2: cx + radius * 0.80 * Math.cos(angle),
      y2: cy + radius * 0.80 * Math.sin(angle),
    };
  });

  const gradId = `rg_${Math.round(radius * 10)}`;
  const tapeId = `tp_${Math.round(radius * 10)}`;
  const hubId = `hb_${Math.round(radius * 10)}`;
  const spindleId = `sp_${Math.round(radius * 10)}`;

  return (
    <View style={{ width: size, height: size }}>
      {/* Static base layer */}
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Defs>
          {/* Tape wound ring */}
          <RadialGradient id={tapeId} cx="50%" cy="50%" r="50%">
            <Stop offset="70%" stopColor="#221408" />
            <Stop offset="100%" stopColor="#120a04" />
          </RadialGradient>
          {/* Silver disk */}
          <RadialGradient id={gradId} cx="35%" cy="30%" r="75%">
            <Stop offset="0%" stopColor="#dedad2" />
            <Stop offset="40%" stopColor="#b8b4aa" />
            <Stop offset="100%" stopColor="#787468" />
          </RadialGradient>
          {/* Hub - warm amber */}
          <RadialGradient id={hubId} cx="40%" cy="35%" r="70%">
            <Stop offset="0%" stopColor="#d8a050" />
            <Stop offset="50%" stopColor="#a86c28" />
            <Stop offset="100%" stopColor="#704818" />
          </RadialGradient>
          {/* Center spindle hole - orange */}
          <RadialGradient id={spindleId} cx="40%" cy="35%" r="65%">
            <Stop offset="0%" stopColor="#F28C28" />
            <Stop offset="60%" stopColor="#C86020" />
            <Stop offset="100%" stopColor="#8A3C10" />
          </RadialGradient>
        </Defs>

        {/* Tape ring (only when there's tape wound) */}
        {tapeRingWidth > 1 && (
          <>
            <Circle cx={cx} cy={cy} r={maxRadius}
              fill={`url(#${tapeId})`} stroke="#0e0805" strokeWidth={1} />
            {/* Tape edge highlight */}
            <Circle cx={cx} cy={cy} r={maxRadius}
              fill="none" stroke="rgba(180,120,60,0.15)" strokeWidth={1.5} />
          </>
        )}

        {/* Silver mechanical disk */}
        <Circle cx={cx} cy={cy} r={radius}
          fill={`url(#${gradId})`}
          stroke="#606058" strokeWidth={1.2} />

        {/* Outer ring detail */}
        <Circle cx={cx} cy={cy} r={radius * 0.92}
          fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={0.8} />

        {/* Dark inner zone */}
        <Circle cx={cx} cy={cy} r={radius * 0.58}
          fill="#1c1a14" stroke="#282420" strokeWidth={0.8} />
      </Svg>

      {/* Rotating spokes + hub layer */}
      <Animated.View style={[{ position: "absolute", width: size, height: size }, animStyle]}>
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id={`${hubId}_r`} cx="40%" cy="35%" r="70%">
              <Stop offset="0%" stopColor="#d8a050" />
              <Stop offset="50%" stopColor="#a86c28" />
              <Stop offset="100%" stopColor="#704818" />
            </RadialGradient>
            <RadialGradient id={`${spindleId}_r`} cx="40%" cy="35%" r="65%">
              <Stop offset="0%" stopColor="#F28C28" />
              <Stop offset="60%" stopColor="#C86020" />
              <Stop offset="100%" stopColor="#8A3C10" />
            </RadialGradient>
          </Defs>

          {/* Spokes */}
          {spokes.map((sp, i) => (
            <Line
              key={i}
              x1={sp.x1} y1={sp.y1} x2={sp.x2} y2={sp.y2}
              stroke="#c8c4b8"
              strokeWidth={2.2}
              strokeLinecap="round"
            />
          ))}

          {/* Spoke highlight overlay */}
          {spokes.map((sp, i) => (
            <Line
              key={`h${i}`}
              x1={sp.x1} y1={sp.y1}
              x2={sp.x1 + (sp.x2 - sp.x1) * 0.4}
              y2={sp.y1 + (sp.y2 - sp.y1) * 0.4}
              stroke="rgba(255,255,255,0.18)"
              strokeWidth={1}
              strokeLinecap="round"
            />
          ))}

          {/* Amber hub cap */}
          <Circle cx={cx} cy={cy} r={hubR}
            fill={`url(#${hubId}_r)`}
            stroke="#c88030" strokeWidth={1} />

          {/* Orange drive spindle hole */}
          <Circle cx={cx} cy={cy} r={hubR * 0.55}
            fill={`url(#${spindleId}_r)`} />

          {/* Spindle rim */}
          <Circle cx={cx} cy={cy} r={hubR * 0.55}
            fill="none" stroke="rgba(255,200,100,0.3)" strokeWidth={0.8} />

          {/* Spindle center dark */}
          <Circle cx={cx} cy={cy} r={hubR * 0.22}
            fill="#1a0e06" />
        </Svg>
      </Animated.View>

      {/* Top gloss */}
      <Svg width={size} height={size} style={{ position: "absolute" }} pointerEvents="none">
        <Circle cx={cx - radius * 0.1} cy={cy - radius * 0.15} r={radius * 0.35}
          fill="rgba(255,255,255,0.06)" />
        <Circle cx={cx} cy={cy} r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1.5} />
      </Svg>
    </View>
  );
}
