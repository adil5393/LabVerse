import React from 'react';

export interface MobileLabTransportProps {
  playing: boolean;
  onTogglePlay: () => void;
  onStepBack?: () => void;
  onStepForward?: () => void;
  onReset?: () => void;
  stepBackLabel?: string;
  stepForwardLabel?: string;
  time: number;
  maxTime: number;
  onScrub: (time: number) => void;
  /** Format time into readable string (e.g. "2.40 s") */
  timeFormatter?: (time: number) => string;
  /** Extra utility button next to primary buttons (e.g. speed toggle 1x/2x) */
  extraActions?: React.ReactNode;
  /** Primary accent color (defaults to amber/yellow for time) */
  accentColor?: string;
}

/**
 * MobileLabTransport: Touch-friendly simulation playback and timeline controller.
 * Features:
 * - Row 1: Primary transport buttons (Play/Pause, -1s, +1s, Reset) with >= 44x44px touch targets.
 * - Row 2: Full-width dedicated timeline scrub row with live time display and touch isolation.
 */
export const MobileLabTransport: React.FC<MobileLabTransportProps> = ({
  playing,
  onTogglePlay,
  onStepBack,
  onStepForward,
  onReset,
  stepBackLabel = '-1s',
  stepForwardLabel = '+1s',
  time,
  maxTime,
  onScrub,
  timeFormatter = (t) => `${Math.round(t * 100) / 100} s`,
  extraActions,
  accentColor = '#f59e0b',
}) => {
  return (
    <div
      className="w-full bg-surface-container flex flex-col gap-2 p-2.5 border-b border-outline-variant select-none shrink-0"
      data-testid="mobile-lab-transport"
    >
      {/* Row 1: Primary Playback Buttons (All touch targets >= 44px) */}
      <div className="flex items-center gap-2 w-full">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={onTogglePlay}
          aria-label={playing ? 'Pause simulation' : time >= maxTime ? 'Replay simulation' : 'Play simulation'}
          className="min-h-[46px] min-w-[54px] px-3.5 rounded-xl font-bold text-slate-950 flex items-center justify-center shadow-md active:scale-95 transition-transform touch-manipulation"
          style={{ background: accentColor }}
          data-testid="mobile-play-button"
        >
          <span className="material-symbols-outlined text-[24px]">
            {playing ? 'pause' : time >= maxTime ? 'replay' : 'play_arrow'}
          </span>
          <span className="text-xs ml-1 font-bold">
            {playing ? 'Pause' : time >= maxTime ? 'Replay' : 'Play'}
          </span>
        </button>

        {/* Step Backward */}
        {onStepBack && (
          <button
            type="button"
            onClick={onStepBack}
            aria-label={`Step back ${stepBackLabel}`}
            className="min-h-[44px] min-w-[44px] px-3 rounded-lg border border-outline-variant bg-surface-container-high text-xs font-semibold text-slate-200 active:bg-surface-variant flex items-center justify-center touch-manipulation"
            data-testid="mobile-step-back"
          >
            {stepBackLabel}
          </button>
        )}

        {/* Step Forward */}
        {onStepForward && (
          <button
            type="button"
            onClick={onStepForward}
            aria-label={`Step forward ${stepForwardLabel}`}
            className="min-h-[44px] min-w-[44px] px-3 rounded-lg border border-outline-variant bg-surface-container-high text-xs font-semibold text-slate-200 active:bg-surface-variant flex items-center justify-center touch-manipulation"
            data-testid="mobile-step-forward"
          >
            {stepForwardLabel}
          </button>
        )}

        {/* Reset Button */}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            aria-label="Reset simulation to beginning"
            className="min-h-[44px] min-w-[44px] px-3 rounded-lg border border-red-500/40 text-red-400 bg-surface-container-high text-xs font-semibold active:bg-red-500/10 flex items-center justify-center touch-manipulation"
            data-testid="mobile-reset-button"
          >
            Reset
          </button>
        )}

        {/* Optional Extra Action (e.g. speed toggle or custom slot) */}
        {extraActions && (
          <div className="ml-auto shrink-0 flex items-center">
            {extraActions}
          </div>
        )}
      </div>

      {/* Row 2: Full-Width Dedicated Timeline Scrubber Row */}
      <div className="w-full flex items-center gap-2 pt-0.5">
        <span className="font-mono text-[11px] text-slate-400 whitespace-nowrap min-w-[48px]">
          {timeFormatter(time)}
        </span>
        <div className="flex-1 relative flex items-center">
          <input
            type="range"
            min={0}
            max={maxTime}
            step="any"
            value={time}
            onChange={(e) => onScrub(Number(e.target.value))}
            aria-label="Simulation time scrubber"
            aria-valuetext={timeFormatter(time)}
            className="w-full h-8 cursor-pointer touch-none accent-amber-400 bg-transparent py-2"
            data-testid="mobile-time-scrubber"
          />
        </div>
        <span className="font-mono text-[10px] text-slate-500 whitespace-nowrap">
          / {timeFormatter(maxTime)}
        </span>
      </div>
    </div>
  );
};
