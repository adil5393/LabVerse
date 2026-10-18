/**
 * Guided Lesson Panel Component (Milestone M4)
 * Class 9 NCERT Ganita Manjari: Propositions and Their Converses
 */

import React, { useState } from 'react';
import { usePropositionsStore } from '../../../store/usePropositionsStore';
import { PROP_GUIDED_LESSONS } from '../../../engine/mathematics/propositions/curriculumPath';
import type { GuidedStageId } from '../../../engine/mathematics/guidedLearning/types';

interface GuidedLessonPanelProps {
  onClose?: () => void;
}

const STAGE_LABELS: Record<GuidedStageId, { label: string; icon: string }> = {
  understand: { label: '1. Understand', icon: 'lightbulb' },
  predict: { label: '2. Predict', icon: 'psychology' },
  experiment: { label: '3. Experiment', icon: 'science' },
  observe: { label: '4. Observe', icon: 'visibility' },
  explain: { label: '5. Deduce / Prove', icon: 'verified' },
  practice: { label: '6. Practise', icon: 'fitness_center' },
};

export const GuidedLessonPanel: React.FC<GuidedLessonPanelProps> = ({ onClose }) => {
  const {
    activeLessonId,
    activeStage,
    setStage,
    lessons,
    recordPrediction,
    advanceToNextStage,
    setMode,
    selectPracticeQuestion,
  } = usePropositionsStore();

  const lesson = PROP_GUIDED_LESSONS[activeLessonId] || PROP_GUIDED_LESSONS['prop-l1'];
  const lessonProgress = lessons[activeLessonId];

  const [selectedPrediction, setSelectedPrediction] = useState<number | null>(
    lessonProgress?.predictionSelectedOption ?? null
  );

  const handleSelectPrediction = (index: number) => {
    if (!lesson.predictionQuestion) return;
    setSelectedPrediction(index);
    const isCorrect = index === lesson.predictionQuestion.correctIndex;
    recordPrediction(index, isCorrect);
  };

  const stages = lesson.stages;

  return (
    <aside className="w-80 lg:w-96 bg-surface-low border-l border-surface-border flex flex-col h-full overflow-hidden shrink-0 select-none z-10 font-sans">
      {/* 1. Header with Close and Unit Info */}
      <div className="p-4 border-b border-surface-border bg-surface-card/60 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Guided Reasoning</span>
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
              title="Close Panel"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>
        <h2 className="text-sm font-bold text-white truncate">{lesson.title}</h2>
        <p className="text-[11px] text-slate-400 line-clamp-2">{lesson.learningObjective}</p>
      </div>

      {/* 2. Interactive Stage Navigation Rail */}
      <div className="flex items-center gap-1 px-4 py-2 bg-surface-lowest/70 border-b border-surface-border overflow-x-auto text-xs font-mono scrollbar-none">
        {stages.map((stg) => {
          const isActive = activeStage === stg;
          const isDone = lessonProgress?.stagesCompleted[stg];
          return (
            <button
              key={stg}
              onClick={() => setStage(stg)}
              className={`px-2 py-1 rounded-lg shrink-0 flex items-center gap-1 font-bold text-[11px] transition-all ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : isDone
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-surface-card text-slate-400 border border-surface-border/50 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">
                {STAGE_LABELS[stg].icon}
              </span>
              <span>{STAGE_LABELS[stg].label.split(' ')[1]}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Stage Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
        {/* STAGE: UNDERSTAND */}
        {activeStage === 'understand' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-surface-card border border-surface-border space-y-2">
              <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">lightbulb</span>
                <span>Core Concept</span>
              </span>
              <p className="text-slate-200 leading-relaxed font-medium">
                {lesson.concept.summary}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">
                Key Observations:
              </span>
              <ul className="space-y-2">
                {lesson.concept.detailedPoints.map((pt, i) => (
                  <li
                    key={i}
                    className="p-2.5 rounded-xl bg-surface-lowest/80 border border-surface-border/50 text-slate-300 flex items-start gap-2 leading-snug"
                  >
                    <span className="text-amber-400 font-bold shrink-0">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {lesson.concept.keyTerms && lesson.concept.keyTerms.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-surface-border/60">
                <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">
                  Terminology:
                </span>
                <div className="space-y-1.5">
                  {lesson.concept.keyTerms.map((kt, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-surface-lowest/60 border border-surface-border/40 text-[11px]"
                    >
                      <span className="font-bold text-white font-mono">{kt.term}: </span>
                      <span className="text-slate-300">{kt.definition}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STAGE: PREDICT */}
        {activeStage === 'predict' && lesson.predictionQuestion && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-surface-card border border-surface-border space-y-3">
              <span className="text-xs font-mono font-bold text-purple-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">psychology</span>
                <span>Predict Before Testing</span>
              </span>
              <p className="text-slate-100 font-semibold leading-relaxed">
                {lesson.predictionQuestion.question}
              </p>
            </div>

            <div className="space-y-2">
              {lesson.predictionQuestion.options.map((opt, idx) => {
                const isSelected = selectedPrediction === idx;
                const isSubmitted = selectedPrediction !== null;
                const isCorrect = idx === lesson.predictionQuestion!.correctIndex;

                let optClass = 'bg-surface-lowest border-surface-border text-slate-300 hover:bg-surface-elevated';
                if (isSubmitted) {
                  if (isSelected && isCorrect) {
                    optClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-semibold';
                  } else if (isSelected && !isCorrect) {
                    optClass = 'bg-rose-500/20 border-rose-500 text-rose-200 font-semibold';
                  } else if (isCorrect) {
                    optClass = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isSubmitted}
                    onClick={() => handleSelectPrediction(idx)}
                    className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 ${optClass}`}
                  >
                    <span className="w-5 h-5 rounded-full border border-surface-border flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-snug">{opt}</span>
                  </button>
                );
              })}
            </div>

            {selectedPrediction !== null && (
              <div className="p-3.5 rounded-xl bg-surface-lowest border border-surface-border/80 text-xs space-y-1.5 font-mono">
                <span className="font-bold text-amber-400 block">Deductive Feedback:</span>
                <p className="text-slate-300 leading-relaxed font-sans">
                  {lesson.predictionQuestion.explanation}
                </p>
              </div>
            )}
          </div>
        )}

        {/* STAGE: EXPERIMENT */}
        {activeStage === 'experiment' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-surface-card border border-surface-border space-y-2">
              <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">science</span>
                <span>Interactive Experiment Task</span>
              </span>
              <p className="text-slate-200 font-medium leading-relaxed">
                {lesson.experimentGuide.instruction}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs font-mono space-y-1.5">
              <span className="text-cyan-300 font-bold block flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">tips_and_updates</span>
                <span>Action Hint</span>
              </span>
              <p className="text-slate-300 font-sans">{lesson.experimentGuide.actionHint}</p>
            </div>

            <div className="p-3 rounded-xl bg-surface-lowest border border-surface-border/50 text-[11px] text-slate-400">
              <span className="font-bold text-slate-300">Goal: </span>
              <span>{lesson.experimentGuide.targetActionDescription}</span>
            </div>
          </div>
        )}

        {/* STAGE: OBSERVE */}
        {activeStage === 'observe' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-surface-card border border-surface-border space-y-2">
              <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">visibility</span>
                <span>What Did You Observe?</span>
              </span>
              <p className="text-slate-200 font-medium leading-relaxed">
                {lesson.observeGuide.prompt}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-1">
              <span className="font-bold text-emerald-300 font-mono block">Expected Pattern:</span>
              <p className="text-slate-300 font-sans">{lesson.observeGuide.expectedPattern}</p>
            </div>

            <div className="p-3 rounded-xl bg-surface-lowest border border-surface-border/60 text-xs font-mono space-y-1">
              <span className="font-bold text-amber-400 block">Logical Invariant:</span>
              <p className="text-slate-300 font-sans">{lesson.observeGuide.invariantsDescription}</p>
            </div>
          </div>
        )}

        {/* STAGE: EXPLAIN / PROVE */}
        {activeStage === 'explain' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-surface-card border border-surface-border space-y-2">
              <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">verified</span>
                <span>Deductive Takeaway</span>
              </span>
              <p className="text-slate-200 leading-relaxed font-sans">
                {lesson.whyGuide.explanation}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-950/25 border border-amber-500/40 text-xs font-mono space-y-1">
              <span className="font-bold text-amber-300 block">Formal Principle:</span>
              <p className="text-slate-200 font-sans font-semibold">
                "{lesson.whyGuide.deductiveTakeaway}"
              </p>
            </div>
          </div>
        )}

        {/* STAGE: PRACTICE */}
        {activeStage === 'practice' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-surface-card border border-surface-border space-y-2">
              <span className="text-xs font-mono font-bold text-purple-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">fitness_center</span>
                <span>Practice & Mastery</span>
              </span>
              <p className="text-slate-300 leading-relaxed">
                Test your understanding with NCERT Ganita Manjari questions aligned with this lesson.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">
                Related Questions:
              </span>
              {lesson.practiceQuestionIds.map((qid) => (
                <button
                  key={qid}
                  onClick={() => {
                    selectPracticeQuestion(qid);
                    setMode('practice');
                  }}
                  className="w-full p-2.5 rounded-xl bg-surface-lowest border border-surface-border hover:bg-surface-elevated text-left text-xs font-mono flex items-center justify-between text-slate-300 hover:text-white transition-colors"
                >
                  <span className="truncate">{qid}</span>
                  <span className="material-symbols-outlined text-[15px] text-amber-400">arrow_forward</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Bottom Action: Advance Stage */}
      <div className="p-4 border-t border-surface-border bg-surface-card/60">
        <button
          onClick={advanceToNextStage}
          className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all shadow-md"
        >
          <span>
            {activeStage === 'practice' || activeStage === stages[stages.length - 1]
              ? 'Complete Lesson'
              : 'Next Step'}
          </span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </aside>
  );
};
