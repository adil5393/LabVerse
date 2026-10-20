import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useChapterNavigation } from './chapterNavigation';

export interface ChapterWorkspaceNavProps {
  chapterId: string;
  currentPageTitle: string;
  currentMode?: 'learn' | 'experiment' | 'analyze' | 'exercises' | 'practice' | 'blackboard';
  showBackToLab?: boolean;
  showBackToLesson?: boolean;
}

/**
 * ChapterWorkspaceNav: Contextual workspace navigation banner for educational and exercise views.
 * Ensures students can return directly to their active experiment or lesson in a single click,
 * maintaining continuity without repeatedly navigating through subject menus.
 */
export const ChapterWorkspaceNav: React.FC<ChapterWorkspaceNavProps> = ({
  chapterId,
  currentPageTitle,
  currentMode = 'exercises',
  showBackToLab = true,
  showBackToLesson = false,
}) => {
  const navigate = useNavigate();
  const { meta, labDestination, lessonDestination } = useChapterNavigation(chapterId);

  if (!meta) {
    return null;
  }

  const handleBackToLab = () => {
    navigate(labDestination.url);
  };

  const handleBackToLesson = () => {
    navigate(lessonDestination.url);
  };

  return (
    <nav
      className="w-full flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-surface-card border border-surface-border mb-6 shadow-sm"
      aria-label="Chapter Workspace Navigation"
    >
      {/* Left: Breadcrumbs + Subject */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
        <Link
          to="/"
          className="hover:text-primary transition-colors inline-flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">home</span>
          Explorer
        </Link>
        <span>/</span>
        <Link
          to={meta.subjectUrl}
          className="hover:text-primary transition-colors capitalize"
        >
          {meta.subjectTitle}
        </Link>
        <span>/</span>
        <Link
          to={meta.chapterUrl}
          className="hover:text-primary transition-colors font-medium text-slate-200"
        >
          {meta.shortTitle}
        </Link>
        <span>/</span>
        <span className="text-primary font-bold">{currentPageTitle}</span>
      </div>

      {/* Center: Contextual Mode Switcher */}
      <div className="flex items-center gap-1 bg-surface-lowest p-1 rounded-xl border border-surface-border text-xs">
        <Link
          to={meta.defaultLearnUrl}
          className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
            currentMode === 'learn'
              ? 'bg-surface-elevated text-white font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Learn
        </Link>
        <Link
          to={labDestination.url}
          className={`px-2.5 py-1 rounded-lg transition-colors font-medium flex items-center gap-1.5 ${
            currentMode === 'experiment'
              ? 'bg-surface-elevated text-primary font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {labDestination.isResumed && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
          Lab
        </Link>
        {meta.defaultExercisesUrl && (
          <Link
            to={meta.defaultExercisesUrl}
            className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
              currentMode === 'exercises'
                ? 'bg-surface-elevated text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Exercises
          </Link>
        )}
        {meta.defaultPracticeUrl && (
          <Link
            to={meta.defaultPracticeUrl}
            className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
              currentMode === 'practice'
                ? 'bg-surface-elevated text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Practice
          </Link>
        )}
      </div>

      {/* Right: Direct Return Action Buttons */}
      <div className="flex items-center gap-2">
        {showBackToLesson && (
          <button
            type="button"
            onClick={handleBackToLesson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-surface-border bg-surface-lowest hover:bg-surface-elevated text-xs font-semibold text-slate-300 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">menu_book</span>
            Back to Lesson
          </button>
        )}

        {showBackToLab && (
          <button
            type="button"
            onClick={handleBackToLab}
            data-testid="back-to-lab-btn"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary/15 hover:bg-primary/25 border border-primary/40 text-xs font-bold text-primary transition-colors group shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px] text-primary group-hover:-translate-x-0.5 transition-transform">
              arrow_back
            </span>
            <span>Back to {labDestination.title}</span>
            {labDestination.isResumed && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Active
              </span>
            )}
          </button>
        )}
      </div>
    </nav>
  );
};
