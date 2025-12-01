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
  selectedPanelIdx
}: PanelEditorProps) {
  const sketchCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sketchCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const outputCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  const drawing = useRef<boolean>(false);

  const page = pages[selectedPageIdx];
  const panel = page.panels[selectedPanelIdx];

  // load right canvas image
  useEffect(() => {
    const canvas = outputCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    outputCtxRef.current = ctx;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ⭐ ONLY show the generated comic book image
    if (panel.image) {
      const img = new Image();
      img.src = panel.image;
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    } else {
      // blank white when no comic generated yet
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [pages, selectedPageIdx, selectedPanelIdx]);


  // coordinate scaling for sketch canvas
  function getSketchCoords(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = sketchCanvasRef.current!;
    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  // drawing handlers
  function handleDown(e: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = true;
    const ctx = sketchCtxRef.current!;
    const { x, y } = getSketchCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function handleMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = sketchCtxRef.current!;
    const { x, y } = getSketchCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function handleUp() {
    drawing.current = false;
    const canvas = sketchCanvasRef.current!;
    const data = canvas.toDataURL("image/png");

    setPages(old => {
      const copy = structuredClone(old);
      copy[selectedPageIdx].panels[selectedPanelIdx].sketch = data;
      return copy;
    });
  }

  // init sketch canvas
  useEffect(() => {
    const canvas = sketchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    sketchCtxRef.current = ctx;
    ctx.lineCap = "round";
    ctx.lineWidth = 3;

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // erase sketch
  function eraseSketch() {
    const canvas = sketchCanvasRef.current!;
    const ctx = sketchCtxRef.current!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    setPages(old => {
      const copy = structuredClone(old);
      copy[selectedPageIdx].panels[selectedPanelIdx].sketch = null;
      return copy;
    });
  }

  // reset output
  function resetOutput() {
    const canvas = outputCanvasRef.current!;
    const ctx = outputCtxRef.current!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    setPages(old => {
      const copy = structuredClone(old);
      copy[selectedPageIdx].panels[selectedPanelIdx].image = null;
      return copy;
    });
  }

  // update page sentence
  function updatePageSentence(v: string) {
    setPages(old => {
      const copy = structuredClone(old);
      copy[selectedPageIdx].storySentence = v;
      return copy;
    });
  }

 return (
  <div className="bg-white rounded shadow p-4 h-full flex flex-col">

    {/* CANVASES FIRST (Sketch + Output) */}
    <div className="flex flex-row gap-4 flex-1 mb-4">

      {/* LEFT Sketch */}
      <div className="w-1/2 h-full flex flex-col">
        <label className="text-gray-800 font-semibold mb-1">Sketch input</label>

        <div className="flex-1 border rounded-lg overflow-hidden bg-gray-50">
          <canvas
            ref={sketchCanvasRef}
            width={600}
            height={400}
            onPointerDown={handleDown}
            onPointerMove={handleMove}
            onPointerUp={handleUp}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* RIGHT Output */}
      <div className="w-1/2 h-full flex flex-col">
        <label className="text-gray-800 font-semibold mb-1">Comic page output</label>

        <div className="flex-1 border rounded-lg overflow-hidden bg-white">
          <canvas
            ref={outputCanvasRef}
            width={600}
            height={400}
            className="w-full h-full"
          />
        </div>
      </div>

    </div>

    {/* ROW 1: Page sentence + erase/reset */}
    <div className="grid grid-cols-2 gap-4 items-start mb-3">

      {/* Page sentence */}
      <div>
        <label className="text-xs text-gray-500">Page sentence</label>
        <input
          value={page.storySentence}
          onChange={e => updatePageSentence(e.target.value)}
          className="w-full border rounded p-2 mt-1"
        />
      </div>

      {/* erase + reset side by side */}
      <div className="flex flex-row gap-3 justify-end mt-5">
        <button
          onClick={eraseSketch}
          className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white text-xs"
        >
          Erase sketch
        </button>

        <button
          onClick={resetOutput}
          className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-800 text-white text-xs"
        >
          Reset output
        </button>
      </div>
    </div>

    {/* ROW 2: Generation buttons */}
    <div className="flex flex-row gap-3 justify-between mb-2">
      <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-3 rounded">
        Generate comic page
      </button>

      <button className="flex-1 bg-gray-700 hover:bg-gray-800 text-white text-xs py-2 px-3 rounded">
        Apply inputs locally
      </button>

      <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs py-2 px-3 rounded">
        Apply inputs globally
      </button>
    </div>

  </div>
);

}
