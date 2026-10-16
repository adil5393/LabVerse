import { describe, it, expect, beforeEach } from 'vitest';
import { useMathStore } from '../../../store/useMathStore';
import { DEFAULT_MATH_COLORS, MATH_COLOR_PALETTE, isPresetColor, normalizeHexColor } from '../appearance';
import type { MathPoint, MathSegment, MathLine, MathSaveFile } from '../types';

describe('Milestone M1.2C: Point, Line & Measurement Color Customization', () => {
  beforeEach(() => {
    // Reset to canonical experiment with points A(2,3) and B(7,6)
    useMathStore.getState().resetExperiment('distance-between-two-points');
  });

  // Requirement 1: Default colors for newly created points
  it('1. applies default color to newly created points and preserves previous points when default changes', () => {
    const store = useMathStore.getState();
    expect(store.defaultColors.point).toBe(DEFAULT_MATH_COLORS.point);

    // Create Point 1 with initial default (#60A5FA)
    const pt1 = store.createPoint(1, 2);
    expect(pt1.color).toBe(DEFAULT_MATH_COLORS.point);
    expect(useMathStore.getState().objects[pt1.id].color).toBe(DEFAULT_MATH_COLORS.point);

    // Change default point color to Rose (#FB7185)
    store.setDefaultColor('point', '#FB7185');
    expect(useMathStore.getState().defaultColors.point).toBe('#FB7185');

    // Create Point 2 with new default
    const pt2 = store.createPoint(3, 4);
    expect(pt2.color).toBe('#FB7185');
    expect(useMathStore.getState().objects[pt2.id].color).toBe('#FB7185');

    // Previously created Point 1 must not be recolored
    expect(useMathStore.getState().objects[pt1.id].color).toBe(DEFAULT_MATH_COLORS.point);
  });

  // Requirement 2: Default colors for new segments and infinite lines
  it('2. applies independent default colors to segments and infinite lines', () => {
    const store = useMathStore.getState();
    const pt1 = store.createPoint(0, 0);
    const pt2 = store.createPoint(4, 3);
    const pt3 = store.createPoint(6, 8);

    // Create segment with default segment color (#A78BFA)
    const seg1 = store.createSegment(pt1.id, pt2.id)!;
    expect(seg1.color).toBe(DEFAULT_MATH_COLORS.segment);

    // Create line with default line color (#22D3EE)
    const line1 = store.createLine(pt1.id, pt2.id)!;
    expect(line1.color).toBe(DEFAULT_MATH_COLORS.line);

    // Change default segment color to Green (#34D399)
    store.setDefaultColor('segment', '#34D399');
    const seg2 = store.createSegment(pt2.id, pt3.id)!;
    expect(seg2.color).toBe('#34D399');

    // seg1 must retain its original color
    expect(useMathStore.getState().objects[seg1.id].color).toBe(DEFAULT_MATH_COLORS.segment);
    // line1 must retain its line color
    expect(useMathStore.getState().objects[line1.id].color).toBe(DEFAULT_MATH_COLORS.line);
  });

  // Requirement 3: Color changes on existing objects and reset to default
  it('3. allows recoloring existing objects and measurements, and resetting them to default', () => {
    const store = useMathStore.getState();
    const pt1 = store.createPoint(2, 2);

    // Change color of existing point
    store.setObjectColor(pt1.id, '#F97316');
    expect(useMathStore.getState().objects[pt1.id].color).toBe('#F97316');

    // Reset to default color
    store.resetObjectColorToDefault(pt1.id);
    expect(useMathStore.getState().objects[pt1.id].color).toBe(useMathStore.getState().defaultColors.point);

    // Test measurement recoloring
    const meas = store.createMeasurement('pt_A', 'pt_B')!;
    store.setMeasurementColor(meas.id, '#34D399');
    expect(useMathStore.getState().measurements[meas.id].color).toBe('#34D399');

    // Reset measurement to default color
    store.resetObjectColorToDefault(meas.id);
    expect(useMathStore.getState().measurements[meas.id].color).toBe(
      useMathStore.getState().defaultColors.measurement
    );
  });

  // Requirement 4: Independent colors for connected objects
  it('4. guarantees independent colors for connected points, segments, lines, and measurements', () => {
    const store = useMathStore.getState();
    const ptA = store.objects['pt_A'] as MathPoint;
    const ptB = store.objects['pt_B'] as MathPoint;
    const seg = store.createSegment('pt_A', 'pt_B')!;
    const meas = store.createMeasurement('pt_A', 'pt_B')!;

    // Set distinctive colors on all four
    store.setObjectColor(ptA.id, '#60A5FA'); // Blue
    store.setObjectColor(ptB.id, '#34D399'); // Green
    store.setObjectColor(seg.id, '#FB7185'); // Rose
    store.setMeasurementColor(meas.id, '#F59E0B'); // Amber

    const state1 = useMathStore.getState();
    expect(state1.objects[ptA.id].color).toBe('#60A5FA');
    expect(state1.objects[ptB.id].color).toBe('#34D399');
    expect(state1.objects[seg.id].color).toBe('#FB7185');
    expect(state1.measurements[meas.id].color).toBe('#F59E0B');

    // Recoloring segment must NOT recolor connected points or measurement
    store.setObjectColor(seg.id, '#A78BFA'); // Purple
    const state2 = useMathStore.getState();
    expect(state2.objects[seg.id].color).toBe('#A78BFA');
    expect(state2.objects[ptA.id].color).toBe('#60A5FA');
    expect(state2.objects[ptB.id].color).toBe('#34D399');
    expect(state2.measurements[meas.id].color).toBe('#F59E0B');

    // Recoloring Point A must NOT recolor Point B, segment, or measurement
    store.setObjectColor(ptA.id, '#F97316'); // Orange
    const state3 = useMathStore.getState();
    expect(state3.objects[ptA.id].color).toBe('#F97316');
    expect(state3.objects[ptB.id].color).toBe('#34D399');
    expect(state3.objects[seg.id].color).toBe('#A78BFA');
    expect(state3.measurements[meas.id].color).toBe('#F59E0B');
  });

  // Requirement 5: Point label color synchronization
  it('5. synchronizes point color with its label accent', () => {
    const store = useMathStore.getState();
    const pt = store.createPoint(5, 5);

    store.setObjectColor(pt.id, '#FB7185');
    const updated = useMathStore.getState().objects[pt.id] as MathPoint;
    expect(updated.color).toBe('#FB7185');
  });

  // Requirement 6: Segment label color synchronization
  it('6. synchronizes segment color with its label and stroke', () => {
    const store = useMathStore.getState();
    const seg = store.createSegment('pt_A', 'pt_B')!;

    store.setObjectColor(seg.id, '#34D399');
    const updated = useMathStore.getState().objects[seg.id] as MathSegment;
    expect(updated.color).toBe('#34D399');
  });

  // Requirement 7: Infinite line equation label color synchronization
  it('7. synchronizes infinite line color with its equation badge and stroke', () => {
    const store = useMathStore.getState();
    const line = store.createLine('pt_A', 'pt_B')!;

    store.setObjectColor(line.id, '#F97316');
    const updated = useMathStore.getState().objects[line.id] as MathLine;
    expect(updated.color).toBe('#F97316');
  });

  // Requirement 8: Measurement label color synchronization
  it('8. synchronizes distance measurement color with its distance pill and hypotenuse', () => {
    const store = useMathStore.getState();
    const meas = store.createMeasurement('pt_A', 'pt_B')!;

    store.setMeasurementColor(meas.id, '#22D3EE');
    const updated = useMathStore.getState().measurements[meas.id];
    expect(updated.color).toBe('#22D3EE');
  });

  // Requirement 9: Undo/redo of color changes
  it('9. supports atomic single-step undo and redo of object and measurement color changes', () => {
    const store = useMathStore.getState();
    const pt = store.createPoint(3, 3);
    const initialColor = pt.color;

    // Change color C1 -> C2
    store.setObjectColor(pt.id, '#FB7185');
    expect(useMathStore.getState().objects[pt.id].color).toBe('#FB7185');

    // Undo restores initial color C1
    store.undo();
    expect(useMathStore.getState().objects[pt.id].color).toBe(initialColor);

    // Redo restores C2
    store.redo();
    expect(useMathStore.getState().objects[pt.id].color).toBe('#FB7185');

    // Test measurement color undo/redo
    const meas = store.createMeasurement('pt_A', 'pt_B')!;
    const initialMeasColor = meas.color;
    store.setMeasurementColor(meas.id, '#34D399');
    expect(useMathStore.getState().measurements[meas.id].color).toBe('#34D399');

    store.undo();
    expect(useMathStore.getState().measurements[meas.id].color).toBe(initialMeasColor);

    store.redo();
    expect(useMathStore.getState().measurements[meas.id].color).toBe('#34D399');
  });

  // Requirement 10: Serialization and legacy fallback
  it('10. serializes object colors and falls back to default colors for legacy saves', () => {
    const store = useMathStore.getState();
    store.setDefaultColor('point', '#FB7185');
    store.setDefaultColor('segment', '#34D399');
    const pt = store.createPoint(1, 1);
    store.setObjectColor(pt.id, '#F97316');

    // Export scene
    const exported = store.exportScene();
    expect(exported.objects[pt.id].color).toBe('#F97316');
    expect(exported.defaultColors).toBeDefined();
    expect(exported.defaultColors?.point).toBe('#FB7185');

    // Simulate loading a legacy save without color properties
    const legacySave: MathSaveFile = {
      version: '1.0',
      experimentId: 'distance-between-two-points',
      title: 'Legacy Save',
      timestamp: new Date().toISOString(),
      objects: {
        legacy_pt: {
          id: 'legacy_pt',
          kind: 'point',
          label: 'L',
          x: 2,
          y: 2,
        } as MathPoint,
        legacy_seg: {
          id: 'legacy_seg',
          kind: 'segment',
          pointAId: 'legacy_pt',
          pointBId: 'legacy_pt',
        } as MathSegment,
      },
      objectOrder: ['legacy_pt', 'legacy_seg'],
      measurements: {
        legacy_meas: {
          id: 'legacy_meas',
          pointAId: 'legacy_pt',
          pointBId: 'legacy_pt',
          triangleMode: 'horizontal-then-vertical',
        },
      },
      measurementOrder: ['legacy_meas'],
      viewport: {
        panX: 0,
        panY: 0,
        zoom: 1,
        unitPixels: 44,
      },
    };

    store.loadScene(legacySave);
    const loadedState = useMathStore.getState();

    // Legacy point should inherit default point color
    expect(loadedState.objects['legacy_pt'].color).toBe(loadedState.defaultColors.point);
    // Legacy segment should inherit default segment color
    expect(loadedState.objects['legacy_seg'].color).toBe(loadedState.defaultColors.segment);
    // Legacy measurement should inherit default measurement color
    expect(loadedState.measurements['legacy_meas'].color).toBe(loadedState.defaultColors.measurement);
  });

  // Requirement 11: Preserving colors after dragging endpoints
  it('11. preserves object and measurement colors during and after point dragging', () => {
    const store = useMathStore.getState();
    store.setObjectColor('pt_A', '#FB7185');
    store.setObjectColor('pt_B', '#34D399');
    const meas = store.createMeasurement('pt_A', 'pt_B')!;
    store.setMeasurementColor(meas.id, '#F97316');

    // Move Point A
    store.setPointCoordinates('pt_A', 3, 4, true);

    const state = useMathStore.getState();
    expect(state.objects['pt_A'].color).toBe('#FB7185');
    expect(state.objects['pt_B'].color).toBe('#34D399');
    expect(state.measurements[meas.id].color).toBe('#F97316');
  });

  // Requirement 12: Clear Canvas preserving default palette choices
  it('12. preserves default color choices across clearCanvas and canvas wipes', () => {
    const store = useMathStore.getState();
    store.setDefaultColor('point', '#FB7185');
    store.setDefaultColor('segment', '#34D399');
    store.setDefaultColor('line', '#F97316');
    store.setDefaultColor('measurement', '#22D3EE');

    // Clear Canvas
    store.clearCanvas();

    const clearedState = useMathStore.getState();
    expect(Object.keys(clearedState.objects).length).toBe(0);
    expect(Object.keys(clearedState.measurements).length).toBe(0);

    // Default colors must remain intact
    expect(clearedState.defaultColors.point).toBe('#FB7185');
    expect(clearedState.defaultColors.segment).toBe('#34D399');
    expect(clearedState.defaultColors.line).toBe('#F97316');
    expect(clearedState.defaultColors.measurement).toBe('#22D3EE');

    // Newly plotted points after clearCanvas inherit the preserved custom defaults
    const newPt = store.createPoint(1, 1);
    expect(newPt.color).toBe('#FB7185');
  });

  // Helper validation: Palette utilities
  it('validates color palette values and hex normalization helpers', () => {
    expect(MATH_COLOR_PALETTE.length).toBe(8);
    expect(isPresetColor('#60A5FA')).toBe(true);
    expect(isPresetColor('#60a5fa')).toBe(true); // Case-insensitive
    expect(isPresetColor('#123456')).toBe(false);
    expect(normalizeHexColor('#fff')).toBe('#FFFFFF');
    expect(normalizeHexColor('f59e0b')).toBe('#F59E0B');
  });
});
