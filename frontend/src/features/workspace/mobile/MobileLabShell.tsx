import React from 'react';

export interface MobileLabShellProps {
  viewport: React.ReactNode;
  transport: React.ReactNode;
  toolbar?: React.ReactNode;
  analysisSheet?: React.ReactNode;
  parameterSheet?: React.ReactNode;
}

/**
 * MobileLabShell: Complete mobile layout container coordinating viewport,
 * transport, toggles, parameter drawer, and analysis bottom sheet.
 * Structured to fit cleanly inside mobile phone screen bounds (320–430px width)
 * without arbitrary scrolling or horizontal overflow.
 */
export const MobileLabShell: React.FC<MobileLabShellProps> = ({
  viewport,
  transport,
  toolbar,
  analysisSheet,
  parameterSheet,
}) => {
  return (
    <div
      className="w-full h-full flex flex-col bg-background text-on-surface select-none overflow-hidden"
      data-testid="mobile-lab-shell"
    >
      {/* 1. Experiment Simulation Viewport (35-38% height) */}
      <div className="shrink-0 w-full">
        {viewport}
      </div>

      {/* 2. Interactive Middle Controls Zone (Flexible / Scrollable if screen is very short) */}
      <div className="flex-1 min-h-0 flex flex-col overflow-y-auto no-scrollbar">
        {transport}
        {toolbar}
      </div>

      {/* 3. Sticky Bottom Analysis Sheet */}
      {analysisSheet && (
        <div className="shrink-0 w-full">
          {analysisSheet}
        </div>
      )}

      {/* 4. Modal Parameter Drawer */}
      {parameterSheet}
    </div>
  );
};
