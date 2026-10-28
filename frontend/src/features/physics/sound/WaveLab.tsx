/**
 * Wave Laboratory (SND-1; NCERT Sections 10.3 to 10.5, Activity 10.5, Figs. 10.9, 10.12, 10.16): a longitudinal sound wave in a tube.
 * One particle is marked and one compression is followed so that the difference between "the particle vibrates in place" and
 * "the pattern travels" is something the student SEES. A density graph (against distance, or against time at the marked place) is
 * drawn from the same model at the same instant. One physical state; the presentation (camera, particle rows, label size, layout)
 * comes from the viewport profile.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { computeWave, DEFAULT_WAVE, describeWave, displacement, physicalTime, WAVE_LIMITS, type WaveSetup } from '../../../engine/physics/sound/wave';
import { useAudioSettings } from '../../../engine/audio/settings';
import { useTone } from '../../audio/useTone';
import { btn, btnPrimary, RangeField, SoundSwitch, TransportBar } from './SoundControls';
import { DensityGraph, followedCompression, markedRestPosition, WaveScene, type GraphMode } from './WaveViews';
import { useContainerPresentation } from './soundViewport';
import { useSoundClock } from './useSoundClock';

const f1 = (n: number) => String(Math.round(n * 10) / 10);
const f2 = (n: number) => String(Math.round(n * 100) / 100);

export interface WavePanelProps {
  initialSetup?: Partial<WaveSetup>;
  /** Start at this picture time (seconds). */
  initialT?: number;
  initialGraph?: boolean;
  initialMark?: boolean;
  /** 'lab': every control; 'basic': frequency, amplitude and the transport (lessons); 'none': the picture only. */
  controls?: 'lab' | 'basic' | 'none';
  stickyCanvas?: boolean;
}

export const WavePanel: React.FC<WavePanelProps> = ({ initialSetup, initialT, initialGraph = true, initialMark = true, controls = 'lab', stickyCanvas = false }) => {
  const { ref, pres, twoColumn } = useContainerPresentation();
  const mobile = pres.profile === 'mobile';
  const [setup, setSetup] = useState<WaveSetup>({ ...DEFAULT_WAVE, ...initialSetup });
  const [mode, setMode] = useState<GraphMode>('distance');
  const [showGraph, setShowGraph] = useState(initialGraph);
  const [mark, setMark] = useState(initialMark);
  const wave = useMemo(() => computeWave(setup), [setup]);
  const soundOn = useAudioSettings((s) => s.soundOn);
  const volume = useAudioSettings((s) => s.volume);
  const { engine, snapshot } = useTone();
  /** Loudness follows the density change (the amplitude slider); 0 is silence. */
  const toneAmp = setup.densityAmp / WAVE_LIMITS.densityAmp[1];
  const hearing = snapshot.playing;
  const hear = () => {
    if (hearing) { engine.stop('Tone stopped.'); return; }
    if (wave.valid) engine.startTone({ hz: setup.frequencyHz, amplitude: toneAmp, volume });
  };
  // Keep a playing tone in step with the sliders: same frequency and loudness as the wave on the screen.
  useEffect(() => { if (hearing) engine.setFrequency(setup.frequencyHz); }, [setup.frequencyHz]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (hearing) engine.setAmplitude(toneAmp, volume); }, [toneAmp, volume]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!soundOn) engine.stop(null); }, [soundOn, engine]);
  const periodVisual = wave.valid ? wave.slow / wave.frequencyHz : 5;
  const duration = Math.min(120, Math.max(12, Math.ceil(3 * periodVisual)));
  const clock = useSoundClock(duration);
  useEffect(() => { if (initialT !== undefined) clock.seek(initialT); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const tPhys = wave.valid ? physicalTime(wave, clock.t) : 0;
  const m0 = markedRestPosition(pres.wave);
  const marked = wave.valid ? displacement(wave, m0, tPhys) : 0;
  const followed = wave.valid ? followedCompression(wave, tPhys, pres.wave) : null;

  const change = (apply: (s: WaveSetup) => WaveSetup, resetsTime: boolean) => { setSetup(apply); if (resetsTime) clock.seek(0); };
  const alt = describeWave(wave);
  const timeLabel = `${f1(clock.t)} s of picture time (${f1(tPhys * 1000)} ms real)`;

  const canvas = (
    <div className={stickyCanvas && mobile ? 'sticky top-0 z-10 bg-background/95 backdrop-blur pb-2' : ''} data-testid="wave-canvas">
      <WaveScene wave={wave} tPhys={tPhys} presentation={pres.wave} mark={mark} alt={alt} />
      <details open={!mobile} className="text-[13px] text-slate-400 mt-1"><summary className="min-h-[44px] py-3 cursor-pointer">Picture speed and scale</summary><p data-testid="idealised-note">
        Idealised and exaggerated: the picture is shown <strong className="text-slate-200">{wave.slow} times slower</strong> than real, and the crowding and the movement of the particles are enlarged so that you can see them (in real air the change of density is about one part in a billion).
      </p></details>
      <p className="text-[13px] text-slate-300" data-testid="cr-legend"><span className="text-orange-400 font-bold">C</span> compression · <span className="text-violet-400 font-bold">R</span> rarefaction · brighter blue strip = denser air.</p>
    </div>
  );

  const graph = showGraph && (
    <div className="space-y-1" data-testid="wave-graph">
      <DensityGraph wave={wave} tPhys={tPhys} presentation={pres.wave} mode={mode} alt={`Graph of density against ${mode === 'distance' ? 'distance along the tube' : 'time at the marked particle’s place'}. The curve rises above the dashed average line in compressions (crests) and falls below it in rarefactions (troughs).`} />
    </div>
  );

  const sliders = controls === 'none' ? null : (
    <div className="space-y-3" data-testid="wave-controls">
      <RangeField id="wave-freq" label="Frequency ν (nu)" unit="Hz" value={setup.frequencyHz} min={WAVE_LIMITS.frequencyHz[0]} max={WAVE_LIMITS.frequencyHz[1]} step={10} onChange={(v) => change((s) => ({ ...s, frequencyHz: v }), true)} hint="At the same speed, a higher frequency gives a shorter wavelength." />
      <RangeField id="wave-amp" label="Amplitude (density change)" value={setup.densityAmp} min={WAVE_LIMITS.densityAmp[0]} max={WAVE_LIMITS.densityAmp[1]} step={0.05} format={(v) => f2(v)} onChange={(v) => change((s) => ({ ...s, densityAmp: v }), false)} hint="A bigger amplitude crowds the compressions more and carries more energy; the wavelength does not change." />
      <SoundSwitch hz={wave.valid ? setup.frequencyHz : undefined} onHint="Press Hear this wave for a tone at the wave's real frequency. Moving the sliders changes the pitch and loudness as you listen. It stops by itself after 20 seconds." />
      {soundOn && (
        <button type="button" className={`${hearing ? btn : btnPrimary} w-full`} onClick={hear} disabled={!wave.valid} data-action="hear-wave">
          <span className="material-symbols-outlined text-[20px]" aria-hidden>{hearing ? 'stop' : 'volume_up'}</span>{hearing ? 'Stop the tone' : `Hear this wave (${setup.frequencyHz} Hz)`}
        </button>
      )}
      {controls === 'lab' && (
        <>
          <div className="space-y-1" role="group" aria-label="How much slower than real time">
            <div className="text-sm font-bold text-slate-200">Slow motion</div>
            <div className="flex gap-2">
              {[200, 500, 1000, 2000].map((s) => (
                <button key={s} type="button" aria-pressed={setup.slow === s} onClick={() => change((x) => ({ ...x, slow: s }), true)} className={`flex-1 min-h-[44px] rounded-xl border text-sm font-bold touch-manipulation ${setup.slow === s ? 'border-amber-400 bg-amber-500/15 text-white' : 'border-surface-border bg-surface-card text-slate-300'}`}>×{s}</button>
              ))}
            </div>
            <p className="text-xs text-slate-400">The wave is shown this many times slower than real. Only the picture slows down; the wave itself does not change.</p>
          </div>
          <div className="space-y-1" role="group" aria-label="Graph shows">
            <div className="text-sm font-bold text-slate-200">Graph shows</div>
            <div className="flex gap-2">
              {([['distance', 'Density against distance'], ['time', 'Density against time']] as const).map(([m, label]) => (
                <button key={m} type="button" aria-pressed={showGraph && mode === m} data-graph-mode={m} onClick={() => { setShowGraph(true); setMode(m); }} className={`flex-1 min-h-[44px] rounded-xl border text-xs sm:text-sm font-bold touch-manipulation px-2 ${showGraph && mode === m ? 'border-amber-400 bg-amber-500/15 text-white' : 'border-surface-border bg-surface-card text-slate-300'}`}>{label}</button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-3 min-h-[44px] text-sm text-slate-200 cursor-pointer"><input type="checkbox" className="w-5 h-5 accent-amber-500" checked={mark} onChange={(e) => setMark(e.target.checked)} data-testid="mark-toggle" /> Mark one particle and follow one compression</label>
          <button type="button" className={btn} onClick={() => { engine.stop(null); setSetup({ ...DEFAULT_WAVE }); clock.reset(); }} data-action="defaults">Back to the starting wave</button>
        </>
      )}
    </div>
  );

  const readouts = (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm" data-testid="wave-readouts">
      <dt className="text-slate-400">Frequency ν (nu)</dt><dd className="font-mono text-amber-300" data-testid="readout-nu">{wave.valid ? `${f1(wave.frequencyHz)} Hz` : '—'}</dd>
      <dt className="text-slate-400">Time period T</dt><dd className="font-mono text-amber-300" data-testid="readout-T">{wave.valid ? `${f1(wave.period * 1000)} ms` : '—'}</dd>
      <dt className="text-slate-400">Wavelength λ</dt><dd className="font-mono text-amber-300" data-testid="readout-lambda">{wave.valid ? `${f2(wave.lambda)} m` : '—'}</dd>
      <dt className="text-slate-400">Speed v</dt><dd className="font-mono text-amber-300" data-testid="readout-v">{wave.valid ? `${f1(wave.speed)} m/s (air)` : '—'}</dd>
      <dt className="text-slate-400">Picture speed</dt><dd className="font-mono text-amber-300" data-testid="readout-slow">{wave.slow}× slower</dd>
      {mark && <><dt className="text-slate-400">Marked particle</dt><dd className="font-mono text-amber-300" data-testid="readout-marked">{f1(marked * 100)} cm from its rest position</dd>
        <dt className="text-slate-400">Followed compression</dt><dd className="font-mono text-amber-300" data-testid="readout-followed">{followed === null ? '—' : `at ${f2(followed)} m`}</dd></>}
    </dl>
  );

  const assumptions = (
    <ul className="list-disc pl-5 space-y-1 text-[13px] text-slate-300" data-testid="wave-assumptions">
      <li>A simple sine wave in a tube of air, moving to the right at {f1(setup.speed)} m/s (the book&apos;s value for air); v = ν × λ.</li>
      <li>Each particle only moves to and fro about its own rest position, by at most A = (density change) ÷ k, with k = 2π ÷ λ. The movement is enlarged.</li>
      <li>The particles at the middle of a compression and of a rarefaction are, for that instant, at their rest positions: the movement is a quarter of a cycle out of step with the density.</li>
      <li>No damping and no reflection. Real sound waves are far weaker and more complicated.</li>
    </ul>
  );

  const stepSize = wave.valid ? periodVisual / 8 : 0.5;
  const transport = controls === 'none' ? null : (
    <TransportBar playing={clock.playing} t={clock.t} duration={duration} reduced={clock.reduced} blocked={clock.blocked} onToggle={clock.toggle} onReplay={clock.replay} onReset={() => { engine.stop(null); clock.reset(); }} onScrub={clock.scrub} timeLabel={timeLabel} stepSize={stepSize} />
  );

  return (
    <div ref={ref} className={`grid gap-4 ${twoColumn ? 'grid-cols-[minmax(0,1fr)_minmax(0,22rem)]' : ''}`} data-testid="wave-panel" data-profile={pres.profile}>
      <div className="space-y-3 min-w-0">
        {canvas}
        {transport}
        {mobile && graph ? <details className="rounded-xl border border-surface-border"><summary className="min-h-[44px] py-3 px-3 text-sm font-semibold cursor-pointer">Density graph</summary>{graph}</details> : graph}
        {!wave.valid && <p role="alert" className="text-sm text-rose-300" data-testid="wave-problem">{wave.reason}</p>}
        {mobile && controls !== 'none' && <details className="rounded-xl border border-surface-border bg-surface-card p-3"><summary className="min-h-[44px] flex items-center font-bold text-sm text-slate-200 cursor-pointer">Measurements</summary><div className="pt-2">{readouts}</div></details>}
      </div>
      {controls !== 'none' && (
        <div className="space-y-3 min-w-0">
          {sliders}
          {!mobile && <div className="rounded-xl border border-surface-border bg-surface-card p-3">{readouts}</div>}
          {controls === 'lab' && (mobile ? <details className="rounded-xl border border-surface-border bg-surface-card p-3"><summary className="min-h-[44px] flex items-center font-bold text-sm text-slate-200 cursor-pointer">What is simplified?</summary><div className="pt-2">{assumptions}</div></details> : <div className="rounded-xl border border-surface-border bg-surface-card p-3 space-y-1"><h3 className="text-sm font-bold text-white">What is simplified?</h3>{assumptions}</div>)}
        </div>
      )}
    </div>
  );
};
