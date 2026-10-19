/**
 * Geometry Reasoning Canvas Component (Milestone M4)
 * Class 9 NCERT Ganita Manjari: Propositions and Their Converses
 */

import React, { useState } from 'react';
import { usePropositionsStore } from '../../../store/usePropositionsStore';
import {
  evaluatePythagorasTriangle,
  evaluateEqualDiagonalsConverse,
} from '../../../engine/mathematics/propositions/counterexampleEngine';

import type { QuadrilateralReasoningState } from '../../../engine/mathematics/propositions/types';

/** Draws the computed quadrilateral: its corners, both diagonals and their lengths come from the engine state. */
const QuadFigure: React.FC<{ state: QuadrilateralReasoningState }> = ({ state }) => {
  const xs = state.vertices.map((v) => v.x), ys = state.vertices.map((v) => v.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const k = Math.min(300 / Math.max(1e-9, maxX - minX), 120 / Math.max(1e-9, maxY - minY));
  const P = (v: { x: number; y: number }) => ({ x: 200 + (v.x - (minX + maxX) / 2) * k, y: 100 - (v.y - (minY + maxY) / 2) * k });
  const [A, B, C, D] = state.vertices.map(P);
  const [l0, l1, l2, l3] = state.vertexLabels;
  const eq = state.diagonalsEqual;
  const colour = state.isConverseCounterexample ? '#f43f5e' : state.isRectangle ? '#10b981' : '#94a3b8';
  const alt = `${state.name}. Diagonal ${l0}${l2} is ${state.diagonalLengthAC} long and diagonal ${l1}${l3} is ${state.diagonalLengthBD} long, so the diagonals are ${eq ? 'equal' : 'not equal'}. ${state.isRectangle ? 'All four angles are right angles: it is a rectangle.' : 'The angles are not all right angles: it is not a rectangle.'}`;
  return (
    <svg viewBox="0 0 400 200" className="w-full max-h-52" role="img" aria-label={alt}>
      <title>{alt}</title>
      <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y} ${D.x},${D.y}`} fill={`${colour}22`} stroke={colour} strokeWidth="2.5" />
      <line x1={A.x} y1={A.y} x2={C.x} y2={C.y} stroke="#fbbf24" strokeWidth="2" strokeDasharray="5,4" />
      <line x1={B.x} y1={B.y} x2={D.x} y2={D.y} stroke="#fbbf24" strokeWidth="2" strokeDasharray="5,4" />
      {[[A, l0], [B, l1], [C, l2], [D, l3]].map(([p, l]) => {
        const q = p as { x: number; y: number };
        return (
          <g key={l as string}>
            <circle cx={q.x} cy={q.y} r="4" fill="#38bdf8" />
            <text x={q.x + (q.x < 200 ? -14 : 8)} y={q.y + (q.y < 100 ? -8 : 16)} fill="#cbd5e1" fontSize="13" fontFamily="monospace" fontWeight="bold">{l as string}</text>
          </g>
        );
      })}
      <text x="200" y="196" fill="#fbbf24" fontSize="12" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
        {l0}{l2} = {state.diagonalLengthAC}, {l1}{l3} = {state.diagonalLengthBD} ({eq ? 'EQUAL' : 'NOT EQUAL'})
      </text>
    </svg>
  );
};

export const GeometryReasoningCanvas: React.FC = () => {
  const {
    triangleSides,
    setTriangleSides,
    selectedQuadType,
    setSelectedQuadType,
  } = usePropositionsStore();

  const [activeSubMode, setActiveSubMode] = useState<'pythagoras' | 'equal_diagonals'>('pythagoras');

  // Pythagoras analysis
  const pythagoras = evaluatePythagorasTriangle(
    triangleSides.a,
    triangleSides.b,
    triangleSides.c
  );

  // Quadrilateral analysis
  const quadReasoning = evaluateEqualDiagonalsConverse(selectedQuadType);

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6 max-w-5xl mx-auto w-full font-sans">
      {/* 1. Header & Sub-mode Selector */}
      <div className="bg-surface-card p-5 rounded-2xl border border-surface-border shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">shapes</span>
              <span>Geometric Reasoning Laboratory</span>
            </span>
            <h2 className="text-lg font-bold text-white mt-1">
              Geometric Invariants, Theorems & Converses
            </h2>
          </div>

          {/* Toggle between Pythagoras and Equal Diagonals */}
          <div className="flex items-center gap-1 bg-surface-lowest p-1 rounded-xl border border-surface-border">
            <button
              onClick={() => setActiveSubMode('pythagoras')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                activeSubMode === 'pythagoras'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Baudhāyana–Pythagoras
            </button>
            <button
              onClick={() => setActiveSubMode('equal_diagonals')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                activeSubMode === 'equal_diagonals'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Equal Diagonals Converse
            </button>
          </div>
        </div>
      </div>

      {/* 2. Sub-mode A: Baudhāyana-Pythagoras Dynamic Triangle */}
      {activeSubMode === 'pythagoras' && (
        <div className="bg-surface-card p-6 rounded-2xl border border-surface-border shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-border/60">
            <div>
              <span className="text-xs font-mono font-bold text-slate-300">
                Theorem: Right Triangle ⇒ a² + b² = c² &nbsp;|&nbsp; Converse: a² + b² = c² ⇒ Right Triangle
              </span>
              <p className="text-[11px] text-slate-400">
                Both the theorem and its converse are true (Biconditional equivalence).
              </p>
            </div>
            <span
              className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                pythagoras.isRightAngled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : pythagoras.classification === 'obtuse'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
              }`}
            >
              {pythagoras.isRightAngled
                ? 'RIGHT-ANGLED (90°)'
                : pythagoras.classification === 'obtuse'
                ? 'OBTUSE-ANGLED (>90°)'
                : 'ACUTE-ANGLED (<90°)'}
            </span>
          </div>

          {/* SVG Triangle Visualizer */}
          <div className="h-56 bg-surface-lowest rounded-xl border border-surface-border/70 flex items-center justify-center p-4 relative overflow-hidden">
            <svg viewBox="0 0 400 200" className="w-full h-full max-h-52">
              {pythagoras.isValidTriangle ? (
                (() => {
                  // Draw triangle with baseline a, vertical/angled point C
                  const scale = 14;
                  const xA = 60;
                  const yA = 160;
                  const xB = xA + pythagoras.sideA * scale;
                  const yB = yA;

                  // Position point C using side a and side b
                  const xC = xA + pythagoras.sideB * scale * Math.cos(Math.PI / 2);
                  const yC = yA - pythagoras.sideB * scale;

                  return (
                    <g>
                      {/* Triangle fill & stroke */}
                      <polygon
                        points={`${xA},${yA} ${xB},${yB} ${xC},${yC}`}
                        fill={
                          pythagoras.isRightAngled
                            ? 'rgba(16, 185, 129, 0.15)'
                            : pythagoras.classification === 'obtuse'
                            ? 'rgba(244, 63, 94, 0.15)'
                            : 'rgba(56, 189, 248, 0.15)'
                        }
                        stroke={
                          pythagoras.isRightAngled
                            ? '#10b981'
                            : pythagoras.classification === 'obtuse'
                            ? '#f43f5e'
                            : '#38bdf8'
                        }
                        strokeWidth="2.5"
                      />

                      {/* Right-angle square marker if right-angled */}
                      {pythagoras.isRightAngled && (
                        <rect
                          x={xA}
                          y={yA - 14}
                          width="14"
                          height="14"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2"
                        />
                      )}

                      {/* Vertices */}
                      <circle cx={xA} cy={yA} r="4.5" fill="#38bdf8" />
                      <circle cx={xB} cy={yB} r="4.5" fill="#38bdf8" />
                      <circle cx={xC} cy={yC} r="4.5" fill="#38bdf8" />

                      {/* Labels */}
                      <text x={xA - 15} y={yA + 5} fill="#94a3b8" fontSize="12" fontFamily="monospace">
                        C
                      </text>
                      <text x={xB + 10} y={yB + 5} fill="#94a3b8" fontSize="12" fontFamily="monospace">
                        B
                      </text>
                      <text x={xC - 5} y={yC - 10} fill="#94a3b8" fontSize="12" fontFamily="monospace">
                        A
                      </text>

                      {/* Dimension labels */}
                      <text x={(xA + xB) / 2} y={yA + 16} fill="#fbbf24" fontSize="11" textAnchor="middle" fontFamily="monospace">
                        a = {pythagoras.sideA}
                      </text>
                      <text x={xA - 14} y={(yA + yC) / 2} fill="#38bdf8" fontSize="11" textAnchor="middle" fontFamily="monospace">
                        b = {pythagoras.sideB}
                      </text>
                      <text x={(xB + xC) / 2 + 12} y={(yB + yC) / 2} fill="#a855f7" fontSize="11" textAnchor="middle" fontFamily="monospace">
                        c = {pythagoras.sideC}
                      </text>
                    </g>
                  );
                })()
              ) : (
                <text x="200" y="100" fill="#f43f5e" fontSize="13" textAnchor="middle" fontFamily="monospace">
                  {pythagoras.invalidationReason}
                </text>
              )}
            </svg>
          </div>

          {/* Interactive Side Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="space-y-1 bg-surface-lowest p-3 rounded-xl border border-surface-border">
              <div className="flex justify-between text-slate-300">
                <span>Side a:</span>
                <span className="font-bold text-amber-400">{triangleSides.a}</span>
              </div>
              <input
                type="range"
                aria-label="Side a length"
                min="1"
                max="12"
                value={triangleSides.a}
                onChange={(e) =>
                  setTriangleSides(
                    parseInt(e.target.value, 10),
                    triangleSides.b,
                    triangleSides.c
                  )
                }
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            <div className="space-y-1 bg-surface-lowest p-3 rounded-xl border border-surface-border">
              <div className="flex justify-between text-slate-300">
                <span>Side b:</span>
                <span className="font-bold text-sky-400">{triangleSides.b}</span>
              </div>
              <input
                type="range"
                aria-label="Side b length"
                min="1"
                max="12"
                value={triangleSides.b}
                onChange={(e) =>
                  setTriangleSides(
                    triangleSides.a,
                    parseInt(e.target.value, 10),
                    triangleSides.c
                  )
                }
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>

            <div className="space-y-1 bg-surface-lowest p-3 rounded-xl border border-surface-border">
              <div className="flex justify-between text-slate-300">
                <span>Side c (longest):</span>
                <span className="font-bold text-purple-400">{triangleSides.c}</span>
              </div>
              <input
                type="range"
                aria-label="Side c length, the longest side"
                min="1"
                max="16"
                value={triangleSides.c}
                onChange={(e) =>
                  setTriangleSides(
                    triangleSides.a,
                    triangleSides.b,
                    parseInt(e.target.value, 10)
                  )
                }
                className="w-full accent-purple-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Pythagorean Equality Analysis Table */}
          <div className="p-4 rounded-xl bg-surface-lowest/80 border border-surface-border space-y-2 text-xs font-mono">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="bg-surface-card p-2 rounded border border-surface-border">
                <span className="text-[10px] text-slate-400 block">a² + b²</span>
                <span className="font-bold text-white text-sm">
                  {pythagoras.sideA}² + {pythagoras.sideB}² = {pythagoras.sumOfSquaresAB}
                </span>
              </div>
              <div className="bg-surface-card p-2 rounded border border-surface-border">
                <span className="text-[10px] text-slate-400 block">c²</span>
                <span className="font-bold text-purple-400 text-sm">
                  {pythagoras.sideC}² = {pythagoras.squareOfC}
                </span>
              </div>
              <div className="bg-surface-card p-2 rounded border border-surface-border">
                <span className="text-[10px] text-slate-400 block">Relationship</span>
                <span
                  className={`font-bold text-sm ${
                    pythagoras.isRightAngled
                      ? 'text-emerald-400'
                      : pythagoras.classification === 'obtuse'
                      ? 'text-rose-400'
                      : 'text-sky-400'
                  }`}
                >
                  {pythagoras.sumOfSquaresAB === pythagoras.squareOfC
                    ? 'a² + b² = c²'
                    : pythagoras.sumOfSquaresAB < pythagoras.squareOfC
                    ? 'a² + b² < c²'
                    : 'a² + b² > c²'}
                </span>
              </div>
              <div className="bg-surface-card p-2 rounded border border-surface-border">
                <span className="text-[10px] text-slate-400 block">Angle at C</span>
                <span className="font-bold text-amber-400 text-sm">
                  {pythagoras.computedAngleDegreesC.toFixed(1)}°
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 pt-1 leading-snug">
              {pythagoras.isRightAngled
                ? 'CONVERSE SATISFIED: Because a² + b² = c², the angle opposite c is proven to be exactly 90° without measuring it.'
                : pythagoras.classification === 'obtuse'
                ? 'OBTUSE TRIANGLE: Since c² > a² + b², the angle opposite c is obtuse (> 90°).'
                : 'ACUTE TRIANGLE: Since a² + b² > c², all three interior angles are acute (< 90°).'}
            </p>
          </div>
        </div>
      )}

      {/* 3. Sub-mode B: Equal Diagonals Quadrilateral Converse */}
      {activeSubMode === 'equal_diagonals' && (
        <div className="bg-surface-card p-6 rounded-2xl border border-surface-border shadow-lg space-y-6">
          <div className="pb-3 border-b border-surface-border/60">
            <span className="text-xs font-mono font-bold text-slate-300">
              Converse Claim: "If a quadrilateral has equal diagonals, then it is a rectangle."
            </span>
            <p className="text-[11px] text-slate-400">
              Is this converse universally true? Test shapes below to find the counterexample.
            </p>
          </div>

          {/* Quadrilateral Shape Selector */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a quadrilateral to test">
            {[
              { id: 'rectangle', label: 'Rectangle (Supporting Example)' },
              { id: 'isosceles_trapezium', label: 'Isosceles Trapezium (COUNTEREXAMPLE)' },
              { id: 'square', label: 'Square' },
              { id: 'rhombus', label: 'Rhombus (diagonals unequal)' },
              { id: 'general', label: 'General Quadrilateral' },
            ].map((q) => (
              <button
                key={q.id}
                onClick={() => setSelectedQuadType(q.id as any)}
                aria-pressed={selectedQuadType === q.id}
                className={`min-h-[44px] px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                  selectedQuadType === q.id
                    ? q.id === 'isosceles_trapezium'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-md'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md'
                    : 'bg-surface-lowest text-slate-400 border-surface-border hover:text-white'
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Diagram: drawn from the SAME coordinates the diagnostics are computed from */}
          <div className="bg-surface-lowest rounded-xl border border-surface-border/70 flex items-center justify-center p-4">
            <QuadFigure state={quadReasoning} />
          </div>

          {/* Diagnostic Result Banner */}
          <div
            className={`p-4 rounded-xl border space-y-2 ${
              quadReasoning.isConverseCounterexample
                ? 'bg-rose-500/15 border-rose-500/50'
                : 'bg-emerald-500/15 border-emerald-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white uppercase">
                {quadReasoning.name}
              </span>
              <span
                className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                  quadReasoning.isConverseCounterexample
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {quadReasoning.isConverseCounterexample
                  ? 'DECISIVE COUNTEREXAMPLE'
                  : 'SUPPORTING EXAMPLE'}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {quadReasoning.explanation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
