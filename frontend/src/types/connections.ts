/**
 * Universal Connection & Connectivity Graph Types for LabVerse
 * Supports Breadboard holes, Component terminals, and Direct Wiring.
 */

export type BreadboardHoleRef = {
  kind: 'breadboard-hole';
  breadboardInstanceId: string;
  holeId: string;
};

export type ConnectionEndpoint =
  | {
      kind: 'component-terminal';
      instanceId: string;
      terminalId: string;
    }
  | BreadboardHoleRef
  | {
      kind: 'junction';
      junctionId: string;
    };

export interface JumperWire {
  id: string;
  color: string; // e.g. '#ef4444', '#1f2937', '#3b82f6', '#eab308', '#22c55e'
  from: ConnectionEndpoint;
  to: ConnectionEndpoint;
}

export interface TerminalAttachment {
  instanceId: string;
  terminalId: string;
  breadboardInstanceId: string;
  holeId: string;
}

export type BreadboardRow = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j';

export type BreadboardRailType = 'pos' | 'neg';
export type BreadboardRailLocation = 'top' | 'bottom';

export interface BreadboardHole {
  id: string; // e.g. "col_1_a", "rail_top_pos_1"
  type: 'terminal' | 'power_rail';
  column?: number; // 1 to 30 for terminal columns
  row?: BreadboardRow; // 'a'..'e' or 'f'..'j'
  railLocation?: BreadboardRailLocation;
  railType?: BreadboardRailType;
  railIndex?: number; // 1 to 25
  localXMM: number; // relative to breadboard top-left (0,0) in mm
  localYMM: number;
  internalStripId: string; // Internal conductor grouping ID
}

export interface ElectricalNode {
  id: string; // e.g. "node_1", "node_gnd"
  name: string;
  endpoints: ConnectionEndpoint[];
  color: string; // Visual debug color
  isGround?: boolean;
}

export interface ConnectivityGraphResult {
  nodes: ElectricalNode[];
  endpointToNodeMap: Map<string, string>; // endpointKey -> nodeId
}
