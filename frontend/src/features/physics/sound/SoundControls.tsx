/**
 * Shared controls for the Sound laboratories: a labelled slider, the transport bar (play or pause, replay, reset, time slider),
 * and the sound switch. Every control has a visible name, is at least 44 px tall on touch screens, and works from the keyboard.
 */

import React, { useId } from 'react';
import { frequencyNote } from '../../../engine/audio/safety';
import { useAudioSettings } from '../../../engine/audio/settings';
import { useTone } from '../../audio/useTone';

export const btn = 'min-h-[44px] min-w-[44px] px-4 inline-flex items-center justify-center gap-1.5 rounded-xl border border-surface-border bg-surface-card text-slate-100 text-sm font-bold hover:border-slate-400 disabled:opacity-40 touch-manipulation focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400';
export const btnPrimary = 'min-h-[44px] min-w-[44px] px-5 inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 text-slate-950 text-sm font-black hover:bg-amber-400 disabled:opacity-40 touch-manipulation focus-visible:outline focus-visible:outline-2 focus-visible:outline-white';

export const RangeField: React.FC<{
  id: string; label: string; unit?: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void;
  format?: (v: number) => string; hint?: string; disabled?: boolean;
}> = ({ id, label, unit, value, min, max, step, onChange, format, hint, disabled }) => (
  <div className="space-y-1" data-field={id}>
    <label htmlFor={id} className="flex items-baseline justify-between gap-2 text-sm text-slate-200">
      <span className="font-bold">{label}</span>
      <span className="font-mono text-amber-300" data-testid={`${id}-value`}>{format ? format(value) : value}{unit ? ` ${unit}` : ''}</span>
    </label>
    <input id={id} type="range" className="w-full h-11 accent-amber-500 touch-manipulation" min={min} max={max} step={step} value={value} disabled={disabled}
      aria-valuetext={`${format ? format(value) : value}${unit ? ` ${unit}` : ''}`} onChange={(e) => onChange(Number(e.target.value))} />
    {hint && <p className="text-xs text-slate-400">{hint}</p>}
  </div>
);

export const TransportBar: React.FC<{
  playing: boolean; t: number; duration: number; reduced: boolean; blocked: boolean;
  onToggle: () => void; onReplay: () => void; onReset: () => void; onScrub: (t: number) => void;
  timeLabel: string; playLabel?: string; stepSize?: number;
}> = ({ playing, t, duration, reduced, blocked, onToggle, onReplay, onReset, onScrub, timeLabel, playLabel = 'Play', stepSize }) => {
  const timeId = useId();
  return (
  <div className="space-y-2" data-testid="transport">
    <div className="flex flex-wrap items-center gap-2">
      {!blocked && <button type="button" className={btnPrimary} onClick={onToggle} aria-label={playing ? 'Pause' : playLabel} data-action="toggle"><span className="material-symbols-outlined text-[20px]" aria-hidden>{playing ? 'pause' : 'play_arrow'}</span><span>{playing ? 'Pause' : playLabel}</span></button>}
      {blocked && stepSize !== undefined && (
        <>
          <button type="button" className={btn} onClick={() => onScrub(Math.max(0, t - stepSize))} aria-label="Step back" data-action="step-back"><span aria-hidden>◀</span><span>Step back</span></button>
          <button type="button" className={btn} onClick={() => onScrub(Math.min(duration, t + stepSize))} aria-label="Step forward" data-action="step-forward"><span>Step forward</span><span aria-hidden>▶</span></button>
        </>
      )}
      <button type="button" className={btn} onClick={onReplay} aria-label="Replay from the start" data-action="replay"><span className="material-symbols-outlined text-[20px]" aria-hidden>replay</span><span>Replay</span></button>
      <button type="button" className={btn} onClick={onReset} aria-label="Reset" data-action="reset"><span className="material-symbols-outlined text-[20px]" aria-hidden>restart_alt</span><span>Reset</span></button>
    </div>
    <div className="space-y-1">
      <label htmlFor={timeId} className="flex items-baseline justify-between text-sm text-slate-200"><span className="font-bold">Time</span><span className="font-mono text-amber-300" data-testid="time-value">{timeLabel}</span></label>
      <input id={timeId} type="range" className="w-full h-11 accent-amber-500 touch-manipulation" min={0} max={duration} step={duration / 400} value={t} aria-valuetext={timeLabel} onChange={(e) => onScrub(Number(e.target.value))} />
    </div>
    {reduced && blocked && <p className="text-xs text-slate-400" data-testid="reduced-note">Your device asks for reduced motion, so nothing animates by itself. Drag the time slider or use the step buttons to move through time.</p>}
  </div>
  );
};

/**
 * The sound switch, volume and status. Sound is OFF every time the page is opened and nothing plays until a button that
 * starts a sound is pressed with the switch on. The status line is the text equivalent of the sound.
 */
export const SoundSwitch: React.FC<{ hz?: number }> = ({ hz }) => {
  const soundOn = useAudioSettings((s) => s.soundOn);
  const setSoundOn = useAudioSettings((s) => s.setSoundOn);
  const volume = useAudioSettings((s) => s.volume);
  const setVolume = useAudioSettings((s) => s.setVolume);
  const { engine, snapshot } = useTone();
  const note = hz !== undefined ? frequencyNote(hz) : null;
  const toggle = () => { if (soundOn) engine.stop('Sound is off.'); setSoundOn(!soundOn); };
  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card p-3 space-y-2" data-testid="sound-switch">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-bold text-white flex items-center gap-1.5"><span className="material-symbols-outlined text-[20px]" aria-hidden>{soundOn ? 'volume_up' : 'volume_off'}</span>Sound {soundOn ? 'on' : 'off'}</div>
          <p className="text-xs text-slate-400">{soundOn ? 'A tone plays only when you press Pluck or Strike. It stops by itself after the vibration dies away, and never lasts more than 20 seconds.' : 'Off, so nothing will play. Everything on the screen still works without sound.'}</p>
        </div>
        <button type="button" role="switch" aria-checked={soundOn} aria-label="Sound" onClick={toggle} data-testid="sound-toggle"
          className={`shrink-0 min-h-[44px] min-w-[64px] rounded-full border px-3 text-sm font-black touch-manipulation ${soundOn ? 'bg-amber-500 border-amber-300 text-slate-950' : 'bg-surface-lowest border-surface-border text-slate-300'}`}>{soundOn ? 'On' : 'Off'}</button>
      </div>
      {soundOn && (
        <>
          <RangeField id="sound-volume" label="Volume" value={Math.round(volume * 100)} min={0} max={100} step={5} unit="%" onChange={(v) => setVolume(v / 100)} hint="Start with your device volume low. The laboratory also keeps the sound well below the loudest your device can make." />
          {note && <p className="text-xs text-amber-200" data-testid="frequency-note">{note}</p>}
        </>
      )}
      <p role="status" aria-live="polite" className="text-xs text-slate-300 min-h-[1rem]" data-testid="tone-status">{snapshot.message ?? (snapshot.playing ? `Playing a tone at ${Math.round(snapshot.hz ?? 0)} hertz.` : '')}</p>
    </div>
  );
};
