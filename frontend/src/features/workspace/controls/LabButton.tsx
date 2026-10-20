import React from 'react';

export type LabButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost' | 'accent';
export type LabButtonSize = 'sm' | 'md' | 'lg';

export interface LabButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: LabButtonVariant;
  size?: LabButtonSize;
  icon?: React.ReactNode;
  active?: boolean;
}

/**
 * LabButton: Unified button component for scientific workstations.
 * Follows the Blender-inspired Work Laboratory design standards:
 * - Primary: LabVerse vibrant action blue (#4d8eff / #00a2ff) with high contrast text
 * - Secondary: Sleek elevated dark surface with subtle border and crisp hover states
 * - Destructive: Restrained red tint for resets and clearing operations
 * - Ghost: Flat transparent button with hover elevation
 * - Accent: Themed variant for physics/math specific tools
 * - Full keyboard focus ring, 44px touch targets on mobile/default, and accessible aria states.
 */
export const LabButton = React.forwardRef<HTMLButtonElement, LabButtonProps>(({
  variant = 'secondary',
  size = 'md',
  icon,
  active = false,
  disabled = false,
  className = '',
  children,
  ...props
}, ref) => {
  // Base workstation button styles
  const base = 'inline-flex items-center justify-center gap-1.5 font-medium transition-all select-none outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98]';

  // Sizing definitions: 'sm' for viewport toolbars, 'md' (44px) for inspectors/touch targets
  const sizeClasses = {
    sm: 'min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-semibold',
    md: 'min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold',
    lg: 'min-h-[48px] px-5 py-2.5 rounded-xl text-sm font-bold',
  }[size];

  // Variant definitions based directly on WorkLab
  const variantClasses = {
    primary: active
      ? 'bg-amber-400/20 text-amber-200 border-2 border-amber-400/60 hover:bg-amber-400/30'
      : 'bg-primary text-slate-950 font-bold border-2 border-primary hover:bg-primary-light shadow-sm',
    secondary: active
      ? 'bg-surface-elevated text-primary border border-primary/50 shadow-inner'
      : 'bg-surface-elevated hover:bg-surface-high text-slate-200 hover:text-white border border-surface-border shadow-sm',
    destructive: 'border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200',
    ghost: 'bg-transparent hover:bg-surface-elevated text-slate-300 hover:text-white border border-transparent',
    accent: 'bg-indigo-500/15 text-indigo-200 hover:bg-indigo-500/25 border border-indigo-500/40',
  }[variant];

  return (
    <button
      ref={ref}
      disabled={disabled}
      className={`${base} ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0 flex items-center justify-center text-current">{icon}</span>}
      {children}
    </button>
  );
});

LabButton.displayName = 'LabButton';
