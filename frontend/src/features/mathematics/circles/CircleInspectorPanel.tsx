/**
 * Scientific Properties Inspector & Theorem Lab for Class 9 Circles (Milestone M2 & M2.1)
 *
 * Implements:
 * 1. Synchronized Explore, Investigate, and Practice learning workflows
 * 2. Live Properties & Geometric Telemetry (Circles, Radii, Diameters, Chords, Angles, Tangents)
 * 3. Structured 7-stage Theorem Investigations:
 *    - Mathematical Objective
 *    - Initial Construction
 *    - Prediction Prompt & Hypothesis
 *    - Interactive Manipulation Checklist
 *    - Dynamic Observations & Invariants
 *    - Explanation
 *    - Guided Euclidean Mathematical Proof
 * 4. Interactive Practice Problems with tolerance-aware answer verification & step-by-step solutions
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
  validatePracticeAnswer,
  resolveCirclePointCoords,
  calculateCircumcircleFromThreePoints,
  testConcyclicityFourPoints,
} from '../../../engine/mathematics/circles/geometry';

export const CircleInspectorPanel: React.FC = () => {
  const [selectedPrediction, setSelectedPrediction] = useState<number | null>(null);
  const [showPredictionResult, setShowPredictionResult] = useState(false);
  const [practiceInput, setPracticeInput] = useState('');
  const [showPracticeSolution, setShowPracticeSolution] = useState(false);

  const {
    currentExperimentId,
    mode,
    setMode,
    circles,
    circumferencePoints,
    chords,
    radiusDiameters,
    angles,
    cyclicQuads,
    selectedId,
    selectedType,
    deleteSelected,
    submitPracticeAnswer,
    practiceAnswers,
    symmetryRotation,
    symmetryReflectionAxis,
    symmetryShowRotated,
    symmetryShowReflected,
    setSymmetryRotation,
    setSymmetryReflectionAxis,
    toggleSymmetryShowRotated,
    toggleSymmetryShowReflected,
    equalChordsLocked,
    setEqualChordsLocked,
    howManyCirclesPointCount,
    setHowManyCirclesPointCount,
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

  const handleCheckAnswer = () => {
    if (!primaryQuestion || !practiceInput.trim()) return;
    const isCorrect = validatePracticeAnswer(
      practiceInput,
      primaryQuestion.correctAnswer,
      primaryQuestion.tolerance || 0.1
    );
    submitPracticeAnswer(primaryQuestion.id, practiceInput, isCorrect);
  };

  return (
    <aside className="w-80 lg:w-96 bg-surface-low border-l border-surface-border flex flex-col h-full overflow-hidden shrink-0 select-none">
      {/* Top Tabs: Two-way synchronized with learning mode */}
      <div className="flex border-b border-surface-border bg-surface-card/60 p-1.5 gap-1 shrink-0">
        <button
          onClick={() => setMode('explore')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            mode === 'explore'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-surface-elevated'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">tune</span>
          <span>Explore</span>
        </button>

        <button
          onClick={() => setMode('investigate')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            mode === 'investigate'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-surface-elevated'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">menu_book</span>
          <span>Investigate</span>
        </button>

        <button
          onClick={() => setMode('practice')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            mode === 'practice'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-surface-elevated'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">quiz</span>
          <span>Practice</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* TAB 1: EXPLORE / PROPERTIES */}
        {mode === 'explore' && (
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
                    <div className="text-sm font-bold text-sky-400">{(primaryCircle.radius * 2).toFixed(2)} u</div>
                  </div>
                  <div className="p-2 bg-surface-lowest rounded-lg border border-surface-border">
                    <div className="text-[10px] text-slate-400">Circumference (2πr)</div>
                    <div className="text-sm font-bold text-slate-200">
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

            {/* Diameters Live Readout */}
            {Object.values(radiusDiameters).filter((r) => r.type === 'diameter').length > 0 && primaryCircle && (
              <div className="p-3.5 bg-surface-card rounded-xl border border-surface-border space-y-2">
                <div className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sky-400 text-[16px]">line_start_circle</span>
                  <span>Constructed Diameters</span>
                </div>
                {Object.values(radiusDiameters)
                  .filter((r) => r.type === 'diameter')
                  .map((dia) => {
                    const pt1 = circumferencePoints[dia.pointId];
                    const pt2 = dia.point2Id ? circumferencePoints[dia.point2Id] : null;
                    return (
                      <div
                        key={dia.id}
                        className="p-2.5 bg-surface-lowest rounded-lg border border-surface-border text-xs font-mono space-y-1"
                      >
                        <div className="flex justify-between font-bold text-slate-200">
                          <span>{dia.name}</span>
                          <span className="text-sky-400">d = {(primaryCircle.radius * 2).toFixed(2)} u</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>Endpoints:</span>
                          <span className="text-slate-300">
                            {pt1?.name || 'A'} and {pt2?.name || "A'"}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>Passes Through:</span>
                          <span className="text-slate-300">
                            Center O({primaryCircle.center.x.toFixed(1)}, {primaryCircle.center.y.toFixed(1)})
                          </span>
                        </div>
                      </div>
                    );
                  })}
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
                    <div
                      key={chord.id}
                      className="p-2.5 bg-surface-lowest rounded-lg border border-surface-border text-xs font-mono space-y-1"
                    >
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
                        <span className="text-slate-300">
                          ({m.midpoint.x}, {m.midpoint.y})
                        </span>
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

            {/* Committed Angle Measurements */}
            {Object.keys(angles).length > 0 && primaryCircle && (
              <div className="p-3.5 bg-surface-card rounded-xl border border-surface-border space-y-2">
                <div className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-amber-400 text-[16px]">square_foot</span>
                  <span>Angle Measurements ({Object.keys(angles).length})</span>
                </div>
                {Object.values(angles).map((ang) => {
                  const p1 = resolveCirclePointCoords(ang.point1Id, circles, circumferencePoints);
                  const v = resolveCirclePointCoords(ang.vertexId, circles, circumferencePoints);
                  const p2 = resolveCirclePointCoords(ang.point2Id, circles, circumferencePoints);
                  if (!p1 || !v || !p2) return null;
                  const deg = calculateAngleDegrees(p1.coords, v.coords, p2.coords);

                  return (
                    <div
                      key={ang.id}
                      className="p-2.5 bg-surface-lowest rounded-lg border border-surface-border text-xs font-mono space-y-1"
                    >
                      <div className="flex justify-between font-bold text-slate-200">
                        <span>{ang.name}</span>
                        <span className={ang.isCentral ? 'text-sky-400' : 'text-amber-400'}>{deg.toFixed(1)}°</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Classification:</span>
                        <span className="text-slate-300">{ang.isCentral ? 'Central Angle' : 'Inscribed Angle'}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Points:</span>
                        <span className="text-slate-300">
                          {p1.name} — {v.name} (Vertex) — {p2.name}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* SPECIALIZED CARD: Symmetry of a Circle */}
            {currentExperimentId === 'symmetry-of-circle' && primaryCircle && (
              <div className="p-3.5 bg-surface-card rounded-xl border border-amber-500/30 space-y-3">
                <div className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">rotate_right</span>
                  <span>Symmetry & Invariants Laboratory</span>
                </div>

                {/* Rotation Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono text-slate-300">
                    <span>Rotation around O:</span>
                    <span className="text-sky-400 font-bold">{symmetryRotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={symmetryRotation}
                    onChange={(e) => setSymmetryRotation(Number(e.target.value))}
                    className="w-full accent-sky-400 cursor-pointer"
                  />
                </div>

                {/* Reflection Axis Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono text-slate-300">
                    <span>Reflection Axis (Diameter):</span>
                    <span className="text-purple-400 font-bold">{symmetryReflectionAxis}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="180"
                    value={symmetryReflectionAxis}
                    onChange={(e) => setSymmetryReflectionAxis(Number(e.target.value))}
                    className="w-full accent-purple-400 cursor-pointer"
                  />
                </div>

                {/* Toggles */}
                <div className="flex gap-2">
                  <button
                    onClick={toggleSymmetryShowRotated}
                    className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-mono font-semibold border transition-all ${
                      symmetryShowRotated
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        : 'bg-surface-lowest text-slate-400 border-surface-border'
                    }`}
                  >
                    Rotated P′ ({symmetryShowRotated ? 'ON' : 'OFF'})
                  </button>
                  <button
                    onClick={toggleSymmetryShowReflected}
                    className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-mono font-semibold border transition-all ${
                      symmetryShowReflected
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        : 'bg-surface-lowest text-slate-400 border-surface-border'
                    }`}
                  >
                    Reflected P″ ({symmetryShowReflected ? 'ON' : 'OFF'})
                  </button>
                </div>

                {/* Invariant metrics */}
                <div className="p-2.5 bg-surface-lowest rounded-lg border border-surface-border text-[11px] font-mono space-y-1 text-slate-300">
                  <div className="text-[10px] font-bold text-amber-400 uppercase">Metric Invariants:</div>
                  <div className="flex justify-between">
                    <span>Radius OP:</span>
                    <span className="text-emerald-400">{primaryCircle.radius.toFixed(2)} u</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rotated OP′:</span>
                    <span className="text-sky-400">{primaryCircle.radius.toFixed(2)} u</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reflected OP″:</span>
                    <span className="text-purple-400">{primaryCircle.radius.toFixed(2)} u</span>
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-surface-border">
                    Radial distance is invariant under any rotation or reflection.
                  </div>
                </div>
              </div>
            )}

            {/* SPECIALIZED CARD: How Many Circles? */}
            {currentExperimentId === 'how-many-circles' && (
              <div className="p-3.5 bg-surface-card rounded-xl border border-sky-500/30 space-y-3">
                <div className="text-xs font-mono font-bold text-sky-400 uppercase flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">all_inclusive</span>
                  <span>Circles Through Points</span>
                </div>

                {/* Investigation Tabs */}
                <div className="flex gap-1 bg-surface-lowest p-1 rounded-lg border border-surface-border text-[10px] font-mono">
                  {([1, 2, 3] as const).map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => setHowManyCirclesPointCount(cnt)}
                      className={`flex-1 py-1 rounded text-center font-bold transition-all ${
                        howManyCirclesPointCount === cnt
                          ? 'bg-sky-500/25 text-sky-300 border border-sky-500/40'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cnt} Point{cnt > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>

                {/* Circumcenter Telemetry for 3 Points */}
                {howManyCirclesPointCount === 3 && (() => {
                  const ptA = circumferencePoints['pt_A'];
                  const ptB = circumferencePoints['pt_B'];
                  const ptC = circumferencePoints['pt_C'];
                  if (ptA && ptB && ptC && primaryCircle) {
                    const wA = getCircumferenceCoords(primaryCircle, ptA.angleRad);
                    const wB = getCircumferenceCoords(primaryCircle, ptB.angleRad);
                    const wC = getCircumferenceCoords(primaryCircle, ptC.angleRad);
                    const circum = calculateCircumcircleFromThreePoints(wA, wB, wC);

                    return (
                      <div className="p-2.5 bg-surface-lowest rounded-lg border border-surface-border text-xs font-mono space-y-1.5">
                        {circum.isCollinear ? (
                          <div className="p-2 rounded bg-red-950/40 border border-red-700/60 text-red-300 text-[11px] leading-relaxed">
                            <strong>Collinear Points:</strong> Perpendicular bisectors are parallel and never intersect. No finite circle passes through three distinct collinear points!
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Circumcenter O:</span>
                              <span className="text-sky-400 font-bold">
                                ({circum.circumcenter?.x.toFixed(2)}, {circum.circumcenter?.y.toFixed(2)})
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Circumradius (R):</span>
                              <span className="text-emerald-400 font-bold">{circum.radius?.toFixed(2)} u</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Triangle Classification:</span>
                              <span className="text-amber-400 font-bold uppercase">{circum.triangleType}</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-surface-border">
                              <span>OA = OB = OC:</span>
                              <span className="text-slate-200">
                                {circum.oa.toFixed(2)} = {circum.ob.toFixed(2)} = {circum.oc.toFixed(2)}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  }
                  return null;
                })()}

                {howManyCirclesPointCount === 1 && (
                  <div className="p-2.5 bg-surface-lowest rounded-lg border border-surface-border text-[11px] text-slate-300 leading-relaxed">
                    <strong>1 Point:</strong> Infinitely many circles of arbitrary radii pass through a single point on the plane.
                  </div>
                )}

                {howManyCirclesPointCount === 2 && (
                  <div className="p-2.5 bg-surface-lowest rounded-lg border border-surface-border text-[11px] text-slate-300 leading-relaxed">
                    <strong>2 Points:</strong> Infinitely many circles pass through points A and B. Their centers strictly lie on the <em>perpendicular bisector</em> of segment AB.
                  </div>
                )}
              </div>
            )}

            {/* SPECIALIZED CARD: Equal Chords & Central Angles */}
            {currentExperimentId === 'equal-chords-central-angles' && (
              <div className="p-3.5 bg-surface-card rounded-xl border border-emerald-500/30 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">balance</span>
                    <span>Equal Chords & Angles</span>
                  </span>
                  <button
                    onClick={() => setEqualChordsLocked(!equalChordsLocked)}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-all ${
                      equalChordsLocked
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {equalChordsLocked ? 'Locked (Theorem)' : 'Free (Counterexamples)'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {Object.values(chords).map((ch) => {
                    const ptA = circumferencePoints[ch.pointAId];
                    const ptB = circumferencePoints[ch.pointBId];
                    if (!ptA || !ptB || !primaryCircle) return null;
                    const wA = getCircumferenceCoords(primaryCircle, ptA.angleRad);
                    const wB = getCircumferenceCoords(primaryCircle, ptB.angleRad);
                    const m = calculateChordMetrics(primaryCircle, wA, wB);
                    const deg = calculateAngleDegrees(wA, primaryCircle.center, wB);

                    return (
                      <div key={ch.id} className="p-2 bg-surface-lowest rounded-lg border border-surface-border space-y-1">
                        <div className="text-[10px] font-bold text-slate-300">{ch.name}</div>
                        <div className="text-xs text-amber-400 font-bold">L = {m.length} u</div>
                        <div className="text-[11px] text-sky-400">∠ = {deg.toFixed(1)}°</div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-[11px] text-slate-300 bg-surface-lowest p-2 rounded border border-surface-border leading-relaxed">
                  <strong>Theorem:</strong> Equal chords subtend equal angles at center (ΔAOB ≅ ΔCOD by SSS).<br />
                  <strong>Converse:</strong> Equal central angles correspond to equal chords (SAS).
                </div>
              </div>
            )}

            {/* SPECIALIZED CARD: Distance of Chords from Center */}
            {currentExperimentId === 'chord-distance-comparison' && (
              <div className="p-3.5 bg-surface-card rounded-xl border border-amber-500/30 space-y-3">
                <div className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">compare_arrows</span>
                  <span>Chord Distance Comparison</span>
                </div>

                <div className="space-y-2">
                  {Object.values(chords).map((ch) => {
                    const ptA = circumferencePoints[ch.pointAId];
                    const ptB = circumferencePoints[ch.pointBId];
                    if (!ptA || !ptB || !primaryCircle) return null;
                    const wA = getCircumferenceCoords(primaryCircle, ptA.angleRad);
                    const wB = getCircumferenceCoords(primaryCircle, ptB.angleRad);
                    const m = calculateChordMetrics(primaryCircle, wA, wB);

                    return (
                      <div key={ch.id} className="p-2 bg-surface-lowest rounded-lg border border-surface-border text-xs font-mono flex justify-between items-center">
                        <div>
                          <span className="font-bold text-slate-200">{ch.name}</span>
                          <span className="text-[10px] text-slate-400 block">Length: {m.length} u</span>
                        </div>
                        <div className="text-right">
                          <span className="text-amber-400 font-bold">d = {m.distFromCenter} u</span>
                          <span className="text-[10px] text-slate-400 block">from Center</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-800/40 text-[11px] text-emerald-300 leading-relaxed font-mono">
                  <strong>Pythagoras Law:</strong> d² = r² - (L/2)².<br />
                  As chord length increases, its perpendicular distance from the center strictly decreases!
                </div>
              </div>
            )}

            {/* SPECIALIZED CARD: Concyclicity & Converses */}
            {currentExperimentId === 'concyclicity-and-converses' && primaryCircle && (() => {
              const ptA = circumferencePoints['pt_A'];
              const ptB = circumferencePoints['pt_B'];
              const ptC = circumferencePoints['pt_C'];
              const ptD = circumferencePoints['pt_D'];
              if (ptA && ptB && ptC && ptD) {
                const wA = getCircumferenceCoords(primaryCircle, ptA.angleRad);
                const wB = getCircumferenceCoords(primaryCircle, ptB.angleRad);
                const wC = getCircumferenceCoords(primaryCircle, ptC.angleRad);
                const wD = getCircumferenceCoords(primaryCircle, ptD.angleRad);
                const concyclicTest = testConcyclicityFourPoints(wA, wB, wC, wD);

                return (
                  <div className="p-3.5 bg-surface-card rounded-xl border border-purple-500/30 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono font-bold text-purple-400 uppercase flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">change_circle</span>
                        <span>Concyclicity Test</span>
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                        concyclicTest.isCyclic
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-red-500/20 text-red-300 border-red-500/40'
                      }`}>
                        {concyclicTest.isCyclic ? 'CONCYCLIC' : 'NON-CYCLIC'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="p-2 bg-surface-lowest rounded-lg border border-surface-border">
                        <div className="text-[10px] text-slate-400">∠A + ∠C Sum</div>
                        <div className="text-sm font-bold text-amber-400">{concyclicTest.sumOpposite1.toFixed(1)}°</div>
                      </div>
                      <div className="p-2 bg-surface-lowest rounded-lg border border-surface-border">
                        <div className="text-[10px] text-slate-400">∠B + ∠D Sum</div>
                        <div className="text-sm font-bold text-sky-400">{concyclicTest.sumOpposite2.toFixed(1)}°</div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-300 bg-surface-lowest p-2 rounded border border-surface-border leading-relaxed font-mono">
                      Deviation from 180°: <span className="text-amber-400 font-bold">{concyclicTest.deviationDeg.toFixed(1)}°</span>.<br />
                      Drag point D until opposite sum reaches exactly 180° to achieve concyclicity!
                    </div>
                  </div>
                );
              }
              return null;
            })()}

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

        {/* TAB 2: INVESTIGATE - 7 Structured Stages */}
        {mode === 'investigate' && primaryTheorem && (
          <div className="space-y-4">
            {/* 1. Mathematical Objective & Statement */}
            <div className="p-3.5 bg-surface-card rounded-xl border border-surface-border space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">flag</span>
                  <span>1. Mathematical Objective</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">Theorem Investigation</span>
              </div>
              <div className="text-sm font-bold text-white">{primaryTheorem.title}</div>
              <div className="text-xs text-slate-300 bg-surface-lowest p-2.5 rounded-lg border border-surface-border leading-relaxed">
                <strong className="text-amber-400 block mb-0.5">Formal Statement:</strong>
                {primaryTheorem.statement}
              </div>
            </div>

            {/* 2. Initial Canonical Construction */}
            <div className="p-3 bg-surface-card rounded-xl border border-surface-border space-y-2">
              <div className="text-xs font-bold text-sky-400 uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">architecture</span>
                <span>2. Canonical Construction</span>
              </div>
              <div className="text-xs text-slate-300">
                {currentExperiment.description}
              </div>
            </div>

            {/* 3. Prediction Prompt & Hypothesis */}
            <div className="p-3.5 bg-surface-card rounded-xl border border-surface-border space-y-2.5">
              <div className="text-xs font-bold text-amber-300 uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">psychology</span>
                <span>3. Prediction Prompt</span>
              </div>
              <div className="text-xs text-slate-200 font-medium leading-relaxed">
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
                <div className="text-[11px] p-2.5 rounded-lg bg-surface-lowest border border-surface-border text-slate-300 mt-2 leading-relaxed">
                  <strong className="text-amber-400 block mb-0.5">Explanation:</strong>
                  {primaryTheorem.predictionQuestion.explanation}
                </div>
              )}
            </div>

            {/* 4. Interactive Manipulation Checklist */}
            <div className="p-3.5 bg-surface-card rounded-xl border border-surface-border space-y-2">
              <div className="text-xs font-bold text-sky-400 uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">touch_app</span>
                <span>4. Interactive Manipulation</span>
              </div>
              <div className="text-xs text-slate-300 bg-surface-lowest p-2.5 rounded-lg border border-surface-border leading-relaxed">
                {primaryTheorem.instructions}
              </div>
            </div>

            {/* 5. Dynamic Observations & Invariants */}
            <div className="p-3.5 bg-surface-card rounded-xl border border-surface-border space-y-2">
              <div className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">query_stats</span>
                <span>5. Dynamic Observations</span>
              </div>
              {angleTheoremData && (
                <div className="text-xs font-mono text-slate-200 bg-surface-lowest p-2 rounded border border-surface-border space-y-1">
                  <div>Central Angle: <span className="text-sky-400 font-bold">{angleTheoremData.central}°</span></div>
                  <div>Inscribed Angle: <span className="text-amber-400 font-bold">{angleTheoremData.inscribed}°</span></div>
                  <div className="text-emerald-400 font-bold">Ratio (Central / Inscribed): {angleTheoremData.ratio}</div>
                </div>
              )}
              {quadVerification && (
                <div className="text-xs font-mono text-slate-200 bg-surface-lowest p-2 rounded border border-surface-border space-y-1">
                  <div>∠A + ∠C = <span className="text-amber-400 font-bold">{quadVerification.sumAC}°</span></div>
                  <div>∠B + ∠D = <span className="text-emerald-400 font-bold">{quadVerification.sumBD}°</span></div>
                  <div className="text-emerald-400">Condition: Supplementary (180°)</div>
                </div>
              )}
              <div className="text-[11px] text-slate-400 leading-relaxed italic">
                {primaryTheorem.mathematicalConclusion}
              </div>
            </div>

            {/* 6. Guided Mathematical Proof */}
            <div className="p-3.5 bg-surface-card rounded-xl border border-surface-border space-y-2.5">
              <div className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>6. Guided Mathematical Proof</span>
              </div>
              <div className="space-y-1.5">
                {primaryTheorem.proofSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-surface-lowest border border-surface-border text-[11px] space-y-0.5 leading-relaxed"
                  >
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
        {mode === 'practice' && primaryQuestion && (
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCheckAnswer();
                    }}
                    placeholder={`e.g. ${primaryQuestion.correctAnswer}`}
                    className="flex-1 bg-surface-lowest border border-surface-border rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    onClick={handleCheckAnswer}
                    className="py-1.5 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
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
                <div className="text-[11px] text-amber-300 bg-amber-950/30 p-2.5 rounded-lg border border-amber-800/40 leading-relaxed">
                  <strong>Hint:</strong> {primaryQuestion.hint}
                </div>

                <button
                  onClick={() => setShowPracticeSolution(!showPracticeSolution)}
                  className="text-xs text-slate-400 hover:text-white underline font-mono block"
                >
                  {showPracticeSolution ? 'Hide Step-by-Step Solution' : 'Show Step-by-Step Solution'}
                </button>

                {showPracticeSolution && (
                  <div className="p-3 rounded-lg bg-surface-lowest border border-surface-border text-xs text-slate-300 space-y-1.5 leading-relaxed">
                    <strong className="text-emerald-400 block">Step-by-Step Solution:</strong>
                    {primaryQuestion.stepByStepSolution.map((s, idx) => (
                      <p key={idx} className="text-[11px] text-slate-300">
                        • {s}
                      </p>
                    ))}
                    <div className="text-[10px] text-slate-400 pt-1 font-mono">
                      Theorem Applied: {primaryQuestion.theoremApplied}
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
