import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export interface SceneOutlinerProps {
  onCloseMobile?: () => void;
  onToggleCollapse?: () => void;
  cartMassKg?: number;
  trackLengthM?: number;
}

/**
 * SceneOutliner: Blender Outliner-inspired tree view panel.
 * Displays hierarchical curriculum navigation, active lab objects, and scene telemetry.
 */
export const SceneOutliner: React.FC<SceneOutlinerProps> = ({
  onCloseMobile,
  onToggleCollapse,
  cartMassKg = 5.0,
  trackLengthM = 12,
}) => {
  const [filter, setFilter] = useState('');
  const [physicsExpanded, setPhysicsExpanded] = useState(true);
  const [ch7Expanded, setCh7Expanded] = useState(true);

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
            ) : (
              <button
                type="button"
                className="p-0.5 rounded text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
                title="Filter Scene"
              >
                <span className="material-symbols-outlined text-[14px]">filter_alt</span>
              </button>
            )}
          </div>
        </div>

        {/* Hierarchy Filter & Search mini-bar */}
        <div className="px-3 py-1 border-b border-outline-variant/60 flex items-center bg-surface-container-lowest">
          <span className="material-symbols-outlined text-outline text-[13px] mr-1">search</span>
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter lab objects..."
            className="bg-transparent border-0 p-0 text-[11px] font-mono text-on-surface placeholder:text-outline focus:ring-0 w-full"
          />
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
                  {/* 7.1 ACTIVE SELECTION */}
                  <div className="pl-9 pr-3 py-1 flex items-center justify-between bg-primary-container/20 border-l-2 border-primary text-primary font-semibold">
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="material-symbols-outlined text-[13px] text-primary">science</span>
                      <span className="truncate text-[11px]">7.1 Work Laboratory</span>
                    </div>
                    <div className="flex items-center space-x-1 text-primary">
                      <span className="material-symbols-outlined text-[13px]">visibility</span>
                    </div>
                  </div>

                  {/* 7.2 Work-Energy */}
                  <Link
                    to="/physics/work/lab?experiment=B"
                    className="pl-9 pr-3 py-0.5 flex items-center justify-between text-on-surface-variant hover:bg-surface-container hover:text-white transition-colors"
                  >
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="material-symbols-outlined text-[13px] text-outline">circle</span>
                      <span className="truncate text-[11px]">7.2 Work-Energy Lab</span>
                    </div>
                    <span className="material-symbols-outlined text-[13px] text-outline opacity-60">visibility</span>
                  </Link>

                  {/* 7.3 Energy Conservation */}
                  <Link
                    to="/physics/work/lab?experiment=C"
                    className="pl-9 pr-3 py-0.5 flex items-center justify-between text-on-surface-variant hover:bg-surface-container hover:text-white transition-colors"
                  >
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="material-symbols-outlined text-[13px] text-outline">circle</span>
                      <span className="truncate text-[11px]">7.3 Energy Conservation</span>
                    </div>
                    <span className="material-symbols-outlined text-[13px] text-outline opacity-60">visibility</span>
                  </Link>

                  {/* 7.4 Power */}
                  <Link
                    to="/physics/work/lab?experiment=D"
                    className="pl-9 pr-3 py-0.5 flex items-center justify-between text-on-surface-variant hover:bg-surface-container hover:text-white transition-colors"
                  >
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="material-symbols-outlined text-[13px] text-outline">circle</span>
                      <span className="truncate text-[11px]">7.4 Power Laboratory</span>
                    </div>
                    <span className="material-symbols-outlined text-[13px] text-outline opacity-60">visibility</span>
                  </Link>

                  {/* 7.5 Simple Machines */}
                  <Link
                    to="/physics/work/lab?experiment=E"
                    className="pl-9 pr-3 py-0.5 flex items-center justify-between text-on-surface-variant hover:bg-surface-container hover:text-white transition-colors"
                  >
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="material-symbols-outlined text-[13px] text-outline">circle</span>
                      <span className="truncate text-[11px]">7.5 Simple Machines</span>
                    </div>
                    <span className="material-symbols-outlined text-[13px] text-outline opacity-60">visibility</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Upcoming Subjects Header */}
          <div className="mt-3 px-3 py-1 border-t border-outline-variant/40 flex items-center justify-between text-outline">
            <span className="text-[9px] uppercase tracking-wider font-semibold">Other Subjects</span>
          </div>

          {/* Mathematics */}
          <Link
            to="/mathematics"
            className="px-3 py-0.5 flex items-center justify-between text-on-surface-variant hover:bg-surface-container hover:text-white transition-colors"
          >
            <div className="flex items-center space-x-1">
              <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
              <span className="material-symbols-outlined text-[14px] text-outline">calculate</span>
              <span className="text-[12px]">Mathematics</span>
            </div>
            <span className="text-[10px] text-outline">3 Ch</span>
          </Link>

          {/* Active Scene Objects */}
          <div className="mt-3 px-3 py-1 border-t border-outline-variant/40 flex items-center justify-between text-outline">
            <span className="text-[9px] uppercase tracking-wider font-semibold">Active Scene Objects</span>
          </div>

          <div className="pl-4 pr-3 py-1 flex items-center justify-between text-on-surface-variant">
            <div className="flex items-center space-x-1.5">
              <span className="material-symbols-outlined text-[14px] text-primary">deployed_code</span>
              <span className="text-[11px] font-semibold text-white">CART_01</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 bg-surface-variant rounded text-on-surface-variant font-mono">
              m={cartMassKg.toFixed(1)}kg
            </span>
          </div>

          <div className="pl-4 pr-3 py-1 flex items-center justify-between text-on-surface-variant">
            <div className="flex items-center space-x-1.5">
              <span className="material-symbols-outlined text-[14px] text-outline">straighten</span>
              <span className="text-[11px] text-slate-300">Linear_Track</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 bg-surface-variant rounded text-on-surface-variant font-mono">
              {trackLengthM}m
            </span>
          </div>
        </div>
      </div>

      {/* Outliner Footer with CTA and Diagnostics */}
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
          <span className="flex items-center space-x-1">
            <span className="material-symbols-outlined text-[12px] text-sky-400">terminal</span>
            <span>CLI ready</span>
          </span>
        </div>
      </div>
    </aside>
  );
};
