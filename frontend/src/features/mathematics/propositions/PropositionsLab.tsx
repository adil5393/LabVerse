/**
 * Propositions and Their Converses Landing Page (Milestone M4)
 * Class 9 NCERT Ganita Manjari
 *
 * Implements the 3-entry student journey:
 * 1. Start / Continue Learning
 * 2. Free Reasoning Laboratory
 * 3. Chapter Practice
 * With 6-Unit, 12-Lesson non-linear curriculum roadmap and local progress persistence.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GlobalHeader } from '../../../components/GlobalHeader';
import { usePropositionsStore } from '../../../store/usePropositionsStore';
import {
  PROP_GUIDED_UNITS,
  PROP_GUIDED_LESSONS,
} from '../../../engine/mathematics/propositions/curriculumPath';
import { PROPOSITION_EXPERIMENTS } from '../../../engine/mathematics/propositions/experimentRegistry';
import { PropositionsLearnSection } from './learn/PropositionsLearn';
import { isLessonPracticeMastered } from '../../../engine/mathematics/propositions/progressRules';
import { PROPOSITIONS_CHAPTER } from '../../../engine/mathematics/propositions/learn/content';
import { lessonStatus, STATUS_LABEL } from '../../../engine/education/progress';
import { useEducationStore } from '../../../store/useEducationStore';

export const PropositionsLab: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'guided' | 'experiments'>('guided');
  const [confirmReset, setConfirmReset] = useState(false);

  const {
    getCompletionStats,
    lessons,
    resetProgress,
    selectLesson,
  } = usePropositionsStore();

  const learnRecords = useEducationStore((st) => st.lessons);
  const practiceEvidence = usePropositionsStore((st) => st.practiceEvidence);
  const masteredByEvidence = (id: string) => isLessonPracticeMastered(PROP_GUIDED_LESSONS[id]?.practiceQuestionIds ?? [], practiceEvidence);
  const stats = getCompletionStats();
  const nextLesson =
    PROP_GUIDED_LESSONS[stats.nextRecommendedLessonId] ||
    PROP_GUIDED_LESSONS['prop-l1'];

  const handleStartContinue = () => {
    selectLesson(nextLesson.id, 'understand');
    navigate(`/mathematics/propositions/workbench?lesson=${nextLesson.id}`);
  };

  const handleOpenLesson = (lessonId: string) => {
    selectLesson(lessonId, 'understand');
    navigate(`/mathematics/propositions/workbench?lesson=${lessonId}`);
  };

  const handleReset = () => {
    resetProgress();
    setConfirmReset(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid select-none font-sans">
      <GlobalHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-10">
        {/* Breadcrumb & Top Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Link to="/" className="inline-flex items-center min-h-[44px] hover:text-purple-400 transition-colors">
              Subject Explorer
            </Link>
            <span>/</span>
            <Link to="/mathematics" className="inline-flex items-center min-h-[44px] hover:text-purple-400 transition-colors">
              Mathematics
            </Link>
            <span>/</span>
            <span className="text-purple-400 font-bold">Propositions & Converses</span>
          </div>

          {/* Reset Progress Button */}
          <div>
            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="text-xs font-mono text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1.5 min-h-[44px] px-3 py-1.5 rounded-lg border border-surface-border hover:border-red-500/30"
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
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">
              Class 9 NCERT Ganita Manjari
            </span>
            <span className="text-xs font-mono text-slate-500">
              Milestone M4 • Mathematical Reasoning & Proof
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Propositions and Their Converses
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-3xl leading-relaxed">
            Master the art of mathematical reasoning: examine declarative propositions, deconstruct
            hypotheses and conclusions, investigate converses across all four truth quadrants,
            discover counterexamples, and construct valid deductive proofs.
          </p>
        </div>

        {/* 3 Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Start / Continue Learning */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-surface-card to-purple-950/20 border border-purple-500/40 shadow-xl flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
                  Guided Investigation
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                  {stats.completionPercentage}% worked through
                </span>
              </div>

              <h3 className="text-lg font-bold text-white leading-snug">
                {nextLesson.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                {nextLesson.learningObjective}
              </p>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-surface-lowest rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-300"
                  style={{ width: `${stats.completionPercentage}%` }}
                />
              </div>
            </div>

            <button
              onClick={handleStartContinue}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 transition-all"
            >
              <span>{stats.completedLessonsCount > 0 ? 'Continue Investigating' : 'Start Investigating: Lesson 1'}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          {/* Card 2: Free Reasoning Laboratory */}
          <div className="p-6 rounded-2xl bg-surface-card border border-surface-border shadow-lg flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                  Free Reasoning Lab
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                  5 Workbenches
                </span>
              </div>

              <h3 className="text-lg font-bold text-white leading-snug">
                Independent Reasoning Studio
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Direct access to Statement Explorer, Counterexample Lab, Number Property Lab,
                Geometry Invariants, and Deductive Proof Builder without guided step gates.
              </p>
            </div>

            <Link
              to="/mathematics/propositions/workbench"
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-surface-elevated hover:bg-slate-700 text-slate-200 font-mono font-bold text-xs flex items-center justify-center gap-2 border border-surface-border transition-all"
            >
              <span>Open Free Laboratory</span>
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </Link>
          </div>

          {/* Card 3: Chapter Practice Engine */}
          <div className="p-6 rounded-2xl bg-surface-card border border-surface-border shadow-lg flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Chapter Practice
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                  33 Questions
                </span>
              </div>

              <h3 className="text-lg font-bold text-white leading-snug">
                Practice Bank
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Self-paced assessment across Basic, Standard, and Challenge difficulty tiers with
                progressive hints, immediate validation, and worked deductive solutions.
              </p>
            </div>

            <Link
              to="/mathematics/propositions/workbench?mode=practice"
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-surface-elevated hover:bg-slate-700 text-slate-200 font-mono font-bold text-xs flex items-center justify-center gap-2 border border-surface-border transition-all"
            >
              <span>Start Practice Bank</span>
              <span className="material-symbols-outlined text-[16px]">fitness_center</span>
            </Link>
          </div>
        </div>

        {/* Learn: explanations, worked examples, guided and independent practice */}
        <PropositionsLearnSection />

        {/* Tab Switcher: Guided Curriculum vs Canonical Experiments */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-surface-border pb-3">
            <button
              onClick={() => setActiveTab('guided')}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                activeTab === 'guided'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">menu_book</span>
              <span>Investigate in the workbench (12 lessons)</span>
            </button>

            <button
              onClick={() => setActiveTab('experiments')}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                activeTab === 'experiments'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">science</span>
              <span>Canonical Experiments (12 Units)</span>
            </button>
          </div>

          {/* TAB 1: Guided Curriculum Roadmap */}
          {activeTab === 'guided' && (
            <div className="space-y-8">
              {PROP_GUIDED_UNITS.map((unit) => (
                <div key={unit.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-purple-400 block">
                        {unit.badge || `Unit ${unit.unitNumber}`}
                      </span>
                      <h3 className="text-base font-bold text-white">{unit.title}</h3>
                    </div>
                    <p className="text-xs text-slate-400 hidden sm:block max-w-md text-right">
                      {unit.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {unit.lessonIds.map((lId) => {
                      const l = PROP_GUIDED_LESSONS[lId];
                      if (!l) return null;
                      const progress = lessons[lId];
                      const isCompleted = progress?.completed;

                      return (
                        <button
                          key={lId}
                          type="button"
                          onClick={() => handleOpenLesson(lId)}
                          data-investigate-lesson={lId}
                          className={`text-left min-h-[44px] p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                            masteredByEvidence(lId)
                              ? 'bg-emerald-950/15 border-emerald-500/40 hover:border-emerald-500'
                              : 'bg-surface-card border-surface-border hover:border-purple-500/50 hover:bg-surface-elevated'
                          }`}
                        >
                          <span className="block space-y-1.5">
                            <span className="flex items-center justify-between gap-2">
                              <span className="text-xs font-mono font-bold text-amber-400">Lesson {l.lessonNumber}</span>
                              <span className="flex flex-wrap items-center gap-1.5 justify-end">
                                {PROPOSITIONS_CHAPTER.lessons[lId] && (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-surface-border text-slate-300" data-testid="learn-status-chip">
                                    Learn: {STATUS_LABEL[lessonStatus(PROPOSITIONS_CHAPTER.lessons[lId], learnRecords[lId])]}
                                  </span>
                                )}
                                {masteredByEvidence(lId) ? (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">Practice mastered</span>
                                ) : progress?.legacyMasteryUnverified ? (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold" title="An earlier version marked this lesson mastered without any practice evidence. Answer the practice questions on your own to confirm it.">Earlier mastery: Unverified</span>
                                ) : isCompleted ? (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold">Worked through</span>
                                ) : null}
                              </span>
                            </span>
                            <span className="block text-sm font-bold text-white">{l.title}</span>
                            <span className="block text-xs text-slate-400 leading-snug line-clamp-2">{l.subtitle}</span>
                          </span>
                          <span className="flex items-center justify-between pt-2 border-t border-surface-border/50 text-[11px] font-mono text-slate-500">
                            <span>{l.stages.length} Stages</span>
                            <span className="text-purple-400 font-bold">Investigate →</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: Canonical Experiments */}
          {activeTab === 'experiments' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PROPOSITION_EXPERIMENTS.map((exp) => (
                <button
                  key={exp.id}
                  type="button"
                  onClick={() =>
                    navigate(`/mathematics/propositions/workbench?exp=${exp.id}`)
                  }
                  className="text-left p-5 rounded-2xl bg-surface-card border border-surface-border hover:border-amber-500/40 hover:bg-surface-elevated transition-all cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                      {exp.defaultTab.replace('_', ' ')}
                    </span>
                    <h4 className="text-sm font-bold text-white">{exp.title}</h4>
                    <p className="text-xs text-slate-400 leading-snug line-clamp-2">
                      {exp.subtitle}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-surface-border/50 flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>{exp.learningGoals.length} Goals</span>
                    <span className="text-amber-400 font-bold">Launch Studio →</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
