/**
 * Work Laboratory Page (/physics/work/lab):
 * Full integration of the Blender-inspired scientific workstation (PHY-3A / Workspace V2.1).
 * Features 5-region workstation shell:
 * 1. Top Application Bar (modes: Learn, Experiment, Analyze, Exercises, Blackboard; beginner toggle)
 * 2. Left Scene Outliner (hierarchical curriculum, entity selection, visibility and edit locks)
 * 3. Centre Simulation Viewport (CAD grid, camera pan/zoom/fit, vector overlays, dynamic cart)
 * 4. Right Properties Inspector (contextual properties, forces, object dynamics, environment, export data)
 * 5. Bottom Analysis Editor (3 sizing modes, measurements bento, calculations table, F-s graph)
 * 6. Functional Blackboard workspace with scientific chalk palette & split view
 * 7. Mobile responsive layout with bottom sheet drawer and touch hit targets.
 */

import React, { useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  workExperimentById,
} from '../../../engine/physics/work/experiments';
import { DEFAULT_WORK, computeWork, type WorkSetup } from '../../../engine/physics/work/workModel';
import { WorkView } from './WorkView';
import {
  WorkstationHeader,
  SceneOutliner,
  MobileInspectorSheet,
  BlackboardWorkspace,
  type WorkspaceTab,
  type AnalysisTab,
  type DockSizeMode,
} from './components';
import { useChapterNavigation, useSetupHistory, useUndoShortcuts } from '../../workspace';

export const WorkLab: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { registerLab, getLabSetup } = useChapterNavigation('work');

  const exp = workExperimentById(params.get('experiment'));
  const restoredSetup = !params.get('experiment') ? getLabSetup<WorkSetup>() : undefined;
  const [load, setLoad] = useState<{ setup: WorkSetup; key: number }>({
    setup: restoredSetup ?? (exp ? exp.routes[0].setup : DEFAULT_WORK),
    key: 0,
  });

  // Sync active lab context and parameters for seamless return from exercises/lessons
  React.useEffect(() => {
    registerLab(window.location.pathname + window.location.search, 'Work Laboratory', load.setup);
  }, [registerLab, load.setup]);

  // Undo / Redo parameter history
  const history = useSetupHistory<WorkSetup>();
  const [showVertical, setShowVertical] = useState(true);

  // Workspace Modes: 'experiment' | 'blackboard' | 'analyze' | 'learn' | 'exercises'
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('experiment');
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<AnalysisTab>('measurements');
  const [dockMode, setDockMode] = useState<DockSizeMode>('balanced');
  const [beginnerMode, setBeginnerMode] = useState(false);

  // Outliner interactive state
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [visibilityMap, setVisibilityMap] = useState<Record<string, boolean>>({
    cart: true,
    force: true,
    track: true,
    caliper: true,
  });
  const [lockMap, setLockMap] = useState<Record<string, boolean>>({
    cart: false,
    force: false,
    track: false,
    caliper: false,
  });

  // Panel collapse states
  const [outlinerCollapsed, setOutlinerCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileInspectorOpen, setMobileInspectorOpen] = useState(false);

  // Global transport playback state
  const [playing, setPlaying] = useState(false);

  const selectExperiment = useCallback((id: string | null) => {
    const e = workExperimentById(id);
    setParams(id ? { experiment: id } : {});
    history.clear();
    setPlaying(false);
    setLoad((l) => ({ setup: e ? e.routes[0].setup : DEFAULT_WORK, key: l.key + 1 }));
  }, [setParams, history.clear]);

  // The viewport reports every change; bursts (a drag, typing) become one undo step.
  const handleSetupChange = useCallback((nextSetup: WorkSetup) => {
    history.record(load.setup);
    setLoad((l) => ({ setup: nextSetup, key: l.key }));
  }, [load.setup, history.record]);

  const handleUndo = useCallback(() => {
    const previous = history.undo(load.setup);
    if (previous) setLoad((l) => ({ setup: previous, key: l.key }));
  }, [history.undo, load.setup]);

  const handleRedo = useCallback(() => {
    const next = history.redo(load.setup);
    if (next) setLoad((l) => ({ setup: next, key: l.key }));
  }, [history.redo, load.setup]);

  useUndoShortcuts(handleUndo, handleRedo);

  const handleTabChange = useCallback((tab: WorkspaceTab) => {
    if (tab === 'exercises') {
      navigate('/physics/work/exercises');
      return;
    }
    if (tab === 'learn') {
      navigate('/physics/work');
      return;
    }

    setActiveTab(tab);
    if (tab === 'analyze') {
      setDockMode('focus');
    } else if (tab === 'experiment') {
      if (dockMode === 'focus') setDockMode('balanced');
    }
  }, [navigate, dockMode]);

  const handleToggleVisibility = useCallback((id: string) => {
    setVisibilityMap((prev) => ({
      ...prev,
      [id]: !(prev[id] ?? true),
    }));
  }, []);

  const handleToggleLock = useCallback((id: string) => {
    setLockMap((prev) => ({
      ...prev,
      [id]: !(prev[id] ?? false),
    }));
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div
      className="h-screen w-screen overflow-hidden flex flex-col bg-background text-on-surface antialiased select-none font-sans"
      data-chapter="work-lab"
      data-workspace="work"
      data-testid="workspace-shell"
    >
      {/* 1. TOP WORKSPACE APPLICATION BAR (Stitch Blender-inspired header) */}
      <WorkstationHeader
        activeTab={activeTab}
        onTabChange={handleTabChange}
        beginnerMode={beginnerMode}
        onToggleBeginnerMode={setBeginnerMode}
        onReset={() => {
          setPlaying(false);
          setLoad((l) => ({ ...l, key: l.key + 1 }));
        }}
        onTogglePlay={() => setPlaying((p) => !p)}
        playing={playing}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={history.canUndo}
        canRedo={history.canRedo}
        onToggleFullscreen={handleToggleFullscreen}
        onOpenMobileDrawer={() => setMobileDrawerOpen(true)}
      />

      {/* 2. MAIN WORKSPACE VIEWPORT BODY */}
      <div className="flex-1 flex overflow-hidden relative w-full h-[calc(100vh-40px)]">
        {/* WORKSPACE MODE: BLACKBOARD */}
        {activeTab === 'blackboard' && (
          <BlackboardWorkspace
            onReturnToExperiment={() => setActiveTab('experiment')}
          />
        )}
        {/* WORKSPACE MODE: EXPERIMENT & ANALYZE (Primary 5-Region Workstation); stays mounted behind the blackboard */}
        <div className={activeTab === 'blackboard' ? 'hidden' : 'contents'}>
          <>
            {/* Left Outliner / Curriculum Explorer (Desktop) */}
            <div className="hidden md:flex h-full relative">
              {!outlinerCollapsed ? (
                <SceneOutliner
                  cartMassKg={load.setup.massKg}
                  trackLengthM={12}
                  selectedObjectId={selectedObjectId}
                  onSelectObject={setSelectedObjectId}
                  visibilityMap={visibilityMap}
                  onToggleVisibility={handleToggleVisibility}
                  lockMap={lockMap}
                  onToggleLock={handleToggleLock}
                  activeExperimentId={exp?.id ?? null}
                  onSelectExperiment={selectExperiment}
                  onToggleCollapse={() => setOutlinerCollapsed(true)}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setOutlinerCollapsed(false)}
                  className="w-7 h-full bg-surface-container border-r border-outline-variant flex flex-col items-center py-2 text-outline hover:text-white transition-colors"
                  title="Expand Scene Outliner"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  <span className="font-mono text-[9px] uppercase [writing-mode:vertical-lr] tracking-wider mt-2">
                    Outliner
                  </span>
                </button>
              )}
            </div>

            {/* Primary Simulation Workstation Area (Viewport + Properties + Analysis) */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
              {/* Optional Active Experiment POE Banner (when an investigation is selected) */}
              {exp && (
                <div className="bg-surface-container px-3 py-1.5 border-b border-outline-variant flex items-center justify-between text-xs font-mono z-20 shrink-0">
                  <div className="flex items-center space-x-2 truncate">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-primary font-bold">Investigation {exp.id}:</span>
                    <span className="text-white truncate">{exp.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => selectExperiment(null)}
                    className="px-2 py-0.5 rounded bg-surface-container-high border border-outline-variant text-outline hover:text-white text-[11px]"
                  >
                    Clear Preset
                  </button>
                </div>
              )}

              {/* WorkView Visual Workstation Component */}
              <WorkView
                key={`${exp?.id ?? 'free'}-${load.key}`}
                initial={load.setup}
                editable
                graph
                activeAnalysisTab={activeAnalysisTab}
                onAnalysisTabChange={setActiveAnalysisTab}
                dockMode={dockMode}
                onDockModeChange={setDockMode}
                beginnerMode={beginnerMode}
                selectedObjectId={selectedObjectId}
                onSelectObject={setSelectedObjectId}
                visibilityMap={visibilityMap}
                lockMap={lockMap}
                onSetupChange={handleSetupChange}
                canUndo={history.canUndo}
                canRedo={history.canRedo}
                onUndo={handleUndo}
                onRedo={handleRedo}
                playing={playing}
                onPlayingChange={setPlaying}
                showVertical={showVertical}
                onShowVerticalChange={setShowVertical}
              />

              {/* Mobile Floating Inspector CTA (390px reference) */}
              <div className="md:hidden fixed bottom-14 right-3 z-40">
                <button
                  type="button"
                  onClick={() => setMobileInspectorOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-full bg-primary text-on-primary font-mono text-xs font-bold shadow-2xl border border-primary-light active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  <span>Inspect Properties</span>
                </button>
              </div>
            </div>
          </>
        </div>
      </div>

      {/* Mobile Slide-Out Drawer for Scene Outliner */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-xs select-none">
          <div className="w-[280px] h-full bg-surface-container-low shadow-2xl">
            <SceneOutliner
              onCloseMobile={() => setMobileDrawerOpen(false)}
              cartMassKg={load.setup.massKg}
              trackLengthM={12}
              selectedObjectId={selectedObjectId}
              onSelectObject={(id) => {
                setSelectedObjectId(id);
                setMobileDrawerOpen(false);
              }}
              visibilityMap={visibilityMap}
              onToggleVisibility={handleToggleVisibility}
              lockMap={lockMap}
              onToggleLock={handleToggleLock}
              activeExperimentId={exp?.id ?? null}
              onSelectExperiment={(id) => {
                selectExperiment(id);
                setMobileDrawerOpen(false);
              }}
            />
          </div>
          <div
            className="flex-1 h-full"
            onClick={() => setMobileDrawerOpen(false)}
          />
        </div>
      )}

      {/* Mobile Inspector Bottom Sheet Modal */}
      <MobileInspectorSheet
        isOpen={mobileInspectorOpen}
        onClose={() => setMobileInspectorOpen(false)}
        setup={load.setup}
        result={computeWork(load.setup)}
        onChange={(patch) => {
          const next = { ...load.setup, ...patch };
          if (computeWork(next).valid) handleSetupChange(next);
        }}
        showVertical={showVertical}
        onShowVerticalChange={setShowVertical}
      />
    </div>
  );
};
