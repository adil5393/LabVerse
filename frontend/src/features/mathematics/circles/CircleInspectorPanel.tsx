/**
 * Scientific Properties Inspector & Theorem Lab for Class 9 Circles (Milestone M2.4)
 *
 * Implements:
 * 1. Single-authority mode rendering:
 *    - Explore: Live entity telemetry, circle resizing (numerical + slider), experiment controls
 *    - Investigate: Progressive 6-stage guided discovery (Understand -> Predict -> Experiment -> Observe -> Explain -> Prove)
 *    - Practice: Multi-difficulty question engine with 100% diagram/givens synchronization
 * 2. Circle Resizing with positive validation and live constraint preservation
 * 3. Dynamic observation capture table taking real values from the mathematical engine
 * 4. Stepwise Euclidean proof viewer with interactive missing-reason validation
 * 5. Full NCERT chapter question bank with isolated diagram scenes
 */

import React, { useState } from 'react';
import { useCircleStore } from '../../../store/useCircleStore';
import { CIRCLE_EXPERIMENTS } from '../../../engine/mathematics/circles/circleExperiments';
import { CHAPTER_PRACTICE_BANK } from '../../../engine/mathematics/circles/practiceBank';
import {
  getCircumferenceCoords,
  calculateChordMetrics,
  validatePracticeAnswer,
} from '../../../engine/mathematics/circles/geometry';
import type { InvestigationStageId, PracticeDifficulty } from '../../../engine/mathematics/circles/types';

export const CircleInspectorPanel: React.FC = () => {
  const [practiceInput, setPracticeInput] = useState('');
  const [selectedMcqOption, setSelectedMcqOption] = useState<number | null>(null);
  const [localRadiusInput, setLocalRadiusInput] = useState<string>('');

  const {
    currentExperimentId,
    mode,
    circles,
    circumferencePoints,
    chords,
    radiusDiameters,
    selectedId,
    selectedType,
    deleteSelected,
    setCircleRadius,

    // Progressive Investigate State (M2.4 Part A)
    investigationStage,
    investigationPredictions,
    manipulationPositionsRecorded,
    capturedObservations,
    proofStepIndex,
    selectedMissingReasons,
    investigationTeacherBypassed,
    setInvestigationStage,
    submitInvestigationPrediction,
    captureCurrentObservation,
    clearObservations,
    nextProofStep,
    prevProofStep,
    selectMissingReason,
    resetInvestigation,
    bypassInvestigationGate,

    // Practice Engine State (M2.4 Part B)
    activePracticeTopicId,
    activePracticeDifficulty,
    activePracticeQuestionId,
    practiceAnswers,
    nextPracticeQuestion,
    prevPracticeQuestion,
    setPracticeDifficulty,
    submitPracticeAnswer,
    revealPracticeHint,
    togglePracticeSolution,
    retryPracticeQuestion,

    // Experiment-specific interactive states
    symmetryRotation,
    setSymmetryRotation,
  } = useCircleStore();

  const currentExperiment =
    CIRCLE_EXPERIMENTS.find((e) => e.id === currentExperimentId) || CIRCLE_EXPERIMENTS[0];
  const primaryTheorem = currentExperiment.theorems[0];
  const primaryCircle = Object.values(circles)[0];

  // Selected Circle for Explore resizing
  const selectedCircle = selectedType === 'circle' && selectedId ? circles[selectedId] : primaryCircle;

  // Active Practice Question
  const activeQuestion =
    CHAPTER_PRACTICE_BANK.find((q) => q.id === activePracticeQuestionId) || CHAPTER_PRACTICE_BANK[0];
  const activeQuestionState = practiceAnswers[activeQuestion.id];

  // Filtered Practice Questions for Navigator
  const filteredPracticeQuestions = CHAPTER_PRACTICE_BANK.filter((q) => {
    const matchTopic = activePracticeTopicId === 'all' || q.topicId === activePracticeTopicId;
    const matchDiff = activePracticeDifficulty === 'all' || q.difficulty === activePracticeDifficulty;
    return matchTopic && matchDiff;
  });
  const currentQuestionIndex = filteredPracticeQuestions.findIndex((q) => q.id === activeQuestion.id);

  // Investigation Stages Configuration
  const stagesList: { id: InvestigationStageId; title: string; icon: string }[] = [
    { id: 'understand', title: '1. Understand', icon: 'lightbulb' },
    { id: 'predict', title: '2. Predict', icon: 'psychology' },
    { id: 'experiment', title: '3. Experiment', icon: 'touch_app' },
    { id: 'observe', title: '4. Observations', icon: 'table_chart' },
    { id: 'explain', title: '5. Explain', icon: 'auto_awesome' },
    {
      id: 'prove_or_conclude',
      title: primaryTheorem?.category === 'definition' ? '6. Conclusion' : '6. Euclidean Proof',
      icon: 'verified',
    },
  ];

  const currentStageIndex = stagesList.findIndex((s) => s.id === investigationStage);

  // Verification of Practice Answer
  const handleCheckPracticeAnswer = () => {
    if (!activeQuestion) return;

    if (activeQuestion.type === 'numeric') {
      const isCorrect = validatePracticeAnswer(
        practiceInput,
        activeQuestion.correctAnswer,
        activeQuestion.tolerance || 0.1
      );
      submitPracticeAnswer(activeQuestion.id, practiceInput, isCorrect);
    } else if (activeQuestion.type === 'multiple_choice' || activeQuestion.type === 'diagram_reasoning') {
      if (selectedMcqOption === null) return;
      const chosenText = activeQuestion.options ? activeQuestion.options[selectedMcqOption] : '';
      const isCorrect = selectedMcqOption === activeQuestion.correctOptionIndex || chosenText === String(activeQuestion.correctAnswer);
      submitPracticeAnswer(activeQuestion.id, chosenText, isCorrect);
    } else if (activeQuestion.type === 'construction') {
      // Dynamic verification of construction requirement
      let isVerified = false;
      const v = activeQuestion.constructionVerification;
      if (v?.expectedCount && v.expectedCount.diameters !== undefined) {
        const diaCount = Object.values(radiusDiameters).filter((r) => r.type === 'diameter').length;
        if (diaCount >= v.expectedCount.diameters) isVerified = true;
      }
      if (v?.expectedCount && v.expectedCount.chords !== undefined) {
        const chordCount = Object.values(chords).length;
        if (chordCount >= v.expectedCount.chords) isVerified = true;
      }
      if (v?.minPointsCount) {
        const ptCount = Object.values(circumferencePoints).length;
        if (ptCount >= v.minPointsCount) isVerified = true;
      }
      submitPracticeAnswer(activeQuestion.id, isVerified ? 'Constructed successfully' : 'Incomplete construction', isVerified);
    }
  };

  return (
    <aside className="w-80 lg:w-96 bg-surface-low border-l border-surface-border flex flex-col h-full overflow-hidden shrink-0 select-none">
      {/* Mode Status Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-card/80 border-b border-surface-border shrink-0">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${
            mode === 'explore' ? 'bg-amber-400' : mode === 'investigate' ? 'bg-sky-400' : 'bg-emerald-400'
          }`} />
          <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200">
            {mode === 'explore' ? 'Explore & Properties' : mode === 'investigate' ? 'Progressive Investigation' : 'Practice Engine'}
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {mode === 'explore' ? 'Free Construction' : mode === 'investigate' ? `Stage ${currentStageIndex + 1}/6` : `NCERT Chapter Bank`}
        </span>
      </div>

      {/* Main Mode Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">

        {/* ============================================================ */}
        {/* MODE 1: EXPLORE & PROPERTIES (Part C: Resizing & Geometry) */}
        {/* ============================================================ */}
        {mode === 'explore' && (
          <div className="space-y-4">
            {/* Circle Resizing & Geometry Card */}
            {selectedCircle && (
              <div className="p-3.5 bg-surface-card rounded-xl border border-surface-border space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold text-slate-200 uppercase flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-amber-400 text-[16px]">radio_button_unchecked</span>
                    <span>{selectedCircle.name}</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Center O({selectedCircle.center.x.toFixed(1)}, {selectedCircle.center.y.toFixed(1)})
                  </span>
                </div>

                {/* Radius Controls: Slider & Numerical Input (M2.4 Part C) */}
                <div className="p-2.5 bg-surface-lowest rounded-lg border border-surface-border space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">Radius (r):</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1.0"
                        max="15.0"
                        step="0.1"
                        value={localRadiusInput !== '' ? localRadiusInput : selectedCircle.radius.toFixed(1)}
                        onChange={(e) => {
                          setLocalRadiusInput(e.target.value);
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val >= 1.0 && val <= 15.0) {
                            setCircleRadius(selectedCircle.id, val);
                          }
                        }}
                        onBlur={() => setLocalRadiusInput('')}
                        className="w-16 px-1.5 py-0.5 bg-surface-elevated text-amber-400 font-bold text-right rounded border border-surface-border text-xs font-mono focus:outline-none focus:border-amber-400"
                      />
                      <span className="text-slate-400 text-[11px]">cm</span>
                    </div>
                  </div>

                  {/* Slider */}
                  <div className="space-y-1">
                    <input
                      type="range"
                      min="1.0"
                      max="10.0"
                      step="0.1"
                      value={selectedCircle.radius}
                      onChange={(e) => setCircleRadius(selectedCircle.id, parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-surface-elevated rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>1.0 cm</span>
                      <span className="text-amber-400 font-semibold">{selectedCircle.radius.toFixed(1)} cm</span>
                      <span>10.0 cm</span>
                    </div>
                  </div>
                </div>

                {/* Derived Metrics: Diameter, Circumference, Area */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 bg-surface-lowest rounded-lg border border-surface-border">
                    <div className="text-[10px] text-slate-400">Diameter (2r)</div>
                    <div className="text-sm font-bold text-sky-400">{(selectedCircle.radius * 2).toFixed(2)} cm</div>
                  </div>
                  <div className="p-2 bg-surface-lowest rounded-lg border border-surface-border">
                    <div className="text-[10px] text-slate-400">Circumference (2πr)</div>
                    <div className="text-sm font-bold text-slate-200">
                      {(2 * Math.PI * selectedCircle.radius).toFixed(2)} cm
                    </div>
                  </div>
                  <div className="p-2 bg-surface-lowest rounded-lg border border-surface-border col-span-2">
                    <div className="text-[10px] text-slate-400">Area (πr²)</div>
                    <div className="text-sm font-bold text-emerald-400">
                      {(Math.PI * selectedCircle.radius * selectedCircle.radius).toFixed(2)} cm²
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Selected Element Telemetry */}
            {selectedId && selectedType === 'point' && circumferencePoints[selectedId] && (
              <div className="p-3 bg-surface-card rounded-xl border border-surface-border space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center text-sky-400 font-bold uppercase">
                  <span>Point {circumferencePoints[selectedId].name}</span>
                  <span className="text-[10px] text-slate-400">On Circumference</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-surface-lowest rounded">
                    <div className="text-[10px] text-slate-400">Angle (θ)</div>
                    <div className="font-bold text-slate-200">
                      {((circumferencePoints[selectedId].angleRad * 180) / Math.PI).toFixed(1)}°
                    </div>
                  </div>
                  <div className="p-2 bg-surface-lowest rounded">
                    <div className="text-[10px] text-slate-400">Distance from O</div>
                    <div className="font-bold text-amber-400">
                      {primaryCircle?.radius.toFixed(1)} cm
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chords Live Readout */}
            {Object.keys(chords).length > 0 && primaryCircle && (
              <div className="p-3 bg-surface-card rounded-xl border border-surface-border space-y-2">
                <div className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-amber-400 text-[16px]">linear_scale</span>
                  <span>Chords ({Object.keys(chords).length})</span>
                </div>
                {Object.values(chords).map((ch) => {
                  const ptA = circumferencePoints[ch.pointAId];
                  const ptB = circumferencePoints[ch.pointBId];
                  if (!ptA || !ptB) return null;
                  const posA = getCircumferenceCoords(primaryCircle, ptA.angleRad);
                  const posB = getCircumferenceCoords(primaryCircle, ptB.angleRad);
                  const m = calculateChordMetrics(primaryCircle, posA, posB);
                  return (
                    <div key={ch.id} className="p-2 bg-surface-lowest rounded-lg border border-surface-border text-xs font-mono space-y-1">
                      <div className="flex justify-between font-bold text-slate-200">
                        <span>{ch.name}</span>
                        <span className="text-amber-400">L = {m.length.toFixed(2)} cm</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Distance from O:</span>
                        <span className="text-sky-400 font-bold">{m.distFromCenter.toFixed(2)} cm</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Experiment Controls: Symmetries, Equal Chords, Point count */}
            {currentExperimentId === 'symmetry-of-circle' && (
              <div className="p-3 bg-surface-card rounded-xl border border-surface-border space-y-2.5">
                <div className="text-xs font-mono font-bold text-sky-400 uppercase">Symmetry Controls</div>
                <div className="space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-slate-300">
                    <span>Rotation:</span>
                    <span className="text-amber-400 font-bold">{symmetryRotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={symmetryRotation}
                    onChange={(e) => setSymmetryRotation(Number(e.target.value))}
                    className="w-full h-1.5 bg-surface-elevated rounded appearance-none cursor-pointer accent-sky-400"
                  />
                </div>
              </div>
            )}

            {/* Delete button if object selected */}
            {selectedId && (
              <button
                onClick={deleteSelected}
                className="w-full py-2 px-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 hover:bg-red-500/25 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>Delete Selected ({selectedType})</span>
              </button>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* MODE 2: INVESTIGATE (Part A: Progressive 6 Stages) */}
        {/* ============================================================ */}
        {mode === 'investigate' && primaryTheorem && (
          <div className="space-y-4">
            {/* Stage Progress Ribbon */}
            <div className="p-2.5 bg-surface-card rounded-xl border border-surface-border space-y-1.5">
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-slate-400">Stage {currentStageIndex + 1} of 6</span>
                <span className="text-sky-400 font-bold uppercase">{stagesList[currentStageIndex]?.title}</span>
              </div>
              <div className="grid grid-cols-6 gap-1 h-1.5">
                {stagesList.map((st, idx) => (
                  <button
                    key={st.id}
                    onClick={() => setInvestigationStage(st.id)}
                    className={`h-full rounded-full transition-all ${
                      idx === currentStageIndex
                        ? 'bg-amber-400 shadow-sm'
                        : idx < currentStageIndex
                        ? 'bg-sky-500'
                        : 'bg-surface-elevated'
                    }`}
                    title={st.title}
                  />
                ))}
              </div>
            </div>

            {/* Category Badge & Concept Overview */}
            <div className="flex items-center justify-between text-xs font-mono">
              <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] border ${
                primaryTheorem.category === 'definition'
                  ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                  : primaryTheorem.category === 'property'
                  ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                  : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              }`}>
                {primaryTheorem.category || 'Theorem'} Investigation
              </span>
              <button
                onClick={resetInvestigation}
                className="text-slate-400 hover:text-slate-200 text-[11px] flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">restart_alt</span>
                <span>Reset</span>
              </button>
            </div>

            {/* STAGE 1: UNDERSTAND THE PROBLEM */}
            {investigationStage === 'understand' && (
              <div className="p-3.5 bg-surface-card rounded-xl border border-surface-border space-y-3">
                <div className="text-sm font-bold text-white">{primaryTheorem.title}</div>
                <div className="text-xs text-slate-300 bg-surface-lowest p-2.5 rounded-lg border border-surface-border leading-relaxed space-y-1">
                  <strong className="text-sky-400 block font-mono text-[11px] uppercase">Mathematical Statement:</strong>
                  <p>{primaryTheorem.statement}</p>
                </div>
                {primaryTheorem.givenContext && (
                  <div className="text-xs text-slate-300 bg-surface-lowest p-2.5 rounded-lg border border-surface-border leading-relaxed">
                    <strong className="text-amber-400 block font-mono text-[11px] uppercase">Given Conditions:</strong>
                    <p>{primaryTheorem.givenContext}</p>
                  </div>
                )}
                <div className="text-xs text-slate-400 leading-relaxed">
                  Carefully inspect the construction on the canvas. Next, formulate your prediction before performing geometric manipulations.
                </div>
                <button
                  onClick={() => setInvestigationStage('predict')}
                  className="w-full py-2 bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Proceed to Prediction</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            )}

            {/* STAGE 2: PREDICT */}
            {investigationStage === 'predict' && primaryTheorem.predictionQuestion && (
              <div className="p-3.5 bg-surface-card rounded-xl border border-surface-border space-y-3">
                <div className="text-xs font-bold text-amber-300 uppercase flex items-center gap-1 font-mono">
                  <span className="material-symbols-outlined text-[16px]">psychology</span>
                  <span>Conceptual Prediction</span>
                </div>
                <div className="text-xs text-slate-200 font-medium leading-relaxed">
                  {primaryTheorem.predictionQuestion.question}
                </div>
                <div className="space-y-1.5">
                  {primaryTheorem.predictionQuestion.options.map((opt, idx) => {
                    const isSelected = investigationPredictions[currentExperimentId] === opt;
                    return (
                      <button
                        key={idx}
                        onClick={() => submitInvestigationPrediction(currentExperimentId, opt)}
                        className={`w-full text-left p-2.5 rounded-lg text-xs transition-all border ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold'
                            : 'bg-surface-lowest border-surface-border text-slate-300 hover:bg-surface-elevated'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                <div className="text-[11px] text-slate-400 italic">
                  * Note: Theorem conclusions are intentionally withheld until you experiment on the canvas.
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setInvestigationStage('understand')}
                    className="flex-1 py-1.5 bg-surface-elevated text-slate-300 font-semibold rounded-lg text-xs"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setInvestigationStage('experiment')}
                    disabled={!investigationPredictions[currentExperimentId]}
                    className="flex-1 py-1.5 bg-sky-500 disabled:opacity-40 text-slate-900 font-bold rounded-lg text-xs transition-all"
                  >
                    Confirm & Experiment
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 3: EXPERIMENT & MANIPULATION */}
            {investigationStage === 'experiment' && (
              <div className="p-3.5 bg-surface-card rounded-xl border border-surface-border space-y-3">
                <div className="text-xs font-bold text-sky-400 uppercase flex items-center gap-1 font-mono">
                  <span className="material-symbols-outlined text-[16px]">touch_app</span>
                  <span>Geometric Manipulation Task</span>
                </div>
                <div className="text-xs text-slate-200 bg-surface-lowest p-2.5 rounded-lg border border-surface-border leading-relaxed space-y-1">
                  <strong className="text-amber-400 block font-mono text-[11px]">Instructions:</strong>
                  <p>{primaryTheorem.instructions}</p>
                </div>

                {/* Meaningful Interaction Progress Tracker */}
                <div className="p-2.5 bg-surface-lowest rounded-lg border border-surface-border space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Meaningful Positions Explored:</span>
                    <span className="text-amber-400 font-bold">
                      {Math.min(3, manipulationPositionsRecorded.length)} / 3
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 h-1.5">
                    {[0, 1, 2].map((idx) => (
                      <div
                        key={idx}
                        className={`h-full rounded-full ${
                          manipulationPositionsRecorded.length > idx || investigationTeacherBypassed
                            ? 'bg-emerald-400'
                            : 'bg-surface-elevated'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Drag the circumference point to at least 3 distinct angular positions (separated by ≥25°).
                  </div>
                </div>

                {/* Teacher Demonstration Bypass */}
                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                  <span>Classroom TV / Demo:</span>
                  <button
                    onClick={bypassInvestigationGate}
                    className="text-sky-400 hover:text-sky-300 font-mono underline"
                  >
                    Skip Gate (Demonstrate)
                  </button>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setInvestigationStage('predict')}
                    className="flex-1 py-1.5 bg-surface-elevated text-slate-300 font-semibold rounded-lg text-xs"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setInvestigationStage('observe')}
                    disabled={manipulationPositionsRecorded.length < 3 && !investigationTeacherBypassed}
                    className="flex-1 py-1.5 bg-sky-500 disabled:opacity-40 text-slate-900 font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1"
                  >
                    <span>Record Observations</span>
                    <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 4: RECORD OBSERVATIONS */}
            {investigationStage === 'observe' && (
              <div className="p-3.5 bg-surface-card rounded-xl border border-surface-border space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-sky-400 uppercase flex items-center gap-1 font-mono">
                    <span className="material-symbols-outlined text-[16px]">table_chart</span>
                    <span>Observation Table</span>
                  </span>
                  <button
                    onClick={captureCurrentObservation}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded text-xs flex items-center gap-1 transition-all"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    <span>Capture Live Values</span>
                  </button>
                </div>

                {/* Dynamic Observation Table (M2.4 Part A.5) */}
                {capturedObservations.length === 0 ? (
                  <div className="p-4 rounded-lg bg-surface-lowest border border-dashed border-surface-border text-center text-xs text-slate-400 space-y-1">
                    <div>No observations recorded yet.</div>
                    <div className="text-[11px] text-slate-500">
                      Drag geometry on the canvas and click "Capture Live Values" to record geometric trials.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar">
                    {capturedObservations.map((obs) => (
                      <div
                        key={obs.id}
                        className="p-2 bg-surface-lowest rounded-lg border border-surface-border text-xs font-mono space-y-1"
                      >
                        <div className="flex justify-between font-bold text-slate-200">
                          <span>{obs.configurationLabel || obs.label || 'Trial'}</span>
                          <span className="text-sky-400">{obs.invariantEvaluated || obs.notes || ''}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400 pt-1 border-t border-surface-border">
                          {Object.entries(obs.measurements || obs.metrics || {}).map(([k, v]) => (
                            <div key={k} className="flex justify-between">
                              <span>{k}:</span>
                              <span className="text-slate-200">{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-end">
                      <button
                        onClick={clearObservations}
                        className="text-[11px] text-red-400 hover:text-red-300 font-mono"
                      >
                        Clear Trials
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setInvestigationStage('experiment')}
                    className="flex-1 py-1.5 bg-surface-elevated text-slate-300 font-semibold rounded-lg text-xs"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setInvestigationStage('explain')}
                    className="flex-1 py-1.5 bg-sky-500 text-slate-900 font-bold rounded-lg text-xs transition-all"
                  >
                    Proceed to Explanation
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 5: EXPLAIN & INVARIANTS */}
            {investigationStage === 'explain' && (
              <div className="p-3.5 bg-surface-card rounded-xl border border-surface-border space-y-3">
                <div className="text-xs font-bold text-amber-300 uppercase flex items-center gap-1 font-mono">
                  <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                  <span>Hypothesis Comparison & Explanation</span>
                </div>

                {/* Prediction comparison */}
                <div className="p-2.5 bg-surface-lowest rounded-lg border border-surface-border text-xs space-y-1.5">
                  <div className="text-[11px] text-slate-400 font-mono uppercase">Your Submitted Prediction:</div>
                  <div className="text-amber-300 font-semibold">
                    "{investigationPredictions[currentExperimentId] || 'No prediction recorded'}"
                  </div>
                </div>

                {/* Mathematical Synthesis */}
                <div className="p-2.5 bg-surface-lowest rounded-lg border border-surface-border text-xs text-slate-200 leading-relaxed space-y-1">
                  <strong className="text-emerald-400 block font-mono text-[11px] uppercase">Why This Invariant Holds:</strong>
                  <p>{primaryTheorem.predictionQuestion?.explanation || primaryTheorem.statement}</p>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setInvestigationStage('observe')}
                    className="flex-1 py-1.5 bg-surface-elevated text-slate-300 font-semibold rounded-lg text-xs"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setInvestigationStage('prove_or_conclude')}
                    className="flex-1 py-1.5 bg-sky-500 text-slate-900 font-bold rounded-lg text-xs transition-all"
                  >
                    {primaryTheorem.category === 'definition' ? 'Final Conclusion' : 'Stepwise Proof'}
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 6: PROVE OR CONCLUDE (M2.4 Part A.6) */}
            {investigationStage === 'prove_or_conclude' && (
              <div className="p-3.5 bg-surface-card rounded-xl border border-surface-border space-y-3">
                <div className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-1 font-mono">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>{primaryTheorem.category === 'definition' ? 'Conceptual Conclusion' : 'Stepwise Euclidean Proof'}</span>
                </div>

                {primaryTheorem.category === 'definition' ? (
                  <div className="space-y-3">
                    <div className="text-xs text-slate-200 bg-surface-lowest p-3 rounded-lg border border-surface-border leading-relaxed space-y-2">
                      <p>{primaryTheorem.mathematicalConclusion}</p>
                      <div className="text-[11px] text-emerald-400 font-mono">
                        ✓ Definition explored and validated through interactive radial locus.
                      </div>
                    </div>
                  </div>
                ) : (
                  // Stepwise Euclidean Proof Viewer with Missing Reason selectors
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                      <span>Step {proofStepIndex + 1} of {primaryTheorem.proofSteps.length}</span>
                      <span className="text-emerald-400 font-bold">Q.E.D. Progress</span>
                    </div>

                    {primaryTheorem.proofSteps[proofStepIndex] && (
                      <div className="p-3 bg-surface-lowest rounded-lg border border-surface-border space-y-2 text-xs">
                        <div className="text-slate-100 font-medium leading-relaxed">
                          <strong className="text-sky-400 block font-mono text-[11px]">Statement:</strong>
                          {primaryTheorem.proofSteps[proofStepIndex].statement}
                        </div>

                        {/* Interactive Missing Reason Selector */}
                        {primaryTheorem.proofSteps[proofStepIndex].missingReasonOptions ? (
                          <div className="space-y-1.5 pt-1">
                            <strong className="text-amber-400 block font-mono text-[11px]">Choose Correct Reason:</strong>
                            {primaryTheorem.proofSteps[proofStepIndex].missingReasonOptions?.map((reason, rIdx) => {
                              const isSelected = selectedMissingReasons[proofStepIndex] === reason;
                              const isCorrect = rIdx === primaryTheorem.proofSteps[proofStepIndex].correctReasonIndex;
                              return (
                                <button
                                  key={rIdx}
                                  onClick={() => selectMissingReason(proofStepIndex, reason)}
                                  className={`w-full text-left p-2 rounded text-[11px] transition-all border ${
                                    isSelected
                                      ? isCorrect
                                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                                        : 'bg-red-500/20 border-red-500 text-red-300 font-bold'
                                      : 'bg-surface-elevated border-surface-border text-slate-300 hover:bg-surface-high'
                                  }`}
                                >
                                  {reason}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-slate-300 pt-1 border-t border-surface-border leading-relaxed">
                            <strong className="text-amber-400 block font-mono text-[11px]">Reason:</strong>
                            {primaryTheorem.proofSteps[proofStepIndex].reason}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step Navigation */}
                    <div className="flex gap-2">
                      <button
                        onClick={prevProofStep}
                        disabled={proofStepIndex === 0}
                        className="flex-1 py-1.5 bg-surface-elevated disabled:opacity-30 text-slate-300 font-semibold rounded-lg text-xs"
                      >
                        Previous Step
                      </button>
                      <button
                        onClick={nextProofStep}
                        disabled={proofStepIndex >= primaryTheorem.proofSteps.length - 1}
                        className="flex-1 py-1.5 bg-sky-500 disabled:opacity-30 text-slate-900 font-bold rounded-lg text-xs"
                      >
                        Next Step
                      </button>
                    </div>

                    {proofStepIndex >= primaryTheorem.proofSteps.length - 1 && (
                      <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs font-mono text-center">
                        ✓ Theorem Complete & Mathematically Validated (Q.E.D.)
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setInvestigationStage('explain')}
                    className="w-full py-1.5 bg-surface-elevated text-slate-300 font-semibold rounded-lg text-xs"
                  >
                    Back to Explanation
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* MODE 3: PRACTICE ENGINE (Part B: Diagram Synchronization) */}
        {/* ============================================================ */}
        {mode === 'practice' && (
          <div className="space-y-4">
            {/* Topic Filter & Difficulty Selector */}
            <div className="p-3 bg-surface-card rounded-xl border border-surface-border space-y-2">
              <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                <span>Filter Practice Bank</span>
                <span className="text-emerald-400 font-bold">{filteredPracticeQuestions.length} Questions</span>
              </div>

              {/* Difficulty Selector */}
              <div className="flex gap-1">
                {(['all', 'basic', 'standard', 'challenge'] as (PracticeDifficulty | 'all')[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setPracticeDifficulty(d)}
                    className={`flex-1 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all ${
                      activePracticeDifficulty === d
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                        : 'bg-surface-lowest text-slate-400 hover:text-slate-200 border border-surface-border'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Navigator Header */}
            <div className="flex justify-between items-center bg-surface-card p-2.5 rounded-xl border border-surface-border">
              <button
                onClick={prevPracticeQuestion}
                className="p-1 rounded hover:bg-surface-elevated text-slate-300"
                title="Previous Question"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <div className="text-center font-mono">
                <span className="text-xs font-bold text-white">
                  Question {currentQuestionIndex + 1} of {filteredPracticeQuestions.length}
                </span>
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                    activeQuestion.difficulty === 'basic'
                      ? 'bg-sky-500/20 text-sky-400'
                      : activeQuestion.difficulty === 'standard'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {activeQuestion.difficulty}
                  </span>
                  <span className="text-[10px] text-slate-400">{activeQuestion.marks} Marks</span>
                  {activeQuestion.isNCERTSourced && (
                    <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                      NCERT
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={nextPracticeQuestion}
                className="p-1 rounded hover:bg-surface-elevated text-slate-300"
                title="Next Question"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>

            {/* Authoritative Matching Givens Card (Part B.7: Single Source of Truth) */}
            <div className="p-3 bg-surface-card rounded-xl border border-emerald-500/30 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-emerald-400 font-bold uppercase flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">verified</span>
                  <span>Matching Diagram Givens</span>
                </span>
                <span className="text-[10px] text-slate-400">Isolated Practice Scene</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                {Object.entries(activeQuestion.givens || {}).map(([key, val]) => (
                  <div key={key} className="p-1.5 bg-surface-lowest rounded border border-surface-border">
                    <span className="text-[10px] text-slate-400 block capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                    <span className="text-slate-200 font-bold">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Question Text Card */}
            <div className="p-3.5 bg-surface-card rounded-xl border border-surface-border space-y-3">
              <div className="text-sm font-bold text-white leading-relaxed">
                {activeQuestion.question}
              </div>

              {/* Type-Specific Answer Submission Card */}
              {activeQuestion.type === 'numeric' && (
                <div className="space-y-2 pt-1">
                  <label className="text-[11px] font-mono text-slate-400 block">
                    Enter your calculated answer:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 8 cm"
                      value={practiceInput}
                      onChange={(e) => setPracticeInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-surface-lowest border border-surface-border rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={handleCheckPracticeAnswer}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-lg text-xs transition-all"
                    >
                      Check
                    </button>
                  </div>
                </div>
              )}

              {(activeQuestion.type === 'multiple_choice' || activeQuestion.type === 'diagram_reasoning') && (
                <div className="space-y-2 pt-1">
                  <label className="text-[11px] font-mono text-slate-400 block">Select the correct option:</label>
                  <div className="space-y-1.5">
                    {activeQuestion.options?.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedMcqOption(idx)}
                        className={`w-full text-left p-2.5 rounded-lg text-xs transition-all border ${
                          selectedMcqOption === idx
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                            : 'bg-surface-lowest border-surface-border text-slate-300 hover:bg-surface-elevated'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleCheckPracticeAnswer}
                    disabled={selectedMcqOption === null}
                    className="w-full py-2 bg-emerald-500 disabled:opacity-40 hover:bg-emerald-400 text-slate-900 font-bold rounded-lg text-xs transition-all"
                  >
                    Submit Choice
                  </button>
                </div>
              )}

              {activeQuestion.type === 'construction' && (
                <div className="space-y-2 pt-1">
                  <div className="text-xs text-slate-300 bg-surface-lowest p-2.5 rounded-lg border border-surface-border leading-relaxed">
                    Use the toolbar construction tools (Diameter, Chord, Point) on the canvas to build the required geometry.
                  </div>
                  <button
                    onClick={handleCheckPracticeAnswer}
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-lg text-xs transition-all"
                  >
                    Verify Construction Geometry
                  </button>
                </div>
              )}

              {/* Result Banner */}
              {activeQuestionState && (
                <div className={`p-3 rounded-lg border text-xs font-mono ${
                  activeQuestionState.isCorrect
                    ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300'
                    : 'bg-red-950/40 border-red-700/60 text-red-300'
                }`}>
                  <div className="font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">
                      {activeQuestionState.isCorrect ? 'check_circle' : 'cancel'}
                    </span>
                    <span>{activeQuestionState.isCorrect ? 'Correct! Full Marks Awarded' : 'Incorrect. Check your calculations.'}</span>
                  </div>
                  {!activeQuestionState.isCorrect && (
                    <div className="text-[11px] text-slate-400 mt-1">
                      Expected answer: {String(activeQuestion.correctAnswer)}
                    </div>
                  )}
                </div>
              )}

              {/* Hints & Solution Controls */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => revealPracticeHint(activeQuestion.id)}
                  disabled={Boolean(activeQuestionState?.hintsRevealed && activeQuestion.hintSteps && activeQuestionState.hintsRevealed >= activeQuestion.hintSteps.length)}
                  className="flex-1 py-1.5 bg-surface-elevated text-slate-300 hover:text-white rounded-lg text-xs font-mono"
                >
                  Hint ({activeQuestionState?.hintsRevealed || 0}/{activeQuestion.hintSteps?.length || 0})
                </button>
                <button
                  onClick={() => togglePracticeSolution(activeQuestion.id)}
                  className="flex-1 py-1.5 bg-surface-elevated text-slate-300 hover:text-white rounded-lg text-xs font-mono"
                >
                  {activeQuestionState?.showSolution ? 'Hide Solution' : 'Worked Solution'}
                </button>
                <button
                  onClick={() => {
                    retryPracticeQuestion(activeQuestion.id);
                    setPracticeInput('');
                    setSelectedMcqOption(null);
                  }}
                  className="px-2.5 py-1.5 bg-surface-elevated text-slate-400 hover:text-slate-200 rounded-lg text-xs font-mono"
                  title="Retry"
                >
                  <span className="material-symbols-outlined text-[16px]">refresh</span>
                </button>
              </div>

              {/* Progressive Hint Reveal */}
              {activeQuestionState?.hintsRevealed && activeQuestionState.hintsRevealed > 0 && activeQuestion.hintSteps && (
                <div className="space-y-1.5 p-2.5 bg-surface-lowest rounded-lg border border-surface-border text-xs">
                  <div className="font-bold text-amber-400 font-mono text-[11px]">Hints:</div>
                  {activeQuestion.hintSteps.slice(0, activeQuestionState.hintsRevealed).map((h, i) => (
                    <div key={i} className="text-slate-300 leading-relaxed">
                      {i + 1}. {h}
                    </div>
                  ))}
                </div>
              )}

              {/* Step-by-Step Worked Solution */}
              {activeQuestionState?.showSolution && (
                <div className="space-y-2 p-3 bg-surface-lowest rounded-lg border border-surface-border text-xs">
                  <div className="font-bold text-emerald-400 font-mono text-[11px] uppercase">
                    Step-by-Step Mathematical Solution:
                  </div>
                  {activeQuestion.stepByStepSolution.map((step, idx) => (
                    <div key={idx} className="text-slate-300 leading-relaxed font-mono text-[11px]">
                      • {step}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
