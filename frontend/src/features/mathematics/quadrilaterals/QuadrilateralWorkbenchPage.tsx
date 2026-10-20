/**
 * Interactive Workbench Page for Class 9 Quadrilaterals Laboratory (Milestone M3)
 * NCERT Ganita Manjari Part II, Chapter 12: Quadrilaterals
 *
 * Implements two complementary learning modes:
 * 1. Guided Learning Mode (?lesson=...):
 *    - Structured 6-stage progression
 *    - Gradually disclosed toolset (allowedTools)
 *    - Contextual auto-framing and goal badges
 *    - Direct non-linear lesson jumping and celebration transitions
 * 2. Free Laboratory Mode (?exp=... or ?mode=...):
 *    - Unrestricted 14-experiment workbench
 *    - Full construction toolset
 *    - Independent Explore, Investigate, and Practice engines
 */

import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuadrilateralStore } from '../../../store/useQuadrilateralStore';
import { useQuadGuidedLearningStore } from '../../../store/useQuadGuidedLearningStore';
import { QUAD_GUIDED_LESSONS } from '../../../engine/mathematics/quadrilaterals/curriculumPath';
import { QuadrilateralToolRail } from './QuadrilateralToolRail';
import { QuadrilateralCanvas } from './QuadrilateralCanvas';
import { QuadrilateralInspectorPanel } from './QuadrilateralInspectorPanel';
import { QuadrilateralGuidedInspector } from './QuadrilateralGuidedInspector';
import type { QuadMode } from '../../../engine/mathematics/quadrilaterals/types';
import { WorkspaceShell } from '../../workspace';

export const QuadrilateralWorkbenchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { setExperiment, setMode, fitToConstruction } = useQuadrilateralStore();
  const { selectLesson } = useQuadGuidedLearningStore();

  const lessonParam = searchParams.get('lesson');
  const expParam = searchParams.get('exp');
  const modeParam = searchParams.get('mode') as QuadMode | null;

  const isGuidedMode = Boolean(lessonParam);
  const activeGuidedLesson = lessonParam
    ? QUAD_GUIDED_LESSONS[lessonParam]
    : undefined;

  // Sync route params into geometry and guided stores
  useEffect(() => {
    if (isGuidedMode && activeGuidedLesson) {
      // 1. Mount corresponding canonical experiment for geometry engine
      setExperiment(activeGuidedLesson.experimentId);
      // 2. Select guided lesson
      selectLesson(activeGuidedLesson.id);
      // 3. Set explore mode for free interaction during experiment stage
      setMode('explore');
      // 4. Auto-frame geometry for optimal classroom readability
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
  }, [
    lessonParam,
    expParam,
    modeParam,
    isGuidedMode,
    activeGuidedLesson,
    setExperiment,
    selectLesson,
    setMode,
    fitToConstruction,
  ]);

  const outlinerContent = (
    <div className="h-full flex flex-col overflow-hidden">
      <QuadrilateralToolRail
        allowedTools={
          isGuidedMode && activeGuidedLesson
            ? activeGuidedLesson.allowedTools
            : undefined
        }
      />
    </div>
  );

  const viewportContent = (
    <div className="flex-1 h-full relative overflow-hidden">
      <QuadrilateralCanvas />

      {/* Smart TV / Floating goal instruction pill in Guided Mode */}
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
  );

  const inspectorContent = (
    <div className="h-full flex flex-col overflow-hidden">
      {isGuidedMode ? (
        <QuadrilateralGuidedInspector />
      ) : (
        <QuadrilateralInspectorPanel />
      )}
    </div>
  );

  const analysisDockContent = (
    <div className="p-3 text-xs space-y-2 font-mono">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2 rounded bg-surface-card border border-surface-border">
          <span className="text-outline text-[10px] block">EXPERIMENT</span>
          <span className="text-primary font-bold text-sm uppercase">{expParam ?? 'Quadrilateral Properties'}</span>
        </div>
        <div className="p-2 rounded bg-surface-card border border-surface-border">
          <span className="text-outline text-[10px] block">MODE</span>
          <span className="text-white font-bold text-sm uppercase">{isGuidedMode ? 'Guided Lesson' : (modeParam ?? 'Explore')}</span>
        </div>
        <div className="p-2 rounded bg-surface-card border border-surface-border">
          <span className="text-outline text-[10px] block">TOOLSET</span>
          <span className="text-white font-bold text-sm">{isGuidedMode ? 'Stage Filtered' : 'Unrestricted'}</span>
        </div>
        <div className="p-2 rounded bg-surface-card border border-surface-border">
          <span className="text-outline text-[10px] block">SUM OF ANGLES</span>
          <span className="text-emerald-400 font-bold text-sm">360&deg; Invariant</span>
        </div>
      </div>
    </div>
  );

  return (
    <WorkspaceShell
      chapterId="quadrilaterals"
      labTitle="Quadrilaterals Laboratory"
      outlinerTitle="Construction Rail"
      outliner={outlinerContent}
      viewport={viewportContent}
      inspectorTitle="Properties & Proofs"
      inspector={inspectorContent}
      analysisDockTitle="Geometric Telemetry & Invariants"
      analysisDock={analysisDockContent}
    />
  );
};
