/**
 * Chapter 7 completeness audit and scientific regression (PHY-3E).
 * The textbook inventory below was read from the official PDF (iesc107.pdf): every equation, example, activity and Pause and Ponder
 * item is mapped to the lesson, derivation, laboratory or exercise that covers it, and the mapping is verified against the content.
 * The cross-model checks make sure the laboratories agree with each other (they are independent models of the same physics).
 */

import { describe, expect, it } from 'vitest';
import appSource from '../../../../App.tsx?raw';
import hubSource from '../../../../features/physics/motion/MotionHub.tsx?raw';
import { WORK_CHAPTER as CH } from '../learn/content';
import { DERIVATIONS } from '../derivations';
import { WORK_EXPERIMENTS } from '../experiments';
import { KINETIC_EXPERIMENTS } from '../kineticExperiments';
import { ENERGY_EXPERIMENTS } from '../energyExperiments';
import { LEVER_EXPERIMENTS, PULLEY_EXPERIMENTS, RAMP_EXPERIMENTS } from '../machineExperiments';
import { POWER_EXPERIMENTS } from '../powerExperiments';
import { WORK_EXERCISES, exerciseSolved } from '../exercises';
import { WORK_MAP, WORK_TEXTBOOK_INVENTORY } from '../curriculum';
import { computeWork } from '../workModel';
import { computeKinetic } from '../kineticModel';
import { computeEnergy, energyAtDistance } from '../energyLab';
import { computeLever, computePulley, computeRamp } from '../machines';
import { computePower } from '../power';
import { potentialEnergy } from '../energyBasics';
import { allQuestions } from '../../../education/__tests__/chapterIntegrity';
import { MOTION_CHAPTER } from '../../motion/learn/content';
import { FORCES_CHAPTER } from '../../forces/learn/content';
import type { EduLesson } from '../../../education/types';

const lessons = Object.values(CH.lessons);
const lessonText = (l: EduLesson): string => [
  l.title, l.objective, ...l.steps.flatMap((s) => [s.title, ...s.paragraphs, ...(s.vocabulary ?? []).map((v) => `${v.term} ${v.meaning}`), s.misconception?.right ?? '']),
  l.worked.title, ...l.worked.given, l.worked.ask, ...l.worked.steps.flatMap((s) => [s.text, s.why]), l.worked.verify,
  l.guided.prompt, ...l.guided.steps.map((g) => g.prompt), l.reflection.discover, ...l.independent.map((i) => i.question.prompt),
].join('\n');
const CORPUS = [
  ...lessons.map(lessonText),
  ...DERIVATIONS.flatMap((d) => [d.title, d.source, ...d.assumptions, ...d.steps.flatMap((s) => [s.title, ...s.math, s.why]), ...d.summary]),
].join('\n');
const ONE_LESSON = (id: string) => lessonText(CH.lessons[id]);

describe('textbook coverage: every equation of Chapter 7 is taught', () => {
  const EQ: [string, RegExp][] = [
    ['7.1 and 7.2: work = force x displacement', /W = F × s/],
    ['7.3: the work-energy theorem', /work done on an object equals the change in its energy|work done = change in energy/i],
    ['7.4: v^2 = u^2 + 2as', /v² = u² \+ 2as/],
    ['7.5: W = 1/2 m v^2 - 1/2 m u^2', /½ ?m ?v² − ½ ?m ?u²/],
    ['7.6: K = 1/2 m v^2', /K = ½ ?m ?v²/],
    ['7.7: work in lifting = mgh', /m ?g ?× ?h|m g Δh/],
    ['7.8: U = mgh', /U = m ?g ?h/],
    ['7.9 and 7.10: the free fall energies', /m g h − ½ m g² t²/],
    ['7.11: P = W / t', /P = W ÷ t/],
    ['7.12: mechanical advantage = load / effort', /load ÷ effort/],
    ['7.13: F\' L = m g h, MA = L / h', /F′ × L = m ?g ?h|F′ L = m g h/],
    ['7.13: MA = L / h', /L ÷ h/],
    ['7.14: F1 d1 = F2 d2', /F₁ ?(×)? ?d₁ = F₂ ?(×)? ?d₂/],
    ['7.15: effort x effort arm = load x load arm', /effort × effort arm = load × load arm|F₁ × L₁ = F₂ × L₂/],
    ['7.16: MA = effort arm / load arm', /L₁ ÷ L₂|effort arm ÷ load arm/],
  ];
  it('each of Eqs. 7.1 to 7.16 appears in a lesson or a derivation', () => { for (const [name, re] of EQ) expect(re.test(CORPUS), name).toBe(true); expect(WORK_TEXTBOOK_INVENTORY.equations).toBe('7.1 to 7.16'); });
  it('the joule, the watt and the horsepower are defined', () => { expect(CORPUS).toMatch(/1 J = 1 N × 1 m/); expect(CORPUS).toMatch(/1 W = 1 J/); expect(CORPUS).toMatch(/746 W/); expect(CORPUS).toMatch(/James Prescott Joule/); expect(CORPUS).toMatch(/James Watt/); });
});

describe('textbook coverage: examples, activities and Pause and Ponder items map to real content', () => {
  type Where = { lesson: string; token: RegExp; also?: string };
  const EXAMPLES: Record<string, Where> = {
    '7.1': { lesson: 'pw-l3', token: /dumbbell/i }, '7.2': { lesson: 'pw-l3', token: /25 cm/ }, '7.3': { lesson: 'pw-l4', token: /carrom/i },
    '7.4': { lesson: 'pw-l5', token: /doubles its speed|Doubling the speed/i }, '7.5': { lesson: 'pw-l5', token: /108 km\/h/ }, '7.6': { lesson: 'pw-l5', token: /stopping distance|stopped by/i },
    '7.7': { lesson: 'pw-l6', token: /300 g/ }, '7.8': { lesson: 'pw-l7', token: /slide/i }, '7.9': { lesson: 'pw-l7', token: /escape ramp/i },
    '7.10': { lesson: 'pw-l8', token: /climbs stairs|climbing/i }, '7.11': { lesson: 'pw-l8', token: /1200 kg car/ }, '7.12': { lesson: 'pw-l9', token: /right-angled triangle/ }, '7.13': { lesson: 'pw-l10', token: /seesaw/i },
  };
  const ACTIVITIES: Record<string, Where> = {
    '7.1': { lesson: 'pw-l6', token: /dropped onto loose sand|ball is dropped|deeper dent|deepest dent|dent/i }, '7.2': { lesson: 'pw-l7', token: /pendulum/i },
    '7.3': { lesson: 'pw-l9', token: /ramp/ }, '7.4': { lesson: 'pw-l10', token: /pencil/i }, '7.5': { lesson: 'pw-l10', token: /beam|coin/i },
  };
  const PAUSE: Record<number, Where> = {
    1: { lesson: 'pw-l2', token: /weightlifter/i }, 2: { lesson: 'pw-l3', token: /friction/ }, 3: { lesson: 'pw-l4', token: /pedal a bicycle/i }, 4: { lesson: 'pw-l5', token: /masses m and 4m|m and 4m/ },
    5: { lesson: 'pw-l5', token: /constant velocity keeps the same kinetic energy/ }, 6: { lesson: 'pw-l6', token: /moving horizontally/ }, 7: { lesson: 'pw-l7', token: /m g h/ }, 8: { lesson: 'pw-l7', token: /roller coaster/i },
    9: { lesson: 'pw-l9', token: /Roads on hills/ }, 10: { lesson: 'pw-l9', token: /inclined ladder/ }, 11: { lesson: 'pw-l10', token: /spoon/i }, 12: { lesson: 'pw-l10', token: /closer to the fulcrum/ }, 13: { lesson: 'pw-l9', token: /perpetual/i },
  };
  it('all 13 examples, 5 activities and 13 Pause and Ponder items are taught in the named lesson', () => {
    expect(Object.keys(EXAMPLES)).toHaveLength(13); expect(WORK_TEXTBOOK_INVENTORY.examples.map((e) => e.replace('7.', ''))).toEqual(Object.keys(EXAMPLES).map((e) => e.replace('7.', '')));
    expect(Object.keys(ACTIVITIES)).toHaveLength(5); expect(Object.keys(PAUSE)).toHaveLength(WORK_TEXTBOOK_INVENTORY.pausePonder);
    for (const [k, w] of Object.entries(EXAMPLES)) { expect(CH.lessons[w.lesson], `Example ${k}`).toBeDefined(); expect(w.token.test(ONE_LESSON(w.lesson)), `Example ${k} in ${w.lesson}`).toBe(true); }
    for (const [k, w] of Object.entries(ACTIVITIES)) { expect(w.token.test(ONE_LESSON(w.lesson)), `Activity ${k} in ${w.lesson}`).toBe(true); }
    for (const [k, w] of Object.entries(PAUSE)) { expect(w.token.test(ONE_LESSON(w.lesson)), `Pause and Ponder ${k} in ${w.lesson}`).toBe(true); }
  });
  it('the sections 7.1 to 7.6.3 are covered by the lesson map and nothing in the textbook is silently omitted', () => {
    const sections = new Set(WORK_MAP.map((r) => r.section));
    for (const s of ['7.1', '7.1.1', '7.1.2', '7.2', '7.3', '7.4.1', '7.4.2', '7.4.3', '7.5', '7.6']) expect(sections.has(s), s).toBe(true);
    const textbook = WORK_MAP.filter((r) => r.kind === 'textbook');
    // The only textbook items without an interactive lesson are the closing activities, which are suggested home or external activities
    const notLearn = textbook.filter((r) => r.status !== 'learn').map((r) => r.id);
    expect(notLearn.sort()).toEqual(['w-bridge', 'w-quest'].sort());
    for (const id of notLearn) expect(WORK_MAP.find((r) => r.id === id)!.status).toBe('planned');
    for (const r of WORK_MAP.filter((x) => x.kind === 'enrichment')) expect(r.section, r.id).toBe('enrichment');
    // all lessons are claimed by the map
    const claimed = new Set(WORK_MAP.flatMap((r) => r.lessonIds)); for (const id of Object.keys(CH.lessons)) expect(claimed.has(id), id).toBe(true);
  });
  it('the Learn lessons list covers the six textbook areas: work, energy, kinetic, potential, power, simple machines', () => {
    expect(Object.keys(CH.lessons)).toEqual(['pw-l1', 'pw-l2', 'pw-l3', 'pw-l4', 'pw-l5', 'pw-l6', 'pw-l7', 'pw-l8', 'pw-l9', 'pw-l10']);
    expect(CH.units.map((u) => u.title)).toEqual(['Understanding work', 'Energy and the work-energy theorem', 'Potential energy and conservation of energy', 'Power', 'Simple machines']);
  });
});

describe('every learning objective has an explanation, a visualization, a worked example, guided practice and independent evidence', () => {
  it('per lesson: explanation steps, a worked example with reasons, guided steps, at least two independent items per objective, a visual', () => {
    for (const l of lessons) {
      expect(l.steps.length, l.id).toBeGreaterThanOrEqual(3); expect(l.worked.steps.length, l.id).toBeGreaterThanOrEqual(3); expect(l.guided.steps.length, l.id).toBeGreaterThanOrEqual(3);
      expect(l.steps.some((s) => s.visual) || Boolean(l.worked.visual), `${l.id} has a visualization`).toBe(true);
      expect(l.investigation?.href, `${l.id} links to a laboratory`).toMatch(/^\/physics\/work\//);
      const route = l.investigation!.href.split('?')[0]; expect(appSource, l.id).toContain(`path="${route}"`);
      for (const o of l.objectives!) { expect(l.independent.filter((i) => i.objective === o.id).length, `${l.id}/${o.id}`).toBeGreaterThanOrEqual(2); expect(o.label.length).toBeGreaterThan(10); }
      for (const i of l.independent) expect(l.objectives!.map((o) => o.id), `${l.id}/${i.id}`).toContain(i.objective);
    }
  });
  it('every lesson that teaches a derivation embeds the interactive derivation, and every derivation is reachable', () => {
    const embedded = new Set<string>(); for (const l of lessons) for (const s of l.steps) if (s.visual?.kind === 'workDerivation') embedded.add((s.visual.props as { id: string }).id);
    expect([...embedded].sort()).toEqual(['C', 'K', 'L', 'P', 'R', 'U']); expect(DERIVATIONS.map((d) => d.id).sort()).toEqual(['C', 'K', 'L', 'P', 'R', 'U']);
    for (const d of DERIVATIONS) { expect(d.steps.some((s) => s.check)).toBe(true); expect(d.assumptions.length).toBeGreaterThanOrEqual(2); expect(d.summary.length).toBeGreaterThanOrEqual(3); }
  });
  it('every laboratory has investigations that follow predict, experiment, observe, explain', () => {
    for (const exps of [WORK_EXPERIMENTS, KINETIC_EXPERIMENTS, ENERGY_EXPERIMENTS, RAMP_EXPERIMENTS, PULLEY_EXPERIMENTS, LEVER_EXPERIMENTS, POWER_EXPERIMENTS] as { id: string; routes: { options: unknown[] }[]; lesson: string }[][]) {
      expect(exps.length).toBeGreaterThanOrEqual(3);
      for (const e of exps) { expect(e.lesson.length).toBeGreaterThan(30); for (const r of e.routes) expect(r.options.length).toBeGreaterThanOrEqual(2); }
    }
    expect(WORK_EXPERIMENTS).toHaveLength(5); expect(KINETIC_EXPERIMENTS).toHaveLength(6); expect(ENERGY_EXPERIMENTS).toHaveLength(6); expect(LEVER_EXPERIMENTS).toHaveLength(4);
  });
});

describe('NCERT exercises: every question and subpart is solved and verified', () => {
  it('15 questions, 43 subparts in textbook order, every part solved with a verification statement', () => {
    expect(WORK_EXERCISES.map((e) => e.number)).toEqual(Array.from({ length: 15 }, (_, i) => i + 1));
    expect(WORK_EXERCISES.map((e) => e.parts.length)).toEqual([5, 5, 4, 9, 3, 1, 1, 1, 1, 2, 3, 1, 4, 1, 2]);
    for (const e of WORK_EXERCISES) { expect(exerciseSolved(e), `Q${e.number}`).toBe(true); expect(e.lessonIds.length, `Q${e.number} lessons`).toBeGreaterThan(0); for (const p of e.parts) { expect(p.status).toBe('solved'); expect(p.solution!.verification.length).toBeGreaterThan(20); expect(p.solution!.given.length).toBeGreaterThan(0); } }
  });
  it('figure-based questions state the precision of the values read from the textbook figure', () => {
    for (const key of ['11-ii', '13-i', '14-all']) { const [n, id] = key.split('-'); const part = WORK_EXERCISES[Number(n) - 1].parts.find((p) => p.id === id)!; const g = part.solution!.illustrations?.find((i) => i.kind === 'graph'); expect(g && g.kind === 'graph' ? g.estimate : '', key).toMatch(/figure/); }
  });
});

describe('scientific regression: the laboratories agree with each other', () => {
  it('lifting: the Work Laboratory\'s work by the lifting force, the Energy Laboratory\'s potential energy and the pulley, ramp and lever outputs are all m g h', () => {
    for (const m of [2, 5, 20]) for (const h of [0.5, 1, 3]) {
      const lift = computeWork({ axis: 'vertical', forceN: m * 10, angleDeg: 90, displacement: h, startPos: 0, massKg: m, surfaceId: 'smooth' });
      expect(lift.appliedWork).toBeCloseTo(m * 10 * h, 9); expect(lift.netWork).toBeCloseTo(0, 9);
      expect(energyAtDistance(computeEnergy({ massKg: m, startHeight: h, angleDeg: 90, mu: 0, g: 10, u0: 0, refHeight: 0 }), 0).U).toBeCloseTo(lift.appliedWork, 9);
      expect(potentialEnergy(m, h)).toBeCloseTo(lift.appliedWork, 9);
      expect(computeRamp({ massKg: m, height: h, length: 3 * h, mu: 0, g: 10 }).outputWork).toBeCloseTo(lift.appliedWork, 9);
      expect(computePulley({ massKg: m, strands: 3, blockKg: 0, lift: h, g: 10 }).outputWork).toBeCloseTo(lift.appliedWork, 9);
      const lev = computeLever({ loadKg: m, loadArm: 0.5, effortArm: 1.5, kind: 'I', effort: 0, turnDeg: 4, g: 10 }); expect(lev.effortWork).toBeCloseTo(lev.loadWork, 9);
    }
  });
  it('the work-energy theorem in the Work-Energy Laboratory equals the Energy Laboratory\'s bottom speed for the same net force along the slope (smooth and with friction)', () => {
    for (const m of [1, 3, 12]) for (const angle of [20, 30, 60]) for (const mu of [0, 0.1, 0.25]) {
      const e = computeEnergy({ massKg: m, startHeight: 4, angleDeg: angle, mu, g: 10, u0: 0, refHeight: 0 }); if (!e.reachesBottom) continue;
      const bottom = energyAtDistance(e, e.sEnd), th = (angle * Math.PI) / 180;
      const net = m * 10 * (Math.sin(th) - mu * Math.cos(th)), k = computeKinetic({ massKg: m, netForce: net, u: 0, displacement: e.slopeLength });
      expect(k.valid).toBe(true); expect(k.K1).toBeCloseTo(bottom.K, 6); expect(k.wNet).toBeCloseTo(bottom.K, 6); expect(Math.abs(k.v)).toBeCloseTo(bottom.v, 6);
    }
  });
  it('friction is accounted for consistently: thermal energy in the Energy Laboratory equals the friction work of the Ramp model and of the Work Laboratory', () => {
    const m = 20, h = 1, L = 2, mu = 0.3, cos = Math.sqrt(L * L - h * h) / L;
    const ramp = computeRamp({ massKg: m, height: h, length: L, mu, g: 10 });
    const e = computeEnergy({ massKg: m, startHeight: h, angleDeg: (Math.asin(h / L) * 180) / Math.PI, mu, g: 10, u0: 0, refHeight: 0 });
    expect(energyAtDistance(e, e.sEnd).Q).toBeCloseTo(ramp.lost, 6); expect(ramp.lost).toBeCloseTo(mu * m * 10 * cos * L, 9);
    const flat = computeWork({ axis: 'horizontal', forceN: 10, angleDeg: 0, displacement: 4, startPos: 1, massKg: 5, surfaceId: 'wood' });
    expect(-flat.frictionWork).toBeCloseTo(0.3 * 5 * 10 * 4, 9);
    // total energy is conserved with friction, mechanical energy is not
    const b = energyAtDistance(e, e.sEnd); expect(b.total).toBeCloseTo(e.E0, 9); expect(b.mechanical).toBeLessThan(e.E0);
  });
  it('power agrees with the work found elsewhere: lifting m g h and speeding up to the Work-Energy kinetic energy, divided by the time', () => {
    const lift = computeWork({ axis: 'vertical', forceN: 600, angleDeg: 90, displacement: 3, startPos: 0, massKg: 60, surfaceId: 'smooth' });
    expect(computePower({ scenario: 'lift', workJ: 0, massKg: 60, height: 3, speed: 0, timeS: 4 }).power).toBeCloseTo(lift.appliedWork / 4, 9);
    const speed = computeKinetic({ massKg: 1200, netForce: 0, u: 25, displacement: 10 });
    expect(computePower({ scenario: 'accelerate', workJ: 0, massKg: 1200, height: 0, speed: 25, timeS: 10 }).power).toBeCloseTo(speed.K0 / 10, 6);
  });
  it('no machine gives out more useful work than is put in, and no model lets energy be created (over wide grids)', () => {
    for (const mu of [0, 0.2, 0.6]) for (const [h, L] of [[1, 1.5], [1, 5], [2, 6]]) { const r = computeRamp({ massKg: 30, height: h, length: L, mu, g: 10 }); expect(r.outputWork).toBeLessThanOrEqual(r.inputWork + 1e-9); }
    for (const n of [1, 2, 4, 6]) for (const blk of [0, 3]) { const r = computePulley({ massKg: 25, strands: n, blockKg: blk, lift: 2, g: 10 }); expect(r.outputWork).toBeLessThanOrEqual(r.inputWork + 1e-9); }
    for (const l1 of [0.2, 1, 3]) for (const l2 of [0.4, 1.5]) { const r = computeLever({ loadKg: 10, loadArm: l2, effortArm: l1, kind: 'I', effort: 0, turnDeg: 6, g: 10 }); expect(Math.abs(r.effortWork - r.loadWork)).toBeLessThan(1e-9); }
    for (const m of [1, 5]) for (const angle of [10, 45, 90]) for (const mu of [0, 0.3]) { const e = computeEnergy({ massKg: m, startHeight: 3, angleDeg: angle, mu, g: 10, u0: 2, refHeight: 1 }); const b = energyAtDistance(e, e.sEnd); expect(b.total).toBeCloseTo(e.E0, 8); }
  });
});

describe('preservation of the existing Physics platform and of earlier progress', () => {
  it('Motion, Forces and Electricity routes, hub cards and chapter registrations are intact; Chapter 7 adds its own routes', () => {
    for (const r of ['/physics', '/physics/motion', '/physics/motion/practice', '/physics/forces', '/physics/forces/lab', '/physics/electricity', '/physics/electricity/workbench', '/physics/work', '/physics/work/lab', '/physics/work/kinetic', '/physics/work/energy', '/physics/work/machines', '/physics/work/power', '/physics/work/derivations', '/physics/work/practice', '/physics/work/exercises', '/physics/work/learn/:lessonId']) expect(appSource, r).toContain(`path="${r}"`);
    for (const c of ['motion', 'forces', 'work', 'electricity']) expect(hubSource).toContain(`data-chapter-card="${c}"`);
    expect(CH.subject).toBe('physics'); expect(CH.routes.practice).toBe('/physics/work/practice');
  });
  it('the lesson, step and question ids from the earlier milestones are unchanged (stored progress keeps working) and distinct from the other chapters', () => {
    expect(CH.lessons['pw-l1'].steps.map((s) => s.id)).toEqual(['pw1-meaning', 'pw2-lifting', 'pw3-formula', 'pw4-joule']);
    expect(CH.lessons['pw-l2'].steps.map((s) => s.id)).toEqual(['pw5-zero', 'pw6-tired', 'pw7-perp', 'pw8-angle']);
    expect(CH.lessons['pw-l3'].independent.map((i) => i.id)).toEqual(['i1', 'i2', 'i3', 'i4', 'i5', 'i6', 'i7', 'i8']);
    expect(CH.lessons['pw-l4'].independent.length).toBe(8); expect(CH.lessons['pw-l5'].independent.length).toBe(12);
    const mine = new Set(allQuestions(CH).map((x) => x.q.id));
    for (const other of [MOTION_CHAPTER, FORCES_CHAPTER]) for (const x of allQuestions(other)) expect(mine.has(x.q.id), x.q.id).toBe(false);
  });
});
