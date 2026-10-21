import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export function BottomSheet({ title, onClose, children, testId, closeTestId }: { title: string; onClose: () => void; children: ReactNode; testId?: string; closeTestId?: string }) {
  const panel = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const id = useId();
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.focus();
    const keydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); closeRef.current(); }
      if (e.key !== 'Tab') return;
      const items = panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]');
      if (!items?.length) { e.preventDefault(); return; }
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || document.activeElement === panel.current)) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', keydown); if (previous?.isConnected) previous.focus(); };
  }, []);
  const sheet = <div className="app-chrome fixed inset-0 z-[80] flex items-end justify-center text-on-surface" data-testid={testId}>
    <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
    <div ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={id} className="relative w-full md:max-w-xl max-h-[85dvh] flex flex-col rounded-t-3xl bg-surface shadow-2xl outline-none overflow-hidden">
      <div className="w-10 h-1 rounded-full bg-outline-variant mx-auto mt-3 shrink-0" aria-hidden="true" />
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-surface-border shrink-0"><h2 id={id} className="font-bold text-lg">{title}</h2><button type="button" onClick={onClose} aria-label={`Close ${title}`} data-testid={closeTestId} className="experience-icon-button"><span className="material-symbols-outlined" aria-hidden>close</span></button></div>
      <div className="overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))] mobile-panel">{children}</div>
    </div>
  </div>;
  return typeof document === 'undefined' ? sheet : createPortal(sheet, document.body);
}
