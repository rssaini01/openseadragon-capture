# openseadragon-screenshot
Capture high-quality screenshots from OpenSeadragon viewers with optional overlay layers.

## Installation

```bash
npm install openseadragon-screenshot
```

## Usage

```typescript
import OpenSeadragon from 'openseadragon';
import { createScreenshot } from 'openseadragon-screenshot';

// Initialize OpenSeadragon viewer with CORS support
const viewer = OpenSeadragon({
  id: 'viewer',
  tileSources: 'path/to/your/image.dzi',
  crossOriginPolicy: 'Anonymous' // Required for screenshot export
});

// Create screenshot instance
const screenshot = createScreenshot(viewer);

// Capture as Blob (memory-efficient)
const blob = await screenshot.toBlob({
  format: 'png',
  quality: 0.9,
  scale: 2
});

// Or capture as data URL
const dataUrl = await screenshot.capture({
  format: 'png',
  quality: 0.9,
  scale: 2,
  overlays: [overlayCanvas]
});

// Or download directly
await screenshot.download('screenshot.png', {
  overlays: [overlayCanvas]
});
```

## API

### `createScreenshot(viewer: OpenSeadragon.Viewer)`
Creates a screenshot instance for the given viewer.

### `toBlob(options?: ScreenshotOptions): Promise<Blob>`
Captures the viewer as a Blob (recommended for memory efficiency).

### `capture(options?: ScreenshotOptions): Promise<string>`
Captures the viewer as a data URL.

### `download(filename: string, options?: ScreenshotOptions): Promise<void>`
Captures and downloads the screenshot.

#### ScreenshotOptions
- `format?: 'png' | 'jpeg' | 'webp'` - Output format (default: 'png')
- `quality?: number` - Image quality 0-1 (default: 0.9)
- `scale?: number` - Scale factor for upscaling (default: 1) ⚠️ See limitations
- `overlays?: HTMLCanvasElement[]` - Canvas overlays to include
- `fitImageToViewport?: boolean` - Capture entire image vs current viewport (default: true)

## Important Limitations

⚠️ **CORS Requirement**: Images must be served with CORS headers. Set `crossOriginPolicy: 'Anonymous'` in viewer config.

⚠️ **Scale Behavior**: The `scale` parameter upscales the existing canvas using interpolation. It does NOT re-render tiles at higher resolution. For true high-resolution exports, tiles must be loaded at the target resolution.

⚠️ **Timing**: Screenshot capture waits for tiles to load but timing is heuristic-based. May fail if tiles load slowly.

⚠️ **Viewport Changes**: `fitImageToViewport: true` temporarily changes the viewport, which may cause visual flicker.

⚠️ **Overlay Dimensions**: Overlay canvases are stretched to match output dimensions. Ensure they match viewer size or handle scaling manually.

## Production Considerations

- Always handle promise rejections (CORS errors are common)
- Use `toBlob()` instead of `capture()` for better memory management
- Test with your specific tile sources and CORS configuration
- Consider adding retry logic for tile loading failures
- Validate that tiles are fully loaded before capturing