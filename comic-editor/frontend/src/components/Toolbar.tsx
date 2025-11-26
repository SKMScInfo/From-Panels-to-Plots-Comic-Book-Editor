import ToolButton from "./ToolButton";

interface ToolbarProps {
  activeTool: string;
  setActiveTool: (tool: string) => void;
  createNewPage: () => void;
  exportProject: () => void;
}

export default function Toolbar({
  activeTool,
  setActiveTool,
  createNewPage,
  exportProject,
}: ToolbarProps) {
  return (
    <aside className="w-24 bg-white border-r p-4 flex flex-col gap-4">
      <ToolButton
        label="Smudge"
        active={activeTool === "smudge"}
        onClick={() => setActiveTool("smudge")}
      />
      <ToolButton
        label="Tone"
        active={activeTool === "toneBrush"}
        onClick={() => setActiveTool("toneBrush")}
      />
      <ToolButton
        label="Pick"
        active={activeTool === "eyedropper"}
        onClick={() => setActiveTool("eyedropper")}
      />
      <ToolButton
        label="Prompt"
        active={activeTool === "prompt"}
        onClick={() => setActiveTool("prompt")}
      />

      <div className="pt-4 border-t flex flex-col gap-2">
        <button className="btn" onClick={createNewPage}>
          + Page
        </button>
        <button className="btn" onClick={exportProject}>
          Export
        </button>
      </div>
    </aside>
  );
}
