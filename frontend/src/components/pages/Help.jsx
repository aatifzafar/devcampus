import React, { useState } from 'react';
import { Bell, ChevronDown, CircleCheck, Copy, Download, Mail, MessageSquareText, Phone, Search, Smartphone, Star, WifiOff } from 'lucide-react';
import { CHANGELOG, FAQ } from '../../data/appData';
import { Button, Card, CardTitle, Chips, Empty, Field, Modal, Pill, CURRENT_SUBJECTS, fmtDate, inputClass } from './ui';

/* ================================================================== */
/* Help center                                                         */
/* ================================================================== */

export function HelpCenter({ onNavigate }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(0);
  const [topic, setTopic] = useState('All');
  const topics = ['All', ...new Set(FAQ.map((f) => f.topic))];
  const q = query.trim().toLowerCase();
  const shown = FAQ.filter((f) => (topic === 'All' || f.topic === topic) && (!q || `${f.q} ${f.a}`.toLowerCase().includes(q)));

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-5">
      <div className="space-y-4">
        <label className="relative block">
          <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search help, for example “resubmit”" className={`${inputClass} !rounded-2xl !py-3.5 pl-12 text-base`} />
        </label>
        <Chips value={topic} onChange={setTopic} options={topics} />
        <Card className="!p-0 overflow-hidden">
          {shown.length === 0 ? (
            <Empty title="No answers found" text="Try other words, or contact support." />
          ) : (
            <ul className="divide-y divide-zinc-100">
              {shown.map((f, i) => (
                <li key={f.q}>
                  <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-zinc-50" aria-expanded={open === i}>
                    <span className="flex-1 font-medium text-zinc-900">{f.q}</span>
                    <Pill>{f.topic}</Pill>
                    <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform ${open === i ? 'rotate-180' : ''}`} />
                  </button>
                  {open === i && <p className="px-5 pb-5 -mt-1 text-[15px] text-zinc-700 leading-relaxed">{f.a}</p>}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
      <div className="space-y-5">
        <Card>
          <CardTitle hint="Mon to Sat, 9 am to 6 pm">Still need help?</CardTitle>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3"><Mail className="w-4 h-4 text-zinc-400" />lms.support@alliance.edu.in</li>
            <li className="flex items-center gap-3"><Phone className="w-4 h-4 text-zinc-400" />Extension 2207 (IT help desk)</li>
          </ul>
          <Button className="w-full mt-5" onClick={() => onNavigate('feedback')}><MessageSquareText className="w-4 h-4" />Report a problem</Button>
        </Card>
        <Card>
          <CardTitle>Getting started</CardTitle>
          <ol className="space-y-2.5 text-sm text-zinc-700 list-decimal pl-5">
            <li>Check <button onClick={() => onNavigate('dashboard')} className="text-[#6D3FC0] hover:underline">Home</button> every morning for what’s due.</li>
            <li>Open a subject from <button onClick={() => onNavigate('courses')} className="text-[#6D3FC0] hover:underline">My subjects</button> to find notes and the syllabus.</li>
            <li>Do a practice round before your first proctored test.</li>
            <li>Turn on the notifications you want in Settings.</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}

/* ================================================================== */
/* What's new                                                          */
/* ================================================================== */

const TAG_TONE = { New: 'violet', Improved: 'blue', Fixed: 'green' };

export function WhatsNew() {
  return (
    <div className="max-w-3xl">
      <ol className="relative border-l-2 border-zinc-200 ml-2 space-y-6">
        {CHANGELOG.map((c) => (
          <li key={c.title} className="pl-6 relative">
            <span className="absolute -left-[7px] top-6 w-3 h-3 rounded-full bg-[#6D3FC0] ring-4 ring-[#F6F5F0]" />
            <Card>
              <div className="flex items-center gap-2 mb-1">
                <Pill tone={TAG_TONE[c.tag]}>{c.tag}</Pill>
                <span className="text-xs text-zinc-500">{fmtDate(c.date)}</span>
              </div>
              <p className="font-semibold text-zinc-900">{c.title}</p>
              <p className="text-[15px] text-zinc-700 mt-1">{c.text}</p>
            </Card>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ================================================================== */
/* Give feedback                                                       */
/* ================================================================== */

const CRITERIA = ['Clarity of teaching', 'Pace of the course', 'Quality of notes and material', 'Help outside class'];

function StarRow({ value, onChange, label }) {
  return (
    <div className="flex items-center gap-4 py-2">
      <span className="flex-1 text-sm text-zinc-800">{label}</span>
      <div className="flex gap-1" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => onChange(n)} aria-label={`${n} star${n > 1 ? 's' : ''}`} className="p-0.5">
            <Star className={`w-6 h-6 ${n <= value ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'}`} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function Feedback() {
  const [kind, setKind] = useState('course');
  const [code, setCode] = useState(CURRENT_SUBJECTS[0].code);
  const [ratings, setRatings] = useState({});
  const [comment, setComment] = useState('');
  const [anon, setAnon] = useState(true);
  const [area, setArea] = useState('Tests');
  const [problem, setProblem] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const submit = () => {
    if (kind === 'course' && Object.keys(ratings).length < CRITERIA.length) {
      setError('Rate all four areas first');
      return;
    }
    if (kind === 'problem' && problem.trim().length < 10) {
      setError('Describe the problem in a sentence or two');
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <Card className="max-w-xl text-center">
        <CircleCheck className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
        <p className="text-lg font-semibold text-zinc-900">Thank you</p>
        <p className="text-zinc-600 mb-5">{kind === 'course' ? `Your feedback${anon ? ', sent anonymously,' : ''} helps your faculty improve the course.` : 'The support team will look into it and reply within two working days.'}</p>
        <Button onClick={() => { setSent(false); setRatings({}); setComment(''); setProblem(''); }}>Send more feedback</Button>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl space-y-4">
      <Chips value={kind} onChange={(k) => { setKind(k); setError(''); }} options={[{ id: 'course', label: 'Course feedback' }, { id: 'problem', label: 'Report a problem' }]} />
      <Card>
        {kind === 'course' ? (
          <>
            <Field label="Subject">
              <select value={code} onChange={(e) => setCode(e.target.value)} className={inputClass}>
                {CURRENT_SUBJECTS.map((s) => <option key={s.code} value={s.code}>{s.name} · {s.faculty}</option>)}
              </select>
            </Field>
            <div className="mb-4 divide-y divide-zinc-100">
              {CRITERIA.map((c) => <StarRow key={c} label={c} value={ratings[c] || 0} onChange={(n) => { setRatings((r) => ({ ...r, [c]: n })); setError(''); }} />)}
            </div>
            <Field label="Anything else? (optional)">
              <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} className={inputClass} placeholder="What is working well, and what would help you more?" />
            </Field>
            <label className="flex items-center gap-2.5 text-sm text-zinc-800 mb-5 cursor-pointer">
              <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} className="w-4 h-4 accent-[#6D3FC0]" />
              Send anonymously
            </label>
          </>
        ) : (
          <>
            <Field label="What is it about?">
              <select value={area} onChange={(e) => setArea(e.target.value)} className={inputClass}>
                {['Tests', 'Assignments', 'Notes and recordings', 'Login or account', 'Something else'].map((a) => <option key={a}>{a}</option>)}
              </select>
            </Field>
            <Field label="What happened?" hint="Include the page and what you expected to see.">
              <textarea rows={5} value={problem} onChange={(e) => { setProblem(e.target.value); setError(''); }} className={inputClass} />
            </Field>
          </>
        )}
        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={submit}>Send</Button>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </Card>
    </div>
  );
}

/* ================================================================== */
/* Get the app                                                         */
/* ================================================================== */

export function GetApp() {
  const [how, setHow] = useState(null);
  const [copied, setCopied] = useState(false);
  const link = window.location.origin;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const t = document.createElement('textarea');
      t.value = link;
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      t.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const perks = [
    [Bell, 'Instant alerts', 'Know the moment a test opens or marks are out.'],
    [WifiOff, 'Notes offline', 'Download notes and read them without data.'],
    [Smartphone, 'Made for phones', 'Every page works one-handed.'],
  ];
  const STEPS = {
    android: ['Open this link in Chrome on your phone.', 'Tap the ⋮ menu at the top right.', 'Tap “Install app” or “Add to Home screen”.', 'Alliance.ai now opens from your home screen like any app.'],
    iphone: ['Open this link in Safari on your iPhone.', 'Tap the Share button at the bottom.', 'Scroll down and tap “Add to Home Screen”, then “Add”.', 'Alliance.ai now opens from your home screen like any app.'],
  };
  return (
    <div className="max-w-4xl">
      <Card className="!p-0 overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-zinc-900 mb-2">Alliance.ai on your phone</h2>
            <p className="text-zinc-600 mb-6">Everything here, in your pocket. Sign in with your university email.</p>
            <ul className="space-y-4 mb-6">
              {perks.map(([Icon, t, d]) => (
                <li key={t} className="flex gap-3">
                  <span className="w-9 h-9 rounded-xl bg-[#F1EEFB] text-[#6D3FC0] flex items-center justify-center shrink-0"><Icon className="w-[18px] h-[18px]" /></span>
                  <div><p className="font-medium text-zinc-900">{t}</p><p className="text-sm text-zinc-500">{d}</p></div>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" onClick={() => setHow('android')}><Download className="w-4 h-4" />Android</Button>
              <Button onClick={() => setHow('iphone')}><Download className="w-4 h-4" />iPhone</Button>
            </div>
          </div>
          <div className="bg-[#18181B] p-8 flex flex-col items-center justify-center gap-4 text-center">
            <span className="w-16 h-16 rounded-2xl bg-white/10 text-white flex items-center justify-center"><Smartphone className="w-8 h-8" /></span>
            <p className="text-sm text-white/70">Open this address on your phone</p>
            <p className="font-mono text-white text-sm break-all">{link}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <button onClick={copy} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-zinc-900 text-sm font-medium">
                {copied ? <CircleCheck className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}{copied ? 'Copied' : 'Copy link'}
              </button>
              <a href={`mailto:?subject=${encodeURIComponent('Alliance.ai link')}&body=${encodeURIComponent(link)}`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium hover:bg-white/20">
                <Mail className="w-4 h-4" />Email it to me
              </a>
            </div>
          </div>
        </div>
      </Card>
      {how && (
        <Modal title={how === 'android' ? 'Install on Android' : 'Install on iPhone'} subtitle="No app store needed: it installs straight from the browser" onClose={() => setHow(null)}
          footer={<><Button onClick={copy}>{copied ? <CircleCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? 'Copied' : 'Copy link'}</Button><Button variant="primary" onClick={() => setHow(null)}>Done</Button></>}>
          <ol className="space-y-3">
            {STEPS[how].map((t, i) => (
              <li key={t} className="flex gap-3 text-[15px] text-zinc-800">
                <span className="w-7 h-7 rounded-full bg-[#F1EEFB] text-[#6D3FC0] text-sm font-semibold flex items-center justify-center shrink-0">{i + 1}</span>
                <span className="pt-0.5">{t}</span>
              </li>
            ))}
          </ol>
          <p className="text-sm text-zinc-500 mt-4">Link: <span className="font-mono text-zinc-800 break-all">{link}</span></p>
        </Modal>
      )}
    </div>
  );
}
