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

// Initialize OpenSeadragon viewer
const viewer = OpenSeadragon({
  id: 'viewer',
  tileSources: 'path/to/your/image.dzi'
});

// Create screenshot instance
const screenshot = createScreenshot(viewer);

// Capture with overlays
const overlayCanvas = document.createElement('canvas');
// ... draw on overlay canvas

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

### `capture(options?: ScreenshotOptions): Promise<string>`
Captures the viewer as a data URL.

### `download(filename: string, options?: ScreenshotOptions): Promise<void>`
Captures and downloads the screenshot.

#### ScreenshotOptions
- `format?: 'png' | 'jpeg' | 'webp'` - Output format (default: 'png')
- `quality?: number` - Image quality 0-1 (default: 0.9)
- `scale?: number` - Scale factor (default: 1)
- `overlays?: HTMLCanvasElement[]` - Canvas overlays to include