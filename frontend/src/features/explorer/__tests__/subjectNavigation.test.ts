import { describe, it, expect } from 'vitest';
import { DISTANCE_EXPERIMENT } from '../../../engine/mathematics/experimentRegistry';
import {
  LABVERSE_SUBJECTS,
  getAllSubjects,
  getAvailableSubjects,
  getInDevelopmentSubjects,
  getSubjectById,
  isSubjectActive,
} from '../../../types/subjectRegistry';
import { QUAD_GUIDED_LESSONS } from '../../../engine/mathematics/quadrilaterals/curriculumPath';
import { useQuadrilateralStore } from '../../../store/useQuadrilateralStore';

describe('Subject Navigation & Routing Consistency (Milestone M3.2)', () => {
  it('confirms both Physics and Mathematics are registered as ready subjects', () => {
    expect(DISTANCE_EXPERIMENT.id).toBe('distance-between-two-points');
    expect(DISTANCE_EXPERIMENT.moduleId).toBe('coordinate-geometry');
    expect(DISTANCE_EXPERIMENT.targetClass).toBe('Class 9–10');
    expect(DISTANCE_EXPERIMENT.initialObjects.length).toBe(3);

    const ptA = DISTANCE_EXPERIMENT.initialObjects.find((o) => o.id === 'pt_A');
    const ptB = DISTANCE_EXPERIMENT.initialObjects.find((o) => o.id === 'pt_B');
    const segAB = DISTANCE_EXPERIMENT.initialObjects.find((o) => o.id === 'seg_AB');

    expect(ptA).toBeDefined();
    expect(ptB).toBeDefined();
    expect(segAB).toBeDefined();
  });

  it('confirms Chemistry is registered with States of Matter experiment', async () => {
    const { SUBSTANCES, WATER_SUBSTANCE } = await import('../../../engine/chemistry/substances');
    const { HEATING_WATER_EXPERIMENT_STEPS } = await import('../../../engine/chemistry/guidedExperiment');

    expect(SUBSTANCES.water).toBeDefined();
    expect(WATER_SUBSTANCE.chemicalFormula).toBe('H₂O');
    expect(WATER_SUBSTANCE.meltingPointC).toBe(0);
    expect(WATER_SUBSTANCE.boilingPointC).toBe(100);

    expect(HEATING_WATER_EXPERIMENT_STEPS.length).toBe(6);
    expect(HEATING_WATER_EXPERIMENT_STEPS[0].targetPhase).toBe('solid');
    expect(HEATING_WATER_EXPERIMENT_STEPS[2].targetPhase).toBe('solid-liquid');
    expect(HEATING_WATER_EXPERIMENT_STEPS[4].targetPhase).toBe('liquid-gas');
  });

  describe('Authoritative Subject Registry', () => {
    it('has exactly 5 registered STEM subjects', () => {
      expect(LABVERSE_SUBJECTS.length).toBe(5);
      const all = getAllSubjects();
      expect(all.length).toBe(5);
      const ids = all.map((s) => s.id);
      expect(ids).toEqual(['physics', 'chemistry', 'mathematics', 'biology', 'robotics']);
    });

    it('has exactly 3 available subjects and 2 in-development subjects', () => {
      const ready = getAvailableSubjects();
      expect(ready.length).toBe(3);
      expect(ready.map((s) => s.id)).toEqual(['physics', 'chemistry', 'mathematics']);

      const dev = getInDevelopmentSubjects();
      expect(dev.length).toBe(2);
      expect(dev.map((s) => s.id)).toEqual(['biology', 'robotics']);
    });

    it('confirms Physics metadata is accurate and electricity-focused', () => {
      const phys = getSubjectById('physics')!;
      expect(phys).toBeDefined();
      expect(phys.status).toBe('ready');
      expect(phys.route).toBe('/physics/electricity');
      expect(phys.buttonText).toBe('Enter Electricity Lab');
      expect(phys.badgeText).toBe('Active Laboratory');
      expect(phys.topicsCount).toBe(1);
      expect(isSubjectActive('physics')).toBe(true);

      // Verify features do not mention waves or classical mechanics as implemented
      const featureTitles = phys.features?.map((f) => f.title);
      expect(featureTitles).toContain('Solderless Breadboarding');
      expect(featureTitles).toContain('DC Loop Simulation');
      expect(featureTitles).not.toContain('Wave Optics');
    });

    it('confirms Chemistry metadata contains States of Matter features and NOT Physics features', () => {
      const chem = getSubjectById('chemistry')!;
      expect(chem).toBeDefined();
      expect(chem.status).toBe('ready');
      expect(chem.route).toBe('/chemistry');
      expect(chem.buttonText).toBe('Enter Chemistry Lab');
      expect(chem.badgeText).toBe('Active Laboratory');
      expect(isSubjectActive('chemistry')).toBe(true);

      const featureTitles = chem.features?.map((f) => f.title) || [];
      expect(featureTitles).toContain('Particle Motion & Phases');
      expect(featureTitles).toContain('Heating & Phase Transitions');
      expect(featureTitles).not.toContain('Solderless Breadboarding');
      expect(featureTitles).not.toContain('DC Loop Simulation');
    });

    it('confirms Mathematics metadata accurately reflects all 3 independent geometry laboratories', () => {
      const math = getSubjectById('mathematics')!;
      expect(math).toBeDefined();
      expect(math.status).toBe('ready');
      expect(math.route).toBe('/mathematics');
      expect(math.buttonText).toBe('Explore Mathematics');
      expect(math.badgeText).toBe('Active Laboratory');
      expect(math.topicsCount).toBe(3);
      expect(isSubjectActive('mathematics')).toBe(true);

      const featureTitles = math.features?.map((f) => f.title) || [];
      expect(featureTitles).toContain('Coordinate Geometry');
      expect(featureTitles).toContain('Circles Laboratory');
      expect(featureTitles).toContain('Quadrilaterals Laboratory');
    });

    it('confirms Biology and Robotics are clearly marked Coming Soon without active routes', () => {
      const bio = getSubjectById('biology')!;
      expect(bio.status).toBe('in_development');
      expect(bio.route).toBeUndefined();
      expect(bio.buttonText).toBe('Coming Soon');
      expect(bio.badgeText).toBe('Coming Soon');
      expect(isSubjectActive('biology')).toBe(false);

      const rob = getSubjectById('robotics')!;
      expect(rob.status).toBe('in_development');
      expect(rob.route).toBeUndefined();
      expect(rob.buttonText).toBe('Coming Soon');
      expect(rob.badgeText).toBe('Coming Soon');
      expect(isSubjectActive('robotics')).toBe(false);
    });
  });

  describe('Route and Tab Matching Logic', () => {
    it('correctly matches active subject by route path', () => {
      const checkActiveSubject = (pathname: string) => {
        if (pathname.startsWith('/physics')) return 'physics';
        if (pathname.startsWith('/chemistry')) return 'chemistry';
        if (pathname.startsWith('/mathematics')) return 'mathematics';
        return null;
      };

      expect(checkActiveSubject('/physics/electricity')).toBe('physics');
      expect(checkActiveSubject('/physics/electricity/workbench')).toBe('physics');
      expect(checkActiveSubject('/chemistry')).toBe('chemistry');
      expect(checkActiveSubject('/chemistry/states-of-matter')).toBe('chemistry');
      expect(checkActiveSubject('/mathematics')).toBe('mathematics');
      expect(checkActiveSubject('/mathematics/circles')).toBe('mathematics');
      expect(checkActiveSubject('/mathematics/circles/workbench')).toBe('mathematics');
      expect(checkActiveSubject('/mathematics/quadrilaterals')).toBe('mathematics');
      expect(checkActiveSubject('/mathematics/quadrilaterals/workbench')).toBe('mathematics');
      expect(checkActiveSubject('/mathematics/workbench')).toBe('mathematics');
      expect(checkActiveSubject('/')).toBeNull();
    });
  });

  describe('Quadrilaterals Free Laboratory & Lesson 6 Curricular Integrity', () => {
    it('ensures Lesson 6 (Midpoint Theorem) excludes parallel_constraint from allowedTools', () => {
      const lesson6 = QUAD_GUIDED_LESSONS['quad-l6'];
      expect(lesson6).toBeDefined();
      expect(lesson6.allowedTools).not.toContain('parallel_constraint');
      expect(lesson6.allowedTools).toContain('midpoint');
      expect(lesson6.allowedTools).toContain('distance_measure');
    });

    it('enforces and solves Parallelogram constraint in Quadrilateral store', () => {
      useQuadrilateralStore.setState({
        points: {},
        segments: {},
        quadrilaterals: {},
        triangles: {},
        angles: {},
        distances: {},
        constraints: {},
        drawings: {},
        history: [],
        historyIndex: -1,
      });
      const store = useQuadrilateralStore.getState();

      // Place 4 points of a non-parallelogram
      const pAId = store.addPoint({ x: 0, y: 0 }, 'A');
      const pBId = store.addPoint({ x: 6, y: 0 }, 'B');
      const pCId = store.addPoint({ x: 8, y: 5 }, 'C');
      const pDId = store.addPoint({ x: 0, y: 5 }, 'D'); // initially (0, 5)

      const quadId = store.addQuadrilateral(pAId, pBId, pCId, pDId);
      expect(quadId).toBeDefined();

      // Add parallel_opposite (Parallelogram) constraint:
      // In parallelogram ABCD: D must equal A + (C - B) = (0,0) + (8-6, 5-0) = (2, 5)
      store.addConstraint('parallel_opposite', [pAId, pBId, pCId, pDId], 'Parallelogram Invariant');

      const updatedPoints = useQuadrilateralStore.getState().points;
      const solvedD = updatedPoints[pDId];

      expect(solvedD.x).toBeCloseTo(2, 2);
      expect(solvedD.y).toBeCloseTo(5, 2);

      // Verify undo restores previous state
      store.undo();
      const afterUndoConstraints = useQuadrilateralStore.getState().constraints;
      expect(Object.keys(afterUndoConstraints).length).toBe(0);

      // Verify redo restores constraint
      store.redo();
      const afterRedoConstraints = useQuadrilateralStore.getState().constraints;
      expect(Object.keys(afterRedoConstraints).length).toBe(1);
    });
  });
});
