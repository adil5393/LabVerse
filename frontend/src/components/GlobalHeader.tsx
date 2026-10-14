import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface GlobalHeaderProps {
  onOpenGuide?: () => void;
  onImportLab?: () => void;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({ onOpenGuide, onImportLab }) => {
  const location = useLocation();

  const isCurrent = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-surface-lowest/90 backdrop-blur-md border-b border-surface-border h-16 flex items-center justify-between px-6 lg:px-10 transition-all select-none">
      {/* Brand & Frictionless Autosave Tag */}
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/40 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-surface-lowest transition-all shadow-sm shadow-primary/20">
            <span className="material-symbols-outlined text-[22px]">science</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              LabVerse
              <span className="text-[11px] font-semibold font-mono px-2 py-0.5 rounded-full bg-surface-elevated text-slate-300 border border-surface-border">
                v0.1
              </span>
            </span>
          </div>
        </Link>

        {/* Clean, strict "No login required" tag */}
        <div className="hidden md:flex items-center gap-2 pl-4 border-l border-surface-border/70 text-xs font-medium text-slate-300">
          <span className="inline-flex w-2 h-2 rounded-full bg-tertiary ring-4 ring-tertiary/20"></span>
          <span>No login required • Auto-saved to browser</span>
        </div>
      </div>

      {/* Subject Navigation */}
      <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
        <Link
          to="/physics/electricity"
          className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            isCurrent('/physics')
              ? 'text-primary bg-primary/10 font-semibold border border-primary/30'
              : 'text-slate-400 hover:text-white hover:bg-surface-elevated'
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">electric_bolt</span>
          <span>Physics</span>
        </Link>
        <button
          disabled
          className="px-3.5 py-1.5 rounded-lg text-slate-500 cursor-not-allowed flex items-center gap-1.5 opacity-60"
          title="Coming soon in Milestone 2"
        >
          <span>Chemistry</span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-surface-high border border-surface-border text-slate-400">Soon</span>
        </button>
        <button
          disabled
          className="px-3.5 py-1.5 rounded-lg text-slate-500 cursor-not-allowed flex items-center gap-1.5 opacity-60"
          title="Coming soon"
        >
          <span>Biology</span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-surface-high border border-surface-border text-slate-400">Soon</span>
        </button>
        <button
          disabled
          className="px-3.5 py-1.5 rounded-lg text-slate-500 cursor-not-allowed flex items-center gap-1.5 opacity-60"
          title="Coming soon"
        >
          <span>Mathematics</span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-surface-high border border-surface-border text-slate-400">Soon</span>
        </button>
        <button
          disabled
          className="px-3.5 py-1.5 rounded-lg text-slate-500 cursor-not-allowed flex items-center gap-1.5 opacity-60"
          title="Coming soon"
        >
          <span>Robotics</span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-surface-high border border-surface-border text-slate-400">Soon</span>
        </button>
      </nav>

      {/* Utility Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onImportLab}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-surface-card hover:bg-surface-elevated text-slate-200 border border-surface-border text-xs font-medium transition-all"
          title="Import saved lab file (.lab)"
        >
          <span className="material-symbols-outlined text-[17px] text-primary">file_upload</span>
          <span>Import .lab</span>
        </button>
        <button
          onClick={onOpenGuide}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-elevated text-xs font-medium transition-colors border border-transparent hover:border-surface-border"
        >
          <span className="material-symbols-outlined text-[17px]">help_outline</span>
          <span>Guide</span>
        </button>
      </div>
    </header>
  );
};
