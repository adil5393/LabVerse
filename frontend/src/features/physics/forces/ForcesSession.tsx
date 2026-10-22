import type { SimulationPlaybackControlsProps } from '../shared/controls/SimulationPlaybackControls';

export type ForceSceneView = 'motion' | 'forces';
export function ForceActivityPicker({ value, items, onChange }: { value: string | null; items: { id: string; title: string }[]; onChange: (id: string | null) => void }) {
  return <label className="force-situation-label">Choose an activity
    <select aria-label="Choose an activity" value={value ?? ''} onChange={event => onChange(event.target.value || null)}>
      <option value="">Free exploration</option>
      {items.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
    </select>
  </label>;
}
export function ForceSceneChoice({ value, onChange }: { value: ForceSceneView; onChange: (view: ForceSceneView) => void }) {
  return <div className="force-view-choice" role="group" aria-label="Experiment view">
    <button type="button" aria-pressed={value === 'motion'} onClick={() => onChange('motion')}>Watch motion</button>
    <button type="button" aria-pressed={value === 'forces'} onClick={() => onChange('forces')}>See forces</button>
  </div>;
}

/** The same model actions, arranged around the next useful student action. */
export function ForcesPlayback({ time, maxTime, playing, rate = 1, reducedMotion, onTogglePlay, onStepBack, onStepForward, onReset, onScrub, onRateChange, onMaxTimeChange, compact = false, testId = 'simulation-playback', playTestId = 'simulation-play', resetTestId = 'simulation-reset', setupToggle, stepSeconds = 1, onJumpToEnd }: SimulationPlaybackControlsProps & { stepSeconds?: number; onJumpToEnd?: () => void }) {
  return <div className={`app-chrome forces-playback ${compact ? 'forces-playback-compact' : ''}`} role="group" aria-label="Simulation playback controls" data-testid={testId}>
    {!compact && <div className="force-playback-heading"><span>Explore at your own pace</span><output>{Number(time.toFixed(1))} / {maxTime} s</output></div>}
    <div className="force-playback-actions">
      <button type="button" className="force-action-primary" onClick={onTogglePlay} aria-pressed={playing} data-testid={playTestId}>{playing ? 'Pause' : time >= maxTime ? 'Replay' : 'Play'}</button>
      {compact && onStepBack && <button type="button" onClick={onStepBack} aria-label="Step back 1 second of simulated time">−1 s</button>}
      {onStepForward && <button type="button" onClick={onStepForward} aria-label={stepSeconds === 1 ? 'Step forward 1 second of simulated time' : `Step forward ${stepSeconds} s`}>+{stepSeconds} s</button>}
      <button type="button" onClick={onReset} data-testid={resetTestId} aria-label="Reset simulation to beginning">Reset</button>
      {setupToggle && <button type="button" onClick={setupToggle.onToggle} aria-expanded={setupToggle.open} aria-controls={setupToggle.panelId} data-testid={setupToggle.testId ?? 'setup-toggle'}>{setupToggle.label ?? 'Setup'} <span aria-hidden>{setupToggle.open ? '−' : '+'}</span></button>}
    </div>
    <input type="range" min={0} max={maxTime} step="any" value={Math.min(time, maxTime)} onChange={e => onScrub(Number(e.target.value))} aria-label="Simulated time scrub" aria-valuetext={`${Number(time.toFixed(2))} seconds`} />
    {!compact && <details className="force-replay-options"><summary>Playback options{reducedMotion ? ' · reduced motion' : ''}</summary>
      <div className="flex flex-wrap items-center gap-3 pt-2">
        {onStepBack && <button type="button" onClick={onStepBack} aria-label={stepSeconds === 1 ? 'Step back 1 second of simulated time' : `Step back ${stepSeconds} s`}>−{stepSeconds} s</button>}
        {onJumpToEnd && <button type="button" onClick={onJumpToEnd} data-testid="braking-end">Jump to after braking</button>}
        {onRateChange && <label>Speed <select aria-label="Replay speed" value={rate} onChange={e => onRateChange(Number(e.target.value))}>{[.25,.5,1,2].map(value => <option key={value} value={value}>{value}×</option>)}</select></label>}
        {onMaxTimeChange && <label>Duration <select aria-label="Length of the run in seconds" value={maxTime} onChange={e => onMaxTimeChange(Number(e.target.value))}>{[10,20,30].map(value => <option key={value} value={value}>{value} s</option>)}</select></label>}
      </div>
      <p>Replay speed changes the picture’s pace. The physical values stay the same.{reducedMotion ? ' Reduced motion is on; use the slider or step buttons to explore.' : ''}</p>
    </details>}
    {compact && onRateChange && <select aria-label="Replay speed" value={rate} onChange={e => onRateChange(Number(e.target.value))}>{[.25,.5,1,2].map(value => <option key={value} value={value}>{value}×</option>)}</select>}
  </div>;
}
