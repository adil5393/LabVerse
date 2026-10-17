/**
 * Guided Lesson Inspector Panel for Class 9 Circles (Milestone M2.5)
 *
 * Implements the student-centric 6-Stage learning orchestrator:
 * - Stage A (Understand): Accessible concept introduction, highlighted geometry, key terms
 * - Stage B (Predict): Meaningful prediction recording without premature answers or penalizing gating
 * - Stage C (Experiment): Action guidance with real-time interaction progress and teacher bypass
 * - Stage D (Observe): Genuine computed values from authoritative geometry engine
 * - Stage E (Understand Why): Deductive reasoning and Euclidean proof steps
 * - Stage F (Practise): 1-3 targeted practice questions with hint revelation, validation, and worked solutions
 * - Lesson Complete banner: Celebratory progression directly linking to Next Lesson
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuidedLearningStore } from '../../../store/useGuidedLearningStore';
import { useCircleStore } from '../../../store/useCircleStore';
import {
  CIRCLES_GUIDED_LESSONS,
  ORDERED_LESSON_IDS,
} from '../../../engine/mathematics/circles/curriculumPath';
import { CHAPTER_PRACTICE_BANK } from '../../../engine/mathematics/circles/practiceBank';
import { CIRCLE_EXPERIMENTS } from '../../../engine/mathematics/circles/circleExperiments';
import {
  getCircumferenceCoords,
  calculateChordMetrics,
  calculateAngleDegrees,
  validatePracticeAnswer,
} from '../../../engine/mathematics/circles/geometry';
import type { PracticeQuestion } from '../../../engine/mathematics/circles/types';

function resolveQuestion(id: string): PracticeQuestion | undefined {
  const fromBank = CHAPTER_PRACTICE_BANK.find((q) => q.id === id);
  if (fromBank) return fromBank;
  for (const exp of CIRCLE_EXPERIMENTS) {
    const q = exp.practiceQuestions.find((pq) => pq.id === id);
    if (q) return q;
  }
  return undefined;
}

export const CircleGuidedInspector: React.FC = () => {
  const navigate = useNavigate();

  const {
    activeLessonId,
    activeStage,
    setStage,
    nextStage,
    recordPrediction,
    recordInteraction,
    recordObservation,
    recordPracticeResult,
    completeLesson,
    selectLesson,
    lessons,
    completedLessonIds,
  } = useGuidedLearningStore();

  const {
    circles,
    circumferencePoints,
    chords,
    angles,
  } = useCircleStore();

  const lesson =
    CIRCLES_GUIDED_LESSONS[activeLessonId] || CIRCLES_GUIDED_LESSONS['circles-l1'];
  const progress = lessons[lesson.id] || {
    lessonId: lesson.id,
    completed: false,
    currentStage: 'understand',
    interactionsRecorded: 0,
    observationsCaptured: 0,
    proofCompleted: false,
    practiceAttempted: false,
    practiceMastered: false,
    practiceCorrectCount: 0,
    practiceTotalQuestions: 0,
  };

  // Local state
  const [selectedPrediction, setSelectedPrediction] = useState<number | null>(null);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  const [practiceInput, setPracticeInput] = useState<string>('');
  const [selectedMcq, setSelectedMcq] = useState<number | null>(null);
  const [hintsRevealed, setHintsRevealed] = useState<number>(0);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [practiceFeedback, setPracticeFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [observationsTable, setObservationsTable] = useState<
    { id: string; time: string; metricName: string; value: string; invariant: string }[]
  >([]);

  // Practice questions for this lesson
  const practiceQuestions = lesson.practiceQuestionIds
    .map(resolveQuestion)
    .filter((q): q is PracticeQuestion => Boolean(q));

  const currentQ = practiceQuestions[activeQuestionIdx] || practiceQuestions[0];
  const isLessonFinished = completedLessonIds.includes(lesson.id);

  // Geometric entities telemetry
  const primaryCircle = Object.values(circles)[0];
  const pointsList = Object.values(circumferencePoints);
  const chordsList = Object.values(chords);
  const anglesList = Object.values(angles);

  // Submit Prediction
  const handleSubmitPrediction = () => {
    if (selectedPrediction === null || !lesson.predictionQuestion) return;
    const isCorrect = selectedPrediction === lesson.predictionQuestion.correctIndex;
    recordPrediction(
      lesson.id,
      lesson.predictionQuestion.options[selectedPrediction],
      isCorrect
    );
  };

  // Capture Live Observation
  const handleCaptureObservation = () => {
    recordObservation(lesson.id);
    let valueStr = 'Valid Geometry';
    let metricName = 'Distance OA';

    if (primaryCircle && pointsList[0]) {
      const coords = getCircumferenceCoords(primaryCircle, pointsList[0].angleRad);
      const dist = Math.hypot(coords.x - primaryCircle.center.x, coords.y - primaryCircle.center.y);
      valueStr = `${dist.toFixed(2)} units (r = ${primaryCircle.radius.toFixed(1)})`;
      metricName = `Point ${pointsList[0].name} to Center`;
    } else if (primaryCircle && chordsList[0]) {
      const ptA = circumferencePoints[chordsList[0].pointAId];
      const ptB = circumferencePoints[chordsList[0].pointBId];
      if (ptA && ptB) {
        const coordA = getCircumferenceCoords(primaryCircle, ptA.angleRad);
        const coordB = getCircumferenceCoords(primaryCircle, ptB.angleRad);
        const m = calculateChordMetrics(primaryCircle, coordA, coordB);
        valueStr = `Length: ${m.length.toFixed(2)}, Dist: ${m.distFromCenter.toFixed(2)}`;
        metricName = chordsList[0].name;
      }
    } else if (primaryCircle && anglesList[0]) {
      const p1 = circumferencePoints[anglesList[0].point1Id];
      const p2 = circumferencePoints[anglesList[0].point2Id];
      const v =
        anglesList[0].vertexId === 'center'
          ? primaryCircle.center
          : circumferencePoints[anglesList[0].vertexId]
          ? getCircumferenceCoords(primaryCircle, circumferencePoints[anglesList[0].vertexId].angleRad)
          : primaryCircle.center;
      if (p1 && p2) {
        const coord1 = getCircumferenceCoords(primaryCircle, p1.angleRad);
        const coord2 = getCircumferenceCoords(primaryCircle, p2.angleRad);
        const val = calculateAngleDegrees(coord1, v, coord2);
        valueStr = `${val.toFixed(1)}°`;
        metricName = anglesList[0].name;
      }
    }

    setObservationsTable((prev) => [
      ...prev,
      {
        id: `obs_${Date.now()}`,
        time: new Date().toLocaleTimeString(),
        metricName,
        value: valueStr,
        invariant: lesson.observeGuide.expectedPattern,
      },
    ]);
  };

  // Check Practice Answer
  const handleCheckAnswer = () => {
    if (!currentQ) return;

    let isCorrect = false;

    if (currentQ.options && currentQ.options.length > 0) {
      if (selectedMcq === null) return;
      isCorrect =
        selectedMcq === currentQ.correctOptionIndex ||
        currentQ.options[selectedMcq].trim() === String(currentQ.correctAnswer).trim();
    } else {
      isCorrect = validatePracticeAnswer(practiceInput, currentQ.correctAnswer, currentQ.tolerance);
    }

    setPracticeFeedback({
      isCorrect,
      message: isCorrect
        ? 'Excellent! Correct answer.'
        : 'Not quite. Check your calculation or click Reveal Hint.',
    });

    recordPracticeResult(lesson.id, currentQ.id, isCorrect, practiceQuestions.length);

    if (isCorrect && activeQuestionIdx === practiceQuestions.length - 1) {
      completeLesson(lesson.id);
    }
  };

  const handleNextLesson = () => {
    const currentIndex = ORDERED_LESSON_IDS.indexOf(lesson.id);
    if (currentIndex >= 0 && currentIndex < ORDERED_LESSON_IDS.length - 1) {
      const nextId = ORDERED_LESSON_IDS[currentIndex + 1];
      selectLesson(nextId, 'understand');
      navigate(`/mathematics/circles/workbench?lesson=${nextId}`);
    } else {
      navigate('/mathematics/circles');
    }
  };

  return (
    <div className="w-80 sm:w-96 bg-surface-low border-l border-surface-border flex flex-col h-full select-none shrink-0 overflow-hidden text-slate-200">
      {/* Header: Stage Badge & Lesson Title */}
      <div className="p-4 border-b border-surface-border bg-surface-card/60">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Stage {lesson.stages.indexOf(activeStage) + 1} of {lesson.stages.length}
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Lesson {lesson.lessonNumber} / 12
          </span>
        </div>
        <h2 className="text-base font-bold text-white mt-1.5 leading-snug">
          {lesson.title}
        </h2>
        <div className="text-xs text-amber-400/90 font-medium">{lesson.subtitle}</div>
      </div>

      {/* Main Stage Content (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* ========================================================= */}
        {/* STAGE A: UNDERSTAND */}
        {/* ========================================================= */}
        {activeStage === 'understand' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed space-y-2">
              <div className="font-bold text-amber-300 flex items-center gap-1.5 text-sm">
                <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                <span>Concept Overview</span>
              </div>
              <p>{lesson.concept.summary}</p>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Key Principles
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {lesson.concept.detailedPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {lesson.concept.keyTerms && lesson.concept.keyTerms.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Terminology Dictionary
                </span>
                <div className="space-y-2">
                  {lesson.concept.keyTerms.map((term, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-surface-card border border-surface-border text-xs">
                      <span className="font-bold text-white">{term.term}: </span>
                      <span className="text-slate-300">{term.definition}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE B: PREDICT */}
        {/* ========================================================= */}
        {activeStage === 'predict' && lesson.predictionQuestion && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-200 text-xs">
              <div className="font-bold text-purple-300 flex items-center gap-1.5 mb-1 text-sm">
                <span className="material-symbols-outlined text-[18px]">psychology</span>
                <span>Concept Prediction</span>
              </div>
              <p className="text-slate-300">
                Make your conceptual prediction before testing on the canvas. Don't worry about being wrong —
                experimentation will reveal the truth!
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-card border border-surface-border space-y-3">
              <h3 className="text-xs font-bold text-white leading-relaxed">
                {lesson.predictionQuestion.question}
              </h3>

              <div className="space-y-2">
                {lesson.predictionQuestion.options.map((opt, i) => {
                  const isChecked = selectedPrediction === i;
                  return (
                    <label
                      key={i}
                      onClick={() => setSelectedPrediction(i)}
                      className={`p-3 rounded-lg border text-xs flex items-center gap-2.5 cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-amber-500/20 text-white border-amber-500/50'
                          : 'bg-surface-elevated text-slate-300 border-surface-border hover:border-slate-500'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isChecked ? 'border-amber-400 bg-amber-400' : 'border-slate-500'
                        }`}
                      >
                        {isChecked && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                      </span>
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>

              {!progress.predictionAnswer ? (
                <button
                  onClick={handleSubmitPrediction}
                  disabled={selectedPrediction === null}
                  className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                  <span>Submit Prediction</span>
                </button>
              ) : (
                <div className="p-3 rounded-lg bg-surface-elevated border border-amber-500/30 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                    <span className="material-symbols-outlined text-[16px]">task_alt</span>
                    <span>Prediction Recorded!</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Your choice: <span className="text-white font-medium">"{progress.predictionAnswer}"</span>.
                    Now let's verify it with the interactive construction!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE C: EXPERIMENT */}
        {/* ========================================================= */}
        {activeStage === 'experiment' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 text-xs space-y-2">
              <div className="font-bold text-cyan-300 flex items-center gap-1.5 text-sm">
                <span className="material-symbols-outlined text-[18px]">science</span>
                <span>Interactive Experiment</span>
              </div>
              <p className="text-slate-200">{lesson.experimentGuide.instruction}</p>
              <div className="text-[11px] text-cyan-400 font-mono">
                Hint: {lesson.experimentGuide.actionHint}
              </div>
            </div>

            {/* Interaction Tracker Card */}
            <div className="p-4 rounded-xl bg-surface-card border border-surface-border space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-slate-400">Interaction Goal</span>
                <span className="font-mono font-bold text-amber-400">
                  {progress.interactionsRecorded} / {lesson.experimentGuide.minInteractionsNeeded || 2} Completed
                </span>
              </div>

              <div className="h-1.5 w-full bg-surface-lowest rounded-full overflow-hidden border border-surface-border">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      (progress.interactionsRecorded / (lesson.experimentGuide.minInteractionsNeeded || 2)) * 100
                    )}%`,
                  }}
                />
              </div>

              <p className="text-[11px] text-slate-400">
                {lesson.experimentGuide.targetActionDescription}
              </p>

              <button
                onClick={() => recordInteraction(lesson.id)}
                className="w-full py-2 rounded-lg bg-surface-elevated hover:bg-surface-border text-slate-200 text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5 border border-surface-border"
              >
                <span className="material-symbols-outlined text-[16px]">touch_app</span>
                <span>Record Action on Canvas</span>
              </button>
            </div>

            {/* Active Telemetry Preview */}
            <div className="p-3.5 rounded-xl bg-surface-card border border-surface-border text-xs space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Live Geometry Coordinates
              </span>
              {pointsList.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  {pointsList.map((pt) => {
                    const coords = primaryCircle
                      ? getCircumferenceCoords(primaryCircle, pt.angleRad)
                      : { x: 0, y: 0 };
                    return (
                      <div key={pt.id} className="p-2 rounded bg-surface-elevated border border-surface-border">
                        <span className="text-amber-400 font-bold">{pt.name}: </span>
                        <span>({coords.x.toFixed(1)}, {coords.y.toFixed(1)})</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-400 text-xs">Ready for manipulation.</p>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE D: OBSERVE */}
        {/* ========================================================= */}
        {activeStage === 'observe' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1.5">
              <div className="font-bold text-amber-300 flex items-center gap-1.5 text-sm">
                <span className="material-symbols-outlined text-[18px]">visibility</span>
                <span>Mathematical Observations</span>
              </div>
              <p className="text-slate-300">{lesson.observeGuide.prompt}</p>
            </div>

            {/* Live Invariant Card */}
            <div className="p-4 rounded-xl bg-surface-card border border-surface-border space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Computed Invariant
              </span>
              <div className="text-xs font-mono font-bold text-white bg-surface-elevated p-2.5 rounded-lg border border-surface-border">
                {lesson.observeGuide.invariantsDescription}
              </div>
              <p className="text-[11px] text-slate-400">
                Pattern: {lesson.observeGuide.expectedPattern}
              </p>

              <button
                onClick={handleCaptureObservation}
                className="w-full mt-2 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                <span>Capture Current Observation</span>
              </button>
            </div>

            {/* Observations Table */}
            {observationsTable.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Captured Data Trials ({observationsTable.length})
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {observationsTable.map((obs) => (
                    <div key={obs.id} className="p-2 rounded-lg bg-surface-card border border-surface-border text-[11px] font-mono flex justify-between items-center">
                      <div>
                        <div className="text-white font-bold">{obs.metricName}</div>
                        <div className="text-slate-400 text-[10px]">{obs.time}</div>
                      </div>
                      <div className="text-amber-400 font-bold">{obs.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE E: UNDERSTAND WHY / DEDUCTIVE PROOF */}
        {/* ========================================================= */}
        {activeStage === 'explain' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs space-y-2">
              <div className="font-bold text-emerald-300 flex items-center gap-1.5 text-sm">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Deductive Explanation</span>
              </div>
              <p className="text-slate-200 leading-relaxed">{lesson.whyGuide.explanation}</p>
            </div>

            {/* Stepwise Euclidean Proof */}
            {lesson.whyGuide.proofSteps && lesson.whyGuide.proofSteps.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Stepwise Euclidean Proof
                </span>
                <div className="space-y-2">
                  {lesson.whyGuide.proofSteps.map((st, i) => (
                    <div key={i} className="p-3 rounded-xl bg-surface-card border border-surface-border text-xs space-y-1">
                      <div className="text-white font-medium flex items-start gap-1.5">
                        <span className="text-amber-400 font-bold font-mono">{i + 1}.</span>
                        <span>{st.statement}</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 pl-4">
                        ↳ Reason: <span className="text-amber-400/90">{st.reason}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Note on Proof vs Empirical */}
            <div className="p-3 rounded-lg bg-surface-elevated border border-surface-border text-[11px] text-slate-400 leading-relaxed">
              <span className="font-bold text-slate-300">Mathematical Note: </span>
              In science, repeated experiments confirm a hypothesis; in Euclidean mathematics,
              a relationship is only true when established by deductive proof from axioms.
            </div>

            <div className="p-3 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold">
              Takeaway: {lesson.whyGuide.deductiveTakeaway}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE F: PRACTISE */}
        {/* ========================================================= */}
        {activeStage === 'practice' && currentQ && (
          <div className="space-y-4">
            {/* Question Navigator */}
            <div className="flex items-center justify-between text-xs font-mono border-b border-surface-border pb-2">
              <span className="text-slate-400">
                Question {activeQuestionIdx + 1} of {practiceQuestions.length}
              </span>
              <span className="text-amber-400 font-bold uppercase">{currentQ.difficulty || 'Standard'}</span>
            </div>

            {/* Question Card */}
            <div className="p-4 rounded-xl bg-surface-card border border-surface-border space-y-3">
              <h3 className="font-bold text-xs text-white leading-relaxed">
                {currentQ.question}
              </h3>

              {currentQ.diagramDescription && (
                <div className="text-[11px] font-mono text-slate-400 p-2 rounded bg-surface-elevated border border-surface-border">
                  Diagram: {currentQ.diagramDescription}
                </div>
              )}

              {/* MCQ Options */}
              {currentQ.options && currentQ.options.length > 0 ? (
                <div className="space-y-2">
                  {currentQ.options.map((opt, i) => {
                    const isSelected = selectedMcq === i;
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedMcq(i)}
                        className={`w-full p-2.5 rounded-lg border text-xs text-left transition-all ${
                          isSelected
                            ? 'bg-amber-500/20 text-white border-amber-500/50'
                            : 'bg-surface-elevated text-slate-300 border-surface-border hover:border-slate-500'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Numeric / Free Input */
                <div className="space-y-2">
                  <input
                    type="text"
                    value={practiceInput}
                    onChange={(e) => setPracticeInput(e.target.value)}
                    placeholder="Enter numerical answer..."
                    className="w-full px-3 py-2 rounded-lg bg-surface-lowest border border-surface-border text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

              <button
                onClick={handleCheckAnswer}
                className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Check Answer</span>
              </button>

              {practiceFeedback && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                    practiceFeedback.isCorrect
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-red-500/15 border-red-500/40 text-red-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {practiceFeedback.isCorrect ? 'check' : 'close'}
                  </span>
                  <span>{practiceFeedback.message}</span>
                </div>
              )}
            </div>

            {/* Hint & Solution Toggles */}
            <div className="flex gap-2">
              {currentQ.hint && (
                <button
                  onClick={() => setHintsRevealed((prev) => prev + 1)}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-surface-card hover:bg-surface-elevated border border-surface-border text-slate-300 text-xs font-mono transition-colors flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">tips_and_updates</span>
                  <span>Reveal Hint</span>
                </button>
              )}
              <button
                onClick={() => setShowSolution(!showSolution)}
                className="flex-1 py-1.5 px-3 rounded-lg bg-surface-card hover:bg-surface-elevated border border-surface-border text-slate-300 text-xs font-mono transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">menu_book</span>
                <span>{showSolution ? 'Hide Solution' : 'View Solution'}</span>
              </button>
            </div>

            {hintsRevealed > 0 && currentQ.hint && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
                <span className="font-bold">Hint: </span>
                {currentQ.hint}
              </div>
            )}

            {showSolution && (
              <div className="p-3.5 rounded-xl bg-surface-card border border-surface-border text-xs space-y-2">
                <span className="font-bold text-white text-[11px] uppercase font-mono">Worked Solution</span>
                <ol className="space-y-1 text-slate-300 list-decimal pl-4">
                  {currentQ.stepByStepSolution.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
                <div className="text-[11px] text-amber-400 font-mono mt-1">
                  Theorem Applied: {currentQ.theoremApplied}
                </div>
              </div>
            )}

            {/* Pagination between practice questions */}
            {practiceQuestions.length > 1 && (
              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => {
                    setActiveQuestionIdx((prev) => Math.max(0, prev - 1));
                    setPracticeFeedback(null);
                    setPracticeInput('');
                    setSelectedMcq(null);
                  }}
                  disabled={activeQuestionIdx === 0}
                  className="px-3 py-1.5 rounded-lg bg-surface-elevated disabled:opacity-30 text-xs text-slate-300"
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
                  className="px-3 py-1.5 rounded-lg bg-surface-elevated disabled:opacity-30 text-xs text-slate-300"
                >
                  Next Q
                </button>
              </div>
            )}

            {/* Lesson Completion Card */}
            {isLessonFinished && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-surface-card to-surface-lowest border-2 border-emerald-500/50 shadow-xl space-y-3 mt-4 animate-fade-in">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <span className="material-symbols-outlined text-[24px]">celebration</span>
                  <span className="text-base">Lesson Complete!</span>
                </div>

                <p className="text-xs text-slate-300">
                  You've successfully mastered the concepts and problems for Lesson {lesson.lessonNumber}: {lesson.title}.
                </p>

                <button
                  onClick={handleNextLesson}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Continue to Next Lesson</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Navigation: Stage Switcher */}
      <div className="p-4 border-t border-surface-border bg-surface-card/60 flex items-center justify-between">
        {activeStage !== 'understand' ? (
          <button
            onClick={() => {
              const idx = lesson.stages.indexOf(activeStage);
              if (idx > 0) setStage(lesson.stages[idx - 1]);
            }}
            className="px-3 py-2 rounded-lg bg-surface-elevated hover:bg-surface-border text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back</span>
          </button>
        ) : (
          <div />
        )}

        {activeStage !== 'practice' ? (
          <button
            onClick={nextStage}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all flex items-center gap-1"
          >
            <span>Next Stage</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        ) : (
          !isLessonFinished && (
            <button
              onClick={() => completeLesson(lesson.id)}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm transition-all flex items-center gap-1"
            >
              <span>Complete Lesson</span>
              <span className="material-symbols-outlined text-[16px]">check</span>
            </button>
          )
        )}
      </div>
    </div>
  );
};
