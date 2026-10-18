/**
 * Propositions Interactive Workbench Page (Milestone M4)
 * Class 9 NCERT Ganita Manjari: Propositions and Their Converses
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePropositionsStore } from '../../../store/usePropositionsStore';
import { PROP_GUIDED_LESSONS } from '../../../engine/mathematics/propositions/curriculumPath';
import { PropositionsToolbar } from './PropositionsToolbar';
import { PropositionsGuidedToolbar } from './PropositionsGuidedToolbar';
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

export const PropositionsWorkbenchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isPanelOpen, setIsPanelOpen] = useState(true);

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

  return (
    <div className="flex flex-col h-screen w-screen bg-surface-lowest text-slate-100 overflow-hidden font-sans">
      {/* 1. Header Toolbar */}
      {isGuidedMode ? (
        <PropositionsGuidedToolbar
          isPanelOpen={isPanelOpen}
          onTogglePanel={() => setIsPanelOpen(!isPanelOpen)}
        />
      ) : (
        <PropositionsToolbar />
      )}

      {/* 2. Main Workbench Area & Responsive Side Panel */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-background">
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

        {/* Guided Learning Side Panel */}
        {isGuidedMode && isPanelOpen && (
          <GuidedLessonPanel onClose={() => setIsPanelOpen(false)} />
        )}
      </div>
    </div>
  );
};
