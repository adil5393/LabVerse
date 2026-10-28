/**
 * Page factory for chapters built on the shared framework. A chapter module calls `makeChapterPages(chapter, registry, options)`
 * and exports the result; App.tsx lazy-loads those components, so each chapter stays in its own bundle.
 *
 *   Hub         /<subject>/<chapter>
 *   Learn       /<subject>/<chapter>/learn/:lessonId
 *   Practice    /<subject>/<chapter>/practice      (when the chapter has a practice bank)
 *   Assessment  /<subject>/<chapter>/assessment    (when the chapter has an assessment)
 */

import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { GlobalHeader } from '../../components/GlobalHeader';
import { subjectCrumb } from '../../engine/education/subjects';
import type { EduChapter, JudgeRegistry } from '../../engine/education/types';
import { useEducationStore } from '../../store/useEducationStore';
import { ChapterHub, type ChapterLabLink } from './ChapterHub';
import { LearnLessonPage } from './LearnLessonPage';
import { ChapterAssessmentView, ChapterPracticeSet } from './ChapterAssessment';
import { JudgeProvider } from './judges';
import { VisualRegistryProvider, type VisualRegistry } from './visuals';
import { NarrationEnabledProvider } from '../narration/NarrationRegion';

export interface ChapterPageOptions {
  crumb: string;
  subtitle: string;
  labs: ChapterLabLink[];
  judges?: JudgeRegistry;
  /** A small decorative illustration beside the chapter title on the hub. */
  illustration?: React.ReactNode;
}

export const TeacherModeToggle: React.FC = () => {
  const teacherMode = useEducationStore((s) => s.teacherMode);
  const setTeacherMode = useEducationStore((s) => s.setTeacherMode);
  return (
    <label className="inline-flex items-center gap-2 min-h-[44px] cursor-pointer text-xs text-slate-400">
      <input type="checkbox" className="w-5 h-5" checked={teacherMode} onChange={(e) => setTeacherMode(e.target.checked)} />
      Teacher demonstration mode {teacherMode ? '(on: nothing here counts as a student’s own work)' : ''}
    </label>
  );
};

const Frame: React.FC<{ chapter: EduChapter; crumb: string; title: string; registry: VisualRegistry; judges?: JudgeRegistry; children: React.ReactNode }> = ({ chapter, crumb, title, registry, judges = {}, children }) => (
  <VisualRegistryProvider value={registry}>
    <JudgeProvider value={judges}>
      <NarrationEnabledProvider enabled>
        <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid" data-chapter-page={chapter.id}>
          <GlobalHeader />
          <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 space-y-5">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
              <Link to={subjectCrumb(chapter).href} className="inline-flex items-center min-h-[44px] hover:text-amber-400">{subjectCrumb(chapter).label}</Link><span>/</span>
              <Link to={chapter.routes.landing} className="inline-flex items-center min-h-[44px] hover:text-amber-400">{crumb}</Link><span>/</span>
              <span className="text-amber-400 font-bold">{title}</span>
            </nav>
            <h1 className="text-2xl md:text-3xl font-black text-white">{title}</h1>
            {children}
            <footer className="pt-4 border-t border-surface-border"><TeacherModeToggle /></footer>
          </main>
        </div>
      </NarrationEnabledProvider>
    </JudgeProvider>
  </VisualRegistryProvider>
);

export function makeChapterPages(chapter: EduChapter, registry: VisualRegistry, opts: ChapterPageOptions) {
  const first = opts.labs[0];
  const Hub: React.FC = () => (
    <ChapterHub chapter={chapter} registry={registry} judges={opts.judges} crumb={opts.crumb} subtitle={opts.subtitle}
      labLabel={first?.label ?? 'Laboratory'} labBlurb={first?.blurb ?? ''} labs={opts.labs} illustration={opts.illustration} />
  );
  const Learn: React.FC = () => {
    const { lessonId = '' } = useParams();
    return <LearnLessonPage chapter={chapter} registry={registry} judges={opts.judges} lessonId={lessonId} crumb={opts.crumb} />;
  };
  const Practice: React.FC = () => (
    <Frame chapter={chapter} crumb={opts.crumb} title="Chapter practice" registry={registry} judges={opts.judges}>
      {chapter.practice ? <ChapterPracticeSet chapter={chapter} set={chapter.practice} /> : <p className="text-slate-300">This chapter has no practice bank yet.</p>}
    </Frame>
  );
  const Assessment: React.FC = () => (
    <Frame chapter={chapter} crumb={opts.crumb} title="Chapter assessment" registry={registry} judges={opts.judges}>
      {chapter.assessment ? <ChapterAssessmentView chapter={chapter} assessment={chapter.assessment} /> : <p className="text-slate-300">This chapter has no assessment yet.</p>}
    </Frame>
  );
  return { Hub, Learn, Practice, Assessment };
}
