/**
 * Real-world Coordinate Engine for LabVerse
 * Converts between Screen Pixels and Physical Millimeters (mm).
 */

import type { GenericEquipmentDefinition, GenericEquipmentInstance, ViewportTransform } from '../../types/workbench';

// 96 CSS pixels per inch / 25.4 mm per inch = 3.7795275591 pixels per mm
export const PX_PER_MM = 3.7795275591;

/**
 * Converts screen pixel coordinates to world millimeter coordinates.
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  panX: number,
  panY: number,
  zoom: number
): { xMM: number; yMM: number } {
  const effectiveScale = PX_PER_MM * zoom;
  return {
    xMM: (screenX - panX) / effectiveScale,
    yMM: (screenY - panY) / effectiveScale,
  };
}

/**
 * Converts world millimeter coordinates to screen pixel coordinates.
 */
export function worldToScreen(
  xMM: number,
  yMM: number,
  panX: number,
  panY: number,
  zoom: number
): { screenX: number; screenY: number } {
  const effectiveScale = PX_PER_MM * zoom;
  return {
    screenX: xMM * effectiveScale + panX,
    screenY: yMM * effectiveScale + panY,
  };
}

/**
 * Canonical Authoritative Pointer-to-World Converter.
 * Converts browser client pointer coordinates (e.g. e.clientX, e.clientY)
 * into Workbench World coordinates in physical millimeters (mm).
 *
 * Primary Path:
 * Uses SVG getScreenCTM().inverse() on the world coordinate group element (<g id="workbench-world-group">).
 * This inherently inverts SVG offset, canvas positioning, parent transforms, pan, zoom,
 * and devicePixelRatio in a single native matrix transformation without manual offsets.
 *
 * Fallback Path:
 * If CTM is unavailable (e.g., in unit test / headless environments or before mount),
 * accurately computes screen coordinates using the SVG element's getBoundingClientRect()
 * and applies screenToWorld().
 */
export function pointerToWorld(
  clientX: number,
  clientY: number,
  svgElement: SVGSVGElement | null,
  worldGroupElement: SVGGElement | null,
  viewport: { panX: number; panY: number; zoom: number }
): { xMM: number; yMM: number } {
  if (worldGroupElement && typeof worldGroupElement.getScreenCTM === 'function') {
    const ctm = worldGroupElement.getScreenCTM();
    const svg = svgElement || (worldGroupElement.ownerSVGElement as SVGSVGElement | null);
    if (ctm && svg && typeof svg.createSVGPoint === 'function') {
      try {
        let pt = svg.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        const inv = ctm.inverse();
        pt = pt.matrixTransform(inv);
        // Inside worldGroupElement, 1 unit = 1 SVG pixel, and 1 mm = PX_PER_MM units
        return {
          xMM: pt.x / PX_PER_MM,
          yMM: pt.y / PX_PER_MM,
        };
      } catch {
        // Fallback if matrix inversion fails
      }
    }
  }

  // Fallback using SVG element's exact bounding box
  if (svgElement && typeof svgElement.getBoundingClientRect === 'function') {
    const rect = svgElement.getBoundingClientRect();
    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;
    return screenToWorld(screenX, screenY, viewport.panX, viewport.panY, viewport.zoom);
  }

  // Pure mathematical fallback (for unit tests where elements are not in DOM)
  return screenToWorld(clientX, clientY, viewport.panX, viewport.panY, viewport.zoom);
}

/**
 * Converts world millimeter coordinates to browser client coordinates.
 * Inverse of pointerToWorld, used for diagnostics and round-trip verification.
 */
export function worldToPointer(
  worldX_MM: number,
  worldY_MM: number,
  svgElement: SVGSVGElement | null,
  worldGroupElement: SVGGElement | null,
  viewport: { panX: number; panY: number; zoom: number }
): { clientX: number; clientY: number } {
  if (worldGroupElement && typeof worldGroupElement.getScreenCTM === 'function') {
    const ctm = worldGroupElement.getScreenCTM();
    const svg = svgElement || (worldGroupElement.ownerSVGElement as SVGSVGElement | null);
    if (ctm && svg && typeof svg.createSVGPoint === 'function') {
      try {
        let pt = svg.createSVGPoint();
        pt.x = worldX_MM * PX_PER_MM;
        pt.y = worldY_MM * PX_PER_MM;
        pt = pt.matrixTransform(ctm);
        return {
          clientX: pt.x,
          clientY: pt.y,
        };
      } catch {
        // Fallback
      }
    }
  }

  const svgRect = svgElement && typeof svgElement.getBoundingClientRect === 'function'
    ? svgElement.getBoundingClientRect()
    : { left: 0, top: 0 };

  const screen = worldToScreen(worldX_MM, worldY_MM, viewport.panX, viewport.panY, viewport.zoom);
  return {
    clientX: screen.screenX + svgRect.left,
    clientY: screen.screenY + svgRect.top,
  };
}

/**
 * Check if two 2D Axis-Aligned Bounding Boxes (AABB) overlap in mm.
 */
export function doAABBOverlap(
  boxA: { x: number; y: number; width: number; height: number },
  boxB: { x: number; y: number; width: number; height: number },
  paddingMM = 8
): boolean {
  return !(
    boxA.x + boxA.width + paddingMM < boxB.x ||
    boxA.x > boxB.x + boxB.width + paddingMM ||
    boxA.y + boxA.height + paddingMM < boxB.y ||
    boxA.y > boxB.y + boxB.height + paddingMM
  );
}

/**
 * Calculates a non-overlapping initial placement for newly added equipment within the visible viewport.
 */
export function calculateInitialPlacement(
  newDef: GenericEquipmentDefinition,
  existingInstances: GenericEquipmentInstance[],
  catalog: GenericEquipmentDefinition[],
  viewport: ViewportTransform,
  containerWidth = 1000,
  containerHeight = 600
): { x: number; y: number } {
  // Center of the currently visible screen
  const screenCenterX = containerWidth / 2;
  const screenCenterY = containerHeight / 2;

  // Viewport center in world mm
  const centerWorld = screenToWorld(
    screenCenterX,
    screenCenterY,
    viewport.panX,
    viewport.panY,
    viewport.zoom
  );

  const defWidth = newDef.dimensionsMM.width;
  const defHeight = newDef.dimensionsMM.height;

  // 1. If it's a breadboard and no breadboard exists yet, center it
  const isBreadboard = newDef.id.includes('breadboard');
  if (isBreadboard) {
    const candidateX = centerWorld.xMM - defWidth / 2;
    const candidateY = centerWorld.yMM - defHeight / 2;
    return {
      x: Math.round(candidateX),
      y: Math.round(candidateY),
    };
  }

  // 2. If it's a power supply, place it to the left or top-left of the breadboard
  const breadboardInst = existingInstances.find((i) => i.definitionId.includes('breadboard'));
  if (newDef.id.includes('dc_source') && breadboardInst) {
    const candidateX = breadboardInst.positionMM.x - defWidth - 15;
    const candidateY = breadboardInst.positionMM.y;
    return {
      x: Math.round(candidateX),
      y: Math.round(candidateY),
    };
  }

  // 3. For passives, semiconductors, and wires, position them in clean, staggered zones
  // Build bounding boxes of all existing components
  const existingBoxes = existingInstances.map((inst) => {
    const d = catalog.find((cat) => cat.id === inst.definitionId) || newDef;
    return {
      x: inst.positionMM.x,
      y: inst.positionMM.y,
      width: d.dimensionsMM.width,
      height: d.dimensionsMM.height,
    };
  });

  // Base placement: if breadboard exists, place components above or to the right
  let baseX = centerWorld.xMM;
  let baseY = centerWorld.yMM;

  if (breadboardInst) {
    // Staging area: 15mm above the breadboard or staggered to the right
    baseX = breadboardInst.positionMM.x + (existingInstances.length % 4) * 20;
    baseY = breadboardInst.positionMM.y - defHeight - 15;
  }

  // Grid search for first non-overlapping slot
  let candidate = { x: baseX, y: baseY, width: defWidth, height: defHeight };
  let attempts = 0;
  const stepX = 22;
  const stepY = 18;

  while (existingBoxes.some((b) => doAABBOverlap(candidate, b, 6)) && attempts < 25) {
    attempts++;
    candidate.x += stepX;
    if (candidate.x > baseX + 100) {
      candidate.x = baseX;
      candidate.y += stepY;
    }
  }

  return {
    x: Math.round(candidate.x),
    y: Math.round(candidate.y),
  };
}
