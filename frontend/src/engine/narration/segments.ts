/**
 * Narration segments for the chapter-neutral lesson data (EDU-1). Each builder returns the student-facing explanatory text of
 * one part of a lesson as explicit segments, taken from the data (not scraped from the page), so what is read aloud is exactly
 * what the data says. Segment ids are shared with the components, which tag the same text with `data-narration-id` so the
 * sentence being read can be highlighted.
 *
 * Deliberately NOT narrated: hints, solutions, answer feedback and question explanations (they would reveal answers or imply
 * help), and live simulation readouts (they change continuously and would never stop talking).
 */

import type { ChoiceQuestion, EduChapter, EduUnit, ExplainerStep, GuidedItem, IndependentItem, Question, Reflection, WorkedExample } from '../education/types';
import type { NarrationSegment } from './controller';

const seg = (id: string, text: string | undefined | null, speak?: string): NarrationSegment[] => (text && text.trim() ? [{ id, text: text.trim(), speak }] : []);

/** Ids shared by the builders and the components that highlight. */
export const nid = {
  title: (stepId: string) => `${stepId}:title`,
  para: (stepId: string, i: number) => `${stepId}:p${i}`,
  proof: (stepId: string, i: number) => `${stepId}:proof${i}`,
  vocab: (stepId: string, i: number) => `${stepId}:vocab${i}`,
  notice: (stepId: string) => `${stepId}:notice`,
  why: (stepId: string) => `${stepId}:why`,
  mis: (stepId: string) => `${stepId}:mis`,
  misRight: (stepId: string) => `${stepId}:misright`,
  check: (stepId: string) => `${stepId}:check`,
  worked: {
    title: (id: string) => `${id}:title`,
    given: (id: string, i: number) => `${id}:given${i}`,
    ask: (id: string) => `${id}:ask`,
    step: (id: string, i: number) => `${id}:step${i}`,
    why: (id: string, i: number) => `${id}:why${i}`,
    verify: (id: string) => `${id}:verify`,
  },
};

const LETTERS = 'ABCDEFGH';

export function questionSegments(prefix: string, q: Question): NarrationSegment[] {
  const out = seg(`${prefix}:q`, q.prompt);
  if (q.kind === 'choice') {
    (q as ChoiceQuestion).options.forEach((o, i) => out.push(...seg(`${prefix}:opt${i}`, `Option ${LETTERS[i] ?? i + 1}: ${o.text}`)));
  } else if (q.kind === 'order') {
    q.items.forEach((o, i) => out.push(...seg(`${prefix}:item${i}`, `Step ${LETTERS[i] ?? i + 1}: ${o.text}`)));
  } else if (q.kind === 'numeric' && q.unit) {
    out.push(...seg(`${prefix}:unit`, `Give your answer in ${q.unit}.`));
  }
  return out;
}

/** One concept step: title, paragraphs, proof lines, vocabulary, notice, why, mix-up, and the quick check's question. */
export function explainerSegments(step: ExplainerStep): NarrationSegment[] {
  const s = step.id;
  const out: NarrationSegment[] = [...seg(nid.title(s), step.title)];
  step.paragraphs.forEach((p, i) => out.push(...seg(nid.para(s, i), p)));
  step.proof?.forEach((p, i) => out.push(...seg(nid.proof(s, i), `Step ${i + 1}. ${p.claim}. Because: ${p.reason}`)));
  step.vocabulary?.forEach((v, i) => out.push(...seg(nid.vocab(s, i), `${v.term}: ${v.meaning}`)));
  if (step.notice) out.push(...seg(nid.notice(s), `Look at the diagram: ${step.notice}`));
  if (step.why) out.push(...seg(nid.why(s), `Why it works: ${step.why}`));
  if (step.misconception) {
    out.push(...seg(nid.mis(s), `Common mix-up: ${step.misconception.wrong}`));
    out.push(...seg(nid.misRight(s), `Instead: ${step.misconception.right}`));
  }
  if (step.check) out.push(...questionSegments(nid.check(s), step.check));
  return out;
}

/** The worked example as far as the student has revealed it (`shown` steps), then the check once all steps are shown. */
export function workedSegments(ex: WorkedExample, shown: number): NarrationSegment[] {
  const w = nid.worked;
  const out: NarrationSegment[] = [...seg(w.title(ex.id), ex.title)];
  ex.given.forEach((g, i) => out.push(...seg(w.given(ex.id, i), g)));
  out.push(...seg(w.ask(ex.id), ex.ask));
  ex.steps.slice(0, shown).forEach((st, i) => {
    out.push(...seg(w.step(ex.id, i), `Step ${i + 1}. ${st.text}`));
    out.push(...seg(w.why(ex.id, i), `Why: ${st.why}`));
  });
  if (shown >= ex.steps.length) out.push(...seg(w.verify(ex.id), `Check: ${ex.verify}`));
  return out;
}

/** Guided practice: the prompt and the questions of the steps currently on screen. Hints are not read. */
export function guidedSegments(item: GuidedItem, visibleSteps: number, finished: boolean): NarrationSegment[] {
  const out: NarrationSegment[] = [...seg(`${item.id}:prompt`, item.prompt)];
  item.steps.slice(0, visibleSteps).forEach((st, i) => {
    out.push(...seg(`${st.id}:prompt`, `Step ${i + 1}. ${st.prompt}`));
    out.push(...questionSegments(st.id, st.question));
  });
  if (finished) out.push(...seg(`${item.id}:conclusion`, item.conclusion));
  return out;
}

/** Independent practice: every problem's prompt and question. Hints and solutions are never read. */
export function independentSegments(items: IndependentItem[]): NarrationSegment[] {
  return items.flatMap((it, i) => [...seg(`${it.id}:prompt`, `Problem ${i + 1}. ${it.prompt}`), ...questionSegments(it.id, it.question)]);
}

export function reflectionSegments(lessonId: string, r: Reflection): NarrationSegment[] {
  return [...seg(`${lessonId}:reflect-discover`, `What you can now explain: ${r.discover}`), ...seg(`${lessonId}:reflect-evidence`, `What showed it: ${r.evidence}`)];
}

/** The chapter overview paragraph. The lists inside the collapsed "Curriculum Objectives" panel are not narrated while hidden. */
export function chapterIntroSegments(chapter: EduChapter): NarrationSegment[] {
  return seg(`${chapter.id}:purpose`, chapter.purpose);
}

/** The unit heading and central idea (the vocabulary sits in a collapsed panel and is not narrated while hidden). */
export function unitIntroSegments(unit: EduUnit): NarrationSegment[] {
  return [
    ...seg(`${unit.id}:title`, `Unit ${unit.number}: ${unit.title}`),
    ...seg(`${unit.id}:idea`, `Central idea: ${unit.centralIdea}`),
  ];
}
