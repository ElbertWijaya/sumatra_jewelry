import * as React from "react";
import Svg, { G, Path, Ellipse } from "react-native-svg";

export function LogoS({ size = 64 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      {/* Berlian di atas huruf S */}
      <G>
        <Ellipse cx="40" cy="18" rx="10" ry="6" fill="#ffe066" stroke="#c9a04e" strokeWidth="2"/>
        <Ellipse cx="40" cy="18" rx="3" ry="2" fill="#fffde8" />
      </G>
      {/* Huruf S */}
      <Path
        d="M56,52 Q46,65 32,56 Q21,47 38,36 Q52,27 43,21 Q34,15 25,27"
        stroke="#a9824e"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}