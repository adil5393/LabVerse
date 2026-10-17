/**
 * Guided Learning Toolbar for Class 9 Circles (Milestone M2.5)
 *
 * Provides:
 * - Direct lesson switcher allowing non-linear jumping without prerequisite locks
 * - 6-Stage progress tracker (Understand -> Predict -> Experiment -> Observe -> Why/Proof -> Practise)
 * - Stage step navigation (Previous / Next)
 * - Teacher Demonstration Bypass toggle (skip interaction gates live in class)
 * - Smart-TV label sizing and panel collapse for large screen clarity
 * - Seamless switch to Free Laboratory
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGuidedLearningStore } from '../../../store/useGuidedLearningStore';
import { useCircleStore } from '../../../store/useCircleStore';
import {
  CIRCLES_GUIDED_LESSONS,
  ORDERED_LESSON_IDS,
} from '../../../engine/mathematics/circles/curriculumPath';
import type { GuidedStageId } from '../../../engine/mathematics/guidedLearning/types';
import type { LabelSizePreference } from '../../../engine/mathematics/circles/types';

interface CircleGuidedToolbarProps {
  onTogglePanel?: () => void;
  isPanelOpen?: boolean;
}

const STAGE_LABELS: { id: GuidedStageId; label: string; icon: string }[] = [
  { id: 'understand', label: 'Understand', icon: 'menu_book' },
  { id: 'predict', label: 'Predict', icon: 'psychology' },
  { id: 'experiment', label: 'Experiment', icon: 'science' },
  { id: 'observe', label: 'Observe', icon: 'visibility' },
  { id: 'explain', label: 'Why & Proof', icon: 'verified' },
  { id: 'practice', label: 'Practise', icon: 'edit_note' },
];

export const CircleGuidedToolbar: React.FC<CircleGuidedToolbarProps> = ({
  onTogglePanel,
  isPanelOpen = true,
}) => {
  const navigate = useNavigate();

  const {
    activeLessonId,
    activeStage,
    selectLesson,
    setStage,
    nextStage,
    prevStage,
    teacherMode,
    toggleTeacherMode,
    teacherBypassCurrentStage,
    completedLessonIds,
  } = useGuidedLearningStore();

  const { labelSize, setLabelSize } = useCircleStore();

  const currentLesson =
    CIRCLES_GUIDED_LESSONS[activeLessonId] || CIRCLES_GUIDED_LESSONS['circles-l1'];
  const stages = currentLesson.stages;
  const currentStageIndex = stages.indexOf(activeStage);
  const isLessonComplete = completedLessonIds.includes(currentLesson.id);

  const handleLessonChange = (newLessonId: string) => {
    selectLesson(newLessonId, 'understand');
    navigate(`/mathematics/circles/workbench?lesson=${newLessonId}`);
  };

  const handleSwitchToFreeLab = () => {
    navigate(`/mathematics/circles/workbench?exp=${currentLesson.experimentId}&mode=explore`);
  };

  const handleToggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
    } catch {
      // Graceful fallback
    }
  };

  return (
    <header className="h-14 bg-surface-low border-b border-surface-border px-4 flex items-center justify-between select-none shrink-0 z-20">
      {/* Left: Back Link & Lesson Dropdown */}
      <div className="flex items-center gap-3">
        <Link
          to="/mathematics/circles"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-elevated transition-colors flex items-center justify-center"
          title="Return to Circles Chapter Roadmap"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </Link>

        {/* Lesson Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 hidden sm:inline-block">
            {currentLesson.unitTitle.split(':')[0]}
          </span>

          <select
            value={currentLesson.id}
            onChange={(e) => handleLessonChange(e.target.value)}
            className="bg-surface-card border border-surface-border text-xs text-white font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400 transition-colors max-w-xs"
          >
            {ORDERED_LESSON_IDS.map((id) => {
              const les = CIRCLES_GUIDED_LESSONS[id];
              const isDone = completedLessonIds.includes(id);
              return (
                <option key={id} value={id} className="bg-surface-elevated text-slate-100">
                  {isDone ? '✓ ' : ''}Lesson {les.lessonNumber}: {les.title}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Center: Stage Navigator Stepper */}
      <div className="hidden md:flex items-center gap-1.5 bg-surface-card p-1 rounded-xl border border-surface-border">
        {/* Previous Stage */}
        <button
          onClick={prevStage}
          disabled={currentStageIndex <= 0}
          className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-25 disabled:hover:text-slate-400 transition-colors"
          title="Previous Stage"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>

        {/* Stage Pills */}
        <div className="flex items-center gap-1">
          {STAGE_LABELS.map((stageItem, idx) => {
            if (!stages.includes(stageItem.id)) return null;

            const isActive = activeStage === stageItem.id;
            const isPassed = currentStageIndex > idx || isLessonComplete;

            return (
              <button
                key={stageItem.id}
                onClick={() => setStage(stageItem.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : isPassed
                    ? 'text-amber-400/90 hover:bg-surface-elevated'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-surface-elevated'
                }`}
                title={`Stage ${idx + 1}: ${stageItem.label}`}
              >
                <span className="material-symbols-outlined text-[15px]">
                  {isPassed && !isActive ? 'check' : stageItem.icon}
                </span>
                <span className="hidden lg:inline">{stageItem.label}</span>
              </button>
            );
          })}
        </div>

        {/* Next Stage */}
        <button
          onClick={nextStage}
          disabled={currentStageIndex >= stages.length - 1}
          className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-25 disabled:hover:text-slate-400 transition-colors"
          title="Next Stage"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>

      {/* Right: Teacher Mode, Labels, Free Lab & TV Fullscreen */}
      <div className="flex items-center gap-2">
        {/* Teacher Demonstration Bypass Toggle */}
        <button
          onClick={toggleTeacherMode}
          className={`px-2.5 py-1 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 border ${
            teacherMode
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
              : 'bg-surface-card text-slate-400 border-surface-border hover:text-slate-200'
          }`}
          title="Toggle Teacher Demonstration Mode (Skip interaction gates)"
        >
          <span className="material-symbols-outlined text-[16px]">co_present</span>
          <span className="hidden xl:inline">Teacher Demo</span>
        </button>

        {/* If Teacher Mode Active: Fast-forward stage bypass */}
        {teacherMode && (
          <button
            onClick={() => teacherBypassCurrentStage(currentLesson.id)}
            className="px-2 py-1 rounded-xl text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all flex items-center gap-1"
            title="Fast forward / skip current interaction requirement"
          >
            <span className="material-symbols-outlined text-[15px]">fast_forward</span>
            <span>Bypass Gate</span>
          </button>
        )}

        {/* Label Size Toggle for Smart TV Readability */}
        <div className="hidden sm:flex items-center gap-1 bg-surface-card px-2 py-1 rounded-xl border border-surface-border text-xs">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider hidden 2xl:inline mr-0.5">
            TV:
          </span>
          {(['small', 'normal', 'large'] as LabelSizePreference[]).map((size) => (
            <button
              key={size}
              onClick={() => setLabelSize(size)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize transition-all ${
                labelSize === size
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={`Smart-TV label size: ${size}`}
            >
              {size}
            </button>
          ))}
        </div>

        {/* Switch to Free Laboratory */}
        <button
          onClick={handleSwitchToFreeLab}
          className="px-2.5 py-1 rounded-xl bg-surface-card hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 border border-surface-border hover:border-cyan-500 text-xs font-bold transition-all flex items-center gap-1"
          title="Open this experiment in unrestricted Free Laboratory mode"
        >
          <span className="material-symbols-outlined text-[16px]">science</span>
          <span className="hidden sm:inline">Free Lab</span>
        </button>

        {/* Toggle Inspector Panel (Expand Canvas) */}
        {onTogglePanel && (
          <button
            onClick={onTogglePanel}
            className={`p-1.5 rounded-lg border transition-all ${
              !isPanelOpen
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'text-slate-400 hover:text-white bg-surface-card border-surface-border'
            }`}
            title={isPanelOpen ? 'Hide Panel (Expand Canvas)' : 'Show Instructional Panel'}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isPanelOpen ? 'dock_to_right' : 'dock_to_left'}
            </span>
          </button>
        )}

        {/* Fullscreen */}
        <button
          onClick={handleToggleFullscreen}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-elevated transition-colors hidden sm:block"
          title="Toggle Fullscreen"
        >
          <span className="material-symbols-outlined text-[18px]">fullscreen</span>
        </button>
      </div>
    </header>
  );
};
