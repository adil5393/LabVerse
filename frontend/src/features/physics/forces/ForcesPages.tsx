/**
 * Chapter 6 hub (/physics/forces), lesson page and NCERT Exercises page (PHY-2A). The hub lists the four established
 * destinations: Learn, Free Laboratory, NCERT Exercises and Chapter Practice; only the closing Journey Beyond activities are marked Upcoming and are not links.
 */

import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { GlobalHeader } from '../../../components/GlobalHeader';
import { FORCES_CHAPTER } from '../../../engine/physics/forces/learn/content';
import { FORCE_PRACTICE_ITEMS } from '../../../engine/physics/forces/practice';
import { FORCES_MAP, FORCES_TEXTBOOK, forcesCoverageCounts } from '../../../engine/physics/forces/curriculum';
import { FORCE_EXERCISES, solvedForceExerciseNumbers, type ForceExercise, type Illustration } from '../../../engine/physics/forces/exercises';
import { lessonStatus, STATUS_LABEL } from '../../../engine/education/progress';
import type { LearningStatus } from '../../../engine/education/types';
import { useEducationStore } from '../../../store/useEducationStore';
import { ChapterIntroduction, UnitIntroduction } from '../../education/Intro';
import { LearnLessonPage } from '../../education/LearnLessonPage';
import { ChapterPrerequisites, UnitPrerequisites } from '../../education/Prerequisites';
import { CalmVisualsProvider, VisualRegistryProvider, type VisualRegistry } from '../../education/visuals';
import { ForceArrowsVisual, ForceCartView, ForceCartVisual } from './ForceCart';
import { BrakingDemoVisual } from './BrakingDemo';
import { MassSweepGraphs } from './ForceGraphs';
import { PairIdentifyVisual, TwoBodyView, TwoBodyVisual } from './TwoBody';
import { SecondLawDerivationVisual } from './SecondLawDerivation';
import { MotionGraphsVisual, GraphStudioView } from '../motion/MotionGraphs';
import { ForceFigure } from './ForceFigure';
import { PHYS } from '../motion/physicsColors';
import { netArrow } from '../../../engine/physics/forces/forceDiagram';
import { toArrows } from '../../../engine/physics/forces/learn/questions';
import { ChapterWorkspaceNav } from '../../workspace';

export const FORCE_VISUALS: VisualRegistry = { forceCart: ForceCartVisual, forceArrows: ForceArrowsVisual, brakingDemo: BrakingDemoVisual, motionGraphs: MotionGraphsVisual, secondLawDerivation: SecondLawDerivationVisual, twoBody: TwoBodyVisual, pairIdentify: PairIdentifyVisual };

const CRUMB = 'How Forces Affect Motion';

export const ForcesLearnPage: React.FC = () => {
  const { lessonId = '' } = useParams();
  return <CalmVisualsProvider value><LearnLessonPage chapter={FORCES_CHAPTER} registry={FORCE_VISUALS} lessonId={lessonId} crumb={CRUMB} /></CalmVisualsProvider>;
};

const TONE: Record<LearningStatus, string> = {
  not_started: 'border-surface-border text-slate-400 bg-surface-lowest/50',
  in_progress: 'border-indigo-500/50 text-indigo-300 bg-indigo-500/10 shadow-xs',
  completed: 'border-emerald-500/50 text-emerald-300 bg-emerald-500/10 shadow-xs',
  demonstrated: 'border-violet-500/50 text-violet-300 bg-violet-500/10 shadow-xs',
  mastered: 'border-emerald-400 text-emerald-200 bg-emerald-500/15 font-bold shadow-xs',
  needs_review: 'border-amber-500/50 text-amber-300 bg-amber-500/10 shadow-xs',
};

const ForcesLearnSection: React.FC = () => {
  const records = useEducationStore((s) => s.lessons);
  const ch = FORCES_CHAPTER;
  const all = ch.units.flatMap((u) => u.lessonIds.map((id) => ch.lessons[id]));
  const next = all.find((l) => { const st = lessonStatus(l, records[l.id]); return st !== 'completed' && st !== 'mastered'; }) ?? all[0];
  const started = all.some((l) => lessonStatus(l, records[l.id]) !== 'not_started');
  const doneCount = all.filter((l) => { const st = lessonStatus(l, records[l.id]); return st === 'completed' || st === 'mastered'; }).length;
  const percentDone = Math.round((doneCount / Math.max(all.length, 1)) * 100);

  return (
    <VisualRegistryProvider value={FORCE_VISUALS}>
      <section id="learn" aria-label="Learn" className="space-y-6" data-testid="forces-learn-section">
        {/* Hero Guided Learning Banner */}
        <div className="rounded-3xl border-2 border-indigo-500/50 bg-gradient-to-br from-indigo-950/40 via-surface-card to-surface-lowest p-5 md:p-6 space-y-4 shadow-lg shadow-indigo-950/20 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">school</span>
              Guided Learning Path · Class 9 Physics
            </span>
            <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
              {percentDone}% Complete
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-black text-white">Learn: Forces and friction</h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              What is a force, how do forces add up, why do balanced forces not change velocity, what does friction do, what is inertia, and how are force, mass and acceleration related? Interactive carts, worked examples and challenges.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="w-full h-2 rounded-full bg-surface-lowest border border-surface-border overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-sky-300 transition-all duration-300 rounded-full"
                style={{ width: `${Math.max(4, percentDone)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>{doneCount} of {all.length} lessons completed</span>
              <span className="text-indigo-300">Next: Lesson {next.number} ({next.title})</span>
            </div>
          </div>

          <div className="pt-1">
            <Link
              data-testid="forces-start-learning"
              to={ch.routes.learn(next.id)}
              className="min-h-[50px] w-full sm:w-auto px-6 rounded-xl bg-indigo-500 hover:bg-indigo-400 active:scale-[0.99] text-slate-950 font-black text-sm inline-flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 transition-all touch-manipulation"
            >
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              <span>{started ? `Continue Learn: Lesson ${next.number} (${next.title})` : 'Start Learn: Lesson 1'}</span>
            </Link>
          </div>
        </div>

        <ChapterIntroduction chapter={ch} />
        <ChapterPrerequisites chapter={ch} />

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-indigo-400">format_list_bulleted</span>
              Curriculum Units & Lessons
            </h3>
            <span className="text-xs font-mono text-slate-400">{ch.units.length} units · {all.length} lessons</span>
          </div>

          <div className="space-y-8 sm:space-y-10 min-w-0 w-full">
            {ch.units.map((u) => (
              <section
                key={u.id}
                data-learn-unit={u.id}
                className="rounded-3xl border border-surface-border/80 bg-gradient-to-b from-surface-card to-surface-lowest p-4 sm:p-6 md:p-7 space-y-5 shadow-md shadow-black/20 min-w-0 w-full overflow-hidden"
              >
                <UnitIntroduction unit={u} narrate />

                {/* Optional Preparation: Subordinate drawer */}
                {u.prerequisiteIds && u.prerequisiteIds.length > 0 && (
                  <details className="rounded-xl border border-surface-border/50 bg-surface-lowest/50 px-3.5 sm:px-4 py-2 overflow-hidden group">
                    <summary className="cursor-pointer min-h-[42px] flex items-center justify-between text-xs sm:text-sm text-slate-300 font-medium hover:text-white transition-colors select-none">
                      <span className="flex items-center gap-1.5 min-w-0">
                        <span className="material-symbols-outlined text-[16px] text-indigo-400/90 shrink-0">psychology</span>
                        <span className="truncate">Before Unit {u.number}: ideas this unit uses</span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider shrink-0 bg-surface-lowest px-1.5 py-0.5 rounded border border-surface-border/40">optional</span>
                      </span>
                      <span className="material-symbols-outlined text-[16px] text-slate-400 group-open:rotate-180 transition-colors shrink-0">expand_more</span>
                    </summary>
                    <div className="pt-3 pb-1 border-t border-surface-border/50 min-w-0">
                      <UnitPrerequisites chapter={ch} unitId={u.id} />
                    </div>
                  </details>
                )}

                {/* Active Lesson Cards Section: Primary visual emphasis */}
                <div className="space-y-3 pt-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">play_circle</span>
                      Lessons in Unit {u.number}
                    </h4>
                    <span className="text-xs font-mono text-slate-400">
                      {u.lessonIds.filter((id) => records[id] && (lessonStatus(ch.lessons[id], records[id]) === 'completed' || lessonStatus(ch.lessons[id], records[id]) === 'mastered')).length} of {u.lessonIds.length} done
                    </span>
                  </div>

                  <ol className="grid gap-2.5 sm:gap-3 md:grid-cols-2 lg:grid-cols-3 min-w-0 w-full">
                    {u.lessonIds.map((id) => {
                      const l = ch.lessons[id];
                      const st = lessonStatus(l, records[id]);
                      return (
                        <li key={id} className="min-w-0 w-full">
                          <Link
                            to={ch.routes.learn(id)}
                            data-learn-link={id}
                            className="block min-w-0 w-full min-h-[72px] rounded-2xl border border-surface-border bg-surface-card hover:bg-surface-high hover:border-indigo-400/60 active:scale-[0.99] p-3.5 sm:p-4 space-y-1.5 transition-colors shadow-xs touch-manipulation group overflow-hidden"
                          >
                            <div className="flex items-center justify-between gap-2 min-w-0">
                              <span className="text-xs font-mono text-slate-400 font-bold flex items-center gap-1.5 min-w-0 shrink">
                                <span className="px-1.5 py-0.5 rounded bg-surface-lowest text-[10px] text-indigo-400 border border-indigo-500/20 font-bold shrink-0">
                                  L{l.number}
                                </span>
                                <span className="truncate">Lesson {l.number}</span>
                              </span>
                              <span
                                data-status={st}
                                className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border font-semibold flex items-center gap-1 shrink-0 ${TONE[st]}`}
                              >
                                <span className="text-[10px]">
                                  {st === 'completed' || st === 'mastered' ? '✓' : st === 'in_progress' ? '▶' : '○'}
                                </span>
                                <span>{STATUS_LABEL[st]}</span>
                              </span>
                            </div>
                            <div className="font-bold text-white group-hover:text-indigo-300 transition-colors text-sm sm:text-base break-words">
                              {l.title}
                            </div>
                            <p className="text-xs text-slate-400 truncate">{l.objective}</p>
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-surface-border p-4 space-y-1" data-testid="forces-upcoming-units">
          <h3 className="text-sm font-black text-slate-300">Upcoming units</h3>
          <p className="text-xs text-slate-400">All of Sections 6.1 to 6.7 are available; only the closing &ldquo;Journey Beyond&rdquo; activities are upcoming.</p>
        </div>
      </section>
    </VisualRegistryProvider>
  );
};

const Crumb: React.FC<{ last: string }> = ({ last }) => (
  <nav className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400" aria-label="Breadcrumb">
    <Link to="/" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Subject Explorer</Link><span>/</span>
    <Link to="/physics" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Physics</Link><span>/</span>
    {last === 'How Forces Affect Motion' ? null : <><Link to="/physics/forces" className="inline-flex items-center min-h-[44px] hover:text-sky-400">How Forces Affect Motion</Link><span>/</span></>}
    <span className="text-sky-300 font-bold">{last}</span>
  </nav>
);

export const ForcesHub: React.FC = () => {
  const solved = solvedForceExerciseNumbers().length;
  const counts = forcesCoverageCounts();
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid font-sans" data-chapter="forces">
      <GlobalHeader />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 space-y-8">
        <Crumb last="How Forces Affect Motion" />
        <header className="space-y-2">
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">{FORCES_TEXTBOOK.book} ({FORCES_TEXTBOOK.edition}) · Chapter {FORCES_TEXTBOOK.chapterNumber}</span>
          <h1 className="text-3xl md:text-5xl font-black text-white">{FORCES_TEXTBOOK.title}</h1>
          <p className="text-sm md:text-base text-slate-300 max-w-3xl">Learn what a force is, how forces add up, why balanced forces do not change velocity, what friction does, and Newton&apos;s first law with inertia. Newton&apos;s second law and momentum, with an interactive derivation of F = ma, the third law and forces on a system are included.</p>
        </header>

        <section aria-label="Ways to learn" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="forces-destinations">
          <div className="rounded-2xl border border-indigo-500/50 bg-gradient-to-b from-indigo-950/20 via-surface-card to-surface-card p-5 space-y-3 flex flex-col justify-between shadow-sm relative overflow-hidden" style={{ borderTop: '4px solid #818CF8' }}>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-indigo-400">school</span>
                <h2 className="text-lg font-black text-white">Learn</h2>
              </div>
              <p className="text-xs text-slate-300">10 lessons in 6 units, with prerequisites, worked examples and practice.</p>
            </div>
            <a href="#learn" data-destination="learn" className="min-h-[46px] inline-flex items-center justify-center rounded-xl bg-indigo-500 hover:bg-indigo-400 active:scale-[0.99] text-slate-950 font-black text-sm shadow-sm transition-all touch-manipulation">Start learning</a>
          </div>

          <div className="rounded-2xl border border-sky-500/40 bg-gradient-to-b from-sky-950/20 via-surface-card to-surface-card p-5 space-y-3 flex flex-col justify-between shadow-sm relative overflow-hidden" style={{ borderTop: '4px solid #38BDF8' }}>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-sky-400">science</span>
                <h2 className="text-lg font-black text-white">Free Laboratory</h2>
              </div>
              <p className="text-xs text-slate-300">Push a cart, change mass and friction, and view force vectors. 15 investigations and synchronized graphs.</p>
            </div>
            <Link to="/physics/forces/lab" data-destination="lab" className="min-h-[46px] inline-flex items-center justify-center rounded-xl bg-surface-elevated hover:bg-surface-variant text-slate-100 font-bold text-sm border border-surface-border transition-colors touch-manipulation">Open the laboratory</Link>
          </div>

          <div className="rounded-2xl border border-violet-500/40 bg-gradient-to-b from-violet-950/20 via-surface-card to-surface-card p-5 space-y-3 flex flex-col justify-between shadow-sm relative overflow-hidden" style={{ borderTop: '4px solid #A78BFA' }}>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-violet-400">assignment</span>
                <h2 className="text-lg font-black text-white">NCERT Exercises</h2>
              </div>
              <p className="text-xs text-slate-300">All {solved} of {FORCE_EXERCISES.length} questions solved step by step.</p>
            </div>
            <Link to="/physics/forces/exercises" data-destination="exercises" className="min-h-[46px] inline-flex items-center justify-center rounded-xl bg-surface-elevated hover:bg-surface-variant text-slate-100 font-bold text-sm border border-surface-border transition-colors touch-manipulation">Open the exercises</Link>
          </div>

          <div className="rounded-2xl border border-emerald-500/40 bg-surface-card p-5 space-y-3 flex flex-col justify-between" data-testid="forces-practice-card">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-emerald-400">task_alt</span>
                <h2 className="text-lg font-black text-white">Chapter Practice</h2>
              </div>
              <p className="text-xs text-slate-300">{FORCE_PRACTICE_ITEMS.length} original questions on the whole chapter. Open to everyone, in any order.</p>
            </div>
            <Link to="/physics/forces/practice" data-destination="practice" className="min-h-[46px] inline-flex items-center justify-center rounded-xl bg-surface-elevated hover:bg-surface-variant text-slate-100 font-bold text-sm border border-surface-border transition-colors touch-manipulation">Open Chapter Practice</Link>
          </div>
        </section>

        <ForcesLearnSection />

        <details aria-label="Chapter map" className="group rounded-2xl border border-surface-border bg-surface-card/50 p-4 space-y-3" data-testid="forces-map">
          <summary className="cursor-pointer min-h-[44px] flex flex-wrap items-center justify-between gap-2 list-none">
            <span className="text-xl font-black text-white">Chapter map <span className="text-xs font-mono font-normal text-slate-400">(optional reference: what is built and what is upcoming)</span></span>
            <span className="text-xs font-mono text-slate-300">{counts.available} available · {counts.planned} upcoming <span aria-hidden>{'▾'}</span></span>
          </summary>
          <p className="text-xs text-slate-400">Checked against the textbook PDF. Rows marked enrichment are LabVerse additions that are not in the book. Upcoming rows are not built yet.</p>
          <div className="overflow-x-auto rounded-xl border border-surface-border" role="region" aria-label="Chapter map table" tabIndex={0}>
            <table className="w-full text-xs">
              <caption className="sr-only">Chapter 6 topics, their sections, source and status in LabVerse.</caption>
              <thead><tr className="bg-surface-card text-slate-300"><th scope="col" className="p-2 text-left">Section</th><th scope="col" className="p-2 text-left">Topic</th><th scope="col" className="p-2 text-left">Source</th><th scope="col" className="p-2 text-left">Status</th></tr></thead>
              <tbody>
                {FORCES_MAP.map((r) => (
                  <tr key={r.id} className="border-t border-surface-border align-top" data-map-row={r.id}>
                    <td className="p-2 font-mono text-slate-300 whitespace-nowrap">{r.section}</td>
                    <td className="p-2 text-slate-200">{r.topic}{r.note ? <span className="text-slate-400"> {r.note}</span> : null}</td>
                    <td className="p-2 text-slate-300">{r.kind === 'textbook' ? 'Textbook' : 'LabVerse enrichment'}</td>
                    <td className="p-2 font-mono font-bold" data-status={r.status} style={{ color: r.status === 'planned' ? '#94A3B8' : r.status === 'laboratory' ? '#38BDF8' : '#34D399' }}>{r.status === 'planned' ? `○ Upcoming${r.milestone ? ` (${r.milestone})` : ''}` : r.status === 'laboratory' ? '◆ Laboratory' : '✓ Learn'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </main>
    </div>
  );
};

// ---------------------------------------------------------------------------
// NCERT exercises
// ---------------------------------------------------------------------------

const IllustrationView: React.FC<{ ill: Illustration; id: string }> = ({ ill, id }) => {
  const arrows = ill.kind === 'arrows' ? toArrows(ill.object, ill.forces) : [];
  return (
    <figure className="space-y-2 rounded-xl border border-surface-border bg-surface-card/60 p-3" data-illustration={ill.kind} data-illustration-id={id}>
      <figcaption className="text-xs text-slate-300"><strong style={{ color: PHYS.prediction }}>Interactive illustration. </strong>{ill.caption}</figcaption>
      {ill.kind === 'arrows' && <ForceFigure object={ill.object} arrows={arrows} net={netArrow(arrows)} showIndividual showNet={ill.showNet} alt={ill.caption} />}
      {ill.kind === 'cart' && <ForceCartView initial={ill.setup} editable={false} startTime={ill.t} alt={ill.caption} graphs={ill.graphs} />}
      {ill.kind === 'massSweep' && <MassSweepGraphs force={ill.force} masses={ill.masses} />}
      {ill.kind === 'twoBody' && <TwoBodyView initial={ill.setup} editable={false} alt={ill.caption} />}
      {ill.kind === 'graph' && <GraphStudioView profile={ill.profile} graphs={ill.graphs} alt={ill.caption} />}
    </figure>
  );
};

type Stage = 0 | 1 | 2 | 3;

const Solution: React.FC<{ ex: ForceExercise }> = ({ ex }) => {
  const sol = ex.solution!;
  const [stage, setStage] = useState<Stage>(0);
  const btn = 'min-h-[44px] px-4 rounded-lg border border-surface-border bg-surface-elevated text-slate-100 text-sm font-bold';
  return (
    <div className="space-y-3 pt-3" data-solution={ex.number}>
      <p className="text-sm text-slate-200"><strong>Try yourself first.</strong> Work it out on paper, then reveal help one step at a time.</p>
      <ul className="text-xs text-slate-300 list-disc pl-5 space-y-0.5" aria-label="Given">{sol.given.map((g) => <li key={g}>{g}</li>)}</ul>
      <ul className="text-xs text-slate-300 list-disc pl-5 space-y-0.5" aria-label="To find">{sol.find.map((g) => <li key={g}><strong>Find: </strong>{g}</li>)}</ul>
      {sol.assumptions?.map((a) => <p key={a} className="text-xs" style={{ color: PHYS.distance }}>Assumption: {a}</p>)}
      {stage < 1 && <button type="button" className={btn} onClick={() => setStage(1)}>Show a hint</button>}
      {stage >= 1 && <p className="text-sm rounded-lg px-3 py-2 border" style={{ color: '#fef9c3', borderColor: `${PHYS.prediction}66`, background: `${PHYS.prediction}0D` }} data-testid="hint"><strong>Hint: </strong>{sol.hint}</p>}
      {stage === 1 && <button type="button" className={btn} onClick={() => setStage(2)}>Show step-by-step reasoning</button>}
      {stage >= 2 && (
        <div className="space-y-2" data-testid="steps">
          <p className="text-sm text-slate-100"><strong>Principle: </strong>{sol.principle}</p>
          {sol.formulas && <ul className="text-xs text-slate-200 space-y-0.5" aria-label="Formulas chosen">{sol.formulas.map((f) => <li key={f.formula}><span className="font-mono font-bold" style={{ color: PHYS.acceleration }}>{f.formula}</span> <span className="text-slate-400">: {f.why}</span></li>)}</ul>}
          <ol className="space-y-2">{sol.steps.map((s, i) => <li key={i} className="rounded-xl bg-surface-lowest px-3 py-2 text-sm text-slate-200"><span className="font-mono mr-2" style={{ color: PHYS.distance }}>{i + 1}.</span>{s.text}<div className="text-xs text-slate-400 mt-1"><em>Why: </em>{s.why}</div></li>)}</ol>
        </div>
      )}
      {stage === 2 && <button type="button" className={btn} onClick={() => setStage(3)}>Show the final answer</button>}
      {stage >= 3 && (
        <div className="space-y-3" data-testid="answers">
          {sol.answers.map((a) => <p key={a.label} data-part={a.part ?? 'answer'} className="text-sm rounded-xl border px-3 py-2" style={{ color: '#d1fae5', borderColor: `${PHYS.correct}66`, background: `${PHYS.correct}0D` }}><strong>{'✓ '}{a.label}: </strong>{a.value}</p>)}
          <p className="text-sm text-slate-200" data-testid="explanation"><strong>What it means: </strong>{sol.explanation}</p>
          <div className="text-xs text-slate-300 space-y-1" data-testid="common-mistakes"><strong style={{ color: PHYS.error }}>Common mistakes</strong><ul className="list-disc pl-5">{sol.commonMistakes.map((m) => <li key={m.mistake}>{m.mistake} <span className="text-slate-400">{m.fix}</span></li>)}</ul></div>
          <p className="text-[11px] text-slate-400">Verification: {sol.verification.method}</p>
          {sol.illustrations && <div className="space-y-3" data-testid="illustrations">{sol.illustrations.map((ill, i) => <IllustrationView key={i} ill={ill} id={`${ex.number}-${i + 1}`} />)}</div>}
          <div className="flex flex-wrap gap-2" data-testid="exercise-labs">{sol.labs?.map((l) => <Link key={l.href} to={l.href} className="min-h-[44px] inline-flex items-center px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm">Explore in the lab: {l.label}</Link>)}</div>
          {sol.labNote && <p className="text-[11px] text-slate-400" data-testid="lab-note">Why no matching laboratory: {sol.labNote}</p>}
          <p className="text-[11px] text-slate-400">Lessons for this question: {ex.lessonIds.map((id, i) => <span key={id}>{i ? ', ' : ''}<Link className="underline hover:text-sky-300" to={`/physics/forces/learn/${id}`}>{id.replace('pf-l', 'Lesson ')}</Link></span>)}</p>
        </div>
      )}
    </div>
  );
};

export const ForcesExercises: React.FC = () => {
  const solved = solvedForceExerciseNumbers();
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid font-sans" data-chapter="forces-exercises">
      <GlobalHeader />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        <ChapterWorkspaceNav
          chapterId="forces"
          currentPageTitle="NCERT Exercises"
          currentMode="exercises"
          showBackToLab={true}
        />
        <header className="space-y-2">
          <h1 className="text-3xl font-black text-white">NCERT Exercises: Chapter 6</h1>
          <p className="text-sm text-slate-300">The chapter ends with sixteen questions (“Revise, Reflect, Refine”), listed here with their textbook numbers. The summaries are in our own words; open the textbook for the exact wording. {solved.length} of 16 have step-by-step solutions so far (questions {solved.join(', ')}); the others are upcoming, with the milestone that will cover them, and show no solution.</p>
          <p className="text-xs text-slate-400">Viewing a solution never counts toward mastery. Practise first, then check.</p>
        </header>
        <ol className="space-y-3">
          {FORCE_EXERCISES.map((ex) => (
            <li key={ex.number} data-exercise={ex.number} className="rounded-2xl border border-surface-border bg-surface-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <div className="text-xs font-mono text-slate-400">Question {ex.number} · {ex.topic} · Section {ex.sections.join(', ')}</div>
                  <p className="text-sm text-slate-100">{ex.summary}</p>
                  {ex.parts && <p className="text-[11px] text-slate-400">Parts: {ex.parts.map((p) => p.label).join('; ')}</p>}
                </div>
                {ex.status === 'solved'
                  ? <button type="button" aria-expanded={open === ex.number} onClick={() => setOpen(open === ex.number ? null : ex.number)} className="min-h-[44px] px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm" data-testid={`open-${ex.number}`}>{open === ex.number ? 'Close' : 'Open solution'}</button>
                  : <span className="text-[11px] font-mono px-2 py-1 rounded-full border border-surface-border text-slate-400" data-status="upcoming">Upcoming ({ex.milestone})</span>}
              </div>
              {ex.status === 'solved' && open === ex.number && <Solution ex={ex} />}
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
};
