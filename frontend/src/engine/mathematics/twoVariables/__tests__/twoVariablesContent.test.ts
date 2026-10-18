import { describe, it, expect } from 'vitest';
import {
  TWO_VARIABLES_PRACTICE_BANK as BANK,
  checkPracticeAnswer,
  getPracticeQuestionById,
  PRACTICE_COUNTS,
} from '../practiceBank';
import { TV_GUIDED_LESSONS, TV_GUIDED_UNITS, TV_LESSON_ORDER, TV_LESSON_TARGETS } from '../curriculumPath';
import { TV_EXPERIMENTS, getTVExperiment } from '../experimentRegistry';
import { TV_COVERAGE_MATRIX } from '../curriculumRegistry';
import { analyzeSystem } from '../system';
import { isExactSolution, parseEquation } from '../linearEquation';
import { formatRational, parseRational } from '../rational';

describe('practice bank integrity', () => {
  it('has at least 35 questions across all three tiers with unique ids', () => {
    expect(BANK.length).toBeGreaterThanOrEqual(35);
    expect(new Set(BANK.map((q) => q.id)).size).toBe(BANK.length);
    expect(PRACTICE_COUNTS.basic).toBeGreaterThanOrEqual(10);
    expect(PRACTICE_COUNTS.standard).toBeGreaterThanOrEqual(10);
    expect(PRACTICE_COUNTS.challenge).toBeGreaterThanOrEqual(8);
    expect(PRACTICE_COUNTS.basic + PRACTICE_COUNTS.standard + PRACTICE_COUNTS.challenge).toBe(BANK.length);
  });

  it('covers every required topic and every question type', () => {
    const topics = new Set(BANK.map((q) => q.topicId));
    for (const t of ['identify_linear', 'standard_form', 'check_solution', 'solution_table', 'intercepts', 'slope', 'plot_line', 'graphical_intersection', 'system_classification', 'substitution', 'elimination', 'word_problem']) {
      expect(topics.has(t as never), t).toBe(true);
    }
    const kinds = new Set(BANK.map((q) => q.questionType));
    expect([...kinds].sort()).toEqual(['graph_point', 'multiple_choice', 'numeric', 'ordered_pair']);
  });

  it('every question has hints, a worked solution and an explanation', () => {
    for (const q of BANK) {
      expect(q.hints.length, q.id).toBeGreaterThan(0);
      expect(q.workedSolution.length, q.id).toBeGreaterThan(0);
      expect(q.explanation.length, q.id).toBeGreaterThan(10);
    }
  });

  // Hand-computed oracle, independent of the builders.
  const NUMERIC: Record<string, string> = {
    'q-tv-3': '-5', 'q-tv-4': '-4', 'q-tv-7': '5', 'q-tv-8': '4', 'q-tv-9': '6', 'q-tv-10': '4', 'q-tv-11': '3',
    'q-tv-15': '-2/3', 'q-tv-16': '2', 'q-tv-17': '4', 'q-tv-18': '-7', 'q-tv-26': '6', 'q-tv-27': '6',
    'q-tv-32': '4', 'q-tv-33': '4', 'q-tv-34': '6', 'q-tv-35': '14', 'q-tv-36': '10', 'q-tv-37': '16', 'q-tv-38': '550', 'q-tv-40': '3/4',
  };
  const PAIRS: Record<string, [string, string]> = {
    'q-tv-21': ['3', '2'], 'q-tv-22': ['1', '2'], 'q-tv-28': ['6', '4'], 'q-tv-29': ['2', '3'], 'q-tv-30': ['6', '5'], 'q-tv-39': ['4', '2'],
  };
  const CHOICES: Record<string, string> = {
    'q-tv-1': '3x + 2y = 7', 'q-tv-2': 'x/2 − y = 5', 'q-tv-5': 'Yes, it is a solution', 'q-tv-6': 'No, it is not a solution',
    'q-tv-12': 'y = −2', 'q-tv-13': 'x = 4', 'q-tv-20': '2x + y = 4', 'q-tv-23': 'Exactly one solution', 'q-tv-24': 'No solution', 'q-tv-25': 'Infinitely many solutions',
  };

  it('numeric answers match the independent oracle (exactly, including fractions and decimals)', () => {
    for (const [id, ans] of Object.entries(NUMERIC)) {
      const q = getPracticeQuestionById(id)!;
      expect(q, id).toBeDefined();
      expect(checkPracticeAnswer(q, { kind: 'number', text: ans }).correct, id).toBe(true);
      expect(checkPracticeAnswer(q, { kind: 'number', text: '12345' }).correct, id).toBe(false);
    }
    const frac = getPracticeQuestionById('q-tv-40')!;
    expect(checkPracticeAnswer(frac, { kind: 'number', text: '0.75' }).correct).toBe(true);
    expect(checkPracticeAnswer(frac, { kind: 'number', text: '0.7499' }).correct).toBe(false);
    expect(checkPracticeAnswer(frac, { kind: 'number', text: 'abc' }).invalid).toBe(true);
  });

  it('ordered-pair answers match the oracle and reject swapped coordinates', () => {
    for (const [id, [x, y]] of Object.entries(PAIRS)) {
      const q = getPracticeQuestionById(id)!;
      expect(checkPracticeAnswer(q, { kind: 'pair', xText: x, yText: y }).correct, id).toBe(true);
      if (x !== y) expect(checkPracticeAnswer(q, { kind: 'pair', xText: y, yText: x }).correct, `${id} swapped`).toBe(false);
    }
  });

  it('multiple-choice correct options match the oracle', () => {
    for (const [id, text] of Object.entries(CHOICES)) {
      const q = getPracticeQuestionById(id)!;
      expect(q.options![(q.answer as { index: number }).index], id).toBe(text);
      expect(new Set(q.options).size, id).toBe(q.options!.length);
    }
  });

  it('every numeric/pair worked solution states the expected answer', () => {
    for (const q of BANK) {
      const text = q.workedSolution.join(' ');
      if (q.answer.kind === 'number') expect(text, q.id).toContain(formatRational(q.answer.value));
      if (q.answer.kind === 'pair') {
        expect(text, q.id).toContain(formatRational(q.answer.x));
        expect(text, q.id).toContain(formatRational(q.answer.y));
      }
    }
  });

  it('diagrams agree with answers', () => {
    for (const q of BANK) {
      if (!q.diagram) continue;
      expect(q.diagram.lines.length, q.id).toBeGreaterThan(0);
      if (q.answer.kind === 'pair' && q.diagram.lines.length === 2) {
        const sys = analyzeSystem(q.diagram.lines[0].eq, q.diagram.lines[1].eq);
        expect(sys.type, q.id).toBe('unique');
        expect(sys.solution!.x).toEqual(q.answer.x);
        expect(sys.solution!.y).toEqual(q.answer.y);
      }
      if (q.answer.kind === 'graph_point') {
        // Hidden lines are exactly the equations that define correctness.
        expect(q.answer.equations.length).toBe(q.diagram.lines.length);
        expect(q.diagram.showLines).toBe(false);
        q.answer.equations.forEach((e, i) => expect(e).toEqual(q.diagram!.lines[i].eq));
      }
    }
  });

  it('graph-interaction questions accept true solutions only', () => {
    const one = getPracticeQuestionById('q-tv-14')!; // x + y = 5
    expect(checkPracticeAnswer(one, { kind: 'graph_point', x: 2, y: 3 }).correct).toBe(true);
    expect(checkPracticeAnswer(one, { kind: 'graph_point', x: 5, y: 0 }).correct).toBe(true);
    expect(checkPracticeAnswer(one, { kind: 'graph_point', x: 2, y: 2 }).correct).toBe(false);
    const two = getPracticeQuestionById('q-tv-31')!; // x + y = 4 and x − y = 2
    expect(checkPracticeAnswer(two, { kind: 'graph_point', x: 3, y: 1 }).correct).toBe(true);
    expect(checkPracticeAnswer(two, { kind: 'graph_point', x: 2, y: 2 }).correct).toBe(false);
    const hard = getPracticeQuestionById('q-tv-41')!; // 3x + 2y = 6
    expect(checkPracticeAnswer(hard, { kind: 'graph_point', x: 0, y: 3 }).correct).toBe(true);
    expect(checkPracticeAnswer(hard, { kind: 'graph_point', x: 2, y: 0 }).correct).toBe(true);
  });

  it('word-problem models reproduce the story numbers', () => {
    // Pens/notebooks: x = 6, y = 5 → 2·6+3·5 = 27, 3·6+5 = 23
    const q30 = getPracticeQuestionById('q-tv-30')!;
    expect(q30.statement).toContain('₹ 27');
    expect(q30.statement).toContain('₹ 23');
    const e1 = parseEquation('3x + 2y = 1700').equation!;
    const e2 = parseEquation('2x + 3y = 2050').equation!;
    const px = parseRational('200')!;
    const py = parseRational('550')!;
    expect(isExactSolution(e1, px, py) && isExactSolution(e2, px, py)).toBe(true);
  });
});

describe('guided curriculum', () => {
  it('has the 14 planned lessons in 5 units, in order', () => {
    expect(Object.keys(TV_GUIDED_LESSONS)).toHaveLength(14);
    expect(TV_GUIDED_UNITS).toHaveLength(5);
    expect(TV_LESSON_ORDER).toHaveLength(14);
    TV_LESSON_ORDER.forEach((id, i) => expect(TV_GUIDED_LESSONS[id].lessonNumber).toBe(i + 1));
  });

  it('every lesson references real experiments and real questions', () => {
    for (const l of Object.values(TV_GUIDED_LESSONS)) {
      expect(TV_EXPERIMENTS.some((e) => e.id === l.experimentId), l.id).toBe(true);
      expect(getTVExperiment(l.experimentId).id).toBe(l.experimentId);
      for (const qid of l.practiceQuestionIds) expect(getPracticeQuestionById(qid), `${l.id} → ${qid}`).toBeDefined();
      expect(TV_LESSON_TARGETS[l.id], l.id).toBeDefined();
    }
  });

  it('follows Understand → Predict → Experiment → Observe → Explain → Practise', () => {
    const order = ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'];
    for (const l of Object.values(TV_GUIDED_LESSONS)) {
      const positions = l.stages.map((s) => order.indexOf(s));
      expect(positions, l.id).toEqual([...positions].sort((a, b) => a - b));
      expect(l.stages[0]).toBe('understand');
      expect(l.stages[l.stages.length - 1]).toBe('practice');
      if (l.stages.includes('predict')) expect(l.predictionQuestion, l.id).toBeDefined();
    }
    const full = Object.values(TV_GUIDED_LESSONS).filter((l) => l.stages.length === 6);
    expect(full.length).toBe(13);
  });

  it('never reveals the prediction answer before the Predict stage', () => {
    for (const l of Object.values(TV_GUIDED_LESSONS)) {
      if (!l.predictionQuestion) continue;
      const correct = l.predictionQuestion.options[l.predictionQuestion.correctIndex].toLowerCase();
      // One- or two-letter options (e.g. "y") would match any text; those lessons are checked by review.
      if (correct.length < 4) continue;
      const understandText = [l.concept.summary, ...l.concept.detailedPoints].join(' ').toLowerCase();
      expect(understandText.includes(correct), `${l.id}: understand text contains the prediction answer`).toBe(false);
      expect(l.predictionQuestion.correctIndex).toBeLessThan(l.predictionQuestion.options.length);
    }
  });

  it('experiment gates require real interactions', () => {
    for (const l of Object.values(TV_GUIDED_LESSONS)) {
      if (l.stages.includes('experiment')) expect(l.experimentGuide.minInteractionsNeeded ?? 0, l.id).toBeGreaterThan(0);
    }
  });

  it('coverage matrix points at real lessons and practice topics that exist', () => {
    const topics = new Set(BANK.map((q) => q.topicId));
    for (const row of TV_COVERAGE_MATRIX) {
      for (const id of row.lessonIds) expect(TV_GUIDED_LESSONS[id], `${row.topic} → ${id}`).toBeDefined();
      for (const t of row.practiceTopics) expect(topics.has(t), `${row.topic} → ${t}`).toBe(true);
    }
    // No official exercise numbers are invented anywhere in M5 content.
    const all = JSON.stringify([TV_GUIDED_LESSONS, BANK, TV_COVERAGE_MATRIX]);
    expect(/Exercise\s*(Set\s*)?13\.\d/i.test(all)).toBe(false);
  });
});

describe('module isolation', () => {
  const read = (g: Record<string, string>) => Object.entries(g);
  const engineSrc = read(import.meta.glob('../*.ts', { query: '?raw', import: 'default', eager: true }) as Record<string, string>);
  const featureSrc = read(import.meta.glob('../../../../features/mathematics/twoVariables/*.tsx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>);
  const storeSrc = read(import.meta.glob('../../../../store/useTwoVariablesStore.ts', { query: '?raw', import: 'default', eager: true }) as Record<string, string>);
  const appSrc = Object.values(import.meta.glob('../../../../App.tsx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>)[0];
  const all = [...engineSrc, ...featureSrc, ...storeSrc];

  it('finds the M5 source files it is meant to check', () => {
    expect(engineSrc.length).toBeGreaterThanOrEqual(9);
    expect(featureSrc.length).toBeGreaterThanOrEqual(10);
    expect(storeSrc).toHaveLength(1);
  });

  it('imports no other chapter store or chapter engine', () => {
    const forbidden = /from\s+['"][^'"]*(useCircle|useQuad|usePropositions|useGuidedLearningStore|useMath|useChemistry|useElectric|\/circles\/|\/quadrilaterals\/|\/propositions\/|mathematics\/coordinates|mathematics\/calculations)[^'"]*['"]/;
    for (const [file, src] of all) expect(forbidden.test(src), file).toBe(false);
  });

  it('is loaded only through React.lazy so it stays out of initial bundles', () => {
    const staticImports = appSrc.split(/\r?\n/).filter((l) => /^import\s/.test(l) && /twoVariables/.test(l));
    expect(staticImports).toEqual([]);
    expect(appSrc).toMatch(/import\('\.\/features\/mathematics\/twoVariables\/TwoVariablesLab'\)/);
    expect(appSrc).toMatch(/import\('\.\/features\/mathematics\/twoVariables\/TwoVariablesWorkbenchPage'\)/);
  });

  it('only chapter-neutral guided-learning types are shared', () => {
    const curriculum = engineSrc.find(([f]) => f.endsWith('curriculumPath.ts'))![1];
    expect(curriculum).toMatch(/from '\.\.\/guidedLearning\/types'/);
  });
});
