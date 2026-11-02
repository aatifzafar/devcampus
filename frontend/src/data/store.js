// Shared store: everything faculty create or change, read by the student portal.
//
// The data lives in PostgreSQL. This module keeps a copy for the signed-in
// user (GET /api/store), applies changes immediately so the page feels instant,
// sends them to the backend, and refreshes whenever the server says something
// changed (live updates over /api/stream).
import { useEffect, useState } from 'react';
import { subjectByCode } from './materialsData';
import { SYNC_ERROR, apiFetch, getUser, onServerEvent } from '../utils/session';

const EVENT = 'alliance-store-change';

const EMPTY = {
  assignments: [], // { id, code, sections, title, type, details, due, marks, createdAt }
  tests: [], // { id, code, sections, title, syllabus, start, minutes, marks, proctored, showScore, customQuestions, createdAt }
  testOverrides: {}, // { [testId]: { start } } for sample tests opened early
  qbank: [], // extra questions { id, code, text, options, answer, explain, topic }
  materials: [], // { id, code, sections, unit, type, title, meta, note, url, fileId, fileName, sharedAt }
  announcements: [], // { id, code, sections, title, text, at }
  pyqs: [], // { id, code, sections, year, exam, examId, fileId, fileName, uploadedAt }
  attendance: [],
  grades: {},
  published: {}, // { [testId]: true } results released
  submissions: {}, // { [assignmentId]: { [roll]: { status, fileId, fileName, submittedAt, score, feedback } } }
  attempts: {}, // { [testId]: { [roll]: { answers, warnings, startedAt, submittedAt } } }
  accounts: [], // roll numbers of students who have an account (faculty only)
  live: null, // { courseId, code, section, sections, startedAt, poll: { q, options, answer, launchedAt } | null, votes: { [roll]: index } }
};

let cache = { ...EMPTY };
const emit = () => window.dispatchEvent(new Event(EVENT));

export function getStore() {
  return cache;
}

export async function loadStore() {
  cache = { ...EMPTY, ...(await apiFetch('/store')) };
  emit();
  return cache;
}

export function resetStore() {
  cache = { ...EMPTY };
  emit();
}

// Refresh when the server announces a change (debounced).
let refreshTimer = null;
const scheduleRefresh = (ms = 250) => {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => { if (!pending) loadStore().catch(() => {}); else scheduleRefresh(400); }, ms);
};
onServerEvent((msg) => { if (msg.kind === 'store') scheduleRefresh(); });

/* Sending changes ------------------------------------------------------- */

const COLLECTIONS = ['assignments', 'tests', 'qbank', 'materials', 'announcements', 'pyqs'];
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const plain = (x) => JSON.parse(JSON.stringify(x)); // Dates -> ISO strings

// Work out which API calls turn prev into next.
function diff(prev, next) {
  const calls = [];
  for (const col of COLLECTIONS) {
    const before = new Map((prev[col] || []).map((x) => [x.id, x]));
    const after = new Map((next[col] || []).map((x) => [x.id, x]));
    for (const [id, item] of after) {
      if (!before.has(id)) calls.push(['POST', `/store/${col}`, plain(item)]);
      else if (!same(before.get(id), item)) calls.push(['PUT', `/store/${col}/${encodeURIComponent(id)}`, plain(item)]);
    }
    for (const id of before.keys()) if (!after.has(id)) calls.push(['DELETE', `/store/${col}/${encodeURIComponent(id)}`]);
  }
  for (const [id, o] of Object.entries(next.testOverrides || {})) {
    if (!same(prev.testOverrides?.[id], o)) calls.push(['PUT', `/store/testOverrides/${encodeURIComponent(id)}`, plain(o)]);
  }
  for (const id of Object.keys(next.published || {})) {
    if (!prev.published?.[id]) calls.push(['PUT', `/store/published/${encodeURIComponent(id)}`, {}]);
  }
  // Marks and feedback (faculty grading).
  const gradeCalls = (nextMap = {}, prevMap = {}) => {
    for (const [aid, byRoll] of Object.entries(nextMap)) {
      for (const [roll, g] of Object.entries(byRoll || {})) {
        const old = prevMap[aid]?.[roll];
        if (g?.score !== undefined && (!old || old.score !== g.score || old.feedback !== g.feedback || old.status !== g.status)) {
          calls.push(['PUT', `/store/grades/${encodeURIComponent(aid)}/${encodeURIComponent(roll)}`, plain({ score: g.score, feedback: g.feedback || '', fileName: g.fileName, submittedAt: g.submittedAt })]);
        }
      }
    }
  };
  gradeCalls(next.submissions, prev.submissions);
  gradeCalls(next.grades, prev.grades);
  // Live class.
  const a = prev.live;
  const b = next.live;
  if (!a && b) {
    calls.push(['POST', '/store/live/start', plain({ courseId: b.courseId, code: b.code, sections: b.sections || [b.section] })]);
    if (b.poll) calls.push(['POST', '/store/live/poll', plain({ poll: b.poll })]);
  } else if (a && !b) {
    calls.push(['POST', '/store/live/end', {}]);
  } else if (a && b) {
    if (a.startedAt !== b.startedAt || !same(a.sections, b.sections)) calls.push(['POST', '/store/live/start', plain({ courseId: b.courseId, code: b.code, sections: b.sections || [b.section] })]);
    if (!same(a.poll, b.poll)) calls.push(['POST', '/store/live/poll', plain({ poll: b.poll })]);
    const me = getUser();
    if (me?.role === 'student' && b.votes?.[me.rollNo] !== undefined && a.votes?.[me.rollNo] === undefined) {
      calls.push(['POST', '/store/live/vote', { choice: b.votes[me.rollNo] }]);
    }
    if (b.demoJoined && !a.demoJoined && me?.role === 'student') calls.push(['POST', '/store/live/join', {}]);
  }
  return calls;
}

// Requests run one after another so they reach the server in order.
let queue = Promise.resolve();
let pending = 0;
function send(calls) {
  if (!calls.length) return;
  pending += 1;
  queue = queue
    .then(async () => {
      for (const [method, path, body] of calls) await apiFetch(path, { method, body });
    })
    .catch((err) => window.dispatchEvent(new CustomEvent(SYNC_ERROR, { detail: err.message })))
    .finally(() => {
      pending -= 1;
      if (!pending) loadStore().catch(() => {});
    });
}

export function updateStore(fn) {
  const prev = cache;
  const next = { ...EMPTY, ...fn(prev) };
  cache = next;
  emit();
  send(diff(prev, next));
  return next;
}

// React hook: re-renders whenever the store changes.
export function useStore() {
  const [store, setStore] = useState(getStore);
  useEffect(() => {
    const refresh = () => setStore(getStore());
    window.addEventListener(EVENT, refresh);
    refresh();
    return () => window.removeEventListener(EVENT, refresh);
  }, []);
  return [store, updateStore];
}

export const uid = (p) => `${p}${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`;

/* ------------------------------------------------------------------ */
/* Read helpers for the student portal                                 */
/* ------------------------------------------------------------------ */

// The signed-in student (set at sign-in). Defaults are the demo student.
export let STUDENT_SECTION = '5J';
export let STUDENT_ROLL = '2411021061234';
export const DEMO_ROLL = '2411021061234';
export function setCurrentStudent(user) {
  if (user?.role === 'student') {
    STUDENT_SECTION = user.section || STUDENT_SECTION;
    STUDENT_ROLL = user.rollNo || STUDENT_ROLL;
  }
}
const forStudent = (x) => !x.sections || x.sections.length === 0 || x.sections.includes(STUDENT_SECTION);

const subj = (code) => {
  const s = subjectByCode(code) || {};
  return { code, name: s.name || code, color: s.color || '#71717A', faculty: s.faculty };
};

// Shaped like homeData SUBMISSIONS.
export const storeSubmissions = () =>
  getStore()
    .assignments.filter(forStudent)
    .map((a) => ({ id: a.id, title: a.title, type: a.type, subject: subj(a.code), due: new Date(a.due), teacher: 'Demo Teacher', marks: a.marks, details: a.details, fromFaculty: true }));

// Shaped like appData ALL_TESTS.
export const storeTests = () =>
  getStore()
    .tests.filter(forStudent)
    .map((t) => ({
      id: t.id,
      title: t.title,
      subject: subj(t.code),
      code: t.code,
      start: new Date(t.start),
      minutes: t.minutes,
      proctored: t.proctored,
      questions: t.customQuestions.length,
      marks: t.marks,
      syllabus: t.syllabus,
      customQuestions: t.customQuestions,
      showScore: t.showScore,
      fromFaculty: true,
    }));

export const testStartOverride = (id) => {
  const o = getStore().testOverrides[id];
  return o ? new Date(o.start) : null;
};

export const storeMaterials = (code, all = false) =>
  getStore()
    .materials.filter((m) => m.code === code && (all || forStudent(m)))
    .map((m) => ({ ...m, sharedAt: new Date(m.sharedAt), faculty: subj(code).faculty || 'Demo Teacher' }));

export const storeAnnouncements = () =>
  getStore()
    .announcements.filter(forStudent)
    .map((a) => ({ ...a, at: new Date(a.at) }));

export const storeAttendance = () => ({ total: 0, attended: 0 });

export const storePYQs = () => getStore().pyqs.filter(forStudent);

// The live class the demo student should see, if their section is in it.
export const liveForStudent = (live) => (live && (live.sections || [live.section]).includes(STUDENT_SECTION) ? live : null);
