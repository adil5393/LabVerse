import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../../../store/useAuthStore';

export type WorkspaceTab = 'learn' | 'experiment' | 'analyze' | 'exercises' | 'blackboard';
export interface WorkstationHeaderProps {
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  beginnerMode?: boolean;
  onToggleBeginnerMode?: (val: boolean) => void;
  onReset?: () => void;
  onTogglePlay?: () => void;
  playing?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onToggleFullscreen?: () => void;
  onOpenMobileDrawer?: () => void;
  onOpenInspector?: () => void;
  chapterTitle?: string;
  labTitle?: string;
  chapterUrl?: string;
}

export const WorkstationHeader: React.FC<WorkstationHeaderProps> = ({
  activeTab, onTabChange, beginnerMode = false, onToggleBeginnerMode, onReset, onTogglePlay,
  playing = false, onUndo, onRedo, canUndo = false, canRedo = false,
  onToggleFullscreen, onOpenMobileDrawer, onOpenInspector,
  chapterTitle = 'Work, Energy & Machines', labTitle = 'Work Laboratory', chapterUrl = '/physics/work',
}) => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [menuOpen, setMenuOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const change = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', change);
    return () => document.removeEventListener('fullscreenchange', change);
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: Event) => {
      if (event instanceof KeyboardEvent) {
        if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); }
      } else if (!menu.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('keydown', close); document.addEventListener('pointerdown', close);
    return () => { document.removeEventListener('keydown', close); document.removeEventListener('pointerdown', close); };
  }, [menuOpen]);
  const run = (action: () => void) => { setMenuOpen(false); action(); };
  const toggleFullscreen = () => {
    if (onToggleFullscreen) return onToggleFullscreen();
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.().catch(() => {});
  };
  const subject = chapterUrl.split('/')[1];
  const subjectName = subject === 'mathematics' ? 'Mathematics' : subject === 'chemistry' ? 'Chemistry' : 'Physics';
  const tabs: { id: WorkspaceTab; label: string; icon: string }[] = [
    { id: 'learn', label: 'Learn', icon: 'menu_book' },
    { id: 'experiment', label: 'Experiment', icon: 'science' },
    { id: 'exercises', label: 'Practice', icon: 'edit_note' },
  ];
  return <header className="workstation-header app-chrome shrink-0 bg-surface text-on-surface z-40">
    <div className="workstation-top">
      <Link to={chapterUrl} className="experience-icon-button" aria-label="Back to chapter" title={`Back to ${chapterTitle}`}><span className="material-symbols-outlined" aria-hidden>arrow_back</span></Link>
      <Link to="/" className="hidden lg:flex experience-brand text-lg">LabVerse</Link>
      <div className="min-w-0 flex-1">
        <nav aria-label="Workstation breadcrumb" className="hidden md:flex text-xs text-slate-400 gap-2">
          <Link to={`/${subject}`}>{subjectName}</Link><span>/</span><Link to={chapterUrl} className="truncate">{chapterTitle}</Link>
        </nav>
        <h1 className="font-bold text-sm md:text-base truncate" title={labTitle}>{labTitle}</h1>
      </div>
      {onTogglePlay && <button type="button" onClick={onTogglePlay} className="hidden md:flex experience-primary py-2 min-h-11" aria-label={playing ? 'Pause simulation' : 'Play simulation'}><span className="material-symbols-outlined" aria-hidden>{playing ? 'pause' : 'play_arrow'}</span>{playing ? 'Pause' : 'Play'}</button>}
      <div className="hidden lg:flex items-center gap-2">
        {onReset && <button type="button" onClick={onReset} className="experience-icon-button">Reset</button>}
        {onUndo && <button type="button" onClick={onUndo} disabled={!canUndo} title="Undo parameter change (Ctrl+Z)" aria-label="Undo parameter change" className="experience-icon-button disabled:opacity-40"><span className="material-symbols-outlined" aria-hidden>undo</span></button>}
        {onRedo && <button type="button" onClick={onRedo} disabled={!canRedo} aria-label="Redo parameter change" className="experience-icon-button disabled:opacity-40"><span className="material-symbols-outlined" aria-hidden>redo</span></button>}
        {onToggleBeginnerMode && <button type="button" onClick={() => onToggleBeginnerMode(!beginnerMode)} aria-pressed={beginnerMode} className="experience-icon-button" title="Switch detail level">{beginnerMode ? 'Beginner' : 'Advanced'}</button>}
      </div>
      <div className="relative" ref={menu}>
        <button ref={menuButton} type="button" onClick={() => setMenuOpen(!menuOpen)} className="experience-icon-button" aria-label="More" aria-expanded={menuOpen} aria-controls="workspace-more" data-testid="header-menu-button"><span className="material-symbols-outlined" aria-hidden>more_vert</span></button>
        {menuOpen && <div id="workspace-more" data-testid="header-menu" className="absolute right-0 top-full mt-2 w-64 max-w-[calc(100vw-1rem)] max-h-[70dvh] overflow-y-auto bg-surface rounded-2xl border border-surface-border shadow-xl p-2 z-50">
          <p className="px-3 py-2 text-xs text-slate-400">More ways to explore</p>
          {[...tabs, { id: 'analyze' as const, label: 'Analyze', icon: 'analytics' }, { id: 'blackboard' as const, label: 'Blackboard', icon: 'edit' }].map((tab) => <button key={tab.id} type="button" aria-pressed={activeTab === tab.id} onClick={() => run(() => onTabChange(tab.id))} className="w-full min-h-12 flex items-center gap-3 px-3 rounded-xl text-sm hover:bg-surface-high"><span className="material-symbols-outlined" aria-hidden>{tab.icon}</span>{tab.label}</button>)}
          {onOpenMobileDrawer && <button type="button" onClick={() => run(onOpenMobileDrawer)} className="w-full min-h-12 px-3 text-left text-sm hover:bg-surface-high rounded-xl">Experiments & equipment</button>}
          {onOpenInspector && <button type="button" onClick={() => run(onOpenInspector)} className="w-full min-h-12 px-3 text-left text-sm hover:bg-surface-high rounded-xl">Properties</button>}
          {onUndo && <button type="button" disabled={!canUndo} onClick={() => run(onUndo)} className="w-full min-h-12 px-3 text-left text-sm disabled:opacity-40 hover:bg-surface-high rounded-xl">Undo</button>}
          {onRedo && <button type="button" disabled={!canRedo} onClick={() => run(onRedo)} className="w-full min-h-12 px-3 text-left text-sm disabled:opacity-40 hover:bg-surface-high rounded-xl">Redo</button>}
          {onReset && <button type="button" onClick={() => run(onReset)} className="w-full min-h-12 px-3 text-left text-sm hover:bg-surface-high rounded-xl">Reset</button>}
          {onToggleBeginnerMode && <div role="group" aria-label="Workstation detail level" className="border-t border-surface-border mt-2 pt-2 grid grid-cols-2 gap-2">
            {[['Beginner', true], ['Advanced', false]].map(([label,value]) => <button key={String(label)} type="button" aria-pressed={beginnerMode === value} onClick={() => onToggleBeginnerMode(Boolean(value))} className={`min-h-11 text-sm rounded-xl ${beginnerMode === value ? 'bg-primary text-on-primary' : 'bg-surface-high'}`}>{label}</button>)}
          </div>}
          <button type="button" onClick={() => run(toggleFullscreen)} className="w-full min-h-12 px-3 text-left text-sm hover:bg-surface-high rounded-xl">{fullscreen ? 'Exit fullscreen' : 'Fullscreen'}</button>
          <button type="button" data-testid="header-signout" onClick={() => run(logout)} className="w-full min-h-12 px-3 text-left text-sm border-t border-surface-border mt-1">Sign out{user ? ` (${user})` : ''}</button>
        </div>}
      </div>
    </div>
    <nav className="workstation-modes" role="tablist" aria-label="Workstation modes">
      {tabs.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} onClick={() => onTabChange(tab.id)}><span className="material-symbols-outlined text-[18px]" aria-hidden>{tab.icon}</span>{tab.id === 'experiment' ? <><span className="md:hidden">Lab</span><span className="hidden md:inline">Experiment</span></> : tab.label}</button>)}
      <button type="button" role="tab" aria-selected={activeTab === 'analyze'} onClick={() => onTabChange('analyze')} className="!hidden md:!flex">Analyze</button>
      <button type="button" role="tab" aria-selected={activeTab === 'blackboard'} onClick={() => onTabChange('blackboard')} className="!hidden md:!flex">Blackboard</button>
    </nav>
  </header>;
};
