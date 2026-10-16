/**
 * Milestone D.2 Reference Circuit Validation Tests — Frontend Offline Isomorphic Solver
 * Validates all 12 reference test cases and verifies Python/TypeScript solver parity.
 */

import { describe, it, expect } from 'vitest';
import { solveCircuitLocal } from '../dcSolverLocal';
import { PHYSICS_ELECTRICITY_CATALOG } from '../../../subjects/physics/equipmentCatalog';
import type { GenericEquipmentInstance } from '../../../types/workbench';
import type { JumperWire, TerminalAttachment } from '../../../types/connections';

describe('Milestone D.2 — Reference Circuit Validation Suite', () => {
  // Test 1 — Two resistors in series
  it('Test 1 — Two resistors in series (9V -> 100Ω -> 200Ω -> GND)', () => {
    const dc: GenericEquipmentInstance = {
      instanceId: 'dc_1',
      definitionId: 'dc_source_9v',
      positionMM: { x: 0, y: 0 },
      rotationDeg: 0,
      properties: { voltageV: 9.0 },
      connections: {},
    };
    const r1: GenericEquipmentInstance = {
      instanceId: 'r_100',
      definitionId: 'resistor_100',
      positionMM: { x: 40, y: 0 },
      rotationDeg: 0,
      properties: { resistanceOhms: 100.0 },
      connections: {},
    };
    const r2: GenericEquipmentInstance = {
      instanceId: 'r_200',
      definitionId: 'resistor_200',
      positionMM: { x: 80, y: 0 },
      rotationDeg: 0,
      properties: { resistanceOhms: 200.0 },
      connections: {},
    };
    const wires: JumperWire[] = [
      { id: 'w1', color: '#ef4444', from: { kind: 'component-terminal', instanceId: 'dc_1', terminalId: 'pos' }, to: { kind: 'component-terminal', instanceId: 'r_100', terminalId: 'pin_1' } },
      { id: 'w2', color: '#3b82f6', from: { kind: 'component-terminal', instanceId: 'r_100', terminalId: 'pin_2' }, to: { kind: 'component-terminal', instanceId: 'r_200', terminalId: 'pin_1' } },
      { id: 'w3', color: '#1f2937', from: { kind: 'component-terminal', instanceId: 'r_200', terminalId: 'pin_2' }, to: { kind: 'component-terminal', instanceId: 'dc_1', terminalId: 'neg' } },
    ];

    const res = solveCircuitLocal([dc, r1, r2], PHYSICS_ELECTRICITY_CATALOG, [], wires);
    expect(res.status).toBe('solved');
    expect(res.hasCurrentFlow).toBe(true);

    // Expected: Total R = 300Ω, I = 30 mA, 100Ω drop = 3V, 200Ω drop = 6V
    expect(res.componentStates['r_100'].currentA).toBeCloseTo(0.030, 4);
    expect(res.componentStates['r_100'].voltageDropV).toBeCloseTo(3.0, 2);
    expect(res.componentStates['r_200'].currentA).toBeCloseTo(0.030, 4);
    expect(res.componentStates['r_200'].voltageDropV).toBeCloseTo(6.0, 2);
    expect(res.componentStates['dc_1'].currentA).toBeCloseTo(0.030, 4);
    expect(res.subcircuits?.[0].currentA).toBeCloseTo(0.030, 4);
  });

  // Test 2 — Three resistors in series
  it('Test 2 — Three resistors in series (9V -> 10Ω -> 10Ω -> 330Ω -> GND)', () => {
    const dc: GenericEquipmentInstance = {
      instanceId: 'dc_1',
      definitionId: 'dc_source_9v',
      positionMM: { x: 0, y: 0 },
      rotationDeg: 0,
      properties: { voltageV: 9.0 },
      connections: {},
    };
    const r1: GenericEquipmentInstance = {
      instanceId: 'r1',
      definitionId: 'resistor_10',
      positionMM: { x: 40, y: 0 },
      rotationDeg: 0,
      properties: { resistanceOhms: 10.0 },
      connections: {},
    };
    const r2: GenericEquipmentInstance = {
      instanceId: 'r2',
      definitionId: 'resistor_10',
      positionMM: { x: 80, y: 0 },
      rotationDeg: 0,
      properties: { resistanceOhms: 10.0 },
      connections: {},
    };
    const r3: GenericEquipmentInstance = {
      instanceId: 'r3',
      definitionId: 'resistor_330',
      positionMM: { x: 120, y: 0 },
      rotationDeg: 0,
      properties: { resistanceOhms: 330.0 },
      connections: {},
    };
    const wires: JumperWire[] = [
      { id: 'w1', color: '#ef4444', from: { kind: 'component-terminal', instanceId: 'dc_1', terminalId: 'pos' }, to: { kind: 'component-terminal', instanceId: 'r1', terminalId: 'pin_1' } },
      { id: 'w2', color: '#3b82f6', from: { kind: 'component-terminal', instanceId: 'r1', terminalId: 'pin_2' }, to: { kind: 'component-terminal', instanceId: 'r2', terminalId: 'pin_1' } },
      { id: 'w3', color: '#10b981', from: { kind: 'component-terminal', instanceId: 'r2', terminalId: 'pin_2' }, to: { kind: 'component-terminal', instanceId: 'r3', terminalId: 'pin_1' } },
      { id: 'w4', color: '#1f2937', from: { kind: 'component-terminal', instanceId: 'r3', terminalId: 'pin_2' }, to: { kind: 'component-terminal', instanceId: 'dc_1', terminalId: 'neg' } },
    ];

    const res = solveCircuitLocal([dc, r1, r2, r3], PHYSICS_ELECTRICITY_CATALOG, [], wires);
    expect(res.status).toBe('solved');
    const expectedCurrent = 9.0 / 350.0; // ~25.714 mA
    expect(res.componentStates['r1'].currentA).toBeCloseTo(expectedCurrent, 4);
    expect(res.componentStates['r2'].currentA).toBeCloseTo(expectedCurrent, 4);
    expect(res.componentStates['r3'].currentA).toBeCloseTo(expectedCurrent, 4);
    expect(res.componentStates['dc_1'].currentA).toBeCloseTo(expectedCurrent, 4);
  });

  // Test 3 — Two LEDs in series
  it('Test 3 — Two LEDs in series (9V -> 330Ω -> LED 1 -> LED 2 -> GND)', () => {
    const dc: GenericEquipmentInstance = {
      instanceId: 'dc_1',
      definitionId: 'dc_source_9v',
      positionMM: { x: 0, y: 0 },
      rotationDeg: 0,
      properties: { voltageV: 9.0 },
      connections: {},
    };
    const r1: GenericEquipmentInstance = {
      instanceId: 'r1',
      definitionId: 'resistor_330',
      positionMM: { x: 40, y: 0 },
      rotationDeg: 0,
      properties: { resistanceOhms: 330.0 },
      connections: {},
    };
    const led1: GenericEquipmentInstance = {
      instanceId: 'led1',
      definitionId: 'led_5mm_red',
      positionMM: { x: 80, y: 0 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };
    const led2: GenericEquipmentInstance = {
      instanceId: 'led2',
      definitionId: 'led_5mm_red',
      positionMM: { x: 120, y: 0 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };
    const wires: JumperWire[] = [
      { id: 'w1', color: '#ef4444', from: { kind: 'component-terminal', instanceId: 'dc_1', terminalId: 'pos' }, to: { kind: 'component-terminal', instanceId: 'r1', terminalId: 'pin_1' } },
      { id: 'w2', color: '#3b82f6', from: { kind: 'component-terminal', instanceId: 'r1', terminalId: 'pin_2' }, to: { kind: 'component-terminal', instanceId: 'led1', terminalId: 'anode' } },
      { id: 'w3', color: '#10b981', from: { kind: 'component-terminal', instanceId: 'led1', terminalId: 'cathode' }, to: { kind: 'component-terminal', instanceId: 'led2', terminalId: 'anode' } },
      { id: 'w4', color: '#1f2937', from: { kind: 'component-terminal', instanceId: 'led2', terminalId: 'cathode' }, to: { kind: 'component-terminal', instanceId: 'dc_1', terminalId: 'neg' } },
    ];

    const res = solveCircuitLocal([dc, r1, led1, led2], PHYSICS_ELECTRICITY_CATALOG, [], wires);
    expect(res.status).toBe('solved');
    const expectedCurrent = (9.0 - 4.0) / 330.0; // ~15.152 mA
    expect(res.componentStates['led1'].currentA).toBeCloseTo(expectedCurrent, 4);
    expect(res.componentStates['led2'].currentA).toBeCloseTo(expectedCurrent, 4);
    expect(res.componentStates['led1'].conducting).toBe(true);
    expect(res.componentStates['led2'].conducting).toBe(true);
    expect(res.componentStates['led1'].brightness).toBeGreaterThan(0.5);
    expect(res.componentStates['led2'].brightness).toBeGreaterThan(0.5);
    expect(res.componentStates['r1'].voltageDropV).toBeCloseTo(expectedCurrent * 330.0, 2);
  });

  // Test 4 — Three resistors and two LEDs
  it('Test 4 — Three resistors and two LEDs (9V -> 10Ω -> 10Ω -> 330Ω -> LED 1 -> LED 2 -> GND)', () => {
    const dc: GenericEquipmentInstance = {
      instanceId: 'dc_1',
      definitionId: 'dc_source_9v',
      positionMM: { x: 0, y: 0 },
      rotationDeg: 0,
      properties: { voltageV: 9.0 },
      connections: {},
    };
    const r1: GenericEquipmentInstance = {
      instanceId: 'r1',
      definitionId: 'resistor_10',
      positionMM: { x: 40, y: 0 },
      rotationDeg: 0,
      properties: { resistanceOhms: 10.0 },
      connections: {},
    };
    const r2: GenericEquipmentInstance = {
      instanceId: 'r2',
      definitionId: 'resistor_10',
      positionMM: { x: 80, y: 0 },
      rotationDeg: 0,
      properties: { resistanceOhms: 10.0 },
      connections: {},
    };
    const r3: GenericEquipmentInstance = {
      instanceId: 'r3',
      definitionId: 'resistor_330',
      positionMM: { x: 120, y: 0 },
      rotationDeg: 0,
      properties: { resistanceOhms: 330.0 },
      connections: {},
    };
    const led1: GenericEquipmentInstance = {
      instanceId: 'led1',
      definitionId: 'led_5mm_red',
      positionMM: { x: 160, y: 0 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };
    const led2: GenericEquipmentInstance = {
      instanceId: 'led2',
      definitionId: 'led_5mm_red',
      positionMM: { x: 200, y: 0 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };
    const wires: JumperWire[] = [
      { id: 'w1', color: '#ef4444', from: { kind: 'component-terminal', instanceId: 'dc_1', terminalId: 'pos' }, to: { kind: 'component-terminal', instanceId: 'r1', terminalId: 'pin_1' } },
      { id: 'w2', color: '#3b82f6', from: { kind: 'component-terminal', instanceId: 'r1', terminalId: 'pin_2' }, to: { kind: 'component-terminal', instanceId: 'r2', terminalId: 'pin_1' } },
      { id: 'w3', color: '#10b981', from: { kind: 'component-terminal', instanceId: 'r2', terminalId: 'pin_2' }, to: { kind: 'component-terminal', instanceId: 'r3', terminalId: 'pin_1' } },
      { id: 'w4', color: '#f59e0b', from: { kind: 'component-terminal', instanceId: 'r3', terminalId: 'pin_2' }, to: { kind: 'component-terminal', instanceId: 'led1', terminalId: 'anode' } },
      { id: 'w5', color: '#8b5cf6', from: { kind: 'component-terminal', instanceId: 'led1', terminalId: 'cathode' }, to: { kind: 'component-terminal', instanceId: 'led2', terminalId: 'anode' } },
      { id: 'w6', color: '#1f2937', from: { kind: 'component-terminal', instanceId: 'led2', terminalId: 'cathode' }, to: { kind: 'component-terminal', instanceId: 'dc_1', terminalId: 'neg' } },
    ];

    const res = solveCircuitLocal([dc, r1, r2, r3, led1, led2], PHYSICS_ELECTRICITY_CATALOG, [], wires);
    expect(res.status).toBe('solved');
    const expectedCurrent = (9.0 - 4.0) / 350.0; // ~14.286 mA
    expect(res.componentStates['r1'].currentA).toBeCloseTo(expectedCurrent, 4);
    expect(res.componentStates['r1'].voltageDropV).toBeCloseTo(expectedCurrent * 10.0, 3);
    expect(res.componentStates['r2'].voltageDropV).toBeCloseTo(expectedCurrent * 10.0, 3);
    expect(res.componentStates['r3'].voltageDropV).toBeCloseTo(expectedCurrent * 330.0, 3);
    expect(res.componentStates['led1'].conducting).toBe(true);
    expect(res.componentStates['led2'].conducting).toBe(true);
  });

  // Test 5 — Parallel resistors
  it('Test 5 — Parallel resistors (9V across parallel 100Ω and 200Ω)', () => {
    const dc: GenericEquipmentInstance = {
      instanceId: 'dc_1',
      definitionId: 'dc_source_9v',
      positionMM: { x: 0, y: 0 },
      rotationDeg: 0,
      properties: { voltageV: 9.0 },
      connections: {},
    };
    const r1: GenericEquipmentInstance = {
      instanceId: 'r1',
      definitionId: 'resistor_100',
      positionMM: { x: 40, y: 0 },
      rotationDeg: 0,
      properties: { resistanceOhms: 100.0 },
      connections: {},
    };
    const r2: GenericEquipmentInstance = {
      instanceId: 'r2',
      definitionId: 'resistor_200',
      positionMM: { x: 40, y: 40 },
      rotationDeg: 0,
      properties: { resistanceOhms: 200.0 },
      connections: {},
    };
    const wires: JumperWire[] = [
      { id: 'w1', color: '#ef4444', from: { kind: 'component-terminal', instanceId: 'dc_1', terminalId: 'pos' }, to: { kind: 'component-terminal', instanceId: 'r1', terminalId: 'pin_1' } },
      { id: 'w2', color: '#ef4444', from: { kind: 'component-terminal', instanceId: 'dc_1', terminalId: 'pos' }, to: { kind: 'component-terminal', instanceId: 'r2', terminalId: 'pin_1' } },
      { id: 'w3', color: '#1f2937', from: { kind: 'component-terminal', instanceId: 'r1', terminalId: 'pin_2' }, to: { kind: 'component-terminal', instanceId: 'dc_1', terminalId: 'neg' } },
      { id: 'w4', color: '#1f2937', from: { kind: 'component-terminal', instanceId: 'r2', terminalId: 'pin_2' }, to: { kind: 'component-terminal', instanceId: 'dc_1', terminalId: 'neg' } },
    ];

    const res = solveCircuitLocal([dc, r1, r2], PHYSICS_ELECTRICITY_CATALOG, [], wires);
    expect(res.status).toBe('solved');
    expect(res.componentStates['r1'].currentA).toBeCloseTo(0.090, 4);
    expect(res.componentStates['r2'].currentA).toBeCloseTo(0.045, 4);
    expect(res.componentStates['dc_1'].currentA).toBeCloseTo(0.135, 4);
    expect(res.subcircuits?.[0].currentA).toBeCloseTo(0.135, 4);
  });

  // Test 6 — Two parallel LED branches
  it('Test 6 — Two parallel LED branches (9V feeding two branches with 330Ω + LED)', () => {
    const dc: GenericEquipmentInstance = {
      instanceId: 'dc_1',
      definitionId: 'dc_source_9v',
      positionMM: { x: 0, y: 0 },
      rotationDeg: 0,
      properties: { voltageV: 9.0 },
      connections: {},
    };
    const rA: GenericEquipmentInstance = {
      instanceId: 'rA',
      definitionId: 'resistor_330',
      positionMM: { x: 40, y: 0 },
      rotationDeg: 0,
      properties: { resistanceOhms: 330.0 },
      connections: {},
    };
    const ledA: GenericEquipmentInstance = {
      instanceId: 'ledA',
      definitionId: 'led_5mm_red',
      positionMM: { x: 80, y: 0 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };
    const rB: GenericEquipmentInstance = {
      instanceId: 'rB',
      definitionId: 'resistor_330',
      positionMM: { x: 40, y: 40 },
      rotationDeg: 0,
      properties: { resistanceOhms: 330.0 },
      connections: {},
    };
    const ledB: GenericEquipmentInstance = {
      instanceId: 'ledB',
      definitionId: 'led_5mm_red',
      positionMM: { x: 80, y: 40 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };
    const wires: JumperWire[] = [
      // Branch A
      { id: 'wA1', color: '#ef4444', from: { kind: 'component-terminal', instanceId: 'dc_1', terminalId: 'pos' }, to: { kind: 'component-terminal', instanceId: 'rA', terminalId: 'pin_1' } },
      { id: 'wA2', color: '#3b82f6', from: { kind: 'component-terminal', instanceId: 'rA', terminalId: 'pin_2' }, to: { kind: 'component-terminal', instanceId: 'ledA', terminalId: 'anode' } },
      { id: 'wA3', color: '#1f2937', from: { kind: 'component-terminal', instanceId: 'ledA', terminalId: 'cathode' }, to: { kind: 'component-terminal', instanceId: 'dc_1', terminalId: 'neg' } },
      // Branch B
      { id: 'wB1', color: '#ef4444', from: { kind: 'component-terminal', instanceId: 'dc_1', terminalId: 'pos' }, to: { kind: 'component-terminal', instanceId: 'rB', terminalId: 'pin_1' } },
      { id: 'wB2', color: '#3b82f6', from: { kind: 'component-terminal', instanceId: 'rB', terminalId: 'pin_2' }, to: { kind: 'component-terminal', instanceId: 'ledB', terminalId: 'anode' } },
      { id: 'wB3', color: '#1f2937', from: { kind: 'component-terminal', instanceId: 'ledB', terminalId: 'cathode' }, to: { kind: 'component-terminal', instanceId: 'dc_1', terminalId: 'neg' } },
    ];

    const res = solveCircuitLocal([dc, rA, ledA, rB, ledB], PHYSICS_ELECTRICITY_CATALOG, [], wires);
    expect(res.status).toBe('solved');
    const expectedBranch = (9.0 - 2.0) / 330.0; // ~21.212 mA
    expect(res.componentStates['ledA'].currentA).toBeCloseTo(expectedBranch, 4);
    expect(res.componentStates['ledB'].currentA).toBeCloseTo(expectedBranch, 4);
    expect(res.componentStates['dc_1'].currentA).toBeCloseTo(2 * expectedBranch, 4);
    expect(res.componentStates['ledA'].conducting).toBe(true);
    expect(res.componentStates['ledB'].conducting).toBe(true);
  });

  // Test 7 — Reversed series LED
  it('Test 7 — Reversed series LED in two-LED series chain', () => {
    const dc: GenericEquipmentInstance = {
      instanceId: 'dc_1',
      definitionId: 'dc_source_9v',
      positionMM: { x: 0, y: 0 },
      rotationDeg: 0,
      properties: { voltageV: 9.0 },
      connections: {},
    };
    const r1: GenericEquipmentInstance = {
      instanceId: 'r1',
      definitionId: 'resistor_330',
      positionMM: { x: 40, y: 0 },
      rotationDeg: 0,
      properties: { resistanceOhms: 330.0 },
      connections: {},
    };
    const led1: GenericEquipmentInstance = {
      instanceId: 'led1',
      definitionId: 'led_5mm_red',
      positionMM: { x: 80, y: 0 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };
    const led2: GenericEquipmentInstance = {
      instanceId: 'led2',
      definitionId: 'led_5mm_red',
      positionMM: { x: 120, y: 0 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };
    const wires: JumperWire[] = [
      { id: 'w1', color: '#ef4444', from: { kind: 'component-terminal', instanceId: 'dc_1', terminalId: 'pos' }, to: { kind: 'component-terminal', instanceId: 'r1', terminalId: 'pin_1' } },
      { id: 'w2', color: '#3b82f6', from: { kind: 'component-terminal', instanceId: 'r1', terminalId: 'pin_2' }, to: { kind: 'component-terminal', instanceId: 'led1', terminalId: 'anode' } },
      // led2 reversed: cathode connected towards anode
      { id: 'w3', color: '#10b981', from: { kind: 'component-terminal', instanceId: 'led1', terminalId: 'cathode' }, to: { kind: 'component-terminal', instanceId: 'led2', terminalId: 'cathode' } },
      { id: 'w4', color: '#1f2937', from: { kind: 'component-terminal', instanceId: 'led2', terminalId: 'anode' }, to: { kind: 'component-terminal', instanceId: 'dc_1', terminalId: 'neg' } },
    ];

    const res = solveCircuitLocal([dc, r1, led1, led2], PHYSICS_ELECTRICITY_CATALOG, [], wires);
    expect(res.hasCurrentFlow).toBe(false);
    expect(res.componentStates['led1'].conducting).toBe(false);
    expect(res.componentStates['led2'].conducting).toBe(false);
    expect(res.componentStates['led1'].currentA).toBe(0.0);
    expect(res.componentStates['led2'].currentA).toBe(0.0);
    expect(res.faults.some((f) => f.type === 'REVERSED_LED' && f.affectedComponentId === 'led2')).toBe(true);
  });

  // Test 8 — Insufficient supply voltage
  it('Test 8 — Insufficient supply voltage (3V source with two series LEDs needing 4V)', () => {
    const dc: GenericEquipmentInstance = {
      instanceId: 'dc_1',
      definitionId: 'dc_source_3v',
      positionMM: { x: 0, y: 0 },
      rotationDeg: 0,
      properties: { voltageV: 3.0 },
      connections: {},
    };
    const r1: GenericEquipmentInstance = {
      instanceId: 'r1',
      definitionId: 'resistor_330',
      positionMM: { x: 40, y: 0 },
      rotationDeg: 0,
      properties: { resistanceOhms: 330.0 },
      connections: {},
    };
    const led1: GenericEquipmentInstance = {
      instanceId: 'led1',
      definitionId: 'led_5mm_red',
      positionMM: { x: 80, y: 0 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };
    const led2: GenericEquipmentInstance = {
      instanceId: 'led2',
      definitionId: 'led_5mm_red',
      positionMM: { x: 120, y: 0 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };
    const wires: JumperWire[] = [
      { id: 'w1', color: '#ef4444', from: { kind: 'component-terminal', instanceId: 'dc_1', terminalId: 'pos' }, to: { kind: 'component-terminal', instanceId: 'r1', terminalId: 'pin_1' } },
      { id: 'w2', color: '#3b82f6', from: { kind: 'component-terminal', instanceId: 'r1', terminalId: 'pin_2' }, to: { kind: 'component-terminal', instanceId: 'led1', terminalId: 'anode' } },
      { id: 'w3', color: '#10b981', from: { kind: 'component-terminal', instanceId: 'led1', terminalId: 'cathode' }, to: { kind: 'component-terminal', instanceId: 'led2', terminalId: 'anode' } },
      { id: 'w4', color: '#1f2937', from: { kind: 'component-terminal', instanceId: 'led2', terminalId: 'cathode' }, to: { kind: 'component-terminal', instanceId: 'dc_1', terminalId: 'neg' } },
    ];

    const res = solveCircuitLocal([dc, r1, led1, led2], PHYSICS_ELECTRICITY_CATALOG, [], wires);
    expect(res.hasCurrentFlow).toBe(false);
    expect(res.componentStates['led1'].conducting).toBe(false);
    expect(res.componentStates['led2'].conducting).toBe(false);
    expect(res.componentStates['led1'].currentA).toBe(0.0);
    expect(res.componentStates['led2'].currentA).toBe(0.0);
    expect(res.componentStates['dc_1'].currentA).toBe(0.0);
  });

  // Test 9 — Multiple independent networks
  it('Test 9 — Multiple independent networks on separate breadboards', () => {
    // Network A: 9V, 3 resistors (10, 10, 330), 2 LEDs
    const dcA: GenericEquipmentInstance = { instanceId: 'dc_A', definitionId: 'dc_source_9v', positionMM: { x: 0, y: 0 }, rotationDeg: 0, properties: { voltageV: 9.0 }, connections: {} };
    const rA1: GenericEquipmentInstance = { instanceId: 'rA1', definitionId: 'resistor_10', positionMM: { x: 40, y: 0 }, rotationDeg: 0, properties: { resistanceOhms: 10.0 }, connections: {} };
    const rA2: GenericEquipmentInstance = { instanceId: 'rA2', definitionId: 'resistor_10', positionMM: { x: 80, y: 0 }, rotationDeg: 0, properties: { resistanceOhms: 10.0 }, connections: {} };
    const rA3: GenericEquipmentInstance = { instanceId: 'rA3', definitionId: 'resistor_330', positionMM: { x: 120, y: 0 }, rotationDeg: 0, properties: { resistanceOhms: 330.0 }, connections: {} };
    const ledA1: GenericEquipmentInstance = { instanceId: 'ledA1', definitionId: 'led_5mm_red', positionMM: { x: 160, y: 0 }, rotationDeg: 0, properties: {}, connections: {} };
    const ledA2: GenericEquipmentInstance = { instanceId: 'ledA2', definitionId: 'led_5mm_red', positionMM: { x: 200, y: 0 }, rotationDeg: 0, properties: {}, connections: {} };

    // Network B: 5V, 330Ω, 1 LED
    const dcB: GenericEquipmentInstance = { instanceId: 'dc_B', definitionId: 'dc_source_5v', positionMM: { x: 0, y: 100 }, rotationDeg: 0, properties: { voltageV: 5.0 }, connections: {} };
    const rB1: GenericEquipmentInstance = { instanceId: 'rB1', definitionId: 'resistor_330', positionMM: { x: 40, y: 100 }, rotationDeg: 0, properties: { resistanceOhms: 330.0 }, connections: {} };
    const ledB1: GenericEquipmentInstance = { instanceId: 'ledB1', definitionId: 'led_5mm_red', positionMM: { x: 80, y: 100 }, rotationDeg: 0, properties: {}, connections: {} };

    const wiresA: JumperWire[] = [
      { id: 'wA1', color: '#ef4444', from: { kind: 'component-terminal', instanceId: 'dc_A', terminalId: 'pos' }, to: { kind: 'component-terminal', instanceId: 'rA1', terminalId: 'pin_1' } },
      { id: 'wA2', color: '#3b82f6', from: { kind: 'component-terminal', instanceId: 'rA1', terminalId: 'pin_2' }, to: { kind: 'component-terminal', instanceId: 'rA2', terminalId: 'pin_1' } },
      { id: 'wA3', color: '#10b981', from: { kind: 'component-terminal', instanceId: 'rA2', terminalId: 'pin_2' }, to: { kind: 'component-terminal', instanceId: 'rA3', terminalId: 'pin_1' } },
      { id: 'wA4', color: '#f59e0b', from: { kind: 'component-terminal', instanceId: 'rA3', terminalId: 'pin_2' }, to: { kind: 'component-terminal', instanceId: 'ledA1', terminalId: 'anode' } },
      { id: 'wA5', color: '#8b5cf6', from: { kind: 'component-terminal', instanceId: 'ledA1', terminalId: 'cathode' }, to: { kind: 'component-terminal', instanceId: 'ledA2', terminalId: 'anode' } },
      { id: 'wA6', color: '#1f2937', from: { kind: 'component-terminal', instanceId: 'ledA2', terminalId: 'cathode' }, to: { kind: 'component-terminal', instanceId: 'dc_A', terminalId: 'neg' } },
    ];

    const wiresB: JumperWire[] = [
      { id: 'wB1', color: '#ef4444', from: { kind: 'component-terminal', instanceId: 'dc_B', terminalId: 'pos' }, to: { kind: 'component-terminal', instanceId: 'rB1', terminalId: 'pin_1' } },
      { id: 'wB2', color: '#3b82f6', from: { kind: 'component-terminal', instanceId: 'rB1', terminalId: 'pin_2' }, to: { kind: 'component-terminal', instanceId: 'ledB1', terminalId: 'anode' } },
      { id: 'wB3', color: '#1f2937', from: { kind: 'component-terminal', instanceId: 'ledB1', terminalId: 'cathode' }, to: { kind: 'component-terminal', instanceId: 'dc_B', terminalId: 'neg' } },
    ];

    const res = solveCircuitLocal([dcA, rA1, rA2, rA3, ledA1, ledA2, dcB, rB1, ledB1], PHYSICS_ELECTRICITY_CATALOG, [], [...wiresA, ...wiresB]);
    expect(res.status).toBe('solved');
    expect(res.subcircuits).toHaveLength(2);

    const expected_iA = (9.0 - 4.0) / 350.0;
    const expected_iB = (5.0 - 2.0) / 330.0;
    expect(res.componentStates['dc_A'].currentA).toBeCloseTo(expected_iA, 4);
    expect(res.componentStates['dc_B'].currentA).toBeCloseTo(expected_iB, 4);
    expect(res.componentStates['ledA1'].conducting).toBe(true);
    expect(res.componentStates['ledA2'].conducting).toBe(true);
    expect(res.componentStates['ledB1'].conducting).toBe(true);
  });

  // Test 10 — Shared-node branching (KCL verification)
  it('Test 10 — Shared-node branching with Kirchhoff Current Law (KCL) verification', () => {
    const dc: GenericEquipmentInstance = { instanceId: 'dc_1', definitionId: 'dc_source_9v', positionMM: { x: 0, y: 0 }, rotationDeg: 0, properties: { voltageV: 9.0 }, connections: {} };
    const r1: GenericEquipmentInstance = { instanceId: 'r1', definitionId: 'resistor_100', positionMM: { x: 40, y: 0 }, rotationDeg: 0, properties: { resistanceOhms: 100.0 }, connections: {} };
    const r2: GenericEquipmentInstance = { instanceId: 'r2', definitionId: 'resistor_200', positionMM: { x: 80, y: 0 }, rotationDeg: 0, properties: { resistanceOhms: 200.0 }, connections: {} };
    const r3: GenericEquipmentInstance = { instanceId: 'r3', definitionId: 'resistor_300', positionMM: { x: 80, y: 40 }, rotationDeg: 0, properties: { resistanceOhms: 300.0 }, connections: {} };

    const wires: JumperWire[] = [
      { id: 'w1', color: '#ef4444', from: { kind: 'component-terminal', instanceId: 'dc_1', terminalId: 'pos' }, to: { kind: 'component-terminal', instanceId: 'r1', terminalId: 'pin_1' } },
      // Branching node
      { id: 'w2', color: '#3b82f6', from: { kind: 'component-terminal', instanceId: 'r1', terminalId: 'pin_2' }, to: { kind: 'component-terminal', instanceId: 'r2', terminalId: 'pin_1' } },
      { id: 'w3', color: '#3b82f6', from: { kind: 'component-terminal', instanceId: 'r1', terminalId: 'pin_2' }, to: { kind: 'component-terminal', instanceId: 'r3', terminalId: 'pin_1' } },
      // Returns
      { id: 'w4', color: '#1f2937', from: { kind: 'component-terminal', instanceId: 'r2', terminalId: 'pin_2' }, to: { kind: 'component-terminal', instanceId: 'dc_1', terminalId: 'neg' } },
      { id: 'w5', color: '#1f2937', from: { kind: 'component-terminal', instanceId: 'r3', terminalId: 'pin_2' }, to: { kind: 'component-terminal', instanceId: 'dc_1', terminalId: 'neg' } },
    ];

    const res = solveCircuitLocal([dc, r1, r2, r3], PHYSICS_ELECTRICITY_CATALOG, [], wires);
    expect(res.status).toBe('solved');

    const i_in = res.componentStates['r1'].currentA;
    const i_b1 = res.componentStates['r2'].currentA;
    const i_b2 = res.componentStates['r3'].currentA;

    // Verify KCL: I_in = I_branch1 + I_branch2
    expect(i_in).toBeCloseTo(i_b1 + i_b2, 5);
    expect(i_in).toBeCloseTo(9.0 / 220.0, 4);
  });

  // Test 11 — Multiple sources in one network & contradictory sources
  it('Test 11 — Multiple sources in one network and contradictory voltage sources', () => {
    // Case A: Series-aiding 5V and 4V feeding 300Ω resistor -> 30 mA
    const dc1: GenericEquipmentInstance = { instanceId: 'dc_1', definitionId: 'dc_source_5v', positionMM: { x: 0, y: 0 }, rotationDeg: 0, properties: { voltageV: 5.0 }, connections: {} };
    const dc2: GenericEquipmentInstance = { instanceId: 'dc_2', definitionId: 'dc_source_4v', positionMM: { x: 40, y: 0 }, rotationDeg: 0, properties: { voltageV: 4.0 }, connections: {} };
    const r1: GenericEquipmentInstance = { instanceId: 'r1', definitionId: 'resistor_300', positionMM: { x: 80, y: 0 }, rotationDeg: 0, properties: { resistanceOhms: 300.0 }, connections: {} };

    const wiresA: JumperWire[] = [
      { id: 'w1', color: '#ef4444', from: { kind: 'component-terminal', instanceId: 'dc_1', terminalId: 'pos' }, to: { kind: 'component-terminal', instanceId: 'dc_2', terminalId: 'neg' } },
      { id: 'w2', color: '#3b82f6', from: { kind: 'component-terminal', instanceId: 'dc_2', terminalId: 'pos' }, to: { kind: 'component-terminal', instanceId: 'r1', terminalId: 'pin_1' } },
      { id: 'w3', color: '#1f2937', from: { kind: 'component-terminal', instanceId: 'r1', terminalId: 'pin_2' }, to: { kind: 'component-terminal', instanceId: 'dc_1', terminalId: 'neg' } },
    ];

    const resA = solveCircuitLocal([dc1, dc2, r1], PHYSICS_ELECTRICITY_CATALOG, [], wiresA);
    expect(resA.status).toBe('solved');
    expect(resA.componentStates['r1'].currentA).toBeCloseTo(0.030, 4);
    expect(resA.componentStates['dc_1'].currentA).toBeCloseTo(0.030, 4);
    expect(resA.componentStates['dc_2'].currentA).toBeCloseTo(0.030, 4);

    // Case B: Contradictory sources in parallel
    const wiresB: JumperWire[] = [
      { id: 'w1', color: '#ef4444', from: { kind: 'component-terminal', instanceId: 'dc_1', terminalId: 'pos' }, to: { kind: 'component-terminal', instanceId: 'dc_2', terminalId: 'pos' } },
      { id: 'w2', color: '#1f2937', from: { kind: 'component-terminal', instanceId: 'dc_1', terminalId: 'neg' }, to: { kind: 'component-terminal', instanceId: 'dc_2', terminalId: 'neg' } },
    ];
    const resB = solveCircuitLocal([dc1, dc2], PHYSICS_ELECTRICITY_CATALOG, [], wiresB);
    expect(resB.status).toBe('fault');
    expect(resB.faults.some((f) => f.type === 'CONTRADICTORY_SOURCES')).toBe(true);
  });

  // Test 12 — Breadboard-based equivalents
  it('Test 12 — Breadboard-based equivalent of series LEDs and parallel resistors', () => {
    const bb: GenericEquipmentInstance = { instanceId: 'bb_1', definitionId: 'breadboard_400', positionMM: { x: 0, y: 0 }, rotationDeg: 0, properties: {}, connections: {} };
    const dc: GenericEquipmentInstance = { instanceId: 'dc_1', definitionId: 'dc_source_9v', positionMM: { x: 0, y: 100 }, rotationDeg: 0, properties: { voltageV: 9.0 }, connections: {} };
    const r1: GenericEquipmentInstance = { instanceId: 'r1', definitionId: 'resistor_330', positionMM: { x: 20, y: 20 }, rotationDeg: 0, properties: { resistanceOhms: 330.0 }, connections: {} };
    const led1: GenericEquipmentInstance = { instanceId: 'led1', definitionId: 'led_5mm_red', positionMM: { x: 40, y: 20 }, rotationDeg: 0, properties: {}, connections: {} };
    const led2: GenericEquipmentInstance = { instanceId: 'led2', definitionId: 'led_5mm_red', positionMM: { x: 60, y: 20 }, rotationDeg: 0, properties: {}, connections: {} };

    const atts: TerminalAttachment[] = [
      { instanceId: 'r1', terminalId: 'pin_1', breadboardInstanceId: 'bb_1', holeId: 'col_5_a' },
      { instanceId: 'r1', terminalId: 'pin_2', breadboardInstanceId: 'bb_1', holeId: 'col_9_a' },
      { instanceId: 'led1', terminalId: 'anode', breadboardInstanceId: 'bb_1', holeId: 'col_9_b' },
      { instanceId: 'led1', terminalId: 'cathode', breadboardInstanceId: 'bb_1', holeId: 'col_13_b' },
      { instanceId: 'led2', terminalId: 'anode', breadboardInstanceId: 'bb_1', holeId: 'col_13_c' },
      { instanceId: 'led2', terminalId: 'cathode', breadboardInstanceId: 'bb_1', holeId: 'col_17_c' },
    ];

    const wires: JumperWire[] = [
      { id: 'w_in', color: '#ef4444', from: { kind: 'component-terminal', instanceId: 'dc_1', terminalId: 'pos' }, to: { kind: 'breadboard-hole', breadboardInstanceId: 'bb_1', holeId: 'col_5_b' } },
      { id: 'w_out', color: '#1f2937', from: { kind: 'breadboard-hole', breadboardInstanceId: 'bb_1', holeId: 'col_17_b' }, to: { kind: 'component-terminal', instanceId: 'dc_1', terminalId: 'neg' } },
    ];

    const res = solveCircuitLocal([bb, dc, r1, led1, led2], PHYSICS_ELECTRICITY_CATALOG, atts, wires);
    expect(res.status).toBe('solved');
    const expectedCurrent = (9.0 - 4.0) / 330.0;
    expect(res.componentStates['led1'].currentA).toBeCloseTo(expectedCurrent, 4);
    expect(res.componentStates['led2'].currentA).toBeCloseTo(expectedCurrent, 4);
    expect(res.componentStates['led1'].conducting).toBe(true);
    expect(res.componentStates['led2'].conducting).toBe(true);

    const stripFlows = res.conductorFlows?.filter((f) => f.type === 'breadboard-strip');
    expect(stripFlows && stripFlows.length).toBeGreaterThan(0);
  });
});
