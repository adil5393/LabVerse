import React from 'react';
import { BottomSheet } from '../BottomSheet';

export interface MobileLabParameterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

/** A shared, focus-managed sheet keeps experiment settings usable on narrow screens. */
export const MobileLabParameterSheet: React.FC<MobileLabParameterSheetProps> = ({
  isOpen, onClose, title = 'Experiment setup', subtitle, children,
}) => isOpen ? <BottomSheet title={title} onClose={onClose} testId="mobile-parameter-sheet" closeTestId="close-parameter-sheet">
  {subtitle && <p className="text-sm text-slate-400 mb-4">{subtitle}</p>}
  <div className="space-y-4">{children}</div>
</BottomSheet> : null;
