/**
 * Explicit 400-Tie-Point Solderless Breadboard Topology Model
 *
 * Geometry & Connectivity:
 * - 30 terminal columns (1 to 30)
 * - Rows a–e (top group) and f–j (bottom group) separated by 7.62mm DIP central channel
 * - Power rails: 2 top rails (+, -), 2 bottom rails (+, -), each with 25 holes
 * - Total: 150 (top) + 150 (bottom) + 50 (top rails) + 50 (bottom rails) = 400 holes
 */

import type { BreadboardHole, BreadboardRow } from '../../types/connections';

export const PITCH_MM = 2.54;
export const BREADBOARD_WIDTH_MM = 82.0;
export const BREADBOARD_HEIGHT_MM = 55.5;

export const BREADBOARD_GEOMETRY = {
  widthMM: BREADBOARD_WIDTH_MM,
  heightMM: BREADBOARD_HEIGHT_MM,
  pitchMM: PITCH_MM,
  leftMarginMM: 4.17,
  // Power rails hole Y
  topRailPosY: 4.8,
  topRailNegY: 4.8 + PITCH_MM, // 7.34mm
  bottomRailPosY: 49.6,
  bottomRailNegY: 49.6 + PITCH_MM, // 52.14mm
  // Terminal rows Y
  rowA_Y: 14.5,
  rowE_Y: 14.5 + 4 * PITCH_MM, // 24.66mm
  rowF_Y: 32.28,
  rowJ_Y: 32.28 + 4 * PITCH_MM, // 42.44mm
  // DIP Central channel
  channelCenterY: (24.66 + 32.28) / 2, // 28.47mm
  channelHeightMM: 7.62,
} as const;

// Generate the 400 holes deterministically
export function generateBreadboardHoles(): BreadboardHole[] {
  const holes: BreadboardHole[] = [];

  const leftMargin = BREADBOARD_GEOMETRY.leftMarginMM;
  const topRailPosY = BREADBOARD_GEOMETRY.topRailPosY;
  const topRailNegY = BREADBOARD_GEOMETRY.topRailNegY;
  const rowA_Y = BREADBOARD_GEOMETRY.rowA_Y;
  const rowF_Y = BREADBOARD_GEOMETRY.rowF_Y;
  const bottomRailPosY = BREADBOARD_GEOMETRY.bottomRailPosY;
  const bottomRailNegY = BREADBOARD_GEOMETRY.bottomRailNegY;

  const topRows: BreadboardRow[] = ['a', 'b', 'c', 'd', 'e'];
  const bottomRows: BreadboardRow[] = ['f', 'g', 'h', 'i', 'j'];

  // 1. TOP POWER RAILS (25 holes positive, 25 holes negative = 50 holes)
  // In a 400-tie breadboard, 25 holes are arranged in 5 clusters of 5 holes aligned with columns:
  // Cluster 1: cols 1..5, Cluster 2: cols 7..11, Cluster 3: cols 13..17, Cluster 4: cols 19..23, Cluster 5: cols 25..29
  let railIdx = 1;
  for (let cluster = 0; cluster < 5; cluster++) {
    for (let c = 0; c < 5; c++) {
      const colNum = cluster * 6 + c + 1; // 1..5, 7..11, 13..17, 19..23, 25..29
      const x = leftMargin + (colNum - 1) * PITCH_MM;

      // Top Positive (+)
      holes.push({
        id: `rail_top_pos_${railIdx}`,
        type: 'power_rail',
        railLocation: 'top',
        railType: 'pos',
        railIndex: railIdx,
        localXMM: Math.round(x * 100) / 100,
        localYMM: Math.round(topRailPosY * 100) / 100,
        internalStripId: 'strip_rail_top_pos',
      });

      // Top Negative (-)
      holes.push({
        id: `rail_top_neg_${railIdx}`,
        type: 'power_rail',
        railLocation: 'top',
        railType: 'neg',
        railIndex: railIdx,
        localXMM: Math.round(x * 100) / 100,
        localYMM: Math.round(topRailNegY * 100) / 100,
        internalStripId: 'strip_rail_top_neg',
      });

      railIdx++;
    }
  }

  // 2. TERMINAL ROWS a–e (30 columns * 5 = 150 holes)
  for (let col = 1; col <= 30; col++) {
    const x = leftMargin + (col - 1) * PITCH_MM;
    topRows.forEach((row, rowIdx) => {
      const y = rowA_Y + rowIdx * PITCH_MM;
      holes.push({
        id: `col_${col}_${row}`,
        type: 'terminal',
        column: col,
        row,
        localXMM: Math.round(x * 100) / 100,
        localYMM: Math.round(y * 100) / 100,
        internalStripId: `strip_top_col_${col}`,
      });
    });
  }

  // 3. TERMINAL ROWS f–j (30 columns * 5 = 150 holes)
  for (let col = 1; col <= 30; col++) {
    const x = leftMargin + (col - 1) * PITCH_MM;
    bottomRows.forEach((row, rowIdx) => {
      const y = rowF_Y + rowIdx * PITCH_MM;
      holes.push({
        id: `col_${col}_${row}`,
        type: 'terminal',
        column: col,
        row,
        localXMM: Math.round(x * 100) / 100,
        localYMM: Math.round(y * 100) / 100,
        internalStripId: `strip_bottom_col_${col}`,
      });
    });
  }

  // 4. BOTTOM POWER RAILS (25 holes positive, 25 holes negative = 50 holes)
  railIdx = 1;
  for (let cluster = 0; cluster < 5; cluster++) {
    for (let c = 0; c < 5; c++) {
      const colNum = cluster * 6 + c + 1;
      const x = leftMargin + (colNum - 1) * PITCH_MM;

      // Bottom Positive (+)
      holes.push({
        id: `rail_bottom_pos_${railIdx}`,
        type: 'power_rail',
        railLocation: 'bottom',
        railType: 'pos',
        railIndex: railIdx,
        localXMM: Math.round(x * 100) / 100,
        localYMM: Math.round(bottomRailPosY * 100) / 100,
        internalStripId: 'strip_rail_bottom_pos',
      });

      // Bottom Negative (-)
      holes.push({
        id: `rail_bottom_neg_${railIdx}`,
        type: 'power_rail',
        railLocation: 'bottom',
        railType: 'neg',
        railIndex: railIdx,
        localXMM: Math.round(x * 100) / 100,
        localYMM: Math.round(bottomRailNegY * 100) / 100,
        internalStripId: 'strip_rail_bottom_neg',
      });

      railIdx++;
    }
  }

  return holes;
}

// Singleton cache of the 400 holes
export const BREADBOARD_400_HOLES: BreadboardHole[] = generateBreadboardHoles();

// Fast lookup map by holeId
export const BREADBOARD_HOLE_MAP = new Map<string, BreadboardHole>(
  BREADBOARD_400_HOLES.map((h) => [h.id, h])
);

/**
 * Transforms a breadboard hole local coordinate to world coordinates (in mm)
 * based on breadboard instance position and rotation around its center.
 */
export function getBreadboardHoleWorldPosition(
  hole: BreadboardHole,
  bbPositionMM: { x: number; y: number },
  bbRotationDeg: number
): { xMM: number; yMM: number } {
  const rad = (bbRotationDeg * Math.PI) / 180;
  const centerX = BREADBOARD_WIDTH_MM / 2;
  const centerY = BREADBOARD_HEIGHT_MM / 2;

  // Local offset from center
  const dx = hole.localXMM - centerX;
  const dy = hole.localYMM - centerY;

  // Rotated around center
  const rotX = dx * Math.cos(rad) - dy * Math.sin(rad);
  const rotY = dx * Math.sin(rad) + dy * Math.cos(rad);

  return {
    xMM: bbPositionMM.x + centerX + rotX,
    yMM: bbPositionMM.y + centerY + rotY,
  };
}
