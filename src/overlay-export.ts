import OpenSeadragon from 'openseadragon';

export interface ScreenshotOptions {
  format?: 'png' | 'jpeg' | 'webp';
  quality?: number;
  scale?: number;
  overlays?: HTMLCanvasElement[];
  fullImage?: boolean;
}

export class OpenSeadragonScreenshot {
  private readonly viewer: OpenSeadragon.Viewer;

  constructor(viewer: OpenSeadragon.Viewer) {
    this.viewer = viewer;
  }

  async capture(options: ScreenshotOptions = {}): Promise<string> {
    const { format = 'png', quality = 0.9, scale = 1, overlays = [], fullImage = true } = options;
    
    return new Promise((resolve, reject) => {
      requestAnimationFrame(() => {
        if (fullImage) {
          this.captureFullImage(scale, overlays, format, quality, resolve, reject);
        } else {
          this.captureViewport(scale, overlays, format, quality, resolve, reject);
        }
      });
    });
  }

  private captureViewport(
    scale: number,
    overlays: HTMLCanvasElement[],
    format: string,
    quality: number,
    resolve: (value: string) => void,
    reject: (reason: Error) => void
  ): void {
    const canvas = this.viewer.drawer.canvas as HTMLCanvasElement;
    this.renderToCanvas(canvas, scale, overlays, format, quality, resolve, reject);
  }

  private captureFullImage(
    scale: number,
    overlays: HTMLCanvasElement[],
    format: string,
    quality: number,
    resolve: (value: string) => void,
    reject: (reason: Error) => void
  ): void {
    const tiledImage = this.viewer.world.getItemAt(0);
    if (!tiledImage) {
      reject(new Error('No image loaded'));
      return;
    }

    const currentBounds = this.viewer.viewport.getBounds();
    const bounds = tiledImage.getBounds();
    
    this.viewer.viewport.fitBounds(bounds, true);
    
    setTimeout(() => {
      try {
        const canvas = this.viewer.drawer.canvas as HTMLCanvasElement;
        this.renderToCanvas(canvas, scale, overlays, format, quality, resolve, reject);
      } finally {
        this.viewer.viewport.fitBounds(currentBounds, true);
      }
    }, 500);
  }

  private renderToCanvas(
    canvas: HTMLCanvasElement,
    scale: number,
    overlays: HTMLCanvasElement[],
    format: string,
    quality: number,
    resolve: (value: string) => void,
    reject: (reason: Error) => void
  ): void {
    try {
      const outputCanvas = document.createElement('canvas');
      const outputCtx = outputCanvas.getContext('2d', { alpha: format === 'png' })!;
      
      outputCanvas.width = canvas.width * scale;
      outputCanvas.height = canvas.height * scale;
      
      outputCtx.imageSmoothingEnabled = true;
      outputCtx.imageSmoothingQuality = 'high';
      
      outputCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, outputCanvas.width, outputCanvas.height);
      
      for (const overlay of overlays) {
        if (overlay.width > 0 && overlay.height > 0) {
          outputCtx.drawImage(overlay, 0, 0, overlay.width, overlay.height, 0, 0, outputCanvas.width, outputCanvas.height);
        }
      }
      
      resolve(outputCanvas.toDataURL(`image/${format}`, quality));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      reject(new Error(`CORS error: Image cannot be exported. Ensure crossOriginPolicy is set and server allows CORS. ${message}`));
    }
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
