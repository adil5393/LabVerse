/**
 * Motion Laboratory: the Free Laboratory for one-dimensional motion (PHY-1A).
 * It opens at once with an editable track: no login, gate or onboarding. The four guided
 * investigations are optional and only compare the student's predictions with the model.
 */

import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { GlobalHeader } from '../../../components/GlobalHeader';
import { comparePrediction, experimentById, MOTION_EXPERIMENTS, routeValues, type MotionExperiment, type PredictionFeedback } from '../../../engine/physics/motion/experiments';
import { MotionTrackView } from './MotionTrack';

const Prediction: React.FC<{ e: MotionExperiment; routeIndex: number; onRun: (moves: number[]) => void }> = ({ e, routeIndex, onRun }) => {
  const r = e.routes[routeIndex];
  const [dist, setDist] = useState('');
  const [disp, setDisp] = useState('');
  const [fb, setFb] = useState<(PredictionFeedback & { distanceM: number; displacementM: number }) | null>(null);
  const check = (ev: React.FormEvent) => {
    ev.preventDefault();
    const d = Number(dist.replace('−', '-')), s = Number(disp.replace('−', '-'));
    if (dist.trim() === '' || disp.trim() === '' || !Number.isFinite(d) || !Number.isFinite(s)) { setFb({ distanceRight: false, displacementRight: false, messages: ['Type a number for both predictions (use a minus sign for displacement to the left).'], distanceM: NaN, displacementM: NaN }); return; }
    const actual = routeValues(e, r);
    setFb({ ...comparePrediction(actual, { distanceM: d, displacementM: s }), ...actual });
  };
  return (
    <form onSubmit={check} className="rounded-xl border border-surface-border bg-surface-card p-3 space-y-2" data-prediction={r.id}>
      <p className="text-sm text-slate-100 font-medium">{r.label}</p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs text-slate-300 flex items-center gap-2">Predicted distance (m)
          <input value={dist} onChange={(x) => setDist(x.target.value)} inputMode="decimal" aria-label={`Predicted distance in metres for ${r.label}`} className="w-24 min-h-[44px] rounded-lg border border-surface-border bg-surface-lowest px-2 text-white font-mono" /></label>
        <label className="text-xs text-slate-300 flex items-center gap-2">Predicted displacement (m)
          <input value={disp} onChange={(x) => setDisp(x.target.value)} inputMode="decimal" aria-label={`Predicted displacement in metres for ${r.label}`} className="w-24 min-h-[44px] rounded-lg border border-surface-border bg-surface-lowest px-2 text-white font-mono" /></label>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="submit" className="min-h-[44px] px-4 rounded-lg bg-amber-500 text-slate-950 font-bold text-sm">Check my prediction</button>
        <button type="button" onClick={() => onRun(r.moves)} className="min-h-[44px] px-4 rounded-lg border border-surface-border bg-surface-elevated text-slate-100 text-sm" data-testid={`run-${r.id}`}>Run this route in the track</button>
      </div>
      {fb && (
        <div role="status" aria-live="polite" data-testid="prediction-feedback" className="text-xs text-slate-200 space-y-1">
          {Number.isFinite(fb.distanceM) && <p>Model values: distance {fb.distanceM} m, displacement {fb.displacementM} m.</p>}
          {fb.messages.map((m) => <p key={m}>{m}</p>)}
        </div>
      )}
    </form>
  );
};

export const MotionLab: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const exp = experimentById(params.get('experiment'));
  const [load, setLoad] = useState<{ moves: number[]; key: number }>({ moves: [], key: 0 });
  const range: [number, number] = exp?.range ?? [-50, 100];
  const start = exp?.start ?? 0;

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid font-sans" data-chapter="motion-lab">
      <GlobalHeader />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        <nav className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400" aria-label="Breadcrumb">
          <Link to="/" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Subject Explorer</Link><span>/</span>
          <Link to="/physics" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Physics</Link><span>/</span>
          <Link to="/physics/motion" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Describing Motion</Link><span>/</span>
          <span className="text-sky-300 font-bold">Motion Laboratory</span>
        </nav>
        <header className="space-y-2">
          <h1 className="text-3xl font-black text-white">Motion Laboratory</h1>
          <p className="text-sm text-slate-300 max-w-3xl">Move the object along a straight track. The distance travelled, the displacement and the history all come from one model of the path. This is free exploration: try anything, there is nothing to unlock.</p>
        </header>

        <section aria-label="Motion track">
          <MotionTrackView key={`${exp?.id ?? 'free'}-${load.key}`} range={range} start={start} moves={load.moves} editable playback show={['position', 'distance', 'displacement']} stepM={5} alt="A straight track from −50 m to 100 m with the reference point O at 0 m. Move the object with the buttons, the keyboard or by typing a position; the readouts give its position, the distance travelled and the displacement." />
        </section>

        <section aria-label="Guided investigations" className="space-y-3">
          <h2 className="text-xl font-black text-white">Guided investigations (optional)</h2>
          <div role="group" aria-label="Choose an investigation" className="flex flex-wrap gap-2">
            <button type="button" aria-pressed={!exp} onClick={() => { setParams({}); setLoad({ moves: [], key: load.key + 1 }); }} className={`min-h-[44px] px-4 rounded-xl border text-sm font-bold ${!exp ? 'bg-sky-600 border-sky-400 text-white' : 'bg-surface-card border-surface-border text-slate-200'}`}>Free exploration</button>
            {MOTION_EXPERIMENTS.map((x) => (
              <button key={x.id} type="button" aria-pressed={exp?.id === x.id} data-experiment={x.id} onClick={() => { setParams({ experiment: x.id }); setLoad({ moves: [], key: load.key + 1 }); }} className={`min-h-[44px] px-4 rounded-xl border text-sm font-bold ${exp?.id === x.id ? 'bg-sky-600 border-sky-400 text-white' : 'bg-surface-card border-surface-border text-slate-200'}`}>{x.id}. {x.title}</button>
            ))}
          </div>
          {exp ? (
            <div className="space-y-3" data-testid="experiment-panel">
              <h3 className="text-lg font-bold text-white">Experiment {exp.id}: {exp.title}</h3>
              <p className="text-sm text-slate-300">{exp.goal} First predict, then run the route and compare. You can then change the moves and test your own ideas.</p>
              {exp.routes.map((_r, i) => <Prediction key={`${exp.id}-${i}`} e={exp} routeIndex={i} onRun={(moves) => setLoad((l) => ({ moves, key: l.key + 1 }))} />)}
              <p className="text-sm text-slate-200 rounded-xl border border-sky-500/30 bg-sky-950/20 p-3"><strong>What to notice: </strong>{exp.lesson}</p>
              <p className="text-xs text-slate-400">These are <em>model</em> values for an idealised straight track. Real measurements with a tape and a stopwatch would carry small errors.</p>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Pick an investigation to predict first and compare with the model, or keep exploring freely.</p>
          )}
        </section>
      </main>
    </div>
  );
};
