import type { Panel } from "../types";

interface Props {
  panel: Panel;
}

export default function PanelThumbnail({ panel }: Props) {
  if (panel.image)
    return <img src={`http://localhost:8000${panel.image}`} className="w-full h-full object-cover" />;
  if (panel.sketch)
    return <img src={panel.sketch} className="w-full h-full object-cover" />;

  return (
    <div className="w-full h-full bg-gray-50 flex items-center justify-center text-[10px] text-gray-400">
      empty
    </div>
  );
}
