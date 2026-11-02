import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  CirclePlay,
  Download,
  Eye,
  FileCode,
  FileQuestion,
  FileText,
  Link2,
  Lock,
  Presentation,
  Search,
  UserRound,
  X,
} from 'lucide-react';
import { SEMESTERS, CURRENT_SEMESTER } from '../data/subjectsData';
import { UNIT_TITLES, materialsFor, subjectByCode } from '../data/materialsData';
import { useStore } from '../data/store';
import { downloadBlob, getFile } from '../utils/files';
import { readSaved, writeSaved } from '../utils/session';
import { referenceLink, sampleMaterial } from '../utils/docs';
import FileViewer from './FileViewer';
import LessonPlayer from './LessonPlayer';

const TYPES = {
  notes: { label: 'Notes', icon: FileText, tint: 'bg-red-50 text-red-600' },
  slides: { label: 'Slides', icon: Presentation, tint: 'bg-orange-50 text-orange-600' },
  video: { label: 'Videos', icon: CirclePlay, tint: 'bg-sky-50 text-sky-600' },
  questions: { label: 'Question banks', icon: FileQuestion, tint: 'bg-violet-50 text-violet-600' },
  link: { label: 'Links', icon: Link2, tint: 'bg-emerald-50 text-emerald-600' },
  manual: { label: 'Lab manuals', icon: FileText, tint: 'bg-red-50 text-red-600' },
  code: { label: 'Code', icon: FileCode, tint: 'bg-zinc-100 text-zinc-600' },
};

const isNew = (d) => (Date.now() - d.getTime()) / 86400000 < 3;
const fmtDate = (d) => {
  const days = Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: days > 300 ? 'numeric' : undefined });
};

const SEEN_KEY = 'alliance-seen-materials';
const loadSeen = () => {
  try {
    return new Set(readSaved(SEEN_KEY, []) || []);
  } catch {
    return new Set();
  }
};

// Get the file behind a material: the faculty upload, or a generated sample.
async function materialFile(code, item) {
  if (item.fileId) return getFile(item.fileId);
  const { blob, name } = sampleMaterial(code, item.unit, item);
  return { blob, name, type: blob.type, size: blob.size };
}

export async function downloadMaterial(code, item) {
  const f = await materialFile(code, item);
  if (f) downloadBlob(f.blob, f.name);
}

// Links open in a new tab instead of the viewer.
export const materialLink = (code, item) => (item.type === 'link' ? item.url || referenceLink(code) : null);

function PreviewModal({ item, subject, onClose }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const sampleVideo = item.type === 'video' && !item.fileId;
  useEffect(() => {
    let alive = true;
    if (sampleVideo) { setLoading(false); return undefined; }
    setLoading(true);
    materialFile(subject.code, item).then((f) => { if (alive) { setFile(f); setLoading(false); } });
    return () => { alive = false; };
  }, [item, subject.code, sampleVideo]);
  const t = TYPES[item.type];
  const Icon = t.icon;
  const unitTitle = (UNIT_TITLES[subject.code] || [])[item.unit - 1] || item.title;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-4xl max-h-[92vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl"
      >
        <div className="flex items-center gap-3 p-4 sm:p-5 border-b border-zinc-100">
          <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${t.tint}`}>
            <Icon className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-zinc-900 truncate">{item.title}</p>
            <p className="text-xs text-zinc-500 truncate">
              {subject.name} · {item.faculty} · {item.meta}
            </p>
          </div>
          {!sampleVideo && (
            <button
              disabled={!file}
              onClick={() => file && downloadBlob(file.blob, file.name)}
              className="ml-auto shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#0077CC] text-white text-sm font-medium hover:bg-[#005FA3] disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
          )}
          <button onClick={onClose} className={`${sampleVideo ? 'ml-auto ' : ''}shrink-0 w-9 h-9 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-500`} aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4 sm:p-5 bg-zinc-50">
          {sampleVideo ? (
            <LessonPlayer code={subject.code} unit={item.unit} topic={unitTitle} color={subject.color} />
          ) : (
            <FileViewer file={file} loading={loading} className="h-[70vh]" missing="The file couldn’t be found in this browser. Ask your faculty to upload it again." />
          )}
        </div>
      </div>
    </div>
  );
}

export default function NotesView({ subjectCode, setSubjectCode, onBack, embedded = false }) {
  const current = SEMESTERS.find((s) => s.number === CURRENT_SEMESTER).subjects;
  const code = subjectCode || current[0].code;
  const subject = subjectByCode(code);
  const [store] = useStore(); // re-render when faculty share something new
  const units = useMemo(() => materialsFor(code), [code, store]); // eslint-disable-line react-hooks/exhaustive-deps

  const [type, setType] = useState('all');
  const [query, setQuery] = useState('');
  const [openUnits, setOpenUnits] = useState(() => new Set());
  const [closedWhileFiltering, setClosedWhileFiltering] = useState(() => new Set());
  const [seen, setSeen] = useState(loadSeen);
  const [preview, setPreview] = useState(null);

  // Open the unit being taught now (or all, for past subjects) when the subject changes.
  useEffect(() => {
    const now = units.find((u) => u.current);
    setOpenUnits(new Set(now ? [now.unit] : units.filter((u) => u.shared).map((u) => u.unit)));
    setType('all');
    setQuery('');
  }, [code]); // eslint-disable-line react-hooks/exhaustive-deps -- only when the subject changes, not on every refresh

  const markSeen = (id) => {
    setSeen((prev) => {
      const next = new Set(prev).add(id);
      try {
        writeSaved(SEEN_KEY, [...next]);
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const allItems = units.flatMap((u) => u.items);
  const typesHere = [...new Set(allItems.map((i) => i.type))];
  const q = query.trim().toLowerCase();
  const filtering = type !== 'all' || q;
  const matches = (i) => (type === 'all' || i.type === type) && (!q || i.title.toLowerCase().includes(q));
  const newCount = allItems.filter((i) => isNew(i.sharedAt) && !seen.has(i.id)).length;

  useEffect(() => setClosedWhileFiltering(new Set()), [type, query]);
  const flip = (set, n) => { const next = new Set(set); next.has(n) ? next.delete(n) : next.add(n); return next; };
  const toggle = (n) =>
    filtering ? setClosedWhileFiltering((prev) => flip(prev, n)) : setOpenUnits((prev) => {
      const next = new Set(prev);
      next.has(n) ? next.delete(n) : next.add(n);
      return next;
    });

  const open = (item) => {
    markSeen(item.id);
    const link = materialLink(code, item);
    if (link) window.open(link, '_blank', 'noopener');
    else setPreview(item);
  };

  return (
    <div>
      {onBack && !embedded && (
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 mb-4">
          <ArrowLeft className="w-4 h-4" />
          All subjects
        </button>
      )}

      {/* Subject picker (current semester) */}
      {!embedded && (
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5 -mx-1 px-1">
        {current.map((s) => {
          const on = s.code === code;
          return (
            <button
              key={s.code}
              onClick={() => setSubjectCode(s.code)}
              className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-sm transition-colors ${
                on ? 'bg-[#18181B] border-[#18181B] text-white' : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
              {s.name}
            </button>
          );
        })}
      </div>

      )}

      {/* Subject banner */}
      {!embedded && (
      <div className="bg-white rounded-3xl border border-[#E4E4E7] overflow-hidden mb-5">
        <div className="h-1.5" style={{ background: subject.color }} />
        <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center gap-4">
          <div className="min-w-0">
            <p className="text-xs text-zinc-500 mb-1">
              {subject.code} · Semester {subject.semester} · {subject.credits} credits
            </p>
            <h2 className="text-xl font-semibold text-zinc-900">{subject.name}</h2>
            <p className="text-sm text-zinc-500 flex items-center gap-1.5 mt-1">
              <UserRound className="w-3.5 h-3.5" />
              {subject.faculty}
            </p>
          </div>
          <div className="md:ml-auto flex gap-6 text-sm">
            <div>
              <p className="text-2xl font-semibold text-zinc-900">{allItems.length}</p>
              <p className="text-zinc-500 text-xs">Materials</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-zinc-900">
                {units.filter((u) => u.shared).length}/{units.length}
              </p>
              <p className="text-zinc-500 text-xs">Units shared</p>
            </div>
            <div>
              <p className={`text-2xl font-semibold ${newCount ? 'text-[#0077CC]' : 'text-zinc-900'}`}>{newCount}</p>
              <p className="text-zinc-500 text-xs">New for you</p>
            </div>
          </div>
        </div>
      </div>

      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-5">
        <div className="flex flex-wrap gap-1.5">
          {['all', ...typesHere].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-1.5 rounded-full text-sm ${
                type === t ? 'bg-[#EFF6FF] text-[#005FA3] font-medium' : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              {t === 'all' ? 'All materials' : TYPES[t].label}
            </button>
          ))}
        </div>
        <label className="relative lg:ml-auto">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search materials"
            className="pl-9 pr-3 py-2 w-full lg:w-60 rounded-full elastic-input text-sm focus:outline-none focus:border-[#0077CC]"
          />
        </label>
      </div>

      {/* Units */}
      <div className="space-y-3">
        {units.map((u) => {
          const items = u.items.filter(matches);
          if (filtering && items.length === 0) return null;
          const isOpen = filtering ? !closedWhileFiltering.has(u.unit) : openUnits.has(u.unit);
          const unitNew = u.items.filter((i) => isNew(i.sharedAt) && !seen.has(i.id)).length;

          if (!u.shared) {
            return (
              <div key={u.unit} className="flex items-center gap-3 px-5 py-4 rounded-3xl border border-dashed border-zinc-200 text-zinc-400">
                <Lock className="w-4 h-4" />
                <span className="text-sm">
                  <span className="font-medium text-zinc-500">Unit {u.unit}:</span> {u.title}
                </span>
                <span className="ml-auto text-xs">Not shared yet</span>
              </div>
            );
          }

          return (
            <section key={u.unit} className="elastic-card overflow-hidden">
              <button
                onClick={() => toggle(u.unit)}
                aria-expanded={isOpen}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-zinc-50"
              >
                <span
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold shrink-0"
                  style={{ background: `${subject.color}14`, color: subject.color }}
                >
                  {u.unit}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-zinc-900 truncate">{u.title}</p>
                  <p className="text-xs text-zinc-500">
                    {u.items.length} material{u.items.length === 1 ? '' : 's'}
                    {u.current && ' · Being taught now'}
                  </p>
                </div>
                {unitNew > 0 && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#005FA3]">{unitNew} new</span>
                )}
                <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <ul className="border-t border-zinc-100 divide-y divide-zinc-100">
                  {items.map((item) => {
                    const t = TYPES[item.type];
                    const Icon = t.icon;
                    const fresh = isNew(item.sharedAt) && !seen.has(item.id);
                    return (
                      <li key={item.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-zinc-50/70">
                        <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${t.tint}`}>
                          <Icon className="w-5 h-5" strokeWidth={1.8} />
                        </span>
                        <button onClick={() => open(item)} className="min-w-0 flex-1 text-left">
                          <p className={`text-[15px] truncate ${fresh ? 'font-semibold text-zinc-900' : 'font-medium text-zinc-800'}`}>
                            {fresh && <span className="inline-block w-2 h-2 rounded-full bg-[#0077CC] mr-2 align-middle" />}
                            {item.title}
                          </p>
                          <p className="text-xs text-zinc-500 truncate">
                            {item.meta} · Shared by {item.faculty} · {fmtDate(item.sharedAt)}
                          </p>
                          {item.note && <p className="text-xs text-amber-700 mt-0.5">Faculty note: {item.note}</p>}
                        </button>
                        <button
                          onClick={() => open(item)}
                          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 text-sm text-zinc-700 hover:bg-white"
                        >
                          <Eye className="w-4 h-4" />
                          {item.type === 'video' ? 'Watch' : item.type === 'link' ? 'Open' : 'View'}
                        </button>
                        {item.type !== 'link' && (item.type !== 'video' || item.fileId) && (
                          <button
                            onClick={() => { markSeen(item.id); downloadMaterial(code, item); }}
                            className="w-9 h-9 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-white shrink-0"
                            aria-label={`Download ${item.title}`}
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
        {filtering && !units.some((u) => u.items.some(matches)) && (
          <p className="py-12 text-center text-zinc-500">No materials match your search.</p>
        )}
      </div>

      {preview && <PreviewModal item={preview} subject={subject} onClose={() => setPreview(null)} />}
    </div>
  );
}
