/**
 * Client-Side Authoritative Isomorphic DC Circuit Solver — Milestone D.2
 * Strictly mirrors backend/solver/dc_solver.py.
 * Provides generalized Modified Nodal Analysis (MNA), active-set piecewise-linear LED model,
 * and KCL-based physical conductor flow solving for interactive STEM laboratories.
 *
 * Implements:
 * 1. Multi-circuit / subcircuit decomposition: identifies independent connected subcircuits and solves each separately.
 * 2. Direct supply short detection per subcircuit (isolated from other subcircuits).
 * 3. Open circuit loop detection per subcircuit.
 * 4. Generalized Modified Nodal Analysis (MNA):
 *    - Arbitrary series, parallel, and series-parallel resistor networks.
 *    - Multiple independent DC voltage sources within a network.
 *    - Contradictory ideal voltage sources diagnostic.
 * 5. Active-set piecewise-linear LED device model:
 *    - Multiple LEDs in series, parallel branches, and mixed resistor-LED networks.
 *    - Fixed 2.0V forward drop per conducting LED.
 *    - Stevens power-law brightness curve B(I) = min(1.0, (I/I_ref)^0.6).
 *    - Overcurrent warning (>30mA).
 *    - Reversed LED fault detection.
 *    - Insufficient supply voltage handling (non-conducting, zero false current).
 * 6. Generalized physical conductor graph mapping:
 *    - Solves physical current distribution on all jumper wires and breadboard internal strips using KCL.
 *    - Preserves conventional current direction (from higher potential to lower potential).
 *    - Series branches show uniform current; parallel branches show respective branch currents.
 *    - Unused breadboard strips carry zero current and do not animate.
 */

import type { GenericEquipmentInstance, GenericEquipmentDefinition } from '../../types/workbench';
import type { JumperWire, TerminalAttachment } from '../../types/connections';
import type {
  CircuitSimulationResult,
  ComponentSimulationState,
  BranchCurrent,
  ConductorCurrentFlow,
  SimulationFault,
  SubcircuitTelemetry,
} from '../../types/simulation';
import { calculateLEDBrightness } from './brightnessCurve';
import { endpointKey } from '../connectivity/endpointGeometry';

class DSU {
  private parent = new Map<string, string>();

  find(item: string): string {
    if (!this.parent.has(item)) {
      this.parent.set(item, item);
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
    if (rootA !== rootB) {
      this.parent.set(rootB, rootA);
    }
  }
}

function termKey(instanceId: string, terminalId: string): string {
  return JSON.stringify(['terminal', instanceId, terminalId]);
}

function holeKey(breadboardInstanceId: string, holeId: string): string {
  return JSON.stringify(['hole', breadboardInstanceId, holeId]);
}

export function getBreadboardStripId(holeId: string): string {
  if (holeId.startsWith('col_')) {
    const parts = holeId.split('_');
    const col = parts[1];
    const row = parts[2];
    if (['a', 'b', 'c', 'd', 'e'].includes(row)) {
      return `strip_top_col_${col}`;
    } else {
      return `strip_bottom_col_${col}`;
    }
  } else if (holeId.startsWith('rail_top_pos')) {
    return 'strip_rail_top_pos';
  } else if (holeId.startsWith('rail_top_neg')) {
    return 'strip_rail_top_neg';
  } else if (holeId.startsWith('rail_bottom_pos')) {
    return 'strip_rail_bottom_pos';
  } else if (holeId.startsWith('rail_bottom_neg')) {
    return 'strip_rail_bottom_neg';
  }
  return 'strip_unknown';
}

/**
 * Robust linear system solver using Gaussian elimination with partial pivoting.
 */
function gaussianSolve(A_mat: number[][], b_vec: number[]): number[] | null {
  const n = b_vec.length;
  const A = A_mat.map((row) => [...row]);
  const b = [...b_vec];

  for (let i = 0; i < n; i++) {
    // Pivot selection
    let maxRow = i;
    let maxVal = Math.abs(A[i][i]);
    for (let r = i + 1; r < n; r++) {
      const val = Math.abs(A[r][i]);
      if (val > maxVal) {
        maxVal = val;
        maxRow = r;
      }
    }

    if (maxVal < 1e-12) return null; // Singular

    if (maxRow !== i) {
      const tempA = A[i];
      A[i] = A[maxRow];
      A[maxRow] = tempA;
      const tempB = b[i];
      b[i] = b[maxRow];
      b[maxRow] = tempB;
    }

    // Eliminate below
    for (let r = i + 1; r < n; r++) {
      const factor = A[r][i] / A[i][i];
      for (let c = i; c < n; c++) {
        A[r][c] -= factor * A[i][c];
      }
      b[r] -= factor * b[i];
    }
  }

  // Back-substitution
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = b[i];
    for (let c = i + 1; c < n; c++) {
      sum -= A[i][c] * x[c];
    }
    x[i] = sum / A[i][i];
  }

  return x;
}

/**
 * Solves physical current distribution on all wires and breadboard strips using KCL.
 */
function solveConductorFlows(
  dsu: DSU,
  terminalInjections: Map<string, number>,
  wires: JumperWire[],
  attachments: TerminalAttachment[],
  _breadboards: GenericEquipmentInstance[]
): ConductorCurrentFlow[] {
  // Group active physical conductors and terminals by electrical node root
  const nodeTerminals = new Map<string, Map<string, number>>();
  terminalInjections.forEach((inj, tK) => {
    if (Math.abs(inj) > 1e-8) {
      const root = dsu.find(tK);
      const map = nodeTerminals.get(root) || new Map<string, number>();
      map.set(tK, inj);
      nodeTerminals.set(root, map);
    }
  });

  const nodeWires = new Map<string, JumperWire[]>();
  wires.forEach((w) => {
    const u = endpointKey(w.from);
    const root = dsu.find(u);
    const list = nodeWires.get(root) || [];
    list.push(w);
    nodeWires.set(root, list);
  });

  const nodeAttachments = new Map<string, TerminalAttachment[]>();
  attachments.forEach((att) => {
    const u = termKey(att.instanceId, att.terminalId);
    const root = dsu.find(u);
    const list = nodeAttachments.get(root) || [];
    list.push(att);
    nodeAttachments.set(root, list);
  });

  // Collect plugged holes per breadboard strip
  const pluggedByStrip = new Map<string, Set<string>>(); // `${root}:${bbId}:${stripId}` -> Set<holeId>
  attachments.forEach((att) => {
    const u = termKey(att.instanceId, att.terminalId);
    const root = dsu.find(u);
    const sId = getBreadboardStripId(att.holeId);
    const key = `${root}:${att.breadboardInstanceId}:${sId}`;
    const set = pluggedByStrip.get(key) || new Set<string>();
    set.add(att.holeId);
    pluggedByStrip.set(key, set);
  });

  wires.forEach((w) => {
    [w.from, w.to].forEach((ep) => {
      if (ep.kind === 'breadboard-hole' && ep.breadboardInstanceId && ep.holeId) {
        const u = endpointKey(ep);
        const root = dsu.find(u);
        const sId = getBreadboardStripId(ep.holeId);
        const key = `${root}:${ep.breadboardInstanceId}:${sId}`;
        const set = pluggedByStrip.get(key) || new Set<string>();
        set.add(ep.holeId);
        pluggedByStrip.set(key, set);
      }
    });
  });

  const flows: ConductorCurrentFlow[] = [];

  // Solve flow on each electrical node independently
  nodeTerminals.forEach((termMap, root) => {
    let sumInj = 0;
    termMap.forEach((inj) => {
      sumInj += Math.abs(inj);
    });
    if (sumInj < 1e-7) return;

    const cWires = nodeWires.get(root) || [];
    const cAtts = nodeAttachments.get(root) || [];

    // Build list of vertices in this conductor network
    const vertices = new Set<string>();
    termMap.forEach((_, tK) => vertices.add(tK));
    cWires.forEach((w) => {
      vertices.add(endpointKey(w.from));
      vertices.add(endpointKey(w.to));
    });
    cAtts.forEach((att) => {
      vertices.add(termKey(att.instanceId, att.terminalId));
      vertices.add(holeKey(att.breadboardInstanceId, att.holeId));
    });

    // Build breadboard strip segments
    const stripSegments: Array<{ bbId: string; h1: string; h2: string }> = [];
    pluggedByStrip.forEach((holes, key) => {
      const parts = key.split(':');
      const nRoot = parts[0];
      const bbId = parts[1];
      if (nRoot !== root || holes.size < 2) return;
      const hList = Array.from(holes).sort();
      for (let i = 0; i < hList.length - 1; i++) {
        stripSegments.push({ bbId, h1: hList[i], h2: hList[i + 1] });
        vertices.add(holeKey(bbId, hList[i]));
        vertices.add(holeKey(bbId, hList[i + 1]));
      }
    });

    const vertexList = Array.from(vertices);
    if (vertexList.length < 2) return;
    const vIdx = new Map<string, number>();
    vertexList.forEach((v, i) => vIdx.set(v, i));
    const numV = vertexList.length;

    // Conductance matrix for this conductor network
    // Normalized resistances: wire: 1.0, attachment: 0.001, strip segment: 0.01
    const G_cond: number[][] = Array.from({ length: numV }, () => new Array(numV).fill(0));
    const b_cond: number[] = new Array(numV).fill(0);

    termMap.forEach((inj, tK) => {
      const idx = vIdx.get(tK);
      if (idx !== undefined) {
        b_cond[idx] += inj;
      }
    });

    const addCondEdge = (uKey: string, vKey: string, resVal: number) => {
      const i1 = vIdx.get(uKey);
      const i2 = vIdx.get(vKey);
      if (i1 === undefined || i2 === undefined) return;
      const g = 1.0 / resVal;
      G_cond[i1][i1] += g;
      G_cond[i2][i2] += g;
      G_cond[i1][i2] -= g;
      G_cond[i2][i1] -= g;
    };

    cWires.forEach((w) => addCondEdge(endpointKey(w.from), endpointKey(w.to), 1.0));
    cAtts.forEach((att) =>
      addCondEdge(termKey(att.instanceId, att.terminalId), holeKey(att.breadboardInstanceId, att.holeId), 0.001)
    );
    stripSegments.forEach(({ bbId, h1, h2 }) =>
      addCondEdge(holeKey(bbId, h1), holeKey(bbId, h2), 0.01)
    );

    // Set reference vertex 0: u[0] = 0
    const G_reduced: number[][] = Array.from({ length: numV - 1 }, (_, r) =>
      Array.from({ length: numV - 1 }, (_, c) => G_cond[r + 1][c + 1] + (r === c ? 1e-9 : 0))
    );
    const b_reduced = b_cond.slice(1);

    const uSol = new Array(numV).fill(0);
    const solReduced = gaussianSolve(G_reduced, b_reduced);
    if (solReduced) {
      for (let i = 0; i < solReduced.length; i++) {
        uSol[i + 1] = solReduced[i];
      }
    }

    // Extract wire flows
    cWires.forEach((w) => {
      const uK = endpointKey(w.from);
      const vK = endpointKey(w.to);
      const valU = uSol[vIdx.get(uK)!];
      const valV = uSol[vIdx.get(vK)!];
      const iVal = (valU - valV) / 1.0;
      if (Math.abs(iVal) > 1e-6) {
        const [fFrom, fTo] = iVal > 0 ? [uK, vK] : [vK, uK];
        flows.push({
          conductorId: w.id,
          type: 'wire',
          fromKey: fFrom,
          toKey: fTo,
          currentA: Number(Math.abs(iVal).toFixed(6)),
        });
      }
    });

    // Extract breadboard strip flows
    stripSegments.forEach(({ bbId, h1, h2 }) => {
      const uK = holeKey(bbId, h1);
      const vK = holeKey(bbId, h2);
      const valU = uSol[vIdx.get(uK)!];
      const valV = uSol[vIdx.get(vK)!];
      const iVal = (valU - valV) / 0.01;
      if (Math.abs(iVal) > 1e-6) {
        const [fFrom, fTo, hFrom, hTo] = iVal > 0 ? [uK, vK, h1, h2] : [vK, uK, h2, h1];
        flows.push({
          conductorId: `strip:${bbId}:${hFrom}:${hTo}`,
          type: 'breadboard-strip',
          fromKey: fFrom,
          toKey: fTo,
          currentA: Number(Math.abs(iVal).toFixed(6)),
          breadboardInstanceId: bbId,
          fromHoleId: hFrom,
          toHoleId: hTo,
        });
      }
    });
  });

  return flows;
}

function getComponentTerminals(
  inst: GenericEquipmentInstance,
  catalog: GenericEquipmentDefinition[]
): string[] {
  const def = catalog.find((d) => d.id === inst.definitionId);
  if (def && def.terminals.length > 0) {
    return def.terminals.map((t) => t.id);
  }
  if (inst.definitionId.includes('dc_source')) {
    return ['pos', 'neg'];
  }
  if (inst.definitionId.includes('resistor')) {
    return ['pin_1', 'pin_2'];
  }
  if (inst.definitionId.includes('led')) {
    return ['anode', 'cathode'];
  }
  return [];
}

export function solveCircuitLocal(
  instances: GenericEquipmentInstance[],
  catalog: GenericEquipmentDefinition[],
  attachments: TerminalAttachment[],
  wires: JumperWire[]
): CircuitSimulationResult {
  const dsu = new DSU();

  // 1. Register component terminals
  instances.forEach((inst) => {
    if (inst.definitionId.includes('breadboard')) return;
    const terminalIds = getComponentTerminals(inst, catalog);
    terminalIds.forEach((termId) => {
      dsu.find(termKey(inst.instanceId, termId));
    });
  });

  // 2. Register breadboard internal strips
  const breadboards = instances.filter((i) => i.definitionId.includes('breadboard'));
  breadboards.forEach((bb) => {
    // Columns 1..30 top (a..e) and bottom (f..j)
    for (let col = 1; col <= 30; col++) {
      const topHoles = ['a', 'b', 'c', 'd', 'e'].map((r) => holeKey(bb.instanceId, `col_${col}_${r}`));
      for (let i = 1; i < topHoles.length; i++) {
        dsu.union(topHoles[0], topHoles[i]);
      }

      const bottomHoles = ['f', 'g', 'h', 'i', 'j'].map((r) => holeKey(bb.instanceId, `col_${col}_${r}`));
      for (let i = 1; i < bottomHoles.length; i++) {
        dsu.union(bottomHoles[0], bottomHoles[i]);
      }
    }

    // Power rails (25 holes each)
    ['pos', 'neg'].forEach((railType) => {
      ['top', 'bottom'].forEach((loc) => {
        const railHoles = Array.from({ length: 25 }, (_, idx) =>
          holeKey(bb.instanceId, `rail_${loc}_${railType}_${idx + 1}`)
        );
        for (let i = 1; i < railHoles.length; i++) {
          dsu.union(railHoles[0], railHoles[i]);
        }
      });
    });
  });

  // 3. Attachments
  attachments.forEach((att) => {
    const tK = termKey(att.instanceId, att.terminalId);
    const hK = holeKey(att.breadboardInstanceId, att.holeId);
    dsu.union(tK, hK);
  });

  // 4. Wires
  wires.forEach((w) => {
    dsu.union(endpointKey(w.from), endpointKey(w.to));
  });

  // 5. Subcircuit Decomposition
  const subcircuitDsu = new DSU();
  const activeComponents = instances.filter((i) => !i.definitionId.includes('breadboard'));

  activeComponents.forEach((comp) => {
    const terminalIds = getComponentTerminals(comp, catalog);
    if (terminalIds.length < 2) return;
    const node0 = dsu.find(termKey(comp.instanceId, terminalIds[0]));
    for (let i = 1; i < terminalIds.length; i++) {
      const nodeI = dsu.find(termKey(comp.instanceId, terminalIds[i]));
      subcircuitDsu.union(node0, nodeI);
    }
  });

  // Group components by subcircuit root
  const subcircuits = new Map<string, GenericEquipmentInstance[]>();
  activeComponents.forEach((comp) => {
    const terminalIds = getComponentTerminals(comp, catalog);
    if (terminalIds.length === 0) return;
    const node0 = dsu.find(termKey(comp.instanceId, terminalIds[0]));
    const subId = subcircuitDsu.find(node0);
    const list = subcircuits.get(subId) || [];
    list.push(comp);
    subcircuits.set(subId, list);
  });

  const allNodeVoltages: Record<string, number> = {};
  const allCompStates: Record<string, ComponentSimulationState> = {};
  const allBranchCurrents: BranchCurrent[] = [];
  const allSubcircuits: SubcircuitTelemetry[] = [];
  const allFaults: SimulationFault[] = [];
  const terminalInjections = new Map<string, number>();
  let anyCurrentFlow = false;
  let hasFault = false;

  // 6. Solve Each Independent Subcircuit via Generalized MNA
  subcircuits.forEach((comps) => {
    const sources = comps.filter((c) => c.definitionId.includes('dc_source'));
    const resistors = comps.filter((c) => c.definitionId.includes('resistor'));
    const leds = comps.filter((c) => c.definitionId.includes('led'));

    if (sources.length === 0) {
      // Unpowered subcircuit: mark all components non-conducting
      comps.forEach((comp) => {
        allCompStates[comp.instanceId] = {
          instanceId: comp.instanceId,
          conducting: false,
          currentA: 0.0,
          voltageDropV: 0.0,
          brightness: 0.0,
          overcurrent: false,
          powerDissipationW: 0.0,
        };
      });
      return;
    }

    // Check for direct supply shorts upfront
    let directShortFound = false;
    sources.forEach((src) => {
      const posTerm = termKey(src.instanceId, 'pos');
      const negTerm = termKey(src.instanceId, 'neg');
      if (dsu.find(posTerm) === dsu.find(negTerm)) {
        directShortFound = true;
        hasFault = true;
        allFaults.push({
          type: 'DIRECT_SUPPLY_SHORT',
          severity: 'error',
          message: `Direct short circuit detected on power supply ${src.instanceId}!`,
          remedy: 'Remove the direct conductor between positive and negative terminals. Add a current-limiting resistor.',
          affectedComponentId: src.instanceId,
          affectedNodeId: dsu.find(posTerm),
        });
        allNodeVoltages[dsu.find(posTerm)] = 0.0;
        allCompStates[src.instanceId] = {
          instanceId: src.instanceId,
          conducting: false,
          voltageDropV: 0.0,
          currentA: 0.0,
          brightness: 0.0,
          overcurrent: false,
          powerDissipationW: 0.0,
        };
      }
    });

    if (directShortFound) {
      comps.forEach((c) => {
        if (!allCompStates[c.instanceId]) {
          allCompStates[c.instanceId] = {
            instanceId: c.instanceId,
            conducting: false,
            voltageDropV: 0.0,
            currentA: 0.0,
            brightness: 0.0,
            overcurrent: false,
            powerDissipationW: 0.0,
          };
        }
      });
      allSubcircuits.push({
        subcircuitId: `sub_${sources[0].instanceId}`,
        sourceInstanceId: sources[0].instanceId,
        sourceVoltageV: Number(sources[0].properties?.voltageV ?? 5.0),
        currentA: 0.0,
        status: 'fault',
        componentInstanceIds: comps.map((c) => c.instanceId),
        ledStates: [],
        totalPowerW: 0.0,
        sourceInstanceIds: sources.map((s) => s.instanceId),
      });
      return;
    }

    // Check for contradictory ideal voltage sources in parallel
    let contradictorySources = false;
    for (let i = 0; i < sources.length; i++) {
      for (let j = i + 1; j < sources.length; j++) {
        const s1 = sources[i];
        const s2 = sources[j];
        const s1Pos = dsu.find(termKey(s1.instanceId, 'pos'));
        const s1Neg = dsu.find(termKey(s1.instanceId, 'neg'));
        const s2Pos = dsu.find(termKey(s2.instanceId, 'pos'));
        const s2Neg = dsu.find(termKey(s2.instanceId, 'neg'));
        const v1 = Number(s1.properties?.voltageV ?? 5.0);
        const v2 = Number(s2.properties?.voltageV ?? 5.0);

        if (
          (s1Pos === s2Pos && s1Neg === s2Neg && Math.abs(v1 - v2) > 0.01) ||
          (s1Pos === s2Neg && s1Neg === s2Pos && Math.abs(v1 + v2) > 0.01)
        ) {
          contradictorySources = true;
          hasFault = true;
          allFaults.push({
            type: 'CONTRADICTORY_SOURCES',
            severity: 'error',
            message: `Contradictory ideal voltage sources in parallel: ${s1.instanceId} (${v1}V) and ${s2.instanceId} (${v2}V)!`,
            remedy: 'Avoid connecting ideal voltage sources with different voltages directly in parallel.',
            affectedComponentId: s1.instanceId,
          });
          break;
        }
      }
      if (contradictorySources) break;
    }

    if (contradictorySources) {
      comps.forEach((c) => {
        allCompStates[c.instanceId] = {
          instanceId: c.instanceId,
          conducting: false,
          voltageDropV: 0.0,
          currentA: 0.0,
          brightness: 0.0,
          overcurrent: false,
          powerDissipationW: 0.0,
        };
      });
      allSubcircuits.push({
        subcircuitId: `sub_${sources[0].instanceId}`,
        sourceInstanceId: sources[0].instanceId,
        sourceVoltageV: Number(sources[0].properties?.voltageV ?? 5.0),
        currentA: 0.0,
        status: 'fault',
        componentInstanceIds: comps.map((c) => c.instanceId),
        ledStates: [],
        totalPowerW: 0.0,
        sourceInstanceIds: sources.map((s) => s.instanceId),
      });
      return;
    }

    // Collect distinct electrical nodes for this subcircuit
    const nodeSet = new Set<string>();
    comps.forEach((comp) => {
      const terminalIds = getComponentTerminals(comp, catalog);
      terminalIds.forEach((termId) => {
        nodeSet.add(dsu.find(termKey(comp.instanceId, termId)));
      });
    });

    // Choose ground reference node: negative terminal of primary source
    const primarySource = sources[0];
    const groundNode = dsu.find(termKey(primarySource.instanceId, 'neg'));
    const nonGroundNodes = Array.from(nodeSet).filter((n) => n !== groundNode).sort();
    const nodeIndex = new Map<string, number>();
    nodeIndex.set(groundNode, 0);
    nonGroundNodes.forEach((n, idx) => {
      nodeIndex.set(n, idx + 1); // 1-based index for non-ground nodes
    });

    const numNodes = nonGroundNodes.length;
    const numSources = sources.length;
    const numLeds = leds.length;

    // Active-Set Piecewise-Linear Search for LED Conduction States
    let bestSol: { vNodes: number[]; iSources: number[]; iLeds: number[] } | null = null;
    let bestOnMask = 0;

    const candidateStates: Array<{ count: number; mask: number }> = [];
    const totalStates = 1 << numLeds;
    for (let mask = 0; mask < totalStates; mask++) {
      let count = 0;
      for (let j = 0; j < numLeds; j++) {
        if ((mask >> j) & 1) count++;
      }
      candidateStates.push({ count, mask });
    }
    candidateStates.sort((a, b) => b.count - a.count);

    for (const { mask } of candidateStates) {
      const onLedIndices: number[] = [];
      for (let j = 0; j < numLeds; j++) {
        if ((mask >> j) & 1) onLedIndices.push(j);
      }

      const sysSize = numNodes + numSources + onLedIndices.length;
      const A_sys: number[][] = Array.from({ length: sysSize }, () => new Array(sysSize).fill(0));
      const b_sys: number[] = new Array(sysSize).fill(0);

      // Tiny shunt conductance to ground to avoid floating singularity
      for (let i = 0; i < numNodes; i++) {
        A_sys[i][i] += 1e-10;
      }

      // Resistors
      resistors.forEach((res) => {
        const rVal = Math.max(0.01, Number(res.properties?.resistanceOhms ?? 330.0));
        const g = 1.0 / rVal;
        const u = nodeIndex.get(dsu.find(termKey(res.instanceId, 'pin_1')))!;
        const v = nodeIndex.get(dsu.find(termKey(res.instanceId, 'pin_2')))!;
        if (u > 0) A_sys[u - 1][u - 1] += g;
        if (v > 0) A_sys[v - 1][v - 1] += g;
        if (u > 0 && v > 0) {
          A_sys[u - 1][v - 1] -= g;
          A_sys[v - 1][u - 1] -= g;
        }
      });

      // Voltage Sources
      sources.forEach((src, sIdx) => {
        const auxIdx = numNodes + sIdx;
        const u = nodeIndex.get(dsu.find(termKey(src.instanceId, 'pos')))!;
        const v = nodeIndex.get(dsu.find(termKey(src.instanceId, 'neg')))!;
        const vSet = Number(src.properties?.voltageV ?? 5.0);
        if (u > 0) {
          A_sys[u - 1][auxIdx] += 1.0;
          A_sys[auxIdx][u - 1] += 1.0;
        }
        if (v > 0) {
          A_sys[v - 1][auxIdx] -= 1.0;
          A_sys[auxIdx][v - 1] -= 1.0;
        }
        A_sys[auxIdx][auxIdx] = -1e-5; // small internal source resistance
        b_sys[auxIdx] = vSet;
      });

      // Conducting LEDs
      onLedIndices.forEach((lIdx, lSubIdx) => {
        const ledComp = leds[lIdx];
        const auxIdx = numNodes + numSources + lSubIdx;
        const u = nodeIndex.get(dsu.find(termKey(ledComp.instanceId, 'anode')))!;
        const v = nodeIndex.get(dsu.find(termKey(ledComp.instanceId, 'cathode')))!;
        if (u > 0) {
          A_sys[u - 1][auxIdx] += 1.0;
          A_sys[auxIdx][u - 1] += 1.0;
        }
        if (v > 0) {
          A_sys[v - 1][auxIdx] -= 1.0;
          A_sys[auxIdx][v - 1] -= 1.0;
        }
        A_sys[auxIdx][auxIdx] = -1e-5; // small internal LED resistance
        b_sys[auxIdx] = 2.0; // Nominal forward drop
      });

      // Off LEDs (small off-conductance to avoid artificial floating nodes and reflect reverse voltage)
      for (let lIdx = 0; lIdx < numLeds; lIdx++) {
        if (((mask >> lIdx) & 1) === 0) {
          const gOff = 1e-7;
          const u = nodeIndex.get(dsu.find(termKey(leds[lIdx].instanceId, 'anode')))!;
          const v = nodeIndex.get(dsu.find(termKey(leds[lIdx].instanceId, 'cathode')))!;
          if (u > 0) A_sys[u - 1][u - 1] += gOff;
          if (v > 0) A_sys[v - 1][v - 1] += gOff;
          if (u > 0 && v > 0) {
            A_sys[u - 1][v - 1] -= gOff;
            A_sys[v - 1][u - 1] -= gOff;
          }
        }
      }

      const xSol = gaussianSolve(A_sys, b_sys);
      if (!xSol) continue;

      const vCand = new Array(nodeSet.size).fill(0);
      nonGroundNodes.forEach((_, idx) => {
        vCand[idx + 1] = xSol[idx];
      });

      const iSrcCand = new Array(numSources).fill(0);
      for (let sIdx = 0; sIdx < numSources; sIdx++) {
        iSrcCand[sIdx] = xSol[numNodes + sIdx];
      }

      const iLedCand = new Array(numLeds).fill(0);
      onLedIndices.forEach((lIdx, lSubIdx) => {
        iLedCand[lIdx] = xSol[numNodes + numSources + lSubIdx];
      });

      // Verify Active-Set Consistency:
      // 1. Every ON LED must carry positive forward current (> 1e-5 A)
      let isConsistent = true;
      for (const lIdx of onLedIndices) {
        if (iLedCand[lIdx] <= 1e-5) {
          isConsistent = false;
          break;
        }
      }

      // 2. Every OFF LED must have forward voltage <= 2.0V + 1e-4
      if (isConsistent) {
        for (let lIdx = 0; lIdx < numLeds; lIdx++) {
          if (((mask >> lIdx) & 1) === 0) {
            const u = nodeIndex.get(dsu.find(termKey(leds[lIdx].instanceId, 'anode')))!;
            const v = nodeIndex.get(dsu.find(termKey(leds[lIdx].instanceId, 'cathode')))!;
            const vFwd = vCand[u] - vCand[v];
            if (vFwd > 2.0001) {
              isConsistent = false;
              break;
            }
          }
        }
      }

      if (isConsistent) {
        bestSol = { vNodes: vCand, iSources: iSrcCand, iLeds: iLedCand };
        bestOnMask = mask;
        break;
      }
    }

    // Fallback to all-OFF if no conducting state was consistent
    if (!bestSol) {
      bestOnMask = 0;
      const sysSize = numNodes + numSources;
      const A_sys: number[][] = Array.from({ length: sysSize }, () => new Array(sysSize).fill(0));
      const b_sys: number[] = new Array(sysSize).fill(0);

      for (let i = 0; i < numNodes; i++) {
        A_sys[i][i] += 1e-10;
      }

      resistors.forEach((res) => {
        const rVal = Math.max(0.01, Number(res.properties?.resistanceOhms ?? 330.0));
        const g = 1.0 / rVal;
        const u = nodeIndex.get(dsu.find(termKey(res.instanceId, 'pin_1')))!;
        const v = nodeIndex.get(dsu.find(termKey(res.instanceId, 'pin_2')))!;
        if (u > 0) A_sys[u - 1][u - 1] += g;
        if (v > 0) A_sys[v - 1][v - 1] += g;
        if (u > 0 && v > 0) {
          A_sys[u - 1][v - 1] -= g;
          A_sys[v - 1][u - 1] -= g;
        }
      });

      leds.forEach((ledComp) => {
        const gOff = 1e-7;
        const u = nodeIndex.get(dsu.find(termKey(ledComp.instanceId, 'anode')))!;
        const v = nodeIndex.get(dsu.find(termKey(ledComp.instanceId, 'cathode')))!;
        if (u > 0) A_sys[u - 1][u - 1] += gOff;
        if (v > 0) A_sys[v - 1][v - 1] += gOff;
        if (u > 0 && v > 0) {
          A_sys[u - 1][v - 1] -= gOff;
          A_sys[v - 1][u - 1] -= gOff;
        }
      });

      sources.forEach((src, sIdx) => {
        const auxIdx = numNodes + sIdx;
        const u = nodeIndex.get(dsu.find(termKey(src.instanceId, 'pos')))!;
        const v = nodeIndex.get(dsu.find(termKey(src.instanceId, 'neg')))!;
        const vSet = Number(src.properties?.voltageV ?? 5.0);
        if (u > 0) {
          A_sys[u - 1][auxIdx] += 1.0;
          A_sys[auxIdx][u - 1] += 1.0;
        }
        if (v > 0) {
          A_sys[v - 1][auxIdx] -= 1.0;
          A_sys[auxIdx][v - 1] -= 1.0;
        }
        A_sys[auxIdx][auxIdx] = -1e-5;
        b_sys[auxIdx] = vSet;
      });

      const xSol = gaussianSolve(A_sys, b_sys);
      const vCand = new Array(nodeSet.size).fill(0);
      const iSrcCand = new Array(numSources).fill(0);
      if (xSol) {
        nonGroundNodes.forEach((_, idx) => {
          vCand[idx + 1] = xSol[idx];
        });
        for (let sIdx = 0; sIdx < numSources; sIdx++) {
          iSrcCand[sIdx] = xSol[numNodes + sIdx];
        }
      }
      bestSol = { vNodes: vCand, iSources: iSrcCand, iLeds: new Array(numLeds).fill(0) };
    }

    const { vNodes, iSources, iLeds } = bestSol;

    // Record node voltages
    allNodeVoltages[groundNode] = 0.0;
    nonGroundNodes.forEach((n, idx) => {
      allNodeVoltages[n] = Number(vNodes[idx + 1].toFixed(4));
    });

    // Check for reverse-biased LEDs
    leds.forEach((led, lIdx) => {
      const isOn = ((bestOnMask >> lIdx) & 1) === 1;
      if (!isOn) {
        const u = nodeIndex.get(dsu.find(termKey(led.instanceId, 'anode')))!;
        const v = nodeIndex.get(dsu.find(termKey(led.instanceId, 'cathode')))!;
        const vRev = vNodes[v] - vNodes[u];
        if (vRev > 0.5) {
          hasFault = true;
          allFaults.push({
            type: 'REVERSED_LED',
            severity: 'warning',
            message: `LED ${led.instanceId} is reverse-biased (anode is at lower potential than cathode).`,
            remedy: 'Flip the LED orientation so the longer lead (anode) connects towards the positive supply.',
            affectedComponentId: led.instanceId,
          });
        }
      }
    });

    // Populate Resistor States
    resistors.forEach((res) => {
      const rVal = Math.max(0.01, Number(res.properties?.resistanceOhms ?? 330.0));
      const u = nodeIndex.get(dsu.find(termKey(res.instanceId, 'pin_1')))!;
      const v = nodeIndex.get(dsu.find(termKey(res.instanceId, 'pin_2')))!;
      const v1 = vNodes[u];
      const v2 = vNodes[v];
      const vDrop = Math.abs(v1 - v2);
      const iRes = vDrop / rVal;
      const pRes = iRes * vDrop;
      const isCond = iRes > 1e-6;
      if (isCond) anyCurrentFlow = true;

      allCompStates[res.instanceId] = {
        instanceId: res.instanceId,
        conducting: isCond,
        currentA: Number(iRes.toFixed(6)),
        voltageDropV: Number(vDrop.toFixed(4)),
        brightness: 0.0,
        overcurrent: false,
        powerDissipationW: Number(pRes.toFixed(4)),
      };

      allBranchCurrents.push({
        branchId: `branch_${res.instanceId}`,
        fromNode: dsu.find(termKey(res.instanceId, 'pin_1')),
        toNode: dsu.find(termKey(res.instanceId, 'pin_2')),
        currentA: Number(((v1 - v2) / rVal).toFixed(6)),
        voltageDropV: Number(vDrop.toFixed(4)),
      });

      // Injected current into nodes:
      // Current flowing from pin_1 to pin_2: leaves pin_1 (-), enters pin_2 (+)
      const iSigned = (v1 - v2) / rVal;
      terminalInjections.set(termKey(res.instanceId, 'pin_1'), -iSigned);
      terminalInjections.set(termKey(res.instanceId, 'pin_2'), +iSigned);
    });

    // Populate LED States
    const subLedStates: Array<{ instanceId: string; illuminated: boolean; currentA: number }> = [];
    leds.forEach((led, lIdx) => {
      const isOn = ((bestOnMask >> lIdx) & 1) === 1;
      const iLed = isOn ? iLeds[lIdx] : 0.0;
      const u = nodeIndex.get(dsu.find(termKey(led.instanceId, 'anode')))!;
      const v = nodeIndex.get(dsu.find(termKey(led.instanceId, 'cathode')))!;
      const vDrop = isOn ? 2.0 : Math.max(0.0, vNodes[u] - vNodes[v]);
      const bVal = isOn ? calculateLEDBrightness(iLed) : 0.0;
      const overcurrent = iLed > 0.030;

      if (isOn) anyCurrentFlow = true;

      if (overcurrent) {
        hasFault = true;
        allFaults.push({
          type: 'OVERCURRENT',
          severity: 'warning',
          message: `LED current (${(iLed * 1000).toFixed(1)} mA) exceeds safe maximum rating of 30 mA!`,
          remedy: 'Increase series resistance (e.g. use 330 Ω or higher) to prevent damage.',
          affectedComponentId: led.instanceId,
        });
      }

      allCompStates[led.instanceId] = {
        instanceId: led.instanceId,
        conducting: isOn,
        currentA: Number(iLed.toFixed(6)),
        voltageDropV: Number(vDrop.toFixed(4)),
        brightness: bVal,
        overcurrent,
        powerDissipationW: Number((iLed * vDrop).toFixed(4)),
      };

      subLedStates.push({
        instanceId: led.instanceId,
        illuminated: isOn,
        currentA: Number(iLed.toFixed(6)),
      });

      allBranchCurrents.push({
        branchId: `branch_${led.instanceId}`,
        fromNode: dsu.find(termKey(led.instanceId, 'anode')),
        toNode: dsu.find(termKey(led.instanceId, 'cathode')),
        currentA: Number(iLed.toFixed(6)),
        voltageDropV: Number(vDrop.toFixed(4)),
      });

      // Injected current into nodes:
      terminalInjections.set(termKey(led.instanceId, 'anode'), -iLed);
      terminalInjections.set(termKey(led.instanceId, 'cathode'), +iLed);
    });

    // Populate Power Supply States
    let totalSubCurrent = 0.0;
    let totalSubPower = 0.0;
    sources.forEach((src, sIdx) => {
      // In MNA, iSources[sIdx] is current entering the positive terminal.
      // Therefore, current supplied by the source out of its positive terminal is -iSources[sIdx].
      const iSrcDelivered = -iSources[sIdx];
      const vSet = Number(src.properties?.voltageV ?? 5.0);
      const isCond = Math.abs(iSrcDelivered) > 1e-6;
      const pSrc = Math.abs(iSrcDelivered * vSet);

      if (isCond) {
        anyCurrentFlow = true;
        totalSubCurrent += Math.max(0.0, iSrcDelivered);
        totalSubPower += pSrc;
      }

      allCompStates[src.instanceId] = {
        instanceId: src.instanceId,
        conducting: isCond,
        currentA: Number(iSrcDelivered.toFixed(6)),
        voltageDropV: Number(vSet.toFixed(4)),
        brightness: 0.0,
        overcurrent: false,
        powerDissipationW: Number(pSrc.toFixed(4)),
      };

      // Injected current into nodes from source:
      // Leaves pos terminal (+), enters neg terminal (-)
      terminalInjections.set(termKey(src.instanceId, 'pos'), +iSrcDelivered);
      terminalInjections.set(termKey(src.instanceId, 'neg'), -iSrcDelivered);
    });

    // Subcircuit status
    const compIds = comps.map((c) => c.instanceId);
    const subHasFault = allFaults.some(
      (f) => f.affectedComponentId && compIds.includes(f.affectedComponentId)
    );
    const subStatus: 'conducting' | 'open' | 'fault' = subHasFault
      ? 'fault'
      : totalSubCurrent > 1e-6
      ? 'conducting'
      : 'open';

    if (subStatus === 'open') {
      allFaults.push({
        type: 'OPEN_CIRCUIT',
        severity: 'warning',
        message: `Circuit path for source ${primarySource.instanceId} is open.`,
        remedy: 'Verify jumper wire connections and component placement.',
        affectedComponentId: primarySource.instanceId,
      });
    }

    allSubcircuits.push({
      subcircuitId: `sub_${primarySource.instanceId}`,
      sourceInstanceId: primarySource.instanceId,
      sourceVoltageV: Number(primarySource.properties?.voltageV ?? 5.0),
      currentA: Number(totalSubCurrent.toFixed(6)),
      status: subStatus,
      componentInstanceIds: compIds,
      ledStates: subLedStates,
      totalPowerW: Number(totalSubPower.toFixed(4)),
      sourceInstanceIds: sources.map((s) => s.instanceId),
    });
  });

  // 7. Solve Physical Conductor Current Distribution
  const allConductorFlows = solveConductorFlows(
    dsu,
    terminalInjections,
    wires,
    attachments,
    breadboards
  );

  const overallStatus: 'solved' | 'fault' | 'open' =
    hasFault && !anyCurrentFlow ? 'fault' : anyCurrentFlow ? 'solved' : 'open';

  return {
    status: overallStatus,
    nodeVoltages: allNodeVoltages,
    componentStates: allCompStates,
    branchCurrents: allBranchCurrents,
    conductorFlows: allConductorFlows,
    subcircuits: allSubcircuits,
    faults: allFaults,
    hasCurrentFlow: anyCurrentFlow,
    timestamp: Date.now(),
  };
}
