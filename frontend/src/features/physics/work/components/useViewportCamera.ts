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
 * useViewportCamera: Manages 2D viewport pan/zoom transformations
 * independent of the scientific simulation model.
 */
export function useViewportCamera(initial: ViewportCamera = DEFAULT_CAMERA) {
  const [camera, setCamera] = useState<ViewportCamera>(initial);
  const [toolMode, setToolMode] = useState<'select' | 'pan'>('select');
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number; camX: number; camY: number }>({
    x: 0,
    y: 0,
    camX: 0,
    camY: 0,
  });

  const clampZoom = (z: number) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.round(z * 100) / 100));

  const zoomIn = useCallback(() => {
    setCamera((prev) => ({
      ...prev,
      zoom: clampZoom(prev.zoom * 1.25),
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setCamera((prev) => ({
      ...prev,
      zoom: clampZoom(prev.zoom * 0.8),
    }));
  }, []);

  const resetCamera = useCallback(() => {
    setCamera(DEFAULT_CAMERA);
  }, []);

  /**
   * Fit-to-view: frames the active experiment geometry
   * SVG viewbox is 1000 x 450.
   */
  const fitToView = useCallback((leftPx = 70, rightPx = 930, topPx = 150, bottomPx = 360) => {
    const geomW = Math.max(200, rightPx - leftPx);
    const geomH = Math.max(150, bottomPx - topPx);
    const centerX = (leftPx + rightPx) / 2;
    const centerY = (topPx + bottomPx) / 2;

    const targetW = 900;
    const targetH = 380;

    const scaleX = targetW / geomW;
    const scaleY = targetH / geomH;
    const newZoom = clampZoom(Math.min(scaleX, scaleY, 1.8));

    // Center around SVG center (500, 225)
    const newPanX = Math.round(500 - centerX * newZoom);
    const newPanY = Math.round(225 - centerY * newZoom);

    setCamera({
      zoom: newZoom,
      panX: newPanX,
      panY: newPanY,
    });
  }, []);

  const zoomAroundPoint = useCallback((factor: number, clientX: number, clientY: number, containerRect: DOMRect) => {
    setCamera((prev) => {
      const newZoom = clampZoom(prev.zoom * factor);
      if (newZoom === prev.zoom) return prev;

      // Mouse position relative to container
      const px = clientX - containerRect.left;
      const py = clientY - containerRect.top;

      // Adjust pan so the point under the cursor remains invariant
      const newPanX = px - (px - prev.panX) * (newZoom / prev.zoom);
      const newPanY = py - (py - prev.panY) * (newZoom / prev.zoom);

      return {
        zoom: newZoom,
        panX: Math.round(newPanX),
        panY: Math.round(newPanY),
      };
    });
  }, []);

  const startDrag = useCallback((clientX: number, clientY: number) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      camX: camera.panX,
      camY: camera.panY,
    };
  }, [camera.panX, camera.panY]);

  const updateDrag = useCallback((clientX: number, clientY: number) => {
    if (!isDraggingRef.current) return;
    const dx = clientX - dragStartRef.current.x;
    const dy = clientY - dragStartRef.current.y;
    setCamera((prev) => ({
      ...prev,
      panX: Math.round(dragStartRef.current.camX + dx),
      panY: Math.round(dragStartRef.current.camY + dy),
    }));
  }, []);

  const endDrag = useCallback(() => {
    isDraggingRef.current = false;
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
    startDrag,
    updateDrag,
    endDrag,
    isDragging: isDraggingRef.current,
  };
}
