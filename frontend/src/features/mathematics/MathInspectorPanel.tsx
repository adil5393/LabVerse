/**
 * Mathematical Inspector & Educational Guidance Panel
 *
 * Implements properties inspection for points, segments, and infinite lines,
 * step-by-step distance formula calculation breakdown for measured points,
 * and teacher-led Predict / Reveal mode for smart TVs.
 */

import React, { useState } from 'react';
import { useMathStore } from '../../store/useMathStore';
import {
  calculateDistanceAnalysis,
  calculateLineAnalysis,
  formatMathNumber,
} from '../../engine/mathematics/calculations';
import { MATH_COLOR_PALETTE, DEFAULT_MATH_COLORS } from '../../engine/mathematics/appearance';
import type { MathPoint } from '../../engine/mathematics/types';

interface AppearanceControlProps {
  label?: string;
  currentColor: string;
  defaultColor?: string;
  onColorChange: (color: string) => void;
  onReset?: () => void;
  showReset?: boolean;
}

const AppearanceControl: React.FC<AppearanceControlProps> = ({
  label = 'Appearance & Color',
  currentColor,
  defaultColor,
  onColorChange,
  onReset,
  showReset = true,
}) => {
  return (
    <div className="space-y-2 pt-2 border-t border-surface-border/60">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px]">palette</span>
          <span>{label}</span>
        </label>
        <div className="flex items-center gap-1.5">
          <span
            className="w-3.5 h-3.5 rounded-full border border-surface-border shadow-sm"
            style={{ backgroundColor: currentColor }}
          />
          <span className="text-[10px] font-mono font-bold text-slate-300 uppercase">
            {currentColor}
          </span>
        </div>
      </div>

      {/* Preset Swatches */}
      <div className="flex items-center justify-between gap-1 bg-surface-lowest p-1.5 rounded-lg border border-surface-border/60">
        {MATH_COLOR_PALETTE.map((swatch) => {
          const isSelected = swatch.value.toUpperCase() === currentColor.toUpperCase();
          return (
            <button
              key={swatch.name}
              type="button"
              onClick={() => onColorChange(swatch.value)}
              className={`w-6 h-6 rounded-md transition-all flex items-center justify-center ${
                isSelected
                  ? 'ring-2 ring-white scale-110 shadow-lg z-10'
                  : 'hover:scale-105 opacity-80 hover:opacity-100'
              }`}
              style={{ backgroundColor: swatch.value }}
              title={`${swatch.name} (${swatch.value})`}
            >
              {isSelected && (
                <span className="material-symbols-outlined text-[13px] text-slate-900 font-bold">
                  check
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom Color Picker & Reset to Default */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <label
          className="flex-1 px-2.5 py-1 rounded-lg bg-surface-lowest border border-surface-border/70 hover:border-surface-border flex items-center justify-between text-xs font-mono text-slate-300 cursor-pointer transition-colors"
          title="Pick custom color"
        >
          <span className="flex items-center gap-1.5 text-[11px]">
            <span className="material-symbols-outlined text-[13px] text-slate-400">colorize</span>
            Custom
          </span>
          <input
            type="color"
            value={currentColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
          />
        </label>

        {showReset && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="px-2.5 py-1 rounded-lg bg-surface-lowest hover:bg-surface-elevated border border-surface-border/70 text-slate-400 hover:text-slate-200 text-[11px] font-mono transition-colors flex items-center gap-1"
            title={defaultColor ? `Reset to default (${defaultColor})` : 'Reset to default color'}
          >
            <span className="material-symbols-outlined text-[13px]">undo</span>
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};

export const MathInspectorPanel: React.FC = () => {
  const {
    objects,
    selectedId,
    activeMeasurement,
    measurements,
    measurementOrder,
    selectedMeasurementId,
    defaultColors,
    setDefaultColor,
    setObjectColor,
    setMeasurementColor,
    resetObjectColorToDefault,
    setPointCoordinates,
    selectObject,
    selectMeasurement,
    deleteObject,
    deleteMeasurement,
    setMeasurementTriangleMode,
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
  const selectedMeasurement = selectedMeasurementId ? measurements[selectedMeasurementId] : null;

  // Resolve active measurement for distance breakdown
  const activeInspectionMeasurement = React.useMemo(() => {
    if (selectedMeasurement) return selectedMeasurement;
    if (selectedMeasurementId && measurements[selectedMeasurementId]) return measurements[selectedMeasurementId];
    if (activeMeasurement) {
      const existing = Object.values(measurements).find(
        (m) =>
          (m.pointAId === activeMeasurement.pointAId && m.pointBId === activeMeasurement.pointBId) ||
          (m.pointAId === activeMeasurement.pointBId && m.pointBId === activeMeasurement.pointAId)
      );
      if (existing) return existing;
    }
    if (measurementOrder.length > 0 && measurements[measurementOrder[0]]) {
      return measurements[measurementOrder[0]];
    }
    return null;
  }, [selectedMeasurement, selectedMeasurementId, activeMeasurement, measurements, measurementOrder]);

  const distanceAnalysis = React.useMemo(() => {
    if (activeInspectionMeasurement) {
      const p1 = objects[activeInspectionMeasurement.pointAId] as MathPoint | undefined;
      const p2 = objects[activeInspectionMeasurement.pointBId] as MathPoint | undefined;
      if (p1 && p2 && p1.id !== p2.id) {
        return calculateDistanceAnalysis(p1, p2);
      }
    }
    const ptA =
      (objects['pt_A'] as MathPoint) ||
      Object.values(objects).find((o): o is MathPoint => o.kind === 'point');
    const ptB =
      (objects['pt_B'] as MathPoint) ||
      Object.values(objects).filter((o): o is MathPoint => o.kind === 'point')[1];
    if (ptA && ptB && ptA.id !== ptB.id) return calculateDistanceAnalysis(ptA, ptB);
    return null;
  }, [activeInspectionMeasurement, objects]);

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
        {(selectedId || selectedMeasurementId) && (
          <button
            onClick={() => {
              selectObject(null);
              selectMeasurement(null);
            }}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-surface-container border border-surface-border"
          >
            Clear
          </button>
        )}
      </div>

      <div className="p-5 space-y-6 flex-1">
        {/* Section 1: Selected Object Inspector */}

        {/* 1A. Point Inspector */}
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

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-1.5 rounded-lg bg-primary hover:bg-primary-dim text-white text-xs font-semibold font-mono transition-colors shadow"
                >
                  Apply Coordinates
                </button>
                <button
                  type="button"
                  onClick={() => deleteObject(selectedObject.id)}
                  className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-700/60 text-red-200 text-xs font-mono transition-colors flex items-center gap-1"
                  title="Delete Point (Delete)"
                >
                  <span className="material-symbols-outlined text-[15px]">delete</span>
                </button>
              </div>
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

            {/* Appearance Section */}
            <AppearanceControl
              label="Point Appearance"
              currentColor={selectedObject.color || defaultColors.point}
              defaultColor={defaultColors.point}
              onColorChange={(color) => setObjectColor(selectedObject.id, color)}
              onReset={() => resetObjectColorToDefault(selectedObject.id)}
            />
          </div>
        )}

        {/* 1B. Segment Inspector */}
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
                <div className="flex justify-between py-1 border-b border-surface-border/50">
                  <span className="text-slate-400">Midpoint M:</span>
                  <span className="text-slate-200">
                    ({midX.toFixed(2)}, {midY.toFixed(2)})
                  </span>
                </div>
              </div>

              {/* Appearance Section */}
              <AppearanceControl
                label="Segment Appearance"
                currentColor={selectedObject.color || defaultColors.segment}
                defaultColor={defaultColors.segment}
                onColorChange={(color) => setObjectColor(selectedObject.id, color)}
                onReset={() => resetObjectColorToDefault(selectedObject.id)}
              />

              <button
                type="button"
                onClick={() => deleteObject(selectedObject.id)}
                className="w-full py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-700/60 text-red-200 text-xs font-mono transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[15px]">delete</span>
                <span>Delete Segment</span>
              </button>
            </div>
          );
        })()}

        {/* 1C. Infinite Line Inspector */}
        {selectedObject && selectedObject.kind === 'line' && (() => {
          const pA = objects[selectedObject.pointAId] as MathPoint | undefined;
          const pB = objects[selectedObject.pointBId] as MathPoint | undefined;
          const analysis = pA && pB ? calculateLineAnalysis(pA, pB) : null;

          return (
            <div className="space-y-4 p-4 rounded-xl bg-surface-card border border-surface-border shadow-md">
              <div className="flex items-center justify-between border-b border-surface-border pb-3">
                <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">trending_flat</span>
                  LINE: {selectedObject.label || 'Infinite Line'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  Infinite Line
                </span>
              </div>

              {analysis && (
                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-surface-lowest border border-cyan-500/30 text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Line Equation
                    </span>
                    <strong className="text-sm text-cyan-200 font-bold block mt-0.5">
                      {analysis.equation}
                    </strong>
                  </div>

                  <div className="flex justify-between py-1 border-b border-surface-border/50">
                    <span className="text-slate-400">Slope (m):</span>
                    <span className="text-white font-semibold">
                      {analysis.isVertical ? 'Undefined (Vertical)' : formatMathNumber(analysis.slope)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-surface-border/50">
                    <span className="text-slate-400">Y-Intercept (c):</span>
                    <span className="text-white font-semibold">
                      {Number.isNaN(analysis.yIntercept) ? 'None' : formatMathNumber(analysis.yIntercept)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-surface-border/50">
                    <span className="text-slate-400">Angle of Inclination:</span>
                    <span className="text-white font-semibold">{analysis.angleDeg}°</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-surface-border/50">
                    <span className="text-slate-400">Defining Points:</span>
                    <span className="text-slate-300">
                      {pA ? `${pA.label}(${pA.x}, ${pA.y})` : ''} & {pB ? `${pB.label}(${pB.x}, ${pB.y})` : ''}
                    </span>
                  </div>
                </div>
              )}

              {/* Appearance Section */}
              <AppearanceControl
                label="Line Appearance"
                currentColor={selectedObject.color || defaultColors.line}
                defaultColor={defaultColors.line}
                onColorChange={(color) => setObjectColor(selectedObject.id, color)}
                onReset={() => resetObjectColorToDefault(selectedObject.id)}
              />

              <button
                type="button"
                onClick={() => deleteObject(selectedObject.id)}
                className="w-full py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-700/60 text-red-200 text-xs font-mono transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[15px]">delete</span>
                <span>Delete Line</span>
              </button>
            </div>
          );
        })()}

        {/* 1D. Selected Measurement Inspector */}
        {selectedMeasurement && distanceAnalysis && (
          <div className="space-y-4 p-4 rounded-xl bg-surface-card border border-amber-500/40 shadow-md">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">straighten</span>
                MEASUREMENT: {distanceAnalysis.p1.label} ↔ {distanceAnalysis.p2.label}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Distance Analysis
              </span>
            </div>

            {/* Endpoints & Metrics */}
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-surface-border/50">
                <span className="text-slate-400">Endpoint 1:</span>
                <span className="text-white font-semibold">
                  {distanceAnalysis.p1.label}({distanceAnalysis.p1.x}, {distanceAnalysis.p1.y})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-border/50">
                <span className="text-slate-400">Endpoint 2:</span>
                <span className="text-white font-semibold">
                  {distanceAnalysis.p2.label}({distanceAnalysis.p2.x}, {distanceAnalysis.p2.y})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-border/50">
                <span className="text-slate-400">Horizontal Diff (Δx):</span>
                <span className="text-sky-400 font-bold">
                  {distanceAnalysis.absDx} units
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-border/50">
                <span className="text-slate-400">Vertical Diff (Δy):</span>
                <span className="text-orange-400 font-bold">
                  {distanceAnalysis.absDy} units
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-border/50">
                <span className="text-slate-400">Total Distance:</span>
                <span className="text-amber-300 font-bold text-sm">
                  {distanceAnalysis.isExactSquare
                    ? `${distanceAnalysis.exactSqrt} (Exact)`
                    : `√${distanceAnalysis.sumOfSquares} ≈ ${distanceAnalysis.formattedDistance}`}
                </span>
              </div>
            </div>

            {/* Triangle Display Mode Selector */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-mono text-slate-400 block">
                Auxiliary Triangle Guide
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-surface-lowest p-1 rounded-lg border border-surface-border">
                <button
                  type="button"
                  onClick={() => setMeasurementTriangleMode(selectedMeasurement.id, 'horizontal-then-vertical')}
                  className={`py-1.5 px-1 rounded text-[10px] font-mono font-bold transition-all flex flex-col items-center gap-0.5 ${
                    (selectedMeasurement.triangleMode || 'horizontal-then-vertical') === 'horizontal-then-vertical'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Helper C = (x₂, y₁) [Standard]"
                >
                  <span>H → V</span>
                  <span className="text-[9px] opacity-70">Helper C</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMeasurementTriangleMode(selectedMeasurement.id, 'vertical-then-horizontal')}
                  className={`py-1.5 px-1 rounded text-[10px] font-mono font-bold transition-all flex flex-col items-center gap-0.5 ${
                    selectedMeasurement.triangleMode === 'vertical-then-horizontal'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Helper D = (x₁, y₂)"
                >
                  <span>V → H</span>
                  <span className="text-[9px] opacity-70">Helper D</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMeasurementTriangleMode(selectedMeasurement.id, 'both')}
                  className={`py-1.5 px-1 rounded text-[10px] font-mono font-bold transition-all flex flex-col items-center gap-0.5 ${
                    selectedMeasurement.triangleMode === 'both'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Both Helper Triangles (Bounding Rectangle)"
                >
                  <span>Both Δ</span>
                  <span className="text-[9px] opacity-70">C & D</span>
                </button>
              </div>
            </div>

            {/* Appearance Section */}
            <AppearanceControl
              label="Measurement Appearance"
              currentColor={selectedMeasurement.color || defaultColors.measurement}
              defaultColor={defaultColors.measurement}
              onColorChange={(color) => setMeasurementColor(selectedMeasurement.id, color)}
              onReset={() => resetObjectColorToDefault(selectedMeasurement.id)}
            />

            {/* Delete Measurement button */}
            <button
              type="button"
              onClick={() => deleteMeasurement(selectedMeasurement.id)}
              className="w-full py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-700/60 text-red-200 text-xs font-mono transition-colors flex items-center justify-center gap-1.5"
              title="Delete this measurement (Delete / Backspace)"
            >
              <span className="material-symbols-outlined text-[15px]">delete</span>
              <span>Delete Measurement</span>
            </button>
          </div>
        )}

        {/* 1E. Default Creation Colors (shown when nothing is selected) */}
        {!selectedObject && !selectedMeasurement && (
          <div className="space-y-3 p-4 rounded-xl bg-surface-card border border-surface-border shadow-md">
            <div className="flex items-center justify-between border-b border-surface-border pb-2.5">
              <span className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[16px]">palette</span>
                DEFAULT CREATION COLORS
              </span>
              <span className="text-[10px] font-mono text-slate-400">Pre-Plot</span>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <AppearanceControl
                label="Point Default"
                currentColor={defaultColors.point}
                defaultColor={DEFAULT_MATH_COLORS.point}
                onColorChange={(color) => setDefaultColor('point', color)}
                onReset={() => setDefaultColor('point', DEFAULT_MATH_COLORS.point)}
                showReset={defaultColors.point !== DEFAULT_MATH_COLORS.point}
              />
              <AppearanceControl
                label="Segment Default"
                currentColor={defaultColors.segment}
                defaultColor={DEFAULT_MATH_COLORS.segment}
                onColorChange={(color) => setDefaultColor('segment', color)}
                onReset={() => setDefaultColor('segment', DEFAULT_MATH_COLORS.segment)}
                showReset={defaultColors.segment !== DEFAULT_MATH_COLORS.segment}
              />
              <AppearanceControl
                label="Infinite Line Default"
                currentColor={defaultColors.line}
                defaultColor={DEFAULT_MATH_COLORS.line}
                onColorChange={(color) => setDefaultColor('line', color)}
                onReset={() => setDefaultColor('line', DEFAULT_MATH_COLORS.line)}
                showReset={defaultColors.line !== DEFAULT_MATH_COLORS.line}
              />
              <AppearanceControl
                label="Measurement Default"
                currentColor={defaultColors.measurement}
                defaultColor={DEFAULT_MATH_COLORS.measurement}
                onColorChange={(color) => setDefaultColor('measurement', color)}
                onReset={() => setDefaultColor('measurement', DEFAULT_MATH_COLORS.measurement)}
                showReset={defaultColors.measurement !== DEFAULT_MATH_COLORS.measurement}
              />
            </div>
          </div>
        )}

        {/* 1F. Active Measurements Compact List (shown when no measurement is selected) */}
        {measurementOrder.length > 0 && !selectedMeasurement && (
          <div className="space-y-2 p-3 rounded-xl bg-surface-card border border-surface-border">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="font-bold flex items-center gap-1 text-amber-400">
                <span className="material-symbols-outlined text-[15px]">straighten</span>
                Active Measurements ({measurementOrder.length})
              </span>
            </div>
            <div className="space-y-1.5">
              {measurementOrder.map((mId) => {
                const m = measurements[mId];
                if (!m) return null;
                const p1 = objects[m.pointAId] as MathPoint | undefined;
                const p2 = objects[m.pointBId] as MathPoint | undefined;
                if (!p1 || !p2) return null;
                const d = Math.hypot(p2.x - p1.x, p2.y - p1.y);
                const mColor = m.color || defaultColors.measurement;

                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-surface-lowest border border-surface-border/70 hover:border-amber-500/50 text-xs font-mono transition-colors group"
                  >
                    <button
                      type="button"
                      onClick={() => selectMeasurement(m.id)}
                      className="flex-1 text-left flex items-center gap-2 text-slate-300 hover:text-white"
                      title="Select measurement to inspect"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 border border-surface-border shadow-xs"
                        style={{ backgroundColor: mColor }}
                      />
                      <span className="font-bold" style={{ color: mColor }}>{p1.label} ↔ {p2.label}</span>
                      <span className="text-slate-400">d ≈ {d.toFixed(2)}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMeasurement(m.id);
                      }}
                      className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors"
                      title="Delete Measurement"
                    >
                      <span className="material-symbols-outlined text-[14px]">delete</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 2: Distance Formula Live Calculation for Measured Points */}
        {distanceAnalysis && (
          <div className="space-y-4 p-4 rounded-xl bg-gradient-to-b from-surface-card to-surface-lowest border border-surface-border shadow-lg">
            <div className="flex items-center justify-between border-b border-surface-border pb-2.5">
              <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">square_foot</span>
                DISTANCE: {distanceAnalysis.p1.label} TO {distanceAnalysis.p2.label}
              </span>
              <span className="text-[10px] font-mono text-slate-400">Class 9–10</span>
            </div>

            {/* Formula Reference */}
            <div className="p-3 rounded-lg bg-surface-lowest border border-surface-border/70 text-center space-y-1">
              <span className="text-[11px] font-mono text-slate-400 block uppercase tracking-wider">
                Euclidean Distance Formula
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
              Estimate the distance between {distanceAnalysis.p1.label} and {distanceAnalysis.p2.label} before revealing the solution.
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
              <li>Click or touch any point, segment, or line to inspect its exact mathematical properties.</li>
              <li>Use the left sidebar tools to construct new points, segments, or infinite lines.</li>
              <li>Use Distance Measure (M) to select any two points on the plane and analyze their Euclidean distance.</li>
              <li>Press Delete or Backspace to delete the selected object.</li>
              <li>Press Escape to cancel an in-progress construction or clear selection.</li>
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
};
