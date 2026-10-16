import React from 'react';
import type { JumperWire, ConnectionEndpoint } from '../../types/connections';
import type { GenericEquipmentDefinition, GenericEquipmentInstance } from '../../types/workbench';
import { resolveEndpointWorldPosition, endpointKey } from '../../engine/connectivity/endpointGeometry';
import { getVoltageColor } from '../../engine/simulation/voltageColor';
import { PX_PER_MM } from '../../engine/geometry/coordinates';

interface WireRendererProps {
  wires: JumperWire[];
  instances: GenericEquipmentInstance[];
  catalog: GenericEquipmentDefinition[];
  activeWireStart: ConnectionEndpoint | null;
  cursorWorldMM: { xMM: number; yMM: number } | null;
  snappedEndpoint?: { endpoint: ConnectionEndpoint; worldPos: { xMM: number; yMM: number }; key: string } | null;
  activeWireColor: string;
  selectedWireId: string | null;
  reconnectingWire?: { wireId: string; which: 'from' | 'to' } | null;
  showDiagnostics?: boolean;
  showVoltage?: boolean;
  nodeVoltages?: Record<string, number>;
  connectivityMap?: Map<string, string>;
  onSelectWire?: (wireId: string) => void;
  onStartReconnect?: (wireId: string, which: 'from' | 'to', e: React.PointerEvent) => void;
}

export const WireRenderer: React.FC<WireRendererProps> = ({
  wires,
  instances,
  catalog,
  activeWireStart,
  cursorWorldMM,
  snappedEndpoint,
  activeWireColor,
  selectedWireId,
  reconnectingWire,
  showDiagnostics,
  showVoltage,
  nodeVoltages,
  connectivityMap,
  onSelectWire,
  onStartReconnect,
}) => {
  const activeStartPos = activeWireStart
    ? resolveEndpointWorldPosition(activeWireStart, instances, catalog)
    : null;

  const isWiringOrReconnecting = Boolean(activeWireStart || reconnectingWire);

  return (
    <g id="wires-layer" className="select-none">
      {/* 1. COMMITTED WIRES */}
      {wires.map((wire) => {
        const isReconnectingThis = reconnectingWire?.wireId === wire.id;
        const fromPos = resolveEndpointWorldPosition(wire.from, instances, catalog);
        const toPos = resolveEndpointWorldPosition(wire.to, instances, catalog);
        if (!fromPos || !toPos) return null;

        const x1 = fromPos.xMM * PX_PER_MM;
        const y1 = fromPos.yMM * PX_PER_MM;
        const x2 = toPos.xMM * PX_PER_MM;
        const y2 = toPos.yMM * PX_PER_MM;

        const isSelected = selectedWireId === wire.id;

        // Gravitational curve calculation
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.hypot(dx, dy);
        const sag = Math.min(50, Math.max(12, dist * 0.2));

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2 + sag;
        const pathData = `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;

        // Contrast border for light colored wires (like White/Yellow)
        const isLightColor =
          wire.color === '#f8fafc' ||
          wire.color.toLowerCase() === '#ffffff' ||
          wire.color === '#eab308';

        return (
          <g
            key={wire.id}
            id={`wire-${wire.id}`}
            className="group/wire"
            style={{ opacity: isReconnectingThis ? 0.35 : 1 }}
          >
            {/* Wide transparent click target for effortless selection (disabled during wiring mode) */}
            <path
              d={pathData}
              fill="none"
              stroke="transparent"
              strokeWidth="16"
              pointerEvents={isWiringOrReconnecting ? 'none' : 'stroke'}
              className="cursor-pointer"
              onClick={(e) => {
                if (!isWiringOrReconnecting) {
                  e.stopPropagation();
                  onSelectWire?.(wire.id);
                }
              }}
            />

            {/* Selection highlight (clean outline without blinding glow) */}
            {isSelected && !isReconnectingThis && (
              <path
                d={pathData}
                fill="none"
                stroke="#4d8eff"
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.9"
                pointerEvents="none"
              />
            )}

            {/* Subtle shadow beneath wire */}
            <path
              d={pathData}
              fill="none"
              stroke="#0a0d14"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.4"
              transform="translate(1, 1.5)"
              pointerEvents="none"
            />

            {/* Contrast outline for white/light wires */}
            {isLightColor && (
              <path
                d={pathData}
                fill="none"
                stroke="#1e293b"
                strokeWidth="4"
                strokeLinecap="round"
                pointerEvents="none"
              />
            )}

            {/* Main insulated wire core */}
            {(() => {
              const fromKey = endpointKey(wire.from);
              const nodeId = connectivityMap?.get(fromKey);
              const wireVoltage = nodeId ? nodeVoltages?.[nodeId] : undefined;
              const effectiveColor = showVoltage && wireVoltage !== undefined
                ? getVoltageColor(wireVoltage)
                : wire.color;

              return (
                <path
                  d={pathData}
                  fill="none"
                  stroke={effectiveColor}
                  strokeWidth="3"
                  strokeLinecap="round"
                  pointerEvents={isWiringOrReconnecting ? 'none' : 'stroke'}
                  className="transition-colors group-hover/wire:brightness-125 cursor-pointer"
                  onClick={(e) => {
                    if (!isWiringOrReconnecting) {
                      e.stopPropagation();
                      onSelectWire?.(wire.id);
                    }
                  }}
                />
              );
            })()}

            {/* Metal crimp contacts at endpoints: STRICTLY pointerEvents="none" to prevent terminal hover flickering */}
            <circle cx={x1} cy={y1} r="3" fill="#cbd5e1" stroke="#334155" strokeWidth="0.8" pointerEvents="none" />
            <circle cx={x2} cy={y2} r="3" fill="#cbd5e1" stroke="#334155" strokeWidth="0.8" pointerEvents="none" />

            {/* DRAGGABLE RECONNECTION HANDLES (RENDERED ONLY WHEN WIRE IS SELECTED AND NOT WIRING) */}
            {isSelected && !isReconnectingThis && !isWiringOrReconnecting && (
              <g id={`wire-handles-${wire.id}`}>
                {/* Endpoint A Handle */}
                <g
                  transform={`translate(${x1}, ${y1})`}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onStartReconnect?.(wire.id, 'from', e);
                  }}
                  className="cursor-grab"
                >
                  <circle cx={0} cy={0} r={6} fill="#ffffff" stroke="#4d8eff" strokeWidth="2" />
                  <circle cx={0} cy={0} r={2.5} fill="#4d8eff" />
                  <title>Drag to reconnect Endpoint A</title>
                </g>

                {/* Endpoint B Handle */}
                <g
                  transform={`translate(${x2}, ${y2})`}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onStartReconnect?.(wire.id, 'to', e);
                  }}
                  className="cursor-grab"
                >
                  <circle cx={0} cy={0} r={6} fill="#ffffff" stroke="#4d8eff" strokeWidth="2" />
                  <circle cx={0} cy={0} r={2.5} fill="#4d8eff" />
                  <title>Drag to reconnect Endpoint B</title>
                </g>
              </g>
            )}
          </g>
        );
      })}

      {/* 2. LIVE WIRE DRAWING PREVIEW (CREATING NEW WIRE) */}
      {activeStartPos && cursorWorldMM && !reconnectingWire && (
        <g id="active-wire-preview" pointerEvents="none">
          {(() => {
            const x1 = activeStartPos.xMM * PX_PER_MM;
            const y1 = activeStartPos.yMM * PX_PER_MM;

            // Target endpoint: snapped if available, else raw cursor
            const targetPos = snappedEndpoint ? snappedEndpoint.worldPos : cursorWorldMM;
            const x2 = targetPos.xMM * PX_PER_MM;
            const y2 = targetPos.yMM * PX_PER_MM;

            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2 + 15;
            const pathData = `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;

            const rawX = cursorWorldMM.xMM * PX_PER_MM;
            const rawY = cursorWorldMM.yMM * PX_PER_MM;

            return (
              <>
                {/* Temporary preview wire path */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={activeWireColor}
                  strokeWidth="2.8"
                  strokeDasharray="4,3"
                  strokeLinecap="round"
                />
                {/* Start terminal marker */}
                <circle cx={x1} cy={y1} r="4" fill="#4edea3" stroke="#ffffff" strokeWidth="1.5" />

                {/* Snapped Target Indicator or Cursor Follower */}
                {snappedEndpoint ? (
                  <g transform={`translate(${x2}, ${y2})`}>
                    <circle cx={0} cy={0} r={9} fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="3,2" />
                    <circle cx={0} cy={0} r={5} fill="rgba(34, 197, 94, 0.3)" stroke="#22c55e" strokeWidth="1.5" />
                    <circle cx={0} cy={0} r={2} fill="#ffffff" />
                  </g>
                ) : (
                  <g transform={`translate(${x2}, ${y2})`}>
                    <circle cx={0} cy={0} r={5} fill="none" stroke="#4edea3" strokeWidth="1.5" strokeDasharray="2,2" />
                    <circle cx={0} cy={0} r={2} fill="#4edea3" />
                  </g>
                )}

                {/* Diagnostics overlay markers */}
                {showDiagnostics && (
                  <g id="wire-diagnostics-markers">
                    {/* Raw pointer marker in cyan */}
                    <circle cx={rawX} cy={rawY} r={3} fill="#06b6d4" stroke="#ffffff" strokeWidth="1" />
                    {snappedEndpoint && (
                      <line x1={rawX} y1={rawY} x2={x2} y2={y2} stroke="#06b6d4" strokeWidth="1" strokeDasharray="2,2" />
                    )}
                  </g>
                )}
              </>
            );
          })()}
        </g>
      )}

      {/* 3. RECONNECTING WIRE PREVIEW (DRAGGING AN ENDPOINT OF EXISTING WIRE) */}
      {reconnectingWire && cursorWorldMM && (
        <g id="reconnect-wire-preview" pointerEvents="none">
          {(() => {
            const wire = wires.find((w) => w.id === reconnectingWire.wireId);
            if (!wire) return null;

            const fixedEndpoint = reconnectingWire.which === 'from' ? wire.to : wire.from;
            const fixedPos = resolveEndpointWorldPosition(fixedEndpoint, instances, catalog);
            if (!fixedPos) return null;

            const x1 = fixedPos.xMM * PX_PER_MM;
            const y1 = fixedPos.yMM * PX_PER_MM;

            const targetPos = snappedEndpoint ? snappedEndpoint.worldPos : cursorWorldMM;
            const x2 = targetPos.xMM * PX_PER_MM;
            const y2 = targetPos.yMM * PX_PER_MM;

            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2 + 15;
            const pathData = `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;

            const rawX = cursorWorldMM.xMM * PX_PER_MM;
            const rawY = cursorWorldMM.yMM * PX_PER_MM;

            return (
              <>
                <path
                  d={pathData}
                  fill="none"
                  stroke={wire.color}
                  strokeWidth="2.8"
                  strokeDasharray="4,3"
                  strokeLinecap="round"
                />
                <circle cx={x1} cy={y1} r="4" fill="#4edea3" stroke="#ffffff" strokeWidth="1.5" />

                {snappedEndpoint ? (
                  <g transform={`translate(${x2}, ${y2})`}>
                    <circle cx={0} cy={0} r={9} fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="3,2" />
                    <circle cx={0} cy={0} r={5} fill="rgba(34, 197, 94, 0.3)" stroke="#22c55e" strokeWidth="1.5" />
                    <circle cx={0} cy={0} r={2} fill="#ffffff" />
                  </g>
                ) : (
                  <g transform={`translate(${x2}, ${y2})`}>
                    <circle cx={0} cy={0} r={7} fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="2,2" />
                    <circle cx={0} cy={0} r={2.5} fill="#38bdf8" />
                  </g>
                )}

                {showDiagnostics && (
                  <g id="reconnect-diagnostics-markers">
                    <circle cx={rawX} cy={rawY} r={3} fill="#06b6d4" stroke="#ffffff" strokeWidth="1" />
                    {snappedEndpoint && (
                      <line x1={rawX} y1={rawY} x2={x2} y2={y2} stroke="#06b6d4" strokeWidth="1" strokeDasharray="2,2" />
                    )}
                  </g>
                )}
              </>
            );
          })()}
        </g>
      )}
    </g>
  );
};
