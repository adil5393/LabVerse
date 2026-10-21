import React from 'react';
import type { GenericEquipmentDefinition, GenericEquipmentInstance } from '../../types/workbench';
import type { ConnectionEndpoint, TerminalAttachment } from '../../types/connections';
import { PX_PER_MM } from '../../engine/geometry/coordinates';
import { endpointKey } from '../../engine/connectivity/endpointGeometry';
import { BreadboardSVG } from './BreadboardSVG';

interface ComponentRendererProps {
  instance: GenericEquipmentInstance;
  definition: GenericEquipmentDefinition;
  isSelected: boolean;
  isWiringMode: boolean;
  attachments: TerminalAttachment[];
  highlightedTerminalIds?: Set<string>;
  highlightedHoleIds?: Set<string>;
  highlightedColor?: string;
  selectedOccupiedHoleIds?: Set<string>;
  selectedHoleId?: string | null;
  snapPreviewHoleMap?: Map<string, boolean>;
  snappedHoleId?: string | null;
  snappedEndpointKey?: string | null;
  simulationState?: import('../../types/simulation').ComponentSimulationState;
  faultType?: string;
  onSelect: (instanceId: string) => void;
  onStartDrag: (e: React.PointerEvent, instance: GenericEquipmentInstance) => void;
  onTerminalClick?: (endpoint: ConnectionEndpoint) => void;
  onHoleClick?: (endpoint: ConnectionEndpoint) => void;
  onSelectHole?: (holeRef: { breadboardInstanceId: string; holeId: string }) => void;
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  instance,
  definition,
  isSelected,
  isWiringMode,
  attachments,
  highlightedTerminalIds,
  highlightedHoleIds,
  highlightedColor,
  selectedOccupiedHoleIds,
  selectedHoleId,
  snapPreviewHoleMap,
  snappedHoleId,
  snappedEndpointKey,
  simulationState,
  faultType,
  onSelect,
  onStartDrag,
  onTerminalClick,
  onHoleClick,
  onSelectHole,
}) => {
  const widthPX = definition.dimensionsMM.width * PX_PER_MM;
  const heightPX = definition.dimensionsMM.height * PX_PER_MM;
  const centerX = widthPX / 2;
  const centerY = heightPX / 2;

  const isBreadboard = definition.id.includes('breadboard');
  const isPowerSupply = definition.id.includes('dc_source');
  const isResistor = definition.id.includes('resistor');
  const isLED = definition.id.includes('led');

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    onSelect(instance.instanceId);
    onStartDrag(e, instance);
  };

  return (
    <g
      id={`instance-${instance.instanceId}`}
      transform={`translate(${instance.positionMM.x * PX_PER_MM}, ${instance.positionMM.y * PX_PER_MM}) rotate(${instance.rotationDeg}, ${centerX}, ${centerY})`}
      onPointerDown={handlePointerDown}
      className={`${isWiringMode ? 'cursor-default' : 'cursor-move'} group`}
      style={{ touchAction: 'none' }}
    >
      {/* 1. SELECTION HIGHLIGHT & BOUNDING BOX */}
      {isSelected && (
        <g pointerEvents="none">
          <rect
            x={-6}
            y={-6}
            width={widthPX + 12}
            height={heightPX + 12}
            rx={6}
            fill="rgba(77, 142, 255, 0.06)"
            stroke="#4d8eff"
            strokeWidth="1.5"
            strokeDasharray="4,3"
          />
          {/* Subtle corner ticks */}
          <circle cx={-6} cy={-6} r={3} fill="#4d8eff" />
          <circle cx={widthPX + 6} cy={-6} r={3} fill="#4d8eff" />
          <circle cx={-6} cy={heightPX + 6} r={3} fill="#4d8eff" />
          <circle cx={widthPX + 6} cy={heightPX + 6} r={3} fill="#4d8eff" />

          <text
            x={0}
            y={-10}
            fill="#adc6ff"
            fontSize="9"
            fontFamily="JetBrains Mono"
            fontWeight="bold"
          >
            ACTIVE: {definition.name.split(' ')[0].toUpperCase()}
          </text>
        </g>
      )}

      {/* 2. COMPONENT BODY RENDERING */}
      {isBreadboard ? (
        /* Solderless Breadboard with 400 interactive addressable holes */
        <BreadboardSVG
          instanceId={instance.instanceId}
          positionMM={instance.positionMM}
          rotationDeg={instance.rotationDeg}
          attachments={attachments}
          isWiringMode={isWiringMode}
          highlightedHoleIds={highlightedHoleIds}
          highlightedColor={highlightedColor}
          selectedOccupiedHoleIds={selectedOccupiedHoleIds}
          selectedHoleId={selectedHoleId}
          snapPreviewHoleMap={snapPreviewHoleMap}
          snappedHoleId={snappedHoleId}
          onHoleClick={onHoleClick}
          onSelectHole={onSelectHole}
        />
      ) : isPowerSupply ? (
        /* DC Bench Power Supply */
        <g>
          <rect
            width={widthPX}
            height={heightPX}
            rx={5}
            fill="#1c2028"
            stroke={faultType === 'DIRECT_SUPPLY_SHORT' ? '#ef4444' : isSelected ? '#4d8eff' : '#424754'}
            strokeWidth={faultType === 'DIRECT_SUPPLY_SHORT' ? '2.5' : isSelected ? '2' : '1.5'}
            filter={faultType === 'DIRECT_SUPPLY_SHORT' ? 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.7))' : 'drop-shadow(0 3px 8px rgba(0,0,0,0.5))'}
          />
          {/* LCD Voltmeter Display */}
          <rect
            x={10}
            y={8}
            width={widthPX - 20}
            height={20}
            rx={3}
            fill="#090d14"
            stroke={faultType === 'DIRECT_SUPPLY_SHORT' ? '#dc2626' : '#293140'}
            strokeWidth="1"
          />
          <text
            x={centerX}
            y={22}
            fill={faultType === 'DIRECT_SUPPLY_SHORT' ? '#ef4444' : '#4edea3'}
            fontSize="10"
            fontFamily="JetBrains Mono"
            fontWeight="bold"
            textAnchor="middle"
            pointerEvents="none"
          >
            {faultType === 'DIRECT_SUPPLY_SHORT' ? '🚨 SHORT FAULT' : `${Number(instance.properties.voltageV || 5.0).toFixed(1)} V DC`}
          </text>

          <text
            x={centerX}
            y={heightPX - 4}
            fill="#8c909f"
            fontSize="8"
            fontFamily="Inter"
            fontWeight="600"
            textAnchor="middle"
            pointerEvents="none"
          >
            DC BENCH SUPPLY
          </text>
        </g>
      ) : isResistor ? (
        /* Through-Hole Resistor: 10.16mm lead-to-lead span matching 4 breadboard pitches */
        <g>
          {(() => {
            const bodyWidth = 5.6 * PX_PER_MM;
            const bodyHeight = 3.0 * PX_PER_MM;
            const bodyX = centerX - bodyWidth / 2;
            const bodyY = centerY - bodyHeight / 2;

            return (
              <>
                {/* Left Lead: from Terminal A (0, centerY) to ceramic body */}
                <line
                  x1={0}
                  y1={centerY}
                  x2={bodyX}
                  y2={centerY}
                  stroke="#cbd5e1"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />

                {/* Right Lead: from ceramic body to Terminal B (widthPX, centerY) */}
                <line
                  x1={bodyX + bodyWidth}
                  y1={centerY}
                  x2={widthPX}
                  y2={centerY}
                  stroke="#cbd5e1"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />

                {/* Resistor ceramic body */}
                <rect
                  x={bodyX}
                  y={bodyY}
                  width={bodyWidth}
                  height={bodyHeight}
                  rx={3.5}
                  fill="#c5831b"
                  stroke="#ffddb6"
                  strokeWidth="0.8"
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.45))"
                />

                {/* Color bands (330 ohm: Orange, Orange, Brown, Gold) */}
                <rect x={bodyX + bodyWidth * 0.16} y={bodyY} width={2.5} height={bodyHeight} fill="#ea580c" />
                <rect x={bodyX + bodyWidth * 0.32} y={bodyY} width={2.5} height={bodyHeight} fill="#ea580c" />
                <rect x={bodyX + bodyWidth * 0.48} y={bodyY} width={2.5} height={bodyHeight} fill="#78350f" />
                <rect x={bodyX + bodyWidth * 0.76} y={bodyY} width={2.5} height={bodyHeight} fill="#fbbf24" />

                {/* Left Lead Tip Eyelet Marker (Terminal A) */}
                <circle cx={0} cy={centerY} r={3} fill="#cbd5e1" stroke="#475569" strokeWidth="0.8" />
                {/* Right Lead Tip Eyelet Marker (Terminal B) */}
                <circle cx={widthPX} cy={centerY} r={3} fill="#cbd5e1" stroke="#475569" strokeWidth="0.8" />

                {/* Resistance Value Label (positioned below, non-interfering) */}
                <text
                  x={centerX}
                  y={centerY + 16}
                  fill="#dfe2ee"
                  fontSize="8.5"
                  fontFamily="JetBrains Mono"
                  fontWeight="bold"
                  textAnchor="middle"
                  pointerEvents="none"
                >
                  {instance.properties.resistanceOhms || 330} Ω
                </text>
              </>
            );
          })()}
        </g>
      ) : isLED ? (
        /* 5mm Diffused Red LED with physically accurate leads extending downwards */
        <g>
          {(() => {
            const domeWidth = 5.0 * PX_PER_MM;
            const domeHeight = 5.5 * PX_PER_MM;
            const domeX = centerX - domeWidth / 2;
            const collarY = domeHeight;

            const anodeX = 1.73 * PX_PER_MM;
            const cathodeX = 4.27 * PX_PER_MM;
            const leadTipY = heightPX; // 10.0mm

            return (
              <>
                {/* Anode Lead (+) */}
                <line
                  x1={anodeX}
                  y1={collarY}
                  x2={anodeX}
                  y2={leadTipY}
                  stroke="#cbd5e1"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />

                {/* Cathode Lead (-) */}
                <line
                  x1={cathodeX}
                  y1={collarY}
                  x2={cathodeX}
                  y2={leadTipY}
                  stroke="#cbd5e1"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />

                {/* Simulated Visual Illumination */}
                {(() => {
                  const isConducting = simulationState?.conducting ?? false;
                  const brightness = simulationState?.brightness ?? 0;
                  const isOvercurrent = simulationState?.overcurrent ?? false;
                  const isReversed = faultType === 'REVERSED_LED';

                  // Off: dark unlit translucent ruby plastic (#450a0a).
                  // Conducting: radiant incandescent red/coral scaled to non-linear brightness.
                  const domeFill = isConducting
                    ? `rgb(${Math.min(255, Math.round(220 + 35 * brightness))}, ${Math.round(25 + 55 * brightness)}, ${Math.round(25 + 55 * brightness)})`
                    : '#450a0a';

                  const domeStroke = isConducting ? '#fecaca' : '#7f1d1d';
                  const domeFilter = isConducting
                    ? `drop-shadow(0 0 ${Math.round(4 + 16 * brightness)}px rgba(239, 68, 68, ${0.45 + 0.55 * brightness}))`
                    : undefined;

                  return (
                    <>
                      {/* LED Dome Body */}
                      <path
                        d={`M ${domeX} ${collarY}
                            L ${domeX} ${domeHeight * 0.45}
                            A ${domeWidth / 2} ${domeHeight * 0.45} 0 0 1 ${domeX + domeWidth} ${domeHeight * 0.45}
                            L ${domeX + domeWidth} ${collarY} Z`}
                        fill={domeFill}
                        stroke={domeStroke}
                        strokeWidth={isConducting ? 1.5 : 1}
                        style={{
                          filter: domeFilter,
                          transition: 'fill 0.25s ease-out, filter 0.25s ease-out',
                        }}
                      />

                      {/* Internal Luminous Lens Flare when conducting */}
                      {isConducting && (
                        <circle
                          cx={domeX + domeWidth / 2}
                          cy={domeHeight * 0.42}
                          r={Math.max(1, domeWidth * 0.28 * brightness)}
                          fill="rgba(255, 255, 255, 0.75)"
                          style={{ filter: 'blur(1.5px)' }}
                        />
                      )}

                      {/* Overcurrent Warning Indicator Halo */}
                      {isOvercurrent && (
                        <g>
                          <circle
                            cx={domeX + domeWidth / 2}
                            cy={domeHeight * 0.45}
                            r={domeWidth * 0.75}
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="2"
                            strokeDasharray="4 3"
                            className="animate-spin origin-center"
                          />
                          <g transform={`translate(${centerX}, -14)`}>
                            <rect x="-35" y="-7" width="70" height="14" rx="4" fill="#78350f" stroke="#f59e0b" strokeWidth="1" />
                            <text x="0" y="3" fill="#fef3c7" fontSize="7.5" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">
                              ⚠️ OVERCURRENT
                            </text>
                          </g>
                        </g>
                      )}

                      {/* Reversed Bias Warning Badge */}
                      {isReversed && (
                        <g transform={`translate(${centerX}, -14)`}>
                          <rect x="-32" y="-7" width="64" height="14" rx="4" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1" />
                          <text x="0" y="3" fill="#fee2e2" fontSize="7.5" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">
                            🔄 REVERSED
                          </text>
                        </g>
                      )}
                    </>
                  );
                })()}

                {/* Collar Rim with flat notch on Cathode side */}
                <rect
                  x={domeX - 1.5}
                  y={collarY - 2}
                  width={domeWidth + 2.2}
                  height={3}
                  rx={1}
                  fill="#991b1b"
                />

                {/* Lead Tip Contact Markers */}
                <circle cx={anodeX} cy={leadTipY} r={3} fill="#cbd5e1" stroke="#475569" strokeWidth="0.8" />
                <circle cx={cathodeX} cy={leadTipY} r={3} fill="#cbd5e1" stroke="#475569" strokeWidth="0.8" />

                {/* Polarity indicators */}
                <text
                  x={anodeX}
                  y={leadTipY - 5}
                  fill="#ef4444"
                  fontSize="8"
                  fontFamily="JetBrains Mono"
                  fontWeight="bold"
                  textAnchor="middle"
                  pointerEvents="none"
                >
                  +
                </text>
                <text
                  x={cathodeX}
                  y={leadTipY - 5}
                  fill="#38bdf8"
                  fontSize="8"
                  fontFamily="JetBrains Mono"
                  fontWeight="bold"
                  textAnchor="middle"
                  pointerEvents="none"
                >
                  -
                </text>

                {/* Top Label */}
                <text
                  x={centerX}
                  y={-5}
                  fill="#f87171"
                  fontSize="8"
                  fontFamily="JetBrains Mono"
                  fontWeight="bold"
                  textAnchor="middle"
                  pointerEvents="none"
                >
                  LED
                </text>
              </>
            );
          })()}
        </g>
      ) : (
        /* Fallback */
        <rect
          width={widthPX}
          height={heightPX}
          rx={4}
          fill="#1f2633"
          stroke={isSelected ? '#4d8eff' : '#8c909f'}
          strokeWidth="1.5"
        />
      )}

      {/* 3. COMPONENT BODY HIT TARGET (Drag Area) */}
      {!isBreadboard && (
        <rect
          x={-2}
          y={-2}
          width={widthPX + 4}
          height={heightPX + 4}
          fill="transparent"
          className="cursor-move"
        />
      )}

      {/* 4. INDEPENDENT ADDRESSABLE TERMINALS (RENDERED ON TOP FOR EFFORTLESS WIRING & HOVER) */}
      {!isBreadboard &&
        definition.terminals.map((term) => {
          const tx = term.relativePositionMM.x * PX_PER_MM;
          const ty = term.relativePositionMM.y * PX_PER_MM;
          const termKey = endpointKey({
            kind: 'component-terminal',
            instanceId: instance.instanceId,
            terminalId: term.id,
          });
          const isTermHighlighted = highlightedTerminalIds?.has(term.id);
          const isTermSnapped = snappedEndpointKey === termKey;

          // Check if this terminal is physically attached/plugged into a breadboard hole
          const attachment = attachments.find(
            (att) => att.instanceId === instance.instanceId && att.terminalId === term.id
          );
          const isInserted = Boolean(attachment);

          return (
            <g
              key={term.id}
              transform={`translate(${tx}, ${ty})`}
              onPointerDown={(e) => {
                // Prevent component drag when clicking a terminal directly!
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                onTerminalClick?.({
                  kind: 'component-terminal',
                  instanceId: instance.instanceId,
                  terminalId: term.id,
                });
              }}
              className="cursor-crosshair group/term"
            >
              <circle r={isPowerSupply ? 12 : 6} fill="transparent" pointerEvents="all" />
              {/* Active snap preview target halo during wire drawing */}
              {isTermSnapped && (
                <circle
                  cx={0}
                  cy={0}
                  r={isPowerSupply ? 12 : 9}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2"
                  strokeDasharray="3,2"
                  pointerEvents="none"
                />
              )}

              {/* Outer pulsing ring when highlighted by inspector electrical node */}
              {isTermHighlighted && !isTermSnapped && (
                <circle
                  cx={0}
                  cy={0}
                  r={isPowerSupply ? 9 : 6}
                  fill="none"
                  stroke={highlightedColor || '#4edea3'}
                  strokeWidth="2"
                  strokeDasharray="2,2"
                  className="animate-spin"
                  pointerEvents="none"
                />
              )}

              {/* Inserted pin socket ring for components inserted into breadboard */}
              {isInserted && !isPowerSupply && (
                <circle
                  cx={0}
                  cy={0}
                  r={5.5}
                  fill="rgba(34, 197, 94, 0.25)"
                  stroke="#22c55e"
                  strokeWidth="1.2"
                  pointerEvents="none"
                />
              )}

              {/* Terminal contact disc - steady transition without geometry scaling to prevent hover flickering */}
              <circle
                cx={0}
                cy={0}
                r={isPowerSupply ? 7 : isInserted ? 3.5 : 4}
                fill={
                  isTermSnapped
                    ? '#22c55e'
                    : isTermHighlighted
                    ? highlightedColor || '#4edea3'
                    : isInserted
                    ? '#22c55e'
                    : term.polarity === 'positive'
                    ? '#ef4444'
                    : term.polarity === 'negative'
                    ? '#1f2937'
                    : '#475569'
                }
                stroke={isTermSnapped ? '#86efac' : isInserted ? '#bbf7d0' : '#ffffff'}
                strokeWidth={isTermSnapped || isInserted ? '1.8' : '1.2'}
                className="transition-colors group-hover/term:stroke-[#4edea3]"
              />

              {/* Center metallic contact dot for inserted pins */}
              {isInserted && !isPowerSupply && (
                <circle cx={0} cy={0} r={1.2} fill="#ffffff" pointerEvents="none" />
              )}

              {/* Binding post label for power supply */}
              {isPowerSupply && (
                <text
                  x={0}
                  y={3.5}
                  fill="#ffffff"
                  fontSize="9"
                  fontFamily="JetBrains Mono"
                  fontWeight="bold"
                  textAnchor="middle"
                  pointerEvents="none"
                >
                  {term.polarity === 'positive' ? '+' : '-'}
                </text>
              )}

              <title>{`${definition.name}: ${term.label}${isInserted ? ` (Plugged into ${attachment?.holeId})` : ' (Free Floating)'}`}</title>

              {/* Generous transparent hit area (28px diameter) so clicking is never frustrating */}
              <circle cx={0} cy={0} r={14} fill="transparent" />
            </g>
          );
        })}
    </g>
  );
};
