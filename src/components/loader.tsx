"use client";

import { DotmCircular11 } from "@/components/ui/dotm-circular-11";

// Wrapper do loader (dot-matrix circular) com defaults sensatos para uso inline
// em botões/estados de espera. Cor default branca (contraste em botões verdes).
export function Loader({
  size = 30,
  color = "#ffffff",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <DotmCircular11
      size={size}
      dotSize={Math.max(3, Math.round(size / 8))}
      speed={1.65}
      pattern="full"
      color={color}
      animated
      opacityBase={0.12}
      opacityMid={0.42}
      opacityPeak={1}
    />
  );
}
