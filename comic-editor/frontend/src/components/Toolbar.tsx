import ToolButton from "./ToolButton";
import ToneWheel from "./ToneWheel"; // ⬅️ make sure this exists
import { useState } from "react";
import { useEditorStore } from "../store/editorStore";
import ColorWheel from "./ColourWheel";

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
  const setTone = useEditorStore((s) => s.setTone);
  const setFillColor = useEditorStore((s) => s.setFillColor);
  return (
    <>
      {/* ─────────────────────────────
          SIDEBAR TOOLBAR  
      ───────────────────────────── */}
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
              // already active → toggle the wheel
              setShowToneWheel((prev) => !prev);
            } else {
              // activate tool and open wheel
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
              // already active → toggle the wheel
              setShowColorWheel((prev) => !prev);
            } else {
              // activate tool and open wheel
              setActiveTool("eyedropper");
              setShowColorWheel(true);
            }
          }}
        />

        <ToolButton
          icon="💬"
          active={activeTool === "prompt"}
          onClick={() =>
            setActiveTool(activeTool === "prompt" ? "" : "prompt")
          }
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

      {/* ─────────────────────────────
          FLOATING TONE WHEEL PANEL
      ───────────────────────────── */}
      {activeTool === "toneBrush" && showToneWheel && (
        <div className="absolute left-24 top-4 z-50">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <ToneWheel onApply={(tone) => {setTone(tone)}} onClose={() => setShowToneWheel(false)} />
          </div>
        </div>
      )}
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

    </>
  );
}
