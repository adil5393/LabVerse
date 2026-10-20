import React from 'react';

export interface LabToolbarProps {
  children: React.ReactNode;
  compact?: boolean;
  className?: string;
  testId?: string;
}

/**
 * LabToolbar: Unified toolbar container matching WorkLab ExperimentToolbar and ViewportFrame toolbars.
 */
export const LabToolbar: React.FC<LabToolbarProps> = ({
  children,
  compact = false,
  className = '',
  testId,
}) => {
  if (compact) {
    return (
      <div
        data-testid={testId}
        className={`flex flex-wrap items-center gap-1.5 ${className}`}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      data-testid={testId}
      className={`flex flex-wrap items-center gap-2 rounded-xl border border-surface-border bg-surface-card/70 p-2 sm:p-2.5 backdrop-blur-sm shadow-sm ${className}`}
    >
      {children}
    </div>
  );
};

export const LabToolbarDivider: React.FC<{ vertical?: boolean; className?: string }> = ({ vertical = true, className = '' }) => {
  if (vertical) {
    return <div className={`h-5 w-px bg-outline-variant mx-1 shrink-0 ${className}`} aria-hidden="true" />;
  }
  return <div className={`w-full h-px bg-outline-variant my-1 shrink-0 ${className}`} aria-hidden="true" />;
};
