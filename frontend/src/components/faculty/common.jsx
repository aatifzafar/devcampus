// Helpers shared by the faculty pages.
import React from 'react';
import { ASSIGNMENTS, ALL_TESTS, PAST_ATTEMPTS, QUESTION_BANK } from '../../data/appData';
import { FACULTY_COURSES, FACULTY_CODES, ROSTERS, courseById, scoreFor, noiseFor } from '../../data/facultyData';
import { getStore } from '../../data/store';
import { subjectByCode } from '../../data/materialsData';
import { readSaved, useStoredState } from '../pages/ui';

// Every section this faculty member teaches a subject in.
export const sectionsOf = (code) => FACULTY_COURSES.filter((c) => c.code === code);
export const allSections = (code) => sectionsOf(code).map((c) => c.section);

// Choose which sections receive something. "All sections" toggles every one.
export function SectionPicker({ code, value, onChange }) {
  const list = sectionsOf(code);
  const all = list.length > 1 && list.every((c) => value.includes(c.section));
  const chip = (on) => `px-3.5 py-2 rounded-full border text-sm ${on ? 'border-[#6D3FC0] bg-[#F7F5FD] text-[#4C2E8A] font-medium' : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'}`;
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {list.length > 1 && (
          <button type="button" onClick={() => onChange(all ? [] : list.map((c) => c.section))} className={chip(all)}>All sections</button>
        )}
        {list.map((c) => {
          const on = value.includes(c.section);
          return (
            <button type="button" key={c.id} onClick={() => onChange(on ? value.filter((s) => s !== c.section) : [...value, c.section])} className={chip(on && !all)}>
              {on && !all ? '✓ ' : ''}Section {c.section} · {ROSTERS[c.id].length}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-zinc-500 mt-1.5">
        {value.length === 0 ? 'No section chosen yet.' : `Goes to ${value.length === list.length && list.length > 1 ? 'all sections' : `section${value.length > 1 ? 's' : ''} ${[...value].sort().join(', ')}`} · ${list.filter((c) => value.includes(c.section)).reduce((n, c) => n + ROSTERS[c.id].length, 0)} students`}
      </p>
    </div>
  );
}

// Small badge row showing who an item was sent to.
export function SectionTags({ code, sections }) {
  const list = sectionsOf(code);
  const s = sections && sections.length ? sections : list.map((c) => c.section);
  if (list.length > 1 && list.every((c) => s.includes(c.section))) return <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">All sections</span>;
  return <span className="inline-flex gap-1">{[...s].sort().map((x) => <span key={x} className="text-[11px] px-2 py-0.5 rounded-full bg-[#F1EEFB] text-[#4C2E8A] font-medium">{x}</span>)}</span>;
}

export const useCourse = () => useStoredState('alliance-f-course', FACULTY_COURSES[0].id);

export function CourseChips({ value, onChange, all = false }) {
  const opts = [...(all ? [{ id: 'all', label: 'All courses' }] : []), ...FACULTY_COURSES.map((c) => ({ id: c.id, label: `${c.name} · ${c.section}`, color: c.color }))];
  return (
    <div className="flex flex-wrap gap-1.5">
      {opts.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm border transition-colors ${value === o.id ? 'bg-[#18181B] border-[#18181B] text-white' : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300'}`}
        >
          {o.color && <span className="w-2 h-2 rounded-full" style={{ background: o.color }} />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

// Pick a subject (each subject may have several sections).
export function SubjectChips({ value, onChange, allOption = false }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {allOption && (
        <button type="button" onClick={() => onChange('all')} className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-sm ${value === 'all' ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 text-zinc-700 hover:border-zinc-300'}`}>
          All my classes<span className={value === 'all' ? 'text-white/60' : 'text-zinc-400'}>{FACULTY_COURSES.length} sections</span>
        </button>
      )}
      {FACULTY_CODES.map((code) => {
        const c = sectionsOf(code)[0];
        const on = value === code;
        return (
          <button type="button" key={code} onClick={() => onChange(code)} className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-sm ${on ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 text-zinc-700 hover:border-zinc-300'}`}>
            <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />{c.name}<span className={on ? 'text-white/60' : 'text-zinc-400'}>{sectionsOf(code).length} sections</span>
          </button>
        );
      })}
    </div>
  );
}

// Saved per-user data (kept for older call sites).
export const readLocal = (key, fallback) => readSaved(key, fallback);

// Does this roster student have a real account (and so real activity)?
export const hasAccount = (st, store = getStore()) => Boolean(st.demo) || (store.accounts || []).includes(st.roll);

const subjOf = (code) => subjectByCode(code) || { name: code, color: '#71717A' };

/* ------------------------------------------------------------------ */
/* Assignments                                                         */
/* ------------------------------------------------------------------ */

// Every assignment this faculty member owns: sample ones plus ones she created.
export function facultyAssignments(store = getStore()) {
  const sample = ASSIGNMENTS.filter((a) => FACULTY_CODES.includes(a.code)).map((a) => ({
    id: a.id,
    code: a.code,
    sections: allSections(a.code),
    title: a.title,
    type: a.type,
    details: a.details,
    due: new Date(a.due),
    marks: a.marks,
    sample: true,
    gradedSample: a.status === 'graded',
  }));
  const mine = store.assignments.map((a) => ({ ...a, due: new Date(a.due), createdAt: new Date(a.createdAt) }));
  return [...mine, ...sample].sort((a, b) => b.due - a.due);
}

// Submission status of every student in a course for one assignment.
export function submissionsFor(a, courseId, store = getStore()) {
  const roster = ROSTERS[courseId] || [];
  const real = store.submissions?.[a.id] || {};
  const overdue = a.due < new Date();
  const created = a.createdAt ? new Date(a.createdAt) : null;
  const fresh = created && Date.now() - created.getTime() < 3600000;
  const sampleName = (st) => `${st.name.split(' ')[0].toLowerCase()}_${a.id}.pdf`;
  return roster.map((st) => {
    const account = hasAccount(st, store);
    // Saved in the database: a real submission, or marks the faculty gave.
    const saved = real[st.roll];
    if (saved) {
      const at = saved.submittedAt ? new Date(saved.submittedAt) : null;
      const fileName = saved.fileName || (account ? null : sampleName(st));
      if (saved.status === 'graded') return { st, status: 'graded', score: saved.score, feedback: saved.feedback || '', fileName, fileId: saved.fileId, at, late: at ? at > a.due : false };
      return { st, status: 'submitted', fileName, fileId: saved.fileId, at, late: at ? at > a.due : false };
    }
    if (account) {
      // Students with accounts: only their real activity (plus the built-in sample history).
      const sampleRow = ASSIGNMENTS.find((x) => x.id === a.id) || {};
      if (sampleRow.status === 'graded') return { st, status: 'graded', score: sampleRow.score, feedback: sampleRow.feedback, fileName: sampleRow.fileName || 'submission.pdf' };
      if (sampleRow.status === 'submitted') return { st, status: 'submitted', fileName: sampleRow.fileName || 'submission.pdf', at: sampleRow.submittedAt ? new Date(sampleRow.submittedAt) : null };
      return { st, status: overdue ? 'missing' : 'pending' };
    }
    // Sample classmates: simulated activity so the class looks realistic.
    const r = scoreFor(st, `sub-${a.id}`);
    const submitted = !fresh && (overdue ? r > 0.22 : r > 0.55);
    if (!submitted) return { st, status: overdue ? 'missing' : 'pending' };
    const late = overdue && !st.submitsOnTime;
    if (a.gradedSample) return { st, status: 'graded', score: Math.round(scoreFor(st, a.id) * a.marks), feedback: '', fileName: sampleName(st), late };
    return { st, status: 'submitted', fileName: sampleName(st), late, at: new Date(a.due.getTime() - (late ? -3600000 * 5 : 3600000 * (2 + r * 40))) };
  });
}

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */

export function facultyTests(store = getStore()) {
  const sample = ALL_TESTS.filter((t) => FACULTY_CODES.includes(t.code)).map((t) => {
    const o = store.testOverrides?.[t.id];
    return { ...t, start: o ? new Date(o.start) : t.start, sections: allSections(t.code), customQuestions: (QUESTION_BANK[t.bank] || []).slice(0, t.questions), sample: true };
  });
  const past = PAST_ATTEMPTS.filter((p) => FACULTY_CODES.includes(p.code)).map((p) => ({
    id: p.id,
    title: p.title,
    code: p.code,
    start: p.date,
    minutes: p.minutes,
    marks: p.answers.length,
    proctored: false,
    sections: allSections(p.code),
    customQuestions: (QUESTION_BANK[p.bank] || []).slice(0, p.answers.length),
    syllabus: '',
    sample: true,
    past: true,
  }));
  const mine = store.tests.map((t) => ({ ...t, start: new Date(t.start), subject: { code: t.code, ...subjOf(t.code) } }));
  return [...mine, ...sample, ...past].sort((a, b) => b.start - a.start);
}

export const testState = (t) => {
  const end = new Date(t.start.getTime() + t.minutes * 60000);
  if (t.start > new Date()) return 'scheduled';
  if (end > new Date()) return 'live';
  return 'completed';
};

// Each student's answers for a test: real attempts from the database, simulated ones for sample classmates.
export function attemptsFor(t, courseId, store = getStore()) {
  const roster = ROSTERS[courseId] || [];
  const qs = t.customQuestions || [];
  const real = store.attempts?.[t.id] || {};
  const past = PAST_ATTEMPTS.find((p) => p.id === t.id);
  const state = testState(t);
  return roster.map((st) => {
    const a = real[st.roll];
    if (a) return { st, answers: (a.answers || []).map((x) => (x === null ? -1 : x)), warnings: a.warnings || 0, submitted: Boolean(a.submittedAt), started: true };
    if (hasAccount(st, store)) {
      if (past) return { st, answers: past.answers, warnings: 0, submitted: true, started: true };
      return { st, answers: [], warnings: 0, submitted: false, started: false };
    }
    if (state === 'scheduled') return { st, answers: [], warnings: 0, submitted: false, started: false };
    const ability = 0.2 + scoreFor(st, `test-${t.id}`) * 0.65;
    const answers = qs.map((q, i) => (noiseFor(st, `${t.id}-${i}`) < ability ? q.answer : (q.answer + 1) % q.options.length));
    const progress = state === 'live' ? Math.min(qs.length, Math.floor(qs.length * (0.2 + ability * 0.8))) : qs.length;
    return {
      st,
      answers: answers.slice(0, progress),
      warnings: noiseFor(st, `warn-${t.id}`) > 0.85 ? 1 + Math.floor(noiseFor(st, `w2-${t.id}`) * 3) : 0,
      submitted: state === 'completed' || progress === qs.length,
      started: state !== 'live' || scoreFor(st, `start-${t.id}`) > 0.08,
    };
  });
}

export const percentOf = (t, ans) => {
  const qs = t.customQuestions || [];
  if (!qs.length) return 0;
  return Math.round((ans.filter((a, i) => qs[i] && a === qs[i].answer).length / qs.length) * 100);
};

export const courseLabel = (id) => {
  const c = courseById(id);
  return c ? `${c.name} · ${c.section}` : id;
};
export const coursesForCode = (code) => FACULTY_COURSES.filter((c) => c.code === code);
