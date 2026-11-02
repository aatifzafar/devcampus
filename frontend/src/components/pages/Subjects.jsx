import React, { useMemo, useRef, useState } from 'react';
import { CircleCheck, CirclePlay, Clock, FileText, Paperclip, Search, TriangleAlert, Upload, X } from 'lucide-react';
import { ASSIGNMENTS } from '../../data/appData';
import { STUDENT_ROLL, storeSubmissions, useStore } from '../../data/store';
import { courseInfo } from '../../data/courseInfo';
import { saveFile } from '../../utils/files';
import LessonPlayer from '../LessonPlayer';
import { Button, Card, Chips, Empty, Field, Modal, Pill, SubjectTag, CURRENT_SUBJECTS, fmtDate, fmtWhen, fromNow, inputClass, subjectOf, useStoredState } from './ui';

/* ================================================================== */
/* Assignments                                                         */
/* ================================================================== */

const urgency = (due) => {
  const ms = due - new Date();
  if (ms < 0) return { tone: 'red', label: `${fromNow(due).replace(' ago', '')} late` };
  if (ms < 24 * 3600000) return { tone: 'orange', label: `Due ${fromNow(due)}` };
  if (ms < 3 * 24 * 3600000) return { tone: 'amber', label: `Due ${fromNow(due)}` };
  return { tone: 'zinc', label: `Due ${fromNow(due)}` };
};

function SubmitModal({ a, onClose, onSubmit }) {
  const [file, setFile] = useState(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const input = useRef(null);
  const late = a.due < new Date();

  const [uploading, setUploading] = useState(false);
  const send = async () => {
    if (!file) {
      setError('Choose a file to upload first');
      return;
    }
    // Upload the file first, so faculty can open it while grading.
    const fileId = `sub-${a.id}-${STUDENT_ROLL}`;
    setUploading(true);
    try {
      await saveFile(fileId, file);
    } catch (err) {
      setUploading(false);
      setError(`Upload failed: ${err.message}`);
      return;
    }
    onSubmit({ fileName: file.name, size: file.size, fileId, note, submittedAt: new Date().toISOString(), status: 'submitted' });
  };

  return (
    <Modal
      title={`Submit: ${a.title}`}
      subtitle={`${subjectOf(a.code).name} · ${a.marks} marks · due ${fmtWhen(a.due)}`}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={uploading} onClick={send}><Upload className="w-4 h-4" />{uploading ? 'Uploading…' : 'Submit'}</Button>
        </>
      }
    >
      {late && (
        <p className="flex items-start gap-2 text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2.5 mb-4">
          <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" />
          This is past the deadline. You can still submit; it will be marked late.
        </p>
      )}
      <p className="text-sm text-zinc-700 mb-5">{a.details}</p>
      <Field label="Your file" hint="PDF, Word, ZIP or images, up to 25 MB">
        <input ref={input} type="file" className="hidden" onChange={(e) => { setFile(e.target.files[0] || null); setError(''); }} />
        {file ? (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-zinc-200">
            <FileText className="w-5 h-5 text-[#6D3FC0]" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-900 truncate">{file.name}</p>
              <p className="text-xs text-zinc-500">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
            <button onClick={() => setFile(null)} className="text-zinc-400 hover:text-zinc-700" aria-label="Remove file"><X className="w-4 h-4" /></button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="w-full flex flex-col items-center gap-1.5 px-4 py-8 rounded-2xl border-2 border-dashed border-zinc-200 hover:border-[#6D3FC0] hover:bg-[#F7F5FD] text-zinc-500"
          >
            <Paperclip className="w-6 h-6" />
            <span className="text-sm font-medium text-zinc-800">Choose a file</span>
          </button>
        )}
        {error && <span className="block text-sm text-red-600 mt-2">{error}</span>}
      </Field>
      <Field label="Note for your faculty (optional)">
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className={inputClass} placeholder="Anything they should know about this submission" />
      </Field>
    </Modal>
  );
}

export function Assignments() {
  useStore(); // re-render when faculty add or change assignments
  const [local, setLocal] = useStoredState('alliance-assignments', {});
  const [tab, setTab] = useState('todo');
  const [subject, setSubject] = useState('all');
  const [submitting, setSubmitting] = useState(null);
  const [open, setOpen] = useState(null);

  const fromFaculty = storeSubmissions().map((a) => ({ ...a, code: a.subject.code, status: 'pending' }));
  const all = [...fromFaculty, ...ASSIGNMENTS].map((a) => ({ ...a, ...(local[a.id] || {}) }));
  const bySubject = all.filter((a) => subject === 'all' || a.code === subject);
  const lists = {
    todo: bySubject.filter((a) => a.status === 'pending').sort((a, b) => a.due - b.due),
    submitted: bySubject.filter((a) => a.status === 'submitted').sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)),
    graded: bySubject.filter((a) => a.status === 'graded'),
  };
  const shown = lists[tab];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
        <Chips
          value={tab}
          onChange={setTab}
          options={[
            { id: 'todo', label: 'To do', count: lists.todo.length },
            { id: 'submitted', label: 'Submitted', count: lists.submitted.length },
            { id: 'graded', label: 'Graded', count: lists.graded.length },
          ]}
        />
        <select value={subject} onChange={(e) => setSubject(e.target.value)} className={`${inputClass} md:ml-auto md:w-64 !rounded-full`}>
          <option value="all">All subjects</option>
          {CURRENT_SUBJECTS.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
        </select>
      </div>

      {shown.length === 0 ? (
        <Card><Empty icon={CircleCheck} title={tab === 'todo' ? 'Nothing to submit' : 'Nothing here yet'} text={tab === 'todo' ? 'You’re all caught up.' : undefined} /></Card>
      ) : (
        <div className="space-y-3">
          {shown.map((a) => {
            const u = urgency(a.due);
            const expanded = open === a.id;
            return (
              <Card key={a.id} className="!p-0 overflow-hidden">
                <div className="flex items-center gap-4 p-4 sm:p-5">
                  <span className="w-1.5 self-stretch rounded-full shrink-0" style={{ background: subjectOf(a.code).color }} />
                  <button onClick={() => setOpen(expanded ? null : a.id)} className="min-w-0 flex-1 text-left">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <SubjectTag code={a.code} />
                      <Pill>{a.type}</Pill>
                    </div>
                    <p className="font-semibold text-zinc-900">{a.title}</p>
                    <p className="text-sm text-zinc-500">
                      {a.teacher} · {a.marks} marks ·{' '}
                      {a.status === 'pending' ? `due ${fmtWhen(a.due)}` : `submitted ${fmtDate(new Date(a.submittedAt))}`}
                    </p>
                  </button>
                  <div className="shrink-0 flex flex-col sm:flex-row items-end sm:items-center gap-2">
                    {a.status === 'pending' && (
                      <>
                        <Pill tone={u.tone} className="!text-xs">{u.label}</Pill>
                        <Button variant={u.tone === 'red' || u.tone === 'orange' ? 'primary' : 'secondary'} onClick={() => setSubmitting(a)}>
                          <Upload className="w-4 h-4" />Submit
                        </Button>
                      </>
                    )}
                    {a.status === 'submitted' && <Pill tone="green" className="!text-xs"><CircleCheck className="w-3.5 h-3.5" />Submitted, awaiting marks</Pill>}
                    {a.status === 'graded' && (
                      <span className="text-right">
                        <span className="text-2xl font-semibold text-zinc-900">{a.score}</span>
                        <span className="text-sm text-zinc-500">/{a.marks}</span>
                      </span>
                    )}
                  </div>
                </div>
                {expanded && (
                  <div className="px-5 pb-5 pl-10 text-sm space-y-3 border-t border-zinc-100 pt-4">
                    <p className="text-zinc-700">{a.details}</p>
                    {a.fileName && <p className="text-zinc-600 flex items-center gap-2"><FileText className="w-4 h-4" />{a.fileName}</p>}
                    {a.feedback && (
                      <p className="bg-emerald-50 text-emerald-900 rounded-xl px-3.5 py-2.5"><span className="font-medium">Faculty feedback:</span> {a.feedback}</p>
                    )}
                    {a.status === 'submitted' && (
                      <Button onClick={() => setSubmitting(a)}><Upload className="w-4 h-4" />Replace file</Button>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {submitting && (
        <SubmitModal
          a={submitting}
          onClose={() => setSubmitting(null)}
          onSubmit={(data) => {
            setLocal((l) => ({ ...l, [submitting.id]: data }));
            setSubmitting(null);
            setTab('submitted');
          }}
        />
      )}
    </div>
  );
}

/* ================================================================== */
/* Recordings                                                          */
/* ================================================================== */

export function Recordings() {
  const [subject, setSubject] = useState('all');
  const [query, setQuery] = useState('');
  const [playing, setPlaying] = useState(null);

  const all = useMemo(
    () =>
      CURRENT_SUBJECTS.flatMap((s) => courseInfo(s.code).recordings.map((r) => ({ ...r, subject: s })))
        .sort((a, b) => b.date - a.date),
    []
  );
  const q = query.trim().toLowerCase();
  const shown = all.filter((r) => (subject === 'all' || r.subject.code === subject) && (!q || r.topic.toLowerCase().includes(q)));

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-5">
        <Chips
          value={subject}
          onChange={setSubject}
          options={[{ id: 'all', label: 'All subjects' }, ...CURRENT_SUBJECTS.filter((s) => s.type !== 'Project').map((s) => ({ id: s.code, label: s.name }))]}
        />
        <label className="relative lg:ml-auto">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by topic" className={`${inputClass} !rounded-full pl-9 lg:w-60`} />
        </label>
      </div>

      {shown.length === 0 ? (
        <Card><Empty icon={CirclePlay} title="No recordings found" /></Card>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {shown.slice(0, 30).map((r) => (
            <button key={r.id} onClick={() => setPlaying(r)} className="text-left bg-white rounded-3xl border border-[#E4E4E7] overflow-hidden hover:border-zinc-300 hover:shadow-sm transition-all">
              <div className="relative aspect-video flex items-center justify-center" style={{ background: `${r.subject.color}1A` }}>
                <span className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center" style={{ color: r.subject.color }}>
                  <CirclePlay className="w-7 h-7" />
                </span>
                <span className="absolute bottom-2 right-2 text-[11px] font-medium px-2 py-0.5 rounded-full bg-black/70 text-white flex items-center gap-1"><Clock className="w-3 h-3" />{r.minutes} min</span>
              </div>
              <div className="p-4">
                <SubjectTag subject={r.subject} />
                <p className="font-medium text-zinc-900 line-clamp-2 mt-1">{r.topic}</p>
                <p className="text-xs text-zinc-500 mt-1">Lecture {r.lecture} · Unit {r.unit} · {fmtDate(r.date)}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {playing && (
        <Modal wide title={`Lecture ${playing.lecture}: ${playing.topic}`} subtitle={`${playing.subject.name} · ${playing.subject.faculty} · ${fmtDate(playing.date)}`} onClose={() => setPlaying(null)}>
          <LessonPlayer code={playing.subject.code} unit={playing.unit} topic={playing.topic} color={playing.subject.color} />
        </Modal>
      )}
    </div>
  );
}
