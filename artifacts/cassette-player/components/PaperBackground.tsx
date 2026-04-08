import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Rect, Circle, Defs, Pattern } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import colors from "@/constants/colors";

const GRAIN_DOTS = (() => {
  const dots: { x: number; y: number; r: number; o: number }[] = [];
  let s = 7919;
  const next = () => {
    s = ((s * 1664525 + 1013904223) >>> 0);
    return s / 4294967296;
  };
  for (let i = 0; i < 90; i++) {
    dots.push({
      x: parseFloat((next() * 120).toFixed(2)),
      y: parseFloat((next() * 120).toFixed(2)),
      r: parseFloat((0.25 + next() * 0.85).toFixed(2)),
      o: parseFloat((0.025 + next() * 0.055).toFixed(3)),
    });
  }
  return dots;
})();

interface PaperBackgroundProps {
  children: React.ReactNode;
  style?: object;
}

export function PaperBackground({ children, style }: PaperBackgroundProps) {
  return (
    <View style={[styles.root, style]}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient
          colors={[
            "#F8F3EC",
            colors.light.background,
            "#EDE4D8",
          ]}
          locations={[0, 0.5, 1]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Svg
          style={StyleSheet.absoluteFill}
          width="100%"
          height="100%"
        >
          <Defs>
            <Pattern
              id="pgrain"
              x="0"
              y="0"
              width="120"
              height="120"
              patternUnits="userSpaceOnUse"
            >
              {GRAIN_DOTS.map((d, i) => (
                <Circle
                  key={i}
                  cx={d.x}
                  cy={d.y}
                  r={d.r}
                  fill="#7a5030"
                  opacity={d.o}
                />
              ))}
            </Pattern>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#pgrain)" />
        </Svg>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
});
