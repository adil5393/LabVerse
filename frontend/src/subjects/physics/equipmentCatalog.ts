import type { ElectricalEquipmentDefinition } from '../../types/physics';

export const PHYSICS_ELECTRICITY_CATALOG: ElectricalEquipmentDefinition[] = [
  {
    id: 'breadboard_half_400',
    name: 'Half-Size Solderless Breadboard',
    subjectId: 'physics',
    category: 'Prototyping',
    description: '400-tie-point prototyping base with dual power rails and 2.54mm pitch terminal columns (a–e and f–j).',
    icon: 'grid_4x4',
    dimensionsMM: { width: 82.0, height: 55.0 },
    simulationModel: 'breadboard',
    terminals: [], // 400 internal addressable holes defined by geometry engine
    defaultProperties: {
      tiePoints: 400,
      columns: 30,
      terminalRows: 'a-e, f-j',
      hasPowerRails: true,
    },
  },
  {
    id: 'dc_source_5v',
    name: 'DC Bench Power Supply',
    subjectId: 'physics',
    category: 'Power Sources',
    description: 'Regulated DC constant-voltage supply with positive (+) and negative (-) binding post terminals.',
    icon: 'bolt',
    dimensionsMM: { width: 50.0, height: 40.0 },
    simulationModel: 'voltage_source',
    terminals: [
      {
        id: 'pos',
        label: '+ (VCC)',
        relativePositionMM: { x: 15.0, y: 20.0 },
        type: 'binding_post',
        polarity: 'positive',
        colorCode: '#ef4444',
      },
      {
        id: 'neg',
        label: '- (GND)',
        relativePositionMM: { x: 35.0, y: 20.0 },
        type: 'binding_post',
        polarity: 'negative',
        colorCode: '#1f2937',
      },
    ],
    defaultProperties: {
      voltageV: 5.0,
      maxCurrentA: 1.0,
      enabled: false,
    },
  },
  {
    id: 'resistor_330',
    name: 'Through-Hole Resistor',
    subjectId: 'physics',
    category: 'Passive Components',
    description: 'Linear carbon-film resistor with 4-band color coding to limit current in series loops.',
    icon: 'linear_scale',
    dimensionsMM: { width: 10.16, height: 4.0 },
    simulationModel: 'resistor',
    terminals: [
      {
        id: 'pin_1',
        label: 'Lead A',
        relativePositionMM: { x: 0, y: 2.0 },
        type: 'electrical_pin',
        polarity: 'neutral',
      },
      {
        id: 'pin_2',
        label: 'Lead B',
        relativePositionMM: { x: 10.16, y: 2.0 }, // 4 pitches @ 2.54mm
        type: 'electrical_pin',
        polarity: 'neutral',
      },
    ],
    defaultProperties: {
      resistanceOhms: 330,
      tolerancePercent: 5,
      powerRatingWatts: 0.25,
    },
  },
  {
    id: 'led_5mm_red',
    name: '5mm Red Diffused LED',
    subjectId: 'physics',
    category: 'Semiconductors',
    description: 'Unidirectional gallium arsenide phosphide semiconductor light source (2.0V forward drop).',
    icon: 'lightbulb',
    dimensionsMM: { width: 6.0, height: 10.0 },
    simulationModel: 'led',
    terminals: [
      {
        id: 'anode',
        label: 'Anode (+)',
        relativePositionMM: { x: 1.73, y: 10.0 },
        type: 'electrical_pin',
        polarity: 'positive',
        colorCode: '#ef4444',
      },
      {
        id: 'cathode',
        label: 'Cathode (-)',
        relativePositionMM: { x: 4.27, y: 10.0 }, // 1 pitch @ 2.54mm
        type: 'electrical_pin',
        polarity: 'negative',
        colorCode: '#3b82f6',
      },
    ],
    defaultProperties: {
      color: 'red',
      forwardVoltageV: 2.0,
      maxCurrentA: 0.03, // 30mA max
      nominalCurrentA: 0.01, // 10mA nominal
    },
  },
  {
    id: 'jumper_wire',
    name: 'Flexible Jumper Wire',
    subjectId: 'physics',
    category: 'Wiring & Interconnects',
    description: '24 AWG solid-core insulated jumper wire with 0.6mm male pins at both ends.',
    icon: 'conversion_path',
    dimensionsMM: { width: 30.0, height: 5.0 },
    simulationModel: 'jumper_wire',
    terminals: [
      {
        id: 'tip_a',
        label: 'Lead A',
        relativePositionMM: { x: 0, y: 2.5 },
        type: 'electrical_pin',
        polarity: 'neutral',
      },
      {
        id: 'tip_b',
        label: 'Lead B',
        relativePositionMM: { x: 30.0, y: 2.5 },
        type: 'electrical_pin',
        polarity: 'neutral',
      },
    ],
    defaultProperties: {
      wireColor: '#ef4444',
      gaugeAWG: 24,
      resistanceOhms: 0.01,
    },
  },
];
