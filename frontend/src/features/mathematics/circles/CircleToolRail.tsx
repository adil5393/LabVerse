/**
 * Left Contextual Geometry Tool Rail for Class 9 Circles Laboratory
 *
 * Implements Circle-specific construction tools with hotkeys, active indicators,
 * and clear educational tooltips.
 */

import React, { useEffect } from 'react';
import { useCircleStore } from '../../../store/useCircleStore';
import type { CircleToolId } from '../../../engine/mathematics/circles/types';

interface ToolDef {
  id: CircleToolId;
  label: string;
  shortcut: string;
  icon: string;
  description: string;
}

const CIRCLE_TOOLS: ToolDef[] = [
  {
    id: 'select',
    label: 'Select / Move',
    shortcut: 'V',
    icon: 'near_me',
    description: 'Select objects or drag circumference points along the circle',
  },
  {
    id: 'circle',
    label: 'Circle',
    shortcut: 'C',
    icon: 'radio_button_unchecked',
    description: 'Click center, then click to set radius',
  },
  {
    id: 'point_on_circle',
    label: 'Point on Circle',
    shortcut: 'P',
    icon: 'adjust',
    description: 'Place a point constrained to the circumference',
  },
  {
    id: 'chord',
    label: 'Chord',
    shortcut: 'H',
    icon: 'linear_scale',
    description: 'Select two points on the same circle to construct a chord',
  },
  {
    id: 'radius',
    label: 'Radius',
    shortcut: 'R',
    icon: 'straighten',
    description: 'Construct radial segment from center to circle boundary',
  },
  {
    id: 'diameter',
    label: 'Diameter',
    shortcut: 'D',
    icon: 'line_start_circle',
    description: 'Select circle and point to construct complete diameter (2r)',
  },
  {
    id: 'angle_measure',
    label: 'Angle Measure',
    shortcut: 'A',
    icon: 'square_foot',
    description: 'Measure subtended central or inscribed angles',
  },
  {
    id: 'tangent',
    label: 'Tangent',
    shortcut: 'T',
    icon: 'border_color',
    description: 'Construct tangent line perpendicular to radius at contact point',
  },
  {
    id: 'eraser',
    label: 'Eraser',
    shortcut: 'E',
    icon: 'ink_eraser',
    description: 'Click an object to remove it and its dependencies',
  },
];

export const CircleToolRail: React.FC = () => {
  const { activeTool, setActiveTool, deleteSelected } = useCircleStore();

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toUpperCase();
      const matched = CIRCLE_TOOLS.find((t) => t.shortcut === key);
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
  }, [setActiveTool, deleteSelected]);

  return (
    <aside className="w-14 bg-surface-low border-r border-surface-border flex flex-col items-center py-3 gap-2 shrink-0 select-none z-10">
      {CIRCLE_TOOLS.map((tool) => {
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
            <span className="material-symbols-outlined text-[20px]">{tool.icon}</span>

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
