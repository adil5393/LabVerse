/**
 * Shared workbench side of a lesson investigation, for any laboratory whose construction lives in a zustand store (Circles,
 * Quadrilaterals, and later chapters). It:
 * - resolves the task from the query string,
 * - reports one "figure-changed" event per finished gesture (changes to the watched parts of the store, debounced),
 * - computes live measurements the student can record,
 * - renders an overlay over the viewport (collapsed by default on phones so the experiment stays visible).
 */

import React, { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { StoreApi, UseBoundStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { LabTask } from '../../engine/education/types';
import { LabTaskBanner, useLessonLabTask, type LessonLabTask } from './LabTaskBridge';
import { LAB_TASK_PARAMS } from './labTaskLinks';
import { usePhoneLayout } from '../workspace/usePhoneLayout';

export const GESTURE_MS = 400;
const NONE: unknown[] = [];

export interface WorkbenchTaskOptions<S> {
  store: UseBoundStore<StoreApi<S>>;
  /** Parts of the state whose change means the student changed the construction. */
  watch: (s: S) => unknown[];
  taskById: (id: string | null) => LabTask | undefined;
  measure: (s: S) => { label: string; value: string }[];
  /** The view or mode currently shown (reported as a "view" event when it changes, for goals such as "open the 100% chart"). */
  view?: (s: S) => string | undefined;
}

export function useWorkbenchLessonTask<S>({ store, watch, taskById, measure, view }: WorkbenchTaskOptions<S>): { bridge: LessonLabTask; task?: LabTask; measurements: { label: string; value: string }[] } {
  const [params] = useSearchParams();
  const taskId = params.get(LAB_TASK_PARAMS.task);
  const task = useMemo(() => taskById(taskId), [taskById, taskId]);
  const bridge = useLessonLabTask(task);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const watchRef = useRef(watch);
  const viewRef = useRef(view);
  useEffect(() => { watchRef.current = watch; viewRef.current = view; });

  useEffect(() => {
    if (!bridge.active) return undefined;
    let last = watchRef.current(store.getState());
    let lastView = viewRef.current?.(store.getState());
    if (lastView) bridge.report('view', lastView);
    const unsubscribe = store.subscribe((s) => {
      const v = viewRef.current?.(s);
      if (v && v !== lastView) { lastView = v; bridge.report('view', v); }
      const now = watchRef.current(s);
      if (now.length === last.length && now.every((v, i) => v === last[i])) return;
      last = now;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => bridge.report('figure-changed'), GESTURE_MS);
    });
    return () => { unsubscribe(); if (timer.current) clearTimeout(timer.current); };
  }, [bridge, store]);

  // Re-render only when the watched slices change, and only while a task is active (no cost in free laboratory use).
  const slices = store(useShallow((s: S) => (bridge.active ? watch(s) : NONE)));
  // `slices` keeps its identity until a watched slice changes (useShallow), so it is the recompute signal.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const measurements = useMemo(() => (bridge.active ? measure(store.getState()) : []), [bridge.active, measure, store, slices]);
  return { bridge, task, measurements };
}

export const LabTaskOverlay: React.FC<{ bridge: LessonLabTask; task?: LabTask; measurements: { label: string; value: string }[] }> = ({ bridge, task, measurements }) => {
  const phone = usePhoneLayout();
  if (!bridge.active) return null;
  return (
    <details key={phone ? 'phone' : 'wide'} {...(phone ? {} : { open: true })} className="absolute top-2 left-2 right-2 z-20 max-w-xl rounded-2xl bg-surface-card/95 backdrop-blur-md shadow-lg" data-testid="lab-task-overlay">
      <summary className="cursor-pointer min-h-[44px] px-3 flex items-center text-xs font-semibold text-cyan-100">Lesson investigation (tap to show or hide)</summary>
      <div className="px-2 pb-2"><LabTaskBanner bridge={bridge} task={task} measurements={measurements.slice(0, 4)} /></div>
    </details>
  );
};
