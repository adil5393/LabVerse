import { describe, it, expect, afterEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MOTION_CHAPTER } from '../../../engine/physics/motion/learn/content';
import { FORCES_CHAPTER } from '../../../engine/physics/forces/learn/content';
import { WORK_CHAPTER } from '../../../engine/physics/work/learn/content';
import { SOUND_CHAPTER } from '../../../engine/physics/sound/learn/content';
import { DERIVATIONS as MOTION_DERIVATIONS } from '../../../engine/physics/motion/derivations';
import { DERIVATIONS as WORK_DERIVATIONS } from '../../../engine/physics/work/derivations';
import { SECOND_LAW_DERIVATIONS } from '../../../engine/physics/forces/secondLawDerivations';
import type { EduChapter, ExplainerStep, Question } from '../../../engine/education/types';
import { explainerSegments, guidedSegments, independentSegments, reflectionSegments, workedSegments, questionSegments } from '../../../engine/narration/segments';
import { derivationSegments } from '../../../engine/narration/derivationSegments';
import type { NarrationSegment } from '../../../engine/narration/controller';
import { setSpeechProvider, type SpeechProvider } from '../../../engine/narration/provider';
import { NarrationEnabledProvider } from '../NarrationRegion';
import { ConceptExplainer } from '../../education/LessonParts';

const CHAPTERS: EduChapter[] = [MOTION_CHAPTER, FORCES_CHAPTER, WORK_CHAPTER, SOUND_CHAPTER];
const all = (segs: NarrationSegment[]) => segs.map((s) => s.text).join('\n');
const has = (segs: NarrationSegment[], text: string | undefined) => !text || all(segs).includes(text.trim());
const unique = (segs: NarrationSegment[]) => new Set(segs.map((s) => s.id)).size === segs.length;

function questionTexts(q: Question): string[] {
  const t = [q.prompt];
  if (q.kind === 'choice') t.push(...q.options.map((o) => o.text));
  if (q.kind === 'order') t.push(...q.items.map((o) => o.text));
  return t;
}

function stepTexts(s: ExplainerStep): string[] {
  return [s.title, ...s.paragraphs, ...(s.vocabulary ?? []).flatMap((v) => [v.term, v.meaning]), s.notice ?? '', s.why ?? '', s.misconception?.wrong ?? '', s.misconception?.right ?? '',
    ...(s.proof ?? []).flatMap((p) => [p.claim, p.reason]), ...(s.check ? questionTexts(s.check) : [])].filter(Boolean);
}

describe('every explanatory section of the four Physics chapters (Motion, Forces, Work, Sound) is reachable through narration', () => {
  for (const ch of CHAPTERS) {
    describe(ch.title, () => {
      const lessons = Object.values(ch.lessons);
      it('has lessons to cover', () => expect(lessons.length).toBeGreaterThanOrEqual(6));

      for (const l of lessons) {
        it(`${l.id}: concept steps, worked example, guided practice, practice questions and reflection`, () => {
          for (const step of l.steps) {
            const segs = explainerSegments(step);
            expect(segs.length, step.id).toBeGreaterThan(0);
            expect(unique(segs), `unique ids in ${step.id}`).toBe(true);
            for (const text of stepTexts(step)) expect(has(segs, text), `${step.id} must narrate: ${text.slice(0, 60)}`).toBe(true);
          }
          const w = workedSegments(l.worked, l.worked.steps.length);
          expect(unique(w)).toBe(true);
          for (const text of [l.worked.title, ...l.worked.given, l.worked.ask, l.worked.verify, ...l.worked.steps.flatMap((s) => [s.text, s.why])]) expect(has(w, text), `worked: ${text.slice(0, 50)}`).toBe(true);
          // Only the revealed steps are read.
          expect(workedSegments(l.worked, 1).some((s) => s.text.includes(l.worked.steps[l.worked.steps.length - 1].text)) || l.worked.steps.length === 1).toBe(l.worked.steps.length === 1);

          const g = guidedSegments(l.guided, l.guided.steps.length, true);
          expect(unique(g)).toBe(true);
          for (const text of [l.guided.prompt, l.guided.conclusion, ...l.guided.steps.flatMap((s) => [s.prompt, ...questionTexts(s.question)])]) expect(has(g, text), `guided: ${text.slice(0, 50)}`).toBe(true);

          const ind = independentSegments(l.independent);
          expect(unique(ind)).toBe(true);
          for (const it of l.independent) for (const text of [it.prompt, ...questionTexts(it.question)]) expect(has(ind, text), `independent: ${text.slice(0, 50)}`).toBe(true);

          const r = reflectionSegments(l.id, l.reflection);
          expect(has(r, l.reflection.discover) && has(r, l.reflection.evidence)).toBe(true);
        });

        it(`${l.id}: hints, solutions and answer explanations are never narrated in the practice sections`, () => {
          // Exact-text comparison against the practice segments (a hint may legitimately echo a phrase of the lesson text).
          const practice = new Set([...guidedSegments(l.guided, l.guided.steps.length, true), ...independentSegments(l.independent)].map((s) => s.text));
          for (const it of l.independent) {
            for (const h of it.hints) expect(practice.has(h), `hint leaked in ${it.id}`).toBe(false);
            for (const line of it.solution) expect(practice.has(line), `solution leaked in ${it.id}`).toBe(false);
            expect(practice.has(it.question.explanation), `explanation leaked in ${it.id}`).toBe(false);
          }
          for (const st of l.guided.steps) {
            for (const h of st.hints) expect(practice.has(h), `guided hint leaked in ${st.id}`).toBe(false);
            expect(practice.has(st.question.explanation), `explanation leaked in ${st.id}`).toBe(false);
          }
        });
      }

      it('prerequisite refreshers (also explainer steps) are covered', () => {
        for (const pre of Object.values(ch.prerequisites)) for (const step of pre.refresher) {
          const segs = explainerSegments(step);
          expect(segs.length, step.id).toBeGreaterThan(0);
          for (const text of stepTexts(step)) expect(has(segs, text), `${step.id}: ${text.slice(0, 50)}`).toBe(true);
        }
      });
    });
  }
});

describe('derivations: Chapters 4, 6 and 7', () => {
  const sets = [
    { name: 'Chapter 4', list: MOTION_DERIVATIONS },
    { name: 'Chapter 6', list: SECOND_LAW_DERIVATIONS },
    { name: 'Chapter 7', list: WORK_DERIVATIONS },
  ] as { name: string; list: { id: string; title: string; assumptions: string[]; steps: { id: string; title: string; math: string[]; why: string; check?: Question }[]; summary: string[] }[] }[];

  for (const { name, list } of sets) {
    it(`${name}: ${list.length} derivations narrate every step, assumption and summary, and respect locked steps`, () => {
      expect(list.length).toBeGreaterThanOrEqual(2);
      for (const d of list) {
        d.steps.forEach((step, index) => {
          const input = { title: d.title, assumptions: d.assumptions, steps: d.steps, index, gated: false, summary: d.summary };
          const open = derivationSegments(input);
          expect(unique(open), `${d.id} step ${index}`).toBe(true);
          expect(has(open, d.title)).toBe(true);
          for (const a of d.assumptions) expect(has(open, a), `assumption in ${d.id}`).toBe(true);
          expect(has(open, step.title)).toBe(true);
          for (const l of step.math) expect(has(open, l), `${d.id}.${step.id} math`).toBe(true);
          expect(has(open, step.why)).toBe(true);
          if (index === d.steps.length - 1) for (const l of d.summary) expect(has(open, l), `${d.id} summary`).toBe(true);
          expect(all(open)).not.toMatch(/Numerical check/);

          if (step.check) {
            const locked = derivationSegments({ ...input, gated: true });
            expect(has(locked, step.check.prompt)).toBe(true);
            expect(has(locked, 'Supply the missing reasoning first')).toBe(true);
            for (const l of step.math) if (l.length > 8) expect(all(locked).includes(l), `locked step must not read ${l}`).toBe(false);
            expect(all(locked).includes(step.why)).toBe(false);
          }
        });
      }
    });
  }
});

describe('question narration', () => {
  it('reads the prompt and the options but not the answer or the explanation', () => {
    const q = MOTION_CHAPTER.lessons[Object.keys(MOTION_CHAPTER.lessons)[0]].steps.find((s) => s.check)?.check;
    expect(q).toBeDefined();
    const segs = questionSegments('x', q!);
    expect(segs[0].text).toBe(q!.prompt);
    expect(all(segs).includes(q!.explanation)).toBe(false);
  });
});

// ---- rendering: the controls appear only where narration is enabled, and rendering never speaks ----

class RecordingProvider implements SpeechProvider {
  supported = true; calls = 0;
  speak() { this.calls++; return () => {}; }
  cancel() {}
  voices() { return []; }
  onVoicesChanged() { return () => {}; }
}
afterEach(() => setSpeechProvider(null));

const plainStep = (): ExplainerStep => {
  for (const ch of CHAPTERS) for (const l of Object.values(ch.lessons)) { const s = l.steps.find((x) => !x.visual && !x.proof); if (s) return s; }
  throw new Error('no plain step');
};

describe('NarrationPlayer in a lesson step', () => {
  it('shows a Listen control and tagged text when narration is enabled, and never speaks on render', () => {
    const rec = new RecordingProvider(); setSpeechProvider(rec);
    const step = plainStep();
    const html = renderToStaticMarkup(<NarrationEnabledProvider enabled><ConceptExplainer step={step} /></NarrationEnabledProvider>);
    expect(html).toContain('data-testid="narration-player"');
    expect(html).toContain('data-state="idle"');
    expect(html).toContain('aria-label="Listen to this idea"');
    expect(html).toContain(`data-narration-id="${step.id}:p0"`);
    expect(html).not.toContain('data-narrating="true"');
    expect(rec.calls).toBe(0);
  });

  it('shows nothing for a subject that has not adopted narration, but still renders the full text', () => {
    setSpeechProvider(new RecordingProvider());
    const step = plainStep();
    const html = renderToStaticMarkup(<NarrationEnabledProvider enabled={false}><ConceptExplainer step={step} /></NarrationEnabledProvider>);
    expect(html).not.toContain('narration-player');
    expect(html).toContain(step.paragraphs[0].slice(0, 20).replace(/&/g, '&amp;'));
  });

  it('says plainly that read aloud is unavailable when the browser has no speech support', () => {
    setSpeechProvider({ supported: false, speak: () => () => {}, cancel() {}, voices: () => [], onVoicesChanged: () => () => {} });
    const html = renderToStaticMarkup(<NarrationEnabledProvider enabled><ConceptExplainer step={plainStep()} /></NarrationEnabledProvider>);
    expect(html).toContain('narration-unsupported');
    expect(html).not.toContain('aria-label="Listen to');
  });
});
