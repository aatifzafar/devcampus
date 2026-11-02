import React, { useMemo, useState } from 'react';
import { Briefcase, Building2, Check, Copy, ExternalLink, GraduationCap, MapPin, MessageCircle, Search } from 'lucide-react';
import { ALUMNI } from '../../data/featuresData';
import { Button, Card, Chips, Empty, Modal, Pill, Stat, inputClass, useStoredState } from '../pages/ui';

const initials = (n) => n.split(' ').map((w) => w[0]).join('').slice(0, 2);

function GitHubIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
    </svg>
  );
}

const linkedinUrl = (a) => a.linkedin || `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${a.name} Alliance University`)}`;
const PALETTE = ['#005FB8', '#0F9D76', '#D85A30', '#2563EB', '#CA8A04', '#DB2777'];
const colorOf = (s) => PALETTE[[...s].reduce((n, c) => n + c.charCodeAt(0), 0) % PALETTE.length];

const useFilters = () => useStoredState('alliance-alumni-filters', { batch: 'all', company: 'all', domain: 'all', query: '', open: false });

function ProfileModal({ a, onClose }) {
  const [copied, setCopied] = useState(false);
  const message = `Hello ${a.name.split(' ')[0]}, I’m a ${'B.Tech CSE'} student at Alliance University (Semester 5). I saw you work as ${a.role} at ${a.company}. I’d be grateful for 10 minutes of advice on preparing for roles in ${a.domains[0].toLowerCase()}. Thank you!`;
  const copy = () => {
    navigator.clipboard?.writeText(message).then(() => setCopied(true)).catch(() => { });
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Modal
      title={a.name}
      subtitle={`${a.role} at ${a.company}`}
      onClose={onClose}
      footer={
        <a href={linkedinUrl(a)} target="_blank" rel="noopener noreferrer" className="elastic-btn-primary inline-flex items-center gap-1.5 text-sm">
          <ExternalLink className="w-4 h-4" />{a.linkedin ? 'Open LinkedIn profile' : 'Find on LinkedIn'}
        </a>
      }
    >
      <div className="flex items-center gap-4 mb-5">
        <span className="w-14 h-14 rounded-md text-white text-lg font-bold flex items-center justify-center shadow-xs" style={{ background: colorOf(a.company) }}>{initials(a.name)}</span>
        <div className="text-sm text-zinc-600 space-y-1">
          <p className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-zinc-400" />{a.program}, batch of {a.batch}</p>
          <p className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-zinc-400" />{a.years} years of experience</p>
          <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-zinc-400" />{a.location}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-5">{a.domains.map((d) => <Pill key={d}>{d}</Pill>)}</div>
      <h4 className="text-xs font-mono uppercase tracking-widest text-[#005FB8] font-bold mb-1">THEIR JOURNEY</h4>
      <p className="text-[14px] text-zinc-700 mb-4">{a.story}</p>
      <h4 className="text-xs font-mono uppercase tracking-widest text-[#005FB8] font-bold mb-1">ADVICE FOR STUDENTS</h4>
      <p className="text-[14px] text-zinc-800 bg-zinc-50 border border-zinc-200 rounded-md p-3.5 mb-5 font-sans italic">“{a.advice}”</p>
      {a.openToAdvice ? (
        <>
          <h4 className="text-xs font-mono uppercase tracking-widest text-[#005FB8] font-bold mb-1">CONNECT WITH ALUMNI</h4>
          <p className="text-xs text-zinc-500 mb-2">{a.name.split(' ')[0]} is open to advising students. Send a personalized note on LinkedIn:</p>
          <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-700 mb-3 font-mono leading-relaxed">{message}</div>
          <Button onClick={copy}>{copied ? <><Check className="w-4 h-4 text-emerald-600" />Copied to clipboard</> : <><Copy className="w-4 h-4" />Copy template</>}</Button>
        </>
      ) : (
        <p className="text-sm text-zinc-500">Not taking advice requests right now.</p>
      )}
    </Modal>
  );
}

export function AlumniDirectory() {
  const [f, setF] = useFilters();
  const [open, setOpen] = useState(null);
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));

  const batches = [...new Set(ALUMNI.map((a) => a.batch))].sort((a, b) => b - a);
  const companies = [...new Set(ALUMNI.map((a) => a.company))].sort();
  const domains = [...new Set(ALUMNI.flatMap((a) => a.domains))].sort();
  const q = f.query.trim().toLowerCase();
  const shown = ALUMNI.filter(
    (a) =>
      (f.batch === 'all' || a.batch === Number(f.batch)) &&
      (f.company === 'all' || a.company === f.company) &&
      (f.domain === 'all' || a.domains.includes(f.domain)) &&
      (!f.open || a.openToAdvice) &&
      (!q || `${a.name} ${a.company} ${a.role} ${a.location}`.toLowerCase().includes(q))
  ).sort((a, b) => b.batch - a.batch);
  const filtered = f.batch !== 'all' || f.company !== 'all' || f.domain !== 'all' || f.open || q;

  return (
    <div className="space-y-6">
      {/* Top wireframe stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="elastic-card p-5">
          <p className="text-[11px] font-mono uppercase tracking-widest text-[#005FB8] font-bold">ALUMNI DATABASE</p>
          <p className="text-3xl font-bold tracking-tight text-zinc-900 mt-1">{ALUMNI.length}</p>
          <p className="text-xs text-zinc-500 mt-1">Verified industry alumni</p>
        </div>
        <div className="elastic-card p-5">
          <p className="text-[11px] font-mono uppercase tracking-widest text-[#005FB8] font-bold">EMPLOYERS</p>
          <p className="text-3xl font-bold tracking-tight text-zinc-900 mt-1">{companies.length}</p>
          <p className="text-xs text-zinc-500 mt-1">Tech companies & enterprises</p>
        </div>
        <div className="elastic-card p-5">
          <p className="text-[11px] font-mono uppercase tracking-widest text-[#005FB8] font-bold">ADVICE MENTORS</p>
          <p className="text-3xl font-bold tracking-tight text-emerald-600 mt-1">{ALUMNI.filter((a) => a.openToAdvice).length}</p>
          <p className="text-xs text-zinc-500 mt-1">Available for 1:1 career guidance</p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="elastic-card p-4 flex flex-col lg:flex-row lg:items-center gap-3">
        <label className="relative lg:flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={f.query}
            onChange={(e) => set('query', e.target.value)}
            placeholder="Search by name, company, role or city..."
            className="w-full pl-9 pr-3.5 py-2 rounded-md border border-zinc-300 bg-white text-sm text-zinc-900 focus:outline-none focus:border-[#005FB8] focus:ring-1 focus:ring-[#005FB8]"
          />
        </label>
        <select
          value={f.company}
          onChange={(e) => set('company', e.target.value)}
          className="px-3 py-2 rounded-md border border-zinc-300 bg-white text-sm text-zinc-900 focus:outline-none focus:border-[#005FB8] lg:w-52"
          aria-label="Company"
        >
          <option value="all">All companies</option>
          {companies.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select
          value={f.domain}
          onChange={(e) => set('domain', e.target.value)}
          className="px-3 py-2 rounded-md border border-zinc-300 bg-white text-sm text-zinc-900 focus:outline-none focus:border-[#005FB8] lg:w-48"
          aria-label="Field"
        >
          <option value="all">All fields</option>
          {domains.map((d) => <option key={d}>{d}</option>)}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-3 px-1">
        <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold">BATCH:</span>
        <Chips value={String(f.batch)} onChange={(v) => set('batch', v)} options={[{ id: 'all', label: 'All' }, ...batches.map((b) => ({ id: String(b), label: String(b) }))]} />
        <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer sm:ml-auto font-medium">
          <input type="checkbox" checked={f.open} onChange={(e) => set('open', e.target.checked)} className="w-4 h-4 accent-[#005FB8] rounded" />
          Open to advice only
        </label>
      </div>

      <div className="flex items-center justify-between text-xs font-mono text-zinc-500 px-1">
        <span>SHOWING {shown.length} ALUMNI</span>
        {filtered && <button onClick={() => setF({ batch: 'all', company: 'all', domain: 'all', query: '', open: false })} className="text-[#005FB8] hover:underline font-bold">RESET FILTERS</button>}
      </div>

      {shown.length === 0 ? (
        <Card><Empty icon={GraduationCap} title="No alumni match" text="Try a different batch, company or field." /></Card>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {shown.map((a) => (
            <button
              key={a.id}
              onClick={() => setOpen(a)}
              className="elastic-card p-5 hover:border-[#005FB8] transition-all flex flex-col text-left cursor-pointer group"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#005FB8] font-bold">ALUMNI · BATCH {a.batch}</span>
                {a.openToAdvice && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Open to advice
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-11 h-11 rounded-md text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-xs" style={{ background: colorOf(a.company) }}>
                  {initials(a.name)}
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-zinc-900 truncate text-[15px] group-hover:text-[#005FB8] transition-colors">{a.name}</p>
                  <p className="text-xs text-zinc-500">{a.years} yrs experience</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-zinc-800 flex items-center gap-1.5 mb-0.5">
                <Building2 className="w-4 h-4 text-zinc-400 shrink-0" />{a.company}
              </p>
              <p className="text-xs text-zinc-500 mb-3">{a.role} · {a.location}</p>
              <p className="text-xs text-zinc-600 line-clamp-2 mb-4 bg-zinc-50 border border-zinc-200 rounded-md p-2.5 font-sans italic leading-relaxed">
                “{a.advice}”
              </p>
              <div className="mt-auto pt-3 border-t border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {a.domains.slice(0, 2).map((d) => <Pill key={d}>{d}</Pill>)}
                </div>
                <span className="text-xs font-semibold text-[#005FB8] flex items-center gap-1 group-hover:underline">
                  View profile &rarr;
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
      <p className="text-xs text-zinc-400 font-mono">Sample alumni directory for Alliance University CSE department.</p>
      {open && <ProfileModal a={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

export function AlumniCompanies({ onNavigate }) {
  const [, setF] = useFilters();
  const companies = useMemo(() => {
    const map = {};
    ALUMNI.forEach((a) => {
      map[a.company] = map[a.company] || { name: a.company, people: [], roles: new Set(), batches: new Set() };
      map[a.company].people.push(a);
      map[a.company].roles.add(a.role);
      map[a.company].batches.add(a.batch);
    });
    return Object.values(map).sort((a, b) => b.people.length - a.people.length || a.name.localeCompare(b.name));
  }, []);

  const go = (name) => {
    setF({ batch: 'all', company: name, domain: 'all', query: '', open: false });
    onNavigate('alumni');
  };

  return (
    <div className="space-y-6">
      <div className="elastic-card p-5">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#005FB8] font-bold">DIRECTORY INDEX</span>
        <h3 className="text-lg font-bold text-zinc-900 mt-0.5">Top Hiring Companies & Enterprise Partners</h3>
        <p className="text-sm text-zinc-500 mt-1">Browse alumni networks by organization and alumni batch representation.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {companies.map((c) => (
          <button
            key={c.name}
            onClick={() => go(c.name)}
            className="elastic-card p-5 hover:border-[#005FB8] transition-all text-left cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#005FB8] font-bold">COMPANY</span>
              <span className="text-[10px] font-mono text-zinc-400 font-semibold">{c.people.length} ALUMNI</span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-10 h-10 rounded-md text-white font-bold flex items-center justify-center shrink-0 shadow-xs" style={{ background: colorOf(c.name) }}>
                {c.name[0]}
              </span>
              <div className="min-w-0">
                <p className="font-bold text-zinc-900 group-hover:text-[#005FB8] transition-colors truncate">{c.name}</p>
                <p className="text-xs text-zinc-500">Batches {[...c.batches].sort().join(', ')}</p>
              </div>
            </div>
            <p className="text-xs text-zinc-600 line-clamp-2 bg-zinc-50 border border-zinc-200 rounded-md p-2 font-mono leading-relaxed">
              {[...c.roles].join(', ')}
            </p>
            <div className="mt-3 text-right">
              <span className="text-xs font-semibold text-[#005FB8] group-hover:underline">
                Explore alumni &rarr;
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
