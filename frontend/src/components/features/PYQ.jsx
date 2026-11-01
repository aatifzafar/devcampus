import React, { useMemo, useState } from 'react';
import { Download, Eye, FileQuestion, Printer, Search, Sparkles, TrendingUp } from 'lucide-react';
import { storePYQs, useStore } from '../../data/store';
import FileViewer, { useStoredFile } from '../FileViewer';
import { downloadBlob, getFile } from '../../utils/files';
import { PAPERS, PYQ_EXAMS, PYQ_SUBJECT_CODES, PYQ_YEARS, subjectAny, topicFrequency } from '../../data/featuresData';
import { Button, Card, CardTitle, Chips, Empty, Modal, Pill, SubjectTag, inputClass } from '../pages/ui';

// Open a clean, printable copy of the paper (students can "Save as PDF").
function printPaper(p) {
  const s = subjectAny(p.code);
  const q = (list, start) =>
    list.map((x, i) => `<tr><td class="n">${start + i}.</td><td>${x.text.charAt(0).toUpperCase() + x.text.slice(1)}</td><td class="m">${x.marks}</td><td class="m">${x.co}</td></tr>`).join('');
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${s.code} ${p.exam} ${p.year}</title>
<style>body{font-family:Georgia,serif;max-width:760px;margin:40px auto;color:#111;padding:0 20px}h1,h2{text-align:center;margin:4px 0}h1{font-size:20px}h2{font-size:16px;font-weight:normal}
.meta{display:flex;justify-content:space-between;margin:18px 0;border-top:1px solid #000;border-bottom:1px solid #000;padding:6px 0;font-size:14px}
h3{font-size:15px;margin:22px 0 6px}table{width:100%;border-collapse:collapse;font-size:14px}td{padding:6px 4px;vertical-align:top}.n{width:28px}.m{width:48px;text-align:center}</style></head><body>
<h1>Alliance University</h1><h2>${s.code}: ${s.name}</h2><h2>${p.exam} examination, ${p.year}</h2>
<div class="meta"><span>Time: ${p.minutes} minutes</span><span>Maximum marks: ${p.total}</span></div>
<h3>Part A: Answer all questions (${p.partA.length} × ${p.partA[0].marks} = ${p.partA.length * p.partA[0].marks} marks)</h3><table><tr><td></td><td></td><td class="m"><b>Marks</b></td><td class="m"><b>CO</b></td></tr>${q(p.partA, 1)}</table>
<h3>Part B: Answer all questions (${p.partB.length} × ${p.partB[0].marks} = ${p.partB.length * p.partB[0].marks} marks)</h3><table>${q(p.partB, p.partA.length + 1)}</table>
<script>window.onload=()=>window.print()</script></body></html>`);
  w.document.close();
}

function UploadedPaper({ id }) {
  const { file, loading } = useStoredFile(id);
  return <FileViewer file={file} loading={loading} className="h-[65vh]" missing="This paper's file isn't stored in this browser. Ask your faculty to upload it again." />;
}

function PaperModal({ paper, onClose, onAskAI }) {
  const s = subjectAny(paper.code);
  const Row = ({ q, n }) => (
    <li className="flex items-start gap-3 py-3 group">
      <span className="text-sm font-medium text-zinc-500 w-6 shrink-0">{n}.</span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] text-zinc-900">{q.text.charAt(0).toUpperCase() + q.text.slice(1)}</p>
        <div className="flex items-center gap-2 mt-1">
          <Pill>Unit {q.unit}</Pill>
          <Pill>{q.co}</Pill>
          <Pill tone="violet">{q.marks} marks</Pill>
        </div>
      </div>
      <button
        onClick={() => onAskAI(`Help me answer this ${q.marks}-mark question from ${s.name} (${paper.exam} ${paper.year}). Explain the concept and outline a good answer: "${q.text}"`)}
        className="shrink-0 inline-flex items-center gap-1 text-xs text-[#6D3FC0] px-2.5 py-1.5 rounded-full hover:bg-[#F7F5FD] sm:opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Sparkles className="w-3.5 h-3.5" />Explain
      </button>
    </li>
  );
  return (
    <Modal
      wide
      title={`${s.name}: ${paper.exam} ${paper.year}`}
      subtitle={`${s.code} · ${paper.minutes} minutes · ${paper.total} marks`}
      onClose={onClose}
      footer={<Button variant="primary" onClick={() => printPaper(paper)}><Printer className="w-4 h-4" />Print or save as PDF</Button>}
    >
      <h4 className="text-sm font-semibold text-zinc-900">Part A <span className="font-normal text-zinc-500">· answer all</span></h4>
      <ol className="divide-y divide-zinc-100 mb-5">{paper.partA.map((q, i) => <Row key={i} q={q} n={i + 1} />)}</ol>
      <h4 className="text-sm font-semibold text-zinc-900">Part B <span className="font-normal text-zinc-500">· answer all</span></h4>
      <ol className="divide-y divide-zinc-100">{paper.partB.map((q, i) => <Row key={i} q={q} n={paper.partA.length + i + 1} />)}</ol>
    </Modal>
  );
}

export function PYQPapers({ onAskAI }) {
  useStore(); // re-render when faculty upload a paper
  const [code, setCode] = useState('all');
  const [year, setYear] = useState('all');
  const [exam, setExam] = useState('all');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(null);

  const q = query.trim().toLowerCase();
  const uploaded = storePYQs().map((p) => ({ ...p, uploaded: true, partA: [], partB: [] }));
  const shown = [...uploaded, ...PAPERS].filter(
    (p) =>
      (code === 'all' || p.code === code) &&
      (year === 'all' || p.year === Number(year)) &&
      (exam === 'all' || p.examId === exam) &&
      (!q || (p.uploaded ? false : [...p.partA, ...p.partB].some((x) => x.text.includes(q) || x.topic.toLowerCase().includes(q))))
  ).sort((a, b) => b.year - a.year || a.code.localeCompare(b.code));

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <label className="relative lg:flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search questions by topic, for example “normalisation”" className={`${inputClass} !rounded-full pl-9`} />
        </label>
        <select value={code} onChange={(e) => setCode(e.target.value)} className={`${inputClass} !rounded-full lg:!w-56`} aria-label="Subject">
          <option value="all">All subjects</option>
          {PYQ_SUBJECT_CODES.map((c) => <option key={c} value={c}>{subjectAny(c).name}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(e.target.value)} className={`${inputClass} !rounded-full lg:!w-32`} aria-label="Year">
          <option value="all">All years</option>
          {[...PYQ_YEARS].reverse().map((y) => <option key={y}>{y}</option>)}
        </select>
      </div>
      <Chips value={exam} onChange={setExam} options={[{ id: 'all', label: 'All exams' }, ...PYQ_EXAMS]} />
      <p className="text-sm text-zinc-500">{shown.length} paper{shown.length === 1 ? '' : 's'}{q ? ` with a question on “${query}”` : ''}</p>

      {shown.length === 0 ? (
        <Card><Empty icon={FileQuestion} title="No papers match" text="Try another subject, year or search word." /></Card>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {shown.map((p) => {
            const s = subjectAny(p.code);
            if (p.uploaded) {
              return (
                <Card key={p.id} className="!p-0 overflow-hidden flex flex-col">
                  <div className="h-1.5" style={{ background: s.color }} />
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-1"><SubjectTag subject={s} /><Pill tone="green" className="ml-auto">New</Pill></div>
                    <p className="text-lg font-semibold text-zinc-900">{p.exam} · {p.year}</p>
                    <p className="text-sm text-zinc-500 mb-4">Original paper uploaded by faculty · PDF</p>
                    <p className="text-xs text-zinc-400 mb-4 truncate">{p.fileName}</p>
                    <div className="mt-auto flex gap-2">
                      <Button variant="primary" className="flex-1" onClick={() => setOpen(p)}><Eye className="w-4 h-4" />Open</Button>
                      <Button onClick={() => getFile(p.fileId).then((f) => f && downloadBlob(f.blob, f.name))} aria-label="Download" disabled={!p.fileId}><Download className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </Card>
              );
            }
            return (
              <Card key={p.id} className="!p-0 overflow-hidden flex flex-col">
                <div className="h-1.5" style={{ background: s.color }} />
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <SubjectTag subject={s} />
                    <span className="ml-auto text-xs text-zinc-400">{s.code}</span>
                  </div>
                  <p className="text-lg font-semibold text-zinc-900">{p.exam} · {p.year}</p>
                  <p className="text-sm text-zinc-500 mb-4">{p.partA.length + p.partB.length} questions · {p.total} marks · {p.minutes} min</p>
                  <p className="text-xs text-zinc-400 mb-4 flex items-center gap-1"><Download className="w-3.5 h-3.5" />{p.downloads} students used this</p>
                  <div className="mt-auto flex gap-2">
                    <Button variant="primary" className="flex-1" onClick={() => setOpen(p)}><Eye className="w-4 h-4" />Open</Button>
                    <Button onClick={() => printPaper(p)} aria-label="Download"><Download className="w-4 h-4" /></Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <p className="text-xs text-zinc-500">Demo papers are generated from each subject’s syllabus. Faculty can upload the real question papers.</p>
      {open && open.uploaded && (
        <Modal wide title={`${subjectAny(open.code).name}: ${open.exam} ${open.year}`} subtitle={open.fileName} onClose={() => setOpen(null)}>
          <UploadedPaper id={open.fileId} />
        </Modal>
      )}
      {open && !open.uploaded && <PaperModal paper={open} onClose={() => setOpen(null)} onAskAI={(t) => { setOpen(null); onAskAI(t); }} />}
    </div>
  );
}

export function PYQTopics({ onAskAI, onNavigate }) {
  const [code, setCode] = useState(PYQ_SUBJECT_CODES[1]);
  const { total, topics } = useMemo(() => topicFrequency(code), [code]);
  const top = topics[0]?.papers || 1;
  const s = subjectAny(code);

  return (
    <div className="space-y-5">
      <Chips value={code} onChange={setCode} options={PYQ_SUBJECT_CODES.map((c) => ({ id: c, label: subjectAny(c).name }))} />
      <Card>
        <CardTitle hint={`From ${total} papers between ${PYQ_YEARS[0]} and ${PYQ_YEARS[PYQ_YEARS.length - 1]}`}>Most asked topics in {s.name}</CardTitle>
        <ol className="space-y-3">
          {topics.slice(0, 15).map((t, i) => {
            const pct = Math.round((t.papers / total) * 100);
            const level = pct >= 50 ? { tone: 'red', label: 'Very likely' } : pct >= 30 ? { tone: 'amber', label: 'Likely' } : { tone: 'zinc', label: 'Sometimes' };
            return (
              <li key={t.topic} className="flex items-center gap-3 group">
                <span className="text-sm text-zinc-400 w-5 shrink-0">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-zinc-900 truncate">{t.topic}</span>
                    <span className="text-xs text-zinc-400 shrink-0">Unit {t.unit}</span>
                    <Pill tone={level.tone} className="ml-auto shrink-0">{level.label}</Pill>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-zinc-100 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(t.papers / top) * 100}%`, background: s.color }} /></div>
                    <span className="text-xs text-zinc-500 w-28 text-right shrink-0">{t.papers} of {total} papers</span>
                  </div>
                </div>
                <button onClick={() => onAskAI(`Teach me "${t.topic}" from ${s.name} for my exam. It is asked often in previous papers. Give the key points, a worked example, and a likely exam question with a model answer outline.`)} className="shrink-0 inline-flex items-center gap-1 text-xs text-[#6D3FC0] px-2.5 py-1.5 rounded-full hover:bg-[#F7F5FD]">
                  <Sparkles className="w-3.5 h-3.5" />Revise
                </button>
              </li>
            );
          })}
        </ol>
      </Card>
      <Card className="flex flex-col sm:flex-row sm:items-center gap-3">
        <TrendingUp className="w-6 h-6 text-[#6D3FC0] shrink-0" />
        <p className="text-sm text-zinc-700 flex-1">Start revision with the “Very likely” topics, then practise full papers under time.</p>
        <Button onClick={() => onNavigate('pyq')}>Browse papers</Button>
      </Card>
    </div>
  );
}
