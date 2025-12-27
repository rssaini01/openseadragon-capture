import { useEffect, useRef, useState } from 'preact/hooks';
import OpenSeadragon from 'openseadragon';
import { createScreenshot, OpenSeadragonScreenshot } from 'openseadragon-screenshot';

export function App() {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [screenshot, setScreenshot] = useState<OpenSeadragonScreenshot | null>(null);
  const [overlays, setOverlays] = useState<HTMLCanvasElement[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (!viewerRef.current) return;

    const viewer = OpenSeadragon({
      element: viewerRef.current,
      prefixUrl: "https://openseadragon.github.io/openseadragon/images/",
      tileSources: "https://openseadragon.github.io/example-images/highsmith/highsmith.dzi",
      showNavigationControl: false,
      crossOriginPolicy: "Anonymous"
    });

    setScreenshot(createScreenshot(viewer));
  }, []);

  const createTextOverlay = (text: string): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    canvas.width = 800;
    canvas.height = 600;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(10, 10 + overlays.length * 60, 200, 50);
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(text, 20, 40 + overlays.length * 60);

    return canvas;
  };

  const addOverlay = () => {
    const text = `Overlay ${overlays.length + 1}`;
    const overlay = createTextOverlay(text);
    setOverlays(prev => [...prev, overlay]);
  };

  const captureScreenshot = async () => {
    if (!screenshot) return;

    const dataUrl = await screenshot.capture({
      format: 'png',
      overlays
    });

    setPreviews(prev => [...prev, dataUrl]);
  };

  const downloadScreenshot = async () => {
    if (!screenshot) return;

    await screenshot.download('screenshot.png', {
      overlays
    });
  };

  return (
    <div>
      <h1>OpenSeadragon Screenshot Demo</h1>
      <div ref={viewerRef} id="viewer" />
      <div className="controls">
        <button onClick={addOverlay}>Add Text Overlay ({overlays.length})</button>
        <button onClick={captureScreenshot}>Capture Screenshot</button>
        <button onClick={downloadScreenshot}>Download Screenshot</button>
      </div>
      {previews.map((preview, i) => (
        <img key={"i_" + i} src={preview} className="preview" alt={`Preview ${i + 1}`} />
      ))}
    </div>
  );
}
