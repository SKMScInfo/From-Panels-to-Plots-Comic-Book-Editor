import PanelThumbnail from "./PanelThumbnail";
import type { Page } from "../types";

interface StorylineProps {
  pages: Page[];
  selectedPageIdx: number;
  selectedPanelIdx: number;
  setSelectedPageIdx: (i: number) => void;
  setSelectedPanelIdx: (i: number) => void;
}

export default function Storyline({
  pages,
  selectedPageIdx,
  selectedPanelIdx,
  setSelectedPageIdx,
  setSelectedPanelIdx,
}: StorylineProps) {
  return (
    <section className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold mb-2">Storyline</h3>

      <div className="flex gap-3 overflow-x-auto">
        {pages.map((page, pIdx) => (
          <div
            key={page.id}
            className={`min-w-[220px] p-3 rounded border cursor-pointer ${
              pIdx === selectedPageIdx ? "border-blue-400" : "border-gray-300"
            }`}
            onClick={() => {
              setSelectedPageIdx(pIdx);
              setSelectedPanelIdx(0);
            }}
          >
            <div className="text-xs text-gray-500 mb-2">Page {pIdx + 1}</div>
            <div className="text-sm font-medium mb-2">{page.storySentence}</div>

            <div className="flex gap-1 mt-1">
              {page.panels.map((panel, idx) => (
                <div
                  key={panel.id}
                  className={`w-14 h-12 border rounded ${
                    idx === selectedPanelIdx && pIdx === selectedPageIdx
                      ? "ring-2 ring-blue-300"
                      : "border-gray-200"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPageIdx(pIdx);
                    setSelectedPanelIdx(idx);
                  }}
                >
                  <PanelThumbnail panel={panel} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
