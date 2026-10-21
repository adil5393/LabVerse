import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkstationHeader, type WorkspaceTab } from '../physics/work/components/WorkstationHeader';
import { GlobalBlackboard } from './GlobalBlackboard';
import { useChapterNavigation } from './chapterNavigation';

export interface WorkspaceShellProps {
  chapterId: string;
  labTitle: string;
  activeTab?: WorkspaceTab;
  onTabChange?: (tab: WorkspaceTab) => void;
  // Slots
  outliner?: React.ReactNode;
  outlinerTitle?: string;
  viewport: React.ReactNode;
  inspector?: React.ReactNode;
  inspectorTitle?: string;
  analysisDock?: React.ReactNode;
  analysisDockTitle?: string;
  mobileInspector?: React.ReactNode;
  mobileLayout?: React.ReactNode;
  // Controls & Playback
  playing?: boolean;
  onTogglePlay?: () => void;
  onReset?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  beginnerMode?: boolean;
  onToggleBeginnerMode?: (val: boolean) => void;
  // Custom Blackboard split view content
  blackboardSplitContent?: React.ReactNode;
  // State snapshot to preserve for return trips
  experimentSetupSnapshot?: unknown;
}

/**
 * WorkspaceShell: Universal Blender-inspired scientific workstation shell (LabVerse Workspace V3).
 * Adapts across all Physics, Mathematics, and Chemistry chapters.
 * Coordinates:
 * 1. Top Workstation Bar (Brand, breadcrumbs, mode tabs, playback actions, beginner toggle)
 * 2. Left Scene / Curriculum Explorer (Collapsible rail & tree)
 * 3. Central Dominant Simulation Viewport (Canvas / Apparatus)
 * 4. Right Properties Inspector (Collapsible technical inspector & mobile sheet)
 * 5. Bottom Analysis Dock (Expandable bento / calculations / graphs / observations)
 * 6. Global Blackboard Mode (Chalkboard with split view and namespacing)
 */
export const WorkspaceShell: React.FC<WorkspaceShellProps> = ({
  chapterId,
  labTitle,
  activeTab: controlledTab,
  onTabChange: controlledOnTabChange,
  outliner,
  outlinerTitle = 'Explorer',
  viewport,
  inspector,
  inspectorTitle = 'Inspector',
  analysisDock,
  analysisDockTitle = 'Analysis & Data Dock',
  mobileInspector,
  mobileLayout,
  playing = false,
  onTogglePlay,
  onReset,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  beginnerMode = false,
  onToggleBeginnerMode,
  blackboardSplitContent,
  experimentSetupSnapshot,
}) => {
  const navigate = useNavigate();
  const { meta, registerLab } = useChapterNavigation(chapterId);

  // Uncontrolled fallback tab state
  const [internalTab, setInternalTab] = useState<WorkspaceTab>('experiment');
  const currentTab = controlledTab ?? internalTab;

  // Panel collapse states: on tablet widths the side panels start collapsed so the experiment keeps the room (they open from their rails).
  const narrow = typeof window !== 'undefined' && window.innerWidth < 1100;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const [isOutlinerCollapsed, setIsOutlinerCollapsed] = useState(narrow);
  const [isInspectorCollapsed, setIsInspectorCollapsed] = useState(narrow);
  const [dockMode, setDockModeState] = useState<'collapsed' | 'balanced' | 'focus'>(isMobile ? 'collapsed' : 'balanced');
  // A dragged height overrides the preset heights until a preset button is chosen again.
  const [dockPx, setDockPx] = useState<number | null>(null);
  const setDockMode = (mode: 'collapsed' | 'balanced' | 'focus') => { setDockPx(null); setDockModeState(mode); };
  const dragDock = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const startY = e.clientY;
    const startH = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect().height;
    const max = Math.round(window.innerHeight * 0.7);
    const move = (ev: PointerEvent) => { setDockModeState((m) => (m === 'collapsed' ? 'balanced' : m)); setDockPx(Math.min(max, Math.max(120, Math.round(startH + startY - ev.clientY)))); };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  const dockKey = (e: React.KeyboardEvent) => {
    const h = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect().height;
    if (e.key === 'ArrowUp') { e.preventDefault(); setDockModeState((m) => (m === 'collapsed' ? 'balanced' : m)); setDockPx(Math.min(Math.round(window.innerHeight * 0.7), h + 40)); }
    if (e.key === 'ArrowDown') { e.preventDefault(); setDockPx(Math.max(120, h - 40)); }
  };

  // Mobile drawer and inspector sheet
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileInspectorOpen, setMobileInspectorOpen] = useState(false);

  // Register active lab context whenever mounted or experiment state updates
  useEffect(() => {
    const currentUrl = window.location.pathname + window.location.search;
    registerLab(currentUrl, labTitle, experimentSetupSnapshot);
  }, [registerLab, labTitle, experimentSetupSnapshot]);

  const handleTabChange = (tab: WorkspaceTab) => {
    if (controlledOnTabChange) {
      controlledOnTabChange(tab);
      return;
    }

    if (tab === 'exercises') {
      if (meta?.defaultExercisesUrl) {
        navigate(meta.defaultExercisesUrl);
      }
      return;
    }

    if (tab === 'learn') {
      if (meta?.defaultLearnUrl) {
        navigate(meta.defaultLearnUrl);
      }
      return;
    }

    setInternalTab(tab);
    if (tab === 'analyze') {
      setDockMode('focus');
    } else if (tab === 'experiment') {
      if (dockMode === 'focus') setDockMode('balanced');
    }
  };

  return (
    <div
      className="h-dvh w-full overflow-hidden flex flex-col bg-background text-on-surface antialiased select-none font-sans"
      data-workspace={chapterId}
      data-testid="workspace-shell"
    >
      {/* 1. Universal Workstation Top Application Bar */}
      <WorkstationHeader
        activeTab={currentTab}
        onTabChange={handleTabChange}
        beginnerMode={beginnerMode}
        onToggleBeginnerMode={onToggleBeginnerMode}
        onReset={mobileLayout ? undefined : onReset}
        onTogglePlay={mobileLayout ? undefined : onTogglePlay}
        playing={playing}
        onUndo={onUndo}
        onRedo={onRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        onOpenMobileDrawer={outliner ? () => setMobileDrawerOpen(true) : undefined}
        onOpenInspector={mobileInspector || inspector ? () => setMobileInspectorOpen(true) : undefined}
        chapterTitle={meta?.title || 'Scientific Laboratory'}
        labTitle={labTitle}
        chapterUrl={meta?.chapterUrl || meta?.subjectUrl || '/'}
      />

      {/* 2. Workspace Content: Blackboard vs Scientific Workstation */}
      {currentTab === 'blackboard' ? (
        <GlobalBlackboard
          namespace={`${meta?.subject || 'general'}-${chapterId}`}
          onReturnToExperiment={() => handleTabChange('experiment')}
          splitContent={blackboardSplitContent || viewport}
        />
      ) : (
        <>
          {/* Mobile-first Layout Mode (< sm) */}
          {mobileLayout && (
            <div className="flex-1 flex flex-col sm:hidden overflow-hidden w-full max-w-full relative">
              {mobileLayout}
            </div>
          )}
          {/* Desktop Workstation Mode (>= sm when mobileLayout is provided, or default) */}
          <div className={`flex-1 flex flex-col md:flex-row overflow-hidden relative ${mobileLayout ? 'hidden sm:flex' : ''}`}>
            {/* Left Outliner / Explorer Slot (Desktop) */}
            {outliner && (
              <div className="hidden md:flex shrink-0 h-full">
              {isOutlinerCollapsed ? (
                <button
                  type="button"
                  onClick={() => setIsOutlinerCollapsed(false)}
                  className="w-9 h-full bg-surface-container-low border-r border-outline-variant flex flex-col items-center py-2 text-outline hover:text-white transition-colors"
                  title="Expand Explorer"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  <span className="font-mono text-[9px] uppercase [writing-mode:vertical-lr] tracking-wider mt-2">
                    {outlinerTitle}
                  </span>
                </button>
              ) : (
                <div className="w-64 h-full border-r border-outline-variant bg-surface-container-low flex flex-col">
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-outline-variant text-xs font-mono text-outline shrink-0">
                    <span className="font-bold uppercase tracking-wider">{outlinerTitle}</span>
                    <button
                      type="button"
                      onClick={() => setIsOutlinerCollapsed(true)}
                      className="p-1 hover:text-white rounded"
                      title="Collapse Explorer"
                    >
                      <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">{outliner}</div>
                </div>
              )}
            </div>
          )}

          {/* Central Workstation: Viewport + Bottom Analysis Dock */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            {/* Viewport Canvas (Dominant) */}
            <div className="flex-1 min-h-0 relative overflow-hidden bg-surface-lowest flex flex-col" data-testid="viewport-region">
              {viewport}
            </div>

            {/* Bottom Analysis Dock Slot */}
            {analysisDock && (
              <div
                data-testid="analysis-dock"
                data-dock-mode={dockMode}
                style={dockMode !== 'collapsed' && dockPx ? { height: dockPx } : undefined}
                className={`shrink-0 max-h-[75vh] sm:max-h-[60vh] border-t border-outline-variant bg-surface-container flex flex-col relative ${dockPx && dockMode !== 'collapsed' ? '' : 'transition-all duration-200'} ${
                  dockPx && dockMode !== 'collapsed'
                    ? ''
                    : dockMode === 'collapsed'
                    ? 'h-8'
                    : dockMode === 'focus'
                    ? 'h-[52vh] sm:h-[360px]'
                    : 'h-[38vh] sm:h-[295px] min-h-[260px]'
                }`}
              >
                <div
                  role="separator" aria-orientation="horizontal" aria-label="Resize analysis dock" tabIndex={0} data-testid="dock-resize-handle"
                  onPointerDown={dragDock} onKeyDown={dockKey}
                  className="absolute -top-1 left-0 right-0 h-2 cursor-row-resize z-10 hover:bg-primary/40 focus:bg-primary/40 touch-none"
                />
                <div
                  onClick={() => {
                    if (window.innerWidth < 640) {
                      setDockMode(dockMode === 'collapsed' ? 'balanced' : 'collapsed');
                    }
                  }}
                  className="flex items-center justify-between px-3 h-8 border-b border-outline-variant bg-surface-container-high text-xs font-mono text-outline shrink-0 cursor-pointer sm:cursor-default"
                >
                  <div className="flex items-center space-x-2">
                    <span className="material-symbols-outlined text-[16px] text-primary">analytics</span>
                    <span className="font-bold uppercase tracking-wider text-on-surface whitespace-nowrap truncate">{analysisDockTitle}</span>
                    <span className="sm:hidden text-[10px] text-primary font-mono ml-1">
                      {dockMode === 'collapsed' ? '(Tap to expand)' : '(Tap to collapse)'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {(inspector || mobileInspector) && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setMobileInspectorOpen(true); }}
                        className="md:hidden min-h-[28px] px-2 rounded bg-primary/15 text-primary font-semibold flex items-center gap-1"
                        aria-label="Open Properties Inspector"
                        data-testid="dock-inspector-button"
                      >
                        <span className="material-symbols-outlined text-[14px]">tune</span>
                        <span className="text-[10px]">Properties</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setDockMode('collapsed'); }}
                      className={`p-1 rounded ${dockMode === 'collapsed' ? 'bg-surface-variant text-primary' : 'hover:text-white'}`}
                      title="Collapse Dock"
                    >
                      <span className="material-symbols-outlined text-[14px]">minimize</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setDockMode('balanced'); }}
                      className={`p-1 rounded ${dockMode === 'balanced' ? 'bg-surface-variant text-primary' : 'hover:text-white'}`}
                      title="Balanced Height (220px)"
                    >
                      <span className="material-symbols-outlined text-[14px]">splitscreen</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setDockMode('focus'); }}
                      className={`p-1 rounded ${dockMode === 'focus' ? 'bg-surface-variant text-primary' : 'hover:text-white'}`}
                      title="Focus Height (360px)"
                    >
                      <span className="material-symbols-outlined text-[14px]">expand</span>
                    </button>
                  </div>
                </div>
                {dockMode !== 'collapsed' && (
                  <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                    {analysisDock}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Properties Inspector Slot (Desktop) */}
          {inspector && (
            <div className="hidden md:flex shrink-0 h-full">
              {isInspectorCollapsed ? (
                <button
                  type="button"
                  onClick={() => setIsInspectorCollapsed(false)}
                  className="w-9 h-full bg-surface-container border-l border-outline-variant flex flex-col items-center py-2 text-outline hover:text-white transition-colors"
                  title="Expand Properties Inspector"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                  <span className="font-mono text-[9px] uppercase [writing-mode:vertical-lr] tracking-wider mt-2">
                    {inspectorTitle}
                  </span>
                </button>
              ) : (
                <div className="w-[300px] h-full border-l border-outline-variant bg-surface-container flex flex-col">
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-outline-variant text-xs font-mono text-outline shrink-0">
                    <span className="font-bold uppercase tracking-wider">{inspectorTitle}</span>
                    <button
                      type="button"
                      onClick={() => setIsInspectorCollapsed(true)}
                      className="p-1 hover:text-white rounded"
                      title="Collapse Inspector"
                    >
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">{inspector}</div>
                </div>
              )}
            </div>
          )}
        </div>
        </>
      )}

      {/* Mobile Inspector Sheet (Mobile only - fallback when mobileLayout is not provided) */}
      {!mobileLayout && (mobileInspector || inspector) && (
        <div className="md:hidden">
          {/* Mobile Inspector Floating Trigger (only when there is no dock bar to hold the button) */}
          {!analysisDock && <button
            type="button"
            onClick={() => setMobileInspectorOpen(true)}
            className="fixed bottom-4 right-4 z-40 bg-primary text-on-primary p-3 rounded-full shadow-lg border border-primary-container flex items-center justify-center"
            aria-label="Open Properties Inspector"
          >
            <span className="material-symbols-outlined text-[20px]">tune</span>
          </button>}

          {/* Mobile Bottom Sheet Drawer */}
          {mobileInspectorOpen && (
            <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs">
              <div className="bg-surface-container-high rounded-t-2xl max-h-[85vh] flex flex-col overflow-hidden border-t border-outline-variant shadow-2xl animate-in slide-in-from-bottom duration-200">
                <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant">
                  <div className="flex items-center space-x-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
                    <span className="font-bold text-sm text-on-surface">{inspectorTitle}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileInspectorOpen(false)}
                    className="p-1 text-on-surface-variant hover:text-on-surface"
                    aria-label="Close Inspector"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">{mobileInspector || inspector}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile Drawer (Mobile Curriculum / Outliner) */}
      {mobileDrawerOpen && outliner && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-surface-container-low h-full z-10 flex flex-col shadow-2xl border-r border-outline-variant">
            <div className="flex items-center justify-between p-3 border-b border-outline-variant">
              <span className="font-bold text-sm text-on-surface">{outlinerTitle}</span>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 text-on-surface-variant hover:text-on-surface"
                aria-label="Close Drawer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{outliner}</div>
          </div>
        </div>
      )}
    </div>
  );
};
