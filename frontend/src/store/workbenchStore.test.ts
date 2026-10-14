import { describe, it, expect, beforeEach } from 'vitest';
import { useWorkbenchStore } from './useWorkbenchStore';
import type { GenericEquipmentInstance } from '../types/workbench';

describe('Workbench Store Instance Independence', () => {
  beforeEach(() => {
    useWorkbenchStore.getState().clearWorkbench();
  });

  it('manages multiple equipment instances independently', () => {
    const store = useWorkbenchStore.getState();

    const resistorA: GenericEquipmentInstance = {
      instanceId: 'resistor_instance_a',
      definitionId: 'resistor_330',
      positionMM: { x: 50, y: 50 },
      rotationDeg: 0,
      properties: { resistanceOhms: 330 },
      connections: {},
    };

    const resistorB: GenericEquipmentInstance = {
      instanceId: 'resistor_instance_b',
      definitionId: 'resistor_330',
      positionMM: { x: 80, y: 80 },
      rotationDeg: 0,
      properties: { resistanceOhms: 330 },
      connections: {},
    };

    // Add both instances
    store.addInstance(resistorA);
    store.addInstance(resistorB);

    let state = useWorkbenchStore.getState();
    expect(state.instances).toHaveLength(2);
    expect(state.instances[0].instanceId).toBe('resistor_instance_a');
    expect(state.instances[1].instanceId).toBe('resistor_instance_b');

    // Move resistor A only
    store.updateInstancePosition('resistor_instance_a', { x: 120, y: 150 });

    state = useWorkbenchStore.getState();
    const updatedA = state.instances.find((i) => i.instanceId === 'resistor_instance_a');
    const updatedB = state.instances.find((i) => i.instanceId === 'resistor_instance_b');

    // Resistor A moved to new position
    expect(updatedA?.positionMM).toEqual({ x: 120, y: 150 });

    // Resistor B MUST remain stationary at (80, 80)
    expect(updatedB?.positionMM).toEqual({ x: 80, y: 80 });
  });

  it('rotates only the targeted component without altering other components', () => {
    const store = useWorkbenchStore.getState();

    const ledInst: GenericEquipmentInstance = {
      instanceId: 'led_1',
      definitionId: 'led_5mm_red',
      positionMM: { x: 30, y: 40 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };

    const batteryInst: GenericEquipmentInstance = {
      instanceId: 'battery_1',
      definitionId: 'dc_source_5v',
      positionMM: { x: 10, y: 10 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };

    store.addInstance(ledInst);
    store.addInstance(batteryInst);

    // Rotate LED by 90 degrees
    store.updateInstanceRotation('led_1', 90);

    const state = useWorkbenchStore.getState();
    const led = state.instances.find((i) => i.instanceId === 'led_1');
    const battery = state.instances.find((i) => i.instanceId === 'battery_1');

    expect(led?.rotationDeg).toBe(90);
    expect(battery?.rotationDeg).toBe(0);
  });

  it('maintains independent selection state and allows deselecting to null', () => {
    const store = useWorkbenchStore.getState();

    store.selectInstance('resistor_instance_a');
    expect(useWorkbenchStore.getState().selectedInstanceId).toBe('resistor_instance_a');
    expect(useWorkbenchStore.getState().isInspectorOpen).toBe(true);

    // Deselect
    store.selectInstance(null);
    expect(useWorkbenchStore.getState().selectedInstanceId).toBeNull();
  });

  it('deletes one selected component without affecting remaining components', () => {
    const store = useWorkbenchStore.getState();

    const inst1: GenericEquipmentInstance = {
      instanceId: 'item_1',
      definitionId: 'resistor_330',
      positionMM: { x: 10, y: 10 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };
    const inst2: GenericEquipmentInstance = {
      instanceId: 'item_2',
      definitionId: 'resistor_330',
      positionMM: { x: 50, y: 50 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };

    store.addInstance(inst1);
    store.addInstance(inst2);
    store.selectInstance('item_1');

    // Remove item 1
    store.removeInstance('item_1');

    const state = useWorkbenchStore.getState();
    expect(state.instances).toHaveLength(1);
    expect(state.instances[0].instanceId).toBe('item_2');
    expect(state.selectedInstanceId).toBeNull();
  });
});
