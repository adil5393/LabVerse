/**
 * Small, restrained scientific illustrations for subject cards and chapter headers. They are decorative (hidden from screen
 * readers; the heading next to them says the same thing), drawn in the reading palette so they stay quiet, and enter with
 * a short fade defined in CSS (`.sci-art`), which is switched off for reduced-motion users.
 */

import React from 'react';

const INK = '#14526a', TEAL = '#007477', SOFT = '#b3cdc3', PALE = '#e0f1eb', WARM = '#d97706', ROSE = '#db2777', LEAF = '#4d9a5b';

const ART: Record<string, React.ReactNode> = {
  physics: <>
    <path d="M60 10 L60 14" stroke={INK} strokeWidth="3" strokeLinecap="round" /><path d="M30 10 H90" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    <path d="M60 12 L42 62" stroke={TEAL} strokeWidth="2" /><circle cx="42" cy="66" r="8" fill={TEAL} />
    <path d="M60 12 L60 62" stroke={SOFT} strokeWidth="2" strokeDasharray="3 3" /><circle cx="60" cy="66" r="8" fill="none" stroke={SOFT} strokeWidth="2" strokeDasharray="3 3" />
    <path d="M34 80 Q 60 90 86 80" fill="none" stroke={SOFT} strokeWidth="2" />
  </>,
  chemistry: <>
    <path d="M50 10 H70 M54 10 V36 L34 76 Q32 82 38 82 H82 Q88 82 86 76 L66 36 V10" fill={PALE} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
    <path d="M42 62 H78 L84 76 Q86 80 80 80 H40 Q34 80 36 76 Z" fill={TEAL} opacity="0.75" />
    <circle cx="54" cy="70" r="3" fill="#fff" /><circle cx="64" cy="66" r="2" fill="#fff" /><circle cx="70" cy="52" r="3" fill="none" stroke={TEAL} strokeWidth="1.5" /><circle cx="62" cy="44" r="2" fill="none" stroke={TEAL} strokeWidth="1.5" />
  </>,
  mathematics: <>
    <path d="M20 76 L60 14 L100 76 Z" fill={PALE} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
    <path d="M60 14 V76" stroke={TEAL} strokeWidth="2" strokeDasharray="4 3" /><path d="M60 68 H68 V76" fill="none" stroke={TEAL} strokeWidth="2" />
    <circle cx="60" cy="52" r="16" fill="none" stroke={WARM} strokeWidth="2" />
  </>,
  biology: <>
    <ellipse cx="60" cy="46" rx="42" ry="32" fill={PALE} stroke={TEAL} strokeWidth="3" />
    <circle cx="52" cy="42" r="12" fill="#c4b5fd" stroke="#6d28d9" strokeWidth="2" /><circle cx="55" cy="40" r="4" fill="#6d28d9" />
    <ellipse cx="80" cy="56" rx="8" ry="4" fill={WARM} opacity="0.8" /><ellipse cx="34" cy="60" rx="7" ry="3.5" fill={LEAF} />
    <path d="M70 30 q 6 4 12 0 t 12 0" fill="none" stroke={TEAL} strokeWidth="2" />
  </>,
  robotics: <>
    <rect x="22" y="22" width="76" height="50" rx="8" fill={PALE} stroke={INK} strokeWidth="3" />
    <path d="M34 60 H52 V36 H70 V60 H86" fill="none" stroke={TEAL} strokeWidth="3" strokeLinejoin="round" />
    {[34, 52, 70, 86].map((x, i) => <circle key={x} cx={x} cy={i % 2 ? 36 : 60} r="4" fill={WARM} />)}
  </>,
  // Chapter headers
  'bio-cell': <>
    <rect x="16" y="14" width="88" height="62" rx="6" fill={PALE} stroke={LEAF} strokeWidth="4" />
    <rect x="42" y="24" width="54" height="44" rx="10" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
    <circle cx="30" cy="30" r="8" fill="#c4b5fd" stroke="#6d28d9" strokeWidth="1.5" />
    {[[26, 58], [36, 66], [70, 20], [88, 72]].map(([x, y]) => <ellipse key={x} cx={x} cy={y} rx="6" ry="3" fill={LEAF} />)}
  </>,
  'bio-tissues': <>
    <circle cx="60" cy="46" r="34" fill={PALE} stroke={LEAF} strokeWidth="3" />
    {Array.from({ length: 8 }, (_, i) => { const a = (i * Math.PI) / 4; return <g key={i}><circle cx={60 + 22 * Math.cos(a)} cy={46 + 22 * Math.sin(a)} r="5" fill="#60a5fa" /><circle cx={60 + 29 * Math.cos(a)} cy={46 + 29 * Math.sin(a)} r="3.5" fill="#86efac" /></g>; })}
  </>,
  'bio-reproduction': <>
    <path d="M60 86 V54" stroke={LEAF} strokeWidth="3" />
    {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="60" cy="30" rx="10" ry="20" transform={`rotate(${a} 60 46)`} fill="#f9a8d4" opacity="0.85" />)}
    <circle cx="60" cy="46" r="7" fill={WARM} /><circle cx="60" cy="46" r="3" fill="#65a30d" />
  </>,
  'bio-diversity': <>
    <path d="M60 84 V58 M60 58 L32 34 M60 58 L88 34 M32 34 L20 16 M32 34 L44 16 M88 34 L76 16 M88 34 L100 16" fill="none" stroke={TEAL} strokeWidth="3" strokeLinecap="round" />
    {[[20, 12, LEAF], [44, 12, WARM], [76, 12, ROSE], [100, 12, '#6d28d9']].map(([x, y, c]) => <circle key={String(x)} cx={Number(x)} cy={Number(y)} r="7" fill={String(c)} />)}
  </>,
  'chem-mixtures': <>
    <path d="M30 20 H90 L66 50 V76 H54 V50 Z" fill={PALE} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
    <path d="M44 30 H76 L64 44 H56 Z" fill={WARM} opacity="0.6" /><circle cx="60" cy="84" r="3" fill={TEAL} />
  </>,
  'chem-atom': <>
    {[0, 60, 120].map((a) => <ellipse key={a} cx="60" cy="46" rx="44" ry="15" transform={`rotate(${a} 60 46)`} fill="none" stroke={TEAL} strokeWidth="2" />)}
    <circle cx="60" cy="46" r="8" fill={WARM} /><circle cx="104" cy="46" r="4" fill={INK} />
  </>,
  'chem-foundations': <>
    <circle cx="42" cy="46" r="18" fill={PALE} stroke={INK} strokeWidth="3" /><circle cx="78" cy="46" r="18" fill={PALE} stroke={INK} strokeWidth="3" />
    <circle cx="58" cy="40" r="3.5" fill={TEAL} /><circle cx="62" cy="52" r="3.5" fill={TEAL} />
    <text x="42" y="51" fontSize="13" fontWeight="800" textAnchor="middle" fill={INK}>H</text><text x="78" y="51" fontSize="13" fontWeight="800" textAnchor="middle" fill={INK}>O</text>
  </>,
};

export const ScienceArt: React.FC<{ name: string; className?: string }> = ({ name, className = '' }) =>
  ART[name] ? <svg viewBox="0 0 120 92" aria-hidden focusable="false" className={`sci-art ${className}`}>{ART[name]}</svg> : null;
