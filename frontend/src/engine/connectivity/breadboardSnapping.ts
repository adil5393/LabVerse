/**
 * Breadboard Snapping & Rigid Terminal Attachment Engine
 *
 * Enforces physical constraints:
 * 1. Multi-terminal components (e.g. 2-pin Resistor, 2-pin LED) are rigid bodies.
 * 2. Snaps primary pin to nearest hole, and checks if secondary pin lands on a valid, compatible hole.
 * 3. Rejects placement if either hole is occupied.
 * 4. Returns exact position delta to snap both terminals into holes without distortion.
 */

import type { GenericEquipmentDefinition, GenericEquipmentInstance } from '../../types/workbench';
import type { BreadboardHole, TerminalAttachment } from '../../types/connections';
import {
  BREADBOARD_400_HOLES,
  getBreadboardHoleWorldPosition,
  BREADBOARD_WIDTH_MM,
  BREADBOARD_HEIGHT_MM,
} from './breadboardTopology';
import { resolveEndpointWorldPosition } from './endpointGeometry';

export interface SnapResult {
  isValid: boolean;
  snappedPositionMM: { x: number; y: number };
  breadboardInstanceId: string;
  attachments: { terminalId: string; holeId: string }[];
  targetHoles: { hole: BreadboardHole; worldPos: { xMM: number; yMM: number } }[];
  rejectReason?: string;
}

export function detectBreadboardSnap(
  movingInstance: GenericEquipmentInstance,
  movingDef: GenericEquipmentDefinition,
  targetPositionMM: { x: number; y: number },
  allInstances: GenericEquipmentInstance[],
  catalog: GenericEquipmentDefinition[],
  currentAttachments: TerminalAttachment[],
  snapRadiusMM = 4.0
): SnapResult | null {
  // Only snap components with 2 or more terminals (LED, Resistor, etc.)
  if (movingDef.terminals.length < 2) return null;
  if (movingDef.id.includes('breadboard')) return null;

  // Find all breadboards on the workbench
  const breadboards = allInstances.filter((i) => i.definitionId.includes('breadboard'));
  if (breadboards.length === 0) return null;

  // Build a temporary instance with target position to evaluate terminal world positions
  const tempInstance: GenericEquipmentInstance = {
    ...movingInstance,
    positionMM: targetPositionMM,
  };

  const primaryTerm = movingDef.terminals[0];
  const secondaryTerm = movingDef.terminals[1];

  const primaryWorldPos = resolveEndpointWorldPosition(
    { kind: 'component-terminal', instanceId: tempInstance.instanceId, terminalId: primaryTerm.id },
    [tempInstance],
    catalog
  );

  const secondaryWorldPos = resolveEndpointWorldPosition(
    { kind: 'component-terminal', instanceId: tempInstance.instanceId, terminalId: secondaryTerm.id },
    [tempInstance],
    catalog
  );

  if (!primaryWorldPos || !secondaryWorldPos) return null;

  // Check each breadboard and collect candidate snap results
  const candidates: {
    result: SnapResult;
    primaryDistance: number;
  }[] = [];

  for (const bb of breadboards) {
    // Quick bounding box check with generous margin
    const bbMargin = 10;
    if (
      primaryWorldPos.xMM < bb.positionMM.x - bbMargin ||
      primaryWorldPos.xMM > bb.positionMM.x + BREADBOARD_WIDTH_MM + bbMargin ||
      primaryWorldPos.yMM < bb.positionMM.y - bbMargin ||
      primaryWorldPos.yMM > bb.positionMM.y + BREADBOARD_HEIGHT_MM + bbMargin
    ) {
      continue;
    }

    // Find nearest hole to primary terminal
    let nearestHole1: BreadboardHole | null = null;
    let minDistance1 = snapRadiusMM;
    let nearestHole1WorldPos: { xMM: number; yMM: number } | null = null;

    for (const hole of BREADBOARD_400_HOLES) {
      const holeWorld = getBreadboardHoleWorldPosition(hole, bb.positionMM, bb.rotationDeg);
      const dist = Math.hypot(holeWorld.xMM - primaryWorldPos.xMM, holeWorld.yMM - primaryWorldPos.yMM);
      if (dist < minDistance1) {
        minDistance1 = dist;
        nearestHole1 = hole;
        nearestHole1WorldPos = holeWorld;
      }
    }

    if (!nearestHole1 || !nearestHole1WorldPos) continue;

    // Calculate required displacement vector to snap primary terminal onto nearestHole1
    const deltaX = nearestHole1WorldPos.xMM - primaryWorldPos.xMM;
    const deltaY = nearestHole1WorldPos.yMM - primaryWorldPos.yMM;

    // After this rigid displacement, where will secondary terminal land?
    const projectedSecondaryWorld = {
      xMM: secondaryWorldPos.xMM + deltaX,
      yMM: secondaryWorldPos.yMM + deltaY,
    };

    // Find matching hole for secondary terminal (tolerance 1.0mm)
    let matchingHole2: BreadboardHole | null = null;
    let matchingHole2WorldPos: { xMM: number; yMM: number } | null = null;
    let minDistance2 = 1.0;

    for (const hole of BREADBOARD_400_HOLES) {
      if (hole.id === nearestHole1.id) continue;
      const holeWorld = getBreadboardHoleWorldPosition(hole, bb.positionMM, bb.rotationDeg);
      const dist = Math.hypot(
        holeWorld.xMM - projectedSecondaryWorld.xMM,
        holeWorld.yMM - projectedSecondaryWorld.yMM
      );
      if (dist < minDistance2) {
        minDistance2 = dist;
        matchingHole2 = hole;
        matchingHole2WorldPos = holeWorld;
      }
    }

    // If secondary terminal does not land precisely on a breadboard hole, record invalid candidate
    if (!matchingHole2 || !matchingHole2WorldPos) {
      candidates.push({
        result: {
          isValid: false,
          snappedPositionMM: targetPositionMM,
          breadboardInstanceId: bb.instanceId,
          attachments: [],
          targetHoles: [{ hole: nearestHole1, worldPos: nearestHole1WorldPos }],
          rejectReason: 'Component pin spacing or orientation does not align with breadboard hole grid.',
        },
        primaryDistance: minDistance1,
      });
      continue;
    }

    // Check hole occupancy strictly on THIS breadboard instance (excluding self)
    const occupiedHoles = new Set(
      currentAttachments
        .filter((att) => att.instanceId !== movingInstance.instanceId && att.breadboardInstanceId === bb.instanceId)
        .map((att) => att.holeId)
    );

    const isHole1Occupied = occupiedHoles.has(nearestHole1.id);
    const isHole2Occupied = occupiedHoles.has(matchingHole2.id);

    if (isHole1Occupied || isHole2Occupied) {
      candidates.push({
        result: {
          isValid: false,
          snappedPositionMM: targetPositionMM,
          breadboardInstanceId: bb.instanceId,
          attachments: [],
          targetHoles: [
            { hole: nearestHole1, worldPos: nearestHole1WorldPos },
            { hole: matchingHole2, worldPos: matchingHole2WorldPos },
          ],
          rejectReason: 'Target breadboard hole is already occupied by another component pin.',
        },
        primaryDistance: minDistance1,
      });
      continue;
    }

    // Rigid snap succeeded on this breadboard!
    candidates.push({
      result: {
        isValid: true,
        snappedPositionMM: {
          x: Math.round((targetPositionMM.x + deltaX) * 100) / 100,
          y: Math.round((targetPositionMM.y + deltaY) * 100) / 100,
        },
        breadboardInstanceId: bb.instanceId,
        attachments: [
          { terminalId: primaryTerm.id, holeId: nearestHole1.id },
          { terminalId: secondaryTerm.id, holeId: matchingHole2.id },
        ],
        targetHoles: [
          { hole: nearestHole1, worldPos: nearestHole1WorldPos },
          { hole: matchingHole2, worldPos: matchingHole2WorldPos },
        ],
      },
      primaryDistance: minDistance1,
    });
  }

  if (candidates.length === 0) return null;

  // Prioritize valid snaps first, sorted by closest primary distance
  const validCandidates = candidates.filter((c) => c.result.isValid);
  if (validCandidates.length > 0) {
    validCandidates.sort((a, b) => a.primaryDistance - b.primaryDistance);
    return validCandidates[0].result;
  }

  // Otherwise return the closest candidate's rejection reason
  candidates.sort((a, b) => a.primaryDistance - b.primaryDistance);
  return candidates[0].result;
}
