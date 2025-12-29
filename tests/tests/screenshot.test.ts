import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createScreenshot, OpenSeadragonScreenshot } from '../../src';

const createMockViewer = (isOpen = true) => {
  const mockTiledImage = {
    getFullyLoaded: vi.fn(() => true),
    addOnceHandler: vi.fn(),
    getBounds: vi.fn(() => ({ x: 0, y: 0, width: 1, height: 1 }))
  };

  return {
    isOpen: vi.fn(() => isOpen),
    drawer: {
      canvas: document.createElement('canvas')
    },
    viewport: {
      getBounds: vi.fn(() => ({ x: 0, y: 0, width: 1, height: 1 })),
      fitBounds: vi.fn()
    },
    world: {
      getItemAt: vi.fn(() => mockTiledImage)
    },
    addOnceHandler: vi.fn((event, handler) => {
      if (event === 'animation-finish') setTimeout(handler, 0);
    }),
    forceRedraw: vi.fn()
  } as any;
};

describe('createScreenshot', () => {
  it('should create screenshot instance', () => {
    const viewer = createMockViewer();
    const screenshot = createScreenshot(viewer);
    expect(screenshot).toBeInstanceOf(OpenSeadragonScreenshot);
  });
});

describe('OpenSeadragonScreenshot', () => {
  let viewer: any;
  let screenshot: OpenSeadragonScreenshot;

  beforeEach(() => {
    viewer = createMockViewer();
    viewer.drawer.canvas.width = 800;
    viewer.drawer.canvas.height = 600;
    screenshot = new OpenSeadragonScreenshot(viewer);
  });

  describe('toBlob', () => {
    it('should throw if viewer not open', async () => {
      viewer.isOpen.mockReturnValue(false);
      await expect(screenshot.toBlob()).rejects.toThrow('Viewer is not open');
    });

    it('should capture with default options', async () => {
      const blob = await screenshot.toBlob();
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/png');
    });

    it('should capture with custom format', async () => {
      const blob = await screenshot.toBlob({ format: 'jpeg' });
      expect(blob.type).toBe('image/jpeg');
    });

    it('should capture without fitting viewport', async () => {
      await screenshot.toBlob({ fitImageToViewport: false });
      expect(viewer.viewport.fitBounds).not.toHaveBeenCalled();
    });

    it('should capture with scale factor', async () => {
      const blob = await screenshot.toBlob({ scale: 2 });
      expect(blob).toBeInstanceOf(Blob);
    });

    it('should handle webp format', async () => {
      const blob = await screenshot.toBlob({ format: 'webp' });
      expect(blob.type).toBe('image/webp');
    });

    it('should throw when canvas unavailable', async () => {
      viewer.drawer = {};
      await expect(screenshot.toBlob()).rejects.toThrow('Canvas not available');
    });

    it('should throw for invalid image index', async () => {
      viewer.world.getItemAt.mockReturnValue(null);
      await expect(screenshot.toBlob({ imageIndex: 5 })).rejects.toThrow('No image at index 5');
    });

    it('should handle overlays', async () => {
      const overlay = document.createElement('canvas');
      overlay.width = 400;
      overlay.height = 300;
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await screenshot.toBlob({ overlays: [overlay] });
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle large scale warning', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      await screenshot.toBlob({ scale: 10 });
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle tiles not loaded', async () => {
      const mockTiledImage = {
        getFullyLoaded: vi.fn(() => false),
        addOnceHandler: vi.fn((event, handler) => setTimeout(handler, 10)),
        getBounds: vi.fn(() => ({ x: 0, y: 0, width: 1, height: 1 }))
      };
      viewer.world.getItemAt.mockReturnValue(mockTiledImage);

      const blob = await screenshot.toBlob();
      expect(blob).toBeInstanceOf(Blob);
    });
  });

  describe('capture', () => {
    it('should return data URL', async () => {
      const dataUrl = await screenshot.capture();
      expect(dataUrl).toMatch(/^data:image\/png;base64,/);
    });

    it('should return jpeg data URL', async () => {
      const dataUrl = await screenshot.capture({ format: 'jpeg' });
      expect(dataUrl).toMatch(/^data:image\/jpeg;base64,/);
    });

    it('should handle FileReader error', async () => {
      const originalFileReader = global.FileReader;
      global.FileReader = class {
        readAsDataURL() {
          setTimeout(() => (this as any).onerror?.(new Error('FileReader error')), 0);
        }
      } as any;

      await expect(screenshot.capture()).rejects.toThrow('Failed to convert blob to data URL');
      global.FileReader = originalFileReader;
    });
  });

  describe('download', () => {
    it('should trigger download', async () => {
      const createElementSpy = vi.spyOn(document, 'createElement');
      await screenshot.download('test.png');
      expect(createElementSpy).toHaveBeenCalledWith('a');
    });

    it('should handle requestIdleCallback fallback', async () => {
      const original = global.requestIdleCallback;
      delete (global as any).requestIdleCallback;
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

      await screenshot.download('test.png');
      expect(setTimeoutSpy).toHaveBeenCalled();

      global.requestIdleCallback = original;
    });

    it('should handle canvas context failure', async () => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = vi.fn(() => null);

      await expect(screenshot.toBlob()).rejects.toThrow('Failed to get canvas context');
      HTMLCanvasElement.prototype.getContext = original;
    });

    it('should handle toBlob failure', async () => {
      const original = HTMLCanvasElement.prototype.toBlob;
      HTMLCanvasElement.prototype.toBlob = function (callback) { callback(null); };

      await expect(screenshot.toBlob()).rejects.toThrow('Failed to create blob');
      HTMLCanvasElement.prototype.toBlob = original;
    });
  });
});
