import { readSaved } from '../../utils/session';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CircleCheck, Download, Eye, EyeOff, Globe, Link2, Mail, MapPin, Phone, Plus, Trash2, WandSparkles, X } from 'lucide-react';
import { SEMESTERS, CURRENT_SEMESTER } from '../../data/subjectsData';
import { STUDENT_INFO } from '../../data/homeData';
import { CERTIFICATES, PROJECT } from '../../data/appData';
import { clubOf, eventCertificates, loadEventState } from '../../data/eventsData';
import { Button, Card, CardTitle, Field, Pill, inputClass, useStoredState } from '../pages/ui';
import { PRINT_CSS } from './Events';

const readJSON = (key, fallback) => readSaved(key, fallback) ?? fallback;

/* ------------------------------------------------------------------ */
/* Everything the platform already knows about the student             */
/* ------------------------------------------------------------------ */

function useAutoData(userProfile) {
  return useMemo(() => {
    const past = SEMESTERS.filter((s) => s.sgpa);
    const cgpa = (past.reduce((n, s) => n + s.sgpa, 0) / past.length).toFixed(2);
    const now = new Date();
    const gradYear = now.getFullYear() + Math.ceil((8 - CURRENT_SEMESTER) / 2);
    const strong = SEMESTERS.flatMap((s) => s.subjects).filter((s) => ['O', 'A+'].includes(s.grade) && s.type === 'Theory').map((s) => s.name);
    const current = SEMESTERS.find((s) => s.number === CURRENT_SEMESTER).subjects.filter((s) => s.type === 'Theory').map((s) => s.name);

    const me = PROJECT.team.find((m) => m.you);
    const projects = [
      {
        id: 'mini',
        title: PROJECT.title,
        tech: 'React, Node.js, MySQL',
        points: [
          `${me ? me.role.replace(/^./, (c) => c.toUpperCase()) : 'Developer'} in a team of ${PROJECT.team.length}; mentored by ${PROJECT.mentor}.`,
          'Designed the ordering flow and database schema; topic approved with full marks.',
        ],
        auto: true,
      },
    ];

    const ev = loadEventState();
    const evCerts = eventCertificates();
    const certificates = [
      ...CERTIFICATES.map((c, i) => ({ id: `c${i}`, text: `${c.title}, ${c.by} (${c.year})${c.score && c.score !== 'Completed' ? ` · ${c.score}` : ''}` })),
      ...evCerts.filter((c) => c.score === 'Participation').map((c) => ({ id: `e-${c.eventId}`, text: `${c.title}, ${c.by} (${c.year})` })),
    ];

    const tutoring = readJSON('alliance-my-tutoring', { willing: false, subjects: [] });
    const solved = readJSON('alliance-solved', ['c1', 'c2']).length;
    const achievements = [
      ...evCerts.filter((c) => c.score !== 'Participation').map((c) => ({ id: `a-${c.eventId}`, text: `${c.score}, ${c.title} (${c.year})` })),
      ...(tutoring.willing && tutoring.subjects.length ? [{ id: 'tutor', text: `Peer tutor on Alliance.ai for ${tutoring.subjects.length} subject${tutoring.subjects.length > 1 ? 's' : ''}` }] : []),
      ...(solved ? [{ id: 'coding', text: `Solved ${solved} coding problems on the Alliance.ai practice track` }] : []),
      { id: 'sgpa', text: `SGPA improved every semester, from ${past[0].sgpa.toFixed(1)} to ${past[past.length - 1].sgpa.toFixed(1)}` },
    ];
    const activities = ev.clubs.map((id) => ({ id: `club-${id}`, text: `Member, ${clubOf(id).name}` }));

    const settings = readJSON('alliance-settings', {});
    return {
      name: userProfile?.fullName || 'Student name',
      email: userProfile?.email || 'name@alliance.edu.in',
      phone: settings.phone || '',
      location: 'Bengaluru, India',
      education: {
        degree: `${STUDENT_INFO.program.replace('B.Tech CSE', 'B.Tech, Computer Science and Engineering')}`,
        school: 'Alliance University, Bengaluru',
        years: `${gradYear - 4} – ${gradYear} (expected)`,
        cgpa,
        coursework: [...new Set([...strong, ...current])].slice(0, 8),
      },
      skills: ['Java', 'Python', 'C', 'C++', 'SQL', 'Data Structures', 'Algorithms', 'DBMS', 'Operating Systems', 'Computer Networks', 'Git'],
      projects,
      certificates,
      achievements,
      activities,
    };
  }, [userProfile]);
}

/* ------------------------------------------------------------------ */
/* Resume sheet (shared by both templates)                             */
/* ------------------------------------------------------------------ */

function Section({ title, modern, children }) {
  return (
    <section className="mb-4 break-inside-avoid">
      <h3 className={`text-[11px] font-bold tracking-[0.14em] uppercase mb-1.5 pb-1 border-b ${modern ? 'text-[#4C2E8A] border-[#6D3FC0]/40' : 'text-zinc-800 border-zinc-300'}`}>{title}</h3>
      {children}
    </section>
  );
}

function Sheet({ r, modern }) {
  const contact = [
    r.email && [Mail, r.email],
    r.phone && [Phone, r.phone],
    [MapPin, r.location],
    r.links.linkedin && [Link2, r.links.linkedin.replace(/^https?:\/\/(www\.)?/, '')],
    r.links.github && [Link2, r.links.github.replace(/^https?:\/\/(www\.)?/, '')],
    r.links.portfolio && [Globe, r.links.portfolio.replace(/^https?:\/\/(www\.)?/, '')],
  ].filter(Boolean);
  const List = ({ items }) => <ul className="list-disc pl-4 space-y-0.5">{items.map((x) => <li key={x.id}>{x.text}</li>)}</ul>;

  const main = (
    <>
      {r.summary && <Section title="Summary" modern={modern}><p>{r.summary}</p></Section>}
      <Section title="Education" modern={modern}>
        <div className="flex justify-between gap-3"><p className="font-semibold text-zinc-900">{r.education.degree}</p><p className="shrink-0">{r.education.years}</p></div>
        <div className="flex justify-between gap-3"><p>{r.education.school}</p><p className="shrink-0 font-semibold text-zinc-900">CGPA {r.education.cgpa}/10</p></div>
        <p className="mt-1"><span className="text-zinc-500">Relevant coursework:</span> {r.education.coursework.join(', ')}</p>
      </Section>
      {r.projects.length > 0 && (
        <Section title="Projects" modern={modern}>
          {r.projects.map((p) => (
            <div key={p.id} className="mb-2">
              <p><span className="font-semibold text-zinc-900">{p.title}</span>{p.tech && <span className="text-zinc-500"> · {p.tech}</span>}</p>
              <ul className="list-disc pl-4 space-y-0.5">{p.points.filter(Boolean).map((pt, i) => <li key={i}>{pt}</li>)}</ul>
            </div>
          ))}
        </Section>
      )}
      {r.achievements.length > 0 && <Section title="Achievements" modern={modern}><List items={r.achievements} /></Section>}
      {!modern && r.certificates.length > 0 && <Section title="Certifications" modern={modern}><List items={r.certificates} /></Section>}
      {!modern && r.activities.length > 0 && <Section title="Activities" modern={modern}><List items={r.activities} /></Section>}
    </>
  );

  if (modern) {
    return (
      <div className="text-[12.5px] leading-snug text-zinc-700">
        <header className="bg-[#4C2E8A] text-white px-8 py-6">
          <h1 className="text-3xl font-bold tracking-tight">{r.name}</h1>
          <p className="text-white/80 text-sm">{r.headline}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[11.5px] text-white/90">
            {contact.map(([Icon, t]) => <span key={t} className="inline-flex items-center gap-1"><Icon className="w-3 h-3" />{t}</span>)}
          </div>
        </header>
        <div className="grid grid-cols-[1fr_200px] gap-6 px-8 py-6">
          <div>{main}</div>
          <aside>
            <Section title="Skills" modern><div className="flex flex-wrap gap-1">{r.skills.map((s) => <span key={s} className="px-2 py-0.5 rounded bg-[#F1EEFB] text-[#4C2E8A] text-[11px]">{s}</span>)}</div></Section>
            {r.certificates.length > 0 && <Section title="Certifications" modern><ul className="space-y-1.5">{r.certificates.map((c) => <li key={c.id}>{c.text}</li>)}</ul></Section>}
            {r.activities.length > 0 && <Section title="Activities" modern><ul className="space-y-1">{r.activities.map((c) => <li key={c.id}>{c.text}</li>)}</ul></Section>}
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="text-[12.5px] leading-snug text-zinc-700 px-10 py-8">
      <header className="text-center mb-4">
        <h1 className="text-[28px] font-bold tracking-tight text-zinc-900">{r.name}</h1>
        <p className="text-sm text-zinc-600">{r.headline}</p>
        <p className="text-[11.5px] text-zinc-600 mt-1.5 flex flex-wrap justify-center gap-x-3 gap-y-0.5">{contact.map(([, t]) => <span key={t}>{t}</span>)}</p>
      </header>
      {main.props.children.slice(0, 2)}
      <Section title="Skills"><p>{r.skills.join(' · ')}</p></Section>
      {main.props.children.slice(2)}
    </div>
  );
}

// Shows the A4 sheet scaled down to fit its column (printing uses full size).
function ScaledSheet({ children }) {
  const box = useRef(null);
  const inner = useRef(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(1123);
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      const w = box.current?.clientWidth || 794;
      setScale(Math.min(1, w / 794));
      setHeight(inner.current?.offsetHeight || 1123);
    });
    if (box.current) ro.observe(box.current);
    if (inner.current) ro.observe(inner.current);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={box} className="w-full overflow-hidden" style={{ height: height * scale }}>
      <div ref={inner} className="resume-scale origin-top-left" style={{ transform: `scale(${scale})`, width: 794 }}>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function ResumeBuilder({ userProfile }) {
  const auto = useAutoData(userProfile);
  const [s, setS] = useStoredState('alliance-resume', {
    template: 'classic',
    headline: 'B.Tech CSE student · Software developer',
    summary: '',
    skills: null,
    links: { linkedin: '', github: '', portfolio: '' },
    phone: null,
    hidden: [],
    extraProjects: [],
  });
  const [newSkill, setNewSkill] = useState('');
  const [draft, setDraft] = useState(null); // new project being added
  const [aiBusy, setAiBusy] = useState(false);
  const [aiNote, setAiNote] = useState('');
  const [aiConnected, setAiConnected] = useState(false);

  useEffect(() => {
    fetch('/api/ai/status').then((r) => r.json()).then((d) => setAiConnected(Boolean(d.connected))).catch(() => {});
  }, []);

  const set = (patch) => setS((x) => ({ ...x, ...patch }));
  const skills = s.skills || auto.skills;
  const visible = (id) => !s.hidden.includes(id);
  const toggleHidden = (id) => set({ hidden: s.hidden.includes(id) ? s.hidden.filter((h) => h !== id) : [...s.hidden, id] });

  const r = {
    name: auto.name,
    headline: s.headline,
    email: auto.email,
    phone: s.phone ?? auto.phone,
    location: auto.location,
    links: s.links,
    summary: s.summary,
    education: auto.education,
    skills,
    projects: [...auto.projects, ...s.extraProjects].filter((p) => visible(p.id)),
    certificates: auto.certificates.filter((c) => visible(c.id)),
    achievements: auto.achievements.filter((c) => visible(c.id)),
    activities: auto.activities.filter((c) => visible(c.id)),
  };

  const checks = [
    { ok: s.summary.trim().length >= 80, tip: 'Write a 2–3 sentence summary' },
    { ok: skills.length >= 6, tip: 'List at least 6 skills' },
    { ok: r.projects.length >= 2, tip: 'Add a second project (a personal or hackathon project counts)' },
    { ok: r.certificates.length >= 2, tip: 'Include at least 2 certifications' },
    { ok: Boolean(s.links.linkedin || s.links.github), tip: 'Add your LinkedIn or GitHub link' },
    { ok: Boolean(r.phone), tip: 'Add a phone number' },
    { ok: r.achievements.length >= 2, tip: 'Show at least 2 achievements' },
  ];
  const strength = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);

  const localSummary = () => {
    const proj = r.projects[0];
    const ach = r.achievements[0];
    return `Computer Science undergraduate at Alliance University (CGPA ${auto.education.cgpa}) with strong foundations in ${skills.slice(5, 8).join(', ').toLowerCase() || 'core computer science'} and hands-on experience in ${skills.slice(0, 3).join(', ')}. ${proj ? `Built ${proj.title.split(':')[0]} as part of a team project. ` : ''}${ach ? `${ach.text.split(' (')[0]}. ` : ''}Looking for a software engineering internship where I can learn fast and ship useful products.`;
  };

  const writeSummary = async () => {
    setAiBusy(true);
    setAiNote('');
    try {
      if (!aiConnected) throw new Error('demo');
      const facts = `Name: ${r.name}. ${auto.education.degree}, ${auto.education.school}, CGPA ${auto.education.cgpa}. Skills: ${skills.join(', ')}. Projects: ${r.projects.map((p) => p.title).join('; ')}. Achievements: ${r.achievements.map((a) => a.text).join('; ')}. Certifications: ${r.certificates.map((c) => c.text).join('; ')}.`;
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: `Write a resume summary for a student applying for software internships. 2 to 3 sentences, first person implied (no "I"), no buzzwords, under 60 words, plain text only, no headings or markdown. Use only these facts: ${facts}` }] }),
      });
      const data = await res.json();
      if (!res.ok || data.mode !== 'live') throw new Error('demo');
      set({ summary: data.reply.replace(/\*\*/g, '').replace(/^["“]|["”]$/g, '').trim() });
      setAiNote('Written by Claude from your profile. Edit it to sound like you.');
    } catch {
      set({ summary: localSummary() });
      setAiNote(aiConnected ? 'Couldn’t reach the AI, so here is a starter summary. Edit it to sound like you.' : 'Starter summary from your profile. Add an Anthropic API key for AI-written summaries.');
    } finally {
      setAiBusy(false);
    }
  };

  const Toggle = ({ id }) => (
    <button onClick={() => toggleHidden(id)} className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${visible(id) ? 'text-[#6D3FC0] hover:bg-[#F7F5FD]' : 'text-zinc-300 hover:bg-zinc-100'}`} aria-label={visible(id) ? 'Hide from resume' : 'Show on resume'} title={visible(id) ? 'Shown on resume' : 'Hidden'}>
      {visible(id) ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
    </button>
  );
  const ItemList = ({ title, items, hint }) => (
    <Card>
      <CardTitle hint={hint}>{title}</CardTitle>
      {items.length === 0 ? <p className="text-sm text-zinc-500">Nothing yet.</p> : (
        <ul className="space-y-1">
          {items.map((x) => (
            <li key={x.id} className="flex items-center gap-2">
              <span className={`text-sm flex-1 ${visible(x.id) ? 'text-zinc-800' : 'text-zinc-400 line-through'}`}>{x.text}</span>
              <Toggle id={x.id} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );

  return (
    <div className="grid xl:grid-cols-[420px_minmax(0,1fr)] gap-5 items-start">
      <style>{PRINT_CSS}</style>
      {/* Editor */}
      <div className="space-y-4">
        <Card>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-14 h-14 shrink-0">
              <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#F4F4F5" strokeWidth="4" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke={strength >= 80 ? '#10B981' : strength >= 50 ? '#F59E0B' : '#EF4444'} strokeWidth="4" strokeDasharray={`${strength * 0.974} 100`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-zinc-900">{strength}%</span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-zinc-900">Resume strength</p>
              <p className="text-xs text-zinc-500">Filled in from your Alliance.ai profile. Check and add what’s missing.</p>
            </div>
          </div>
          {checks.some((c) => !c.ok) && (
            <ul className="space-y-1 mb-4">
              {checks.filter((c) => !c.ok).map((c) => <li key={c.tip} className="text-xs text-amber-800 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" />{c.tip}</li>)}
            </ul>
          )}
          <div className="flex gap-2">
            {['classic', 'modern'].map((t) => (
              <button key={t} onClick={() => set({ template: t })} className={`flex-1 px-3 py-2 rounded-xl border text-sm capitalize ${s.template === t ? 'border-[#6D3FC0] bg-[#F7F5FD] text-[#4C2E8A] font-medium' : 'border-zinc-200 text-zinc-600'}`}>{t}</button>
            ))}
          </div>
          <Button variant="primary" className="w-full mt-3" onClick={() => window.print()}><Download className="w-4 h-4" />Download PDF</Button>
          <p className="text-[11px] text-zinc-500 mt-1.5 text-center">In the print window, choose “Save as PDF”.</p>
        </Card>

        <Card>
          <CardTitle hint="Name, email and education come from university records">Header and contact</CardTitle>
          <Field label="Headline"><input value={s.headline} onChange={(e) => set({ headline: e.target.value })} className={inputClass} /></Field>
          <Field label="Phone"><input value={s.phone ?? auto.phone} onChange={(e) => set({ phone: e.target.value })} className={inputClass} placeholder="+91 98xxx xxxxx" /></Field>
          <Field label="LinkedIn"><input value={s.links.linkedin} onChange={(e) => set({ links: { ...s.links, linkedin: e.target.value } })} className={inputClass} placeholder="linkedin.com/in/your-name" /></Field>
          <Field label="GitHub"><input value={s.links.github} onChange={(e) => set({ links: { ...s.links, github: e.target.value } })} className={inputClass} placeholder="github.com/your-name" /></Field>
          <Field label="Portfolio (optional)"><input value={s.links.portfolio} onChange={(e) => set({ links: { ...s.links, portfolio: e.target.value } })} className={inputClass} placeholder="your-site.dev" /></Field>
        </Card>

        <Card>
          <CardTitle action={<Button variant="ghost" className="!px-3 !py-1.5" disabled={aiBusy} onClick={writeSummary}><WandSparkles className="w-4 h-4" />{aiBusy ? 'Writing…' : 'Write for me'}</Button>}>Summary</CardTitle>
          <textarea value={s.summary} onChange={(e) => set({ summary: e.target.value })} rows={4} className={inputClass} placeholder="2–3 sentences: who you are, what you’re good at, and what you’re looking for." />
          {aiNote && <p className="text-xs text-zinc-500 mt-1.5">{aiNote}</p>}
        </Card>

        <Card>
          <CardTitle hint="From your subjects and practice. Add or remove freely.">Skills</CardTitle>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {skills.map((k) => (
              <span key={k} className="inline-flex items-center gap-1 pl-3 pr-1.5 py-1 rounded-full bg-zinc-100 text-sm text-zinc-700">
                {k}
                <button onClick={() => set({ skills: skills.filter((x) => x !== k) })} className="w-5 h-5 rounded-full hover:bg-zinc-200 flex items-center justify-center" aria-label={`Remove ${k}`}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); const k = newSkill.trim(); if (k && !skills.includes(k)) set({ skills: [...skills, k] }); setNewSkill(''); }} className="flex gap-2">
            <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} className={inputClass} placeholder="React, Docker, Figma…" />
            <Button type="submit" disabled={!newSkill.trim()}><Plus className="w-4 h-4" /></Button>
          </form>
        </Card>

        <Card>
          <CardTitle hint="Your mini project is added automatically">Projects</CardTitle>
          <ul className="space-y-2 mb-3">
            {[...auto.projects, ...s.extraProjects].map((p) => (
              <li key={p.id} className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium truncate ${visible(p.id) ? 'text-zinc-900' : 'text-zinc-400 line-through'}`}>{p.title}</p>
                  <p className="text-xs text-zinc-500">{p.auto ? 'From Alliance.ai' : p.tech}</p>
                </div>
                {!p.auto && <button onClick={() => set({ extraProjects: s.extraProjects.filter((x) => x.id !== p.id) })} className="w-8 h-8 rounded-full text-zinc-300 hover:text-red-500 flex items-center justify-center" aria-label="Delete project"><Trash2 className="w-4 h-4" /></button>}
                <Toggle id={p.id} />
              </li>
            ))}
          </ul>
          {draft ? (
            <div className="rounded-2xl border border-zinc-200 p-3 space-y-2">
              <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={inputClass} placeholder="Project name" />
              <input value={draft.tech} onChange={(e) => setDraft({ ...draft, tech: e.target.value })} className={inputClass} placeholder="Tech used: Python, Flask, OpenCV" />
              <textarea value={draft.points} onChange={(e) => setDraft({ ...draft, points: e.target.value })} rows={3} className={inputClass} placeholder={'What you did, one point per line\nBuilt a…\nImproved…'} />
              <div className="flex gap-2 justify-end">
                <Button onClick={() => setDraft(null)}>Cancel</Button>
                <Button variant="primary" disabled={!draft.title.trim()} onClick={() => { set({ extraProjects: [...s.extraProjects, { id: `p${Date.now()}`, title: draft.title.trim(), tech: draft.tech.trim(), points: draft.points.split('\n').map((x) => x.trim()).filter(Boolean) }] }); setDraft(null); }}>Add project</Button>
              </div>
            </div>
          ) : (
            <Button className="w-full" onClick={() => setDraft({ title: '', tech: '', points: '' })}><Plus className="w-4 h-4" />Add a project</Button>
          )}
        </Card>

        <ItemList title="Achievements" hint="From events, practice and peer tutoring" items={auto.achievements} />
        <ItemList title="Certifications" hint="Including event certificates" items={auto.certificates} />
        <ItemList title="Activities" hint="Clubs you’ve joined" items={auto.activities} />
      </div>

      {/* Preview */}
      <div className="xl:sticky xl:top-4 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-sm font-medium text-zinc-900">Preview</p>
          <Pill tone="green"><CircleCheck className="w-3 h-3" />Saved automatically</Pill>
        </div>
        <div className="rounded-2xl border border-[#E4E4E7] bg-zinc-100 p-3 sm:p-5">
          <ScaledSheet>
            <div className="print-area bg-white shadow-sm w-[794px] min-h-[1123px]">
              <Sheet r={r} modern={s.template === 'modern'} />
            </div>
          </ScaledSheet>
        </div>
      </div>
    </div>
  );
}
