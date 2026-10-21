/**
 * Sign-in screen, built from the Stitch authentication design (desktop split view, single column on phones): a CAD-grid
 * presentation pane on the left and the credential form on the right. Credentials are compared with frontend/.env for now.
 */

import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { credentialsConfigured, useAuthStore } from '../../store/useAuthStore';

const ICON = (name: string, cls = '') => <span className={`material-symbols-outlined text-[18px] ${cls}`}>{name}</span>;

const fieldBase = 'w-full bg-surface-container-lowest border border-outline-variant rounded px-3 py-2.5 pl-10 text-[13px] font-mono text-on-surface placeholder:text-outline focus:border-primary focus:ring-0 focus:outline-none transition-colors';

const Waveform: React.FC = () => (
  <svg className="w-full h-full" style={{ filter: 'drop-shadow(0 0 6px rgba(77, 142, 255, 0.45))' }} fill="none" viewBox="0 0 540 160" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <defs>
      <linearGradient id="authPrimaryWave" x1="0%" x2="100%" y1="0%" y2="0%">
        <stop offset="0%" stopColor="#4d8eff" stopOpacity="0.2" /><stop offset="50%" stopColor="#4d8eff" stopOpacity="0.9" /><stop offset="100%" stopColor="#adc6ff" stopOpacity="0.3" />
      </linearGradient>
      <linearGradient id="authHarmonic" x1="0%" x2="100%" y1="0%" y2="0%">
        <stop offset="0%" stopColor="#6ffbbe" stopOpacity="0.1" /><stop offset="50%" stopColor="#4edea3" stopOpacity="0.8" /><stop offset="100%" stopColor="#00a572" stopOpacity="0.1" />
      </linearGradient>
    </defs>
    {[90, 180, 360, 450].map((x) => <line key={x} stroke="#424754" strokeDasharray="2 4" x1={x} x2={x} y1="10" y2="150" />)}
    <line stroke="#8c909f" strokeDasharray="3 3" x1="270" x2="270" y1="10" y2="150" />
    <line stroke="#424754" x1="10" x2="530" y1="80" y2="80" />
    <path d="M 10 80 Q 75 10, 140 80 T 270 80 T 400 80 T 530 80" stroke="url(#authPrimaryWave)" strokeWidth="2.5" />
    <path d="M 10 80 C 60 130, 90 30, 160 80 C 230 130, 290 20, 360 80 C 430 140, 480 30, 530 80" stroke="url(#authHarmonic)" strokeWidth="1.8" />
    <g transform="translate(270, 80)">
      <circle r="4" fill="#adc6ff" /><circle r="9" stroke="#adc6ff" strokeDasharray="2 2" />
      <line stroke="#ffb95a" strokeWidth="2" x1="0" x2="45" y1="0" y2="-45" /><polygon fill="#ffb95a" points="45,-45 36,-41 41,-36" />
      <text fill="#ffb95a" fontFamily="JetBrains Mono" fontSize="10" fontWeight="600" x="50" y="-42">F_net = 9.81N</text>
    </g>
    <g transform="translate(140, 80)">
      <circle r="3" fill="#4edea3" /><line stroke="#4edea3" strokeWidth="1.5" x1="0" x2="0" y1="0" y2="35" /><polygon fill="#4edea3" points="0,35 -3,28 3,28" />
      <text fill="#4edea3" fontFamily="JetBrains Mono" fontSize="9" x="6" y="32">ΔV = -4.2 mV</text>
    </g>
  </svg>
);

const Brand: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-surface-container border border-outline-variant flex items-center justify-center relative shadow-sm">
      <span className="material-symbols-outlined text-primary text-[22px]">science</span>
      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-tertiary rounded-full ring-2 ring-surface-dim" />
    </div>
    <div>
      <span className="text-lg font-bold tracking-tight text-on-surface">LabVerse</span>
      {!compact && <p className="text-[10px] font-mono tracking-wider text-on-surface-variant">SCIENTIFIC COMPUTATIONAL WORKSTATION</p>}
    </div>
  </div>
);

export const LoginPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configured = credentialsConfigured();

  if (user) return <Navigate to="/" replace />;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) { setError('Sign-in is not configured: set VITE_AUTH_USERNAME and VITE_AUTH_PASSWORD in frontend/.env and rebuild.'); return; }
    if (login(username.trim(), password, remember)) navigate('/', { replace: true });
    else setError('The user name or password was not recognised.');
  };

  return (
    <main className="w-full min-h-dvh bg-surface-container-lowest text-on-surface flex flex-col lg:flex-row antialiased selection:bg-primary selection:text-white" data-testid="login-page">
      {/* LEFT: presentation pane (large screens) */}
      <section className="relative hidden lg:flex lg:w-[55%] flex-col justify-between p-6 bg-surface-dim border-r border-outline-variant overflow-hidden"
        style={{ backgroundSize: '24px 24px, 96px 96px', backgroundImage: 'linear-gradient(to right, rgba(66,71,84,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(66,71,84,0.15) 1px, transparent 1px), linear-gradient(to right, rgba(66,71,84,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(66,71,84,0.35) 1px, transparent 1px)' }}>
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-80 h-80 bg-tertiary-container/10 rounded-full blur-3xl pointer-events-none" />

        <header className="relative z-10 flex items-center justify-between border-b border-outline-variant/60 pb-4">
          <Brand />
          <div className="flex items-center gap-2 px-3 py-1 rounded bg-surface-container-low border border-outline-variant">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
            <span className="text-[10px] font-mono tracking-wider text-on-surface-variant">RIG_SIM_CORE: ACTIVE</span>
          </div>
        </header>

        <div className="relative z-10 my-auto py-6 flex flex-col gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-container border border-outline-variant text-primary-light text-[11px] font-mono">
              {ICON('precision_manufacturing', '!text-[13px]')}<span>HIGH-PRECISION BENCHTOP FRAMEWORK</span>
            </div>
            <h1 className="text-[32px] leading-10 font-semibold tracking-tight text-on-surface">LabVerse Scientific Workstation</h1>
            <p className="text-sm font-mono text-on-surface-variant leading-relaxed">Explore science. Understand through experimentation. A disciplined, deterministic simulator engineered for academic laboratory research, physical switches, and dynamic telemetry.</p>
          </div>

          <div className="w-full bg-surface-container-low/90 rounded border border-outline-variant p-3 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/50 text-[10px] font-mono text-outline">
              <span className="flex items-center gap-1 font-semibold text-on-surface-variant uppercase tracking-wider">{ICON('rebase_edit', '!text-[14px] text-primary-light')}Orthogonal harmonic resonance &amp; flux (phase_01)</span>
              <span className="text-[13px] text-primary-light">λ = 482.16 nm | 120.4 kHz</span>
            </div>
            <div className="h-44 w-full pt-1"><Waveform /></div>
            <div className="grid grid-cols-3 gap-2 pt-2 mt-1 border-t border-outline-variant/60">
              {[['SAMPLE FREQ', '192.00 kS/s', 'text-on-surface'], ['ENTROPY DRIFT', '0.0028 rad', 'text-tertiary'], ['TOPOLOGY', 'RLC_GRID_HYBRID', 'text-primary-light']].map(([k, v, c]) => (
                <div key={k} className="bg-surface-container p-1.5 rounded"><span className="text-[10px] font-mono text-outline block">{k}</span><span className={`text-[13px] font-mono font-medium ${c}`}>{v}</span></div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[['deployed_code', 'Interactive Physics & Circuits', 'text-primary-light'], ['trending_up', 'Simulated Mechanics', 'text-secondary'], ['co_present', 'Classroom Whiteboard Ready', 'text-tertiary']].map(([icon, label, c]) => (
              <div key={label} className="flex items-center gap-1 px-3 py-1 rounded bg-surface-container border border-outline-variant text-[11px] font-mono text-on-surface">{ICON(icon, `!text-[15px] ${c}`)}<span>{label}</span></div>
            ))}
          </div>
        </div>

        <footer className="relative z-10 pt-3 border-t border-outline-variant/60 flex items-center justify-between gap-2 text-[10px] font-mono text-outline">
          <span className="flex items-center gap-1">{ICON('verified_user', '!text-[14px] text-tertiary')}<span className="text-on-surface-variant font-medium">Environment configured · local session</span></span>
          <span className="text-[13px]">DEV_AUTH // .ENV CREDENTIALS</span>
        </footer>
      </section>

      {/* RIGHT: authentication form */}
      <section className="w-full lg:w-[45%] bg-surface flex flex-col justify-between p-4 lg:p-6 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="lg:hidden"><Brand compact /></div>
          <div className="hidden lg:flex items-center gap-1 text-[10px] font-mono text-outline"><span className="w-2 h-2 rounded-full bg-primary inline-block" /><span>STATION_GATEWAY: PORT 8443</span></div>
          <span className="lg:hidden flex items-center gap-1 px-2 py-1 rounded bg-surface-container border border-outline-variant text-[10px] font-mono text-on-surface-variant"><span className="w-1.5 h-1.5 rounded-full bg-tertiary" />Auth (ENV)</span>
        </div>

        <div className="my-auto w-full max-w-md mx-auto py-6">
          <div className="mb-4 space-y-1">
            <p className="lg:hidden text-[10px] font-mono tracking-wider text-primary-light">TERMINAL ACCESS / SYS_PORT_443</p>
            <h2 className="text-2xl font-semibold tracking-tight text-on-surface">Welcome Back</h2>
            <p className="text-xs font-mono text-on-surface-variant">Sign in to access your workstation, laboratories and saved experiments.</p>
          </div>

          {error && (
            <div role="alert" data-testid="login-error" className="mb-4 p-2 bg-surface-container-high border-l-2 border-error border-y border-r border-outline-variant rounded flex items-start gap-2">
              {ICON('warning', 'text-error mt-0.5')}
              <div className="flex-1">
                <span className="text-[10px] font-mono font-semibold text-error block uppercase tracking-wider">Authentication failed</span>
                <span className="text-xs font-mono text-on-surface-variant block">{error}</span>
              </div>
              <button type="button" onClick={() => setError(null)} className="text-outline hover:text-on-surface p-0.5" aria-label="Dismiss">{ICON('close', '!text-[16px]')}</button>
            </div>
          )}

          <form className="space-y-3" onSubmit={submit} data-testid="login-form">
            <div className="space-y-1">
              <label htmlFor="username" className="text-[11px] font-mono text-on-surface-variant flex items-center gap-1">USER NAME<span className="text-error">*</span></label>
              <div className="relative flex items-center">
                <span className="absolute left-3 pointer-events-none text-outline flex items-center">{ICON('badge')}</span>
                <input id="username" name="username" type="text" autoComplete="username" required autoFocus value={username} onChange={(e) => { setUsername(e.target.value); setError(null); }} placeholder="Enter your user name" className={fieldBase} />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-[11px] font-mono text-on-surface-variant flex items-center gap-1">PASSWORD<span className="text-error">*</span></label>
              <div className="relative flex items-center">
                <span className="absolute left-3 pointer-events-none text-outline flex items-center">{ICON('lock')}</span>
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(e) => { setPassword(e.target.value); setError(null); }} placeholder="Enter your password" className={`${fieldBase} pr-11`} />
                <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} className="absolute right-1 min-w-[40px] min-h-[40px] flex items-center justify-center text-outline hover:text-on-surface">
                  {ICON(showPassword ? 'visibility_off' : 'visibility', '!text-[18px]')}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 pt-1 cursor-pointer select-none min-h-[40px]">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-4 h-4 rounded bg-surface-container border-outline-variant text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer" />
              <span className="text-[11px] font-mono text-on-surface-variant">Remember this device (30 days)</span>
            </label>

            <button type="submit" disabled={!username || !password} className="w-full h-11 bg-primary hover:bg-primary-dim active:translate-y-px disabled:opacity-50 disabled:pointer-events-none text-on-primary-container text-white rounded flex items-center justify-center gap-2 text-[15px] font-semibold tracking-wide border-t border-white/20 transition-all shadow-md" data-testid="login-submit">
              {ICON('login', '!text-[20px]')}<span>Sign In to LabVerse</span>
            </button>
          </form>

          {!configured && <p className="mt-3 text-[11px] font-mono text-secondary">No credentials are configured. Set VITE_AUTH_USERNAME and VITE_AUTH_PASSWORD in frontend/.env.</p>}
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-outline">
          <span>© LabVerse Scientific</span>
          <span className="flex items-center gap-1">{ICON('lock', '!text-[13px]')}Development sign-in</span>
        </div>
      </section>
    </main>
  );
};
