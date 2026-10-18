/**
 * Two Variables, One Line workbench page (M5): free laboratory, guided
 * lesson, and chapter practice share this route and differ by URL params.
 *   ?lesson=tv-l3          guided lesson
 *   ?exp=tv-two-lines      free laboratory preset
 *   ?tab=graph|system|algebra
 *   ?mode=practice         chapter practice
 */

import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-surface-lowest text-slate-100 overflow-hidden font-sans">
      <header className="min-h-14 bg-surface-low border-b border-surface-border px-2 sm:px-4 py-1.5 flex items-center gap-2 shrink-0 flex-wrap">
        <Link to="/mathematics/two-variables" className="min-h-11 px-3 inline-flex items-center gap-1.5 rounded-lg bg-surface-card border border-surface-border text-slate-300 hover:text-white text-xs font-semibold" aria-label="Back to the chapter page">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span className="hidden sm:inline">Chapter</span>
        </Link>

        {guided ? (
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-mono text-amber-400 font-bold">Lesson {lesson!.lessonNumber}</div>
            <div className="text-sm font-bold text-white truncate">{lesson!.title}</div>
          </div>
        ) : (
          <>
            <select
              value={experimentId}
              onChange={(e) => {
                setMode('explore');
                setExperiment(e.target.value);
              }}
              aria-label="Experiment preset"
              className="min-h-11 bg-surface-card border border-surface-border text-slate-200 text-xs font-semibold rounded-lg px-2 max-w-[180px] sm:max-w-xs"
            >
              {TV_EXPERIMENTS.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>

            {mode === 'explore' && (
              <nav className="flex items-center gap-1 bg-surface-lowest p-1 rounded-xl border border-surface-border text-xs font-mono" aria-label="Workbench">
                {TABS.map((t) => (
                  <button key={t.id} type="button" aria-pressed={activeTab === t.id} onClick={() => setActiveTab(t.id)} className={`min-h-10 px-2.5 sm:px-3 rounded-lg font-bold flex items-center gap-1.5 ${activeTab === t.id ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                    <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
                    <span className="hidden md:inline">{t.label}</span>
                  </button>
                ))}
              </nav>
            )}

            <div className="ml-auto flex items-center gap-1 bg-surface-card p-1 rounded-lg border border-surface-border text-xs font-mono font-semibold">
              {(['explore', 'practice'] as const).map((m) => (
                <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)} className={`min-h-10 px-3 rounded capitalize ${mode === m ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}>{m}</button>
              ))}
            </div>
          </>
        )}
      </header>

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
};
