import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight, BookOpen, CircleCheck, ClipboardCheck, FileText, Megaphone, MessageSquare, Paperclip, Radio,
  Trash2, TriangleAlert, Upload, UserCheck, Users, Video, X, LogOut, Repeat,
} from 'lucide-react';
import { FACULTY, FACULTY_CODES, FACULTY_COURSES, ROSTERS, courseById, todaysClasses } from '../../data/facultyData';
import { materialsFor, subjectByCode } from '../../data/materialsData';
import { THREADS } from '../../data/appData';
import { useStore, uid } from '../../data/store';
import { deleteFile, fmtSize, saveFile } from '../../utils/files';
import ChangePassword from '../ChangePassword';
import { Button, Card, CardTitle, Empty, Field, Pill, ago, fmtDate, fmtTime, fromNow, inputClass, useStoredState } from '../pages/ui';
import { CourseChips, SectionPicker, SectionTags, SubjectChips, allSections, facultyAssignments, facultyTests, submissionsFor, testState, useCourse } from './common';

/* ================================================================== */
/* Faculty home                                                        */
/* ================================================================== */

export function FacultyHome({ onNavigate }) {
  const [store] = useStore();
  const [, setCourse] = useCourse();
  const [threads] = useStoredState('alliance-threads', THREADS);
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const classes = todaysClasses();
  const assignments = facultyAssignments(store);
  const toGrade = assignments.flatMap((a) =>
    FACULTY_COURSES.filter((c) => c.code === a.code && a.sections.includes(c.section)).map((c) => ({ a, c, n: submissionsFor(a, c.id, store).filter((s) => s.status === 'submitted').length }))
  ).filter((x) => x.n > 0);
  const gradeTotal = toGrade.reduce((n, x) => n + x.n, 0);
  const tests = facultyTests(store);
  const liveTests = tests.filter((t) => testState(t) === 'live');
  const upcomingTests = tests.filter((t) => testState(t) === 'scheduled').sort((a, b) => a.start - b.start);
  const doubts = threads.filter((t) => ['CSE303', 'CSE201'].includes(t.code) && !t.replies.some((r) => r.role === 'faculty'));
  const atRisk = FACULTY_COURSES.flatMap((c) => ROSTERS[c.id].filter((s) => s.strength < 0.52).map((s) => ({ s, c })));

  const actions = [
    [Upload, 'Upload notes', 'f-materials'],
    [FileText, 'New assignment', 'f-assign'],
    [ClipboardCheck, 'Create test', 'f-tests'],
    [Megaphone, 'Announce', 'f-announce'],
    [Users, 'Student roster', 'f-students'],
    [Video, 'Start live class', 'f-classes'],
  ];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-zinc-500 mb-1">{now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        <h1 className="text-3xl font-semibold text-zinc-900 tracking-tight">{greeting}, {FACULTY.fullName}</h1>
        <p className="text-zinc-600 mt-1">
          {[classes.length && `${classes.length} class${classes.length > 1 ? 'es' : ''} today`, gradeTotal && `${gradeTotal} submissions to grade`, doubts.length && `${doubts.length} unanswered doubt${doubts.length > 1 ? 's' : ''}`].filter(Boolean).join(' · ') || 'Nothing urgent today.'}
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {actions.map(([Icon, label, go]) => (
          <button key={label} onClick={() => onNavigate(go)} className="flex flex-col items-center gap-2 bg-white rounded-2xl border border-[#E4E4E7] px-2 py-4 hover:border-[#6D3FC0] hover:bg-[#F7F5FD] transition-colors">
            <span className="w-10 h-10 rounded-xl bg-[#F1EEFB] text-[#6D3FC0] flex items-center justify-center"><Icon className="w-5 h-5" /></span>
            <span className="text-xs font-medium text-zinc-800 text-center">{label}</span>
          </button>
        ))}
      </div>

      {store.live && (
        <Card className="!border-emerald-300 flex items-center gap-4">
          <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Radio className="w-5 h-5" /></span>
          <div className="flex-1">
            <p className="font-semibold text-zinc-900">Live class in progress · {courseById(store.live.courseId)?.name} {(store.live.sections || [store.live.section]).join(' + ')}</p>
            <p className="text-sm text-zinc-500">Started {ago(new Date(store.live.startedAt))}</p>
          </div>
          <Button variant="primary" onClick={() => onNavigate('f-classes')}>Open class</Button>
        </Card>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        <Card className="xl:col-span-2">
          <CardTitle>Today’s classes</CardTitle>
          {classes.length === 0 ? <Empty title="No classes today" /> : (
            <ul className="divide-y divide-zinc-100">
              {classes.map((cl, i) => {
                const c = courseById(cl.courseId);
                const live = cl.start <= now && cl.end > now;
                const over = cl.end <= now;
                return (
                  <li key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="w-16 shrink-0"><p className="text-sm font-semibold text-zinc-900">{fmtTime(cl.start)}</p><p className="text-xs text-zinc-500">{cl.room}</p></div>
                    <span className="w-1.5 self-stretch rounded-full" style={{ background: c.color }} />
                    <div className="flex-1 min-w-0"><p className="font-medium text-zinc-900">{c.name}</p><p className="text-xs text-zinc-500">Section {c.section} · {ROSTERS[c.id].length} students</p></div>
                    {live && <Pill tone="green">Now</Pill>}
                    {!live && !over && <Pill tone="violet">{fromNow(cl.start)}</Pill>}
                    <Button variant="primary" onClick={() => { setCourse(c.id); onNavigate('f-classes'); }}><Video className="w-4 h-4" />Go live</Button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="flex flex-col">
          <CardTitle>To grade</CardTitle>
          <p className="text-4xl font-semibold text-zinc-900">{gradeTotal}</p>
          <p className="text-sm text-zinc-500 mb-4">submissions waiting</p>
          <ul className="space-y-2 mb-4">
            {toGrade.slice(0, 3).map(({ a, c, n }) => (
              <li key={a.id + c.id} className="flex items-center gap-2 text-sm">
                <span className="truncate flex-1 text-zinc-800">{a.title}</span>
                <span className="text-xs text-zinc-500 shrink-0">{c.section}</span>
                <Pill tone="orange">{n}</Pill>
              </li>
            ))}
          </ul>
          <Button variant="primary" className="mt-auto" onClick={() => onNavigate('f-grading')} disabled={!gradeTotal}>Start grading</Button>
        </Card>

        <Card>
          <CardTitle action={<Button variant="ghost" className="!px-3 !py-1.5" onClick={() => onNavigate('f-tests')}>All tests <ArrowRight className="w-4 h-4" /></Button>}>Tests</CardTitle>
          {liveTests.map((t) => (
            <div key={t.id} className="flex items-center gap-2 rounded-2xl bg-red-50 px-3 py-2.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-medium text-red-800 flex-1 truncate">{t.title} is live</span>
              <button onClick={() => onNavigate('f-monitor')} className="text-sm text-red-700 underline">Monitor</button>
            </div>
          ))}
          <ul className="space-y-2.5">
            {upcomingTests.slice(0, 3).map((t) => (
              <li key={t.id} className="text-sm"><p className="font-medium text-zinc-900">{t.title}</p><p className="text-xs text-zinc-500">{subjectByCode(t.code)?.name} · {fmtDate(t.start)}, {fmtTime(t.start)}</p></li>
            ))}
            {!liveTests.length && !upcomingTests.length && <p className="text-sm text-zinc-500">No tests scheduled.</p>}
          </ul>
        </Card>

        <Card>
          <CardTitle action={<Button variant="ghost" className="!px-3 !py-1.5" onClick={() => onNavigate('f-doubts')}>Answer <ArrowRight className="w-4 h-4" /></Button>}>Student doubts</CardTitle>
          {doubts.length === 0 ? <p className="text-sm text-zinc-500 flex items-center gap-2"><CircleCheck className="w-4 h-4 text-emerald-500" />All doubts answered.</p> : (
            <ul className="space-y-3">
              {doubts.slice(0, 3).map((t) => (
                <li key={t.id} className="flex gap-2.5 text-sm"><MessageSquare className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" /><div><p className="text-zinc-900">{t.title}</p><p className="text-xs text-zinc-500">{t.author} · {ago(new Date(t.at))}</p></div></li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardTitle action={<Button variant="ghost" className="!px-3 !py-1.5" onClick={() => onNavigate('f-students')}>Students <ArrowRight className="w-4 h-4" /></Button>}>Needs attention</CardTitle>
          <ul className="space-y-2.5">
            {atRisk.slice(0, 4).map(({ s, c }) => (
              <li key={s.roll} className="flex items-center gap-2 text-sm">
                <TriangleAlert className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="flex-1 truncate text-zinc-800">{s.name} <span className="text-zinc-400">· {c.section}</span></span>
                <span className="text-xs text-zinc-500">Low scores</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-zinc-500 mt-3">{atRisk.length} students across your courses</p>
        </Card>
      </div>
    </div>
  );
}

/* ================================================================== */
/* My courses                                                          */
/* ================================================================== */

export function FCourses({ onNavigate }) {
  const [store] = useStore();
  const [, setCourse] = useCourse();
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
      {FACULTY_COURSES.map((c) => {
        const roster = ROSTERS[c.id];
        const subj = subjectByCode(c.code) || {};
        const pending = facultyAssignments(store).filter((a) => a.code === c.code && a.sections.includes(c.section)).reduce((n, a) => n + submissionsFor(a, c.id, store).filter((s) => s.status === 'submitted').length, 0);
        const progress = subj.progress ?? 64;
        const go = (tab) => { setCourse(c.id); onNavigate(tab); };
        return (
          <Card key={c.id} className="!p-0 overflow-hidden flex flex-col">
            <div className="h-1.5" style={{ background: c.color }} />
            <div className="p-5 flex flex-col flex-1">
              <p className="text-xs text-zinc-500">{c.code} · Semester {c.semester}</p>
              <h3 className="text-lg font-semibold text-zinc-900">{c.name}</h3>
              <p className="text-sm text-zinc-500 mb-4">Section {c.section} · {roster.length} students</p>
              <div className="flex justify-between text-xs mb-1"><span className="text-zinc-500">Syllabus covered</span><span className="font-medium text-zinc-800">{progress}%</span></div>
              <div className="h-2 rounded-full bg-zinc-100 overflow-hidden mb-4"><div className="h-full rounded-full" style={{ width: `${progress}%`, background: c.color }} /></div>
              <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                <div className="rounded-xl bg-zinc-50 px-3 py-2"><p className="text-zinc-500">Students</p><p className="text-sm font-semibold text-zinc-900">{roster.length}</p></div>
                <div className="rounded-xl bg-zinc-50 px-3 py-2"><p className="text-zinc-500">To grade</p><p className={`text-sm font-semibold ${pending ? 'text-orange-600' : 'text-zinc-900'}`}>{pending}</p></div>
              </div>
              <div className="mt-auto grid grid-cols-2 gap-2">
                <Button className="!px-2" onClick={() => go('f-materials')}><BookOpen className="w-4 h-4" />Notes</Button>
                <Button className="!px-2" onClick={() => go('f-students')}><Users className="w-4 h-4" />Students</Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/* ================================================================== */
/* Course materials                                                    */
/* ================================================================== */

const MAT_TYPES = [['notes', 'Notes (PDF)'], ['slides', 'Slides'], ['video', 'Video'], ['questions', 'Question bank'], ['link', 'Link'], ['code', 'Code']];

export function FMaterials() {
  const [store, update] = useStore();
  const [courseId, setCourseId] = useCourse();
  const course = courseById(courseId) || FACULTY_COURSES[0];
  const units = useMemo(() => materialsFor(course.code, { forFaculty: true }), [course.code, store.materials]); // eslint-disable-line react-hooks/exhaustive-deps
  const [unit, setUnit] = useState(1);
  const [sections, setSections] = useState(() => allSections(course.code));
  useEffect(() => setSections(allSections(course.code)), [course.code]);
  const [type, setType] = useState('notes');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const input = useRef(null);

  const [uploading, setUploading] = useState(false);
  const publish = async () => {
    if (!title.trim()) return setError('Give the material a title');
    if (type !== 'link' && !file) return setError('Choose a file to upload');
    const href = url.trim() && !/^https?:\/\//i.test(url.trim()) ? `https://${url.trim()}` : url.trim();
    if (type === 'link' && !/^https?:\/\/[^\s.]+\.[^\s]+/i.test(href)) return setError('Paste the web address, for example https://nptel.ac.in/...');
    if (!sections.length) return setError('Choose at least one section');
    const id = uid('m');
    const meta = file ? `${fmtSize(file.size)} · ${file.name.split('.').pop().toUpperCase()}` : 'External link';
    // Upload the file first, so students can open and download it.
    if (file) {
      setUploading(true);
      try {
        await saveFile(`file-${id}`, file);
      } catch (err) {
        setUploading(false);
        return setError(`Upload failed: ${err.message}`);
      }
      setUploading(false);
    }
    update((s) => ({ ...s, materials: [...s.materials, { id, code: course.code, sections: [...sections].sort(), unit: Number(unit), type, title: title.trim(), meta, note: note.trim() || null, sharedAt: new Date().toISOString(), fileName: file?.name || null, fileId: file ? `file-${id}` : null, url: type === 'link' ? href : null }] }));
    setUrl('');
    setDone(`“${title.trim()}” is now visible to ${sections.length === allSections(course.code).length ? 'all sections' : `section${sections.length > 1 ? 's' : ''} ${[...sections].sort().join(', ')}`} in Unit ${unit}.`);
    setTitle(''); setNote(''); setFile(null); setError('');
    setTimeout(() => setDone(''), 3500);
  };

  return (
    <div className="space-y-5">
      <SubjectChips value={course.code} onChange={(code) => setCourseId(FACULTY_COURSES.find((c) => c.code === code).id)} />
      <div className="grid xl:grid-cols-[380px_1fr] gap-5 items-start">
        <Card className="xl:sticky xl:top-4">
          <CardTitle hint="Students see it instantly under My subjects → Notes">Share new material</CardTitle>
          <Field group label="Share with"><SectionPicker code={course.code} value={sections} onChange={(v) => { setSections(v); setError(''); }} /></Field>
          <Field label="Unit">
            <select value={unit} onChange={(e) => setUnit(e.target.value)} className={inputClass}>
              {units.map((u) => <option key={u.unit} value={u.unit}>Unit {u.unit}: {u.title}</option>)}
            </select>
          </Field>
          <Field group label="Type">
            <div className="flex flex-wrap gap-1.5">
              {MAT_TYPES.map(([id, label]) => <button key={id} onClick={() => setType(id)} className={`px-3 py-1.5 rounded-full border text-sm ${type === id ? 'border-[#6D3FC0] bg-[#F7F5FD] text-[#4C2E8A] font-medium' : 'border-zinc-200 text-zinc-600'}`}>{label}</button>)}
            </div>
          </Field>
          <Field label="Title"><input value={title} onChange={(e) => { setTitle(e.target.value); setError(''); }} className={inputClass} placeholder="Unit 3 lecture notes: PDA" /></Field>
          {type === 'link' && (
            <Field label="Web address"><input value={url} onChange={(e) => { setUrl(e.target.value); setError(''); }} className={inputClass} placeholder="https://nptel.ac.in/courses/..." /></Field>
          )}
          {type !== 'link' && (
            <Field label="File">
              <input ref={input} type="file" className="hidden" onChange={(e) => { setFile(e.target.files[0] || null); setError(''); }} />
              {file ? (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-zinc-200 text-sm"><FileText className="w-4 h-4 text-[#6D3FC0]" /><span className="truncate flex-1">{file.name}</span><button onClick={() => setFile(null)} aria-label="Remove file"><X className="w-4 h-4 text-zinc-400" /></button></div>
              ) : (
                <button onClick={() => input.current?.click()} className="w-full flex items-center justify-center gap-2 px-4 py-5 rounded-2xl border-2 border-dashed border-zinc-200 hover:border-[#6D3FC0] text-sm text-zinc-600"><Paperclip className="w-4 h-4" />Choose a file</button>
              )}
            </Field>
          )}
          <Field label="Note for students (optional)"><input value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} placeholder="Read before Monday’s class." /></Field>
          <Button variant="primary" className="w-full" disabled={uploading} onClick={publish}><Upload className="w-4 h-4" />{uploading ? 'Uploading…' : 'Share with students'}</Button>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          {done && <p className="text-sm text-emerald-700 mt-2 flex items-center gap-1.5"><CircleCheck className="w-4 h-4" />{done}</p>}
        </Card>

        <div className="space-y-3">
          {units.map((u) => (
            <Card key={u.unit} className="!p-0 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-zinc-100">
                <span className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 text-sm font-semibold flex items-center justify-center">{u.unit}</span>
                <p className="font-semibold text-zinc-900 flex-1">{u.title}</p>
                <span className="text-xs text-zinc-500">{u.items.length} shared</span>
              </div>
              {u.items.length === 0 ? <p className="px-5 py-4 text-sm text-zinc-400">Nothing shared yet.</p> : (
                <ul className="divide-y divide-zinc-100">
                  {u.items.map((m) => (
                    <li key={m.id} className="flex items-center gap-3 px-5 py-2.5">
                      <FileText className="w-4 h-4 text-zinc-400 shrink-0" />
                      <div className="min-w-0 flex-1"><p className="text-sm text-zinc-900 truncate">{m.title}</p><p className="text-xs text-zinc-500 flex items-center gap-1.5 flex-wrap">{m.meta} · {fmtDate(m.sharedAt)}{m.fromFaculty && <SectionTags code={course.code} sections={m.sections} />}</p></div>
                      {m.fromFaculty && <Pill tone="green">New</Pill>}
                      {m.fromFaculty && (
                        <button onClick={() => { deleteFile(`file-${m.id}`); update((s) => ({ ...s, materials: s.materials.filter((x) => x.id !== m.id) })); }} className="text-zinc-300 hover:text-red-500" aria-label="Remove"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/* Announcements                                                       */
/* ================================================================== */

export function FAnnouncements() {
  const [store, update] = useStore();
  const [code, setCode] = useState(FACULTY_CODES[0]);
  const [sections, setSections] = useState(() => allSections(FACULTY_CODES[0]));
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const post = () => {
    if (code !== 'all' && !sections.length) return setError('Choose at least one section');
    if (!title.trim()) return setError('Add a title');
    // "All my classes": one announcement per subject, to every section.
    const targets = code === 'all' ? FACULTY_CODES.map((c) => [c, allSections(c)]) : [[code, [...sections].sort()]];
    const at = new Date().toISOString();
    update((s) => ({ ...s, announcements: [...targets.map(([c, secs]) => ({ id: uid('n'), code: c, sections: secs, title: title.trim(), text: text.trim(), at })), ...s.announcements] }));
    setTitle(''); setText(''); setError('');
  };

  return (
    <div className="grid lg:grid-cols-[400px_1fr] gap-5 items-start">
      <Card>
        <CardTitle hint="Appears on students’ Home under “New from faculty”">New announcement</CardTitle>
        <Field group label="Subject"><SubjectChips allOption value={code} onChange={(c) => { setCode(c); setSections(c === 'all' ? [] : allSections(c)); setError(''); }} /></Field>
        {code === 'all' ? (
          <p className="text-sm text-zinc-600 -mt-2 mb-4">Goes to every class you teach: {FACULTY_COURSES.map((c) => `${c.name} ${c.section}`).join(', ')} · {FACULTY_COURSES.reduce((n, c) => n + ROSTERS[c.id].length, 0)} students</p>
        ) : (
          <Field group label="Send to"><SectionPicker code={code} value={sections} onChange={(v) => { setSections(v); setError(''); }} /></Field>
        )}
        <Field label="Title"><input value={title} onChange={(e) => { setTitle(e.target.value); setError(''); }} className={inputClass} placeholder="Extra class on Saturday" /></Field>
        <Field label="Message"><textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} className={inputClass} /></Field>
        <Button variant="primary" className="w-full" onClick={post}><Megaphone className="w-4 h-4" />Post announcement</Button>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </Card>
      <Card className="!p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100"><p className="font-semibold text-zinc-900">Posted</p></div>
        {store.announcements.length === 0 ? <Empty icon={Megaphone} title="No announcements yet" /> : (
          <ul className="divide-y divide-zinc-100">
            {store.announcements.map((a) => (
              <li key={a.id} className="px-5 py-4 flex gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-zinc-900">{a.title}</p>
                  {a.text && <p className="text-sm text-zinc-600 mt-0.5">{a.text}</p>}
                  <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5 flex-wrap">{subjectByCode(a.code)?.name} <SectionTags code={a.code} sections={a.sections} /> {ago(new Date(a.at))}</p>
                </div>
                <button onClick={() => update((s) => ({ ...s, announcements: s.announcements.filter((x) => x.id !== a.id) }))} className="text-zinc-300 hover:text-red-500 self-start" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

/* ================================================================== */
/* Profile                                                             */
/* ================================================================== */

export function FProfile({ userProfile, onSignOut }) {
  const rows = [['Name', userProfile?.fullName || FACULTY.fullName], ['Designation', userProfile?.designation || FACULTY.designation], ['Department', FACULTY.department], ['School', FACULTY.school], ['Email', userProfile?.email || FACULTY.email], ['Employee ID', FACULTY.employeeId], ['Cabin', FACULTY.cabin]];
  return (
    <div className="max-w-3xl space-y-5">
      <Card>
        <div className="flex items-center gap-4 mb-5">
          <span className="w-16 h-16 rounded-2xl bg-[#F1EEFB] text-[#4C2E8A] text-xl font-semibold flex items-center justify-center">DP</span>
          <div><p className="text-xl font-semibold text-zinc-900">{FACULTY.fullName}</p><p className="text-sm text-zinc-500">{FACULTY.designation}, {FACULTY.department}</p></div>
        </div>
        <dl className="divide-y divide-zinc-100">{rows.map(([k, v]) => <div key={k} className="flex justify-between gap-4 py-2.5 text-sm"><dt className="text-zinc-500">{k}</dt><dd className="text-zinc-900 font-medium text-right">{v}</dd></div>)}</dl>
      </Card>
      <Card>
        <CardTitle>Teaching this semester</CardTitle>
        <ul className="space-y-2">{FACULTY_COURSES.map((c) => <li key={c.id} className="flex items-center gap-2 text-sm"><span className="w-2 h-2 rounded-full" style={{ background: c.color }} />{c.name} · Section {c.section} · {ROSTERS[c.id].length} students</li>)}</ul>
      </Card>
      <ChangePassword />
      <Card className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-zinc-600 flex-1">To see the student view, sign out and use a student demo account.</p>
        <Button onClick={onSignOut}><LogOut className="w-4 h-4" />Sign out</Button>
      </Card>
    </div>
  );
}
