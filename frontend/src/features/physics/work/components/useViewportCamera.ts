import { useState, useCallback, useRef } from 'react';

export interface ViewportCamera {
  zoom: number;
  panX: number;
  panY: number;
}

export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 3.0;
export const DEFAULT_CAMERA: ViewportCamera = { zoom: 1.0, panX: 0, panY: 0 };

/**
 * Converts screen/pointer coordinates into the 2D apparatus coordinate space,
 * taking into account the SVG aspect ratio, viewBox (1000x450), and active camera zoom/pan.
 */
export function screenToApparatus(
  clientX: number,
  clientY: number,
  containerRect: DOMRect,
  camera: ViewportCamera
): { x: number; y: number } {
  const sx = ((clientX - containerRect.left) / Math.max(1, containerRect.width)) * 1000;
  const sy = ((clientY - containerRect.top) / Math.max(1, containerRect.height)) * 450;
  const appX = 500 + (sx - 500 - camera.panX) / camera.zoom;
  const appY = 225 + (sy - 225 - camera.panY) / camera.zoom;
  return { x: appX, y: appY };
}

/**
 * Converts a pointer position into the SVG's own viewBox coordinates using the browser's real
 * screen transform, so letterboxing from `preserveAspectRatio`, padding and CSS sizing are all honoured.
 */
export function clientToViewBox(svg: SVGSVGElement, clientX: number, clientY: number): { x: number; y: number; unitsPerPx: number } | null {
  const ctm = svg.getScreenCTM();
  if (!ctm || ctm.a === 0) return null;
  // The viewBox is only scaled and translated (no rotation), so the inverse is direct.
  return { x: (clientX - ctm.e) / ctm.a, y: (clientY - ctm.f) / ctm.d, unitsPerPx: 1 / ctm.a };
}

/** Viewbox point (as returned by `clientToViewBox`) to apparatus space under the camera transform. */
export function viewBoxToApparatus(sx: number, sy: number, camera: ViewportCamera): { x: number; y: number } {
  return { x: 500 + (sx - 500 - camera.panX) / camera.zoom, y: 225 + (sy - 225 - camera.panY) / camera.zoom };
}

/**
 * useViewportCamera: Manages 2D viewport pan/zoom transformations
 * independent of the scientific simulation model.
 */
export function useViewportCamera(initial: ViewportCamera = DEFAULT_CAMERA) {
  const [camera, setCamera] = useState<ViewportCamera>(initial);
  const [toolMode, setToolMode] = useState<'select' | 'pan'>('select');
  const isDraggingRef = useRef(false);
  const [dragging, setDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; camX: number; camY: number }>({
    x: 0,
    y: 0,
    camX: 0,
    camY: 0,
  });

  const clampZoom = (z: number) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.round(z * 100) / 100));

  /**
   * Zoom in centered on viewport center (500, 225)
   */
  const zoomIn = useCallback(() => {
    setCamera((prev) => ({
      ...prev,
      zoom: clampZoom(prev.zoom * 1.25),
    }));
  }, []);

  /**
   * Zoom out centered on viewport center (500, 225)
   */
  const zoomOut = useCallback(() => {
    setCamera((prev) => ({
      ...prev,
      zoom: clampZoom(prev.zoom * 0.8),
    }));
  }, []);

  /**
   * Reset camera to default 100% zoom and (0,0) pan offset
   */
  const resetCamera = useCallback(() => {
    setCamera(DEFAULT_CAMERA);
  }, []);

  /**
   * Fit-to-view: frames the actual experiment geometry into viewBox (1000 x 450)
   */
  const fitToView = useCallback((leftPx = 70, rightPx = 930, topPx = 150, bottomPx = 360) => {
    const geomW = Math.max(200, rightPx - leftPx);
    const geomH = Math.max(150, bottomPx - topPx);
    const centerX = (leftPx + rightPx) / 2;
    const centerY = (topPx + bottomPx) / 2;

    const targetW = 860;
    const targetH = 360;

    const scaleX = targetW / geomW;
    const scaleY = targetH / geomH;
    const newZoom = clampZoom(Math.min(scaleX, scaleY, 1.8));

    // Calculate pan so (centerX, centerY) lands exactly at viewBox center (500, 225)
    const newPanX = Math.round(-(centerX - 500) * newZoom);
    const newPanY = Math.round(-(centerY - 225) * newZoom);

    setCamera({
      zoom: newZoom,
      panX: newPanX,
      panY: newPanY,
    });
  }, []);

  /**
   * Smooth pointer-centered zoom (mouse wheel and pinch zoom)
   */
  const zoomAroundViewPoint = useCallback((factor: number, sx: number, sy: number) => {
    setCamera((prev) => {
      const newZoom = clampZoom(prev.zoom * factor);
      if (newZoom === prev.zoom) return prev;

      // Invariant transform adjustment: keep the apparatus point under (sx, sy) fixed
      const newPanX = (sx - 500) - (newZoom / prev.zoom) * (sx - 500 - prev.panX);
      const newPanY = (sy - 225) - (newZoom / prev.zoom) * (sy - 225 - prev.panY);

      return {
        zoom: newZoom,
        panX: Math.round(newPanX),
        panY: Math.round(newPanY),
      };
    });
  }, []);

  /** Rect-based variant kept for callers that only have a container rectangle. */
  const zoomAroundPoint = useCallback((factor: number, clientX: number, clientY: number, containerRect: DOMRect) => {
    const sx = ((clientX - containerRect.left) / Math.max(1, containerRect.width)) * 1000;
    const sy = ((clientY - containerRect.top) / Math.max(1, containerRect.height)) * 450;
    zoomAroundViewPoint(factor, sx, sy);
  }, [zoomAroundViewPoint]);

  const startDrag = useCallback((clientX: number, clientY: number) => {
    isDraggingRef.current = true;
    setDragging(true);
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      camX: camera.panX,
      camY: camera.panY,
    };
  }, [camera.panX, camera.panY]);

  /** `unitsPerPx` converts screen pixels to viewBox units so the scene follows the cursor exactly. */
  const updateDrag = useCallback((clientX: number, clientY: number, unitsPerPx = 1) => {
    if (!isDraggingRef.current) return;
    const dx = (clientX - dragStartRef.current.x) * unitsPerPx;
    const dy = (clientY - dragStartRef.current.y) * unitsPerPx;
    setCamera((prev) => ({
      ...prev,
      panX: Math.round(dragStartRef.current.camX + dx),
      panY: Math.round(dragStartRef.current.camY + dy),
    }));
  }, []);

  const endDrag = useCallback(() => {
    isDraggingRef.current = false;
    setDragging(false);
  }, []);

  return {
    camera,
    setCamera,
    toolMode,
    setToolMode,
    zoomIn,
    zoomOut,
    resetCamera,
    fitToView,
    zoomAroundPoint,
    zoomAroundViewPoint,
    startDrag,
    updateDrag,
    endDrag,
    isDragging: dragging,
    /** Always-current panning flag for event handlers (state can lag a render behind). */
    isPanning: () => isDraggingRef.current,
  };
}
