import { useRef, useState } from "react";
import Toolbar from "./components/Toolbar";
import Storyline from "./components/Storyline";
import PanelEditor from "./components/PanelEditor";
import PropertiesPanel from "./components/PropertiesPanel";
import PromptAndSketch from "./components/PromptAndSketch";

// TYPES -------------------------

export interface Panel {
  id: string;
  image: string | null;
  sketch: string | null;
  tone: {
    brightness: number;
    contrast: number;
    palette: string | null;
  };
  caption: string;
}

export interface Page {
  id: string;
  panels: Panel[];
  storySentence: string;
}

// COMPONENT -----------------------

export default function ComicStudio() {
  const [pages, setPages] = useState<Page[]>(() => [createBlankPage(1)]);
  const [selectedPageIdx, setSelectedPageIdx] = useState<number>(0);
  const [selectedPanelIdx, setSelectedPanelIdx] = useState<number>(0);
  const [activeTool, setActiveTool] = useState<string>("smudge");
  const [promptText, setPromptText] = useState<string>("");

  // NEW: fortune sketch state
  const [fortuneSketch, setFortuneSketch] = useState<string | null>(null);

  // Canvas refs typed
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // -------------------------

  function createBlankPage(n: number): Page {
    return {
      id: `page-${n}`,
      panels: Array.from({ length: 1 }).map((_, i): Panel => ({
        id: `p-${n}-${i}`,
        image: null,
        sketch: null,
        tone: { brightness: 1, contrast: 1, palette: null },
        caption: "",
      })),
      storySentence: `Page ${n} — short storyline sentence`,
    };
  }

  function createNewPage() {
    setPages((old) => [...old, createBlankPage(old.length + 1)]);
    setSelectedPageIdx(pages.length); // next page index
    setSelectedPanelIdx(0);
  }

  function exportProject() {
    const data = JSON.stringify(pages, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "comic-project.json";
    a.click();
  }

  // -------------------------

  return (
  <div className="h-screen bg-gray-50 flex">
    {/* LEFT TOOLBAR */}
    <Toolbar
      activeTool={activeTool}
      setActiveTool={setActiveTool}
      createNewPage={createNewPage}
      exportProject={exportProject}
    />

    {/* MAIN AREA: 2 columns -> 60% workspace | 40% storyline */}
    <main className="flex-1 p-4 min-h-0">
      <section className="h-full grid grid-cols-[3fr_2fr] gap-4 max-h-full min-h-0">

        {/* LEFT 60% */}
        <div className="grid grid-rows-[auto_1fr_auto] gap-4 h-full min-h-0 overflow-y-auto">

          {/* Row 1 */}
          <PromptAndSketch
            promptText={promptText}
            setPromptText={setPromptText}
            fortuneSketch={fortuneSketch}
            setFortuneSketch={setFortuneSketch}
            setPages={setPages}
          />

          {/* Row 2 — grows properly */}
          <div className="overflow-hidden" style={{minHeight:"450px"}}>
            <PanelEditor
              pages={pages}
              setPages={setPages}
              selectedPageIdx={selectedPageIdx}
              selectedPanelIdx={selectedPanelIdx}
              activeTool={activeTool}
              canvasRef={canvasRef}
              ctxRef={ctxRef}
              promptText={promptText}
            />
          </div>

          {/* Row 3 */}
          <div className="h-48">
            <PropertiesPanel
              pages={pages}
              setPages={setPages}
              selectedPageIdx={selectedPageIdx}
              selectedPanelIdx={selectedPanelIdx}
              promptText={promptText}
              setPromptText={setPromptText}
            />
          </div>

        </div>

        {/* RIGHT 40% */}
        <div className="h-full overflow-y-auto min-h-0">
          <Storyline
            pages={pages}
            selectedPageIdx={selectedPageIdx}
            selectedPanelIdx={selectedPanelIdx}
            setSelectedPageIdx={setSelectedPageIdx}
            setSelectedPanelIdx={setSelectedPanelIdx}
          />
        </div>

      </section>

    </main>
  </div>
);

}
