/**
 * Mathematical Inspector & Educational Guidance Panel
 *
 * Implements properties inspection for points and segments,
 * step-by-step distance formula calculation breakdown,
 * and teacher-led Predict / Reveal mode for smart TVs.
 */

import React, { useState } from 'react';
import { useMathStore } from '../../store/useMathStore';
import { calculateDistanceAnalysis } from '../../engine/mathematics/calculations';
import type { MathPoint } from '../../engine/mathematics/types';

export const MathInspectorPanel: React.FC = () => {
  const {
    objects,
    selectedId,
    setPointCoordinates,
    selectObject,
    predictRevealed,
    studentPrediction,
    predictionSubmitted,
    setStudentPrediction,
    submitPrediction,
    revealSolution,
    resetPrediction,
  } = useMathStore();

  const [inputX, setInputX] = useState<string>('');
  const [inputY, setInputY] = useState<string>('');
  const [editPointId, setEditPointId] = useState<string | null>(null);

  const selectedObject = selectedId ? objects[selectedId] : null;

  // Find points A and B for distance experiment
  const ptA = (objects['pt_A'] as MathPoint) || Object.values(objects).find((o): o is MathPoint => o.kind === 'point');
  const ptB = (objects['pt_B'] as MathPoint) || Object.values(objects).filter((o): o is MathPoint => o.kind === 'point')[1];

  const distanceAnalysis = ptA && ptB && ptA.id !== ptB.id ? calculateDistanceAnalysis(ptA, ptB) : null;

  // Sync point input inputs when selection changes
  React.useEffect(() => {
    if (selectedObject && selectedObject.kind === 'point') {
      setInputX(selectedObject.x.toString());
      setInputY(selectedObject.y.toString());
      setEditPointId(selectedObject.id);
    } else {
      setEditPointId(null);
    }
  }, [selectedId, selectedObject]);

  const handleApplyCoordinates = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPointId) return;

    const parsedX = parseFloat(inputX);
    const parsedY = parseFloat(inputY);

    if (Number.isFinite(parsedX) && Number.isFinite(parsedY)) {
      setPointCoordinates(editPointId, parsedX, parsedY, true);
    }
  };

  return (
    <aside className="w-80 lg:w-96 bg-surface-low border-l border-surface-border flex flex-col h-full overflow-y-auto select-none">
      {/* Panel Header */}
      <div className="px-5 py-4 border-b border-surface-border flex items-center justify-between bg-surface-card/60">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <span className="material-symbols-outlined text-primary text-[20px]">analytics</span>
          <span>Properties & Analysis</span>
        </div>
        {selectedId && (
          <button
            onClick={() => selectObject(null)}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-surface-container border border-surface-border"
          >
            Clear
          </button>
        )}
      </div>

      <div className="p-5 space-y-6 flex-1">
        {/* Section 1: Selected Object Inspector */}
        {selectedObject && selectedObject.kind === 'point' && (
          <div className="space-y-4 p-4 rounded-xl bg-surface-card border border-surface-border shadow-md">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <span className="text-xs font-mono font-bold text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">adjust</span>
                POINT: {selectedObject.label}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30">
                Cartesian Point
              </span>
            </div>

            <form onSubmit={handleApplyCoordinates} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">X Coordinate</label>
                  <input
                    type="number"
                    step="0.5"
                    value={inputX}
                    onChange={(e) => setInputX(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-surface-lowest border border-surface-border font-mono text-sm text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Y Coordinate</label>
                  <input
                    type="number"
                    step="0.5"
                    value={inputY}
                    onChange={(e) => setInputY(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-surface-lowest border border-surface-border font-mono text-sm text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-1.5 rounded-lg bg-primary hover:bg-primary-dim text-white text-xs font-semibold font-mono transition-colors shadow"
              >
                Apply Coordinates
              </button>
            </form>

            <div className="text-[11px] font-mono text-slate-400 pt-1 flex justify-between">
              <span>Quadrant:</span>
              <span className="text-slate-200 font-semibold">
                {selectedObject.x > 0 && selectedObject.y > 0
                  ? 'I (x>0, y>0)'
                  : selectedObject.x < 0 && selectedObject.y > 0
                  ? 'II (x<0, y>0)'
                  : selectedObject.x < 0 && selectedObject.y < 0
                  ? 'III (x<0, y<0)'
                  : selectedObject.x > 0 && selectedObject.y < 0
                  ? 'IV (x>0, y<0)'
                  : 'On Axis'}
              </span>
            </div>
          </div>
        )}

        {selectedObject && selectedObject.kind === 'segment' && (() => {
          const pA = objects[selectedObject.pointAId] as MathPoint | undefined;
          const pB = objects[selectedObject.pointBId] as MathPoint | undefined;
          const dist = pA && pB ? Math.hypot(pB.x - pA.x, pB.y - pA.y) : 0;
          const midX = pA && pB ? (pA.x + pB.x) / 2 : 0;
          const midY = pA && pB ? (pA.y + pB.y) / 2 : 0;

          return (
            <div className="space-y-4 p-4 rounded-xl bg-surface-card border border-surface-border shadow-md">
              <div className="flex items-center justify-between border-b border-surface-border pb-3">
                <span className="text-xs font-mono font-bold text-purple-400 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">linear_scale</span>
                  SEGMENT: {selectedObject.label || 'AB'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                  Line Segment
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-surface-border/50">
                  <span className="text-slate-400">Endpoint 1:</span>
                  <span className="text-white font-semibold">
                    {pA ? `${pA.label}(${pA.x}, ${pA.y})` : '—'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-border/50">
                  <span className="text-slate-400">Endpoint 2:</span>
                  <span className="text-white font-semibold">
                    {pB ? `${pB.label}(${pB.x}, ${pB.y})` : '—'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-border/50">
                  <span className="text-slate-400">Length (Distance):</span>
                  <span className="text-purple-300 font-bold text-sm">
                    {dist.toFixed(3)} units
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Midpoint M:</span>
                  <span className="text-slate-200">
                    ({midX.toFixed(2)}, {midY.toFixed(2)})
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Section 2: Distance Between Two Points Live Calculation */}
        {distanceAnalysis && (
          <div className="space-y-4 p-4 rounded-xl bg-gradient-to-b from-surface-card to-surface-lowest border border-surface-border shadow-lg">
            <div className="flex items-center justify-between border-b border-surface-border pb-2.5">
              <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">square_foot</span>
                DISTANCE FORMULA BREAKDOWN
              </span>
              <span className="text-[10px] font-mono text-slate-400">Class 9–10</span>
            </div>

            {/* Formula Reference */}
            <div className="p-3 rounded-lg bg-surface-lowest border border-surface-border/70 text-center space-y-1">
              <span className="text-[11px] font-mono text-slate-400 block uppercase tracking-wider">
                Distance Equation
              </span>
              <div className="text-sm font-mono text-amber-200 font-bold">
                d = √[(x₂ - x₁)² + (y₂ - y₁)²]
              </div>
            </div>

            {/* Step-by-Step Values */}
            <div className="space-y-2 text-xs font-mono bg-surface-lowest/70 p-3 rounded-lg border border-surface-border/50">
              <div className="flex justify-between">
                <span className="text-slate-400">Horizontal Diff (Δx):</span>
                <span className="text-sky-400 font-semibold">
                  |{distanceAnalysis.p2.x} - {distanceAnalysis.p1.x}| = {distanceAnalysis.absDx}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vertical Diff (Δy):</span>
                <span className="text-orange-400 font-semibold">
                  |{distanceAnalysis.p2.y} - {distanceAnalysis.p1.y}| = {distanceAnalysis.absDy}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sum of Squares:</span>
                <span className="text-slate-200">
                  {distanceAnalysis.dxSquared} + {distanceAnalysis.dySquared} = {distanceAnalysis.sumOfSquares}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-surface-border/60">
                <span className="text-slate-300 font-bold">Calculated Distance:</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {distanceAnalysis.isExactSquare
                    ? `${distanceAnalysis.exactSqrt} (Exact)`
                    : `√${distanceAnalysis.sumOfSquares} ≈ ${distanceAnalysis.formattedDistance}`}
                </span>
              </div>
            </div>

            {/* Educational Note */}
            <p className="text-[11px] text-slate-400 leading-relaxed italic">
              "The distance between two points is calculated using the Pythagorean theorem, where Δx and Δy are the perpendicular legs."
            </p>
          </div>
        )}

        {/* Section 3: Predict & Reveal Interaction (Classroom Smart TV Mode) */}
        {distanceAnalysis && (
          <div className="space-y-3 p-4 rounded-xl bg-surface-card border border-primary/40 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase font-mono">
                <span className="material-symbols-outlined text-[17px]">psychology</span>
                Predict & Reveal
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {predictionSubmitted ? 'Prediction Checked' : 'Teacher / Student Mode'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Estimate or calculate the distance before revealing the authoritative mathematical solution.
            </p>

            {!predictRevealed ? (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    Your Distance Prediction (units):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5.8"
                    value={studentPrediction}
                    onChange={(e) => setStudentPrediction(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface-lowest border border-surface-border font-mono text-sm text-white focus:outline-none focus:border-primary placeholder-slate-600"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={submitPrediction}
                    className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary-dim text-white text-xs font-bold font-mono transition-colors shadow-md flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Submit & Check
                  </button>
                  <button
                    onClick={revealSolution}
                    className="px-3 py-2 rounded-lg bg-surface-elevated hover:bg-surface-high border border-surface-border text-slate-300 text-xs font-mono transition-colors"
                  >
                    Reveal
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <div className="p-3 rounded-lg bg-surface-lowest border border-emerald-500/40 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Authoritative Distance:</span>
                    <strong className="text-emerald-400 text-sm">
                      {distanceAnalysis.formattedDistance} units
                    </strong>
                  </div>
                  {studentPrediction && (
                    <div className="flex items-center justify-between text-xs font-mono pt-1 border-t border-surface-border/50">
                      <span className="text-slate-400">Your Estimate:</span>
                      <strong className="text-primary font-bold">
                        {studentPrediction}
                      </strong>
                    </div>
                  )}
                  {studentPrediction && Number.isFinite(parseFloat(studentPrediction)) && (
                    <div className="text-[11px] font-mono text-slate-400 pt-0.5">
                      Delta:{' '}
                      <span className="text-amber-300 font-semibold">
                        {Math.abs(parseFloat(studentPrediction) - distanceAnalysis.distance).toFixed(3)} units
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={resetPrediction}
                  className="w-full py-1.5 rounded-lg bg-surface-container hover:bg-surface-high border border-surface-border text-slate-300 text-xs font-mono transition-colors flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[15px]">refresh</span>
                  Try Another Prediction
                </button>
              </div>
            )}
          </div>
        )}

        {/* Section 4: General Guidance when nothing selected */}
        {!selectedObject && (
          <div className="p-4 rounded-xl bg-surface-card/60 border border-surface-border text-xs text-slate-400 space-y-2">
            <span className="font-semibold text-slate-200 block flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-primary">touch_app</span>
              Interactive Tips
            </span>
            <ul className="list-disc pl-4 space-y-1 leading-relaxed">
              <li>Click or touch Point A or B to select and edit exact coordinates.</li>
              <li>Drag points across the coordinate plane to see live distance and right-triangle updates.</li>
              <li>Toggle Snap-to-Grid in the top toolbar to snap to whole coordinates.</li>
              <li>Use mouse wheel or zoom buttons to zoom in and out.</li>
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
};
