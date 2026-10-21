import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

/** Reading pages share a light theme; scientific canvases explicitly keep their dark palette. */
export function ExperienceFrame({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return <div className="reading-surface experience-root">
    <a href="#main-content" className="skip-link">Skip to content</a>
    <div id="main-content" tabIndex={-1}>{children}</div>
  </div>;
}
