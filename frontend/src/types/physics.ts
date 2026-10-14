import type { GenericEquipmentDefinition, GenericTerminal } from './workbench';

/**
 * Electricity & DC Circuit specific types
 */

export interface ElectricalTerminal extends GenericTerminal {
  type: 'electrical_pin' | 'binding_post';
  polarity?: 'positive' | 'negative' | 'neutral';
  colorCode?: string;
}

export interface ElectricalEquipmentDefinition extends GenericEquipmentDefinition {
  subjectId: 'physics';
  terminals: ElectricalTerminal[];
  simulationModel: 'voltage_source' | 'resistor' | 'led' | 'breadboard' | 'jumper_wire';
}

export interface BreadboardHoleCoordinate {
  id: string; // e.g., "col_1_a", "rail_top_pos_1"
  column: number; // 1 to 30 for tie points, 1 to 25 for rails
  row: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'vcc' | 'gnd';
  region: 'terminal_top' | 'terminal_bottom' | 'power_rail_top' | 'power_rail_bottom';
  xMM: number;
  yMM: number;
  internalStripId: string; // Electrical node grouping
  occupiedBy?: string; // Component instanceId + terminalId
}

export interface TelemetryReading {
  timestamp: number;
  voltageV?: number;
  currentA?: number;
  resistanceOhms?: number;
  isConducting?: boolean;
  isOvercurrent?: boolean;
  isShortCircuit?: boolean;
  statusMessage: string;
}
