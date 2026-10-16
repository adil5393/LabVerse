/**
 * Extensible Mathematical Tool Rail for LabVerse Mathematics Laboratory
 *
 * Implements the left panel tool palette for selecting, creating,
 * and measuring geometric elements on the Cartesian canvas.
 */

import React from 'react';
import { useMathStore } from '../../store/useMathStore';
import { MATH_TOOLS } from '../../engine/mathematics/toolRegistry';

export const MathToolRail: React.FC = () => {
  const { activeTool, setTool } = useMathStore();

  return (
    <aside className="w-14 lg:w-16 bg-surface-low border-r border-surface-border flex flex-col items-center py-4 gap-2 select-none shrink-0 z-10">
      <div className="flex flex-col items-center gap-2 w-full px-2">
        {MATH_TOOLS.map((tool) => {
          const isActive = activeTool === tool.id;

          return (
            <button
              key={tool.id}
              onClick={() => setTool(tool.id)}
              className={`relative w-10 h-10 lg:w-11 lg:h-11 rounded-xl flex items-center justify-center transition-all group ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-surface-card hover:bg-surface-elevated text-slate-400 hover:text-slate-200 border border-surface-border'
              }`}
              title={`${tool.displayName} (${tool.shortcut || ''}) — ${tool.description}`}
            >
              <span className="material-symbols-outlined text-[20px] lg:text-[22px]">
                {tool.icon}
              </span>

              {/* Tooltip on hover */}
              <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-surface-highest/95 border border-surface-border text-white text-xs font-mono whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl flex items-center gap-2">
                <span className="font-semibold">{tool.displayName}</span>
                {tool.shortcut && (
                  <span className="px-1.5 py-0.2 rounded bg-surface-card border border-surface-border text-[10px] text-slate-400">
                    {tool.shortcut}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col items-center gap-2 px-2 text-[10px] font-mono text-slate-500 text-center">
        <span>MATH TOOLS</span>
      </div>
    </aside>
  );
};
