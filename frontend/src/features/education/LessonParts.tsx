import React, { useEffect, useMemo, useState } from 'react';
import type { ExplainerStep, GuidedItem, IndependentItem, LabTask, LearningPhase, Reflection, WorkedExample as WorkedExampleData } from '../../engine/education/types';
import { LabTaskCard, PredictionCard, ProofList } from './LessonInteractions';
import { useEducationStore } from '../../store/useEducationStore';
import { QuestionView } from './QuestionView';
import { VisualHost } from './visuals';
import { Nar, NarrationRegion } from '../narration/NarrationRegion';
import { NarrationPlayer } from '../narration/NarrationPlayer';
import { explainerSegments, guidedSegments, independentSegments, nid, reflectionSegments, workedSegments } from '../../engine/narration/segments';

const card = 'rounded-2xl border border-surface-border bg-surface-card p-4 md:p-6';
const primaryBtn = 'min-h-[48px] px-5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 disabled:opacity-40';
const ghostBtn = 'min-h-[48px] px-4 rounded-xl border border-surface-border text-slate-200 text-sm hover:border-slate-400 disabled:opacity-40';

const PHASE: Record<LearningPhase, { label: string; note: string; tone: string }> = {
  observe: { label: 'Observe', note: 'Trying it shows the idea works for THESE cases. It suggests a rule but does not prove it for every case.', tone: 'border-cyan-500/40 text-cyan-200' },
  conjecture: { label: 'Conjecture', note: 'A conjecture is a careful guess that still needs a proof.', tone: 'border-violet-500/40 text-violet-200' },
  reasoning: { label: 'Reasoning', note: 'Now we ask why it must be true.', tone: 'border-amber-500/40 text-amber-200' },
  proof: { label: 'Proof', note: 'A proof uses only facts we already know, one reason at a time, so it holds for every figure of this kind.', tone: 'border-emerald-500/40 text-emerald-200' },
  apply: { label: 'Apply', note: 'Use the result to find something you could not measure directly.', tone: 'border-rose-500/40 text-rose-200' },
};

// ---------------------------------------------------------------------------
// ConceptExplainer: one idea at a time, visual beside the words
// ---------------------------------------------------------------------------

export const ConceptExplainer: React.FC<{
  step: ExplainerStep;
  lessonId?: string;
  onRefresher?: (id: string) => void;
  /** The lesson task named by `step.labTaskId`, resolved by the lesson page. */
  labTask?: LabTask;
  /** Where the laboratory should send the student back to. */
  backHref?: string;
}> = ({ step, lessonId, onRefresher, labTask, backHref }) => {
  const markStepSeen = useEducationStore((s) => s.markStepSeen);
  const storedPrediction = useEducationStore((s) => (lessonId && step.prediction ? Boolean(s.lessons[lessonId]?.predictions?.[step.prediction.id]) : false));
  const [predicted, setPredicted] = useState(false);
  // A step that asks for a prediction keeps its explanation hidden until the student commits.
  const revealed = !step.prediction || storedPrediction || predicted;
  const recordCheck = useEducationStore((s) => s.recordCheck);
  // Seeing a step is recorded only as "seen"; it never counts toward mastery.
  useEffect(() => {
    if (lessonId) markStepSeen(lessonId, step.id);
  }, [lessonId, step.id, markStepSeen]);

  const [activeProof, setActiveProof] = useState(0);
  const shownVisual = step.visual && step.proof
    ? { ...step.visual, props: { ...step.visual.props, highlight: step.proof[Math.min(activeProof, step.proof.length - 1)].show ?? [] } }
    : step.visual;
  const phase = step.phase ? PHASE[step.phase] : null;
  const segments = useMemo(() => explainerSegments(step), [step]);
  return (
    <NarrationRegion segments={segments} resetKey={step.id}>
    <article className={`${card} space-y-4`} aria-labelledby={`step-${step.id}`} data-phase={step.phase}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        {phase ? <div className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-mono uppercase tracking-wider ${phase.tone}`}>{phase.label}</div> : <span />}
        <NarrationPlayer label="this idea" />
      </div>
      <Nar as="h3" domId={`step-${step.id}`} id={nid.title(step.id)} className="text-lg md:text-xl font-black text-white">{step.title}</Nar>
      {phase && <p className="text-xs text-slate-400 -mt-2">{phase.note}</p>}
      {step.prediction && <PredictionCard lessonId={lessonId} prediction={step.prediction} onCommitted={() => setPredicted(true)} />}
      {revealed && <>
      {shownVisual && ['forceCart', 'motionTrack', 'twoBody', 'brakingDemo', 'circularMotion'].includes(shownVisual.kind) ? (
        <div className="space-y-4">
          <div className="space-y-3 text-sm md:text-base text-slate-200 leading-relaxed max-w-3xl">
            {step.paragraphs.map((p, i) => <Nar key={i} id={nid.para(step.id, i)}>{p}</Nar>)}
            {step.proof && <ProofList stepId={step.id} proof={step.proof} active={activeProof} onSelect={setActiveProof} lessonId={lessonId} />}
            {step.vocabulary && step.vocabulary.length > 0 && (
              <dl className="grid gap-1.5 text-sm">
                {step.vocabulary.map((v) => (
                  <Nar as="div" key={v.term} id={nid.vocab(step.id, step.vocabulary!.indexOf(v))} className="rounded-lg bg-surface-lowest px-3 py-2">
                    <dt className="inline font-bold text-cyan-300">{v.term}</dt> <dd className="inline text-slate-300">: {v.meaning}</dd>
                  </Nar>
                ))}
              </dl>
            )}
            {step.notice && (
              <Nar id={nid.notice(step.id)} className="rounded-lg border border-cyan-500/30 bg-cyan-950/30 px-3 py-2 text-cyan-100 text-sm"><strong>Look at the diagram: </strong>{step.notice}</Nar>
            )}
            {step.why && (
              <Nar id={nid.why(step.id)} className="rounded-lg border border-surface-border px-3 py-2 text-slate-300 text-sm"><strong className="text-white">Why it works: </strong>{step.why}</Nar>
            )}
            {step.misconception && (
              <div className="rounded-lg border border-red-500/30 bg-red-950/20 px-3 py-2 text-sm">
                <Nar id={nid.mis(step.id)} className="text-red-200"><strong>Common mix-up: </strong>{step.misconception.wrong}</Nar>
                <Nar id={nid.misRight(step.id)} className="text-emerald-200 mt-1"><strong>Instead: </strong>{step.misconception.right}</Nar>
              </div>
            )}
          </div>
          <VisualHost visual={shownVisual} />
        </div>
      ) : (
        <div className={step.visual ? 'grid gap-5 lg:grid-cols-2 items-start' : ''}>
          <div className="space-y-3 text-sm md:text-base text-slate-200 leading-relaxed">
            {step.paragraphs.map((p, i) => <Nar key={i} id={nid.para(step.id, i)}>{p}</Nar>)}
            {step.proof && <ProofList stepId={step.id} proof={step.proof} active={activeProof} onSelect={setActiveProof} lessonId={lessonId} />}
            {step.vocabulary && step.vocabulary.length > 0 && (
              <dl className="grid gap-1.5 text-sm">
                {step.vocabulary.map((v) => (
                  <Nar as="div" key={v.term} id={nid.vocab(step.id, step.vocabulary!.indexOf(v))} className="rounded-lg bg-surface-lowest px-3 py-2">
                    <dt className="inline font-bold text-cyan-300">{v.term}</dt> <dd className="inline text-slate-300">: {v.meaning}</dd>
                  </Nar>
                ))}
              </dl>
            )}
            {step.notice && (
              <Nar id={nid.notice(step.id)} className="rounded-lg border border-cyan-500/30 bg-cyan-950/30 px-3 py-2 text-cyan-100 text-sm"><strong>Look at the diagram: </strong>{step.notice}</Nar>
            )}
            {step.why && (
              <Nar id={nid.why(step.id)} className="rounded-lg border border-surface-border px-3 py-2 text-slate-300 text-sm"><strong className="text-white">Why it works: </strong>{step.why}</Nar>
            )}
            {step.misconception && (
              <div className="rounded-lg border border-red-500/30 bg-red-950/20 px-3 py-2 text-sm">
                <Nar id={nid.mis(step.id)} className="text-red-200"><strong>Common mix-up: </strong>{step.misconception.wrong}</Nar>
                <Nar id={nid.misRight(step.id)} className="text-emerald-200 mt-1"><strong>Instead: </strong>{step.misconception.right}</Nar>
              </div>
            )}
          </div>
          {shownVisual && <VisualHost visual={shownVisual} />}
        </div>
      )}
      {step.check && (
        <div className="border-t border-surface-border pt-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 mb-2">Quick check</div>
          <QuestionView
            question={step.check}
            onRefresher={onRefresher}
            onSubmit={(ev, q) => lessonId && recordCheck(lessonId, q.id, ev.correct)}
          />
        </div>
      )}
      {labTask && lessonId && <LabTaskCard task={labTask} lessonId={lessonId} backHref={backHref ?? '/'} />}
      </>}
    </article>
    </NarrationRegion>
  );
};

// ---------------------------------------------------------------------------
// WorkedExample: "I do", revealed one step at a time
// ---------------------------------------------------------------------------

export const WorkedExample: React.FC<{ example: WorkedExampleData; lessonId?: string }> = ({ example, lessonId }) => {
  const [shown, setShown] = useState(1);
  const markWorkedSeen = useEducationStore((s) => s.markWorkedSeen);
  const all = shown >= example.steps.length;
  useEffect(() => {
    if (all && lessonId) markWorkedSeen(lessonId);
  }, [all, lessonId, markWorkedSeen]);
  const lastVisual = [...example.steps.slice(0, shown)].reverse().find((s) => s.visual)?.visual ?? example.visual;
  const segments = useMemo(() => workedSegments(example, shown), [example, shown]);

  return (
    <NarrationRegion segments={segments} resetKey={example.id}>
    <section className={`${card} space-y-4`} aria-label="Worked example">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400">Worked example: watch first</div>
        <NarrationPlayer label="the worked example" />
      </div>
      <Nar as="h3" id={nid.worked.title(example.id)} className="text-lg md:text-xl font-black text-white">{example.title}</Nar>
      {lastVisual && ['forceCart', 'motionTrack', 'twoBody', 'brakingDemo', 'circularMotion'].includes(lastVisual.kind) ? (
        <div className="space-y-4">
          <div className="space-y-3 text-sm md:text-base text-slate-200 max-w-3xl">
            <ul className="list-disc pl-5 space-y-1">{example.given.map((g, i) => <Nar as="li" key={i} id={nid.worked.given(example.id, i)}>{g}</Nar>)}</ul>
            <Nar id={nid.worked.ask(example.id)} className="font-bold text-white">{example.ask}</Nar>
            <ol className="space-y-2">
              {example.steps.slice(0, shown).map((s, i) => (
                <li key={i} className="rounded-xl bg-surface-lowest px-3 py-2" data-worked-step={i + 1}>
                  <Nar as="div" id={nid.worked.step(example.id, i)}><span className="font-mono text-amber-400 mr-2">{i + 1}.</span>{s.text}</Nar>
                  <Nar as="div" id={nid.worked.why(example.id, i)} className="text-xs text-slate-400 mt-1"><em>Why: </em>{s.why}</Nar>
                </li>
              ))}
            </ol>
            {all ? (
              <Nar id={nid.worked.verify(example.id)} className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-3 py-2 text-emerald-100 text-sm"><strong>Check: </strong>{example.verify}</Nar>
            ) : (
              <button type="button" className={primaryBtn} onClick={() => setShown((n) => n + 1)}>Show step {shown + 1}</button>
            )}
          </div>
          <VisualHost visual={lastVisual} />
        </div>
      ) : (
        <div className={lastVisual ? 'grid gap-5 lg:grid-cols-2 items-start' : ''}>
          <div className="space-y-3 text-sm md:text-base text-slate-200">
            <ul className="list-disc pl-5 space-y-1">{example.given.map((g, i) => <Nar as="li" key={i} id={nid.worked.given(example.id, i)}>{g}</Nar>)}</ul>
            <Nar id={nid.worked.ask(example.id)} className="font-bold text-white">{example.ask}</Nar>
            <ol className="space-y-2">
              {example.steps.slice(0, shown).map((s, i) => (
                <li key={i} className="rounded-xl bg-surface-lowest px-3 py-2" data-worked-step={i + 1}>
                  <Nar as="div" id={nid.worked.step(example.id, i)}><span className="font-mono text-amber-400 mr-2">{i + 1}.</span>{s.text}</Nar>
                  <Nar as="div" id={nid.worked.why(example.id, i)} className="text-xs text-slate-400 mt-1"><em>Why: </em>{s.why}</Nar>
                </li>
              ))}
            </ol>
            {all ? (
              <Nar id={nid.worked.verify(example.id)} className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-3 py-2 text-emerald-100 text-sm"><strong>Check: </strong>{example.verify}</Nar>
            ) : (
              <button type="button" className={primaryBtn} onClick={() => setShown((n) => n + 1)}>Show step {shown + 1}</button>
            )}
          </div>
          {lastVisual && <VisualHost visual={lastVisual} />}
        </div>
      )}
    </section>
    </NarrationRegion>
  );
};

// ---------------------------------------------------------------------------
// GuidedPractice: "We do", with hints and a check after every step
// ---------------------------------------------------------------------------

export const GuidedPractice: React.FC<{ item: GuidedItem; lessonId: string; onRefresher?: (id: string) => void }> = ({ item, lessonId, onRefresher }) => {
  const rec = useEducationStore((s) => s.lessons[lessonId]);
  const recordHint = useEducationStore((s) => s.recordGuidedHint);
  const recordAnswer = useEducationStore((s) => s.recordGuidedAnswer);
  const [hintLevel, setHintLevel] = useState<Record<string, number>>({});
  const doneCount = item.steps.filter((s) => rec?.guided[s.id]?.done).length;
  const current = Math.min(doneCount, item.steps.length - 1);
  const finished = doneCount === item.steps.length;
  const segments = useMemo(() => guidedSegments(item, current + 1, finished), [item, current, finished]);

  return (
    <NarrationRegion segments={segments} resetKey={item.id}>
    <section className={`${card} space-y-4`} aria-label="Guided practice">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400">Guided practice: we do it together</div>
        <NarrationPlayer label="the guided practice" />
      </div>
      <Nar id={`${item.id}:prompt`} className="text-sm md:text-base text-white">{item.prompt}</Nar>
      {item.visual && <VisualHost visual={item.visual} />}
      <p className="text-xs font-mono text-slate-400">Step {Math.min(doneCount + 1, item.steps.length)} of {item.steps.length}</p>
      {item.steps.slice(0, current + 1).map((st, idx) => {
        const done = rec?.guided[st.id]?.done === true;
        const level = hintLevel[st.id] ?? 0;
        return (
          <div key={st.id} className={`rounded-xl border p-3 space-y-3 ${done ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-surface-border'}`} data-guided-step={idx + 1}>
            <Nar id={`${st.id}:prompt`} className="text-sm text-slate-300">{st.prompt}</Nar>
            <QuestionView
              question={st.question}
              onRefresher={onRefresher}
              onSubmit={(ev) => { if (!ev.invalid) recordAnswer(lessonId, st.id, ev.correct); }}
            />
            {!done && st.hints.length > 0 && (
              <div className="space-y-2">
                {st.hints.slice(0, level).map((h, i) => <p key={i} className="text-sm text-cyan-100 rounded-lg bg-cyan-950/30 border border-cyan-500/30 px-3 py-2" data-hint={i + 1}><strong>Hint {i + 1}: </strong>{h}</p>)}
                {level < st.hints.length && (
                  <button type="button" className={ghostBtn} onClick={() => { setHintLevel((m) => ({ ...m, [st.id]: level + 1 })); recordHint(lessonId, st.id); }}>
                    {level === 0 ? 'I need a hint' : 'Another hint'}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
      {finished && <p className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-3 py-2 text-emerald-100 text-sm" data-testid="guided-conclusion">{item.conclusion}</p>}
    </section>
    </NarrationRegion>
  );
};

// ---------------------------------------------------------------------------
// IndependentPractice: "You do". Hints and solutions are honest about help.
// ---------------------------------------------------------------------------

const DIFFICULTY_LABEL = { basic: 'Basic', standard: 'Standard', challenge: 'Challenge' } as const;

/**
 * One independent problem. Bound to a lesson (`lessonId`) or, when `practiceChapterId` is given, to that chapter's practice bank.
 * The help rules are identical either way; only where the evidence is filed differs.
 */
export const IndependentCard: React.FC<{ item: IndependentItem; lessonId: string; index: number; onRefresher?: (id: string) => void; practiceChapterId?: string }> = ({ item, lessonId, index, onRefresher, practiceChapterId }) => {
  const rec = useEducationStore((s) => (practiceChapterId ? s.practice[practiceChapterId]?.[item.id] : s.lessons[lessonId]?.independent[item.id]));
  const submitLesson = useEducationStore((s) => s.submitIndependent);
  const hintLesson = useEducationStore((s) => s.recordIndependentHint);
  const revealLesson = useEducationStore((s) => s.revealIndependentSolution);
  const submitPractice = useEducationStore((s) => s.submitPractice);
  const hintPractice = useEducationStore((s) => s.recordPracticeHint);
  const revealPractice = useEducationStore((s) => s.revealPracticeSolution);
  const submit = (_l: string, id: string, ev: Parameters<typeof submitLesson>[2]) => (practiceChapterId ? submitPractice(practiceChapterId, id, ev) : submitLesson(lessonId, id, ev));
  const hint = (_l: string, id: string) => (practiceChapterId ? hintPractice(practiceChapterId, id) : hintLesson(lessonId, id));
  const reveal = (_l: string, id: string) => (practiceChapterId ? revealPractice(practiceChapterId, id) : revealLesson(lessonId, id));
  const [hintLevel, setHintLevel] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const attempts = rec?.attempts ?? 0;

  return (
    <div className="rounded-xl border border-surface-border p-4 space-y-3" data-independent={item.id}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-mono text-slate-400">Problem {index + 1} · {item.topic}{item.difficulty ? ` · ${DIFFICULTY_LABEL[item.difficulty]}` : ''}{item.marks ? ` · ${item.marks} mark${item.marks === 1 ? '' : 's'}` : ''}</span>
        {rec?.correct && (
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full border border-surface-border text-slate-300" data-testid="independent-badge">
            {rec.firstAttemptUnassisted ? 'Independent success' : 'Solved with help or retries'}
          </span>
        )}
      </div>
      <Nar id={`${item.id}:prompt`} className="text-sm text-slate-200">{`Problem ${index + 1}. `}{item.prompt}</Nar>
      {item.visual && <VisualHost visual={item.visual} />}
      <QuestionView
        question={item.question}
        lockOnCorrect={false}
        onRefresher={onRefresher}
        onSubmit={(ev) => submit(lessonId, item.id, ev)}
      />
      <div className="flex flex-wrap gap-2">
        {hintLevel < item.hints.length && (
          <button type="button" className={ghostBtn} onClick={() => { setHintLevel((n) => n + 1); hint(lessonId, item.id); }}>
            Hint (this will be noted as help)
          </button>
        )}
        {!showSolution && (
          <button
            type="button"
            className={ghostBtn}
            disabled={attempts === 0}
            title={attempts === 0 ? 'Try the problem first' : undefined}
            onClick={() => { setShowSolution(true); reveal(lessonId, item.id); }}
          >
            {attempts === 0 ? 'Solution unlocks after your first try' : 'Show solution (counts as help)'}
          </button>
        )}
      </div>
      {item.hints.slice(0, hintLevel).map((h, i) => <p key={i} className="text-sm text-cyan-100 rounded-lg bg-cyan-950/30 border border-cyan-500/30 px-3 py-2"><strong>Hint {i + 1}: </strong>{h}</p>)}
      {showSolution && (
        <ol className="list-decimal pl-5 space-y-1 text-sm text-slate-200 rounded-lg bg-surface-lowest px-4 py-3" data-testid="solution">
          {item.solution.map((l, i) => <li key={i}>{l}</li>)}
        </ol>
      )}
    </div>
  );
};

export const IndependentPractice: React.FC<{ items: IndependentItem[]; lessonId: string; onRefresher?: (id: string) => void }> = ({ items, lessonId, onRefresher }) => {
  const retry = useEducationStore((s) => s.retryAssisted);
  const lesson = useEducationStore((s) => s.lessons[lessonId]);
  const hasAssisted = items.some((i) => lesson?.independent[i.id] && lesson.independent[i.id].firstAttemptUnassisted !== true);
  const segments = useMemo(() => independentSegments(items), [items]);
  return (
    <NarrationRegion segments={segments} resetKey={lessonId}>
    <section className={`${card} space-y-4`} aria-label="Independent practice">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">Independent practice: your turn</div>
        <NarrationPlayer label="the practice questions" />
      </div>
      <p className="text-sm text-slate-300">Mastery here means getting problems right on your first try without hints or solutions. Using help is fine; it is just recorded honestly.</p>
      {items.map((it, i) => <IndependentCard key={it.id} item={it} lessonId={lessonId} index={i} onRefresher={onRefresher} />)}
      {hasAssisted && (
        <button type="button" className={ghostBtn} onClick={() => retry(lessonId)} title="Clears only attempts that used help or retries; independent successes are kept">
          Retry the problems where I needed help
        </button>
      )}
    </section>
    </NarrationRegion>
  );
};

// ---------------------------------------------------------------------------
// LearningReflection
// ---------------------------------------------------------------------------

export const LearningReflection: React.FC<{ reflection: Reflection; lessonId: string; onRefresher?: (id: string) => void }> = ({ reflection, lessonId, onRefresher }) => {
  const reflected = useEducationStore((s) => s.lessons[lessonId]?.reflected === true);
  const mark = useEducationStore((s) => s.markReflected);
  const segments = useMemo(() => reflectionSegments(lessonId, reflection), [lessonId, reflection]);
  return (
    <NarrationRegion segments={segments} resetKey={lessonId}>
    <section className={`${card} space-y-3`} aria-label="Reflect">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-[11px] font-mono uppercase tracking-wider text-violet-300">Reflect</div>
        <NarrationPlayer label="the reflection" />
      </div>
      <Nar id={`${lessonId}:reflect-discover`} className="text-sm md:text-base text-white"><strong>What you can now explain: </strong>{reflection.discover}</Nar>
      <Nar id={`${lessonId}:reflect-evidence`} className="text-sm text-slate-300"><strong>What showed it: </strong>{reflection.evidence}</Nar>
      {reflection.stillConfusing.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-slate-200">Still unsure about something? Tap it to review.</div>
          <div className="flex flex-wrap gap-2">
            {reflection.stillConfusing.map((c) => (
              <button key={c.text} type="button" className={ghostBtn} onClick={() => onRefresher?.(c.refresherId)}>{c.text}</button>
            ))}
          </div>
        </div>
      )}
      <button type="button" className={primaryBtn} disabled={reflected} onClick={() => mark(lessonId)}>{reflected ? 'Reflection saved' : 'I have thought about this'}</button>
    </section>
    </NarrationRegion>
  );
};
