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
  const zoomAroundPoint = useCallback((factor: number, clientX: number, clientY: number, containerRect: DOMRect) => {
    setCamera((prev) => {
      const newZoom = clampZoom(prev.zoom * factor);
      if (newZoom === prev.zoom) return prev;

      // Pointer position in SVG viewBox coordinates (1000 x 450)
      const sx = ((clientX - containerRect.left) / Math.max(1, containerRect.width)) * 1000;
      const sy = ((clientY - containerRect.top) / Math.max(1, containerRect.height)) * 450;

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
