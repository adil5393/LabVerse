/**
 * Visuals for Sections 10.6 to 10.8 (Lessons 7 to 12) and the Sound Characteristics Laboratory: speed in different media
 * (v = ν λ), pitch and the audible range, echo timing with the book's thresholds, and SONAR depth. Every number shown is computed by
 * `engine/physics/sound/characteristics.ts`; nothing is read off the drawing. Silent by design (no audio), so they are safe to
 * use anywhere; the Vibration and Wave laboratories hold the optional sound.
 */

import React, { useState } from 'react';
import type { VisualProps } from '../../education/visuals';
import {
  AUDIBLE_MAX_HZ, AUDIBLE_MIN_HZ, classifyFrequency, echoVerdict, ECHO_GAP_S, MEDIA, noteFrequencies, periodFromFrequency, REVERBERATION_GAP_S,
  reflectorDistance, roundTripTime, travelTime, wavelengthOf,
} from '../../../engine/physics/sound/characteristics';

const fmt = (n: number, d = 3) => (Math.abs(n) >= 1000 ? Math.round(n).toLocaleString('en-IN') : String(Math.round(n * 10 ** d) / 10 ** d));
const card = 'rounded-xl border border-surface-border bg-surface-lowest p-3 space-y-2';

const Slider: React.FC<{ id: string; label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void; disabled?: boolean }> = ({ id, label, value, min, max, step, unit, onChange, disabled }) => (
  <label htmlFor={id} className="block text-sm text-slate-200">
    <span className="flex justify-between gap-2"><span>{label}</span><strong className="font-mono text-white">{fmt(value)} {unit}</strong></span>
    <input id={id} type="range" min={min} max={max} step={step} value={value} disabled={disabled} onChange={(e) => onChange(Number(e.target.value))} className="w-full min-h-[44px] accent-teal-400" />
  </label>
);

const MediumPicker: React.FC<{ value: string; onChange: (id: string) => void; ids?: string[]; disabled?: boolean }> = ({ value, onChange, ids, disabled }) => (
  <label className="block text-sm text-slate-200">Medium
    <select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full min-h-[44px] rounded-xl border border-surface-border bg-surface px-3 text-on-surface">
      {MEDIA.filter((m) => !ids || ids.includes(m.id)).map((m) => <option key={m.id} value={m.id}>{m.label}: {m.speed} m/s</option>)}
    </select>
  </label>
);

/** Speed in different media, and v = ν λ: the same frequency gives a longer wavelength in a faster medium. */
export const SoundSpeedVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as { editable?: boolean; nu?: number; distance?: number };
  const [nu, setNu] = useState(p.nu ?? 500);
  const [d, setD] = useState(p.distance ?? 340);
  const media = ['air-15', 'water', 'steel'].map((id) => MEDIA.find((m) => m.id === id)!);
  const maxT = travelTime(d, media[0].speed);
  return (
    <div className="space-y-3 p-3" data-testid="sound-speed" aria-label={alt}>
      <div className={card}>
        <p className="text-xs text-slate-400">Time to travel {fmt(d)} m (same frequency, {fmt(nu)} Hz):</p>
        {media.map((m) => {
          const t = travelTime(d, m.speed);
          return (
            <div key={m.id} className="space-y-1" data-medium={m.id}>
              <div className="flex justify-between text-sm"><span className="text-slate-200">{m.label} ({m.speed} m/s)</span><span className="font-mono text-white">{fmt(t, 4)} s · λ = {fmt(wavelengthOf(m.speed, nu), 3)} m</span></div>
              <div className="h-3 rounded-full bg-surface-high overflow-hidden"><div className="h-full bg-teal-400" style={{ width: `${Math.max(2, (t / maxT) * 100)}%` }} /></div>
            </div>
          );
        })}
        <p className="text-xs text-slate-400">The frequency is the same in every medium; the speed sets the wavelength (λ = v ÷ ν). Speeds are the chapter&apos;s approximate values.</p>
      </div>
      {p.editable && (
        <div className={card}>
          <Slider id="spd-nu" label="ν (frequency)" value={nu} min={20} max={2000} step={10} unit="Hz" onChange={setNu} />
          <Slider id="spd-d" label="Distance" value={d} min={10} max={2000} step={10} unit="m" onChange={setD} />
        </div>
      )}
    </div>
  );
};

/** Pitch and the audible range: frequency decides pitch and band; amplitude decides loudness. */
export const SoundPitchVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as { editable?: boolean; nu?: number; amplitude?: number; ladder?: boolean };
  const [nu, setNu] = useState(p.nu ?? 440);
  const [amp, setAmp] = useState(p.amplitude ?? 0.5);
  const band = classifyFrequency(nu);
  const logPos = (f: number) => ((Math.log10(f) - 0) / (Math.log10(100000) - 0)) * 100;
  return (
    <div className="space-y-3 p-3" data-testid="sound-pitch" data-band={band} aria-label={alt}>
      <div className={card}>
        <div className="relative h-8 rounded-lg overflow-hidden flex text-[11px] font-semibold">
          <div className="bg-violet-500/40 flex items-center justify-center" style={{ width: `${logPos(AUDIBLE_MIN_HZ)}%` }}>infrasonic</div>
          <div className="bg-emerald-500/40 flex items-center justify-center" style={{ width: `${logPos(AUDIBLE_MAX_HZ) - logPos(AUDIBLE_MIN_HZ)}%` }}>audible (20 Hz – 20 kHz)</div>
          <div className="bg-sky-500/40 flex-1 flex items-center justify-center">ultrasonic</div>
          <div className="absolute top-0 bottom-0 w-1 bg-white" style={{ left: `${Math.min(99, logPos(nu))}%` }} aria-hidden />
        </div>
        <p className="text-sm text-white"><strong>{fmt(nu)} Hz</strong>: {band}; time period T = {fmt(periodFromFrequency(nu) * 1000, 3)} ms. {band === 'audible' ? (nu < 250 ? 'A low pitch.' : nu > 2000 ? 'A high pitch.' : 'A middle pitch.') : band === 'ultrasonic' ? 'Too high for human ears (bats and dolphins use it).' : 'Too low for human ears (elephants and earthquakes produce it).'}</p>
        <div className="flex items-end gap-1 h-16" aria-hidden>
          {Array.from({ length: 24 }, (_, i) => <div key={i} className="flex-1 bg-teal-400/80 rounded-t" style={{ height: `${50 + 50 * amp * Math.sin((i / 24) * Math.PI * 2 * Math.min(6, Math.max(1, Math.log2(nu / 50))))}%` }} />)}
        </div>
        <p className="text-xs text-slate-400">Amplitude {fmt(amp, 2)}: a larger amplitude carries more energy and sounds louder; it does not change the pitch.</p>
      </div>
      {p.ladder && (
        <div className={card}>
          <p className="text-xs text-slate-400">One octave from Sa = 240 Hz (one common set of ratios; real instruments differ slightly):</p>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 text-center text-xs">{noteFrequencies(240).map((n) => <div key={n.note} className="rounded-lg border border-surface-border p-1"><div className="font-bold text-white">{n.note}</div><div className="font-mono text-slate-300">{fmt(n.hz, 1)}</div><div className="text-slate-400">×{n.text}</div></div>)}</div>
        </div>
      )}
      {p.editable && (
        <div className={card}>
          <Slider id="pitch-nu" label="ν (frequency)" value={nu} min={5} max={60000} step={5} unit="Hz" onChange={setNu} />
          <Slider id="pitch-amp" label="Amplitude" value={amp} min={0} max={1} step={0.05} unit="" onChange={setAmp} />
        </div>
      )}
    </div>
  );
};

const VERDICT_TEXT = { echo: 'Separate echo heard (gap at least about 0.1 s)', reverberation: 'No separate echo: the reflection merges with the sound (reverberation range)', 'not-separate': 'Still not a separate echo (the book gives no name for 0.05 s to 0.1 s)' } as const;

/** Echo: a source and a wall; the gap is the round-trip time, compared with the book's approximate thresholds. */
export const SoundEchoVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as { editable?: boolean; distance?: number; medium?: string };
  const [d, setD] = useState(p.distance ?? 17);
  const [mid, setMid] = useState(p.medium ?? 'air-15');
  const v = MEDIA.find((m) => m.id === mid)!.speed;
  const gap = roundTripTime(d, v);
  const verdict = echoVerdict(gap);
  const scale = (t: number) => Math.min(100, (t / 0.3) * 100);
  return (
    <div className="space-y-3 p-3" data-testid="sound-echo" data-verdict={verdict} aria-label={alt}>
      <div className={card}>
        <svg viewBox="0 0 300 70" className="w-full" aria-hidden>
          <circle cx="20" cy="35" r="9" fill="#38bdf8" /><text x="20" y="62" textAnchor="middle" fontSize="10" fill="#cbd5e1">you</text>
          <rect x={30 + Math.min(250, d * 2.5)} y="5" width="10" height="60" fill="#94a3b8" /><text x={35 + Math.min(250, d * 2.5)} y="68" textAnchor="middle" fontSize="10" fill="#cbd5e1">wall</text>
          <line x1="30" y1="28" x2={28 + Math.min(250, d * 2.5)} y2="28" stroke="#f59e0b" strokeDasharray="4 3" />
          <line x1={28 + Math.min(250, d * 2.5)} y1="42" x2="30" y2="42" stroke="#34d399" strokeDasharray="4 3" />
        </svg>
        <div className="relative h-6 rounded-lg overflow-hidden flex text-[10px]" aria-hidden>
          <div className="bg-violet-500/40" style={{ width: `${scale(REVERBERATION_GAP_S)}%` }} />
          <div className="bg-amber-500/30" style={{ width: `${scale(ECHO_GAP_S) - scale(REVERBERATION_GAP_S)}%` }} />
          <div className="bg-emerald-500/40 flex-1" />
          <div className="absolute top-0 bottom-0 w-1 bg-white" style={{ left: `${Math.min(99, scale(gap))}%` }} />
        </div>
        <p className="text-sm text-white">Wall {fmt(d, 1)} m away, v = {v} m/s: the reflection returns after <strong>{fmt(gap, 3)} s</strong> (there and back, 2d ÷ v).</p>
        <p className="text-sm text-emerald-100" data-testid="echo-verdict">{VERDICT_TEXT[verdict]}.</p>
        <p className="text-xs text-slate-400">The 0.1 s and 0.05 s figures are approximate rules about hearing, not exact laws.</p>
      </div>
      {p.editable && (
        <div className={card}>
          <Slider id="echo-d" label="Distance to the wall" value={d} min={1} max={100} step={0.5} unit="m" onChange={setD} />
          <MediumPicker value={mid} onChange={setMid} ids={['air-0', 'air-15', 'air-22', 'water']} />
        </div>
      )}
    </div>
  );
};

/** SONAR: a ship sends a pulse to the sea bed; depth = v t ÷ 2. */
export const SoundSonarVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as { editable?: boolean; time?: number; medium?: string };
  const [t, setT] = useState(p.time ?? 4);
  const [mid, setMid] = useState(p.medium ?? 'water');
  const v = MEDIA.find((m) => m.id === mid)!.speed;
  const depth = reflectorDistance(v, t);
  const y = 18 + Math.min(110, (depth / 8000) * 110);
  return (
    <div className="space-y-3 p-3" data-testid="sound-sonar" aria-label={alt}>
      <div className={card}>
        <svg viewBox="0 0 220 140" className="w-full max-w-[320px] mx-auto block" aria-hidden>
          <rect x="0" y="16" width="220" height="124" fill="#0c4a6e" opacity="0.6" />
          <path d="M80 16 L140 16 L132 6 L88 6 Z" fill="#e2e8f0" />
          <line x1="110" y1="18" x2="110" y2={y} stroke="#f59e0b" strokeDasharray="5 4" />
          <line x1="116" y1={y} x2="116" y2="18" stroke="#34d399" strokeDasharray="5 4" />
          <rect x="0" y={y} width="220" height={140 - y} fill="#78350f" opacity="0.8" />
          <text x="150" y={(18 + y) / 2} fontSize="11" fill="#e2e8f0">{fmt(depth, 1)} m</text>
        </svg>
        <p className="text-sm text-white">Echo after <strong>{fmt(t, 2)} s</strong> at {v} m/s: the pulse travels {fmt(v * t, 1)} m in total, so the depth is half of it, <strong>{fmt(depth, 1)} m</strong>.</p>
        <p className="text-xs text-slate-400">SONAR uses ultrasound (above 20 kHz), which spreads less and is not heard by people. Idealised: straight down and back, one speed.</p>
      </div>
      {p.editable && (
        <div className={card}>
          <Slider id="sonar-t" label="Echo time" value={t} min={0.1} max={10} step={0.05} unit="s" onChange={setT} />
          <MediumPicker value={mid} onChange={setMid} ids={['water', 'seawater']} />
        </div>
      )}
    </div>
  );
};
