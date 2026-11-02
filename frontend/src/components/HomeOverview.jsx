import { readSaved, writeSaved } from '../utils/session';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CalendarClock,
  CircleCheck,
  Search,
  CircleX,
  ClipboardCheck,
  Clock,
  FileText,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Upload,
  Video,
  X,
} from 'lucide-react';
import {
  SUBMISSIONS as BASE_SUBMISSIONS,
  TESTS as BASE_TESTS,
  RECENTLY_ASSIGNED as BASE_RECENT,
  quizOfTheDay,
} from '../data/homeData';
import { subjectByCode as storeSubjectRaw } from '../data/materialsData';
import { storeAnnouncements, storeMaterials, storeSubmissions, storeTests, testStartOverride, useStore } from '../data/store';

const storeSubject = (code) => storeSubjectRaw(code) || { name: code, color: '#71717A' };
const readLocal = (key) => readSaved(key, {}) || {};
// Pending work: sample items plus what faculty assigned, minus what the student already submitted.
const SUBMISSIONS_ = () => {
  const local = readLocal('alliance-assignments');
  return [...storeSubmissions(), ...BASE_SUBMISSIONS].filter((s) => !local[s.id] || local[s.id].status === 'pending');
};
const TESTS_ = () => {
  const done = readLocal('alliance-test-attempts');
  return [
    ...BASE_TESTS.map((t) => {
      const o = testStartOverride(t.id);
      return o ? { ...t, start: o } : t;
    }),
    ...storeTests(),
  ].filter((t) => !done[t.id]?.submittedAt);
};
const RECENT_ = () => {
  const fromFaculty = [
    ...storeAnnouncements().map((a) => ({ id: a.id, kind: 'Announcement', title: a.title, subject: { code: a.code, name: storeSubject(a.code).name, color: storeSubject(a.code).color }, when: a.at, teacher: 'Demo Teacher' })),
    ...storeSubmissions().map((a) => ({ id: `n-${a.id}`, kind: 'Assignment', title: a.title, subject: a.subject, when: new Date(), teacher: a.teacher })),
    ...storeTests().map((t) => ({ id: `n-${t.id}`, kind: 'Test', title: `${t.title} scheduled`, subject: t.subject, when: new Date(), teacher: 'Demo Teacher' })),
    ...['CSE303', 'CSE301', 'CSE302', 'CSE304', 'CSE305'].flatMap((code) => storeMaterials(code).map((m) => ({ id: `n-${m.id}`, kind: 'Notes', title: m.title, subject: { code, name: storeSubject(code).name, color: storeSubject(code).color }, when: m.sharedAt, teacher: m.faculty }))),
  ];
  return [...fromFaculty, ...BASE_RECENT].sort((a, b) => b.when - a.when).slice(0, 5);
};


/* ---------- date helpers ---------- */

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const dayDiff = (d) => Math.round((startOfDay(d) - startOfDay(new Date())) / 86400000);
const fmtTime = (d) => d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
const fmtDay = (d) => {
  const diff = dayDiff(d);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
};
const fmtWhen = (d) => `${fmtDay(d)}, ${fmtTime(d)}`;

const fromNow = (d) => {
  const ms = d - new Date();
  const mins = Math.round(Math.abs(ms) / 60000);
  const hrs = Math.round(mins / 60);
  const days = Math.abs(dayDiff(d));
  let span;
  if (mins < 60) span = `${mins} min`;
  else if (hrs < 24 && days <= 1) span = `${hrs} h`;
  else span = `${days} day${days === 1 ? '' : 's'}`;
  return ms < 0 ? `${span} late` : `in ${span}`;
};

const ago = (d) => {
  const mins = Math.round((new Date() - d) / 60000);
  if (mins < 60) return `${mins} min ago`;
  if (mins < 1440) return `${Math.round(mins / 60)} h ago`;
  const days = Math.round(mins / 1440);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

/* ---------- urgency buckets for submissions ---------- */

const BUCKETS = [
  { id: 'overdue', label: 'Overdue', hint: 'Submit as soon as you can', dot: 'bg-red-500', pill: 'bg-red-50 text-red-700', ring: 'border-red-200' },
  { id: 'today', label: 'Due today', hint: 'Finish these before midnight', dot: 'bg-orange-500', pill: 'bg-orange-50 text-orange-700', ring: 'border-orange-200' },
  { id: 'tomorrow', label: 'Due tomorrow', hint: 'Start today to stay ahead', dot: 'bg-amber-400', pill: 'bg-amber-50 text-amber-800', ring: 'border-amber-200' },
  { id: 'week', label: 'This week', hint: 'Plan time for these', dot: 'bg-sky-500', pill: 'bg-sky-50 text-sky-700', ring: 'border-zinc-200' },
  { id: 'later', label: 'Later', hint: 'No rush yet', dot: 'bg-zinc-400', pill: 'bg-zinc-100 text-zinc-600', ring: 'border-zinc-200' },
];

const bucketOf = (due) => {
  if (due < new Date()) return 'overdue';
  const diff = dayDiff(due);
  if (diff <= 0) return 'today';
  if (diff === 1) return 'tomorrow';
  if (diff <= 7) return 'week';
  return 'later';
};
const bucketInfo = (id) => BUCKETS.find((b) => b.id === id);

/* ---------- small building blocks ---------- */

function Tile({ className = '', children, onClick, as = 'div', label }) {
  const Comp = as;
  return (
    <Comp
      onClick={onClick}
      aria-label={label}
      className={`elastic-card p-5 sm:p-6 text-left ${onClick ? "cursor-pointer hover:border-zinc-300 hover:shadow-md transition-all" : ""} ${className}`}
    >
      {children}
    </Comp>
  );
}

function TileHeader({ kicker, icon: Icon, title, action, onAction, tint = 'bg-zinc-100 text-zinc-700' }) {
  return (
    <div className="mb-4">
      {kicker && (
        <span className="block text-[11px] font-mono font-semibold uppercase tracking-widest text-[#005FB8] mb-1">
          {kicker}
        </span>
      )}
      <div className="flex items-center gap-2.5">
        {Icon && (
          <span className={`w-7 h-7 rounded-xl flex items-center justify-center ${tint}`}>
            <Icon className="w-4 h-4" strokeWidth={1.8} />
          </span>
        )}
        <h3 className="text-base font-bold text-zinc-900 tracking-tight">{title}</h3>
        {action && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction?.();
            }}
            className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-[#005FB8] hover:underline cursor-pointer"
          >
            {action}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

const SubjectDot = ({ subject }) => (
  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: subject.color }} />
);

/* ---------- tiles ---------- */

function TodayTile({ onNavigate }) {
  const now = new Date();
  const items = [];

  SUBMISSIONS_().filter((s) => ['overdue', 'today'].includes(bucketOf(s.due))).forEach((s) =>
    items.push({
      id: s.id,
      time: s.due,
      overdue: s.due < now,
      icon: Upload,
      title: s.title,
      meta: `${s.type} · ${s.subject.name}`,
      when: s.due < now ? fromNow(s.due) : `Due ${fmtTime(s.due)}`,
      cta: 'Submit',
      go: 'assignments',
    })
  );
  TESTS_().filter((t) => dayDiff(t.start) === 0 && t.start > new Date(now.getTime() - t.minutes * 60000)).forEach((t) => {
    const live = t.start <= now;
    items.push({
      id: t.id,
      time: t.start,
      live,
      icon: ClipboardCheck,
      title: `${t.title} · ${t.subject.name}`,
      meta: `${t.minutes} min · ${t.questions} questions${t.proctored ? ' · Proctored' : ''}`,
      when: live ? 'Live now' : `Starts ${fmtTime(t.start)}`,
      cta: live ? 'Start test' : 'View',
      go: live ? 'tests-live' : 'tests-upcoming',
    });
  });

  // Overdue first, then live, then by time.
  items.sort((a, b) => (b.overdue ? 1 : 0) - (a.overdue ? 1 : 0) || (b.live ? 1 : 0) - (a.live ? 1 : 0) || a.time - b.time);

  return (
    <Tile className="md:col-span-2 xl:col-span-8">
      <TileHeader kicker="THE SCHEDULE" icon={CalendarClock} title="Do today" tint="bg-blue-50 text-[#005FB8]" action="Open planner" onAction={() => onNavigate('planner-calendar')} />
      {items.length === 0 ? (
        <div className="py-10 text-center">
          <CircleCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <p className="font-medium text-zinc-900">You're all done for today</p>
          <p className="text-sm text-zinc-500">Nothing else is due. Try the quiz of the day.</p>
        </div>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {items.map((it) => {
            const Icon = it.icon;
            const tone = it.overdue ? 'text-red-600' : it.live ? 'text-emerald-600' : 'text-zinc-500';
            return (
              <li key={it.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  it.overdue ? 'bg-red-50 text-red-600' : it.live ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-500'
                }`}>
                  <Icon className="w-[18px] h-[18px]" strokeWidth={1.9} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-medium text-zinc-900 line-clamp-2 sm:truncate">{it.title}</p>
                  <p className="text-xs text-zinc-500 truncate">{it.meta}</p>
                  <p className={`sm:hidden text-xs font-medium mt-0.5 ${tone}`}>{it.when}</p>
                </div>
                <span className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${tone}`}>
                  {it.live && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                  {it.overdue && <TriangleAlert className="w-3.5 h-3.5" />}
                  {it.when}
                </span>
                {it.cta && (
                  <button
                    onClick={() => onNavigate(it.go)}
                    className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium ${
                      it.overdue || it.live ? 'bg-[#0077CC] text-white hover:bg-[#005299]' : 'border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    {it.cta}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Tile>
  );
}

function PendingTile({ pending, onOpen }) {
  const counts = BUCKETS.map((b) => ({ ...b, n: pending.filter((p) => p.bucket === b.id).length })).filter((b) => b.n > 0);
  const next = pending[0];
  return (
    <Tile as="button" className="xl:col-span-4 w-full flex flex-col" onClick={onOpen} label="Open pending submissions">
      <TileHeader kicker="THE SUBMISSIONS QUEUE" icon={Upload} title="Pending submissions" tint="bg-amber-50 text-amber-700" />
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-4xl font-semibold text-zinc-900">{pending.length}</span>
        <span className="text-sm text-zinc-500">to submit</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {counts.map((b) => (
          <span key={b.id} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${b.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${b.dot}`} />
            {b.n} {b.label.toLowerCase()}
          </span>
        ))}
      </div>
      {next && (
        <div className="mt-auto pt-4 border-t border-zinc-100 w-full">
          <p className="text-xs text-zinc-500 mb-1">Most urgent</p>
          <p className="text-sm font-medium text-zinc-900 truncate">{next.title}</p>
          <p className={`text-xs ${next.bucket === 'overdue' ? 'text-red-600' : 'text-zinc-500'}`}>
            {next.subject.name} · {fromNow(next.due)}
          </p>
        </div>
      )}
      <span className="mt-4 inline-flex items-center gap-1 text-sm text-[#0077CC]">
        See all in order of priority <ArrowRight className="w-4 h-4" />
      </span>
    </Tile>
  );
}

function TestsTile({ onNavigate }) {
  const upcoming = TESTS_().filter((t) => t.start.getTime() + t.minutes * 60000 > Date.now()).sort((a, b) => a.start - b.start);
  return (
    <Tile className="xl:col-span-4 flex flex-col">
      <TileHeader kicker="THE PROCTORED ASSESSMENTS" icon={ClipboardCheck} title="Upcoming tests" tint="bg-sky-50 text-sky-700" action="All tests" onAction={() => onNavigate('tests-upcoming')} />
      <ul className="space-y-3">
        {upcoming.slice(0, 3).map((t) => (
          <li key={t.id} className="flex items-center gap-3">
            <div className="w-12 shrink-0 text-center rounded-xl bg-zinc-50 border border-zinc-100 py-1.5">
              <p className="text-[10px] uppercase text-zinc-500 leading-none mb-1">
                {t.start.toLocaleDateString('en-IN', { month: 'short' })}
              </p>
              <p className="text-base font-semibold text-zinc-900 leading-none">{t.start.getDate()}</p>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-900 truncate">{t.title}</p>
              <p className="text-xs text-zinc-500 truncate flex items-center gap-1.5">
                <SubjectDot subject={t.subject} />
                {t.subject.name}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-medium text-zinc-700">{fmtDay(t.start)}</p>
              <p className="text-xs text-zinc-500">{fmtTime(t.start)}</p>
            </div>
          </li>
        ))}
      </ul>
      {upcoming.some((t) => t.proctored) && (
        <p className="mt-auto pt-4 text-xs text-zinc-500 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-zinc-400" />
          Proctored tests open a quick camera check 10 minutes before.
        </p>
      )}
    </Tile>
  );
}

function QuizTile() {
  const quiz = useMemo(() => quizOfTheDay(), []);
  const key = `alliance-${quiz.id}`;
  const [picked, setPicked] = useState(null);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = readSaved(key, null);
    if (saved) {
      setPicked(saved.picked);
      setChecked(true);
    }
  }, [key]);

  const check = () => {
    if (picked === null) {
      setError('Pick an answer first');
      return;
    }
    setChecked(true);
    writeSaved(key, { picked });
  };

  const correct = checked && picked === quiz.answer;

  return (
    <Tile className="md:col-span-2 xl:col-span-4 flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600">
          <Lightbulb className="w-[18px] h-[18px]" strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-zinc-900 leading-tight">Quiz of the day</h3>
          <p className="text-xs text-zinc-500 flex items-center gap-1.5 truncate">
            <SubjectDot subject={quiz.subject} />
            {quiz.subject.name}
          </p>
        </div>
        <span className="ml-auto shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#005FA3]">+{quiz.xp} XP</span>
      </div>

      <p className="text-[16px] font-medium text-zinc-900 mb-4 leading-relaxed">{quiz.question}</p>

      <div className="grid sm:grid-cols-2 xl:grid-cols-1 gap-2 mb-4">
        {quiz.options.map((opt, i) => {
          const isPicked = picked === i;
          const isAnswer = i === quiz.answer;
          let style = 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-800';
          if (!checked && isPicked) style = 'border-[#0077CC] bg-[#F7F5FD] text-[#005FA3]';
          if (checked && isAnswer) style = 'border-emerald-400 bg-emerald-50 text-emerald-800';
          if (checked && isPicked && !isAnswer) style = 'border-red-300 bg-red-50 text-red-700';
          if (checked && !isPicked && !isAnswer) style = 'border-zinc-200 text-zinc-400';
          return (
            <button
              key={i}
              disabled={checked}
              onClick={() => {
                setPicked(i);
                setError('');
              }}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border text-left text-sm transition-colors ${style}`}
            >
              <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs shrink-0">
                {String.fromCharCode(65 + i)}
              </span>
              <span>{opt}</span>
              {checked && isAnswer && <CircleCheck className="w-4 h-4 ml-auto shrink-0" />}
              {checked && isPicked && !isAnswer && <CircleX className="w-4 h-4 ml-auto shrink-0" />}
            </button>
          );
        })}
      </div>

      {!checked ? (
        <div className="flex items-center gap-3 mt-auto">
          <button onClick={check} className="px-5 py-2.5 rounded-full bg-[#0077CC] text-white text-sm font-medium hover:bg-[#005299]">
            Check answer
          </button>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      ) : (
        <div className={`rounded-2xl p-4 text-sm ${correct ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900'}`}>
          <p className="font-semibold mb-1">{correct ? `Correct, +${quiz.xp} XP` : 'Not quite. Here is why:'}</p>
          <p className="leading-relaxed">{quiz.explain}</p>
          <p className="mt-2 text-xs opacity-75">A new question appears tomorrow.</p>
        </div>
      )}
    </Tile>
  );
}

const KIND_ICON = { Notes: FileText, Assignment: Upload, Test: ClipboardCheck, Recording: Video, Announcement: Sparkles };

function AssignedTile({ onNavigate }) {
  const go = { Notes: 'notes', Assignment: 'assignments', Test: 'tests-upcoming', Recording: 'recordings', Announcement: 'dashboard' };
  return (
    <Tile className="md:col-span-2 xl:col-span-4">
      <TileHeader icon={Sparkles} title="New from faculty" tint="bg-pink-50 text-pink-600" />
      <ul className="space-y-1">
        {RECENT_().map((r) => {
          const Icon = KIND_ICON[r.kind] || FileText;
          return (
            <li key={r.id}>
              <button
                onClick={() => onNavigate(go[r.kind])}
                className="w-full flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-zinc-50 text-left"
              >
                <span className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-500 flex items-center justify-center shrink-0">
                  <Icon className="w-[18px] h-[18px]" strokeWidth={1.9} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-900 truncate">{r.title}</p>
                  <p className="text-xs text-zinc-500 truncate flex items-center gap-1.5">
                    <SubjectDot subject={r.subject} />
                    {r.kind} · {r.teacher}
                  </p>
                </div>
                <span className="text-xs text-zinc-400 shrink-0">{ago(r.when)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </Tile>
  );
}

/* ---------- pending submissions pop-up ---------- */

function PendingModal({ pending, onClose, onNavigate }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const groups = BUCKETS.map((b) => ({ ...b, items: pending.filter((p) => p.bucket === b.id) })).filter((g) => g.items.length);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pending-title"
        onClick={(e) => e.stopPropagation()}
        className="elastic-modal w-full sm:max-w-2xl max-h-[88vh] flex flex-col overflow-hidden shadow-2xl"
      >
        <div className="flex items-start gap-3 p-5 sm:p-6 border-b border-zinc-100">
          <div>
            <h2 id="pending-title" className="text-xl font-semibold text-zinc-900">Pending submissions</h2>
            <p className="text-sm text-zinc-500">{pending.length} to submit, most urgent first</p>
          </div>
          <button onClick={onClose} className="ml-auto w-9 h-9 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-500" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
          {groups.map((g) => (
            <section key={g.id}>
              <div className="flex items-center gap-2 mb-2.5">
                <span className={`w-2 h-2 rounded-full ${g.dot}`} />
                <h3 className="text-sm font-semibold text-zinc-900">{g.label}</h3>
                <span className="text-xs text-zinc-400">{g.items.length}</span>
                <span className="text-xs text-zinc-500 ml-auto">{g.hint}</span>
              </div>
              <ul className="space-y-2">
                {g.items.map((s, i) => (
                  <li key={s.id} className={`flex items-center gap-3 p-3.5 rounded-2xl border ${g.ring} ${g.id === 'overdue' ? 'bg-red-50/40' : ''}`}>
                    <span className="w-7 h-7 rounded-full bg-zinc-100 text-zinc-600 text-xs font-semibold flex items-center justify-center shrink-0">
                      {pending.indexOf(s) + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-900">{s.title}</p>
                      <p className="text-xs text-zinc-500">
                        <span className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle" style={{ background: s.subject.color }} />
                        {s.subject.name} · {s.type} · {s.marks} marks · {s.teacher}
                      </p>
                      <p className={`sm:hidden text-xs mt-0.5 ${g.id === 'overdue' ? 'text-red-600' : 'text-zinc-500'}`}>{fmtWhen(s.due)} · {fromNow(s.due)}</p>
                    </div>
                    <div className="text-right shrink-0 hidden sm:block">
                      <p className={`text-xs font-medium ${g.id === 'overdue' ? 'text-red-600' : 'text-zinc-700'}`}>{fromNow(s.due)}</p>
                      <p className="text-xs text-zinc-500 flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3" />
                        {fmtWhen(s.due)}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onNavigate('assignments');
                      }}
                      className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium ${
                        ['overdue', 'today'].includes(g.id) ? 'bg-[#0077CC] text-white hover:bg-[#005299]' : 'border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                      }`}
                    >
                      Submit
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- page ---------- */

export default function HomeOverview({ userProfile, onNavigate }) {
  const [storeState] = useStore();
  const [showPending, setShowPending] = useState(false);

  const pending = useMemo(
    () =>
      SUBMISSIONS_().filter((s) => !s.submitted)
        .map((s) => ({ ...s, bucket: bucketOf(s.due) }))
        .sort((a, b) => a.due - b.due),
    [storeState]
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = (userProfile?.fullName || 'there').split(' ')[0];
  const overdue = pending.filter((p) => p.bucket === 'overdue').length;
  const dueToday = pending.filter((p) => p.bucket === 'today').length;
  const testsToday = TESTS_().filter((t) => dayDiff(t.start) === 0 && t.start > new Date()).length;

  const summary = [
    overdue && `${overdue} overdue`,
    dueToday && `${dueToday} due today`,
    testsToday && `${testsToday} test${testsToday > 1 ? 's' : ''} later today`,
  ].filter(Boolean);

  return (
    <div className="space-y-5">
      <div className="mb-2">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#005FB8] font-bold block mb-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
          {greeting}, {firstName}
        </h1>
        <p className="text-zinc-600 mt-1 text-sm">
          {summary.length ? `You have ${summary.join(', ')}.` : 'Nothing urgent today. All coursework up to date.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5">
        <QuizTile />
        <TodayTile onNavigate={onNavigate} />

        <PendingTile pending={pending} onOpen={() => setShowPending(true)} />
        <TestsTile onNavigate={onNavigate} />
        <AssignedTile onNavigate={onNavigate} />
      </div>

      {showPending && (
        <PendingModal pending={pending} onClose={() => setShowPending(false)} onNavigate={onNavigate} />
      )}
    </div>
  );
}
