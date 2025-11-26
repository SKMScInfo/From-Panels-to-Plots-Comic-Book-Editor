import React, { useEffect, useRef } from "react";
import type { Page } from "../types";

interface PanelEditorProps {
  pages: Page[];
  setPages: React.Dispatch<React.SetStateAction<Page[]>>;
  selectedPageIdx: number;
  selectedPanelIdx: number;
  activeTool: string;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  ctxRef: React.RefObject<CanvasRenderingContext2D | null>;
  promptText: string;
}

export default function PanelEditor({
  pages,
  setPages,
  selectedPageIdx,
  selectedPanelIdx,
  canvasRef,
  ctxRef,
}: PanelEditorProps) {
  const drawing = useRef<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctxRef.current = ctx;
    ctx.lineCap = "round";
    ctx.lineWidth = 3;

    const panel = pages[selectedPageIdx].panels[selectedPanelIdx];

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (panel.sketch || panel.image) {
      const img = new Image();
      img.src = panel.sketch || panel.image!;
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [selectedPageIdx, selectedPanelIdx]);

  function handleDown(e: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = true;
    const rect = canvasRef.current!.getBoundingClientRect();
    ctxRef.current!.beginPath();
    ctxRef.current!.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }

  function handleMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    ctxRef.current!.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctxRef.current!.stroke();
  }

  function handleUp() {
    drawing.current = false;

    const data = canvasRef.current!.toDataURL("image/png");
    setPages((old) => {
      const copy = structuredClone(old);
      copy[selectedPageIdx].panels[selectedPanelIdx].sketch = data;
      return copy;
    });
  }

  return (
    <div className="col-span-2 bg-white rounded shadow p-4">
      <div className="font-semibold mb-2">
        Panel — Page {selectedPageIdx + 1}, Panel {selectedPanelIdx + 1}
      </div>

      <canvas
        ref={canvasRef}
        width={960}
        height={540}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        className="w-full h-full border rounded"
      />
    </div>
  );
}
