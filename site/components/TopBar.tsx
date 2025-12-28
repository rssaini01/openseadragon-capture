interface TopBarProps {
  onDelete: () => void;
  onClearAll: () => void;
  onExport: () => void;
  objectCount: number;
}

import { Trash2, Eraser, Download } from "lucide-preact";

export function TopBar({ onDelete, onClearAll, onExport, objectCount }: Readonly<TopBarProps>) {
  return (
    <div className="bg-gray-100 border-b border-gray-300 px-6 py-3 flex items-center gap-3">
      <button
        className="p-2 bg-red-500 hover:bg-red-600 rounded text-white transition-all flex items-center gap-2"
        onClick={onDelete}
        title="Delete Selected"
      >
        <Trash2 size={16} />
      </button>
      <button
        className="p-2 bg-orange-500 hover:bg-orange-600 rounded text-white transition-all flex items-center gap-2"
        onClick={onClearAll}
        title="Clear All"
      >
        <Eraser size={16} />
      </button>
      <button
        className="p-2 bg-green-600 hover:bg-green-700 rounded text-white transition-all flex items-center gap-2"
        onClick={onExport}
        title="Export PNG"
      >
        <Download size={16} />
      </button>
      <div className="flex-1"></div>
      <div className="bg-indigo-100 border border-indigo-300 px-3 py-1.5 rounded">
        <span className="text-sm font-semibold text-indigo-700">Objects: {objectCount}</span>
      </div>
    </div>
  );
}
