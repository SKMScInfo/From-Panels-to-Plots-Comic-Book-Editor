import { useRef, useState } from "react";
import Toolbar from "./components/Toolbar";
import Storyline from "./components/Storyline";
import PanelEditor from "./components/PanelEditor";
import PropertiesPanel from "./components/PropertiesPanel";

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

  // Canvas refs typed
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // -------------------------

  function createBlankPage(n: number): Page {
    return {
      id: `page-${n}`,
      panels: Array.from({ length: 3 }).map((_, i): Panel => ({
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
    <div className="h-screen flex bg-gray-50">
      {/* LEFT TOOLBAR */}
      <Toolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        createNewPage={createNewPage}
        exportProject={exportProject}
      />

      {/* MAIN AREA */}
      <main className="flex-1 p-4 flex flex-col gap-4">

        {/* STORYLINE (Top Bar) */}
        <Storyline
          pages={pages}
          selectedPageIdx={selectedPageIdx}
          selectedPanelIdx={selectedPanelIdx}
          setSelectedPageIdx={setSelectedPageIdx}
          setSelectedPanelIdx={setSelectedPanelIdx}
        />

        {/* MAIN EDITOR AREA: Panel Editor + Right Sidebar */}
        <section className="flex-1 grid grid-cols-3 gap-4">

          {/* MAIN PANEL EDITOR */}
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

          {/* RIGHT SIDE PROPERTIES */}
          <PropertiesPanel
            pages={pages}
            setPages={setPages}
            selectedPageIdx={selectedPageIdx}
            selectedPanelIdx={selectedPanelIdx}
            promptText={promptText}
            setPromptText={setPromptText}
          />
        </section>
      </main>
    </div>
  );
}
