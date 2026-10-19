import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import appSource from '../../../../App.tsx?raw';
import hubSource from '../../../../features/physics/motion/MotionHub.tsx?raw';
import exercisesSource from '../exercises?raw';
import { allQuestions, allVisuals, describeChapterIntegrity } from '../../../education/__tests__/chapterIntegrity';
import { emptyIndependent, emptyLessonRecord, lessonStatus, objectiveCoverage } from '../../../education/progress';
import type { LessonRecord } from '../../../education/types';
import { subjectCrumb } from '../../../education/subjects';
import { WORK_CHAPTER as CH } from '../learn/content';
import { WORK_EXPERIMENTS, workRouteOutcome } from '../experiments';
import { WORK_EXERCISES, exerciseSolved, recomputeWorkAnswers, solvedWorkParts, workExerciseCounts } from '../exercises';
import { WORK_MAP, WORK_TEXTBOOK_INVENTORY, workCoverageCounts } from '../curriculum';
import { averagePower, kineticEnergy, kineticEnergyAfterWork, mechanicalEnergy, potentialEnergy, speedFromKineticEnergy } from '../energyBasics';
import { cmToM, computeWork, cosDeg, DEFAULT_WORK, describeWork, fmtSigned, gToKg, kJToJ, kmhToMs, sinDeg, TRACK_LENGTH, validateWork, workAtProgress, type WorkSetup } from '../workModel';
import { workVisual } from '../learn/questions';
import { WorkView } from '../../../../features/physics/work/WorkView';
import { MOTION_CHAPTER } from '../../motion/learn/content';
import { FORCES_CHAPTER } from '../../forces/learn/content';

describeChapterIntegrity('Work', CH, ['workLab']);

class MemoryStorage {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
}
async function fresh() {
  vi.resetModules();
  vi.stubGlobal('localStorage', new MemoryStorage());
  return (await import('../../../../store/useEducationStore')).useEducationStore;
}

const lab = (o: Partial<WorkSetup>) => computeWork({ ...DEFAULT_WORK, ...o });

describe('Work chapter registration and Physics preservation', () => {
  it('is a Physics chapter with Physics breadcrumbs and its own routes; the other chapters are untouched', () => {
    expect(subjectCrumb(CH)).toEqual({ label: 'Physics', href: '/physics' });
    expect(CH.routes.landing).toBe('/physics/work'); expect(CH.routes.learn('pw-l1')).toBe('/physics/work/learn/pw-l1'); expect(CH.routes.lab).toBe('/physics/work/lab');
    for (const r of ['/physics/work', '/physics/work/lab', '/physics/work/exercises', '/physics/work/learn/:lessonId', '/physics/forces', '/physics/forces/lab', '/physics/forces/exercises', '/physics/forces/learn/:lessonId', '/physics/motion', '/physics/motion/learn/:lessonId', '/physics/motion/exercises', '/physics/motion/practice', '/physics/electricity', '/physics/electricity/workbench']) expect(appSource, r).toContain(`path="${r}"`);
    for (const c of ['work', 'forces', 'motion', 'electricity']) expect(hubSource).toContain(`data-chapter-card="${c}"`);
  });
  it('lesson, prerequisite and question ids are distinct from the Motion and Forces chapters (progress is stored by id)', () => {
    const mine = [...Object.keys(CH.lessons), ...Object.keys(CH.prerequisites)];
    for (const other of [MOTION_CHAPTER, FORCES_CHAPTER]) {
      const theirs = new Set([...Object.keys(other.lessons), ...Object.keys(other.prerequisites)]);
      for (const id of mine) expect(theirs.has(id), id).toBe(false);
      const qids = new Set(allQuestions(other).map((x) => x.q.id));
      for (const x of allQuestions(CH)) expect(qids.has(x.q.id), x.q.id).toBe(false);
    }
  });
  it('has optional chapter and unit prerequisites that link to Chapter 4 and Chapter 6, and never gates a lesson', () => {
    expect(CH.prerequisiteIds.sort()).toEqual(['pwp-displacement', 'pwp-force', 'pwp-graph', 'pwp-units', 'pwp-velocity', 'pwp-weight']);
    const links = Object.values(CH.prerequisites).map((p) => p.connection ?? '').join(' ');
    expect(links).toMatch(/Chapter 4/); expect(links).toMatch(/Chapter 6/);
    for (const p of Object.values(CH.prerequisites)) { expect(p.refresher.length).toBeGreaterThan(0); expect(p.checks.length).toBeGreaterThanOrEqual(2); }
  });
});

describe('work model: independent calculations', () => {
  it('matches W = F s cos(theta) from an independent formula on a grid of forces, angles and displacements', () => {
    for (const F of [0, 1, 10, 37.5]) for (const angle of [0, 90, 180, 270]) for (const s of [-3, -0.5, 0, 2, 6]) {
      const r = lab({ forceN: F, angleDeg: angle, displacement: s, startPos: 6, massKg: 100, surfaceId: 'smooth' });
      expect(r.valid, `${F}/${angle}/${s}`).toBe(true);
      const expected = F * Math.cos((angle * Math.PI) / 180) * s;
      expect(r.appliedWork).toBeCloseTo(expected, 6);
    }
    for (const angle of [30, 45, 60, 120, 225, 300]) {
      const r = lab({ forceN: 10, angleDeg: angle, displacement: 4, startPos: 2, massKg: 100 });
      expect(r.appliedWork).toBeCloseTo(10 * Math.cos((angle * Math.PI) / 180) * 4, 6);
    }
  });
  it('zero force and zero displacement give zero work', () => {
    expect(lab({ forceN: 0, displacement: 5 }).appliedWork).toBe(0);
    expect(lab({ forceN: 200, displacement: 0 }).appliedWork).toBe(0);
    expect(lab({ forceN: 10, displacement: 0 }).netWork).toBe(0);
    expect(lab({ forceN: 10, displacement: 0 }).applied.relation).toBe('no-displacement');
    expect(lab({ forceN: 0, displacement: 4 }).applied.relation).toBe('no-force');
  });
  it('a force along the displacement is positive, opposite is negative, perpendicular is zero', () => {
    expect(lab({ forceN: 10, angleDeg: 0, displacement: 3 }).appliedWork).toBe(30);
    expect(lab({ forceN: 10, angleDeg: 180, displacement: 3 }).appliedWork).toBe(-30);
    expect(lab({ forceN: 10, angleDeg: 0, displacement: -3, startPos: 5 }).appliedWork).toBe(-30);
    expect(lab({ forceN: 10, angleDeg: 180, displacement: -3, startPos: 5 }).appliedWork).toBe(30);
    for (const angle of [90, 270]) { const r = lab({ forceN: 10, angleDeg: angle, displacement: 4 }); expect(r.appliedWork).toBe(0); expect(r.applied.relation).toBe('perpendicular'); }
    expect(lab({ axis: 'vertical', forceN: 10, angleDeg: 0, displacement: 4, startPos: 0 }).appliedWork).toBe(0);
    expect(lab({ forceN: 10, angleDeg: 0, displacement: 3 }).applied.relation).toBe('along');
    expect(lab({ forceN: 10, angleDeg: 180, displacement: 3 }).applied.relation).toBe('opposite');
    expect(lab({ forceN: 10, angleDeg: 60, displacement: 3 }).applied.relation).toBe('oblique');
  });
  it('textbook values: lifting a 5 kg bag, and the goalkeeper (200 N through 15 cm opposite to the force)', () => {
    const bag = lab({ axis: 'vertical', forceN: 5 * 10, angleDeg: 90, displacement: 3, startPos: 0, massKg: 5 });
    expect(bag.appliedWork).toBe(150); expect(bag.forces.find((f) => f.id === 'weight')!.work).toBe(-150); expect(bag.netWork).toBe(0);
    expect(lab({ axis: 'vertical', forceN: 50, angleDeg: 90, displacement: 1, startPos: 0, massKg: 5 }).appliedWork).toBe(50);
    expect(cmToM(15)).toBeCloseTo(0.15, 12);
    expect(lab({ forceN: 200, angleDeg: 180, displacement: 0.15, startPos: 1, massKg: 5 }).appliedWork).toBeCloseTo(-30, 9);
  });
  it('gravity and the normal force do no work on a horizontal displacement; gravity does -mgh going up and +mgh coming down', () => {
    const h = lab({ forceN: 10, displacement: 4, massKg: 3, surfaceId: 'wood' });
    expect(h.forces.find((f) => f.id === 'weight')!.work).toBe(0); expect(h.forces.find((f) => f.id === 'normal')!.work).toBe(0);
    for (const m of [0.5, 2, 7]) for (const hh of [1, 4.5, 10]) {
      expect(lab({ axis: 'vertical', forceN: 0, displacement: hh, startPos: 0, massKg: m }).forces[1].work).toBeCloseTo(-m * 10 * hh, 9);
      expect(lab({ axis: 'vertical', forceN: 0, displacement: -hh, startPos: hh, massKg: m }).forces[1].work).toBeCloseTo(m * 10 * hh, 9);
    }
  });
  it('friction: kinetic friction mu N opposes the displacement, its work is -mu N |s|, and applied, friction and net work are kept separate', () => {
    for (const [surfaceId, mu] of [['wood', 0.3], ['rough', 0.5]] as const) for (const s of [-4, 3]) {
      const r = lab({ forceN: 20, displacement: s, startPos: 6, massKg: 5, surfaceId });
      const f = r.forces.find((x) => x.id === 'friction')!;
      expect(f.magnitude).toBeCloseTo(mu * 50, 9);
      expect(Math.sign(f.fx)).toBe(-Math.sign(s));
      expect(r.frictionWork).toBeCloseTo(-mu * 50 * Math.abs(s), 9);
      expect(r.appliedWork).toBeCloseTo(20 * s, 9);
      expect(r.netWork).toBeCloseTo(r.appliedWork + r.frictionWork, 9);
    }
    const steady = lab({ forceN: 15, displacement: 4, massKg: 5, surfaceId: 'wood' });
    expect(steady.appliedWork).toBe(60); expect(steady.frictionWork).toBe(-60); expect(steady.netWork).toBe(0);
    expect(lab({ forceN: 10, displacement: 3, massKg: 5, surfaceId: 'smooth' }).frictionWork).toBe(0);
  });
  it('static friction on a resting object matches the push up to mu N, and does no work', () => {
    const r = lab({ forceN: 10, displacement: 0, massKg: 5, surfaceId: 'wood' });
    const f = r.forces.find((x) => x.id === 'friction')!;
    expect(r.staticFriction).toBe(true); expect(f.fx).toBe(-10); expect(f.work).toBe(0); expect(r.heldInPlace).toBe(false);
    expect(lab({ forceN: 40, displacement: 0, massKg: 5, surfaceId: 'wood' }).forces.find((x) => x.id === 'friction')!.fx).toBe(-15);
    expect(lab({ forceN: 10, displacement: 0, massKg: 5, surfaceId: 'smooth' }).heldInPlace).toBe(true);
  });
  it('an applied force never has to produce displacement: the displacement is prescribed and the result says when something must hold the object', () => {
    const wall = lab({ forceN: 100, displacement: 0, massKg: 5 });
    expect(wall.appliedWork).toBe(0); expect(wall.heldInPlace).toBe(true); expect(describeWork(wall)).toMatch(/hold the object in place/);
    expect(lab({ axis: 'vertical', forceN: 20, angleDeg: 90, displacement: 0, startPos: 1, massKg: 2 }).heldInPlace).toBe(false);
  });
  it('negative net work states the kinetic energy the object must already have', () => {
    const r = lab({ forceN: 10, angleDeg: 0, displacement: -3, startPos: 5, massKg: 2 });
    expect(r.netWork).toBe(-30); expect(r.minInitialKE).toBe(30);
    expect(lab({ forceN: 10, displacement: 3 }).minInitialKE).toBe(0);
  });
  it('the normal force supports the weight less when pulled up and more when pushed down; too large an upward pull is refused', () => {
    expect(lab({ forceN: 10, angleDeg: 90, displacement: 4, massKg: 2 }).forces.find((f) => f.id === 'normal')!.magnitude).toBe(10);
    expect(lab({ forceN: 10, angleDeg: 270, displacement: 4, massKg: 2 }).forces.find((f) => f.id === 'normal')!.magnitude).toBe(30);
    const carried = lab({ forceN: 20, angleDeg: 90, displacement: 4, massKg: 2 });
    expect(carried.forces.find((f) => f.id === 'normal')).toBeUndefined(); expect(carried.netFy).toBe(0);
    const lift = lab({ forceN: 30, angleDeg: 90, displacement: 4, massKg: 2 });
    expect(lift.valid).toBe(false); expect(lift.reason).toMatch(/lift off/);
  });
  it('forces are balanced on the axis perpendicular to the motion (the track supports the weight)', () => {
    for (const F of [0, 5, 10, 19]) for (const angle of [0, 90, 270]) expect(lab({ forceN: F, angleDeg: angle, displacement: 2, massKg: 2 }).netFy, `${F}/${angle}`).toBe(0);
  });
  it('rejects invalid setups with a reason, never silently', () => {
    expect(validateWork({ ...DEFAULT_WORK, forceN: -1 })).toMatch(/negative/);
    expect(validateWork({ ...DEFAULT_WORK, massKg: 0 })).toMatch(/mass/);
    expect(validateWork({ ...DEFAULT_WORK, startPos: 10, displacement: 5 })).toMatch(/leave the track/);
    expect(validateWork({ ...DEFAULT_WORK, axis: 'vertical', startPos: 1, displacement: -3 })).toMatch(/leave the rail/);
    expect(validateWork({ ...DEFAULT_WORK, forceN: NaN })).toMatch(/number/);
    expect(validateWork({ ...DEFAULT_WORK, forceN: 500 })).toMatch(/at most/);
    expect(validateWork(DEFAULT_WORK)).toBeNull();
    expect(lab({ displacement: 99 }).valid).toBe(false);
  });
  it('unit conversions and numerical precision', () => {
    expect(cmToM(25)).toBe(0.25); expect(gToKg(200)).toBe(0.2); expect(kJToJ(2.5)).toBe(2500); expect(kmhToMs(72)).toBe(20); expect(kmhToMs(154.8)).toBeCloseTo(43, 9);
    expect(cosDeg(90)).toBe(0); expect(sinDeg(180)).toBe(0); expect(cosDeg(450)).toBe(0); expect(cosDeg(-90)).toBe(0); expect(cosDeg(180)).toBe(-1);
    expect(lab({ forceN: 10, angleDeg: 60, displacement: 4, massKg: 2 }).appliedWork).toBe(20);
    const r = lab({ forceN: 0.1, displacement: 0.3, startPos: 1, massKg: 5, surfaceId: 'wood' });
    expect(r.appliedWork).toBeCloseTo(0.03, 12); expect(Object.is(lab({ forceN: 10, angleDeg: 180, displacement: 0 }).appliedWork, -0)).toBe(false);
    expect(fmtSigned(-30)).toBe('−30'); expect(fmtSigned(30)).toBe('+30'); expect(fmtSigned(0)).toBe('0');
  });
  it('work so far is proportional to the progress and ends at the totals; the parts add to the net work', () => {
    const r = lab({ forceN: 20, displacement: 4, startPos: 2, massKg: 5, surfaceId: 'wood' });
    const half = workAtProgress(r, 0.5), end = workAtProgress(r, 1), start = workAtProgress(r, 0);
    expect(half.position).toBe(4); expect(half.byForce.applied).toBe(40); expect(end.byForce.applied).toBe(r.appliedWork); expect(end.byForce.friction).toBe(r.frictionWork); expect(end.net).toBe(r.netWork);
    expect(start.net).toBe(0); expect(start.position).toBe(2); expect(workAtProgress(r, 2).position).toBe(r.endPos); expect(workAtProgress(r, -1).position).toBe(2);
    expect(end.byForce.applied + end.byForce.friction + end.byForce.weight + end.byForce.normal).toBeCloseTo(end.net, 9);
  });
});

describe('force and displacement visualisation agree with the model', () => {
  const html = (setup: WorkSetup, graph = false) => renderToStaticMarkup(React.createElement(WorkView, { initial: setup, graph }));
  it('every drawn arrow and every table value is the model value', () => {
    for (const setup of [{ ...DEFAULT_WORK }, { ...DEFAULT_WORK, forceN: 15, displacement: 4, massKg: 5, surfaceId: 'wood' as const }, { ...DEFAULT_WORK, angleDeg: 180, displacement: -2, startPos: 4 }, { ...DEFAULT_WORK, axis: 'vertical' as const, forceN: 20, angleDeg: 90, displacement: 2, startPos: 0 }]) {
      const r = computeWork(setup), m = html(setup);
      for (const f of r.forces) {
        expect(m, f.id).toContain(`data-force-row="${f.id}"`);
        expect(m).toContain(`data-work="${f.work}"`);
        if (f.magnitude > 0) { expect(m).toContain(`data-arrow="${f.id}" data-magnitude="${f.magnitude}" data-work="${f.work}"`); }
      }
      expect(m).toContain(`data-testid="net-work" data-work="${r.netWork}"`);
      expect(m).toContain(fmtSigned(r.netWork).replace('+', '+'));
      if (setup.displacement !== 0) { expect(m).toContain('data-testid="displacement-arrow"'); expect(m).toContain(`displacement s = ${fmtSigned(setup.displacement)} m`.replace('displacement s', setup.axis === 'horizontal' ? 'displacement s' : 's')); }
      expect(m).toContain(`aria-label="${describeWork(r).replace(/&/g, '&amp;')}"`.slice(0, 40));
    }
  });
  it('the start and end markers and the formula line show the chosen values', () => {
    const m = html({ ...DEFAULT_WORK, startPos: 2, displacement: 3, forceN: 10 });
    expect(m).toContain('start 2 m'); expect(m).toContain('end 5 m'); expect(m).toContain('(+10 N)'); expect(m).toContain('(+3 m)'); expect(m).toContain('+30 J');
    const neg = html({ ...DEFAULT_WORK, angleDeg: 180, displacement: 3, startPos: 2 });
    expect(neg).toContain('−30 J'); expect(neg).toContain('(negative)');
  });
  it('the graph area equals the work of the applied force', () => {
    const m = html({ ...DEFAULT_WORK, forceN: 8, displacement: 2.5, startPos: 0 }, true);
    expect(m).toContain('Area under the line = the applied force&#x27;s work = +20 J');
    const opposite = html({ ...DEFAULT_WORK, forceN: 8, angleDeg: 180, displacement: 2.5, startPos: 0 }, true);
    expect(opposite).toContain('= −20 J');
  });
  it('lesson visuals state the same work as the model that is drawn', () => {
    for (const { where, v } of allVisuals(CH)) {
      const p = v.props as { setup: WorkSetup };
      const r = computeWork(p.setup);
      expect(r.valid, where).toBe(true);
      expect(v.alt, where).toContain(describeWork(r));
      expect(v.alt).toContain(`Net work = `); expect(v.alt).toContain(`${fmtSigned(r.netWork)} J`);
    }
    expect(workVisual({ setup: DEFAULT_WORK }, 'x').alt).toContain('kinematic work model');
  });
});

describe('guided investigations A to E follow predict, experiment, observe, explain', () => {
  it('exactly one prediction option holds for every route, and every option explains itself', () => {
    expect(WORK_EXPERIMENTS.map((e) => e.id)).toEqual(['A', 'B', 'C', 'D', 'E']);
    for (const e of WORK_EXPERIMENTS) { expect(e.lesson.length).toBeGreaterThan(30); for (const r of e.routes) {
      const out = workRouteOutcome(r);
      expect(out.result.valid, r.id).toBe(true);
      expect(r.options.filter((o) => o.holds(out.result)).length, `${e.id}/${r.id}`).toBe(1);
      for (const o of r.options) expect(o.why.length, `${r.id} ${o.label}`).toBeGreaterThan(25);
      expect(r.explain(out.result).length).toBeGreaterThan(20);
    } }
  });
  it('model outcomes match hand values', () => {
    const w = (id: string) => { const r = WORK_EXPERIMENTS.flatMap((e) => e.routes).find((x) => x.id === id)!; return workRouteOutcome(r).result; };
    expect(w('a1').appliedWork).toBe(30); expect(w('a2').appliedWork).toBe(60); expect(w('a3').appliedWork).toBe(150);
    expect(w('b1').appliedWork).toBe(0); expect(w('b2').appliedWork).toBe(0); expect(w('b3').appliedWork).toBe(0);
    expect(w('c1').appliedWork).toBe(30); expect(w('c2').appliedWork).toBe(-30); expect(w('c3').appliedWork).toBe(40);
    expect(w('d1').appliedWork).toBe(0); expect(w('d2').appliedWork).toBe(0); expect(w('d3').appliedWork).toBe(0);
    expect([w('e1').appliedWork, w('e1').frictionWork, w('e1').netWork]).toEqual([30, 0, 30]);
    expect([w('e2').appliedWork, w('e2').frictionWork, w('e2').netWork]).toEqual([60, -60, 0]);
    expect([w('e3').appliedWork, w('e3').frictionWork, w('e3').netWork]).toEqual([80, -60, 20]);
  });
  it('the displacement is prescribed, and the lab says so', () => {
    expect(describeWork(computeWork(DEFAULT_WORK))).toMatch(/kinematic work model/);
  });
});

describe('energy foundations (hand values)', () => {
  it('kinetic, potential and mechanical energy, work-energy bookkeeping and power', () => {
    expect(kineticEnergy(0.2, 43)).toBeCloseTo(184.9, 9);
    expect(potentialEnergy(0.2, 10)).toBe(20); expect(mechanicalEnergy(2, 3, 5)).toBe(9 + 100);
    expect(kineticEnergyAfterWork(0, 150)).toBe(150); expect(speedFromKineticEnergy(2, 9)).toBe(3); expect(speedFromKineticEnergy(2, -1)).toBe(0);
    expect(averagePower(1500, 5)).toBe(300);
    const bag = lab({ axis: 'vertical', forceN: 20, angleDeg: 90, displacement: 2, startPos: 0, massKg: 2 });
    expect(potentialEnergy(2, 2)).toBe(bag.appliedWork);
  });
});

describe('curriculum map and textbook inventory', () => {
  it('lists every verified section of Chapter 7 with honest status, and only Section 7.1 is claimed by the Learn lessons', () => {
    expect(WORK_TEXTBOOK_INVENTORY.sections).toEqual(['7.1', '7.1.1', '7.1.2', '7.2', '7.3', '7.4', '7.4.1', '7.4.2', '7.4.3', '7.5', '7.6', '7.6.1', '7.6.2', '7.6.3']);
    expect(WORK_TEXTBOOK_INVENTORY.exercises).toBe(15);
    const sections = new Set(WORK_MAP.map((r) => r.section));
    for (const s of ['7.1', '7.1.1', '7.1.2', '7.2', '7.3', '7.4.1', '7.4.2', '7.4.3', '7.5', '7.6']) expect(sections.has(s), s).toBe(true);
    const learn = WORK_MAP.filter((r) => r.status === 'learn' && r.kind === 'textbook' && r.lessonIds.length);
    expect(learn.map((r) => r.section)).toEqual(['7.1', '7.1.1', '7.1.2']);
    for (const r of WORK_MAP.filter((x) => x.status === 'planned')) expect(r.lessonIds).toEqual([]);
    for (const r of WORK_MAP) for (const id of r.lessonIds) expect(CH.lessons[id], id).toBeDefined();
    const c = workCoverageCounts(); expect(c.available + c.planned).toBe(c.total); expect(c.planned).toBeGreaterThan(5);
    for (const r of WORK_MAP.filter((x) => x.id === 'w-lab')) expect(r.kind).toBe('enrichment');
  });
});

describe('NCERT exercise inventory and solutions', () => {
  it('keeps textbook numbering 1 to 15 with every textbook subpart', () => {
    expect(WORK_EXERCISES.map((e) => e.number)).toEqual(Array.from({ length: 15 }, (_, i) => i + 1));
    expect(WORK_EXERCISES.map((e) => e.parts.length)).toEqual([5, 5, 4, 9, 3, 1, 1, 1, 1, 2, 3, 1, 4, 1, 2]);
    expect(WORK_EXERCISES[0].parts.map((p) => p.id)).toEqual(['i', 'ii', 'iii', 'iv', 'v']);
    expect(WORK_EXERCISES[3].parts.map((p) => p.id)).toEqual(['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix']);
  });
  it('only the parts that Section 7.1 supports are solved, and everything else is Upcoming with no solution', () => {
    expect(solvedWorkParts()).toEqual([{ number: 1, part: 'i' }, { number: 1, part: 'ii' }, { number: 2, part: 'i' }, { number: 2, part: 'ii' }, { number: 10, part: 'i' }]);
    for (const e of WORK_EXERCISES) for (const p of e.parts) {
      expect(p.status === 'solved').toBe(Boolean(p.solution));
      if (p.status === 'upcoming') { expect(p.needs, `Q${e.number}${p.id}`).toBeTruthy(); expect(p.solution).toBeUndefined(); }
    }
    expect(WORK_EXERCISES.filter(exerciseSolved)).toHaveLength(0);
    const c = workExerciseCounts(); expect(c.parts).toBe(43); expect(c.solvedParts).toBe(5); expect(c.solvedQuestions).toBe(0);
  });
  it('every solution is complete: hint, reasoning with reasons, calculation, final answer and a real lab link or a reason', () => {
    for (const e of WORK_EXERCISES) for (const p of e.parts.filter((x) => x.solution)) {
      const s = p.solution!;
      expect(s.hint.length).toBeGreaterThan(20); expect(s.reasoning.length).toBeGreaterThanOrEqual(2); for (const st of s.reasoning) expect(st.why.length).toBeGreaterThan(10);
      expect(s.calculation.length).toBeGreaterThan(0); expect(s.finalAnswer.length).toBeGreaterThan(5); expect(s.commonMistake.length).toBeGreaterThan(20);
      expect(s.lab !== null || Boolean(s.labNote)).toBe(true);
      if (s.lab) {
        const [path, query] = s.lab.href.split('?');
        expect(appSource).toContain(`path="${path}"`);
        const id = new URLSearchParams(query).get('experiment');
        expect(WORK_EXPERIMENTS.map((x) => x.id)).toContain(id);
      }
      for (const id of e.lessonIds) expect(CH.lessons[id]).toBeDefined();
    }
    for (const e of WORK_EXERCISES.filter((x) => x.parts.some((p) => p.solution))) expect(e.lessonIds.length, `Q${e.number}`).toBeGreaterThan(0);
  });
  it('numerical and sign results are recomputed independently from the model', () => {
    const r = recomputeWorkAnswers();
    expect(r.length).toBeGreaterThan(10);
    for (const x of r) expect(x.ok, `${x.id}: ${x.detail}`).toBe(true);
  });
  it('the exercise module is isolated from learning progress: viewing a solution can never be mastery evidence', () => {
    const code = exercisesSource.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(code).not.toMatch(/useEducationStore|localStorage/);
    for (const i of [...code.matchAll(/^import .* from '([^']+)'/gm)].map((m) => m[1])) expect(i, i).not.toMatch(/store/);
  });
  it('question summaries are original wording', () => {
    const verbatim = ['Work is said to be done when a force is applied, even if the object does not move', 'Lifting a bucket vertically upward results in positive work done on the bucket', 'A ball of mass 2 kg is thrown up with a velocity of 20 m s'];
    for (const e of WORK_EXERCISES) for (const v of verbatim) expect(e.summary.includes(v)).toBe(false);
  });
});

describe('Work mastery uses the shared evidence model', () => {
  const lessons = Object.values(CH.lessons);
  const lesson = CH.lessons['pw-l2'];
  it('a hint before a correct first answer is assisted, not independent evidence', async () => {
    const store = await fresh();
    store.getState().recordIndependentHint(lesson.id, 'i1');
    store.getState().submitIndependent(lesson.id, 'i1', { correct: true });
    expect(store.getState().lessons[lesson.id].independent.i1).toMatchObject({ correct: true, assisted: true, firstAttemptUnassisted: false });
  });
  it('wrong then right is not first-try success, and repeating a question cannot inflate evidence', async () => {
    const store = await fresh();
    store.getState().submitIndependent(lesson.id, 'i1', { correct: false });
    store.getState().submitIndependent(lesson.id, 'i1', { correct: true });
    expect(store.getState().lessons[lesson.id].independent.i1).toMatchObject({ correct: true, firstAttemptUnassisted: false });
    store.getState().submitIndependent(lesson.id, 'i2', { correct: true });
    store.getState().submitIndependent(lesson.id, 'i2', { correct: true });
    store.getState().submitIndependent(lesson.id, 'i2', { correct: true });
    expect(store.getState().lessons[lesson.id].independent.i2.firstAttemptUnassisted).toBe(true);
    expect(lessonStatus(lesson, store.getState().lessons[lesson.id])).not.toBe('mastered');
  });
  it('navigation alone (completing every step, no independent answers) is not mastery, for every lesson', async () => {
    const store = await fresh();
    for (const l of lessons) { for (const s of l.steps) store.getState().markStepSeen(l.id, s.id); expect(lessonStatus(l, store.getState().lessons[l.id]), l.id).not.toBe('mastered'); }
  });
  const record = (l: (typeof lessons)[number], right: (i: number) => boolean): LessonRecord => {
    const r = emptyLessonRecord();
    r.stepsSeen = l.steps.map((s) => s.id); r.workedSeen = true;
    l.guided.steps.forEach((g) => { r.guided[g.id] = { done: true, hints: 0, wrong: 0 }; });
    l.independent.forEach((it, i) => { r.independent[it.id] = right(i) ? { ...emptyIndependent(), attempts: 1, correct: true, firstAttemptUnassisted: true } : { ...emptyIndependent(), attempts: 2, correct: true, firstAttemptUnassisted: false }; });
    return r;
  };
  it('every objective is tested by at least two independent items', () => {
    for (const l of lessons) for (const o of l.objectives!) expect(l.independent.filter((i) => i.objective === o.id).length, `${l.id}/${o.id}`).toBeGreaterThanOrEqual(2);
  });
  it('all first-try: mastered; none: not; a missed objective blocks mastery even at 70%', () => {
    for (const l of lessons) {
      expect(lessonStatus(l, record(l, () => true)), l.id).toBe('mastered');
      expect(lessonStatus(l, record(l, () => false)), l.id).not.toBe('mastered');
      for (const o of l.objectives!) {
        const missed = new Set(l.independent.map((i, idx) => (i.objective === o.id ? idx : -1)).filter((x) => x >= 0));
        const rec = record(l, (i) => !missed.has(i));
        expect(objectiveCoverage(l, rec).filter((c) => !c.covered).map((c) => c.id)).toContain(o.id);
        expect(lessonStatus(l, rec), `${l.id}/${o.id}`).not.toBe('mastered');
      }
    }
  });
  it('a teacher demonstration is never mastery, and viewing a solution is never a first-try answer', () => {
    const l = lessons[0]; const r = record(l, () => true); r.teacherDemo = true;
    expect(lessonStatus(l, r)).not.toBe('mastered');
    const rec = record(l, () => true); for (const it of l.independent.filter((x) => x.objective === l.objectives![0].id)) rec.independent[it.id] = { ...emptyIndependent(), attempts: 1, correct: true, solutionShown: true, assisted: true, firstAttemptUnassisted: false };
    expect(lessonStatus(l, rec)).not.toBe('mastered');
  });
  it('the track length used by the lessons is within the model', () => {
    for (const { v } of allVisuals(CH)) { const s = (v.props as { setup: WorkSetup }).setup; expect(s.startPos + s.displacement).toBeLessThanOrEqual(TRACK_LENGTH); }
  });
});
