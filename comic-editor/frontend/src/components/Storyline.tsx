import React from "react";
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
  setSelectedPageIdx,
  setSelectedPanelIdx,
}: StorylineProps) {
  return (
    <section className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
      <h3 className="font-semibold mb-3">Storyline</h3>

      {/* Scrollable list */}
      <div className="overflow-y-auto flex-1 flex flex-col gap-4 min-h-0">
        {pages.map((page, pIdx) => {
          const panel = page.panels[0]; // only ONE panel per page

          return (
            <div
              key={page.id}
              className={`border rounded-lg p-4 flex flex-row justify-between items-start gap-3 cursor-pointer
                ${
                  pIdx === selectedPageIdx
                    ? "border-blue-400 shadow-sm"
                    : "border-gray-300"
                }`}
              onClick={() => {
                setSelectedPageIdx(pIdx);
                setSelectedPanelIdx(0);
              }}
            >
              {/* LEFT SIDE — page number + caption */}
              <div className="flex flex-col w-[30%] gap-1">
                <div className="font-semibold text-sm">
                  Page {pIdx + 1}
                </div>
                <div className="text-xs text-gray-500">Caption:</div>
                <div className="text-sm font-medium">
                  {page.storySentence}
                </div>
              </div>

              {/* RIGHT SIDE — panel preview */}
                <div className="w-full aspect-video border rounded overflow-hidden bg-white">
                  <PanelThumbnail panel={panel} />
                </div>

            </div>
          );
        })}
      </div>
    </section>
  );
}
