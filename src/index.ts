export { OpenSeadragonScreenshot, createScreenshot } from './capture';
export type { ScreenshotOptions, ScreenshotFormat } from './capture';

/**
 * LIMITATIONS:
 * - Viewport-sized export only (scale upsamples via interpolation, does NOT fetch higher-res tiles)
 * - Requires CORS-enabled images (set crossOriginPolicy: 'Anonymous' in viewer config)
 * - fitImageToViewport mode temporarily changes viewport (may cause visual flicker)
 * - Single-image viewers by default (use imageIndex option for multi-image viewers)
 * - Overlay canvases must already be in viewer pixel space with transforms applied
 */
