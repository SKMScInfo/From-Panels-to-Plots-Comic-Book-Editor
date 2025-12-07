import React, { useRef, useState } from "react";

interface ColorWheelProps {
  onApply: (color: { r: number; g: number; b: number; hex: string }) => void;
  onClose?: () => void;
}

export type Color = {
  r: number;     // 0–255
  g: number;     // 0–255
  b: number;     // 0–255
  hex: string;   // "#rrggbb"
};


export default function ColorWheel({ onApply, onClose }: ColorWheelProps) {
  const wheelRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Draw the color wheel once
  React.useEffect(() => {
    const canvas = wheelRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    const size = canvas.width;
    const radius = size / 2;

    for (let angle = 0; angle <= 360; angle += 1) {
      const start = (angle - 1) * (Math.PI / 180);
      const end = angle * (Math.PI / 180);

      ctx.beginPath();
      ctx.moveTo(radius, radius);
      ctx.arc(radius, radius, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = `hsl(${angle}, 100%, 50%)`;
      ctx.fill();
    }
  }, []);

  function handlePick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = wheelRef.current!;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d")!;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const [r, g, b, a] = pixel;

    if (a === 0) return; // outside the circle

    const hex = `#${[r, g, b]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")}`;

    setSelectedColor(hex);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-sm font-semibold">Color Fill</div>

      <canvas
        ref={wheelRef}
        width={180}
        height={180}
        onClick={handlePick}
        className="rounded-full cursor-pointer"
      />

      {/* Preview box */}
      {selectedColor && (
        <div className="flex flex-col items-center gap-1">
          <div
            className="w-10 h-10 rounded border"
            style={{ background: selectedColor }}
          />
          <div className="text-xs">{selectedColor}</div>
        </div>
      )}

      {/* APPLY BUTTON */}
      {selectedColor && (
        <button
          onClick={() => {
            const hex = selectedColor!;
            const bigint = parseInt(hex.slice(1), 16);
            const r = (bigint >> 16) & 255;
            const g = (bigint >> 8) & 255;
            const b = bigint & 255;

            onApply({ r, g, b, hex });
            onClose && onClose();
          }}
          className="px-4 py-1 bg-blue-500 rounded text-white text-sm"
        >
          Apply Color
        </button>
      )}
    </div>
  );
}
