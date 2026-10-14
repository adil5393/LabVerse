/**
 * Connectivity Graph Engine using Disjoint-Set Union (DSU)
 *
 * Calculates electrical nodes from:
 * 1. Breadboard internal conductive strips
 * 2. Terminal-to-hole physical insertions
 * 3. Jumper wires (connecting terminal-to-terminal, terminal-to-hole, or hole-to-hole)
 *
 * CRITICAL RULE: Does NOT merge the two distinct terminals of a component
 * (e.g. resistor pin 1 & 2, LED anode & cathode) unless an external conductive path exists.
 */

import type {
  ConnectionEndpoint,
  JumperWire,
  TerminalAttachment,
  ElectricalNode,
  ConnectivityGraphResult,
} from '../../types/connections';
import type { GenericEquipmentDefinition, GenericEquipmentInstance } from '../../types/workbench';
import { BREADBOARD_400_HOLES } from './breadboardTopology';
import { getEndpointKey, parseEndpointKey } from './endpointGeometry';

class DSU {
  private parent = new Map<string, string>();
  private rank = new Map<string, number>();

  find(item: string): string {
    if (!this.parent.has(item)) {
      this.parent.set(item, item);
      this.rank.set(item, 0);
      return item;
    }
    const p = this.parent.get(item)!;
    if (p !== item) {
      const root = this.find(p);
      this.parent.set(item, root);
      return root;
    }
    return item;
  }

  union(a: string, b: string): void {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA === rootB) return;

    const rankA = this.rank.get(rootA) || 0;
    const rankB = this.rank.get(rootB) || 0;

    if (rankA < rankB) {
      this.parent.set(rootA, rootB);
    } else if (rankA > rankB) {
      this.parent.set(rootB, rootA);
    } else {
      this.parent.set(rootB, rootA);
      this.rank.set(rootA, rankA + 1);
    }
  }

  getAllElements(): string[] {
    return Array.from(this.parent.keys());
  }
}

const NODE_COLORS = [
  '#4d8eff', // Blue
  '#4edea3', // Green
  '#ffb95a', // Amber
  '#c084fc', // Purple
  '#f43f5e', // Rose
  '#38bdf8', // Light Blue
  '#a3e635', // Lime
  '#fb923c', // Orange
];

export function computeConnectivityGraph(
  instances: GenericEquipmentInstance[],
  catalog: GenericEquipmentDefinition[],
  attachments: TerminalAttachment[],
  wires: JumperWire[]
): ConnectivityGraphResult {
  const dsu = new DSU();

  // 1. Initialize all component terminals into DSU as independent sets
  instances.forEach((inst) => {
    const def = catalog.find((d) => d.id === inst.definitionId);
    if (!def) return;
    def.terminals.forEach((term) => {
      const termKey = getEndpointKey({
        kind: 'component-terminal',
        instanceId: inst.instanceId,
        terminalId: term.id,
      });
      dsu.find(termKey);
    });
  });

  // 2. Add Breadboard Internal Strips
  // For each breadboard, group its holes by internalStripId and union all holes in each strip
  const breadboards = instances.filter((i) => i.definitionId.includes('breadboard'));
  breadboards.forEach((bb) => {
    const stripToHoles = new Map<string, string[]>();

    BREADBOARD_400_HOLES.forEach((hole) => {
      const holeKey = getEndpointKey({
        kind: 'breadboard-hole',
        breadboardInstanceId: bb.instanceId,
        holeId: hole.id,
      });
      const list = stripToHoles.get(hole.internalStripId) || [];
      list.push(holeKey);
      stripToHoles.set(hole.internalStripId, list);
    });

    // Union all holes in each internal strip
    stripToHoles.forEach((holeKeys) => {
      for (let i = 1; i < holeKeys.length; i++) {
        dsu.union(holeKeys[0], holeKeys[i]);
      }
    });
  });

  // 3. Connect Component Terminals plugged into Breadboard Holes
  attachments.forEach((att) => {
    const termKey = getEndpointKey({
      kind: 'component-terminal',
      instanceId: att.instanceId,
      terminalId: att.terminalId,
    });
    const holeKey = getEndpointKey({
      kind: 'breadboard-hole',
      breadboardInstanceId: att.breadboardInstanceId,
      holeId: att.holeId,
    });
    dsu.union(termKey, holeKey);
  });

  // 4. Connect Jumper Wires
  wires.forEach((wire) => {
    const fromKey = getEndpointKey(wire.from);
    const toKey = getEndpointKey(wire.to);
    dsu.union(fromKey, toKey);
  });

  // 5. Aggregate Connected Components into Electrical Nodes
  const rootToEndpoints = new Map<string, ConnectionEndpoint[]>();
  const endpointToNodeMap = new Map<string, string>();

  // Only consider active elements (terminals, wires, and holes that are wired or attached)
  const activeKeys = new Set<string>();

  // All component terminals are active
  instances.forEach((inst) => {
    const def = catalog.find((d) => d.id === inst.definitionId);
    if (!def) return;
    def.terminals.forEach((term) => {
      activeKeys.add(
        getEndpointKey({
          kind: 'component-terminal',
          instanceId: inst.instanceId,
          terminalId: term.id,
        })
      );
    });
  });

  // Attached holes are active
  attachments.forEach((att) => {
    activeKeys.add(
      getEndpointKey({
        kind: 'breadboard-hole',
        breadboardInstanceId: att.breadboardInstanceId,
        holeId: att.holeId,
      })
    );
  });

  // Wire endpoints are active
  wires.forEach((w) => {
    activeKeys.add(getEndpointKey(w.from));
    activeKeys.add(getEndpointKey(w.to));
  });

  // Group active endpoints by their DSU root
  activeKeys.forEach((key) => {
    const root = dsu.find(key);
    const list = rootToEndpoints.get(root) || [];
    list.push(parseEndpointKey(key));
    rootToEndpoints.set(root, list);
  });

  // Build ElectricalNode array with meaningful names
  const nodes: ElectricalNode[] = [];
  let nodeCounter = 1;

  rootToEndpoints.forEach((endpoints, root) => {
    // Check if this node connects to power supply terminals
    let isVCC = false;
    let isGND = false;

    endpoints.forEach((ep) => {
      if (ep.kind === 'component-terminal') {
        const inst = instances.find((i) => i.instanceId === ep.instanceId);
        if (inst && inst.definitionId.includes('dc_source')) {
          if (ep.terminalId === 'pos') isVCC = true;
          if (ep.terminalId === 'neg') isGND = true;
        }
      }
    });

    let nodeName = `Node ${nodeCounter}`;
    let isGround = false;

    if (isVCC && isGND) {
      nodeName = 'DIRECT SUPPLY SHORT';
    } else if (isVCC) {
      nodeName = 'Supply VCC (+5V)';
    } else if (isGND) {
      nodeName = 'Ground GND (0V)';
      isGround = true;
    }

    const nodeId = `node_${root.replace(/[^a-zA-Z0-9_]/g, '_')}`;
    const color = isVCC
      ? '#ef4444'
      : isGND
      ? '#3b82f6'
      : NODE_COLORS[(nodeCounter - 1) % NODE_COLORS.length];

    nodes.push({
      id: nodeId,
      name: nodeName,
      endpoints,
      color,
      isGround,
    });

    endpoints.forEach((ep) => {
      endpointToNodeMap.set(getEndpointKey(ep), nodeId);
    });

    nodeCounter++;
  });

  return { nodes, endpointToNodeMap };
}
