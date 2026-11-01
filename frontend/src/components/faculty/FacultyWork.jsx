import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, ArrowRight, CircleCheck, ClipboardCheck, Clock, Download, Eye, FileText, Pencil, Play, Plus, Radio, ShieldCheck, Square, Timer, Trash2, TriangleAlert, Upload,
} from 'lucide-react';
import { FACULTY_COURSES, FACULTY_CODES, ROSTERS, courseById } from '../../data/facultyData';
import { QUESTION_BANK } from '../../data/appData';
import { subjectByCode } from '../../data/materialsData';
import { uid, useStore } from '../../data/store';
import FileViewer, { useStoredFile } from '../FileViewer';
import { downloadBlob } from '../../utils/files';
import { sampleSubmissionPdf } from '../../utils/docs';
import { Button, Card, CardTitle, Chips, Empty, Field, Modal, Pill, Stat, fmtDate, fmtTime, fmtWhen, fromNow, inputClass, useStoredState } from '../pages/ui';
import { SectionPicker, SectionTags, attemptsFor, hasAccount, facultyAssignments, sectionsOf, facultyTests, percentOf, submissionsFor, testState } from './common';

const CODES = FACULTY_CODES.map((code) => ({ id: code, label: subjectByCode(code)?.name || code }));
const toLocalInput = (d) => {
  const x = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return x.toISOString().slice(0, 16);
};
const useSelection = () => useStoredState('alliance-f-selection', { assignment: null, test: null, course: null });

/* ================================================================== */
/* Assignments                                                         */
/* ================================================================== */

function NewAssignment({ onClose, onCreate }) {
  const [code, setCode] = useState(FACULTY_CODES[0]);
  const [sections, setSections] = useState(sectionsOf(FACULTY_CODES[0]).map((c) => c.section));
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Assignment');
  const [details, setDetails] = useState('');
  const [due, setDue] = useState(toLocalInput(new Date(Date.now() + 5 * 86400000)));
  const [marks, setMarks] = useState(10);
  const [error, setError] = useState('');
  const create = () => {
    if (!title.trim()) return setError('Add a title');
    if (!sections.length) return setError('Choose at least one section');
    if (new Date(due) < new Date()) return setError('The deadline must be in the future');
    onCreate({ id: uid('a'), code, sections, title: title.trim(), type, details: details.trim(), due: new Date(due).toISOString(), marks: Number(marks) || 10, createdAt: new Date().toISOString() });
  };
  return (
    <Modal title="New assignment" subtitle="Students are notified and see it on Home and under Assignments" onClose={onClose} footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" onClick={create}>Publish to students</Button></>}>
      <Field group label="Subject"><Chips value={code} onChange={(c) => { setCode(c); setSections(sectionsOf(c).map((x) => x.section)); }} options={CODES} /></Field>
      <Field group label="Sections"><SectionPicker code={code} value={sections} onChange={setSections} /></Field>
      <Field label="Title"><input value={title} onChange={(e) => { setTitle(e.target.value); setError(''); }} className={inputClass} placeholder="CFG to PDA conversion problems" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Type">
          <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>{['Assignment', 'Lab record', 'Worksheet', 'Project'].map((t) => <option key={t}>{t}</option>)}</select>
        </Field>
        <Field label="Marks"><input type="number" min="1" max="100" value={marks} onChange={(e) => setMarks(e.target.value)} className={inputClass} /></Field>
      </div>
      <Field label="Deadline"><input type="datetime-local" value={due} onChange={(e) => { setDue(e.target.value); setError(''); }} className={inputClass} /></Field>
      <Field label="Instructions"><textarea rows={4} value={details} onChange={(e) => setDetails(e.target.value)} className={inputClass} placeholder="What to do and what to submit" /></Field>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </Modal>
  );
}

export function FAssignments({ onNavigate }) {
  const [store, update] = useStore();
  const [, setSel] = useSelection();
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState('');
  const list = facultyAssignments(store);

  return (
    <div className="space-y-5">
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white text-sm px-4 py-2.5 rounded-full shadow-lg">{toast}</div>}
      <div className="flex items-center gap-3">
        <p className="text-sm text-zinc-500">{list.length} assignments across your courses</p>
        <Button variant="primary" className="ml-auto" onClick={() => setCreating(true)}><Plus className="w-4 h-4" />New assignment</Button>
      </div>
      <div className="space-y-3">
        {list.map((a) => {
          const courses = sectionsOf(a.code).filter((c) => a.sections.includes(c.section));
          const subs = courses.map((c) => ({ c, s: submissionsFor(a, c.id, store) }));
          const open = a.due > new Date();
          return (
            <Card key={a.id} className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Pill>{a.type}</Pill>
                  <span className="text-xs text-zinc-500">{subjectByCode(a.code)?.name}</span>
                  <SectionTags code={a.code} sections={a.sections} />
                  {!a.sample && <Pill tone="violet">Created by you</Pill>}
                </div>
                <p className="font-semibold text-zinc-900">{a.title}</p>
                <p className="text-sm text-zinc-500">{a.marks} marks · {open ? `due ${fmtWhen(a.due)} (${fromNow(a.due)})` : `closed ${fmtDate(a.due)}`}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {subs.map(({ c, s }) => {
                  const submitted = s.filter((x) => x.status !== 'missing' && x.status !== 'pending').length;
                  const toGrade = s.filter((x) => x.status === 'submitted').length;
                  return (
                    <div key={c.id} className="rounded-2xl bg-zinc-50 px-3 py-2 min-w-[120px]">
                      <p className="text-xs text-zinc-500">Section {c.section}</p>
                      <p className="text-sm font-semibold text-zinc-900">{submitted}/{s.length} <span className="font-normal text-zinc-500">submitted</span></p>
                      {toGrade > 0 && <p className="text-xs text-orange-600">{toGrade} to grade</p>}
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="primary" onClick={() => { setSel((s) => ({ ...s, assignment: a.id, course: courses[0]?.id })); onNavigate('f-grading'); }}><Pencil className="w-4 h-4" />Grade</Button>
                {!a.sample && open && <Button onClick={() => { update((s) => ({ ...s, assignments: s.assignments.map((x) => (x.id === a.id ? { ...x, due: new Date(new Date(x.due).getTime() + 2 * 86400000).toISOString() } : x)) })); setToast('Deadline extended by 2 days'); setTimeout(() => setToast(''), 2500); }}>+2 days</Button>}
                {!a.sample && <button onClick={() => update((s) => ({ ...s, assignments: s.assignments.filter((x) => x.id !== a.id) }))} className="w-9 h-9 rounded-full text-zinc-300 hover:text-red-500 flex items-center justify-center" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>}
              </div>
            </Card>
          );
        })}
      </div>
      {creating && (
        <NewAssignment
          onClose={() => setCreating(false)}
          onCreate={(a) => { update((s) => ({ ...s, assignments: [a, ...s.assignments] })); setCreating(false); setToast('Published. Students can see it now.'); setTimeout(() => setToast(''), 2500); }}
        />
      )}
    </div>
  );
}

/* ================================================================== */
/* Grading                                                             */
/* ================================================================== */

// Opens a student's submitted file: the real upload when there is one,
// a sample answer sheet for the generated classmates.
function SubmissionViewer({ sub, assignment, onClose }) {
  const mine = sub.fileId ? sub : null;
  const real = useStoredFile(mine?.fileId || null);
  const [file, setFile] = useState(null);
  useEffect(() => {
    if (mine?.fileId) return;
    const blob = sampleSubmissionPdf(sub.st, assignment);
    setFile({ blob, name: `${(sub.fileName || 'submission').replace(/\.[^.]+$/, '')}.pdf`, type: 'application/pdf', size: blob.size });
  }, [sub, assignment, mine?.fileId]);
  const shown = mine?.fileId ? real.file : file;
  return (
    <Modal wide title={`${sub.st.name} · ${assignment.title}`} subtitle={shown?.name || sub.fileName} onClose={onClose}
      footer={<><Button onClick={onClose}>Close</Button><Button variant="primary" disabled={!shown} onClick={() => shown && downloadBlob(shown.blob, shown.name)}><Download className="w-4 h-4" />Download</Button></>}>
      <FileViewer file={shown} loading={Boolean(mine?.fileId) && real.loading} className="h-[65vh]" missing="The file couldn't be found on the server." />
    </Modal>
  );
}

const QUICK = ['Well done.', 'Show your working for each step.', 'Diagram missing or unclear.', 'Revise the definition and resubmit.', 'Meet me during office hours.'];

export function FGrading() {
  const [store, update] = useStore();
  const [sel, setSel] = useSelection();
  const list = facultyAssignments(store);
  const a = list.find((x) => x.id === sel.assignment) || list.find((x) => x.code === 'CSE303') || list[0];
  const courses = sectionsOf(a.code).filter((c) => a.sections.includes(c.section));
  const courseId = courses.some((c) => c.id === sel.course) ? sel.course : courses[0]?.id;
  const subs = submissionsFor(a, courseId, store);
  const [filter, setFilter] = useState('submitted');
  const [current, setCurrent] = useState(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [viewing, setViewing] = useState(null);

  const shown = subs.filter((x) => filter === 'all' || x.status === filter || (filter === 'missing' && x.status === 'pending'));
  const cur = subs.find((x) => x.st.roll === current) || shown[0];
  useEffect(() => {
    setScore(cur?.score ?? '');
    setFeedback(cur?.feedback ?? '');
    setError('');
  }, [cur?.st.roll, a.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = () => {
    const n = Number(score);
    if (score === '' || Number.isNaN(n) || n < 0 || n > a.marks) return setError(`Enter marks between 0 and ${a.marks}`);
    // Saved in the database; the student sees it under Assignments -> Graded.
    update((s) => {
      const forA = s.submissions?.[a.id] || {};
      const prev = forA[cur.st.roll] || {};
      return { ...s, submissions: { ...s.submissions, [a.id]: { ...forA, [cur.st.roll]: { ...prev, status: 'graded', score: n, feedback: feedback.trim(), fileName: prev.fileName || cur.fileName, fileId: prev.fileId || cur.fileId, submittedAt: prev.submittedAt || cur.at?.toISOString?.() } } } };
    });
    const next = shown.find((x) => x.status === 'submitted' && x.st.roll !== cur.st.roll);
    setCurrent(next ? next.st.roll : cur.st.roll);
  };

  const counts = { submitted: subs.filter((x) => x.status === 'submitted').length, graded: subs.filter((x) => x.status === 'graded').length, missing: subs.filter((x) => x.status === 'missing' || x.status === 'pending').length };
  const tone = { submitted: 'orange', graded: 'green', missing: 'red', pending: 'zinc' };

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <select value={a.id} onChange={(e) => { setSel((s) => ({ ...s, assignment: e.target.value })); setCurrent(null); }} className={`${inputClass} lg:!w-96 !rounded-full`}>
          {list.map((x) => <option key={x.id} value={x.id}>{x.title} · {subjectByCode(x.code)?.name}</option>)}
        </select>
        <Chips value={courseId} onChange={(id) => { setSel((s) => ({ ...s, course: id })); setCurrent(null); }} options={courses.map((c) => ({ id: c.id, label: `Section ${c.section}` }))} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Stat label="To grade" value={counts.submitted} tone="text-orange-600" />
        <Stat label="Graded" value={counts.graded} tone="text-emerald-600" />
        <Stat label="Not submitted" value={counts.missing} />
      </div>
      <div className="grid lg:grid-cols-[340px_1fr] gap-5 items-start">
        <Card className="!p-0 overflow-hidden">
          <div className="p-3 border-b border-zinc-100"><Chips value={filter} onChange={setFilter} options={[{ id: 'submitted', label: 'To grade' }, { id: 'graded', label: 'Graded' }, { id: 'missing', label: 'Missing' }, { id: 'all', label: 'All' }]} /></div>
          <ul className="max-h-[520px] overflow-y-auto divide-y divide-zinc-100">
            {shown.map((x) => (
              <li key={x.st.roll}>
                <button onClick={() => setCurrent(x.st.roll)} className={`w-full flex items-center gap-3 px-4 py-3 text-left ${cur?.st.roll === x.st.roll ? 'bg-[#F7F5FD]' : 'hover:bg-zinc-50'}`}>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-900 truncate">{x.st.name}{hasAccount(x.st, store) && <span className="text-[#6D3FC0]"> · has an account</span>}</p>
                    <p className="text-xs text-zinc-500">{x.st.roll}</p>
                  </div>
                  {x.late && <Pill tone="amber">Late</Pill>}
                  <Pill tone={tone[x.status]}>{x.status === 'graded' ? `${x.score}/${a.marks}` : x.status === 'pending' ? 'Not yet' : x.status === 'missing' ? 'Missing' : 'Submitted'}</Pill>
                </button>
              </li>
            ))}
            {shown.length === 0 && <li className="p-6 text-center text-sm text-zinc-500">Nothing here.</li>}
          </ul>
        </Card>
        {cur ? (
          <Card>
            <div className="flex items-start gap-3 mb-4">
              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold text-zinc-900">{cur.st.name}</p>
                <p className="text-sm text-zinc-500">{cur.st.roll} · Section {cur.st.section}</p>
              </div>
              <Pill tone={tone[cur.status]}>{cur.status}</Pill>
            </div>
            {cur.status === 'missing' || cur.status === 'pending' ? (
              <Empty icon={Clock} title="Not submitted yet" text={cur.status === 'missing' ? 'The deadline has passed. The student can still submit late.' : `Due ${fmtWhen(a.due)}.`} />
            ) : (
              <>
                <div className="rounded-2xl border border-zinc-200 p-4 mb-4 flex items-center gap-3">
                  <FileText className="w-8 h-8 text-red-500" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-900 truncate">{cur.fileName}</p>
                    <p className="text-xs text-zinc-500">{cur.at ? `Submitted ${fmtWhen(cur.at)}` : 'Submitted'}{cur.late ? ' · after the deadline' : ''}</p>
                  </div>
                  <Button onClick={() => setViewing(cur)}><Eye className="w-4 h-4" />Open</Button>
                </div>
                <Field label={`Marks (out of ${a.marks})`}>
                  <input type="number" min="0" max={a.marks} value={score} onChange={(e) => { setScore(e.target.value); setError(''); }} className={`${inputClass} !w-32`} />
                </Field>
                <Field label="Feedback">
                  <div className="flex flex-wrap gap-1.5 mb-2">{QUICK.map((q) => <button key={q} onClick={() => setFeedback((f) => (f ? `${f} ${q}` : q))} className="px-2.5 py-1 rounded-full border border-zinc-200 text-xs text-zinc-600 hover:border-[#6D3FC0]">{q}</button>)}</div>
                  <textarea rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} className={inputClass} placeholder="Students see this with their marks" />
                </Field>
                {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
                <div className="flex items-center gap-3">
                  <Button variant="primary" onClick={save}><CircleCheck className="w-4 h-4" />{cur.status === 'graded' ? 'Update marks' : 'Save and next'}</Button>
                  {hasAccount(cur.st, store) && <p className="text-xs text-zinc-500">Marks appear in the student’s Assignments → Graded.</p>}
                </div>
              </>
            )}
          </Card>
        ) : <Card><Empty title="Pick a student" /></Card>}
      </div>
      {viewing && <SubmissionViewer sub={viewing} assignment={a} onClose={() => setViewing(null)} />}
    </div>
  );
}

/* ================================================================== */
/* Tests: list + create                                                */
/* ================================================================== */

function QuestionEditor({ code, onAdd, onCancel }) {
  const [text, setText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [answer, setAnswer] = useState(0);
  const [topic, setTopic] = useState('');
  const [explain, setExplain] = useState('');
  const [error, setError] = useState('');
  const add = () => {
    if (text.trim().length < 5) return setError('Write the question');
    if (options.some((o) => !o.trim())) return setError('Fill in all four options');
    onAdd({ code, text: text.trim(), options: options.map((o) => o.trim()), answer, topic: topic.trim() || 'General', explain: explain.trim() || 'Explanation to be added.', id: uid('q') });
  };
  return (
    <div className="rounded-2xl border border-[#6D3FC0]/40 bg-[#F7F5FD]/50 p-4 space-y-2.5">
      <textarea rows={2} value={text} onChange={(e) => { setText(e.target.value); setError(''); }} className={inputClass} placeholder="Question" />
      {options.map((o, i) => (
        <label key={i} className="flex items-center gap-2">
          <input type="radio" name="correct" checked={answer === i} onChange={() => setAnswer(i)} className="accent-[#6D3FC0]" aria-label={`Option ${i + 1} is correct`} />
          <input value={o} onChange={(e) => { setOptions((l) => l.map((x, j) => (j === i ? e.target.value : x))); setError(''); }} className={inputClass} placeholder={`Option ${String.fromCharCode(65 + i)}${answer === i ? ' (correct)' : ''}`} />
        </label>
      ))}
      <div className="grid grid-cols-2 gap-2">
        <input value={topic} onChange={(e) => setTopic(e.target.value)} className={inputClass} placeholder="Topic" />
        <input value={explain} onChange={(e) => setExplain(e.target.value)} className={inputClass} placeholder="Why the answer is correct" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2"><Button onClick={onCancel}>Cancel</Button><Button variant="primary" onClick={add}>Add question</Button></div>
    </div>
  );
}

const bankFor = (code, store) => [
  ...(QUESTION_BANK[code] || []).map((q, i) => ({ ...q, id: `${code}-b${i}`, code })),
  ...store.qbank.filter((q) => q.code === code),
];

function NewTest({ store, onClose, onCreate, onAddQuestion }) {
  const [step, setStep] = useState(1);
  const [code, setCode] = useState(FACULTY_CODES[0]);
  const [sections, setSections] = useState(sectionsOf(FACULTY_CODES[0]).map((c) => c.section));
  const [title, setTitle] = useState('');
  const [syllabus, setSyllabus] = useState('');
  const [start, setStart] = useState(toLocalInput(new Date(Date.now() + 86400000)));
  const [minutes, setMinutes] = useState(30);
  const [proctored, setProctored] = useState(true);
  const [showScore, setShowScore] = useState(true);
  const [picked, setPicked] = useState([]);
  const [writing, setWriting] = useState(false);
  const [error, setError] = useState('');
  const bank = bankFor(code, store);

  const next = () => {
    if (step === 1) {
      if (!title.trim()) return setError('Give the test a title');
      if (!sections.length) return setError('Choose at least one section');
    }
    if (step === 2 && !picked.length) return setError('Pick at least one question');
    setError('');
    setStep(step + 1);
  };
  const publish = () => {
    const qs = bank.filter((q) => picked.includes(q.id)).map(({ text, options, answer, explain, topic }) => ({ text, options, answer, explain, topic }));
    onCreate({ id: uid('t'), code, sections, title: title.trim(), syllabus: syllabus.trim() || 'As announced in class', start: new Date(start).toISOString(), minutes: Number(minutes) || 30, marks: qs.length, proctored, showScore, customQuestions: qs, createdAt: new Date().toISOString() });
  };

  return (
    <Modal
      wide
      title="Create a test"
      subtitle={`Step ${step} of 3 · ${['Details', 'Questions', 'Review'][step - 1]}`}
      onClose={onClose}
      footer={<>{step > 1 && <Button onClick={() => setStep(step - 1)}><ArrowLeft className="w-4 h-4" />Back</Button>}{step < 3 ? <Button variant="primary" onClick={next}>Next<ArrowRight className="w-4 h-4" /></Button> : <Button variant="primary" onClick={publish}><Upload className="w-4 h-4" />Schedule test</Button>}</>}
    >
      {step === 1 && (
        <>
          <Field group label="Subject"><Chips value={code} onChange={(c) => { setCode(c); setSections(sectionsOf(c).map((x) => x.section)); setPicked([]); }} options={CODES} /></Field>
          <Field group label="Sections"><SectionPicker code={code} value={sections} onChange={setSections} /></Field>
          <Field label="Title"><input value={title} onChange={(e) => { setTitle(e.target.value); setError(''); }} className={inputClass} placeholder="Unit 4 quiz" /></Field>
          <Field label="Syllabus"><input value={syllabus} onChange={(e) => setSyllabus(e.target.value)} className={inputClass} placeholder="Unit 4: Turing machines" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Starts"><input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} className={inputClass} /></Field>
            <Field label="Duration (minutes)"><input type="number" min="5" max="240" value={minutes} onChange={(e) => setMinutes(e.target.value)} className={inputClass} /></Field>
          </div>
          <label className="flex items-center gap-2.5 text-sm text-zinc-800 mb-2 cursor-pointer"><input type="checkbox" checked={proctored} onChange={(e) => setProctored(e.target.checked)} className="w-4 h-4 accent-[#6D3FC0]" />Proctored: camera check, tab-switch tracking</label>
          <label className="flex items-center gap-2.5 text-sm text-zinc-800 cursor-pointer"><input type="checkbox" checked={showScore} onChange={(e) => setShowScore(e.target.checked)} className="w-4 h-4 accent-[#6D3FC0]" />Show students their score right after submitting</label>
        </>
      )}
      {step === 2 && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-sm text-zinc-600">{picked.length} selected · {bank.length} in the question bank</p>
            {!writing && <Button className="ml-auto" onClick={() => setWriting(true)}><Plus className="w-4 h-4" />Write a question</Button>}
          </div>
          {writing && <div className="mb-4"><QuestionEditor code={code} onCancel={() => setWriting(false)} onAdd={(q) => { onAddQuestion(q); setPicked((p) => [...p, q.id]); setWriting(false); }} /></div>}
          {bank.length === 0 && !writing && <Empty title="No questions for this subject yet" text="Write the first one above." />}
          <ul className="space-y-2">
            {bank.map((q) => {
              const on = picked.includes(q.id);
              return (
                <li key={q.id}>
                  <label className={`flex gap-3 rounded-2xl border p-3.5 cursor-pointer ${on ? 'border-[#6D3FC0] bg-[#F7F5FD]' : 'border-zinc-200 hover:bg-zinc-50'}`}>
                    <input type="checkbox" checked={on} onChange={() => { setPicked((p) => (on ? p.filter((x) => x !== q.id) : [...p, q.id])); setError(''); }} className="w-4 h-4 mt-0.5 accent-[#6D3FC0]" />
                    <div className="min-w-0"><p className="text-sm text-zinc-900">{q.text}</p><p className="text-xs text-zinc-500 mt-0.5">{q.topic} · Answer: {q.options[q.answer]}</p></div>
                  </label>
                </li>
              );
            })}
          </ul>
        </>
      )}
      {step === 3 && (
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Questions" value={picked.length} />
            <Stat label="Marks" value={picked.length} />
            <Stat label="Duration" value={`${minutes} min`} />
            <Stat label="Sections" value={sections.join(', ')} />
          </div>
          <p className="text-zinc-700"><span className="text-zinc-500">Title:</span> {title} · {subjectByCode(code)?.name}</p>
          <p className="text-zinc-700"><span className="text-zinc-500">Starts:</span> {fmtWhen(new Date(start))}</p>
          <p className="text-zinc-700"><span className="text-zinc-500">Rules:</span> {proctored ? 'Proctored' : 'Not proctored'} · {showScore ? 'score shown on submit' : 'score shown when you publish results'} · no negative marking</p>
          <p className="text-xs text-zinc-500">Students see it under Tests → Upcoming straight away, and it goes live at the start time.</p>
        </div>
      )}
      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
    </Modal>
  );
}

export function FTests({ onNavigate }) {
  const [store, update] = useStore();
  const [, setSel] = useSelection();
  const [creating, setCreating] = useState(false);
  const [tab, setTab] = useState('all');
  const tests = facultyTests(store);
  const groups = { live: tests.filter((t) => testState(t) === 'live'), scheduled: tests.filter((t) => testState(t) === 'scheduled').reverse(), completed: tests.filter((t) => testState(t) === 'completed') };
  const shown = tab === 'all' ? [...groups.live, ...groups.scheduled, ...groups.completed] : groups[tab];

  const openNow = (t) =>
    update((s) => (t.sample ? { ...s, testOverrides: { ...s.testOverrides, [t.id]: { start: new Date().toISOString() } } } : { ...s, tests: s.tests.map((x) => (x.id === t.id ? { ...x, start: new Date().toISOString() } : x)) }));

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Chips value={tab} onChange={setTab} options={[{ id: 'all', label: 'All' }, { id: 'live', label: 'Live', count: groups.live.length }, { id: 'scheduled', label: 'Scheduled', count: groups.scheduled.length }, { id: 'completed', label: 'Completed', count: groups.completed.length }]} />
        <Button variant="primary" className="sm:ml-auto" onClick={() => setCreating(true)}><Plus className="w-4 h-4" />Create test</Button>
      </div>
      {shown.length === 0 ? <Card><Empty icon={ClipboardCheck} title="No tests here" /></Card> : (
        <div className="space-y-3">
          {shown.map((t) => {
            const st = testState(t);
            const go = (tab2) => { setSel((s) => ({ ...s, test: t.id, course: sectionsOf(t.code).find((c) => t.sections?.includes(c.section))?.id })); onNavigate(tab2); };
            return (
              <Card key={t.id} className={`flex flex-col md:flex-row md:items-center gap-4 ${st === 'live' ? '!border-red-300' : ''}`}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {st === 'live' && <Pill tone="red"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />Live</Pill>}
                    {st === 'scheduled' && <Pill tone="violet">Scheduled</Pill>}
                    {st === 'completed' && <Pill>Completed</Pill>}
                    <span className="text-xs text-zinc-500">{subjectByCode(t.code)?.name}</span><SectionTags code={t.code} sections={t.sections} />
                    {t.proctored && <Pill tone="blue"><ShieldCheck className="w-3 h-3" />Proctored</Pill>}
                  </div>
                  <p className="font-semibold text-zinc-900">{t.title}</p>
                  <p className="text-sm text-zinc-500">{fmtWhen(t.start)} · {t.minutes} min · {t.customQuestions?.length || t.questions} questions</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {st === 'scheduled' && <Button onClick={() => openNow(t)}><Play className="w-4 h-4" />Open now</Button>}
                  {st === 'live' && <Button variant="primary" onClick={() => go('f-monitor')}><Radio className="w-4 h-4" />Monitor</Button>}
                  {st !== 'scheduled' && <Button onClick={() => go('f-results')}>Results</Button>}
                  {!t.sample && st === 'scheduled' && <button onClick={() => update((s) => ({ ...s, tests: s.tests.filter((x) => x.id !== t.id) }))} className="w-9 h-9 rounded-full text-zinc-300 hover:text-red-500 flex items-center justify-center" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>}
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {creating && (
        <NewTest
          store={store}
          onClose={() => setCreating(false)}
          onAddQuestion={(q) => update((s) => ({ ...s, qbank: [...s.qbank, q] }))}
          onCreate={(t) => { update((s) => ({ ...s, tests: [t, ...s.tests] })); setCreating(false); }}
        />
      )}
    </div>
  );
}

/* ================================================================== */
/* Question bank                                                       */
/* ================================================================== */

export function FQuestionBank() {
  const [store, update] = useStore();
  const [code, setCode] = useState(FACULTY_CODES[0]);
  const [topic, setTopic] = useState('All');
  const [writing, setWriting] = useState(false);
  const bank = bankFor(code, store);
  const topics = ['All', ...new Set(bank.map((q) => q.topic))];
  const shown = bank.filter((q) => topic === 'All' || q.topic === topic);
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Chips value={code} onChange={(c) => { setCode(c); setTopic('All'); }} options={CODES} />
        <Button variant="primary" className="sm:ml-auto" onClick={() => setWriting(true)}><Plus className="w-4 h-4" />Add question</Button>
      </div>
      {writing && <QuestionEditor code={code} onCancel={() => setWriting(false)} onAdd={(q) => { update((s) => ({ ...s, qbank: [...s.qbank, q] })); setWriting(false); }} />}
      {topics.length > 2 && <Chips value={topic} onChange={setTopic} options={topics} />}
      {shown.length === 0 ? <Card><Empty title="No questions yet" text="Questions you add are reused across tests." /></Card> : (
        <div className="space-y-3">
          {shown.map((q, i) => (
            <Card key={q.id} className="!p-5">
              <div className="flex gap-3">
                <span className="text-sm text-zinc-400 w-6">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] text-zinc-900 mb-2">{q.text}</p>
                  <div className="grid sm:grid-cols-2 gap-1.5 mb-2">{q.options.map((o, j) => <p key={j} className={`text-sm px-3 py-1.5 rounded-lg ${j === q.answer ? 'bg-emerald-50 text-emerald-800 font-medium' : 'bg-zinc-50 text-zinc-600'}`}>{String.fromCharCode(65 + j)}. {o}</p>)}</div>
                  <p className="text-xs text-zinc-500">{q.topic} · {q.explain}</p>
                </div>
                {String(q.id).startsWith('q') && <button onClick={() => update((s) => ({ ...s, qbank: s.qbank.filter((x) => x.id !== q.id) }))} className="text-zinc-300 hover:text-red-500 self-start" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/* Live monitor                                                        */
/* ================================================================== */

export function FMonitor({ onNavigate }) {
  const [store, update] = useStore();
  const [sel, setSel] = useSelection();
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 3000); // picks up the demo student's progress
    return () => clearInterval(id);
  }, []);
  const tests = facultyTests(store);
  const live = tests.filter((t) => testState(t) === 'live');
  const t = live.find((x) => x.id === sel.test) || live[0];

  if (!t) {
    const next = tests.filter((x) => testState(x) === 'scheduled').sort((a, b) => a.start - b.start)[0];
    return <Card><Empty icon={Radio} title="No test is live right now" text={next ? `Next: ${next.title}, ${fromNow(next.start)}. Use “Open now” on the Tests page to start it early.` : 'Schedule a test to monitor it here.'} action={<Button variant="primary" onClick={() => onNavigate('f-tests')}>Go to tests</Button>} /></Card>;
  }
  const courses = sectionsOf(t.code).filter((c) => (t.sections || []).includes(c.section));
  const courseId = courses.some((c) => c.id === sel.course) ? sel.course : courses[0]?.id;
  const rows = attemptsFor(t, courseId);
  const n = t.customQuestions.length;
  const end = new Date(t.start.getTime() + t.minutes * 60000);
  const started = rows.filter((r) => r.started).length;
  const submitted = rows.filter((r) => r.submitted).length;
  const flagged = rows.filter((r) => r.warnings > 0);

  const extend = () => update((s) => (t.sample ? { ...s, testOverrides: { ...s.testOverrides, [t.id]: { start: new Date(t.start.getTime() + 10 * 60000).toISOString() } } } : { ...s, tests: s.tests.map((x) => (x.id === t.id ? { ...x, minutes: x.minutes + 10 } : x)) }));
  const endNow = () => update((s) => (t.sample ? { ...s, testOverrides: { ...s.testOverrides, [t.id]: { start: new Date(Date.now() - t.minutes * 60000).toISOString() } } } : { ...s, tests: s.tests.map((x) => (x.id === t.id ? { ...x, start: new Date(Date.now() - x.minutes * 60000).toISOString() } : x)) }));

  return (
    <div className="space-y-5">
      <Card className="flex flex-col md:flex-row md:items-center gap-4 !border-red-300">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1"><Pill tone="red"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />Live</Pill><span className="text-xs text-zinc-500">{subjectByCode(t.code)?.name}</span></div>
          <p className="text-lg font-semibold text-zinc-900">{t.title}</p>
          <p className="text-sm text-zinc-500 flex items-center gap-1.5"><Timer className="w-4 h-4" />Ends {fmtTime(end)} ({fromNow(end)})</p>
        </div>
        {live.length > 1 && <select value={t.id} onChange={(e) => setSel((s) => ({ ...s, test: e.target.value }))} className={`${inputClass} md:!w-56 !rounded-full`}>{live.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}</select>}
        <Chips value={courseId} onChange={(id) => setSel((s) => ({ ...s, course: id }))} options={courses.map((c) => ({ id: c.id, label: c.section }))} />
        <div className="flex gap-2"><Button onClick={extend}><Clock className="w-4 h-4" />+10 min</Button><Button variant="danger" onClick={endNow}><Square className="w-4 h-4" />End test</Button></div>
      </Card>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Writing now" value={started - submitted} tone="text-[#4C2E8A]" />
        <Stat label="Submitted" value={`${submitted}/${rows.length}`} tone="text-emerald-600" />
        <Stat label="Not started" value={rows.length - started} />
        <Stat label="Flags to review" value={flagged.length} tone={flagged.length ? 'text-amber-700' : undefined} />
      </div>
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead><tr className="text-left text-xs text-zinc-500 border-b border-zinc-100"><th className="px-5 py-3 font-medium">Student</th><th className="px-3 py-3 font-medium">Status</th><th className="px-3 py-3 font-medium w-56">Progress</th><th className="px-3 py-3 font-medium">Tab switches</th></tr></thead>
            <tbody className="divide-y divide-zinc-100">
              {[...rows].sort((a, b) => b.warnings - a.warnings || Number(hasAccount(b.st, store)) - Number(hasAccount(a.st, store))).map((r) => (
                <tr key={r.st.roll} className={hasAccount(r.st, store) ? 'bg-[#F7F5FD]' : ''}>
                  <td className="px-5 py-2.5"><p className="font-medium text-zinc-900">{r.st.name}</p><p className="text-xs text-zinc-500">{r.st.roll}{hasAccount(r.st, store) ? ' · signed-in student, live' : ''}</p></td>
                  <td className="px-3 py-2.5">{r.submitted ? <Pill tone="green">Submitted</Pill> : r.started ? <Pill tone="violet">Writing</Pill> : <Pill>Not started</Pill>}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2"><div className="flex-1 h-1.5 rounded-full bg-zinc-100 overflow-hidden"><div className="h-full bg-[#6D3FC0]" style={{ width: `${(r.answers.filter((x) => x !== -1).length / n) * 100}%` }} /></div><span className="text-xs text-zinc-500 w-12">{r.answers.filter((x) => x !== -1).length}/{n}</span></div>
                  </td>
                  <td className="px-3 py-2.5">{r.warnings ? <Pill tone="amber"><TriangleAlert className="w-3 h-3" />{r.warnings}</Pill> : <span className="text-zinc-400">0</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="text-xs text-zinc-500">Tab switches are flags for review, not automatic penalties. Camera snapshots appear here once camera proctoring is connected to the server.</p>
    </div>
  );
}

/* ================================================================== */
/* Results                                                             */
/* ================================================================== */

export function FResults() {
  const [store, update] = useStore();
  const [sel, setSel] = useSelection();
  const tests = facultyTests(store).filter((t) => testState(t) !== 'scheduled');
  const t = tests.find((x) => x.id === sel.test) || tests[0];
  const courses = t ? sectionsOf(t.code).filter((c) => (t.sections || []).includes(c.section)) : [];
  const courseId = courses.some((c) => c.id === sel.course) ? sel.course : courses[0]?.id;
  const rows = useMemo(() => (t ? attemptsFor(t, courseId).filter((r) => r.submitted || r.answers.length) : []), [t, courseId, store]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!t) return <Card><Empty icon={ClipboardCheck} title="No results yet" text="Results appear once a test has started." /></Card>;

  const scored = rows.map((r) => ({ ...r, pct: percentOf(t, r.answers) })).sort((a, b) => b.pct - a.pct);
  const avg = scored.length ? Math.round(scored.reduce((n, r) => n + r.pct, 0) / scored.length) : 0;
  const bins = [0, 0, 0, 0, 0];
  scored.forEach((r) => { bins[Math.min(4, Math.floor(r.pct / 20))] += 1; });
  const maxBin = Math.max(1, ...bins);
  const perQ = t.customQuestions.map((q, i) => ({ q, pct: scored.length ? Math.round((scored.filter((r) => r.answers[i] === q.answer).length / scored.length) * 100) : 0 }));
  const published = store.published[t.id] || t.showScore;

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <select value={t.id} onChange={(e) => setSel((s) => ({ ...s, test: e.target.value }))} className={`${inputClass} lg:!w-96 !rounded-full`}>{tests.map((x) => <option key={x.id} value={x.id}>{x.title} · {subjectByCode(x.code)?.name}</option>)}</select>
        <Chips value={courseId} onChange={(id) => setSel((s) => ({ ...s, course: id }))} options={courses.map((c) => ({ id: c.id, label: `Section ${c.section}` }))} />
        <Button variant={published ? 'secondary' : 'primary'} className="lg:ml-auto" onClick={() => update((s) => ({ ...s, published: { ...s.published, [t.id]: true } }))} disabled={published}>
          {published ? <><CircleCheck className="w-4 h-4 text-emerald-600" />Results visible to students</> : 'Publish results'}
        </Button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Class average" value={`${avg}%`} tone="text-[#4C2E8A]" />
        <Stat label="Highest" value={`${scored[0]?.pct ?? 0}%`} hint={scored[0]?.st.name} />
        <Stat label="Lowest" value={`${scored[scored.length - 1]?.pct ?? 0}%`} />
        <Stat label="Submitted" value={`${scored.length}/${(ROSTERS[courseId] || []).length}`} />
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <CardTitle hint="Number of students in each score band">Score distribution</CardTitle>
          <div className="flex items-end gap-3 h-40">
            {bins.map((b, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 h-full">
                <span className="text-xs font-medium text-zinc-700">{b}</span>
                <div className="w-full rounded-t-lg bg-[#6D3FC0]" style={{ height: `${(b / maxBin) * 100}%`, minHeight: b ? 4 : 0, opacity: 0.45 + i * 0.13 }} />
                <span className="text-[11px] text-zinc-500">{i * 20}–{i === 4 ? 100 : i * 20 + 19}%</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardTitle hint="Lowest first: these topics need revisiting">Question analysis</CardTitle>
          <ul className="space-y-2.5">
            {[...perQ].sort((a, b) => a.pct - b.pct).map(({ q, pct }) => (
              <li key={q.text}>
                <div className="flex justify-between gap-3 text-sm mb-1"><span className="truncate text-zinc-800">{q.text}</span><span className={`shrink-0 font-medium ${pct < 50 ? 'text-red-600' : 'text-zinc-700'}`}>{pct}%</span></div>
                <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden"><div className={`h-full ${pct < 50 ? 'bg-red-400' : 'bg-emerald-400'}`} style={{ width: `${pct}%` }} /></div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <Card className="!p-0 overflow-hidden">
        <ul className="divide-y divide-zinc-100">
          {scored.map((r, i) => (
            <li key={r.st.roll} className={`flex items-center gap-3 px-5 py-2.5 ${hasAccount(r.st, store) ? 'bg-[#F7F5FD]' : ''}`}>
              <span className="w-6 text-sm text-zinc-400">{i + 1}</span>
              <span className="flex-1 text-sm text-zinc-900">{r.st.name}<span className="text-zinc-400"> · {r.st.roll}</span></span>
              {r.warnings > 0 && <Pill tone="amber">{r.warnings} flag{r.warnings > 1 ? 's' : ''}</Pill>}
              <span className="text-sm font-semibold text-zinc-900 w-12 text-right">{r.pct}%</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
