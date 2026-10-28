/**
 * Shared helpers for moving an older guided-workbench chapter (Circles, Quadrilaterals) onto the unified framework. Pure.
 *
 * An older guided lesson had six stages. Its Predict stage becomes a `prediction`, its Experiment and Observe stages become a
 * laboratory task in the same workbench, and its proof becomes numbered proof lines (with "choose the reason" where the older
 * lesson asked for a missing reason). Nothing is added as a new step, so no student's completion status changes.
 */

import type { EduLesson, ExplainerStep, LabTask, PredictionPrompt, ProofStep } from '../../education/types';
import type { GuidedLessonDefinition } from './types';

export function guidedLabTask(l: GuidedLessonDefinition, workbenchPath: string): LabTask {
  const needed = l.experimentGuide.minInteractionsNeeded ?? 2;
  return {
    id: `lt-${l.id}`,
    title: `Investigate: ${l.title}`,
    instruction: `${l.experimentGuide.instruction} ${l.experimentGuide.actionHint}`,
    href: `${workbenchPath}?exp=${encodeURIComponent(l.experimentId)}&mode=explore`,
    setup: { experimentId: l.experimentId, allowedTools: l.allowedTools, highlightedObjectIds: l.highlightedObjectIds ?? [], autoFitRadius: l.autoFitRadius },
    goals: [
      { id: 'explore', label: l.experimentGuide.targetActionDescription, events: ['figure-changed'], count: needed },
      { id: 'observe', label: `Record a measurement${l.experimentGuide.targetMetric ? ` (${l.experimentGuide.targetMetric})` : ''}`, events: ['observation'], count: 1 },
    ],
    observePrompt: l.observeGuide.prompt,
    expectedPattern: `${l.observeGuide.expectedPattern} ${l.observeGuide.invariantsDescription}`.trim(),
    // The older path never required the investigation for mastery; neither does this one (no student's status changes).
    requiredForMastery: false,
  };
}

export function guidedPrediction(l: GuidedLessonDefinition): PredictionPrompt | undefined {
  const p = l.predictionQuestion;
  return p ? { id: `pred-${l.id}`, prompt: p.question, options: p.options.map((text, k) => ({ id: `p${k}`, text })), expectedId: `p${p.correctIndex}`, reveal: p.explanation } : undefined;
}

export function guidedProof(l: GuidedLessonDefinition): ProofStep[] {
  return (l.whyGuide.proofSteps ?? []).map((p) => (p.missingReasonOptions?.length && p.correctReasonIndex !== undefined && p.missingReasonOptions[p.correctReasonIndex]
    ? { claim: p.statement, reason: p.missingReasonOptions[p.correctReasonIndex], reasonChoices: p.missingReasonOptions }
    : { claim: p.statement, reason: p.reason }));
}

/**
 * Attach one or more older lessons to a current lesson. The k-th older lesson's prediction and task go on step k (the last step
 * when there are fewer steps). Older proofs go on the reasoning step when the current lesson has no numbered proof; when several
 * older lessons have proofs, the first that brings "choose the reason" lines (or else the first) is used and recorded in `proofFrom`.
 */
export function enrichFromGuided(lesson: EduLesson, olders: GuidedLessonDefinition[], workbenchPath: string): EduLesson {
  if (!olders.length) return lesson;
  const tasks = olders.map((l) => guidedLabTask(l, workbenchPath));
  const hasProof = lesson.steps.some((s) => s.proof?.length);
  const proofSource = olders.find((l) => l.whyGuide.proofSteps?.some((p) => p.missingReasonOptions?.length)) ?? olders.find((l) => l.whyGuide.proofSteps?.length);
  const olderProof = proofSource ? guidedProof(proofSource) : [];
  const reasoningIdx = lesson.steps.findIndex((s) => s.phase === 'reasoning' || s.phase === 'proof');
  const proofIdx = reasoningIdx >= 0 ? reasoningIdx : lesson.steps.length - 1;
  const last = lesson.steps.length - 1;
  const steps: ExplainerStep[] = lesson.steps.map((s) => ({ ...s }));
  olders.forEach((l, k) => {
    const i = Math.min(k, last);
    const step = steps[i];
    // Only one prediction and one task per step: later older lessons on the same step go to the next free step.
    let target = i;
    if (step.labTaskId || step.prediction) target = steps.findIndex((x) => !x.labTaskId && !x.prediction);
    if (target < 0) {
      // No free step: the task is listed after the last step, and its prediction travels with it (asked before it opens).
      tasks[k] = { ...tasks[k], prediction: guidedPrediction(l) };
      return;
    }
    steps[target] = { ...steps[target], labTaskId: tasks[k].id, prediction: guidedPrediction(l) };
  });
  if (!hasProof && olderProof.length) steps[proofIdx] = { ...steps[proofIdx], proof: olderProof };
  // A task that found no free step is still shown: the lesson page lists unlinked tasks after the last Understand step.
  return { ...lesson, steps, labTasks: [...(lesson.labTasks ?? []), ...tasks] };
}
