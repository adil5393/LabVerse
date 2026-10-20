import React, { useEffect } from 'react';

export interface MobileLabParameterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

/**
 * MobileLabParameterSheet: Mobile slide-up drawer for experiment parameters (Inspector).
 * Reuses existing parameter components, validation, and controls without cluttering the main screen.
 */
export const MobileLabParameterSheet: React.FC<MobileLabParameterSheetProps> = ({
  isOpen,
  onClose,
  title = 'Experiment Parameters',
  subtitle,
  children,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs select-none touch-manipulation"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      data-testid="mobile-parameter-sheet"
    >
      {/* Backdrop tap to dismiss */}
      <div
        className="fixed inset-0 -z-10"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-Up Sheet Container */}
      <div className="bg-surface-container-high rounded-t-2xl max-h-[85vh] flex flex-col overflow-hidden border-t border-outline-variant shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-outline-variant bg-surface-container shrink-0">
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
            <div>
              <span className="font-bold text-sm text-on-surface block leading-tight">{title}</span>
              {subtitle && <span className="text-[11px] text-slate-400 block leading-tight mt-0.5">{subtitle}</span>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-on-surface-variant hover:text-on-surface rounded-lg active:bg-surface-variant"
            aria-label="Close parameters drawer"
            data-testid="close-parameter-sheet"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {children}
        </div>
      </div>
    </div>
  );
};
