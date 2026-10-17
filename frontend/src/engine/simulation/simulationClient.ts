/**
 * Circuit Simulation Client
 * Connects frontend to the authoritative Python FastAPI solver at http://localhost:8000/api/solve,
 * with seamless fallback to isomorphic local solver.
 */

import type { GenericEquipmentInstance, GenericEquipmentDefinition } from '../../types/workbench';
import type { JumperWire, TerminalAttachment } from '../../types/connections';
import type { CircuitSimulationResult } from '../../types/simulation';
import { solveCircuitLocal } from './dcSolverLocal';

const BACKEND_SOLVE_URL = '/api/solve';

export async function simulateCircuit(
  instances: GenericEquipmentInstance[],
  catalog: GenericEquipmentDefinition[],
  attachments: TerminalAttachment[],
  wires: JumperWire[]
): Promise<CircuitSimulationResult> {
  // Format request payload for Python FastAPI solver
  const payload = {
    instances: instances.map((inst) => {
      const def = catalog.find((d) => d.id === inst.definitionId);
      return {
        instanceId: inst.instanceId,
        definitionId: inst.definitionId,
        properties: inst.properties || {},
        terminals: def ? def.terminals.map((t) => t.id) : [],
      };
    }),
    attachments: attachments.map((att) => ({
      instanceId: att.instanceId,
      terminalId: att.terminalId,
      breadboardInstanceId: att.breadboardInstanceId,
      holeId: att.holeId,
    })),
    wires: wires.map((w) => ({
      id: w.id,
      from: w.from,
      to: w.to,
    })),
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 400); // 400ms timeout

    const resp = await fetch(BACKEND_SOLVE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (resp.ok) {
      const data = await resp.json();
      return {
        ...data,
        timestamp: Date.now(),
      };
    }
  } catch {
    // Backend unavailable or timed out: fall back seamlessly to isomorphic local solver
  }

  return solveCircuitLocal(instances, catalog, attachments, wires);
}
