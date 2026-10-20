import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export interface SceneOutlinerProps {
  onCloseMobile?: () => void;
  onToggleCollapse?: () => void;
  cartMassKg?: number;
  trackLengthM?: number;
  selectedObjectId?: string | null;
  onSelectObject?: (id: string | null) => void;
  visibilityMap?: Record<string, boolean>;
  onToggleVisibility?: (id: string) => void;
  lockMap?: Record<string, boolean>;
  onToggleLock?: (id: string) => void;
  activeExperimentId?: string | null;
  onSelectExperiment?: (id: string | null) => void;
}

interface SceneItem {
  id: string;
  name: string;
  category: string;
  icon: string;
  badge: string;
}

/**
 * SceneOutliner: Blender Outliner-inspired tree view panel.
 * Displays hierarchical curriculum navigation, active lab objects,
 * interactive object selection, visibility toggles, and edit locks.
 */
export const SceneOutliner: React.FC<SceneOutlinerProps> = ({
  onCloseMobile,
  onToggleCollapse,
  cartMassKg = 5.0,
  trackLengthM = 12,
  selectedObjectId = null,
  onSelectObject,
  visibilityMap = { cart: true, force: true, track: true, caliper: true },
  onToggleVisibility,
  lockMap = { cart: false, force: false, track: false, caliper: false },
  onToggleLock,
  activeExperimentId = null,
  onSelectExperiment,
}) => {
  const [filter, setFilter] = useState('');
  const [physicsExpanded, setPhysicsExpanded] = useState(true);
  const [ch7Expanded, setCh7Expanded] = useState(true);

  const sceneObjects: SceneItem[] = [
    {
      id: 'cart',
      name: 'CART_01',
      category: 'Object / Dynamics',
      icon: 'deployed_code',
      badge: `m=${cartMassKg.toFixed(1)}kg`,
    },
    {
      id: 'force',
      name: 'F_APP',
      category: 'Vector / Force',
      icon: 'trending_up',
      badge: 'Applied Force',
    },
    {
      id: 'track',
      name: 'Linear_Track',
      category: 'Environment / Surface',
      icon: 'straighten',
      badge: `${trackLengthM}m Track`,
    },
    {
      id: 'caliper',
      name: 'DISP_01',
      category: 'Measurement / Vector',
      icon: 'space_dashboard',
      badge: 'Displacement',
    },
  ];

  const filteredObjects = sceneObjects.filter(
    (obj) =>
      obj.name.toLowerCase().includes(filter.toLowerCase()) ||
      obj.category.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <aside className="w-[260px] flex-shrink-0 bg-surface-container-low border-r border-outline-variant flex flex-col justify-between z-30 select-none h-full">
      {/* Outliner Header */}
      <div>
        <div className="h-8 px-3 border-b border-outline-variant flex items-center justify-between bg-surface-container">
          <div className="flex items-center space-x-1.5">
            <span className="material-symbols-outlined text-outline text-[15px]">account_tree</span>
            <span className="font-mono text-[10px] tracking-wider uppercase text-on-surface-variant font-semibold">
              SCENE OUTLINER
            </span>
          </div>
          <div className="flex items-center space-x-0.5">
            {onCloseMobile ? (
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1 rounded text-outline hover:text-white"
              >
                <span className="material-symbols-outlined text-[15px]">close</span>
              </button>
            ) : onToggleCollapse ? (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="p-0.5 rounded text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
                title="Collapse Outliner"
              >
                <span className="material-symbols-outlined text-[15px]">chevron_left</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Hierarchy Filter & Search mini-bar */}
        <div className="px-3 py-1 border-b border-outline-variant/60 flex items-center bg-surface-container-lowest">
          <span className="material-symbols-outlined text-outline text-[13px] mr-1">search</span>
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter lab objects & units..."
            className="bg-transparent border-0 p-0 text-[11px] font-mono text-on-surface placeholder:text-outline focus:ring-0 w-full focus:outline-none"
          />
          {filter && (
            <button
              type="button"
              onClick={() => setFilter('')}
              className="text-outline hover:text-white"
            >
              <span className="material-symbols-outlined text-[12px]">close</span>
            </button>
          )}
        </div>

        {/* Tree View List */}
        <div className="overflow-y-auto py-1 font-mono text-xs max-h-[calc(100vh-210px)]">
          {/* Category: PHYSICS CORE */}
          <div
            onClick={() => setPhysicsExpanded(!physicsExpanded)}
            className="px-3 py-1 flex items-center justify-between text-on-surface-variant hover:bg-surface-container cursor-pointer group transition-colors"
          >
            <div className="flex items-center space-x-1">
              <span className="material-symbols-outlined text-[14px] text-outline">
                {physicsExpanded ? 'expand_more' : 'chevron_right'}
              </span>
              <span className="material-symbols-outlined text-[14px] text-secondary">flare</span>
              <span className="text-[12px] font-semibold text-on-surface">Physics Core</span>
            </div>
            <span className="text-[10px] text-outline">v2.4</span>
          </div>

          {physicsExpanded && (
            <div className="space-y-0.5">
              {/* Ch 4 */}
              <Link
                to="/physics/motion"
                className="pl-6 pr-3 py-1 flex items-center justify-between text-on-surface-variant hover:bg-surface-container hover:text-white transition-colors"
              >
                <div className="flex items-center space-x-1 truncate">
                  <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
                  <span className="truncate text-[11px]">Ch 4: Describing Motion</span>
                </div>
                <span className="material-symbols-outlined text-[13px] text-outline opacity-60">visibility</span>
              </Link>

              {/* Ch 6 */}
              <Link
                to="/physics/forces"
                className="pl-6 pr-3 py-1 flex items-center justify-between text-on-surface-variant hover:bg-surface-container hover:text-white transition-colors"
              >
                <div className="flex items-center space-x-1 truncate">
                  <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
                  <span className="truncate text-[11px]">Ch 6: Forces & Dynamics</span>
                </div>
                <span className="material-symbols-outlined text-[13px] text-outline opacity-60">visibility</span>
              </Link>

              {/* Ch 7 EXPANDED */}
              <div
                onClick={() => setCh7Expanded(!ch7Expanded)}
                className="pl-6 pr-3 py-1 flex items-center justify-between text-on-surface bg-surface-container-high/40 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-1 truncate">
                  <span className="material-symbols-outlined text-[14px] text-primary">
                    {ch7Expanded ? 'expand_more' : 'chevron_right'}
                  </span>
                  <span className="font-semibold text-primary text-[11px] truncate">
                    Ch 7: Work, Energy & Mach.
                  </span>
                </div>
                <span className="material-symbols-outlined text-[13px] text-primary opacity-80">lock_open</span>
              </div>

              {ch7Expanded && (
                <div className="space-y-0.5">
                  {/* 7.1 FREE EXPLORATION */}
                  <div
                    onClick={() => onSelectExperiment?.(null)}
                    className={`pl-9 pr-3 py-1 flex items-center justify-between cursor-pointer transition-colors ${
                      !activeExperimentId
                        ? 'bg-primary-container/20 border-l-2 border-primary text-primary font-semibold'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="material-symbols-outlined text-[13px] text-primary">science</span>
                      <span className="truncate text-[11px]">7.1 Work Free Lab</span>
                    </div>
                    <span className="material-symbols-outlined text-[13px] text-primary">
                      {!activeExperimentId ? 'check_circle' : 'visibility'}
                    </span>
                  </div>

                  {/* 7.2 Exp A */}
                  <div
                    onClick={() => onSelectExperiment?.('A')}
                    className={`pl-9 pr-3 py-0.5 flex items-center justify-between cursor-pointer transition-colors ${
                      activeExperimentId === 'A'
                        ? 'bg-primary-container/20 border-l-2 border-primary text-primary font-semibold'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="material-symbols-outlined text-[13px] text-outline">circle</span>
                      <span className="truncate text-[11px]">Exp A: Force & Direction</span>
                    </div>
                    <span className="material-symbols-outlined text-[13px] text-outline opacity-60">visibility</span>
                  </div>

                  {/* 7.3 Exp B */}
                  <div
                    onClick={() => onSelectExperiment?.('B')}
                    className={`pl-9 pr-3 py-0.5 flex items-center justify-between cursor-pointer transition-colors ${
                      activeExperimentId === 'B'
                        ? 'bg-primary-container/20 border-l-2 border-primary text-primary font-semibold'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="material-symbols-outlined text-[13px] text-outline">circle</span>
                      <span className="truncate text-[11px]">Exp B: Friction & Braking</span>
                    </div>
                    <span className="material-symbols-outlined text-[13px] text-outline opacity-60">visibility</span>
                  </div>

                  {/* 7.4 Exp C */}
                  <div
                    onClick={() => onSelectExperiment?.('C')}
                    className={`pl-9 pr-3 py-0.5 flex items-center justify-between cursor-pointer transition-colors ${
                      activeExperimentId === 'C'
                        ? 'bg-primary-container/20 border-l-2 border-primary text-primary font-semibold'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="material-symbols-outlined text-[13px] text-outline">circle</span>
                      <span className="truncate text-[11px]">Exp C: Zero Work</span>
                    </div>
                    <span className="material-symbols-outlined text-[13px] text-outline opacity-60">visibility</span>
                  </div>

                  {/* 7.5 Exp D */}
                  <div
                    onClick={() => onSelectExperiment?.('D')}
                    className={`pl-9 pr-3 py-0.5 flex items-center justify-between cursor-pointer transition-colors ${
                      activeExperimentId === 'D'
                        ? 'bg-primary-container/20 border-l-2 border-primary text-primary font-semibold'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="material-symbols-outlined text-[13px] text-outline">circle</span>
                      <span className="truncate text-[11px]">Exp D: Lifting Against Gravity</span>
                    </div>
                    <span className="material-symbols-outlined text-[13px] text-outline opacity-60">visibility</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ACTIVE SCENE OBJECTS SECTION */}
          <div className="mt-3 px-3 py-1 border-t border-outline-variant/40 flex items-center justify-between text-outline">
            <span className="text-[9px] uppercase tracking-wider font-semibold">Active Scene Objects</span>
            <span className="text-[9px] font-mono text-outline">{filteredObjects.length} Entities</span>
          </div>

          <div className="space-y-0.5">
            {filteredObjects.map((obj) => {
              const isSelected = selectedObjectId === obj.id;
              const isVisible = visibilityMap[obj.id] ?? true;
              const isLocked = lockMap[obj.id] ?? false;

              return (
                <div
                  key={obj.id}
                  onClick={() => onSelectObject?.(isSelected ? null : obj.id)}
                  className={`pl-4 pr-2 py-1 flex items-center justify-between cursor-pointer group transition-colors ${
                    isSelected
                      ? 'bg-primary-container/25 border-l-2 border-primary text-primary'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-white'
                  }`}
                  title={`Click to select ${obj.name}`}
                >
                  <div className="flex items-center space-x-1.5 truncate">
                    <span className={`material-symbols-outlined text-[14px] ${isSelected ? 'text-primary' : 'text-outline'}`}>
                      {obj.icon}
                    </span>
                    <span className={`text-[11px] truncate ${isSelected ? 'font-bold text-white' : ''}`}>
                      {obj.name}
                    </span>
                  </div>

                  {/* Actions: Visibility & Lock */}
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleVisibility?.(obj.id);
                      }}
                      className={`p-0.5 rounded hover:text-white transition-colors ${
                        isVisible ? 'text-outline' : 'text-rose-400'
                      }`}
                      title={isVisible ? 'Hide from viewport' : 'Show in viewport'}
                    >
                      <span className="material-symbols-outlined text-[13px]">
                        {isVisible ? 'visibility' : 'visibility_off'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLock?.(obj.id);
                      }}
                      className={`p-0.5 rounded hover:text-white transition-colors ${
                        isLocked ? 'text-amber-400' : 'text-outline opacity-40 group-hover:opacity-100'
                      }`}
                      title={isLocked ? 'Locked (editing disabled)' : 'Unlock to edit'}
                    >
                      <span className="material-symbols-outlined text-[13px]">
                        {isLocked ? 'lock' : 'lock_open'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Outliner Footer with NCERT Chapter Exercises link and Diagnostics */}
      <div className="p-3 border-t border-outline-variant bg-surface-container">
        <Link
          to="/physics/work/exercises"
          className="w-full py-1.5 mb-1.5 px-3 bg-surface-container-high border border-outline-variant hover:border-primary text-on-surface rounded font-mono text-xs flex items-center justify-center space-x-1 transition-colors"
        >
          <span className="material-symbols-outlined text-[14px]">assignment</span>
          <span>Chapter Exercises</span>
        </Link>
        <div className="flex items-center justify-between text-outline font-mono text-[10px]">
          <span className="flex items-center space-x-1">
            <span className="material-symbols-outlined text-[12px] text-emerald-400">tune</span>
            <span>Diagnostics: OK</span>
          </span>
          <span className="text-outline">PHY-3A</span>
        </div>
      </div>
    </aside>
  );
};
