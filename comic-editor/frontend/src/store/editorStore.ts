import { create } from "zustand";
import type { ToneSelection } from "../components/ToneWheel";
import type { Color } from "../components/ColourWheel";


interface EditorState {
  activeTool: string;
  tone: ToneSelection | null;
  colorFillPoint: Color | null;

  setActiveTool: (tool: string) => void;
  setTone: (tone: ToneSelection | null) => void;
  setFillColor: (colorFillPoint: Color | null) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  activeTool: "",
  tone: null,
  colorFillPoint: null,

  setActiveTool: (tool) => set({ activeTool: tool }),
  setTone: (tone) => set({ tone }),
  setFillColor: (p) => set({ colorFillPoint: p }),
}));
