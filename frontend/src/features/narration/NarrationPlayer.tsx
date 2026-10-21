/**
 * Compact read-aloud control. At rest it is one small "Listen" button; once narration has started the same button becomes
 * Pause or Resume and Stop, Replay, speed and (when the browser offers more than one) voice appear beside it. The main button is
 * one stable element, so keyboard focus is never lost when the state changes, and Stop or Escape return focus to it.
 * Narration never starts on its own and the page text is always the readable alternative. The control sits inside a
 * `NarrationRegion`; outside one it renders nothing.
 */

import React, { useEffect, useRef, useState } from 'react';
import { getSpeechProvider, type VoiceInfo } from '../../engine/narration/provider';
import { useNarrationSettings } from '../../engine/narration/settings';
import { useNarrationRegion } from './narrationContext';

const RATES = [0.75, 1, 1.25, 1.5];
const btn = 'min-h-[44px] min-w-[44px] px-3 inline-flex items-center justify-center gap-1.5 rounded-xl border border-surface-border bg-surface-card text-slate-100 text-xs font-bold hover:border-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 touch-manipulation';

function useVoices(): VoiceInfo[] {
  const [voices, setVoices] = useState<VoiceInfo[]>(() => getSpeechProvider().voices());
  useEffect(() => {
    const p = getSpeechProvider();
    const update = () => setVoices(p.voices());
    update();
    return p.onVoicesChanged(update);
  }, []);
  return voices;
}

export const NarrationPlayer: React.FC<{ label?: string; className?: string }> = ({ label = 'this section', className }) => {
  const region = useNarrationRegion();
  const rate = useNarrationSettings((s) => s.rate);
  const setRate = useNarrationSettings((s) => s.setRate);
  const voiceURI = useNarrationSettings((s) => s.voiceURI);
  const setVoiceURI = useNarrationSettings((s) => s.setVoiceURI);
  const voices = useVoices();
  const main = useRef<HTMLButtonElement>(null);
  if (!region) return null;
  const { controller, snapshot: s } = region;

  if (!s.supported) {
    return <p className={`text-[11px] text-slate-400 ${className ?? ''}`} data-testid="narration-unsupported">Read aloud is not available in this browser. The text on the page says the same thing.</p>;
  }

  const english = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
  const choices = english.length ? english : voices;
  const idle = s.status === 'idle';
  const playing = s.status === 'playing';
  const stop = () => { controller.stop(); main.current?.focus(); };

  const action = idle ? 'play' : playing ? 'pause' : 'resume';
  const mainLabel = idle ? `Listen to ${label}` : playing ? 'Pause reading' : 'Resume reading';
  const icon = idle ? 'volume_up' : playing ? 'pause' : 'play_arrow';
  const text = idle ? 'Listen' : playing ? 'Pause' : 'Resume';
  const onMain = () => { if (idle) controller.play(); else if (playing) controller.pause(); else controller.resume(); };

  return (
    <div
      role="group"
      aria-label={`Read aloud controls for ${label}`}
      className={`flex flex-wrap items-center gap-2 ${className ?? ''}`}
      data-testid="narration-player"
      data-state={s.status}
      onKeyDown={(e) => { if (e.key === 'Escape' && !idle) { e.stopPropagation(); stop(); } }}
    >
      <button ref={main} type="button" className={btn} onClick={onMain} aria-label={mainLabel} data-narration-action={action}>
        <span className="material-symbols-outlined text-[18px]" aria-hidden>{icon}</span>
        <span>{text}</span>
      </button>
      {!idle && (
        <>
          <button type="button" className={btn} onClick={stop} aria-label="Stop reading" data-narration-action="stop"><span className="material-symbols-outlined text-[18px]" aria-hidden>stop</span><span>Stop</span></button>
          <button type="button" className={btn} onClick={() => controller.replay()} aria-label="Replay from the start" data-narration-action="replay"><span className="material-symbols-outlined text-[18px]" aria-hidden>replay</span><span>Replay</span></button>
          <label className="inline-flex items-center gap-1.5 text-xs text-slate-300">
            <span>Speed</span>
            <select className="min-h-[44px] rounded-xl border border-surface-border bg-surface-card px-2 text-slate-100" value={RATES.includes(rate) ? rate : 1} onChange={(e) => setRate(Number(e.target.value))} aria-label="Reading speed">
              {RATES.map((r) => <option key={r} value={r}>{r}×</option>)}
            </select>
          </label>
          {choices.length > 1 && (
            <label className="inline-flex items-center gap-1.5 text-xs text-slate-300">
              <span>Voice</span>
              <select className="min-h-[44px] max-w-[11rem] rounded-xl border border-surface-border bg-surface-card px-2 text-slate-100" value={voiceURI ?? ''} onChange={(e) => setVoiceURI(e.target.value || null)} aria-label="Voice">
                <option value="">Automatic</option>
                {choices.map((v) => <option key={v.uri} value={v.uri}>{v.name}</option>)}
              </select>
            </label>
          )}
          <span className="text-[11px] font-mono text-slate-400" data-testid="narration-progress">{s.segmentNumber} of {s.segmentCount}</span>
        </>
      )}
      {idle && s.error && <p role="status" className="basis-full text-[11px] text-amber-300" data-testid="narration-error">{s.error}</p>}
    </div>
  );
};
