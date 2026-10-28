/**
 * Understanding Data workbench page (M6): free laboratory, guided lesson and
 * chapter practice share this route and differ by URL params.
 *   ?lesson=ud-l3        guided lesson
 *   ?exp=ud-mixture      free laboratory preset
 *   ?tab=weighted|mixture|charts
 *   ?mode=practice       chapter practice
 */

import React, { useCallback, useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
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
import { labTaskFor, UD_LESSON_MAP } from '../../../engine/mathematics/understandingData/learn/unified';
import { useWorkbenchLessonTask } from '../../education/WorkbenchLessonTask';
import { LabTaskBanner } from '../../education/LabTaskBridge';
import { legacyPathEnabled } from '../../education/compat';

type UdState = ReturnType<typeof useUnderstandingDataStore.getState>;
const watchUd = (s: UdState) => [s.rows, s.constituents, s.dataset, s.pieGroupId, s.popWeights, s.mixtureScale, s.selected, s.clusterBy];
const viewUd = (s: UdState) => String(s.chartView);
const measureUd = (s: UdState) => [{ label: 'chart view', value: String(s.chartView) }, { label: 'rows in the table', value: String(s.rows.length) }];

const TABS: { id: UDTab; label: string; icon: string }[] = [
  { id: 'weighted', label: 'Weighted Average', icon: 'balance' },
  { id: 'mixture', label: 'Mixtures', icon: 'science' },
  { id: 'charts', label: 'Charts', icon: 'stacked_bar_chart' },
  { id: 'average', label: 'Average Day', icon: 'schedule' },
];
const isTab = (v: string | null): v is UDTab => v === 'weighted' || v === 'mixture' || v === 'charts' || v === 'average';

import { WorkspaceShell } from '../../workspace';

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

  const legacyOn = legacyPathEnabled('understanding-data', `?${params.toString()}`);
  const taskById = useCallback((id: string | null) => {
    const l = id ? Object.values(UD_GUIDED_LESSONS).find((x) => `lt-${x.id}` === id) : undefined;
    return l ? labTaskFor(l) : undefined;
  }, []);
  const { bridge, task, measurements } = useWorkbenchLessonTask({ store: useUnderstandingDataStore, watch: watchUd, taskById, measure: measureUd, view: viewUd });
  const taskExperiment = bridge.active && task ? (task.setup as { experimentId: string }).experimentId : undefined;
  const lessonParam = params.get('lesson');
  const expParam = taskExperiment ?? params.get('exp');
  const tabParam = params.get('tab');
  const modeParam = params.get('mode');
  const lesson = lessonParam && legacyOn ? UD_GUIDED_LESSONS[lessonParam] : undefined;
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

  const lessonNode = guided ? <GuidedPanel /> : bridge.active ? <LabTaskBanner bridge={bridge} task={task} measurements={measurements} /> : undefined;
  const showPractice = mode === 'practice' && !guided;

  if (lessonParam && !legacyOn && !bridge.active) {
    const mapped = UD_LESSON_MAP[lessonParam];
    return <Navigate replace to={mapped ? `/mathematics/understanding-data/learn/${mapped}` : '/mathematics/understanding-data/practice'} />;
  }

  // Outliner: Data Views & Presets
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
          <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Dataset Presets</span>
          <span className="text-[11px] font-mono text-primary font-bold">{UD_EXPERIMENTS.length} Total</span>
        </div>
        <div className="space-y-1.5">
          {UD_EXPERIMENTS.map((e) => (
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

  // Inspector: Statistical Principles
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
          <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Statistical Principles</span>
          <div className="mt-2 space-y-2 font-mono text-slate-300">
            <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]">
              <p className="font-bold text-white mb-1">Weighted Mean Formula</p>
              <p>&sum;(w<sub>i</sub> &times; x<sub>i</sub>) &divide; &sum;w<sub>i</sub></p>
            </div>
            <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]">
              <p className="font-bold text-white mb-1">Conservation in Mixtures</p>
              <p className="text-[10px] leading-relaxed">
                Total quantity and total substance are conserved; concentration is a weighted ratio.
              </p>
            </div>
            <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]">
              <p className="font-bold text-white mb-1">Central Tendency</p>
              <p className="text-[10px] leading-relaxed">
                Averages summarize distributions but do not reveal spread or variation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Viewport: Weighted / Mixture / Charts / AverageDay / Practice
  const viewportContent = (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden">
      {showPractice ? (
        <PracticePanel />
      ) : activeTab === 'mixture' ? (
        <MixtureLab lesson={lessonNode} />
      ) : activeTab === 'charts' ? (
        <ChartLab lesson={lessonNode} />
      ) : activeTab === 'average' ? (
        <AverageDayLab lesson={lessonNode} />
      ) : (
        <WeightedExplorer lesson={lessonNode} />
      )}
    </div>
  );

  // Analysis Dock: Statistical Telemetry
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
          <span className="text-outline text-[10px] block">DATASET</span>
          <span className="text-white font-bold text-sm truncate max-w-[140px] inline-block">{experimentId}</span>
        </div>
        <div className="p-2 rounded bg-surface-card border border-surface-border">
          <span className="text-outline text-[10px] block">DISTRIBUTION</span>
          <span className="text-emerald-400 font-bold text-sm">Balanced Sampling</span>
        </div>
      </div>
    </div>
  );

  return (
    <WorkspaceShell
      chapterId="understanding-data"
      labTitle="Understanding Data Workbench"
      outlinerTitle="Data Views & Presets"
      outliner={outlinerContent}
      viewport={viewportContent}
      inspectorTitle="Statistical Inspector"
      inspector={inspectorContent}
      analysisDockTitle="Telemetry & Distribution Summary"
      analysisDock={analysisDockContent}
    />
  );
};
