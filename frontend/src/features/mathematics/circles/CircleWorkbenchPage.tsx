/**
 * Interactive Workbench Page for Class 9 Circles Laboratory (Milestone M2.5)
 *
 * Supports two complementary learning experiences:
 * 1. Guided Learning Mode (?lesson=...):
 *    - Structured 6-stage progression
 *    - Gradually introduced toolset (allowedTools)
 *    - Contextual auto-framing and guidance
 *    - Direct lesson navigation and celebration transitions
 * 2. Free Laboratory Mode (?exp=... or ?mode=...):
 *    - Complete, unrestricted 13-experiment workbench
 *    - Full construction tool palette
 *    - Independent Explore, Investigate, and Practice engines
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCircleStore } from '../../../store/useCircleStore';
import { useGuidedLearningStore } from '../../../store/useGuidedLearningStore';
import { CIRCLES_GUIDED_LESSONS } from '../../../engine/mathematics/circles/curriculumPath';
import { CircleToolbar } from './CircleToolbar';
import { CircleGuidedToolbar } from './CircleGuidedToolbar';
import { CircleToolRail } from './CircleToolRail';
import { CircleCanvas } from './CircleCanvas';
import { CircleInspectorPanel } from './CircleInspectorPanel';
import { CircleGuidedInspector } from './CircleGuidedInspector';
import type { CircleMode } from '../../../engine/mathematics/circles/types';

export const CircleWorkbenchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  const { setExperiment, setMode, fitToConstruction } = useCircleStore();
  const { selectLesson } = useGuidedLearningStore();

  const lessonParam = searchParams.get('lesson');
  const expParam = searchParams.get('exp');
  const modeParam = searchParams.get('mode') as CircleMode | null;

  const isGuidedMode = Boolean(lessonParam);
  const activeGuidedLesson = lessonParam ? CIRCLES_GUIDED_LESSONS[lessonParam] : undefined;

  // Sync route params into geometry and guided stores
  useEffect(() => {
    if (isGuidedMode && activeGuidedLesson) {
      // 1. Mount corresponding canonical experiment for geometry engine
      setExperiment(activeGuidedLesson.experimentId);
      // 2. Select guided lesson
      selectLesson(activeGuidedLesson.id);
      // 3. Set explore mode for free interaction during experiment stage
      setMode('explore');
      // 4. Auto-frame geometry for optimal classroom/Smart-TV readability
      setTimeout(() => {
        fitToConstruction(window.innerWidth * 0.6, window.innerHeight * 0.8);
      }, 50);
    } else if (expParam) {
      setExperiment(expParam);
      if (modeParam) {
        setMode(modeParam);
      }
    } else if (modeParam) {
      setMode(modeParam);
    }
  }, [lessonParam, expParam, modeParam, isGuidedMode, activeGuidedLesson, setExperiment, selectLesson, setMode, fitToConstruction]);

  return (
    <div className="flex flex-col h-screen w-screen bg-surface-lowest text-slate-100 overflow-hidden font-sans">
      {/* 1. Header Toolbar (Guided vs Free Lab) */}
      {isGuidedMode ? (
        <CircleGuidedToolbar
          isPanelOpen={isPanelOpen}
          onTogglePanel={() => setIsPanelOpen(!isPanelOpen)}
        />
      ) : (
        <CircleToolbar />
      )}

      {/* 2. Main Layout: Tool Rail | Canvas | Inspector Panel */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* Left: Tool Rail (Gradually filtered in Guided Mode, complete in Free Lab) */}
        <CircleToolRail
          allowedTools={isGuidedMode && activeGuidedLesson ? activeGuidedLesson.allowedTools : undefined}
        />

        {/* Center: Interactive Geometry Canvas */}
        <div className="flex-1 h-full relative overflow-hidden">
          <CircleCanvas />

          {/* Smart TV / Beginner floating instruction pill in Guided Mode */}
          {isGuidedMode && activeGuidedLesson && (
            <div className="absolute top-4 left-4 z-10 pointer-events-none max-w-md hidden sm:block">
              <div className="px-3.5 py-2 rounded-xl bg-surface-card/90 backdrop-blur-md border border-amber-500/30 text-xs shadow-lg space-y-0.5">
                <div className="font-bold text-amber-400 font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>Lesson {activeGuidedLesson.lessonNumber} Goal</span>
                </div>
                <div className="text-slate-200 text-xs leading-snug">
                  {activeGuidedLesson.experimentGuide.instruction}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Inspector Panel (Guided Orchestrator vs Scientific Inspector) */}
        {isPanelOpen && (
          isGuidedMode ? <CircleGuidedInspector /> : <CircleInspectorPanel />
        )}
      </div>
    </div>
  );
};
