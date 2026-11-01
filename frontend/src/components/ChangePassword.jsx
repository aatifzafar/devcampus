// Change the signed-in user's password (POST /api/auth/password).
import React, { useState } from 'react';
import { CircleCheck, KeyRound } from 'lucide-react';
import { apiFetch } from '../utils/session';
import { Button, Card, CardTitle, Field, inputClass } from './pages/ui';

export default function ChangePassword() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [again, setAgain] = useState('');
  const [msg, setMsg] = useState(null); // { ok, text }
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (next.length < 8) return setMsg({ ok: false, text: 'Use at least 8 characters.' });
    if (next !== again) return setMsg({ ok: false, text: 'The new passwords don’t match.' });
    setBusy(true);
    try {
      await apiFetch('/auth/password', { method: 'POST', body: { current, next } });
      setMsg({ ok: true, text: 'Password changed.' });
      setCurrent(''); setNext(''); setAgain('');
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    }
    setBusy(false);
  };

  return (
    <Card>
      <CardTitle hint="Use at least 8 characters">Change password</CardTitle>
      <div className="grid sm:grid-cols-3 gap-3">
        <Field label="Current password"><input type="password" autoComplete="current-password" value={current} onChange={(e) => { setCurrent(e.target.value); setMsg(null); }} className={inputClass} /></Field>
        <Field label="New password"><input type="password" autoComplete="new-password" value={next} onChange={(e) => { setNext(e.target.value); setMsg(null); }} className={inputClass} /></Field>
        <Field label="New password again"><input type="password" autoComplete="new-password" value={again} onChange={(e) => { setAgain(e.target.value); setMsg(null); }} className={inputClass} /></Field>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="primary" disabled={busy || !current || !next} onClick={save}><KeyRound className="w-4 h-4" />Update password</Button>
        {msg && <p className={`text-sm flex items-center gap-1.5 ${msg.ok ? 'text-emerald-700' : 'text-red-600'}`}>{msg.ok && <CircleCheck className="w-4 h-4" />}{msg.text}</p>}
      </div>
    </Card>
  );
}
