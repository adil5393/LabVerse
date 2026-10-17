/**
 * Scientific Inspector Panel for States of Matter Simulator
 *
 * Implements:
 * 1. Telemetry & Properties (Substance, Temp, Phase fractions, Volume, Pressures, Mean KE, Energy Q)
 * 2. Dynamic SVG Heating Curve Graph (T vs Q) with live operating cursor
 * 3. Guided Experiment Stepper ("Heating Water — From Ice to Steam")
 * 4. Scientific Principles & Theory cards (Kinetic Molecular Theory, Latent Heat, Compressibility)
 */

import React, { useState } from 'react';
import { useChemistryStore } from '../../store/useChemistryStore';
import { SUBSTANCES } from '../../engine/chemistry/substances';
import {
  calculatePressure,
} from '../../engine/chemistry/measurements';
import { getHeatingCurveKeypoints } from '../../engine/chemistry/thermodynamics';
import { HEATING_WATER_EXPERIMENT_STEPS } from '../../engine/chemistry/guidedExperiment';
import { CHAMBER_HEIGHT_MAX } from '../../engine/chemistry/constants';

type InspectorTab = 'telemetry' | 'heatingCurve' | 'guided' | 'theory';

export const ScientificInspector: React.FC = () => {
  const [activeTab, setActiveTab] = useState<InspectorTab>('telemetry');

  const {
    substanceId,
    thermoState,
    config,
    sampleMassKg,
    accumulatedWallImpulse,
    impulseWindowSeconds,
    guidedStepIndex,
    setGuidedStep,
    setTemperature,
    setHeating,
  } = useChemistryStore();

  const currentSubstance = SUBSTANCES[substanceId];

  // Pressure calculations
  const pressureData = calculatePressure(
    config.particleCount,
    thermoState.temperatureK,
    config.containerWidth,
    config.pistonHeight,
    thermoState.phase,
    accumulatedWallImpulse,
    impulseWindowSeconds
  );

  // Volume in Liters
  const volumeLiters = ((config.pistonHeight / CHAMBER_HEIGHT_MAX) * 1.0).toFixed(2);

  // Heating Curve Keypoints
  const curvePoints = getHeatingCurveKeypoints(currentSubstance, sampleMassKg);

  // Current Guided Step
  const currentGuidedStep = HEATING_WATER_EXPERIMENT_STEPS[guidedStepIndex] || HEATING_WATER_EXPERIMENT_STEPS[0];

  return (
    <aside className="w-80 lg:w-96 bg-surface-low border-l border-surface-border flex flex-col h-full overflow-hidden shrink-0 select-none">
      {/* Top Tabs */}
      <div className="flex border-b border-surface-border bg-surface-card/60 p-1.5 gap-1 shrink-0">
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'telemetry'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-surface-elevated'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">monitoring</span>
          <span>Telemetry</span>
        </button>

        <button
          onClick={() => setActiveTab('heatingCurve')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'heatingCurve'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-surface-elevated'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">show_chart</span>
          <span>Curve</span>
        </button>

        <button
          onClick={() => setActiveTab('guided')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'guided'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-surface-elevated'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">school</span>
          <span>Guide</span>
        </button>

        <button
          onClick={() => setActiveTab('theory')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'theory'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-surface-elevated'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">menu_book</span>
          <span>Theory</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* TAB 1: TELEMETRY & PROPERTIES */}
        {activeTab === 'telemetry' && (
          <div className="space-y-4">
            {/* Substance Card */}
            <div className="p-3 bg-surface-card rounded-xl border border-surface-border">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-mono text-slate-400">Target Sample</span>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-surface-lowest px-2 py-0.5 rounded border border-emerald-500/20">
                  {currentSubstance.chemicalFormula}
                </span>
              </div>
              <div className="text-base font-bold text-white">{currentSubstance.name}</div>
              <div className="text-[11px] text-slate-400 mt-1">{currentSubstance.description}</div>
            </div>

            {/* Thermal State Card */}
            <div className="p-3 bg-surface-card rounded-xl border border-surface-border space-y-2">
              <div className="text-xs font-mono font-bold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-amber-400">thermostat</span>
                  <span>Thermal Energy & Phase</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Q = mcΔT + mL</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-surface-lowest rounded-lg border border-surface-border">
                  <div className="text-[10px] font-mono text-slate-400">Temperature</div>
                  <div className="text-sm font-mono font-bold text-white">
                    {thermoState.temperatureC.toFixed(1)}°C
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {thermoState.temperatureK.toFixed(1)} K
                  </div>
                </div>

                <div className="p-2 bg-surface-lowest rounded-lg border border-surface-border">
                  <div className="text-[10px] font-mono text-slate-400">Accumulated Q</div>
                  <div className="text-sm font-mono font-bold text-amber-400">
                    {(thermoState.accumulatedEnergyJ / 1000).toFixed(1)} kJ
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Mass: {(sampleMassKg * 1000).toFixed(0)} g
                  </div>
                </div>
              </div>

              {/* Phase Fractions Breakdown */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-mono text-slate-300 font-bold flex justify-between">
                  <span>Phase Distribution:</span>
                  <span className="text-emerald-400 uppercase">{thermoState.phase}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-center font-mono text-[10px]">
                  <div className="p-1 rounded bg-sky-950/40 border border-sky-800/40 text-sky-300">
                    Solid: {(thermoState.phaseFractions.solid * 100).toFixed(0)}%
                  </div>
                  <div className="p-1 rounded bg-blue-950/40 border border-blue-800/40 text-blue-300">
                    Liquid: {(thermoState.phaseFractions.liquid * 100).toFixed(0)}%
                  </div>
                  <div className="p-1 rounded bg-amber-950/40 border border-amber-800/40 text-amber-300">
                    Gas: {(thermoState.phaseFractions.gas * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Pressure Analysis Card (Crucial for Class 9 Physics/Chemistry) */}
            <div className="p-3 bg-surface-card rounded-xl border border-surface-border space-y-2.5">
              <div className="text-xs font-mono font-bold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-cyan-400">compress</span>
                  <span>Pressure Analysis</span>
                </span>
                <span className="text-[10px] font-mono text-cyan-400">P = F / A</span>
              </div>

              {/* Two distinct pressure measurements */}
              <div className="space-y-2">
                {/* 1. Calculated Ideal Gas Law */}
                <div className="p-2.5 bg-surface-lowest rounded-lg border border-surface-border">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-xs font-bold text-slate-200">Calculated: Ideal Gas Law</span>
                    <span className="text-[10px] font-mono text-slate-400">P = N·kB·T / V</span>
                  </div>
                  <div className="text-base font-mono font-bold text-emerald-400">
                    {pressureData.calculatedIdealGasKPa !== null
                      ? `${pressureData.calculatedIdealGasKPa} kPa`
                      : 'N/A (Condensed Phase)'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {pressureData.isGasApplicable
                      ? 'Valid for Gas phase. Obeys Boyle’s Law (P ∝ 1/V) and Gay-Lussac’s Law (P ∝ T).'
                      : 'Not applicable: Solids and liquids have definite volume and are nearly incompressible.'}
                  </div>
                </div>

                {/* 2. Measured Wall Pressure */}
                <div className="p-2.5 bg-surface-lowest rounded-lg border border-surface-border">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-xs font-bold text-slate-200">Measured: Wall Collisions</span>
                    <span className="text-[10px] font-mono text-slate-400">Σ(2·m·v) / (L·dt)</span>
                  </div>
                  <div className="text-base font-mono font-bold text-cyan-400">
                    {pressureData.measuredWallPressureKPa} kPa
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Calculated from actual particle momentum impulses delivered to chamber walls.
                  </div>
                </div>
              </div>

              {/* Chamber Volume */}
              <div className="flex justify-between items-center p-2 bg-surface-lowest rounded-lg border border-surface-border text-xs font-mono">
                <span className="text-slate-400">Chamber Volume:</span>
                <span className="text-white font-bold">{volumeLiters} Liters</span>
              </div>
            </div>

            {/* Thermodynamic Constants Card */}
            <div className="p-3 bg-surface-card rounded-xl border border-surface-border space-y-1.5 text-[11px] font-mono">
              <div className="text-xs font-bold text-slate-300 font-sans mb-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-slate-400">tune</span>
                <span>Reference Constants ({currentSubstance.chemicalFormula})</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Melting Point (Tm):</span>
                <span className="text-slate-200">
                  {currentSubstance.meltingPointC}°C ({(currentSubstance.meltingPointK).toFixed(1)} K)
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Boiling Point (Tb):</span>
                <span className="text-slate-200">
                  {currentSubstance.boilingPointC}°C ({(currentSubstance.boilingPointK).toFixed(1)} K)
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Latent Heat Fusion (Lf):</span>
                <span className="text-slate-200">{(currentSubstance.latentHeatFusion / 1000).toFixed(0)} kJ/kg</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Latent Heat Vaporization (Lv):</span>
                <span className="text-slate-200">{(currentSubstance.latentHeatVaporization / 1000).toFixed(0)} kJ/kg</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DYNAMIC SVG HEATING CURVE GRAPH */}
        {activeTab === 'heatingCurve' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                Heating Curve (T vs Q)
              </span>
              <span className="text-[10px] font-mono text-emerald-400">Live Operating Cursor</span>
            </div>

            {/* Dynamic SVG Plot */}
            <div className="bg-surface-lowest p-2 rounded-xl border border-surface-border shadow-inner">
              <svg viewBox="0 0 320 220" className="w-full h-auto select-none overflow-visible">
                {/* SVG Coordinate Definitions:
                    Width: 320, Height: 220
                    Margin: Left 40, Right 20, Top 20, Bottom 30
                    Plot Area: X: 40 to 300 (W=260), Y: 20 to 190 (H=170)
                    X maps from 0 to curvePoints.qMax
                    Y maps from curvePoints.tempBaselineC to curvePoints.tempMaxC
                */}
                {(() => {
                  const leftX = 42;
                  const rightX = 305;
                  const topY = 20;
                  const bottomY = 185;
                  const plotW = rightX - leftX;
                  const plotH = bottomY - topY;

                  const minT = curvePoints.tempBaselineC; // e.g. -20
                  const maxT = curvePoints.tempMaxC; // e.g. 140
                  const maxQ = curvePoints.qMax;

                  const mapX = (q: number) => leftX + (Math.max(0, Math.min(q, maxQ)) / maxQ) * plotW;
                  const mapY = (tempC: number) => bottomY - ((tempC - minT) / (maxT - minT)) * plotH;

                  // Key coordinates along the piecewise heating curve
                  const p0 = { x: mapX(0), y: mapY(curvePoints.tempBaselineC) };
                  const p1 = { x: mapX(curvePoints.qToMelting), y: mapY(curvePoints.tempMeltingC) };
                  const p2 = { x: mapX(curvePoints.qMeltComplete), y: mapY(curvePoints.tempMeltingC) };
                  const p3 = { x: mapX(curvePoints.qToBoiling), y: mapY(curvePoints.tempBoilingC) };
                  const p4 = { x: mapX(curvePoints.qBoilComplete), y: mapY(curvePoints.tempBoilingC) };
                  const p5 = { x: mapX(curvePoints.qMax), y: mapY(curvePoints.tempMaxC) };

                  // Current operating cursor
                  const cursorX = mapX(thermoState.accumulatedEnergyJ);
                  const cursorY = mapY(thermoState.temperatureC);

                  return (
                    <>
                      {/* Grid Lines */}
                      {/* 0°C line */}
                      <line
                        x1={leftX}
                        y1={mapY(curvePoints.tempMeltingC)}
                        x2={rightX}
                        y2={mapY(curvePoints.tempMeltingC)}
                        stroke="#334155"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                      {/* 100°C line */}
                      <line
                        x1={leftX}
                        y1={mapY(curvePoints.tempBoilingC)}
                        x2={rightX}
                        y2={mapY(curvePoints.tempBoilingC)}
                        stroke="#334155"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />

                      {/* Axes */}
                      <line x1={leftX} y1={bottomY} x2={rightX} y2={bottomY} stroke="#64748b" strokeWidth="1.5" />
                      <line x1={leftX} y1={topY} x2={leftX} y2={bottomY} stroke="#64748b" strokeWidth="1.5" />

                      {/* Axis Labels */}
                      <text x={rightX - 5} y={bottomY + 18} fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="end">
                        Energy Q (kJ) →
                      </text>
                      <text x={leftX - 4} y={topY + 6} fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="end">
                        T (°C)
                      </text>

                      {/* Temperature Ticks */}
                      <text x={leftX - 6} y={mapY(curvePoints.tempBaselineC) + 3} fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="end">
                        {curvePoints.tempBaselineC}°
                      </text>
                      <text x={leftX - 6} y={mapY(curvePoints.tempMeltingC) + 3} fill="#38bdf8" fontSize="8" fontFamily="monospace" textAnchor="end">
                        {curvePoints.tempMeltingC}°
                      </text>
                      <text x={leftX - 6} y={mapY(curvePoints.tempBoilingC) + 3} fill="#f59e0b" fontSize="8" fontFamily="monospace" textAnchor="end">
                        {curvePoints.tempBoilingC}°
                      </text>

                      {/* Theoretical Heating Curve Line */}
                      {/* Zone 1: Solid sensible heating */}
                      <line x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke="#38bdf8" strokeWidth="2.5" />
                      {/* Zone 2: Melting Plateau (Latent Heat of Fusion) */}
                      <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#a855f7" strokeWidth="3" />
                      {/* Zone 3: Liquid sensible heating */}
                      <line x1={p2.x} y1={p2.y} x2={p3.x} y2={p3.y} stroke="#0284c7" strokeWidth="2.5" />
                      {/* Zone 4: Boiling Plateau (Latent Heat of Vaporization) */}
                      <line x1={p3.x} y1={p3.y} x2={p4.x} y2={p4.y} stroke="#f59e0b" strokeWidth="3" />
                      {/* Zone 5: Gas sensible heating */}
                      <line x1={p4.x} y1={p4.y} x2={p5.x} y2={p5.y} stroke="#ef4444" strokeWidth="2.5" />

                      {/* Plateau annotations */}
                      <text x={(p1.x + p2.x) / 2} y={p1.y - 6} fill="#c084fc" fontSize="8" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
                        Melting Plateau (Lf)
                      </text>
                      <text x={(p3.x + p4.x) / 2} y={p3.y - 6} fill="#fbbf24" fontSize="8" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
                        Boiling Plateau (Lv)
                      </text>

                      {/* Current Live Operating Cursor */}
                      <circle cx={cursorX} cy={cursorY} r="7" fill="rgba(16, 185, 129, 0.3)" />
                      <circle cx={cursorX} cy={cursorY} r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                    </>
                  );
                })()}
              </svg>
            </div>

            {/* Explanation of the curve zones */}
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-surface-card border border-surface-border">
                <div className="font-bold text-slate-200 mb-0.5 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                  <span>Why is the melting curve flat at 0°C?</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  During melting, added energy is used as <strong>Latent Heat of Fusion</strong> to break open the crystalline lattice structure. Average kinetic energy does NOT change, so temperature remains constant.
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-surface-card border border-surface-border">
                <div className="font-bold text-slate-200 mb-0.5 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span>Why is the boiling plateau much longer?</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Water requires <strong>2260 kJ/kg</strong> of latent heat to vaporize, compared to only <strong>334 kJ/kg</strong> to melt. It takes nearly 7× more energy to pull liquid molecules completely apart into gas!
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GUIDED EXPERIMENT */}
        {activeTab === 'guided' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">school</span>
                <span>Heating Water: Ice to Steam</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Step {guidedStepIndex + 1} of {HEATING_WATER_EXPERIMENT_STEPS.length}
              </span>
            </div>

            {/* Step Stepper Header */}
            <div className="flex gap-1">
              {HEATING_WATER_EXPERIMENT_STEPS.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => setGuidedStep(idx)}
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    idx === guidedStepIndex
                      ? 'bg-amber-400 shadow-sm shadow-amber-500/50'
                      : idx < guidedStepIndex
                      ? 'bg-emerald-500'
                      : 'bg-slate-700'
                  }`}
                  title={step.title}
                />
              ))}
            </div>

            {/* Step Card */}
            <div className="p-3.5 bg-surface-card rounded-xl border border-surface-border space-y-3">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs flex items-center justify-center font-mono">
                  {guidedStepIndex + 1}
                </span>
                <span>{currentGuidedStep.title}</span>
              </div>

              {/* Instructions */}
              <div className="text-xs text-slate-300 leading-relaxed bg-surface-lowest p-2.5 rounded-lg border border-surface-border">
                <strong className="text-emerald-400 block mb-1">Instruction:</strong>
                {currentGuidedStep.instruction}
              </div>

              {/* Observation */}
              <div className="text-xs text-slate-300 leading-relaxed bg-surface-lowest p-2.5 rounded-lg border border-surface-border">
                <strong className="text-cyan-400 block mb-1">Scientific Observation:</strong>
                {currentGuidedStep.scientificObservation}
              </div>

              {/* Scientific Explanation */}
              <div className="text-xs text-slate-300 leading-relaxed bg-surface-lowest p-2.5 rounded-lg border border-surface-border">
                <strong className="text-amber-400 block mb-1">Thermodynamic Law:</strong>
                {currentGuidedStep.explanation}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setTemperature(currentGuidedStep.targetTemperatureC);
                    if (currentGuidedStep.targetPhase === 'solid-liquid' || currentGuidedStep.targetPhase === 'liquid-gas') {
                      setHeating('heat');
                    }
                  }}
                  className="flex-1 py-2 px-3 rounded-lg bg-amber-500/15 border border-amber-500/40 hover:bg-amber-500/25 text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">play_circle</span>
                  <span>Apply Step Target</span>
                </button>

                {guidedStepIndex < HEATING_WATER_EXPERIMENT_STEPS.length - 1 && (
                  <button
                    onClick={() => setGuidedStep(guidedStepIndex + 1)}
                    className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <span>Next</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SCIENTIFIC PRINCIPLES & THEORY */}
        {activeTab === 'theory' && (
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold text-cyan-400 uppercase flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">menu_book</span>
              <span>Class 9 Science Principles</span>
            </div>

            {/* Principle 1: Kinetic Molecular Theory */}
            <div className="p-3 bg-surface-card rounded-xl border border-surface-border space-y-1">
              <div className="text-xs font-bold text-slate-200">1. Kinetic Molecular Theory</div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                Matter is composed of tiny particles that are in continuous motion. The average kinetic energy of the particles is directly proportional to absolute temperature (Kelvin).
              </div>
            </div>

            {/* Principle 2: States of Matter Characteristics */}
            <div className="p-3 bg-surface-card rounded-xl border border-surface-border space-y-1">
              <div className="text-xs font-bold text-slate-200">2. Three States Comparison</div>
              <div className="text-[11px] text-slate-400 space-y-1 leading-relaxed">
                <p>• <strong>Solid:</strong> Fixed shape & volume. Strong interparticle forces, particles vibrate about fixed positions.</p>
                <p>• <strong>Liquid:</strong> Fixed volume, no fixed shape. Moderate forces, particles slip and slide past one another.</p>
                <p>• <strong>Gas:</strong> No fixed shape or volume. Negligible forces, high speed random collisions throughout the container.</p>
              </div>
            </div>

            {/* Principle 3: Compressibility */}
            <div className="p-3 bg-surface-card rounded-xl border border-surface-border space-y-1">
              <div className="text-xs font-bold text-slate-200">3. Compressibility & Intermolecular Space</div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                Gases have very large intermolecular spaces and are highly compressible (e.g. CNG cylinders, pistons). Liquids and solids have minimal empty space and resist compression.
              </div>
            </div>

            {/* Principle 4: Sensible vs Latent Heat */}
            <div className="p-3 bg-surface-card rounded-xl border border-surface-border space-y-1">
              <div className="text-xs font-bold text-slate-200">4. Sensible vs Latent Heat</div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                <strong>Sensible Heat (Q = mcΔT):</strong> Increases particle vibration and raises temperature.<br />
                <strong>Latent Heat (Q = mL):</strong> Absorbed at constant temperature during melting (Lf) or boiling (Lv) to overcome intermolecular bonds.
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
