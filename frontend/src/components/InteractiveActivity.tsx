import React, { useEffect, useRef, useState } from 'react';

/** Keep the same simulation mounted when moving between a lesson and focus mode. */
export function InteractiveActivity({ children, calm = false, title = 'Try it yourself', label = 'Physics activity', closeLabel = 'Back to lesson', resettable = false, onReset }: {
  children: React.ReactNode; calm?: boolean; title?: string;
  /** Accessible name of the focus-mode dialog. */
  label?: string;
  /** Text of the button that leaves focus mode. */
  closeLabel?: string;
  /** Show a Reset button that returns the activity to its starting settings (it remounts the children). */
  resettable?: boolean;
  onReset?: () => void;
}) {
  const [focused, setFocused] = useState(false);
  const [generation, setGeneration] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!focused || !root.current) return;
    const previous = document.body.style.overflow;
    const returnFocus = trigger.current;
    document.body.style.overflow = 'hidden';
    const siblings: { element: HTMLElement; inert: boolean }[] = [];
    let branch: HTMLElement = root.current;
    while (branch.parentElement && branch !== document.body) {
      for (const sibling of branch.parentElement.children) {
        if (sibling !== branch && sibling instanceof HTMLElement) {
          siblings.push({ element: sibling, inert: sibling.inert });
          sibling.inert = true;
        }
      }
      branch = branch.parentElement;
    }
    close.current?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setFocused(false); }
      if (event.key !== 'Tab') return;
      const targets = [...root.current!.querySelectorAll<HTMLElement>('button, input, select, textarea, a[href], [tabindex="0"], summary')]
        .filter(el => !el.hasAttribute('disabled') && el.getClientRects().length > 0);
      const first = targets[0], last = targets[targets.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', key);
    return () => {
      document.body.style.overflow = previous;
      siblings.forEach(({ element, inert }) => { element.inert = inert; });
      document.removeEventListener('keydown', key);
      returnFocus?.focus();
    };
  }, [focused]);
  return (
    <div ref={root} className={`physics-activity ${calm ? 'app-chrome forces-session' : 'science-surface'} ${focused ? 'activity-focused' : ''}`}
      role={focused ? 'dialog' : undefined} aria-modal={focused || undefined} aria-label={focused ? label : undefined}>
      <div className="activity-toolbar">
        <span className="text-xs font-semibold">{title}</span>
        <span className="activity-toolbar__actions">
        {focused
          ? <button ref={close} type="button" onClick={() => setFocused(false)}>{closeLabel} <span aria-hidden>↙</span></button>
          : <button ref={trigger} type="button" onClick={() => setFocused(true)}>Focus activity <span aria-hidden>↗</span></button>}
        {resettable && <button type="button" data-action="reset-activity" onClick={() => { setGeneration((g) => g + 1); onReset?.(); }}>Reset <span aria-hidden>↺</span></button>}
        </span>
      </div>
      <div className="activity-content"><React.Fragment key={generation}>{children}</React.Fragment></div>
    </div>
  );
}

export function ActivityDetails({ title, children }: { title: string; children: React.ReactNode }) {
  return <details className="activity-details"><summary>{title}</summary><div className="space-y-3 pt-3">{children}</div></details>;
}
