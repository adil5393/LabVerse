import React, { useEffect, useRef, useState } from 'react';

/** Keep the same simulation mounted when moving between a lesson and focus mode. */
export function InteractiveActivity({ children }: { children: React.ReactNode }) {
  const [focused, setFocused] = useState(false);
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
    <div ref={root} className={`physics-activity science-surface ${focused ? 'activity-focused' : ''}`}
      role={focused ? 'dialog' : undefined} aria-modal={focused || undefined} aria-label={focused ? 'Physics activity' : undefined}>
      <div className="activity-toolbar">
        <span className="text-xs font-semibold">Try it yourself</span>
        {focused
          ? <button ref={close} type="button" onClick={() => setFocused(false)}>Back to lesson <span aria-hidden>↙</span></button>
          : <button ref={trigger} type="button" onClick={() => setFocused(true)}>Focus activity <span aria-hidden>↗</span></button>}
      </div>
      <div className="activity-content">{children}</div>
    </div>
  );
}

export function ActivityDetails({ title, children }: { title: string; children: React.ReactNode }) {
  return <details className="activity-details"><summary>{title}</summary><div className="space-y-3 pt-3">{children}</div></details>;
}
