import React from 'react';
import { PHYS } from '../../motion/physicsColors';

export interface SimulationPlaybackControlsProps {
  time: number;
  maxTime: number;
  playing: boolean;
  rate?: number;
  reducedMotion?: boolean;
  onTogglePlay: () => void;
  onStepBack?: () => void;
  onStepForward?: () => void;
  onReset: () => void;
  onScrub: (time: number) => void;
  onRateChange?: (rate: number) => void;
  onMaxTimeChange?: (maxTime: number) => void;
  compact?: boolean;
  testId?: string;
  playTestId?: string;
  resetTestId?: string;
  setupToggle?: {
    open: boolean;
    onToggle: () => void;
    panelId: string;
    label?: string;
    testId?: string;
  };
}

const r2 = (n: number, p = 2): string => {
  const r = Math.round(n * 10 ** p) / 10 ** p;
  return `${r < 0 ? '−' : ''}${Math.abs(r)}`;
};

/**
 * SimulationPlaybackControls: Unified, accessible, mobile-first experiment timeline control.
 * Ensures minimum 44px touch targets on mobile, fluid time scrubbing, speed selection, and
 * preserves exact testid attributes for automated regression suites.
 */
export const SimulationPlaybackControls: React.FC<SimulationPlaybackControlsProps> = ({
  time,
  maxTime,
  playing,
  rate = 1,
  reducedMotion = false,
  onTogglePlay,
  onStepBack,
  onStepForward,
  onReset,
  onScrub,
  onRateChange,
  onMaxTimeChange,
  compact = false,
  testId = 'simulation-playback',
  playTestId = 'simulation-play',
  resetTestId = 'simulation-reset',
  setupToggle,
}) => {
  const atEnd = time >= maxTime;
  const btnH = compact ? 'min-h-[36px] px-2.5 text-xs' : 'min-h-[44px] px-3.5 text-sm';
  const selH = compact ? 'min-h-[36px] text-xs' : 'min-h-[44px] text-xs';

  return (
    <div
      role="group"
      aria-label="Simulation playback controls"
      data-testid={testId}
      className={`flex flex-wrap items-center gap-2 ${
        compact
          ? ''
          : 'rounded-xl border border-surface-border bg-surface-card/70 p-3 shadow-sm'
      }`}
    >
      {!compact && (
        <div className="flex items-center justify-between w-full text-xs font-mono">
          <span className="flex items-center gap-1.5" style={{ color: PHYS.time }}>
            <span className="text-sm select-none" aria-hidden>
              ◷
            </span>
            <span>Simulated time: {r2(time)} s / {maxTime} s</span>
          </span>
          {reducedMotion && (
            <span className="text-[10px] text-amber-300 font-sans">
              Reduced motion active
            </span>
          )}
        </div>
      )}

      {/* Primary Play Button */}
      <button
        type="button"
        onClick={onTogglePlay}
        aria-pressed={playing}
        data-testid={playTestId}
        className={`${btnH} rounded-xl font-bold flex items-center justify-center gap-1.5 text-slate-950 shadow-sm transition-transform active:scale-95`}
        style={{ background: PHYS.time }}
      >
        <span className="text-base select-none" aria-hidden>
          {playing ? 'Ⅱ' : atEnd ? '↻' : '▶'}
        </span>
        <span>{playing ? 'Pause' : atEnd ? 'Replay' : 'Play'}</span>
      </button>

      {/* Stepping controls */}
      {onStepBack && (
        <button
          type="button"
          onClick={onStepBack}
          aria-label="Step back 1 second of simulated time"
          className={`${btnH} rounded-xl border border-surface-border bg-surface-lowest hover:bg-surface-card text-white font-mono flex items-center gap-1 transition-colors`}
        >
          <span>−1 s</span>
        </button>
      )}

      {onStepForward && (
        <button
          type="button"
          onClick={onStepForward}
          aria-label="Step forward 1 second of simulated time"
          className={`${btnH} rounded-xl border border-surface-border bg-surface-lowest hover:bg-surface-card text-white font-mono flex items-center gap-1 transition-colors`}
        >
          <span>+1 s</span>
        </button>
      )}

      {/* Reset */}
      <button
        type="button"
        onClick={onReset}
        data-testid={resetTestId}
        aria-label="Reset simulation to beginning"
        className={`${btnH} rounded-xl border bg-surface-lowest hover:bg-red-950/20 font-bold transition-colors`}
        style={{ borderColor: `${PHYS.error}80`, color: PHYS.error }}
      >
        Reset
      </button>

      {/* Setup Toggle */}
      {setupToggle && (
        <button
          type="button"
          onClick={setupToggle.onToggle}
          aria-expanded={setupToggle.open}
          aria-controls={setupToggle.panelId}
          data-testid={setupToggle.testId ?? 'setup-toggle'}
          className={`${btnH} rounded-xl border border-surface-border bg-surface-lowest hover:bg-surface-card text-slate-200 font-semibold flex items-center justify-center gap-1.5 transition-colors select-none`}
        >
          <span className="text-base text-sky-400 select-none" aria-hidden>
            ⚙
          </span>
          <span>{setupToggle.label ?? 'Setup'}</span>
          <span
            className="text-sm text-slate-400 transition-transform duration-200 select-none"
            style={{ transform: setupToggle.open ? 'rotate(180deg)' : 'rotate(0deg)' }}
            aria-hidden
          >
            ⌄
          </span>
        </button>
      )}

      {/* Speed Selector */}
      {onRateChange && (
        <label className="flex items-center gap-1 text-xs text-slate-300">
          {!compact && <span className="text-[11px] text-slate-400">Speed</span>}
          <select
            value={rate}
            onChange={(e) => onRateChange(Number(e.target.value))}
            aria-label="Replay speed"
            className={`${selH} rounded-lg border border-surface-border bg-surface-lowest px-2 text-white font-mono cursor-pointer`}
          >
            <option value={0.5}>0.5×</option>
            <option value={1}>1.0×</option>
            <option value={2}>2.0×</option>
          </select>
        </label>
      )}

      {/* Run Duration Selector */}
      {onMaxTimeChange && !compact && (
        <label className="flex items-center gap-1 text-xs text-slate-300">
          <span className="text-[11px] text-slate-400">Duration</span>
          <select
            value={maxTime}
            onChange={(e) => onMaxTimeChange(Number(e.target.value))}
            aria-label="Length of the run in seconds"
            className={`${selH} rounded-lg border border-surface-border bg-surface-lowest px-2 text-white font-mono cursor-pointer`}
          >
            <option value={10}>10 s</option>
            <option value={20}>20 s</option>
            <option value={30}>30 s</option>
          </select>
        </label>
      )}

      {/* Continuous Time Scrubber */}
      <div className={`flex items-center gap-2 grow ${compact ? 'min-w-[110px]' : 'min-w-[150px] basis-full sm:basis-auto'}`}>
        <input
          type="range"
          min={0}
          max={maxTime}
          step="any"
          value={Math.min(time, maxTime)}
          onChange={(e) => onScrub(Number(e.target.value))}
          aria-label="Simulated time scrub"
          aria-valuetext={`${r2(time)} seconds`}
          className={`w-full accent-sky-400 cursor-pointer ${compact ? 'h-5' : 'h-7'}`}
        />
        {compact && (
          <span className="font-mono text-xs text-slate-300 shrink-0">
            {r2(time)}s
          </span>
        )}
      </div>

      {!compact && (
        <p className="basis-full text-[11px] text-slate-400 pt-1">
          Replay speed changes visual playback pace; scientific calculations use deterministic simulated time.
        </p>
      )}
    </div>
  );
};
