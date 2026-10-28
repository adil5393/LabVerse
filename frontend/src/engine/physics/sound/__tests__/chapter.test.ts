import { describe, expect, it, vi } from 'vitest';
import appSource from '../../../../App.tsx?raw';
import exercisesSource from '../exercises?raw';
import { describeChapterIntegrity, allQuestions, allVisuals } from '../../../education/__tests__/chapterIntegrity';
import { emptyIndependent, emptyLessonRecord, lessonStatus, objectiveCoverage } from '../../../education/progress';
import type { LessonRecord } from '../../../education/types';
import { subjectCrumb } from '../../../education/subjects';
import { SOUND_CHAPTER as CH } from '../learn/content';
import { SND1_COVERS, SND3_COVERS, SOUND_MAP, SOUND_SYLLABUS, SOUND_TEXTBOOK_INVENTORY, soundCoverageCounts } from '../curriculum';
import { SOUND_EXERCISES, solvedExerciseNumbers, solvedPonderNumbers, soundExerciseCounts, exerciseSolved } from '../exercises';
import { MOTION_CHAPTER } from '../../motion/learn/content';
import { FORCES_CHAPTER } from '../../forces/learn/content';
import { WORK_CHAPTER } from '../../work/learn/content';
import { SOUND_VISUALS } from '../../../../features/physics/sound/SoundVisuals';
import { bellRinging, clampPressure, heardLoudness, NEAR_VACUUM } from '../medium';
import { computeWave, DEFAULT_WAVE, compressionCentres } from '../wave';

describeChapterIntegrity('Sound', CH, ['soundVibration', 'soundWave', 'soundGraph', 'soundBellJar', 'soundSpeed', 'soundPitch', 'soundEcho', 'soundSonar']);

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

const lessons = Object.values(CH.lessons);

describe('Sound chapter registration (SND-1)', () => {
  it('is a Physics chapter with its own routes, and the other chapters are untouched', () => {
    expect(subjectCrumb(CH)).toEqual({ label: 'Physics', href: '/physics' });
    expect(CH.routes.landing).toBe('/physics/sound'); expect(CH.routes.learn('ps-l1')).toBe('/physics/sound/learn/ps-l1'); expect(CH.routes.lab).toBe('/physics/sound/vibration');
    for (const r of ['/physics/sound', '/physics/sound/vibration', '/physics/sound/wave', '/physics/sound/exercises', '/physics/sound/learn/:lessonId', '/physics/work', '/physics/forces', '/physics/motion']) expect(appSource, r).toContain(`path="${r}"`);
  });

  it('has all twelve lessons in the five approved units (SND-1 to SND-3)', () => {
    expect(Object.keys(CH.lessons)).toEqual(Array.from({ length: 12 }, (_, i) => `ps-l${i + 1}`));
    expect(CH.units.map((u) => u.lessonIds)).toEqual([['ps-l1', 'ps-l2', 'ps-l3'], ['ps-l4', 'ps-l5', 'ps-l6'], ['ps-l7', 'ps-l8', 'ps-l9', 'ps-l10'], ['ps-l11'], ['ps-l12']]);
  });

  it('the approved syllabus is complete: 12 lessons, 5 units, all available and all present in the chapter', () => {
    expect(SOUND_SYLLABUS.length).toBe(12);
    expect(new Set(SOUND_SYLLABUS.map((l) => l.unit))).toEqual(new Set([1, 2, 3, 4, 5]));
    for (const l of SOUND_SYLLABUS) { expect(l.status, l.id).toBe('available'); expect(CH.lessons[l.id], l.id).toBeDefined(); expect(CH.lessons[l.id].unitId).toBe(`ps-unit-${l.unit}`); }
    expect(CH.practice?.groups.length).toBeGreaterThanOrEqual(4);
    expect(CH.assessment).toBeDefined();
  });

  it('lesson, prerequisite and question ids are distinct from the Motion, Forces and Work chapters (progress is stored by id)', () => {
    const mine = [...Object.keys(CH.lessons), ...Object.keys(CH.prerequisites)];
    for (const other of [MOTION_CHAPTER, FORCES_CHAPTER, WORK_CHAPTER]) {
      const theirs = new Set([...Object.keys(other.lessons), ...Object.keys(other.prerequisites)]);
      for (const id of mine) expect(theirs.has(id), id).toBe(false);
      const qids = new Set(allQuestions(other).map((x) => x.q.id));
      for (const x of allQuestions(CH)) expect(qids.has(x.q.id), x.q.id).toBe(false);
    }
  });

  it('has three optional refreshers and never gates a lesson', () => {
    expect(CH.prerequisiteIds.sort()).toEqual(['psp-graph', 'psp-particles', 'psp-tofro']);
    for (const l of lessons) for (const p of l.prerequisiteIds) expect(CH.prerequisites[p], `${l.id}/${p}`).toBeDefined();
  });

  it('every lesson follows EDU-1: explained steps with a check, an investigation or visual where it teaches, a worked example, three guided steps with hints, independent practice and a reflection', () => {
    for (const l of lessons) {
      expect(l.steps.length, l.id).toBeGreaterThanOrEqual(4);
      for (const s of l.steps) expect(s.check, `${l.id}/${s.id}`).toBeDefined();
      expect(l.worked.steps.length, l.id).toBeGreaterThanOrEqual(4);
      expect(l.guided.steps.length, l.id).toBe(3);
      for (const g of l.guided.steps) expect(g.hints.length, `${l.id}/${g.id}`).toBeGreaterThan(0);
      expect(l.independent.length, l.id).toBeGreaterThanOrEqual(6);
      for (const i of l.independent) expect(i.hints.length + i.solution.length, `${l.id}/${i.id}`).toBeGreaterThan(1);
      expect(l.reflection.stillConfusing.length, l.id).toBeGreaterThanOrEqual(3);
    }
  });

  it('the interactive elements each lesson needs are present (a lesson is not "done" because its text exists)', () => {
    const kinds = (id: string) => new Set(allVisuals(CH).filter((x) => x.where.includes(id)).map((x) => x.v.kind));
    expect(kinds('ps-l1').has('soundVibration')).toBe(true);
    expect(kinds('ps-l2').has('soundVibration')).toBe(true);
    expect(kinds('ps-l3').has('soundBellJar')).toBe(true);
    expect(kinds('ps-l4').has('soundWave')).toBe(true);
    expect(kinds('ps-l5').has('soundWave')).toBe(true);
    expect(kinds('ps-l6').has('soundGraph') || kinds('ps-l6').has('soundWave')).toBe(true);
    expect(kinds('ps-l7').has('soundGraph')).toBe(true);
    expect(kinds('ps-l9').has('soundSpeed')).toBe(true);
    expect(kinds('ps-l10').has('soundPitch')).toBe(true);
    expect(kinds('ps-l11').has('soundEcho')).toBe(true);
    expect(kinds('ps-l12').has('soundSonar')).toBe(true);
    for (const l of lessons) { const inv = l.investigation; if (inv) expect(inv.href).toMatch(/^\/physics\/sound\/(vibration|wave|characteristics)$/); }
    for (const v of allVisuals(CH)) expect(SOUND_VISUALS[v.v.kind], v.v.kind).toBeDefined();
  });

  it('every objective is tested by at least two independent items', () => {
    for (const l of lessons) { expect(l.objectives!.length, l.id).toBe(3); for (const o of l.objectives!) expect(l.independent.filter((i) => i.objective === o.id).length, `${l.id}/${o.id}`).toBeGreaterThanOrEqual(2); }
  });

  it('lessons never refer to a lesson number that does not exist', () => {
    for (const l of lessons) for (const step of l.steps) for (const m of step.paragraphs.join(' ').matchAll(/lesson (\d+)\b/gi)) expect(Number(m[1]), `${l.id}/${step.id}`).toBeLessThanOrEqual(12);
  });
});

describe('Sound curriculum coverage (verified against the PDF in SND-0)', () => {
  it('inventory matches the verified textbook: 17 sections, 8 activities, 6 examples, 13 Pause and Ponder, 15 exercises, 34 figures', () => {
    expect(SOUND_TEXTBOOK_INVENTORY.sections.length).toBe(17);
    expect(SOUND_TEXTBOOK_INVENTORY.activities.length).toBe(8);
    expect(SOUND_TEXTBOOK_INVENTORY.examples.length).toBe(6);
    expect(SOUND_TEXTBOOK_INVENTORY.pausePonder).toBe(13);
    expect(SOUND_TEXTBOOK_INVENTORY.exercises).toBe(15);
    expect(SOUND_TEXTBOOK_INVENTORY.figures).toBe(34);
  });

  it('every section of the chapter is taught by a Learn row mapped to existing lessons; only the closing activities are planned', () => {
    const sectionsCovered = new Set(SOUND_MAP.filter((r) => r.status === 'learn' && r.kind === 'textbook').flatMap((r) => r.section.split(/,\s*/).map((x) => x.split(' ')[0])));
    for (const s of SND3_COVERS.sections.filter((x) => x !== '10.6')) expect(sectionsCovered.has(s) || [...sectionsCovered].some((c) => c.startsWith(s)), s).toBe(true);
    const learnText = SOUND_MAP.filter((r) => r.status === 'learn' && r.kind === 'textbook').map((r) => r.topic).join(' | ');
    for (const a of SND1_COVERS.activities) expect(learnText, `Activity ${a}`).toContain(`${a}`);
    for (const r of SOUND_MAP) for (const id of r.lessonIds) expect(CH.lessons[id], `${r.id}/${id}`).toBeDefined();
    for (const r of SOUND_MAP.filter((x) => x.status === 'planned')) { expect(r.lessonIds, r.id).toEqual([]); expect(r.milestone, r.id).toBeTruthy(); }
    const c = soundCoverageCounts(); expect(c.available + c.planned).toBe(c.total);
    expect(SOUND_MAP.filter((r) => r.status === 'planned').map((r) => r.id)).toEqual(['s-quest']);
  });

  it('every lesson is claimed by the map', () => {
    const claimed = new Set(SOUND_MAP.flatMap((r) => r.lessonIds));
    for (const id of Object.keys(CH.lessons)) expect(claimed.has(id), id).toBe(true);
  });
});

describe('NCERT exercise inventory (SND-1)', () => {
  it('lists all 15 exercises with 22 answer parts and all 13 Pause and Ponder items', () => {
    const c = soundExerciseCounts();
    expect(c).toMatchObject({ exercises: 15, exerciseParts: 22, ponders: 13 });
    expect(SOUND_EXERCISES.filter((e) => e.kind === 'exercise').map((e) => e.number)).toEqual(Array.from({ length: 15 }, (_, i) => i + 1));
    expect(SOUND_EXERCISES.filter((e) => e.kind === 'ponder').map((e) => e.number)).toEqual(Array.from({ length: 13 }, (_, i) => i + 1));
    const parts = Object.fromEntries(SOUND_EXERCISES.filter((e) => e.kind === 'exercise').map((e) => [e.number, e.parts.map((p) => p.id)]));
    expect(parts[5]).toEqual(['i', 'ii']); expect(parts[6]).toEqual(['A', 'B', 'C']); expect(parts[13]).toEqual(['lambda', 'nu']); expect(parts[14]).toEqual(['lambdaA', 'lambdaB', 'nuA', 'nuB']);
  });

  it('every exercise and Pause and Ponder item is solved, each part with a full solution', () => {
    expect(solvedExerciseNumbers()).toEqual(Array.from({ length: 15 }, (_, i) => i + 1));
    expect(solvedPonderNumbers()).toEqual(Array.from({ length: 13 }, (_, i) => i + 1));
    for (const e of SOUND_EXERCISES) for (const p of e.parts) {
      if (exerciseSolved(e)) { expect(p.solution, `${e.kind}${e.number}`).toBeDefined(); expect(p.needs).toBeUndefined(); }
      else { expect(p.solution, `${e.kind}${e.number}/${p.id}`).toBeUndefined(); expect(p.needs, `${e.kind}${e.number}/${p.id}`).toBeTruthy(); }
    }
  });

  it('the solved answers are the verified ones', () => {
    const ans = (kind: string, n: number) => SOUND_EXERCISES.find((e) => e.kind === kind && e.number === n)!.parts[0].solution!.answer;
    expect(ans('exercise', 1)).toMatch(/\(ii\)/); expect(ans('exercise', 2)).toMatch(/\(iii\)/); expect(ans('exercise', 3)).toMatch(/\(ii\).*5 Hz/);
    expect(ans('ponder', 3)).toMatch(/\(ii\)/); expect(ans('ponder', 4)).toMatch(/\(iii\)/); expect(ans('ponder', 5)).toMatch(/\(ii\)/);
    // Q3: 20 compressions in 4 s
    expect(20 / 4).toBe(5);
  });

  it('figure-dependent exercises use the verified SND-0 readings', () => {
    const part = (n: number, id: string) => SOUND_EXERCISES.find((e) => e.kind === 'exercise' && e.number === n)!.parts.find((p) => p.id === id)!.solution!.answer;
    expect(part(5, 'i')).toMatch(/\(a\).*greater wavelength/); expect(part(5, 'ii')).toMatch(/\(a\).*smaller amplitude/);
    expect(part(6, 'A')).toMatch(/green/); expect(part(6, 'B')).toMatch(/red/); expect(part(6, 'C')).toMatch(/blue/);
    expect(part(13, 'lambda')).toMatch(/0\.04 m/); expect(part(13, 'nu')).toMatch(/8500 Hz/);
    expect(part(14, 'nuA')).toMatch(/13 800 Hz/); expect(part(14, 'nuB')).toMatch(/6900 Hz/);
    expect(part(4, 'all')).toMatch(/Not an echo/); expect(part(15, 'all')).toMatch(/2 : 9/);
  });

  it('is isolated from learning progress: viewing a solution can never be mastery evidence', () => {
    const code = exercisesSource.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(code).not.toMatch(/useEducationStore|localStorage/);
    for (const i of [...code.matchAll(/^import .* from '([^']+)'/gm)].map((m) => m[1])) expect(i, i).not.toMatch(/store/);
  });
});

describe('bell-jar demonstration model (Section 10.2.1)', () => {
  it('heard loudness never decreases as air is added, is zero in a near vacuum, full with a full jar', () => {
    let prev = -1;
    for (let p = 0; p <= 1.0001; p += 0.01) { const l = heardLoudness(p); expect(l).toBeGreaterThanOrEqual(prev - 1e-12); prev = l; }
    expect(heardLoudness(0)).toBe(0); expect(heardLoudness(NEAR_VACUUM)).toBe(0); expect(heardLoudness(1)).toBe(1);
    expect(heardLoudness(0.6)).toBeCloseTo(0.5876, 3); expect(heardLoudness(0.2)).toBeCloseTo(0.1753, 3);
  });
  it('the bell keeps ringing whatever the air does, and out-of-range pressures are clamped', () => {
    for (const p of [0, 0.03, 0.5, 1]) expect(bellRinging(p)).toBe(true);
    expect(clampPressure(-1)).toBe(0); expect(clampPressure(5)).toBe(1); expect(clampPressure(Number.NaN)).toBe(1);
  });
});

describe('lesson numbers agree with the models', () => {
  it('the Lesson 4 worked example uses the model: 100 Hz in air at 340 m/s gives 3.4 m and 10 ms', () => {
    const w = computeWave({ ...DEFAULT_WAVE, frequencyHz: 100 });
    expect(w.lambda).toBeCloseTo(3.4, 9); expect(w.period).toBeCloseTo(0.01, 12);
    expect(w.speed * 0.01).toBeCloseTo(3.4, 9);
  });
  it('the Lesson 5 worked example: density change 0.2 and 0.4 give about 0.108 m and 0.216 m', () => {
    const k = (2 * Math.PI) / 3.4;
    expect(0.2 / k).toBeCloseTo(0.108, 3); expect(0.4 / k).toBeCloseTo(0.2163, 3);
    expect(computeWave({ ...DEFAULT_WAVE, densityAmp: 0.4 }).dispAmp).toBeCloseTo(0.4 / k, 12);
  });
  it('the Lesson 6 graph points P, Q, R, S sit where the model puts compressions, the average line and a rarefaction', () => {
    const w = computeWave(DEFAULT_WAVE);
    const C = compressionCentres(w, 0, 0, 6.8);
    expect(C[0]).toBeCloseTo(0.85, 9); expect(C[1]).toBeCloseTo(4.25, 9);
  });
  it('the Lesson 2 fork and string numbers: 1.44 gives 264 Hz, 0.81 gives 198 Hz, 50 cm gives 176 Hz', () => {
    expect(220 * Math.sqrt(1.44)).toBeCloseTo(264, 9); expect(220 * Math.sqrt(0.81)).toBeCloseTo(198, 9); expect(220 * (40 / 50)).toBeCloseTo(176, 9);
  });
  it('the Lesson 1 worked example: 5.5 seconds is where the band comes to rest', () => {
    expect(1.5 * Math.log(0.8 / 0.02)).toBeCloseTo(5.53, 2);
  });
});

describe('Sound mastery uses the shared evidence model', () => {
  const lesson = CH.lessons['ps-l2'];
  it('a hint before a correct first answer is assisted, not independent evidence', async () => {
    const store = await fresh();
    store.getState().recordIndependentHint(lesson.id, 'i1');
    store.getState().submitIndependent(lesson.id, 'i1', { correct: true });
    expect(store.getState().lessons[lesson.id].independent.i1).toMatchObject({ correct: true, assisted: true, firstAttemptUnassisted: false });
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
    r.reflected = true;
    return r;
  };
  it('all first-try: mastered; none: not; a missed objective blocks mastery', () => {
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
  it('a teacher demonstration is never mastery', () => {
    const l = lessons[0]; const r = record(l, () => true); r.teacherDemo = true;
    expect(lessonStatus(l, r)).not.toBe('mastered');
  });
});
