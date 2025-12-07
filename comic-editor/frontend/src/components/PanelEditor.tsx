import React, { useEffect, useRef, useState } from "react";
import type { Page } from "../types";
import { applyChangesGlobally, generateComicPage } from "../api/imageApi";
import { applyToneToPage, fillColorInPage, smudgePage } from "../api/tools";
import { useEditorStore } from "../store/editorStore";

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
  activeTool
}: PanelEditorProps) {
  const [sketchPrompt, setSketchPrompt] = useState<string>("");
  const sketchCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sketchCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const outputCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  const drawing = useRef<boolean>(false);

  const page = pages[selectedPageIdx];
  const panel = page.panels[selectedPanelIdx];

  const tone = useEditorStore((s) => s.tone);

  const fillColor =useEditorStore((s) => s.colorFillPoint);

  function getOutputCoords(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = outputCanvasRef.current!;
    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }


  async function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    let response: any;

    if (activeTool === "smudge") {
      response = await smudgePage(page);
    } else if (activeTool === "toneBrush") {
      if (!tone) return; // or show a warning
      response = await applyToneToPage(page, tone);
    } else if (activeTool === "eyedropper") {
      const canvas = outputCanvasRef.current;
      if (!canvas) return;

      const { x, y } = getOutputCoords(e); // 👈 canvas-relative coords

      // if your store actually holds the selected COLOR, rename this to fillColor:
      if(!fillColor)
        return;

      response = await fillColorInPage(page, x, y, fillColor);
    } else {
      // no tool selected → do nothing
      return;
    }

    if (!response) return;

    setPages((old) => {
      const copy = structuredClone(old);
      copy[selectedPageIdx] = response.page;
      return copy;
    });
  }



  function drawImageContain(ctx: CanvasRenderingContext2D, img: HTMLImageElement, canvas: HTMLCanvasElement) {
    const iw = img.width;
    const ih = img.height;
    const cw = canvas.width;
    const ch = canvas.height;

    // Image aspect ratio
    const imageRatio = iw / ih;
    const canvasRatio = cw / ch;

    let renderWidth, renderHeight, xStart, yStart;

    if (imageRatio > canvasRatio) {
      // Image is wider relative to canvas → fit width
      renderWidth = cw;
      renderHeight = cw / imageRatio;
      xStart = 0;
      yStart = (ch - renderHeight) / 2;
    } else {
      // Image is taller relative to canvas → fit height
      renderHeight = ch;
      renderWidth = ch * imageRatio;
      xStart = (cw - renderWidth) / 2;
      yStart = 0;
    }

    ctx.drawImage(img, xStart, yStart, renderWidth, renderHeight);
  }


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
      img.crossOrigin = "anonymous";  // ⭐ REQUIRED
      img.src = `http://localhost:8000${panel.image}?v=${Date.now()}`; // ⭐ Cache buster

      img.onload = () => drawImageContain(ctx, img, canvas);;
      img.onerror = (e) => console.warn("CORS load error:", e);
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
  async function resetOutput() {
    const canvas = outputCanvasRef.current!;
    const ctx = outputCtxRef.current!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    console.log("RESET OUTPUT IMAGE PATH:", pages[selectedPageIdx].panels[selectedPanelIdx].image);

    const img = new Image();
    img.crossOrigin = "anonymous"; // sometimes needed
    img.src = `http://localhost:8000${pages[selectedPageIdx].panels[selectedPanelIdx].image}?v=${Date.now()}`;
    img.onload = () => drawImageContain(ctx, img, canvas);;
  }

  // update page sentence
  // function updatePageSentence(v: string) {
  //   setPages(old => {
  //     const copy = structuredClone(old);
  //     copy[selectedPageIdx].storySentence = v;
  //     return copy;
  //   });
  // }
  async function handleGenerateComicPage() {
    const sketchBase64 =
      sketchCanvasRef.current?.toDataURL("image/png") || "";
    const response = await generateComicPage(
      page.storySentence,
      sketchBase64,
      pages[selectedPageIdx]
    );

    console.log("Backend response:", response);

    //---- update FE state with new image ----
    // setPages((old) => {
    //   const copy = structuredClone(old);
    //   copy[selectedPageIdx] = response.page;
    //   return copy;
    // });

    // ---- draw new image in right canvas ----
    const canvas = outputCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    requestAnimationFrame(() => {
      const img = new Image();
      img.crossOrigin = "anonymous"; // sometimes needed
      img.src = `http://localhost:8000${response.page.panels[0].image}?v=${Date.now()}`;

      img.onload = () => {
        console.log("Drawing image:", img.src);
        drawImageContain(ctx, img, canvas);;
      };

      img.onerror = (err) => {
        console.error("IMAGE LOAD ERROR", err);
      };
    });
  }

  // async function saveCurrentOutput() {
  //   const canvas = outputCanvasRef.current;
  //   if (!canvas) return;

  //   const imageData = canvas.toDataURL("image/png");

  //   const currentPath =
  //     pages[selectedPageIdx].panels[selectedPanelIdx].image;

  //   await fetch("http://localhost:8000/image/overwrite", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       image: imageData,
  //       path: currentPath
  //     })
  //   });

  //   setPages(old => {
  //     const copy = structuredClone(old);
  //     return copy; // 🔥 triggers re-render because reference changed
  //   });


  //   console.log("Image overwritten at:", currentPath);
  // }
  
  async function saveCurrentOutput() {
    const canvas = outputCanvasRef.current;
    if (!canvas) return;

    // Convert canvas → Blob WITHOUT reading pixels manually
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("file", blob, "canvas.png");
      formData.append("path", pages[selectedPageIdx].panels[selectedPanelIdx].image);

      await fetch("http://localhost:8000/image/overwrite", {
        method: "POST",
        body: formData,
      });

      const oldPath = pages[selectedPageIdx].panels[selectedPanelIdx].image;

      const newPath = `${oldPath}?v=${Date.now()}`;

      setPages(old => {
        const copy = structuredClone(old);
        copy[selectedPageIdx].panels[selectedPanelIdx].image = newPath;
        return copy;
      });

      console.log("Saved successfully!");
    }, "image/png");
  }

  async function applyGlobally() {
    const sketchBase64 =
    sketchCanvasRef.current?.toDataURL("image/png") || "";
    const response = await applyChangesGlobally(
      page.storySentence,
      sketchBase64,
      pages
    );

    console.log("Backend response:", response);
    setPages(response.pages);
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
            onClick={handleCanvasClick}
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
        <label className="text-xs text-gray-500">Sketch keywords</label>
        <input
          value={sketchPrompt}
          onChange={e => setSketchPrompt(e.target.value)}
          placeholder="Enter Keywords here"
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
      <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-3 rounded" onClick={handleGenerateComicPage}>
        Add sketch to Page Preview
      </button>

      <button className="flex-1 bg-gray-700 hover:bg-gray-800 text-white text-xs py-2 px-3 rounded" onClick={saveCurrentOutput}>
        Save output image
      </button>

      <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs py-2 px-3 rounded" onClick={applyGlobally}>
        Apply sketch inputs globally
      </button>
    </div>

  </div>
);

}
