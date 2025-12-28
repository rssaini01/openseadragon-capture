import type { Tool } from "../App";
import { MousePointer2, Pencil, Square, Circle, Type } from "lucide-preact";

interface ToolbarProps {
  currentTool: Tool;
  setCurrentTool: (tool: Tool) => void;
  currentColor: string;
  setCurrentColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  opacity: number;
  setOpacity: (opacity: number) => void;
}

export function Toolbar({
  currentTool,
  setCurrentTool,
  currentColor,
  setCurrentColor,
  brushSize,
  setBrushSize,
  opacity,
  setOpacity,
}: Readonly<ToolbarProps>) {
  return (
    <aside className="w-20 bg-gray-800 flex flex-col items-center py-6 gap-4">
      <div className="flex flex-col gap-2">
        <button
          className={`w-12 h-12 rounded-lg transition-all flex items-center justify-center ${currentTool === "select" ? "bg-indigo-500 shadow-lg" : "bg-gray-700 hover:bg-gray-600"}`}
          onClick={() => setCurrentTool("select")}
          title="Select"
        >
          <MousePointer2 size={20} />
        </button>
        <button
          className={`w-12 h-12 rounded-lg transition-all flex items-center justify-center ${currentTool === "draw" ? "bg-indigo-500 shadow-lg" : "bg-gray-700 hover:bg-gray-600"}`}
          onClick={() => setCurrentTool("draw")}
          title="Draw"
        >
          <Pencil size={20} />
        </button>
        <button
          className={`w-12 h-12 rounded-lg transition-all flex items-center justify-center ${currentTool === "rect" ? "bg-indigo-500 shadow-lg" : "bg-gray-700 hover:bg-gray-600"}`}
          onClick={() => setCurrentTool("rect")}
          title="Rectangle"
        >
          <Square size={20} />
        </button>
        <button
          className={`w-12 h-12 rounded-lg transition-all flex items-center justify-center ${currentTool === "circle" ? "bg-indigo-500 shadow-lg" : "bg-gray-700 hover:bg-gray-600"}`}
          onClick={() => setCurrentTool("circle")}
          title="Circle"
        >
          <Circle size={20} />
        </button>
        <button
          className={`w-12 h-12 rounded-lg transition-all flex items-center justify-center ${currentTool === "text" ? "bg-indigo-500 shadow-lg" : "bg-gray-700 hover:bg-gray-600"}`}
          onClick={() => setCurrentTool("text")}
          title="Text"
        >
          <Type size={20} />
        </button>
      </div>
      <div className="w-12 h-px bg-gray-600"></div>
      <input
        type="color"
        value={currentColor}
        onInput={(e) => setCurrentColor((e.target as HTMLInputElement).value)}
        className="w-12 h-12 rounded-lg cursor-pointer"
      />
      <div className="flex flex-col items-center gap-2 w-full px-3">
        <span className="text-xs text-gray-400">{brushSize}</span>
        <input
          type="range"
          min="1"
          max="50"
          value={brushSize}
          onInput={(e) => setBrushSize(Number((e.target as HTMLInputElement).value))}
          className="w-full accent-indigo-500"
        />
      </div>
      <div className="flex flex-col items-center gap-2 w-full px-3">
        <span className="text-xs text-gray-400">{opacity.toFixed(1)}</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={opacity}
          onInput={(e) => setOpacity(Number((e.target as HTMLInputElement).value))}
          className="w-full accent-indigo-500"
        />
      </div>
    </aside>
  );
}
