import React, { useRef, useState } from "react";

export type ToneSelection = {
  primary: string;
  secondary: string | null;
  mix: number;       // 0..1 blending between emotions
  intensity: number; // 0..1 radial distance
};

interface ToneWheelProps {
  onApply: (selection: ToneSelection) => void;
  onClose?: () => void;
}

type EmotionDef = {
  name: string;
  emoji: string;
  color: string;
  angle: number;
  traits: string;
};

const EMOTIONS: EmotionDef[] = [
  {
    name: "Cheerful",
    emoji: "🙂",
    color: "#FFD93D",
    angle: 0,
    traits: "light-hearted banter, smiles, playful dialogue",
  },
  {
    name: "Energetic",
    emoji: "😆",
    color: "#FF7F11",
    angle: 45,
    traits: "fast action, exaggerated poses, big reactions",
  },
  {
    name: "Angry",
    emoji: "😡",
    color: "#D7263D",
    angle: 90,
    traits: "tense expressions, shouting, conflict in dialogue",
  },
  {
    name: "Horror",
    emoji: "😱",
    color: "#641E16",
    angle: 135,
    traits: "fear, suspense, unsettling scenery",
  },
  {
    name: "Sad",
    emoji: "😢",
    color: "#1B4F72",
    angle: 180,
    traits: "quiet scenes, downcast faces, emotional heaviness",
  },
  {
    name: "Calm",
    emoji: "😌",
    color: "#2874A6",
    angle: 225,
    traits: "relaxed pacing, peaceful atmosphere",
  },
  {
    name: "Dreamy",
    emoji: "🌙",
    color: "#76448A",
    angle: 270,
    traits: "imaginative, surreal elements, soft mood",
  },
  {
    name: "Funny",
    emoji: "🤡",
    color: "#FF5DA2",
    angle: 315,
    traits: "jokes, goofy faces, playful interactions",
  },
];

export default function ToneWheel({ onApply, onClose }: ToneWheelProps) {
  const wheelRef = useRef<HTMLDivElement | null>(null);

  const [dotPos, setDotPos] = useState<{ x: number; y: number } | null>(null);
  const [selection, setSelection] = useState<ToneSelection | null>(null);
  const [displayEmotion, setDisplayEmotion] = useState<EmotionDef | null>(null);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = wheelRef.current!.getBoundingClientRect();
    const size = rect.width;

    const cx = size / 2;
    const cy = size / 2;

    // Coordinates relative to center
    let dx = e.clientX - rect.left - cx;
    let dy = e.clientY - rect.top - cy;

    // Radius for intensity
    let dist = Math.sqrt(dx * dx + dy * dy);
    const maxR = size / 2;
    const clampedDist = Math.min(dist, maxR);
    const intensity = clampedDist / maxR;

    // Clamp marker to wheel edge visually
    if (dist > maxR) {
      const scale = maxR / dist;
      dx *= scale;
      dy *= scale;
      dist = maxR;
    }

    // Convert to angle
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    const normalized = (angle + 360) % 360;

    // Determine which section we are in
    const step = 360 / EMOTIONS.length;
    const pos = normalized / step;

    const i0 = Math.floor(pos) % EMOTIONS.length;
    const i1 = (i0 + 1) % EMOTIONS.length;
    let mix = pos - Math.floor(pos);

    let primary = EMOTIONS[i0];
    let secondary: EmotionDef | null = EMOTIONS[i1];

    // Snap when very close to an emotion
    const SNAP = 0.15;
    if (mix < SNAP) {
      mix = 0;
      secondary = null;
    } else if (mix > 1 - SNAP) {
      mix = 1;
      primary = EMOTIONS[i1];
      secondary = null;
    }

    setDotPos({ x: cx + dx, y: cy + dy });
    setDisplayEmotion(primary);

    setSelection({
      primary: primary.name,
      secondary: secondary ? secondary.name : null,
      mix,
      intensity,
    });
  }

  return (
    <div className="flex flex-col items-center gap-3">

      <div className="text-sm font-semibold">Tone</div>

      <div
        ref={wheelRef}
        onClick={handleClick}
        className="relative rounded-full cursor-pointer"
        style={{
          width: 180,
          height: 180,
          background: `conic-gradient(
            ${EMOTIONS.map(
              (e) => `${e.color} ${e.angle}deg ${(e.angle + 45)}deg`
            ).join(",")}
          )`,
        }}
      >
        {/* Place emojis around wheel */}
        {EMOTIONS.map((m) => {
          const r = 75;
          const rad = (m.angle * Math.PI) / 180;
          const x = 90 + r * Math.cos(rad);
          const y = 90 + r * Math.sin(rad);

          return (
            <div
              key={m.name}
              className="absolute text-xl"
              style={{ left: x - 10, top: y - 10 }}
            >
              {m.emoji}
            </div>
          );
        })}

        {/* Dot marker */}
        {dotPos && (
          <div
            className="absolute w-3 h-3 bg-white border border-black rounded-full"
            style={{
              left: dotPos.x - 5,
              top: dotPos.y - 5,
            }}
          ></div>
        )}
      </div>

      {/* Info panel */}
      {selection && displayEmotion && (
        <div className="text-sm bg-gray-100 p-2 rounded w-56 shadow">
          <div className="font-semibold flex items-center gap-1">
            {displayEmotion.emoji} {displayEmotion.name}
          </div>

          {selection.secondary && (
            <div className="text-xs mt-1 text-gray-700">
              Blend: <strong>{selection.secondary}</strong> (
              {Math.round(selection.mix * 100)}%)
            </div>
          )}

          <div className="text-xs mt-1 text-gray-700">
            Intensity: <strong>{Math.round(selection.intensity * 100)}%</strong>
          </div>

          <div className="text-xs mt-1 text-gray-600 italic">
            {displayEmotion.traits}
          </div>
        </div>
      )}

      {/* Apply button */}
      {selection && (
        <button
          className="mt-1 px-4 py-1 bg-blue-500 text-white rounded text-sm"
          onClick={() => {
            onApply(selection);
            if (onClose) onClose();
          }}
        >
          Apply Tone
        </button>
      )}
    </div>
  );
}
