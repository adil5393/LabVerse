import type { LabTask } from '../../engine/education/types';

/** Query parameters a laboratory reads to know it is running a lesson task. Distinct from any laboratory's own parameters. */
export const LAB_TASK_PARAMS = { lesson: 'ltLesson', task: 'ltTask', back: 'ltBack' } as const;

export function labTaskHref(task: LabTask, lessonId: string, backHref: string): string {
  const [path, query = ''] = task.href.split('?');
  const q = new URLSearchParams(query);
  q.set(LAB_TASK_PARAMS.lesson, lessonId);
  q.set(LAB_TASK_PARAMS.task, task.id);
  q.set(LAB_TASK_PARAMS.back, backHref);
  return `${path}?${q.toString()}`;
}

/** A link to a laboratory that remembers where the student came from, so the laboratory can offer “Back to the lesson”. */
export function labHrefFrom(labHref: string, backHref: string): string {
  const [path, query = ''] = labHref.split('?');
  const q = new URLSearchParams(query);
  q.set(LAB_TASK_PARAMS.back, backHref);
  return `${path}?${q.toString()}`;
}
