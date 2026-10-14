import React from 'react';
import {
  BREADBOARD_400_HOLES,
  BREADBOARD_WIDTH_MM,
  BREADBOARD_HEIGHT_MM,
  PITCH_MM,
} from '../../engine/connectivity/breadboardTopology';
import { PX_PER_MM } from '../../engine/geometry/coordinates';
import type { ConnectionEndpoint, TerminalAttachment } from '../../types/connections';

interface BreadboardSVGProps {
  instanceId: string;
  positionMM: { x: number; y: number };
  rotationDeg: number;
  attachments: TerminalAttachment[];
  isWiringMode: boolean;
  highlightedHoleIds?: Set<string>;
  highlightedColor?: string;
  snapPreviewHoleMap?: Map<string, boolean>; // holeId -> isValid
  snappedHoleId?: string | null;
  onHoleClick?: (endpoint: ConnectionEndpoint) => void;
}

export const BreadboardSVG: React.FC<BreadboardSVGProps> = ({
  instanceId,
  positionMM: _positionMM,
  rotationDeg: _rotationDeg,
  attachments,
  isWiringMode,
  highlightedHoleIds,
  highlightedColor = '#4edea3',
  snapPreviewHoleMap,
  snappedHoleId,
  onHoleClick,
}) => {
  const widthPX = BREADBOARD_WIDTH_MM * PX_PER_MM;
  const heightPX = BREADBOARD_HEIGHT_MM * PX_PER_MM;
  const centerX = widthPX / 2;
  const centerY = heightPX / 2;

  // Set of occupied hole IDs on this breadboard
  const occupiedHoleIds = new Set(
    attachments.filter((att) => att.breadboardInstanceId === instanceId).map((att) => att.holeId)
  );

  return (
    <g id={`breadboard-${instanceId}`} className="select-none">
      {/* 1. Main Breadboard Body with realistic laboratory beveled casing */}
      <rect
        width={widthPX}
        height={heightPX}
        rx={6}
        fill="#181c24"
        stroke="#31353e"
        strokeWidth="1.5"
        filter="drop-shadow(0 4px 14px rgba(0,0,0,0.65))"
      />

      {/* 2. Top and Bottom Power Rail Background Grooves */}
      <rect
        x={10}
        y={4 * PX_PER_MM - 4}
        width={widthPX - 20}
        height={8.5 * PX_PER_MM}
        rx={3}
        fill="#121620"
        stroke="#242b38"
        strokeWidth="0.8"
      />
      <rect
        x={10}
        y={heightPX - (12.5 * PX_PER_MM)}
        width={widthPX - 20}
        height={8.5 * PX_PER_MM}
        rx={3}
        fill="#121620"
        stroke="#242b38"
        strokeWidth="0.8"
      />

      {/* 3. Central DIP Divider Trough (7.62mm channel) */}
      <rect
        x={10}
        y={centerY - 3.81 * PX_PER_MM}
        width={widthPX - 20}
        height={7.62 * PX_PER_MM}
        rx={2.5}
        fill="#0b0f17"
        stroke="#222834"
        strokeWidth="1"
      />

      {/* 4. Power Rail Colored Polarity Lines */}
      {/* Top Positive (+) Red & Negative (-) Blue */}
      <line
        x1={12}
        y1={4.8 * PX_PER_MM}
        x2={widthPX - 12}
        y2={4.8 * PX_PER_MM}
        stroke="#ef4444"
        strokeWidth="1.2"
        strokeOpacity="0.8"
      />
      <line
        x1={12}
        y1={(4.8 + PITCH_MM) * PX_PER_MM}
        x2={widthPX - 12}
        y2={(4.8 + PITCH_MM) * PX_PER_MM}
        stroke="#3b82f6"
        strokeWidth="1.2"
        strokeOpacity="0.8"
      />

      {/* Bottom Positive (+) Red & Negative (-) Blue */}
      <line
        x1={12}
        y1={(BREADBOARD_HEIGHT_MM - 4.8 - PITCH_MM) * PX_PER_MM}
        x2={widthPX - 12}
        y2={(BREADBOARD_HEIGHT_MM - 4.8 - PITCH_MM) * PX_PER_MM}
        stroke="#ef4444"
        strokeWidth="1.2"
        strokeOpacity="0.8"
      />
      <line
        x1={12}
        y1={(BREADBOARD_HEIGHT_MM - 4.8) * PX_PER_MM}
        x2={widthPX - 12}
        y2={(BREADBOARD_HEIGHT_MM - 4.8) * PX_PER_MM}
        stroke="#3b82f6"
        strokeWidth="1.2"
        strokeOpacity="0.8"
      />

      {/* Power Rail Polarity Text Symbols */}
      <text x={16} y={4.8 * PX_PER_MM - 3} fill="#ef4444" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
        +
      </text>
      <text x={16} y={(4.8 + PITCH_MM) * PX_PER_MM - 3} fill="#3b82f6" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
        -
      </text>
      <text x={16} y={(BREADBOARD_HEIGHT_MM - 4.8 - PITCH_MM) * PX_PER_MM - 3} fill="#ef4444" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
        +
      </text>
      <text x={16} y={(BREADBOARD_HEIGHT_MM - 4.8) * PX_PER_MM - 3} fill="#3b82f6" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
        -
      </text>

      {/* 5. Row and Column Typography Labels */}
      {/* Column numbers: 1, 5, 10, 15, 20, 25, 30 */}
      {[1, 5, 10, 15, 20, 25, 30].map((col) => {
        const x = (4.17 + (col - 1) * PITCH_MM) * PX_PER_MM;
        return (
          <React.Fragment key={`col-label-${col}`}>
            <text
              x={x}
              y={12 * PX_PER_MM}
              fill="#757780"
              fontSize="7"
              fontFamily="JetBrains Mono"
              textAnchor="middle"
              pointerEvents="none"
            >
              {col}
            </text>
            <text
              x={x}
              y={(BREADBOARD_HEIGHT_MM - 11) * PX_PER_MM}
              fill="#757780"
              fontSize="7"
              fontFamily="JetBrains Mono"
              textAnchor="middle"
              pointerEvents="none"
            >
              {col}
            </text>
          </React.Fragment>
        );
      })}

      {/* Row labels: a, b, c, d, e and f, g, h, i, j */}
      {['a', 'b', 'c', 'd', 'e'].map((row, idx) => (
        <text
          key={`row-${row}`}
          x={8}
          y={(14.5 + idx * PITCH_MM) * PX_PER_MM + 2.5}
          fill="#8c909f"
          fontSize="7"
          fontFamily="JetBrains Mono"
          fontWeight="600"
          pointerEvents="none"
        >
          {row}
        </text>
      ))}
      {['f', 'g', 'h', 'i', 'j'].map((row, idx) => (
        <text
          key={`row-${row}`}
          x={8}
          y={(32.28 + idx * PITCH_MM) * PX_PER_MM + 2.5}
          fill="#8c909f"
          fontSize="7"
          fontFamily="JetBrains Mono"
          fontWeight="600"
          pointerEvents="none"
        >
          {row}
        </text>
      ))}

      {/* Center Branding Label */}
      <text
        x={centerX}
        y={centerY + 2.5}
        fill="#3b4252"
        fontSize="8"
        fontFamily="Inter"
        fontWeight="bold"
        letterSpacing="2.5"
        textAnchor="middle"
        pointerEvents="none"
      >
        LABVERSE • 400 TIE-POINTS
      </text>

      {/* 6. THE 400 INDIVIDUAL ADDRESSABLE HOLES */}
      <g id="breadboard-holes-layer">
        {BREADBOARD_400_HOLES.map((hole) => {
          const hx = hole.localXMM * PX_PER_MM;
          const hy = hole.localYMM * PX_PER_MM;
          const isOccupied = occupiedHoleIds.has(hole.id);
          const isHighlighted = highlightedHoleIds?.has(hole.id);
          const snapStatus = snapPreviewHoleMap?.get(hole.id);

          const holeSize = 5.6; // Square socket dimension in px

          return (
            <g
              key={hole.id}
              transform={`translate(${hx}, ${hy})`}
              onClick={(e) => {
                if (isWiringMode && onHoleClick) {
                  e.stopPropagation();
                  onHoleClick({
                    kind: 'breadboard-hole',
                    breadboardInstanceId: instanceId,
                    holeId: hole.id,
                  });
                }
              }}
              className={`${isWiringMode ? 'cursor-crosshair' : 'cursor-default'} group/hole`}
            >
              {/* Hole socket body */}
              <rect
                x={-holeSize / 2}
                y={-holeSize / 2}
                width={holeSize}
                height={holeSize}
                rx={1}
                fill={
                  snapStatus === true
                    ? '#22c55e'
                    : snapStatus === false
                    ? '#ef4444'
                    : isHighlighted
                    ? highlightedColor
                    : isOccupied
                    ? '#3b82f6'
                    : '#090d14'
                }
                stroke={
                  snapStatus === true
                    ? '#86efac'
                    : snapStatus === false
                    ? '#fca5a5'
                    : isHighlighted
                    ? '#ffffff'
                    : isOccupied
                    ? '#93c5fd'
                    : '#373e4d'
                }
                strokeWidth={isHighlighted || snapStatus !== undefined ? '1.5' : '0.8'}
                filter={
                  isHighlighted
                    ? `drop-shadow(0 0 4px ${highlightedColor})`
                    : snapStatus === true
                    ? 'drop-shadow(0 0 6px #22c55e)'
                    : undefined
                }
                className="transition-colors duration-100 hover:fill-[#4edea3] hover:stroke-white"
              />

              {/* Pin indicator when occupied */}
              {isOccupied && (
                <circle cx={0} cy={0} r={1.6} fill="#ffffff" pointerEvents="none" />
              )}

              {/* Active snap preview target ring */}
              {(snapStatus !== undefined || hole.id === snappedHoleId) && (
                <circle
                  cx={0}
                  cy={0}
                  r={5.5}
                  fill="none"
                  stroke={snapStatus === false ? '#ef4444' : '#22c55e'}
                  strokeWidth="1.5"
                  strokeDasharray="2,2"
                  pointerEvents="none"
                />
              )}

              {/* Hit area for clicking */}
              <rect
                x={-PITCH_MM * PX_PER_MM * 0.45}
                y={-PITCH_MM * PX_PER_MM * 0.45}
                width={PITCH_MM * PX_PER_MM * 0.9}
                height={PITCH_MM * PX_PER_MM * 0.9}
                fill="transparent"
              />
            </g>
          );
        })}
      </g>
    </g>
  );
};
