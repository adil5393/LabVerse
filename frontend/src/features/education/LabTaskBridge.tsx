/**
 * The laboratory side of a lesson task. A laboratory opened from a `LabTaskCard` receives the lesson and task ids in the query
 * string (`LAB_TASK_PARAMS`). It calls `report(event)` when the student genuinely does something (moves a chord, changes the
 * frequency, filters a mixture) and `observe(label, value)` when the student records a measured value. Goals are evaluated by
 * the shared rules from those events; there is no "mark as done" button anywhere.
 *
 * Outside a lesson task (no query parameters) the hook is inactive and `report` / `observe` do nothing, so laboratories can call
 * them unconditionally.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { LabTask } from '../../engine/education/types';
import { labTaskGoals } from '../../engine/education/progress';
import { useEducationStore } from '../../store/useEducationStore';
import { LAB_TASK_PARAMS } from './labTaskLinks';

export interface LessonLabTask {
  active: boolean;
  lessonId: string;
  taskId: string;
  backHref: string;
  report: (name: string, view?: string) => void;
  observe: (label: string, value: string, note?: string) => void;
}

/** Only same-site paths are accepted as the return address. */
const safeBack = (v: string | null): string => (v && v.startsWith('/') && !v.startsWith('//') ? v : '/');

export function useLessonLabTask(task?: LabTask): LessonLabTask {
  const [params] = useSearchParams();
  const lessonId = params.get(LAB_TASK_PARAMS.lesson) ?? '';
  const taskId = params.get(LAB_TASK_PARAMS.task) ?? '';
  const backHref = safeBack(params.get(LAB_TASK_PARAMS.back));
  const active = Boolean(lessonId && taskId);
  const recordLabEvent = useEducationStore((s) => s.recordLabEvent);
  const addLabObservation = useEducationStore((s) => s.addLabObservation);
  const definition = task && task.id === taskId ? task : undefined;
  const report = useCallback((name: string, view?: string) => { if (active) recordLabEvent(lessonId, taskId, { name, view }, definition); }, [active, lessonId, taskId, definition, recordLabEvent]);
  const observe = useCallback((label: string, value: string, note?: string) => { if (active) addLabObservation(lessonId, taskId, { label, value, note }); }, [active, lessonId, taskId, addLabObservation]);
  return useMemo(() => ({ active, lessonId, taskId, backHref, report, observe }), [active, lessonId, taskId, backHref, report, observe]);
}

/**
 * A compact banner a laboratory shows while a lesson task is running: the task, live goals (when the laboratory passes the task
 * definition), a "record this measurement" control for the values the laboratory currently shows, and the way back.
 */
export const LabTaskBanner: React.FC<{ bridge: LessonLabTask; task?: LabTask; measurements?: { label: string; value: string }[] }> = ({ bridge, task, measurements = [] }) => {
  const rec = useEducationStore((s) => (bridge.active ? s.lessons[bridge.lessonId]?.labTasks?.[bridge.taskId] : undefined));
  const [note, setNote] = useState('');
  if (!bridge.active) return null;
  const goals = task ? labTaskGoals(task, rec) : [];
  return (
    <section className="rounded-2xl border border-cyan-500/50 bg-cyan-950/40 p-3 space-y-2 text-sm" data-testid="lab-task-banner" aria-label="Lesson investigation">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <strong className="text-white">{task?.title ?? 'Lesson investigation'}</strong>
        <Link to={bridge.backHref} className="min-h-[44px] px-3 rounded-xl border border-cyan-400 text-cyan-100 inline-flex items-center gap-1 font-semibold">
          <span className="material-symbols-outlined text-[18px]" aria-hidden>arrow_back</span>Back to the lesson
        </Link>
      </div>
      {task && <p className="text-slate-200">{task.instruction}</p>}
      {goals.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Goals">
          {goals.map((g) => <li key={g.id} data-goal={g.id} data-met={g.met ? 'true' : 'false'} className={`px-2 py-1 rounded-lg border text-xs ${g.met ? 'border-emerald-400 text-emerald-200' : 'border-surface-border text-slate-300'}`}>{g.met ? '✓ ' : ''}{g.label}</li>)}
        </ul>
      )}
      {measurements.length > 0 && (
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex-1 min-w-[160px] text-xs text-slate-300">Your note (optional)
            <input value={note} onChange={(e) => setNote(e.target.value)} className="mt-1 w-full min-h-[44px] px-3 rounded-xl border border-surface-border bg-surface text-on-surface text-sm" />
          </label>
          {measurements.map((m) => (
            <button key={m.label} type="button" className="min-h-[44px] px-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs" data-record={m.label}
              onClick={() => { bridge.observe(m.label, m.value, note.trim() || undefined); bridge.report('observation'); setNote(''); }}>
              Record {m.label} = {m.value}
            </button>
          ))}
        </div>
      )}
      {rec && rec.observations.length > 0 && <p className="text-xs text-slate-300">{rec.observations.length} observation{rec.observations.length === 1 ? '' : 's'} recorded.</p>}
    </section>
  );
};
