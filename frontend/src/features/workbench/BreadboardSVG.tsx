import React from 'react';
import {
  BREADBOARD_400_HOLES,
  BREADBOARD_GEOMETRY,
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
  selectedOccupiedHoleIds?: Set<string>;
  selectedHoleId?: string | null;
  snapPreviewHoleMap?: Map<string, boolean>; // holeId -> isValid
  snappedHoleId?: string | null;
  onHoleClick?: (endpoint: ConnectionEndpoint) => void;
  onSelectHole?: (holeRef: { breadboardInstanceId: string; holeId: string }) => void;
}

export const BreadboardSVG: React.FC<BreadboardSVGProps> = ({
  instanceId,
  positionMM: _positionMM,
  rotationDeg: _rotationDeg,
  attachments,
  isWiringMode,
  highlightedHoleIds,
  highlightedColor = '#4edea3',
  selectedOccupiedHoleIds,
  selectedHoleId,
  snapPreviewHoleMap,
  snappedHoleId,
  onHoleClick,
  onSelectHole,
}) => {
  const widthPX = BREADBOARD_GEOMETRY.widthMM * PX_PER_MM;
  const heightPX = BREADBOARD_GEOMETRY.heightMM * PX_PER_MM;
  const centerX = widthPX / 2;
  const channelCenterY = BREADBOARD_GEOMETRY.channelCenterY * PX_PER_MM;

  const topRailPosY = BREADBOARD_GEOMETRY.topRailPosY * PX_PER_MM;
  const topRailNegY = BREADBOARD_GEOMETRY.topRailNegY * PX_PER_MM;
  const bottomRailPosY = BREADBOARD_GEOMETRY.bottomRailPosY * PX_PER_MM;
  const bottomRailNegY = BREADBOARD_GEOMETRY.bottomRailNegY * PX_PER_MM;

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
        y={(BREADBOARD_GEOMETRY.topRailPosY - 1.8) * PX_PER_MM}
        width={widthPX - 20}
        height={(BREADBOARD_GEOMETRY.topRailNegY - BREADBOARD_GEOMETRY.topRailPosY + 3.6) * PX_PER_MM}
        rx={3}
        fill="#121620"
        stroke="#242b38"
        strokeWidth="0.8"
      />
      <rect
        x={10}
        y={(BREADBOARD_GEOMETRY.bottomRailPosY - 1.8) * PX_PER_MM}
        width={widthPX - 20}
        height={(BREADBOARD_GEOMETRY.bottomRailNegY - BREADBOARD_GEOMETRY.bottomRailPosY + 3.6) * PX_PER_MM}
        rx={3}
        fill="#121620"
        stroke="#242b38"
        strokeWidth="0.8"
      />

      {/* 3. Central DIP Divider Trough (7.62mm channel centered between rows e and f) */}
      <rect
        x={10}
        y={(BREADBOARD_GEOMETRY.channelCenterY - BREADBOARD_GEOMETRY.channelHeightMM / 2) * PX_PER_MM}
        width={widthPX - 20}
        height={BREADBOARD_GEOMETRY.channelHeightMM * PX_PER_MM}
        rx={2.5}
        fill="#0b0f17"
        stroke="#222834"
        strokeWidth="1"
      />

      {/* 4. Power Rail Colored Polarity Lines */}
      {/* Top Positive (+) Red & Negative (-) Blue */}
      <line
        x1={12}
        y1={topRailPosY}
        x2={widthPX - 12}
        y2={topRailPosY}
        stroke="#ef4444"
        strokeWidth="1.2"
        strokeOpacity="0.8"
      />
      <line
        x1={12}
        y1={topRailNegY}
        x2={widthPX - 12}
        y2={topRailNegY}
        stroke="#3b82f6"
        strokeWidth="1.2"
        strokeOpacity="0.8"
      />

      {/* Bottom Positive (+) Red & Negative (-) Blue */}
      <line
        x1={12}
        y1={bottomRailPosY}
        x2={widthPX - 12}
        y2={bottomRailPosY}
        stroke="#ef4444"
        strokeWidth="1.2"
        strokeOpacity="0.8"
      />
      <line
        x1={12}
        y1={bottomRailNegY}
        x2={widthPX - 12}
        y2={bottomRailNegY}
        stroke="#3b82f6"
        strokeWidth="1.2"
        strokeOpacity="0.8"
      />

      {/* Power Rail Polarity Text Symbols */}
      <text x={16} y={topRailPosY - 3} fill="#ef4444" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
        +
      </text>
      <text x={16} y={topRailNegY - 3} fill="#3b82f6" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
        -
      </text>
      <text x={16} y={bottomRailPosY - 3} fill="#ef4444" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
        +
      </text>
      <text x={16} y={bottomRailNegY - 3} fill="#3b82f6" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
        -
      </text>

      {/* 5. Row and Column Typography Labels */}
      {/* Column numbers: 1, 5, 10, 15, 20, 25, 30 */}
      {[1, 5, 10, 15, 20, 25, 30].map((col) => {
        const x = (BREADBOARD_GEOMETRY.leftMarginMM + (col - 1) * BREADBOARD_GEOMETRY.pitchMM) * PX_PER_MM;
        return (
          <React.Fragment key={`col-label-${instanceId}-${col}`}>
            <text
              x={x}
              y={(BREADBOARD_GEOMETRY.rowA_Y - 2.5) * PX_PER_MM}
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
              y={(BREADBOARD_GEOMETRY.rowJ_Y + 2.5) * PX_PER_MM}
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
          key={`row-${instanceId}-${row}`}
          x={8}
          y={(BREADBOARD_GEOMETRY.rowA_Y + idx * BREADBOARD_GEOMETRY.pitchMM) * PX_PER_MM + 2.5}
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
          key={`row-${instanceId}-${row}`}
          x={8}
          y={(BREADBOARD_GEOMETRY.rowF_Y + idx * BREADBOARD_GEOMETRY.pitchMM) * PX_PER_MM + 2.5}
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
        y={channelCenterY + 2.5}
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
      <g id={`breadboard-${instanceId}-holes`}>
        {BREADBOARD_400_HOLES.map((hole) => {
          const hx = hole.localXMM * PX_PER_MM;
          const hy = hole.localYMM * PX_PER_MM;
          const isOccupied = occupiedHoleIds.has(hole.id);
          const isSelectedOccupied = selectedOccupiedHoleIds?.has(hole.id);
          const isSelectedHole = selectedHoleId === hole.id;
          const isHighlighted = highlightedHoleIds?.has(hole.id);
          const snapStatus = snapPreviewHoleMap?.get(hole.id);

          const holeSize = 5.6; // Square socket dimension in px

          return (
            <g
              key={`hole-${instanceId}-${hole.id}`}
              transform={`translate(${hx}, ${hy})`}
              onClick={(e) => {
                e.stopPropagation();
                if (isWiringMode && onHoleClick) {
                  onHoleClick({
                    kind: 'breadboard-hole',
                    breadboardInstanceId: instanceId,
                    holeId: hole.id,
                  });
                } else if (!isWiringMode && onSelectHole) {
                  onSelectHole({
                    breadboardInstanceId: instanceId,
                    holeId: hole.id,
                  });
                }
              }}
              className={`${isWiringMode ? 'cursor-crosshair' : 'cursor-pointer'} group/hole`}
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
                    : isSelectedHole
                    ? '#ffb95a'
                    : isHighlighted
                    ? highlightedColor
                    : isSelectedOccupied
                    ? '#2563eb'
                    : isOccupied
                    ? '#1d4ed8'
                    : '#090d14'
                }
                stroke={
                  snapStatus === true
                    ? '#86efac'
                    : snapStatus === false
                    ? '#fca5a5'
                    : isSelectedHole
                    ? '#ffffff'
                    : isHighlighted
                    ? '#ffffff'
                    : isSelectedOccupied
                    ? '#60a5fa'
                    : isOccupied
                    ? '#3b82f6'
                    : '#373e4d'
                }
                strokeWidth={
                  isSelectedHole || isSelectedOccupied || isHighlighted || snapStatus !== undefined
                    ? '1.5'
                    : '0.8'
                }
                filter={
                  isSelectedHole
                    ? 'drop-shadow(0 0 6px #ffb95a)'
                    : isHighlighted
                    ? `drop-shadow(0 0 4px ${highlightedColor})`
                    : isSelectedOccupied
                    ? 'drop-shadow(0 0 5px #38bdf8)'
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

              {/* Selected component occupied halo */}
              {isSelectedOccupied && (
                <circle
                  cx={0}
                  cy={0}
                  r={5.5}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.8"
                  filter="drop-shadow(0 0 4px #38bdf8)"
                  pointerEvents="none"
                />
              )}

              {/* Selected hole indicator ring */}
              {isSelectedHole && (
                <circle
                  cx={0}
                  cy={0}
                  r={6.0}
                  fill="none"
                  stroke="#ffb95a"
                  strokeWidth="2"
                  strokeDasharray="3,2"
                  pointerEvents="none"
                />
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

              {/* Tooltip description */}
              <title>{`${hole.type === 'power_rail' ? 'Power Rail' : 'Terminal Hole'} ${hole.id} (Strip: ${hole.internalStripId})${isOccupied ? ' • Occupied' : ' • Free'}`}</title>

              {/* Hit area for clicking */}
              <rect
                x={-BREADBOARD_GEOMETRY.pitchMM * PX_PER_MM * 0.45}
                y={-BREADBOARD_GEOMETRY.pitchMM * PX_PER_MM * 0.45}
                width={BREADBOARD_GEOMETRY.pitchMM * PX_PER_MM * 0.9}
                height={BREADBOARD_GEOMETRY.pitchMM * PX_PER_MM * 0.9}
                fill="transparent"
              />
            </g>
          );
        })}
      </g>
    </g>
  );
};
