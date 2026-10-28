/**
 * The shared, phone-first layout for Chemistry and Biology investigations. Every investigation follows the same order:
 *
 *   question → scene → actions and main controls → observation → explanation → record the finding
 *
 * On a phone these stack in that order, with the main controls directly under the scene so both fit on one screen. When the
 * activity is at least 720 px wide (a desktop laboratory, or focus mode on a tablet) the controls, observation and
 * explanation move into a column beside the scene. The layout reacts to the width of the activity (a container query), not
 * the window, so it behaves the same inside a lesson, a laboratory and focus mode.
 *
 * Findings are recorded into a small notebook that lasts for the laboratory session (`LabSessionProvider`). Recording is the
 * student's choice and is never counted as mastery; inside a lesson task the shell also forwards it to the lesson's progress.
 */

import React, { createContext, useContext, useId } from 'react';

export interface LabFinding { label: string; value: string }

export interface LabSession {
  findings: LabFinding[];
  record: (finding: LabFinding) => void;
  clear: () => void;
}

const LabSessionContext = createContext<LabSession | null>(null);
export const LabSessionProvider = LabSessionContext.Provider;
export const useLabSession = () => useContext(LabSessionContext);

type DataAttrs = Record<`data-${string}`, string | number | undefined>;

export interface LabStageProps {
  testId: string;
  alt: string;
  /** `data-*` attributes describing the current state (used by tests and narration). */
  data?: DataAttrs;
  /** The question the investigation answers, in one sentence. */
  question?: React.ReactNode;
  scene: React.ReactNode;
  /** Shown on the scene, for example “Schematic · not to scale” or “Illustrative values”. */
  sceneNote?: string;
  /** Run / Step style buttons: always directly under the scene (beside it on wide screens). */
  actions?: React.ReactNode;
  /** The main controls. */
  controls?: React.ReactNode;
  /** What the student sees now, in words. Announced politely to screen readers. */
  observation: React.ReactNode;
  explanation?: React.ReactNode;
  explanationTitle?: string;
  /** Secondary settings, folded away by default. */
  more?: React.ReactNode;
  moreTitle?: string;
  /** Extra material below everything else (data tables and the like), folded away. */
  extra?: React.ReactNode;
  extraTitle?: string;
  /** The result “Record this result” saves to the notebook. Omit when there is nothing to record. */
  finding?: LabFinding | null;
}

export const LabStage: React.FC<LabStageProps> = ({
  testId, alt, data, question, scene, sceneNote, actions, controls, observation, explanation, explanationTitle = 'Why does this happen?',
  more, moreTitle = 'More settings', extra, extraTitle = 'Data table', finding,
}) => {
  const qid = useId();
  return (
    <div className="lab-stage" data-testid={testId} aria-label={alt} {...data}>
      <div className="lab-stage__grid">
        {question && <p className="lab-stage__question" id={qid}><span aria-hidden className="material-symbols-outlined">help</span><span>{question}</span></p>}
        <figure className="lab-scene m-0" aria-describedby={question ? qid : undefined}>
          {sceneNote && <figcaption className="lab-scene__note">{sceneNote}</figcaption>}
          {scene}
        </figure>
        <div className="lab-stage__side">
          {actions && <div className="lab-actions">{actions}</div>}
          {controls && <div className="lab-controls">{controls}</div>}
          <div className="lab-observation" aria-live="polite" aria-atomic="true" data-testid={`${testId}-observation`}>{observation}</div>
          {more && <details className="lab-fold"><summary>{moreTitle}</summary><div className="lab-fold__body">{more}</div></details>}
          {explanation && <details className="lab-fold"><summary>{explanationTitle}</summary><div className="lab-fold__body">{explanation}</div></details>}
          {extra && <details className="lab-fold"><summary>{extraTitle}</summary><div className="lab-fold__body">{extra}</div></details>}
          {finding && <RecordFinding finding={finding} />}
        </div>
      </div>
    </div>
  );
};

/** “Record this result” plus the session notebook, so results can be compared side by side. Hidden outside a laboratory. */
export const RecordFinding: React.FC<{ finding: LabFinding }> = ({ finding }) => {
  const session = useLabSession();
  if (!session) return null;
  const already = session.findings.some((f) => f.label === finding.label && f.value === finding.value);
  return (
    <section className="lab-notebook" aria-label="Your results" data-testid="lab-notebook">
      <button type="button" className="lab-btn" data-action="record" disabled={already} onClick={() => session.record(finding)}>
        <span aria-hidden className="material-symbols-outlined text-[18px]">edit_note</span>{already ? 'Recorded' : 'Record this result'}
      </button>
      {session.findings.length > 0 && (
        <>
          <table className="lab-notebook__table">
            <caption className="sr-only">Results recorded in this session</caption>
            <thead><tr><th scope="col">Set-up</th><th scope="col">Result</th></tr></thead>
            <tbody>{session.findings.map((f, i) => <tr key={i} data-finding={i}><td>{f.label}</td><td>{f.value}</td></tr>)}</tbody>
          </table>
          <button type="button" className="lab-btn lab-btn--quiet" data-action="clear-notebook" onClick={session.clear}>Clear my results</button>
        </>
      )}
    </section>
  );
};

/** A row of buttons for Run / Step / Reset-style actions, with consistent sizes. */
export const LabButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean; icon?: string }> = ({ primary, icon, className = '', children, ...rest }) => (
  <button type="button" {...rest} className={`lab-btn ${primary ? 'lab-btn--primary' : ''} ${className}`}>
    {icon && <span aria-hidden className="material-symbols-outlined text-[18px]">{icon}</span>}{children}
  </button>
);

/**
 * An optional prediction: the student picks what they expect before looking closely. Nothing is blocked; the observation can
 * compare the prediction with the result (`predictionNote`).
 */
export const LabPredict: React.FC<{ name: string; label: string; value: string | null; options: { id: string; label: string }[]; onChange: (id: string) => void }> = ({ name, label, value, options, onChange }) => (
  <fieldset className="lab-predict">
    <legend>{label} <span className="text-slate-400 font-normal">(optional)</span></legend>
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o.id} type="button" aria-pressed={value === o.id} data-predict={`${name}:${o.id}`} onClick={() => onChange(o.id)}
          className={`lab-chip ${value === o.id ? 'lab-chip--on' : ''}`}>{o.label}</button>
      ))}
    </div>
  </fieldset>
);

export const predictionNote = (predicted: string | null, actual: string, labelOf: (id: string) => string): React.ReactNode =>
  predicted === null ? null : (
    <span className={`lab-verdict ${predicted === actual ? 'lab-verdict--match' : 'lab-verdict--differs'}`} data-prediction={predicted === actual ? 'match' : 'differs'}>
      <span aria-hidden className="material-symbols-outlined text-[16px]">{predicted === actual ? 'check_circle' : 'compare_arrows'}</span>
      {predicted === actual ? `Matches your prediction (${labelOf(predicted)}).` : `You predicted “${labelOf(predicted)}”; the result is “${labelOf(actual)}”.`}
    </span>
  );

/** A small text key for the colours in a scene, so meaning never depends on colour alone. */
export const LabKey: React.FC<{ items: { colour: string; label: string; shape?: 'dot' | 'line' | 'dash' }[] }> = ({ items }) => (
  <ul className="lab-key" aria-label="Key">
    {items.map((it) => (
      <li key={it.label}>
        <span aria-hidden className={`lab-key__swatch lab-key__swatch--${it.shape ?? 'dot'}`} style={{ background: it.shape === 'dash' ? undefined : it.colour, borderColor: it.colour }} />
        {it.label}
      </li>
    ))}
  </ul>
);

/** “Step 2 of 4” navigation for step-through investigations. */
export const LabSteps: React.FC<{ step: number; count: number; onStep: (n: number) => void; labels?: string[] }> = ({ step, count, onStep, labels }) => (
  <div className="lab-steps" role="group" aria-label="Steps">
    <LabButton icon="chevron_left" data-action="step-back" disabled={step <= 0} onClick={() => onStep(step - 1)} aria-label="Previous step">Back</LabButton>
    <span className="lab-steps__status" aria-live="polite">Step {step + 1} of {count}{labels?.[step] ? `: ${labels[step]}` : ''}</span>
    <LabButton primary icon="chevron_right" data-action="step-next" disabled={step >= count - 1} onClick={() => onStep(step + 1)} aria-label="Next step">Next</LabButton>
  </div>
);

export { prefersReducedMotion, useTicker } from '../../components/labMotion';
