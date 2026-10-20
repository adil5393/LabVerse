import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export type WorkspaceTab = 'learn' | 'experiment' | 'analyze' | 'exercises' | 'blackboard';

export interface WorkstationHeaderProps {
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  beginnerMode: boolean;
  onToggleBeginnerMode: (val: boolean) => void;
  onReset: () => void;
  onTogglePlay: () => void;
  playing: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onToggleFullscreen?: () => void;
  onOpenMobileDrawer?: () => void;
  chapterTitle?: string;
  labTitle?: string;
}

/**
 * WorkstationHeader: Blender-inspired top application bar matching Stitch design.
 * Features brand icon, chapter breadcrumb, segmented mode tabs (Learn, Experiment,
 * Analyze, Exercises, Blackboard), beginner/advanced toggle, transport actions, and utility icons.
 */
export const WorkstationHeader: React.FC<WorkstationHeaderProps> = ({
  activeTab,
  onTabChange,
  beginnerMode,
  onToggleBeginnerMode,
  onReset,
  onTogglePlay,
  playing,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onToggleFullscreen,
  onOpenMobileDrawer,
  chapterTitle = 'Ch. 7 Work, Energy & Machines',
  labTitle = 'Work Laboratory',
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

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
    <header className="flex justify-between items-center w-full px-3 sm:px-4 h-10 border-b border-outline-variant bg-surface-container shrink-0 z-50 select-none">
      {/* Left: Brand + Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Mobile Drawer Trigger (visible on mobile only) */}
        <button
          type="button"
          onClick={onOpenMobileDrawer}
          className="md:hidden p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
          aria-label="Toggle curriculum drawer"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>

        <div className="flex items-center space-x-1.5">
          <span className="text-primary flex items-center justify-center p-1 rounded bg-surface-container-high border border-outline-variant">
            <span className="material-symbols-outlined text-primary text-[18px]">science</span>
          </span>
          <Link to="/" className="text-sm font-semibold tracking-tight text-primary hover:text-white transition-colors">
            LabVerse
          </Link>
        </div>

        <div className="hidden sm:block h-3.5 w-px bg-outline-variant" />

        {/* Breadcrumbs (Desktop) */}
        <nav className="hidden sm:flex items-center space-x-1.5 text-[11px] font-mono text-on-surface-variant" aria-label="Workstation breadcrumb">
          <Link to="/physics" className="hover:text-on-surface transition-colors">
            Physics
          </Link>
          <span className="text-outline">/</span>
          <Link to="/physics/work" className="hover:text-on-surface transition-colors truncate max-w-[170px]" title={chapterTitle}>
            {chapterTitle}
          </Link>
          <span className="text-outline">/</span>
          <span className="text-primary font-medium">{labTitle}</span>
        </nav>
      </div>

      {/* Center: Workspace Mode Tabs & Beginner/Advanced Toggle */}
      <div className="flex items-center space-x-2 sm:space-x-3 h-full">
        <div className="flex items-center space-x-0.5 sm:space-x-1 h-full pt-0.5" role="tablist" aria-label="Workstation modes">
          {/* Learn Tab */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'learn'}
            onClick={() => onTabChange('learn')}
            className={`px-2 sm:px-3 h-full flex items-center text-xs font-medium transition-colors ${
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
            className={`px-2 sm:px-3 h-full flex items-center text-xs font-medium transition-colors ${
              activeTab === 'experiment'
                ? 'border-b-2 border-primary text-primary bg-surface-variant/40 font-semibold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
            }`}
          >
            {activeTab === 'experiment' && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary mr-1.5 animate-pulse" />
            )}
            Experiment
          </button>

          {/* Analyze Tab */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'analyze'}
            onClick={() => onTabChange('analyze')}
            className={`px-2 sm:px-3 h-full flex items-center text-xs font-medium transition-colors ${
              activeTab === 'analyze'
                ? 'border-b-2 border-primary text-primary bg-surface-variant/40 font-semibold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
            }`}
          >
            {activeTab === 'analyze' && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-tertiary mr-1.5" />
            )}
            Analyze
          </button>

          {/* Exercises Tab */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'exercises'}
            onClick={() => onTabChange('exercises')}
            className={`hidden md:flex px-2 sm:px-3 h-full items-center text-xs font-medium transition-colors ${
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
            className={`px-2 sm:px-3 h-full flex items-center text-xs font-medium transition-colors ${
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
        <div className="hidden lg:flex items-center bg-surface-container-lowest border border-outline-variant rounded p-0.5 font-mono text-[10px]" role="group" aria-label="Workstation detail level">
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
        </div>
      </div>

      {/* Right: Transport, Undo/Redo, Utility Actions & Avatar */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        {/* Undo / Redo */}
        <div className="hidden sm:flex items-center border-r border-outline-variant pr-1.5 space-x-0.5">
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
        </div>

        {/* Action Buttons: Reset & Run Sim */}
        <button
          type="button"
          onClick={onReset}
          className="hidden sm:inline-flex px-2.5 py-1 bg-surface-container-high border border-outline-variant text-on-surface rounded font-mono text-xs hover:border-primary transition-colors active:translate-y-px"
        >
          Reset
        </button>

        <button
          type="button"
          onClick={onTogglePlay}
          className={`flex items-center space-x-1 px-3 py-1 font-mono text-xs font-semibold rounded shadow-sm transition-all active:translate-y-px ${
            playing
              ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
              : 'bg-primary text-on-primary hover:bg-primary-light'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">
            {playing ? 'pause' : 'play_arrow'}
          </span>
          <span>{playing ? 'Pause' : 'Run Sim'}</span>
        </button>

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
        <div
          className="w-6 h-6 rounded border border-outline-variant bg-surface-container-high flex items-center justify-center font-mono text-[10px] text-primary"
          title="LabVerse Physicist"
        >
          LV
        </div>
      </div>
    </header>
  );
};
