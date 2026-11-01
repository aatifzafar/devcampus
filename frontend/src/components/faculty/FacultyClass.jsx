import React, { useEffect, useRef, useState } from 'react';
import {
  BadgeCheck, ChartColumn as BarChart3, CircleCheck, Download, FileText, Mail, MessageSquare, Paperclip, Plus, Printer, Radio, Search, Square, Trash2, TriangleAlert, Upload, UserCheck, UserRound, Video, X,
} from 'lucide-react';
import { CO_ASSESSMENTS, FACULTY, FACULTY_CODES, FACULTY_COURSES, FACULTY_TIMETABLE, F_DAYS, F_PERIODS, ROSTERS, courseById, scoreFor } from '../../data/facultyData';
import { THREADS } from '../../data/appData';
import { courseInfo } from '../../data/courseInfo';
import { subjectByCode } from '../../data/materialsData';
import { PYQ_EXAMS, PYQ_YEARS } from '../../data/featuresData';
import { uid, useStore } from '../../data/store';
import { deleteFile, saveFile } from '../../utils/files';
import { Button, Card, CardTitle, Chips, Empty, Field, Modal, Pill, Stat, ago, fmtDate, inputClass, useStoredState } from '../pages/ui';
import { CourseChips, SectionPicker, hasAccount, SectionTags, SubjectChips, allSections, sectionsOf, useCourse } from './common';
import { PRINT_CSS } from '../features/Events';

const dateKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/* ================================================================== */
/* Live class                                                          */
/* ================================================================== */

export function FClassesToday({ onNavigate }) {
  const [store, update] = useStore();
  const [courseId, setCourseId] = useCourse();
  const [q, setQ] = useState('');
  const [opts, setOpts] = useState(['', '']);
  const [answer, setAnswer] = useState(-1);
  const [error, setError] = useState('');
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 5000);
    return () => clearInterval(id);
  }, []);

  const live = store.live;
  const course = courseById(live?.courseId || courseId) || FACULTY_COURSES[0];
  const [pick, setPick] = useState([course.section]);
  useEffect(() => setPick([course.section]), [course.id]);
  const liveSections = live ? live.sections || [live.section] : pick;
  const roster = sectionsOf(course.code).filter((c) => liveSections.includes(c.section)).flatMap((c) => ROSTERS[c.id]);
  const label = `${course.name} · ${[...liveSections].sort().join(' + ')}`;

  const start = () => {
    if (!pick.length) return setError('Choose at least one section');
    setError('');
    update((s) => ({ ...s, live: { courseId: course.id, code: course.code, section: course.section, sections: [...pick].sort(), startedAt: new Date().toISOString(), poll: null, votes: {} } }));
  };
  const end = () => { update((s) => ({ ...s, live: null })); onNavigate('f-classes'); };
  const launch = () => {
    if (q.trim().length < 5) return setError('Write the poll question');
    if (opts.filter((o) => o.trim()).length < 2) return setError('Add at least two options');
    update((s) => ({ ...s, live: { ...s.live, poll: { q: q.trim(), options: opts.map((o) => o.trim()).filter(Boolean), answer, launchedAt: new Date().toISOString() }, votes: {} } }));
    setQ(''); setOpts(['', '']); setAnswer(-1); setError('');
  };

  if (!live) {
    return (
      <div className="space-y-5 max-w-3xl">
        <SubjectChips value={course.code} onChange={(code) => setCourseId(sectionsOf(code)[0].id)} />
        <Card className="text-center !py-10">
          <span className="w-14 h-14 rounded-2xl bg-[#F1EEFB] text-[#6D3FC0] flex items-center justify-center mx-auto mb-3"><Video className="w-7 h-7" /></span>
          <p className="text-lg font-semibold text-zinc-900">Start a live class for {label}</p>
          <p className="text-sm text-zinc-500 mb-4 max-w-md mx-auto">Students in the chosen sections see a “Join now” button immediately. Add more sections for a combined class.</p>
          <div className="max-w-md mx-auto text-left mb-5"><SectionPicker code={course.code} value={pick} onChange={(v) => { setPick(v); setError(''); }} /></div>
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          <Button variant="primary" className="!px-6" onClick={start}><Radio className="w-4 h-4" />Go live</Button>
        </Card>
      </div>
    );
  }

  const elapsed = Math.floor((Date.now() - new Date(live.startedAt).getTime()) / 60000);
  const joined = Math.min(roster.length, Math.round(roster.length * Math.min(0.92, 0.5 + elapsed * 0.08))) + (live.demoJoined ? 0 : 0);
  const poll = live.poll;
  let counts = [];
  if (poll) {
    const secs = (Date.now() - new Date(poll.launchedAt).getTime()) / 1000;
    const share = Math.min(1, secs / 40);
    counts = poll.options.map(() => 0);
    const votes = live.votes || {};
    roster.forEach((st) => {
      // Students with accounts answer for real; sample classmates are simulated.
      if (hasAccount(st, store) || votes[st.roll] !== undefined) return;
      if (scoreFor(st, `poll-${poll.launchedAt}`) > share) return;
      const right = poll.answer >= 0 && scoreFor(st, `pa-${poll.launchedAt}`) < st.strength;
      const pick = right ? poll.answer : Math.floor(scoreFor(st, `pc-${poll.launchedAt}`) * poll.options.length);
      counts[pick] += 1;
    });
    Object.values(votes).forEach((v) => { if (counts[v] !== undefined) counts[v] += 1; });
  }
  const total = counts.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-5">
      <Card className="flex flex-col md:flex-row md:items-center gap-4 !border-emerald-300">
        <span className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Radio className="w-6 h-6" /></span>
        <div className="flex-1">
          <p className="text-lg font-semibold text-zinc-900">Live: {label}</p>
          <p className="text-sm text-zinc-500">{elapsed} min · {joined} of {roster.length} students joined{live.demoJoined ? ' (including students signed in on the platform)' : ''}</p>
        </div>
        <Button variant="danger" onClick={end}><Square className="w-4 h-4" />End class</Button>
      </Card>
      <div className="grid lg:grid-cols-2 gap-5 items-start">
        <Card>
          <CardTitle hint="Pops up on every student’s screen">Ask a quick poll</CardTitle>
          <Field label="Question"><input value={q} onChange={(e) => { setQ(e.target.value); setError(''); }} className={inputClass} placeholder="Is every DFA also an NFA?" /></Field>
          <Field label="Options (tick the correct one, if any)">
            <div className="space-y-2">
              {opts.map((o, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="radio" name="poll-correct" checked={answer === i} onChange={() => setAnswer(i)} className="accent-[#6D3FC0]" aria-label={`Option ${i + 1} correct`} />
                  <input value={o} onChange={(e) => { setOpts((l) => l.map((x, j) => (j === i ? e.target.value : x))); setError(''); }} className={inputClass} placeholder={`Option ${i + 1}`} />
                  {opts.length > 2 && <button onClick={() => setOpts((l) => l.filter((_, j) => j !== i))} aria-label="Remove option"><X className="w-4 h-4 text-zinc-400" /></button>}
                </div>
              ))}
              {opts.length < 4 && <button onClick={() => setOpts((l) => [...l, ''])} className="text-sm text-[#6D3FC0] inline-flex items-center gap-1"><Plus className="w-4 h-4" />Add option</button>}
            </div>
          </Field>
          {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
          <Button variant="primary" onClick={launch}>Launch poll</Button>
        </Card>
        <Card>
          <CardTitle hint={poll ? `${total} answers so far` : 'Results appear here live'}>{poll ? poll.q : 'Poll results'}</CardTitle>
          {!poll ? <Empty icon={BarChart3} title="No poll running" /> : (
            <ul className="space-y-3">
              {poll.options.map((o, i) => {
                const pct = total ? Math.round((counts[i] / total) * 100) : 0;
                return (
                  <li key={i}>
                    <div className="flex justify-between text-sm mb-1"><span className="text-zinc-800">{o}{poll.answer === i && <CircleCheck className="w-4 h-4 text-emerald-600 inline ml-1.5 -mt-0.5" />}</span><span className="font-medium text-zinc-900">{counts[i]} · {pct}%</span></div>
                    <div className="h-2.5 rounded-full bg-zinc-100 overflow-hidden"><div className={`h-full rounded-full transition-all ${poll.answer === i ? 'bg-emerald-500' : 'bg-[#6D3FC0]'}`} style={{ width: `${pct}%` }} /></div>
                  </li>
                );
              })}
            </ul>
          )}
          {poll && Object.keys(live.votes || {}).length > 0 && <p className="text-xs text-[#6D3FC0] mt-3">{Object.keys(live.votes).length} signed-in student{Object.keys(live.votes).length > 1 ? 's' : ''} answered from their own device.</p>}
        </Card>
      </div>
    </div>
  );
}

/* ================================================================== */
/* Attendance                                                          */
/* ================================================================== */

export function FAttendance() {
  return null;
}

export function FTimetable() {
  return null;
}

/* ================================================================== */
/* Students                                                            */
/* ================================================================== */

const internalOf = (s) => {
  const done = CO_ASSESSMENTS.filter((a) => a.done);
  return Math.round((done.reduce((n, a) => n + scoreFor(s, a.key), 0) / done.length) * 100);
};

export function FStudents() {
  const [store] = useStore();
  const [courseId, setCourseId] = useCourse();
  const course = courseById(courseId) || FACULTY_COURSES[0];
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(null);

  const rows = ROSTERS[course.id].map((s) => {
    const internal = internalOf(s);
    const flags = [internal < 50 && 'Low marks', s.lastActiveDays > 7 && 'Inactive'].filter(Boolean);
    return { s, internal, flags };
  });
  const q = query.trim().toLowerCase();
  const shown = rows.filter((r) => (filter === 'all' || r.flags.length) && (!q || `${r.s.name} ${r.s.roll}`.toLowerCase().includes(q)));

  return (
    <div className="space-y-5">
      <CourseChips value={courseId} onChange={setCourseId} />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Stat label="Students" value={rows.length} />
        <Stat label="Average internal marks" value={`${Math.round(rows.reduce((n, r) => n + r.internal, 0) / rows.length)}%`} />
        <Stat label="Needs attention" value={rows.filter((r) => r.flags.length).length} tone="text-amber-700" />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Chips value={filter} onChange={setFilter} options={[{ id: 'all', label: 'All students' }, { id: 'risk', label: 'Needs attention', count: rows.filter((r) => r.flags.length).length }]} />
        <label className="relative sm:ml-auto"><Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or roll" className={`${inputClass} !rounded-full pl-9 sm:w-60`} /></label>
      </div>
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead><tr className="text-left text-xs text-zinc-500 border-b border-zinc-100"><th className="px-5 py-3 font-medium">Student</th><th className="px-3 py-3 font-medium">Internal marks</th><th className="px-3 py-3 font-medium">Last active</th><th className="px-3 py-3 font-medium">Flags</th></tr></thead>
            <tbody className="divide-y divide-zinc-100">
              {shown.map((r) => (
                <tr key={r.s.roll} onClick={() => setOpen(r)} className={`cursor-pointer hover:bg-zinc-50 ${hasAccount(r.s, store) ? 'bg-[#F7F5FD]' : ''}`}>
                  <td className="px-5 py-2.5"><p className="font-medium text-zinc-900">{r.s.name}</p><p className="text-xs text-zinc-500">{r.s.roll}</p></td>
                  <td className={`px-3 py-2.5 font-medium ${r.internal < 50 ? 'text-red-600' : 'text-zinc-800'}`}>{r.internal}%</td>
                  <td className="px-3 py-2.5 text-zinc-600">{r.s.lastActiveDays === 0 ? 'Today' : `${r.s.lastActiveDays} days ago`}</td>
                  <td className="px-3 py-2.5"><div className="flex flex-wrap gap-1">{r.flags.map((f) => <Pill key={f} tone="amber">{f}</Pill>)}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {open && (
        <Modal title={open.s.name} subtitle={`${open.s.roll} · ${course.name} · Section ${course.section}`} onClose={() => setOpen(null)} footer={<a href={`mailto:?subject=${encodeURIComponent(`${course.name}: checking in`)}&body=${encodeURIComponent(`Hi ${open.s.name.split(' ')[0]},\n\n`)}`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-[#6D3FC0] text-white"><Mail className="w-4 h-4" />Email student</a>}>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <Stat label="Internal marks" value={`${open.internal}%`} tone={open.internal < 50 ? 'text-red-600' : undefined} />
            <Stat label="Last active" value={open.s.lastActiveDays === 0 ? 'Today' : `${open.s.lastActiveDays} days ago`} />
          </div>
          <h4 className="text-sm font-semibold text-zinc-900 mb-2">Assessments so far</h4>
          <ul className="divide-y divide-zinc-100 mb-4">
            {CO_ASSESSMENTS.filter((a) => a.done).map((a) => <li key={a.key} className="flex justify-between py-2 text-sm"><span className="text-zinc-700">{a.name}</span><span className="font-medium text-zinc-900">{Math.round(scoreFor(open.s, a.key) * a.max)}/{a.max}</span></li>)}
          </ul>
          {open.flags.length > 0 && <p className="text-sm text-amber-800 bg-amber-50 rounded-xl px-3 py-2 flex items-center gap-2"><TriangleAlert className="w-4 h-4" />{open.flags.join(' · ')}. Consider a mentoring conversation.</p>}
        </Modal>
      )}
    </div>
  );
}

/* ================================================================== */
/* Doubts                                                              */
/* ================================================================== */

export function FDoubts() {
  const [threads, setThreads] = useStoredState('alliance-threads', THREADS);
  const [filter, setFilter] = useState('open');
  const [openId, setOpenId] = useState(null);
  const [text, setText] = useState('');
  const mine = threads.filter((t) => FACULTY_CODES.includes(t.code));
  const answered = (t) => t.replies.some((r) => r.role === 'faculty');
  const shown = mine.filter((t) => (filter === 'open' ? !answered(t) : filter === 'answered' ? answered(t) : true)).sort((a, b) => new Date(b.at) - new Date(a.at));
  const open = mine.find((t) => t.id === openId) || shown[0];

  const reply = () => {
    if (!text.trim()) return;
    setThreads((l) => l.map((t) => (t.id === open.id ? { ...t, replies: [...t.replies, { author: FACULTY.fullName, role: 'faculty', at: new Date().toISOString(), votes: 0, accepted: true, body: text.trim() }] } : t)));
    setText('');
  };
  const markBest = (i) => setThreads((l) => l.map((t) => (t.id === open.id ? { ...t, replies: t.replies.map((r, j) => ({ ...r, accepted: j === i })) } : t)));

  return (
    <div className="space-y-5">
      <Chips value={filter} onChange={(f) => { setFilter(f); setOpenId(null); }} options={[{ id: 'open', label: 'Waiting for you', count: mine.filter((t) => !answered(t)).length }, { id: 'answered', label: 'Answered' }, { id: 'all', label: 'All' }]} />
      <div className="grid lg:grid-cols-[340px_1fr] gap-5 items-start">
        <Card className="!p-0 overflow-hidden">
          {shown.length === 0 ? <Empty icon={CircleCheck} title="All caught up" text="New doubts from your students appear here." /> : (
            <ul className="divide-y divide-zinc-100">
              {shown.map((t) => (
                <li key={t.id}>
                  <button onClick={() => setOpenId(t.id)} className={`w-full text-left px-4 py-3 ${open?.id === t.id ? 'bg-[#F7F5FD]' : 'hover:bg-zinc-50'}`}>
                    <p className="text-sm font-medium text-zinc-900 line-clamp-2">{t.title}</p>
                    <p className="text-xs text-zinc-500">{t.author} · {ago(new Date(t.at))} · {t.replies.length} replies</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
        {open ? (
          <Card>
            <p className="text-xs text-zinc-500 mb-1">{subjectByCode(open.code)?.name} · {open.votes} votes</p>
            <h3 className="text-lg font-semibold text-zinc-900">{open.title}</h3>
            {open.body && <p className="text-[15px] text-zinc-700 mt-1">{open.body}</p>}
            <p className="text-xs text-zinc-500 mt-1 mb-4">{open.author} · {ago(new Date(open.at))}</p>
            <ul className="space-y-3 mb-4">
              {open.replies.map((r, i) => (
                <li key={i} className={`rounded-2xl border p-3.5 ${r.accepted ? 'border-emerald-300' : 'border-zinc-200'}`}>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <UserRound className="w-4 h-4 text-zinc-400" /><span className="text-sm font-medium text-zinc-900">{r.author}</span>
                    {r.role === 'faculty' && <Pill tone="violet"><BadgeCheck className="w-3 h-3" />Faculty</Pill>}
                    {r.accepted ? <Pill tone="green">Best answer</Pill> : <button onClick={() => markBest(i)} className="text-xs text-[#6D3FC0] hover:underline ml-auto">Mark as best answer</button>}
                  </div>
                  <p className="text-sm text-zinc-700">{r.body}</p>
                </li>
              ))}
            </ul>
            <textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} className={inputClass} placeholder="Write your answer. Students see it marked as a faculty answer." />
            <div className="flex justify-end mt-3"><Button variant="primary" disabled={!text.trim()} onClick={reply}><MessageSquare className="w-4 h-4" />Post answer</Button></div>
          </Card>
        ) : <Card><Empty title="Pick a doubt" /></Card>}
      </div>
    </div>
  );
}

/* ================================================================== */
/* CO attainment (NBA)                                                 */
/* ================================================================== */

export function FCOReport() {
  const [code, setCode] = useState('CSE303');
  const [threshold, setThreshold] = useState(60);
  const [target, setTarget] = useState(2);
  const info = courseInfo(code);
  const students = FACULTY_COURSES.filter((c) => c.code === code).flatMap((c) => ROSTERS[c.id]);
  const done = CO_ASSESSMENTS.filter((a) => a.done);

  const rows = info.outcomes.map((co) => {
    const assess = done.filter((a) => a.cos.includes(co.id));
    if (!assess.length) return { co, assess, pct: null, level: null };
    const above = students.filter((s) => (assess.reduce((n, a) => n + scoreFor(s, `${code}-${a.key}`), 0) / assess.length) * 100 >= threshold).length;
    const pct = Math.round((above / students.length) * 100);
    const level = pct >= 70 ? 3 : pct >= 60 ? 2 : pct >= 50 ? 1 : 0;
    return { co, assess, pct, level };
  });

  const csv = () => {
    const lines = [['CO', 'Statement', 'Assessments', `% students >= ${threshold}%`, 'Attainment level', 'Target level', 'Status']];
    rows.forEach((r) => lines.push([r.co.id, r.co.text, r.assess.map((a) => a.name).join('; ') || 'Not assessed yet', r.pct ?? '', r.level ?? '', target, r.level === null ? 'Pending' : r.level >= target ? 'Attained' : 'Not attained']));
    const blob = new Blob([lines.map((l) => l.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `CO_attainment_${code}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-5">
      <style>{PRINT_CSS}</style>
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <Chips value={code} onChange={setCode} options={FACULTY_CODES.map((c) => ({ id: c, label: subjectByCode(c)?.name || c }))} />
        <div className="flex gap-2 lg:ml-auto"><Button onClick={csv}><Download className="w-4 h-4" />Export CSV</Button><Button onClick={() => window.print()}><Printer className="w-4 h-4" />Print</Button></div>
      </div>
      <div className="print-area space-y-5">
        <Card>
          <div className="flex flex-col md:flex-row md:items-end gap-4 mb-5">
            <div className="flex-1">
              <p className="text-xs text-zinc-500">{code} · Sections {FACULTY_COURSES.filter((c) => c.code === code).map((c) => c.section).join(', ')} · {students.length} students · {FACULTY.fullName}</p>
              <h2 className="text-xl font-semibold text-zinc-900">Course outcome attainment: {subjectByCode(code)?.name}</h2>
              <p className="text-sm text-zinc-500">Direct attainment from internal assessments completed so far. Level 3: 70%+ of students reach the threshold · Level 2: 60%+ · Level 1: 50%+.</p>
            </div>
            <label className="text-sm text-zinc-600">Threshold <input type="number" min="40" max="90" value={threshold} onChange={(e) => setThreshold(Number(e.target.value) || 60)} className={`${inputClass} !w-20 !py-1.5 ml-1`} />%</label>
            <label className="text-sm text-zinc-600">Target level <select value={target} onChange={(e) => setTarget(Number(e.target.value))} className={`${inputClass} !w-20 !py-1.5 ml-1`}>{[1, 2, 3].map((n) => <option key={n}>{n}</option>)}</select></label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead><tr className="text-left text-xs text-zinc-500 border-b border-zinc-200"><th className="py-2 pr-3 font-medium">CO</th><th className="py-2 pr-3 font-medium">Outcome</th><th className="py-2 pr-3 font-medium">Assessed through</th><th className="py-2 pr-3 font-medium w-40">Students ≥ {threshold}%</th><th className="py-2 pr-3 font-medium">Level</th><th className="py-2 font-medium">Status</th></tr></thead>
              <tbody className="divide-y divide-zinc-100">
                {rows.map((r) => (
                  <tr key={r.co.id}>
                    <td className="py-3 pr-3 font-semibold text-[#6D3FC0]">{r.co.id}</td>
                    <td className="py-3 pr-3 text-zinc-700 max-w-xs">{r.co.text}</td>
                    <td className="py-3 pr-3 text-zinc-600 text-xs">{r.assess.length ? r.assess.map((a) => a.name).join(', ') : 'Not assessed yet'}</td>
                    <td className="py-3 pr-3">{r.pct === null ? '—' : <div className="flex items-center gap-2"><div className="flex-1 h-2 rounded-full bg-zinc-100 overflow-hidden"><div className="h-full bg-[#6D3FC0]" style={{ width: `${r.pct}%` }} /></div><span className="w-9 text-right font-medium">{r.pct}%</span></div>}</td>
                    <td className="py-3 pr-3 font-semibold">{r.level ?? '—'}</td>
                    <td className="py-3">{r.level === null ? <Pill>Pending</Pill> : r.level >= target ? <Pill tone="green">Attained</Pill> : <Pill tone="red">Below target</Pill>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card>
          <CardTitle hint="Which completed assessment covers which outcome">Assessment to CO map</CardTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead><tr className="text-xs text-zinc-500 border-b border-zinc-200"><th className="py-2 text-left font-medium">Assessment</th><th className="py-2 font-medium">Max</th>{info.outcomes.map((co) => <th key={co.id} className="py-2 font-medium">{co.id}</th>)}</tr></thead>
              <tbody className="divide-y divide-zinc-100">
                {CO_ASSESSMENTS.map((a) => (
                  <tr key={a.key} className={a.done ? '' : 'text-zinc-400'}>
                    <td className="py-2">{a.name}{!a.done && ' (upcoming)'}</td>
                    <td className="py-2 text-center">{a.max}</td>
                    {info.outcomes.map((co) => <td key={co.id} className="py-2 text-center">{a.cos.includes(co.id) ? '●' : ''}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-zinc-500 mt-3">Marks come from tests and assignments on the platform, where every question is already tagged with a CO.</p>
        </Card>
      </div>
    </div>
  );
}

/* ================================================================== */
/* PYQ upload                                                          */
/* ================================================================== */

export function FPYQUpload() {
  const [store, update] = useStore();
  const [code, setCode] = useState(FACULTY_CODES[0]);
  const [year, setYear] = useState(PYQ_YEARS[PYQ_YEARS.length - 1]);
  const [exam, setExam] = useState('end');
  const [sections, setSections] = useState(() => allSections(FACULTY_CODES[0]));
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const input = useRef(null);
  const [uploading, setUploading] = useState(false);
  const upload = async () => {
    if (!file) return setError('Choose the question paper file');
    if (!sections.length) return setError('Choose at least one section');
    const id = uid('pq');
    setUploading(true);
    try {
      await saveFile(`file-${id}`, file);
    } catch (err) {
      setUploading(false);
      return setError(`Upload failed: ${err.message}`);
    }
    setUploading(false);
    update((s) => ({ ...s, pyqs: [{ id, fileId: `file-${id}`, code, sections: [...sections].sort(), year: Number(year), exam: PYQ_EXAMS.find((e) => e.id === exam).label, examId: exam, fileName: file.name, size: file.size, uploadedAt: new Date().toISOString() }, ...s.pyqs] }));
    setFile(null);
    setError('');
  };
  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-5 items-start">
      <Card>
        <CardTitle hint="Students find it under PYQ papers">Upload a question paper</CardTitle>
        <Field group label="Subject"><SubjectChips value={code} onChange={(c) => { setCode(c); setSections(allSections(c)); }} /></Field>
        <Field group label="Share with"><SectionPicker code={code} value={sections} onChange={(v) => { setSections(v); setError(''); }} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Year"><select value={year} onChange={(e) => setYear(e.target.value)} className={inputClass}>{[...PYQ_YEARS, PYQ_YEARS[PYQ_YEARS.length - 1] + 1].reverse().map((y) => <option key={y}>{y}</option>)}</select></Field>
          <Field label="Exam"><select value={exam} onChange={(e) => setExam(e.target.value)} className={inputClass}>{PYQ_EXAMS.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}</select></Field>
        </div>
        <Field label="File (PDF)">
          <input ref={input} type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => { setFile(e.target.files[0] || null); setError(''); }} />
          {file ? (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-zinc-200 text-sm"><FileText className="w-4 h-4 text-red-500" /><span className="truncate flex-1">{file.name}</span><button onClick={() => setFile(null)} aria-label="Remove"><X className="w-4 h-4 text-zinc-400" /></button></div>
          ) : (
            <button onClick={() => input.current?.click()} className="w-full flex items-center justify-center gap-2 px-4 py-6 rounded-2xl border-2 border-dashed border-zinc-200 hover:border-[#6D3FC0] text-sm text-zinc-600"><Paperclip className="w-4 h-4" />Choose a file</button>
          )}
        </Field>
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        <Button variant="primary" className="w-full" disabled={uploading} onClick={upload}><Upload className="w-4 h-4" />{uploading ? 'Uploading…' : 'Upload for students'}</Button>
      </Card>
      <Card className="!p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100"><p className="font-semibold text-zinc-900">Uploaded by you</p></div>
        {store.pyqs.length === 0 ? <Empty icon={FileText} title="Nothing uploaded yet" /> : (
          <ul className="divide-y divide-zinc-100">
            {store.pyqs.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                <FileText className="w-5 h-5 text-red-500" />
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-zinc-900">{subjectByCode(p.code)?.name}: {p.exam} {p.year}</p><p className="text-xs text-zinc-500 flex items-center gap-1.5 flex-wrap">{p.fileName} · {ago(new Date(p.uploadedAt))} <SectionTags code={p.code} sections={p.sections} /></p></div>
                <button onClick={() => { deleteFile(`file-${p.id}`); update((s) => ({ ...s, pyqs: s.pyqs.filter((x) => x.id !== p.id) })); }} className="text-zinc-300 hover:text-red-500" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
