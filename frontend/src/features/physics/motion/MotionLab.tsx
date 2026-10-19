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
import { PHYS } from './physicsColors';

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
  const ok = fb && fb.distanceRight && fb.displacementRight;
  return (
    <form onSubmit={check} className="rounded-xl border border-surface-border bg-surface-card p-3 space-y-3" data-prediction={r.id}>
      <p className="text-sm text-slate-100 font-medium">{r.label}</p>
      <div className="rounded-lg p-3 space-y-2" style={{ border: `1px solid ${PHYS.prediction}66`, background: `${PHYS.prediction}0D` }}>
        <h4 className="text-xs font-mono uppercase tracking-wider" style={{ color: PHYS.prediction }}>{'\u2605'} 1 · Prediction (before you run it)</h4>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs text-slate-200 flex items-center gap-2"><span style={{ color: PHYS.distance }}>Distance (m)</span>
            <input value={dist} onChange={(x) => setDist(x.target.value)} inputMode="decimal" aria-label={`Predicted distance in metres for ${r.label}`} className="w-24 min-h-[44px] rounded-lg border bg-surface-lowest px-2 text-white font-mono" style={{ borderColor: PHYS.prediction }} /></label>
          <label className="text-xs text-slate-200 flex items-center gap-2"><span style={{ color: PHYS.displacement }}>Displacement (m)</span>
            <input value={disp} onChange={(x) => setDisp(x.target.value)} inputMode="decimal" aria-label={`Predicted displacement in metres for ${r.label}`} className="w-24 min-h-[44px] rounded-lg border bg-surface-lowest px-2 text-white font-mono" style={{ borderColor: PHYS.prediction }} /></label>
          <button type="submit" className="min-h-[44px] px-4 rounded-lg font-bold text-sm text-slate-950" style={{ background: PHYS.prediction }}>Check my prediction</button>
        </div>
      </div>
      <div className="rounded-lg p-3 space-y-2" style={{ border: `1px solid ${PHYS.position}66`, background: `${PHYS.position}0D` }}>
        <h4 className="text-xs font-mono uppercase tracking-wider" style={{ color: PHYS.position }}>{'\u25B6'} 2 · Action</h4>
        <button type="button" onClick={() => onRun(r.moves)} className="min-h-[44px] px-4 rounded-lg font-bold text-sm text-slate-950" style={{ background: PHYS.position }} data-testid={`run-${r.id}`}>Run this route in the track</button>
      </div>
      {fb && (
        <div role="status" aria-live="polite" data-testid="prediction-feedback" className="rounded-lg p-3 text-xs text-slate-100 space-y-1" style={{ border: `1px solid ${ok ? PHYS.correct : PHYS.error}`, background: `${ok ? PHYS.correct : PHYS.error}14` }}>
          <h4 className="text-xs font-mono uppercase tracking-wider" style={{ color: ok ? PHYS.correct : PHYS.error }}>{ok ? '\u2713 3 · Observation: matches the model' : '\u2717 3 · Observation: differs from the model'}</h4>
          {Number.isFinite(fb.distanceM) && <p>Model values: <span style={{ color: PHYS.distance }}>distance {fb.distanceM} m</span>, <span style={{ color: PHYS.displacement }}>displacement {fb.displacementM} m</span>.</p>}
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
            <button type="button" aria-pressed={!exp} onClick={() => { setParams({}); setLoad({ moves: [], key: load.key + 1 }); }} className={`min-h-[44px] px-4 rounded-xl border-2 text-sm font-bold ${!exp ? 'bg-surface-elevated text-white' : 'bg-surface-card border-surface-border text-slate-300'}`} style={!exp ? { borderColor: PHYS.position } : undefined}>{!exp ? '\u2713 ' : ''}Free exploration</button>
            {MOTION_EXPERIMENTS.map((x) => (
              <button key={x.id} type="button" aria-pressed={exp?.id === x.id} data-experiment={x.id} onClick={() => { setParams({ experiment: x.id }); setLoad({ moves: [], key: load.key + 1 }); }} className={`min-h-[44px] px-4 rounded-xl border-2 text-sm font-bold ${exp?.id === x.id ? 'bg-surface-elevated text-white' : 'bg-surface-card border-surface-border text-slate-300'}`} style={exp?.id === x.id ? { borderColor: PHYS.prediction } : undefined}>{exp?.id === x.id ? '\u2713 ' : ''}{x.id}. {x.title}</button>
            ))}
          </div>
          {exp ? (
            <div className="space-y-3" data-testid="experiment-panel">
              <div className="rounded-xl border border-surface-border bg-surface-card p-3 space-y-1" style={{ borderLeft: `4px solid ${PHYS.time}` }}>
                <h3 className="text-lg font-bold text-white">Experiment {exp.id}: {exp.title}</h3>
                <p className="text-xs font-mono uppercase tracking-wider" style={{ color: PHYS.time }}>Instructions</p>
                <p className="text-sm text-slate-300">{exp.goal} First predict, then run the route and compare. You can then change the moves and test your own ideas.</p>
              </div>
              {exp.routes.map((_r, i) => <Prediction key={`${exp.id}-${i}`} e={exp} routeIndex={i} onRun={(moves) => setLoad((l) => ({ moves, key: l.key + 1 }))} />)}
              <p className="text-sm text-slate-200 rounded-xl border p-3" style={{ borderColor: `${PHYS.correct}80`, background: `${PHYS.correct}0D` }}><strong style={{ color: PHYS.correct }}>{"\u2713 "}What to notice: </strong>{exp.lesson}</p>
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
