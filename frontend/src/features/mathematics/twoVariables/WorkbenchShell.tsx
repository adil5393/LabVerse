/**
 * Responsive layout for the Two Variables workbenches (M5).
 *
 * Desktop / TV (lg+): [lesson panel] | canvas | [tools inspector], both side
 * panels collapsible.
 * Phones / small tablets: the graph keeps priority; the lesson and tools sit
 * in one collapsible bottom sheet with a tab strip. Nothing scales a desktop
 * layout down; the structure itself changes.
 */

import React, { useState } from 'react';

interface Props {
  canvas: React.ReactNode;
  tools: React.ReactNode;
  lesson?: React.ReactNode;
  /** Tab to open first in the phone sheet. */
  defaultSheetTab?: 'lesson' | 'tools';
}

export const WorkbenchShell: React.FC<Props> = ({ canvas, tools, lesson, defaultSheetTab }) => {
  const [sheetTab, setSheetTab] = useState<'lesson' | 'tools'>(lesson ? (defaultSheetTab ?? 'lesson') : 'tools');
  const [sheetOpen, setSheetOpen] = useState(true);
  const [lessonOpen, setLessonOpen] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(true);

  return (
    <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
      {/* Desktop lesson column */}
      {lesson && (
        <aside className={`hidden lg:flex flex-col shrink-0 border-r border-surface-border bg-surface-low transition-[width] duration-200 ${lessonOpen ? 'w-[360px] xl:w-[400px]' : 'w-10'}`}>
          <button
            type="button"
            onClick={() => setLessonOpen(!lessonOpen)}
            className="h-9 flex items-center justify-center gap-1.5 text-[11px] font-mono text-slate-400 hover:text-white border-b border-surface-border shrink-0"
            aria-expanded={lessonOpen}
            aria-label={lessonOpen ? 'Collapse lesson panel' : 'Expand lesson panel'}
          >
            <span className="material-symbols-outlined text-[16px]">{lessonOpen ? 'chevron_left' : 'chevron_right'}</span>
            {lessonOpen && <span>Lesson</span>}
          </button>
          {lessonOpen && <div className="flex-1 min-h-0 overflow-y-auto">{lesson}</div>}
        </aside>
      )}

      {/* Canvas */}
      <main className="flex-1 min-h-0 min-w-0 relative bg-background">{canvas}</main>

      {/* Desktop tools column */}
      <aside className={`hidden lg:flex flex-col shrink-0 border-l border-surface-border bg-surface-low transition-[width] duration-200 ${toolsOpen ? 'w-[340px] xl:w-[380px]' : 'w-10'}`}>
        <button
          type="button"
          onClick={() => setToolsOpen(!toolsOpen)}
          className="h-9 flex items-center justify-center gap-1.5 text-[11px] font-mono text-slate-400 hover:text-white border-b border-surface-border shrink-0"
          aria-expanded={toolsOpen}
          aria-label={toolsOpen ? 'Collapse inspector' : 'Expand inspector'}
        >
          <span className="material-symbols-outlined text-[16px]">{toolsOpen ? 'chevron_right' : 'chevron_left'}</span>
          {toolsOpen && <span>Inspector</span>}
        </button>
        {toolsOpen && <div className="flex-1 min-h-0 overflow-y-auto">{tools}</div>}
      </aside>

      {/* Phone / tablet bottom sheet */}
      <section className={`lg:hidden shrink-0 flex flex-col border-t border-surface-border bg-surface-low ${sheetOpen ? (sheetTab === 'lesson' && lesson ? 'h-[48vh]' : 'h-[36vh]') : ''}`} aria-label="Lesson and tools">
        <div className="flex items-stretch shrink-0 border-b border-surface-border">
          {lesson && (
            <button
              type="button"
              onClick={() => {
                setSheetTab('lesson');
                setSheetOpen(true);
              }}
              className={`flex-1 h-12 text-sm font-mono font-bold ${sheetTab === 'lesson' && sheetOpen ? 'text-purple-300 bg-purple-500/10' : 'text-slate-400'}`}
            >
              Lesson
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setSheetTab('tools');
              setSheetOpen(true);
            }}
            className={`flex-1 h-12 text-sm font-mono font-bold ${sheetTab === 'tools' && sheetOpen ? 'text-purple-300 bg-purple-500/10' : 'text-slate-400'}`}
          >
            Tools
          </button>
          <button
            type="button"
            onClick={() => setSheetOpen(!sheetOpen)}
            className="w-14 h-12 flex items-center justify-center text-slate-300"
            aria-label={sheetOpen ? 'Collapse panel' : 'Expand panel'}
            aria-expanded={sheetOpen}
          >
            <span className="material-symbols-outlined">{sheetOpen ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}</span>
          </button>
        </div>
        {sheetOpen && <div className="flex-1 min-h-0 overflow-y-auto">{sheetTab === 'lesson' && lesson ? lesson : tools}</div>}
      </section>
    </div>
  );
};
