/**
 * Understanding Data workbench page (M6): free laboratory, guided lesson and
 * chapter practice share this route and differ by URL params.
 *   ?lesson=ud-l3        guided lesson
 *   ?exp=ud-mixture      free laboratory preset
 *   ?tab=weighted|mixture|charts
 *   ?mode=practice       chapter practice
 */

import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useUnderstandingDataStore } from '../../../store/useUnderstandingDataStore';
import { UD_GUIDED_LESSONS } from '../../../engine/mathematics/understandingData/curriculumPath';
import { UD_EXPERIMENTS } from '../../../engine/mathematics/understandingData/experimentRegistry';
import type { UDMode, UDTab } from '../../../engine/mathematics/understandingData/types';
import { WeightedExplorer } from './WeightedExplorer';
import { MixtureLab } from './MixtureLab';
import { ChartLab } from './ChartLab';
import { AverageDayLab } from './AverageDayLab';
import { PracticePanel } from './PracticePanel';
import { GuidedPanel } from './GuidedPanel';

const TABS: { id: UDTab; label: string; icon: string }[] = [
  { id: 'weighted', label: 'Weighted Average', icon: 'balance' },
  { id: 'mixture', label: 'Mixtures', icon: 'science' },
  { id: 'charts', label: 'Charts', icon: 'stacked_bar_chart' },
  { id: 'average', label: 'Average Day', icon: 'schedule' },
];
const isTab = (v: string | null): v is UDTab => v === 'weighted' || v === 'mixture' || v === 'charts' || v === 'average';

export const UnderstandingDataWorkbenchPage: React.FC = () => {
  const [params] = useSearchParams();
  const activeTab = useUnderstandingDataStore((s) => s.activeTab);
  const setActiveTab = useUnderstandingDataStore((s) => s.setActiveTab);
  const mode = useUnderstandingDataStore((s) => s.mode);
  const setMode = useUnderstandingDataStore((s) => s.setMode);
  const setExperiment = useUnderstandingDataStore((s) => s.setExperiment);
  const selectLesson = useUnderstandingDataStore((s) => s.selectLesson);
  const setGuidedActive = useUnderstandingDataStore((s) => s.setGuidedActive);
  const experimentId = useUnderstandingDataStore((s) => s.currentExperimentId);

  const lessonParam = params.get('lesson');
  const expParam = params.get('exp');
  const tabParam = params.get('tab');
  const modeParam = params.get('mode');
  const lesson = lessonParam ? UD_GUIDED_LESSONS[lessonParam] : undefined;
  const guided = Boolean(lesson);

  useEffect(() => {
    if (lesson) {
      selectLesson(lesson.id);
      return;
    }
    setGuidedActive(false);
    if (expParam) setExperiment(expParam);
    if (isTab(tabParam)) setActiveTab(tabParam);
    setMode((modeParam === 'practice' ? 'practice' : 'explore') as UDMode);
  }, [lesson, expParam, tabParam, modeParam, selectLesson, setExperiment, setActiveTab, setMode, setGuidedActive]);

  const lessonNode = guided ? <GuidedPanel /> : undefined;
  const showPractice = mode === 'practice' && !guided;

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-surface-lowest text-slate-100 overflow-hidden font-sans">
      <header className="min-h-14 bg-surface-low border-b border-surface-border px-2 sm:px-4 py-1 flex items-center gap-x-2 gap-y-1 shrink-0 flex-wrap">
        <Link to="/mathematics/understanding-data" className="min-h-11 px-3 inline-flex items-center gap-1.5 rounded-lg bg-surface-card border border-surface-border text-slate-300 hover:text-white text-xs font-semibold" aria-label="Back to the chapter page">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span className="hidden sm:inline">Chapter</span>
        </Link>
        {guided ? (
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-mono text-amber-400 font-bold">Lesson {lesson!.lessonNumber}</div>
            <div className="text-sm font-bold text-white truncate">{lesson!.title}</div>
          </div>
        ) : (
          <>
            <select value={experimentId} onChange={(e) => { setMode('explore'); setExperiment(e.target.value); }} aria-label="Experiment preset" className="min-h-11 bg-surface-card border border-surface-border text-slate-200 text-xs font-semibold rounded-lg px-2 w-[calc(100%-56px)] sm:w-auto sm:max-w-xs">
              {UD_EXPERIMENTS.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
            {mode === 'explore' && (
              <nav className="flex items-center gap-0.5 bg-surface-lowest p-0.5 rounded-xl border border-surface-border text-xs font-mono" aria-label="Laboratory">
                {TABS.map((t) => (
                  <button key={t.id} type="button" aria-pressed={activeTab === t.id} onClick={() => setActiveTab(t.id)} className={`min-h-11 px-2.5 sm:px-3 rounded-lg font-bold flex items-center gap-1.5 ${activeTab === t.id ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                    <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
                    <span className="hidden md:inline">{t.label}</span>
                  </button>
                ))}
              </nav>
            )}
            <div className="ml-auto flex items-center gap-0.5 bg-surface-card p-0.5 rounded-lg border border-surface-border text-xs font-mono font-semibold">
              {(['explore', 'practice'] as const).map((m) => <button key={m} type="button" aria-label={m === 'explore' ? 'Explore: free laboratory' : 'Practice: chapter questions'} aria-pressed={mode === m} onClick={() => setMode(m)} className={`min-h-11 px-2.5 sm:px-3 rounded capitalize ${mode === m ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}><span className="sm:hidden">{m === 'explore' ? 'Lab' : 'Quiz'}</span><span className="hidden sm:inline">{m}</span></button>)}
            </div>
          </>
        )}
      </header>

      {showPractice ? <PracticePanel /> : activeTab === 'mixture' ? <MixtureLab lesson={lessonNode} /> : activeTab === 'charts' ? <ChartLab lesson={lessonNode} /> : activeTab === 'average' ? <AverageDayLab lesson={lessonNode} /> : <WeightedExplorer lesson={lessonNode} />}
    </div>
  );
};
