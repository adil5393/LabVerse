/**
 * Extensible Mathematical Tool Rail for LabVerse Mathematics Laboratory
 *
 * Implements the left panel tool palette for selecting, creating,
 * and measuring geometric elements on the Cartesian canvas.
 */

import React, { useState } from 'react';
import { useMathStore } from '../../store/useMathStore';
import { MATH_TOOLS } from '../../engine/mathematics/toolRegistry';
import { MATH_COLOR_PALETTE } from '../../engine/mathematics/appearance';

export const MathToolRail: React.FC = () => {
  const { activeTool, setTool, defaultColors, setDefaultColor, drawSettings } = useMathStore();
  const [showColorPopover, setShowColorPopover] = useState(false);

  // Determine active creation tool category
  const activeToolColorKey =
    activeTool === 'point'
      ? 'point'
      : activeTool === 'segment'
      ? 'segment'
      : activeTool === 'line'
      ? 'line'
      : activeTool === 'distance'
      ? 'measurement'
      : null;

  const currentToolColor = activeToolColorKey ? defaultColors[activeToolColorKey] : null;

  return (
    <aside className="geometry-tool-palette w-14 lg:w-16 bg-surface-low border-r border-surface-border flex flex-col items-center py-4 gap-2 select-none shrink-0 z-10">
      <div className="flex flex-col items-center gap-2 w-full px-2">
        {MATH_TOOLS.map((tool) => {
          const isActive = activeTool === tool.id;

          // Color badge for geometry creation tools
          const toolColor =
            tool.id === 'point'
              ? defaultColors.point
              : tool.id === 'segment'
              ? defaultColors.segment
              : tool.id === 'line'
              ? defaultColors.line
              : tool.id === 'distance'
              ? defaultColors.measurement
              : tool.id === 'draw'
              ? drawSettings.color
              : null;

          return (
            <button
              key={tool.id}
              data-tool-label={tool.displayName}
              aria-label={tool.displayName}
              aria-pressed={isActive}
              onClick={() => {
                setTool(tool.id);
                if (tool.id !== activeTool) setShowColorPopover(false);
              }}
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

              {/* Tool default color indicator dot */}
              {toolColor && (
                <span
                  className="absolute bottom-1 right-1 w-2 h-2 rounded-full border border-surface-lowest shadow-sm"
                  style={{ backgroundColor: toolColor }}
                />
              )}

              {/* Tooltip on hover */}
              <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-surface-highest/95 border border-surface-border text-white text-xs font-mono whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl flex items-center gap-2">
                <span className="font-semibold">{tool.displayName}</span>
                {toolColor && (
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-white/40"
                    style={{ backgroundColor: toolColor }}
                  />
                )}
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

      {/* Quick Color Picker Popover for Active Creation Tool */}
      {currentToolColor && activeToolColorKey && (
        <div className="relative mt-2">
          <button
            type="button"
            onClick={() => setShowColorPopover((prev) => !prev)}
            className="w-8 h-8 rounded-lg border border-surface-border flex items-center justify-center shadow transition-transform hover:scale-110 active:scale-95"
            style={{ backgroundColor: currentToolColor }}
            title={`Active ${activeTool} color (${currentToolColor}). Click to change.`}
          >
            <span className="material-symbols-outlined text-[14px] text-slate-900 font-bold drop-shadow">
              palette
            </span>
          </button>

          {showColorPopover && (
            <div className="absolute left-full ml-3 bottom-0 p-2.5 rounded-xl bg-surface-card border border-surface-border shadow-2xl z-50 flex flex-col gap-2 w-44">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 border-b border-surface-border pb-1">
                <span className="capitalize font-bold text-white">{activeTool} Color</span>
                <span className="uppercase text-[10px] text-slate-400">{currentToolColor}</span>
              </div>

              {/* Preset Swatches */}
              <div className="grid grid-cols-4 gap-1.5">
                {MATH_COLOR_PALETTE.map((swatch) => (
                  <button
                    key={swatch.name}
                    type="button"
                    onClick={() => {
                      setDefaultColor(activeToolColorKey, swatch.value);
                      setShowColorPopover(false);
                    }}
                    className={`w-7 h-7 rounded-md transition-all flex items-center justify-center ${
                      swatch.value.toUpperCase() === currentToolColor.toUpperCase()
                        ? 'ring-2 ring-white scale-110 shadow'
                        : 'hover:scale-105 opacity-85 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: swatch.value }}
                    title={`${swatch.name} (${swatch.value})`}
                  >
                    {swatch.value.toUpperCase() === currentToolColor.toUpperCase() && (
                      <span className="material-symbols-outlined text-[13px] text-slate-900 font-bold">
                        check
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Custom Color Native Input */}
              <label className="flex items-center justify-between px-2 py-1 rounded-lg bg-surface-lowest border border-surface-border/70 text-[11px] font-mono text-slate-300 cursor-pointer">
                <span>Custom Hex</span>
                <input
                  type="color"
                  value={currentToolColor}
                  onChange={(e) => setDefaultColor(activeToolColorKey, e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
                />
              </label>
            </div>
          )}
        </div>
      )}

      <div className="mt-auto flex flex-col items-center gap-2 px-2 text-[10px] font-mono text-slate-500 text-center">
        <span>MATH TOOLS</span>
      </div>
    </aside>
  );
};
