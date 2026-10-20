/**
 * Two Variables, One Line workbench page (M5): free laboratory, guided
 * lesson, and chapter practice share this route and differ by URL params.
 *   ?lesson=tv-l3          guided lesson
 *   ?exp=tv-two-lines      free laboratory preset
 *   ?tab=graph|system|algebra
 *   ?mode=practice         chapter practice
 */

import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTwoVariablesStore } from '../../../store/useTwoVariablesStore';
import { TV_GUIDED_LESSONS } from '../../../engine/mathematics/twoVariables/curriculumPath';
import { TV_EXPERIMENTS } from '../../../engine/mathematics/twoVariables/experimentRegistry';
import type { TVMode, TVWorkbenchTab } from '../../../engine/mathematics/twoVariables/types';
import { GraphWorkbench } from './GraphWorkbench';
import { SystemExplorer } from './SystemExplorer';
import { AlgebraLab } from './AlgebraLab';
import { PracticePanel } from './PracticePanel';
import { GuidedPanel } from './GuidedPanel';

const TABS: { id: TVWorkbenchTab; label: string; icon: string }[] = [
  { id: 'graph', label: 'Equation Graph', icon: 'show_chart' },
  { id: 'system', label: 'Two Lines', icon: 'compare_arrows' },
  { id: 'algebra', label: 'Algebra', icon: 'functions' },
];

const isTab = (v: string | null): v is TVWorkbenchTab => v === 'graph' || v === 'system' || v === 'algebra';

import { WorkspaceShell } from '../../workspace';

export const TwoVariablesWorkbenchPage: React.FC = () => {
  const [params] = useSearchParams();
  const activeTab = useTwoVariablesStore((s) => s.activeTab);
  const setActiveTab = useTwoVariablesStore((s) => s.setActiveTab);
  const mode = useTwoVariablesStore((s) => s.mode);
  const setMode = useTwoVariablesStore((s) => s.setMode);
  const setExperiment = useTwoVariablesStore((s) => s.setExperiment);
  const selectLesson = useTwoVariablesStore((s) => s.selectLesson);
  const setGuidedActive = useTwoVariablesStore((s) => s.setGuidedActive);
  const experimentId = useTwoVariablesStore((s) => s.currentExperimentId);

  const lessonParam = params.get('lesson');
  const expParam = params.get('exp');
  const tabParam = params.get('tab');
  const modeParam = params.get('mode');

  const lesson = lessonParam ? TV_GUIDED_LESSONS[lessonParam] : undefined;
  const guided = Boolean(lesson);

  useEffect(() => {
    if (lesson) {
      selectLesson(lesson.id);
      return;
    }
    setGuidedActive(false);
    if (expParam) setExperiment(expParam);
    if (isTab(tabParam)) setActiveTab(tabParam);
    setMode((modeParam === 'practice' ? 'practice' : 'explore') as TVMode);
  }, [lesson, expParam, tabParam, modeParam, selectLesson, setExperiment, setActiveTab, setMode, setGuidedActive]);

  const lessonNode = guided ? <GuidedPanel /> : undefined;
  const showPractice = mode === 'practice' && !guided;

  // Outliner: Workbench Views & Presets
  const outlinerContent = (
    <div className="p-3 space-y-4 text-xs font-sans">
      <div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Workbench View</span>
        <div className="grid grid-cols-1 gap-1.5 mt-2">
          {TABS.map((t) => (
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

      <div className="pt-2 border-t border-outline-variant">
        <div className="flex items-center justify-between pb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Experiment Presets</span>
          <span className="text-[11px] font-mono text-primary font-bold">{TV_EXPERIMENTS.length} Total</span>
        </div>
        <div className="space-y-1.5">
          {TV_EXPERIMENTS.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => {
                setMode('explore');
                setExperiment(e.id);
              }}
              className={`min-h-[36px] w-full text-left px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
                experimentId === e.id
                  ? 'bg-surface-elevated border-primary text-white font-semibold'
                  : 'bg-surface-card border-surface-border text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className="truncate">{e.title}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Inspector: Equations & Systems theory
  const inspectorContent = (
    <div className="p-3 space-y-4 text-xs font-sans">
      {guided && lesson ? (
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
            Lesson {lesson.lessonNumber}
          </span>
          <h4 className="text-white font-bold text-sm mt-1">{lesson.title}</h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{lesson.learningObjective || lesson.subtitle}</p>
        </div>
      ) : (
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Equation Principles</span>
          <div className="mt-2 space-y-2 font-mono text-slate-300">
            <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]">
              <p className="font-bold text-white mb-1">General Linear Form</p>
              <p>ax + by + c = 0</p>
            </div>
            <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]">
              <p className="font-bold text-white mb-1">Slope-Intercept Form</p>
              <p>y = mx + c &nbsp;(m = &minus;a/b)</p>
            </div>
            <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]">
              <p className="font-bold text-white mb-1">Simultaneous Intersection</p>
              <p className="text-[10px] leading-relaxed">
                Unique solution if slopes differ; coincident if equations proportional.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Viewport: Graph / System / Algebra / Practice
  const viewportContent = (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden">
      {showPractice ? (
        <PracticePanel />
      ) : activeTab === 'system' ? (
        <SystemExplorer lesson={lessonNode} />
      ) : activeTab === 'algebra' ? (
        <AlgebraLab lesson={lessonNode} />
      ) : (
        <GraphWorkbench lesson={lessonNode} />
      )}
    </div>
  );

  // Analysis Dock: Algebraic Telemetry
  const analysisDockContent = (
    <div className="p-3 text-xs space-y-2 font-mono">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2 rounded bg-surface-card border border-surface-border">
          <span className="text-outline text-[10px] block">ACTIVE VIEW</span>
          <span className="text-primary font-bold text-sm uppercase">{mode === 'practice' ? 'Practice' : activeTab}</span>
        </div>
        <div className="p-2 rounded bg-surface-card border border-surface-border">
          <span className="text-outline text-[10px] block">MODE</span>
          <span className="text-white font-bold text-sm uppercase">{mode}</span>
        </div>
        <div className="p-2 rounded bg-surface-card border border-surface-border">
          <span className="text-outline text-[10px] block">EQUATION FORM</span>
          <span className="text-white font-bold text-sm">ax + by + c = 0</span>
        </div>
        <div className="p-2 rounded bg-surface-card border border-surface-border">
          <span className="text-outline text-[10px] block">SYSTEM STATUS</span>
          <span className="text-emerald-400 font-bold text-sm">Linear Equilibrium</span>
        </div>
      </div>
    </div>
  );

  return (
    <WorkspaceShell
      chapterId="two-variables"
      labTitle="Two Variables, One Line"
      outlinerTitle="Views & Presets"
      outliner={outlinerContent}
      viewport={viewportContent}
      inspectorTitle="Properties & Systems"
      inspector={inspectorContent}
      analysisDockTitle="Algebraic Telemetry & Solutions"
      analysisDock={analysisDockContent}
    />
  );
};
