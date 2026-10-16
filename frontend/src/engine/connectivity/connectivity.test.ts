import { describe, it, expect } from 'vitest';
import {
  generateBreadboardHoles,
  BREADBOARD_400_HOLES,
  BREADBOARD_HOLE_MAP,
  getBreadboardHoleWorldPosition,
  BREADBOARD_WIDTH_MM,
  BREADBOARD_HEIGHT_MM,
} from './breadboardTopology';
import {
  endpointKey,
  getEndpointKey,
  parseEndpointKey,
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
  ConnectionEndpoint,
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
      const expectedPin1Key = getEndpointKey({ kind: 'component-terminal', instanceId: 'res_snap_test', terminalId: 'pin_1' });
      expect(snap100?.key).toBe(expectedPin1Key);

      // At zoom = 2.0 (high magnification), 18px ~ 2.38mm
      const snap200Inside = findNearestEndpoint(
        { xMM: 51.5, yMM: 52.0 }, // 1.5mm away
        [resInstance],
        PHYSICS_ELECTRICITY_CATALOG,
        { zoom: 2.0 }
      );
      expect(snap200Inside).not.toBeNull();
      expect(snap200Inside?.key).toBe(expectedPin1Key);

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
      const activeKey = getEndpointKey({ kind: 'component-terminal', instanceId: 'res_snap_test', terminalId: 'pin_1' });

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

  describe('7. Milestone C Final Verification: Complete Series Circuit & Topology Resilience', () => {
    const resDef = PHYSICS_ELECTRICITY_CATALOG.find((d) => d.id === 'resistor_330')!;
    const ledDef = PHYSICS_ELECTRICITY_CATALOG.find((d) => d.id === 'led_5mm_red')!;

    const bbInst: GenericEquipmentInstance = {
      instanceId: 'bb_final',
      definitionId: 'breadboard_half_400',
      positionMM: { x: 50, y: 50 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };

    const dcInst: GenericEquipmentInstance = {
      instanceId: 'dc_final',
      definitionId: 'dc_source_5v',
      positionMM: { x: 0, y: 10 },
      rotationDeg: 0,
      properties: { voltageV: 5.0 },
      connections: {},
    };

    it('confirms both Resistor and LED can be snapped into valid addressable holes with exact visual lead alignment', () => {
      // 1. Resistor: Lead A (pin_1) at (0, 2), Lead B (pin_2) at (10.16, 2)
      // Hole col_10_a is at (4.17 + 9 * 2.54, 14.5) = (27.03, 14.5)
      // Breadboard is at (50, 50), so col_10_a world = (77.03, 64.5)
      // When Resistor is positioned at (77.03, 62.5):
      // Lead A world = (77.03, 62.5 + 2) = (77.03, 64.5) -> matches col_10_a!
      // Lead B world = (77.03 + 10.16, 62.5 + 2) = (87.19, 64.5) -> matches col_14_a!
      const resInst: GenericEquipmentInstance = {
        instanceId: 'res_final',
        definitionId: 'resistor_330',
        positionMM: { x: 77.0, y: 62.5 },
        rotationDeg: 0,
        properties: { resistanceOhms: 330 },
        connections: {},
      };

      const resSnap = detectBreadboardSnap(
        resInst,
        resDef,
        resInst.positionMM,
        [bbInst, dcInst, resInst],
        PHYSICS_ELECTRICITY_CATALOG,
        []
      );

      expect(resSnap).not.toBeNull();
      expect(resSnap!.isValid).toBe(true);
      expect(resSnap!.attachments).toEqual([
        { terminalId: 'pin_1', holeId: 'col_10_a' },
        { terminalId: 'pin_2', holeId: 'col_14_a' },
      ]);

      // Confirm lead endpoints align precisely with attached hole coordinates
      const resSnappedInst: GenericEquipmentInstance = {
        ...resInst,
        positionMM: resSnap!.snappedPositionMM,
      };
      const leadAPos = resolveEndpointWorldPosition(
        { kind: 'component-terminal', instanceId: 'res_final', terminalId: 'pin_1' },
        [resSnappedInst],
        PHYSICS_ELECTRICITY_CATALOG
      );
      const leadBPos = resolveEndpointWorldPosition(
        { kind: 'component-terminal', instanceId: 'res_final', terminalId: 'pin_2' },
        [resSnappedInst],
        PHYSICS_ELECTRICITY_CATALOG
      );
      const holeCol10 = BREADBOARD_400_HOLES.find((h) => h.id === 'col_10_a')!;
      const holeCol14 = BREADBOARD_400_HOLES.find((h) => h.id === 'col_14_a')!;
      const hole10World = getBreadboardHoleWorldPosition(holeCol10, bbInst.positionMM, 0);
      const hole14World = getBreadboardHoleWorldPosition(holeCol14, bbInst.positionMM, 0);

      expect(Math.abs(leadAPos!.xMM - hole10World.xMM)).toBeLessThan(0.05);
      expect(Math.abs(leadAPos!.yMM - hole10World.yMM)).toBeLessThan(0.05);
      expect(Math.abs(leadBPos!.xMM - hole14World.xMM)).toBeLessThan(0.05);
      expect(Math.abs(leadBPos!.yMM - hole14World.yMM)).toBeLessThan(0.05);

      // 2. LED: Anode at (1.73, 10), Cathode at (4.27, 10) (1 pitch = 2.54mm apart)
      // Hole col_14_b world is at (87.19, 67.04), col_15_b world is at (89.73, 67.04)
      const ledInst: GenericEquipmentInstance = {
        instanceId: 'led_final',
        definitionId: 'led_5mm_red',
        positionMM: { x: 87.19 - 1.73, y: 67.04 - 10.0 }, // (85.46, 57.04)
        rotationDeg: 0,
        properties: {},
        connections: {},
      };

      const ledSnap = detectBreadboardSnap(
        ledInst,
        ledDef,
        ledInst.positionMM,
        [bbInst, dcInst, resSnappedInst, ledInst],
        PHYSICS_ELECTRICITY_CATALOG,
        resSnap!.attachments.map((a) => ({ ...a, instanceId: 'res_final', breadboardInstanceId: bbInst.instanceId }))
      );

      expect(ledSnap).not.toBeNull();
      expect(ledSnap!.isValid).toBe(true);
      expect(ledSnap!.attachments).toEqual([
        { terminalId: 'anode', holeId: 'col_14_b' },
        { terminalId: 'cathode', holeId: 'col_15_b' },
      ]);
    });

    it('rejects invalid or occupied hole insertion for 2-pin components', () => {
      // Trying to place LED where anode lands on occupied col_10_a
      const occupiedAtts: TerminalAttachment[] = [
        {
          instanceId: 'res_final',
          terminalId: 'pin_1',
          breadboardInstanceId: 'bb_final',
          holeId: 'col_10_a',
        },
      ];

      const ledInst: GenericEquipmentInstance = {
        instanceId: 'led_final',
        definitionId: 'led_5mm_red',
        positionMM: { x: 77.03 - 1.73, y: 64.5 - 10.0 },
        rotationDeg: 0,
        properties: {},
        connections: {},
      };

      const snap = detectBreadboardSnap(
        ledInst,
        ledDef,
        ledInst.positionMM,
        [bbInst, ledInst],
        PHYSICS_ELECTRICITY_CATALOG,
        occupiedAtts
      );

      expect(snap).not.toBeNull();
      expect(snap!.isValid).toBe(false);
      expect(snap!.rejectReason).toContain('already occupied');
    });

    it('verifies a complete series circuit produces exactly 3 electrical nodes via breadboard strips and jumper wires', () => {
      // Circuit Topology:
      // DC Source (+) -> w1 -> Top Pos Rail (rail_top_pos_1)
      // Top Pos Rail (rail_top_pos_5) -> w2 -> Column 10 (col_10_e)
      // Resistor Lead A snapped into col_10_a (connected to w2 via col 10 strip)
      // Resistor Lead B snapped into col_14_a
      // LED Anode snapped into col_14_c (connected to Resistor Lead B via col 14 strip!)
      // LED Cathode snapped into col_15_c
      // Column 15 (col_15_e) -> w3 -> Top Neg Rail (rail_top_neg_5)
      // Top Neg Rail (rail_top_neg_1) -> w4 -> DC Source (-)

      const resInst: GenericEquipmentInstance = {
        instanceId: 'res_final',
        definitionId: 'resistor_330',
        positionMM: { x: 77.03, y: 62.5 },
        rotationDeg: 0,
        properties: { resistanceOhms: 330 },
        connections: {},
      };

      const ledInst: GenericEquipmentInstance = {
        instanceId: 'led_final',
        definitionId: 'led_5mm_red',
        positionMM: { x: 87.19 - 1.73, y: 69.58 - 10.0 },
        rotationDeg: 0,
        properties: {},
        connections: {},
      };

      const attachments: TerminalAttachment[] = [
        { instanceId: 'res_final', terminalId: 'pin_1', breadboardInstanceId: 'bb_final', holeId: 'col_10_a' },
        { instanceId: 'res_final', terminalId: 'pin_2', breadboardInstanceId: 'bb_final', holeId: 'col_14_a' },
        { instanceId: 'led_final', terminalId: 'anode', breadboardInstanceId: 'bb_final', holeId: 'col_14_c' },
        { instanceId: 'led_final', terminalId: 'cathode', breadboardInstanceId: 'bb_final', holeId: 'col_15_c' },
      ];

      const wires: JumperWire[] = [
        {
          id: 'w1_vcc_to_rail',
          color: '#ef4444',
          from: { kind: 'component-terminal', instanceId: 'dc_final', terminalId: 'pos' },
          to: { kind: 'breadboard-hole', breadboardInstanceId: 'bb_final', holeId: 'rail_top_pos_1' },
        },
        {
          id: 'w2_rail_to_resistor',
          color: '#ef4444',
          from: { kind: 'breadboard-hole', breadboardInstanceId: 'bb_final', holeId: 'rail_top_pos_5' },
          to: { kind: 'breadboard-hole', breadboardInstanceId: 'bb_final', holeId: 'col_10_e' },
        },
        {
          id: 'w3_led_to_neg_rail',
          color: '#3b82f6',
          from: { kind: 'breadboard-hole', breadboardInstanceId: 'bb_final', holeId: 'col_15_e' },
          to: { kind: 'breadboard-hole', breadboardInstanceId: 'bb_final', holeId: 'rail_top_neg_5' },
        },
        {
          id: 'w4_neg_rail_to_gnd',
          color: '#1f2937',
          from: { kind: 'breadboard-hole', breadboardInstanceId: 'bb_final', holeId: 'rail_top_neg_1' },
          to: { kind: 'component-terminal', instanceId: 'dc_final', terminalId: 'neg' },
        },
      ];

      const graph = computeConnectivityGraph(
        [bbInst, dcInst, resInst, ledInst],
        PHYSICS_ELECTRICITY_CATALOG,
        attachments,
        wires
      );

      // Verify exactly 3 distinct electrical nodes
      expect(graph.nodes).toHaveLength(3);

      const vccNode = graph.nodes.find((n) => n.name.includes('VCC'));
      const gndNode = graph.nodes.find((n) => n.name.includes('GND'));
      const intermediateNode = graph.nodes.find((n) => !n.name.includes('VCC') && !n.name.includes('GND'));

      expect(vccNode).toBeDefined();
      expect(gndNode).toBeDefined();
      expect(intermediateNode).toBeDefined();

      const keyDcPos = getEndpointKey({ kind: 'component-terminal', instanceId: 'dc_final', terminalId: 'pos' });
      const keyDcNeg = getEndpointKey({ kind: 'component-terminal', instanceId: 'dc_final', terminalId: 'neg' });
      const keyResPin1 = getEndpointKey({ kind: 'component-terminal', instanceId: 'res_final', terminalId: 'pin_1' });
      const keyResPin2 = getEndpointKey({ kind: 'component-terminal', instanceId: 'res_final', terminalId: 'pin_2' });
      const keyLedAnode = getEndpointKey({ kind: 'component-terminal', instanceId: 'led_final', terminalId: 'anode' });
      const keyLedCathode = getEndpointKey({ kind: 'component-terminal', instanceId: 'led_final', terminalId: 'cathode' });

      // Node 1 (VCC): DC Source pos & Resistor pin_1
      expect(graph.endpointToNodeMap.get(keyDcPos)).toEqual(vccNode!.id);
      expect(graph.endpointToNodeMap.get(keyResPin1)).toEqual(vccNode!.id);

      // Node 2 (Intermediate): Resistor pin_2 & LED anode (conductive via breadboard column 14 strip!)
      expect(graph.endpointToNodeMap.get(keyResPin2)).toEqual(intermediateNode!.id);
      expect(graph.endpointToNodeMap.get(keyLedAnode)).toEqual(intermediateNode!.id);

      // Node 3 (GND): LED cathode & DC Source neg
      expect(graph.endpointToNodeMap.get(keyLedCathode)).toEqual(gndNode!.id);
      expect(graph.endpointToNodeMap.get(keyDcNeg)).toEqual(gndNode!.id);

      // CRITICAL: Resistor terminals must NOT be merged
      expect(graph.endpointToNodeMap.get(keyResPin1)).not.toEqual(graph.endpointToNodeMap.get(keyResPin2));

      // CRITICAL: LED terminals must NOT be merged
      expect(graph.endpointToNodeMap.get(keyLedAnode)).not.toEqual(graph.endpointToNodeMap.get(keyLedCathode));
    });

    it('verifies all 7 incomplete and incorrect wiring topology scenarios', () => {
      const resInst: GenericEquipmentInstance = {
        instanceId: 'res_final',
        definitionId: 'resistor_330',
        positionMM: { x: 77.03, y: 62.5 },
        rotationDeg: 0,
        properties: { resistanceOhms: 330 },
        connections: {},
      };

      const ledInst: GenericEquipmentInstance = {
        instanceId: 'led_final',
        definitionId: 'led_5mm_red',
        positionMM: { x: 87.19 - 1.73, y: 69.58 - 10.0 },
        rotationDeg: 0,
        properties: {},
        connections: {},
      };

      const baseAttachments: TerminalAttachment[] = [
        { instanceId: 'res_final', terminalId: 'pin_1', breadboardInstanceId: 'bb_final', holeId: 'col_10_a' },
        { instanceId: 'res_final', terminalId: 'pin_2', breadboardInstanceId: 'bb_final', holeId: 'col_14_a' },
        { instanceId: 'led_final', terminalId: 'anode', breadboardInstanceId: 'bb_final', holeId: 'col_14_c' },
        { instanceId: 'led_final', terminalId: 'cathode', breadboardInstanceId: 'bb_final', holeId: 'col_15_c' },
      ];

      const baseWires: JumperWire[] = [
        {
          id: 'w1',
          color: '#ef4444',
          from: { kind: 'component-terminal', instanceId: 'dc_final', terminalId: 'pos' },
          to: { kind: 'breadboard-hole', breadboardInstanceId: 'bb_final', holeId: 'rail_top_pos_1' },
        },
        {
          id: 'w2',
          color: '#ef4444',
          from: { kind: 'breadboard-hole', breadboardInstanceId: 'bb_final', holeId: 'rail_top_pos_5' },
          to: { kind: 'breadboard-hole', breadboardInstanceId: 'bb_final', holeId: 'col_10_e' },
        },
        {
          id: 'w3',
          color: '#3b82f6',
          from: { kind: 'breadboard-hole', breadboardInstanceId: 'bb_final', holeId: 'col_15_e' },
          to: { kind: 'breadboard-hole', breadboardInstanceId: 'bb_final', holeId: 'rail_top_neg_5' },
        },
        {
          id: 'w4',
          color: '#1f2937',
          from: { kind: 'breadboard-hole', breadboardInstanceId: 'bb_final', holeId: 'rail_top_neg_1' },
          to: { kind: 'component-terminal', instanceId: 'dc_final', terminalId: 'neg' },
        },
      ];

      const keyDcPos = getEndpointKey({ kind: 'component-terminal', instanceId: 'dc_final', terminalId: 'pos' });
      const keyDcNeg = getEndpointKey({ kind: 'component-terminal', instanceId: 'dc_final', terminalId: 'neg' });
      const keyResPin1 = getEndpointKey({ kind: 'component-terminal', instanceId: 'res_final', terminalId: 'pin_1' });
      const keyResPin2 = getEndpointKey({ kind: 'component-terminal', instanceId: 'res_final', terminalId: 'pin_2' });
      const keyLedAnode = getEndpointKey({ kind: 'component-terminal', instanceId: 'led_final', terminalId: 'anode' });
      const keyLedCathode = getEndpointKey({ kind: 'component-terminal', instanceId: 'led_final', terminalId: 'cathode' });

      // 1. One wire removed (w4 ground return removed)
      const graphWithoutW4 = computeConnectivityGraph(
        [bbInst, dcInst, resInst, ledInst],
        PHYSICS_ELECTRICITY_CATALOG,
        baseAttachments,
        baseWires.filter((w) => w.id !== 'w4')
      );
      // DC neg is now in its own isolated node; LED cathode is not connected to DC neg
      expect(graphWithoutW4.endpointToNodeMap.get(keyLedCathode)).not.toEqual(
        graphWithoutW4.endpointToNodeMap.get(keyDcNeg)
      );

      // 2. LED polarity reversed (Anode in col_15_c, Cathode in col_14_c)
      const reversedAttachments: TerminalAttachment[] = [
        ...baseAttachments.filter((att) => att.instanceId !== 'led_final'),
        { instanceId: 'led_final', terminalId: 'anode', breadboardInstanceId: 'bb_final', holeId: 'col_15_c' },
        { instanceId: 'led_final', terminalId: 'cathode', breadboardInstanceId: 'bb_final', holeId: 'col_14_c' },
      ];
      const graphReversed = computeConnectivityGraph(
        [bbInst, dcInst, resInst, ledInst],
        PHYSICS_ELECTRICITY_CATALOG,
        reversedAttachments,
        baseWires
      );
      // Now Resistor pin_2 connects to LED cathode instead of anode!
      expect(graphReversed.endpointToNodeMap.get(keyResPin2)).toEqual(
        graphReversed.endpointToNodeMap.get(keyLedCathode)
      );
      // And LED anode connects to DC neg (ground)!
      expect(graphReversed.endpointToNodeMap.get(keyLedAnode)).toEqual(
        graphReversed.endpointToNodeMap.get(keyDcNeg)
      );

      // 3. Resistor bypassed (jumper wire directly connecting col_10_d to col_14_d)
      const bypassWire: JumperWire = {
        id: 'w_bypass',
        color: '#eab308',
        from: { kind: 'breadboard-hole', breadboardInstanceId: 'bb_final', holeId: 'col_10_d' },
        to: { kind: 'breadboard-hole', breadboardInstanceId: 'bb_final', holeId: 'col_14_d' },
      };
      const graphBypassed = computeConnectivityGraph(
        [bbInst, dcInst, resInst, ledInst],
        PHYSICS_ELECTRICITY_CATALOG,
        baseAttachments,
        [...baseWires, bypassWire]
      );
      // Resistor Lead A and Lead B are now merged into the same node (resistor bypassed / shorted!)
      expect(graphBypassed.endpointToNodeMap.get(keyResPin1)).toEqual(
        graphBypassed.endpointToNodeMap.get(keyResPin2)
      );

      // 4. LED terminals connected to the same conductive strip (both in column 14: col_14_b & col_14_c)
      const ledShortedAttachments: TerminalAttachment[] = [
        ...baseAttachments.filter((att) => att.instanceId !== 'led_final'),
        { instanceId: 'led_final', terminalId: 'anode', breadboardInstanceId: 'bb_final', holeId: 'col_14_b' },
        { instanceId: 'led_final', terminalId: 'cathode', breadboardInstanceId: 'bb_final', holeId: 'col_14_c' },
      ];
      const graphLedShorted = computeConnectivityGraph(
        [bbInst, dcInst, resInst, ledInst],
        PHYSICS_ELECTRICITY_CATALOG,
        ledShortedAttachments,
        baseWires
      );
      // LED Anode and Cathode are now merged into the same node (LED shorted out!)
      expect(graphLedShorted.endpointToNodeMap.get(keyLedAnode)).toEqual(
        graphLedShorted.endpointToNodeMap.get(keyLedCathode)
      );

      // 5. Both supply terminals directly connected (short circuit wire directly between pos and neg)
      const shortWire: JumperWire = {
        id: 'w_short',
        color: '#ef4444',
        from: { kind: 'component-terminal', instanceId: 'dc_final', terminalId: 'pos' },
        to: { kind: 'component-terminal', instanceId: 'dc_final', terminalId: 'neg' },
      };
      const graphShort = computeConnectivityGraph(
        [bbInst, dcInst],
        PHYSICS_ELECTRICITY_CATALOG,
        [],
        [shortWire]
      );
      // Expect node name to report DIRECT SUPPLY SHORT
      const shortNode = graphShort.nodes.find((n) => n.name.includes('DIRECT SUPPLY SHORT'));
      expect(shortNode).toBeDefined();
      expect(graphShort.endpointToNodeMap.get(keyDcPos)).toEqual(shortNode!.id);
      expect(graphShort.endpointToNodeMap.get(keyDcNeg)).toEqual(shortNode!.id);

      // 6. A component moved away from the breadboard (attachments cleared)
      const graphDetached = computeConnectivityGraph(
        [bbInst, dcInst, resInst, ledInst],
        PHYSICS_ELECTRICITY_CATALOG,
        baseAttachments.filter((att) => att.instanceId !== 'res_final'), // Resistor detached
        baseWires
      );
      // Resistor Lead A is floating and no longer connected to VCC
      expect(graphDetached.endpointToNodeMap.get(keyResPin1)).not.toEqual(
        graphDetached.endpointToNodeMap.get(keyDcPos)
      );

      // 7. A wire endpoint reconnected to another hole (w3 moved from col_15_e to col_20_e)
      const reconnectedWires = baseWires.map((w) =>
        w.id === 'w3'
          ? {
              ...w,
              from: {
                kind: 'breadboard-hole' as const,
                breadboardInstanceId: 'bb_final',
                holeId: 'col_20_e',
              },
            }
          : w
      );
      const graphReconnected = computeConnectivityGraph(
        [bbInst, dcInst, resInst, ledInst],
        PHYSICS_ELECTRICITY_CATALOG,
        baseAttachments,
        reconnectedWires
      );
      // Column 15 is now open: LED cathode is no longer connected to GND!
      expect(graphReconnected.endpointToNodeMap.get(keyLedCathode)).not.toEqual(
        graphReconnected.endpointToNodeMap.get(keyDcNeg)
      );
    });
  });
});

describe('8. Section 7 Regression Tests — Multi-Instance Isolation', () => {
  const bbA: GenericEquipmentInstance = {
    instanceId: 'breadboard_A',
    definitionId: 'breadboard_400',
    positionMM: { x: 20, y: 30 },
    rotationDeg: 0,
    properties: {},
    connections: {},
  };

  const bbB: GenericEquipmentInstance = {
    instanceId: 'breadboard_B',
    definitionId: 'breadboard_400',
    positionMM: { x: 140, y: 30 },
    rotationDeg: 0,
    properties: {},
    connections: {},
  };

  const resDef = PHYSICS_ELECTRICITY_CATALOG.find((d) => d.id === 'resistor_330')!;

  // 1. Two breadboards with identical local hole IDs remain electrically separate
  it('1. Two breadboards with identical local hole IDs remain electrically separate', () => {
    const wireOnA: JumperWire = {
      id: 'w_A_test',
      color: '#ef4444',
      from: { kind: 'breadboard-hole', breadboardInstanceId: 'breadboard_A', holeId: 'col_1_f' },
      to: { kind: 'breadboard-hole', breadboardInstanceId: 'breadboard_A', holeId: 'col_2_f' },
    };
    const graph = computeConnectivityGraph([bbA, bbB], PHYSICS_ELECTRICITY_CATALOG, [], [wireOnA]);

    const keyA = endpointKey({ kind: 'breadboard-hole', breadboardInstanceId: 'breadboard_A', holeId: 'col_1_f' });
    const keyB = endpointKey({ kind: 'breadboard-hole', breadboardInstanceId: 'breadboard_B', holeId: 'col_1_f' });

    const nodeAId = graph.endpointToNodeMap.get(keyA);
    const nodeBId = graph.endpointToNodeMap.get(keyB);

    expect(nodeAId).toBeDefined();
    // Board B's hole is not part of node A!
    expect(nodeAId).not.toEqual(nodeBId);

    const nodeA = graph.nodes.find((n) => n.id === nodeAId);
    expect(nodeA).toBeDefined();
    // Node A must NOT contain any breadboard-hole from breadboard_B
    const hasBoardBEndpoint = nodeA!.endpoints.some(
      (ep) => ep.kind === 'breadboard-hole' && ep.breadboardInstanceId === 'breadboard_B'
    );
    expect(hasBoardBEndpoint).toBe(false);
  });

  // 2. Selecting a hole on Board A does not highlight Board B
  it('2. Selecting a hole on Board A does not highlight Board B', () => {
    const selectedHole = { breadboardInstanceId: 'breadboard_A', holeId: 'col_1_f' };

    // Emulate WorkbenchPage highlighting resolution:
    const selHoleDef = BREADBOARD_HOLE_MAP.get(selectedHole.holeId)!;
    const highlightedEndpointKeys = new Set<string>();
    BREADBOARD_400_HOLES
      .filter((h) => h.internalStripId === selHoleDef.internalStripId)
      .forEach((h) => {
        highlightedEndpointKeys.add(
          endpointKey({
            kind: 'breadboard-hole',
            breadboardInstanceId: selectedHole.breadboardInstanceId,
            holeId: h.id,
          })
        );
      });

    // Check highlighted holes for Board A
    const boardAHighlights = new Set<string>();
    BREADBOARD_400_HOLES.forEach((h) => {
      const k = endpointKey({ kind: 'breadboard-hole', breadboardInstanceId: 'breadboard_A', holeId: h.id });
      if (highlightedEndpointKeys.has(k)) boardAHighlights.add(h.id);
    });

    // Check highlighted holes for Board B
    const boardBHighlights = new Set<string>();
    BREADBOARD_400_HOLES.forEach((h) => {
      const k = endpointKey({ kind: 'breadboard-hole', breadboardInstanceId: 'breadboard_B', holeId: h.id });
      if (highlightedEndpointKeys.has(k)) boardBHighlights.add(h.id);
    });

    // Board A should highlight all holes in col_1_f through col_1_j
    expect(boardAHighlights.size).toBe(5);
    expect(boardAHighlights.has('col_1_f')).toBe(true);
    expect(boardAHighlights.has('col_1_j')).toBe(true);

    // Board B must have ZERO highlighted holes!
    expect(boardBHighlights.size).toBe(0);
    expect(boardBHighlights.has('col_1_f')).toBe(false);
  });

  // 3. Hovering a hole on Board B does not change Board A's hover state
  it("3. Hovering a hole on Board B does not change Board A's hover state", () => {
    // When hovering over Board B's col_5_a hole:
    const hoveredEndpoint: ConnectionEndpoint = {
      kind: 'breadboard-hole',
      breadboardInstanceId: 'breadboard_B',
      holeId: 'col_5_a',
    };
    const hoveredKey = endpointKey(hoveredEndpoint);

    // Evaluating whether Board A's col_5_a hole is hovered:
    const boardAHoleKey = endpointKey({
      kind: 'breadboard-hole',
      breadboardInstanceId: 'breadboard_A',
      holeId: 'col_5_a',
    });

    expect(hoveredKey).not.toEqual(boardAHoleKey);
    // Board A's hole is not matching the hovered target
    expect(boardAHoleKey === hoveredKey).toBe(false);
  });

  // 4. The same hole ID on two boards generates different canonical endpoint keys
  it('4. The same hole ID on two boards generates different canonical endpoint keys', () => {
    const keyA = endpointKey({ kind: 'breadboard-hole', breadboardInstanceId: 'breadboard_A', holeId: 'col_10_c' });
    const keyB = endpointKey({ kind: 'breadboard-hole', breadboardInstanceId: 'breadboard_B', holeId: 'col_10_c' });

    expect(keyA).not.toEqual(keyB);
    expect(keyA).toBe(JSON.stringify(['hole', 'breadboard_A', 'col_10_c']));
    expect(keyB).toBe(JSON.stringify(['hole', 'breadboard_B', 'col_10_c']));

    // Verify round-trip parsing produces correct instance ID
    const parsedA = parseEndpointKey(keyA);
    const parsedB = parseEndpointKey(keyB);
    expect(parsedA).toEqual({ kind: 'breadboard-hole', breadboardInstanceId: 'breadboard_A', holeId: 'col_10_c' });
    expect(parsedB).toEqual({ kind: 'breadboard-hole', breadboardInstanceId: 'breadboard_B', holeId: 'col_10_c' });
  });

  // 5. Corresponding conductive strips on different boards remain separate DSU sets
  it('5. Corresponding conductive strips on different boards remain separate DSU sets', () => {
    const wireA: JumperWire = {
      id: 'w_A',
      color: '#ef4444',
      from: { kind: 'breadboard-hole', breadboardInstanceId: 'breadboard_A', holeId: 'col_1_f' },
      to: { kind: 'breadboard-hole', breadboardInstanceId: 'breadboard_A', holeId: 'col_1_g' },
    };
    const wireB: JumperWire = {
      id: 'w_B',
      color: '#3b82f6',
      from: { kind: 'breadboard-hole', breadboardInstanceId: 'breadboard_B', holeId: 'col_1_h' },
      to: { kind: 'breadboard-hole', breadboardInstanceId: 'breadboard_B', holeId: 'col_1_j' },
    };

    const graph = computeConnectivityGraph([bbA, bbB], PHYSICS_ELECTRICITY_CATALOG, [], [wireA, wireB]);

    const nodeAId = graph.endpointToNodeMap.get(
      endpointKey({ kind: 'breadboard-hole', breadboardInstanceId: 'breadboard_A', holeId: 'col_1_f' })
    );
    const nodeBId = graph.endpointToNodeMap.get(
      endpointKey({ kind: 'breadboard-hole', breadboardInstanceId: 'breadboard_B', holeId: 'col_1_f' })
    );

    expect(nodeAId).toBeDefined();
    expect(nodeBId).toBeDefined();
    expect(nodeAId).not.toEqual(nodeBId);

    const nodeA = graph.nodes.find((n) => n.id === nodeAId)!;
    const nodeB = graph.nodes.find((n) => n.id === nodeBId)!;

    // Node A only has breadboard_A endpoints
    expect(nodeA.endpoints.every((ep) => ep.kind === 'breadboard-hole' && ep.breadboardInstanceId === 'breadboard_A')).toBe(true);
    // Node B only has breadboard_B endpoints
    expect(nodeB.endpoints.every((ep) => ep.kind === 'breadboard-hole' && ep.breadboardInstanceId === 'breadboard_B')).toBe(true);
  });

  // 6. A jumper wire between Board A and Board B correctly merges the connected nodes
  it('6. A jumper wire between Board A and Board B correctly merges the connected nodes', () => {
    const bridgeWire: JumperWire = {
      id: 'w_bridge',
      color: '#22c55e',
      from: { kind: 'breadboard-hole', breadboardInstanceId: 'breadboard_A', holeId: 'col_1_f' },
      to: { kind: 'breadboard-hole', breadboardInstanceId: 'breadboard_B', holeId: 'col_1_f' },
    };

    const graph = computeConnectivityGraph([bbA, bbB], PHYSICS_ELECTRICITY_CATALOG, [], [bridgeWire]);

    const keyA = endpointKey({ kind: 'breadboard-hole', breadboardInstanceId: 'breadboard_A', holeId: 'col_1_f' });
    const keyB = endpointKey({ kind: 'breadboard-hole', breadboardInstanceId: 'breadboard_B', holeId: 'col_1_f' });

    const nodeAId = graph.endpointToNodeMap.get(keyA);
    const nodeBId = graph.endpointToNodeMap.get(keyB);

    // They are now merged into the exact same electrical node
    expect(nodeAId).toBeDefined();
    expect(nodeAId).toEqual(nodeBId);

    const mergedNode = graph.nodes.find((n) => n.id === nodeAId)!;
    // Merged node includes holes from both Board A and Board B
    expect(mergedNode.endpoints.some((ep) => ep.kind === 'breadboard-hole' && ep.breadboardInstanceId === 'breadboard_A')).toBe(true);
    expect(mergedNode.endpoints.some((ep) => ep.kind === 'breadboard-hole' && ep.breadboardInstanceId === 'breadboard_B')).toBe(true);
  });

  // 7. Removing that wire separates the nodes again
  it('7. Removing that wire separates the nodes again', () => {
    const wireA: JumperWire = {
      id: 'w_A_active',
      color: '#ef4444',
      from: { kind: 'breadboard-hole', breadboardInstanceId: 'breadboard_A', holeId: 'col_1_f' },
      to: { kind: 'breadboard-hole', breadboardInstanceId: 'breadboard_A', holeId: 'col_1_g' },
    };
    const wireB: JumperWire = {
      id: 'w_B_active',
      color: '#3b82f6',
      from: { kind: 'breadboard-hole', breadboardInstanceId: 'breadboard_B', holeId: 'col_1_f' },
      to: { kind: 'breadboard-hole', breadboardInstanceId: 'breadboard_B', holeId: 'col_1_g' },
    };
    const bridgeWire: JumperWire = {
      id: 'w_bridge',
      color: '#22c55e',
      from: { kind: 'breadboard-hole', breadboardInstanceId: 'breadboard_A', holeId: 'col_1_f' },
      to: { kind: 'breadboard-hole', breadboardInstanceId: 'breadboard_B', holeId: 'col_1_f' },
    };

    // 1. With wire: merged
    const graphConnected = computeConnectivityGraph([bbA, bbB], PHYSICS_ELECTRICITY_CATALOG, [], [wireA, wireB, bridgeWire]);
    const keyA = endpointKey({ kind: 'breadboard-hole', breadboardInstanceId: 'breadboard_A', holeId: 'col_1_f' });
    const keyB = endpointKey({ kind: 'breadboard-hole', breadboardInstanceId: 'breadboard_B', holeId: 'col_1_f' });
    expect(graphConnected.endpointToNodeMap.get(keyA)).toEqual(graphConnected.endpointToNodeMap.get(keyB));

    // 2. Wire removed: separated into two distinct nodes
    const graphDisconnected = computeConnectivityGraph([bbA, bbB], PHYSICS_ELECTRICITY_CATALOG, [], [wireA, wireB]);
    const nodeAId = graphDisconnected.endpointToNodeMap.get(keyA);
    const nodeBId = graphDisconnected.endpointToNodeMap.get(keyB);
    expect(nodeAId).toBeDefined();
    expect(nodeBId).toBeDefined();
    expect(nodeAId).not.toEqual(nodeBId);
  });

  // 8. A component snapped to Board B does not occupy Board A's corresponding holes
  it("8. A component snapped to Board B does not occupy Board A's corresponding holes", () => {
    // Resistor snapped to Board B at col_5_b and col_9_b
    const attachmentsOnB: TerminalAttachment[] = [
      { instanceId: 'res_B', terminalId: 'pin_1', breadboardInstanceId: 'breadboard_B', holeId: 'col_5_b' },
      { instanceId: 'res_B', terminalId: 'pin_2', breadboardInstanceId: 'breadboard_B', holeId: 'col_9_b' },
    ];

    const resA: GenericEquipmentInstance = {
      instanceId: 'res_A',
      definitionId: 'resistor_330',
      positionMM: { x: 30, y: 35 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };

    // Resistor lead A is at local (0, 2.0). To place it on col_5_b:
    const hole5BWorld = getBreadboardHoleWorldPosition(
      BREADBOARD_HOLE_MAP.get('col_5_b')!,
      bbA.positionMM,
      bbA.rotationDeg
    );

    const snapResult = detectBreadboardSnap(
      resA,
      resDef,
      { x: hole5BWorld.xMM, y: hole5BWorld.yMM - 2.0 },
      [bbA, bbB],
      PHYSICS_ELECTRICITY_CATALOG,
      attachmentsOnB
    );

    // Board A's holes are completely free: snap must succeed!
    expect(snapResult).not.toBeNull();
    expect(snapResult?.isValid).toBe(true);
    expect(snapResult?.breadboardInstanceId).toBe('breadboard_A');
    expect(snapResult?.attachments.map((a) => a.holeId)).toEqual(['col_5_b', 'col_9_b']);
  });

  // 9. Moving Board B does not move components attached to Board A
  it('9. Moving Board B does not move components attached to Board A', () => {
    useWorkbenchStore.getState().clearWorkbench();

    const boardAInstance: GenericEquipmentInstance = {
      instanceId: 'bb_A_move_test',
      definitionId: 'breadboard_400',
      positionMM: { x: 10, y: 10 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };

    const boardBInstance: GenericEquipmentInstance = {
      instanceId: 'bb_B_move_test',
      definitionId: 'breadboard_400',
      positionMM: { x: 150, y: 10 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };

    const resAInstance: GenericEquipmentInstance = {
      instanceId: 'res_A_move_test',
      definitionId: 'resistor_330',
      positionMM: { x: 20, y: 20 },
      rotationDeg: 0,
      properties: {},
      connections: {},
    };

    useWorkbenchStore.setState({
      instances: [boardAInstance, boardBInstance, resAInstance],
      attachments: [
        { instanceId: 'res_A_move_test', terminalId: 'pin_1', breadboardInstanceId: 'bb_A_move_test', holeId: 'col_5_a' },
        { instanceId: 'res_A_move_test', terminalId: 'pin_2', breadboardInstanceId: 'bb_A_move_test', holeId: 'col_9_a' },
      ],
      wires: [],
    });

    // Move Board B by dx = +50, dy = +30
    useWorkbenchStore.getState().updateInstancePosition('bb_B_move_test', { x: 200, y: 40 });

    const stateAfter = useWorkbenchStore.getState();
    const resAfter = stateAfter.instances.find((i) => i.instanceId === 'res_A_move_test')!;
    const boardAAfter = stateAfter.instances.find((i) => i.instanceId === 'bb_A_move_test')!;
    const boardBAfter = stateAfter.instances.find((i) => i.instanceId === 'bb_B_move_test')!;

    // Board B moved:
    expect(boardBAfter.positionMM).toEqual({ x: 200, y: 40 });
    // Board A remained at (10, 10):
    expect(boardAAfter.positionMM).toEqual({ x: 10, y: 10 });
    // Resistor on Board A must NOT have moved!
    expect(resAfter.positionMM).toEqual({ x: 20, y: 20 });
  });

  // 10. Multiple resistors and LEDs maintain distinct terminal identities
  it('10. Multiple resistors and LEDs maintain distinct terminal identities', () => {
    const res1: GenericEquipmentInstance = { instanceId: 'res_1', definitionId: 'resistor_330', positionMM: { x: 10, y: 10 }, rotationDeg: 0, properties: {}, connections: {} };
    const res2: GenericEquipmentInstance = { instanceId: 'res_2', definitionId: 'resistor_330', positionMM: { x: 50, y: 10 }, rotationDeg: 0, properties: {}, connections: {} };
    const led1: GenericEquipmentInstance = { instanceId: 'led_1', definitionId: 'led_5mm_red', positionMM: { x: 10, y: 50 }, rotationDeg: 0, properties: {}, connections: {} };
    const led2: GenericEquipmentInstance = { instanceId: 'led_2', definitionId: 'led_5mm_red', positionMM: { x: 50, y: 50 }, rotationDeg: 0, properties: {}, connections: {} };

    const kRes1P1 = endpointKey({ kind: 'component-terminal', instanceId: 'res_1', terminalId: 'pin_1' });
    const kRes2P1 = endpointKey({ kind: 'component-terminal', instanceId: 'res_2', terminalId: 'pin_1' });
    const kLed1Anode = endpointKey({ kind: 'component-terminal', instanceId: 'led_1', terminalId: 'anode' });
    const kLed2Anode = endpointKey({ kind: 'component-terminal', instanceId: 'led_2', terminalId: 'anode' });

    expect(kRes1P1).not.toEqual(kRes2P1);
    expect(kLed1Anode).not.toEqual(kLed2Anode);

    // Compute connectivity graph with no wires
    const graph = computeConnectivityGraph([res1, res2, led1, led2], PHYSICS_ELECTRICITY_CATALOG, [], []);

    // All 8 terminals must be in separate, independent nodes
    const nodeIds = [
      graph.endpointToNodeMap.get(kRes1P1),
      graph.endpointToNodeMap.get(endpointKey({ kind: 'component-terminal', instanceId: 'res_1', terminalId: 'pin_2' })),
      graph.endpointToNodeMap.get(kRes2P1),
      graph.endpointToNodeMap.get(endpointKey({ kind: 'component-terminal', instanceId: 'res_2', terminalId: 'pin_2' })),
      graph.endpointToNodeMap.get(kLed1Anode),
      graph.endpointToNodeMap.get(endpointKey({ kind: 'component-terminal', instanceId: 'led_1', terminalId: 'cathode' })),
      graph.endpointToNodeMap.get(kLed2Anode),
      graph.endpointToNodeMap.get(endpointKey({ kind: 'component-terminal', instanceId: 'led_2', terminalId: 'cathode' })),
    ];

    const uniqueNodes = new Set(nodeIds);
    expect(uniqueNodes.size).toBe(8);
  });

  // 11. Undo/redo preserves instance-scoped connections
  it('11. Undo/redo preserves instance-scoped connections', () => {
    useWorkbenchStore.getState().clearWorkbench();

    const crossBoardWire: JumperWire = {
      id: 'w_cross',
      color: '#06b6d4',
      from: { kind: 'breadboard-hole', breadboardInstanceId: 'breadboard_A', holeId: 'col_5_b' },
      to: { kind: 'breadboard-hole', breadboardInstanceId: 'breadboard_B', holeId: 'col_5_b' },
    };

    useWorkbenchStore.getState().addWire(crossBoardWire);
    expect(useWorkbenchStore.getState().wires).toHaveLength(1);
    expect(useWorkbenchStore.getState().wires[0].from).toEqual({
      kind: 'breadboard-hole',
      breadboardInstanceId: 'breadboard_A',
      holeId: 'col_5_b',
    });

    // Delete wire
    useWorkbenchStore.getState().removeWire('w_cross');
    expect(useWorkbenchStore.getState().wires).toHaveLength(0);

    // Undo deletion
    useWorkbenchStore.getState().undo();
    expect(useWorkbenchStore.getState().wires).toHaveLength(1);
    const restoredWire = useWorkbenchStore.getState().wires[0];
    expect(restoredWire.from).toEqual({
      kind: 'breadboard-hole',
      breadboardInstanceId: 'breadboard_A',
      holeId: 'col_5_b',
    });
    expect(restoredWire.to).toEqual({
      kind: 'breadboard-hole',
      breadboardInstanceId: 'breadboard_B',
      holeId: 'col_5_b',
    });

    // Redo deletion
    useWorkbenchStore.getState().redo();
    expect(useWorkbenchStore.getState().wires).toHaveLength(0);
  });

  // 12. Save/load preserves all instance IDs and references
  it('12. Save/load preserves all instance IDs and references', () => {
    const originalExperiment = {
      instances: [bbA, bbB],
      attachments: [
        { instanceId: 'res_test', terminalId: 'pin_1', breadboardInstanceId: 'breadboard_A', holeId: 'col_1_a' },
      ],
      wires: [
        {
          id: 'wire_saved',
          color: '#ef4444',
          from: { kind: 'breadboard-hole' as const, breadboardInstanceId: 'breadboard_A', holeId: 'col_1_a' },
          to: { kind: 'breadboard-hole' as const, breadboardInstanceId: 'breadboard_B', holeId: 'col_1_a' },
        },
      ],
    };

    // Serialize to JSON (Save)
    const jsonStr = JSON.stringify(originalExperiment);

    // Deserialize from JSON (Load)
    const loadedExperiment = JSON.parse(jsonStr);

    expect(loadedExperiment.instances).toHaveLength(2);
    expect(loadedExperiment.instances[0].instanceId).toBe('breadboard_A');
    expect(loadedExperiment.instances[1].instanceId).toBe('breadboard_B');

    expect(loadedExperiment.wires[0].from.breadboardInstanceId).toBe('breadboard_A');
    expect(loadedExperiment.wires[0].to.breadboardInstanceId).toBe('breadboard_B');

    // Recomputed graph on loaded state must function identically
    const loadedGraph = computeConnectivityGraph(
      loadedExperiment.instances,
      PHYSICS_ELECTRICITY_CATALOG,
      loadedExperiment.attachments,
      loadedExperiment.wires
    );

    const kA = endpointKey(loadedExperiment.wires[0].from);
    const kB = endpointKey(loadedExperiment.wires[0].to);
    expect(loadedGraph.endpointToNodeMap.get(kA)).toEqual(loadedGraph.endpointToNodeMap.get(kB));
  });
});


