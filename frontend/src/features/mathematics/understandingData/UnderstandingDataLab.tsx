/**
 * How Quantities Combine: Understanding Data — chapter landing page (M6).
 * Three entry points: Start/Continue Learning, Free Data Laboratory, Chapter Practice.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GlobalHeader } from '../../../components/GlobalHeader';
import { useUnderstandingDataStore, lessonStatus } from '../../../store/useUnderstandingDataStore';
import { UD_GUIDED_UNITS, UD_GUIDED_LESSONS } from '../../../engine/mathematics/understandingData/curriculumPath';
import { UD_EXPERIMENTS } from '../../../engine/mathematics/understandingData/experimentRegistry';
import { UD_COVERAGE, EVIDENCE_LABEL } from '../../../engine/mathematics/understandingData/curriculumRegistry';
import { PRACTICE_COUNTS } from '../../../engine/mathematics/understandingData/practiceBank';

const STATUS_BADGE = { not_started: '', attempted: 'In progress', completed: 'Completed', demonstrated: 'Demonstrated', mastered: 'Mastered' } as const;
const EVIDENCE_CLASS = { verified_textbook: 'text-emerald-300', secondary_reference: 'text-amber-300', labverse_extension: 'text-sky-300' } as const;
const STATUS_LABEL = { covered: 'Covered', partial: 'Partly covered', not_covered: 'Not covered' } as const;

export const UnderstandingDataLab: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'guided' | 'experiments' | 'coverage'>('guided');
  const [confirmReset, setConfirmReset] = useState(false);
  const lessons = useUnderstandingDataStore((s) => s.lessons);
  const stats = useUnderstandingDataStore((s) => s.getCompletionStats)();
  const resetProgress = useUnderstandingDataStore((s) => s.resetProgress);

  const next = UD_GUIDED_LESSONS[stats.nextRecommendedLessonId] ?? UD_GUIDED_LESSONS['ud-l1'];
  const nextStatus = lessonStatus(lessons[next.id]);
  const open = (id: string) => navigate(`/mathematics/understanding-data/workbench?lesson=${id}`);

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid font-sans">
      <GlobalHeader />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <nav className="flex items-center gap-2 text-xs font-mono text-slate-400" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-purple-400">Subject Explorer</Link><span>/</span>
            <Link to="/mathematics" className="hover:text-purple-400">Mathematics</Link><span>/</span>
            <span className="text-purple-400 font-bold">Understanding Data</span>
          </nav>
          {!confirmReset ? (
            <button type="button" onClick={() => setConfirmReset(true)} className="min-h-11 text-xs font-mono text-slate-500 hover:text-red-400 flex items-center gap-1.5 px-3 rounded-lg border border-surface-border"><span className="material-symbols-outlined text-[15px]">restart_alt</span>Reset chapter progress</button>
          ) : (
            <div className="flex items-center gap-2 bg-red-950/40 border border-red-500/40 px-3 py-1.5 rounded-lg text-xs">
              <span className="text-red-300">Reset all progress?</span>
              <button type="button" onClick={() => { resetProgress(); setConfirmReset(false); }} className="min-h-11 px-3 rounded bg-red-500 text-slate-950 font-bold font-mono">Yes, reset</button>
              <button type="button" onClick={() => setConfirmReset(false)} className="min-h-11 px-3 rounded bg-surface-elevated text-slate-300 font-mono">Cancel</button>
            </div>
          )}
        </div>

        <section className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">Class 9 NCERT Ganita Manjari · Part II · Chapter 10</span>
            <span className="text-xs font-mono text-slate-500">Milestone M6</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">How Quantities Combine: Understanding Data</h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-3xl leading-relaxed">Discover why averaging averages can mislead, how weights and mixtures work, and what stacked and 100% stacked charts can and cannot tell you. Predict first, then experiment.</p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-5" aria-label="Ways to learn">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-surface-card to-purple-950/20 border border-purple-500/40 shadow-xl flex flex-col justify-between gap-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between"><span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">Guided learning</span><span className="text-xs font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">{stats.percentage}% done</span></div>
              <h2 className="text-lg font-bold text-white">{nextStatus === 'attempted' ? `Continue: ${next.title}` : stats.completed > 0 ? `Next: ${next.title}` : 'Start with Lesson 1'}</h2>
              <p className="text-xs text-slate-300 leading-relaxed">{next.learningObjective}</p>
              <div className="w-full h-1.5 bg-surface-lowest rounded-full overflow-hidden" role="progressbar" aria-valuenow={stats.percentage} aria-valuemin={0} aria-valuemax={100}><div className="h-full bg-purple-500" style={{ width: `${stats.percentage}%` }} /></div>
              <p className="text-[11px] font-mono text-slate-500">{stats.completed} of {stats.total} lessons complete · {stats.mastered} mastered</p>
            </div>
            <button type="button" onClick={() => open(next.id)} className="w-full min-h-12 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-sm flex items-center justify-center gap-2">{nextStatus === 'attempted' || stats.completed > 0 ? 'Continue learning' : 'Start learning'}<span className="material-symbols-outlined text-[18px]">arrow_forward</span></button>
          </div>

          <div className="p-6 rounded-2xl bg-surface-card border border-surface-border flex flex-col justify-between gap-5">
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">Free data laboratory</span>
              <h2 className="text-lg font-bold text-white">Experiment without a script</h2>
              <p className="text-xs text-slate-400 leading-relaxed">Edit datasets, compare weighted and plain averages, build mixtures, draw stacked and 100% charts, import or export CSV.</p>
            </div>
            <Link to="/mathematics/understanding-data/workbench" className="w-full min-h-12 rounded-xl bg-surface-elevated hover:bg-slate-700 text-slate-100 font-mono font-bold text-sm flex items-center justify-center gap-2 border border-surface-border">Open laboratory<span className="material-symbols-outlined text-[18px]">open_in_new</span></Link>
          </div>

          <div className="p-6 rounded-2xl bg-surface-card border border-surface-border flex flex-col justify-between gap-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between"><span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">Chapter practice</span><span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">{PRACTICE_COUNTS.total} questions</span></div>
              <h2 className="text-lg font-bold text-white">Basic · Standard · Challenge</h2>
              <p className="text-xs text-slate-400 leading-relaxed">{PRACTICE_COUNTS.basic} basic, {PRACTICE_COUNTS.standard} standard and {PRACTICE_COUNTS.challenge} challenge questions with chart tapping, hints and worked solutions.</p>
            </div>
            <Link to="/mathematics/understanding-data/workbench?mode=practice" className="w-full min-h-12 rounded-xl bg-surface-elevated hover:bg-slate-700 text-slate-100 font-mono font-bold text-sm flex items-center justify-center gap-2 border border-surface-border">Start practice<span className="material-symbols-outlined text-[18px]">fitness_center</span></Link>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-surface-border pb-3 overflow-x-auto" role="tablist">
            {([['guided', 'Lesson roadmap (13 + 3 optional)'], ['experiments', 'Laboratory presets'], ['coverage', 'Chapter coverage']] as const).map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`min-h-11 px-4 rounded-xl text-xs font-mono font-bold whitespace-nowrap ${tab === id ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>{label}</button>)}
          </div>

          {tab === 'guided' && (
            <div className="space-y-8">
              {UD_GUIDED_UNITS.map((u) => (
                <div key={u.id} className="space-y-3">
                  <div><span className="text-xs font-mono font-bold text-purple-400">{u.badge}</span><h3 className="text-base font-bold text-white">{u.title}</h3><p className="text-xs text-slate-400">{u.description}</p></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {u.lessonIds.map((id) => {
                      const l = UD_GUIDED_LESSONS[id];
                      const st = lessonStatus(lessons[id]);
                      return (
                        <button key={id} type="button" onClick={() => open(id)} className={`text-left p-4 rounded-2xl border min-h-24 flex flex-col justify-between gap-2 ${st === 'mastered' || st === 'completed' ? 'bg-emerald-950/15 border-emerald-500/40' : st === 'attempted' ? 'bg-amber-950/10 border-amber-500/30' : 'bg-surface-card border-surface-border hover:border-purple-500/50'}`}>
                          <div>
                            <div className="flex items-center justify-between"><span className="text-xs font-mono font-bold text-amber-400">Lesson {l.lessonNumber}</span>{STATUS_BADGE[st] && <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">{STATUS_BADGE[st]}</span>}</div>
                            <h4 className="text-sm font-bold text-white">{l.title}</h4>
                            <p className="text-xs text-slate-400">{l.subtitle}</p>{l.isOptionalExtension && <span className="text-[11px] font-mono text-slate-500">Optional extension</span>}
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
              {UD_EXPERIMENTS.filter((e) => e.id !== 'ud-practice').map((e) => (
                <Link key={e.id} to={`/mathematics/understanding-data/workbench?exp=${e.id}`} className="p-4 rounded-2xl bg-surface-card border border-surface-border hover:border-amber-500/40 min-h-24 block">
                  <span className="text-[11px] font-mono text-amber-400 uppercase font-bold">{e.defaultTab === 'weighted' ? 'Weighted average' : e.defaultTab === 'mixture' ? 'Mixture' : e.defaultTab === 'average' ? 'Average day' : 'Charts'}</span>
                  <h4 className="text-sm font-bold text-white">{e.title}</h4>
                  <p className="text-xs text-slate-400">{e.subtitle}</p>
                </Link>
              ))}
            </div>
          )}

          {tab === 'coverage' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 max-w-3xl">Sections and examples below were read from the published chapter text. LabVerse does not copy the textbook’s questions or solutions; every question here uses original numbers, and no exercise numbers are claimed.</p>
              <div className="overflow-x-auto rounded-xl border border-surface-border">
                <table className="w-full text-xs">
                  <thead className="bg-surface-card text-slate-400 text-left font-mono"><tr><th scope="col" className="p-2.5">Topic</th><th scope="col" className="p-2.5">Evidence</th><th scope="col" className="p-2.5">Coverage</th><th scope="col" className="p-2.5">Lessons</th></tr></thead>
                  <tbody>
                    {UD_COVERAGE.map((r) => (
                      <tr key={r.topic} className="border-t border-surface-border/60 text-slate-200 align-top">
                        <td className="p-2.5 font-semibold">{r.topic}{r.note && <div className="font-normal text-slate-500 mt-0.5">{r.note}</div>}</td>
                        <td className={`p-2.5 ${EVIDENCE_CLASS[r.evidence]}`}>{EVIDENCE_LABEL[r.evidence]}{r.textbookRef && <div className="text-slate-500">{r.textbookRef}</div>}</td>
                        <td className="p-2.5">{STATUS_LABEL[r.status]}</td>
                        <td className="p-2.5 font-mono">{r.lessonIds.length ? r.lessonIds.map((id) => UD_GUIDED_LESSONS[id].lessonNumber).join(', ') : '—'}</td>
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
