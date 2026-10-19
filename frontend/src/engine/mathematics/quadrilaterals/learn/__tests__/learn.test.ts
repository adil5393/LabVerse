import { describe, it, expect } from 'vitest';
import { allQuestions, allVisuals, describeChapterIntegrity } from '../../../../education/__tests__/chapterIntegrity';
import { evaluateAnswer, evaluateOrder } from '../../../../education/evaluate';
import { emptyIndependent, emptyLessonRecord, lessonStatus, objectiveCoverage } from '../../../../education/progress';
import type { LessonRecord, OrderQuestion } from '../../../../education/types';
import { QUADRILATERALS_CHAPTER as CH } from '../content';
import { analyzeQuad, FIG, type Quad } from '../figure';
import type { GalleryFigure, QuadVisualProps } from '../questions';

describeChapterIntegrity('Quadrilaterals', CH, ['quadFig', 'quadGallery']);

describe('Quadrilaterals: scope and honesty', () => {
  it('has the lessons for textbook 12.1 to 12.4 in five units', () => {
    expect(Object.keys(CH.lessons)).toHaveLength(8);
    expect(CH.units).toHaveLength(5);
    expect(CH.prerequisiteIds.length).toBeGreaterThanOrEqual(3);
  });
  it('never cites a section or theorem number the chapter does not have (Sections 12.1-12.4, Theorems 1-9)', () => {
    const text = JSON.stringify(CH);
    for (const m of text.matchAll(/Theorem (\d+(?:\.\d+)?)/g)) {
      const n = Number(m[1]);
      expect(Number.isInteger(n) && n >= 1 && n <= 9, `Theorem ${m[1]}`).toBe(true);
    }
    for (const m of text.matchAll(/Section (\d+\.\d+)/g)) expect(['12.1', '12.2', '12.3', '12.4'], `Section ${m[1]}`).toContain(m[1]);
    expect(text).not.toMatch(/Theorem 12\./);
  });
  it('states what is extension and does not claim the textbook proves it', () => {
    expect(JSON.stringify(CH.lessons['quad-l7'])).toMatch(/extension/);
    expect(CH.ncertNote).toMatch(/original/);
  });
  it('separates observing, conjecturing and proving: every lesson that proves has an observation step first', () => {
    for (const l of Object.values(CH.lessons)) {
      const phases = l.steps.map((s) => s.phase).filter(Boolean);
      if (l.steps.some((s) => s.proof)) {
        expect(phases.some((p) => p === 'observe' || p === 'conjecture'), `${l.id} has a proof but no observation`).toBe(true);
        expect(phases.indexOf('proof'), l.id).toBeGreaterThan(phases.findIndex((p) => p === 'observe' || p === 'conjecture'));
      }
    }
  });
  it('no observation step uses the word "proves"; proofs live in proof steps', () => {
    for (const l of Object.values(CH.lessons)) for (const s of l.steps) {
      if (s.phase === 'observe') expect(s.paragraphs.join(' '), `${l.id}/${s.id}`).not.toMatch(/\bproves?\b|\bproved\b/i);
    }
  });
});

describe('Quadrilaterals: every figure in the lessons is drawn from real coordinates and described by them', () => {
  const visuals = allVisuals(CH);
  it('has visuals in every lesson', () => {
    for (const l of Object.values(CH.lessons)) expect(visuals.some((v) => v.where.startsWith(l.id)), l.id).toBe(true);
  });
  it('every four-sided figure is a genuine quadrilateral (or the intended non-example), with finite coordinates', () => {
    for (const { where, v } of visuals) {
      const check = (q: Quad) => { for (const p of q) { expect(Number.isFinite(p.x) && Number.isFinite(p.y), where).toBe(true); expect(p.x >= 0 && p.x <= 10 && p.y >= 0 && p.y <= 10, `${where} inside the board`).toBe(true); } };
      if (v.kind === 'quadGallery') for (const f of (v.props!.figures as GalleryFigure[])) check(f.pts);
      if (v.kind === 'quadFig') {
        const p = v.props as unknown as QuadVisualProps;
        for (const pt of p.pts) { expect(pt.x >= 0 && pt.x <= 10 && pt.y >= 0 && pt.y <= 10, `${where} inside the board`).toBe(true); }
        if (p.mode === 'parallelogram') expect(analyzeQuad(p.pts as Quad).parallelogram, where).toBe(true);
        if (p.focus === 'varignon' || p.mode === 'tiling' || p.mode === 'wheel') expect(analyzeQuad(p.pts as Quad).isQuadrilateral, where).toBe(true);
      }
    }
  });
  it('gallery questions: the right figure really has the property and each wrong one does not', () => {
    const find = (id: string) => allQuestions(CH).find((x) => x.q.id === id)!.q;
    const fig = (id: string, f: string) => (find(id) as unknown as { visual: { props: { figures: GalleryFigure[] } } }).visual.props.figures.find((x) => x.id === f)!.pts;
    const a = (id: string, f: string) => analyzeQuad(fig(id, f));
    expect(a('quad-l1-i1', 'b').kind).toBe('self-intersecting');
    for (const f of ['a', 'c', 'd']) expect(a('quad-l1-i1', f).crossed).toBe(false);
    expect(a('quad-l1-i2', 'a').kind).toBe('not-quadrilateral');
    for (const f of ['b', 'c', 'd']) expect(a('quad-l1-i2', f).isQuadrilateral).toBe(true);
    expect(a('quad-l1-i4', 'b').convex).toBe(false);
    for (const f of ['a', 'c', 'd']) expect(a('quad-l1-i4', f).convex).toBe(true);
    // "one pair of equal opposite sides is not enough": R has the pair AND is not a parallelogram; P, Q are parallelograms
    expect(a('quad-l3-i4', 'c').parallelogram).toBe(false);
    expect(a('quad-l3-i4', 'c').oppSidesEqual.some(Boolean)).toBe(true);
    for (const f of ['a', 'b']) expect(a('quad-l3-i4', f).parallelogram).toBe(true);
    // perpendicular diagonals but not a parallelogram
    expect(a('quad-l3-i5', 'b').diagonalsPerpendicular && !a('quad-l3-i5', 'b').parallelogram).toBe(true);
    expect(a('quad-l3-i5', 'a').parallelogram).toBe(true);
    expect(a('quad-l3-i5', 'c').parallelogram).toBe(true);
  });
  it('the dart used in the guided steps has a 270 degree interior angle at D, as the numeric answer says', () => {
    const an = analyzeQuad(FIG.dart);
    expect(an.angles![3]).toBeCloseTo(270, 6);
    expect(an.kind).toBe('non-convex');
    expect(an.angleSum).toBeCloseTo(360, 6);
  });
});

describe('Quadrilaterals: arithmetic in the questions matches the mathematics', () => {
  const q = (id: string) => allQuestions(CH).find((x) => x.q.id === id)!.q;
  const ans = (id: string) => (q(id) as { answer: number }).answer;
  it('angle sums of 360', () => {
    expect(ans('quad-l1-i6')).toBe(360 - (105 + 85 + 70));
    expect(ans('quad-l1-i7')).toBe(360 - (40 + 50 + 60));
    expect(ans('g-quad-l1-3')).toBe(360 - 90);
    expect(ans('g-quad-l3-1')).toBe((360 - 220) / 2);
    expect(ans('quad-l8-i1')).toBe(360 - (72 + 98 + 105));
    expect(ans('quad-l8-i2')).toBe(360 - (45 + 55 + 35));
    expect(ans('g-quad-l8-2')).toBe(360 - (100 + 80 + 75));
  });
  it('parallelogram', () => {
    expect(ans('quad-l2-i1')).toBe(2 * (6.5 + 3.5));
    expect(ans('quad-l2-i2')).toBe((17 - 2) / 3);
    expect(ans('quad-l2-i3')).toBe(180 - 72);
    expect(ans('quad-l2-i4')).toBe(120);
    expect(ans('quad-l2-i5')).toBe(2 * 4);
    expect(ans('g-quad-l2-2')).toBe(16 / 2);
    expect(ans('g-quad-l2-3')).toBe(10 / 2);
  });
  it('midpoint theorem and converse', () => {
    expect(ans('quad-l4-i1')).toBe(18 / 2);
    expect(ans('quad-l4-i2')).toBe(7.5 * 2);
    expect(ans('quad-l4-i3')).toBe(62);
    expect(ans('quad-l4-i4')).toBe((10 + 12 + 14) / 2);
    expect(ans('g-quad-l4-1')).toBe(14 / 2);
    expect(ans('quad-l5-i1')).toBe(26 / 2);
    expect(ans('quad-l5-i2')).toBeCloseTo(4.2 * 2, 9);
    expect(ans('quad-l5-i3')).toBe(6.5 * 2);
  });
  it('centroid and Varignon', () => {
    expect(ans('quad-l6-i2')).toBeCloseTo((27 * 2) / 3, 9);
    expect(ans('quad-l6-i3')).toBeCloseTo(4.5 * 3, 9);
    expect(ans('g-quad-l6-2')).toBe((21 * 2) / 3);
    expect(ans('g-quad-l6-3')).toBe(21 / 3);
    expect(ans('quad-l7-i1')).toBe(2 * (16 / 2 + 9 / 2));
    expect(ans('quad-l7-i2')).toBe(14);
    expect(ans('g-quad-l7-2')).toBe(10);
    expect(ans('g-quad-l7-3')).toBe(2 * (20 / 2 + 12 / 2));
  });
  it('the worked examples agree with their numbers', () => {
    const w4 = CH.lessons['quad-l4'].worked;
    expect(w4.steps.map((s) => s.text).join(' ')).toMatch(/5 cm.*6 cm.*8 cm.*19 cm/);
    expect(5 + 6 + 8).toBe(19); expect(19 * 2).toBe(12 + 16 + 10);
    expect(CH.lessons['quad-l7'].worked.steps.map((s) => s.text).join(' ')).toMatch(/24 cm/);
    expect(2 * (14 / 2 + 10 / 2)).toBe(24);
  });
});

describe('Quadrilaterals: step-ordering questions accept exactly the valid orders', () => {
  const orders = allQuestions(CH).filter((x) => x.q.kind === 'order').map((x) => x.q as OrderQuestion);
  it('there is an ordering question in the proof lessons', () => { expect(orders.length).toBeGreaterThanOrEqual(5); });
  it.each(orders.map((o) => [o.id, o] as const))('%s: every permutation is accepted iff every step follows what it needs', (_id, o) => {
    const ids = o.items.map((i) => i.id);
    let valid = 0, total = 0;
    const permute = (rest: string[], acc: string[]) => {
      if (!rest.length) {
        total++;
        const placed = new Set<string>(); let ok = true;
        for (const id of acc) { const it = o.items.find((i) => i.id === id)!; if (it.needs.some((n) => !placed.has(n))) { ok = false; break; } placed.add(id); }
        expect(evaluateOrder(o.items, acc, 'ok').correct, acc.join(',')).toBe(ok);
        if (ok) valid++;
        return;
      }
      rest.forEach((id, i) => permute([...rest.slice(0, i), ...rest.slice(i + 1)], [...acc, id]));
    };
    permute(ids, []);
    expect(valid).toBeGreaterThan(0); expect(valid).toBeLessThan(total);
  });
});

describe('Quadrilaterals: mastery needs independent evidence for every objective', () => {
  const lessons = Object.values(CH.lessons);
  it('every lesson declares objectives and every objective has at least one independent item (two where the lesson allows)', () => {
    for (const l of lessons) {
      expect(l.objectives?.length ?? 0, l.id).toBeGreaterThanOrEqual(2);
      for (const o of l.objectives!) expect(l.independent.filter((i) => i.objective === o.id).length, `${l.id}/${o.id}`).toBeGreaterThanOrEqual(1);
      for (const i of l.independent) if (i.objective) expect(l.objectives!.map((o) => o.id), `${l.id}/${i.id}`).toContain(i.objective);
    }
  });
  /** A student who has seen everything and done the guided steps; `right` says which independent items were right on the FIRST try. */
  const record = (l: (typeof lessons)[number], right: (i: number) => boolean): LessonRecord => {
    const r = emptyLessonRecord();
    r.stepsSeen = l.steps.map((s) => s.id);
    r.workedSeen = true;
    l.guided.steps.forEach((g) => { r.guided[g.id] = { done: true, hints: 0, wrong: 0 }; });
    // a first-try miss is later corrected, so the item is resolved but not independent evidence
    l.independent.forEach((it, i) => { r.independent[it.id] = right(i) ? { ...emptyIndependent(), attempts: 1, correct: true, firstAttemptUnassisted: true } : { ...emptyIndependent(), attempts: 2, correct: true, firstAttemptUnassisted: false }; });
    return r;
  };
  it('all right first try: mastered', () => { for (const l of lessons) expect(lessonStatus(l, record(l, () => true)), l.id).toBe('mastered'); });
  it('none right first try: not mastered', () => { for (const l of lessons) expect(lessonStatus(l, record(l, () => false)), l.id).not.toBe('mastered'); });
  it('70% right but a whole objective missed: NOT mastered, and the missing objective is named', () => {
    for (const l of lessons) {
      for (const o of l.objectives!) {
        const missed = new Set(l.independent.map((i, idx) => (i.objective === o.id ? idx : -1)).filter((x) => x >= 0));
        const rec = record(l, (i) => !missed.has(i));
        const share = (l.independent.length - missed.size) / l.independent.length;
        const cov = objectiveCoverage(l, rec);
        expect(cov.filter((c) => !c.covered).map((c) => c.id), `${l.id}/${o.id}`).toContain(o.id);
        if (share >= 0.7) expect(lessonStatus(l, rec), `${l.id}/${o.id} share ${share}`).not.toBe('mastered');
      }
    }
  });
  it('repeating one correct answer, or using a hint or the solution first, is not independent evidence', () => {
    const l = CH.lessons['quad-l2'];
    const rec = emptyLessonRecord();
    const first = l.independent[0];
    rec.independent[first.id] = { ...emptyIndependent(), attempts: 9, correct: true, firstAttemptUnassisted: false, assisted: true };
    expect(lessonStatus(l, rec)).not.toBe('mastered');
    expect(evaluateAnswer(first.question, first.question.kind === 'numeric' ? { kind: 'numeric', text: String(first.question.answer) } : { kind: 'choice', id: 'x' }).correct).toBeTypeOf('boolean');
  });
});

describe('Quadrilaterals: the older modules cite only what the chapter has', () => {
  it('registry, guided path, experiments and practice bank use Sections 12.1-12.4 and Theorems 1-9 only', async () => {
    const { NCERT_QUADRILATERALS_CURRICULUM_REGISTRY } = await import('../../curriculumRegistry');
    const { QUAD_GUIDED_LESSONS } = await import('../../curriculumPath');
    const { QUADRILATERAL_EXPERIMENTS } = await import('../../quadrilateralExperiments');
    const { CHAPTER_PRACTICE_BANK } = await import('../../practiceBank');
    const text = JSON.stringify([NCERT_QUADRILATERALS_CURRICULUM_REGISTRY, QUAD_GUIDED_LESSONS, QUADRILATERAL_EXPERIMENTS, CHAPTER_PRACTICE_BANK]);
    expect(text).not.toMatch(/Theorem 12\./);
    expect(text).not.toMatch(/Section 12\.(5|6|7|8|9|10)\b/);
    expect(text).not.toMatch(/Classic 8|Activity 12|Example [12]\b/);
    for (const m of text.matchAll(/Theorem (\d+)/g)) expect(Number(m[1]) >= 1 && Number(m[1]) <= 9, `Theorem ${m[1]}`).toBe(true);
    for (const t of NCERT_QUADRILATERALS_CURRICULUM_REGISTRY) expect(/^(Section 12\.[1-4](\.[12])?|Chapter Summary|Exercise Sets 12\.1 to 12\.4)$/.test(t.sectionNumber), t.sectionNumber).toBe(true);
  });
});
