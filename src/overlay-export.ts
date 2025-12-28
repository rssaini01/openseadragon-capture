import OpenSeadragon from 'openseadragon';

export interface ScreenshotOptions {
  format?: 'png' | 'jpeg' | 'webp';
  quality?: number;
  scale?: number;
  overlays?: HTMLCanvasElement[];
  fitImageToViewport?: boolean;
}

interface CaptureStage {
  canvas: HTMLCanvasElement;
  overlays: HTMLCanvasElement[];
  scale: number;
}

export class OpenSeadragonScreenshot {
  private readonly viewer: OpenSeadragon.Viewer;

  constructor(viewer: OpenSeadragon.Viewer) {
    this.viewer = viewer;
  }

  async capture(options: ScreenshotOptions = {}): Promise<string> {
    const blob = await this.toBlob(options);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to convert blob to data URL'));
      reader.readAsDataURL(blob);
    });
  }

  async toBlob(options: ScreenshotOptions = {}): Promise<Blob> {
    const { format = 'png', quality = 0.9, scale = 1, overlays = [], fitImageToViewport = true } = options;
    const stage = await this.prepareCapture(scale, overlays, fitImageToViewport);
    return this.renderStage(stage, format, quality);
  }

  private async prepareCapture(scale: number, overlays: HTMLCanvasElement[], fitImageToViewport: boolean): Promise<CaptureStage> {
    await this.waitForTiles();

    if (fitImageToViewport) {
      const canvas = await this.captureFullImage();
      return { canvas, overlays, scale };
    }

    const canvas = this.viewer.drawer.canvas as HTMLCanvasElement;
    return { canvas, overlays, scale };
  }

  private waitForTiles(): Promise<void> {
    return new Promise((resolve) => {
      if (this.viewer.world.getItemAt(0)?.getFullyLoaded()) {
        requestAnimationFrame(() => resolve());
      } else {
        const handler = () => {
          this.viewer.world.removeHandler('add-item', handler);
          resolve();
        };
        this.viewer.world.addHandler('add-item', handler);
        setTimeout(resolve, 100);
      }
    });
  }

  private async captureFullImage(): Promise<HTMLCanvasElement> {
    const tiledImage = this.viewer.world.getItemAt(0);
    if (!tiledImage) throw new Error('No image loaded');

    const currentBounds = this.viewer.viewport.getBounds();
    const bounds = tiledImage.getBounds();

    try {
      this.viewer.viewport.fitBounds(bounds, true);
      await this.waitForFullLoad(tiledImage);
      return this.viewer.drawer.canvas as HTMLCanvasElement;
    } finally {
      this.viewer.viewport.fitBounds(currentBounds, true);
    }
  }

  private waitForFullLoad(tiledImage: OpenSeadragon.TiledImage): Promise<void> {
    return new Promise(resolve => {
      const checkTiles = () => {
        if (tiledImage.getFullyLoaded()) {
          resolve(undefined);
        } else {
          requestAnimationFrame(checkTiles);
        }
      };
      setTimeout(checkTiles, 100);
    });
  }

  private renderStage(stage: CaptureStage, format: string, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const outputCanvas = document.createElement('canvas');
        const outputCtx = outputCanvas.getContext('2d', { alpha: format === 'png' });

        if (!outputCtx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        outputCanvas.width = stage.canvas.width * stage.scale;
        outputCanvas.height = stage.canvas.height * stage.scale;

        outputCtx.imageSmoothingEnabled = true;
        outputCtx.imageSmoothingQuality = 'high';

        outputCtx.drawImage(stage.canvas, 0, 0, outputCanvas.width, outputCanvas.height);

        for (const overlay of stage.overlays) {
          if (overlay.width > 0 && overlay.height > 0) {
            outputCtx.drawImage(overlay, 0, 0, outputCanvas.width, outputCanvas.height);
          }
        }

        outputCanvas.toBlob(
          (blob) => blob ? resolve(blob) : reject(new Error('Failed to create blob')),
          `image/${format}`,
          quality
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        reject(new Error(`Screenshot failed: ${message}. Check CORS policy if using remote images.`));
      }
    });
  }

  async download(filename: string, options: ScreenshotOptions = {}): Promise<void> {
    const blob = await this.toBlob(options);
    const url = URL.createObjectURL(blob);
    try {
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      link.click();
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }
  }
}

export function createScreenshot(viewer: OpenSeadragon.Viewer): OpenSeadragonScreenshot {
  return new OpenSeadragonScreenshot(viewer);
}
