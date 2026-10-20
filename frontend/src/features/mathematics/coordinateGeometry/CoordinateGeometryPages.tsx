import React from 'react';
import { useParams } from 'react-router-dom';
import { GlobalHeader } from '../../../components/GlobalHeader';
import { COORDINATE_GEOMETRY as CHAPTER } from '../../../engine/mathematics/coordinateGeometry/content';
import { ChapterHub } from '../../education/ChapterHub';
import { LearnLessonPage } from '../../education/LearnLessonPage';
import { IndependentPractice } from '../../education/LessonParts';
import { VisualRegistryProvider } from '../../education/visuals';
import { CG_VISUALS } from './visuals';
import { ChapterWorkspaceNav } from '../../workspace';

const CRUMB = 'Class 9 Coordinate Geometry';

export const CoordinateGeometryLab: React.FC = () => (
  <ChapterHub
    chapter={CHAPTER}
    registry={CG_VISUALS}
    crumb={CRUMB}
    subtitle="Describe where anything is with two numbers. Learn the plane, the quadrants, distance and the midpoint step by step, or go straight to the laboratory."
    labLabel="Distance laboratory"
    labBlurb="Place points freely and see differences, the right triangle and the distance update live."
  />
);

export const CoordinateGeometryLearnPage: React.FC = () => {
  const { lessonId = '' } = useParams();
  return <LearnLessonPage chapter={CHAPTER} registry={CG_VISUALS} lessonId={lessonId} crumb={CRUMB} />;
};

/** Mixed independent problems from every lesson, in any order. Evidence is recorded against each lesson. */
export const CoordinateGeometryPracticePage: React.FC = () => (
  <VisualRegistryProvider value={CG_VISUALS}>
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid">
      <GlobalHeader />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-6 py-6 space-y-6">
        <ChapterWorkspaceNav
          chapterId="coordinate-geometry"
          currentPageTitle="Chapter Practice"
          currentMode="practice"
          showBackToLab={true}
        />
        <h1 className="text-3xl font-black text-white">Chapter practice</h1>
        <p className="text-sm text-slate-300">Try any problems in any order. Each one counts toward the lesson it belongs to, and the same honest rules apply: independent success means the first try with no hints or solutions.</p>
        {CHAPTER.units.map((u) => (
          <section key={u.id} className="space-y-4" aria-label={u.title}>
            <h2 className="text-xl font-black text-white">Unit {u.number}: {u.title}</h2>
            {u.lessonIds.map((id) => (
              <details key={id} className="rounded-2xl border border-surface-border bg-surface-card/60 p-2">
                <summary className="cursor-pointer min-h-[48px] flex items-center px-3 font-bold text-white">Lesson {CHAPTER.lessons[id].number}: {CHAPTER.lessons[id].title}</summary>
                <div className="p-2"><IndependentPractice items={CHAPTER.lessons[id].independent} lessonId={id} /></div>
              </details>
            ))}
          </section>
        ))}
      </main>
    </div>
  </VisualRegistryProvider>
);
