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

const githubUrl = (a) => a.github || ("https://github.com/" + a.name.toLowerCase().replace(/[^a-z]/g, ""));

const linkedinUrl = (a) => a.linkedin || `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${a.name} Alliance University`)}`;
const PALETTE = ['#6D3FC0', '#0F9D76', '#D85A30', '#2563EB', '#CA8A04', '#DB2777'];
const colorOf = (s) => PALETTE[[...s].reduce((n, c) => n + c.charCodeAt(0), 0) % PALETTE.length];

const useFilters = () => useStoredState('alliance-alumni-filters', { batch: 'all', company: 'all', domain: 'all', query: '', open: false });

function ProfileModal({ a, onClose }) {
  const [copied, setCopied] = useState(false);
  const message = `Hello ${a.name.split(' ')[0]}, I’m a ${'B.Tech CSE'} student at Alliance University (Semester 5). I saw you work as ${a.role} at ${a.company}. I’d be grateful for 10 minutes of advice on preparing for roles in ${a.domains[0].toLowerCase()}. Thank you!`;
  const copy = () => {
    navigator.clipboard?.writeText(message).then(() => setCopied(true)).catch(() => {});
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Modal
      title={a.name}
      subtitle={`${a.role} at ${a.company}`}
      onClose={onClose}
      footer={
        <a href={linkedinUrl(a)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-[#0A66C2] text-white hover:bg-[#004182]">
          <ExternalLink className="w-4 h-4" />{a.linkedin ? 'Open LinkedIn profile' : 'Find on LinkedIn'}
        </a>
      }
    >
      <div className="flex items-center gap-4 mb-5">
        <span className="w-16 h-16 rounded-2xl text-white text-xl font-semibold flex items-center justify-center" style={{ background: colorOf(a.company) }}>{initials(a.name)}</span>
        <div className="text-sm text-zinc-600 space-y-1">
          <p className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-zinc-400" />{a.program}, batch of {a.batch}</p>
          <p className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-zinc-400" />{a.years} years of experience</p>
          <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-zinc-400" />{a.location}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-5">{a.domains.map((d) => <Pill key={d}>{d}</Pill>)}</div>
      <h4 className="text-sm font-semibold text-zinc-900 mb-1">Their journey</h4>
      <p className="text-[15px] text-zinc-700 mb-4">{a.story}</p>
      <h4 className="text-sm font-semibold text-zinc-900 mb-1">Advice for students</h4>
      <p className="text-[15px] text-zinc-700 bg-[#F7F5FD] rounded-2xl px-4 py-3 mb-5">“{a.advice}”</p>
      {a.openToAdvice ? (
        <>
          <h4 className="text-sm font-semibold text-zinc-900 mb-1">Ask for advice</h4>
          <p className="text-xs text-zinc-500 mb-2">{a.name.split(' ')[0]} is happy to hear from students. Send a short, polite note on LinkedIn, for example:</p>
          <div className="rounded-2xl border border-zinc-200 p-3 text-sm text-zinc-700 mb-2">{message}</div>
          <Button onClick={copy}>{copied ? <><Check className="w-4 h-4" />Copied</> : <><Copy className="w-4 h-4" />Copy message</>}</Button>
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
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Alumni on the platform" value={ALUMNI.length} tone="text-[#4C2E8A]" />
        <Stat label="Companies" value={companies.length} />
        <Stat label="Open to advice" value={ALUMNI.filter((a) => a.openToAdvice).length} />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <label className="relative lg:flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={f.query} onChange={(e) => set('query', e.target.value)} placeholder="Search by name, company, role or city" className={`${inputClass} !rounded-full pl-9`} />
        </label>
        <select value={f.company} onChange={(e) => set('company', e.target.value)} className={`${inputClass} !rounded-full lg:!w-52`} aria-label="Company">
          <option value="all">All companies</option>
          {companies.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={f.domain} onChange={(e) => set('domain', e.target.value)} className={`${inputClass} !rounded-full lg:!w-48`} aria-label="Field">
          <option value="all">All fields</option>
          {domains.map((d) => <option key={d}>{d}</option>)}
        </select>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-zinc-500">Batch</span>
        <Chips value={String(f.batch)} onChange={(v) => set('batch', v)} options={[{ id: 'all', label: 'All' }, ...batches.map((b) => ({ id: String(b), label: String(b) }))]} />
        <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer sm:ml-auto">
          <input type="checkbox" checked={f.open} onChange={(e) => set('open', e.target.checked)} className="w-4 h-4 accent-[#6D3FC0]" />
          Open to advice only
        </label>
      </div>
      <div className="flex items-center gap-3 text-sm text-zinc-500">
        {shown.length} alumni
        {filtered && <button onClick={() => setF({ batch: 'all', company: 'all', domain: 'all', query: '', open: false })} className="text-[#6D3FC0] hover:underline">Clear filters</button>}
      </div>

      {shown.length === 0 ? (
        <Card><Empty icon={GraduationCap} title="No alumni match" text="Try a different batch, company or field." /></Card>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {shown.map((a) => (
            <button key={a.id} onClick={() => setOpen(a)} className="text-left bg-white rounded-3xl border border-[#E4E4E7] p-5 hover:border-zinc-300 hover:shadow-sm transition-all flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-12 h-12 rounded-2xl text-white font-semibold flex items-center justify-center shrink-0" style={{ background: colorOf(a.company) }}>{initials(a.name)}</span>
                <div className="min-w-0">
                  <p className="font-semibold text-zinc-900 truncate">{a.name}</p>
                  <p className="text-xs text-zinc-500">Batch of {a.batch} · {a.years} yrs exp</p>
                </div>
              </div>
              <p className="text-sm font-medium text-zinc-900 flex items-center gap-1.5"><Building2 className="w-4 h-4 text-zinc-400" />{a.company}</p>
              <p className="text-sm text-zinc-600 mb-3">{a.role} · {a.location}</p>
              <p className="text-sm text-zinc-600 line-clamp-2 mb-4">“{a.advice}”</p>
              <div className="mt-auto flex items-center gap-1.5 flex-wrap">
                {a.domains.map((d) => <Pill key={d}>{d}</Pill>)}
                {a.openToAdvice && <Pill tone="green" className="ml-auto"><MessageCircle className="w-3 h-3" />Open to advice</Pill>}
              </div>
            </button>
          ))}
        </div>
      )}
      <p className="text-xs text-zinc-500">Sample alumni for the demo. Profiles link to LinkedIn so students can connect directly.</p>
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
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {companies.map((c) => (
        <button key={c.name} onClick={() => go(c.name)} className="text-left bg-white rounded-3xl border border-[#E4E4E7] p-5 hover:border-zinc-300 hover:shadow-sm transition-all">
          <span className="w-11 h-11 rounded-xl text-white font-semibold flex items-center justify-center mb-3" style={{ background: colorOf(c.name) }}>{c.name[0]}</span>
          <p className="font-semibold text-zinc-900">{c.name}</p>
          <p className="text-sm text-zinc-500 mb-2">{c.people.length} alumni · batches {[...c.batches].sort().join(', ')}</p>
          <p className="text-xs text-zinc-600 line-clamp-2">{[...c.roles].join(', ')}</p>
        </button>
      ))}
    </div>
  );
}
