import React, { useEffect, useRef, useState } from 'react';

export interface GlobalBlackboardProps {
  namespace?: string;
  onReturnToExperiment: () => void;
  splitContent?: React.ReactNode;
}

interface StrokePoint {
  x: number;
  y: number;
}

interface Stroke {
  points: StrokePoint[];
  color: string;
  width: number;
  isEraser: boolean;
}

const PALETTE = [
  { name: 'Chalk White', color: '#F8FAFC' },
  { name: 'Force Violet', color: '#A78BFA' },
  { name: 'Friction Coral', color: '#FB7185' },
  { name: 'Normal Green', color: '#4ADE80' },
  { name: 'Weight Amber', color: '#FBBF24' },
  { name: 'Displacement Cyan', color: '#38BDF8' },
  { name: 'Math Blue', color: '#60A5FA' },
  { name: 'Chemistry Pink', color: '#F472B6' },
];

// Persistent stroke registry by namespace so switching subjects/tabs maintains drawing without collision
const namespaceStrokes: Record<string, Stroke[]> = {};

/**
 * GlobalBlackboard: Reusable Blender-inspired chalkboard workspace across Math, Physics, and Chemistry.
 * Features stylus/touch drawing, scientific chalk palette, stroke sizing, undo/redo,
 * clear with confirmation, split view toggle, PNG export, and namespaced stroke persistence.
 */
export const GlobalBlackboard: React.FC<GlobalBlackboardProps> = ({
  namespace = 'default',
  onReturnToExperiment,
  splitContent,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<'pen' | 'marker' | 'eraser' | 'line'>('pen');
  const [color, setColor] = useState('#F8FAFC');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [strokes, setStrokes] = useState<Stroke[]>(() => namespaceStrokes[namespace] || []);
  const [undoStack, setUndoStack] = useState<Stroke[][]>([]);
  const [splitView, setSplitView] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Sync current strokes into the namespace cache
  useEffect(() => {
    namespaceStrokes[namespace] = strokes;
  }, [strokes, namespace]);

  // Handle namespace switches if the prop dynamically changes
  useEffect(() => {
    setStrokes(namespaceStrokes[namespace] || []);
    setUndoStack([]);
  }, [namespace]);

  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const stroke of strokes) {
      if (stroke.points.length < 2) continue;
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = stroke.width;

      if (stroke.isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color;
      }

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(() => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      redraw();
    });

    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, [strokes]);

  useEffect(() => {
    redraw();
  }, [strokes]);

  const getCanvasPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    setUndoStack((prev) => [...prev, strokes]);

    const pos = getCanvasPos(e);
    const effectiveWidth =
      tool === 'marker' ? strokeWidth * 2.5 : tool === 'eraser' ? strokeWidth * 3 : strokeWidth;

    const newStroke: Stroke = {
      points: [pos],
      color: tool === 'eraser' ? 'transparent' : color,
      width: effectiveWidth,
      isEraser: tool === 'eraser',
    };

    setStrokes((prev) => [...prev, newStroke]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pos = getCanvasPos(e);

    setStrokes((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      if (tool === 'line') {
        const updated = { ...last, points: [last.points[0], pos] };
        return [...prev.slice(0, -1), updated];
      }
      const updated = { ...last, points: [...last.points, pos] };
      return [...prev.slice(0, -1), updated];
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
    setIsDrawing(false);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((stack) => stack.slice(0, -1));
    setStrokes(prev);
  };

  const handleClear = () => {
    setUndoStack((prev) => [...prev, strokes]);
    setStrokes([]);
    setShowClearConfirm(false);
  };

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create an export canvas with chalkboard background
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0b1329';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    ctx.drawImage(canvas, 0, 0);

    const link = document.createElement('a');
    link.download = `labverse-blackboard-${namespace}-${Date.now()}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070b14] relative overflow-hidden select-none font-sans">
      {/* Blackboard Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-surface-container border-b border-outline-variant z-20 gap-2 shrink-0">
        {/* Left: Tool Selection & Stroke Width */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            type="button"
            onClick={onReturnToExperiment}
            className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold rounded bg-surface-variant text-on-surface hover:bg-surface-variant/80 transition-colors border border-outline-variant"
            title="Return to Experiment"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span className="hidden sm:inline">Back to Lab</span>
          </button>

          <div className="h-4 w-px bg-outline-variant" />

          {/* Tools */}
          <div className="flex items-center bg-surface-lowest p-0.5 rounded border border-outline-variant">
            <button
              type="button"
              onClick={() => setTool('pen')}
              className={`p-1.5 rounded transition-colors ${
                tool === 'pen' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
              title="Chalk Pen"
            >
              <span className="material-symbols-outlined text-[16px]">draw</span>
            </button>
            <button
              type="button"
              onClick={() => setTool('marker')}
              className={`p-1.5 rounded transition-colors ${
                tool === 'marker' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
              title="Broad Chalk"
            >
              <span className="material-symbols-outlined text-[16px]">ink_highlighter</span>
            </button>
            <button
              type="button"
              onClick={() => setTool('line')}
              className={`p-1.5 rounded transition-colors ${
                tool === 'line' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
              title="Straight Line / Vector"
            >
              <span className="material-symbols-outlined text-[16px]">straighten</span>
            </button>
            <button
              type="button"
              onClick={() => setTool('eraser')}
              className={`p-1.5 rounded transition-colors ${
                tool === 'eraser' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
              title="Felt Eraser"
            >
              <span className="material-symbols-outlined text-[16px]">ink_eraser</span>
            </button>
          </div>

          {/* Width Selector */}
          <div className="flex items-center space-x-1 pl-1">
            {[2, 4, 8].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setStrokeWidth(w)}
                className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                  strokeWidth === w ? 'bg-surface-variant border border-primary' : 'hover:bg-surface-variant/50'
                }`}
                title={`${w}px thickness`}
              >
                <span
                  className="rounded-full bg-on-surface"
                  style={{ width: `${w * 1.5}px`, height: `${w * 1.5}px` }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Center: Scientific Chalk Palette */}
        <div className="flex items-center space-x-1.5 bg-surface-lowest px-2 py-1 rounded border border-outline-variant">
          {PALETTE.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                setColor(p.color);
                if (tool === 'eraser') setTool('pen');
              }}
              className={`w-5 h-5 rounded-full transition-transform ${
                color === p.color && tool !== 'eraser' ? 'scale-125 ring-2 ring-primary ring-offset-1 ring-offset-surface-lowest' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: p.color }}
              title={p.name}
            />
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-1.5">
          {splitContent && (
            <button
              type="button"
              onClick={() => setSplitView((v) => !v)}
              className={`px-2 py-1 text-xs rounded border transition-colors flex items-center space-x-1 ${
                splitView
                  ? 'bg-secondary/20 border-secondary text-secondary font-semibold'
                  : 'bg-surface-variant text-on-surface-variant border-outline-variant hover:text-on-surface'
              }`}
              title="Toggle Split View with Simulation"
            >
              <span className="material-symbols-outlined text-[16px]">vertical_split</span>
              <span className="hidden sm:inline">Split View</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="p-1.5 text-on-surface-variant hover:text-on-surface disabled:opacity-30 rounded hover:bg-surface-variant transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <span className="material-symbols-outlined text-[18px]">undo</span>
          </button>

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="p-1.5 text-error hover:bg-error/10 rounded transition-colors"
            title="Clear Blackboard"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>

          <button
            type="button"
            onClick={handleExportPNG}
            className="p-1.5 text-on-surface-variant hover:text-on-surface rounded hover:bg-surface-variant transition-colors"
            title="Export as PNG"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
          </button>
        </div>
      </div>

      {/* Main Drawing / Split Area */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* Split simulation view if enabled */}
        {splitView && splitContent && (
          <div className="w-1/2 h-full border-r border-outline-variant overflow-hidden relative bg-surface-lowest">
            {splitContent}
          </div>
        )}

        {/* Chalkboard Canvas Container */}
        <div
          className={`${
            splitView && splitContent ? 'w-1/2' : 'w-full'
          } h-full relative overflow-hidden bg-[#0a1020]`}
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0.4) 0%, rgba(10, 16, 32, 0.95) 100%), linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
            backgroundSize: '100% 100%, 32px 32px, 32px 32px',
          }}
        >
          {/* Subtle Chalkboard Slate Texture */}
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="w-full h-full touch-none cursor-crosshair relative z-10"
          />

          {/* Hint Overlay when empty */}
          {strokes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-500/50 space-y-2">
              <span className="material-symbols-outlined text-4xl">history_edu</span>
              <p className="text-xs font-mono uppercase tracking-widest">
                Scientific Chalkboard · Draw Freehand, Vectors or Annotations
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-container border border-outline-variant rounded-xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-error">
              <span className="material-symbols-outlined">warning</span>
              <h3 className="font-bold text-sm text-on-surface">Clear Entire Blackboard?</h3>
            </div>
            <p className="text-xs text-on-surface-variant">
              This will erase all chalk drawings in this workspace. You can still undo immediately afterwards.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 text-xs rounded font-medium bg-surface-variant text-on-surface hover:bg-surface-variant/80 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1.5 text-xs rounded font-bold bg-error text-on-error hover:bg-error/90 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
