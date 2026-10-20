/**
 * Propositions Interactive Workbench Page (Milestone M4)
 * Class 9 NCERT Ganita Manjari: Propositions and Their Converses
 */

import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePropositionsStore } from '../../../store/usePropositionsStore';
import { PROP_GUIDED_LESSONS } from '../../../engine/mathematics/propositions/curriculumPath';
import { GuidedLessonPanel } from './GuidedLessonPanel';
import { StatementExplorer } from './StatementExplorer';
import { CounterexampleWorkbench } from './CounterexampleWorkbench';
import { NumberExperiment } from './NumberExperiment';
import { GeometryReasoningCanvas } from './GeometryReasoningCanvas';
import { ProofWorkbench } from './ProofWorkbench';
import { PracticePanel } from './PracticePanel';
import type {
  PropositionsWorkbenchTab,
  PropositionsMode,
} from '../../../engine/mathematics/propositions/types';
import { WorkspaceShell } from '../../workspace';

const PROP_TABS: { id: PropositionsWorkbenchTab; label: string; icon: string }[] = [
  { id: 'statement_explorer', label: 'Statements & Converses', icon: 'sync_alt' },
  { id: 'counterexample_lab', label: 'Counterexample Lab', icon: 'close' },
  { id: 'number_experiment', label: 'Number Logic', icon: 'tag' },
  { id: 'geometry_reasoning', label: 'Geometry Reasoning', icon: 'square_foot' },
  { id: 'proof_workbench', label: 'Proof Workbench', icon: 'menu_book' },
];

export const PropositionsWorkbenchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const {
    activeTab,
    setActiveTab,
    mode,
    setMode,
    setExperiment,
    selectLesson,
  } = usePropositionsStore();

  const lessonParam = searchParams.get('lesson');
  const expParam = searchParams.get('exp');
  const tabParam = searchParams.get('tab') as PropositionsWorkbenchTab | null;
  const modeParam = searchParams.get('mode') as PropositionsMode | null;

  const isGuidedMode = Boolean(lessonParam);
  const activeGuidedLesson = lessonParam ? PROP_GUIDED_LESSONS[lessonParam] : undefined;

  useEffect(() => {
    if (isGuidedMode && activeGuidedLesson) {
      setExperiment(activeGuidedLesson.experimentId);
      selectLesson(activeGuidedLesson.id);
      if (modeParam) setMode(modeParam);
    } else if (expParam) {
      setExperiment(expParam);
      if (tabParam) setActiveTab(tabParam);
      if (modeParam) setMode(modeParam);
    } else if (tabParam) {
      setActiveTab(tabParam);
      if (modeParam) setMode(modeParam);
    } else if (modeParam) {
      setMode(modeParam);
    }
  }, [
    lessonParam,
    expParam,
    tabParam,
    modeParam,
    isGuidedMode,
    activeGuidedLesson,
    setExperiment,
    selectLesson,
    setActiveTab,
    setMode,
  ]);

  // Outliner: Reasoning Engines
  const outlinerContent = (
    <div className="p-3 space-y-4 text-xs font-sans">
      <div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Reasoning Modes</span>
        <div className="grid grid-cols-1 gap-1.5 mt-2">
          {PROP_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={activeTab === t.id && mode === 'explore'}
              onClick={() => {
                setMode('explore');
                setActiveTab(t.id);
              }}
              className={`min-h-[38px] text-left px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                activeTab === t.id && mode === 'explore'
                  ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm'
                  : 'bg-surface-card border-surface-border text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
                <span>{t.label}</span>
              </div>
            </button>
          ))}
          <button
            type="button"
            aria-pressed={mode === 'practice'}
            onClick={() => setMode('practice')}
            className={`min-h-[38px] text-left px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
              mode === 'practice'
                ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm'
                : 'bg-surface-card border-surface-border text-slate-300 hover:border-slate-500'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">quiz</span>
              <span>Chapter Practice</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  // Inspector: Logical Framework or Guided Lesson
  const inspectorContent = (
    <div className="h-full flex flex-col overflow-hidden">
      {isGuidedMode ? (
        <GuidedLessonPanel onClose={() => {}} />
      ) : (
        <div className="p-3 space-y-4 text-xs font-sans">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Logical Principles</span>
            <div className="mt-2 space-y-2 font-mono text-slate-300">
              <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]">
                <p className="font-bold text-white mb-1">Direct Proposition</p>
                <p>If P (hypothesis), then Q (conclusion)</p>
              </div>
              <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]">
                <p className="font-bold text-white mb-1">Converse Proposition</p>
                <p>If Q, then P &mdash; not automatically true!</p>
              </div>
              <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]">
                <p className="font-bold text-white mb-1">Power of Counterexample</p>
                <p className="text-[10px] leading-relaxed">
                  A single counterexample disproves a universal claim; examples alone cannot prove it.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Viewport: Main reasoning canvas
  const viewportContent = (
    <main className="flex-1 min-h-0 flex flex-col overflow-y-auto lg:overflow-hidden bg-background">
      {mode === 'practice' ? (
        <PracticePanel />
      ) : (
        <>
          {activeTab === 'statement_explorer' && <StatementExplorer />}
          {activeTab === 'counterexample_lab' && <CounterexampleWorkbench />}
          {activeTab === 'number_experiment' && <NumberExperiment />}
          {activeTab === 'geometry_reasoning' && <GeometryReasoningCanvas />}
          {activeTab === 'proof_workbench' && <ProofWorkbench />}
        </>
      )}
    </main>
  );

  // Analysis Dock
  const analysisDockContent = (
    <div className="p-3 text-xs space-y-2 font-mono">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2 rounded bg-surface-card border border-surface-border">
          <span className="text-outline text-[10px] block">REASONING ENGINE</span>
          <span className="text-primary font-bold text-sm uppercase">{mode === 'practice' ? 'Practice' : activeTab.replace('_', ' ')}</span>
        </div>
        <div className="p-2 rounded bg-surface-card border border-surface-border">
          <span className="text-outline text-[10px] block">MODE</span>
          <span className="text-white font-bold text-sm uppercase">{mode}</span>
        </div>
        <div className="p-2 rounded bg-surface-card border border-surface-border">
          <span className="text-outline text-[10px] block">LOGIC RULE</span>
          <span className="text-white font-bold text-sm">P &rArr; Q vs Q &rArr; P</span>
        </div>
        <div className="p-2 rounded bg-surface-card border border-surface-border">
          <span className="text-outline text-[10px] block">PROOF RIGOR</span>
          <span className="text-emerald-400 font-bold text-sm">Deductive Step-by-Step</span>
        </div>
      </div>
    </div>
  );

  return (
    <WorkspaceShell
      chapterId="propositions"
      labTitle="Propositions & Converses"
      outlinerTitle="Reasoning Engines"
      outliner={outlinerContent}
      viewport={viewportContent}
      inspectorTitle="Logical Framework"
      inspector={inspectorContent}
      analysisDockTitle="Proposition Diagnostics & Truth Analysis"
      analysisDock={analysisDockContent}
    />
  );
};
