import React from 'react';

export interface MobileLabViewportProps {
  children: React.ReactNode;
  /** Optional floating live metric pill at the top-left */
  telemetry?: React.ReactNode;
  /** Optional floating utility icons at the top-right (e.g. recenter, help) */
  overlayControls?: React.ReactNode;
  /** Custom height override (defaults to 35-38vh with min 200px and max 280px) */
  className?: string;
}

/**
 * MobileLabViewport: Reusable mobile-first container for the primary scientific simulation.
 * Ensures the experiment stays within the 35–40% usable screen height budget on small phones,
 * eliminating empty dead space while keeping all vectors and scale visible.
 */
export const MobileLabViewport: React.FC<MobileLabViewportProps> = ({
  children,
  telemetry,
  overlayControls,
  className = 'h-[36vh] min-h-[200px] max-h-[270px]',
}) => {
  const hasTopBar = Boolean(telemetry || overlayControls);
  return (
    <div
      className={`w-full relative flex flex-col bg-surface-lowest border-b border-outline-variant overflow-hidden select-none shrink-0 touch-manipulation ${className}`}
      data-testid="mobile-lab-viewport"
    >
      {/* Top Telemetry & Controls Bar - in-flow to prevent obscuring experiment track/canvas */}
      {hasTopBar && (
        <div className="w-full flex items-center justify-between px-2.5 py-1 z-20 shrink-0 bg-surface-lowest/95 border-b border-surface-border/40 min-h-[32px]">
          <div className="min-w-0 flex items-center">{telemetry}</div>
          {overlayControls && (
            <div className="flex items-center space-x-1 shrink-0 ml-auto">{overlayControls}</div>
          )}
        </div>
      )}

      {/* Simulation Content */}
      <div className="w-full flex-1 min-h-0 relative flex flex-col">
        {children}
      </div>
    </div>
  );
};
