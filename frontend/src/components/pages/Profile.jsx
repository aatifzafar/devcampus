import React, { useEffect, useState } from 'react';
import ChangePassword from '../ChangePassword';
import { BadgeCheck, Lock, Medal, Sparkles, TrendingUp } from 'lucide-react';
import { SEMESTERS, CURRENT_SEMESTER } from '../../data/subjectsData';
import { STUDENT_INFO } from '../../data/homeData';
import { eventCertificates } from '../../data/eventsData';
import { ACHIEVEMENTS, CERTIFICATES, PAST_ATTEMPTS, PERSONALITY_ITEMS, TRAIT_TEXT, scoreOf } from '../../data/appData';
import { Button, Card, CardTitle, Field, Pill, Stat, SubjectTag, CURRENT_SUBJECTS, fmtDate, inputClass, subjectOf, useStoredState } from './ui';

/* ================================================================== */
/* My progress                                                         */
/* ================================================================== */

export function Progress({ userProfile }) {
  const past = SEMESTERS.filter((s) => s.sgpa);
  const cgpa = past.reduce((n, s) => n + s.sgpa, 0) / past.length;
  const max = 10;
  const tests = [...PAST_ATTEMPTS].filter((a) => a.published).sort((a, b) => a.date - b.date).map((a) => ({ a, p: scoreOf(a).percent }));
  const avgSyllabus = Math.round(CURRENT_SUBJECTS.reduce((n, s) => n + (s.progress || 0), 0) / CURRENT_SUBJECTS.length);
  const rising = past.every((s, i) => i === 0 || s.sgpa >= past[i - 1].sgpa);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="CGPA" value={cgpa.toFixed(2)} tone="text-[#4C2E8A]" hint={`After ${past.length} semesters`} />
        <Stat label="Last SGPA" value={past[past.length - 1].sgpa.toFixed(1)} hint={`Semester ${past[past.length - 1].number}`} />
        <Stat label="Syllabus covered" value={`${avgSyllabus}%`} hint={`Semester ${CURRENT_SEMESTER} so far`} />
        <Stat label="Streak" value={`${userProfile?.streakDays ?? 0} days`} hint={`${userProfile?.skillRank?.xpPoints ?? 0} XP earned`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <CardTitle hint={rising ? 'Your SGPA has gone up every semester. Keep going.' : 'Compared with your own past semesters'}>Semester results</CardTitle>
          <div className="flex items-end gap-4 h-48 pt-4">
            {SEMESTERS.map((s) => {
              const v = s.sgpa;
              return (
                <div key={s.number} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-sm font-semibold text-zinc-900">{v ? v.toFixed(1) : '—'}</span>
                  <div
                    className={`w-full max-w-[56px] rounded-t-xl ${v ? 'bg-[#6D3FC0]' : 'bg-zinc-100 border-2 border-dashed border-zinc-300'}`}
                    style={{ height: v ? `${((v - 6) / (max - 6)) * 100}%` : '30%' }}
                  />
                  <span className="text-xs text-zinc-500">Sem {s.number}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-zinc-500 mt-3">Semester {CURRENT_SEMESTER} is in progress.</p>
        </Card>

        <Card>
          <CardTitle hint="Each dot is one test, oldest first">Test scores this semester</CardTitle>
          <div className="relative h-48 border-l border-b border-zinc-200 ml-6">
            {[25, 50, 75, 100].map((y) => (
              <div key={y} className="absolute left-0 right-0 border-t border-dashed border-zinc-100" style={{ bottom: `${y}%` }}>
                <span className="absolute -left-7 -top-2 text-[10px] text-zinc-400">{y}</span>
              </div>
            ))}
            <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="#6D3FC0"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
                points={tests.map((t, i) => `${(i / Math.max(1, tests.length - 1)) * 100},${100 - t.p}`).join(' ')}
              />
            </svg>
            {tests.map((t, i) => (
              <span
                key={t.a.id}
                title={`${t.a.title} · ${subjectOf(t.a.code).name}: ${t.p}%`}
                className="absolute w-3 h-3 -ml-1.5 -mb-1.5 rounded-full border-2 border-white"
                style={{ left: `${(i / Math.max(1, tests.length - 1)) * 100}%`, bottom: `${t.p}%`, background: subjectOf(t.a.code).color }}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4">
            {tests.map((t) => <span key={t.a.id} className="text-xs text-zinc-500">{t.a.title} ({subjectOf(t.a.code).name.split(' ')[0]}): <span className="text-zinc-800 font-medium">{t.p}%</span></span>)}
          </div>
        </Card>
      </div>

      <Card>
        <CardTitle hint="How far each subject has reached this semester">Subjects</CardTitle>
        <ul className="grid md:grid-cols-2 gap-x-8 gap-y-4">
          {CURRENT_SUBJECTS.map((s) => (
            <li key={s.code}>
              <div className="flex items-center justify-between mb-1.5">
                <SubjectTag subject={s} />
                <span className="text-sm font-medium text-zinc-800">{s.progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-100 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${s.progress}%`, background: s.color }} /></div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* ================================================================== */
/* Achievements                                                        */
/* ================================================================== */

export function Achievements({ userProfile, onNavigate }) {
  const certs = [...eventCertificates(), ...CERTIFICATES];
  const earned = ACHIEVEMENTS.filter((a) => a.earned);
  const locked = ACHIEVEMENTS.filter((a) => !a.earned);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Badges" value={`${earned.length}/${ACHIEVEMENTS.length}`} tone="text-[#4C2E8A]" />
        <Stat label="XP" value={userProfile?.skillRank?.xpPoints ?? 0} />
        <Stat label="Certificates" value={certs.length} />
      </div>
      <Card>
        <CardTitle>Earned</CardTitle>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {earned.map((a) => (
            <div key={a.id} className="rounded-2xl border border-amber-200 bg-gradient-to-b from-amber-50 to-white p-4 text-center">
              <span className="w-12 h-12 rounded-full bg-amber-400 text-white flex items-center justify-center mx-auto mb-2"><Medal className="w-6 h-6" /></span>
              <p className="font-semibold text-zinc-900">{a.title}</p>
              <p className="text-xs text-zinc-600 mb-1">{a.text}</p>
              <p className="text-[11px] text-zinc-400">{fmtDate(a.at)}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <CardTitle hint="Keep going to unlock these">Next up</CardTitle>
        <div className="grid sm:grid-cols-2 gap-4">
          {locked.map((a) => (
            <div key={a.id} className="flex items-center gap-4 rounded-2xl border border-zinc-200 p-4">
              <span className="w-11 h-11 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center shrink-0"><Lock className="w-5 h-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-zinc-900">{a.title}</p>
                <p className="text-xs text-zinc-500 mb-2">{a.text}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-zinc-100 overflow-hidden"><div className="h-full bg-[#6D3FC0]" style={{ width: `${(a.progress / a.goal) * 100}%` }} /></div>
                  <span className="text-xs text-zinc-500">{a.progress}/{a.goal}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <CardTitle hint="Event certificates are added automatically when you attend" action={<button onClick={() => onNavigate?.('events-mine')} className="text-sm text-[#6D3FC0] hover:underline">View event certificates</button>}>Certificates</CardTitle>
        <ul className="divide-y divide-zinc-100">
          {certs.map((c) => (
            <li key={c.title} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <BadgeCheck className="w-5 h-5 text-[#6D3FC0]" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-900">{c.title}</p>
                <p className="text-xs text-zinc-500">{c.by} · {c.year}</p>
              </div>
              <Pill tone="green">{c.score}</Pill>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* ================================================================== */
/* Personality                                                         */
/* ================================================================== */

const TRAITS = Object.keys(TRAIT_TEXT);
const LAST_SEMESTER = { Openness: 72, Conscientiousness: 64, Extraversion: 48, Agreeableness: 80, 'Emotional stability': 56 };

export function Personality() {
  const [result, setResult] = useStoredState('alliance-personality', null);
  const [taking, setTaking] = useState(false);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');

  const current = result?.scores || null;

  const finish = () => {
    if (Object.keys(answers).length < PERSONALITY_ITEMS.length) {
      setError(`Answer all ${PERSONALITY_ITEMS.length} statements first`);
      return;
    }
    const scores = {};
    TRAITS.forEach((t) => {
      const idx = PERSONALITY_ITEMS.map((it, i) => (it.trait === t ? i : -1)).filter((i) => i >= 0);
      const avg = idx.reduce((n, i) => n + answers[i], 0) / idx.length;
      scores[t] = Math.round(((avg - 1) / 4) * 100);
    });
    setResult({ scores, at: new Date().toISOString() });
    setTaking(false);
  };

  if (taking) {
    return (
      <Card className="max-w-3xl">
        <CardTitle hint="There are no right answers. Go with your first instinct.">Semester check-in · 10 statements</CardTitle>
        <ol className="space-y-5">
          {PERSONALITY_ITEMS.map((it, i) => (
            <li key={i}>
              <p className="text-[15px] text-zinc-900 mb-2">{i + 1}. {it.text}</p>
              <div className="grid grid-cols-5 gap-1.5">
                {['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'].map((label, v) => (
                  <button
                    key={label}
                    onClick={() => { setAnswers((a) => ({ ...a, [i]: v + 1 })); setError(''); }}
                    className={`px-2 py-2 rounded-xl border text-xs ${answers[i] === v + 1 ? 'border-[#6D3FC0] bg-[#F7F5FD] text-[#4C2E8A] font-medium' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ol>
        <div className="flex items-center gap-3 mt-6">
          <Button onClick={() => setTaking(false)}>Cancel</Button>
          <Button variant="primary" onClick={finish}>See my results</Button>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <Card className="flex flex-col sm:flex-row sm:items-center gap-4 bg-gradient-to-br from-[#F1EEFB] to-white">
        <Sparkles className="w-8 h-8 text-[#6D3FC0] shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-zinc-900">{current ? 'Your check-in for this semester is done' : 'This semester’s check-in is open'}</p>
          <p className="text-sm text-zinc-600">{current ? `Taken on ${fmtDate(new Date(result.at))}. You can retake it any time.` : '10 short statements, about 2 minutes. Only you and your mentor see the results.'}</p>
        </div>
        <Button variant="primary" onClick={() => { setAnswers({}); setTaking(true); }}>{current ? 'Retake' : 'Start check-in'}</Button>
      </Card>
      <Card>
        <CardTitle hint={current ? 'This semester compared with last semester' : 'Last semester’s results'}>Your profile</CardTitle>
        <ul className="space-y-5">
          {TRAITS.map((t) => {
            const now = current ? current[t] : LAST_SEMESTER[t];
            const before = LAST_SEMESTER[t];
            const diff = current ? now - before : 0;
            return (
              <li key={t}>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-zinc-900">{t}</p>
                  {current && diff !== 0 && <Pill tone={diff > 0 ? 'green' : 'zinc'}><TrendingUp className="w-3 h-3" />{diff > 0 ? '+' : ''}{diff}</Pill>}
                  <span className="ml-auto text-sm font-semibold text-zinc-800">{now}</span>
                </div>
                <div className="relative h-2.5 rounded-full bg-zinc-100 mb-1">
                  <div className="h-full rounded-full bg-[#6D3FC0]" style={{ width: `${now}%` }} />
                  {current && <div className="absolute -top-1 h-[18px] w-0.5 bg-zinc-400" style={{ left: `${before}%` }} title={`Last semester: ${before}`} />}
                </div>
                <p className="text-xs text-zinc-500">{TRAIT_TEXT[t]}</p>
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-zinc-500 mt-5">This is a self-reflection tool, not a test. It helps your mentor understand how you like to learn.</p>
      </Card>
    </div>
  );
}

/* ================================================================== */
/* Settings                                                            */
/* ================================================================== */

const TEXT_SIZES = { Small: '15px', Default: '16px', Large: '18px' };

export function Settings({ userProfile, onSignOut }) {
  const [s, setS] = useStoredState('alliance-settings', {
    phone: '+91 98450 12345',
    notify: { tests: true, deadlines: true, notes: true, discussions: false, email: true },
    showRank: false,
    textSize: 'Default',
    language: 'English',
  });
  const [savedMsg, setSavedMsg] = useState('');
  const [phone, setPhone] = useState(s.phone);

  useEffect(() => {
    document.documentElement.style.fontSize = TEXT_SIZES[s.textSize] || '16px';
  }, [s.textSize]);

  const flash = (m) => {
    setSavedMsg(m);
    setTimeout(() => setSavedMsg(''), 2000);
  };
  const toggle = (k) => setS((x) => ({ ...x, notify: { ...x.notify, [k]: !x.notify[k] } }));

  const info = [
    ['Name', userProfile?.fullName || 'Student'],
    ['Roll number', userProfile?.rollNo || STUDENT_INFO.rollNo],
    ['Email', userProfile?.email || '—'],
    ['Programme', `${STUDENT_INFO.program}, Semester ${userProfile?.semester || STUDENT_INFO.semester}, Section ${userProfile?.section || STUDENT_INFO.section}`],
    ['Mentor', STUDENT_INFO.mentor],
  ];

  const Toggle = ({ on, onClick, label }) => (
    <button onClick={onClick} role="switch" aria-checked={on} aria-label={label} className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${on ? 'bg-[#6D3FC0]' : 'bg-zinc-300'}`}>
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  );

  return (
    <div className="max-w-3xl space-y-5">
      {savedMsg && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white text-sm px-4 py-2.5 rounded-full shadow-lg">{savedMsg}</div>}
      <Card>
        <CardTitle hint="From university records. Contact the exam cell to correct these.">Profile</CardTitle>
        <dl className="divide-y divide-zinc-100">
          {info.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-2.5 text-sm">
              <dt className="text-zinc-500">{k}</dt>
              <dd className="text-zinc-900 font-medium text-right">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex items-end gap-2">
          <Field label="Phone number">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
          </Field>
          <Button className="mb-4" disabled={phone === s.phone} onClick={() => { setS((x) => ({ ...x, phone })); flash('Phone number saved'); }}>Save</Button>
        </div>
      </Card>
      <Card>
        <CardTitle hint="Choose what you want to hear about">Notifications</CardTitle>
        <ul className="divide-y divide-zinc-100">
          {[
            ['tests', 'Tests', 'When a test is scheduled, opens, or results are published'],
            ['deadlines', 'Deadlines', 'A reminder one day and three hours before work is due'],
            ['notes', 'New material', 'When faculty share notes, slides or recordings'],
            ['discussions', 'Discussion replies', 'When someone answers your question'],
            ['email', 'Email copies', 'Also send important alerts to your university email'],
          ].map(([k, label, hint]) => (
            <li key={k} className="flex items-center gap-4 py-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-900">{label}</p>
                <p className="text-xs text-zinc-500">{hint}</p>
              </div>
              <Toggle on={s.notify[k]} onClick={() => toggle(k)} label={label} />
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <CardTitle>Display and privacy</CardTitle>
        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-zinc-900 mb-2">Text size</p>
            <div className="flex gap-2">
              {Object.keys(TEXT_SIZES).map((k) => (
                <button key={k} onClick={() => setS((x) => ({ ...x, textSize: k }))} className={`px-4 py-2 rounded-full border text-sm ${s.textSize === k ? 'border-[#6D3FC0] bg-[#F7F5FD] text-[#4C2E8A] font-medium' : 'border-zinc-200 text-zinc-600'}`}>{k}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-900 mb-2">Language</p>
            <select value={s.language} onChange={(e) => setS((x) => ({ ...x, language: e.target.value }))} className={`${inputClass} !w-56`}>
              {['English', 'ಕನ್ನಡ (Kannada)', 'हिन्दी (Hindi)', 'தமிழ் (Tamil)', 'తెలుగు (Telugu)'].map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-900">Show me on class leaderboards</p>
              <p className="text-xs text-zinc-500">Off by default. Your rank is never shown to others unless you turn this on.</p>
            </div>
            <Toggle on={s.showRank} onClick={() => setS((x) => ({ ...x, showRank: !x.showRank }))} label="Show on leaderboards" />
          </div>
        </div>
      </Card>
      <ChangePassword />
      {onSignOut && (
        <Card className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-zinc-600 flex-1">Signed in as {userProfile?.email}.</p>
          <Button onClick={onSignOut}>Sign out</Button>
        </Card>
      )}
    </div>
  );
}
