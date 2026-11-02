import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpenText,
  ChevronRight,
  CirclePlay,
  Clock3,
  Download,
  ExternalLink,
  Info,
  Layers,
  Library,
  ListChecks,
  ScrollText,
  Target,
  UserRound,
  Award,
  X,
} from 'lucide-react';
import NotesView from './NotesView';
import LessonPlayer from './LessonPlayer';
import { downloadBlob } from '../utils/files';
import { syllabusPdf } from '../utils/docs';
import { subjectByCode } from '../data/materialsData';
import { courseInfo } from '../data/courseInfo';

export const COURSE_TABS = [
  { id: 'units', label: 'Course units', icon: Layers },
  { id: 'intro', label: 'Introduction', icon: Info },
  { id: 'objectives', label: 'Objectives', icon: Target },
  { id: 'outcomes', label: 'Outcomes', icon: Award },
  { id: 'outline', label: 'Outline', icon: ListChecks },
  { id: 'syllabus', label: 'Syllabus', icon: ScrollText },
  { id: 'references', label: 'References', icon: Library },
  { id: 'videos', label: 'Live class videos', icon: CirclePlay },
];

const LEVEL_STYLE = {
  Remember: 'bg-zinc-100 text-zinc-600',
  Understand: 'bg-sky-50 text-sky-700',
  Apply: 'bg-emerald-50 text-emerald-700',
  Analyse: 'bg-amber-50 text-amber-800',
  Evaluate: 'bg-orange-50 text-orange-700',
  Create: 'bg-pink-50 text-pink-700',
};

const Card = ({ children, className = '' }) => (
  <div className={`glass-card rounded-3xl p-5 sm:p-6 ${className}`}>{children}</div>
);

const SectionTitle = ({ children, hint }) => (
  <div className="mb-4">
    <h3 className="text-lg font-semibold text-zinc-900">{children}</h3>
    {hint && <p className="text-sm text-zinc-500">{hint}</p>}
  </div>
);

const Empty = ({ children }) => <p className="text-sm text-zinc-500 py-6 text-center">{children}</p>;

/* ---------- tabs ---------- */

function IntroTab({ subject, info }) {
  const facts = [
    ['Course code', subject.code],
    ['Credits', subject.credits],
    ['L-T-P', info.ltp],
    ['Type', subject.type],
    ['Semester', subject.semester],
    ['Contact hours', `${info.totalHours} hours`],
  ];
  return (
    <div className="grid lg:grid-cols-3 gap-5">
      <Card className="lg:col-span-2">
        <SectionTitle>About this course</SectionTitle>
        <p className="text-[15px] text-zinc-700 leading-relaxed">{info.intro}</p>
        {info.prerequisites.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-medium text-zinc-900 mb-2">What you should know first</p>
            <div className="flex flex-wrap gap-2">
              {info.prerequisites.map((p) => (
                <span key={p} className="px-3 py-1.5 rounded-full bg-zinc-100 text-sm text-zinc-700">
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>
      <Card>
        <SectionTitle>Course facts</SectionTitle>
        <dl className="space-y-3 text-sm">
          {facts.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4">
              <dt className="text-zinc-500">{k}</dt>
              <dd className="font-medium text-zinc-900 text-right">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 pt-5 border-t border-zinc-100 flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-[#F1EEFB] text-[#4C2E8A] flex items-center justify-center">
            <UserRound className="w-5 h-5" />
          </span>
          <div>
            <p className="text-sm font-medium text-zinc-900">{subject.faculty}</p>
            <p className="text-xs text-zinc-500">Course faculty</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ObjectivesTab({ info }) {
  return (
    <Card>
      <SectionTitle hint="What this course sets out to teach you.">Course objectives</SectionTitle>
      {info.objectives.length === 0 ? (
        <Empty>Objectives have not been added yet.</Empty>
      ) : (
        <ol className="space-y-3">
          {info.objectives.map((o, i) => (
            <li key={i} className="flex gap-3">
              <span className="w-7 h-7 rounded-full bg-[#F1EEFB] text-[#4C2E8A] text-sm font-semibold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <p className="text-[15px] text-zinc-700 pt-0.5">{o}</p>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

function OutcomesTab({ info }) {
  return (
    <Card>
      <SectionTitle hint="By the end of the course, you will be able to do the following. Each outcome is tested in your assessments.">
        Course outcomes
      </SectionTitle>
      {info.outcomes.length === 0 ? (
        <Empty>Outcomes have not been added yet.</Empty>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {info.outcomes.map((o) => (
            <li key={o.id} className="flex items-start gap-4 py-3.5 first:pt-0 last:pb-0">
              <span className="text-sm font-semibold text-[#6D3FC0] w-10 shrink-0 pt-0.5">{o.id}</span>
              <p className="text-[15px] text-zinc-700 flex-1">{o.text}</p>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${LEVEL_STYLE[o.level] || LEVEL_STYLE.Remember}`}>
                {o.level}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function OutlineTab({ info, subject }) {
  const cie = info.assessment.filter((a) => a.kind === 'CIE');
  const see = info.assessment.filter((a) => a.kind === 'SEE');
  const sum = (arr) => arr.reduce((n, a) => n + a.marks, 0);
  const maxHours = Math.max(...info.syllabus.map((u) => u.hours));
  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <Card>
        <SectionTitle hint={`${info.totalHours} contact hours in total`}>Teaching plan</SectionTitle>
        <ul className="space-y-3">
          {info.syllabus.map((u) => (
            <li key={u.unit}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-zinc-800 truncate pr-3">
                  <span className="text-zinc-500">Unit {u.unit} ·</span> {u.title}
                </span>
                <span className="text-zinc-500 shrink-0">{u.hours} h</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(u.hours / maxHours) * 100}%`, background: subject.color }} />
              </div>
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <SectionTitle hint="How your 100 marks are made up">Assessment</SectionTitle>
        {[
          ['Continuous internal evaluation (CIE)', cie],
          ['Semester-end examination (SEE)', see],
        ].map(([label, rows]) => (
          <div key={label} className="mb-5 last:mb-0">
            <div className="flex justify-between text-sm font-medium text-zinc-900 mb-2">
              <span>{label}</span>
              <span>{sum(rows)} marks</span>
            </div>
            <ul className="rounded-2xl border border-zinc-100 divide-y divide-zinc-100">
              {rows.map((r) => (
                <li key={r.part} className="flex justify-between px-4 py-2.5 text-sm">
                  <span className="text-zinc-700">{r.part}</span>
                  <span className="text-zinc-900 font-medium">{r.marks}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <p className="text-xs text-zinc-500 mt-4">Minimum 40% in SEE and 40% overall to pass.</p>
      </Card>
    </div>
  );
}

function SyllabusTab({ info, code }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button onClick={() => downloadBlob(syllabusPdf(code), `${code} syllabus.pdf`)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-zinc-200 bg-white text-sm text-zinc-700 hover:bg-zinc-50">
          <Download className="w-4 h-4" />
          Download syllabus
        </button>
      </div>
      {info.syllabus.map((u) => (
        <Card key={u.unit} className="!p-5">
          <div className="flex items-start gap-4">
            <span className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-700 font-semibold flex items-center justify-center shrink-0">{u.unit}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-semibold text-zinc-900">{u.title}</h4>
                <span className="ml-auto inline-flex items-center gap-1 text-xs text-zinc-500 shrink-0">
                  <Clock3 className="w-3.5 h-3.5" />
                  {u.hours} hours
                </span>
              </div>
              {u.topics.length ? (
                <ul className="flex flex-wrap gap-2">
                  {u.topics.map((t) => (
                    <li key={t} className="px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-100 text-sm text-zinc-700">
                      {t}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-zinc-500">Topics will be listed by the faculty.</p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function BookList({ books, label }) {
  return (
    <ol className="space-y-3">
      {books.map((b, i) => (
        <li key={b.title} className="flex gap-4 p-4 rounded-2xl border border-zinc-100 hover:border-zinc-200">
          <span className="w-11 h-14 rounded-lg bg-gradient-to-b from-[#F1EEFB] to-[#E4DDF7] text-[#4C2E8A] flex items-center justify-center shrink-0">
            <BookOpenText className="w-5 h-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-zinc-500 mb-0.5">
              {label} {i + 1}
            </p>
            <p className="font-semibold text-zinc-900 leading-snug">{b.title}</p>
            <p className="text-sm text-zinc-600">{b.authors}</p>
            <p className="text-xs text-zinc-500 mt-1">
              {b.publisher} · {b.edition} · {b.year}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function ReferencesTab({ info }) {
  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <Card>
        <SectionTitle hint="Main books the course follows">Textbooks</SectionTitle>
        {info.textbooks.length ? <BookList books={info.textbooks} label="Textbook" /> : <Empty>No textbooks listed.</Empty>}
      </Card>
      <div className="space-y-5">
        <Card>
          <SectionTitle hint="For deeper reading">Reference books</SectionTitle>
          {info.references.length ? <BookList books={info.references} label="Reference" /> : <Empty>No reference books listed.</Empty>}
        </Card>
        {info.online.length > 0 && (
          <Card>
            <SectionTitle>Online courses</SectionTitle>
            <ul className="space-y-2">
              {info.online.map((o) => (
                <li key={o.title} className="flex items-center gap-3 text-sm">
                  <ExternalLink className="w-4 h-4 text-zinc-400" />
                  <span className="text-zinc-800">{o.title}</span>
                  <span className="text-zinc-500">· {o.by}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}

function VideosTab({ info, subject }) {
  const [playing, setPlaying] = useState(null);
  const [unit, setUnit] = useState('all');
  const units = [...new Set(info.recordings.map((r) => r.unit))].sort();
  const shown = info.recordings.filter((r) => unit === 'all' || r.unit === unit);
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {['all', ...units].map((u) => (
          <button
            key={u}
            onClick={() => setUnit(u)}
            className={`px-3 py-1.5 rounded-full text-sm ${unit === u ? 'bg-[#F1EEFB] text-[#4C2E8A] font-medium' : 'text-zinc-600 hover:bg-zinc-100'}`}
          >
            {u === 'all' ? `All classes (${info.recordings.length})` : `Unit ${u}`}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <Card>
          <Empty>No class recordings yet.</Empty>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {shown.map((r) => (
            <button
              key={r.id}
              onClick={() => setPlaying(r)}
              className="text-left bg-white rounded-3xl border border-[#E4E4E7] overflow-hidden hover:border-zinc-300 hover:shadow-sm transition-all"
            >
              <div className="relative aspect-video flex items-center justify-center" style={{ background: `${subject.color}1A` }}>
                <span className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-sm" style={{ color: subject.color }}>
                  <CirclePlay className="w-7 h-7" />
                </span>
                <span className="absolute bottom-2 right-2 text-[11px] font-medium px-2 py-0.5 rounded-md bg-black/70 text-white">{r.minutes} min</span>
                <span className="absolute top-2 left-2 text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/90 text-zinc-700">
                  Lecture {r.lecture}
                </span>
              </div>
              <div className="p-4">
                <p className="font-medium text-zinc-900 line-clamp-2">{r.topic}</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Unit {r.unit} · {r.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {subject.faculty}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {playing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 sm:p-8" onClick={() => setPlaying(null)}>
          <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3 text-white">
              <div className="min-w-0">
                <p className="font-semibold truncate">
                  Lecture {playing.lecture}: {playing.topic}
                </p>
                <p className="text-sm text-white/70">
                  {subject.name} · {subject.faculty}
                </p>
              </div>
              <button onClick={() => setPlaying(null)} className="ml-auto w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <LessonPlayer code={subject.code} unit={playing.unit} topic={playing.topic} color={subject.color} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- page ---------- */

export default function CourseView({ code, initialTab = 'units', onBack }) {
  const subject = subjectByCode(code);
  const info = useMemo(() => courseInfo(code), [code]);
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [code, initialTab]);

  if (!subject) return null;
  const isCurrent = subject.progress !== undefined;

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm mb-4" aria-label="Breadcrumb">
        <button onClick={onBack} className="text-[#6D3FC0] hover:text-[#4C2E8A]">
          My subjects
        </button>
        <ChevronRight className="w-4 h-4 text-zinc-400" />
        <span className="text-zinc-600 truncate">
          {subject.code}: {subject.name}
        </span>
      </nav>

      {/* Header */}
      <div className="glass-card rounded-3xl overflow-hidden mb-5">
        <div className="h-1.5" style={{ background: subject.color }} />
        <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center gap-4">
          <div className="min-w-0">
            <p className="text-xs text-zinc-500 mb-1">
              {subject.code} · Semester {subject.semester} · {subject.credits} credits · {subject.type}
            </p>
            <h1 className="text-2xl font-semibold text-zinc-900">{subject.name}</h1>
            <p className="text-sm text-zinc-500 flex items-center gap-1.5 mt-1">
              <UserRound className="w-3.5 h-3.5" />
              {subject.faculty}
            </p>
          </div>
          <div className="md:ml-auto md:w-64">
            {isCurrent ? (
              <>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-500">
                    {subject.unitsDone} of {subject.units} {subject.unitLabel || 'units'} done
                  </span>
                  <span className="font-medium text-zinc-800">{subject.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${subject.progress}%`, background: subject.color }} />
                </div>
              </>
            ) : (
              <p className="text-sm text-zinc-600">
                Completed · Grade <span className="font-semibold text-zinc-900">{subject.grade}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-200 overflow-x-auto mb-6" role="tablist">
        {COURSE_TABS.map((t) => {
          const on = tab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={on}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-3 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors ${
                on ? 'border-[#6D3FC0] text-[#4C2E8A] font-medium' : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'units' && <NotesView subjectCode={code} embedded />}
      {tab === 'intro' && <IntroTab subject={subject} info={info} />}
      {tab === 'objectives' && <ObjectivesTab info={info} />}
      {tab === 'outcomes' && <OutcomesTab info={info} />}
      {tab === 'outline' && <OutlineTab info={info} subject={subject} />}
      {tab === 'syllabus' && <SyllabusTab info={info} code={code} />}
      {tab === 'references' && <ReferencesTab info={info} />}
      {tab === 'videos' && <VideosTab info={info} subject={subject} />}
    </div>
  );
}
