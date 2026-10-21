/**
 * Chapter-neutral Learn page. Renders an EduLesson from an EduChapter using the
 * chapter's visual registry. Students may move between stages freely;
 * prerequisites are suggested, never required.
 */

import { subjectCrumb } from '../../engine/education/subjects';
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GlobalHeader } from '../../components/GlobalHeader';
import { lessonStatus, objectiveCoverage, STATUS_LABEL, summarizeLesson, reviewRecommendations } from '../../engine/education/progress';
import type { EduChapter, EduLesson, JudgeRegistry, LessonRecord } from '../../engine/education/types';
import { useEducationStore } from '../../store/useEducationStore';
import { ConceptExplainer, GuidedPractice, IndependentPractice, LearningReflection, WorkedExample } from './LessonParts';
import { PrerequisiteCard, findLessonStep, findRefresher } from './Prerequisites';
import { JudgeProvider } from './judges';
import { VisualRegistryProvider, type VisualRegistry } from './visuals';

type Stage = 'understand' | 'worked' | 'guided' | 'independent' | 'reflect';
const STAGES: { id: Stage; label: string; icon: string }[] = [
  { id: 'understand', label: 'Understand', icon: 'menu_book' },
  { id: 'worked', label: 'Worked example', icon: 'visibility' },
  { id: 'guided', label: 'Guided practice', icon: 'support_agent' },
  { id: 'independent', label: 'Your turn', icon: 'edit_note' },
  { id: 'reflect', label: 'Reflect', icon: 'psychology' },
];

function resumeStageFor(lesson: EduLesson | undefined, rec: LessonRecord | undefined): Stage {
  if (!lesson || !rec) return 'understand';
  if (rec.lastStage) return rec.lastStage;
  const s = summarizeLesson(lesson, rec);
  if (s.stepsSeen < s.stepsTotal) return 'understand';
  if (!rec.workedSeen) return 'worked';
  if (s.guidedDone < s.guidedTotal) return 'guided';
  if (s.independentResolved < s.independentTotal) return 'independent';
  return 'reflect';
}

interface LearnLessonProps { chapter: EduChapter; registry: VisualRegistry; judges?: JudgeRegistry; lessonId: string; crumb: string }

const LearnLesson: React.FC<LearnLessonProps> = ({ chapter, registry, judges = {}, lessonId, crumb }) => {
  const navigate = useNavigate();
  const location = useLocation();
  // "Next lesson" asks for a fresh start: Understand, first step, even if this lesson was visited before.
  const [restart] = useState(() => Boolean((location.state as { restart?: boolean } | null)?.restart));
  const lesson = chapter.lessons[lessonId];
  const rec = useEducationStore((s) => s.lessons[lessonId]);
  const readiness = useEducationStore((s) => s.readiness);
  const teacherMode = useEducationStore((s) => s.teacherMode);
  const setTeacherMode = useEducationStore((s) => s.setTeacherMode);
  const markInvestigated = useEducationStore((s) => s.markInvestigated);

  // Resume where the student left off (decided once, on mount).
  const [stage, setStageState] = useState<Stage>(() => (restart ? 'understand' : resumeStageFor(lesson, rec)));
  const setLastStage = useEducationStore((s) => s.setLastStage);
  const setStage = (next: Stage) => { setStageState(next); if (lesson) setLastStage(lesson.id, next); };
  const [stepIdx, setStepIdx] = useState(() => {
    if (restart || !lesson || !rec) return 0;
    const firstUnseen = lesson.steps.findIndex((s) => !rec.stepsSeen.includes(s.id));
    return firstUnseen === -1 ? 0 : firstUnseen;
  });
  const [refresherId, setRefresherId] = useState<string | null>(null);

  useEffect(() => { window.scrollTo?.({ top: 0 }); }, [stage, stepIdx]);

  // Having started afresh, remember it and drop the one-shot router state so a refresh resumes normally.
  useEffect(() => {
    if (!restart || !lesson) return;
    setLastStage(lesson.id, 'understand');
    navigate(location.pathname + location.search, { replace: true, state: null });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openRefresher = useCallback((id: string) => setRefresherId(id), []);
  if (!lesson) {
    return (
      <div className="min-h-screen bg-background text-on-surface"><GlobalHeader />
        <main className="max-w-3xl mx-auto p-6 space-y-3"><h1 className="text-2xl font-black text-white">Lesson not found</h1>
          <Link className="text-amber-400 underline" to={chapter.routes.landing}>Back to {chapter.title}</Link></main></div>
    );
  }

  const unit = chapter.units.find((u) => u.id === lesson.unitId);
  const status = lessonStatus(lesson, rec);
  const refresher = refresherId ? findRefresher(chapter, refresherId) : undefined;
  const lessonRefresher = refresherId && !refresher ? findLessonStep(chapter, refresherId) : undefined;
  const lessonIds = chapter.units.flatMap((u) => u.lessonIds);
  const next = lessonIds[lessonIds.indexOf(lesson.id) + 1];
  const step = lesson.steps[stepIdx];
  const recs = reviewRecommendations(lesson, rec);
  const stageIdx = STAGES.findIndex((s) => s.id === stage);
  const goStage = (i: number) => setStage(STAGES[Math.max(0, Math.min(STAGES.length - 1, i))].id);

  return (
    <VisualRegistryProvider value={registry}>
      <JudgeProvider value={judges}>
      <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid" data-lesson={lesson.id}>
        <GlobalHeader />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-6 space-y-5">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
            <Link to={subjectCrumb(chapter).href} className="hover:text-amber-400">{subjectCrumb(chapter).label}</Link><span>/</span>
            <Link to={chapter.routes.landing} className="hover:text-amber-400">{crumb}</Link><span>/</span>
            <span className="text-amber-400 font-bold">Lesson {lesson.number}</span>
          </nav>

          <header className="rounded-2xl border border-surface-border/80 bg-gradient-to-br from-surface-card via-surface-card to-surface-lowest p-5 space-y-3 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              {unit && (
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary font-bold">
                  Unit {unit.number}: {unit.title}
                </span>
              )}
              <span
                data-testid="lesson-status"
                data-status={status}
                className="text-[11px] font-mono px-2.5 py-1 rounded-full border border-surface-border bg-surface-lowest text-slate-200 font-semibold"
              >
                {STATUS_LABEL[status]}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white">Lesson {lesson.number}: {lesson.title}</h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-3xl leading-relaxed">
              <strong className="text-white font-mono">Learning Objective: </strong>{lesson.objective}
            </p>
          </header>

          {lesson.prerequisiteIds.length > 0 && (
            <details className="rounded-xl border border-surface-border bg-surface-card px-4 py-3" data-testid="lesson-prereqs">
              <summary className="cursor-pointer min-h-[44px] flex items-center justify-between text-xs sm:text-sm text-slate-200 font-medium hover:text-white transition-colors">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-amber-400">psychology</span>
                  Ideas this lesson uses: {lesson.prerequisiteIds.map((id) => chapter.prerequisites[id]?.title).filter(Boolean).join(' · ')}{lesson.prerequisiteIds.some((id) => readiness[id]?.status === 'needs_review') ? ' (review suggested)' : ''}
                </span>
                <span className="material-symbols-outlined text-[16px] text-slate-400">expand_more</span>
              </summary>
              <div className="grid gap-3 mt-3 pt-3 border-t border-surface-border/60 lg:grid-cols-2">
                {lesson.prerequisiteIds.map((id) => chapter.prerequisites[id] && <PrerequisiteCard key={id} prereq={chapter.prerequisites[id]} />)}
              </div>
            </details>
          )}

          <nav aria-label="Lesson stages" className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {STAGES.map((s) => (
              <button
                key={s.id}
                type="button"
                aria-current={stage === s.id ? 'step' : undefined}
                data-stage={s.id}
                onClick={() => setStage(s.id)}
                className={`shrink-0 min-h-[48px] px-4 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors touch-manipulation ${
                  stage === s.id
                    ? 'border-primary bg-primary/15 text-white shadow-xs font-bold'
                    : 'border-surface-border bg-surface-card text-slate-300 hover:text-white hover:border-slate-400'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </nav>

          {refresher && (
            <div className="space-y-2" data-testid="refresher-panel">
              <PrerequisiteCard prereq={refresher} defaultOpen focusStepId={refresherId ?? undefined} />
              <button type="button" className="min-h-[44px] px-4 rounded-xl border border-surface-border text-sm text-slate-200" onClick={() => setRefresherId(null)}>Close refresher</button>
            </div>
          )}

          {lessonRefresher && (
            <div className="space-y-2" data-testid="refresher-panel">
              <ConceptExplainer step={lessonRefresher.step} />
              <div className="flex flex-wrap gap-2">
                {lessonRefresher.lesson.id !== lesson.id && <Link className="min-h-[44px] px-4 rounded-xl border border-cyan-400 text-cyan-200 text-sm inline-flex items-center" to={chapter.routes.learn(lessonRefresher.lesson.id)}>Open Lesson {lessonRefresher.lesson.number}: {lessonRefresher.lesson.title}</Link>}
                <button type="button" className="min-h-[44px] px-4 rounded-xl border border-surface-border text-sm text-slate-200" onClick={() => setRefresherId(null)}>Close refresher</button>
              </div>
            </div>
          )}

          {stage === 'understand' && (
            <div className="space-y-4">
              <p className="text-xs font-mono text-slate-400" aria-live="polite">Idea {stepIdx + 1} of {lesson.steps.length}</p>
              <ConceptExplainer key={step.id} step={step} lessonId={lesson.id} onRefresher={openRefresher} />
              {lesson.investigation && stepIdx === lesson.steps.length - 1 && (
                <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-2">
                  <h3 className="font-bold text-white">{lesson.investigation.title}</h3>
                  <p className="text-sm text-slate-300">{lesson.investigation.description}</p>
                  <button type="button" className="min-h-[48px] px-5 rounded-xl border border-cyan-400 text-cyan-200 font-bold text-sm hover:bg-cyan-500/10" onClick={() => { markInvestigated(lesson.id); navigate(lesson.investigation!.href); }}>{lesson.investigation.buttonLabel}</button>
                </div>
              )}
              <div className="flex justify-between gap-2">
                <button type="button" className="min-h-[48px] px-4 rounded-xl border border-surface-border text-slate-200 text-sm disabled:opacity-40" disabled={stepIdx === 0} onClick={() => setStepIdx((i) => i - 1)}>Previous</button>
                {stepIdx < lesson.steps.length - 1
                  ? <button type="button" className="min-h-[48px] px-5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm" onClick={() => setStepIdx((i) => i + 1)}>Next idea</button>
                  : <button type="button" className="min-h-[48px] px-5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm" onClick={() => goStage(stageIdx + 1)}>See a worked example</button>}
              </div>
            </div>
          )}

          {stage === 'worked' && (
            <div className="space-y-4">
              <WorkedExample key={lesson.id} example={lesson.worked} lessonId={lesson.id} />
              <button type="button" className="min-h-[48px] px-5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm" onClick={() => goStage(stageIdx + 1)}>Try it with guidance</button>
            </div>
          )}

          {stage === 'guided' && (
            <div className="space-y-4">
              <GuidedPractice item={lesson.guided} lessonId={lesson.id} onRefresher={openRefresher} />
              <button type="button" className="min-h-[48px] px-5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm" onClick={() => goStage(stageIdx + 1)}>On to your turn</button>
            </div>
          )}

          {stage === 'independent' && (
            <div className="space-y-4">
              <IndependentPractice items={lesson.independent} lessonId={lesson.id} onRefresher={openRefresher} />
              <button type="button" className="min-h-[48px] px-5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm" onClick={() => goStage(stageIdx + 1)}>Reflect</button>
            </div>
          )}

          {stage === 'reflect' && (
            <div className="space-y-4">
              <LearningReflection reflection={lesson.reflection} lessonId={lesson.id} onRefresher={openRefresher} />
              {objectiveCoverage(lesson, rec).some((o) => !o.covered) && (
                <div className="rounded-xl border border-surface-border bg-surface-card p-4 text-sm text-slate-200 space-y-1" data-testid="objective-gaps">
                  <strong className="text-white">Mastery needs each goal shown on its own, first try, no help:</strong>
                  <ul className="list-disc pl-5">{objectiveCoverage(lesson, rec).map((o) => <li key={o.id} data-covered={o.covered}>{o.covered ? '\u2713 ' : '\u25CB '}{o.label}</li>)}</ul>
                </div>
              )}
              {recs.length > 0 && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-sm text-amber-100 space-y-1" data-testid="review-recs">
                  <strong>Worth revisiting:</strong>
                  <ul className="list-disc pl-5">{recs.map((r) => <li key={r.topic}>{r.topic}</li>)}</ul>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {next && <Link className="min-h-[48px] px-5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm inline-flex items-center" to={chapter.routes.learn(next)} state={{ restart: true }}>Next lesson</Link>}
                <Link className="min-h-[48px] px-4 rounded-xl border border-surface-border text-slate-200 text-sm inline-flex items-center" to={chapter.routes.landing}>Chapter overview</Link>
                <Link className="min-h-[48px] px-4 rounded-xl border border-surface-border text-slate-200 text-sm inline-flex items-center" to={chapter.routes.lab}>Free laboratory</Link>
                {chapter.routes.practice && <Link className="min-h-[48px] px-4 rounded-xl border border-surface-border text-slate-200 text-sm inline-flex items-center" to={chapter.routes.practice}>Chapter practice</Link>}
              </div>
            </div>
          )}

          <footer className="pt-4 border-t border-surface-border flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <label className="inline-flex items-center gap-2 min-h-[44px] cursor-pointer">
              <input type="checkbox" className="w-5 h-5" checked={teacherMode} onChange={(e) => setTeacherMode(e.target.checked)} />
              Teacher demonstration mode
            </label>
            <span>{teacherMode ? 'On: this lesson will be marked "Demonstrated" and nothing counts as a student’s independent work.' : 'Off: answers count as your own work.'}</span>
          </footer>
        </main>
      </div>
      </JudgeProvider>
    </VisualRegistryProvider>
  );
};

/**
 * Moving to another lesson keeps this page mounted (same route, new `:lessonId`), so the stage, the step and the open refresher
 * would carry over from the lesson just finished (the next lesson opened on Reflect). Keying by lesson starts each one fresh.
 */
export const LearnLessonPage: React.FC<LearnLessonProps> = (props) => <LearnLesson key={props.lessonId} {...props} />;
