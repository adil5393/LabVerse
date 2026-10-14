import { describe, it, expect } from 'vitest';
import {
  generateBreadboardHoles,
  BREADBOARD_400_HOLES,
  getBreadboardHoleWorldPosition,
  BREADBOARD_WIDTH_MM,
  BREADBOARD_HEIGHT_MM,
} from './breadboardTopology';
import {
  getEndpointKey,
  resolveEndpointWorldPosition,
  findNearestEndpoint,
} from './endpointGeometry';
import { computeConnectivityGraph } from './connectivityGraph';
import { detectBreadboardSnap } from './breadboardSnapping';
import type {
  GenericEquipmentDefinition,
  GenericEquipmentInstance,
} from '../../types/workbench';
import type {
  JumperWire,
  TerminalAttachment,
} from '../../types/connections';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';
import { PHYSICS_ELECTRICITY_CATALOG } from '../../subjects/physics/equipmentCatalog';

describe('1. Breadboard Geometry & Topology', () => {
  it('generates exactly 400 unique addressable holes', () => {
    const holes = generateBreadboardHoles();
    expect(holes).toHaveLength(400);

    // Verify all hole IDs are strictly unique
    const uniqueIds = new Set(holes.map((h) => h.id));
    expect(uniqueIds.size).toBe(400);
  });

  it('correctly partitions rows a–e (top) and rows f–j (bottom) across 30 columns', () => {
    const holes = BREADBOARD_400_HOLES;
    const topTerminalHoles = holes.filter((h) => h.type === 'terminal' && ['a', 'b', 'c', 'd', 'e'].includes(h.row!));
    const bottomTerminalHoles = holes.filter((h) => h.type === 'terminal' && ['f', 'g', 'h', 'i', 'j'].includes(h.row!));

    expect(topTerminalHoles).toHaveLength(150); // 30 * 5
    expect(bottomTerminalHoles).toHaveLength(150); // 30 * 5

    // Verify row letters
    const rowsSet = new Set(holes.filter((h) => h.type === 'terminal').map((h) => h.row));
    expect(Array.from(rowsSet).sort()).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']);
  });

  it('contains exactly 100 power rail holes (25 pos + 25 neg on top, 25 pos + 25 neg on bottom)', () => {
    const railHoles = BREADBOARD_400_HOLES.filter((h) => h.type === 'power_rail');
    expect(railHoles).toHaveLength(100);

    const topPos = railHoles.filter((h) => h.railLocation === 'top' && h.railType === 'pos');
    const topNeg = railHoles.filter((h) => h.railLocation === 'top' && h.railType === 'neg');
    const bottomPos = railHoles.filter((h) => h.railLocation === 'bottom' && h.railType === 'pos');
    const bottomNeg = railHoles.filter((h) => h.railLocation === 'bottom' && h.railType === 'neg');

    expect(topPos).toHaveLength(25);
    expect(topNeg).toHaveLength(25);
    expect(bottomPos).toHaveLength(25);
    expect(bottomNeg).toHaveLength(25);
  });

  it('correctly transforms hole coordinates with breadboard translation and 90-degree rotation', () => {
    const centerHole = BREADBOARD_400_HOLES.find((h) => h.id === 'col_15_c')!;
    const bbPos = { x: 50, y: 100 };

    // At 0 rotation:
    const pos0 = getBreadboardHoleWorldPosition(centerHole, bbPos, 0);
    expect(pos0.xMM).toBeCloseTo(bbPos.x + centerHole.localXMM, 1);
    expect(pos0.yMM).toBeCloseTo(bbPos.y + centerHole.localYMM, 1);

    // At 90 deg rotation around center (BREADBOARD_WIDTH_MM / 2, BREADBOARD_HEIGHT_MM / 2):
    const pos90 = getBreadboardHoleWorldPosition(centerHole, bbPos, 90);
    const centerX = BREADBOARD_WIDTH_MM / 2;
    const centerY = BREADBOARD_HEIGHT_MM / 2;
    const dx = centerHole.localXMM - centerX;
    const dy = centerHole.localYMM - centerY;

    expect(pos90.xMM).toBeCloseTo(bbPos.x + centerX - dy, 1);
    expect(pos90.yMM).toBeCloseTo(bbPos.y + centerY + dx, 1);
  });
});

describe('2. Universal Terminal Connections & Direct Wiring (No Breadboard Required)', () => {
  const dcSourceDef: GenericEquipmentDefinition = {
    id: 'dc_source_5v',
    name: 'DC Bench Source',
    subjectId: 'physics',
    category: 'Sources',
    description: 'DC Power',
    icon: 'bolt',
    dimensionsMM: { width: 50, height: 40 },
    terminals: [
      { id: 'pos', label: '+', relativePositionMM: { x: 15, y: 20 }, type: 'binding_post' },
      { id: 'neg', label: '-', relativePositionMM: { x: 35, y: 20 }, type: 'binding_post' },
    ],
    defaultProperties: {},
  };

  const resistorDef: GenericEquipmentDefinition = {
    id: 'resistor_330',
    name: 'Resistor',
    subjectId: 'physics',
    category: 'Passives',
    description: 'Resistor',
    icon: 'linear_scale',
    dimensionsMM: { width: 14, height: 4 },
    terminals: [
      { id: 'pin_1', label: '1', relativePositionMM: { x: 0, y: 2 }, type: 'electrical_pin' },
      { id: 'pin_2', label: '2', relativePositionMM: { x: 10.16, y: 2 }, type: 'electrical_pin' },
    ],
    defaultProperties: {},
  };

  const ledDef: GenericEquipmentDefinition = {
    id: 'led_5mm_red',
    name: 'LED',
    subjectId: 'physics',
    category: 'Semiconductors',
    description: 'LED',
    icon: 'lightbulb',
    dimensionsMM: { width: 6, height: 6 },
    terminals: [
      { id: 'anode', label: '+', relativePositionMM: { x: 1.73, y: 3 }, type: 'electrical_pin' },
      { id: 'cathode', label: '-', relativePositionMM: { x: 4.27, y: 3 }, type: 'electrical_pin' },
    ],
    defaultProperties: {},
  };

  const catalog = [dcSourceDef, resistorDef, ledDef];

  it('connects Battery + Resistor + LED directly without requiring a breadboard', () => {
    const battery: GenericEquipmentInstance = {
      instanceId: 'battery_1',
      definitionId: 'dc_source_5v',
      positionMM: { x: 10, y: 20 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };

    const resistor: GenericEquipmentInstance = {
      instanceId: 'resistor_1',
      definitionId: 'resistor_330',
      positionMM: { x: 80, y: 20 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };

    const led: GenericEquipmentInstance = {
      instanceId: 'led_1',
      definitionId: 'led_5mm_red',
      positionMM: { x: 120, y: 20 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };

    // Wires directly between component terminals:
    // 1. Battery(+) -> Resistor(pin_1)
    // 2. Resistor(pin_2) -> LED(anode)
    // 3. LED(cathode) -> Battery(-)
    const wires: JumperWire[] = [
      {
        id: 'w1',
        color: '#ef4444',
        from: { kind: 'component-terminal', instanceId: 'battery_1', terminalId: 'pos' },
        to: { kind: 'component-terminal', instanceId: 'resistor_1', terminalId: 'pin_1' },
      },
      {
        id: 'w2',
        color: '#eab308',
        from: { kind: 'component-terminal', instanceId: 'resistor_1', terminalId: 'pin_2' },
        to: { kind: 'component-terminal', instanceId: 'led_1', terminalId: 'anode' },
      },
      {
        id: 'w3',
        color: '#1f2937',
        from: { kind: 'component-terminal', instanceId: 'led_1', terminalId: 'cathode' },
        to: { kind: 'component-terminal', instanceId: 'battery_1', terminalId: 'neg' },
      },
    ];

    const result = computeConnectivityGraph([battery, resistor, led], catalog, [], wires);

    // Exactly 3 distinct electrical nodes must be found:
    // Node A: Battery(+) & Resistor(pin_1) (VCC)
    // Node B: Resistor(pin_2) & LED(anode)
    // Node C: LED(cathode) & Battery(-) (GND)
    expect(result.nodes).toHaveLength(3);

    const vccNode = result.nodes.find((n) => n.name.includes('VCC'));
    const gndNode = result.nodes.find((n) => n.name.includes('GND'));
    const middleNode = result.nodes.find((n) => !n.name.includes('VCC') && !n.name.includes('GND'));

    expect(vccNode).toBeDefined();
    expect(gndNode).toBeDefined();
    expect(middleNode).toBeDefined();

    // Verify resistor's two terminals are in SEPARATE nodes!
    const keyPin1 = getEndpointKey({ kind: 'component-terminal', instanceId: 'resistor_1', terminalId: 'pin_1' });
    const keyPin2 = getEndpointKey({ kind: 'component-terminal', instanceId: 'resistor_1', terminalId: 'pin_2' });

    expect(result.endpointToNodeMap.get(keyPin1)).not.toEqual(result.endpointToNodeMap.get(keyPin2));

    // Verify LED's anode and cathode are in SEPARATE nodes!
    const keyAnode = getEndpointKey({ kind: 'component-terminal', instanceId: 'led_1', terminalId: 'anode' });
    const keyCathode = getEndpointKey({ kind: 'component-terminal', instanceId: 'led_1', terminalId: 'cathode' });

    expect(result.endpointToNodeMap.get(keyAnode)).not.toEqual(result.endpointToNodeMap.get(keyCathode));
  });

  it('updates wire endpoint world positions dynamically when a connected component moves or rotates', () => {
    const resistor: GenericEquipmentInstance = {
      instanceId: 'resistor_1',
      definitionId: 'resistor_330',
      positionMM: { x: 50, y: 50 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };

    const endpoint: JumperWire['from'] = {
      kind: 'component-terminal',
      instanceId: 'resistor_1',
      terminalId: 'pin_1',
    };

    // Position at (50, 50) with 0 rotation
    const pos1 = resolveEndpointWorldPosition(endpoint, [resistor], catalog);
    expect(pos1).toBeDefined();
    expect(pos1!.xMM).toBeCloseTo(50, 2);
    expect(pos1!.yMM).toBeCloseTo(52, 2); // pin_1 has relative y = 2mm

    // Move resistor to (120, 90)
    const movedResistor: GenericEquipmentInstance = {
      ...resistor,
      positionMM: { x: 120, y: 90 },
    };
    const pos2 = resolveEndpointWorldPosition(endpoint, [movedResistor], catalog);
    expect(pos2!.xMM).toBeCloseTo(120, 2);
    expect(pos2!.yMM).toBeCloseTo(92, 2);

    // Rotate resistor by 90 degrees around center (7, 2)
    const rotatedResistor: GenericEquipmentInstance = {
      ...resistor,
      rotationDeg: 90,
    };
    const pos3 = resolveEndpointWorldPosition(endpoint, [rotatedResistor], catalog);
    expect(pos3!.xMM).not.toBeCloseTo(pos1!.xMM);
  });
});

describe('3. Rigid Breadboard Snapping & Attachment Engine', () => {
  const breadboardDef: GenericEquipmentDefinition = {
    id: 'breadboard_half_400',
    name: 'Breadboard',
    subjectId: 'physics',
    category: 'Prototyping',
    description: '',
    icon: '',
    dimensionsMM: { width: 82, height: 55.5 },
    terminals: [],
    defaultProperties: {},
  };

  const ledDef: GenericEquipmentDefinition = {
    id: 'led_5mm_red',
    name: 'LED',
    subjectId: 'physics',
    category: 'Semiconductors',
    description: '',
    icon: '',
    dimensionsMM: { width: 6, height: 6 },
    terminals: [
      { id: 'anode', label: '+', relativePositionMM: { x: 1.73, y: 3 }, type: 'electrical_pin' },
      { id: 'cathode', label: '-', relativePositionMM: { x: 4.27, y: 3 }, type: 'electrical_pin' }, // 2.54mm pitch
    ],
    defaultProperties: {},
  };

  const bbInst: GenericEquipmentInstance = {
    instanceId: 'bb_1',
    definitionId: 'breadboard_half_400',
    positionMM: { x: 50, y: 50 },
    rotationDeg: 0,
    properties: {},
    connections: {},
  };

  it('snaps a 2-pin rigid component when both pins align with valid breadboard holes', () => {
    // Hole col_10_a is at localX = 4.17 + 9 * 2.54 = 27.03, localY = 14.5
    // World pos = (50 + 27.03, 50 + 14.5) = (77.03, 64.5)
    const ledInst: GenericEquipmentInstance = {
      instanceId: 'led_1',
      definitionId: 'led_5mm_red',
      positionMM: { x: 75.3, y: 61.5 }, // Near col_10_a
      rotationDeg: 0,
      properties: {},
      connections: {},
    };

    const snap = detectBreadboardSnap(
      ledInst,
      ledDef,
      { x: 75.5, y: 61.5 },
      [bbInst, ledInst],
      [breadboardDef, ledDef],
      []
    );

    expect(snap).not.toBeNull();
    expect(snap!.isValid).toBe(true);
    expect(snap!.attachments).toHaveLength(2);
    expect(snap!.attachments[0].terminalId).toBe('anode');
    expect(snap!.attachments[1].terminalId).toBe('cathode');
  });

  it('rejects snapping if a target hole is already occupied by another component pin', () => {
    const ledInst1: GenericEquipmentInstance = {
      instanceId: 'led_1',
      definitionId: 'led_5mm_red',
      positionMM: { x: 75.3, y: 61.5 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };

    const ledInst2: GenericEquipmentInstance = {
      instanceId: 'led_2',
      definitionId: 'led_5mm_red',
      positionMM: { x: 75.3, y: 61.5 }, // Trying to occupy the exact same holes!
      rotationDeg: 0,
      properties: {},
      connections: {},
    };

    const existingAttachments: TerminalAttachment[] = [
      {
        instanceId: 'led_1',
        terminalId: 'anode',
        breadboardInstanceId: 'bb_1',
        holeId: 'col_10_a',
      },
    ];

    const snap = detectBreadboardSnap(
      ledInst2,
      ledDef,
      { x: 75.5, y: 61.5 },
      [bbInst, ledInst1, ledInst2],
      [breadboardDef, ledDef],
      existingAttachments
    );

    expect(snap).not.toBeNull();
    expect(snap!.isValid).toBe(false);
    expect(snap!.rejectReason).toContain('already occupied');
  });
});

describe('4. Hybrid Connectivity (Breadboard + Jumper Wires)', () => {
  it('correctly unifies breadboard internal strips with terminal attachments and jumper wires', () => {
    const breadboardDef: GenericEquipmentDefinition = {
      id: 'breadboard_half_400',
      name: 'Breadboard',
      subjectId: 'physics',
      category: 'Prototyping',
      description: '',
      icon: '',
      dimensionsMM: { width: 82, height: 55.5 },
      terminals: [],
      defaultProperties: {},
    };

    const resistorDef: GenericEquipmentDefinition = {
      id: 'resistor_330',
      name: 'Resistor',
      subjectId: 'physics',
      category: 'Passives',
      description: '',
      icon: '',
      dimensionsMM: { width: 14, height: 4 },
      terminals: [
        { id: 'pin_1', label: '1', relativePositionMM: { x: 0, y: 2 }, type: 'electrical_pin' },
        { id: 'pin_2', label: '2', relativePositionMM: { x: 10.16, y: 2 }, type: 'electrical_pin' },
      ],
      defaultProperties: {},
    };

    const bb: GenericEquipmentInstance = {
      instanceId: 'bb_1',
      definitionId: 'breadboard_half_400',
      positionMM: { x: 50, y: 50 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };

    const res: GenericEquipmentInstance = {
      instanceId: 'res_1',
      definitionId: 'resistor_330',
      positionMM: { x: 60, y: 60 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };

    // Resistor pin_1 is inserted in hole col_5_a.
    // In breadboard topology, col_5_a and col_5_e share the same internal strip 'strip_top_col_5'.
    // A jumper wire connects from hole col_5_e to another hole or terminal.
    const attachments: TerminalAttachment[] = [
      {
        instanceId: 'res_1',
        terminalId: 'pin_1',
        breadboardInstanceId: 'bb_1',
        holeId: 'col_5_a',
      },
    ];

    const wires: JumperWire[] = [
      {
        id: 'w1',
        color: '#ef4444',
        from: { kind: 'breadboard-hole', breadboardInstanceId: 'bb_1', holeId: 'col_5_e' },
        to: { kind: 'breadboard-hole', breadboardInstanceId: 'bb_1', holeId: 'rail_top_pos_1' },
      },
    ];

    const result = computeConnectivityGraph([bb, res], [breadboardDef, resistorDef], attachments, wires);

    // Resistor pin_1, hole col_5_a, hole col_5_e, and rail_top_pos_1 must all be in the SAME electrical node!
    const keyPin1 = getEndpointKey({ kind: 'component-terminal', instanceId: 'res_1', terminalId: 'pin_1' });
    const keyHole5e = getEndpointKey({ kind: 'breadboard-hole', breadboardInstanceId: 'bb_1', holeId: 'col_5_e' });
    const keyRail = getEndpointKey({ kind: 'breadboard-hole', breadboardInstanceId: 'bb_1', holeId: 'rail_top_pos_1' });

    const nodePin1 = result.endpointToNodeMap.get(keyPin1);
    const nodeHole5e = result.endpointToNodeMap.get(keyHole5e);
    const nodeRail = result.endpointToNodeMap.get(keyRail);

    expect(nodePin1).toBeDefined();
    expect(nodePin1).toEqual(nodeHole5e);
    expect(nodePin1).toEqual(nodeRail);
  });
});

describe('5. Wire Selection, Reconnection, Recoloring & Store Undo/Redo', () => {

  it('accurately defines physical lead endpoints for resistor and LED in catalog', () => {
    const resistor = PHYSICS_ELECTRICITY_CATALOG.find((d) => d.id === 'resistor_330')!;
    const led = PHYSICS_ELECTRICITY_CATALOG.find((d) => d.id === 'led_5mm_red')!;

    // Resistor: exact 4 breadboard pitches (10.16mm)
    expect(resistor.dimensionsMM.width).toBeCloseTo(10.16, 2);
    expect(resistor.terminals[0].relativePositionMM.x).toBeCloseTo(0, 2);
    expect(resistor.terminals[1].relativePositionMM.x).toBeCloseTo(10.16, 2);
    expect(resistor.terminals[0].relativePositionMM.y).toBeCloseTo(2.0, 2);
    expect(resistor.terminals[1].relativePositionMM.y).toBeCloseTo(2.0, 2);

    // LED: 1 breadboard pitch (2.54mm) with leads at bottom (y = 10mm)
    expect(led.dimensionsMM.width).toBeCloseTo(6.0, 2);
    expect(led.dimensionsMM.height).toBeCloseTo(10.0, 2);
    expect(led.terminals[0].relativePositionMM.y).toBeCloseTo(10.0, 2);
    expect(led.terminals[1].relativePositionMM.y).toBeCloseTo(10.0, 2);
    expect(led.terminals[1].relativePositionMM.x - led.terminals[0].relativePositionMM.x).toBeCloseTo(2.54, 2);
  });

  it('supports wire selection, recoloring to black, and deletion with undo/redo', () => {
    const store = useWorkbenchStore.getState();
    store.clearWorkbench();

    const wire1: JumperWire = {
      id: 'wire_test_1',
      color: '#ef4444',
      from: { kind: 'component-terminal', instanceId: 'batt_1', terminalId: 'pos' },
      to: { kind: 'component-terminal', instanceId: 'res_1', terminalId: 'pin_1' },
    };

    // 1. Add wire
    store.addWire(wire1);
    expect(useWorkbenchStore.getState().wires).toHaveLength(1);
    expect(useWorkbenchStore.getState().selectedWireId).toBe('wire_test_1');

    // 2. Recolor wire to black
    store.updateWireColor('wire_test_1', '#1f2937');
    expect(useWorkbenchStore.getState().wires[0].color).toBe('#1f2937');

    // 3. Undo recoloring
    store.undo();
    expect(useWorkbenchStore.getState().wires[0].color).toBe('#ef4444');

    // 4. Redo recoloring
    store.redo();
    expect(useWorkbenchStore.getState().wires[0].color).toBe('#1f2937');

    // 5. Delete wire
    store.removeWire('wire_test_1');
    expect(useWorkbenchStore.getState().wires).toHaveLength(0);

    // 6. Undo wire deletion
    store.undo();
    expect(useWorkbenchStore.getState().wires).toHaveLength(1);
    expect(useWorkbenchStore.getState().wires[0].id).toBe('wire_test_1');
  });

  it('supports wire endpoint reconnection and updates electrical node connectivity', () => {
    const store = useWorkbenchStore.getState();
    store.clearWorkbench();

    const battery: GenericEquipmentInstance = {
      instanceId: 'battery_1',
      definitionId: 'dc_source_5v',
      positionMM: { x: 10, y: 10 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };

    const resA: GenericEquipmentInstance = {
      instanceId: 'res_A',
      definitionId: 'resistor_330',
      positionMM: { x: 50, y: 10 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };

    const resB: GenericEquipmentInstance = {
      instanceId: 'res_B',
      definitionId: 'resistor_330',
      positionMM: { x: 50, y: 40 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };

    store.addInstance(battery);
    store.addInstance(resA);
    store.addInstance(resB);

    // Wire initially connects Battery(+) to Resistor A (pin_1)
    const wire: JumperWire = {
      id: 'wire_reconnect_test',
      color: '#ef4444',
      from: { kind: 'component-terminal', instanceId: 'battery_1', terminalId: 'pos' },
      to: { kind: 'component-terminal', instanceId: 'res_A', terminalId: 'pin_1' },
    };
    store.addWire(wire);

    // Initial graph: Battery(+) and ResA(pin_1) are in the same node
    let graph = computeConnectivityGraph(
      useWorkbenchStore.getState().instances,
      PHYSICS_ELECTRICITY_CATALOG,
      [],
      useWorkbenchStore.getState().wires
    );

    const battPosKey = getEndpointKey({ kind: 'component-terminal', instanceId: 'battery_1', terminalId: 'pos' });
    const resAPin1Key = getEndpointKey({ kind: 'component-terminal', instanceId: 'res_A', terminalId: 'pin_1' });
    const resBPin1Key = getEndpointKey({ kind: 'component-terminal', instanceId: 'res_B', terminalId: 'pin_1' });

    expect(graph.endpointToNodeMap.get(battPosKey)).toEqual(graph.endpointToNodeMap.get(resAPin1Key));
    expect(graph.endpointToNodeMap.get(battPosKey)).not.toEqual(graph.endpointToNodeMap.get(resBPin1Key));

    // Reconnect wire endpoint 'to' from Resistor A to Resistor B!
    store.updateWireEndpoint('wire_reconnect_test', 'to', {
      kind: 'component-terminal',
      instanceId: 'res_B',
      terminalId: 'pin_1',
    });

    graph = computeConnectivityGraph(
      useWorkbenchStore.getState().instances,
      PHYSICS_ELECTRICITY_CATALOG,
      [],
      useWorkbenchStore.getState().wires
    );

    // Now Battery(+) and ResB(pin_1) are connected, while ResA(pin_1) is disconnected!
    expect(graph.endpointToNodeMap.get(battPosKey)).toEqual(graph.endpointToNodeMap.get(resBPin1Key));
    expect(graph.endpointToNodeMap.get(battPosKey)).not.toEqual(graph.endpointToNodeMap.get(resAPin1Key));

    // Undo reconnection restores connection back to Resistor A
    store.undo();
    graph = computeConnectivityGraph(
      useWorkbenchStore.getState().instances,
      PHYSICS_ELECTRICITY_CATALOG,
      [],
      useWorkbenchStore.getState().wires
    );
    expect(graph.endpointToNodeMap.get(battPosKey)).toEqual(graph.endpointToNodeMap.get(resAPin1Key));
  });

  it('verifies the full Milestone C acceptance scenario without breadboard (Move, Rotate, Recolor, Reconnect, Delete, Undo)', () => {
    const store = useWorkbenchStore.getState();
    store.clearWorkbench();

    // 1. Create components: 5V DC supply, 330Ω resistor, Red LED
    const battery: GenericEquipmentInstance = {
      instanceId: 'batt_acc',
      definitionId: 'dc_source_5v',
      positionMM: { x: 20, y: 30 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };
    const resistor: GenericEquipmentInstance = {
      instanceId: 'res_acc',
      definitionId: 'resistor_330',
      positionMM: { x: 60, y: 30 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };
    const led: GenericEquipmentInstance = {
      instanceId: 'led_acc',
      definitionId: 'led_5mm_red',
      positionMM: { x: 100, y: 30 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };

    store.addInstance(battery);
    store.addInstance(resistor);
    store.addInstance(led);

    // 2. Wire circuit:
    // 5V DC pos -> resistor terminal A (pin_1)
    // resistor terminal B (pin_2) -> LED anode (anode)
    // LED cathode (cathode) -> 5V DC neg (neg)
    const wire1: JumperWire = {
      id: 'w_batt_to_res',
      color: '#ef4444',
      from: { kind: 'component-terminal', instanceId: 'batt_acc', terminalId: 'pos' },
      to: { kind: 'component-terminal', instanceId: 'res_acc', terminalId: 'pin_1' },
    };
    const wire2: JumperWire = {
      id: 'w_res_to_led',
      color: '#ef4444',
      from: { kind: 'component-terminal', instanceId: 'res_acc', terminalId: 'pin_2' },
      to: { kind: 'component-terminal', instanceId: 'led_acc', terminalId: 'anode' },
    };
    const wire3: JumperWire = {
      id: 'w_led_to_batt',
      color: '#1f2937',
      from: { kind: 'component-terminal', instanceId: 'led_acc', terminalId: 'cathode' },
      to: { kind: 'component-terminal', instanceId: 'batt_acc', terminalId: 'neg' },
    };

    store.addWire(wire1);
    store.addWire(wire2);
    store.addWire(wire3);

    // Initial electrical verification
    let graph = computeConnectivityGraph(
      useWorkbenchStore.getState().instances,
      PHYSICS_ELECTRICITY_CATALOG,
      [],
      useWorkbenchStore.getState().wires
    );
    expect(graph.nodes.length).toBe(3); // Node 1: batt.pos + res.pin1, Node 2: res.pin2 + led.anode, Node 3: led.cathode + batt.neg

    // Step 1: Select and move resistor
    store.updateInstancePosition('res_acc', { x: 75, y: 45 });
    // Verify both wires remain attached to its terminals
    const curWires = useWorkbenchStore.getState().wires;
    expect(curWires.find((w) => w.id === 'w_batt_to_res')?.to).toEqual({
      kind: 'component-terminal',
      instanceId: 'res_acc',
      terminalId: 'pin_1',
    });
    expect(curWires.find((w) => w.id === 'w_res_to_led')?.from).toEqual({
      kind: 'component-terminal',
      instanceId: 'res_acc',
      terminalId: 'pin_2',
    });

    // Step 2 & 3: Rotate the resistor 90 degrees
    store.updateInstanceRotation('res_acc', 90);
    const updatedRes = useWorkbenchStore.getState().instances.find((i) => i.instanceId === 'res_acc')!;
    expect(updatedRes.rotationDeg).toBe(90);

    // Verify resolved world positions of terminals after rotation
    const posLeadA = resolveEndpointWorldPosition(
      { kind: 'component-terminal', instanceId: 'res_acc', terminalId: 'pin_1' },
      useWorkbenchStore.getState().instances,
      PHYSICS_ELECTRICITY_CATALOG
    );
    const posLeadB = resolveEndpointWorldPosition(
      { kind: 'component-terminal', instanceId: 'res_acc', terminalId: 'pin_2' },
      useWorkbenchStore.getState().instances,
      PHYSICS_ELECTRICITY_CATALOG
    );
    // At 90 deg rotation, the leads are rotated vertically around center: same x, different y
    expect(posLeadA).not.toBeNull();
    expect(posLeadB).not.toBeNull();
    expect(posLeadA?.yMM).not.toEqual(posLeadB?.yMM);

    // Step 5 & 6: Select one wire and change its color to black
    store.selectWire('w_batt_to_res');
    expect(useWorkbenchStore.getState().selectedWireId).toBe('w_batt_to_res');
    store.updateWireColor('w_batt_to_res', '#1f2937');
    expect(useWorkbenchStore.getState().wires.find((w) => w.id === 'w_batt_to_res')?.color).toBe('#1f2937');

    // Step 7 & 8: Disconnect one endpoint and reconnect it to original terminal
    store.updateWireEndpoint('w_batt_to_res', 'to', {
      kind: 'component-terminal',
      instanceId: 'batt_acc',
      terminalId: 'neg',
    });
    // Now w_batt_to_res connects pos to neg (short circuit node)
    let reconnectedGraph = computeConnectivityGraph(
      useWorkbenchStore.getState().instances,
      PHYSICS_ELECTRICITY_CATALOG,
      [],
      useWorkbenchStore.getState().wires
    );
    const posKey = getEndpointKey({ kind: 'component-terminal', instanceId: 'batt_acc', terminalId: 'pos' });
    const negKey = getEndpointKey({ kind: 'component-terminal', instanceId: 'batt_acc', terminalId: 'neg' });
    expect(reconnectedGraph.endpointToNodeMap.get(posKey)).toEqual(reconnectedGraph.endpointToNodeMap.get(negKey));

    // Reconnect back to original terminal (res_acc pin_1)
    store.updateWireEndpoint('w_batt_to_res', 'to', {
      kind: 'component-terminal',
      instanceId: 'res_acc',
      terminalId: 'pin_1',
    });
    graph = computeConnectivityGraph(
      useWorkbenchStore.getState().instances,
      PHYSICS_ELECTRICITY_CATALOG,
      [],
      useWorkbenchStore.getState().wires
    );
    expect(graph.endpointToNodeMap.get(posKey)).not.toEqual(graph.endpointToNodeMap.get(negKey));

    // Step 9: Delete the wire
    store.removeWire('w_batt_to_res');
    expect(useWorkbenchStore.getState().wires.find((w) => w.id === 'w_batt_to_res')).toBeUndefined();
    let disconnectedGraph = computeConnectivityGraph(
      useWorkbenchStore.getState().instances,
      PHYSICS_ELECTRICITY_CATALOG,
      [],
      useWorkbenchStore.getState().wires
    );
    const pin1Key = getEndpointKey({ kind: 'component-terminal', instanceId: 'res_acc', terminalId: 'pin_1' });
    expect(disconnectedGraph.endpointToNodeMap.get(posKey)).not.toEqual(disconnectedGraph.endpointToNodeMap.get(pin1Key));

    // Step 10 & 11: Undo the deletion & confirm graph returns to previous state
    store.undo();
    expect(useWorkbenchStore.getState().wires.find((w) => w.id === 'w_batt_to_res')).toBeDefined();
    const restoredGraph = computeConnectivityGraph(
      useWorkbenchStore.getState().instances,
      PHYSICS_ELECTRICITY_CATALOG,
      [],
      useWorkbenchStore.getState().wires
    );
    expect(restoredGraph.endpointToNodeMap.get(posKey)).toEqual(restoredGraph.endpointToNodeMap.get(pin1Key));
    expect(restoredGraph.nodes.length).toBe(3);
  });

  it('verifies the acceptance scenario using breadboard holes', () => {
    const store = useWorkbenchStore.getState();
    store.clearWorkbench();

    const breadboard: GenericEquipmentInstance = {
      instanceId: 'bb_acc',
      definitionId: 'breadboard_half_400',
      positionMM: { x: 50, y: 50 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };
    const battery: GenericEquipmentInstance = {
      instanceId: 'batt_bb',
      definitionId: 'dc_source_5v',
      positionMM: { x: 10, y: 50 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };
    const resistor: GenericEquipmentInstance = {
      instanceId: 'res_bb',
      definitionId: 'resistor_330',
      positionMM: { x: 80, y: 60 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };

    store.addInstance(breadboard);
    store.addInstance(battery);
    store.addInstance(resistor);

    // Resistor pin_1 is inserted in hole col 10 row e
    const attachments: TerminalAttachment[] = [
      {
        instanceId: 'res_bb',
        terminalId: 'pin_1',
        breadboardInstanceId: 'bb_acc',
        holeId: 'col_10_e',
      },
    ];

    // Wire from Battery(+) to top positive rail hole (rail_top_pos_1)
    const wire1: JumperWire = {
      id: 'w_batt_to_bb_rail',
      color: '#ef4444',
      from: { kind: 'component-terminal', instanceId: 'batt_bb', terminalId: 'pos' },
      to: { kind: 'breadboard-hole', breadboardInstanceId: 'bb_acc', holeId: 'rail_top_pos_1' },
    };
    // Wire from another hole on the same top positive rail (rail_top_pos_2) to row 10a (col_10_a)
    const wire2: JumperWire = {
      id: 'w_rail_to_row',
      color: '#ef4444',
      from: { kind: 'breadboard-hole', breadboardInstanceId: 'bb_acc', holeId: 'rail_top_pos_2' },
      to: { kind: 'breadboard-hole', breadboardInstanceId: 'bb_acc', holeId: 'col_10_a' },
    };

    store.addWire(wire1);
    store.addWire(wire2);

    let graph = computeConnectivityGraph(
      useWorkbenchStore.getState().instances,
      PHYSICS_ELECTRICITY_CATALOG,
      attachments,
      useWorkbenchStore.getState().wires
    );

    const battPosKey = getEndpointKey({ kind: 'component-terminal', instanceId: 'batt_bb', terminalId: 'pos' });
    const resPin1Key = getEndpointKey({ kind: 'component-terminal', instanceId: 'res_bb', terminalId: 'pin_1' });

    // Since wire1 -> rail_top_pos_1, and wire2 connects rail_top_pos_2 -> col_10_a,
    // and resistor pin_1 is plugged into col_10_e (same column group as col_10_a),
    // battPosKey and resPin1Key must share the exact same electrical node!
    expect(graph.endpointToNodeMap.get(battPosKey)).toBeDefined();
    expect(graph.endpointToNodeMap.get(battPosKey)).toEqual(graph.endpointToNodeMap.get(resPin1Key));

    // Move breadboard: hole world positions update dynamically with breadboard position
    store.updateInstancePosition('bb_acc', { x: 70, y: 80 });
    const holePosMoved = resolveEndpointWorldPosition(
      { kind: 'breadboard-hole', breadboardInstanceId: 'bb_acc', holeId: 'col_10_a' },
      useWorkbenchStore.getState().instances,
      PHYSICS_ELECTRICITY_CATALOG
    );
    expect(holePosMoved).not.toBeNull();
    expect(holePosMoved?.xMM).toBeGreaterThan(70);

    // Reconnect wire2 'to' endpoint from col_10_a to col_15_a (disconnecting column 10)
    store.updateWireEndpoint('w_rail_to_row', 'to', {
      kind: 'breadboard-hole',
      breadboardInstanceId: 'bb_acc',
      holeId: 'col_15_a',
    });
    graph = computeConnectivityGraph(
      useWorkbenchStore.getState().instances,
      PHYSICS_ELECTRICITY_CATALOG,
      attachments,
      useWorkbenchStore.getState().wires
    );
    expect(graph.endpointToNodeMap.get(battPosKey)).not.toEqual(graph.endpointToNodeMap.get(resPin1Key));
  });

  describe('6. Stable Magnetic Snapping & Target Acquisition', () => {
    const resInstance: GenericEquipmentInstance = {
      instanceId: 'res_snap_test',
      definitionId: 'resistor_330',
      positionMM: { x: 50, y: 50 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };

    it('identifies nearest component terminal with screen-pixel radius across different zoom levels', () => {
      // At zoom = 1.0, 18px ~ 4.76mm (Resistor Lead A is at 50, 52 mm)

      // At zoom = 1.0, 18px ~ 4.76mm
      const snap100 = findNearestEndpoint(
        { xMM: 52.0, yMM: 52.0 }, // 2.0mm away
        [resInstance],
        PHYSICS_ELECTRICITY_CATALOG,
        { zoom: 1.0 }
      );
      expect(snap100).not.toBeNull();
      expect(snap100?.key).toBe('term:res_snap_test:pin_1');

      // At zoom = 2.0 (high magnification), 18px ~ 2.38mm
      const snap200Inside = findNearestEndpoint(
        { xMM: 51.5, yMM: 52.0 }, // 1.5mm away
        [resInstance],
        PHYSICS_ELECTRICITY_CATALOG,
        { zoom: 2.0 }
      );
      expect(snap200Inside).not.toBeNull();
      expect(snap200Inside?.key).toBe('term:res_snap_test:pin_1');

      // Far point outside 18px radius at 2.0x zoom
      const snap200Outside = findNearestEndpoint(
        { xMM: 55.0, yMM: 52.0 }, // 5.0mm away
        [resInstance],
        PHYSICS_ELECTRICITY_CATALOG,
        { zoom: 2.0 }
      );
      expect(snap200Outside).toBeNull();
    });

    it('implements hysteresis: active snap target remains sticky within release threshold', () => {
      const activeKey = 'term:res_snap_test:pin_1';

      // Pointer moves slightly past the acquire threshold, but remains inside release threshold
      const snapSticky = findNearestEndpoint(
        { xMM: 54.8, yMM: 52.0 }, // ~4.8mm away
        [resInstance],
        PHYSICS_ELECTRICITY_CATALOG,
        { zoom: 1.0, activeTargetKey: activeKey }
      );
      expect(snapSticky).not.toBeNull();
      expect(snapSticky?.key).toBe(activeKey);

      // Pointer moves far away past release threshold: target is dropped
      const snapDropped = findNearestEndpoint(
        { xMM: 62.0, yMM: 52.0 }, // 12mm away
        [resInstance],
        PHYSICS_ELECTRICITY_CATALOG,
        { zoom: 1.0, activeTargetKey: activeKey }
      );
      expect(snapDropped?.key).not.toBe(activeKey);
    });

    it('filters out ignored endpoint (e.g. wire start terminal cannot snap to itself)', () => {
      const snapSelf = findNearestEndpoint(
        { xMM: 50.0, yMM: 52.0 }, // Exactly on Lead A
        [resInstance],
        PHYSICS_ELECTRICITY_CATALOG,
        { zoom: 1.0, ignoreEndpointKey: 'term:res_snap_test:pin_1' }
      );

      // Lead A was ignored; Lead B is at (60.16, 52) which is 10.16mm away (outside threshold)
      expect(snapSelf).toBeNull();
    });
  });
});

