import React, { useEffect, useRef, useState } from 'react';
import { fmtSigned, type WorkResult } from '../../../../engine/physics/work/workModel';

export interface BlackboardWorkspaceProps {
  onReturnToExperiment: () => void;
  result?: WorkResult;
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
];

// In-memory persistent strokes across tab switching
let globalStrokes: Stroke[] = [];

/**
 * BlackboardWorkspace: Blender-inspired Blackboard workspace matching Stitch design.
 * Interactive chalk drawing canvas with scientific color palette, stroke sizing,
 * undo/redo, clear with confirmation, split view toggle, and PNG export.
 */
export const BlackboardWorkspace: React.FC<BlackboardWorkspaceProps> = ({
  onReturnToExperiment,
  result,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<'pen' | 'marker' | 'eraser' | 'line'>('pen');
  const [color, setColor] = useState('#F8FAFC');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [strokes, setStrokes] = useState<Stroke[]>(globalStrokes);
  const [undoStack, setUndoStack] = useState<Stroke[][]>([]);
  const [splitView, setSplitView] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  // Sync to global strokes for workspace tab persistence
  useEffect(() => {
    globalStrokes = strokes;
  }, [strokes]);

  // Redraw canvas whenever strokes change or canvas resizes
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

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      redraw();
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    redraw();
  }, [strokes]);

  // Drawing event handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setUndoStack((prev) => [...prev, [...strokes]]);

    const newStroke: Stroke = {
      points: [{ x, y }],
      color,
      width: tool === 'marker' ? strokeWidth * 2.5 : strokeWidth,
      isEraser: tool === 'eraser',
    };

    setStrokes((prev) => [...prev, newStroke]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setStrokes((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      const updated = {
        ...last,
        points: [...last.points, { x, y }],
      };
      return [...prev.slice(0, -1), updated];
    });
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setStrokes(previous);
  };

  const handleClear = () => {
    if (strokes.length === 0) return;
    if (window.confirm('Clear all blackboard chalk drawings?')) {
      setUndoStack((prev) => [...prev, [...strokes]]);
      setStrokes([]);
    }
  };

  const handleSavePng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create export canvas with background
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    // Dark graphite blackboard background
    ctx.fillStyle = '#0A0E17';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    ctx.drawImage(canvas, 0, 0);

    const a = document.createElement('a');
    a.download = `labverse-blackboard-${Date.now()}.png`;
    a.href = exportCanvas.toDataURL('image/png');
    a.click();
  };

  return (
    <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden select-none bg-surface-container-lowest">
      {/* Blackboard Viewport Canvas */}
      <section className="flex-1 relative blackboard-dot-grid overflow-hidden cursor-crosshair">
        {/* Floating Smart Tool Palette (Stitch design reference: Docked at Top-Center) */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-surface-container-low/95 backdrop-blur-md border border-outline-variant rounded-xl p-1.5 flex items-center space-x-2 sm:space-x-3 shadow-2xl">
          {/* Tool Selectors */}
          <div className="flex items-center space-x-0.5 bg-surface-container-lowest p-0.5 rounded border border-outline-variant/60">
            <button
              type="button"
              onClick={() => setTool('pen')}
              className={`flex items-center justify-center w-7 h-7 rounded transition-colors ${
                tool === 'pen' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
              title="Chalk Pen"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
            </button>
            <button
              type="button"
              onClick={() => setTool('marker')}
              className={`flex items-center justify-center w-7 h-7 rounded transition-colors ${
                tool === 'marker' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
              title="Chalk Marker"
            >
              <span className="material-symbols-outlined text-[16px]">stylus</span>
            </button>
            <button
              type="button"
              onClick={() => setTool('eraser')}
              className={`flex items-center justify-center w-7 h-7 rounded transition-colors ${
                tool === 'eraser' ? 'bg-error text-slate-950 font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
              title="Chalk Eraser"
            >
              <span className="material-symbols-outlined text-[16px]">ink_eraser</span>
            </button>
          </div>

          <div className="h-5 w-px bg-outline-variant" />

          {/* Color Swatches */}
          <div className="flex items-center space-x-1.5" title="Scientific Color Palette">
            {PALETTE.map((p) => (
              <button
                key={p.color}
                type="button"
                onClick={() => {
                  setColor(p.color);
                  if (tool === 'eraser') setTool('pen');
                }}
                className={`w-5 h-5 rounded-full transition-transform hover:scale-110 ${
                  color === p.color && tool !== 'eraser'
                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface-container-low scale-110'
                    : ''
                }`}
                style={{ backgroundColor: p.color }}
                title={p.name}
              />
            ))}
          </div>

          <div className="h-5 w-px bg-outline-variant" />

          {/* Stroke Width Stepper */}
          <div className="flex items-center space-x-1 text-xs font-mono">
            <span className="text-outline text-[10px] mr-0.5">SIZE</span>
            {[2, 4, 8].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setStrokeWidth(size)}
                className={`w-6 h-6 flex items-center justify-center rounded text-xs transition-colors ${
                  strokeWidth === size
                    ? 'bg-surface-container text-primary font-bold border border-outline-variant'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-outline-variant" />

          {/* Actions: Undo, Clear, Save, Return */}
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={handleUndo}
              disabled={strokes.length === 0}
              className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container disabled:opacity-40"
              title="Undo"
            >
              <span className="material-symbols-outlined text-[16px]">undo</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded text-on-surface-variant hover:text-error hover:bg-surface-container"
              title="Clear Board"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
            </button>
            <button
              type="button"
              onClick={handleSavePng}
              className="p-1 rounded text-on-surface-variant hover:text-primary hover:bg-surface-container"
              title="Export as PNG"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
            </button>
            <button
              type="button"
              onClick={() => setSplitView(!splitView)}
              className={`p-1 rounded transition-colors ${
                splitView ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
              title="Toggle Mini Sim Split View"
            >
              <span className="material-symbols-outlined text-[16px]">splitscreen</span>
            </button>
          </div>
        </div>

        {/* The Interactive Canvas */}
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full h-full block touch-none"
        />

        {/* In-Canvas Chalk Formula Prompt */}
        <div className="absolute bottom-4 left-4 p-3 rounded-xl bg-surface-container/60 border border-outline-variant/40 backdrop-blur pointer-events-none">
          <p className="chalk-font text-xl text-primary font-bold">
            Work Done: W = F &middot; s &middot; cos(&theta;)
          </p>
          <p className="font-mono text-[10px] text-slate-400 mt-1">
            Freeform smart blackboard for lecture notes & free-body diagrams
          </p>
        </div>

        {/* Mini Simulation Split View (when toggled) */}
        {splitView && result && (
          <div className="absolute top-16 right-4 w-80 bg-surface-container border border-outline-variant rounded-xl p-3 shadow-2xl z-20 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-white flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Mini Sim Telemetry</span>
              </span>
              <button
                type="button"
                onClick={() => setSplitView(false)}
                className="text-outline hover:text-white"
              >
                &times;
              </button>
            </div>
            <div className="p-2 rounded bg-surface-container-lowest font-mono text-[11px] space-y-1">
              <div>Applied Force: {result.setup.forceN} N ({result.setup.angleDeg}°)</div>
              <div>Displacement: {result.setup.displacement} m</div>
              <div className="text-primary font-bold">Applied Work: {fmtSigned(result.appliedWork)} J</div>
              <div className="text-tertiary font-bold">Net Work: {fmtSigned(result.netWork)} J</div>
            </div>
            <button
              type="button"
              onClick={onReturnToExperiment}
              className="w-full py-1 rounded bg-primary text-on-primary font-mono text-xs font-semibold"
            >
              Return to Full Experiment
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
