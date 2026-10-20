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
  return (
    <div
      className={`w-full relative flex flex-col bg-surface-lowest border-b border-outline-variant overflow-hidden select-none shrink-0 touch-manipulation ${className}`}
      data-testid="mobile-lab-viewport"
    >
      {/* Optional Top-Left Live Telemetry Overlay */}
      {telemetry && (
        <div className="absolute top-2 left-2 z-20 pointer-events-none">
          <div className="pointer-events-auto">{telemetry}</div>
        </div>
      )}

      {/* Optional Top-Right Overlay Controls */}
      {overlayControls && (
        <div className="absolute top-2 right-2 z-20 flex items-center space-x-1">
          {overlayControls}
        </div>
      )}

      {/* Simulation Content */}
      <div className="w-full h-full flex flex-col min-h-0 relative">
        {children}
      </div>
    </div>
  );
};
