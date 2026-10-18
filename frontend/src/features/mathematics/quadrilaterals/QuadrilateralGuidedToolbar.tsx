/**
 * Guided Learning Toolbar for Class 9 Quadrilaterals (Milestone M3)
 * NCERT Ganita Manjari Part II, Chapter 12
 *
 * Implements:
 * - Direct lesson switcher allowing non-linear jumping without prerequisite locks
 * - 6-Stage progress tracker (Understand -> Predict -> Experiment -> Observe -> Why/Proof -> Practise)
 * - Stage step navigation (Previous / Next)
 * - Teacher Demonstration Bypass toggle (skip interaction gates live in class)
 * - Smart-TV label sizing and panel collapse for large screen clarity
 * - Seamless switch to Free Laboratory
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuadGuidedLearningStore } from '../../../store/useQuadGuidedLearningStore';
import { useQuadrilateralStore } from '../../../store/useQuadrilateralStore';
import {
  QUAD_GUIDED_LESSONS,
  ORDERED_QUAD_LESSON_IDS,
} from '../../../engine/mathematics/quadrilaterals/curriculumPath';
import type { GuidedStageId } from '../../../engine/mathematics/guidedLearning/types';
import type { LabelSizePreference } from '../../../engine/mathematics/quadrilaterals/types';

interface QuadrilateralGuidedToolbarProps {
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

export const QuadrilateralGuidedToolbar: React.FC<QuadrilateralGuidedToolbarProps> = ({
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
  } = useQuadGuidedLearningStore();

  const { labelSize, setLabelSize } = useQuadrilateralStore();

  const currentLesson =
    QUAD_GUIDED_LESSONS[activeLessonId] || QUAD_GUIDED_LESSONS['quad-l1'];
  const stages = currentLesson.stages;
  const currentStageIndex = stages.indexOf(activeStage);
  const isLessonComplete = completedLessonIds.includes(currentLesson.id);

  const handleLessonChange = (newLessonId: string) => {
    selectLesson(newLessonId, 'understand');
    navigate(`/mathematics/quadrilaterals/workbench?lesson=${newLessonId}`);
  };

  const handleSwitchToFreeLab = () => {
    navigate(
      `/mathematics/quadrilaterals/workbench?exp=${currentLesson.experimentId}&mode=explore`
    );
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
          to="/mathematics/quadrilaterals"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-card hover:bg-surface-elevated border border-surface-border text-slate-300 hover:text-white text-xs font-semibold transition-all group"
          title="Return to Quadrilaterals Chapter Roadmap"
        >
          <span className="material-symbols-outlined text-[17px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
          <span className="hidden sm:inline">Quadrilaterals</span>
        </Link>

        <div className="h-4 w-[1px] bg-surface-border" />

        {/* Lesson Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
            L{currentLesson.lessonNumber}
          </span>

          <select
            value={activeLessonId}
            onChange={(e) => handleLessonChange(e.target.value)}
            className="bg-surface-card border border-surface-border rounded-lg px-2.5 py-1 text-xs text-white font-medium focus:outline-none focus:border-amber-500 max-w-xs truncate cursor-pointer"
          >
            {ORDERED_QUAD_LESSON_IDS.map((id) => {
              const l = QUAD_GUIDED_LESSONS[id];
              const isDone = completedLessonIds.includes(id);
              return (
                <option key={id} value={id}>
                  {isDone ? '✓ ' : ''}Lesson {l.lessonNumber}: {l.title}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Center: 6-Stage Progress Tracker & Step Navigation */}
      <div className="hidden lg:flex items-center gap-3">
        {/* Previous Stage Button */}
        <button
          onClick={prevStage}
          disabled={currentStageIndex === 0}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-surface-elevated disabled:opacity-20 disabled:hover:bg-transparent transition-all"
          title="Previous Stage"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>

        {/* 6 Stage Buttons */}
        <div className="flex items-center gap-1 bg-surface-card p-1 rounded-xl border border-surface-border">
          {stages.map((stageId, index) => {
            const stageMeta =
              STAGE_LABELS.find((s) => s.id === stageId) || STAGE_LABELS[0];
            const isActive = activeStage === stageId;
            const isPassed = index < currentStageIndex || isLessonComplete;

            return (
              <button
                key={stageId}
                onClick={() => setStage(stageId)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black scale-[1.02]'
                    : isPassed
                    ? 'text-emerald-400 hover:text-emerald-300 hover:bg-surface-elevated'
                    : 'text-slate-400 hover:text-white hover:bg-surface-elevated'
                }`}
                title={`Stage ${index + 1}: ${stageMeta.label}`}
              >
                <span className="material-symbols-outlined text-[15px]">
                  {isPassed && !isActive ? 'check' : stageMeta.icon}
                </span>
                <span>{stageMeta.label}</span>
              </button>
            );
          })}
        </div>

        {/* Next Stage Button */}
        <button
          onClick={nextStage}
          disabled={currentStageIndex === stages.length - 1}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-surface-elevated disabled:opacity-20 disabled:hover:bg-transparent transition-all"
          title="Next Stage"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>

      {/* Right: Teacher Bypass, Label Size, Fullscreen & Collapse */}
      <div className="flex items-center gap-2">
        {/* Teacher Demonstration Bypass */}
        <button
          onClick={toggleTeacherMode}
          className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1 border ${
            teacherMode
              ? 'bg-purple-950/40 border-purple-500/50 text-purple-300 font-bold'
              : 'border-surface-border text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Teacher Demonstration Mode"
        >
          <span className="material-symbols-outlined text-[15px]">co_present</span>
          <span className="hidden sm:inline">Teacher</span>
        </button>

        {teacherMode && (
          <button
            onClick={() => teacherBypassCurrentStage(currentLesson.id)}
            className="px-2 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold transition-all flex items-center gap-1 shadow-sm"
            title="Bypass current interaction gate"
          >
            <span>Skip Gate</span>
            <span className="material-symbols-outlined text-[14px]">fast_forward</span>
          </button>
        )}

        <div className="h-4 w-[1px] bg-surface-border mx-1" />

        {/* Text Size Toggle for Smart-TV / Projector */}
        <select
          value={labelSize}
          onChange={(e) => setLabelSize(e.target.value as LabelSizePreference)}
          className="bg-surface-card border border-surface-border rounded-lg px-2 py-1 text-xs text-slate-300 font-mono cursor-pointer"
          title="Canvas Label Typography Size"
        >
          <option value="small">Small Text</option>
          <option value="normal">Normal Text</option>
          <option value="large">Large (TV)</option>
        </select>

        {/* Switch to Free Laboratory */}
        <button
          onClick={handleSwitchToFreeLab}
          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-surface-elevated transition-colors"
          title="Switch to Free Laboratory Mode"
        >
          <span className="material-symbols-outlined text-[18px]">science</span>
        </button>

        <button
          onClick={handleToggleFullscreen}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-elevated transition-colors"
          title="Toggle Fullscreen"
        >
          <span className="material-symbols-outlined text-[18px]">fullscreen</span>
        </button>

        {/* Collapse / Expand Inspector Panel Toggle */}
        {onTogglePanel && (
          <button
            onClick={onTogglePanel}
            className={`p-1.5 rounded-lg transition-colors ${
              isPanelOpen
                ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-surface-elevated'
            }`}
            title={isPanelOpen ? 'Collapse Inspector Panel' : 'Expand Inspector Panel'}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isPanelOpen ? 'dock_to_right' : 'vertical_split'}
            </span>
          </button>
        )}
      </div>
    </header>
  );
};
