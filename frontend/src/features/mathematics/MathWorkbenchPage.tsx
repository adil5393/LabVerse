/**
 * Main Mathematics Workbench Page for LabVerse
 *
 * Integrates Top Toolbar, Left Tool Rail, Center Interactive Canvas,
 * and Right Inspector & Educational Panel into a cohesive instrument.
 */

import React, { useEffect } from 'react';
import { MathToolbar } from './MathToolbar';
import { MathToolRail } from './MathToolRail';
import { MathCanvas } from './MathCanvas';
import { MathInspectorPanel } from './MathInspectorPanel';
import { useMathStore } from '../../store/useMathStore';

export const MathWorkbenchPage: React.FC = () => {
  const { setTool, undo, redo, selectObject } = useMathStore();

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing into an input field
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'v':
          setTool('select');
          break;
        case 'p':
          setTool('point');
          break;
        case 's':
          setTool('segment');
          break;
        case 'l':
          setTool('line');
          break;
        case 'm':
          setTool('distance');
          break;
        case 'g':
          setTool('axes');
          break;
        case 'escape':
          selectObject(null);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setTool, undo, redo, selectObject]);

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-on-surface antialiased overflow-hidden select-none">
      {/* 1. Top Compact Toolbar */}
      <MathToolbar />

      {/* 2. Main Workbench Area */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* Left: Tool Palette */}
        <MathToolRail />

        {/* Center: Interactive Mathematical Canvas */}
        <main className="flex-1 relative h-full overflow-hidden">
          <MathCanvas />
        </main>

        {/* Right: Inspector and Educational Panel */}
        <MathInspectorPanel />
      </div>
    </div>
  );
};
