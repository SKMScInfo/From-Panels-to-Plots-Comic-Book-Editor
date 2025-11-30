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
}: PanelEditorProps) {
  // LEFT CANVAS: Sketch input
  const sketchCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sketchCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  // RIGHT CANVAS: Output page preview
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const outputCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  const drawing = useRef<boolean>(false);

  // Load panel image into RIGHT canvas
  useEffect(() => {
    const panel = pages[selectedPageIdx].panels[selectedPanelIdx];

    const canvas = outputCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    outputCtxRef.current = ctx;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (panel.image || panel.sketch) {
      const img = new Image();
      img.src = panel.image || panel.sketch!;
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [pages, selectedPageIdx, selectedPanelIdx]);

  // LEFT canvas drawing handlers
  function handleDown(e: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = true;
    const canvas = sketchCanvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const ctx = sketchCtxRef.current!;
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }

  function handleMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const canvas = sketchCanvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const ctx = sketchCtxRef.current!;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  }

  function handleUp() {
    drawing.current = false;
    const canvas = sketchCanvasRef.current!;
    const data = canvas.toDataURL("image/png");

    setPages((old) => {
      const copy = structuredClone(old);
      copy[selectedPageIdx].panels[selectedPanelIdx].sketch = data;
      return copy;
    });
  }

  // Init left canvas
  useEffect(() => {
    const canvas = sketchCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    sketchCtxRef.current = ctx;
    ctx.lineCap = "round";
    ctx.lineWidth = 3;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  return (
    <div className="bg-white rounded shadow p-4 h-full flex flex-col">
      <div className="font-semibold mb-2">
        Panel — Page {selectedPageIdx + 1}, Panel {selectedPanelIdx + 1}
      </div>

      {/* TWO SIDE-BY-SIDE CANVASES */}
      <div className="flex flex-row gap-4 h-full">
        
        {/* LEFT: USER SKETCH (INPUT) */}
        <div className="w-1/2 h-full border rounded-lg overflow-hidden bg-gray-50">
          <canvas
            ref={sketchCanvasRef}
            width={600}
            height={400}
            onPointerDown={handleDown}
            onPointerMove={handleMove}
            onPointerUp={handleUp}
            className="w-full h-full object-contain"
          />
        </div>

        {/* RIGHT: PAGE PREVIEW (OUTPUT) */}
        <div className="w-1/2 h-full border rounded-lg overflow-hidden bg-white">
          <canvas
            ref={outputCanvasRef}
            width={600}
            height={400}
            className="w-full h-full object-contain"
          />
        </div>

      </div>
    </div>
  );
}
