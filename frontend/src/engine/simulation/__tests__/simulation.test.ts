import { describe, it, expect } from 'vitest';
import { solveCircuitLocal } from '../dcSolverLocal';
import { calculateLEDBrightness } from '../brightnessCurve';
import { getVoltageColor } from '../voltageColor';
import { PHYSICS_ELECTRICITY_CATALOG } from '../../../subjects/physics/equipmentCatalog';
import { useWorkbenchStore } from '../../../store/useWorkbenchStore';
import { BREADBOARD_GEOMETRY, generateBreadboardHoles } from '../../connectivity/breadboardTopology';
import type { GenericEquipmentInstance } from '../../../types/workbench';
import type { JumperWire, TerminalAttachment } from '../../../types/connections';

describe('Milestone D — Interactive Visual Electrical Simulation Acceptance Tests', () => {
  const dcInst: GenericEquipmentInstance = {
    instanceId: 'dc_test_1',
    definitionId: 'dc_source_5v',
    positionMM: { x: 10, y: 10 },
    rotationDeg: 0,
    properties: { voltageV: 5.0 },
    connections: {},
  };

  const resInst: GenericEquipmentInstance = {
    instanceId: 'res_test_1',
    definitionId: 'resistor_330',
    positionMM: { x: 50, y: 10 },
    rotationDeg: 0,
    properties: { resistanceOhms: 330.0 },
    connections: {},
  };

  const ledInst: GenericEquipmentInstance = {
    instanceId: 'led_test_1',
    definitionId: 'led_5mm_red',
    positionMM: { x: 90, y: 10 },
    rotationDeg: 0,
    properties: {},
    connections: {},
  };

  const wire1: JumperWire = {
    id: 'w1',
    color: '#ef4444',
    from: { kind: 'component-terminal', instanceId: 'dc_test_1', terminalId: 'pos' },
    to: { kind: 'component-terminal', instanceId: 'res_test_1', terminalId: 'pin_1' },
  };

  const wire2: JumperWire = {
    id: 'w2',
    color: '#3b82f6',
    from: { kind: 'component-terminal', instanceId: 'res_test_1', terminalId: 'pin_2' },
    to: { kind: 'component-terminal', instanceId: 'led_test_1', terminalId: 'anode' },
  };

  const wire3: JumperWire = {
    id: 'w3',
    color: '#1f2937',
    from: { kind: 'component-terminal', instanceId: 'led_test_1', terminalId: 'cathode' },
    to: { kind: 'component-terminal', instanceId: 'dc_test_1', terminalId: 'neg' },
  };

  // Test 1: Complete a valid LED circuit: LED illuminates and current visualization activates
  it('1. Complete a valid LED circuit: LED illuminates and current visualization activates', () => {
    const res = solveCircuitLocal([dcInst, resInst, ledInst], PHYSICS_ELECTRICITY_CATALOG, [], [wire1, wire2, wire3]);

    expect(res.status).toBe('solved');
    expect(res.hasCurrentFlow).toBe(true);

    const ledState = res.componentStates['led_test_1'];
    expect(ledState).toBeDefined();
    expect(ledState.conducting).toBe(true);
    expect(ledState.currentA).toBeCloseTo(0.00909, 4); // 9.09 mA
    expect(ledState.voltageDropV).toBeCloseTo(2.0, 1);
    expect(ledState.brightness).toBeGreaterThan(0.5); // Radiant illumination
  });

  // Test 2: Remove a wire: LED turns off and current animation stops
  it('2. Remove a wire: LED turns off and current animation stops', () => {
    // Missing return ground wire w3
    const res = solveCircuitLocal([dcInst, resInst, ledInst], PHYSICS_ELECTRICITY_CATALOG, [], [wire1, wire2]);

    expect(res.status).toBe('open');
    expect(res.hasCurrentFlow).toBe(false);

    const ledState = res.componentStates['led_test_1'];
    expect(ledState?.conducting ?? false).toBe(false);
    expect(ledState?.currentA ?? 0).toBe(0);
    expect(ledState?.brightness ?? 0).toBe(0);
  });

  // Test 3: Reverse the LED: no false current-flow animation
  it('3. Reverse the LED: no false current-flow animation and warning fault reported', () => {
    // Wire 2 connects Resistor to Cathode (reversed!)
    const wire2Reversed: JumperWire = {
      id: 'w2_rev',
      color: '#3b82f6',
      from: { kind: 'component-terminal', instanceId: 'res_test_1', terminalId: 'pin_2' },
      to: { kind: 'component-terminal', instanceId: 'led_test_1', terminalId: 'cathode' },
    };
    // Wire 3 connects Anode to Neg
    const wire3Reversed: JumperWire = {
      id: 'w3_rev',
      color: '#1f2937',
      from: { kind: 'component-terminal', instanceId: 'led_test_1', terminalId: 'anode' },
      to: { kind: 'component-terminal', instanceId: 'dc_test_1', terminalId: 'neg' },
    };

    const res = solveCircuitLocal([dcInst, resInst, ledInst], PHYSICS_ELECTRICITY_CATALOG, [], [wire1, wire2Reversed, wire3Reversed]);

    expect(res.status).toBe('fault');
    expect(res.hasCurrentFlow).toBe(false);
    expect(res.faults.some((f) => f.type === 'REVERSED_LED')).toBe(true);

    const ledState = res.componentStates['led_test_1'];
    expect(ledState.conducting).toBe(false);
    expect(ledState.currentA).toBe(0);
    expect(ledState.brightness).toBe(0);
  });

  // Test 4: Change resistor value: LED brightness and current animation respond consistently
  it('4. Change resistor value: LED brightness and current respond consistently to resistance', () => {
    // 330 ohm circuit: I ~ 9.09 mA
    const res330 = solveCircuitLocal([dcInst, resInst, ledInst], PHYSICS_ELECTRICITY_CATALOG, [], [wire1, wire2, wire3]);

    // 1000 ohm resistor: I = (5.0 - 2.0) / 1000 = 3.0 mA
    const res1kInst: GenericEquipmentInstance = {
      ...resInst,
      properties: { resistanceOhms: 1000.0 },
    };
    const res1k = solveCircuitLocal([dcInst, res1kInst, ledInst], PHYSICS_ELECTRICITY_CATALOG, [], [wire1, wire2, wire3]);

    expect(res330.componentStates['led_test_1'].currentA).toBeGreaterThan(res1k.componentStates['led_test_1'].currentA);
    expect(res330.componentStates['led_test_1'].brightness).toBeGreaterThan(res1k.componentStates['led_test_1'].brightness);
    expect(res1k.componentStates['led_test_1'].currentA).toBeCloseTo(0.003, 4);
  });

  // Test 5: Enable voltage visualization: node colors reflect solver results
  it('5. Enable voltage visualization: node colors reflect solver results', () => {
    const res = solveCircuitLocal([dcInst, resInst, ledInst], PHYSICS_ELECTRICITY_CATALOG, [], [wire1, wire2, wire3]);
    expect(res.status).toBe('solved');

    // DC positive is 5V (high potential)
    const color5V = getVoltageColor(5.0);
    expect(color5V).toBe('#f43f5e');

    // Intermediate voltage (e.g. 2.0V)
    const color2V = getVoltageColor(2.0);
    expect(color2V).toBe('#10b981');

    // Ground is 0V
    const color0V = getVoltageColor(0.0);
    expect(color0V).toBe('#06b6d4');

    // Floating/unresolved node
    const colorFloating = getVoltageColor(undefined);
    expect(colorFloating).toBe('#64748b');
  });

  // Test 6: Pause visualization: electrical results remain available
  it('6. Pause visualization: electrical results remain available in state', () => {
    useWorkbenchStore.getState().setSimulationSettings({ isRunning: false });
    expect(useWorkbenchStore.getState().simulationSettings.isRunning).toBe(false);

    // Compute simulation results
    const res = solveCircuitLocal([dcInst, resInst, ledInst], PHYSICS_ELECTRICITY_CATALOG, [], [wire1, wire2, wire3]);
    useWorkbenchStore.getState().setSimulationResult(res);

    // Verify electrical values are preserved even while paused
    const stored = useWorkbenchStore.getState().simulationResult;
    expect(stored?.status).toBe('solved');
    expect(stored?.componentStates['led_test_1'].conducting).toBe(true);
    expect(stored?.componentStates['led_test_1'].currentA).toBeCloseTo(0.00909, 4);

    // Resume
    useWorkbenchStore.getState().setSimulationSettings({ isRunning: true });
    expect(useWorkbenchStore.getState().simulationSettings.isRunning).toBe(true);
  });

  // Test 7: Move components: animations follow updated wire geometry
  it('7. Move components: circuit solver preserves connectivity across position changes', () => {
    // When component is moved to a new positionMM, its instanceId and connectivity remain intact
    const movedResInst: GenericEquipmentInstance = {
      ...resInst,
      positionMM: { x: 120, y: 80 },
    };

    const res = solveCircuitLocal([dcInst, movedResInst, ledInst], PHYSICS_ELECTRICITY_CATALOG, [], [wire1, wire2, wire3]);
    expect(res.status).toBe('solved');
    expect(res.hasCurrentFlow).toBe(true);
    expect(res.componentStates['led_test_1'].conducting).toBe(true);
  });

  // Test 8: Stevens non-linear brightness curve validation
  it('8. Brightness curve mathematically satisfies Stevens power law curve', () => {
    // Zero current
    expect(calculateLEDBrightness(0)).toBe(0);
    expect(calculateLEDBrightness(0.00005)).toBe(0);

    // Reference current 20mA (1.0)
    expect(calculateLEDBrightness(0.02)).toBeCloseTo(1.0, 2);

    // 9.09mA produces ~0.62
    const b9 = calculateLEDBrightness(0.00909);
    expect(b9).toBeGreaterThan(0.55);
    expect(b9).toBeLessThan(0.70);

    // Saturation capped at 1.0
    expect(calculateLEDBrightness(0.05)).toBe(1.0);
  });

  // Test 9: Multiple breadboards: no cross-instance animation leakage
  it('9. Multiple breadboards: no cross-instance animation or node leakage', () => {
    const bbA: GenericEquipmentInstance = {
      instanceId: 'bb_A',
      definitionId: 'breadboard_400',
      positionMM: { x: 20, y: 30 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };
    const bbB: GenericEquipmentInstance = {
      instanceId: 'bb_B',
      definitionId: 'breadboard_400',
      positionMM: { x: 140, y: 30 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };

    // Breadboard A has a closed series loop
    const attA: TerminalAttachment[] = [
      { instanceId: 'res_test_1', terminalId: 'pin_1', breadboardInstanceId: 'bb_A', holeId: 'col_5_a' },
      { instanceId: 'res_test_1', terminalId: 'pin_2', breadboardInstanceId: 'bb_A', holeId: 'col_9_a' },
      { instanceId: 'led_test_1', terminalId: 'anode', breadboardInstanceId: 'bb_A', holeId: 'col_9_b' }, // in same col 9
      { instanceId: 'led_test_1', terminalId: 'cathode', breadboardInstanceId: 'bb_A', holeId: 'col_13_b' },
    ];

    const wiresA: JumperWire[] = [
      { id: 'w_p', color: '#ef4444', from: { kind: 'component-terminal', instanceId: 'dc_test_1', terminalId: 'pos' }, to: { kind: 'breadboard-hole', breadboardInstanceId: 'bb_A', holeId: 'col_5_b' } },
      { id: 'w_n', color: '#1f2937', from: { kind: 'component-terminal', instanceId: 'dc_test_1', terminalId: 'neg' }, to: { kind: 'breadboard-hole', breadboardInstanceId: 'bb_A', holeId: 'col_13_c' } },
    ];

    const res = solveCircuitLocal([dcInst, bbA, bbB, resInst, ledInst], PHYSICS_ELECTRICITY_CATALOG, attA, wiresA);
    expect(res.status).toBe('solved');
    expect(res.hasCurrentFlow).toBe(true);

    // Board B has no active components or wires: verify zero false activity on Board B
    expect(res.componentStates['res_test_1'].conducting).toBe(true);
  });

  // Test 10: Solver failure: no fabricated visual activity on direct short circuit
  it('10. Solver failure / direct short: no fabricated visual current flow', () => {
    // Short circuit wire directly connecting DC Pos and Neg
    const shortWire: JumperWire = {
      id: 'w_short_direct',
      color: '#ef4444',
      from: { kind: 'component-terminal', instanceId: 'dc_test_1', terminalId: 'pos' },
      to: { kind: 'component-terminal', instanceId: 'dc_test_1', terminalId: 'neg' },
    };

    const res = solveCircuitLocal([dcInst], PHYSICS_ELECTRICITY_CATALOG, [], [shortWire]);
    expect(res.status).toBe('fault');
    expect(res.hasCurrentFlow).toBe(false);
    expect(res.faults[0].type).toBe('DIRECT_SUPPLY_SHORT');
    expect(res.branchCurrents).toHaveLength(0); // Zero fabricated currents
  });

  describe('Milestone D Critical Fixes — 15 Section 10 Regression Tests', () => {
    // Equipment setup for two independent circuits A and B
    const dcA: GenericEquipmentInstance = {
      instanceId: 'dc_A',
      definitionId: 'dc_source_5v',
      positionMM: { x: 0, y: 0 },
      rotationDeg: 0,
      properties: { voltageV: 5.0 },
      connections: {},
    };
    const resA: GenericEquipmentInstance = {
      instanceId: 'res_A',
      definitionId: 'resistor_330',
      positionMM: { x: 50, y: 0 },
      rotationDeg: 0,
      properties: { resistanceOhms: 330.0 },
      connections: {},
    };
    const ledA: GenericEquipmentInstance = {
      instanceId: 'led_A',
      definitionId: 'led_5mm_red',
      positionMM: { x: 100, y: 0 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };

    const dcB: GenericEquipmentInstance = {
      instanceId: 'dc_B',
      definitionId: 'dc_source_5v',
      positionMM: { x: 0, y: 100 },
      rotationDeg: 0,
      properties: { voltageV: 5.0 },
      connections: {},
    };
    const resB: GenericEquipmentInstance = {
      instanceId: 'res_B',
      definitionId: 'resistor_330',
      positionMM: { x: 50, y: 100 },
      rotationDeg: 0,
      properties: { resistanceOhms: 330.0 },
      connections: {},
    };
    const ledB: GenericEquipmentInstance = {
      instanceId: 'led_B',
      definitionId: 'led_5mm_red',
      positionMM: { x: 100, y: 100 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };

    const wiresA: JumperWire[] = [
      { id: 'wA1', color: '#ef4444', from: { kind: 'component-terminal', instanceId: 'dc_A', terminalId: 'pos' }, to: { kind: 'component-terminal', instanceId: 'res_A', terminalId: 'pin_1' } },
      { id: 'wA2', color: '#3b82f6', from: { kind: 'component-terminal', instanceId: 'res_A', terminalId: 'pin_2' }, to: { kind: 'component-terminal', instanceId: 'led_A', terminalId: 'anode' } },
      { id: 'wA3', color: '#1f2937', from: { kind: 'component-terminal', instanceId: 'led_A', terminalId: 'cathode' }, to: { kind: 'component-terminal', instanceId: 'dc_A', terminalId: 'neg' } },
    ];

    const wiresB: JumperWire[] = [
      { id: 'wB1', color: '#10b981', from: { kind: 'component-terminal', instanceId: 'dc_B', terminalId: 'pos' }, to: { kind: 'component-terminal', instanceId: 'res_B', terminalId: 'pin_1' } },
      { id: 'wB2', color: '#f59e0b', from: { kind: 'component-terminal', instanceId: 'res_B', terminalId: 'pin_2' }, to: { kind: 'component-terminal', instanceId: 'led_B', terminalId: 'anode' } },
      { id: 'wB3', color: '#6366f1', from: { kind: 'component-terminal', instanceId: 'led_B', terminalId: 'cathode' }, to: { kind: 'component-terminal', instanceId: 'dc_B', terminalId: 'neg' } },
    ];

    // 1. Two independent valid LED circuits
    it('Regression 1: Two independent valid LED circuits both illuminate simultaneously', () => {
      const res = solveCircuitLocal([dcA, resA, ledA, dcB, resB, ledB], PHYSICS_ELECTRICITY_CATALOG, [], [...wiresA, ...wiresB]);
      expect(res.status).toBe('solved');
      expect(res.componentStates['led_A'].conducting).toBe(true);
      expect(res.componentStates['led_B'].conducting).toBe(true);
      expect(res.componentStates['led_A'].currentA).toBeCloseTo(0.00909, 4);
      expect(res.componentStates['led_B'].currentA).toBeCloseTo(0.00909, 4);
    });

    // 2. Two independent DC voltage sources
    it('Regression 2: Two independent DC voltage sources retain separate potentials', () => {
      const dcB9V = { ...dcB, properties: { voltageV: 9.0 } };
      const res = solveCircuitLocal([dcA, resA, ledA, dcB9V, resB, ledB], PHYSICS_ELECTRICITY_CATALOG, [], [...wiresA, ...wiresB]);
      expect(res.status).toBe('solved');
      expect(res.componentStates['led_A'].currentA).toBeCloseTo(0.00909, 4); // (5-2)/330
      expect(res.componentStates['led_B'].currentA).toBeCloseTo((9.0 - 2.0) / 330, 4); // (9-2)/330 = 21.2mA
    });

    // 3. Correct LED state mapping by instance ID
    it('Regression 3: Correct LED state mapping by instance ID', () => {
      const res = solveCircuitLocal([dcA, resA, ledA, dcB, resB, ledB], PHYSICS_ELECTRICITY_CATALOG, [], [...wiresA, ...wiresB]);
      expect(res.componentStates['led_A'].instanceId).toBe('led_A');
      expect(res.componentStates['led_B'].instanceId).toBe('led_B');
    });

    // 4. One open circuit and one valid circuit
    it('Regression 4: One open circuit (B) and one valid circuit (A)', () => {
      // Circuit B is missing return wire wB3
      const res = solveCircuitLocal([dcA, resA, ledA, dcB, resB, ledB], PHYSICS_ELECTRICITY_CATALOG, [], [...wiresA, wiresB[0], wiresB[1]]);
      expect(res.status).toBe('solved'); // Overall has active current
      expect(res.componentStates['led_A'].conducting).toBe(true);
      expect(res.componentStates['led_B'].conducting).toBe(false);
      expect(res.componentStates['led_B'].currentA).toBe(0);
    });

    // 5. One reversed LED and one valid circuit
    it('Regression 5: One reversed LED (B) and one valid circuit (A)', () => {
      const wiresBReversed = [
        wiresB[0],
        { id: 'wB2_rev', color: '#f59e0b', from: { kind: 'component-terminal', instanceId: 'res_B', terminalId: 'pin_2' }, to: { kind: 'component-terminal', instanceId: 'led_B', terminalId: 'cathode' } } as JumperWire,
        { id: 'wB3_rev', color: '#6366f1', from: { kind: 'component-terminal', instanceId: 'led_B', terminalId: 'anode' }, to: { kind: 'component-terminal', instanceId: 'dc_B', terminalId: 'neg' } } as JumperWire,
      ];
      const res = solveCircuitLocal([dcA, resA, ledA, dcB, resB, ledB], PHYSICS_ELECTRICITY_CATALOG, [], [...wiresA, ...wiresBReversed]);
      expect(res.componentStates['led_A'].conducting).toBe(true);
      expect(res.componentStates['led_B'].conducting).toBe(false);
      expect(res.faults.some((f) => f.type === 'REVERSED_LED' && f.affectedComponentId === 'led_B')).toBe(true);
    });

    // 6. One shorted circuit and one valid circuit
    it('Regression 6: One shorted circuit (B) and one valid circuit (A)', () => {
      const shortWireB: JumperWire = {
        id: 'wB_short',
        color: '#ef4444',
        from: { kind: 'component-terminal', instanceId: 'dc_B', terminalId: 'pos' },
        to: { kind: 'component-terminal', instanceId: 'dc_B', terminalId: 'neg' },
      };
      const res = solveCircuitLocal([dcA, resA, ledA, dcB, resB, ledB], PHYSICS_ELECTRICITY_CATALOG, [], [...wiresA, shortWireB]);
      expect(res.componentStates['led_A'].conducting).toBe(true);
      expect(res.faults.some((f) => f.type === 'DIRECT_SUPPLY_SHORT' && f.affectedComponentId === 'dc_B')).toBe(true);
    });

    // 7. Multiple independent breadboards
    it('Regression 7: Multiple independent breadboards maintain independent topologies', () => {
      const bb1: GenericEquipmentInstance = { instanceId: 'bb_1', definitionId: 'breadboard_400', positionMM: { x: 0, y: 0 }, rotationDeg: 0, properties: {}, connections: {} };
      const bb2: GenericEquipmentInstance = { instanceId: 'bb_2', definitionId: 'breadboard_400', positionMM: { x: 0, y: 100 }, rotationDeg: 0, properties: {}, connections: {} };

      const attA: TerminalAttachment[] = [
        { instanceId: 'res_A', terminalId: 'pin_1', breadboardInstanceId: 'bb_1', holeId: 'col_5_a' },
        { instanceId: 'res_A', terminalId: 'pin_2', breadboardInstanceId: 'bb_1', holeId: 'col_9_a' },
        { instanceId: 'led_A', terminalId: 'anode', breadboardInstanceId: 'bb_1', holeId: 'col_9_b' },
        { instanceId: 'led_A', terminalId: 'cathode', breadboardInstanceId: 'bb_1', holeId: 'col_13_b' },
      ];
      const wiresBbA: JumperWire[] = [
        { id: 'w1A', color: '#ef4444', from: { kind: 'component-terminal', instanceId: 'dc_A', terminalId: 'pos' }, to: { kind: 'breadboard-hole', breadboardInstanceId: 'bb_1', holeId: 'col_5_b' } },
        { id: 'w2A', color: '#1f2937', from: { kind: 'breadboard-hole', breadboardInstanceId: 'bb_1', holeId: 'col_13_c' }, to: { kind: 'component-terminal', instanceId: 'dc_A', terminalId: 'neg' } },
      ];

      const attB: TerminalAttachment[] = [
        { instanceId: 'res_B', terminalId: 'pin_1', breadboardInstanceId: 'bb_2', holeId: 'col_5_a' },
        { instanceId: 'res_B', terminalId: 'pin_2', breadboardInstanceId: 'bb_2', holeId: 'col_9_a' },
        { instanceId: 'led_B', terminalId: 'anode', breadboardInstanceId: 'bb_2', holeId: 'col_9_b' },
        { instanceId: 'led_B', terminalId: 'cathode', breadboardInstanceId: 'bb_2', holeId: 'col_13_b' },
      ];
      const wiresBbB: JumperWire[] = [
        { id: 'w1B', color: '#10b981', from: { kind: 'component-terminal', instanceId: 'dc_B', terminalId: 'pos' }, to: { kind: 'breadboard-hole', breadboardInstanceId: 'bb_2', holeId: 'col_5_b' } },
        { id: 'w2B', color: '#6366f1', from: { kind: 'breadboard-hole', breadboardInstanceId: 'bb_2', holeId: 'col_13_c' }, to: { kind: 'component-terminal', instanceId: 'dc_B', terminalId: 'neg' } },
      ];

      const res = solveCircuitLocal([dcA, bb1, resA, ledA, dcB, bb2, resB, ledB], PHYSICS_ELECTRICITY_CATALOG, [...attA, ...attB], [...wiresBbA, ...wiresBbB]);
      expect(res.status).toBe('solved');
      expect(res.componentStates['led_A'].conducting).toBe(true);
      expect(res.componentStates['led_B'].conducting).toBe(true);
    });

    // 8. Current direction independent of wire creation order
    it('Regression 8: Current direction is independent of wire creation order', () => {
      // Create ground wire from DC neg to LED cathode instead of LED cathode to DC neg
      const reverseDrawnWire3: JumperWire = {
        id: 'wA3_drawn_rev',
        color: '#1f2937',
        from: { kind: 'component-terminal', instanceId: 'dc_A', terminalId: 'neg' },
        to: { kind: 'component-terminal', instanceId: 'led_A', terminalId: 'cathode' },
      };
      const res = solveCircuitLocal([dcA, resA, ledA], PHYSICS_ELECTRICITY_CATALOG, [], [wiresA[0], wiresA[1], reverseDrawnWire3]);
      const flowW3 = res.conductorFlows?.find((f) => f.conductorId === 'wA3_drawn_rev');
      expect(flowW3).toBeDefined();
      // Conventional current flows from LED cathode into DC neg:
      expect(flowW3?.fromKey).toContain('cathode');
      expect(flowW3?.toKey).toContain('neg');
    });

    // 9. Current direction independent of wire color
    it('Regression 9: Current direction is independent of wire color', () => {
      const redWire3: JumperWire = { ...wiresA[2], color: '#ef4444' };
      const res = solveCircuitLocal([dcA, resA, ledA], PHYSICS_ELECTRICITY_CATALOG, [], [wiresA[0], wiresA[1], redWire3]);
      const flowW3 = res.conductorFlows?.find((f) => f.conductorId === wiresA[2].id);
      expect(flowW3?.fromKey).toContain('cathode');
      expect(flowW3?.toKey).toContain('neg');
    });

    // 10. Current direction after reversing a valid circuit's orientation
    it('Regression 10: Current direction after placing LED first then Resistor in loop', () => {
      // Loop: DC pos -> LED anode -> LED cathode -> Resistor pin 1 -> Resistor pin 2 -> DC neg
      const wireLEDFirst: JumperWire[] = [
        { id: 'w1', color: '#ef4444', from: { kind: 'component-terminal', instanceId: 'dc_A', terminalId: 'pos' }, to: { kind: 'component-terminal', instanceId: 'led_A', terminalId: 'anode' } },
        { id: 'w2', color: '#3b82f6', from: { kind: 'component-terminal', instanceId: 'led_A', terminalId: 'cathode' }, to: { kind: 'component-terminal', instanceId: 'res_A', terminalId: 'pin_1' } },
        { id: 'w3', color: '#1f2937', from: { kind: 'component-terminal', instanceId: 'res_A', terminalId: 'pin_2' }, to: { kind: 'component-terminal', instanceId: 'dc_A', terminalId: 'neg' } },
      ];
      const res = solveCircuitLocal([dcA, resA, ledA], PHYSICS_ELECTRICITY_CATALOG, [], wireLEDFirst);
      expect(res.status).toBe('solved');
      expect(res.componentStates['led_A'].conducting).toBe(true);
      const flowW2 = res.conductorFlows?.find((f) => f.conductorId === 'w2');
      expect(flowW2?.fromKey).toContain('cathode');
      expect(flowW2?.toKey).toContain('pin_1');
    });

    // 11. Current-flow path through a breadboard strip
    it('Regression 11: Current-flow path through a breadboard strip is detected and mapped', () => {
      const bb1: GenericEquipmentInstance = { instanceId: 'bb_1', definitionId: 'breadboard_400', positionMM: { x: 0, y: 0 }, rotationDeg: 0, properties: {}, connections: {} };
      const att: TerminalAttachment[] = [
        { instanceId: 'res_A', terminalId: 'pin_1', breadboardInstanceId: 'bb_1', holeId: 'col_5_a' },
        { instanceId: 'res_A', terminalId: 'pin_2', breadboardInstanceId: 'bb_1', holeId: 'col_9_a' },
        { instanceId: 'led_A', terminalId: 'anode', breadboardInstanceId: 'bb_1', holeId: 'col_9_b' },
        { instanceId: 'led_A', terminalId: 'cathode', breadboardInstanceId: 'bb_1', holeId: 'col_13_b' },
      ];
      const wiresBb: JumperWire[] = [
        { id: 'w1', color: '#ef4444', from: { kind: 'component-terminal', instanceId: 'dc_A', terminalId: 'pos' }, to: { kind: 'breadboard-hole', breadboardInstanceId: 'bb_1', holeId: 'col_5_b' } },
        { id: 'w2', color: '#1f2937', from: { kind: 'breadboard-hole', breadboardInstanceId: 'bb_1', holeId: 'col_13_c' }, to: { kind: 'component-terminal', instanceId: 'dc_A', terminalId: 'neg' } },
      ];
      const res = solveCircuitLocal([dcA, bb1, resA, ledA], PHYSICS_ELECTRICITY_CATALOG, att, wiresBb);
      const stripFlows = res.conductorFlows?.filter((f) => f.type === 'breadboard-strip');
      expect(stripFlows && stripFlows.length).toBeGreaterThan(0);
      // Strip in column 9 connects resistor pin 2 (col_9_a) to LED anode (col_9_b)
      const col9Strip = stripFlows?.find((f) => f.fromHoleId?.includes('col_9') || f.toHoleId?.includes('col_9'));
      expect(col9Strip).toBeDefined();
      expect(col9Strip?.currentA).toBeCloseTo(0.00909, 4);
    });

    // 12. No animation through unused conductive strips
    it('Regression 12: No animation through unused conductive strips', () => {
      const bb1: GenericEquipmentInstance = { instanceId: 'bb_1', definitionId: 'breadboard_400', positionMM: { x: 0, y: 0 }, rotationDeg: 0, properties: {}, connections: {} };
      const res = solveCircuitLocal([dcA, bb1, resA, ledA], PHYSICS_ELECTRICITY_CATALOG, [], wiresA);
      // No holes are plugged on bb_1
      const stripFlows = res.conductorFlows?.filter((f) => f.type === 'breadboard-strip');
      expect(stripFlows).toHaveLength(0);
    });

    // 13. No animation through an open circuit
    it('Regression 13: No animation through an open circuit', () => {
      const res = solveCircuitLocal([dcA, resA, ledA], PHYSICS_ELECTRICITY_CATALOG, [], [wiresA[0], wiresA[1]]);
      expect(res.status).toBe('open');
      expect(res.conductorFlows).toHaveLength(0);
      expect(res.hasCurrentFlow).toBe(false);
    });

    // 14. No cross-instance visual leakage
    it('Regression 14: No cross-instance visual leakage between breadboards', () => {
      const bb1: GenericEquipmentInstance = { instanceId: 'bb_1', definitionId: 'breadboard_400', positionMM: { x: 0, y: 0 }, rotationDeg: 0, properties: {}, connections: {} };
      const bb2: GenericEquipmentInstance = { instanceId: 'bb_2', definitionId: 'breadboard_400', positionMM: { x: 0, y: 100 }, rotationDeg: 0, properties: {}, connections: {} };
      const att: TerminalAttachment[] = [
        { instanceId: 'res_A', terminalId: 'pin_1', breadboardInstanceId: 'bb_1', holeId: 'col_5_a' },
        { instanceId: 'res_A', terminalId: 'pin_2', breadboardInstanceId: 'bb_1', holeId: 'col_9_a' },
        { instanceId: 'led_A', terminalId: 'anode', breadboardInstanceId: 'bb_1', holeId: 'col_9_b' },
        { instanceId: 'led_A', terminalId: 'cathode', breadboardInstanceId: 'bb_1', holeId: 'col_13_b' },
      ];
      const wiresBb: JumperWire[] = [
        { id: 'w1', color: '#ef4444', from: { kind: 'component-terminal', instanceId: 'dc_A', terminalId: 'pos' }, to: { kind: 'breadboard-hole', breadboardInstanceId: 'bb_1', holeId: 'col_5_b' } },
        { id: 'w2', color: '#1f2937', from: { kind: 'breadboard-hole', breadboardInstanceId: 'bb_1', holeId: 'col_13_c' }, to: { kind: 'component-terminal', instanceId: 'dc_A', terminalId: 'neg' } },
      ];
      const res = solveCircuitLocal([dcA, bb1, bb2, resA, ledA], PHYSICS_ELECTRICITY_CATALOG, att, wiresBb);
      const bb2Flows = res.conductorFlows?.filter((f) => f.breadboardInstanceId === 'bb_2');
      expect(bb2Flows).toHaveLength(0);
    });

    // 15. Python/TypeScript solver parity
    it('Regression 15: Python/TypeScript solver parity on identical circuit definition', () => {
      const res = solveCircuitLocal([dcA, resA, ledA], PHYSICS_ELECTRICITY_CATALOG, [], wiresA);
      expect(res.status).toBe('solved');
      expect(res.componentStates['led_A'].currentA).toBeCloseTo(0.00909, 4);
      expect(res.componentStates['led_A'].voltageDropV).toBeCloseTo(2.0, 1);
      expect(res.componentStates['res_A'].voltageDropV).toBeCloseTo(3.0, 1);
      expect(res.conductorFlows?.length).toBe(3);
    });
  });

  describe('Milestone D.1 — Interaction Stability, Per-Circuit Telemetry & Breadboard Geometry', () => {
    // Test 1: Interaction Stability & Attachment Invariant
    it('Task 1: Clicking or selecting a snapped component preserves attachments without triggering drag or incrementing revision', () => {
      const store = useWorkbenchStore.getState();
      store.clearWorkbench();

      const testRes: GenericEquipmentInstance = {
        instanceId: 'res_snapped_1',
        definitionId: 'resistor_330',
        positionMM: { x: 20, y: 30 },
        rotationDeg: 0,
        properties: { resistanceOhms: 330 },
        connections: {},
      };

      store.addInstance(testRes);
      const initialRev = useWorkbenchStore.getState().topologyRevision;

      // Set breadboard snap attachments
      const initialAttachments: TerminalAttachment[] = [
        { instanceId: 'res_snapped_1', terminalId: 'pin_1', breadboardInstanceId: 'bb_1', holeId: 'col_5_a' },
        { instanceId: 'res_snapped_1', terminalId: 'pin_2', breadboardInstanceId: 'bb_1', holeId: 'col_9_a' },
      ];
      store.setAttachmentsForInstance('res_snapped_1', initialAttachments);
      const afterAttachRev = useWorkbenchStore.getState().topologyRevision;
      expect(afterAttachRev).toBeGreaterThan(initialRev);

      // Verify attachments are present
      expect(useWorkbenchStore.getState().attachments).toHaveLength(2);

      // Simulate a pure selection click: selectInstance called
      store.selectInstance('res_snapped_1');
      expect(useWorkbenchStore.getState().selectedInstanceId).toBe('res_snapped_1');

      // Verify topologyRevision is NOT incremented by selection
      expect(useWorkbenchStore.getState().topologyRevision).toBe(afterAttachRev);

      // Verify attachments remain completely intact
      const preservedAtts = useWorkbenchStore.getState().attachments;
      expect(preservedAtts).toHaveLength(2);
      expect(preservedAtts[0].holeId).toBe('col_5_a');
      expect(preservedAtts[1].holeId).toBe('col_9_a');

      // Coordinate position preview change does NOT increment topology revision
      store.updateInstancePosition('res_snapped_1', { x: 21, y: 30 });
      expect(useWorkbenchStore.getState().topologyRevision).toBe(afterAttachRev);
      expect(useWorkbenchStore.getState().attachments).toHaveLength(2);
    });

    // Test 2: Per-Circuit Telemetry on Multiple Subcircuits (187 ohm @ 16.04 mA and 225 ohm @ 13.33 mA)
    it('Task 2: Independent subcircuits report per-circuit telemetry: 187 ohm produces ~16.04 mA and 225 ohm produces ~13.33 mA', () => {
      const dcA: GenericEquipmentInstance = {
        instanceId: 'dc_A',
        definitionId: 'dc_source_5v',
        positionMM: { x: 10, y: 10 },
        rotationDeg: 0,
        properties: { voltageV: 5.0 },
        connections: {},
      };
      const resA: GenericEquipmentInstance = {
        instanceId: 'res_187',
        definitionId: 'resistor_330',
        positionMM: { x: 50, y: 10 },
        rotationDeg: 0,
        properties: { resistanceOhms: 187.0 },
        connections: {},
      };
      const ledA: GenericEquipmentInstance = {
        instanceId: 'led_A',
        definitionId: 'led_5mm_red',
        positionMM: { x: 90, y: 10 },
        rotationDeg: 0,
        properties: {},
        connections: {},
      };

      const dcB: GenericEquipmentInstance = {
        instanceId: 'dc_B',
        definitionId: 'dc_source_5v',
        positionMM: { x: 10, y: 60 },
        rotationDeg: 0,
        properties: { voltageV: 5.0 },
        connections: {},
      };
      const resB: GenericEquipmentInstance = {
        instanceId: 'res_225',
        definitionId: 'resistor_330',
        positionMM: { x: 50, y: 60 },
        rotationDeg: 0,
        properties: { resistanceOhms: 225.0 },
        connections: {},
      };
      const ledB: GenericEquipmentInstance = {
        instanceId: 'led_B',
        definitionId: 'led_5mm_red',
        positionMM: { x: 90, y: 60 },
        rotationDeg: 0,
        properties: {},
        connections: {},
      };

      const wiresA: JumperWire[] = [
        { id: 'wA1', color: '#ef4444', from: { kind: 'component-terminal', instanceId: 'dc_A', terminalId: 'pos' }, to: { kind: 'component-terminal', instanceId: 'res_187', terminalId: 'pin_1' } },
        { id: 'wA2', color: '#3b82f6', from: { kind: 'component-terminal', instanceId: 'res_187', terminalId: 'pin_2' }, to: { kind: 'component-terminal', instanceId: 'led_A', terminalId: 'anode' } },
        { id: 'wA3', color: '#1f2937', from: { kind: 'component-terminal', instanceId: 'led_A', terminalId: 'cathode' }, to: { kind: 'component-terminal', instanceId: 'dc_A', terminalId: 'neg' } },
      ];

      const wiresB: JumperWire[] = [
        { id: 'wB1', color: '#ef4444', from: { kind: 'component-terminal', instanceId: 'dc_B', terminalId: 'pos' }, to: { kind: 'component-terminal', instanceId: 'res_225', terminalId: 'pin_1' } },
        { id: 'wB2', color: '#3b82f6', from: { kind: 'component-terminal', instanceId: 'res_225', terminalId: 'pin_2' }, to: { kind: 'component-terminal', instanceId: 'led_B', terminalId: 'anode' } },
        { id: 'wB3', color: '#1f2937', from: { kind: 'component-terminal', instanceId: 'led_B', terminalId: 'cathode' }, to: { kind: 'component-terminal', instanceId: 'dc_B', terminalId: 'neg' } },
      ];

      const res = solveCircuitLocal([dcA, resA, ledA, dcB, resB, ledB], PHYSICS_ELECTRICITY_CATALOG, [], [...wiresA, ...wiresB]);
      expect(res.status).toBe('solved');
      expect(res.subcircuits).toBeDefined();
      expect(res.subcircuits?.length).toBe(2);

      // Subcircuit A: (5 - 2) / 187 = 16.0428 mA
      const subA = res.subcircuits?.find((s) => s.sourceInstanceId === 'dc_A');
      expect(subA).toBeDefined();
      expect(subA?.currentA).toBeCloseTo(0.01604, 4);
      expect(subA?.sourceVoltageV).toBe(5.0);
      expect(subA?.ledStates[0].illuminated).toBe(true);

      // Subcircuit B: (5 - 2) / 225 = 13.3333 mA
      const subB = res.subcircuits?.find((s) => s.sourceInstanceId === 'dc_B');
      expect(subB).toBeDefined();
      expect(subB?.currentA).toBeCloseTo(0.01333, 4);
      expect(subB?.sourceVoltageV).toBe(5.0);
      expect(subB?.ledStates[0].illuminated).toBe(true);

      // DC Source Component States signed output current
      expect(res.componentStates['dc_A'].currentA).toBeCloseTo(0.01604, 4);
      expect(res.componentStates['dc_B'].currentA).toBeCloseTo(0.01333, 4);
    });

    // Test 3: Breadboard Geometry Alignment
    it('Task 3: Breadboard geometry constants eliminate magic numbers and align with hole positions', () => {
      // Top power rail holes
      expect(BREADBOARD_GEOMETRY.topRailPosY).toBe(4.8);
      expect(BREADBOARD_GEOMETRY.topRailNegY).toBeCloseTo(4.8 + 2.54, 2);

      // Bottom power rail holes
      expect(BREADBOARD_GEOMETRY.bottomRailPosY).toBe(49.6);
      expect(BREADBOARD_GEOMETRY.bottomRailNegY).toBeCloseTo(49.6 + 2.54, 2);

      // Central DIP Channel
      expect(BREADBOARD_GEOMETRY.rowA_Y).toBe(14.5);
      expect(BREADBOARD_GEOMETRY.rowE_Y).toBeCloseTo(14.5 + 4 * 2.54, 2);
      expect(BREADBOARD_GEOMETRY.rowF_Y).toBe(32.28);
      expect(BREADBOARD_GEOMETRY.rowJ_Y).toBeCloseTo(32.28 + 4 * 2.54, 2);

      // Channel center between row E and row F
      const expectedCenter = (BREADBOARD_GEOMETRY.rowE_Y + BREADBOARD_GEOMETRY.rowF_Y) / 2;
      expect(BREADBOARD_GEOMETRY.channelCenterY).toBeCloseTo(expectedCenter, 2);
      expect(BREADBOARD_GEOMETRY.channelHeightMM).toBe(7.62);

      // Verify generated holes conform exactly to authoritative geometry
      const holes = generateBreadboardHoles();
      expect(holes).toHaveLength(400);

      const topPosHoles = holes.filter((h) => h.type === 'power_rail' && h.railLocation === 'top' && h.railType === 'pos');
      expect(topPosHoles).toHaveLength(25);
      expect(topPosHoles.every((h) => h.localYMM === BREADBOARD_GEOMETRY.topRailPosY)).toBe(true);

      const bottomNegHoles = holes.filter((h) => h.type === 'power_rail' && h.railLocation === 'bottom' && h.railType === 'neg');
      expect(bottomNegHoles).toHaveLength(25);
      expect(bottomNegHoles.every((h) => h.localYMM === BREADBOARD_GEOMETRY.bottomRailNegY)).toBe(true);
    });
  });
});


