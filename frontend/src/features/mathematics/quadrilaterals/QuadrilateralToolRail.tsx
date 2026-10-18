/**
 * Contextual Tool Rail for Class 9 Quadrilaterals Laboratory (Milestone M3)
 * NCERT Ganita Manjari Part II, Chapter 12
 *
 * Implements dedicated construction tools with hotkeys, active indicators,
 * and guided mode toolset filtering.
 */

import React, { useEffect } from 'react';
import { useQuadrilateralStore } from '../../../store/useQuadrilateralStore';
import type { QuadToolId } from '../../../engine/mathematics/quadrilaterals/types';

interface ToolDef {
  id: QuadToolId;
  label: string;
  shortcut: string;
  icon: string;
  description: string;
}

const QUAD_TOOLS: ToolDef[] = [
  {
    id: 'select',
    label: 'Select / Move',
    shortcut: 'V',
    icon: 'near_me',
    description: 'Select elements or drag vertices to transform polygons dynamically',
  },
  {
    id: 'point',
    label: 'Point',
    shortcut: 'P',
    icon: 'adjust',
    description: 'Click anywhere to create a new free point',
  },
  {
    id: 'segment',
    label: 'Segment',
    shortcut: 'S',
    icon: 'linear_scale',
    description: 'Click two points to construct a line segment',
  },
  {
    id: 'quadrilateral',
    label: 'Quadrilateral',
    shortcut: 'Q',
    icon: 'crop_square',
    description: 'Click four points in order to construct a quadrilateral',
  },
  {
    id: 'midpoint',
    label: 'Midpoint',
    shortcut: 'M',
    icon: 'call_split',
    description: 'Select a segment or two points to construct the exact midpoint',
  },
  {
    id: 'diagonal',
    label: 'Diagonal',
    shortcut: 'D',
    icon: 'line_start_circle',
    description: 'Select two opposite vertices to construct a diagonal',
  },
  {
    id: 'parallel_constraint',
    label: 'Parallel Constraint',
    shortcut: 'L',
    icon: '∥',
    description: 'Constrain two segments to remain parallel (select 1st reference, then 2nd)',
  },
  {
    id: 'perpendicular_constraint',
    label: 'Perpendicular',
    shortcut: 'T',
    icon: 'border_color',
    description: 'Construct a perpendicular line segment or check 90° angle',
  },
  {
    id: 'angle_measure',
    label: 'Angle Measure',
    shortcut: 'A',
    icon: '∠',
    description: 'Click three points (Point 1 -> Vertex -> Point 2) to measure angle',
  },
  {
    id: 'distance_measure',
    label: 'Distance Measure',
    shortcut: 'K',
    icon: 'straighten',
    description: 'Select two points to measure Euclidean distance between them',
  },
  {
    id: 'eraser',
    label: 'Eraser',
    shortcut: 'E',
    icon: 'ink_eraser',
    description: 'Click any point, segment, or angle to delete it',
  },
];

interface QuadrilateralToolRailProps {
  allowedTools?: string[];
}

export const QuadrilateralToolRail: React.FC<QuadrilateralToolRailProps> = ({
  allowedTools,
}) => {
  const { activeTool, setActiveTool, deleteSelected } = useQuadrilateralStore();

  const visibleTools = allowedTools
    ? QUAD_TOOLS.filter((t) => allowedTools.includes(t.id))
    : QUAD_TOOLS;

  // If active tool is hidden by the current lesson filter, switch to select
  useEffect(() => {
    if (allowedTools && allowedTools.length > 0 && !allowedTools.includes(activeTool)) {
      setActiveTool('select');
    }
  }, [allowedTools, activeTool, setActiveTool]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      const key = e.key.toUpperCase();
      const matched = visibleTools.find((t) => t.shortcut === key);
      if (matched) {
        e.preventDefault();
        setActiveTool(matched.id);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visibleTools, setActiveTool, deleteSelected]);

  return (
    <aside className="w-14 bg-surface-low border-r border-surface-border flex flex-col items-center py-3 gap-2 shrink-0 select-none z-10">
      {visibleTools.map((tool) => {
        const isActive = activeTool === tool.id;
        return (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative group ${
              isActive
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-md shadow-amber-950/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-surface-elevated'
            }`}
            title={`${tool.label} (${tool.shortcut})`}
          >
            {tool.icon === '∥' ? (
              <span className="font-bold text-[19px] leading-none select-none tracking-tighter">∥</span>
            ) : tool.icon === '∠' ? (
              <span className="font-bold text-[19px] leading-none select-none">∠</span>
            ) : (
              <span className="material-symbols-outlined text-[20px]">{tool.icon}</span>
            )}

            {/* Micro badge for shortcut key */}
            <span className="absolute -bottom-1 -right-1 text-[8px] font-mono px-1 rounded bg-surface-lowest text-slate-500 border border-surface-border">
              {tool.shortcut}
            </span>

            {/* Hover Tooltip */}
            <div className="absolute left-14 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg bg-surface-elevated border border-surface-border text-slate-200 text-xs font-medium whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-30">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>{tool.label}</span>
                <span className="text-[10px] text-amber-400 font-mono">[{tool.shortcut}]</span>
              </div>
              <div className="text-[10px] text-slate-400">{tool.description}</div>
            </div>
          </button>
        );
      })}
    </aside>
  );
};
