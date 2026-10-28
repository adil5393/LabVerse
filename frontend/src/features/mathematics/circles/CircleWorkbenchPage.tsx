/**
 * Interactive Workbench Page for Class 9 Circles Laboratory
 *
 * Three ways in:
 * 1. Lesson investigation (unified framework): `?ltLesson=&ltTask=` from a Learn lesson's laboratory task. The task's
 *    experiment and allowed tools are set up; every finished change to the construction is reported to the lesson as a
 *    "figure-changed" event (one per gesture, not per pointer move), and the student can record live measurements.
 * 2. Free Laboratory Mode (?exp=... or ?mode=...): the complete, unrestricted 13-experiment workbench.
 * 3. Older guided mode (?lesson=...): only while the compatibility switch is on (see ./compat.ts). Otherwise the link
 *    redirects to the matching Learn lesson, so old bookmarks keep working.
 */

import React, { useCallback, useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useCircleStore } from '../../../store/useCircleStore';
import { useGuidedLearningStore } from '../../../store/useGuidedLearningStore';
import { CIRCLES_GUIDED_LESSONS } from '../../../engine/mathematics/circles/curriculumPath';
import { CIRCLES_LESSON_MAP, labTaskFor } from '../../../engine/mathematics/circles/learn/unified';
import { liveCircleMeasurements } from '../../../engine/mathematics/circles/learn/liveMeasurements';
import { CircleToolRail } from './CircleToolRail';
import { CircleCanvas } from './CircleCanvas';
import { CircleInspectorPanel } from './CircleInspectorPanel';
import { CircleGuidedInspector } from './CircleGuidedInspector';
import type { CircleMode } from '../../../engine/mathematics/circles/types';
import { WorkspaceShell } from '../../workspace';
import { LabTaskOverlay, useWorkbenchLessonTask } from '../../education/WorkbenchLessonTask';
import { legacyCirclesPathEnabled } from './compat';

/** The laboratory task for a task id (`lt-<older lesson id>`), built from the same older lesson data. */
const taskById = (id: string | null) => {
  const lesson = id ? Object.values(CIRCLES_GUIDED_LESSONS).find((l) => `lt-${l.id}` === id) : undefined;
  return lesson ? labTaskFor(lesson) : undefined;
};

type CircleState = ReturnType<typeof useCircleStore.getState>;
const watchCircle = (s: CircleState) => [s.circles, s.circumferencePoints, s.chords, s.angles];
const measureCircle = (s: CircleState) => liveCircleMeasurements({ circles: s.circles, circumferencePoints: s.circumferencePoints, chords: s.chords, angles: s.angles });

export const CircleWorkbenchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { setExperiment, setMode, fitToConstruction } = useCircleStore();
  const { selectLesson } = useGuidedLearningStore();
  const legacyOn = legacyCirclesPathEnabled(`?${searchParams.toString()}`);

  const lessonParam = searchParams.get('lesson');
  const expParam = searchParams.get('exp');
  const modeParam = searchParams.get('mode') as CircleMode | null;
  const byId = useCallback(taskById, []);
  const { bridge, task, measurements } = useWorkbenchLessonTask({ store: useCircleStore, watch: watchCircle, taskById: byId, measure: measureCircle });
  const taskSetup = bridge.active && task ? (task.setup as { experimentId: string; allowedTools: string[] }) : undefined;

  const isGuidedMode = Boolean(lessonParam) && legacyOn;
  const activeGuidedLesson = isGuidedMode && lessonParam ? CIRCLES_GUIDED_LESSONS[lessonParam] : undefined;

  // Sync route params into geometry and guided stores
  useEffect(() => {
    if (taskSetup) {
      setExperiment(taskSetup.experimentId);
      setMode('explore');
      setTimeout(() => fitToConstruction(window.innerWidth * 0.6, window.innerHeight * 0.8), 50);
    } else if (isGuidedMode && activeGuidedLesson) {
      setExperiment(activeGuidedLesson.experimentId);
      selectLesson(activeGuidedLesson.id);
      setMode('explore');
      setTimeout(() => {
        fitToConstruction(window.innerWidth * 0.6, window.innerHeight * 0.8);
      }, 50);
    } else if (expParam) {
      setExperiment(expParam);
      if (modeParam) {
        setMode(modeParam);
      }
    } else if (modeParam) {
      setMode(modeParam);
    }
  }, [lessonParam, expParam, modeParam, isGuidedMode, activeGuidedLesson, setExperiment, selectLesson, setMode, fitToConstruction, taskSetup]);

  if (lessonParam && !legacyOn && !bridge.active) {
    const mapped = CIRCLES_LESSON_MAP[lessonParam];
    return <Navigate replace to={mapped ? `/mathematics/circles/learn/${mapped}` : '/mathematics/circles/practice'} />;
  }

  const outlinerContent = (
    <div className="h-full flex flex-col overflow-hidden">
      <CircleToolRail
        allowedTools={taskSetup ? taskSetup.allowedTools : isGuidedMode && activeGuidedLesson ? activeGuidedLesson.allowedTools : undefined}
      />
    </div>
  );

  const viewportContent = (
    <div className="flex-1 h-full relative overflow-hidden">
      <CircleCanvas />

      <LabTaskOverlay bridge={bridge} task={task} measurements={measurements} />

      {/* Smart TV / Beginner floating instruction pill in Guided Mode */}
      {isGuidedMode && activeGuidedLesson && (
        <div className="absolute top-4 left-4 z-10 pointer-events-none max-w-md hidden sm:block">
          <div className="px-3.5 py-2 rounded-xl bg-surface-card/90 backdrop-blur-md border border-amber-500/30 text-xs shadow-lg space-y-0.5">
            <div className="font-bold text-amber-400 font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Lesson {activeGuidedLesson.lessonNumber} Goal</span>
            </div>
            <div className="text-slate-200 text-xs leading-snug">
              {activeGuidedLesson.experimentGuide.instruction}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const inspectorContent = (
    <div className="h-full flex flex-col overflow-auto">
      {isGuidedMode ? <CircleGuidedInspector /> : <CircleInspectorPanel />}
    </div>
  );

  const analysisDockContent = (
    <div className="p-3 text-xs space-y-2 font-mono">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2 rounded bg-surface-card border border-surface-border">
          <span className="text-outline text-[10px] block">EXPERIMENT</span>
          <span className="text-primary font-bold text-sm uppercase">{taskSetup?.experimentId ?? expParam ?? 'Chords & Angles'}</span>
        </div>
        <div className="p-2 rounded bg-surface-card border border-surface-border">
          <span className="text-outline text-[10px] block">MODE</span>
          <span className="text-white font-bold text-sm uppercase">{bridge.active ? 'Lesson investigation' : isGuidedMode ? 'Guided Lesson' : (modeParam ?? 'Explore')}</span>
        </div>
        <div className="p-2 rounded bg-surface-card border border-surface-border">
          <span className="text-outline text-[10px] block">TOOLSET</span>
          <span className="text-white font-bold text-sm">{taskSetup || isGuidedMode ? 'Lesson tools' : 'Unrestricted'}</span>
        </div>
        <div className="p-2 rounded bg-surface-card border border-surface-border">
          <span className="text-outline text-[10px] block">THEOREM VERIFICATION</span>
          <span className="text-emerald-400 font-bold text-sm">Active Invariant</span>
        </div>
      </div>
    </div>
  );

  return (
    <WorkspaceShell
      chapterId="circles"
      labTitle="Circles Laboratory"
      outlinerTitle="Construction Rail"
      outliner={outlinerContent}
      viewport={viewportContent}
      inspectorTitle="Properties & Proofs"
      inspector={inspectorContent}
      analysisDockTitle="Theorem Telemetry & Invariants"
      analysisDock={analysisDockContent}
    />
  );
};
