import React from "react";
import { View, type ViewStyle } from "react-native";
import { Image } from "expo-image";
import type { SpriteCrop } from "@/constants/retroPlayerAssets";

interface SpriteViewProps {
  crop: SpriteCrop;
  width: number;
  height?: number;
  style?: ViewStyle;
}

/**
 * 스프라이트 시트에서 특정 영역을 잘라 표시하는 컴포넌트.
 * width를 기준으로 스케일, height는 crop 비율을 유지하거나 명시적으로 지정 가능.
 */
export function SpriteView({ crop, width, height, style }: SpriteViewProps) {
  const scale = width / crop.w;
  const h = height ?? crop.h * scale;

  return (
    <View style={[{ width, height: h, overflow: "hidden" }, style]}>
      <Image
        source={crop.source}
        style={{
          width: crop.sheetW * scale,
          height: crop.sheetH * scale,
          position: "absolute",
          left: -crop.x * scale,
          top: -crop.y * scale,
        }}
        contentFit="fill"
      />
    </View>
  );
}
