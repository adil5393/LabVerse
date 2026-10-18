/**
 * Scientific Inspector Panel for Free Laboratory (Class 9 Quadrilaterals - Milestone M3)
 * NCERT Ganita Manjari Part II, Chapter 12
 *
 * Implements real-time geometry calculations:
 * - Quadrilateral classification & convexity
 * - Angle sums & interior angle metrics
 * - Side lengths & parallelism invariants
 * - Diagonal bisection, length equality, and perpendicularity
 * - Varignon Parallelogram live area ratio (50%)
 * - Triangle medians & centroid 2:1 division ratio
 * - Planar tiling tessellation controls
 */

import React from 'react';
import { useQuadrilateralStore } from '../../../store/useQuadrilateralStore';
import {
  classifyQuadrilateral,
  computeVarignonParallelogram,
  computeTriangleMedians,
} from '../../../engine/mathematics/quadrilaterals/geometry';
import { QUADRILATERAL_EXPERIMENTS } from '../../../engine/mathematics/quadrilaterals/quadrilateralExperiments';

export const QuadrilateralInspectorPanel: React.FC = () => {
  const {
    points,
    quadrilaterals,
    triangles,
    currentExperimentId,
    tiling,
    toggleTiling,
    setTiling,
  } = useQuadrilateralStore();

  const currentExp =
    QUADRILATERAL_EXPERIMENTS.find((e) => e.id === currentExperimentId) ||
    QUADRILATERAL_EXPERIMENTS[0];

  const firstQuad = Object.values(quadrilaterals)[0];
  const firstTri = Object.values(triangles)[0];

  // Calculate live quadrilateral analysis
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

  // Calculate Varignon metrics if points exist
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

  // Calculate Triangle medians if triangle exists
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

  return (
    <aside className="w-80 lg:w-96 bg-surface-low border-l border-surface-border flex flex-col h-full overflow-hidden shrink-0 select-none z-10 font-sans">
      {/* Header */}
      <div className="p-4 border-b border-surface-border bg-surface-card/60 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Geometric Analysis</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400">Class 9 NCERT</span>
        </div>
        <h2 className="text-sm font-bold text-white truncate">{currentExp.title}</h2>
        <p className="text-[11px] text-slate-400 line-clamp-2">{currentExp.description}</p>
      </div>

      {/* Scrollable Metrics Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* 1. Quadrilateral Classification Card */}
        {quadAnalysis && (
          <div className="p-3.5 rounded-2xl bg-surface-card border border-surface-border space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300">Classification</span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  quadAnalysis.kind === 'square' || quadAnalysis.kind === 'rhombus' || quadAnalysis.kind === 'rectangle' || quadAnalysis.kind === 'parallelogram'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : quadAnalysis.isConvex
                    ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                    : 'bg-red-500/15 text-red-300 border-red-500/30'
                }`}
              >
                {quadAnalysis.kind.toUpperCase()}
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-snug">{quadAnalysis.explanation}</p>

            {/* Invariant Matrix */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-surface-border/60 text-xs">
              <div className="bg-surface-lowest/70 p-2 rounded-lg border border-surface-border/40">
                <span className="text-[10px] font-mono text-slate-400 block">Angle Sum (360°)</span>
                <span className="font-bold text-amber-400 font-mono text-sm">
                  {quadAnalysis.angleSum.toFixed(1)}°
                </span>
              </div>
              <div className="bg-surface-lowest/70 p-2 rounded-lg border border-surface-border/40">
                <span className="text-[10px] font-mono text-slate-400 block">Polygon Area</span>
                <span className="font-bold text-white font-mono text-sm">
                  {quadAnalysis.area.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Angles Grid */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Interior Angles</span>
              <div className="grid grid-cols-4 gap-1 text-center font-mono text-xs">
                {quadAnalysis.interiorAngles.map((ang, idx) => (
                  <div key={idx} className="bg-surface-lowest p-1.5 rounded border border-surface-border/40">
                    <span className="text-[9px] text-slate-500 block">∠{['A', 'B', 'C', 'D'][idx]}</span>
                    <span className="text-slate-200 font-bold">{ang.toFixed(0)}°</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sides Grid */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Side Lengths</span>
              <div className="grid grid-cols-4 gap-1 text-center font-mono text-xs">
                {quadAnalysis.sideLengths.map((len, idx) => (
                  <div key={idx} className="bg-surface-lowest p-1.5 rounded border border-surface-border/40">
                    <span className="text-[9px] text-slate-500 block">{['AB', 'BC', 'CD', 'DA'][idx]}</span>
                    <span className="text-slate-200 font-bold">{len.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Parallelogram Invariant Checks */}
            <div className="pt-2 border-t border-surface-border/60 space-y-1 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Opposite Sides Parallel (AB||CD & BC||DA):</span>
                <span className={quadAnalysis.oppSidesParallel[0] && quadAnalysis.oppSidesParallel[1] ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                  {quadAnalysis.oppSidesParallel[0] && quadAnalysis.oppSidesParallel[1] ? 'YES' : 'NO'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Opposite Sides Equal:</span>
                <span className={quadAnalysis.oppSidesEqual[0] && quadAnalysis.oppSidesEqual[1] ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                  {quadAnalysis.oppSidesEqual[0] && quadAnalysis.oppSidesEqual[1] ? 'YES' : 'NO'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Diagonals Bisect Each Other:</span>
                <span className={quadAnalysis.diagonalsBisect ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                  {quadAnalysis.diagonalsBisect ? 'YES' : 'NO'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 2. Varignon Parallelogram Invariant Card */}
        {varignonMetrics && (
          <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">shape_line</span>
                <span>Varignon Parallelogram PQRS</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                Midpoints
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-snug">
              Midpoints of sides AB, BC, CD, and DA always form a parallelogram whose area is exactly half of ABCD.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-surface-lowest/80 p-2 rounded-lg border border-amber-500/20">
                <span className="text-[10px] text-slate-400 block">Varignon Area</span>
                <span className="font-bold text-amber-400 text-sm">
                  {varignonMetrics.varignonArea.toFixed(2)}
                </span>
              </div>
              <div className="bg-surface-lowest/80 p-2 rounded-lg border border-amber-500/20">
                <span className="text-[10px] text-slate-400 block">Area Ratio</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {(varignonMetrics.ratio * 100).toFixed(1)}% (1/2)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Triangle Medians & Centroid Card */}
        {triangleMedians && (
          <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-purple-300 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">crisis_alert</span>
                <span>Centroid Invariant (2:1 Ratio)</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                Medians
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-snug">
              Centroid G divides each median into two segments with an exact 2:1 ratio from vertex to midpoint.
            </p>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between items-center bg-surface-lowest/80 px-2 py-1.5 rounded border border-purple-500/20">
                <span className="text-slate-400">Median AD (AG : GD)</span>
                <span className="font-bold text-purple-300">
                  {triangleMedians.agLength.toFixed(1)} : {triangleMedians.gdLength.toFixed(1)} = {triangleMedians.ratioA.toFixed(2)}:1
                </span>
              </div>
              <div className="flex justify-between items-center bg-surface-lowest/80 px-2 py-1.5 rounded border border-purple-500/20">
                <span className="text-slate-400">Median BE (BG : GE)</span>
                <span className="font-bold text-purple-300">
                  {triangleMedians.bgLength.toFixed(1)} : {triangleMedians.geLength.toFixed(1)} = {triangleMedians.ratioB.toFixed(2)}:1
                </span>
              </div>
              <div className="flex justify-between items-center bg-surface-lowest/80 px-2 py-1.5 rounded border border-purple-500/20">
                <span className="text-slate-400">Median CF (CG : GF)</span>
                <span className="font-bold text-purple-300">
                  {triangleMedians.cgLength.toFixed(1)} : {triangleMedians.gfLength.toFixed(1)} = {triangleMedians.ratioC.toFixed(2)}:1
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 4. Planar Tiling Controls Card */}
        <div className="p-3.5 rounded-2xl bg-surface-card border border-surface-border space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">grid_view</span>
              <span>Plane Tiling (Tessellation)</span>
            </span>
            <button
              onClick={toggleTiling}
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold transition-colors ${
                tiling?.enabled
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-surface-elevated text-slate-400 hover:text-white'
              }`}
            >
              {tiling?.enabled ? 'Active' : 'Disabled'}
            </button>
          </div>

          <p className="text-[11px] text-slate-300 leading-snug">
            Any simple quadrilateral tiles the Euclidean plane via 180° edge-rotations because its angles sum to 360°.
          </p>

          {tiling?.enabled && (
            <div className="space-y-2 pt-1 border-t border-surface-border/60">
              <div className="flex justify-between items-center text-xs font-mono text-slate-300">
                <span>Tessellation Grid:</span>
                <span>{tiling.rows} × {tiling.cols} Tiles</span>
              </div>
              <input
                type="range"
                min="2"
                max="8"
                value={tiling.rows}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setTiling({ ...tiling, rows: val, cols: val + 1 });
                }}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
