/**
 * Endpoint Geometry Engine
 * Resolves physical world coordinates (in mm) for any ConnectionEndpoint
 * (Component terminal, Breadboard hole, or Junction) in real time.
 */

import type { ConnectionEndpoint } from '../../types/connections';
import type { GenericEquipmentDefinition, GenericEquipmentInstance } from '../../types/workbench';
import { BREADBOARD_400_HOLES, BREADBOARD_HOLE_MAP, getBreadboardHoleWorldPosition } from './breadboardTopology';

export function getEndpointKey(endpoint: ConnectionEndpoint): string {
  switch (endpoint.kind) {
    case 'component-terminal':
      return `term:${endpoint.instanceId}:${endpoint.terminalId}`;
    case 'breadboard-hole':
      return `hole:${endpoint.breadboardInstanceId}:${endpoint.holeId}`;
    case 'junction':
      return `junc:${endpoint.junctionId}`;
  }
}

export function parseEndpointKey(key: string): ConnectionEndpoint {
  const parts = key.split(':');
  if (parts[0] === 'term') {
    return { kind: 'component-terminal', instanceId: parts[1], terminalId: parts[2] };
  } else if (parts[0] === 'hole') {
    return { kind: 'breadboard-hole', breadboardInstanceId: parts[1], holeId: parts[2] };
  } else {
    return { kind: 'junction', junctionId: parts[1] };
  }
}

/**
 * Calculates the exact world coordinate (in mm) of any connection endpoint.
 */
export function resolveEndpointWorldPosition(
  endpoint: ConnectionEndpoint,
  instances: GenericEquipmentInstance[],
  catalog: GenericEquipmentDefinition[]
): { xMM: number; yMM: number } | null {
  if (endpoint.kind === 'component-terminal') {
    const inst = instances.find((i) => i.instanceId === endpoint.instanceId);
    if (!inst) return null;
    const def = catalog.find((d) => d.id === inst.definitionId);
    if (!def) return null;

    const term = def.terminals.find((t) => t.id === endpoint.terminalId);
    if (!term) return null;

    // Component center for rotation
    const centerX = def.dimensionsMM.width / 2;
    const centerY = def.dimensionsMM.height / 2;

    const rad = (inst.rotationDeg * Math.PI) / 180;
    const dx = term.relativePositionMM.x - centerX;
    const dy = term.relativePositionMM.y - centerY;

    const rotX = dx * Math.cos(rad) - dy * Math.sin(rad);
    const rotY = dx * Math.sin(rad) + dy * Math.cos(rad);

    return {
      xMM: inst.positionMM.x + centerX + rotX,
      yMM: inst.positionMM.y + centerY + rotY,
    };
  }

  if (endpoint.kind === 'breadboard-hole') {
    const bbInst = instances.find((i) => i.instanceId === endpoint.breadboardInstanceId);
    if (!bbInst) return null;

    const hole = BREADBOARD_HOLE_MAP.get(endpoint.holeId);
    if (!hole) return null;

    return getBreadboardHoleWorldPosition(hole, bbInst.positionMM, bbInst.rotationDeg);
  }

  return null;
}

/**
 * Finds the nearest connection endpoint (component terminal or breadboard hole)
 * within a physical snapping threshold.
 */
export interface FindNearestEndpointOptions {
  maxDistanceMM?: number;
  zoom?: number;
  activeTargetKey?: string | null;
  ignoreEndpointKey?: string | null;
}

export interface NearestEndpointResult {
  endpoint: ConnectionEndpoint;
  worldPos: { xMM: number; yMM: number };
  distanceMM: number;
  key: string;
}

/**
 * Finds the nearest compatible connection endpoint (Component Terminal or Breadboard Hole)
 * to a given world coordinate in millimeters.
 *
 * Implements:
 * - Screen-pixel based snap radius adapted dynamically for zoom level.
 * - Hysteresis to prevent oscillation between adjacent endpoints under mouse jitter.
 * - Deterministic, stable tie-breaking.
 * - Filtering out ignored endpoints (e.g. wire start terminal).
 */
export function findNearestEndpoint(
  worldMM: { xMM: number; yMM: number },
  instances: GenericEquipmentInstance[],
  catalog: GenericEquipmentDefinition[],
  optionsOrMaxDist: number | FindNearestEndpointOptions = 4.5
): NearestEndpointResult | null {
  const options: FindNearestEndpointOptions =
    typeof optionsOrMaxDist === 'number'
      ? { maxDistanceMM: optionsOrMaxDist }
      : optionsOrMaxDist;

  const zoom = options.zoom ?? 1.0;
  // Snap radius: 18 screen pixels converted to mm at current zoom
  const screenAcquirePX = 18;
  const screenReleasePX = 25;
  const PX_PER_MM_LOCAL = 3.7795275591;

  const baseAcquireMM = options.maxDistanceMM ?? Math.max(1.8, screenAcquirePX / (PX_PER_MM_LOCAL * zoom));
  const baseReleaseMM = baseAcquireMM * (screenReleasePX / screenAcquirePX);

  let bestCandidate: NearestEndpointResult | null = null;
  let bestScore = Infinity;

  const activeKey = options.activeTargetKey || null;
  const ignoreKey = options.ignoreEndpointKey || null;

  // 1. Check all component terminals
  for (const inst of instances) {
    if (inst.definitionId.includes('breadboard')) continue;
    const def = catalog.find((d) => d.id === inst.definitionId);
    if (!def) continue;

    for (const term of def.terminals) {
      const ep: ConnectionEndpoint = {
        kind: 'component-terminal',
        instanceId: inst.instanceId,
        terminalId: term.id,
      };
      const key = getEndpointKey(ep);
      if (ignoreKey && key === ignoreKey) continue;

      const pos = resolveEndpointWorldPosition(ep, instances, catalog);
      if (!pos) continue;

      const dist = Math.hypot(pos.xMM - worldMM.xMM, pos.yMM - worldMM.yMM);
      const isCurrentlyActive = activeKey === key;
      const maxAllowed = isCurrentlyActive ? baseReleaseMM : baseAcquireMM;

      if (dist <= maxAllowed) {
        // Apply sticky hysteresis bonus to current active target
        const score = isCurrentlyActive ? dist * 0.75 : dist;
        if (score < bestScore - 0.001 || (Math.abs(score - bestScore) <= 0.001 && bestCandidate && key < bestCandidate.key)) {
          bestScore = score;
          bestCandidate = { endpoint: ep, worldPos: pos, distanceMM: dist, key };
        }
      }
    }
  }

  // 2. Check breadboard holes
  const breadboards = instances.filter((i) => i.definitionId.includes('breadboard'));
  for (const bb of breadboards) {
    // Hole snap radius: capped at 2.0mm so cursor doesn't snap to distant breadboard columns (pitch = 2.54mm)
    const holeAcquireMM = Math.min(baseAcquireMM, 2.0);
    const holeReleaseMM = Math.min(baseReleaseMM, 2.6);

    // Bounding box pre-check with generous margin
    if (
      worldMM.xMM < bb.positionMM.x - 8 ||
      worldMM.xMM > bb.positionMM.x + 92 ||
      worldMM.yMM < bb.positionMM.y - 8 ||
      worldMM.yMM > bb.positionMM.y + 64
    ) {
      continue;
    }

    for (const hole of BREADBOARD_400_HOLES) {
      const ep: ConnectionEndpoint = {
        kind: 'breadboard-hole',
        breadboardInstanceId: bb.instanceId,
        holeId: hole.id,
      };
      const key = getEndpointKey(ep);
      if (ignoreKey && key === ignoreKey) continue;

      const pos = getBreadboardHoleWorldPosition(hole, bb.positionMM, bb.rotationDeg);
      const dist = Math.hypot(pos.xMM - worldMM.xMM, pos.yMM - worldMM.yMM);
      const isCurrentlyActive = activeKey === key;
      const maxAllowed = isCurrentlyActive ? holeReleaseMM : holeAcquireMM;

      if (dist <= maxAllowed) {
        const score = isCurrentlyActive ? dist * 0.75 : dist;
        if (score < bestScore - 0.001 || (Math.abs(score - bestScore) <= 0.001 && bestCandidate && key < bestCandidate.key)) {
          bestScore = score;
          bestCandidate = { endpoint: ep, worldPos: pos, distanceMM: dist, key };
        }
      }
    }
  }

  return bestCandidate;
}
