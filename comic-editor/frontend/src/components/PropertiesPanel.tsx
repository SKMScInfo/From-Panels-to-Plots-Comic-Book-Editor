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
        <label className="text-xs text-gray-500">Page sentence</label>
        <input
          className="w-full border rounded p-2 mt-1"
          value={page.storySentence}
          onChange={(e) => updatePageSentence(e.target.value)}
        />
      </div>
    </aside>
  );
}
