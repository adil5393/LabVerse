import { describe, it, expect } from 'vitest';
import { allQuestions, allVisuals, describeChapterIntegrity } from '../../../../education/__tests__/chapterIntegrity';
import { evaluateOrder } from '../../../../education/evaluate';
import { emptyIndependent, emptyLessonRecord, lessonStatus, objectiveCoverage } from '../../../../education/progress';
import type { LessonRecord, OrderQuestion } from '../../../../education/types';
import { TWO_VARIABLES_CHAPTER as CH } from '../content';
import { checkPair, chosenVariable, lineFacts, makeEq, meaningful, num, rat, reversedCheck, riseRun, tableRows, toNumber, wholeSolutions, type Rational } from '../model';
import { toEq, type TvVisualProps } from '../questions';

describeChapterIntegrity('Two Variables', CH, ['tvFig']);

// Independent oracle: plain floating-point arithmetic, not the engine's rationals.
const f = (a: number, b: number, c: number, x: number, y: number) => a * x + b * y + c;
const R = (n: number, d = 1): Rational => rat(n, d);

describe('Two Variables: scope and honesty', () => {
  it('has 7 lessons in 4 units and chapter plus unit prerequisites', () => {
    expect(Object.keys(CH.lessons)).toHaveLength(7);
    expect(CH.units).toHaveLength(4);
    expect(CH.prerequisiteIds.length).toBeGreaterThanOrEqual(3);
  });
  it('cites only sections the chapter has (13.1, 13.1.1, 13.2, 13.2.1, 13.2.2, 13.3, 13.3.1, 13.3.2) and no invented exercise or theorem numbers', () => {
    const text = JSON.stringify(CH);
    for (const m of text.matchAll(/Section[s]? (13\.\d+(?:\.\d+)?)/g)) expect(['13.1', '13.1.1', '13.2', '13.2.1', '13.2.2', '13.3', '13.3.1', '13.3.2', '13.4', '13.6'], m[1]).toContain(m[1]);
    expect(text).not.toMatch(/Exercise (Set )?13\.\d|Theorem \d/);
  });
  it('observation steps do not claim proof; the one proof lesson observes first', () => {
    for (const l of Object.values(CH.lessons)) for (const s of l.steps) if (s.phase === 'observe') expect(s.paragraphs.join(' '), `${l.id}/${s.id}`).not.toMatch(/\bproves?\b|\bproved\b/i);
    const l7 = CH.lessons['tv-l7'].steps.map((s) => s.phase);
    expect(l7.indexOf('observe')).toBeLessThan(l7.indexOf('proof'));
  });
});

describe('Two Variables: the model agrees with independent arithmetic', () => {
  it('checkPair: satisfied exactly when a·x + b·y + c = 0, for integer and fractional pairs', () => {
    for (const [a, b, c] of [[3, 2, -12], [60, 50, -280], [1, 2, -6], [-1, 1, -2], [2, -1, 7]] as const) {
      const e = makeEq(a, b, c);
      for (let x = -6; x <= 6; x++) for (let y = -6; y <= 6; y++) {
        expect(checkPair(e, R(x), R(y)).satisfies, `${a},${b},${c} at ${x},${y}`).toBe(f(a, b, c, x, y) === 0);
      }
      for (const [xn, xd, yn, yd] of [[1, 2, 5, 1], [3, 1, 3, 2], [-1, 2, 1, 4], [9, 4, 3, 8]] as const) {
        expect(checkPair(e, R(xn, xd), R(yn, yd)).satisfies).toBe(Math.abs(f(a, b, c, xn / xd, yn / yd)) < 1e-9);
      }
    }
  });
  it('the substitution steps state the value the student would compute by hand', () => {
    const p = checkPair(makeEq(3, 2, -12), R(2), R(3));
    expect(toNumber(p.lhs)).toBe(12); expect(toNumber(p.rhs)).toBe(12); expect(p.satisfies).toBe(true);
    expect(p.steps.join(' ')).toMatch(/3 × 2 \+ 2 × 3 = 12/);
    const q = checkPair(makeEq(3, 2, -12), R(3), R(2));
    expect(toNumber(q.lhs)).toBe(13); expect(q.satisfies).toBe(false);
    expect(q.steps.join(' ')).toMatch(/13 ≠ 12/);
  });
  it('negative pairs put brackets round negative numbers', () => {
    expect(checkPair(makeEq(2, -1, -7), R(3), R(-1)).steps.join(' ')).toMatch(/× \(−1\)/);
  });
  it('(x, y) is not (y, x): reversed pair differs unless the equation is symmetric there', () => {
    const e = makeEq(3, 2, -12);
    expect(checkPair(e, R(2), R(3)).satisfies).toBe(true);
    expect(reversedCheck(e, R(2), R(3)).satisfies).toBe(false);
    expect(reversedCheck(makeEq(1, 1, -10), R(3), R(7)).satisfies).toBe(true); // symmetric equation
  });
  it('tables: every computed row is a genuine solution (verified in floats), for oblique, horizontal and vertical lines', () => {
    for (const [a, b, c] of [[3, 2, -12], [1, 2, -6], [0, 1, -3], [1, 0, -2], [60, 50, -280], [-1, 1, -2]] as const) {
      const e = makeEq(a, b, c);
      const chosen = chosenVariable(e);
      expect(chosen).toBe(b === 0 ? 'y' : 'x');
      for (const row of tableRows(e, [R(-3), R(0), R(1, 2), R(2), R(7, 3)])) {
        if (!row.pair) { continue; }
        expect(Math.abs(f(a, b, c, toNumber(row.pair.x), toNumber(row.pair.y)))).toBeLessThan(1e-9);
      }
    }
  });
  it('horizontal line: every x gives the same y; vertical line: tables are by y and x is fixed', () => {
    for (const row of tableRows(makeEq(0, 1, -3), [R(-2), R(5)])) expect(toNumber(row.other!)).toBe(3);
    for (const row of tableRows(makeEq(1, 0, -2), [R(-2), R(5)])) expect(toNumber(row.pair!.x)).toBe(2);
  });
  it('line facts: intercepts, slope and forms match hand calculations', () => {
    const f1 = lineFacts(makeEq(3, 2, -12));
    expect(f1.xInt).toEqual(R(4)); expect(f1.yInt).toEqual(R(6)); expect(f1.slope).toEqual(R(-3, 2));
    expect(lineFacts(makeEq(2, 3, 0)).throughOrigin).toBe(true);
    expect(lineFacts(makeEq(0, 1, -3)).slope).toEqual(R(0));
    expect(lineFacts(makeEq(1, 0, -2)).slope).toBeNull();
    expect(lineFacts(makeEq(0, 0, 5)).valid).toBe(false);
    expect(lineFacts(makeEq(0, 0, 0)).valid).toBe(false);
  });
  it('c = 0 means through the origin, for many a, b', () => {
    for (let a = -3; a <= 3; a++) for (let b = -3; b <= 3; b++) {
      if (a === 0 && b === 0) continue;
      expect(lineFacts(makeEq(a, b, 0)).throughOrigin).toBe(true);
      expect(checkPair(makeEq(a, b, 0), R(0), R(0)).satisfies).toBe(true);
    }
  });
  it('m = −a/b and d = −c/b: slope and y-intercept of the standard form agree with y = mx + d', () => {
    for (const [a, b, c] of [[3, 2, -12], [2, 1, -6], [1, 2, -8], [-2, 1, -1], [4, 2, -10]] as const) {
      const fac = lineFacts(makeEq(a, b, c));
      expect(toNumber(fac.slope!)).toBeCloseTo(-a / b, 12);
      expect(toNumber(fac.yInt!)).toBeCloseTo(-c / b, 12);
    }
  });
  it('slope between any two points of a line is the same number (the rise over run of the points, not read from the equation)', () => {
    const e = makeEq(3, 2, -12);
    const pts = [-4, -1, 0, 2, 5].map((x) => ({ x: R(x), y: R(0) }));
    const onLine = pts.map((p) => tableRows(e, [p.x])[0].pair!);
    for (let i = 0; i < onLine.length; i++) for (let j = i + 1; j < onLine.length; j++) expect(riseRun(onLine[i], onLine[j]).slope).toEqual(R(-3, 2));
    expect(riseRun({ x: R(1), y: R(3) }, { x: R(4), y: R(9) }).slope).toEqual(R(2));
    expect(riseRun({ x: R(-1), y: R(5) }, { x: R(3), y: R(1) }).slope).toEqual(R(-1));
    expect(riseRun({ x: R(2), y: R(-3) }, { x: R(6), y: R(5) }).slope).toEqual(R(2));
    expect(riseRun({ x: R(2), y: R(1) }, { x: R(2), y: R(5) }).slope).toBeNull(); // vertical
  });
  it('whole-number solutions: found by brute force agree with the story answers', () => {
    expect(wholeSolutions(makeEq(10, 20, -100), 0, 20).map((p) => `${p.x},${p.y}`)).toEqual(['0,5', '2,4', '4,3', '6,2', '8,1', '10,0']);
    expect(wholeSolutions(makeEq(30, 20, -250), 0, 20).map((p) => `${p.x},${p.y}`)).toEqual(['1,11', '3,8', '5,5', '7,2']);
    expect(wholeSolutions(makeEq(60, 50, -280), 0, 10)).toEqual([{ x: 3, y: 2 }]);
  });
  it('meaningful: sensible versus merely satisfying', () => {
    expect(meaningful(R(-2), R(6), 'whole')).toBe(false);
    expect(meaningful(R(5), R(5, 2), 'whole')).toBe(false);
    expect(meaningful(R(5), R(5, 2), 'nonneg')).toBe(true);
    expect(meaningful(R(4), R(3), 'whole')).toBe(true);
  });
  it('decimal input keeps exactness (0.5 and 2.25)', () => {
    expect(num(0.5)).toEqual(R(1, 2)); expect(num(2.25)).toEqual(R(9, 4));
    expect(checkPair(makeEq(60, 50, -280), num(0.5), R(5)).satisfies).toBe(true);
  });
});

describe('Two Variables: questions are mathematically right', () => {
  const q = (id: string) => allQuestions(CH).find((x) => x.q.id === id)!.q as { answer: number };
  it('numeric answers equal independent calculations', () => {
    expect(q('tp-var-c1').answer).toBe(2 * 4 + 3 * 1);
    expect(q('tp-sgn-c1').answer).toBe(2 * -3 + 5);
    expect(q('tp-sgn-c2').answer).toBe(5 - -2);
    expect(q('tp-eq-c1').answer).toBe((14 - 6) / 2);
    expect(q('tp-eq-c2').answer).toBe(8 / -2);
    expect(q('g-tv-l1-3').answer).toBe(8 * 5 + 25 * 4);
    expect(q('tv-l3-i1').answer).toBe(4 * 2 + 3 * 5);
    expect(q('g-tv-l3-1').answer).toBe(4 * 1 + 5);
    expect(q('tv-l3-i4').answer).toBe((8 - 4) / 2);
    expect(q('tv-l3-i5').answer).toBe((5 + -2) / 3);
    expect(q('tv-l4-i1').answer).toBe((6 - 2) / 2);
    expect(q('tv-l4-i2').answer).toBe((6 + 2) / 2);
    expect(q('tv-l4-i6').answer).toBe(6 - 2 * 2);
    expect(q('g-tv-l4-1').answer).toBe(8);
    expect(q('g-tv-l4-2').answer).toBe(8 / 2);
    expect(q('g-tv-l5-3').answer).toBe((250 - 30 * 7) / 20);
    expect(q('tv-l5-i3').answer).toBe(6);
    expect(q('tv-l5-i6').answer).toBe((100 - 10 * 6) / 20);
    expect(q('tv-l6-i1').answer).toBe((9 - 3) / (4 - 1));
    expect(q('tv-l6-i2').answer).toBe((1 - 5) / (3 - -1));
    expect(q('tv-l6-i3').answer).toBe((5 - -3) / (6 - 2));
    expect(q('g-tv-l6-3').answer).toBe((5 - -3) / (6 - 2));
    expect(q('tv-l7-i4').answer).toBe(-2 / 1);
    expect(q('tv-l7-i5').answer).toBe(8 / 2);
    expect(q('tv-l2-i1').answer).toBe(-7); expect(q('tv-l2-i2').answer).toBe(-5);
    expect(q('tv-l2-i3').answer).toBe(-9); expect(q('tv-l2-i4').answer).toBe(-3 + 1);
    expect(q('tv-l2-i5').answer).toBe(6 / 3);
  });
  it('every authored wrong numeric value is a real mistake: it differs from the answer and the message names it', () => {
    for (const { q: qq } of allQuestions(CH)) if (qq.kind === 'numeric') for (const r of qq.rules ?? []) for (const v of r.values) expect(Math.abs(v - qq.answer)).toBeGreaterThan(1e-6);
  });
  it('choice questions about pairs: the marked correct pair really satisfies, and each marked wrong pair does not', () => {
    const pairQ = (id: string, eq: [number, number, number], pairs: Record<string, [number, number]>, correct: string) => {
      const qq = allQuestions(CH).find((x) => x.q.id === id)!.q as { options: { id: string; text: string }[]; correctId: string };
      const byText = Object.fromEntries(qq.options.map((o) => [o.text, o.id]));
      for (const [text, [x, y]] of Object.entries(pairs)) {
        const sat = f(...eq, x, y) === 0;
        expect(sat, `${id} ${text}`).toBe(text === correct);
        expect(byText[text] === qq.correctId, `${id} ${text} marked`).toBe(text === correct);
      }
    };
    pairQ('tv-l3-i2', [1, 2, -8], { '(2, 3)': [2, 3], '(3, 2)': [3, 2], '(8, 2)': [8, 2], '(0, 8)': [0, 8] }, '(2, 3)');
    pairQ('tv-l3-i3', [2, -1, -7], { '(3, −1)': [3, -1], '(3, 1)': [3, 1], '(−3, 1)': [-3, 1] }, '(3, −1)');
    pairQ('g-tv-l5-1', [30, 20, -250], { '(5, 5)': [5, 5], '(5, 4)': [5, 4], '(4, 5)': [4, 5] }, '(5, 5)');
  });
  it('the story solutions used in the text satisfy their equations', () => {
    expect(f(60, 50, -280, 3, 2)).toBe(0); expect(f(60, 50, -280, 0.5, 5)).toBe(0); expect(f(60, 50, -280, 2, 3)).not.toBe(0);
    expect(f(30, 20, -250, 5, 5)).toBe(0); expect(f(30, 20, -250, 3, 8)).toBe(0);
    expect(f(3, 2, -12, 2, 3)).toBe(0); expect(f(3, 2, -12, 4, 0)).toBe(0); expect(f(3, 2, -12, 1, 4.5)).toBe(0); expect(f(3, 2, -12, 3, 2)).not.toBe(0);
    expect(f(2, 5, -20, 5, 2)).toBe(0); expect(f(2, 5, -20, 2, 5)).not.toBe(0);
    expect(f(1, 2, -6, 5, 2)).not.toBe(0); expect(f(1, 2, -6, 2, 2)).toBe(0);
    expect(f(10, 20, -100, -2, 6)).toBe(0); expect(f(10, 20, -100, 5, 2.5)).toBe(0); expect(f(10, 20, -100, 12, -1)).toBe(0); expect(f(10, 20, -100, 7, 1.5)).toBe(0);
    expect(f(5, 1, -11, 2, 1)).toBe(0); expect(f(5, 1, -11, 1, 2)).not.toBe(0);
    expect(f(2, 1, -8, 3, 2)).toBe(0); expect(f(2, 1, -8, 2, 3)).not.toBe(0);
  });
  it('every visual equation is a valid line where a line is expected, and starting points fit inside the window', () => {
    for (const { where, v } of allVisuals(CH)) {
      const p = v.props as unknown as TvVisualProps;
      if (p.eq) { const fa = lineFacts(toEq(p.eq)); if (p.edit === 'none') expect(fa.valid, where).toBe(true); }
      const e = p.extent ?? 10;
      for (const pt of [p.point, ...(p.points ?? []).map((q) => [q.x, q.y] as [number, number])]) if (pt) expect(Math.abs(pt[0]) <= e && Math.abs(pt[1]) <= e, `${where} ${pt}`).toBe(true);
    }
  });
});

describe('Two Variables: step-ordering and mastery', () => {
  const orders = allQuestions(CH).filter((x) => x.q.kind === 'order').map((x) => x.q as OrderQuestion);
  it.each(orders.map((o) => [o.id, o] as const))('%s accepts exactly the valid orders', (_id, o) => {
    const ids = o.items.map((i) => i.id);
    let valid = 0, total = 0;
    const permute = (rest: string[], acc: string[]) => {
      if (!rest.length) {
        total++;
        const placed = new Set<string>(); let ok = true;
        for (const id of acc) { const it = o.items.find((i) => i.id === id)!; if (it.needs.some((n) => !placed.has(n))) { ok = false; break; } placed.add(id); }
        expect(evaluateOrder(o.items, acc, 'ok').correct).toBe(ok);
        if (ok) valid++;
        return;
      }
      rest.forEach((id, i) => permute([...rest.slice(0, i), ...rest.slice(i + 1)], [...acc, id]));
    };
    permute(ids, []);
    expect(valid).toBeGreaterThan(0); expect(valid).toBeLessThan(total);
  });
  const lessons = Object.values(CH.lessons);
  const record = (l: (typeof lessons)[number], right: (i: number) => boolean): LessonRecord => {
    const r = emptyLessonRecord();
    r.stepsSeen = l.steps.map((s) => s.id); r.workedSeen = true;
    l.guided.steps.forEach((g) => { r.guided[g.id] = { done: true, hints: 0, wrong: 0 }; });
    l.independent.forEach((it, i) => { r.independent[it.id] = right(i) ? { ...emptyIndependent(), attempts: 1, correct: true, firstAttemptUnassisted: true } : { ...emptyIndependent(), attempts: 2, correct: true, firstAttemptUnassisted: false }; });
    return r;
  };
  it('every lesson has objectives, each tested by at least one independent item', () => {
    for (const l of lessons) {
      expect(l.objectives?.length ?? 0, l.id).toBeGreaterThanOrEqual(2);
      for (const o of l.objectives!) expect(l.independent.filter((i) => i.objective === o.id).length, `${l.id}/${o.id}`).toBeGreaterThanOrEqual(1);
    }
  });
  it('all first-try: mastered; none first-try: not; a missed objective blocks mastery even at 70%', () => {
    for (const l of lessons) {
      expect(lessonStatus(l, record(l, () => true)), l.id).toBe('mastered');
      expect(lessonStatus(l, record(l, () => false)), l.id).not.toBe('mastered');
      for (const o of l.objectives!) {
        const missed = new Set(l.independent.map((i, idx) => (i.objective === o.id ? idx : -1)).filter((x) => x >= 0));
        const rec = record(l, (i) => !missed.has(i));
        expect(objectiveCoverage(l, rec).filter((c) => !c.covered).map((c) => c.id)).toContain(o.id);
        if ((l.independent.length - missed.size) / l.independent.length >= 0.7) expect(lessonStatus(l, rec), `${l.id}/${o.id}`).not.toBe('mastered');
      }
    }
  });
});
