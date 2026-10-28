import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LABVERSE_SUBJECTS } from '../types/subjectRegistry';
import { useAuthStore } from '../store/useAuthStore';
import { CHAPTER_REGISTRY, useChapterNavigationStore } from '../features/workspace/chapterNavigation';

interface GlobalHeaderProps { onOpenGuide?: () => void; onImportLab?: () => void }
export const GlobalHeader: React.FC<GlobalHeaderProps> = ({ onOpenGuide, onImportLab }) => {
  const { pathname } = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const contexts = useChapterNavigationStore((s) => s.contexts);
  const chapter = Object.values(CHAPTER_REGISTRY).filter((c) => pathname === c.chapterUrl || pathname.startsWith(c.chapterUrl + '/')).sort((a, b) => b.chapterUrl.length - a.chapterUrl.length)[0];
  const practicing = /\/(practice|exercises)(\/|$)/.test(pathname);
  const inLab = /\/lab(\/|$)/.test(pathname);
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: Event) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !menu.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', close);
    document.addEventListener('pointerdown', close);
    return () => { document.removeEventListener('keydown', close); document.removeEventListener('pointerdown', close); };
  }, [open]);
  const subjects = LABVERSE_SUBJECTS.filter((s) => s.status === 'ready');
  const route = (id: string, fallback: string) => id === 'physics' ? '/physics' : fallback;
  return <header className="experience-header sticky top-0 z-40 app-chrome">
    <div className="experience-header__inner">
      <Link to="/" className="experience-brand" aria-label="LabVerse home">
        <span className="experience-brand__icon"><span className="material-symbols-outlined" aria-hidden>science</span></span>LabVerse
      </Link>
      <nav className="experience-nav" aria-label="Subjects">
        <Link to="/" aria-current={pathname === '/' ? 'page' : undefined}>Explore</Link>
        {subjects.map((s) => <Link key={s.id} to={route(s.id, s.route!)} aria-current={pathname.startsWith('/' + s.id) ? 'page' : undefined}>{s.name}</Link>)}
      </nav>
      <div className="flex items-center gap-2 ml-auto lg:ml-0">
        {onImportLab && <button type="button" className="experience-icon-button" onClick={onImportLab} aria-label="Import saved lab"><span className="material-symbols-outlined" aria-hidden>file_upload</span></button>}
        {onOpenGuide && <button type="button" className="experience-icon-button" onClick={onOpenGuide} aria-label="Open lab guide"><span className="material-symbols-outlined" aria-hidden>help_outline</span></button>}
        <div className="relative" ref={menu}>
          <button type="button" className="experience-icon-button" aria-expanded={open} aria-controls="subject-menu" onClick={() => setOpen(!open)} aria-label="Open navigation and account">
            <span className="material-symbols-outlined" aria-hidden>{open ? 'close' : 'menu'}</span>
          </button>
          {open && <div id="subject-menu" className="absolute right-0 top-full mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-2xl border border-surface-border bg-surface p-2 shadow-xl max-h-[70dvh] overflow-y-auto">
            <p className="px-3 py-2 text-xs text-slate-400">Explore your subjects</p>
            <Link to="/" className="flex items-center gap-3 min-h-12 px-3 rounded-xl hover:bg-surface-high" onClick={() => setOpen(false)}><span className="material-symbols-outlined" aria-hidden>explore</span>All subjects</Link>
            {subjects.map((s) => <Link key={s.id} to={route(s.id, s.route!)} className="flex items-center gap-3 min-h-12 px-3 rounded-xl hover:bg-surface-high" onClick={() => setOpen(false)}><span className="material-symbols-outlined text-primary" aria-hidden>{s.icon}</span>{s.name}</Link>)}
            <div className="border-t border-surface-border mt-2 pt-2">
              {user && <p className="px-3 py-2 text-xs text-slate-400 break-words">Signed in as {user}</p>}
              <button type="button" data-testid="signout" onClick={logout} className="flex items-center gap-3 min-h-12 px-3 w-full rounded-xl hover:bg-surface-high text-left"><span className="material-symbols-outlined" aria-hidden>logout</span>Sign out</button>
            </div>
          </div>}
        </div>
      </div>
    </div>
    {chapter && <nav className="chapter-journey" aria-label="Chapter learning journey">
      <Link to={contexts[chapter.id]?.lastLessonUrl || chapter.defaultLearnUrl} aria-current={!practicing && !inLab ? 'page' : undefined}><span className="material-symbols-outlined text-[18px]" aria-hidden>menu_book</span>Learn</Link>
      <Link to={useChapterNavigationStore.getState().getLabDestination(chapter.id).url} aria-current={inLab ? 'page' : undefined}><span className="material-symbols-outlined text-[18px]" aria-hidden>science</span>Lab</Link>
      {(chapter.defaultPracticeUrl || chapter.defaultExercisesUrl) && <Link to={chapter.defaultPracticeUrl || chapter.defaultExercisesUrl!} aria-current={practicing ? 'page' : undefined}><span className="material-symbols-outlined text-[18px]" aria-hidden>edit_note</span>Practice</Link>}
    </nav>}
  </header>;
};
