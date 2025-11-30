import React, { useEffect, useRef } from "react";

interface PromptAndSketchProps {
  promptText: string;
  setPromptText: (v: string) => void;
  fortuneSketch: string | null;
  setFortuneSketch: (dataUrl: string) => void;
}

export default function PromptAndSketch({
  promptText,
  setPromptText,
  fortuneSketch,
  setFortuneSketch,
}: PromptAndSketchProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const [characterName, setCharacterName] = React.useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineCap = "round";
    ctx.lineWidth = 3;

    if (fortuneSketch) {
      const img = new Image();
      img.src = fortuneSketch;
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      return;
    }

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#e0e0e0";
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  }, [fortuneSketch]);

  function handleDown(e: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = true;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }

  function handleMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = "#777";
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  }

  function handleUp() {
    drawing.current = false;
    const canvas = canvasRef.current!;
    setFortuneSketch(canvas.toDataURL("image/png"));
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-3">
      
      {/* STORY PROMPT */}
      <div>
        <label className="text-sm font-semibold text-gray-800 mb-1 block">
          Story prompt
        </label>
        <textarea
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="Write your story idea..."
          className="w-full h-20 border rounded-lg p-2 bg-gray-50 resize-none text-gray-900"
        />
      </div>

      {/* CHARACTER SKETCH + NAME */}
      <div>
        {/* heading row */}
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm font-semibold text-gray-800">
            Character fortune sketch
          </label>

          {/* character name input */}
          <input
            type="text"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            placeholder="Character name"
            className="border rounded-md px-2 py-1 text-sm bg-gray-50 text-gray-900 w-40"
          />
        </div>

        {/* canvas */}
        <div className="w-full h-20 border rounded-lg bg-white">
          <canvas
            ref={canvasRef}
            width={900}
            height={80}
            onPointerDown={handleDown}
            onPointerMove={handleMove}
            onPointerUp={handleUp}
            className="w-full h-full"
          />
        </div>
      </div>
      <button
        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg transition w-full"
        onClick={() => console.log("Generate comic book triggered")}
      >
        Generate comic book
      </button>

    </div>
  );
}
