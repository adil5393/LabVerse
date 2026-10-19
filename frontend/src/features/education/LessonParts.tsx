import React, { useEffect, useState } from 'react';
import type { ExplainerStep, GuidedItem, IndependentItem, LearningPhase, Reflection, WorkedExample as WorkedExampleData } from '../../engine/education/types';
import { useEducationStore } from '../../store/useEducationStore';
import { QuestionView } from './QuestionView';
import { VisualHost } from './visuals';

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
}> = ({ step, lessonId, onRefresher }) => {
  const markStepSeen = useEducationStore((s) => s.markStepSeen);
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
  return (
    <article className={`${card} space-y-4`} aria-labelledby={`step-${step.id}`} data-phase={step.phase}>
      {phase && <div className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-mono uppercase tracking-wider ${phase.tone}`}>{phase.label}</div>}
      <h3 id={`step-${step.id}`} className="text-lg md:text-xl font-black text-white">{step.title}</h3>
      {phase && <p className="text-xs text-slate-400 -mt-2">{phase.note}</p>}
      <div className={step.visual ? 'grid gap-5 lg:grid-cols-2 items-start' : ''}>
        <div className="space-y-3 text-sm md:text-base text-slate-200 leading-relaxed">
          {step.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          {step.proof && (
            <ol className="space-y-2" aria-label="Proof, one claim and reason per line">
              {step.proof.map((ps, i) => (
                <li key={i}>
                  <button type="button" aria-current={activeProof === i} data-proof-step={i + 1} onClick={() => setActiveProof(i)}
                    className={`w-full text-left min-h-[48px] rounded-xl border px-3 py-2 ${activeProof === i ? 'border-emerald-400 bg-emerald-950/30' : 'border-surface-border bg-surface-lowest hover:border-slate-500'}`}>
                    <span className="font-mono text-emerald-300 mr-2">{i + 1}.</span><span className="text-white">{ps.claim}</span>
                    <span className="block text-xs text-slate-400 mt-1"><em>Because: </em>{ps.reason}</span>
                  </button>
                </li>
              ))}
            </ol>
          )}
          {step.vocabulary && step.vocabulary.length > 0 && (
            <dl className="grid gap-1.5 text-sm">
              {step.vocabulary.map((v) => (
                <div key={v.term} className="rounded-lg bg-surface-lowest px-3 py-2">
                  <dt className="inline font-bold text-cyan-300">{v.term}</dt> <dd className="inline text-slate-300">: {v.meaning}</dd>
                </div>
              ))}
            </dl>
          )}
          {step.notice && (
            <p className="rounded-lg border border-cyan-500/30 bg-cyan-950/30 px-3 py-2 text-cyan-100 text-sm"><strong>Look at the diagram: </strong>{step.notice}</p>
          )}
          {step.why && (
            <p className="rounded-lg border border-surface-border px-3 py-2 text-slate-300 text-sm"><strong className="text-white">Why it works: </strong>{step.why}</p>
          )}
          {step.misconception && (
            <div className="rounded-lg border border-red-500/30 bg-red-950/20 px-3 py-2 text-sm">
              <p className="text-red-200"><strong>Common mix-up: </strong>{step.misconception.wrong}</p>
              <p className="text-emerald-200 mt-1"><strong>Instead: </strong>{step.misconception.right}</p>
            </div>
          )}
        </div>
        {shownVisual && <VisualHost visual={shownVisual} />}
      </div>
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
    </article>
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

  return (
    <section className={`${card} space-y-4`} aria-label="Worked example">
      <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400">Worked example: watch first</div>
      <h3 className="text-lg md:text-xl font-black text-white">{example.title}</h3>
      <div className={lastVisual ? 'grid gap-5 lg:grid-cols-2 items-start' : ''}>
        <div className="space-y-3 text-sm md:text-base text-slate-200">
          <ul className="list-disc pl-5 space-y-1">{example.given.map((g, i) => <li key={i}>{g}</li>)}</ul>
          <p className="font-bold text-white">{example.ask}</p>
          <ol className="space-y-2">
            {example.steps.slice(0, shown).map((s, i) => (
              <li key={i} className="rounded-xl bg-surface-lowest px-3 py-2" data-worked-step={i + 1}>
                <div><span className="font-mono text-amber-400 mr-2">{i + 1}.</span>{s.text}</div>
                <div className="text-xs text-slate-400 mt-1"><em>Why: </em>{s.why}</div>
              </li>
            ))}
          </ol>
          {all ? (
            <p className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-3 py-2 text-emerald-100 text-sm"><strong>Check: </strong>{example.verify}</p>
          ) : (
            <button type="button" className={primaryBtn} onClick={() => setShown((n) => n + 1)}>Show step {shown + 1}</button>
          )}
        </div>
        {lastVisual && <VisualHost visual={lastVisual} />}
      </div>
    </section>
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

  return (
    <section className={`${card} space-y-4`} aria-label="Guided practice">
      <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400">Guided practice: we do it together</div>
      <p className="text-sm md:text-base text-white">{item.prompt}</p>
      {item.visual && <VisualHost visual={item.visual} />}
      <p className="text-xs font-mono text-slate-400">Step {Math.min(doneCount + 1, item.steps.length)} of {item.steps.length}</p>
      {item.steps.slice(0, current + 1).map((st, idx) => {
        const done = rec?.guided[st.id]?.done === true;
        const level = hintLevel[st.id] ?? 0;
        return (
          <div key={st.id} className={`rounded-xl border p-3 space-y-3 ${done ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-surface-border'}`} data-guided-step={idx + 1}>
            <p className="text-sm text-slate-300">{st.prompt}</p>
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
  );
};

// ---------------------------------------------------------------------------
// IndependentPractice: "You do". Hints and solutions are honest about help.
// ---------------------------------------------------------------------------

const IndependentCard: React.FC<{ item: IndependentItem; lessonId: string; index: number; onRefresher?: (id: string) => void }> = ({ item, lessonId, index, onRefresher }) => {
  const rec = useEducationStore((s) => s.lessons[lessonId]?.independent[item.id]);
  const submit = useEducationStore((s) => s.submitIndependent);
  const hint = useEducationStore((s) => s.recordIndependentHint);
  const reveal = useEducationStore((s) => s.revealIndependentSolution);
  const [hintLevel, setHintLevel] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const attempts = rec?.attempts ?? 0;

  return (
    <div className="rounded-xl border border-surface-border p-4 space-y-3" data-independent={item.id}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-mono text-slate-400">Problem {index + 1} · {item.topic}</span>
        {rec?.correct && (
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full border border-surface-border text-slate-300" data-testid="independent-badge">
            {rec.firstAttemptUnassisted ? 'Independent success' : 'Solved with help or retries'}
          </span>
        )}
      </div>
      <p className="text-sm text-slate-200">{item.prompt}</p>
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
  return (
    <section className={`${card} space-y-4`} aria-label="Independent practice">
      <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">Independent practice: your turn</div>
      <p className="text-sm text-slate-300">Mastery here means getting problems right on your first try without hints or solutions. Using help is fine; it is just recorded honestly.</p>
      {items.map((it, i) => <IndependentCard key={it.id} item={it} lessonId={lessonId} index={i} onRefresher={onRefresher} />)}
      {hasAssisted && (
        <button type="button" className={ghostBtn} onClick={() => retry(lessonId)} title="Clears only attempts that used help or retries; independent successes are kept">
          Retry the problems where I needed help
        </button>
      )}
    </section>
  );
};

// ---------------------------------------------------------------------------
// LearningReflection
// ---------------------------------------------------------------------------

export const LearningReflection: React.FC<{ reflection: Reflection; lessonId: string; onRefresher?: (id: string) => void }> = ({ reflection, lessonId, onRefresher }) => {
  const reflected = useEducationStore((s) => s.lessons[lessonId]?.reflected === true);
  const mark = useEducationStore((s) => s.markReflected);
  return (
    <section className={`${card} space-y-3`} aria-label="Reflect">
      <div className="text-[11px] font-mono uppercase tracking-wider text-violet-300">Reflect</div>
      <p className="text-sm md:text-base text-white"><strong>What you can now explain: </strong>{reflection.discover}</p>
      <p className="text-sm text-slate-300"><strong>What showed it: </strong>{reflection.evidence}</p>
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
  );
};
