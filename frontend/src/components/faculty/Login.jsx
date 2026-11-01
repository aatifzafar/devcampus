import React, { useState } from 'react';
import { ArrowRight, BookOpen, ClipboardCheck, Eye, EyeOff, GraduationCap, LoaderCircle, Presentation, Sparkles, Users } from 'lucide-react';
import { signIn } from '../../utils/session';

// Accounts created by "npm run db:setup" (password Alliance@123).
const DEMO = [
  { email: 'devika@alliance.edu.in', icon: Presentation, title: 'Faculty', who: 'Dr. Devika P · Theory of Computation, Data Structures' },
  { email: 'anna.sharma@alliance.edu.in', icon: GraduationCap, title: 'Student', who: 'Anna Sharma · B.Tech CSE · Section 5J' },
  { email: 'kabir.das@alliance.edu.in', icon: GraduationCap, title: 'Student', who: 'Kabir Das · B.Tech CSE · Section 5K' },
];
const DEMO_PASSWORD = 'Alliance@123';

export default function Login({ onSignedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e, creds) => {
    e?.preventDefault();
    const em = (creds?.email ?? email).trim();
    const pw = creds?.password ?? password;
    if (!em || !pw) return setError('Enter your university email and password.');
    setBusy(true);
    setError('');
    try {
      const user = await signIn(em, pw);
      onSignedIn(user);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F5F0] grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 text-white" style={{ background: 'linear-gradient(150deg, #2E1A5C, #4C2E8A 45%, #6D3FC0)' }}>
        <div className="flex items-center gap-2.5">
          <span className="w-10 h-10 rounded-xl bg-[#EA580C] flex items-center justify-center font-semibold">A</span>
          <span className="text-xl font-semibold">Alliance.ai</span>
        </div>
        <div>
          <h1 className="text-4xl font-semibold leading-tight mb-4">One place for teaching and learning at Alliance University</h1>
          <p className="text-white/75 text-lg max-w-md">Faculty share notes, run tests and classes. Students see exactly what to do next.</p>
          <div className="grid grid-cols-2 gap-3 mt-10 max-w-md">
            {[[BookOpen, 'Notes by unit'], [ClipboardCheck, 'Proctored tests'], [Users, 'Learn with friends'], [Sparkles, 'Alliance AI']].map(([Icon, t]) => (
              <div key={t} className="flex items-center gap-2 text-sm text-white/85"><Icon className="w-4 h-4" />{t}</div>
            ))}
          </div>
        </div>
        <p className="text-xs text-white/50">Alliance School of Advanced Computing</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <span className="w-10 h-10 rounded-xl bg-[#EA580C] text-white flex items-center justify-center font-semibold">A</span>
            <span className="text-xl font-semibold text-zinc-900">Alliance.ai</span>
          </div>
          <h2 className="text-2xl font-semibold text-zinc-900 mb-1">Sign in</h2>
          <p className="text-zinc-500 mb-6">Use your university email.</p>
          <form onSubmit={submit} className="space-y-3" noValidate>
            <label className="block">
              <span className="block text-sm font-medium text-zinc-800 mb-1.5">Email</span>
              <input type="email" autoComplete="username" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} placeholder="name@alliance.edu.in"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-[15px] focus:outline-none focus:border-[#6D3FC0]" />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-zinc-800 mb-1.5">Password</span>
              <span className="relative block">
                <input type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-zinc-200 bg-white text-[15px] focus:outline-none focus:border-[#6D3FC0]" />
                <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700" aria-label={show ? 'Hide password' : 'Show password'}>
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </span>
            </label>
            {error && <p role="alert" className="text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2.5">{error}</p>}
            <button type="submit" disabled={busy} className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#6D3FC0] hover:bg-[#5B32A6] text-white font-medium disabled:opacity-60">
              {busy ? <LoaderCircle className="w-4 h-4 animate-spin" /> : null}Sign in
            </button>
          </form>

          <div className="flex items-center gap-3 my-6 text-xs text-zinc-400"><span className="h-px flex-1 bg-zinc-200" />Demo accounts<span className="h-px flex-1 bg-zinc-200" /></div>
          <div className="space-y-2">
            {DEMO.map(({ email: em, icon: Icon, title, who }) => (
              <button key={em} type="button" disabled={busy} onClick={() => { setEmail(em); setPassword(DEMO_PASSWORD); submit(null, { email: em, password: DEMO_PASSWORD }); }}
                className="group w-full text-left bg-white rounded-2xl border border-[#E4E4E7] px-4 py-3 hover:border-[#6D3FC0] transition-colors flex items-center gap-3 disabled:opacity-60">
                <span className="w-9 h-9 rounded-xl bg-[#F1EEFB] text-[#6D3FC0] flex items-center justify-center shrink-0"><Icon className="w-[18px] h-[18px]" /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-zinc-900">{title}</span><span className="block text-xs text-zinc-500 truncate">{who}</span></span>
                <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-[#6D3FC0]" />
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-500 mt-4">Demo password: <span className="font-mono">{DEMO_PASSWORD}</span>. Open faculty and a student in two tabs or two devices: whatever faculty share appears for students straight away.</p>
        </div>
      </div>
    </div>
  );
}
