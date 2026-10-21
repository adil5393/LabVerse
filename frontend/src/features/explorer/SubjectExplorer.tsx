import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GlobalHeader } from '../../components/GlobalHeader';
import { LABVERSE_SUBJECTS } from '../../types/subjectRegistry';
import { CHAPTER_REGISTRY, useChapterNavigationStore } from '../workspace/chapterNavigation';
import { BottomSheet } from '../workspace/BottomSheet';

const descriptions: Record<string, string> = {
  physics: 'Discover motion, forces, energy, sound and circuits.',
  mathematics: 'Explore shapes, equations, reasoning and data.',
  chemistry: 'See how particles move and matter changes.',
};
const icons: Record<string, string> = { motion: 'directions_run', forces: 'open_with', work: 'bolt', sound: 'graphic_eq', electricity: 'electrical_services', 'coordinate-geometry': 'grid_4x4', circles: 'circle', quadrilaterals: 'crop_square', propositions: 'psychology', 'two-variables': 'show_chart', 'understanding-data': 'bar_chart', 'states-of-matter': 'science' };

function CartIllustration() {
  return <svg viewBox="0 0 240 145" role="img" aria-label="A cart on a measuring track" className="explore-feature__art">
    <path d="M8 113H232" stroke="#8cae9d" strokeWidth="4" strokeLinecap="round" />
    {[30,60,90,120,150,180,210].map((x) => <path key={x} d={`M${x} 117v8`} stroke="#8cae9d" strokeWidth="2" />)}
    <rect x="65" y="56" width="112" height="43" rx="10" fill="#008c88" />
    <rect x="75" y="61" width="92" height="5" rx="2" fill="#7cddd0" />
    <circle cx="89" cy="101" r="12" fill="#183e4d" /><circle cx="89" cy="101" r="5" fill="#b3cdc3" />
    <circle cx="154" cy="101" r="12" fill="#183e4d" /><circle cx="154" cy="101" r="5" fill="#b3cdc3" />
    <path d="M179 41h39m-10-8 10 8-10 8" fill="none" stroke="#008c88" strokeWidth="3" strokeLinecap="round" />
  </svg>;
}

export const SubjectExplorer: React.FC = () => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [guide, setGuide] = useState(false);
  const contexts = useChapterNavigationStore((s) => s.contexts);
  const recentId = Object.keys(contexts).filter((id) => CHAPTER_REGISTRY[id]).sort((a, b) => contexts[b].lastTimestamp - contexts[a].lastTimestamp)[0];
  const recent = recentId ? CHAPTER_REGISTRY[recentId] : undefined;
  const destination = recentId ? useChapterNavigationStore.getState().getLabDestination(recentId).url : '/physics/motion';
  const needle = query.trim().toLowerCase();
  const chapters = Object.values(CHAPTER_REGISTRY).filter((c) => (filter === 'all' || c.subject === filter) && (!needle || `${c.shortTitle} ${c.title} ${c.subjectTitle}`.toLowerCase().includes(needle)));
  const subjects = LABVERSE_SUBJECTS.filter((s) => s.status === 'ready' && (filter === 'all' || s.id === filter) && (!needle || `${s.name} ${descriptions[s.id]}`.toLowerCase().includes(needle)));
  return <div className="min-h-dvh bg-background text-on-surface">
    <GlobalHeader onOpenGuide={() => setGuide(!guide)} />
    <main className="explore-page">
      <p className="text-sm text-primary font-semibold mb-2">A little curiosity goes a long way</p>
      <h1 className="explore-heading">What will you discover?</h1>
      <p className="text-slate-400 mt-3 max-w-xl">Learn an idea. Try it for yourself. Make it click.</p>
      <label className="explore-search">
        <span className="material-symbols-outlined text-slate-400" aria-hidden>search</span>
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a subject or chapter" aria-label="Find a subject or chapter" />
      </label>
      {!needle && filter === 'all' && <section className="explore-feature" aria-label={recent ? 'Continue exploring' : 'Start exploring'}>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">{recent ? 'Pick up where you left off' : 'Start with a question'}</p>
          <h2 className="text-xl sm:text-3xl font-bold mt-2">{recent ? recent.shortTitle : 'How do we describe motion?'}</h2>
          <p className="text-sm text-slate-300 mt-2 mb-4">{recent ? 'Your last laboratory is ready to explore again.' : 'Discover distance, displacement and speed with a moving cart.'}</p>
          <Link to={destination} className="experience-primary">{recent ? 'Return to lab' : 'Explore motion'}<span className="material-symbols-outlined text-[18px]" aria-hidden>arrow_forward</span></Link>
        </div>
        <CartIllustration />
      </section>}
      <section aria-labelledby="subjects-heading" className="mt-7">
        <div className="flex items-center justify-between gap-3 mb-4"><h2 id="subjects-heading" className="text-xl font-bold">Explore subjects</h2><span className="text-xs text-slate-400">Learn at your pace</span></div>
        <div className="subject-grid">
          {subjects.map((s) => <Link key={s.id} to={s.id === 'physics' ? '/physics' : s.route!} data-testid={s.id === 'physics' ? 'physics-chapters-link' : undefined} className="subject-card">
            <span className="subject-card__icon"><span className="material-symbols-outlined text-[26px]" aria-hidden>{s.icon}</span></span>
            <div><h3 className="text-lg font-bold">{s.name}</h3><p className="subject-card__description text-sm text-slate-400 mt-2">{descriptions[s.id]}</p></div>
            <span className="material-symbols-outlined text-primary md:ml-auto" aria-hidden>chevron_right</span>
          </Link>)}
        </div>
      </section>
      <section className="mt-8" aria-labelledby="chapters-heading">
        <h2 id="chapters-heading" className="text-xl font-bold mb-4">Find your next discovery</h2>
        <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Filter chapters by subject">
          {[['all','All'],['physics','Physics'],['mathematics','Maths'],['chemistry','Chemistry']].map(([id,label]) => <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)} className={`min-h-11 px-4 rounded-full text-sm font-semibold border ${filter === id ? 'bg-primary text-on-primary border-primary' : 'bg-surface border-surface-border text-slate-300'}`}>{label}</button>)}
        </div>
        <div className="chapter-grid">
          {chapters.map((c) => <Link key={c.id} to={c.chapterUrl} className="chapter-link"><span className="material-symbols-outlined text-primary" aria-hidden>{icons[c.id] || 'science'}</span><div className="min-w-0"><h3 className="font-semibold">{c.shortTitle}</h3><p className="text-xs text-slate-400 mt-1">{c.subjectTitle}</p></div></Link>)}
        </div>
        {!chapters.length && <p role="status" className="p-6 bg-surface border border-surface-border rounded-2xl text-slate-300">No chapters match. Try a different search or subject.</p>}
      </section>
      {guide && <BottomSheet title="A simple way to explore" onClose={() => setGuide(false)}><div className="space-y-4">
        <p>Choose a chapter, learn the idea, then open its lab. Change the setup and compare your results. Practice is available whenever you feel ready.</p>
        <p className="text-sm text-slate-400">Progress is kept in this browser. Export experiments where available to keep a separate copy.</p>
        <button type="button" className="experience-primary" onClick={() => setGuide(false)}>Got it</button>
      </div></BottomSheet>}
      <footer className="mt-10 pt-5 border-t border-surface-border text-sm text-slate-400">Made for curious minds. Biology and robotics are coming later.</footer>
    </main>
  </div>;
};

