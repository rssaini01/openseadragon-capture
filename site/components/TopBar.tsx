import type { ScreenshotFormat } from 'openseadragon-capture';

interface TopBarProps {
  onDelete: () => void;
  onClearAll: () => void;
  onExport: () => void;
  objectCount: number;
  format: ScreenshotFormat;
  setFormat: (format: ScreenshotFormat) => void;
  quality: number;
  setQuality: (quality: number) => void;
  scale: number;
  setScale: (scale: number) => void;
  fitImageToViewport: boolean;
  setFitImageToViewport: (fitImageToViewport: boolean) => void;
}

import { Trash2, Eraser, Download } from "lucide-preact";

export function TopBar({
  onDelete,
  onClearAll,
  onExport,
  objectCount,
  format,
  setFormat,
  quality,
  setQuality,
  scale,
  setScale,
  fitImageToViewport,
  setFitImageToViewport
}: Readonly<TopBarProps>) {
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
        title="Export"
      >
        <Download size={16} />
      </button>
      <select
        className="px-3 py-1.5 rounded border border-gray-300 text-sm"
        value={format}
        onChange={(e) => setFormat(e.currentTarget.value as ScreenshotFormat)}
      >
        <option value="png">PNG</option>
        <option value="jpeg">JPEG</option>
        <option value="webp">WebP</option>
      </select>
      <label className="flex items-center gap-2 text-sm">
        Quality: <input
        type="range"
        min="0.1"
        max="1"
        step="0.1"
        value={quality}
        onChange={(e) => setQuality(Number.parseFloat(e.currentTarget.value))}
        className="w-24"
      />
        <span className="w-8 text-gray-700">{quality.toFixed(1)}</span>
      </label>
      <label className="flex items-center gap-2 text-sm">
        Scale: <input
        type="range"
        min="1"
        max="4"
        step="0.5"
        value={scale}
        onChange={(e) => setScale(Number.parseFloat(e.currentTarget.value))}
        className="w-24"
      />
        <span className="w-8 text-gray-700">{scale.toFixed(1)}x</span>
      </label>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={fitImageToViewport}
          onChange={(e) => setFitImageToViewport(e.currentTarget.checked)}
          className="cursor-pointer"
        /> Fit Image
      </label>
      <div className="flex-1"></div>
      <div className="bg-indigo-100 border border-indigo-300 px-3 py-1.5 rounded">
        <span className="text-sm font-semibold text-indigo-700">Objects: {objectCount}</span>
      </div>
    </div>
  );
}
