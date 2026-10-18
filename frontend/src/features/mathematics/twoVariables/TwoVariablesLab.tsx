/**
 * Two Variables, One Line — chapter landing page (Milestone M5).
 * Three entry points: Start/Continue Learning, Free Algebra Laboratory, Chapter Practice.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GlobalHeader } from '../../../components/GlobalHeader';
import { useTwoVariablesStore } from '../../../store/useTwoVariablesStore';
import { TV_GUIDED_UNITS, TV_GUIDED_LESSONS } from '../../../engine/mathematics/twoVariables/curriculumPath';
import { TV_EXPERIMENTS } from '../../../engine/mathematics/twoVariables/experimentRegistry';
import { TV_COVERAGE_MATRIX } from '../../../engine/mathematics/twoVariables/curriculumRegistry';
import { PRACTICE_COUNTS } from '../../../engine/mathematics/twoVariables/practiceBank';

const SOURCE_LABEL = {
  textbook_heading: 'Confirmed from textbook heading',
  secondary_summary: 'From chapter summaries',
  task_brief: 'Added for completeness',
} as const;

export const TwoVariablesLab: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'guided' | 'experiments' | 'coverage'>('guided');
  const [confirmReset, setConfirmReset] = useState(false);
  const lessons = useTwoVariablesStore((s) => s.lessons);
  const getCompletionStats = useTwoVariablesStore((s) => s.getCompletionStats);
  const resetProgress = useTwoVariablesStore((s) => s.resetProgress);

  const stats = getCompletionStats();
  const next = TV_GUIDED_LESSONS[stats.nextRecommendedLessonId] ?? TV_GUIDED_LESSONS['tv-l1'];
  const open = (id: string) => navigate(`/mathematics/two-variables/workbench?lesson=${id}`);

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid font-sans">
      <GlobalHeader />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <nav className="flex items-center gap-2 text-xs font-mono text-slate-400" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-purple-400">Subject Explorer</Link><span>/</span>
            <Link to="/mathematics" className="hover:text-purple-400">Mathematics</Link><span>/</span>
            <span className="text-purple-400 font-bold">Two Variables, One Line</span>
          </nav>
          {!confirmReset ? (
            <button type="button" onClick={() => setConfirmReset(true)} className="min-h-10 text-xs font-mono text-slate-500 hover:text-red-400 flex items-center gap-1.5 px-3 rounded-lg border border-surface-border">
              <span className="material-symbols-outlined text-[15px]">restart_alt</span>Reset chapter progress
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-red-950/40 border border-red-500/40 px-3 py-1.5 rounded-lg text-xs">
              <span className="text-red-300">Reset all progress?</span>
              <button type="button" onClick={() => { resetProgress(); setConfirmReset(false); }} className="min-h-9 px-3 rounded bg-red-500 text-slate-950 font-bold font-mono">Yes, reset</button>
              <button type="button" onClick={() => setConfirmReset(false)} className="min-h-9 px-3 rounded bg-surface-elevated text-slate-300 font-mono">Cancel</button>
            </div>
          )}
        </div>

        <section className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">Class 9 NCERT Ganita Manjari · Part II · Chapter 13</span>
            <span className="text-xs font-mono text-slate-500">Milestone M5</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Two Variables, One Line</h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-3xl leading-relaxed">
            Discover how an equation, its ordered-pair solutions, its straight-line graph and the solution of two equations together are all
            one idea. Predict, experiment, observe and explain — then practise.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-5" aria-label="Ways to learn">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-surface-card to-purple-950/20 border border-purple-500/40 shadow-xl flex flex-col justify-between gap-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">Guided learning</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">{stats.completionPercentage}% done</span>
              </div>
              <h2 className="text-lg font-bold text-white">{stats.completedLessonsCount > 0 ? `Next: ${next.title}` : 'Start with Lesson 1'}</h2>
              <p className="text-xs text-slate-300 leading-relaxed">{next.learningObjective}</p>
              <div className="w-full h-1.5 bg-surface-lowest rounded-full overflow-hidden" role="progressbar" aria-valuenow={stats.completionPercentage} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full bg-purple-500" style={{ width: `${stats.completionPercentage}%` }} />
              </div>
              <p className="text-[11px] font-mono text-slate-500">{stats.completedLessonsCount} of {stats.totalLessonsCount} lessons complete · {stats.masteredLessonsCount} mastered</p>
            </div>
            <button type="button" onClick={() => open(next.id)} className="w-full min-h-12 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-sm flex items-center justify-center gap-2">
              {stats.completedLessonsCount > 0 ? 'Continue learning' : 'Start learning'}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-surface-card border border-surface-border flex flex-col justify-between gap-5">
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">Free algebra laboratory</span>
              <h2 className="text-lg font-bold text-white">Experiment without a script</h2>
              <p className="text-xs text-slate-400 leading-relaxed">Type any equation, drag points and lines, put two equations on one graph, and solve by substitution or elimination.</p>
            </div>
            <Link to="/mathematics/two-variables/workbench" className="w-full min-h-12 rounded-xl bg-surface-elevated hover:bg-slate-700 text-slate-100 font-mono font-bold text-sm flex items-center justify-center gap-2 border border-surface-border">
              Open laboratory<span className="material-symbols-outlined text-[18px]">open_in_new</span>
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-surface-card border border-surface-border flex flex-col justify-between gap-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">Chapter practice</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">{PRACTICE_COUNTS.total} questions</span>
              </div>
              <h2 className="text-lg font-bold text-white">Basic · Standard · Challenge</h2>
              <p className="text-xs text-slate-400 leading-relaxed">{PRACTICE_COUNTS.basic} basic, {PRACTICE_COUNTS.standard} standard and {PRACTICE_COUNTS.challenge} challenge questions with hints and worked solutions.</p>
            </div>
            <Link to="/mathematics/two-variables/workbench?mode=practice" className="w-full min-h-12 rounded-xl bg-surface-elevated hover:bg-slate-700 text-slate-100 font-mono font-bold text-sm flex items-center justify-center gap-2 border border-surface-border">
              Start practice<span className="material-symbols-outlined text-[18px]">fitness_center</span>
            </Link>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-surface-border pb-3 overflow-x-auto" role="tablist">
            {([['guided', 'Lesson roadmap (14)'], ['experiments', 'Laboratory presets'], ['coverage', 'Chapter coverage']] as const).map(([id, label]) => (
              <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`min-h-11 px-4 rounded-xl text-xs font-mono font-bold whitespace-nowrap ${tab === id ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>{label}</button>
            ))}
          </div>

          {tab === 'guided' && (
            <div className="space-y-8">
              {TV_GUIDED_UNITS.map((u) => (
                <div key={u.id} className="space-y-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-purple-400">{u.badge}</span>
                    <h3 className="text-base font-bold text-white">{u.title}</h3>
                    <p className="text-xs text-slate-400">{u.description}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {u.lessonIds.map((id) => {
                      const l = TV_GUIDED_LESSONS[id];
                      const p = lessons[id];
                      return (
                        <button key={id} type="button" onClick={() => open(id)} className={`text-left p-4 rounded-2xl border min-h-24 flex flex-col justify-between gap-2 ${p?.completed ? 'bg-emerald-950/15 border-emerald-500/40' : 'bg-surface-card border-surface-border hover:border-purple-500/50'}`}>
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono font-bold text-amber-400">Lesson {l.lessonNumber}</span>
                              {p?.completed && <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">{p.mastered ? 'Mastered' : p.teacherBypassed ? 'Demonstrated' : 'Completed'}</span>}
                            </div>
                            <h4 className="text-sm font-bold text-white">{l.title}</h4>
                            <p className="text-xs text-slate-400">{l.subtitle}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'experiments' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {TV_EXPERIMENTS.filter((e) => e.id !== 'tv-practice').map((e) => (
                <Link key={e.id} to={`/mathematics/two-variables/workbench?exp=${e.id}`} className="p-4 rounded-2xl bg-surface-card border border-surface-border hover:border-amber-500/40 min-h-24 block">
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">{e.defaultTab === 'graph' ? 'Equation graph' : e.defaultTab === 'system' ? 'Two lines' : 'Algebra'}</span>
                  <h4 className="text-sm font-bold text-white">{e.title}</h4>
                  <p className="text-xs text-slate-400">{e.subtitle}</p>
                </Link>
              ))}
            </div>
          )}

          {tab === 'coverage' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 max-w-3xl">
                Topics follow the chapter “Two Variables, One Line” in NCERT Ganita Manjari Part II. Only the headings 13.1 and 13.1.1 were confirmed directly
                from the textbook; the rest comes from chapter summaries. LabVerse does not claim any official exercise numbers.
              </p>
              <div className="overflow-x-auto rounded-xl border border-surface-border">
                <table className="w-full text-xs">
                  <thead className="bg-surface-card text-slate-400 text-left font-mono"><tr><th className="p-2.5">Topic</th><th className="p-2.5">Lessons</th><th className="p-2.5">Where in the lab</th><th className="p-2.5">Source</th></tr></thead>
                  <tbody>
                    {TV_COVERAGE_MATRIX.map((r) => (
                      <tr key={r.topic} className="border-t border-surface-border/60 text-slate-200">
                        <td className="p-2.5 font-semibold">{r.topic}</td>
                        <td className="p-2.5 font-mono">{r.lessonIds.map((id) => TV_GUIDED_LESSONS[id].lessonNumber).join(', ')}</td>
                        <td className="p-2.5">{r.labFeature}</td>
                        <td className="p-2.5 text-slate-400">{SOURCE_LABEL[r.source]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
