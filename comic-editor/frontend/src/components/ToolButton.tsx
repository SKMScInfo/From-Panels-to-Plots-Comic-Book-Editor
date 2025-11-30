interface ToolButtonProps {
  icon: string;
  active: boolean;
  onClick: () => void;
}

export default function ToolButton({ icon, active, onClick }: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded flex items-center justify-center text-2xl
                  ${active ? "bg-blue-200" : "bg-gray-100"}`}
    >
      {icon}
    </button>
  );
}
