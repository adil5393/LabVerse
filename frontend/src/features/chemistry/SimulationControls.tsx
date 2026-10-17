/**
 * Left Panel Simulation Controls for States of Matter Workbench
 *
 * Implements substance selection, temperature control, heating/cooling inputs,
 * container volume (piston) controls, particle model resolution, and visual toggles.
 */

import React from 'react';
import { useChemistryStore } from '../../store/useChemistryStore';
import { SUBSTANCES } from '../../engine/chemistry/substances';
import type { ParticleCountOption, SubstanceId } from '../../engine/chemistry/types';
import { CHAMBER_HEIGHT_MAX, CHAMBER_HEIGHT_MIN } from '../../engine/chemistry/constants';

export const SimulationControls: React.FC = () => {
  const {
    substanceId,
    setSubstance,
    thermoState,
    setTemperature,
    setHeating,
    config,
    setPistonHeight,
    setParticleCount,
    toggleVisual,
  } = useChemistryStore();

  const particleCountOptions: ParticleCountOption[] = [50, 100, 200, 400];

  return (
    <aside className="w-72 lg:w-80 bg-surface-low border-r border-surface-border flex flex-col h-full overflow-y-auto select-none p-4 gap-5 shrink-0 custom-scrollbar">
      {/* 1. Substance Selection Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-emerald-400">science</span>
            <span>Substance Model</span>
          </label>
          <span className="text-[10px] font-mono text-slate-400">1 atm Model</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {(['water', 'generic'] as SubstanceId[]).map((id) => {
            const sub = SUBSTANCES[id];
            const isSelected = substanceId === id;
            return (
              <button
                key={id}
                onClick={() => setSubstance(id)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500/60 shadow-md shadow-emerald-950/20 text-white'
                    : 'bg-surface-card hover:bg-surface-elevated border-surface-border text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs">{sub.name}</span>
                  <span className="text-[10px] font-mono font-semibold px-1 py-0.2 rounded bg-surface-lowest text-emerald-400">
                    {sub.chemicalFormula}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {sub.isEducationalGeneric ? 'Idealized generic' : 'H₂O reference'}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Temperature & Thermal Control */}
      <div className="space-y-3 p-3 rounded-2xl bg-surface-card border border-surface-border">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-amber-400">thermostat</span>
            <span>Temperature</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono font-bold text-amber-300">
              {thermoState.temperatureC.toFixed(1)}°C
            </span>
            <span className="text-xs font-mono text-slate-400">
              ({thermoState.temperatureK.toFixed(1)} K)
            </span>
          </div>
        </div>

        {/* Temperature Slider */}
        <div className="space-y-1">
          <input
            type="range"
            min="-50"
            max="140"
            step="0.5"
            value={thermoState.temperatureC}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full h-2 bg-surface-lowest rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500 px-0.5">
            <span>-50°C (Ice)</span>
            <span>0°C (Melt)</span>
            <span>100°C (Boil)</span>
            <span>140°C (Steam)</span>
          </div>
        </div>

        {/* Heating / Cooling Active Inputs */}
        <div className="pt-2 border-t border-surface-border/60 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Thermal Power Input:</span>
            <span className="text-slate-200 font-bold">{thermoState.heatPowerWatts} W</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => setHeating(thermoState.heatingState === 'cooling' ? 'off' : 'cooling')}
              className={`py-1.5 px-2 rounded-xl border text-xs font-mono font-semibold flex items-center justify-center gap-1 transition-all ${
                thermoState.heatingState === 'cooling'
                  ? 'bg-sky-600 text-white border-sky-400 shadow-md animate-pulse'
                  : 'bg-surface-lowest hover:bg-surface-elevated border-surface-border text-sky-400'
              }`}
              title="Remove thermal energy continuously"
            >
              <span className="material-symbols-outlined text-[15px]">ac_unit</span>
              <span>Cool</span>
            </button>

            <button
              onClick={() => setHeating('off')}
              className={`py-1.5 px-2 rounded-xl border text-xs font-mono font-semibold flex items-center justify-center gap-1 transition-all ${
                thermoState.heatingState === 'off'
                  ? 'bg-surface-elevated text-white border-surface-border/80'
                  : 'bg-surface-lowest hover:bg-surface-elevated border-surface-border text-slate-400'
              }`}
              title="Maintain current energy (adiabatic)"
            >
              <span className="material-symbols-outlined text-[15px]">pause_circle</span>
              <span>Off</span>
            </button>

            <button
              onClick={() => setHeating(thermoState.heatingState === 'heating' ? 'off' : 'heating')}
              className={`py-1.5 px-2 rounded-xl border text-xs font-mono font-semibold flex items-center justify-center gap-1 transition-all ${
                thermoState.heatingState === 'heating'
                  ? 'bg-amber-600 text-white border-amber-400 shadow-md animate-pulse'
                  : 'bg-surface-lowest hover:bg-surface-elevated border-surface-border text-amber-400'
              }`}
              title="Add thermal energy continuously"
            >
              <span className="material-symbols-outlined text-[15px]">local_fire_department</span>
              <span>Heat</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Container Volume (Piston Height) Control */}
      <div className="space-y-2 p-3 rounded-2xl bg-surface-card border border-surface-border">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-purple-400">expand</span>
            <span>Container Volume (Piston)</span>
          </label>
          <span className="text-xs font-mono font-bold text-purple-300">
            {Math.round((config.pistonHeight / CHAMBER_HEIGHT_MAX) * 100)}%
          </span>
        </div>

        <input
          type="range"
          min={CHAMBER_HEIGHT_MIN}
          max={CHAMBER_HEIGHT_MAX}
          step="5"
          value={config.pistonHeight}
          onChange={(e) => setPistonHeight(parseFloat(e.target.value))}
          className="w-full h-2 bg-surface-lowest rounded-lg appearance-none cursor-pointer accent-purple-400"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-500">
          <span>Compressed (Min V)</span>
          <span>Expanded (Max V)</span>
        </div>
      </div>

      {/* 4. Particle Model Resolution */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-sky-400">grain</span>
            <span>Model Resolution</span>
          </label>
          <span className="text-[10px] font-mono text-slate-400">Particle count</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 bg-surface-lowest p-1 rounded-xl border border-surface-border">
          {particleCountOptions.map((count) => (
            <button
              key={count}
              onClick={() => setParticleCount(count)}
              className={`py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                config.particleCount === count
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Visual Display Settings */}
      <div className="space-y-2 pt-2 border-t border-surface-border/60">
        <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">visibility</span>
          <span>Visual Diagnostics</span>
        </label>

        <div className="space-y-1.5">
          <label className="flex items-center justify-between p-2 rounded-xl bg-surface-lowest/70 border border-surface-border/60 text-xs font-mono text-slate-300 cursor-pointer hover:bg-surface-lowest transition-colors">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-slate-400">timeline</span>
              <span>Particle Trails</span>
            </span>
            <input
              type="checkbox"
              checked={config.showTrails}
              onChange={() => toggleVisual('showTrails')}
              className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl bg-surface-lowest/70 border border-surface-border/60 text-xs font-mono text-slate-300 cursor-pointer hover:bg-surface-lowest transition-colors">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-slate-400">navigation</span>
              <span>Velocity Vectors</span>
            </span>
            <input
              type="checkbox"
              checked={config.showVectors}
              onChange={() => toggleVisual('showVectors')}
              className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl bg-surface-lowest/70 border border-surface-border/60 text-xs font-mono text-slate-300 cursor-pointer hover:bg-surface-lowest transition-colors">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-slate-400">share</span>
              <span>Interparticle Bonds</span>
            </span>
            <input
              type="checkbox"
              checked={config.showInteractions}
              onChange={() => toggleVisual('showInteractions')}
              className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
            />
          </label>
        </div>
      </div>
    </aside>
  );
};
