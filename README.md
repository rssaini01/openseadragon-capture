# openseadragon-capture

[![npm version](https://img.shields.io/npm/v/openseadragon-capture.svg)](https://www.npmjs.com/package/openseadragon-capture)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/rssaini01/openseadragon-capture/deploy-demo-site.yml?branch=main)](https://github.com/rssaini01/openseadragon-capture/actions)
[![Downloads](https://img.shields.io/npm/dm/openseadragon-capture.svg)](https://www.npmjs.com/package/openseadragon-capture)

Capture high-quality screenshots from OpenSeadragon viewers with optional overlay layers.

## Installation

```bash
npm install openseadragon-capture
```

## Usage

```typescript
import OpenSeadragon from 'openseadragon';
import { createScreenshot } from 'openseadragon-capture';

// Initialize OpenSeadragon viewer with CORS support
const viewer = OpenSeadragon({
  id: 'viewer',
  tileSources: 'path/to/your/image.dzi',
  crossOriginPolicy: 'Anonymous' // Required for screenshot export
});

// Wait for viewer to open
viewer.addHandler('open', async () => {
  // Create screenshot instance
  const screenshot = createScreenshot(viewer);

  // Capture as Blob (recommended - memory efficient)
  const blob = await screenshot.toBlob({
    format: 'png',
    quality: 0.9,
    scale: 2
  });

  // Or capture as data URL
  const dataUrl = await screenshot.capture({
    format: 'png',
    quality: 0.9,
    overlays: [overlayCanvas]
  });

  // Or download directly
  await screenshot.download('screenshot.png', {
    overlays: [overlayCanvas]
  });
});
```

## API

### `createScreenshot(viewer: OpenSeadragon.Viewer): OpenSeadragonScreenshot`

Creates a screenshot instance for the given viewer.

### `toBlob(options?: ScreenshotOptions): Promise<Blob>`

Captures the viewer as a Blob. Recommended for memory efficiency.

**Throws:** Error if viewer is not open or canvas is unavailable.

### `capture(options?: ScreenshotOptions): Promise<string>`

Captures the viewer as a data URL.

**Throws:** Error if viewer is not open or canvas is unavailable.

### `download(filename: string, options?: ScreenshotOptions): Promise<void>`

Captures and downloads the screenshot with the specified filename.

### ScreenshotOptions

```typescript
export type ScreenshotFormat = 'png' | 'jpeg' | 'webp';

interface ScreenshotOptions {
  /** Output image format. @default 'png' */
  format?: ScreenshotFormat;
  
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
   * Index of the tiled image to capture (for multi-image viewers).
   * @default 0 
   */
  imageIndex?: number;
}
```

## Important Limitations

⚠️ **CORS Requirement**: Images must be served with CORS headers. Set `crossOriginPolicy: 'Anonymous'` in viewer config. CORS errors will cause capture to fail.

⚠️ **Scale Behavior**: The `scale` parameter upscales via canvas interpolation. It does NOT fetch higher-resolution tiles. For true high-resolution exports, tiles must be loaded at the target resolution.

⚠️ **Viewport Changes**: `fitImageToViewport: true` temporarily changes the viewport to fit the entire image, which may cause visual flicker.

⚠️ **Overlay Requirements**: Overlay canvases must already be in viewer pixel space with transforms applied. Overlays with mismatched dimensions will be stretched.

⚠️ **Timing**: Capture waits for tiles to load using heuristic-based timing. May fail if tiles load slowly.

⚠️ **Memory**: Large scale factors can create very large canvases (warning shown if exceeding 16MP).

## Production Considerations

- Always handle promise rejections (CORS errors are common)
- Use `toBlob()` instead of `capture()` for better memory management
- Wait for viewer 'open' event before capturing
- Test with your specific tile sources and CORS configuration
- Validate overlay canvas dimensions match viewer canvas
- Be cautious with large scale factors to avoid memory issues

## License

MIT
