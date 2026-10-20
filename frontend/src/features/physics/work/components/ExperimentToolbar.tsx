import React from 'react';
import { fmt, fmtSigned } from '../../../../engine/physics/work/workModel';

export interface ExperimentToolbarProps {
  playing: boolean;
  progress: number;
  onTogglePlay: () => void;
  onReset: () => void;
  onProgressChange: (p: number) => void;
  positionNow: number;
  workDoneSoFar: number;
  valid: boolean;
  displacement: number;
}

/**
 * ExperimentToolbar: Compact playback and timeline controller for laboratory simulation.
 * Includes Play/Pause/Replay state, quick reset, scrubbing track with real-time feedback,
 * and live position/work annotations.
 */
export const ExperimentToolbar: React.FC<ExperimentToolbarProps> = ({
  playing,
  progress,
  onTogglePlay,
  onReset,
  onProgressChange,
  positionNow,
  workDoneSoFar,
  valid,
  displacement,
}) => {
  const isComplete = progress >= 1;
  const isPlayDisabled = !valid || displacement === 0;

  return (
    <div className="space-y-3 bg-surface-card/80 border border-surface-border rounded-xl p-3 sm:p-4 backdrop-blur-sm shadow-sm">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Playback Action Buttons */}
        <div className="flex items-center gap-2" role="group" aria-label="Simulation playback controls">
          <button
            type="button"
            onClick={onTogglePlay}
            disabled={isPlayDisabled}
            data-testid="work-play"
            className={`min-h-[44px] px-5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all select-none border-2 disabled:opacity-40 disabled:pointer-events-none ${
              playing
                ? 'bg-amber-400/20 text-amber-200 border-amber-400/60 hover:bg-amber-400/30'
                : isComplete
                ? 'bg-indigo-500/20 text-indigo-200 border-indigo-400/60 hover:bg-indigo-500/30'
                : 'bg-primary text-slate-950 border-primary hover:bg-primary-light'
            }`}
          >
            {playing ? (
              <>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
                <span>Pause</span>
              </>
            ) : isComplete ? (
              <>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                </svg>
                <span>Replay</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>Play</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onReset}
            data-testid="work-reset"
            className="min-h-[44px] px-4 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-surface-elevated hover:bg-surface-high border border-surface-border transition-colors flex items-center gap-2 select-none"
          >
            <svg className="w-3.5 h-3.5 fill-current opacity-70" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
            <span>Back to start</span>
          </button>
        </div>

        {/* Live position readout badge */}
        <div className="flex items-center">
          <p
            className="text-xs text-slate-300 font-mono bg-surface-lowest px-3 py-2 rounded-lg border border-surface-border/70 flex items-center gap-2 flex-wrap"
            data-testid="work-position"
          >
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
              <span>Position now:</span>
              <strong className="text-white font-bold">{fmt(positionNow)} m</strong>
            </span>
            <span className="text-slate-500">&middot;</span>
            <span className="text-slate-400">
              work done so far: <strong className="text-indigo-300 font-bold">{fmtSigned(workDoneSoFar)} J</strong>
            </span>
          </p>
        </div>
      </div>

      {/* Scrubbing timeline */}
      <div className="pt-1">
        <label className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-300">
          <span className="font-medium text-slate-300 flex items-center gap-1.5">
            <span>Position along the displacement</span>
            <span className="font-mono text-[11px] text-slate-400 bg-surface-container px-1.5 py-0.5 rounded">
              {Math.round(progress * 100)}%
            </span>
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={progress}
            onChange={(e) => onProgressChange(Number(e.target.value))}
            aria-label="How far through the displacement"
            aria-valuetext={`${Math.round(progress * 100)} percent of the displacement`}
            data-testid="work-progress"
            className="w-full sm:flex-1 sm:ml-4 min-h-[44px] cursor-pointer accent-sky-400 bg-surface-lowest rounded-lg"
          />
        </label>
      </div>
    </div>
  );
};
