/**
 * Free Laboratory Top Toolbar for Class 9 Propositions (Milestone M4)
 * Class 9 NCERT Ganita Manjari
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { usePropositionsStore } from '../../../store/usePropositionsStore';
import { PROPOSITION_EXPERIMENTS } from '../../../engine/mathematics/propositions/experimentRegistry';
import type { PropositionsWorkbenchTab } from '../../../engine/mathematics/propositions/types';

export const PropositionsToolbar: React.FC = () => {
  const {
    currentExperimentId,
    setExperiment,
    activeTab,
    setActiveTab,
    mode,
    setMode,
  } = usePropositionsStore();

  const handleToggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
    } catch {
      // Graceful fallback
    }
  };

  const tabs: { id: PropositionsWorkbenchTab; label: string; icon: string }[] = [
    { id: 'statement_explorer', label: 'Propositions', icon: 'alt_route' },
    { id: 'counterexample_lab', label: 'Counterexamples', icon: 'search_check' },
    { id: 'number_experiment', label: 'Numbers', icon: 'calculate' },
    { id: 'geometry_reasoning', label: 'Geometry', icon: 'shapes' },
    { id: 'proof_workbench', label: 'Proof Builder', icon: 'account_tree' },
  ];

  return (
    <header className="h-14 bg-surface-low border-b border-surface-border px-4 flex items-center justify-between select-none shrink-0 z-20 font-sans">
      {/* Left: Back Link & Experiment Switcher */}
      <div className="flex items-center gap-3">
        <Link
          to="/mathematics/propositions"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-card hover:bg-surface-elevated border border-surface-border text-slate-300 hover:text-white text-xs font-semibold transition-all group"
          title="Return to Propositions Roadmap"
        >
          <span className="material-symbols-outlined text-[17px] group-hover:-translate-x-0.5 transition-transform">
            arrow_back
          </span>
          <span className="hidden sm:inline">Propositions</span>
        </Link>

        {/* Experiment Selector */}
        <select
          value={currentExperimentId}
          onChange={(e) => setExperiment(e.target.value)}
          className="bg-surface-card border border-surface-border text-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 outline-none hover:bg-surface-elevated cursor-pointer max-w-[220px] sm:max-w-xs truncate"
        >
          {PROPOSITION_EXPERIMENTS.map((exp) => (
            <option key={exp.id} value={exp.id}>
              {exp.title}
            </option>
          ))}
        </select>
      </div>

      {/* Middle: Workbench Tabs (Explore Mode Only) */}
      {mode === 'explore' && (
        <div className="hidden md:flex items-center gap-1 bg-surface-lowest p-1 rounded-xl border border-surface-border text-xs font-mono">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Right: Mode Switcher & Fullscreen */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-surface-card p-1 rounded-lg border border-surface-border text-xs font-mono font-semibold">
          <button
            onClick={() => setMode('explore')}
            className={`px-2.5 py-1 rounded transition-colors ${
              mode === 'explore'
                ? 'bg-purple-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Explore
          </button>
          <button
            onClick={() => setMode('practice')}
            className={`px-2.5 py-1 rounded transition-colors ${
              mode === 'practice'
                ? 'bg-purple-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Practice
          </button>
        </div>

        <button
          onClick={handleToggleFullscreen}
          className="p-1.5 rounded-lg bg-surface-card hover:bg-surface-elevated border border-surface-border text-slate-400 hover:text-white transition-colors"
          title="Toggle Fullscreen"
        >
          <span className="material-symbols-outlined text-[18px]">fullscreen</span>
        </button>
      </div>
    </header>
  );
};
