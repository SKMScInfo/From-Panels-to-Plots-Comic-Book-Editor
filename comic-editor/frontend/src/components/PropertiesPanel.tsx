import React from "react";
import type { Page } from "../types";


interface PropertiesProps {
  pages: Page[];
  setPages: React.Dispatch<React.SetStateAction<Page[]>>;
  selectedPageIdx: number;
  selectedPanelIdx: number;
  promptText: string;
  setPromptText: (v: string) => void;
}

export default function PropertiesPanel({
  pages,
  setPages,
  selectedPageIdx,
  selectedPanelIdx,
  promptText,
  setPromptText,
}: PropertiesProps) {
  const page = pages[selectedPageIdx];
  const panel = page.panels[selectedPanelIdx];

  function updateCaption(v: string) {
    setPages((old) => {
      const copy = structuredClone(old);
      copy[selectedPageIdx].panels[selectedPanelIdx].caption = v;
      return copy;
    });
  }

  function updatePageSentence(v: string) {
    setPages((old) => {
      const copy = structuredClone(old);
      copy[selectedPageIdx].storySentence = v;
      return copy;
    });
  }

  return (
    <aside className="bg-white rounded shadow p-4 flex flex-col gap-4">
      <div>
        <label className="text-xs text-gray-500">Caption</label>
        <textarea
          value={panel.caption}
          onChange={(e) => updateCaption(e.target.value)}
          className="w-full border rounded p-2 mt-1"
          rows={3}
        />
      </div>

      <div>
        <label className="text-xs text-gray-500">Page sentence</label>
        <input
          className="w-full border rounded p-2 mt-1"
          value={page.storySentence}
          onChange={(e) => updatePageSentence(e.target.value)}
        />
      </div>

      <div>
        <label className="text-xs text-gray-500">Prompt</label>
        <input
          className="w-full border rounded p-2 mt-1"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
        />
      </div>

      <div>
        <h4 className="font-medium">Tone</h4>
        <pre className="text-xs bg-gray-100 p-2 rounded h-24 overflow-auto">
          {JSON.stringify(panel.tone, null, 2)}
        </pre>
      </div>
    </aside>
  );
}
