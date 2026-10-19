import { describe, it, expect } from 'vitest';
import { allQuestions, allVisuals, describeChapterIntegrity } from '../../../../education/__tests__/chapterIntegrity';
import { evaluateAnswer, evaluateOrder } from '../../../../education/evaluate';
import { lessonStatus, objectiveCoverage } from '../../../../education/progress';
import type { LessonRecord, OrderQuestion, Question } from '../../../../education/types';
import { emptyIndependent, emptyLessonRecord } from '../../../../education/progress';
import { getFactors } from '../../numberPredicates';
import { PROPOSITIONS_CHAPTER as CH, PROP_JUDGES } from '../content';
import { AREA_PAIRS, angleAt, classifyQuad, congruentBySSS, dist, factorPairs, factsFromSticks, quadFromSticks, thirdSide, triangleArea, triangleFacts, triangleFromAngle, classifyBySides } from '../geometry';
import { CLAIM_LIST, CLAIMS, combinationOf, converseOf, counterexamples, evalPred, judgeCounterexample, smallestCounterexample, standing } from '../logic';
import { firstFailure } from '../questions';

describeChapterIntegrity('Propositions', CH, ['numberGrid', 'factorPairs', 'eulerStrip', 'triangle', 'twoTriangles', 'sticks'], PROP_JUDGES);

const LIMIT = 5000;

describe('Propositions: authored truth agrees with brute force (necessary check) and reasons are right', () => {
  it('every claim marked true has NO counterexample up to 5000; every claim marked false HAS one', () => {
    for (const c of CLAIM_LIST) {
      const fwd = counterexamples(c, 1, LIMIT), bwd = counterexamples(converseOf(c), 1, LIMIT);
      expect(fwd.length === 0, `${c.id} forward`).toBe(c.holds);
      expect(bwd.length === 0, `${c.id} converse`).toBe(c.converseHolds);
    }
  });
  it('the claim bank covers all four combinations (statement, converse)', () => {
    expect(new Set(CLAIM_LIST.map(combinationOf))).toEqual(new Set(['both-true', 'true-false', 'false-true', 'both-false']));
  });
  it('the textbook examples and exercises are present with the right truth values', () => {
    expect(CLAIMS.mult6to3).toMatchObject({ holds: true, converseHolds: false }); // Example 2
    expect(CLAIMS.squareOddFactors).toMatchObject({ holds: true, converseHolds: true }); // Example 3
    expect(CLAIMS.mult24to46).toMatchObject({ holds: true, converseHolds: false }); // Exercise 8 style
    expect(smallestCounterexample(converseOf(CLAIMS.mult6to3))).toBe(3);
    expect(smallestCounterexample(CLAIMS.primeOdd)).toBe(2);
    expect(smallestCounterexample(converseOf(CLAIMS.primeOdd))).toBe(1);
  });
  it('perfect square <-> odd number of factors, and the partner-pair argument holds for every n up to 2000', () => {
    for (let n = 1; n <= 2000; n++) {
      const fs = getFactors(n);
      const sq = Number.isInteger(Math.sqrt(n));
      expect(fs.length % 2 === 1, `n=${n}`).toBe(sq);
      const fp = factorPairs(n);
      expect(fp.factorCount).toBe(fs.length);
      // each factor has a partner that is also a factor
      for (const f of fs) expect(fs).toContain(n / f);
      // at most ONE self-partner (the fact the textbook adds for the other direction)
      expect(fp.pairs.filter(([a, b]) => a === b).length).toBeLessThanOrEqual(1);
      expect(fp.selfPaired !== null).toBe(sq);
    }
  });
  it('the three-factor claim: exactly the squares of primes', () => {
    const three = Array.from({ length: 2000 }, (_, i) => i + 1).filter((n) => evalPred({ k: 'factorCount', n: 3 }, n));
    expect(three).toEqual([4, 9, 25, 49, 121, 169, 289, 361, 529, 841, 961, 1369, 1681, 1849]);
  });
  it('proof algebra holds numerically (sum of evens, multiple of 6 -> 3, multiple of 24 -> 4 and 6)', () => {
    for (let m = -20; m <= 20; m++) for (let k = -20; k <= 20; k++) expect(2 * m + 2 * k).toBe(2 * (m + k));
    for (let k = 1; k <= 500; k++) { expect(6 * k).toBe(3 * (2 * k)); expect(24 * k).toBe(4 * (6 * k)); expect(24 * k).toBe(6 * (4 * k)); }
  });
  it('Fermat and Euler facts quoted in the lessons: F0..F4 prime, F5 = 641 x 6700417', () => {
    const F = (n: number) => 2n ** (2n ** BigInt(n)) + 1n;
    expect([F(0), F(1), F(2), F(3), F(4)].map(Number)).toEqual([3, 5, 17, 257, 65537]);
    expect(F(5)).toBe(4294967297n);
    expect(641n * 6700417n).toBe(F(5));
  });
  it('Euler n^2+n+41 is prime for n=0..39 and fails first at n=40 (41 x 41); n^2+n+11 first fails at n=10 (11 x 11)', () => {
    expect(firstFailure(41)).toBe(40);
    expect(40 * 40 + 40 + 41).toBe(41 * 41);
    expect(firstFailure(11)).toBe(10);
    expect(10 * 10 + 10 + 11).toBe(121);
  });
});

describe('Propositions: counterexample judges', () => {
  it('accept exactly the true counterexamples and give a specific reason otherwise', () => {
    for (const c of CLAIM_LIST) for (const claim of [c, converseOf(c)]) {
      if (claim.holds) continue;
      for (let n = 1; n <= 200; n++) {
        const v = judgeCounterexample(claim, n);
        expect(v.correct, `${claim.id} ${n}`).toBe(standing(claim, n) === 'disproves');
        if (!v.correct) { expect(v.message.length).toBeGreaterThan(30); expect(v.misconception).toMatch(/supporting_example_as_counterexample|hypothesis_false_as_counterexample/); }
      }
    }
    expect(judgeCounterexample(CLAIMS.ends5to10, 0).misconception).toBe('outside_domain');
    expect(judgeCounterexample(CLAIMS.ends5to10, -5).misconception).toBe('outside_domain');
  });
  it('the three kinds of number get three different explanations', () => {
    const c = CLAIMS.mult3to9;
    expect(judgeCounterexample(c, 6).correct).toBe(true);
    expect(judgeCounterexample(c, 9).message).toMatch(/fits the claim|also/);
    expect(judgeCounterexample(c, 7).message).toMatch(/does not even satisfy the first part/);
  });
  it('judged questions evaluate through the registry, reject non-integers and are not attempts when invalid', () => {
    const q = allQuestions(CH).map((x) => x.q).find((x) => x.kind === 'judged')!;
    expect(evaluateAnswer(q, { kind: 'numeric', text: '2.5' }, PROP_JUDGES).invalid).toBe(true);
    expect(evaluateAnswer(q, { kind: 'numeric', text: 'abc' }, PROP_JUDGES).invalid).toBe(true);
    expect(evaluateAnswer(q, { kind: 'numeric', text: '15' }).invalid).toBe(true); // no registry: cannot be checked
  });
  it('every judged question accepts its smallest counterexample and rejects a supporting example', () => {
    let seen = 0;
    for (const { q } of allQuestions(CH)) {
      if (q.kind !== 'judged') continue;
      seen++;
      const id = q.judgeId.replace('counter:', '');
      const base = id.endsWith('~') ? converseOf(CLAIMS[id.slice(0, -1)]) : CLAIMS[id];
      const ce = smallestCounterexample(base)!;
      expect(evaluateAnswer(q, { kind: 'numeric', text: String(ce) }, PROP_JUDGES).correct, q.id).toBe(true);
      const support = Array.from({ length: 200 }, (_, i) => i + 1).find((n) => standing(base, n) === 'supports');
      if (support) expect(evaluateAnswer(q, { kind: 'numeric', text: String(support) }, PROP_JUDGES).correct, q.id).toBe(false);
    }
    expect(seen).toBeGreaterThanOrEqual(6);
  });
});

describe('Propositions: geometry computed from coordinates', () => {
  it('isosceles triangles: equal sides <-> equal base angles, in both directions, for many apexes', () => {
    const B = { x: -3, y: 0 }, C = { x: 3, y: 0 };
    for (let x = -5; x <= 5; x++) for (let y = 1; y <= 6; y++) {
      const f = triangleFacts({ x, y }, B, C);
      expect(f.equalSides, `(${x},${y})`).toBe(f.equalBaseAngles);
      expect(f.equalSides).toBe(x === 0);
      expect(f.angles.A + f.angles.B + f.angles.C).toBeCloseTo(180, 6);
    }
  });
  it('altitude proof figure: AD is perpendicular to BC, AAS facts hold, AB = AC', () => {
    const A = { x: 0, y: 4 }, B = { x: -3, y: 0 }, C = { x: 3, y: 0 }, D = { x: 0, y: 0 };
    expect(angleAt(A, D, B)).toBeCloseTo(90, 6);
    expect(angleAt(A, D, C)).toBeCloseTo(90, 6);
    expect(angleAt(A, B, C)).toBeCloseTo(angleAt(A, C, B), 6);
    expect(dist(A, B)).toBeCloseTo(dist(A, C), 9);
    expect(congruentBySSS([A, D, B], [A, D, C])).toBe(true);
  });
  it('equal area pair: same area 12, NOT congruent; the second pair is congruent with equal areas', () => {
    const [p1, p2] = AREA_PAIRS;
    expect(triangleArea(...p1.t1)).toBeCloseTo(12, 9);
    expect(triangleArea(...p1.t2)).toBeCloseTo(12, 9);
    expect(congruentBySSS(p1.t1, p1.t2)).toBe(false);
    expect(congruentBySSS(p2.t1, p2.t2)).toBe(true);
    expect(triangleArea(...p2.t1)).toBeCloseTo(triangleArea(...p2.t2), 9);
  });
  it('Pythagoras: for every integer triple a^2+b^2=c^2 the angle is 90; the third side from the angle matches', () => {
    for (const [a, b, c] of [[3, 4, 5], [5, 12, 13], [6, 8, 10], [7, 24, 25], [8, 15, 17]]) {
      expect(classifyBySides(a, b, c)).toBe('right');
      const T = triangleFromAngle(a, b, 90);
      expect(dist(T.A, T.B)).toBeCloseTo(c, 9);
      expect(thirdSide(a, b, 90) ** 2).toBeCloseTo(a * a + b * b, 9);
      // converse construction: right triangle XYZ with legs a, b has hypotenuse sqrt(a^2+b^2) = c, so SSS gives congruence
      expect(Math.hypot(a, b)).toBeCloseTo(c, 12);
    }
    expect(classifyBySides(4, 5, 7)).toBe('obtuse'); // 16 + 25 = 41 < 49
    expect(classifyBySides(5, 6, 7)).toBe('acute'); // 61 > 49
    // for a = 3, b = 4 the side c^2 equals 25 only at 90 degrees (strictly increasing in the angle)
    let prev = -1;
    for (let ang = 20; ang <= 160; ang += 5) { const c2 = thirdSide(3, 4, ang) ** 2; expect(c2).toBeGreaterThan(prev); prev = c2; expect(Math.abs(c2 - 25) < 1e-9).toBe(ang === 90); }
  });
  it('two sticks: bisecting equal diagonals give a rectangle at every angle; equal diagonals off-centre give an isosceles trapezium (not a rectangle)', () => {
    for (const angle of [40, 60, 70, 90, 120]) {
      const f = factsFromSticks({ len1: 8, len2: 8, t1: 0.5, t2: 0.5, angle });
      expect(f.name).toBe(angle === 90 ? 'square' : 'rectangle');
      expect(f.isRectangle && f.diagonalsEqual).toBe(true);
      expect(f.counterexampleToConverse).toBe(false);
    }
    for (const t of [0.2, 0.3, 0.4, 0.6, 0.7]) for (const angle of [50, 70, 110]) {
      const f = factsFromSticks({ len1: 8, len2: 8, t1: t, t2: t, angle });
      expect(f.diagonalsEqual, `${t} ${angle}`).toBe(true);
      expect(f.name, `${t} ${angle}`).toBe('isosceles trapezium');
      expect(f.isRectangle).toBe(false);
      expect(f.counterexampleToConverse).toBe(true);
    }
    expect(factsFromSticks({ len1: 8, len2: 6, t1: 0.5, t2: 0.5, angle: 90 }).diagonalsEqual).toBe(false);
  });
  it('the old fixed isosceles trapezium (bases 6 and 2, height 5) has equal diagonals sqrt(41) = 6.4 and angles that are not 90', () => {
    const P = { x: 0, y: 0 }, Q = { x: 6, y: 0 }, R = { x: 4, y: 5 }, S = { x: 2, y: 5 };
    const f = classifyQuad(P, Q, R, S);
    expect(f.name).toBe('isosceles trapezium');
    expect(f.diagonalAC).toBeCloseTo(Math.sqrt(41), 9);
    expect(f.diagonalBD).toBeCloseTo(Math.sqrt(41), 9);
    expect(f.counterexampleToConverse).toBe(true);
  });
  it('quadrilateral classification covers rectangle, parallelogram, rhombus and non-convex input', () => {
    expect(classifyQuad({ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 3 }, { x: 0, y: 3 }).name).toBe('rectangle');
    expect(classifyQuad({ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 3 }, { x: 1, y: 3 }).name).toBe('parallelogram');
    expect(classifyQuad({ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 8, y: 4 }, { x: 3, y: 4 }).name).toBe('rhombus');
    expect(classifyQuad({ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 4 }).convex).toBe(false);
    const q = quadFromSticks({ len1: 8, len2: 8, t1: 0.5, t2: 0.5, angle: 70 });
    expect(dist(q.A, q.C)).toBeCloseTo(8, 9);
  });
});

describe('Propositions: step-ordering questions accept exactly the valid orders', () => {
  const orders = allQuestions(CH).map((x) => x.q).filter((q): q is OrderQuestion => q.kind === 'order');
  const perms = <T,>(xs: T[]): T[][] => (xs.length <= 1 ? [xs] : xs.flatMap((x, i) => perms([...xs.slice(0, i), ...xs.slice(i + 1)]).map((p) => [x, ...p])));
  it('there are ordering questions for each proof in the chapter', () => {
    expect(orders.length).toBeGreaterThanOrEqual(6);
  });
  it('for every ordering question, evaluateOrder agrees with an independent topological-order check over ALL permutations', () => {
    for (const q of orders) {
      const ids = q.items.map((i) => i.id);
      let valid = 0;
      for (const p of perms(ids)) {
        const pos = new Map(p.map((id, i) => [id, i]));
        const ok = q.items.every((it) => it.needs.every((n) => pos.get(n)! < pos.get(it.id)!));
        const ev = evaluateOrder(q.items, p, q.explanation);
        expect(ev.correct, `${q.id} ${p.join(',')}`).toBe(ok);
        if (ok) valid++;
      }
      expect(valid, `${q.id} has at least one valid order`).toBeGreaterThanOrEqual(1);
      // some orders are invalid (otherwise the question tests nothing)
      expect(valid, `${q.id} would accept everything`).toBeLessThan(perms(ids).length);
    }
  });
  it('putting the conclusion first, or repeating a step, is rejected with a specific message', () => {
    for (const q of orders) {
      const ids = q.items.map((i) => i.id);
      const concl = [...ids].sort((a, b) => depth(q, b) - depth(q, a))[0];
      const bad = [concl, ...ids.filter((i) => i !== concl)];
      const ev = evaluateOrder(q.items, bad, q.explanation);
      expect(ev.correct, q.id).toBe(false);
      expect(ev.message).toMatch(/relies on/);
      expect(evaluateOrder(q.items, [ids[0], ids[0], ...ids.slice(2)], '').invalid).toBe(true);
      expect(evaluateOrder(q.items, ids.slice(1), '').invalid).toBe(true);
    }
    function depth(q: OrderQuestion, id: string): number { const it = q.items.find((x) => x.id === id)!; return it.needs.length === 0 ? 0 : 1 + Math.max(...it.needs.map((n) => depth(q, n))); }
  });
  it('every step’s needs form a proper dependency chain: each proof has exactly one final conclusion step', () => {
    for (const q of orders) {
      const needed = new Set(q.items.flatMap((i) => i.needs));
      const terminal = q.items.filter((i) => !needed.has(i.id));
      expect(terminal.length, q.id).toBe(1);
    }
  });
});

describe('Propositions: mastery objectives and variety', () => {
  const lessons = Object.values(CH.lessons);
  it('every lesson declares objectives, and each objective is tested by at least two independent items', () => {
    for (const l of lessons) {
      expect(l.objectives?.length, l.id).toBeGreaterThanOrEqual(2);
      for (const o of l.objectives!) expect(l.independent.filter((i) => i.objective === o.id).length, `${l.id}/${o.id}`).toBeGreaterThanOrEqual(2);
      for (const i of l.independent) expect(l.objectives!.map((o) => o.id), `${l.id}/${i.id}`).toContain(i.objective);
    }
  });
  it('every unit has independent practice, and each lesson mixes more than one question kind in the chapter overall', () => {
    for (const u of CH.units) expect(u.lessonIds.reduce((n, id) => n + CH.lessons[id].independent.length, 0), u.id).toBeGreaterThanOrEqual(4);
    const kinds = new Set(allQuestions(CH).map((x) => x.q.kind));
    for (const k of ['choice', 'numeric', 'judged', 'order']) expect(kinds.has(k as Question['kind']), k).toBe(true);
  });
  it('no two independent items repeat the same prompt text (an immediately repeated question cannot add evidence)', () => {
    const seen = new Map<string, string>();
    for (const l of lessons) for (const i of l.independent) {
      const key = (i.question.prompt + (i.question.kind === 'choice' ? JSON.stringify(i.question.options.map((o) => o.text)) : '')).trim();
      expect(seen.has(key), `${l.id}/${i.id} repeats ${seen.get(key)}`).toBe(false);
      seen.set(key, `${l.id}/${i.id}`);
    }
  });
  it('mastery needs every objective: 70% right but one objective untouched is not mastery', () => {
    const l = CH.lessons['prop-l4'];
    const rec: LessonRecord = { ...emptyLessonRecord(), stepsSeen: l.steps.map((s) => s.id), workedSeen: true, guided: Object.fromEntries(l.guided.steps.map((g) => [g.id, { done: true, hints: 0, wrong: 0 }])) };
    const good = { ...emptyIndependent(), attempts: 1, correct: true, firstAttemptUnassisted: true };
    const missed = { ...emptyIndependent(), attempts: 2, correct: true, firstAttemptUnassisted: false, misconceptions: ['x'] };
    // classify items right first try, both justify items wrong first
    rec.independent = Object.fromEntries(l.independent.map((i) => [i.id, i.objective === 'classify' ? good : missed]));
    expect(objectiveCoverage(l, rec).find((o) => o.id === 'justify')!.covered).toBe(false);
    expect(lessonStatus(l, rec)).not.toBe('mastered');
    // one justify item right first try covers the objective; 4 of 5 independent = 80% -> mastered
    const first = l.independent.find((i) => i.objective === 'justify')!;
    rec.independent[first.id] = good;
    expect(objectiveCoverage(l, rec).every((o) => o.covered)).toBe(true);
    expect(lessonStatus(l, rec)).toBe('mastered');
    // the same evidence with teacher demonstration is never mastery
    expect(lessonStatus(l, { ...rec, teacherDemo: true })).toBe('demonstrated');
  });
});

describe('Propositions: coverage rule binds beyond the 70% share', () => {
  it('L10: 5 of 7 right first try is 71% (enough share) but if the 2 "justify" items are the misses, the lesson is NOT mastered', () => {
    const l = CH.lessons['prop-l10'];
    expect(l.independent.length).toBe(7);
    const rec: LessonRecord = { ...emptyLessonRecord(), stepsSeen: l.steps.map((s) => s.id), workedSeen: true, guided: Object.fromEntries(l.guided.steps.map((g) => [g.id, { done: true, hints: 0, wrong: 0 }])) };
    const good = { ...emptyIndependent(), attempts: 1, correct: true, firstAttemptUnassisted: true };
    const missed = { ...emptyIndependent(), attempts: 2, correct: true, firstAttemptUnassisted: false };
    rec.independent = Object.fromEntries(l.independent.map((i) => [i.id, i.objective === 'justify' ? missed : good]));
    expect(l.independent.filter((i) => rec.independent[i.id].firstAttemptUnassisted).length / 7).toBeGreaterThanOrEqual(0.7);
    expect(objectiveCoverage(l, rec).find((o) => o.id === 'justify')!.covered).toBe(false);
    expect(lessonStatus(l, rec)).not.toBe('mastered');
    rec.independent[l.independent.find((i) => i.objective === 'justify')!.id] = good;
    expect(lessonStatus(l, rec)).toBe('mastered');
  });
});

describe('Propositions: textbook and extension claims are honest', () => {
  const src = JSON.stringify(CH);
  it('does not invent section numbers or theorem names (the chapter has none)', () => {
    expect(src).not.toMatch(/Section \d/);
    expect(src).not.toMatch(/Theorem \d/);
    expect(CH.ncertNote).toMatch(/Chapter 9/);
    expect(CH.ncertNote).toMatch(/no numbered sections/);
  });
  it('lessons that go beyond the chapter say so', () => {
    expect(JSON.stringify(CH.lessons['prop-l1'])).toMatch(/extension/);
    expect(JSON.stringify(CH.lessons['prop-l9'])).toMatch(/extension/);
    expect(JSON.stringify(CH.lessons['prop-l11'])).toMatch(/extension/);
  });
  it('observation steps are labelled and never present measuring as proof', () => {
    for (const l of Object.values(CH.lessons)) for (const st of l.steps) {
      if (st.phase === 'observe') expect(st.visual, `${l.id}/${st.id}`).toBeDefined();
      if (st.phase === 'proof') expect(st.proof?.length, `${l.id}/${st.id}`).toBeGreaterThanOrEqual(3);
    }
    const pyth = CH.lessons['prop-l8'].steps.map((s) => s.phase);
    expect(pyth.slice(0, 2)).toEqual(['observe', 'proof']);
  });
  it('proof highlight ids refer to real parts of the Pythagoras-converse figure', () => {
    const step = CH.lessons['prop-l8'].steps.find((s) => s.id === 'pyth-proof')!;
    const known = new Set(['ABC', 'XYZ', 'XY', 'AB']);
    for (const p of step.proof!) for (const id of p.show ?? []) expect(known.has(id), id).toBe(true);
  });
  it('every visual has a generated text alternative that names the facts it draws', () => {
    for (const { where, v } of allVisuals(CH)) {
      expect(v.alt.length, where).toBeGreaterThan(40);
      if (v.kind === 'numberGrid' && !(v.props as { single?: boolean }).single) expect(v.alt, where).toMatch(/Numbers where the first part is true and the second is false/);
    }
  });
  it('lesson and prerequisite ids cannot collide with the other chapters', async () => {
    const { COORDINATE_GEOMETRY } = await import('../../../coordinateGeometry/content');
    const { CIRCLES_CHAPTER } = await import('../../../circles/learn/content');
    const mine = new Set([...Object.keys(CH.lessons), ...Object.keys(CH.prerequisites)]);
    for (const other of [COORDINATE_GEOMETRY, CIRCLES_CHAPTER]) for (const id of [...Object.keys(other.lessons), ...Object.keys(other.prerequisites)]) {
      // the old guided lesson ids prop-l* are used only by this chapter
      expect(mine.has(id), id).toBe(false);
    }
  });
});
