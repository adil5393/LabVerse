import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../../../store/useAuthStore';

export type WorkspaceTab = 'learn' | 'experiment' | 'analyze' | 'exercises' | 'blackboard';

export interface WorkstationHeaderProps {
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  beginnerMode?: boolean;
  /** Each of these is optional: a control whose handler is not given is not shown (no dead buttons). */
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
  /** Opens the Inspector as a sheet (small screens); shown in the overflow menu when given. */
  onOpenInspector?: () => void;
  chapterTitle?: string;
  labTitle?: string;
  chapterUrl?: string;
}

/**
 * WorkstationHeader: Blender-inspired top application bar matching Stitch design.
 * Features brand icon, chapter breadcrumb, segmented mode tabs (Learn, Experiment,
 * Analyze, Exercises, Blackboard), beginner/advanced toggle, transport actions, and utility icons.
 */
export const WorkstationHeader: React.FC<WorkstationHeaderProps> = ({
  activeTab,
  onTabChange,
  beginnerMode = false,
  onToggleBeginnerMode,
  onReset,
  onTogglePlay,
  playing = false,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onToggleFullscreen,
  onOpenMobileDrawer,
  onOpenInspector,
  chapterTitle = 'Ch. 7 Work, Energy & Machines',
  labTitle = 'Work Laboratory',
  chapterUrl,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const signedInUser = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.logout);
  // Small screens: the modes, detail level and secondary actions live in one overflow menu instead of overflowing the bar.
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', close); };
  }, [menuOpen]);
  const run = (fn?: () => void) => () => { setMenuOpen(false); fn?.(); };
  const TABS: { id: WorkspaceTab; label: string; icon: string }[] = [
    { id: 'learn', label: 'Learn', icon: 'menu_book' },
    { id: 'experiment', label: 'Experiment', icon: 'science' },
    { id: 'analyze', label: 'Analyze', icon: 'analytics' },
    { id: 'exercises', label: 'Exercises', icon: 'assignment' },
    { id: 'blackboard', label: 'Blackboard', icon: 'edit' },
  ];
  const menuItem = 'w-full min-h-[44px] px-3 flex items-center gap-2.5 text-left text-xs font-medium rounded-lg transition-colors disabled:opacity-40 disabled:pointer-events-none';

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const handleFullscreenClick = () => {
    if (onToggleFullscreen) {
      onToggleFullscreen();
    } else {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  return (
    <header className="relative flex justify-between items-center gap-1 w-full px-2 sm:px-4 h-10 border-b border-outline-variant bg-surface-container shrink-0 z-50 select-none">
      {/* Left: Brand + Breadcrumb Navigation */}
      <div className="flex items-center space-x-1 sm:space-x-3 shrink-0">
        {/* Mobile Back Navigation: Returns to chapter or parent catalogue */}
        <Link
          to={chapterUrl || '/'}
          className="sm:hidden p-1.5 -ml-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors flex items-center justify-center"
          title={`Back to ${chapterTitle || 'Chapter'}`}
          aria-label="Back to chapter"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        </Link>

        {/* Mobile Drawer Trigger (visible on mobile only if drawer given) */}
        {onOpenMobileDrawer && (
          <button
            type="button"
            onClick={onOpenMobileDrawer}
            className="md:hidden p-1.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
            aria-label="Toggle curriculum drawer"
          >
            <span className="material-symbols-outlined text-[18px]">menu</span>
          </button>
        )}

        <div className="flex items-center space-x-1.5">
          <span className="text-primary flex items-center justify-center p-1 rounded bg-surface-container-high border border-outline-variant">
            <span className="material-symbols-outlined text-primary text-[16px] sm:text-[18px]">science</span>
          </span>
          <Link to="/" className="hidden sm:inline text-xs sm:text-sm font-semibold tracking-tight text-primary hover:text-white transition-colors">
            LabVerse
          </Link>
          <span className="sm:hidden text-xs font-semibold text-on-surface truncate max-w-[34vw]" title={labTitle}>{labTitle}</span>
        </div>

        <div className="hidden sm:block h-3.5 w-px bg-outline-variant" />

        {/* Breadcrumbs (Desktop) */}
        <nav className="hidden sm:flex items-center space-x-1.5 text-[11px] font-mono text-on-surface-variant" aria-label="Workstation breadcrumb">
          <Link to="/physics" className="hover:text-on-surface transition-colors">
            Physics
          </Link>
          <span className="text-outline">/</span>
          <Link to={chapterUrl || "/physics/work"} className="hover:text-on-surface transition-colors truncate max-w-[170px]" title={chapterTitle}>
            {chapterTitle}
          </Link>
          <span className="text-outline">/</span>
          <span className="text-primary font-medium">{labTitle}</span>
        </nav>
      </div>

      {/* Center: Workspace Mode Tabs & Beginner/Advanced Toggle */}
      <div className="hidden md:flex items-center space-x-3 h-full overflow-x-auto no-scrollbar mx-1">
        <div className="flex items-center space-x-0.5 sm:space-x-1 h-full pt-0.5" role="tablist" aria-label="Workstation modes">
          {/* Learn Tab */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'learn'}
            onClick={() => onTabChange('learn')}
            className={`px-1.5 sm:px-3 h-full flex items-center text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'learn'
                ? 'border-b-2 border-primary text-primary bg-surface-variant/40 font-semibold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
            }`}
          >
            Learn
          </button>

          {/* ACTIVE Experiment Tab */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'experiment'}
            onClick={() => onTabChange('experiment')}
            className={`px-1.5 sm:px-3 h-full flex items-center text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'experiment'
                ? 'border-b-2 border-primary text-primary bg-surface-variant/40 font-semibold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
            }`}
          >
            {activeTab === 'experiment' && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary mr-1 animate-pulse" />
            )}
            Experiment
          </button>

          {/* Analyze Tab */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'analyze'}
            onClick={() => onTabChange('analyze')}
            className={`px-1.5 sm:px-3 h-full flex items-center text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'analyze'
                ? 'border-b-2 border-primary text-primary bg-surface-variant/40 font-semibold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
            }`}
          >
            {activeTab === 'analyze' && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-tertiary mr-1" />
            )}
            Analyze
          </button>

          {/* Exercises Tab */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'exercises'}
            onClick={() => onTabChange('exercises')}
            className={`hidden md:flex px-2 sm:px-3 h-full items-center text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'exercises'
                ? 'border-b-2 border-primary text-primary bg-surface-variant/40 font-semibold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
            }`}
          >
            Exercises
          </button>

          {/* Blackboard Tab */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'blackboard'}
            onClick={() => onTabChange('blackboard')}
            className={`px-1.5 sm:px-3 h-full flex items-center text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'blackboard'
                ? 'border-b-2 border-primary text-primary bg-surface-variant/40 font-semibold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[14px] mr-1">edit</span>
            <span>Blackboard</span>
          </button>
        </div>

        {/* Mode Toggle Pill (Beginner vs Advanced) */}
        {onToggleBeginnerMode && <div className="hidden lg:flex items-center bg-surface-container-lowest border border-outline-variant rounded p-0.5 font-mono text-[10px]" role="group" aria-label="Workstation detail level">
          <button
            type="button"
            onClick={() => onToggleBeginnerMode(true)}
            aria-pressed={beginnerMode}
            className={`px-2 py-0.5 rounded transition-colors ${
              beginnerMode ? 'bg-primary text-on-primary font-semibold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Beginner
          </button>
          <button
            type="button"
            onClick={() => onToggleBeginnerMode(false)}
            aria-pressed={!beginnerMode}
            className={`px-2 py-0.5 rounded transition-colors ${
              !beginnerMode ? 'bg-primary text-on-primary font-semibold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Advanced
          </button>
        </div>}
      </div>

      {/* Right: Transport, Undo/Redo, Utility Actions & Avatar */}
      <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
        {/* Undo / Redo */}
        {(onUndo || onRedo) && <div className="hidden md:flex items-center border-r border-outline-variant pr-1.5 space-x-0.5">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors disabled:opacity-40 disabled:pointer-events-none"
            title="Undo parameter change (Ctrl+Z)"
          >
            <span className="material-symbols-outlined text-[16px]">undo</span>
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors disabled:opacity-40 disabled:pointer-events-none"
            title="Redo parameter change (Ctrl+Y)"
          >
            <span className="material-symbols-outlined text-[16px]">redo</span>
          </button>
        </div>}

        {/* Action Buttons: Reset & Run Sim */}
        {onReset && <button
          type="button"
          onClick={onReset}
          className="hidden md:inline-flex px-2.5 py-1 bg-surface-container-high border border-outline-variant text-on-surface rounded font-mono text-xs hover:border-primary transition-colors active:translate-y-px"
        >
          Reset
        </button>}

        {onTogglePlay && <button
          type="button"
          onClick={onTogglePlay}
          className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1 max-sm:min-h-[36px] font-mono text-xs font-semibold rounded shadow-sm transition-all active:translate-y-px shrink-0 ${
            playing
              ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
              : 'bg-primary text-on-primary hover:bg-primary-light'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">
            {playing ? 'pause' : 'play_arrow'}
          </span>
          <span className="hidden sm:inline">{playing ? 'Pause' : 'Run Sim'}</span>
          <span className="sm:hidden">{playing ? 'Pause' : 'Run'}</span>
        </button>}

        {/* Trailing Action Icons */}
        <div className="hidden md:flex items-center space-x-0.5 pl-1">
          <button
            type="button"
            onClick={handleFullscreenClick}
            className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            <span className="material-symbols-outlined text-[16px]">
              {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
            </span>
          </button>
          <Link
            to="/physics/work/exercises"
            className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
            title="NCERT Exercises"
          >
            <span className="material-symbols-outlined text-[16px]">help</span>
          </Link>
        </div>

        {/* User Scientist Avatar */}
        <button
          type="button"
          onClick={signOut}
          className="hidden sm:flex w-6 h-6 rounded border border-outline-variant bg-surface-container-high items-center justify-center font-mono text-[10px] text-primary hover:border-primary transition-colors"
          title={signedInUser ? `Signed in as ${signedInUser}. Click to sign out.` : 'Sign out'}
          aria-label="Sign out"
          data-testid="header-signout"
        >
          <span className="material-symbols-outlined text-[14px]">logout</span>
        </button>

        {/* Overflow menu (below md): modes, detail level and the actions that do not fit in the bar */}
        <div className="md:hidden relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="p-1.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
            aria-label="More"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            data-testid="header-menu-button"
          >
            <span className="material-symbols-outlined text-[20px]">more_vert</span>
          </button>
          {menuOpen && (
            <div role="menu" data-testid="header-menu" className="absolute right-0 top-full mt-1 w-64 max-h-[calc(100dvh-3.5rem)] overflow-y-auto rounded-xl border border-outline-variant bg-surface-container-high shadow-2xl p-1.5 z-[60]">
              <p className="px-3 pt-1 pb-0.5 text-[10px] font-mono uppercase tracking-wider text-outline">Mode</p>
              {TABS.map((t) => (
                <button key={t.id} type="button" role="menuitemradio" aria-checked={activeTab === t.id} onClick={run(() => onTabChange(t.id))}
                  className={`${menuItem} ${activeTab === t.id ? 'bg-primary/15 text-primary font-semibold' : 'text-on-surface hover:bg-surface-variant'}`}>
                  <span className="material-symbols-outlined text-[18px]">{t.icon}</span>{t.label}
                  {activeTab === t.id && <span className="material-symbols-outlined text-[16px] ml-auto">check</span>}
                </button>
              ))}
              {onToggleBeginnerMode && (
                <>
                  <p className="px-3 pt-2 pb-0.5 text-[10px] font-mono uppercase tracking-wider text-outline">Detail level</p>
                  <div role="group" aria-label="Workstation detail level" className="grid grid-cols-2 gap-1 px-1.5 pb-1">
                    {([['Beginner', true], ['Advanced', false]] as const).map(([label, value]) => (
                      <button key={label} type="button" aria-pressed={beginnerMode === value} onClick={() => onToggleBeginnerMode(value)}
                        className={`min-h-[40px] rounded-lg text-xs font-mono ${beginnerMode === value ? 'bg-primary text-on-primary font-semibold' : 'bg-surface-container text-on-surface-variant hover:text-on-surface'}`}>{label}</button>
                    ))}
                  </div>
                </>
              )}
              {(onUndo || onRedo || onReset || onOpenInspector) && <p className="px-3 pt-2 pb-0.5 text-[10px] font-mono uppercase tracking-wider text-outline">Actions</p>}
              {onOpenInspector && <button type="button" role="menuitem" onClick={run(onOpenInspector)} className={`${menuItem} text-on-surface hover:bg-surface-variant`}><span className="material-symbols-outlined text-[18px]">tune</span>Properties</button>}
              {onUndo && <button type="button" role="menuitem" disabled={!canUndo} onClick={run(onUndo)} className={`${menuItem} text-on-surface hover:bg-surface-variant`}><span className="material-symbols-outlined text-[18px]">undo</span>Undo</button>}
              {onRedo && <button type="button" role="menuitem" disabled={!canRedo} onClick={run(onRedo)} className={`${menuItem} text-on-surface hover:bg-surface-variant`}><span className="material-symbols-outlined text-[18px]">redo</span>Redo</button>}
              {onReset && <button type="button" role="menuitem" onClick={run(onReset)} className={`${menuItem} text-on-surface hover:bg-surface-variant`}><span className="material-symbols-outlined text-[18px]">restart_alt</span>Reset</button>}
              <button type="button" role="menuitem" onClick={run(signOut)} className={`${menuItem} text-on-surface hover:bg-surface-variant`}><span className="material-symbols-outlined text-[18px]">logout</span>Sign out{signedInUser ? ` (${signedInUser})` : ''}</button>
              <button type="button" role="menuitem" onClick={run(handleFullscreenClick)} className={`${menuItem} text-on-surface hover:bg-surface-variant`}>
                <span className="material-symbols-outlined text-[18px]">{isFullscreen ? 'fullscreen_exit' : 'fullscreen'}</span>{isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
