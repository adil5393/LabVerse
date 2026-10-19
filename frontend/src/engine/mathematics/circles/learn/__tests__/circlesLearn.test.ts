import { describe, it, expect, beforeEach, vi } from 'vitest';
import { allQuestions, allVisuals, describeChapterIntegrity } from '../../../../education/__tests__/chapterIntegrity';
import { CIRCLES_CHAPTER as CH } from '../content';
import { CIRCLES_GUIDED_LESSONS } from '../../curriculumPath';
import { calculateChordDistancePythagorean, verifyCyclicQuadOppositeAngles, verifyInscribedAngleTheorem } from '../../geometry';
import {
  angleAt, arcFigure, centralAngleForChord, chordFigure, chordLength, clampToArc, distanceToChord, norm360, onMajorArcSide, pointPos, reflectAngle, rotateAngle,
  type Figure,
} from '../figure';
import { cyclicFigure, equalChordsFigure, sameSegmentFigure } from '../questions';

describeChapterIntegrity('Circles', CH, ['circle']);

const deg = (r: number) => (r * 180) / Math.PI;

describe('Circles figures: independent oracles', () => {
  it('every circle point is exactly r from the centre and chords/angles match analytic values', () => {
    const f = arcFigure(5, 80);
    for (const p of f.points) expect(Math.hypot(pointPos(f, p.id).x, pointPos(f, p.id).y)).toBeCloseTo(5, 3);
    expect(angleAt(f, 'A', 'O', 'B')).toBeCloseTo(80, 1);
    expect(angleAt(f, 'A', 'P', 'B')).toBeCloseTo(40, 1);
    expect(chordLength(f, 'A', 'B')).toBeCloseTo(2 * 5 * Math.sin((40 * Math.PI) / 180), 2);
  });

  it('chordFigure(r, L) really has length L and the Pythagorean distance (several triples)', () => {
    for (const [r, L, d] of [[5, 8, 3], [13, 24, 5], [17, 30, 8], [5, 6, 4], [10, 16, 6]] as const) {
      const f = chordFigure(r, L);
      expect(chordLength(f, 'A', 'B')).toBeCloseTo(L, 2);
      expect(distanceToChord(f, 'A', 'B')).toBeCloseTo(d, 2);
      expect(calculateChordDistancePythagorean(r, L).distance).toBeCloseTo(d, 9);
      expect(centralAngleForChord(r, L)).toBeCloseTo(deg(2 * Math.asin(L / (2 * r))), 9);
    }
  });

  it('the perpendicular from the centre bisects the chord for any chord (Theorem 5), measured on the figure', () => {
    for (const L of [2, 4, 7.5, 9]) {
      const f = chordFigure(5, L);
      const M = pointPos(f, 'mid:A:B'), A = pointPos(f, 'A'), B = pointPos(f, 'B');
      expect(Math.hypot(A.x - M.x, A.y - M.y)).toBeCloseTo(Math.hypot(B.x - M.x, B.y - M.y), 3);
      // OM is perpendicular to AB: dot product ~ 0
      expect(M.x * (B.x - A.x) + M.y * (B.y - A.y)).toBeCloseTo(0, 3);
    }
  });

  it('inscribed = half central for every position of P on the major arc, and checked against the existing engine verifier', () => {
    for (const c of [40, 80, 100, 130, 160]) {
      for (let k = 1; k <= 7; k++) {
        const A = 90 + c / 2, B = 90 - c / 2;
        const P = A + 10 + ((B + 360 - A - 20) * k) / 8;
        const f = arcFigure(5, c, P);
        expect(onMajorArcSide(f, 'A', 'B', 'P')).toBe(true);
        const central = angleAt(f, 'A', 'O', 'B'), ins = angleAt(f, 'A', 'P', 'B');
        expect(central).toBeCloseTo(c, 1);
        expect(ins).toBeCloseTo(c / 2, 1);
        expect(verifyInscribedAngleTheorem(central, ins).isValid).toBe(true);
      }
    }
  });

  it('on the minor arc the angle is the SUPPLEMENT of half (so the lessons restrict P to the major arc)', () => {
    const f = arcFigure(5, 80, 90); // P on the minor arc side
    expect(onMajorArcSide(f, 'A', 'B', 'P')).toBe(false);
    expect(angleAt(f, 'A', 'P', 'B')).toBeCloseTo(180 - 40, 1);
  });

  it('same-segment angles are equal for every pair of points on the major arc', () => {
    for (const ang of [28, 36, 40, 52]) {
      const f = sameSegmentFigure(ang);
      expect(angleAt(f, 'A', 'P', 'B')).toBeCloseTo(ang, 1);
      expect(angleAt(f, 'A', 'Q', 'B')).toBeCloseTo(ang, 1);
    }
  });

  it('angle in a semicircle is 90 degrees for every point on the semicircle', () => {
    const base: Figure = { r: 5, points: [{ id: 'A', angle: 180 }, { id: 'B', angle: 0 }, { id: 'C', angle: 10 }] };
    for (let a = 5; a < 180; a += 17) {
      const f = { ...base, points: [base.points[0], base.points[1], { id: 'C', angle: a }] };
      expect(angleAt(f, 'A', 'C', 'B')).toBeCloseTo(90, 1);
    }
  });

  it('cyclic quadrilateral: both pairs of opposite angles sum to 180, checked with the existing engine verifier', () => {
    for (const a of [50, 65, 75, 82, 100, 120]) {
      const f = cyclicFigure(a);
      const A = angleAt(f, 'D', 'A', 'B'), C = angleAt(f, 'B', 'C', 'D'), B = angleAt(f, 'A', 'B', 'C'), D = angleAt(f, 'C', 'D', 'A');
      expect(A).toBeCloseTo(a, 1);
      expect(A + C).toBeCloseTo(180, 1);
      expect(B + D).toBeCloseTo(180, 1);
      expect(verifyCyclicQuadOppositeAngles(A, C).isSupplementary).toBe(true);
      // the points are in order around the circle: A < B < C < D < A + 360
      const ang = f.points.map((p) => p.angle);
      expect(ang[0] < ang[1] && ang[1] < ang[2] && ang[2] < ang[3] && ang[3] < ang[0] + 360).toBe(true);
    }
  });

  it('equal chords really are equal and subtend equal central angles; their distances match', () => {
    for (const c of [50, 80, 110]) {
      const f = equalChordsFigure(c);
      expect(chordLength(f, 'A', 'B')).toBeCloseTo(chordLength(f, 'D', 'E'), 3);
      expect(angleAt(f, 'A', 'O', 'B')).toBeCloseTo(angleAt(f, 'D', 'O', 'E'), 2);
      expect(distanceToChord(f, 'A', 'B')).toBeCloseTo(distanceToChord(f, 'D', 'E'), 2);
    }
  });

  it('a longer chord is closer to the centre (Theorem 8), measured', () => {
    const lens = [2, 4, 6, 8, 9.5];
    const ds = lens.map((L) => distanceToChord(chordFigure(5, L), 'A', 'B'));
    for (let i = 1; i < ds.length; i++) expect(ds[i]).toBeLessThan(ds[i - 1]);
  });

  it('symmetry helpers and arc clamping', () => {
    expect(rotateAngle(350, 20)).toBe(10);
    expect(reflectAngle(50, 90)).toBe(130);
    expect(reflectAngle(40, 0)).toBe(320);
    expect(norm360(-30)).toBe(330);
    expect(clampToArc(10, [100, 200])).toBe(100);
    expect(clampToArc(150, [100, 200])).toBe(150);
    expect(clampToArc(350, [300, 400])).toBe(350);
    expect(clampToArc(210, [100, 200])).toBe(200);
  });
});

describe('Circles lessons: authored figures and visuals', () => {
  it('every figure in every visual is internally consistent (points on the circle, ids resolve, no NaN)', () => {
    for (const { where, v } of allVisuals(CH)) {
      const fig = (v.props as { figure: Figure }).figure;
      expect(fig, where).toBeDefined();
      for (const p of fig.points) expect(Number.isFinite(p.angle), `${where} ${p.id}`).toBe(true);
      const ids = new Set(['O', ...fig.points.map((p) => p.id)]);
      const resolves = (id: string) => id.startsWith('mid:') ? id.split(':').slice(1).every((x) => ids.has(x)) : ids.has(id);
      for (const s of fig.segments ?? []) { expect(resolves(s.from), `${where} ${s.id}.from`).toBe(true); expect(resolves(s.to), `${where} ${s.id}.to`).toBe(true); }
      for (const a of fig.angles ?? []) for (const id of [a.a, a.v, a.b]) expect(resolves(id), `${where} angle ${a.id}`).toBe(true);
      for (const a of fig.angles ?? []) expect(Number.isFinite(angleAt(fig, a.a, a.v, a.b))).toBe(true);
    }
  });

  it('diameters really pass through the centre, radii touch it, and chords do not', () => {
    for (const { where, v } of allVisuals(CH)) {
      const fig = (v.props as { figure: Figure }).figure;
      for (const s of fig.segments ?? []) {
        if (!s.kind || s.kind === 'plain') continue;
        const P = pointPos(fig, s.from), Q = pointPos(fig, s.to);
        const cross = Math.abs(P.x * Q.y - P.y * Q.x) / (Math.hypot(P.x - Q.x, P.y - Q.y) || 1); // distance from O to the line
        if (s.kind === 'diameter') expect(cross, `${where} ${s.id}`).toBeLessThan(1e-3);
        if (s.kind === 'radius') expect(s.from === 'O' || s.to === 'O', `${where} ${s.id}`).toBe(true);
        if (s.kind === 'chord') { expect(s.from !== 'O' && s.to !== 'O').toBe(true); }
      }
    }
  });

  it('proof steps only highlight things that exist in the figure of their explainer step', () => {
    for (const l of Object.values(CH.lessons)) for (const st of l.steps) {
      if (!st.proof || !st.visual) continue;
      const fig = (st.visual.props as { figure: Figure }).figure;
      const known = new Set([...(fig.segments ?? []).map((s) => s.id), ...(fig.angles ?? []).map((a) => a.id), ...(fig.arcs ?? []).map((a) => a.id)]);
      for (const ps of st.proof) for (const id of ps.show ?? []) expect(known.has(id), `${l.id}/${st.id} highlights unknown "${id}"`).toBe(true);
      expect(st.proof.length).toBeGreaterThanOrEqual(3);
      for (const ps of st.proof) { expect(ps.claim.length).toBeGreaterThan(5); expect(ps.reason.length, `${l.id} ${ps.claim}`).toBeGreaterThan(10); }
    }
  });

  it('proof lessons follow observation then conjecture then proof, and measured steps are labelled as not proofs', () => {
    for (const id of ['circles-l7', 'circles-l9']) {
      const phases = CH.lessons[id].steps.map((s) => s.phase);
      expect(phases.slice(0, 3)).toEqual(['observe', 'conjecture', 'proof']);
    }
    for (const l of Object.values(CH.lessons)) for (const st of l.steps) {
      if (st.phase === 'observe') expect(st.visual, `${l.id}/${st.id}`).toBeDefined();
      if (st.phase === 'proof') expect(st.proof?.length, `${l.id}/${st.id} proof steps`).toBeGreaterThan(0);
    }
  });

  it('the proof figure for the angle at the centre is a valid case (centre inside angle APB) and its algebra holds', () => {
    const l7 = CH.lessons['circles-l7'].steps.find((s) => s.id === 'cir-inscribed-proof')!;
    const fig = (l7.visual!.props as { figure: Figure }).figure;
    const alpha = angleAt(fig, 'O', 'P', 'A'), beta = angleAt(fig, 'O', 'P', 'B');
    expect(angleAt(fig, 'A', 'O', 'Q')).toBeCloseTo(2 * alpha, 1);
    expect(angleAt(fig, 'B', 'O', 'Q')).toBeCloseTo(2 * beta, 1);
    expect(angleAt(fig, 'A', 'O', 'B')).toBeCloseTo(2 * (alpha + beta), 1);
    expect(angleAt(fig, 'A', 'P', 'B')).toBeCloseTo(alpha + beta, 1);
    // O is collinear with P and Q, and Q is opposite P
    expect(pointPos(fig, 'Q').x + pointPos(fig, 'P').x).toBeCloseTo(0, 3);
    expect(pointPos(fig, 'Q').y + pointPos(fig, 'P').y).toBeCloseTo(0, 3);
  });

  it('numeric answers are re-derived from their own figures', () => {
    let checked = 0;
    for (const { q } of allQuestions(CH)) {
      if (q.kind !== 'numeric' || !q.visual) continue;
      const fig = (q.visual.props as { figure?: Figure }).figure;
      if (!fig) continue;
      const m = (re: RegExp) => re.exec(q.prompt);
      if (q.id.includes('l4-i1') || q.id.includes('g-circ-l4-2') || q.id.includes('l4-i3')) { // chord distance
        const [, L] = m(/chord AB of length ([\d.]+) cm/)!;
        expect(distanceToChord(fig, 'A', 'B')).toBeCloseTo(q.answer, 1); expect(chordLength(fig, 'A', 'B')).toBeCloseTo(Number(L), 1); checked++;
      } else if (q.id.includes('l4-i2') || q.id.includes('g-circ-l6-1') || q.id.includes('l6-i1')) { // chord length
        expect(chordLength(fig, 'A', 'B')).toBeCloseTo(q.answer, 1); checked++;
      } else if (q.id.includes('l7-i1') || q.id.includes('g-circ-l7-1') || q.id.includes('l7-i3')) { // inscribed from central
        expect(angleAt(fig, 'A', 'P', 'B')).toBeCloseTo(q.answer, 1); expect(angleAt(fig, 'A', 'O', 'B')).toBeCloseTo(2 * q.answer, 1); checked++;
      } else if (q.id.includes('l7-i2') || q.id.includes('g-circ-l7-2')) { // central from inscribed
        expect(angleAt(fig, 'A', 'O', 'B')).toBeCloseTo(q.answer, 1); expect(angleAt(fig, 'A', 'P', 'B')).toBeCloseTo(q.answer / 2, 1); checked++;
      } else if (q.id.includes('l8-i1') || q.id.includes('g-circ-l8-1')) {
        expect(angleAt(fig, 'A', 'Q', 'B')).toBeCloseTo(q.answer, 1); expect(angleAt(fig, 'A', 'P', 'B')).toBeCloseTo(q.answer, 1); checked++;
      } else if (q.id.includes('l8-i2') || q.id.includes('g-circ-l8-2')) {
        expect(angleAt(fig, 'A', 'B', 'C')).toBeCloseTo(q.answer, 1); expect(angleAt(fig, 'A', 'C', 'B')).toBeCloseTo(90, 1); checked++;
      } else if (q.id.includes('l9-i1') || q.id.includes('g-circ-l9-1')) {
        expect(angleAt(fig, 'B', 'C', 'D')).toBeCloseTo(q.answer, 1); checked++;
      } else if (q.id.includes('l9-i2') || q.id.includes('g-circ-l9-2')) {
        expect(angleAt(fig, 'C', 'D', 'A')).toBeCloseTo(q.answer, 1); checked++;
      } else if (q.id.includes('l5-i1') || q.id.includes('l5-i2') || q.id.includes('g-circ-l5-2')) {
        expect(angleAt(fig, 'D', 'O', 'E')).toBeCloseTo(q.answer, 1); expect(chordLength(fig, 'A', 'B')).toBeCloseTo(chordLength(fig, 'D', 'E'), 2); checked++;
      }
    }
    expect(checked).toBeGreaterThanOrEqual(20);
  });

  it('symmetry answers follow the rotation and reflection rules', () => {
    const q = (id: string) => allQuestions(CH).find((x) => x.q.id === id)!.q;
    const r = q('circles-l2-i1'), f = q('circles-l2-i2');
    expect(r.kind === 'numeric' && r.answer).toBe(130);
    expect(f.kind === 'numeric' && f.answer).toBe(130);
    const g = q('g-circ-l2-2');
    expect(g.kind === 'numeric' && g.answer).toBe(320);
  });

  it('given and answer agree in the right-triangle chord problems (Pythagorean triples)', () => {
    for (const [id, r, L, want] of [['g-circ-l4-2', 13, 24, 5], ['circles-l4-i1', 17, 30, 8], ['circles-l4-i3', 5, 6, 4]] as const) {
      const q = allQuestions(CH).find((x) => x.q.id === id)!.q;
      expect(q.kind === 'numeric' && q.answer).toBeCloseTo(want, 6);
      expect(Math.sqrt(r * r - (L / 2) ** 2)).toBeCloseTo(want, 9);
    }
  });
});

const circleSources = import.meta.glob('../../{curriculumRegistry,circleExperiments,practiceBank,curriculumPath}.ts', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

describe('Circles: student-visible NCERT references (audit regression)', () => {
  it('no source uses the old invented numbering (Theorem 9.x, "Old 10.x", Section 1/2 style references)', () => {
    expect(Object.keys(circleSources).length).toBe(4);
    for (const [file, src] of Object.entries(circleSources)) {
      expect(src, file).not.toMatch(/Theorem 9\.\d/);
      expect(src, file).not.toMatch(/Old 10\./);
      expect(src, file).not.toMatch(/NCERT Class 9 Circles . Section/);
    }
  });
  it('theorem numbers that ARE cited are within the textbook range 1 to 12', () => {
    for (const [file, src] of Object.entries(circleSources)) {
      for (const m of src.matchAll(/Theorems? (\d+)(?: (?:and|to) (\d+))?/g)) {
        for (const n of [m[1], m[2]].filter(Boolean).map(Number)) expect(n >= 1 && n <= 12, `${file}: ${m[0]}`).toBe(true);
      }
    }
  });
});

describe('Circles: NCERT alignment of the Learn layer', () => {
  it('the chapter note cites only sections and theorems that exist in the textbook (5.1-5.8, Theorems 1-12)', () => {
    expect(CH.ncertNote).toMatch(/Chapter 5/);
    expect(CH.ncertNote).toMatch(/5\.1 to 5\.8/);
    expect(CH.ncertNote).toMatch(/Theorems 1 to 12/);
  });
  it('does not claim a theorem number that the textbook does not have', () => {
    const src = JSON.stringify(CH);
    const nums = [...src.matchAll(/Theorem (\d+)/g)].map((m) => Number(m[1]));
    for (const n of nums) expect(n >= 1 && n <= 12).toBe(true);
  });
  it('every Learn lesson corresponds to an existing guided lesson id (Learn and Investigate stay linked)', () => {
    for (const id of Object.keys(CH.lessons)) expect(CIRCLES_GUIDED_LESSONS[id], id).toBeDefined();
  });
  it('lesson ids and prerequisite ids cannot collide with the Coordinate Geometry chapter', async () => {
    const { COORDINATE_GEOMETRY } = await import('../../../coordinateGeometry/content');
    const a = new Set([...Object.keys(CH.lessons), ...Object.keys(CH.prerequisites)]);
    for (const id of [...Object.keys(COORDINATE_GEOMETRY.lessons), ...Object.keys(COORDINATE_GEOMETRY.prerequisites)]) expect(a.has(id), id).toBe(false);
  });
});

// --------------------------------------------------------------------------
// Circles guided-practice mastery fix
// --------------------------------------------------------------------------

class MemoryStorage {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
}
async function freshStore(seed?: unknown) {
  vi.resetModules();
  vi.stubGlobal('localStorage', new MemoryStorage());
  if (seed) localStorage.setItem('labverse_circles_progress_v1', JSON.stringify(seed));
  return (await import('../../../../../store/useGuidedLearningStore'));
}

describe('Circles guided practice: mastery is evidence-based', () => {
  beforeEach(() => vi.unstubAllGlobals());

  it('answering the SAME question correctly three times is not mastery (observed false mastery, now fixed)', async () => {
    const { useGuidedLearningStore: st } = await freshStore();
    const rec = st.getState().recordPracticeResult;
    for (let i = 0; i < 3; i++) rec('circles-l1', 'q_def_radius_diameter', true, 3);
    const p = st.getState().lessons['circles-l1'];
    expect(p.practiceMastered).toBe(false);
    expect(p.practiceCorrectCount).toBe(1);
    expect(p.practiceCorrectCount).toBeLessThanOrEqual(p.practiceTotalQuestions);
  });

  it('correct first tries with no help on every question is mastery', async () => {
    const { useGuidedLearningStore: st } = await freshStore();
    st.getState().recordPracticeResult('circles-l1', 'a', true, 2);
    expect(st.getState().lessons['circles-l1'].practiceMastered).toBe(false);
    st.getState().recordPracticeResult('circles-l1', 'b', true, 2);
    expect(st.getState().lessons['circles-l1'].practiceMastered).toBe(true);
  });

  it('a hint, a revealed solution or teacher mode means the answer is assisted and never mastery', async () => {
    const { useGuidedLearningStore: st } = await freshStore();
    st.getState().recordPracticeResult('circles-l1', 'a', true, 2, { assisted: true });
    st.getState().recordPracticeResult('circles-l1', 'b', true, 2);
    expect(st.getState().lessons['circles-l1'].practiceMastered).toBe(false);
    st.getState().resetProgress();
    st.getState().toggleTeacherMode();
    st.getState().recordPracticeResult('circles-l4', 'a', true, 1);
    expect(st.getState().lessons['circles-l4'].practiceMastered).toBe(false);
    expect(st.getState().lessons['circles-l4'].practiceAnswered!.a.assisted).toBe(true);
  });

  it('a wrong first try cannot be repaired into mastery by retrying', async () => {
    const { useGuidedLearningStore: st } = await freshStore();
    st.getState().recordPracticeResult('circles-l1', 'a', false, 1);
    st.getState().recordPracticeResult('circles-l1', 'a', true, 1);
    const p = st.getState().lessons['circles-l1'];
    expect(p.practiceAnswered!.a).toMatchObject({ attempts: 2, correct: true, firstAttemptCorrect: false });
    expect(p.practiceMastered).toBe(false);
    expect(p.practiceCorrectCount).toBe(1);
  });

  it('old saved records are preserved; an unverifiable mastery flag becomes "legacy, unverified" instead of Mastered', async () => {
    const saved = { chapterId: 'circles-class-9', lastVisitedLessonId: 'circles-l3', completedLessonIds: ['circles-l1', 'circles-l2'], lessons: {
      'circles-l1': { lessonId: 'circles-l1', completed: true, currentStage: 'practice', interactionsRecorded: 4, observationsCaptured: 2, proofCompleted: false, practiceAttempted: true, practiceMastered: true, practiceCorrectCount: 2, practiceTotalQuestions: 2 },
      'circles-l2': { lessonId: 'circles-l2', completed: true, currentStage: 'practice', interactionsRecorded: 1, observationsCaptured: 0, proofCompleted: false, practiceAttempted: true, practiceMastered: false, practiceCorrectCount: 1, practiceTotalQuestions: 2 },
    } };
    const { useGuidedLearningStore: st } = await freshStore(saved);
    const s = st.getState();
    expect(s.completedLessonIds).toEqual(['circles-l1', 'circles-l2']);
    expect(s.lessons['circles-l1']).toMatchObject({ completed: true, interactionsRecorded: 4, practiceCorrectCount: 2, practiceMastered: false, legacyMasteryUnverified: true });
    expect(s.lessons['circles-l2'].legacyMasteryUnverified).toBeUndefined();
    expect(s.isLessonMastered('circles-l1')).toBe(false);
    expect(s.isLessonCompleted('circles-l1')).toBe(true);
  });

  it('legacy flag clears once the student demonstrates it properly', async () => {
    const { useGuidedLearningStore: st } = await freshStore({ chapterId: 'circles-class-9', lastVisitedLessonId: 'circles-l1', completedLessonIds: [], lessons: { 'circles-l1': { lessonId: 'circles-l1', completed: true, currentStage: 'practice', interactionsRecorded: 0, observationsCaptured: 0, proofCompleted: false, practiceAttempted: true, practiceMastered: true, practiceCorrectCount: 2, practiceTotalQuestions: 2 } } });
    st.getState().recordPracticeResult('circles-l1', 'a', true, 2);
    st.getState().recordPracticeResult('circles-l1', 'b', true, 2);
    expect(st.getState().lessons['circles-l1']).toMatchObject({ practiceMastered: true, legacyMasteryUnverified: false });
  });
});
