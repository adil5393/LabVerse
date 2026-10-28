/**
 * Vibration Laboratory (SND-1; NCERT Sections 10.1 and 10.1.1, Activities 10.1 and 10.2): a plucked rubber band on a box and a
 * struck tuning fork. Shows that sound is made exactly while the object vibrates, with the frequency, the period, the cycles
 * counted and a loudness graph as the picture of the sound. Optional synthesised sound (off by default, only from a button press).
 * The same component serves the laboratory page and the lessons; only the presentation differs (see soundViewport.ts).
 */

import React, { useEffect, useMemo, useState } from 'react';
import { computeFork, computeString, cyclesAt, describeVibration, amplitudeAt, DEFAULT_STRING, FORK_PRESETS, isVibrating, REST_AMPLITUDE, STRING_LIMITS, type StringSetup } from '../../../engine/physics/sound/vibration';
import { useAudioSettings } from '../../../engine/audio/settings';
import { useTone } from '../../audio/useTone';
import { EnvelopeGraph, SLOW_VIBRATION, VibrationScene } from './VibrationViews';
import { btn, btnPrimary, RangeField, SoundSwitch, TransportBar } from './SoundControls';
import { useContainerPresentation } from './soundViewport';
import { useSoundClock } from './useSoundClock';

const f1 = (n: number) => String(Math.round(n * 10) / 10);
const f2 = (n: number) => String(Math.round(n * 100) / 100);

export interface VibrationPanelProps {
  initialKind?: 'string' | 'fork';
  initialHz?: number;
  initialString?: Partial<StringSetup>;
  initialStrike?: number;
  /** Start in the state `t` seconds after a strike (a lesson snapshot). */
  initialT?: number;
  /** Show the controls (the laboratory and editable lesson visuals) or only the picture. */
  editable?: boolean;
  /** Keep the picture in view on small screens while the controls scroll (the laboratory page). */
  stickyCanvas?: boolean;
}

export const VibrationPanel: React.FC<VibrationPanelProps> = ({ initialKind = 'string', initialHz = 256, initialString, initialStrike = 0.8, initialT, editable = true, stickyCanvas = false }) => {
  const { ref, pres, twoColumn } = useContainerPresentation();
  const mobile = pres.profile === 'mobile';
  const [kind, setKind] = useState<'string' | 'fork'>(initialKind);
  const [hz, setHz] = useState<number>(initialHz);
  const [str, setStr] = useState<StringSetup>({ ...DEFAULT_STRING, ...initialString, strike: initialStrike });
  const [forkStrike, setForkStrike] = useState(initialKind === 'fork' ? initialStrike : 1);
  const [struck, setStruck] = useState(initialT !== undefined);
  const soundOn = useAudioSettings((s) => s.soundOn);
  const volume = useAudioSettings((s) => s.volume);
  const { engine, snapshot } = useTone();

  const vib = useMemo(() => (kind === 'string' ? computeString(str) : computeFork({ hz, strike: forkStrike })), [kind, str, hz, forkStrike]);
  const duration = vib.valid ? Math.max(3, Math.ceil(vib.restAfterS + 1)) : 3;
  const clock = useSoundClock(duration, { runWhenReduced: true });
  useEffect(() => { if (initialT !== undefined) clock.seek(initialT); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const animate = !clock.reduced;

  const vibrating = struck && vib.valid && isVibrating(vib, clock.t);
  const status = !struck ? 'At rest: no vibration, so no sound. Press Pluck to start.' : vibrating ? `Vibrating ${f1(vib.hz)} times every second: sound is being produced.` : 'The vibration has died away, so the sound has stopped.';

  const stopSound = (why: string | null) => engine.stop(why);
  const newSetup = (apply: () => void) => { stopSound(null); setStruck(false); clock.reset(); apply(); };
  const pluck = () => {
    if (!vib.valid) return;
    setStruck(true);
    clock.replay();
    if (soundOn && vib.strike > REST_AMPLITUDE) engine.startTone({ hz: vib.hz, amplitude: vib.strike, decayTau: vib.tau, volume, stopAfterS: vib.restAfterS });
  };
  const onToggle = () => {
    if (clock.playing) { clock.pause(); stopSound('The sound stops when you pause. Press Pluck again to hear it.'); }
    else if (struck && !clock.atEnd) clock.play();
    else pluck();
  };
  const onReset = () => { stopSound(null); setStruck(false); clock.reset(); };
  const onScrub = (t: number) => { setStruck(true); clock.scrub(t); stopSound('The sound stops when you move through time yourself.'); };
  const timeLabel = `${f1(clock.t)} s after the strike (real time)`;
  const alt = describeVibration(vib, 0);

  const scene = (
    <div className={stickyCanvas && mobile ? 'sticky top-0 z-10 bg-background/95 backdrop-blur pb-2' : ''} data-testid="vibration-canvas">
      <VibrationScene vib={vib} tS={clock.t} struck={struck} animate={animate} lengthCm={str.lengthCm} thickness={str.thickness} presentation={pres.vib} alt={alt} />
      <details open={!mobile} className="text-[13px] text-slate-400 mt-1"><summary className="min-h-[44px] py-3 cursor-pointer">Picture speed and scale</summary><p data-testid="slow-note">The wiggle is drawn {SLOW_VIBRATION} times slower than real so that you can see it. The size of the vibration, the loudness bar and the graph below run in real time. The size of the swing is a drawing scale, not a length.</p></details>
    </div>
  );

  const readouts = (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm" data-testid="vibration-readouts">
      <dt className="text-slate-400">Frequency ν (nu)</dt><dd className="font-mono text-amber-300" data-testid="readout-hz">{vib.valid ? `${f1(vib.hz)} Hz` : '—'}</dd>
      <dt className="text-slate-400">Time period T</dt><dd className="font-mono text-amber-300" data-testid="readout-period">{vib.valid ? `${f2(vib.periodS * 1000)} ms` : '—'}</dd>
      <dt className="text-slate-400">Cycles so far</dt><dd className="font-mono text-amber-300" data-testid="readout-cycles">{struck && vib.valid ? cyclesAt(vib, clock.t).toLocaleString('en-US') : '0'}</dd>
      <dt className="text-slate-400">Size of vibration</dt><dd className="font-mono text-amber-300" data-testid="readout-size">{struck && vib.valid ? `${Math.round(amplitudeAt(vib, clock.t) * 100)} %` : '0 %'}</dd>
      <dt className="text-slate-400">Making sound?</dt><dd className="font-mono text-amber-300" data-testid="readout-sound">{vibrating ? 'yes' : 'no'}</dd>
    </dl>
  );

  const controls = !editable ? null : (
    <div className="space-y-3" data-testid="vibration-controls">
      <div role="group" aria-label="Choose what vibrates" className="flex gap-2">
        {(['string', 'fork'] as const).map((k) => (
          <button key={k} type="button" aria-pressed={kind === k} data-kind={k} onClick={() => newSetup(() => setKind(k))}
            className={`flex-1 min-h-[44px] rounded-xl border text-sm font-bold touch-manipulation ${kind === k ? 'border-amber-400 bg-amber-500/15 text-white' : 'border-surface-border bg-surface-card text-slate-300'}`}>
            {k === 'string' ? 'Rubber band' : 'Tuning fork'}
          </button>
        ))}
      </div>
      <SoundSwitch hz={vib.valid ? vib.hz : undefined} />
      <button type="button" className={`${btnPrimary} w-full`} onClick={pluck} disabled={!vib.valid || vib.strike <= 0} data-action="pluck">
        <span className="material-symbols-outlined text-[20px]" aria-hidden>{kind === 'string' ? 'touch_app' : 'campaign'}</span>{kind === 'string' ? 'Pluck the band' : 'Strike the fork'}
      </button>
      <ActivityDetails title="Change the instrument">{kind === 'string' ? (
        <>
          <RangeField id="vib-tension" label="Tension" value={str.tension} min={STRING_LIMITS.tension[0]} max={STRING_LIMITS.tension[1]} step={0.01} unit="× start" format={(v) => f2(v)} onChange={(v) => newSetup(() => setStr((s) => ({ ...s, tension: v })))} hint="More tension: more cycles every second." />
          <RangeField id="vib-length" label="Length" value={str.lengthCm} min={STRING_LIMITS.lengthCm[0]} max={STRING_LIMITS.lengthCm[1]} step={1} unit="cm" onChange={(v) => newSetup(() => setStr((s) => ({ ...s, lengthCm: v })))} hint="A longer band vibrates more slowly." />
          <RangeField id="vib-thickness" label="Thickness" value={str.thickness} min={STRING_LIMITS.thickness[0]} max={STRING_LIMITS.thickness[1]} step={0.01} unit="× start" format={(v) => f2(v)} onChange={(v) => newSetup(() => setStr((s) => ({ ...s, thickness: v })))} hint="A thicker band vibrates more slowly." />
          <RangeField id="vib-strike" label="Pluck strength" value={str.strike} min={0} max={1} step={0.05} onChange={(v) => newSetup(() => setStr((s) => ({ ...s, strike: v })))} format={(v) => `${Math.round(v * 100)} %`} hint="Harder: a bigger vibration and a louder sound, but the same frequency." />
        </>
      ) : (
        <>
          <div role="group" aria-label="Choose a tuning fork" className="flex gap-2">
            {FORK_PRESETS.map((h) => (
              <button key={h} type="button" aria-pressed={hz === h} onClick={() => newSetup(() => setHz(h))} className={`flex-1 min-h-[44px] rounded-xl border text-sm font-bold touch-manipulation ${hz === h ? 'border-amber-400 bg-amber-500/15 text-white' : 'border-surface-border bg-surface-card text-slate-300'}`}>{h} Hz</button>
            ))}
          </div>
          <RangeField id="vib-fork-strike" label="Strike strength" value={forkStrike} min={0} max={1} step={0.05} onChange={(v) => newSetup(() => setForkStrike(v))} format={(v) => `${Math.round(v * 100)} %`} hint="Harder: a bigger vibration and a louder note, but still the same number of cycles every second." />
        </>
      )}</ActivityDetails>
      <TransportBar playing={clock.playing} t={clock.t} duration={duration} reduced={clock.reduced} blocked={false} onToggle={onToggle} onReplay={pluck} onReset={onReset} onScrub={onScrub} timeLabel={timeLabel} playLabel={struck && !clock.atEnd ? 'Play' : 'Pluck'} />
      <button type="button" className={btn} onClick={() => { stopSound(null); }} hidden={!snapshot.playing} data-action="stop-sound">Stop the sound</button>
    </div>
  );

  return (
    <div ref={ref} className={`grid gap-4 ${twoColumn ? 'grid-cols-[minmax(0,1fr)_minmax(0,22rem)]' : ''}`} data-testid="vibration-panel" data-profile={pres.profile}>
      <div className="space-y-3 min-w-0">
        {scene}
        <p role="status" aria-live="polite" className="text-sm text-slate-100 rounded-xl border border-surface-border bg-surface-card px-3 py-2" data-testid="vib-status">{status}</p>
        {mobile && controls}
        <ActivityDetails title="Vibration and loudness graph"><EnvelopeGraph vib={vib} tS={clock.t} struck={struck} tEnd={duration} presentation={pres.vib} alt={`Graph of the size of the vibration (loudness) against real time after the strike: it falls steadily and the object is at rest after about ${f1(vib.valid ? vib.restAfterS : 0)} seconds, after which there is no sound.`} /></ActivityDetails>
        {mobile && editable ? <details className="rounded-xl border border-surface-border bg-surface-card p-3"><summary className="min-h-[44px] flex items-center font-bold text-sm text-slate-200 cursor-pointer">Measurements</summary><div className="pt-2">{readouts}</div></details> : <div className="rounded-xl border border-surface-border bg-surface-card p-3">{readouts}</div>}
        {!vib.valid && <p role="alert" className="text-sm text-rose-300" data-testid="vib-problem">{vib.reason}</p>}
      </div>
      {!mobile && controls && <div className="min-w-0">{controls}</div>}
    </div>
  );
};

/** What this laboratory assumes, stated plainly (shown on the laboratory page). */
export const VIBRATION_ASSUMPTIONS = [
  'A vibrating object moves to and fro about its rest position. Sound is made exactly while it vibrates: one rule decides both "moving" and "sounding".',
  'The size of the vibration dies away steadily after the strike. The decay times (about 1.5 s for the band and 4 s for the fork) are illustrative: a real fork rings longer and a real rubber band for less.',
  'For the band, the frequency uses the rule for an ideal string: more tension raises it, a longer or thicker band lowers it. The exact rule is beyond Class 9; the direction is what the book teaches.',
  `The wiggle on the screen is slowed ${SLOW_VIBRATION} times. The loudness graph, the bar and the sound run in real time.`,
  'The tone is a pure sine wave at the object\'s frequency. A real fork is close to that; a real band or string is a mixture of frequencies and sounds richer.',
];
import { ActivityDetails } from '../../../components/InteractiveActivity';
