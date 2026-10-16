import React, { useEffect, useRef } from 'react';
import type { JumperWire } from '../../types/connections';
import type { GenericEquipmentDefinition, GenericEquipmentInstance } from '../../types/workbench';
import type { CircuitSimulationResult, SimulationVisualSettings, ConductorCurrentFlow } from '../../types/simulation';
import { resolveEndpointWorldPosition, endpointKey } from '../../engine/connectivity/endpointGeometry';
import { PX_PER_MM } from '../../engine/geometry/coordinates';

interface CurrentFlowOverlayProps {
  wires: JumperWire[];
  instances: GenericEquipmentInstance[];
  catalog: GenericEquipmentDefinition[];
  simulationResult: CircuitSimulationResult | null;
  simulationSettings: SimulationVisualSettings;
  connectivityMap?: Map<string, string>; // endpointKey -> nodeId
}

export const CurrentFlowOverlay: React.FC<CurrentFlowOverlayProps> = ({
  wires,
  instances,
  catalog,
  simulationResult,
  simulationSettings,
  connectivityMap,
}) => {
  const containerRef = useRef<SVGGElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const offsetRef = useRef<number>(0);

  const isEnabled =
    simulationSettings.showCurrentFlow &&
    simulationResult &&
    simulationResult.hasCurrentFlow;

  // Check reduced-motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!isEnabled || !simulationSettings.isRunning || prefersReducedMotion) {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      return;
    }

    const animate = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      // Base velocity ~ 35 px/sec scaled by animationSpeed
      const baseVelocity = 35 * simulationSettings.animationSpeed;
      offsetRef.current = (offsetRef.current - baseVelocity * dt) % 1000;

      if (containerRef.current) {
        const flowPaths = containerRef.current.querySelectorAll<SVGPathElement>('.current-particle-dash');
        flowPaths.forEach((path) => {
          const dir = Number(path.getAttribute('data-direction') || 1);
          const speedMul = Number(path.getAttribute('data-speed-multiplier') || 1);
          const currentOffset = offsetRef.current * dir * speedMul;
          path.style.strokeDashoffset = `${currentOffset}px`;
        });
      }

      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    animFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [isEnabled, simulationSettings.isRunning, simulationSettings.animationSpeed, prefersReducedMotion]);

  if (!isEnabled || !simulationResult) return null;

  const flows = simulationResult.conductorFlows || [];
  const wireFlowMap = new Map<string, ConductorCurrentFlow>();
  const stripFlows: ConductorCurrentFlow[] = [];

  flows.forEach((f) => {
    if (f.type === 'wire') {
      wireFlowMap.set(f.conductorId, f);
    } else if (f.type === 'breadboard-strip' && f.currentA > 0) {
      stripFlows.push(f);
    }
  });

  return (
    <g ref={containerRef} id="current-flow-overlay" pointerEvents="none" className="select-none">
      {/* 1. Breadboard Internal Strip Current Flow Visualization */}
      {stripFlows.map((stripFlow) => {
        if (!stripFlow.breadboardInstanceId || !stripFlow.fromHoleId || !stripFlow.toHoleId) return null;

        const fromPos = resolveEndpointWorldPosition(
          { kind: 'breadboard-hole', breadboardInstanceId: stripFlow.breadboardInstanceId, holeId: stripFlow.fromHoleId },
          instances,
          catalog
        );
        const toPos = resolveEndpointWorldPosition(
          { kind: 'breadboard-hole', breadboardInstanceId: stripFlow.breadboardInstanceId, holeId: stripFlow.toHoleId },
          instances,
          catalog
        );

        if (!fromPos || !toPos) return null;

        const x1 = fromPos.xMM * PX_PER_MM;
        const y1 = fromPos.yMM * PX_PER_MM;
        const x2 = toPos.xMM * PX_PER_MM;
        const y2 = toPos.yMM * PX_PER_MM;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const angleRad = Math.atan2(dy, dx);
        const angleDeg = (angleRad * 180) / Math.PI;

        const speedScale = Math.sqrt(Math.max(0.1, (stripFlow.currentA * 1000) / 10));
        const pathData = `M ${x1} ${y1} L ${x2} ${y2}`;

        return (
          <g key={`bb-strip-flow-${stripFlow.conductorId}`} className="breadboard-conduction-path">
            {/* Subtle conductive strip glow indicator */}
            <path
              d={pathData}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="4"
              strokeLinecap="round"
              style={{
                opacity: 0.35,
                filter: 'drop-shadow(0 0 4px rgba(56, 189, 248, 0.7))',
              }}
            />

            {/* Directional flowing particles */}
            <path
              d={pathData}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2.2"
              strokeDasharray="3 8"
              strokeLinecap="round"
              className="current-particle-dash"
              data-direction="1"
              data-speed-multiplier={speedScale}
              style={{
                filter: 'drop-shadow(0 0 2px rgba(251, 191, 36, 0.9))',
                opacity: 0.95,
              }}
            />

            {/* Subtle directional chevron */}
            <g transform={`translate(${midX}, ${midY}) rotate(${angleDeg})`}>
              <polygon
                points="-4,-3 3,0 -4,3 -1.5,0"
                fill="#fef08a"
                stroke="#d97706"
                strokeWidth="0.6"
                filter="drop-shadow(0 0 2px rgba(254, 240, 138, 0.8))"
              />
            </g>
          </g>
        );
      })}

      {/* 2. Jumper Wire Current Flow Visualization */}
      {wires.map((wire) => {
        const flow = wireFlowMap.get(wire.id);
        // Only render active wires with non-zero current
        if (!flow || flow.currentA <= 0) return null;

        const fromPos = resolveEndpointWorldPosition(wire.from, instances, catalog);
        const toPos = resolveEndpointWorldPosition(wire.to, instances, catalog);
        if (!fromPos || !toPos) return null;

        const x1 = fromPos.xMM * PX_PER_MM;
        const y1 = fromPos.yMM * PX_PER_MM;
        const x2 = toPos.xMM * PX_PER_MM;
        const y2 = toPos.yMM * PX_PER_MM;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.hypot(dx, dy);
        const sag = Math.min(50, Math.max(12, dist * 0.2));

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2 + sag;
        const pathData = `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;

        // Direction: flow.fromKey gives authoritative conventional current entry point
        const fromKey = endpointKey(wire.from);
        const toKey = endpointKey(wire.to);

        let direction = 1; // 1 = forward (from -> to), -1 = reverse (to -> from)
        if (flow.fromKey === toKey) {
          direction = -1;
        } else if (flow.fromKey === fromKey) {
          direction = 1;
        } else {
          // Fallback to node voltages if equipotential ambiguity
          const fromNodeId = connectivityMap?.get(fromKey);
          const toNodeId = connectivityMap?.get(toKey);
          const vFrom = fromNodeId ? simulationResult.nodeVoltages[fromNodeId] : undefined;
          const vTo = toNodeId ? simulationResult.nodeVoltages[toNodeId] : undefined;
          if (vFrom !== undefined && vTo !== undefined && vFrom < vTo) {
            direction = -1;
          }
        }

        const angleRad = Math.atan2(dy, dx);
        const angleDeg = (angleRad * 180) / Math.PI + (direction === -1 ? 180 : 0);
        const speedScale = Math.sqrt(Math.max(0.1, (flow.currentA * 1000) / 10));

        return (
          <g key={`flow-${wire.id}`}>
            {/* Animated particle stream dashes */}
            <path
              d={pathData}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2.8"
              strokeDasharray="4 14"
              strokeLinecap="round"
              className="current-particle-dash"
              data-direction={direction}
              data-speed-multiplier={speedScale}
              style={{
                filter: 'drop-shadow(0 0 3px rgba(251, 191, 36, 0.8))',
                opacity: 0.9,
              }}
            />

            {/* Directional Conventional Current Chevron Arrow */}
            <g transform={`translate(${midX}, ${midY}) rotate(${angleDeg})`}>
              <polygon
                points="-5,-4 4,0 -5,4 -2,0"
                fill="#fef08a"
                stroke="#d97706"
                strokeWidth="0.8"
                filter="drop-shadow(0 0 2px rgba(254, 240, 138, 0.9))"
              />
            </g>
          </g>
        );
      })}
    </g>
  );
};
