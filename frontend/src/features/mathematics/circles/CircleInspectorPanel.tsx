/**
 * Scientific Properties Inspector & Theorem Lab for Class 9 Circles
 *
 * Implements:
 * 1. Live Properties & Geometric Telemetry
 * 2. Interactive Theorem Investigations & Step-by-Step Proofs
 * 3. Class 9 Practice Problems with instant checking & step-by-step solutions
 */

import React, { useState } from 'react';
import { useCircleStore } from '../../../store/useCircleStore';
import { CIRCLE_EXPERIMENTS } from '../../../engine/mathematics/circles/circleExperiments';
import {
  getCircumferenceCoords,
  calculateChordMetrics,
  calculateAngleDegrees,
  verifyInscribedAngleTheorem,
  verifyCyclicQuadOppositeAngles,
} from '../../../engine/mathematics/circles/geometry';

type InspectorTab = 'properties' | 'theorems' | 'practice';

export const CircleInspectorPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<InspectorTab>('properties');
  const [selectedPrediction, setSelectedPrediction] = useState<number | null>(null);
  const [showPredictionResult, setShowPredictionResult] = useState(false);
  const [practiceInput, setPracticeInput] = useState('');
  const [showPracticeSolution, setShowPracticeSolution] = useState(false);

  const {
    currentExperimentId,
    circles,
    circumferencePoints,
    chords,
    angles,
    cyclicQuads,
    selectedId,
    selectedType,
    deleteSelected,
    submitPracticeAnswer,
    practiceAnswers,
  } = useCircleStore();

  const currentExperiment =
    CIRCLE_EXPERIMENTS.find((e) => e.id === currentExperimentId) || CIRCLE_EXPERIMENTS[0];
  const primaryTheorem = currentExperiment.theorems[0];
  const primaryQuestion = currentExperiment.practiceQuestions[0];

  const primaryCircle = Object.values(circles)[0];

  // Helper calculation for cyclic quad opposite angles
  const quad = Object.values(cyclicQuads)[0];
  let quadVerification: { sumAC: number; sumBD: number; isSupplementary: boolean } | null = null;
  if (quad && primaryCircle) {
    const ptA = circumferencePoints[quad.pointAId];
    const ptB = circumferencePoints[quad.pointBId];
    const ptC = circumferencePoints[quad.pointCId];
    const ptD = circumferencePoints[quad.pointDId];
    if (ptA && ptB && ptC && ptD) {
      const posA = getCircumferenceCoords(primaryCircle, ptA.angleRad);
      const posB = getCircumferenceCoords(primaryCircle, ptB.angleRad);
      const posC = getCircumferenceCoords(primaryCircle, ptC.angleRad);
      const posD = getCircumferenceCoords(primaryCircle, ptD.angleRad);

      const angA = calculateAngleDegrees(posD, posA, posB);
      const angB = calculateAngleDegrees(posA, posB, posC);
      const angC = calculateAngleDegrees(posB, posC, posD);
      const angD = calculateAngleDegrees(posC, posD, posA);

      const vAC = verifyCyclicQuadOppositeAngles(angA, angC);
      const vBD = verifyCyclicQuadOppositeAngles(angB, angD);

      quadVerification = {
        sumAC: vAC.sum,
        sumBD: vBD.sum,
        isSupplementary: vAC.isSupplementary && vBD.isSupplementary,
      };
    }
  }

  // Helper calculation for Central vs Inscribed angle
  let angleTheoremData: { central: number; inscribed: number; ratio: number; valid: boolean } | null = null;
  const centralAngle = Object.values(angles).find((a) => a.isCentral);
  const inscribedAngle = Object.values(angles).find((a) => !a.isCentral);
  if (centralAngle && inscribedAngle && primaryCircle) {
    const p1 = circumferencePoints[centralAngle.point1Id];
    const p2 = circumferencePoints[centralAngle.point2Id];
    const vInscribed = circumferencePoints[inscribedAngle.vertexId];
    if (p1 && p2 && vInscribed) {
      const w1 = getCircumferenceCoords(primaryCircle, p1.angleRad);
      const w2 = getCircumferenceCoords(primaryCircle, p2.angleRad);
      const wV = getCircumferenceCoords(primaryCircle, vInscribed.angleRad);

      const degCentral = calculateAngleDegrees(w1, primaryCircle.center, w2);
      const degInscribed = calculateAngleDegrees(w1, wV, w2);
      const verif = verifyInscribedAngleTheorem(degCentral, degInscribed);

      angleTheoremData = {
        central: degCentral,
        inscribed: degInscribed,
        ratio: verif.ratio,
        valid: verif.isValid,
      };
    }
  }

  return (
    <aside className="w-80 lg:w-96 bg-surface-low border-l border-surface-border flex flex-col h-full overflow-hidden shrink-0 select-none">
      {/* Top Tabs */}
      <div className="flex border-b border-surface-border bg-surface-card/60 p-1.5 gap-1 shrink-0">
        <button
          onClick={() => setActiveTab('properties')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'properties'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-surface-elevated'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">tune</span>
          <span>Properties</span>
        </button>

        <button
          onClick={() => setActiveTab('theorems')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'theorems'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-surface-elevated'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">menu_book</span>
          <span>Theorems</span>
        </button>

        <button
          onClick={() => setActiveTab('practice')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'practice'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-surface-elevated'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">school</span>
          <span>Practice</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* TAB 1: PROPERTIES */}
        {activeTab === 'properties' && (
          <div className="space-y-4">
            {/* Primary Circle Card */}
            {primaryCircle && (
              <div className="p-3.5 bg-surface-card rounded-xl border border-surface-border space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-amber-400 text-[16px]">radio_button_unchecked</span>
                    <span>{primaryCircle.name}</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    O({primaryCircle.center.x.toFixed(1)}, {primaryCircle.center.y.toFixed(1)})
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 bg-surface-lowest rounded-lg border border-surface-border">
                    <div className="text-[10px] text-slate-400">Radius (r)</div>
                    <div className="text-sm font-bold text-amber-400">{primaryCircle.radius.toFixed(2)} u</div>
                  </div>
                  <div className="p-2 bg-surface-lowest rounded-lg border border-surface-border">
                    <div className="text-[10px] text-slate-400">Diameter (d = 2r)</div>
                    <div className="text-sm font-bold text-white">{(primaryCircle.radius * 2).toFixed(2)} u</div>
                  </div>
                  <div className="p-2 bg-surface-lowest rounded-lg border border-surface-border">
                    <div className="text-[10px] text-slate-400">Circumference (2πr)</div>
                    <div className="text-sm font-bold text-sky-400">
                      {(2 * Math.PI * primaryCircle.radius).toFixed(2)} u
                    </div>
                  </div>
                  <div className="p-2 bg-surface-lowest rounded-lg border border-surface-border">
                    <div className="text-[10px] text-slate-400">Area (πr²)</div>
                    <div className="text-sm font-bold text-emerald-400">
                      {(Math.PI * primaryCircle.radius * primaryCircle.radius).toFixed(2)} u²
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chords Live Readout */}
            {Object.keys(chords).length > 0 && primaryCircle && (
              <div className="p-3.5 bg-surface-card rounded-xl border border-surface-border space-y-2">
                <div className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-amber-400 text-[16px]">linear_scale</span>
                  <span>Chords & Perpendiculars</span>
                </div>

                {Object.values(chords).map((chord) => {
                  const ptA = circumferencePoints[chord.pointAId];
                  const ptB = circumferencePoints[chord.pointBId];
                  if (!ptA || !ptB) return null;
                  const wA = getCircumferenceCoords(primaryCircle, ptA.angleRad);
                  const wB = getCircumferenceCoords(primaryCircle, ptB.angleRad);
                  const m = calculateChordMetrics(primaryCircle, wA, wB);

                  return (
                    <div key={chord.id} className="p-2.5 bg-surface-lowest rounded-lg border border-surface-border text-xs font-mono space-y-1">
                      <div className="flex justify-between font-bold text-slate-200">
                        <span>{chord.name}</span>
                        <span className="text-amber-400">L = {m.length} u</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Dist from Center (d):</span>
                        <span className="text-slate-300 font-bold">{m.distFromCenter} u</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Midpoint M:</span>
                        <span className="text-slate-300">({m.midpoint.x}, {m.midpoint.y})</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Central vs Inscribed Live Telemetry */}
            {angleTheoremData && (
              <div className="p-3.5 bg-surface-card rounded-xl border border-surface-border space-y-2">
                <div className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center justify-between">
                  <span>Arc Subtended Angles</span>
                  <span className="text-amber-400 text-[10px]">∠AOB = 2 × ∠APB</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 bg-surface-lowest rounded-lg border border-surface-border">
                    <div className="text-[10px] text-slate-400">Central ∠AOB</div>
                    <div className="text-base font-bold text-sky-400">{angleTheoremData.central}°</div>
                  </div>
                  <div className="p-2 bg-surface-lowest rounded-lg border border-surface-border">
                    <div className="text-[10px] text-slate-400">Inscribed ∠APB</div>
                    <div className="text-base font-bold text-amber-400">{angleTheoremData.inscribed}°</div>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/30 p-2 rounded border border-emerald-800/40 text-center">
                  Ratio: Central / Inscribed = {angleTheoremData.ratio} (Exact 2.00)
                </div>
              </div>
            )}

            {/* Cyclic Quad Telemetry */}
            {quadVerification && (
              <div className="p-3.5 bg-surface-card rounded-xl border border-surface-border space-y-2">
                <div className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center justify-between">
                  <span>Cyclic Quad Angles</span>
                  <span className="text-emerald-400 text-[10px]">Opposite = 180°</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 bg-surface-lowest rounded-lg border border-surface-border">
                    <div className="text-[10px] text-slate-400">∠A + ∠C Sum</div>
                    <div className="text-sm font-bold text-amber-400">{quadVerification.sumAC}°</div>
                  </div>
                  <div className="p-2 bg-surface-lowest rounded-lg border border-surface-border">
                    <div className="text-[10px] text-slate-400">∠B + ∠D Sum</div>
                    <div className="text-sm font-bold text-emerald-400">{quadVerification.sumBD}°</div>
                  </div>
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

        {/* TAB 2: THEOREMS */}
        {activeTab === 'theorems' && primaryTheorem && (
          <div className="space-y-4">
            <div className="p-3.5 bg-surface-card rounded-xl border border-surface-border space-y-2.5">
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <span className="material-symbols-outlined text-amber-400 text-[18px]">menu_book</span>
                <span>{primaryTheorem.title}</span>
              </div>
              <div className="text-xs text-slate-300 bg-surface-lowest p-2.5 rounded-lg border border-surface-border leading-relaxed">
                <strong className="text-amber-400 block mb-0.5">Theorem Statement:</strong>
                {primaryTheorem.statement}
              </div>
              <div className="text-[11px] text-slate-400 bg-surface-lowest p-2 rounded-lg border border-surface-border">
                <strong className="text-sky-400 block mb-0.5">Student Manipulation:</strong>
                {primaryTheorem.instructions}
              </div>
            </div>

            {/* Prediction Quiz Card */}
            <div className="p-3.5 bg-surface-card rounded-xl border border-surface-border space-y-2.5">
              <div className="text-xs font-bold text-amber-300 uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">psychology</span>
                <span>Hypothesis & Prediction</span>
              </div>
              <div className="text-xs text-slate-200 font-medium">
                {primaryTheorem.predictionQuestion.question}
              </div>
              <div className="space-y-1.5">
                {primaryTheorem.predictionQuestion.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedPrediction(idx);
                      setShowPredictionResult(true);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-all border ${
                      selectedPrediction === idx
                        ? idx === primaryTheorem.predictionQuestion.correctIndex
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-red-500/20 border-red-500 text-red-300'
                        : 'bg-surface-lowest border-surface-border text-slate-300 hover:bg-surface-elevated'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {showPredictionResult && (
                <div className="text-[11px] p-2 rounded bg-surface-lowest border border-surface-border text-slate-300 mt-2">
                  {primaryTheorem.predictionQuestion.explanation}
                </div>
              )}
            </div>

            {/* Guided Mathematical Proof Steps */}
            <div className="p-3.5 bg-surface-card rounded-xl border border-surface-border space-y-2">
              <div className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Step-by-Step Proof</span>
              </div>
              <div className="space-y-1.5">
                {primaryTheorem.proofSteps.map((step, idx) => (
                  <div key={idx} className="p-2 rounded bg-surface-lowest border border-surface-border text-[11px] space-y-0.5">
                    <div className="font-semibold text-slate-200">
                      {idx + 1}. {step.statement}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono italic">
                      [Reason: {step.reason}]
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PRACTICE */}
        {activeTab === 'practice' && primaryQuestion && (
          <div className="space-y-4">
            <div className="p-3.5 bg-surface-card rounded-xl border border-surface-border space-y-3">
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">quiz</span>
                <span>{primaryQuestion.title}</span>
              </div>

              <div className="text-xs text-slate-200 leading-relaxed bg-surface-lowest p-3 rounded-lg border border-surface-border">
                {primaryQuestion.question}
              </div>

              {/* Input for Answer */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-slate-400">Your Answer:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={practiceInput}
                    onChange={(e) => setPracticeInput(e.target.value)}
                    placeholder="e.g. 8 cm"
                    className="flex-1 bg-surface-lowest border border-surface-border rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    onClick={() => {
                      const isCorrect =
                        practiceInput.trim().toLowerCase() ===
                        String(primaryQuestion.correctAnswer).trim().toLowerCase();
                      submitPracticeAnswer(primaryQuestion.id, practiceInput, isCorrect);
                    }}
                    className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
                  >
                    Check
                  </button>
                </div>
              </div>

              {/* Feedback */}
              {practiceAnswers[primaryQuestion.id] && (
                <div
                  className={`p-2.5 rounded-lg text-xs font-bold flex items-center gap-2 ${
                    practiceAnswers[primaryQuestion.id].isCorrect
                      ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-700/60'
                      : 'bg-red-950/40 text-red-300 border border-red-700/60'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {practiceAnswers[primaryQuestion.id].isCorrect ? 'check_circle' : 'cancel'}
                  </span>
                  <span>
                    {practiceAnswers[primaryQuestion.id].isCorrect
                      ? 'Correct! Excellent application of the theorem.'
                      : 'Incorrect. Try reviewing the theorem hint below.'}
                  </span>
                </div>
              )}

              {/* Hint & Solution toggle */}
              <div className="pt-2 border-t border-surface-border space-y-2">
                <div className="text-[11px] text-amber-300 bg-amber-950/30 p-2 rounded border border-amber-800/40">
                  <strong>Hint:</strong> {primaryQuestion.hint}
                </div>

                <button
                  onClick={() => setShowPracticeSolution(!showPracticeSolution)}
                  className="text-xs text-slate-400 hover:text-white underline font-mono block"
                >
                  {showPracticeSolution ? 'Hide Step-by-Step Solution' : 'Show Step-by-Step Solution'}
                </button>

                {showPracticeSolution && (
                  <div className="p-2.5 rounded bg-surface-lowest border border-surface-border text-xs text-slate-300 space-y-1">
                    <strong className="text-emerald-400 block">Step-by-Step Solution:</strong>
                    {primaryQuestion.stepByStepSolution.map((s, idx) => (
                      <p key={idx} className="text-[11px] text-slate-300">
                        • {s}
                      </p>
                    ))}
                    <div className="text-[10px] text-slate-400 pt-1 font-mono">
                      Theorem: {primaryQuestion.theoremApplied}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
