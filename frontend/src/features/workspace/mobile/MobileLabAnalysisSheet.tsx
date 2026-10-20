import React, { useState } from 'react';

export interface MobileAnalysisTab {
  id: string;
  label: string;
  icon?: string;
  content: React.ReactNode;
}

export interface MobileLabAnalysisSheetProps {
  tabs: MobileAnalysisTab[];
  activeTabId?: string;
  onTabChange?: (tabId: string) => void;
  title?: string;
  /** Live subtitle / summary chips for the handle bar (e.g. "F_net: 8 N | v: 2.4 m/s") */
  summaryChip?: React.ReactNode;
  /** Initial expanded state (defaults to false) */
  initialExpanded?: boolean;
}

/**
 * MobileLabAnalysisSheet: Collapsible bottom sheet for analysis, measurements, and graphs.
 * Stays collapsed (h-10) by default to maximize viewport room on mobile, expanding on tap
 * without permanently pushing simulation content off-screen.
 */
export const MobileLabAnalysisSheet: React.FC<MobileLabAnalysisSheetProps> = ({
  tabs,
  activeTabId: controlledTabId,
  onTabChange: controlledOnTabChange,
  title = 'Analysis & Data',
  summaryChip,
  initialExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [internalTabId, setInternalTabId] = useState(tabs[0]?.id || '');
  const activeTabId = controlledTabId ?? internalTabId;

  const handleTabSelect = (id: string) => {
    if (controlledOnTabChange) controlledOnTabChange(id);
    else setInternalTabId(id);
  };

  const activeContent = tabs.find((t) => t.id === activeTabId)?.content || tabs[0]?.content;

  return (
    <div
      className={`w-full bg-surface-container border-t border-outline-variant flex flex-col transition-all duration-200 select-none shrink-0 ${
        isExpanded ? 'h-[48vh] max-h-[420px]' : 'h-11'
      }`}
      data-testid="mobile-analysis-sheet"
      data-expanded={isExpanded}
    >
      {/* Tap-to-Toggle Header Handle (Min touch target 44px) */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full h-11 px-3 flex items-center justify-between bg-surface-container-high border-b border-outline-variant text-xs font-mono text-outline hover:text-white cursor-pointer touch-manipulation shrink-0"
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${title}`}
      >
        <div className="flex items-center space-x-2 truncate">
          <span className="material-symbols-outlined text-[16px] text-primary shrink-0">
            analytics
          </span>
          <span className="font-bold uppercase tracking-wider text-on-surface truncate">
            {title}
          </span>
          <span className="text-[10px] text-primary font-mono ml-1 shrink-0">
            {isExpanded ? '(Tap to collapse)' : '(Tap to expand)'}
          </span>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {summaryChip && !isExpanded && (
            <div className="hidden min-[360px]:flex items-center text-[10px] text-slate-300 font-mono">
              {summaryChip}
            </div>
          )}
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant transition-transform duration-200">
            {isExpanded ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}
          </span>
        </div>
      </button>

      {/* Expanded Body: Horizontal Tabs Bar + Scrollable Tab Content */}
      {isExpanded && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-surface-lowest">
          {/* Tabs Bar */}
          <div
            role="tablist"
            className="flex items-center gap-1 px-2 py-1 border-b border-outline-variant bg-surface-container overflow-x-auto no-scrollbar shrink-0"
          >
            {tabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleTabSelect(tab.id)}
                  className={`min-h-[38px] px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors touch-manipulation ${
                    isActive
                      ? 'bg-surface-variant text-primary font-bold shadow-xs'
                      : 'text-on-surface-variant hover:text-white'
                  }`}
                >
                  {tab.icon && (
                    <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
                  )}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Panel */}
          <div
            role="tabpanel"
            className="flex-1 overflow-y-auto p-3 text-xs text-on-surface"
          >
            {activeContent}
          </div>
        </div>
      )}
    </div>
  );
};
