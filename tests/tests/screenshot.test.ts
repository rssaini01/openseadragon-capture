import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createScreenshot, OpenSeadragonScreenshot } from 'openseadragon-capture';

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
  });

  describe('download', () => {
    it('should trigger download', async () => {
      const createElementSpy = vi.spyOn(document, 'createElement');
      await screenshot.download('test.png');
      expect(createElementSpy).toHaveBeenCalledWith('a');
    });
  });
});
