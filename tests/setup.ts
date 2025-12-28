import { vi } from 'vitest';

// Mock canvas context for jsdom
HTMLCanvasElement.prototype.getContext = vi.fn((contextType) => {
  if (contextType === '2d') {
    return {
      drawImage: vi.fn(),
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high'
    };
  }
  return null;
});

HTMLCanvasElement.prototype.toBlob = vi.fn((callback, type = 'image/png') => {
  const blob = new Blob(['fake-image-data'], { type });
  callback(blob);
});