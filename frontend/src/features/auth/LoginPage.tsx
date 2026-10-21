import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { credentialsConfigured, useAuthStore } from '../../store/useAuthStore';

export const LoginPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configured = credentialsConfigured();
  if (user) return <Navigate to="/" replace />;
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!configured) { setError('Sign-in is not available right now. Ask your teacher to check the setup.'); return; }
    if (!login(username.trim(), password, remember)) { setError('The user name or password was not recognised. Please try again.'); return; }
    const from = (location.state as { from?: string } | null)?.from;
    navigate(from && /^\/(physics|mathematics|chemistry)(\/|\?|$)/.test(from) ? from : '/', { replace: true });
  };
  return <main className="min-h-dvh bg-background text-on-surface flex flex-col lg:flex-row" data-testid="login-page">
    <section className="hidden lg:flex lg:w-1/2 bg-primary-container p-12 flex-col justify-between">
      <div className="experience-brand"><span className="experience-brand__icon"><span className="material-symbols-outlined" aria-hidden>science</span></span>LabVerse</div>
      <div className="max-w-md space-y-6">
        <span className="material-symbols-outlined text-primary !text-7xl" aria-hidden>experiment</span>
        <h1 className="text-5xl font-bold leading-tight">A world of ideas.<br />Ready to explore.</h1>
        <p className="text-lg text-slate-300 leading-relaxed">See science in action, discover patterns in mathematics, and learn by trying things for yourself.</p>
        <div className="flex flex-wrap gap-3">{['Physics', 'Mathematics', 'Chemistry'].map((subject) => <span key={subject} className="px-4 py-2 rounded-full bg-surface/60 text-sm font-semibold">{subject}</span>)}</div>
      </div>
      <p className="text-sm text-slate-400">Learn. Experiment. Understand.</p>
    </section>
    <section className="flex-1 w-full flex flex-col justify-center px-5 sm:px-8 py-8">
      <div className="w-full max-w-sm mx-auto">
        <div className="experience-brand mb-10 lg:hidden"><span className="experience-brand__icon"><span className="material-symbols-outlined" aria-hidden>science</span></span>LabVerse</div>
        <p className="text-sm text-primary font-semibold mb-2">Your next discovery is waiting</p>
        <h2 className="text-3xl font-bold">Welcome back</h2>
        <p className="text-base text-slate-400 mt-3 mb-8">Sign in with the details shared by your teacher.</p>
        {error && <p role="alert" data-testid="login-error" className="mb-5 p-4 rounded-xl border border-red-300 bg-red-500/10 text-sm text-red-700">{error}</p>}
        <form onSubmit={submit} className="space-y-5" data-testid="login-form">
          <label htmlFor="username" className="block text-sm font-semibold">User name
            <input id="username" name="username" type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} required value={username} onChange={(e) => { setUsername(e.target.value); setError(null); }} placeholder="Your user name" className="mt-2 w-full min-h-12 px-4 rounded-xl border border-surface-border bg-surface text-base font-normal" />
          </label>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold mb-2">Password</label>
            <div className="relative">
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(e) => { setPassword(e.target.value); setError(null); }} placeholder="Your password" className="w-full min-h-12 pl-4 pr-14 rounded-xl border border-surface-border bg-surface text-base" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} className="absolute right-1 top-0 min-h-12 w-12 flex items-center justify-center text-slate-400"><span className="material-symbols-outlined" aria-hidden>{showPassword ? 'visibility_off' : 'visibility'}</span></button>
            </div>
          </div>
          <label className="flex items-start gap-3 min-h-11 py-2 text-sm text-slate-300 cursor-pointer">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-5 h-5 accent-primary shrink-0 mt-0.5" />
            <span>Remember this device (30 days)<span className="block text-xs text-slate-400 mt-1">Leave this off on a shared phone.</span></span>
          </label>
          <button type="submit" disabled={!username || !password} className="experience-primary w-full disabled:opacity-40" data-testid="login-submit">Sign In to LabVerse<span className="material-symbols-outlined text-[18px]" aria-hidden>arrow_forward</span></button>
        </form>
        {!configured && <p className="mt-5 text-sm text-slate-400">Sign-in is currently unavailable. Please contact your teacher.</p>}
        <p className="mt-10 text-xs text-slate-400 leading-relaxed">Learning progress is stored in this browser. Use the same browser when you return.</p>
      </div>
    </section>
  </main>;
};
