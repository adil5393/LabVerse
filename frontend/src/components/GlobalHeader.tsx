import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LABVERSE_SUBJECTS, type SubjectDefinition } from '../types/subjectRegistry';

interface GlobalHeaderProps {
  onOpenGuide?: () => void;
  onImportLab?: () => void;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({ onOpenGuide, onImportLab }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isCurrent = (subject: SubjectDefinition) => {
    if (!subject.route) return false;
    if (subject.id === 'physics') return location.pathname.startsWith('/physics');
    if (subject.id === 'chemistry') return location.pathname.startsWith('/chemistry');
    if (subject.id === 'mathematics') return location.pathname.startsWith('/mathematics');
    return location.pathname.startsWith(subject.route);
  };

  return (
    <header className="sticky top-0 z-40 bg-surface-lowest/90 backdrop-blur-md border-b border-surface-border transition-all select-none">
      <div className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto w-full">
        {/* Brand & Frictionless Autosave Tag */}
        <div className="flex items-center gap-4 sm:gap-6">
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
          <div className="hidden xl:flex items-center gap-2 pl-4 border-l border-surface-border/70 text-xs font-medium text-slate-300">
            <span className="inline-flex w-2 h-2 rounded-full bg-tertiary ring-4 ring-tertiary/20"></span>
            <span>No login required • Auto-saved to browser</span>
          </div>
        </div>

        {/* Desktop Subject Navigation */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
          {LABVERSE_SUBJECTS.map((subject) => {
            const isReady = subject.status === 'ready';
            const active = isCurrent(subject);

            if (isReady && subject.route) {
              return (
                <Link
                  key={subject.id}
                  to={subject.route}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs sm:text-sm font-medium ${
                    active
                      ? 'text-primary bg-primary/10 font-semibold border border-primary/30 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-surface-elevated'
                  }`}
                >
                  <span className="material-symbols-outlined text-[17px]">{subject.icon}</span>
                  <span>{subject.name}</span>
                </Link>
              );
            }

            return (
              <button
                key={subject.id}
                disabled
                className="px-3 py-1.5 rounded-lg text-slate-500 cursor-not-allowed flex items-center gap-1.5 opacity-60 text-xs sm:text-sm"
                title={`${subject.name} (Coming Soon)`}
              >
                <span className="material-symbols-outlined text-[17px]">{subject.icon}</span>
                <span>{subject.name}</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-surface-high border border-surface-border text-slate-400">
                  Soon
                </span>
              </button>
            );
          })}
        </nav>

        {/* Utility Actions & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onImportLab && (
            <button
              onClick={onImportLab}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-surface-card hover:bg-surface-elevated text-slate-200 border border-surface-border text-xs font-medium transition-all"
              title="Import saved lab file (.lab)"
            >
              <span className="material-symbols-outlined text-[17px] text-primary">file_upload</span>
              <span className="hidden sm:inline">Import .lab</span>
            </button>
          )}

          {onOpenGuide && (
            <button
              onClick={onOpenGuide}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-elevated text-xs font-medium transition-colors border border-transparent hover:border-surface-border"
              title="Lab Guide & Keyboard Shortcuts"
            >
              <span className="material-symbols-outlined text-[17px]">help_outline</span>
              <span className="hidden sm:inline">Guide</span>
            </button>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 min-w-11 min-h-11 rounded-lg text-slate-400 hover:text-white hover:bg-surface-elevated border border-surface-border transition-colors flex items-center justify-center"
            title="Toggle Subject Navigation"
            aria-label="Toggle Subject Navigation"
          >
            <span className="material-symbols-outlined text-[20px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile / Compact Responsive Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-surface-border bg-surface-card/95 backdrop-blur-xl px-4 py-3 flex flex-col gap-1.5 shadow-2xl animate-in slide-in-from-top-2 duration-150">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 px-3 py-1">
            STEM Subjects
          </div>
          {LABVERSE_SUBJECTS.map((subject) => {
            const isReady = subject.status === 'ready';
            const active = isCurrent(subject);

            if (isReady && subject.route) {
              return (
                <Link
                  key={subject.id}
                  to={subject.route}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-lg transition-all flex items-center justify-between text-sm ${
                    active
                      ? 'text-primary bg-primary/10 font-bold border border-primary/30'
                      : 'text-slate-300 hover:text-white hover:bg-surface-elevated'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[19px]">{subject.icon}</span>
                    <span>{subject.name}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Active
                  </span>
                </Link>
              );
            }

            return (
              <div
                key={subject.id}
                className="px-3 py-2.5 rounded-lg flex items-center justify-between text-sm text-slate-500 opacity-60 cursor-not-allowed"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[19px]">{subject.icon}</span>
                  <span>{subject.name}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-high text-slate-400 border border-surface-border">
                  Coming Soon
                </span>
              </div>
            );
          })}
        </div>
      )}
    </header>
  );
};
