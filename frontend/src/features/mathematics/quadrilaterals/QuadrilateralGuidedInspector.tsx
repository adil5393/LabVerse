/**
 * Guided Lesson Inspector Panel for Class 9 Quadrilaterals (Milestone M3)
 * NCERT Ganita Manjari Part II, Chapter 12
 *
 * Implements the student-centric 6-Stage learning orchestrator:
 * - Stage A (Understand): Accessible concept introduction, detailed points, key terms
 * - Stage B (Predict): Meaningful prediction recording without premature answers or penalizing gating
 * - Stage C (Experiment): Action guidance with real-time interaction progress and teacher bypass
 * - Stage D (Observe): Genuine computed values from authoritative geometry engine
 * - Stage E (Understand Why): Deductive reasoning and Euclidean proof steps
 * - Stage F (Practise): 1-3 targeted practice questions with hint revelation, validation, and worked solutions
 * - Lesson Complete banner: Celebratory progression directly linking to Next Lesson
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuadGuidedLearningStore } from '../../../store/useQuadGuidedLearningStore';
import { useQuadrilateralStore } from '../../../store/useQuadrilateralStore';
import {
  QUAD_GUIDED_LESSONS,
  ORDERED_QUAD_LESSON_IDS,
} from '../../../engine/mathematics/quadrilaterals/curriculumPath';
import { CHAPTER_PRACTICE_BANK } from '../../../engine/mathematics/quadrilaterals/practiceBank';
import {
  classifyQuadrilateral,
  computeVarignonParallelogram,
  computeTriangleMedians,
  validatePracticeAnswer,
} from '../../../engine/mathematics/quadrilaterals/geometry';
import type { PracticeQuestion } from '../../../engine/mathematics/quadrilaterals/types';

function resolveQuestion(id: string): PracticeQuestion | undefined {
  return CHAPTER_PRACTICE_BANK.find((q) => q.id === id);
}

export const QuadrilateralGuidedInspector: React.FC = () => {
  const navigate = useNavigate();

  const {
    activeLessonId,
    activeStage,
    nextStage,
    recordPrediction,
    recordObservation,
    recordPracticeResult,
    completeLesson,
    selectLesson,
    completedLessonIds,
  } = useQuadGuidedLearningStore();

  const {
    points,
    quadrilaterals,
    triangles,
    manipulationPositionsRecorded,
  } = useQuadrilateralStore();

  const lesson =
    QUAD_GUIDED_LESSONS[activeLessonId] || QUAD_GUIDED_LESSONS['quad-l1'];

  // Local state
  const [selectedPrediction, setSelectedPrediction] = useState<number | null>(null);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  const [practiceInput, setPracticeInput] = useState<string>('');
  const [selectedMcq, setSelectedMcq] = useState<number | null>(null);
  // Hints and solutions are tracked PER QUESTION, so help on one question is
  // neither shown on the next nor counted against it.
  const [assistByQ, setAssistByQ] = useState<Record<string, { hints: number; solution: boolean }>>({});
  const [practiceFeedback, setPracticeFeedback] = useState<{
    isCorrect: boolean;
    message: string;
  } | null>(null);
  const [observationsTable, setObservationsTable] = useState<
    { id: string; time: string; metricName: string; value: string; invariant: string }[]
  >([]);

  // Practice questions for this lesson
  const practiceQuestions = lesson.practiceQuestionIds
    .map(resolveQuestion)
    .filter((q): q is PracticeQuestion => Boolean(q));

  const currentQ = practiceQuestions[activeQuestionIdx] || practiceQuestions[0];
  const hintsRevealed = currentQ ? assistByQ[currentQ.id]?.hints ?? 0 : 0;
  const showSolution = currentQ ? assistByQ[currentQ.id]?.solution ?? false : false;
  const setHintsRevealed = (fn: (prev: number) => number) => {
    if (!currentQ) return;
    setAssistByQ((m) => ({ ...m, [currentQ.id]: { hints: fn(m[currentQ.id]?.hints ?? 0), solution: m[currentQ.id]?.solution ?? false } }));
  };
  const setShowSolution = (v: boolean) => {
    if (!currentQ) return;
    setAssistByQ((m) => ({ ...m, [currentQ.id]: { hints: m[currentQ.id]?.hints ?? 0, solution: v } }));
  };
  // Asking to see the solution at any point counts as help for this question.
  const solutionEverShown = currentQ ? Boolean(assistByQ[currentQ.id]?.solution) : false;
  const isLessonFinished = completedLessonIds.includes(lesson.id);

  // Geometric computations for observation stage
  const firstQuad = Object.values(quadrilaterals)[0];
  const firstTri = Object.values(triangles)[0];

  const quadAnalysis =
    firstQuad &&
    points[firstQuad.p1Id] &&
    points[firstQuad.p2Id] &&
    points[firstQuad.p3Id] &&
    points[firstQuad.p4Id]
      ? classifyQuadrilateral(
          points[firstQuad.p1Id],
          points[firstQuad.p2Id],
          points[firstQuad.p3Id],
          points[firstQuad.p4Id]
        )
      : null;

  const varignonMetrics =
    firstQuad &&
    points[firstQuad.p1Id] &&
    points[firstQuad.p2Id] &&
    points[firstQuad.p3Id] &&
    points[firstQuad.p4Id]
      ? computeVarignonParallelogram(
          points[firstQuad.p1Id],
          points[firstQuad.p2Id],
          points[firstQuad.p3Id],
          points[firstQuad.p4Id]
        )
      : null;

  const triangleMedians =
    firstTri &&
    points[firstTri.p1Id] &&
    points[firstTri.p2Id] &&
    points[firstTri.p3Id]
      ? computeTriangleMedians(
          points[firstTri.p1Id],
          points[firstTri.p2Id],
          points[firstTri.p3Id]
        )
      : null;

  // Handle Prediction Submit
  const handleSelectPrediction = (index: number) => {
    setSelectedPrediction(index);
    if (lesson.predictionQuestion) {
      const isCorrect = index === lesson.predictionQuestion.correctIndex;
      recordPrediction(lesson.id, lesson.predictionQuestion.options[index], isCorrect);
    }
  };

  // Handle Observation Capture
  const handleCaptureObservation = () => {
    let metricName = 'Geometry Metric';
    let value = 'Valid';
    let invariant = lesson.observeGuide.expectedPattern;

    if (quadAnalysis) {
      metricName = `Angle Sum (A+B+C+D)`;
      value = quadAnalysis.isSimple
        ? `${quadAnalysis.angleSum.toFixed(1)}° (${quadAnalysis.kind.toUpperCase()})`
        : `N/A (${quadAnalysis.kind.toUpperCase()} - Undefined)`;
    } else if (triangleMedians) {
      metricName = `Centroid Ratio (AG : GD)`;
      value = `${triangleMedians.ratioA.toFixed(2)}:1`;
    } else if (varignonMetrics) {
      metricName = `Varignon Area Ratio`;
      value = `${(varignonMetrics.ratio * 100).toFixed(1)}%`;
    }

    const newEntry = {
      id: `obs_${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      metricName,
      value,
      invariant,
    };

    setObservationsTable((prev) => [newEntry, ...prev]);
    recordObservation(lesson.id);
  };

  // Handle Practice Answer Check
  const handleCheckAnswer = () => {
    if (!currentQ) return;
    const answer =
      currentQ.questionType === 'multiple_choice' && selectedMcq !== null
        ? currentQ.options?.[selectedMcq] || ''
        : practiceInput;

    const isCorrect = validatePracticeAnswer(
      answer,
      currentQ.correctAnswer,
      currentQ.acceptableTolerance
    );

    setPracticeFeedback({
      isCorrect,
      message: isCorrect
        ? 'Correct! Outstanding geometrical reasoning.'
        : 'Not quite. Check the hint or try recalculating.',
    });

    recordPracticeResult(lesson.id, currentQ.id, isCorrect, practiceQuestions.length, { assisted: hintsRevealed > 0 || showSolution || solutionEverShown });

    if (isCorrect && activeQuestionIdx === practiceQuestions.length - 1) {
      completeLesson(lesson.id);
    }
  };

  // Next Lesson Navigation
  const handleNextLesson = () => {
    const curIdx = ORDERED_QUAD_LESSON_IDS.indexOf(lesson.id);
    if (curIdx >= 0 && curIdx < ORDERED_QUAD_LESSON_IDS.length - 1) {
      const nextId = ORDERED_QUAD_LESSON_IDS[curIdx + 1];
      selectLesson(nextId, 'understand');
      navigate(`/mathematics/quadrilaterals/workbench?lesson=${nextId}`);
    } else {
      navigate('/mathematics/quadrilaterals');
    }
  };

  return (
    <aside className="w-80 lg:w-96 bg-surface-low border-l border-surface-border flex flex-col h-full overflow-hidden shrink-0 select-none z-10 font-sans">
      {/* Header */}
      <div className="p-4 border-b border-surface-border bg-surface-card/60 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Lesson {lesson.lessonNumber}</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400">{lesson.unitTitle}</span>
        </div>
        <h2 className="text-base font-black text-white leading-tight">{lesson.title}</h2>
        <p className="text-xs text-amber-300/80 font-medium">{lesson.subtitle}</p>
      </div>

      {/* Main Stage Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* ========================================================= */}
        {/* STAGE 1: UNDERSTAND */}
        {/* ========================================================= */}
        {activeStage === 'understand' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-surface-card border border-surface-border space-y-2.5 shadow-sm">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                Learning Objective
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {lesson.learningObjective}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-slate-300 block">
                Core Concepts
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {lesson.concept.summary}
              </p>
              <ul className="space-y-2 pt-1">
                {lesson.concept.detailedPoints.map((pt, idx) => (
                  <li key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {lesson.concept.keyTerms && lesson.concept.keyTerms.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-surface-border/60">
                <span className="text-xs font-mono font-bold text-slate-300 block">
                  Key Terminology
                </span>
                <div className="space-y-2">
                  {lesson.concept.keyTerms.map((term, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-surface-lowest border border-surface-border/40 space-y-0.5">
                      <span className="text-xs font-bold text-amber-300 font-mono block">
                        {term.term}
                      </span>
                      <span className="text-[11px] text-slate-400 block leading-snug">
                        {term.definition}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={nextStage}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 mt-4"
            >
              <span>Next: Make a Prediction</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 2: PREDICT */}
        {/* ========================================================= */}
        {activeStage === 'predict' && lesson.predictionQuestion && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                Question for Thought
              </span>
              <p className="text-xs text-slate-100 font-medium leading-relaxed">
                {lesson.predictionQuestion.question}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-slate-300 block">
                Select your prediction:
              </span>
              <div className="space-y-2">
                {lesson.predictionQuestion.options.map((opt, idx) => {
                  const isSelected = selectedPrediction === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectPrediction(idx)}
                      className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 text-white font-medium shadow-md'
                          : 'bg-surface-card border-surface-border text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 ${
                        isSelected ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-surface-elevated text-slate-400'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="leading-snug">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedPrediction !== null && (
              <div className="p-3.5 rounded-xl bg-surface-lowest border border-surface-border space-y-1.5 animate-fadeIn">
                <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
                  Prediction Insight
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {lesson.predictionQuestion.explanation}
                </p>
              </div>
            )}

            <button
              onClick={nextStage}
              disabled={selectedPrediction === null}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 mt-4"
            >
              <span>Next: Test on Canvas</span>
              <span className="material-symbols-outlined text-[16px]">science</span>
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 3: EXPERIMENT */}
        {/* ========================================================= */}
        {activeStage === 'experiment' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">touch_app</span>
                <span>Canvas Task</span>
              </span>
              <p className="text-xs text-slate-100 font-medium leading-relaxed">
                {lesson.experimentGuide.instruction}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-card border border-surface-border space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                Manipulation Progress
              </span>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">Vertex transformations:</span>
                <span className="font-bold text-cyan-400">
                  {manipulationPositionsRecorded} / {lesson.experimentGuide.minInteractionsNeeded || 2}
                </span>
              </div>
              <div className="h-1.5 w-full bg-surface-lowest rounded-full overflow-hidden border border-surface-border">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      (manipulationPositionsRecorded /
                        (lesson.experimentGuide.minInteractionsNeeded || 2)) *
                        100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-lowest border border-surface-border/60 text-xs text-slate-400 leading-snug">
              <span className="font-bold text-slate-300 font-mono text-[11px] block mb-1">
                Teacher Demonstration Bypass:
              </span>
              If using a classroom Smart-TV or projector, click "Skip Gate" on the top toolbar to proceed immediately without manual dragging.
            </div>

            <button
              onClick={nextStage}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 mt-4"
            >
              <span>Next: Observe Data</span>
              <span className="material-symbols-outlined text-[16px]">visibility</span>
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 4: OBSERVE */}
        {/* ========================================================= */}
        {activeStage === 'observe' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-surface-card border border-surface-border space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                What to Observe
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {lesson.observeGuide.prompt}
              </p>
              <div className="p-2.5 rounded-lg bg-surface-lowest border border-amber-500/30 text-xs text-amber-300 font-mono">
                {lesson.observeGuide.expectedPattern}
              </div>
            </div>

            {/* Live Values Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-300">
                  Live Geometry Snapshot
                </span>
                <button
                  onClick={handleCaptureObservation}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-bold font-mono transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">add_circle</span>
                  <span>Capture Observation</span>
                </button>
              </div>

              {observationsTable.length === 0 ? (
                <div className="p-4 rounded-xl bg-surface-lowest border border-surface-border/60 text-center text-xs text-slate-500">
                  Click "Capture Observation" to record calculated values.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {observationsTable.map((obs) => (
                    <div
                      key={obs.id}
                      className="p-2.5 rounded-xl bg-surface-lowest border border-surface-border text-xs space-y-1 font-mono"
                    >
                      <div className="flex justify-between text-slate-400 text-[10px]">
                        <span>{obs.time}</span>
                        <span className="text-emerald-400">Consistent</span>
                      </div>
                      <div className="text-slate-200 font-bold">{obs.metricName}</div>
                      <div className="text-amber-400">{obs.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={nextStage}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 mt-4"
            >
              <span>Next: Understand Why</span>
              <span className="material-symbols-outlined text-[16px]">verified</span>
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 5: EXPLAIN & PROOF */}
        {/* ========================================================= */}
        {activeStage === 'explain' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-surface-card border border-surface-border space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                Deductive Mathematical Reasoning
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {lesson.whyGuide.explanation}
              </p>
            </div>

            {/* Proof Steps if Available */}
            {lesson.whyGuide.proofSteps && lesson.whyGuide.proofSteps.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-slate-300 block">
                  Two-Column Euclidean Proof
                </span>
                <div className="space-y-2">
                  {lesson.whyGuide.proofSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-surface-lowest border border-surface-border/60 text-xs space-y-1 font-mono"
                    >
                      <div className="flex items-start gap-1.5 text-slate-200 font-medium">
                        <span className="text-amber-400 font-bold">{idx + 1}.</span>
                        <span>{step.statement}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 pl-4 border-l border-amber-500/30">
                        Reason: <span className="text-emerald-400">{step.reason}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                Key Takeaway
              </span>
              <p className="text-xs text-emerald-200 leading-relaxed font-sans">
                {lesson.whyGuide.deductiveTakeaway}
              </p>
            </div>

            <button
              onClick={nextStage}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 mt-4"
            >
              <span>Next: Practise Questions</span>
              <span className="material-symbols-outlined text-[16px]">edit_note</span>
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 6: PRACTICE */}
        {/* ========================================================= */}
        {activeStage === 'practice' && currentQ && (
          <div className="space-y-4">
            {/* Question Counter Header */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-surface-border/60 pb-2">
              <span>
                Question {activeQuestionIdx + 1} of {practiceQuestions.length}
              </span>
              <span className="capitalize px-2 py-0.5 rounded bg-surface-elevated text-slate-300">
                {currentQ.difficulty}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-card border border-surface-border space-y-2">
              <h3 className="font-bold text-white text-xs leading-snug">{currentQ.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {currentQ.statement}
              </p>
            </div>

            {/* MCQ Options */}
            {currentQ.questionType === 'multiple_choice' && currentQ.options && (
              <div className="space-y-2">
                {currentQ.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedMcq(idx);
                      setPracticeFeedback(null);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-start gap-2 ${
                      selectedMcq === idx
                        ? 'bg-amber-500/20 border-amber-500 text-white font-medium'
                        : 'bg-surface-lowest border-surface-border text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-surface-elevated text-slate-400 flex items-center justify-center text-[10px] font-mono shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-snug">{opt}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Numerical Answer Input */}
            {currentQ.questionType === 'numerical' && (
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400 block">
                  Your Answer ({currentQ.unit || 'numeric value'}):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="any"
                    value={practiceInput}
                    onChange={(e) => {
                      setPracticeInput(e.target.value);
                      setPracticeFeedback(null);
                    }}
                    placeholder="Enter numerical answer"
                    className="flex-1 bg-surface-card border border-surface-border rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                  {currentQ.unit && (
                    <span className="text-xs font-mono text-slate-400">{currentQ.unit}</span>
                  )}
                </div>
              </div>
            )}

            {/* Check Button */}
            <button
              onClick={handleCheckAnswer}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <span>Check Answer</span>
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
            </button>

            {/* Feedback Message */}
            {practiceFeedback && (
              <div
                className={`p-3 rounded-xl border text-xs font-medium ${
                  practiceFeedback.isCorrect
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : 'bg-red-950/40 border-red-500/50 text-red-300'
                }`}
              >
                {practiceFeedback.message}
              </div>
            )}

            {/* Hints & Worked Solution Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-surface-border/60 text-xs font-mono">
              <button
                onClick={() => setHintsRevealed((prev) => Math.min(prev + 1, currentQ.hints.length))}
                disabled={hintsRevealed >= currentQ.hints.length}
                className="text-amber-400 hover:text-amber-300 disabled:opacity-40 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px]">lightbulb</span>
                <span>Hint ({hintsRevealed}/{currentQ.hints.length})</span>
              </button>

              <button
                onClick={() => setShowSolution(!showSolution)}
                className="text-slate-400 hover:text-white flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px]">menu_book</span>
                <span>{showSolution ? 'Hide Solution' : 'Worked Solution'}</span>
              </button>
            </div>

            {/* Revealed Hints */}
            {hintsRevealed > 0 && (
              <div className="space-y-1.5 p-3 rounded-xl bg-surface-lowest border border-amber-500/30">
                {currentQ.hints.slice(0, hintsRevealed).map((h, i) => (
                  <div key={i} className="text-xs text-amber-200/90 leading-snug">
                    <span className="font-bold font-mono">Hint {i + 1}:</span> {h}
                  </div>
                ))}
              </div>
            )}

            {/* Worked Solution */}
            {showSolution && (
              <div className="p-3 rounded-xl bg-surface-lowest border border-surface-border space-y-1.5 text-xs text-slate-300 font-mono">
                <span className="font-bold text-white block">Step-by-step Solution:</span>
                {currentQ.workedSolution.map((s, idx) => (
                  <div key={idx} className="leading-snug text-slate-400">
                    • {s}
                  </div>
                ))}
              </div>
            )}

            {/* Next / Previous Question Navigation */}
            {practiceQuestions.length > 1 && (
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    setActiveQuestionIdx((prev) => Math.max(0, prev - 1));
                    setPracticeFeedback(null);
                    setPracticeInput('');
                    setSelectedMcq(null);
                  }}
                  disabled={activeQuestionIdx === 0}
                  className="px-3 py-1.5 rounded-lg bg-surface-elevated text-xs font-mono disabled:opacity-30"
                >
                  Previous Q
                </button>
                <button
                  onClick={() => {
                    setActiveQuestionIdx((prev) => Math.min(practiceQuestions.length - 1, prev + 1));
                    setPracticeFeedback(null);
                    setPracticeInput('');
                    setSelectedMcq(null);
                  }}
                  disabled={activeQuestionIdx === practiceQuestions.length - 1}
                  className="px-3 py-1.5 rounded-lg bg-surface-elevated text-xs font-mono disabled:opacity-30"
                >
                  Next Q
                </button>
              </div>
            )}

            {/* Lesson Complete Banner */}
            {isLessonFinished && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-surface-card border border-emerald-500/50 space-y-3 mt-4 animate-fadeIn shadow-lg">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <span className="material-symbols-outlined text-[20px]">verified</span>
                  <span>Lesson Complete!</span>
                </div>
                <p className="text-xs text-slate-300 leading-snug">
                  You have mastered Lesson {lesson.lessonNumber}: {lesson.title}. Ready for the next lesson!
                </p>
                <button
                  onClick={handleNextLesson}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
                >
                  <span>Continue to Next Lesson</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
