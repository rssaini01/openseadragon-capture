import { useEffect, useRef, useState } from 'preact/hooks';
import OpenSeadragon from 'openseadragon';
import { createScreenshot, OpenSeadragonScreenshot } from 'openseadragon-screenshot';

export function App() {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<OpenSeadragon.Viewer | null>(null);
  const [screenshot, setScreenshot] = useState<OpenSeadragonScreenshot | null>(null);
  const [overlays, setOverlays] = useState<Array<{id: string, canvas: HTMLCanvasElement}>>([]);
  const [previews, setPreviews] = useState<Array<{id: string, dataUrl: string}>>([]);

  useEffect(() => {
    if (!viewerRef.current) return;

    const osdViewer = OpenSeadragon({
      element: viewerRef.current,
      prefixUrl: "https://openseadragon.github.io/openseadragon/images/",
      tileSources: "https://openseadragon.github.io/example-images/highsmith/highsmith.dzi",
      showNavigationControl: false,
      crossOriginPolicy: "Anonymous"
    });

    setViewer(osdViewer);
    setScreenshot(createScreenshot(osdViewer));
  }, []);

  const createTextOverlay = (text: string, index: number): HTMLCanvasElement => {
    if (!viewer) return document.createElement('canvas');
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const viewerCanvas = viewer.drawer.canvas as HTMLCanvasElement;
    
    canvas.width = viewerCanvas.width;
    canvas.height = viewerCanvas.height;
    
    // Calculate position based on viewer dimensions
    const x = viewerCanvas.width * 0.1;
    const y = viewerCanvas.height * (0.1 + index * 0.15);
    const width = viewerCanvas.width * 0.3;
    const height = viewerCanvas.height * 0.1;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = 'black';
    ctx.font = `${Math.floor(height * 0.4)}px Arial`;
    ctx.fillText(text, x + 10, y + height * 0.7);
    
    return canvas;
  };

  const addOverlay = () => {
    if (!viewer) return;
    
    const text = `Overlay ${overlays.length + 1}`;
    const overlay = createTextOverlay(text, overlays.length);
    
    // Add visual overlay to OpenSeadragon viewer
    const overlayElement = document.createElement('div');
    overlayElement.style.background = 'rgba(255, 255, 255, 0.8)';
    overlayElement.style.border = '1px solid black';
    overlayElement.style.padding = '10px';
    overlayElement.style.fontSize = '20px';
    overlayElement.textContent = text;
    
    viewer.addOverlay({
      element: overlayElement,
      location: new OpenSeadragon.Rect(0.1, 0.1 + overlays.length * 0.15, 0.3, 0.1)
    });
    
    setOverlays(prev => [...prev, {id: crypto.randomUUID(), canvas: overlay}]);
  };

  const captureScreenshot = async () => {
    if (!screenshot) return;
    
    const dataUrl = await screenshot.capture({
      format: 'png',
      overlays: overlays.map(o => o.canvas)
    });
    
    setPreviews(prev => [...prev, {id: crypto.randomUUID(), dataUrl}]);
  };

  const downloadScreenshot = async () => {
    if (!screenshot) return;
    
    await screenshot.download('screenshot.png', {
      overlays: overlays.map(o => o.canvas)
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
      {overlays.length > 0 && (
        <div>
          <h3>Overlay Canvases:</h3>
          {overlays.map((overlay) => (
            <canvas key={overlay.id} ref={(ref) => {
              if (ref && overlay.canvas) {
                ref.width = overlay.canvas.width;
                ref.height = overlay.canvas.height;
                const ctx = ref.getContext('2d')!;
                ctx.drawImage(overlay.canvas, 0, 0);
              }
            }} style={{maxWidth: '200px', border: '1px solid #ccc', margin: '5px'}} />
          ))}
        </div>
      )}
      {previews.map((preview) => (
        <img key={preview.id} src={preview.dataUrl} className="preview" alt="Preview" />
      ))}
    </div>
  );
}
