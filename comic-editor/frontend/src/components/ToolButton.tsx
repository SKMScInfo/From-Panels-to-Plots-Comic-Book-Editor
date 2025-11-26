interface ToolButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export default function ToolButton({ label, active, onClick }: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-xs py-2 rounded transition ${
        active
          ? "bg-blue-500 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );
}
