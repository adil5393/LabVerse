import { describe, expect, it } from 'vitest';
import { exerciseCoverage, illustrationFacts, MOTION_EXERCISES, Q13_POINTS, recomputeAnswers, solvedExerciseNumbers, trapezoidArea } from '../exercises';

// Independent hand calculations, written from the problem statements (not from the solution data).
const HAND: Record<number, Record<string, number>> = {
  1: { a: 4 * 250, b: 0 },
  2: { i: 12 + 6, ii: 6 - 0 },
  4: { a: (24 - 0) / 6, b: 0.5 * 4 * 6 * 6 },
  5: { a: -(28 * 28) / (2 * 98), b: 28 / 4, s: 98, v: 0 },
  8: { answer: 0.5 * (54 / 3.6 + 36 / 3.6) * 36, v: 36 },
  9: { answer: 0.5 * 5 * 20 + 10 * 20 + 0.5 * 6 * 20, v: 0 },
  10: { answer: 10 * 0.5 + (10 * 10) / (2 * 2.5), v: 0 },
  12: { i: 80 * 3, ii: 0.5 * (3 + 2) * 20, iii: 0.5 * 20 * 3 + 80 * 3 + 0.5 * (3 + 2) * 20, iv: (2 - 0) / 120 },
  13: { answer: 7 * 0.6 + 0.5 * (7 + 7.5) * 1.0 + 7.5 * 1.4 + 0.5 * (7.5 + 7) * 1.6 + 0.5 * (7 + 6.5) * 1.0 + 6.5 * 1.0 },
  14: { answer: 6 * 120 + 6 * 6 + 0.5 * 1 * 36 },
  15: { a: 5 / 5, aB: 3 / 10, b: 0.5 * 5 * 5, c: 0.5 * 10 * 3 },
  16: { i: 1.5 * 2 * (22 / 7) * 7, ii: 2 * 7, iii: (2 * (22 / 7) * 7) / 3600, iv: 14 / 5400 },
};

describe('NCERT exercises: complete, verified and honest', () => {
  it('all sixteen questions are solved, in textbook order', () => {
    expect(solvedExerciseNumbers()).toEqual(Array.from({ length: 16 }, (_, i) => i + 1));
  });

  it('exercise coverage audit: every part of every question has an answer', () => {
    const cov = exerciseCoverage();
    expect(cov).toHaveLength(16);
    for (const c of cov) {
      expect(c.missing, `Q${c.number} missing parts`).toEqual([]);
      expect(c.answerCount, `Q${c.number} answers`).toBeGreaterThanOrEqual(Math.max(1, c.partIds.length));
    }
    // the textbook's subparts
    const parts = (n: number) => cov.find((c) => c.number === n)!.partIds;
    expect(parts(2)).toEqual(['i', 'ii']); expect(parts(7)).toEqual(['i', 'ii', 'iii', 'iv']);
    expect(parts(12)).toEqual(['i', 'ii', 'iii', 'iv']); expect(parts(16)).toEqual(['i', 'ii', 'iii', 'iv']);
    expect(parts(1)).toEqual(['a', 'b']); expect(parts(3)).toEqual(['a', 'b']);
  });

  it('every solution has given, find, principle, hint, reasoned steps, an answer and an explanation', () => {
    for (const e of MOTION_EXERCISES) {
      const s = e.solution;
      expect(s.given.length, `Q${e.number}`).toBeGreaterThan(0); expect(s.find.length).toBeGreaterThan(0);
      expect(s.principle.length).toBeGreaterThan(30); expect(s.hint.length).toBeGreaterThan(20); expect(s.explanation.length).toBeGreaterThan(30);
      expect(s.steps.length).toBeGreaterThanOrEqual(3); for (const st of s.steps) expect(st.why.length).toBeGreaterThan(10);
      expect(s.verification.status).toBe('verified');
      if (s.kind === 'numerical' || s.kind === 'graph') expect(s.formulas?.length, `Q${e.number} formulas`).toBeGreaterThan(0);
    }
  });

  it('numerical answers equal the hand calculation and the engine recomputation', () => {
    for (const e of MOTION_EXERCISES) {
      const hand = HAND[e.number]; if (!hand) continue;
      const eng = recomputeAnswers(e.number);
      for (const k of Object.keys(hand)) expect(eng[k], `Q${e.number} engine ${k}`).toBeCloseTo(hand[k], 6);
      for (const a of e.solution.answers) if (a.numeric !== undefined) {
        const key = a.part ?? 'answer';
        expect(hand[key], `Q${e.number} has a hand value for ${key}`).toBeDefined();
        expect(Math.abs(hand[key] - a.numeric), `Q${e.number} stated ${key}`).toBeLessThanOrEqual(a.tolerance ?? 1e-6);
      }
    }
    expect(trapezoidArea(Q13_POINTS)).toBeCloseTo(46.8, 9);
  });

  it('the stated results of the numerical questions', () => {
    const ans = (n: number, part?: string) => MOTION_EXERCISES[n - 1].solution.answers.find((a) => a.part === part || (!part && !a.part))!;
    expect(ans(4, 'a').numeric).toBe(4); expect(ans(4, 'b').numeric).toBe(72);
    expect(ans(5, 'a').numeric).toBe(-4); expect(ans(5, 'b').numeric).toBe(7);
    expect(ans(8).numeric).toBe(450); expect(ans(9).numeric).toBe(310); expect(ans(10).numeric).toBe(25);
    expect(ans(12, 'iii').numeric).toBe(320); expect(ans(14).numeric).toBe(774);
    expect(ans(15, 'b').numeric).toBe(12.5); expect(ans(15, 'c').numeric).toBe(15);
    expect(ans(16, 'i').numeric).toBe(66); expect(ans(16, 'ii').numeric).toBe(14);
  });

  it('Q10: 25 m is less than 30 m, so the bus stops in time; with a 1 s reaction it would just reach the obstacle', () => {
    expect(recomputeAnswers(10).answer).toBeLessThan(30);
    expect(10 * 1.0 + 100 / 5).toBe(30);
  });

  it('Q16: the displacement is a diameter and the average velocity is smaller than the speed', () => {
    const r = recomputeAnswers(16);
    expect(r.ii).toBeCloseTo(14, 9); expect(r.iv).toBeLessThan(r.iii);
  });

  it('Q3: at constant speed the velocity direction keeps changing (an acceleration)', () => {
    const f = illustrationFacts().q3;
    for (const s of f.speedAt) expect(s).toBeCloseTo(Math.PI, 9);
    expect(new Set(f.angleAt.map((a) => Math.round(a))).size).toBe(3);
  });

  it('Q6: the illustrative lines meet at t = 5 s but have different velocities, so they never have equal velocity', () => {
    const f = illustrationFacts().q6;
    expect(f.aAt5).toBeCloseTo(f.bAt5, 9); expect(f.aVelocity).not.toBe(f.bVelocity);
  });

  it('Q7: the illustrative paths have equal average speed and equal average velocity, as options (i) and (ii) state', () => {
    const { A, B } = illustrationFacts().q7;
    expect(A.averageVelocity).toBeCloseTo(B.averageVelocity!, 9); expect(A.averageSpeed).toBeCloseTo(B.averageSpeed!, 9);
    expect(A.distanceM).toBeCloseTo(A.displacementM, 9); expect(B.distanceM).toBeCloseTo(B.displacementM, 9);
    const sol = MOTION_EXERCISES[6].solution;
    const verdict = Object.fromEntries(sol.answers.map((a) => [a.part, a.value]));
    expect(verdict).toEqual({ i: 'Correct', ii: 'Correct', iii: 'Incorrect', iv: 'Incorrect' });
  });

  it('labs are linked only where the model fits; otherwise the page says why not', () => {
    for (const e of MOTION_EXERCISES) {
      const s = e.solution;
      if (!s.labs || s.labs.length === 0) expect(s.labNote ?? s.explanation, `Q${e.number}`).toBeTruthy();
      for (const l of s.labs ?? []) expect(l.href).toMatch(/^\/physics\/motion\//);
    }
    // questions whose model has several stages with different accelerations are not linked to a single-acceleration lab
    for (const n of [9, 10, 14]) expect(MOTION_EXERCISES[n - 1].solution.labs ?? []).toEqual([]);
    expect(MOTION_EXERCISES[12].solution.labs ?? []).toEqual([]);
  });

  it('question summaries are original wording (no long verbatim runs from the textbook)', () => {
    const verbatim = [
      'My father went to a shop from home which is located at a distance', 'A girl is riding her scooter and finds that its speedometer reading is constant',
      'A student said, “The Earth moves around the Sun”', 'Rohan studies science from 6 PM to 7:30 PM at home',
    ];
    for (const e of MOTION_EXERCISES) for (const v of verbatim) expect(e.summary.includes(v)).toBe(false);
  });
});
