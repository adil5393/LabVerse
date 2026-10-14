import { describe, it, expect } from 'vitest';
import {
  screenToWorld,
  worldToScreen,
  pointerToWorld,
  worldToPointer,
  doAABBOverlap,
  calculateInitialPlacement,
  PX_PER_MM,
} from './coordinates';
import type { GenericEquipmentDefinition, GenericEquipmentInstance, ViewportTransform } from '../../types/workbench';

describe('Geometry & Coordinate Engine', () => {
  it('converts screen pixels to physical millimeters at 1.0x zoom and zero pan', () => {
    const screenX = 37.795275591; // ~10 mm in pixels
    const screenY = 75.590551182; // ~20 mm in pixels

    const world = screenToWorld(screenX, screenY, 0, 0, 1.0);
    expect(world.xMM).toBeCloseTo(10.0, 3);
    expect(world.yMM).toBeCloseTo(20.0, 3);
  });

  it('accounts for pan offset and zoom in screenToWorld conversion', () => {
    const panX = 100;
    const panY = 50;
    const zoom = 2.0;

    // 10mm at zoom 2.0 with panX 100 => 10 * PX_PER_MM * 2 + 100
    const screenX = 10 * PX_PER_MM * zoom + panX;
    const screenY = 15 * PX_PER_MM * zoom + panY;

    const world = screenToWorld(screenX, screenY, panX, panY, zoom);
    expect(world.xMM).toBeCloseTo(10.0, 3);
    expect(world.yMM).toBeCloseTo(15.0, 3);
  });

  it('accurately roundtrips world -> screen -> world coordinates', () => {
    const testCases = [
      { xMM: 0, yMM: 0, panX: 0, panY: 0, zoom: 1.0 },
      { xMM: 55.4, yMM: 82.1, panX: -120, panY: 45, zoom: 1.5 },
      { xMM: -30.0, yMM: 15.5, panX: 300, panY: -80, zoom: 0.75 },
    ];

    for (const tc of testCases) {
      const screen = worldToScreen(tc.xMM, tc.yMM, tc.panX, tc.panY, tc.zoom);
      const roundtripWorld = screenToWorld(screen.screenX, screen.screenY, tc.panX, tc.panY, tc.zoom);
      expect(roundtripWorld.xMM).toBeCloseTo(tc.xMM, 4);
      expect(roundtripWorld.yMM).toBeCloseTo(tc.yMM, 4);
    }
  });

  it('detects 2D AABB bounding box overlaps with padding', () => {
    const box1 = { x: 10, y: 10, width: 20, height: 20 };
    const overlappingBox = { x: 25, y: 25, width: 20, height: 20 };
    const separatedBox = { x: 100, y: 100, width: 20, height: 20 };

    expect(doAABBOverlap(box1, overlappingBox, 0)).toBe(true);
    expect(doAABBOverlap(box1, separatedBox, 0)).toBe(false);
  });

  it('calculates intelligent non-overlapping initial placements for equipment', () => {
    const breadboardDef: GenericEquipmentDefinition = {
      id: 'breadboard_half_400',
      name: 'Half-Size Breadboard',
      subjectId: 'physics',
      category: 'Prototyping',
      description: 'Breadboard',
      icon: 'grid_4x4',
      dimensionsMM: { width: 82, height: 55 },
      terminals: [],
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
      terminals: [],
      defaultProperties: {},
    };

    const viewport: ViewportTransform = { zoom: 1.0, panX: 0, panY: 0 };
    const catalog = [breadboardDef, resistorDef];

    // 1. Initial breadboard placement
    const pos1 = calculateInitialPlacement(breadboardDef, [], catalog, viewport, 1000, 600);
    const inst1: GenericEquipmentInstance = {
      instanceId: 'bb_1',
      definitionId: breadboardDef.id,
      positionMM: pos1,
      rotationDeg: 0,
      properties: {},
      connections: {},
    };

    // 2. Resistor A placement
    const pos2 = calculateInitialPlacement(resistorDef, [inst1], catalog, viewport, 1000, 600);
    const inst2: GenericEquipmentInstance = {
      instanceId: 'res_1',
      definitionId: resistorDef.id,
      positionMM: pos2,
      rotationDeg: 0,
      properties: {},
      connections: {},
    };

    // 3. Resistor B placement
    const pos3 = calculateInitialPlacement(resistorDef, [inst1, inst2], catalog, viewport, 1000, 600);

    // Resistor A and Resistor B MUST have separate positions and not overlap
    expect(pos2).not.toEqual(pos3);
    const boxResA = { x: pos2.x, y: pos2.y, width: 14, height: 4 };
    const boxResB = { x: pos3.x, y: pos3.y, width: 14, height: 4 };
    expect(doAABBOverlap(boxResA, boxResB, 2)).toBe(false);
  });

  describe('Authoritative pointerToWorld & worldToPointer Conversion', () => {
    it('accurately accounts for SVG canvas container offset (e.g. 260px equipment tray)', () => {
      // Simulate SVG element mounted with left = 260px (after tray)
      const mockSvg = {
        getBoundingClientRect: () => ({
          left: 260,
          top: 60,
          width: 800,
          height: 600,
          right: 1060,
          bottom: 660,
          x: 260,
          y: 60,
          toJSON: () => {},
        }),
      } as unknown as SVGSVGElement;

      const viewport = { panX: 0, panY: 0, zoom: 1.0 };

      // Pointer at clientX = 500, clientY = 300
      // Inside SVG: x = 500 - 260 = 240px, y = 300 - 60 = 240px
      const world = pointerToWorld(
        500,
        300,
        mockSvg,
        null,
        viewport
      );

      expect(world.xMM).toBeCloseTo(240 / PX_PER_MM, 3);
      expect(world.yMM).toBeCloseTo(240 / PX_PER_MM, 3);
    });

    it('accurately roundtrips pointerToWorld <-> worldToPointer across 50%, 100%, 150%, 200% zoom', () => {
      const mockSvg = {
        getBoundingClientRect: () => ({
          left: 200,
          top: 80,
          width: 1000,
          height: 700,
          right: 1200,
          bottom: 780,
          x: 200,
          y: 80,
          toJSON: () => {},
        }),
      } as unknown as SVGSVGElement;

      const zooms = [0.5, 1.0, 1.5, 2.0];
      const testPointers = [
        { clientX: 250, clientY: 120 },
        { clientX: 600, clientY: 450 },
        { clientX: 1100, clientY: 650 },
      ];

      for (const zoom of zooms) {
        const viewport = { panX: 50, panY: -30, zoom };
        for (const pt of testPointers) {
          const world = pointerToWorld(pt.clientX, pt.clientY, mockSvg, null, viewport);
          const roundtripClient = worldToPointer(world.xMM, world.yMM, mockSvg, null, viewport);

          expect(roundtripClient.clientX).toBeCloseTo(pt.clientX, 2);
          expect(roundtripClient.clientY).toBeCloseTo(pt.clientY, 2);
        }
      }
    });

    it('uses SVG getScreenCTM().inverse() when DOM matrix is available', () => {

      // Mock CTM with panX=100, panY=50, scale=1.5
      const mockCTM = {
        a: 1.5,
        b: 0,
        c: 0,
        d: 1.5,
        e: 100,
        f: 50,
        inverse: () => ({
          a: 1 / 1.5,
          b: 0,
          c: 0,
          d: 1 / 1.5,
          e: -100 / 1.5,
          f: -50 / 1.5,
        }),
      };

      const mockSvg = {
        createSVGPoint: () => ({
          x: 0,
          y: 0,
          matrixTransform: function (matrix: any) {
            return {
              x: this.x * matrix.a + matrix.e,
              y: this.y * matrix.d + matrix.f,
            };
          },
        }),
      } as unknown as SVGSVGElement;

      const mockGroup = {
        getScreenCTM: () => mockCTM,
        ownerSVGElement: mockSvg,
      } as unknown as SVGGElement;

      const world = pointerToWorld(250, 200, mockSvg, mockGroup, { panX: 100, panY: 50, zoom: 1.5 });
      // clientX 250 -> inverse CTM -> (250 - 100) / 1.5 = 100px SVG local
      // 100px / PX_PER_MM = 26.458 mm
      expect(world.xMM).toBeCloseTo(100 / PX_PER_MM, 3);
      expect(world.yMM).toBeCloseTo(100 / PX_PER_MM, 3);
    });
  });
});

