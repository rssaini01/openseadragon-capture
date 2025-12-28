import { useEffect, useRef } from "preact/hooks";
import OpenSeadragon from "openseadragon";
import { FabricOverlay, initOSDFabricOverlay } from "openseadragon-fabric-overlay";
import * as fabric from "fabric";
import type { Tool } from "../App";

interface ViewerProps {
  isFabricMode: boolean;
  currentTool: Tool;
  currentColor: string;
  brushSize: number;
  opacity: number;
  onViewerReady: (viewer: OpenSeadragon.Viewer) => void;
  onOverlayReady: (overlay: FabricOverlay) => void;
}

export function Viewer({
  isFabricMode,
  currentTool,
  currentColor,
  brushSize,
  opacity,
  onViewerReady,
  onOverlayReady,
}: Readonly<ViewerProps>) {
  const viewerRef = useRef<OpenSeadragon.Viewer | null>(null);
  const overlayRef = useRef<FabricOverlay | null>(null);
  const drawStateRef = useRef({
    isDrawing: false,
    startPoint: null as { x: number; y: number } | null,
    activeShape: null as fabric.Object | null
  });
  const propsRef = useRef({ isFabricMode, currentTool, currentColor, opacity });

  useEffect(() => {
    propsRef.current = { isFabricMode, currentTool, currentColor, opacity };
  });

  useEffect(() => {
    const viewer = OpenSeadragon({
      id: "openseadragon",
      prefixUrl: "https://openseadragon.github.io/openseadragon/images/",
      tileSources: "https://openseadragon.github.io/example-images/highsmith/highsmith.dzi",
      showNavigationControl: false,
      crossOriginPolicy: "Anonymous",
    });
    viewerRef.current = viewer;
    onViewerReady(viewer);

    const overlay = initOSDFabricOverlay(viewer, { fabricCanvasOptions: { selection: true } }, "1");
    overlayRef.current = overlay;
    onOverlayReady(overlay);

    const canvas = overlay.fabricCanvas();

    canvas.on("mouse:down", (e: fabric.TPointerEventInfo) => {
      const { isFabricMode, currentTool, currentColor, opacity } = propsRef.current;
      if (!isFabricMode || currentTool === "draw" || e.target || currentTool === "select") return;

      const pointer = canvas.getScenePoint(e.e);
      drawStateRef.current.startPoint = { x: pointer.x, y: pointer.y };
      drawStateRef.current.isDrawing = true;

      if (currentTool === "text") {
        const text = new fabric.FabricText("Sample Text", {
          left: pointer.x,
          top: pointer.y,
          fill: currentColor,
          fontSize: 20,
          opacity
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        return;
      }

      const props = {
        left: pointer.x,
        top: pointer.y,
        fill: currentColor + "40",
        stroke: currentColor,
        strokeWidth: 2,
        opacity
      };
      drawStateRef.current.activeShape = currentTool === "circle"
        ? new fabric.Circle({ ...props, radius: 1 })
        : new fabric.Rect({ ...props, width: 1, height: 1 });
      canvas.add(drawStateRef.current.activeShape);
    });

    canvas.on("mouse:move", (e: fabric.TPointerEventInfo) => {
      const { currentTool } = propsRef.current;
      const { isDrawing, startPoint, activeShape } = drawStateRef.current;
      if (!isDrawing || !startPoint || !activeShape) return;

      const pointer = canvas.getScenePoint(e.e);
      const width = Math.abs(pointer.x - startPoint.x);
      const height = Math.abs(pointer.y - startPoint.y);

      if (currentTool === "rect") {
        (activeShape as fabric.Rect).set({
          left: Math.min(startPoint.x, pointer.x),
          top: Math.min(startPoint.y, pointer.y),
          width,
          height
        });
      } else if (currentTool === "circle") {
        const radius = Math.hypot(width, height) / 2;
        (activeShape as fabric.Circle).set({
          left: (startPoint.x + pointer.x) / 2 - radius,
          top: (startPoint.y + pointer.y) / 2 - radius,
          radius
        });
      }
      canvas.renderAll();
    });

    canvas.on("mouse:up", () => {
      if (!drawStateRef.current.isDrawing) return;

      drawStateRef.current.isDrawing = false;
      drawStateRef.current.startPoint = null;

      if (drawStateRef.current.activeShape) {
        canvas.setActiveObject(drawStateRef.current.activeShape);
        drawStateRef.current.activeShape = null;
      }
    });

    return () => viewer.destroy();
  }, []);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    overlay.setViewerMouseNavEnabled(!isFabricMode);
    if (!isFabricMode) overlay.fabricCanvas().isDrawingMode = false;
  }, [isFabricMode]);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const canvas = overlay.fabricCanvas();
    canvas.isDrawingMode = currentTool === "draw";

    if (currentTool === "draw") {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.width = brushSize;
      canvas.freeDrawingBrush.color = currentColor;
    }
  }, [currentTool, currentColor, brushSize]);

  return <div id="openseadragon" style={{ width: "100%", height: "100%" }} />;
}
