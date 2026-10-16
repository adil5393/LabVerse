/**
 * Simulation Data Types for Milestone D
 * Authoritative types matching the Python DC solver and visual feedback layer.
 */

export interface ComponentSimulationState {
  instanceId: string;
  conducting: boolean;
  currentA: number;
  voltageDropV: number;
  brightness: number; // 0.0 to 1.0
  overcurrent: boolean;
  powerDissipationW: number;
}

export interface BranchCurrent {
  branchId: string;
  fromNode: string;
  toNode: string;
  currentA: number; // Signed conventional current from fromNode to toNode
  voltageDropV: number;
}

export interface SimulationFault {
  type: 'DIRECT_SUPPLY_SHORT' | 'REVERSED_LED' | 'OPEN_CIRCUIT' | 'OVERCURRENT' | 'CONTRADICTORY_SOURCES';
  severity: 'error' | 'warning';
  message: string;
  remedy: string;
  affectedComponentId?: string;
  affectedNodeId?: string;
}

export interface ConductorCurrentFlow {
  conductorId: string;
  type: 'wire' | 'breadboard-strip';
  fromKey: string;
  toKey: string;
  currentA: number;
  breadboardInstanceId?: string;
  fromHoleId?: string;
  toHoleId?: string;
}

export interface SubcircuitTelemetry {
  subcircuitId: string;
  sourceInstanceId?: string;
  sourceVoltageV: number;
  currentA: number; // Signed loop current in Amperes
  status: 'conducting' | 'open' | 'fault';
  componentInstanceIds: string[];
  ledStates: Array<{ instanceId: string; illuminated: boolean; currentA: number }>;
  totalPowerW?: number;
  sourceInstanceIds?: string[];
}

export interface CircuitSimulationResult {
  status: 'solved' | 'fault' | 'open';
  nodeVoltages: Record<string, number>; // nodeId -> voltage (V) relative to local subcircuit GND (0V)
  componentStates: Record<string, ComponentSimulationState>;
  branchCurrents: BranchCurrent[];
  conductorFlows?: ConductorCurrentFlow[];
  subcircuits?: SubcircuitTelemetry[];
  faults: SimulationFault[];
  hasCurrentFlow: boolean;
  timestamp: number;
}

export interface SimulationVisualSettings {
  isRunning: boolean;
  showCurrentFlow: boolean;
  showVoltage: boolean;
  animationSpeed: 0.5 | 1.0 | 2.0;
}
