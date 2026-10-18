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
  distanceBetween,
  checkParallelism,
  computeStandaloneAngleGeometry,
} from '../../../engine/mathematics/quadrilaterals/geometry';
import { QUADRILATERAL_EXPERIMENTS } from '../../../engine/mathematics/quadrilaterals/quadrilateralExperiments';

export const QuadrilateralInspectorPanel: React.FC = () => {
  const {
    points,
    segments,
    quadrilaterals,
    triangles,
    angles,
    distances,
    constraints,
    viewport,
    currentExperimentId,
    tiling,
    toggleTiling,
    setTiling,
    toggleAngleReflex,
    deleteObject,
    clearAngleMeasurements,
    clearDistanceMeasurements,
    clearAllMeasurements,
    toggleQuadAnglesVisibility,
    toggleConstraint,
    deleteConstraint,
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
                  {quadAnalysis.isSimple ? `${quadAnalysis.angleSum.toFixed(1)}°` : 'N/A'}
                </span>
              </div>
              <div className="bg-surface-lowest/70 p-2 rounded-lg border border-surface-border/40">
                <span className="text-[10px] font-mono text-slate-400 block">Polygon Area</span>
                <span className="font-bold text-white font-mono text-sm">
                  {quadAnalysis.isSimple ? quadAnalysis.area.toFixed(2) : '0.00'}
                </span>
              </div>
            </div>

            {/* Angles Grid */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                {quadAnalysis.isSimple ? 'Interior Angles' : 'Interior Angles (Undefined)'}
              </span>
              <div className="grid grid-cols-4 gap-1 text-center font-mono text-xs">
                {quadAnalysis.interiorAngles.map((ang, idx) => {
                  const isReflex = quadAnalysis.isSimple && quadAnalysis.isReflex[idx];
                  return (
                    <div
                      key={idx}
                      className={`p-1.5 rounded border ${
                        isReflex
                          ? 'bg-amber-500/15 border-amber-500/40'
                          : 'bg-surface-lowest border-surface-border/40'
                      }`}
                    >
                      <span className={`text-[9px] block ${isReflex ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
                        ∠{['A', 'B', 'C', 'D'][idx]} {isReflex ? '★' : ''}
                      </span>
                      <span className={isReflex ? 'text-amber-300 font-bold' : 'text-slate-200 font-bold'}>
                        {quadAnalysis.isSimple ? `${ang.toFixed(0)}°` : '—'}
                      </span>
                    </div>
                  );
                })}
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

        {/* Manual Measurements & Reset Card */}
        <div className="p-3.5 rounded-2xl bg-surface-card border border-surface-border space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-sky-300 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">straighten</span>
              <span>Manual Measurements</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">
              {Object.keys(angles).length + Object.keys(distances).length} Total
            </span>
          </div>

          <p className="text-[11px] text-slate-300 leading-snug">
            Student-created manual measurements. Resetting or deleting these does not delete underlying geometry or automatic labels.
          </p>

          {/* Automatic Polygon Interior Angles Visibility Toggle */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-surface-lowest/70 border border-surface-border/50 text-xs">
            <div className="flex flex-col">
              <span className="font-semibold text-slate-200">Polygon Interior Angles</span>
              <span className="text-[10px] text-slate-400">Automatic educational vertex badges</span>
            </div>
            <button
              onClick={() => toggleQuadAnglesVisibility(firstQuad?.id)}
              className={`px-2.5 py-1 text-[11px] font-mono rounded font-bold transition-colors ${
                firstQuad?.showAngles !== false
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30'
                  : 'bg-surface-elevated text-slate-400 hover:text-white'
              }`}
            >
              {firstQuad?.showAngles !== false ? 'Visible' : 'Hidden'}
            </button>
          </div>

          {/* Manual Angles List */}
          <div className="space-y-2 pt-1 border-t border-surface-border/60">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="font-bold flex items-center gap-1">
                <span>∠</span>
                <span>Angles ({Object.keys(angles).length})</span>
              </span>
              {Object.keys(angles).length > 0 && (
                <button
                  onClick={clearAngleMeasurements}
                  className="text-[10px] text-rose-400 hover:text-rose-300 underline cursor-pointer"
                >
                  Clear Angles
                </button>
              )}
            </div>

            {Object.keys(angles).length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">No manual angles measured yet. Use the Angle tool (A).</p>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {Object.values(angles).map((ang) => {
                  const p1 = points[ang.point1Id];
                  const vert = points[ang.vertexId];
                  const p2 = points[ang.point2Id];
                  let degStr = '---';
                  if (p1 && vert && p2) {
                    const geo = computeStandaloneAngleGeometry(p1, vert, p2, viewport, 800, 600, ang.isReflex);
                    degStr = `${geo.degrees.toFixed(1)}°`;
                  }
                  return (
                    <div
                      key={ang.id}
                      className="flex items-center justify-between bg-surface-lowest/80 px-2 py-1.5 rounded border border-surface-border/40 text-xs font-mono"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-amber-300 font-bold">{ang.name}</span>
                        <span className="text-white font-semibold">{degStr}</span>
                        {ang.isReflex && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300">
                            Reflex
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleAngleReflex(ang.id)}
                          title="Switch between minor (0-180°) and reflex (180-360°) interpretation"
                          className="px-1.5 py-0.5 text-[10px] rounded bg-surface-elevated hover:bg-slate-700 text-slate-300"
                        >
                          {ang.isReflex ? 'Minor' : 'Reflex'}
                        </button>
                        <button
                          onClick={() => deleteObject(ang.id, 'angle')}
                          title="Remove this measurement"
                          className="w-5 h-5 flex items-center justify-center rounded text-rose-400 hover:bg-rose-500/20"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Manual Distances List */}
          <div className="space-y-2 pt-1 border-t border-surface-border/60">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">straighten</span>
                <span>Distances ({Object.keys(distances).length})</span>
              </span>
              {Object.keys(distances).length > 0 && (
                <button
                  onClick={clearDistanceMeasurements}
                  className="text-[10px] text-rose-400 hover:text-rose-300 underline cursor-pointer"
                >
                  Clear Distances
                </button>
              )}
            </div>

            {Object.keys(distances).length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">No distances measured yet. Use the Distance tool (K).</p>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {Object.values(distances).map((dist) => {
                  const pA = points[dist.pointAId];
                  const pB = points[dist.pointBId];
                  const dVal = pA && pB ? distanceBetween(pA, pB).toFixed(2) : '---';
                  return (
                    <div
                      key={dist.id}
                      className="flex items-center justify-between bg-surface-lowest/80 px-2 py-1.5 rounded border border-surface-border/40 text-xs font-mono"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-emerald-400 font-bold">{dist.name || 'AB'}</span>
                        <span className="text-white font-semibold">{dVal} units</span>
                      </div>
                      <button
                        onClick={() => deleteObject(dist.id, 'distance')}
                        title="Remove this distance measurement"
                        className="w-5 h-5 flex items-center justify-center rounded text-rose-400 hover:bg-rose-500/20"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bulk Clear All Manual Measurements */}
          {(Object.keys(angles).length > 0 || Object.keys(distances).length > 0) && (
            <div className="pt-2 border-t border-surface-border/60">
              <button
                onClick={clearAllMeasurements}
                className="w-full py-1.5 px-3 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-mono font-bold border border-rose-500/30 transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[15px]">clear_all</span>
                <span>Clear All Manual Measurements</span>
              </button>
            </div>
          )}
        </div>

        {/* Geometric Constraints Card */}
        <div className="p-3.5 rounded-2xl bg-surface-card border border-surface-border space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
              <span className="font-serif text-sm">∥</span>
              <span>Geometric Constraints</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
              {Object.keys(constraints).length} Active
            </span>
          </div>

          <p className="text-[11px] text-slate-300 leading-snug">
            Active constraints governing quadrilateral geometry. You can unlock or disable constraints to explore counterexamples.
          </p>

          {Object.keys(constraints).length === 0 ? (
            <p className="text-[11px] text-slate-500 italic">No geometric constraints applied. Use Parallel Constraint (∥) to link segments.</p>
          ) : (
            <div className="space-y-2">
              {Object.values(constraints).map((c) => {
                let statusLabel = 'Satisfied';
                let isViolated = false;
                const isMuted = c.active === false || c.enabled === false;
                const isEnabled = !isMuted;

                if (c.type === 'parallel_segments' && c.targetEntityIds.length >= 2) {
                  const s1 = segments[c.targetEntityIds[0]];
                  const s2 = segments[c.targetEntityIds[1]];
                  if (s1 && s2 && points[s1.pointAId] && points[s1.pointBId] && points[s2.pointAId] && points[s2.pointBId]) {
                    const p1A = points[s1.pointAId];
                    const p1B = points[s1.pointBId];
                    const p2A = points[s2.pointAId];
                    const p2B = points[s2.pointBId];
                    const chk = checkParallelism(p1A, p1B, p2A, p2B);
                    if (!chk.isParallel) {
                      isViolated = true;
                      statusLabel = `Violated (${chk.angleDiffDegrees.toFixed(1)}°)`;
                    } else {
                      statusLabel = 'Satisfied (0.0°)';
                    }
                  }
                } else if (c.type === 'parallel_opposite' && c.targetEntityIds.length >= 4) {
                  const [p1Id, p2Id, p3Id, p4Id] = c.targetEntityIds;
                  const p1 = points[p1Id];
                  const p2 = points[p2Id];
                  const p3 = points[p3Id];
                  const p4 = points[p4Id];
                  if (p1 && p2 && p3 && p4) {
                    const chk1 = checkParallelism(p1, p2, p4, p3);
                    const chk2 = checkParallelism(p2, p3, p1, p4);
                    if (!chk1.isParallel || !chk2.isParallel) {
                      isViolated = true;
                      statusLabel = 'Violated';
                    } else {
                      statusLabel = 'Satisfied';
                    }
                  }
                }

                if (isMuted) {
                  statusLabel = 'Disabled';
                }

                return (
                  <div
                    key={c.id}
                    className="p-2 rounded-lg bg-surface-lowest/80 border border-surface-border/50 space-y-1.5 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white truncate text-[11px] flex items-center gap-1">
                        <span className="text-amber-400 font-serif">∥</span>
                        <span>{c.description || c.type}</span>
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          isMuted
                            ? 'bg-slate-700 text-slate-300'
                            : isViolated
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-surface-border/40 text-[10px]">
                      <span className="text-slate-400 capitalize">{c.type.replace('_', ' ')}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleConstraint(c.id)}
                          className={`px-1.5 py-0.5 rounded font-medium transition-colors ${
                            isEnabled
                              ? 'bg-slate-800 text-slate-300 hover:text-white'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {isEnabled ? 'Mute' : 'Enable'}
                        </button>
                        <button
                          onClick={() => deleteConstraint(c.id)}
                          title="Remove constraint without deleting geometry"
                          className="text-rose-400 hover:text-rose-300 px-1 py-0.5 rounded hover:bg-rose-500/20 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

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
