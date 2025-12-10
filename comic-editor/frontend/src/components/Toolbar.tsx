import ToolButton from "./ToolButton";
import ToneWheel from "./ToneWheel";
import ColorWheel from "./ColourWheel";
import { useState } from "react";
import { useEditorStore } from "../store/editorStore";

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
  const [showToneWheel, setShowToneWheel] = useState(false);
  const [showColorWheel, setShowColorWheel] = useState(false);

  // NEW STATE FOR PROMPT TOOL
  const [showPromptPanel, setShowPromptPanel] = useState(false);
  const [promptText, setPromptText] = useState("");

  const setTone = useEditorStore((s) => s.setTone);
  const setFillColor = useEditorStore((s) => s.setFillColor);
  const savePrompt = useEditorStore((s) => s.setPrompt); // ← optional store method

  return (
    <>
      {/* LEFT TOOLBAR */}
      <aside className="w-24 bg-white border-r p-4 flex flex-col gap-4">
        <ToolButton
          icon="🎚️"
          active={activeTool === "smudge"}
          onClick={() =>
            setActiveTool(activeTool === "smudge" ? "" : "smudge")
          }
        />

        <ToolButton
          icon="🖌️"
          active={activeTool === "toneBrush"}
          onClick={() => {
            if (activeTool === "toneBrush") {
              setShowToneWheel((prev) => !prev);
            } else {
              setActiveTool("toneBrush");
              setShowToneWheel(true);
            }
          }}
        />

        <ToolButton
          icon="🎨"
          active={activeTool === "eyedropper"}
          onClick={() => {
            if (activeTool === "eyedropper") {
              setShowColorWheel((prev) => !prev);
            } else {
              setActiveTool("eyedropper");
              setShowColorWheel(true);
            }
          }}
        />

        {/* PROMPT TOOL */}
        <ToolButton
          icon="💬"
          active={activeTool === "prompt"}
          onClick={() => {
            if (activeTool === "prompt") {
              setShowPromptPanel((prev) => !prev);
            } else {
              setActiveTool("prompt");
              setShowPromptPanel(true);
            }
          }}
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

      {/* TONE WHEEL */}
      {activeTool === "toneBrush" && showToneWheel && (
        <div className="absolute left-24 top-4 z-50">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <ToneWheel
              onApply={(tone) => setTone(tone)}
              onClose={() => setShowToneWheel(false)}
            />
          </div>
        </div>
      )}

      {/* COLOR WHEEL */}
      {activeTool === "eyedropper" && showColorWheel && (
        <div className="absolute left-24 top-36 z-50">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <ColorWheel
              onApply={(color) => setFillColor(color)}
              onClose={() => setShowColorWheel(false)}
            />
          </div>
        </div>
      )}

      {/* RIGHT-SIDE PROMPT PANEL */}
{/* RIGHT-SIDE PROMPT PANEL */}
{activeTool === "prompt" && showPromptPanel && (
  <div className="absolute left-28 top-4 w-80 z-50">
    <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col gap-4">
      <h3 className="font-semibold text-lg">Enter Prompt</h3>

      <textarea
        className="w-full h-40 border rounded p-2"
        placeholder="Describe your scene..."
        value={promptText}
        onChange={(e) => setPromptText(e.target.value)}
      />

      <button
        className="btn-primary w-full py-2 rounded bg-blue-600 text-white"
        onClick={() => {
          savePrompt(promptText);
          setShowPromptPanel(false);
        }}
      >
        Save
      </button>
    </div>
  </div>
)}

    </>
  );
}
