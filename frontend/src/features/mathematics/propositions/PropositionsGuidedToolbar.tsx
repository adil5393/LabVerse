/**
 * Guided Learning Header Toolbar for Class 9 Propositions (Milestone M4)
 * Class 9 NCERT Ganita Manjari
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { usePropositionsStore } from '../../../store/usePropositionsStore';
import { PROP_GUIDED_LESSONS } from '../../../engine/mathematics/propositions/curriculumPath';
import type { PropositionsWorkbenchTab } from '../../../engine/mathematics/propositions/types';

interface PropositionsGuidedToolbarProps {
  isPanelOpen: boolean;
  onTogglePanel: () => void;
}

export const PropositionsGuidedToolbar: React.FC<PropositionsGuidedToolbarProps> = ({
  isPanelOpen,
  onTogglePanel,
}) => {
  const {
    activeLessonId,
    activeStage,
    activeTab,
    setActiveTab,
    mode,
  } = usePropositionsStore();

  const lesson = PROP_GUIDED_LESSONS[activeLessonId] || PROP_GUIDED_LESSONS['prop-l1'];

  const tabs: { id: PropositionsWorkbenchTab; label: string; icon: string }[] = [
    { id: 'statement_explorer', label: 'Propositions', icon: 'alt_route' },
    { id: 'counterexample_lab', label: 'Counterexamples', icon: 'search_check' },
    { id: 'number_experiment', label: 'Numbers', icon: 'calculate' },
    { id: 'geometry_reasoning', label: 'Geometry', icon: 'shapes' },
    { id: 'proof_workbench', label: 'Proof Builder', icon: 'account_tree' },
  ];

  return (
    <header className="h-14 bg-surface-low border-b border-surface-border px-4 flex items-center justify-between select-none shrink-0 z-20 font-sans">
      {/* Left: Back Link & Lesson Badge */}
      <div className="flex items-center gap-3">
        <Link
          to="/mathematics/propositions"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-card hover:bg-surface-elevated border border-surface-border text-slate-300 hover:text-white text-xs font-semibold transition-all group"
          title="Return to Propositions Roadmap"
        >
          <span className="material-symbols-outlined text-[17px] group-hover:-translate-x-0.5 transition-transform">
            arrow_back
          </span>
          <span className="hidden sm:inline">Roadmap</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
            Lesson {lesson.lessonNumber}
          </span>
          <span className="text-sm font-bold text-white truncate max-w-[180px] sm:max-w-xs md:max-w-md">
            {lesson.title}
          </span>
        </div>
      </div>

      {/* Middle: Workbench Tabs for Experiment Stage */}
      {mode === 'explore' && (
        <div className="hidden lg:flex items-center gap-1 bg-surface-lowest p-1 rounded-xl border border-surface-border text-xs font-mono">
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

      {/* Right: Stage Badge & Toggle Side Panel Button */}
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline-block text-xs font-mono text-slate-400 uppercase tracking-wider">
          Stage: <span className="text-amber-400 font-bold">{activeStage}</span>
        </span>

        <button
          onClick={onTogglePanel}
          className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
            isPanelOpen
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-surface-card text-slate-300 border-surface-border hover:bg-surface-elevated hover:text-white'
          }`}
          title={isPanelOpen ? 'Hide Lesson Panel' : 'Show Lesson Panel'}
        >
          <span className="material-symbols-outlined text-[16px]">
            {isPanelOpen ? 'visibility_off' : 'menu_book'}
          </span>
          <span className="hidden md:inline">
            {isPanelOpen ? 'Hide Guide' : 'Lesson Guide'}
          </span>
        </button>
      </div>
    </header>
  );
};
