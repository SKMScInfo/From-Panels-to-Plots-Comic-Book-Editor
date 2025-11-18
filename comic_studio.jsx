import React, { useRef, useState, useEffect } from "react";

// ComicStudio.jsx
// Single-file React component implementing a multimodal comic editing UI prototype.
// - TailwindCSS classes are used for layout.
// - shadcn/ui components may be used if available in your app; here we keep plain markup for portability.
// - AI calls are stubbed: replace `ai*` functions with real endpoints (Diffusion / image-edit / LLM) as needed.

export default function ComicStudio() {
  // Data model: pages -> each page has panels (image or sketch), tone metadata, and a caption/story sentence
  const [pages, setPages] = useState(() => [createBlankPage(1)]);
  const [selectedPageIdx, setSelectedPageIdx] = useState(0);
  const [selectedPanelIdx, setSelectedPanelIdx] = useState(0);

  // Tool state
  const [activeTool, setActiveTool] = useState("smudge"); // smudge | toneBrush | eyedropper | prompt
  const [promptText, setPromptText] = useState("");

  // Canvas refs for local panel sketching
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineWidth = 3;
    ctxRef.current = ctx;

    // If panel has existing sketch image, load it
    loadPanelToCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPageIdx, selectedPanelIdx]);

  function createNewPage() {
    setPages((p) => [...p, createBlankPage(p.length + 1)]);
    setSelectedPageIdx(pages.length);
    setSelectedPanelIdx(0);
  }

  function createBlankPage(pageNum) {
    // Default 3 panels per page for the prototype
    return {
      id: `page-${pageNum}`,
      panels: Array.from({ length: 3 }).map((_, i) => ({
        id: `p-${pageNum}-${i}`,
        image: null, // canonical image URL or dataURL
        sketch: null, // dataURL of sketch
        tone: { brightness: 1, contrast: 1, palette: null },
        caption: "",
      })),
      storySentence: `Page ${pageNum} — short storyline sentence`,
    };
  }

  function loadPanelToCanvas() {
    const page = pages[selectedPageIdx];
    if (!page) return;
    const panel = page.panels[selectedPanelIdx];
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (panel.sketch) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = panel.sketch;
    } else if (panel.image) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = panel.image;
    } else {
      // draw a grid / placeholder
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#e5e7eb";
      for (let x = 0; x < canvas.width; x += 20) ctx.strokeRect(x, 0, 0.5, canvas.height);
    }
  }

  // Simple drawing handlers for sketching
  function handlePointerDown(e) {
    if (activeTool !== "smudge" && activeTool !== "toneBrush") return;
    drawing.current = true;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
  }

  function handlePointerMove(e) {
    if (!drawing.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
  }

  function handlePointerUp() {
    if (!drawing.current) return;
    drawing.current = false;
    ctxRef.current.closePath();
    // save canvas to panel.sketch
    const dataURL = canvasRef.current.toDataURL("image/png");
    setPages((old) => {
      const copy = structuredClone(old);
      copy[selectedPageIdx].panels[selectedPanelIdx].sketch = dataURL;
      return copy;
    });
  }

  // Toolbar actions (stubs). Replace with real model calls.

  async function generateInitialStory(seedText) {
    // Placeholder: in practice call LLM to expand into N page sentences
    // Example: call your backend / LLM with seedText and desired page count
    const sentences = seedText.split(".").filter(Boolean);
    setPages((old) => {
      const copy = structuredClone(old);
      // map sentences to page.storySentence
      for (let i = 0; i < Math.min(sentences.length, copy.length); i++) {
        copy[i].storySentence = sentences[i].trim();
      }
      return copy;
    });
  }

  async function applySmudgeToPanel(styleHint = "") {
    // Smudge: reinterpret rough sketch into refined pose/style.
    // Implementation: send sketch to an image-to-image model (e.g., ControlNet + Stable Diffusion)
    // Here we mock by returning the same sketch with a small overlay.
    const canvas = canvasRef.current;
    const mock = canvas.toDataURL("image/png");
    // Simulate model output
    setPages((old) => {
      const copy = structuredClone(old);
      copy[selectedPageIdx].panels[selectedPanelIdx].image = mock;
      return copy;
    });
  }

  async function applyToneBrushAt(xNorm = 0.5, yNorm = 0.5, radius = 0.2) {
    // Tone brush adjusts local tone metadata; actual effect should be run through an image-processing transform.
    setPages((old) => {
      const copy = structuredClone(old);
      const tone = copy[selectedPageIdx].panels[selectedPanelIdx].tone;
      tone.brightness = Math.max(0.6, tone.brightness - 0.05);
      return copy;
    });
    // Optionally apply local image filter by calling backend
  }

  async function pickToneFromPanel(sourcePageIdx, sourcePanelIdx) {
    // Tone eyedropper: copy tone metadata
    setPages((old) => {
      const copy = structuredClone(old);
      const sourceTone = copy[sourcePageIdx].panels[sourcePanelIdx].tone;
      copy[selectedPageIdx].panels[selectedPanelIdx].tone = { ...sourceTone };
      return copy;
    });
  }

  async function promptEditPanel(prompt) {
    // Use LLM + image editing model to apply textual edit to current panel
    // e.g. text-guided inpainting / image-to-image
    console.log("Prompt edit:", prompt);
    // Mock: write the prompt into the caption and attach a placeholder image
    setPages((old) => {
      const copy = structuredClone(old);
      copy[selectedPageIdx].panels[selectedPanelIdx].caption = prompt;
      copy[selectedPageIdx].panels[selectedPanelIdx].image = copy[selectedPageIdx].panels[selectedPanelIdx].sketch || copy[selectedPageIdx].panels[selectedPanelIdx].image;
      return copy;
    });
  }

  // Small helpers
  function updateCaptionForPanel(text) {
    setPages((old) => {
      const copy = structuredClone(old);
      copy[selectedPageIdx].panels[selectedPanelIdx].caption = text;
      return copy;
    });
  }

  // Export page as JSON (for saving/sharing)
  function exportProject() {
    const data = JSON.stringify(pages, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "comic-project.json";
    a.click();
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left toolbar */}
      <aside className="w-20 bg-white border-r p-2 flex flex-col items-center gap-3">
        <ToolButton label="Smudge" active={activeTool === "smudge"} onClick={() => setActiveTool("smudge")} />
        <ToolButton label="Tone" active={activeTool === "toneBrush"} onClick={() => setActiveTool("toneBrush")} />
        <ToolButton label="Pick" active={activeTool === "eyedropper"} onClick={() => setActiveTool("eyedropper")} />
        <ToolButton label="Prompt" active={activeTool === "prompt"} onClick={() => setActiveTool("prompt")} />
        <div className="mt-4 border-t w-full pt-2 flex flex-col gap-2">
          <button className="btn" onClick={createNewPage}>+ Page</button>
          <button className="btn" onClick={exportProject}>Export</button>
        </div>
      </aside>

      {/* Main workspace */}
      <main className="flex-1 p-4 flex flex-col gap-4">
        {/* Top: Storyline canvas */}
        <section className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-2">Storyline</h3>
          <div className="flex gap-3 overflow-x-auto">
            {pages.map((page, pIdx) => (
              <div key={page.id} className={`min-w-[220px] p-3 rounded border ${pIdx === selectedPageIdx ? "border-blue-400" : "border-gray-200"}`} onClick={() => { setSelectedPageIdx(pIdx); setSelectedPanelIdx(0); }}>
                <div className="text-xs text-gray-500 mb-2">Page {pIdx + 1}</div>
                <div className="text-sm font-medium mb-1">{page.storySentence}</div>
                <div className="flex gap-1 mt-2">
                  {page.panels.map((panel, idx) => (
                    <div key={panel.id} className={`w-14 h-10 border rounded ${selectedPanelIdx === idx && pIdx === selectedPageIdx ? "ring-2 ring-blue-300" : "border-gray-200"}`} onClick={(e) => { e.stopPropagation(); setSelectedPageIdx(pIdx); setSelectedPanelIdx(idx); }}>
                      <PanelThumb panel={panel} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom: Two-column editor - panel view + properties */}
        <section className="flex-1 grid grid-cols-3 gap-4">
          {/* Canvas / panel editor */}
          <div className="col-span-2 bg-white rounded-lg shadow p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Panel Editor — Page {selectedPageIdx + 1} · Panel {selectedPanelIdx + 1}</div>
              <div className="text-sm text-gray-500">Tool: {activeTool}</div>
            </div>
            <div className="flex-1 border rounded overflow-hidden">
              <canvas
                ref={canvasRef}
                width={960}
                height={540}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="w-full h-full touch-none"
              />
            </div>

            {/* Quick actions */}
            <div className="flex gap-2 mt-3">
              <button className="btn" onClick={() => applySmudgeToPanel(promptText)}>Apply Smudge</button>
              <button className="btn" onClick={() => applyToneBrushAt()}>Tone Brush</button>
              <button className="btn" onClick={() => pickToneFromPanel(0, 0)}>Pick Tone from Page 1 Panel 1</button>
              <div className="ml-auto flex gap-2">
                <input className="border rounded px-2" placeholder="Prompt (e.g., 'make it night')" value={promptText} onChange={(e) => setPromptText(e.target.value)} />
                <button className="btn" onClick={() => promptEditPanel(promptText)}>Apply Prompt</button>
              </div>
            </div>
          </div>

          {/* Right column: properties, caption, history */}
          <aside className="bg-white rounded-lg shadow p-4 flex flex-col gap-3">
            <div>
              <label className="block text-xs text-gray-500">Caption</label>
              <textarea className="w-full border rounded p-2 mt-1" rows={4} value={pages[selectedPageIdx]?.panels[selectedPanelIdx]?.caption || ""} onChange={(e) => updateCaptionForPanel(e.target.value)} />
            </div>

            <div>
              <label className="block text-xs text-gray-500">Page sentence</label>
              <input className="w-full border rounded p-2 mt-1" value={pages[selectedPageIdx]?.storySentence || ""} onChange={(e) => {
                const v = e.target.value;
                setPages((old) => {
                  const copy = structuredClone(old);
                  copy[selectedPageIdx].storySentence = v;
                  return copy;
                });
              }} />
            </div>

            <div className="flex flex-col gap-2">
              <button className="btn" onClick={() => generateInitialStory(promptText)}>Generate Story from Prompt</button>
              <small className="text-xs text-gray-500">Try: "Cinderella woke up in a forest. She met a boy and fell in love."</small>
            </div>

            <div>
              <h4 className="font-medium">Panel Tone</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded">{JSON.stringify(pages[selectedPageIdx]?.panels[selectedPanelIdx]?.tone || {}, null, 2)}</pre>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}


// --- Small presentational components ---
function ToolButton({ label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full text-xs py-2 rounded ${active ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"}`}>
      {label}
    </button>
  );
}

function PanelThumb({ panel }) {
  if (panel.image) return <img src={panel.image} alt="thumb" className="w-full h-full object-cover" />;
  if (panel.sketch) return <img src={panel.sketch} alt="thumb" className="w-full h-full object-cover" />;
  return <div className="w-full h-full bg-gray-50 flex items-center justify-center text-xs text-gray-400">empty</div>;
}

/*
Integration notes (how to connect real models):

1) Story generation (LLM):
   - Call an LLM (e.g., OpenAI's Chat completions or a local LLM) with the seed prompt and desired number of pages.
   - Return a list of short sentences; populate page.storySentence.

2) Smudge (image-to-image):
   - Send the current panel.sketch (dataURL) to an image-to-image model (Stable Diffusion img2img or ControlNet) with a style/pose hint.
   - Receive an edited image URL/base64 and set panel.image.

3) Prompt edits (inpainting / text-guided edits):
   - Use an inpainting-capable diffusion model. Provide mask or use segmentation to decide the target region.
   - Combine LLM for parsing complex prompts into low-level edit operations.

4) Tone brush / eyedropper:
   - Tone metadata is a compact representation (brightness/contrast/palette).
   - Either do real-time tone transforms in-browser with WebGL (glfx, filter shaders), or send to backend for higher-quality transforms.

5) Realtime feedback loop & UI patterns:
   - Use optimistic updates to keep UI responsive (save intermediate sketches locally).
   - Keep both global (storyline) and local (panel) views in sync via a shared store (Redux, Zustand, React Context).

6) File format:
   - Project JSON contains pages[] with panels[]. Each panel may include references to images stored on the server (or base64 inline for small prototypes).

This file intentionally keeps many algos stubbed so you can quickly hook to your preferred backend services.
*/
