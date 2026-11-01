import React, { useState } from 'react';
import { ArrowLeft, ArrowUp, BadgeCheck, CircleCheck, FileText, MessageSquare, Plus, Search, Upload, UserRound } from 'lucide-react';
import { PROJECT, THREADS } from '../../data/appData';
import { Button, Card, CardTitle, Chips, Empty, Field, Modal, Pill, SubjectTag, CURRENT_SUBJECTS, ago, fmtDate, fromNow, inputClass, subjectOf, useStoredState } from './ui';

/* ================================================================== */
/* Discussions                                                         */
/* ================================================================== */

const revive = (t) => ({ ...t, at: new Date(t.at), replies: t.replies.map((r) => ({ ...r, at: new Date(r.at) })) });

function AskModal({ onClose, onPost }) {
  const [code, setCode] = useState(CURRENT_SUBJECTS[0].code);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const post = () => {
    if (title.trim().length < 10) {
      setError('Write your question in at least 10 characters');
      return;
    }
    onPost({ code, title: title.trim(), body: body.trim() });
  };
  return (
    <Modal title="Ask a doubt" subtitle="Classmates and faculty of the subject can answer" onClose={onClose} footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" onClick={post}>Post question</Button></>}>
      <Field label="Subject">
        <select value={code} onChange={(e) => setCode(e.target.value)} className={inputClass}>
          {CURRENT_SUBJECTS.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
        </select>
      </Field>
      <Field label="Your question">
        <input value={title} onChange={(e) => { setTitle(e.target.value); setError(''); }} className={inputClass} placeholder="Why does 2PL not prevent deadlocks?" />
        {error && <span className="block text-sm text-red-600 mt-1.5">{error}</span>}
      </Field>
      <Field label="Details (optional)" hint="Mention what you already tried or which page of the notes you’re stuck on.">
        <textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} className={inputClass} />
      </Field>
    </Modal>
  );
}

function Thread({ t, onBack, onVote, onReply }) {
  const [text, setText] = useState('');
  const s = subjectOf(t.code);
  const replies = [...t.replies].sort((a, b) => (b.accepted ? 1 : 0) - (a.accepted ? 1 : 0) || b.votes - a.votes);
  return (
    <div className="max-w-3xl">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 mb-4"><ArrowLeft className="w-4 h-4" />All discussions</button>
      <Card className="mb-4">
        <div className="flex gap-4">
          <button onClick={() => onVote(t.id)} className="flex flex-col items-center gap-0.5 text-zinc-500 hover:text-[#6D3FC0] shrink-0" aria-label="Upvote">
            <ArrowUp className="w-5 h-5" /><span className="text-sm font-semibold">{t.votes}</span>
          </button>
          <div className="min-w-0">
            <SubjectTag subject={s} />
            <h2 className="text-xl font-semibold text-zinc-900 my-1">{t.title}</h2>
            {t.body && <p className="text-[15px] text-zinc-700 mb-2">{t.body}</p>}
            <p className="text-xs text-zinc-500">Asked by {t.author} · {ago(t.at)}</p>
          </div>
        </div>
      </Card>
      <p className="text-sm font-semibold text-zinc-900 mb-3">{replies.length} answer{replies.length === 1 ? '' : 's'}</p>
      <div className="space-y-3 mb-5">
        {replies.map((r, i) => (
          <Card key={i} className={r.accepted ? '!border-emerald-300' : ''}>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center ${r.role === 'faculty' ? 'bg-[#F1EEFB] text-[#4C2E8A]' : 'bg-zinc-100 text-zinc-500'}`}><UserRound className="w-4 h-4" /></span>
              <span className="text-sm font-medium text-zinc-900">{r.author}</span>
              {r.role === 'faculty' && <Pill tone="violet"><BadgeCheck className="w-3 h-3" />Faculty</Pill>}
              {r.accepted && <Pill tone="green"><CircleCheck className="w-3 h-3" />Best answer</Pill>}
              <span className="text-xs text-zinc-400 ml-auto">{ago(r.at)}</span>
            </div>
            <p className="text-[15px] text-zinc-700 leading-relaxed">{r.body}</p>
            <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1"><ArrowUp className="w-3.5 h-3.5" />{r.votes}</p>
          </Card>
        ))}
        {replies.length === 0 && <Card><Empty icon={MessageSquare} title="No answers yet" text="Be the first to help. Faculty are notified about unanswered questions after 24 hours." /></Card>}
      </div>
      <Card>
        <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} className={inputClass} placeholder="Write an answer" />
        <div className="flex justify-end mt-3">
          <Button variant="primary" disabled={!text.trim()} onClick={() => { onReply(t.id, text.trim()); setText(''); }}>Post answer</Button>
        </div>
      </Card>
    </div>
  );
}

export function Discussions() {
  const [stored, setStored] = useStoredState('alliance-threads', THREADS);
  const threads = stored.map(revive);
  const [filter, setFilter] = useState('all');
  const [subject, setSubject] = useState('all');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(null);
  const [asking, setAsking] = useState(false);

  const update = (fn) => setStored((list) => list.map(revive).map(fn));
  const vote = (id) => update((t) => (t.id === id ? { ...t, votes: t.votes + 1 } : t));
  const reply = (id, body) => update((t) => (t.id === id ? { ...t, replies: [...t.replies, { author: 'You', role: 'student', at: new Date(), votes: 0, body }] } : t));

  const open = threads.find((t) => t.id === openId);
  if (open) return <Thread t={open} onBack={() => setOpenId(null)} onVote={vote} onReply={reply} />;

  const q = query.trim().toLowerCase();
  const shown = threads
    .filter((t) => subject === 'all' || t.code === subject)
    .filter((t) => (filter === 'unanswered' ? t.replies.length === 0 : filter === 'mine' ? t.mine : true))
    .filter((t) => !q || t.title.toLowerCase().includes(q) || t.body.toLowerCase().includes(q))
    .sort((a, b) => b.at - a.at);

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-5">
        <Chips value={filter} onChange={setFilter} options={[{ id: 'all', label: 'All' }, { id: 'unanswered', label: 'Unanswered' }, { id: 'mine', label: 'My questions' }]} />
        <select value={subject} onChange={(e) => setSubject(e.target.value)} className={`${inputClass} !rounded-full lg:w-56`}>
          <option value="all">All subjects</option>
          {CURRENT_SUBJECTS.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
        </select>
        <label className="relative lg:ml-auto">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search discussions" className={`${inputClass} !rounded-full pl-9 lg:w-56`} />
        </label>
        <Button variant="primary" onClick={() => setAsking(true)}><Plus className="w-4 h-4" />Ask a doubt</Button>
      </div>
      <Card className="!p-0 overflow-hidden">
        {shown.length === 0 ? (
          <Empty icon={MessageSquare} title="No discussions here" text="Ask a doubt and your classmates and faculty can answer." />
        ) : (
          <ul className="divide-y divide-zinc-100">
            {shown.map((t) => {
              const faculty = t.replies.some((r) => r.role === 'faculty');
              return (
                <li key={t.id}>
                  <button onClick={() => setOpenId(t.id)} className="w-full flex items-start gap-4 px-5 py-4 hover:bg-zinc-50 text-left">
                    <div className="w-12 text-center shrink-0">
                      <p className="text-sm font-semibold text-zinc-900">{t.votes}</p>
                      <p className="text-[11px] text-zinc-500">votes</p>
                    </div>
                    <div className={`w-14 text-center shrink-0 rounded-xl py-1 ${t.replies.length ? (faculty ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-700') : 'border border-dashed border-zinc-300 text-zinc-400'}`}>
                      <p className="text-sm font-semibold">{t.replies.length}</p>
                      <p className="text-[11px]">answers</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-zinc-900">{t.title}</p>
                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        <SubjectTag code={t.code} />
                        <span className="text-xs text-zinc-400">· {t.author} · {ago(t.at)}</span>
                        {faculty && <Pill tone="violet"><BadgeCheck className="w-3 h-3" />Faculty answered</Pill>}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      {asking && (
        <AskModal
          onClose={() => setAsking(false)}
          onPost={(data) => {
            const t = { id: `th${Date.now()}`, ...data, author: 'You', at: new Date(), votes: 0, mine: true, replies: [] };
            setStored((list) => [t, ...list]);
            setAsking(false);
            setOpenId(t.id);
          }}
        />
      )}
    </div>
  );
}

/* ================================================================== */
/* Projects                                                            */
/* ================================================================== */

export function Projects() {
  const [files, setFiles] = useStoredState('alliance-project-files', []);
  const p = PROJECT;
  const allFiles = [...files.map((f) => ({ ...f, at: new Date(f.at) })), ...p.files].sort((a, b) => b.at - a.at);
  const current = p.milestones.find((m) => m.status === 'current');
  const doneCount = p.milestones.filter((m) => m.status === 'done').length;

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-5">
      <div className="space-y-5">
        <Card className="!p-0 overflow-hidden">
          <div className="h-1.5" style={{ background: subjectOf(p.code).color }} />
          <div className="p-5 sm:p-6">
            <SubjectTag code={p.code} />
            <h2 className="text-xl font-semibold text-zinc-900 mt-1">{p.title}</h2>
            <p className="text-sm text-zinc-500 mb-4">Mentor: {p.mentor}</p>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-zinc-500">{doneCount} of {p.milestones.length} milestones done</span>
              {current && <span className="text-zinc-700">Next: {current.title}, {fromNow(current.due)}</span>}
            </div>
            <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${(doneCount / p.milestones.length) * 100}%`, background: subjectOf(p.code).color }} />
            </div>
          </div>
        </Card>
        <Card>
          <CardTitle>Milestones</CardTitle>
          <ol className="relative border-l-2 border-zinc-100 ml-3 space-y-6">
            {p.milestones.map((m) => (
              <li key={m.title} className="pl-6 relative">
                <span className={`absolute -left-[11px] top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${m.status === 'done' ? 'bg-emerald-500 border-emerald-500 text-white' : m.status === 'current' ? 'bg-white border-[#6D3FC0]' : 'bg-white border-zinc-200'}`}>
                  {m.status === 'done' && <CircleCheck className="w-3.5 h-3.5" />}
                  {m.status === 'current' && <span className="w-2 h-2 rounded-full bg-[#6D3FC0]" />}
                </span>
                <div className="flex items-start gap-3">
                  <div className="min-w-0">
                    <p className={`font-medium ${m.status === 'upcoming' ? 'text-zinc-500' : 'text-zinc-900'}`}>{m.title}</p>
                    <p className="text-xs text-zinc-500">Due {fmtDate(m.due)}{m.status === 'current' ? ` · ${fromNow(m.due)}` : ''}</p>
                    {m.feedback && <p className="text-sm text-emerald-800 bg-emerald-50 rounded-xl px-3 py-2 mt-2">Mentor: {m.feedback}</p>}
                  </div>
                  {m.score && <Pill tone="green" className="ml-auto">{m.score}</Pill>}
                  {m.status === 'current' && <Pill tone="violet" className="ml-auto">In progress</Pill>}
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>
      <div className="space-y-5">
        <Card>
          <CardTitle>Team</CardTitle>
          <ul className="space-y-3">
            {p.team.map((m) => (
              <li key={m.name} className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-[#F1EEFB] text-[#4C2E8A] text-xs font-semibold flex items-center justify-center">{m.name.split(' ').map((w) => w[0]).join('')}</span>
                <div>
                  <p className="text-sm font-medium text-zinc-900">{m.name}{m.you && <span className="text-zinc-400 font-normal"> (you)</span>}</p>
                  <p className="text-xs text-zinc-500">{m.role}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardTitle
            action={
              <label className="inline-flex items-center gap-1.5 text-sm text-[#6D3FC0] cursor-pointer">
                <Upload className="w-4 h-4" />Upload
                <input type="file" className="hidden" onChange={(e) => { const f = e.target.files[0]; if (f) setFiles((l) => [{ name: f.name, by: 'You', at: new Date().toISOString() }, ...l]); }} />
              </label>
            }
          >
            Shared files
          </CardTitle>
          <ul className="space-y-2.5">
            {allFiles.map((f) => (
              <li key={f.name + f.at} className="flex items-center gap-3 text-sm">
                <FileText className="w-4 h-4 text-zinc-400 shrink-0" />
                <span className="truncate text-zinc-800 flex-1">{f.name}</span>
                <span className="text-xs text-zinc-400 shrink-0">{f.by} · {ago(f.at)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
