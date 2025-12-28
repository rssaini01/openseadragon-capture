export { OpenSeadragonScreenshot, createScreenshot, type ScreenshotOptions } from './overlay-export';

/**
 * LIMITATIONS:
 * - scale parameter upscales existing canvas, does NOT re-render tiles at higher resolution
 * - Requires CORS-enabled images (set crossOriginPolicy: 'Anonymous' in viewer config)
 * - fitImageToViewport mode temporarily changes viewport (may cause visual flicker)
 * - Timing depends on tile loading; may fail if tiles aren't fully loaded
 * - Overlay canvases must match viewer dimensions or will be stretched
 */
