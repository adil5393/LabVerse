import React from 'react';
import type { GenericEquipmentDefinition, GenericEquipmentInstance } from '../../types/workbench';
import type { CircuitSimulationResult, SimulationVisualSettings } from '../../types/simulation';
import { getVoltageColor } from '../../engine/simulation/voltageColor';
import { PX_PER_MM } from '../../engine/geometry/coordinates';

interface VoltageBadgeOverlayProps {
  instances: GenericEquipmentInstance[];
  catalog: GenericEquipmentDefinition[];
  simulationResult: CircuitSimulationResult | null;
  simulationSettings: SimulationVisualSettings;
  connectivityMap?: Map<string, string>; // endpointKey -> nodeId
}

export const VoltageBadgeOverlay: React.FC<VoltageBadgeOverlayProps> = ({
  instances,
  catalog,
  simulationResult,
  simulationSettings,
}) => {
  if (!simulationSettings.showVoltage || !simulationResult) return null;

  return (
    <g id="voltage-badge-overlay" pointerEvents="none" className="select-none">
      {instances.map((inst) => {
        const def = catalog.find((d) => d.id === inst.definitionId);
        if (!def || inst.definitionId.includes('breadboard')) return null;

        const posX = inst.positionMM.x * PX_PER_MM;
        const posY = inst.positionMM.y * PX_PER_MM;
        const widthPX = def.dimensionsMM.width * PX_PER_MM;

        const compState = simulationResult.componentStates[inst.instanceId];
        const isDcSource = inst.definitionId.includes('dc_source');
        const isResistor = inst.definitionId.includes('resistor');
        const isLed = inst.definitionId.includes('led');

        let badgeLabel = '';
        let badgeColor = '#64748b';

        if (isDcSource) {
          const v = inst.properties.voltageV || 5.0;
          badgeLabel = `V = ${Number(v).toFixed(2)} V`;
          badgeColor = getVoltageColor(Number(v));
        } else if (compState) {
          if (isResistor) {
            badgeLabel = compState.conducting
              ? `ΔV = ${compState.voltageDropV.toFixed(2)} V`
              : '0.00 V (Open)';
            badgeColor = getVoltageColor(compState.voltageDropV);
          } else if (isLed) {
            badgeLabel = compState.conducting
              ? `ΔV = ${compState.voltageDropV.toFixed(2)} V (fwd)`
              : '0.00 V (Off)';
            badgeColor = compState.conducting ? '#ef4444' : '#64748b';
          }
        }

        if (!badgeLabel) return null;

        const badgeX = posX + widthPX / 2;
        const badgeY = posY - 8;

        return (
          <g key={`volt-badge-${inst.instanceId}`} transform={`translate(${badgeX}, ${badgeY})`}>
            {/* Pill Background */}
            <rect
              x="-38"
              y="-12"
              width="76"
              height="16"
              rx="8"
              fill="#0f172a"
              stroke={badgeColor}
              strokeWidth="1.2"
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.6))"
            />
            {/* Indicator Dot */}
            <circle cx="-28" cy="-4" r="2.5" fill={badgeColor} />
            {/* Voltage Label */}
            <text
              x="-21"
              y="-1"
              fill="#f8fafc"
              fontSize="8.5"
              fontFamily="JetBrains Mono"
              fontWeight="bold"
            >
              {badgeLabel}
            </text>
          </g>
        );
      })}
    </g>
  );
};
