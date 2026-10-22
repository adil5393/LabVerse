/**
 * Chapter 10 pages (SND-1): the chapter hub (/physics/sound), the lesson page, the two laboratory pages and the NCERT Exercises
 * page. Only functionality that exists is a link: the later lessons and the practice bank are listed as Upcoming with their
 * milestone, never as complete.
 */

import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { GlobalHeader } from '../../../components/GlobalHeader';
import { SOUND_CHAPTER } from '../../../engine/physics/sound/learn/content';
import { SOUND_MAP, SOUND_SYLLABUS, SOUND_TEXTBOOK, SOUND_UNIT_TITLES, soundCoverageCounts } from '../../../engine/physics/sound/curriculum';
import { SOUND_EXERCISES, soundExerciseCounts, type SoundExercise } from '../../../engine/physics/sound/exercises';
import { lessonStatus, STATUS_LABEL } from '../../../engine/education/progress';
import { useEducationStore } from '../../../store/useEducationStore';
import { ChapterIntroduction, UnitIntroduction } from '../../education/Intro';
import { LearnLessonPage } from '../../education/LearnLessonPage';
import { ChapterPrerequisites, UnitPrerequisites } from '../../education/Prerequisites';
import { VisualRegistryProvider } from '../../education/visuals';
import { ChapterWorkspaceNav } from '../../workspace';
import { VIBRATION_ASSUMPTIONS, VibrationPanel } from './VibrationLab';
import { WavePanel } from './WaveLab';
import { SOUND_VISUALS } from './SoundVisuals';
import { SOUND_COLORS } from './WaveViews';

const CRUMB = 'Sound Waves';

const Crumb: React.FC<{ last: string }> = ({ last }) => (
  <nav className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400" aria-label="Breadcrumb">
    <Link to="/" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Subject Explorer</Link><span>/</span>
    <Link to="/physics" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Physics</Link><span>/</span>
    {last === CRUMB ? null : <><Link to="/physics/sound" className="inline-flex items-center min-h-[44px] hover:text-sky-400">{CRUMB}</Link><span>/</span></>}
    <span className="text-sky-300 font-bold">{last}</span>
  </nav>
);

export const SoundLearnPage: React.FC = () => {
  const { lessonId = '' } = useParams();
  return <LearnLessonPage chapter={SOUND_CHAPTER} registry={SOUND_VISUALS} lessonId={lessonId} crumb={CRUMB} />;
};

const STATUS_CLASS: Record<string, string> = {
  not_started: 'border-surface-border text-slate-400', in_progress: 'border-amber-500/50 text-amber-300', completed: 'border-emerald-500/50 text-emerald-300',
  demonstrated: 'border-violet-500/50 text-violet-300', mastered: 'border-emerald-400 text-emerald-200', needs_review: 'border-amber-500/50 text-amber-300',
};

const Dest: React.FC<{ to?: string; id: string; icon: string; title: string; text: string; cta: string; upcoming?: string }> = ({ to, id, icon, title, text, cta, upcoming }) => (
  <div className={`rounded-2xl border p-5 space-y-3 flex flex-col justify-between ${to ? 'border-teal-500/40 bg-surface-card' : 'border-dashed border-surface-border/80 bg-surface-card/40 opacity-80'}`} data-destination={id} aria-disabled={to ? undefined : true}>
    <div className="space-y-1.5">
      <div className="flex items-center gap-2"><span className={`material-symbols-outlined text-[18px] ${to ? 'text-teal-300' : 'text-slate-400'}`}>{icon}</span><h2 className={`text-lg font-black ${to ? 'text-white' : 'text-slate-300'}`}>{title}</h2></div>
      <p className="text-xs text-slate-300">{text}</p>
    </div>
    {to
      ? <Link to={to} className="min-h-[46px] inline-flex items-center justify-center rounded-xl bg-surface-elevated hover:bg-surface-variant text-slate-100 font-bold text-sm border border-surface-border transition-colors touch-manipulation">{cta}</Link>
      : <span className="min-h-[46px] inline-flex items-center justify-center rounded-xl border border-surface-border text-slate-400 font-bold text-sm">{upcoming ?? 'Upcoming'}</span>}
  </div>
);

export const SoundHub: React.FC = () => {
  const ch = SOUND_CHAPTER;
  const records = useEducationStore((s) => s.lessons);
  const counts = soundCoverageCounts();
  const ex = soundExerciseCounts();
  const all = ch.units.flatMap((u) => u.lessonIds.map((id) => ch.lessons[id]));
  const next = all.find((l) => { const st = lessonStatus(l, records[l.id]); return st !== 'completed' && st !== 'mastered'; }) ?? all[0];
  const started = all.some((l) => lessonStatus(l, records[l.id]) !== 'not_started');
  const planned = SOUND_SYLLABUS.filter((l) => l.status === 'planned');
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid font-sans" data-chapter="sound-hub">
      <GlobalHeader />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6" data-testid="sound-hub">
        <Crumb last={CRUMB} />
        <header className="space-y-2">
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30">{SOUND_TEXTBOOK.book} ({SOUND_TEXTBOOK.edition}) · Chapter {SOUND_TEXTBOOK.chapterNumber}</span>
          <h1 className="text-3xl md:text-5xl font-black text-white">{SOUND_TEXTBOOK.title}</h1>
          <p className="text-sm md:text-base text-slate-300 max-w-3xl">Why does a plucked string sound, how does the sound reach you, and what does it look like as a wave? Six lessons and two laboratories are open now (Sections 10.1 to 10.5). Frequency, speed, pitch, echoes and SONAR come in later lessons. Sound is optional everywhere: turn it on only if you want to hear the tones.</p>
        </header>

        <section aria-label="Ways to learn" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="sound-destinations">
          <Dest id="learn" to={ch.routes.learn(next.id)} icon="school" title="Learn" text={`${all.length} lessons in 2 units, with optional refreshers, worked examples and practice. ${started ? 'Continue where you left off.' : 'Start with Lesson 1.'}`} cta={started ? `Continue: Lesson ${next.number}` : 'Start Lesson 1'} />
          <Dest id="vibration" to="/physics/sound/vibration" icon="graphic_eq" title="Vibration Laboratory" text="Pluck a rubber band or strike a tuning fork. See the vibration and the loudness, and (optionally) hear the tone." cta="Open the Vibration Laboratory" />
          <Dest id="wave" to="/physics/sound/wave" icon="waves" title="Wave Laboratory" text="Watch compressions and rarefactions travel while one marked particle only vibrates in place, with the density graph." cta="Open the Wave Laboratory" />
          <Dest id="exercises" to="/physics/sound/exercises" icon="assignment" title="NCERT Exercises" text={`${ex.exercisesSolved} of ${ex.exercises} exercises and ${ex.pondersSolved} of ${ex.ponders} Pause and Ponder items are solved so far. The rest need Lessons 7 to 12.`} cta="Open the exercises" />
          <Dest id="practice" icon="task_alt" title="Chapter Practice" text="Original practice questions across the whole chapter. Not built yet." cta="" upcoming="Upcoming (SND-3)" />
        </section>

        <VisualRegistryProvider value={SOUND_VISUALS}>
          <section id="learn" aria-label="Learn" className="space-y-6" data-testid="sound-learn-section">
            <ChapterIntroduction chapter={ch} />
            <ChapterPrerequisites chapter={ch} />
            <div className="space-y-6">
              {ch.units.map((u) => (
                <section key={u.id} data-learn-unit={u.id} className="rounded-3xl border border-surface-border/80 bg-gradient-to-b from-surface-card to-surface-lowest p-4 sm:p-6 space-y-5 min-w-0">
                  <UnitIntroduction unit={u} narrate />
                  {u.prerequisiteIds.length > 0 && (
                    <details className="rounded-xl border border-surface-border/50 bg-surface-lowest/50 px-3.5 py-2 group">
                      <summary className="cursor-pointer min-h-[44px] flex items-center text-sm text-slate-300 font-medium">Before Unit {u.number}: ideas this unit uses (optional)</summary>
                      <div className="pt-3 pb-1 border-t border-surface-border/50"><UnitPrerequisites chapter={ch} unitId={u.id} /></div>
                    </details>
                  )}
                  <ol className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {u.lessonIds.map((id) => {
                      const l = ch.lessons[id]; const st = lessonStatus(l, records[id]);
                      return (
                        <li key={id}>
                          <Link to={ch.routes.learn(id)} data-learn-link={id} className="block min-h-[88px] rounded-2xl border border-surface-border bg-surface-card hover:bg-surface-high hover:border-teal-400/60 p-3.5 space-y-1 touch-manipulation">
                            <div className="flex items-center justify-between gap-2"><span className="text-xs font-mono text-slate-400 font-bold">Lesson {l.number}</span><span data-status={st} className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${STATUS_CLASS[st]}`}>{STATUS_LABEL[st]}</span></div>
                            <div className="font-bold text-white text-base break-words">{l.title}</div>
                            <p className="text-xs text-slate-400 line-clamp-2">{l.objective}</p>
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                </section>
              ))}
            </div>
          </section>
        </VisualRegistryProvider>

        <section aria-label="Upcoming lessons" className="rounded-2xl border border-dashed border-surface-border p-4 space-y-3" data-testid="sound-upcoming">
          <h2 className="text-lg font-black text-slate-200">Upcoming lessons ({planned.length})</h2>
          <p className="text-xs text-slate-400">These lessons are planned and are <strong>not available yet</strong>. They are not links.</p>
          <ol className="grid gap-2 sm:grid-cols-2">
            {planned.map((l) => (
              <li key={l.id} className="rounded-xl border border-surface-border/70 p-3 flex items-start justify-between gap-2" data-planned-lesson={l.id} aria-disabled="true">
                <div className="min-w-0"><div className="text-[11px] font-mono text-slate-500">Unit {l.unit}: {SOUND_UNIT_TITLES[l.unit]} · Section {l.sections}</div><div className="text-sm font-bold text-slate-300">Lesson {l.number}: {l.title}</div></div>
                <span className="shrink-0 text-[11px] font-mono px-2 py-0.5 rounded-full border border-surface-border text-slate-400">Upcoming · {l.milestone}</span>
              </li>
            ))}
          </ol>
        </section>

        <details className="rounded-2xl border border-surface-border bg-surface-card p-4" data-testid="sound-chapter-map">
          <summary className="min-h-[44px] flex flex-wrap items-center justify-between gap-2 cursor-pointer">
            <span className="text-xl font-black text-white">Chapter map <span className="text-xs font-mono font-normal text-slate-400">(optional reference)</span></span>
            <span className="text-xs font-mono text-slate-300">{counts.available} available · {counts.planned} upcoming</span>
          </summary>
          <p className="text-xs text-slate-400 my-2">Checked against the textbook PDF. Rows marked enrichment are LabVerse additions that are not in the book.</p>
          <div className="overflow-x-auto"><table className="w-full text-xs text-left min-w-[560px]">
            <thead><tr className="text-slate-400"><th className="p-2">Section</th><th className="p-2">Topic</th><th className="p-2">Status</th></tr></thead>
            <tbody>{SOUND_MAP.map((r) => (
              <tr key={r.id} className="border-t border-surface-border/60 align-top" data-map-row={r.id}>
                <td className="p-2 font-mono text-slate-300 whitespace-nowrap">{r.section}</td>
                <td className="p-2 text-slate-200">{r.topic}{r.kind === 'enrichment' ? <span className="ml-1 text-[11px] text-sky-300">(enrichment)</span> : null}{r.note ? <div className="text-slate-400 mt-0.5">{r.note}</div> : null}</td>
                <td className="p-2 font-mono font-bold" data-status={r.status} style={{ color: r.status === 'planned' ? '#94A3B8' : r.status === 'laboratory' ? '#38bdf8' : '#34d399' }}>{r.status === 'planned' ? `Upcoming${r.milestone ? ` (${r.milestone})` : ''}` : r.status === 'laboratory' ? 'Laboratory' : 'Learn'}</td>
              </tr>))}</tbody>
          </table></div>
        </details>
      </main>
    </div>
  );
};

const LabShell: React.FC<{ title: string; crumb: string; mode: 'experiment'; intro: string; children: React.ReactNode; assumptions: string[] }> = ({ title, intro, children, assumptions }) => (
  <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid font-sans">
    <GlobalHeader />
    <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-4 space-y-4">
      <div className="hidden sm:block"><ChapterWorkspaceNav chapterId="sound" currentPageTitle={title} currentMode="experiment" showBackToLab={false} /></div>
      <header className="space-y-2"><h1 className="text-2xl md:text-3xl font-black text-white">{title}</h1><details className="text-sm text-slate-300"><summary className="min-h-[44px] cursor-pointer py-3">How to use this lab</summary><p className="max-w-3xl pb-2">{intro}</p></details></header>
      <InteractiveActivity>{children}</InteractiveActivity>
      <section className="rounded-2xl border border-surface-border bg-surface-card p-4 space-y-2" aria-label="What this laboratory assumes" data-testid="lab-assumptions">
        <h2 className="text-base font-black text-white">What this laboratory assumes</h2>
        <ul className="list-disc pl-5 space-y-1 text-[13px] text-slate-300">{assumptions.map((a) => <li key={a}>{a}</li>)}</ul>
      </section>
    </main>
  </div>
);

export const VibrationLabPage: React.FC = () => (
  <LabShell title="Vibration Laboratory" crumb="Vibration Laboratory" mode="experiment" intro="Pluck a rubber band stretched across a box, or strike a tuning fork. Sound is made exactly while the object vibrates." assumptions={VIBRATION_ASSUMPTIONS}>
    <VibrationPanel />
  </LabShell>
);

export const WaveLabPage: React.FC = () => (
  <LabShell title="Wave Laboratory" crumb="Wave Laboratory" mode="experiment" intro="Follow one compression along the tube and watch one marked particle: the compression travels, the particle only vibrates about its own place." assumptions={[
    'A sine wave in air at the speed the book gives for air; the picture is slowed down and the movement is exaggerated, and both are labelled on the screen.',
    'The row of dots is the air particles at rest and in motion; the strip below is the density at each place; the graph is drawn from the same wave at the same instant.',
    'Changing the frequency or the slow-motion factor restarts the picture from time zero so that nothing jumps; changing the amplitude does not.',
  ]}>
    <WavePanel />
  </LabShell>
);

// ---------------------------------------------------------------------------
// NCERT Exercises
// ---------------------------------------------------------------------------

/** Two density curves half a wavelength apart (Pause and Ponder 6): drawn, not a picture. */
const PhaseIllustration: React.FC = () => {
  const W = 300, H = 150, ml = 40, mr = 8, top = 10, bottom = H - 30;
  const pts = (shift: number) => Array.from({ length: 121 }, (_, i) => { const x = i / 120; const y = Math.sin(2 * Math.PI * (2 * x - shift)); return `${(ml + x * (W - ml - mr)).toFixed(1)},${((top + bottom) / 2 - y * ((bottom - top) / 2.4)).toFixed(1)}`; }).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" style={{ maxWidth: 440 }} role="img" aria-label="Two density graphs with the same wavelength and amplitude, the second shifted by half a wavelength so that its crests are under the troughs of the first.">
      <line x1={ml} y1={(top + bottom) / 2} x2={W - mr} y2={(top + bottom) / 2} stroke={SOUND_COLORS.average} strokeDasharray="5 4" />
      <polyline points={pts(0)} fill="none" stroke="#38bdf8" strokeWidth={2.4} />
      <polyline points={pts(0.25)} fill="none" stroke="#fb923c" strokeWidth={2.4} />
      <text x={ml + 4} y={top + 12} fontSize={13} fill="#38bdf8">(c) for strip (a)</text>
      <text x={W - mr} y={top + 12} textAnchor="end" fontSize={13} fill="#fb923c">(d) for strip (b)</text>
      <text x={(ml + W - mr) / 2} y={H - 8} textAnchor="middle" fontSize={13} fill={SOUND_COLORS.text}>Distance</text>
      <text transform={`rotate(-90 12 ${(top + bottom) / 2})`} x={12} y={(top + bottom) / 2} textAnchor="middle" fontSize={13} fill={SOUND_COLORS.text}>Density</text>
    </svg>
  );
};

const ExerciseCard: React.FC<{ e: SoundExercise }> = ({ e }) => {
  const solved = e.parts.filter((p) => p.status === 'solved').length;
  const label = e.kind === 'exercise' ? `Exercise ${e.number}` : `Pause and Ponder ${e.number}`;
  return (
    <li className="rounded-2xl border border-surface-border bg-surface-card" data-exercise={`${e.kind}-${e.number}`} data-status={solved === e.parts.length ? 'solved' : 'upcoming'}>
      <details className="group">
        <summary className="cursor-pointer min-h-[56px] p-4 flex flex-wrap items-center justify-between gap-2">
          <span className="min-w-0"><span className="text-xs font-mono text-slate-400 block">{label} · Section {e.sections.join(', ')}</span><span className="font-bold text-white text-sm sm:text-base break-words">{e.topic}</span></span>
          <span className={`shrink-0 text-[11px] font-mono px-2.5 py-1 rounded-full border ${solved === e.parts.length ? 'border-emerald-500/50 text-emerald-300' : 'border-surface-border text-slate-400'}`}>{solved === e.parts.length ? 'Solved' : `Upcoming`}</span>
        </summary>
        <div className="px-4 pb-4 space-y-3">
          <p className="text-sm text-slate-300">{e.summary}</p>
          {e.parts.map((p) => (
            <div key={p.id} className="rounded-xl border border-surface-border/70 p-3 space-y-2" data-part={p.id} data-part-status={p.status}>
              {e.parts.length > 1 && <div className="text-xs font-mono text-slate-400">{p.label}</div>}
              {p.status === 'solved' && p.solution ? (
                <div className="space-y-2 text-sm text-slate-200">
                  <p><strong className="text-white">Principle: </strong>{p.solution.principle}</p>
                  <ol className="list-decimal pl-5 space-y-1.5">{p.solution.steps.map((s, i) => <li key={i}>{s.text}<span className="block text-xs text-slate-400"><em>Why: </em>{s.why}</span></li>)}</ol>
                  {p.solution.illustration === 'phase' && <PhaseIllustration />}
                  <p className="rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-3 py-2 text-emerald-100"><strong>Answer: </strong>{p.solution.answer}</p>
                  <p><strong className="text-white">What it means: </strong>{p.solution.meaning}</p>
                  <p className="text-xs text-slate-400"><strong>Common mistake: </strong>{p.solution.commonMistake}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-400" data-testid="upcoming-part">Upcoming: this part needs {p.needs}. No solution is shown until the lesson that teaches it exists.</p>
              )}
            </div>
          ))}
        </div>
      </details>
    </li>
  );
};

export const SoundExercises: React.FC = () => {
  const c = soundExerciseCounts();
  const exercises = SOUND_EXERCISES.filter((e) => e.kind === 'exercise');
  const ponders = SOUND_EXERCISES.filter((e) => e.kind === 'ponder');
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid font-sans" data-chapter="sound-exercises">
      <GlobalHeader />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        <ChapterWorkspaceNav chapterId="sound" currentPageTitle="NCERT Exercises" currentMode="exercises" showBackToLab />
        <header className="space-y-2">
          <h1 className="text-3xl font-black text-white">NCERT Exercises: Sound Waves</h1>
          <p className="text-sm text-slate-300 max-w-3xl">The chapter ends with {c.exercises} exercises ({c.exerciseParts} answer parts) and has {c.ponders} Pause and Ponder items. <strong>{c.exercisesSolved} exercises and {c.pondersSolved} Pause and Ponder items are solved so far</strong>: the others need lessons that are not built yet and are marked Upcoming with no solution.</p>
          <p className="text-xs text-slate-400">Opening a solution never changes your lesson progress. Solutions are written in LabVerse&apos;s own words.</p>
        </header>
        <section aria-label="Exercises" className="space-y-3"><h2 className="text-xl font-black text-white">Revise, Reflect, Refine: {c.exercises} exercises</h2><ol className="space-y-3" data-testid="sound-exercise-list">{exercises.map((e) => <ExerciseCard key={`e${e.number}`} e={e} />)}</ol></section>
        <section aria-label="Pause and Ponder" className="space-y-3"><h2 className="text-xl font-black text-white">Pause and Ponder: {c.ponders} items</h2><ol className="space-y-3" data-testid="sound-ponder-list">{ponders.map((e) => <ExerciseCard key={`p${e.number}`} e={e} />)}</ol></section>
      </main>
    </div>
  );
};
import { InteractiveActivity } from '../../../components/InteractiveActivity';
