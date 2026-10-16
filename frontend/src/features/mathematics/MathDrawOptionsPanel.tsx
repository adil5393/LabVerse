/**
 * Compact Freehand Drawing Options Panel for LabVerse Mathematics Laboratory
 *
 * Provides Pen / Eraser mode toggle, color presets, custom color picker,
 * stroke thickness slider (2-12px), and isolated Clear Drawings action.
 */

import React, { useState } from 'react';
import { useMathStore } from '../../store/useMathStore';
import { MATH_COLOR_PALETTE } from '../../engine/mathematics/appearance';

export const MathDrawOptionsPanel: React.FC = () => {
  const {
    activeTool,
    drawSettings,
    setDrawSettings,
    drawingOrder,
    clearAllDrawings,
  } = useMathStore();

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (activeTool !== 'draw') return null;

  const hasDrawings = drawingOrder.length > 0;

  return (
    <div
      className="absolute top-3 left-4 z-20 flex flex-col gap-2.5 p-3 rounded-2xl bg-surface-card/95 backdrop-blur-md border border-surface-border shadow-2xl text-white select-none max-w-xs animate-in fade-in slide-in-from-top-2 duration-150"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Header & Mode Switcher */}
      <div className="flex items-center justify-between gap-2 border-b border-surface-border/70 pb-2">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-200">
          <span className="material-symbols-outlined text-[18px] text-primary">draw</span>
          <span>Draw Tool</span>
        </div>

        {/* Pen | Eraser Toggle */}
        <div className="flex items-center p-0.5 rounded-lg bg-surface-lowest border border-surface-border/80">
          <button
            type="button"
            onClick={() => setDrawSettings({ mode: 'pen' })}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold flex items-center gap-1 transition-all ${
              drawSettings.mode === 'pen'
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Freehand Pen (Draw on canvas)"
          >
            <span className="material-symbols-outlined text-[14px]">edit</span>
            <span>Pen</span>
          </button>

          <button
            type="button"
            onClick={() => setDrawSettings({ mode: 'eraser' })}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold flex items-center gap-1 transition-all ${
              drawSettings.mode === 'eraser'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Drawing Eraser (Erases only freehand strokes, geometry is protected)"
          >
            <span className="material-symbols-outlined text-[14px]">ink_eraser</span>
            <span>Eraser</span>
          </button>
        </div>
      </div>

      {drawSettings.mode === 'pen' ? (
        <>
          {/* Color Presets & Custom Color */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Stroke Color</span>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full border border-surface-border shadow-sm"
                  style={{ backgroundColor: drawSettings.color }}
                />
                <span className="text-[10px] uppercase font-bold text-slate-300">
                  {drawSettings.color}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-surface-lowest p-1.5 rounded-xl border border-surface-border/60">
              {MATH_COLOR_PALETTE.map((swatch) => {
                const isSelected =
                  swatch.value.toUpperCase() === drawSettings.color.toUpperCase();
                return (
                  <button
                    key={swatch.name}
                    type="button"
                    onClick={() => setDrawSettings({ color: swatch.value })}
                    className={`w-5 h-5 rounded-md transition-all flex items-center justify-center ${
                      isSelected
                        ? 'ring-2 ring-white scale-110 shadow-md'
                        : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: swatch.value }}
                    title={swatch.name}
                  >
                    {isSelected && (
                      <span className="material-symbols-outlined text-[11px] text-slate-900 font-bold">
                        check
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Custom native color picker input */}
              <label
                className="w-5 h-5 rounded-md border border-dashed border-slate-500 hover:border-slate-300 flex items-center justify-center cursor-pointer transition-colors relative"
                title="Custom Color"
              >
                <span className="material-symbols-outlined text-[13px] text-slate-400">
                  colorize
                </span>
                <input
                  type="color"
                  value={drawSettings.color}
                  onChange={(e) => setDrawSettings({ color: e.target.value })}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </label>
            </div>
          </div>

          {/* Stroke Width Slider (2-12px) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Thickness</span>
              <span className="px-1.5 py-0.5 rounded bg-surface-lowest text-primary text-[10px] font-bold">
                {drawSettings.width}px
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="range"
                min="2"
                max="12"
                step="1"
                value={drawSettings.width}
                onChange={(e) => setDrawSettings({ width: Number(e.target.value) })}
                className="flex-1 h-1.5 bg-surface-lowest rounded-lg appearance-none cursor-pointer accent-primary"
              />
              {/* Preview dot */}
              <div className="w-5 h-5 flex items-center justify-center bg-surface-lowest rounded-md border border-surface-border/60">
                <span
                  className="rounded-full"
                  style={{
                    width: `${drawSettings.width}px`,
                    height: `${drawSettings.width}px`,
                    backgroundColor: drawSettings.color,
                  }}
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Eraser mode explanatory banner */
        <div className="p-2 rounded-xl bg-surface-lowest border border-rose-500/30 text-[11px] font-mono text-slate-300 flex items-start gap-2">
          <span className="material-symbols-outlined text-rose-400 text-[16px] shrink-0 mt-0.5">
            auto_delete
          </span>
          <p className="leading-snug">
            Drag across freehand strokes to erase them. Mathematical geometry is safe and protected.
          </p>
        </div>
      )}

      {/* Clear Drawings Section */}
      <div className="border-t border-surface-border/70 pt-2 flex items-center justify-between gap-2">
        {showClearConfirm ? (
          <div className="flex items-center justify-between gap-1.5 w-full p-1 rounded-xl bg-surface-lowest border border-amber-500/50">
            <span className="text-[10.5px] font-mono text-amber-300 pl-1">
              Clear {drawingOrder.length} drawings?
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  clearAllDrawings();
                  setShowClearConfirm(false);
                }}
                className="px-2 py-0.5 rounded-md bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold font-mono transition-colors"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-2 py-0.5 rounded-md bg-surface-card hover:bg-surface-elevated text-slate-300 text-[10px] font-mono transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (hasDrawings) setShowClearConfirm(true);
            }}
            disabled={!hasDrawings}
            className="w-full py-1 px-2.5 rounded-xl bg-surface-lowest hover:bg-surface-elevated disabled:opacity-40 disabled:cursor-not-allowed border border-surface-border text-slate-300 hover:text-rose-300 text-[11px] font-mono font-semibold transition-all flex items-center justify-center gap-1.5"
            title={
              hasDrawings
                ? 'Remove all freehand drawings while preserving mathematical geometry'
                : 'No freehand drawings on canvas'
            }
          >
            <span className="material-symbols-outlined text-[15px] text-slate-400 group-hover:text-rose-400">
              delete_sweep
            </span>
            <span>Clear Drawings</span>
            {hasDrawings && (
              <span className="px-1 py-0.2 rounded bg-surface-card text-[9px] text-slate-400">
                {drawingOrder.length}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
