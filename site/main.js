import OpenSeadragon from 'openseadragon';
import { createScreenshot } from 'openseadragon-screenshot';

// Initialize viewer with a sample image
const viewer = OpenSeadragon({
  id: "viewer",
  prefixUrl: "https://openseadragon.github.io/openseadragon/images/",
  tileSources: "https://openseadragon.github.io/example-images/highsmith/highsmith.dzi",
  showNavigationControl: false,
  crossOriginPolicy: "Anonymous",
});

const screenshot = createScreenshot(viewer);
const overlays = [];

// Create text overlay
function createTextOverlay(text) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = 800;
  canvas.height = 600;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillRect(10, 10, 200, 50);
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText(text, 20, 40);

  return canvas;
}

document.getElementById('addOverlay').onclick = () => {
  const text = `Overlay ${overlays.length + 1}`;
  const overlay = createTextOverlay(text);
  overlays.push(overlay);
  console.log(`Added overlay: ${text}`);
};

document.getElementById('capture').onclick = async () => {
  const dataUrl = await screenshot.capture({
    format: 'png',
    overlays
  });

  const img = document.createElement('img');
  img.src = dataUrl;
  img.style.maxWidth = '400px';
  img.style.border = '1px solid #ccc';
  img.style.margin = '10px';

  document.body.appendChild(img);
};

document.getElementById('download').onclick = async () => {
  await screenshot.download('screenshot.png', {
    overlays
  });
};
