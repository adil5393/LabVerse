/**
 * Shared lesson interactions added for the unified framework (subject-neutral):
 *
 * - `PredictionCard`: commit to a prediction before the explanation is revealed (never scored).
 * - `ProofList`: a deductive argument, one claim and reason per line; a line with `reasonChoices` asks the student to supply
 *   the reason first (recorded as a quick check, so it is reasoning evidence, not mastery by itself).
 * - `LabTaskCard`: a guided investigation in a real laboratory. Goals are met by events the laboratory reports, never by a
 *   button here; the card shows which goals are met and the observations the laboratory recorded.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { LabTask, PredictionPrompt, ProofStep } from '../../engine/education/types';
import { labTaskComplete, labTaskGoals } from '../../engine/education/progress';
import { useEducationStore } from '../../store/useEducationStore';
import { Nar } from '../narration/NarrationRegion';
import { nid } from '../../engine/narration/segments';
import { labTaskHref } from './labTaskLinks';

const choiceBtn = 'w-full text-left min-h-[48px] rounded-xl border px-3 py-2 text-sm';

export const PredictionCard: React.FC<{ lessonId?: string; prediction: PredictionPrompt; onCommitted?: () => void }> = ({ lessonId, prediction, onCommitted }) => {
  const committed = useEducationStore((s) => (lessonId ? s.lessons[lessonId]?.predictions?.[prediction.id] : undefined));
  const record = useEducationStore((s) => s.recordPrediction);
  const [local, setLocal] = useState<string | null>(null);
  const chosen = committed?.choiceId ?? local;
  const [pick, setPick] = useState<string | null>(null);
  const done = chosen != null;
  if (prediction.numeric) return <NumericPrediction lessonId={lessonId} prediction={prediction} chosen={chosen} onCommit={(v) => { setLocal(v); if (lessonId) record(lessonId, prediction.id, v); onCommitted?.(); }} />;
  return (
    <section className="rounded-xl border border-violet-500/40 bg-violet-950/20 p-4 space-y-3" data-prediction={prediction.id} data-committed={done ? 'true' : 'false'}>
      <div className="text-[11px] font-mono uppercase tracking-wider text-violet-300">Predict first</div>
      <p className="text-sm md:text-base text-white font-semibold">{prediction.prompt}</p>
      <div className="grid gap-2" role="radiogroup" aria-label="Your prediction">
        {prediction.options.map((o) => (
          <button key={o.id} type="button" role="radio" aria-checked={(chosen ?? pick) === o.id} disabled={done}
            data-prediction-option={o.id} onClick={() => setPick(o.id)}
            className={`${choiceBtn} ${(chosen ?? pick) === o.id ? 'border-violet-400 bg-violet-900/40 text-white' : 'border-surface-border bg-surface-lowest text-slate-200 hover:border-slate-400'}`}>
            {o.text}
          </button>
        ))}
      </div>
      {!done ? (
        <button type="button" disabled={!pick} className="min-h-[48px] px-5 rounded-xl bg-violet-500 text-white font-bold text-sm disabled:opacity-40"
          onClick={() => { if (!pick) return; setLocal(pick); if (lessonId) record(lessonId, prediction.id, pick); onCommitted?.(); }}>
          Lock in my prediction
        </button>
      ) : (
        <p className="text-sm text-violet-100" data-testid="prediction-reveal">
          <strong>You predicted: </strong>{prediction.options.find((o) => o.id === chosen)?.text}. {prediction.reveal}
          {prediction.expectedId && <span className="block mt-1 text-slate-300">{prediction.expectedId === chosen ? 'Your prediction matches what the investigation shows.' : 'Compare your prediction with what the investigation shows; a surprise is worth thinking about.'}</span>}
        </p>
      )}
    </section>
  );
};

const NumericPrediction: React.FC<{ lessonId?: string; prediction: PredictionPrompt; chosen: string | null; onCommit: (value: string) => void }> = ({ prediction, chosen, onCommit }) => {
  const [text, setText] = useState('');
  const n = prediction.numeric!;
  const value = chosen != null ? Number(chosen) : NaN;
  const close = n.answer !== undefined && n.closeWithin !== undefined && Number.isFinite(value) ? Math.abs(value - n.answer) <= n.closeWithin : undefined;
  return (
    <section className="rounded-xl border border-violet-500/40 bg-violet-950/20 p-4 space-y-3" data-prediction={prediction.id} data-committed={chosen != null ? 'true' : 'false'}>
      <div className="text-[11px] font-mono uppercase tracking-wider text-violet-300">Predict first</div>
      <p className="text-sm md:text-base text-white font-semibold">{prediction.prompt}</p>
      {chosen == null ? (
        <form className="flex flex-wrap items-center gap-2" onSubmit={(e) => { e.preventDefault(); const v = Number(text.trim()); if (text.trim() !== '' && Number.isFinite(v)) onCommit(String(v)); }}>
          <label className="sr-only" htmlFor={`pred-${prediction.id}`}>Your prediction</label>
          <input id={`pred-${prediction.id}`} inputMode="decimal" value={text} onChange={(e) => setText(e.target.value)} className="w-32 min-h-[48px] px-3 rounded-xl bg-surface-lowest border border-surface-border text-white font-mono" />
          {n.unit && <span className="text-sm text-slate-300">{n.unit}</span>}
          <button type="submit" disabled={text.trim() === '' || !Number.isFinite(Number(text.trim()))} className="min-h-[48px] px-5 rounded-xl bg-violet-500 text-white font-bold text-sm disabled:opacity-40">Lock in my prediction</button>
        </form>
      ) : (
        <p className="text-sm text-violet-100" data-testid="prediction-reveal">
          <strong>You predicted: </strong>{chosen}{n.unit ? ` ${n.unit}` : ''}. {prediction.reveal}
          {close !== undefined && <span className="block mt-1 text-slate-300">{close ? 'Your prediction was close to what the investigation shows.' : 'Compare your prediction with what the investigation shows; a surprise is worth thinking about.'}</span>}
        </p>
      )}
    </section>
  );
};

export const ProofList: React.FC<{ stepId: string; proof: ProofStep[]; active: number; onSelect: (i: number) => void; lessonId?: string }> = ({ stepId, proof, active, onSelect, lessonId }) => {
  const recordCheck = useEducationStore((s) => s.recordCheck);
  const checks = useEducationStore((s) => (lessonId ? s.lessons[lessonId]?.checks : undefined));
  const [answered, setAnswered] = useState<Record<number, string>>({});
  return (
    <ol className="space-y-2" aria-label="Proof, one claim and reason per line">
      {proof.map((ps, i) => {
        const checkId = `${stepId}:proof${i}`;
        const needsReason = Boolean(ps.reasonChoices?.length);
        const picked = answered[i];
        const solved = !needsReason || checks?.[checkId] === true || picked === ps.reason;
        return (
          <Nar as="li" key={i} id={nid.proof(stepId, i)}>
            <button type="button" aria-current={active === i} data-proof-step={i + 1} onClick={() => onSelect(i)}
              className={`w-full text-left min-h-[48px] rounded-xl border px-3 py-2 ${active === i ? 'border-emerald-400 bg-emerald-950/30' : 'border-surface-border bg-surface-lowest hover:border-slate-500'}`}>
              <span className="font-mono text-emerald-300 mr-2">{i + 1}.</span><span className="text-white">{ps.claim}</span>
              {solved && <span className="block text-xs text-slate-400 mt-1"><em>Because: </em>{ps.reason}</span>}
            </button>
            {!solved && (
              <div className="mt-2 ml-2 space-y-1.5" role="group" aria-label={`Choose the reason for step ${i + 1}`} data-proof-reasons={i + 1}>
                <p className="text-xs text-amber-200">Which reason justifies this step?</p>
                {ps.reasonChoices!.map((r) => (
                  <button key={r} type="button" className={`${choiceBtn} ${picked === r ? 'border-red-400 bg-red-950/30 text-red-100' : 'border-surface-border bg-surface-lowest text-slate-200 hover:border-slate-400'}`}
                    onClick={() => { setAnswered((m) => ({ ...m, [i]: r })); if (lessonId) recordCheck(lessonId, checkId, r === ps.reason); }}>
                    {r}
                  </button>
                ))}
                {picked && picked !== ps.reason && <p className="text-xs text-red-200" role="status">That reason does not justify this claim. Look at what the previous lines already established.</p>}
              </div>
            )}
          </Nar>
        );
      })}
    </ol>
  );
};

export const LabTaskCard: React.FC<{ task: LabTask; lessonId: string; backHref: string }> = ({ task, lessonId, backHref }) => {
  const rec = useEducationStore((s) => s.lessons[lessonId]?.labTasks?.[task.id]);
  const goals = labTaskGoals(task, rec);
  const complete = labTaskComplete(task, rec);
  const predicted = useEducationStore((s) => (task.prediction ? Boolean(s.lessons[lessonId]?.predictions?.[task.prediction.id]) : true));
  return (
    <section className="rounded-2xl border border-cyan-500/40 bg-cyan-950/20 p-4 space-y-3" data-lab-task={task.id} data-complete={complete ? 'true' : 'false'}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-bold text-white">{task.title}</h3>
        {task.requiredForMastery && <span className="text-[11px] font-mono px-2 py-0.5 rounded-full border border-cyan-500/40 text-cyan-200">Part of this lesson</span>}
      </div>
      <p className="text-sm text-slate-200">{task.instruction}</p>
      <ul className="space-y-1 text-sm" aria-label="Investigation goals">
        {goals.map((g) => (
          <li key={g.id} data-goal={g.id} data-met={g.met ? 'true' : 'false'} className={g.met ? 'text-emerald-200' : 'text-slate-300'}>
            <span aria-hidden>{g.met ? '✓' : '○'} </span>{g.label}<span className="sr-only">{g.met ? ' (done)' : ' (not yet)'}</span>
          </li>
        ))}
      </ul>
      {rec && rec.observations.length > 0 && (
        <div className="rounded-xl border border-surface-border bg-surface-lowest p-3 space-y-1" data-testid="lab-observations">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Your observations</div>
          <ul className="text-sm text-slate-200 space-y-0.5">
            {rec.observations.map((o) => <li key={o.id}><strong className="text-white">{o.label}:</strong> {o.value}{o.note ? ` — ${o.note}` : ''}</li>)}
          </ul>
        </div>
      )}
      {complete && task.expectedPattern && <p className="text-sm text-emerald-100" data-testid="lab-pattern"><strong>What the investigation shows: </strong>{task.expectedPattern}</p>}
      {rec?.demonstrated && <p className="text-xs text-violet-200">Part of this was done in teacher demonstration mode, so it is a demonstration, not your own investigation.</p>}
      {task.prediction && <PredictionCard lessonId={lessonId} prediction={task.prediction} />}
      {predicted && <Link to={labTaskHref(task, lessonId, backHref)} className="min-h-[48px] px-5 rounded-xl border border-cyan-400 text-cyan-100 font-bold text-sm hover:bg-cyan-500/10 inline-flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px]" aria-hidden>science</span>{complete ? 'Open the laboratory again' : 'Start the investigation'}
      </Link>}
    </section>
  );
};
