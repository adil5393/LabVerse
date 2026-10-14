import React from 'react';
import { useGuidanceStore } from '../../store/useGuidanceStore';

export const GuidanceStrip: React.FC = () => {
  const {
    activeStepIndex,
    steps,
    nextStep,
    prevStep,
    isHintOpen,
    toggleHint,
  } = useGuidanceStore();

  const currentStep = steps[activeStepIndex];
  if (!currentStep) return null;

  const totalSteps = steps.length;
  const isLast = activeStepIndex === totalSteps - 1;
  const isFirst = activeStepIndex === 0;

  return (
    <div className="bg-surface-low border-b border-surface-border px-4 py-2.5 shrink-0 z-30 transition-all select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Step indicator & instructions */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/40 text-primary flex items-center justify-center font-mono font-bold text-xs shrink-0">
            {currentStep.stepNumber}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-primary font-semibold">
                Step {currentStep.stepNumber} of {totalSteps}: {currentStep.title}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-surface-container border border-surface-border text-slate-400">
                Topological Check
              </span>
            </div>
            <p className="text-xs text-slate-300 truncate mt-0.5" title={currentStep.instruction}>
              {currentStep.instruction}
            </p>
          </div>
        </div>

        {/* Step controls */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <button
            onClick={toggleHint}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all ${
              isHintOpen
                ? 'bg-secondary/20 border-secondary text-secondary font-semibold'
                : 'bg-surface-card border-surface-border text-slate-300 hover:text-white hover:bg-surface-elevated'
            }`}
            title="Toggle instructional hint"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">lightbulb</span>
            <span>Hint</span>
          </button>

          <button
            onClick={prevStep}
            disabled={isFirst}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1 transition-all ${
              isFirst
                ? 'opacity-40 cursor-not-allowed border-surface-border text-slate-500'
                : 'bg-surface-card border-surface-border text-slate-200 hover:text-white hover:bg-surface-elevated'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">navigate_before</span>
            <span>Back</span>
          </button>

          <button
            onClick={nextStep}
            disabled={isLast}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              isLast
                ? 'opacity-40 cursor-not-allowed bg-surface-card text-slate-500 border border-surface-border'
                : 'bg-primary hover:bg-primary-dim text-white shadow-sm'
            }`}
          >
            <span>Next Step</span>
            <span className="material-symbols-outlined text-[16px]">navigate_next</span>
          </button>
        </div>
      </div>

      {/* Expanded Hint Drawer */}
      {isHintOpen && (
        <div className="mt-2.5 pt-2.5 border-t border-surface-border/60 text-xs text-slate-300 flex items-start gap-2 max-w-7xl mx-auto bg-surface-lowest/70 p-3 rounded-lg border border-secondary/30">
          <span className="material-symbols-outlined text-secondary text-base shrink-0 mt-0.5">tips_and_updates</span>
          <div className="space-y-1">
            <span className="font-semibold text-secondary">Guidance Hint:</span>
            <p className="text-slate-300">{currentStep.hint}</p>
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              Objective: {currentStep.learningObjective}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
