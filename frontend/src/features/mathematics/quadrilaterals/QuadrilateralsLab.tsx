/**
 * Quadrilaterals Laboratory Module Landing Page (Milestone M3)
 * NCERT Ganita Manjari Part II, Chapter 12: Quadrilaterals
 *
 * Implements the student-centric chapter hub:
 * 1. Primary Action: Start / Continue Learning (Next recommended lesson, title, objective, progress bar)
 * 2. Secondary Action: Free Laboratory (Unrestricted 14-experiment workbench access)
 * 3. Secondary Action: Chapter Practice (Independent NCERT Practice Engine access)
 * 4. Structured Curriculum Roadmap: 7 Units, 13 Core Lessons in recommended order
 * 5. Direct lesson jumping without compulsory prerequisite gates
 * 6. Local progress persistence with reset capability
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GlobalHeader } from '../../../components/GlobalHeader';
import { useQuadGuidedLearningStore } from '../../../store/useQuadGuidedLearningStore';
import {
  QUAD_GUIDED_UNITS,
  QUAD_GUIDED_LESSONS,
} from '../../../engine/mathematics/quadrilaterals/curriculumPath';
import { QUADRILATERAL_EXPERIMENTS } from '../../../engine/mathematics/quadrilaterals/quadrilateralExperiments';

export const QuadrilateralsLab: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'guided' | 'experiments'>('guided');
  const [confirmReset, setConfirmReset] = useState(false);

  const {
    getCompletionStats,
    isLessonCompleted,
    isLessonMastered,
    lessons,
    resetProgress,
    selectLesson,
  } = useQuadGuidedLearningStore();

  const stats = getCompletionStats();
  const nextLesson =
    QUAD_GUIDED_LESSONS[stats.nextRecommendedLessonId] ||
    QUAD_GUIDED_LESSONS['quad-l1'];

  const handleStartContinue = () => {
    selectLesson(nextLesson.id, 'understand');
    navigate(`/mathematics/quadrilaterals/workbench?lesson=${nextLesson.id}`);
  };

  const handleOpenLesson = (lessonId: string) => {
    selectLesson(lessonId, 'understand');
    navigate(`/mathematics/quadrilaterals/workbench?lesson=${lessonId}`);
  };

  const handleReset = () => {
    resetProgress();
    setConfirmReset(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid select-none font-sans">
      <GlobalHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-10">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Link to="/" className="hover:text-amber-400 transition-colors">
              Subject Explorer
            </Link>
            <span>/</span>
            <Link to="/mathematics" className="hover:text-amber-400 transition-colors">
              Mathematics
            </Link>
            <span>/</span>
            <span className="text-amber-400 font-bold">Class 9 Quadrilaterals</span>
          </div>

          {/* Reset Progress Button */}
          <div>
            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="text-xs font-mono text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-border hover:border-red-500/30"
              >
                <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                <span>Reset Chapter Progress</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-red-950/40 border border-red-500/40 px-3 py-1.5 rounded-lg text-xs">
                <span className="text-red-300">Reset all progress?</span>
                <button
                  onClick={handleReset}
                  className="px-2 py-0.5 rounded bg-red-500 hover:bg-red-400 text-slate-950 font-bold font-mono"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-2 py-0.5 rounded bg-surface-elevated hover:bg-surface-border text-slate-300 font-mono"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Hero Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
              NCERT Ganita Manjari Part II • Class 9
            </span>
            <span className="text-xs font-mono text-slate-400">Chapter 12: Quadrilaterals</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
            Quadrilaterals Laboratory
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-3xl leading-relaxed">
            Master the properties of parallelograms, the Midpoint Theorem, triangle medians and centroids,
            Varignon parallelograms, and plane tiling through guided step-by-step discovery, dynamic geometric
            transformations, and rigorous Euclidean deductions.
          </p>
        </div>

        {/* ========================================================= */}
        {/* THREE PRIMARY ACTION CARDS */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 1. START / CONTINUE LEARNING (Primary Hero CTA) */}
          <div className="lg:col-span-6 p-7 rounded-3xl bg-gradient-to-br from-amber-950/40 via-surface-card to-surface-lowest border-2 border-amber-500/40 shadow-2xl relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-15 transition-opacity pointer-events-none">
              <span className="material-symbols-outlined text-[160px] text-amber-400">school</span>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">auto_stories</span>
                  <span>Guided Learning Path</span>
                </span>
                <span className="text-xs font-mono text-amber-400 font-bold">
                  {stats.completedCount} / {stats.totalCount} Lessons ({stats.percentage}%)
                </span>
              </div>

              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-mono">
                  {stats.completedCount > 0 ? 'Next Recommended Lesson' : 'Start Here (Beginner)'}
                </div>
                <h2 className="text-2xl font-black text-white mt-1 group-hover:text-amber-400 transition-colors">
                  Lesson {nextLesson.lessonNumber}: {nextLesson.title}
                </h2>
                <div className="text-xs text-amber-300/80 font-medium mt-0.5">{nextLesson.subtitle}</div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                {nextLesson.learningObjective}
              </p>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Chapter Progress</span>
                  <span>{stats.percentage}% Complete</span>
                </div>
                <div className="h-2 w-full bg-surface-lowest rounded-full overflow-hidden border border-surface-border">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(stats.percentage, 4)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 relative z-10">
              <button
                onClick={handleStartContinue}
                className="w-full py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.01]"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {stats.completedCount > 0 ? 'play_arrow' : 'rocket_launch'}
                </span>
                <span>
                  {stats.completedCount > 0
                    ? `Continue Lesson ${nextLesson.lessonNumber}`
                    : 'Start Learning: Lesson 1'}
                </span>
              </button>
            </div>
          </div>

          {/* 2. FREE LABORATORY */}
          <div className="lg:col-span-3 p-6 rounded-3xl bg-surface-card border border-surface-border hover:border-cyan-500/40 transition-all flex flex-col justify-between shadow-xl group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">architecture</span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  Open Workbench
                </span>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                  Free Laboratory
                </h3>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Unrestricted exploration with 14 interactive quadrilateral experiments and complete geometric construction tools.
              </p>
            </div>

            <div className="pt-6">
              <Link
                to="/mathematics/quadrilaterals/workbench?mode=explore"
                className="w-full py-2.5 px-4 rounded-xl bg-surface-elevated hover:bg-cyan-500 hover:text-slate-950 text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-2 border border-surface-border hover:border-cyan-500"
              >
                <span>Open Free Workbench</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* 3. CHAPTER PRACTICE */}
          <div className="lg:col-span-3 p-6 rounded-3xl bg-surface-card border border-surface-border hover:border-emerald-500/40 transition-all flex flex-col justify-between shadow-xl group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">quiz</span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  Practice Engine
                </span>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                  Chapter Practice
                </h3>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Tackle comprehensive NCERT examination questions across Basic, Standard, and Challenge difficulty tiers with instant validation.
              </p>
            </div>

            <div className="pt-6">
              <Link
                to="/mathematics/quadrilaterals/workbench?mode=practice"
                className="w-full py-2.5 px-4 rounded-xl bg-surface-elevated hover:bg-emerald-500 hover:text-slate-950 text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-2 border border-surface-border hover:border-emerald-500"
              >
                <span>Launch Practice Engine</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* VIEW TOGGLE: GUIDED ROADMAP vs EXPERIMENTS CATALOG */}
        {/* ========================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border/60 pb-4">
          <div className="flex items-center gap-2 bg-surface-card p-1 rounded-2xl border border-surface-border w-fit">
            <button
              onClick={() => setActiveTab('guided')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'guided'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">route</span>
              <span>Guided Chapter Curriculum (Recommended)</span>
            </button>
            <button
              onClick={() => setActiveTab('experiments')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'experiments'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
              <span>All 14 Experiments Catalog</span>
            </button>
          </div>

          <div className="text-xs font-mono text-slate-400">
            {activeTab === 'guided'
              ? 'Students may jump to any lesson. No compulsory prerequisite gates.'
              : 'Unrestricted laboratory exploration for teachers and students.'}
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: GUIDED CHAPTER ROADMAP */}
        {/* ========================================================= */}
        {activeTab === 'guided' && (
          <div className="space-y-10">
            {QUAD_GUIDED_UNITS.map((unit) => {
              const unitLessons = unit.lessonIds
                .map((id) => QUAD_GUIDED_LESSONS[id])
                .filter(Boolean);

              return (
                <div key={unit.id} className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-surface-border/40 pb-3 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-white">{unit.title}</h2>
                        <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          {unit.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{unit.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {unitLessons.map((lesson) => {
                      const completed = isLessonCompleted(lesson.id);
                      const mastered = isLessonMastered(lesson.id);
                      const progress = lessons[lesson.id];
                      const isNext = lesson.id === nextLesson.id;

                      return (
                        <div
                          key={lesson.id}
                          className={`p-5 rounded-2xl bg-surface-card border transition-all flex flex-col justify-between group shadow-lg ${
                            isNext
                              ? 'border-amber-500/60 ring-1 ring-amber-500/40 bg-surface-card/90'
                              : completed
                              ? 'border-emerald-500/30 hover:border-emerald-500/60'
                              : 'border-surface-border hover:border-amber-500/40'
                          }`}
                        >
                          <div className="space-y-3">
                            {/* Header Tags */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-surface-elevated text-slate-300">
                                Lesson {lesson.lessonNumber}
                              </span>

                              {mastered ? (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[13px]">stars</span>
                                  <span>Mastered</span>
                                </span>
                              ) : completed ? (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[13px]">check_circle</span>
                                  <span>Completed</span>
                                </span>
                              ) : isNext ? (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                                  Next Up
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono text-slate-500">
                                  Ready to Start
                                </span>
                              )}
                            </div>

                            {/* Title & Subtitle */}
                            <div>
                              <h3 className="font-bold text-base text-white group-hover:text-amber-400 transition-colors">
                                {lesson.title}
                              </h3>
                              <div className="text-xs text-amber-400/80 font-medium">{lesson.subtitle}</div>
                            </div>

                            {/* Objective */}
                            <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                              {lesson.learningObjective}
                            </p>
                          </div>

                          {/* Footer & Action */}
                          <div className="pt-4 mt-4 border-t border-surface-border/60 flex items-center justify-between">
                            <span className="text-[10px] font-mono text-slate-500">
                              {progress?.practiceAttempted ? (
                                <span>
                                  Practice: {progress.practiceCorrectCount}/{progress.practiceTotalQuestions}
                                </span>
                              ) : (
                                <span>{lesson.practiceQuestionIds.length} Practice Qs</span>
                              )}
                            </span>

                            <button
                              onClick={() => handleOpenLesson(lesson.id)}
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                isNext
                                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                                  : 'bg-surface-elevated hover:bg-amber-500 hover:text-slate-950 text-slate-200'
                              }`}
                            >
                              <span>{completed ? 'Review' : 'Start'}</span>
                              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: FREE EXPERIMENTS CATALOG */}
        {/* ========================================================= */}
        {activeTab === 'experiments' && (
          <div className="space-y-10">
            {[
              {
                key: 'understanding',
                title: 'Unit 1: Understanding Quadrilaterals',
                badge: '1 Experiment',
                description: 'Anatomy of quadrilaterals, convex vs concave, and 360° interior angle sum',
                filter: (exp: typeof QUADRILATERAL_EXPERIMENTS[0]) =>
                  exp.curriculumCategory === 'understanding',
              },
              {
                key: 'parallelograms',
                title: 'Unit 2: Parallelograms & Invariants',
                badge: '3 Experiments',
                description: 'Opposite side and angle equalities, diagonal bisections, and converse conditions',
                filter: (exp: typeof QUADRILATERAL_EXPERIMENTS[0]) =>
                  exp.curriculumCategory === 'parallelograms',
              },
              {
                key: 'midpoint_theorem',
                title: 'Unit 3: The Midpoint Theorem',
                badge: '3 Experiments',
                description: 'Side midpoints, medial triangles, DE || BC and DE = 1/2 BC, and converse theorem',
                filter: (exp: typeof QUADRILATERAL_EXPERIMENTS[0]) =>
                  exp.curriculumCategory === 'midpoint_theorem',
              },
              {
                key: 'medians_centroid',
                title: 'Unit 4: Medians and Centroid',
                badge: '2 Experiments',
                description: 'Concurrency of the three medians and the universal 2:1 division ratio',
                filter: (exp: typeof QUADRILATERAL_EXPERIMENTS[0]) =>
                  exp.curriculumCategory === 'medians_centroid',
              },
              {
                key: 'varignon',
                title: 'Unit 5: Varignon Parallelogram',
                badge: '1 Experiment',
                description: 'Midpoints of any simple quadrilateral form a parallelogram with Area = 1/2 Area(ABCD)',
                filter: (exp: typeof QUADRILATERAL_EXPERIMENTS[0]) =>
                  exp.curriculumCategory === 'varignon',
              },
              {
                key: 'tiling',
                title: 'Unit 6: Tiling the Plane',
                badge: '1 Experiment',
                description: 'Periodic monohedral tessellation via 180° rotations & lattice vectors',
                filter: (exp: typeof QUADRILATERAL_EXPERIMENTS[0]) =>
                  exp.curriculumCategory === 'tiling',
              },
              {
                key: 'revision',
                title: 'Unit 7: Synthesis & Practice',
                badge: '2 Experiments',
                description: 'Formal Euclidean deduction steps and comprehensive NCERT practice question bank',
                filter: (exp: typeof QUADRILATERAL_EXPERIMENTS[0]) =>
                  exp.curriculumCategory === 'revision',
              },
            ].map((unit) => {
              const unitExperiments = QUADRILATERAL_EXPERIMENTS.filter(unit.filter);
              return (
                <div key={unit.key} className="space-y-4">
                  <div className="flex justify-between items-end border-b border-surface-border/60 pb-3">
                    <div>
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span>{unit.title}</span>
                        <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                          {unit.badge}
                        </span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">{unit.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {unitExperiments.map((exp) => (
                      <div
                        key={exp.id}
                        className="p-5 rounded-2xl bg-surface-card border border-surface-border hover:border-cyan-500/50 transition-all flex flex-col justify-between group shadow-lg"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <span className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                              <span className="material-symbols-outlined text-[20px]">crop_square</span>
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
                              Direct Chapter
                            </span>
                          </div>

                          <div>
                            <h3 className="font-bold text-base text-white group-hover:text-cyan-400 transition-colors">
                              {exp.title}
                            </h3>
                            <div className="text-xs text-cyan-400/80 font-medium">{exp.subtitle}</div>
                          </div>

                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                            {exp.description}
                          </p>
                        </div>

                        <div className="pt-4 mt-4 border-t border-surface-border/60 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-500">
                            {exp.theorems.length} Theorem{exp.theorems.length > 1 ? 's' : ''} • {exp.practiceQuestions.length} Practice
                          </span>

                          <Link
                            to={`/mathematics/quadrilaterals/workbench?exp=${exp.id}&mode=explore`}
                            className="px-3.5 py-1.5 rounded-lg bg-surface-elevated group-hover:bg-cyan-500 group-hover:text-slate-950 text-slate-200 text-xs font-bold transition-all flex items-center gap-1"
                          >
                            <span>Launch</span>
                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
