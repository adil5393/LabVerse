import React, { useState } from 'react';

export interface DockTab { id: string; label: string; content: React.ReactNode }

/** Tabs for the Analysis Dock: measurements, graphs, data, explanation, investigation. Every tab shows real data from the lab. */
export const DockTabs: React.FC<{ tabs: DockTab[]; initial?: string }> = ({ tabs, initial }) => {
  const [active, setActive] = useState(initial ?? tabs[0]?.id);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];
  return (
    <div className="flex flex-col h-full min-h-0 bg-surface-container-low" data-testid="dock-tabs">
      <div className="h-8 px-2 border-b border-outline-variant flex items-center justify-between bg-surface-container shrink-0 select-none">
        <div role="tablist" aria-label="Analysis views" className="flex items-center space-x-1 h-full overflow-x-auto no-scrollbar">
          <div className="flex items-center space-x-1 text-primary pr-2 border-r border-outline-variant mr-1 shrink-0">
            <span className="material-symbols-outlined text-[15px]">analytics</span>
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider hidden sm:inline">ANALYSIS</span>
          </div>
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={current?.id === t.id}
              data-dock-tab={t.id}
              onClick={() => setActive(t.id)}
              className={`px-3 h-full flex items-center font-mono text-xs transition-colors whitespace-nowrap shrink-0 ${
                current?.id === t.id
                  ? 'border-b-2 border-primary text-primary font-semibold bg-surface-container-high/60 shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div role="tabpanel" className="flex-1 min-h-0 overflow-y-auto p-3" data-dock-panel={current?.id}>
        {current?.content}
      </div>
    </div>
  );
};

