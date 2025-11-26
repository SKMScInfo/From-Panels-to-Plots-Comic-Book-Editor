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
