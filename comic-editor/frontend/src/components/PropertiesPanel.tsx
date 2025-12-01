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
  promptText,
  setPromptText,
}: PropertiesProps) {
  return ( null
    // <aside className="bg-white rounded shadow p-4 flex flex-col gap-4">

    //   {/* Horizontal buttons */}
    //   <div className="flex flex-row gap-3 justify-between">

    //     <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-3 rounded flex-1 text-center">
    //       Generate comic page
    //     </button>

    //     <button className="bg-gray-700 hover:bg-gray-800 text-white text-xs py-2 px-3 rounded flex-1 text-center">
    //       Apply inputs locally
    //     </button>

    //     <button className="bg-purple-600 hover:bg-purple-700 text-white text-xs py-2 px-3 rounded flex-1 text-center">
    //       Apply inputs globally
    //     </button>

    //   </div>

    // </aside>
  );
}
