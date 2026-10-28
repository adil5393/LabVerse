/**
 * A subject landing page built entirely from the curriculum registry: every chapter of the subject in book order, with its
 * real status (built chapters link to their hub; chapters not built yet are listed and say so, without a link), the board
 * unit and marks, connected chapters from other subjects, and supporting material that is not part of the syllabus.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { GlobalHeader } from '../../components/GlobalHeader';
import { ACTIVE_CURRICULUM, chaptersFor } from '../../engine/curriculum';
import type { CurriculumChapter, SubjectArea } from '../../engine/curriculum/types';

const STATUS_TEXT: Record<string, string> = { complete: 'Ready', partial: 'Ready (some parts in progress)', 'not-started': 'Not built yet', 'optional-support': 'Optional' };

const ChapterCard: React.FC<{ c: CurriculumChapter }> = ({ c }) => {
  const built = c.implementation.status !== 'not-started' && Boolean(c.route);
  const body = (
    <div className={`h-full rounded-2xl border p-4 space-y-2 ${built ? 'border-surface-border bg-surface-card hover:border-emerald-500/50' : 'border-surface-border/50 bg-surface-card/40'}`}>
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-mono text-emerald-300">{c.number ? `Chapter ${c.number}` : 'CBSE topic'}</span>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${built ? 'border-emerald-500/40 text-emerald-200' : 'border-surface-border text-slate-400'}`} data-status={c.implementation.status}>{STATUS_TEXT[c.implementation.status]}</span>
      </div>
      <h2 className={`text-lg font-bold ${built ? 'text-white' : 'text-slate-300'}`}>{c.title}</h2>
      {c.boardTitle && c.boardTitle !== c.title && <p className="text-xs text-slate-400">CBSE: {c.boardTitle}</p>}
      {c.boardUnit && <p className="text-xs text-slate-400">Unit {c.boardUnit}{c.boardUnitMarks ? ` · ${c.boardUnitMarks} marks` : ''}</p>}
      {built && <p className="text-xs text-slate-300">{c.implementation.lessons} lessons{c.implementation.labs.length ? ` · ${c.implementation.labs.length} laborator${c.implementation.labs.length === 1 ? 'y' : 'ies'}` : ''}{c.implementation.practice ? ' · practice' : ''}{c.implementation.assessment ? ' · assessment' : ''}</p>}
      {c.implementation.note && <p className="text-xs text-slate-400">{c.implementation.note}</p>}
    </div>
  );
  return built
    ? <li><Link to={c.route!} data-chapter={c.id} className="block h-full min-h-[48px]">{body}</Link></li>
    : <li data-chapter={c.id} aria-disabled="true">{body}</li>;
};

export const SubjectChaptersPage: React.FC<{ subject: SubjectArea; title: string; intro: string; testId: string }> = ({ subject, title, intro, testId }) => {
  const chapters = chaptersFor(subject);
  const support = ACTIVE_CURRICULUM.supportingMaterial.filter((s) => s.subject === subject);
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid font-sans">
      <GlobalHeader />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6" data-testid={testId}>
        <nav className="text-sm"><Link to="/" className="inline-flex items-center min-h-[44px] text-slate-300 hover:text-white">← All subjects</Link></nav>
        <header className="space-y-2">
          <p className="text-xs font-mono uppercase tracking-wider text-emerald-300">Class 9 · {ACTIVE_CURRICULUM.board} {ACTIVE_CURRICULUM.academicYear}</p>
          <h1 className="text-2xl md:text-3xl font-black text-white">{title}</h1>
          <p className="text-sm text-slate-300 max-w-3xl">{intro}</p>
        </header>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-label={`${title} chapters`}>
          {chapters.map((c) => <ChapterCard key={c.id} c={c} />)}
        </ul>
        {support.length > 0 && (
          <section className="space-y-2" aria-label="Supporting material" data-testid="supporting-material">
            <h2 className="text-base font-black text-white">Supporting material (not a syllabus chapter)</h2>
            <ul className="space-y-2">
              {support.map((s) => (
                <li key={s.id}><Link to={s.route} className="block min-h-[48px] rounded-xl border border-surface-border bg-surface-card p-3 hover:border-cyan-400/60"><strong className="text-white text-sm">{s.title}</strong><span className="block text-xs text-slate-400">{s.reason}</span></Link></li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
};
