import { useState, useRef, useEffect } from "preact/hooks";
import { Header } from "./components/Header";
import { TopBar } from "./components/TopBar";
import { Toolbar } from "./components/Toolbar";
import { Viewer } from "./components/Viewer";
import type { FabricOverlay } from "openseadragon-fabric-overlay";
import type OpenSeadragon from "openseadragon";
import { createScreenshot } from "openseadragon-capture";

export type Tool = "select" | "draw" | "rect" | "circle" | "text";

export function App() {
  const [isFabricMode, setIsFabricMode] = useState(true);
  const [currentTool, setCurrentTool] = useState<Tool>("select");
  const [currentColor, setCurrentColor] = useState("#ff0000");
  const [brushSize, setBrushSize] = useState(5);
  const [opacity, setOpacity] = useState(1);
  const [objectCount, setObjectCount] = useState(0);
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [quality, setQuality] = useState(1);
  const [scale, setScale] = useState(1);
  const [fitImageToViewport, setFitImageToViewport] = useState(true);
  const overlayRef = useRef<FabricOverlay | null>(null);
  const viewerRef = useRef<OpenSeadragon.Viewer | null>(null);

  const handleClearAll = () => {
    overlayRef.current?.clearFabric();
    setObjectCount(0);
  };

  const handleDelete = () => {
    const canvas = overlayRef.current?.fabricCanvas();
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach(obj => canvas.remove(obj));
      canvas.discardActiveObject();
      canvas.renderAll();
      setObjectCount(canvas.getObjects().length);
    }
  };

  const handleOpacityChange = (newOpacity: number) => {
    setOpacity(newOpacity);
    const canvas = overlayRef.current?.fabricCanvas();
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach(obj => obj.set({ opacity: newOpacity }));
      canvas.renderAll();
    }
  };

  const handleExport = async () => {
    if (!viewerRef.current) return;
    try {
      const canvas = overlayRef.current?.fabricCanvas();
      const screenshot = createScreenshot(viewerRef.current);
      await screenshot.download(`screenshot.${format}`, {
        format,
        quality,
        scale,
        fitImageToViewport,
        overlays: canvas ? [canvas.getElement()] : []
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Export failed');
    }
  };

  const updateObjectCount = () => {
    const canvas = overlayRef.current?.fabricCanvas();
    if (canvas) setObjectCount(canvas.getObjects().length);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFabricMode) return;
      if (e.key === "Escape") {
        e.preventDefault();
        setCurrentTool("select");
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        handleDelete();
      }
      if (e.ctrlKey && e.key === "e") {
        e.preventDefault();
        void handleExport();
      }
    };
    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  }, [isFabricMode, handleDelete, handleExport]);

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <Header isFabricMode={isFabricMode} setIsFabricMode={setIsFabricMode} />
      {isFabricMode && (
        <TopBar
          onDelete={handleDelete}
          onClearAll={handleClearAll}
          onExport={handleExport}
          objectCount={objectCount}
          format={format}
          setFormat={setFormat}
          quality={quality}
          setQuality={setQuality}
          scale={scale}
          setScale={setScale}
          fitImageToViewport={fitImageToViewport}
          setFitImageToViewport={setFitImageToViewport}
        />
      )}
      <div className="flex flex-1 overflow-hidden">
        {isFabricMode && (
          <Toolbar
            currentTool={currentTool}
            setCurrentTool={setCurrentTool}
            currentColor={currentColor}
            setCurrentColor={setCurrentColor}
            brushSize={brushSize}
            setBrushSize={setBrushSize}
            opacity={opacity}
            setOpacity={handleOpacityChange}
          />
        )}
        <div className="flex-1 relative overflow-hidden">
          <Viewer
            isFabricMode={isFabricMode}
            currentTool={currentTool}
            currentColor={currentColor}
            brushSize={brushSize}
            opacity={opacity}
            onViewerReady={(viewer) => { viewerRef.current = viewer; }}
            onOverlayReady={(overlay) => {
              overlayRef.current = overlay;
              const canvas = overlay.fabricCanvas();
              canvas.on("object:added", updateObjectCount);
              canvas.on("object:removed", updateObjectCount);
            }}
          />
        </div>
      </div>
    </div>
  );
}
