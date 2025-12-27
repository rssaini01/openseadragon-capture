import OpenSeadragon from 'openseadragon';

export interface ScreenshotOptions {
  format?: 'png' | 'jpeg' | 'webp';
  quality?: number;
  scale?: number;
  overlays?: HTMLCanvasElement[];
}

export class OpenSeadragonScreenshot {
  private readonly viewer: OpenSeadragon.Viewer;

  constructor(viewer: OpenSeadragon.Viewer) {
    this.viewer = viewer;
  }

  async capture(options: ScreenshotOptions = {}): Promise<string> {
    const { format = 'png', quality = 0.9, scale = 1, overlays = [] } = options;
    
    return new Promise((resolve) => {
      // Wait for next frame to ensure canvas is updated
      requestAnimationFrame(() => {
        const canvas = this.viewer.drawer.canvas as HTMLCanvasElement;
        
        // Create output canvas
        const outputCanvas = document.createElement('canvas');
        const outputCtx = outputCanvas.getContext('2d')!;
        
        outputCanvas.width = canvas.width * scale;
        outputCanvas.height = canvas.height * scale;
        
        // Draw main viewer content
        outputCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, outputCanvas.width, outputCanvas.height);
        
        // Draw overlays
        for (const overlay of overlays) {
          if (overlay.width > 0 && overlay.height > 0) {
            outputCtx.drawImage(overlay, 0, 0);
          }
        }
        
        resolve(outputCanvas.toDataURL(`image/${format}`, quality));
      });
    });
  }

  async download(filename: string, options: ScreenshotOptions = {}): Promise<void> {
    const dataUrl = await this.capture(options);
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  }
}

export function createScreenshot(viewer: OpenSeadragon.Viewer): OpenSeadragonScreenshot {
  return new OpenSeadragonScreenshot(viewer);
}
