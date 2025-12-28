import OpenSeadragon from 'openseadragon';

export interface ScreenshotOptions {
  /** Output image format. @default 'png' */
  format?: 'png' | 'jpeg' | 'webp';
  /** Image quality (0-1). @default 0.9 */
  quality?: number;
  /**
   * Upscaling factor applied via canvas interpolation.
   * Does NOT fetch higher-resolution tiles.
   * @default 1
   */
  scale?: number;
  /**
   * Overlay canvases to composite.
   * Must already be in viewer pixel space with transforms applied.
   */
  overlays?: HTMLCanvasElement[];
  /**
   * If true, temporarily fits entire image to viewport before capture.
   * Causes momentary viewport change.
   * @default true
   */
  fitImageToViewport?: boolean;
  /**
   * Index of the tiled image to capture.
   * @default 0
   */
  imageIndex?: number;
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

  /**
   * Captures the viewer as a data URL.
   * @throws {Error} If viewer is not open or canvas is unavailable
   */
  async capture(options: ScreenshotOptions = {}): Promise<string> {
    const blob = await this.toBlob(options);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to convert blob to data URL'));
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Captures the viewer as a Blob (recommended for memory efficiency).
   * @throws {Error} If viewer is not open or canvas is unavailable
   */
  async toBlob(options: ScreenshotOptions = {}): Promise<Blob> {
    this.ensureViewerReady();
    const { format = 'png', quality = 0.9, scale = 1, overlays = [], fitImageToViewport = true, imageIndex = 0 } = options;
    const stage = await this.prepareCapture(scale, overlays, fitImageToViewport, imageIndex);
    return this.renderStage(stage, format, quality);
  }

  private ensureViewerReady(): void {
    if (!this.viewer.isOpen()) {
      throw new Error('Viewer is not open. Wait for the "open" event before capturing.');
    }
  }

  private async prepareCapture(scale: number, overlays: HTMLCanvasElement[], fitImageToViewport: boolean, imageIndex: number): Promise<CaptureStage> {
    await this.waitForDraw();

    if (fitImageToViewport) {
      const canvas = await this.captureFullImage(imageIndex);
      return { canvas, overlays, scale };
    }

    const canvas = this.getCanvas();
    return { canvas, overlays, scale };
  }

  private getCanvas(): HTMLCanvasElement {
    const canvas = this.viewer.drawer?.canvas;
    if (!canvas) {
      throw new Error('Canvas not available. Ensure viewer is fully initialized.');
    }
    return canvas as HTMLCanvasElement;
  }

  private waitForDraw(): Promise<void> {
    return new Promise((resolve) => {
      this.viewer.addOnceHandler('animation-finish', () => {
        requestAnimationFrame(() => resolve());
      });
      this.viewer.forceRedraw();
    });
  }

  private async captureFullImage(imageIndex: number): Promise<HTMLCanvasElement> {
    const tiledImage = this.viewer.world.getItemAt(imageIndex);
    if (!tiledImage) {
      throw new Error(`No image at index ${imageIndex}`);
    }

    const currentBounds = this.viewer.viewport.getBounds();
    const bounds = tiledImage.getBounds();

    try {
      this.viewer.viewport.fitBounds(bounds, true);
      await this.waitForFullLoad(tiledImage);
      return this.getCanvas();
    } finally {
      this.viewer.viewport.fitBounds(currentBounds, true);
    }
  }

  private waitForFullLoad(tiledImage: OpenSeadragon.TiledImage): Promise<void> {
    if (tiledImage.getFullyLoaded()) {
      return this.waitForDraw();
    }
    return new Promise((resolve) => {
      tiledImage.addOnceHandler('fully-loaded-change', () => {
        this.waitForDraw().then(resolve);
      });
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
