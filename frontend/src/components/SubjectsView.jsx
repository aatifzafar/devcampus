import React, { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, CalendarClock, FileText, FlaskConical, FolderKanban, Search, Upload, UserRound } from 'lucide-react';
import { SEMESTERS, CURRENT_SEMESTER } from '../data/subjectsData';

const TYPE_STYLE = {
  Theory: { icon: BookOpen, pill: 'bg-zinc-100 text-zinc-600' },
  Lab: { icon: FlaskConical, pill: 'bg-sky-50 text-sky-700' },
  Project: { icon: FolderKanban, pill: 'bg-pink-50 text-pink-700' },
};

const GRADE_STYLE = (g) =>
  g === 'O' || g === 'A+'
    ? 'bg-emerald-50 text-emerald-700'
    : g === 'A'
      ? 'bg-sky-50 text-sky-700'
      : 'bg-amber-50 text-amber-800';

/* Tile for a subject in the current semester */
function CurrentTile({ s, onNavigate, onOpenCourse }) {
  const type = TYPE_STYLE[s.type] || TYPE_STYLE.Theory;
  const TypeIcon = type.icon;
  return (
    <article
      onClick={() => onOpenCourse(s.code, 'intro')}
      className="group cursor-pointer glass-card rounded-3xl overflow-hidden flex flex-col hover:shadow-lg transition-all"
    >
      <div className="h-1.5" style={{ background: s.color }} />
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${s.color}14`, color: s.color }}>
            <TypeIcon className="w-[18px] h-[18px]" strokeWidth={1.9} />
          </span>
          <span className="text-xs text-zinc-500">{s.code}</span>
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${type.pill}`}>{s.type}</span>
          {s.pendingWork > 0 && (
            <span className="ml-auto text-[11px] font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-700">
              {s.pendingWork} pending
            </span>
          )}
        </div>

        <h3 className="text-[17px] font-semibold text-zinc-900 leading-snug mb-1 group-hover:text-[#4C2E8A]">{s.name}</h3>
        <p className="text-sm text-zinc-500 flex items-center gap-1.5 mb-4">
          <UserRound className="w-3.5 h-3.5" />
          {s.faculty} · {s.credits} credits
        </p>

        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-zinc-500">
            {s.unitsDone} of {s.units} {s.unitLabel || 'units'} done
          </span>
          <span className="font-medium text-zinc-800">{s.progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-zinc-100 overflow-hidden mb-3">
          <div className="h-full rounded-full" style={{ width: `${s.progress}%`, background: s.color }} />
        </div>
        <p className="text-sm text-zinc-700 mb-4 line-clamp-2">
          <span className="text-zinc-500">Now: </span>
          {s.currentTopic}
        </p>

        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
          <div className="rounded-xl bg-zinc-50 border border-zinc-100 px-3 py-2">
            <p className="text-zinc-500">Credits</p>
            <p className="text-sm font-semibold text-zinc-900">{s.credits} Credits</p>
          </div>
          <div className="rounded-xl bg-zinc-50 border border-zinc-100 px-3 py-2">
            <p className="text-zinc-500">Course Materials</p>
            <p className="text-sm font-semibold text-zinc-900">{s.notes} files</p>
          </div>
        </div>

        {s.nextUp && (
          <p className="text-xs text-zinc-600 flex items-center gap-1.5 mb-4">
            <CalendarClock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="truncate">{s.nextUp}</span>
          </p>
        )}

        <div className="mt-auto flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenCourse(s.code, 'units');
            }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-white"
            style={{ background: s.color }}
          >
            <FileText className="w-4 h-4" />
            Notes
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('assignments');
            }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
          >
            <Upload className="w-4 h-4" />
            Assignments
          </button>
        </div>
      </div>
    </article>
  );
}

/* Tile for a completed subject from a past semester */
function PastTile({ s, onOpenCourse }) {
  const type = TYPE_STYLE[s.type] || TYPE_STYLE.Theory;
  const TypeIcon = type.icon;
  return (
    <article
      onClick={() => onOpenCourse(s.code, 'intro')}
      className="cursor-pointer bg-white rounded-3xl border border-[#E4E4E7] p-5 flex flex-col hover:border-zinc-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${s.color}14`, color: s.color }}>
          <TypeIcon className="w-[18px] h-[18px]" strokeWidth={1.9} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-zinc-500 flex items-center gap-2">
            {s.code}
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${type.pill}`}>{s.type}</span>
          </p>
        </div>
        <span className={`text-lg font-semibold w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${GRADE_STYLE(s.grade)}`} title="Final grade">
          {s.grade}
        </span>
      </div>
      <h3 className="text-[16px] font-semibold text-zinc-900 leading-snug mb-1">{s.name}</h3>
      <p className="text-sm text-zinc-500 mb-4">
        {s.faculty} · {s.credits} credits
      </p>
      <button
        onClick={(e) => {
              e.stopPropagation();
              onOpenCourse(s.code, 'units');
            }}
        className="mt-auto self-start inline-flex items-center gap-1 text-sm text-[#6D3FC0] hover:text-[#4C2E8A]"
      >
        Open course <ArrowRight className="w-4 h-4" />
      </button>
    </article>
  );
}

export default function SubjectsView({ onNavigate, onOpenCourse }) {
  const [semNo, setSemNo] = useState(CURRENT_SEMESTER);
  const [typeFilter, setTypeFilter] = useState('All');
  const [query, setQuery] = useState('');

  const sem = SEMESTERS.find((x) => x.number === semNo);
  const isCurrent = semNo === CURRENT_SEMESTER;

  const types = useMemo(() => ['All', ...new Set(sem.subjects.map((x) => x.type))], [sem]);
  const shown = sem.subjects.filter(
    (x) =>
      (typeFilter === 'All' || x.type === typeFilter) &&
      (`${x.name} ${x.code} ${x.faculty}`.toLowerCase().includes(query.trim().toLowerCase()))
  );
  const credits = sem.subjects.reduce((n, x) => n + x.credits, 0);
  const avgProgress = isCurrent ? Math.round(sem.subjects.reduce((n, x) => n + (x.progress || 0), 0) / sem.subjects.length) : null;

  return (
    <div>
      {/* Semester switcher */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5 -mx-1 px-1" role="tablist" aria-label="Semester">
        {SEMESTERS.map((x) => {
          const on = x.number === semNo;
          const current = x.number === CURRENT_SEMESTER;
          return (
            <button
              key={x.number}
              role="tab"
              aria-selected={on}
              onClick={() => {
                setSemNo(x.number);
                setTypeFilter('All');
              }}
              className={`shrink-0 text-left px-4 py-2.5 rounded-2xl border transition-colors ${
                on ? 'bg-[#18181B] border-[#18181B] text-white' : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300'
              }`}
            >
              <span className="block text-sm font-semibold">Semester {x.number}</span>
              <span className={`block text-xs ${on ? 'text-zinc-300' : 'text-zinc-500'}`}>
                {current ? 'Current' : `SGPA ${x.sgpa.toFixed(1)}`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Summary + filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
          <span className="text-zinc-500">
            <span className="text-zinc-900 font-semibold">{sem.subjects.length}</span> subjects
          </span>
          <span className="text-zinc-500">
            <span className="text-zinc-900 font-semibold">{credits}</span> credits
          </span>
          {isCurrent ? (
            <span className="text-zinc-500">
              <span className="text-zinc-900 font-semibold">{avgProgress}%</span> of the syllabus covered
            </span>
          ) : (
            <span className="text-zinc-500">
              SGPA <span className="text-zinc-900 font-semibold">{sem.sgpa.toFixed(2)}</span>
            </span>
          )}
          <span className="text-zinc-400">{sem.term}</span>
        </div>

        <div className="lg:ml-auto flex flex-wrap items-center gap-2">
          {types.length > 2 &&
            types.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-full text-sm ${
                  typeFilter === t ? 'bg-[#F1EEFB] text-[#4C2E8A] font-medium' : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                {t === 'All' ? 'All' : `${t}${t === 'Theory' ? '' : 's'}`}
              </button>
            ))}
          <label className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find a subject"
              className="pl-9 pr-3 py-2 w-52 rounded-full border border-zinc-200 bg-white text-sm focus:outline-none focus:border-[#6D3FC0]"
            />
          </label>
        </div>
      </div>

      {/* Tiles */}
      {shown.length === 0 ? (
        <p className="py-16 text-center text-zinc-500">No subjects match “{query}”.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {shown.map((s) =>
            isCurrent ? (
              <CurrentTile key={s.code} s={s} onNavigate={onNavigate} onOpenCourse={onOpenCourse} />
            ) : (
              <PastTile key={s.code} s={s} onOpenCourse={onOpenCourse} />
            )
          )}
        </div>
      )}
    </div>
  );
}
