import React, { useState } from 'react';
import { Award, Calendar, CircleCheck, Clock, MapPin, PartyPopper, Plus, Printer, Search, Ticket, Trophy, Users, X } from 'lucide-react';
import { CLUBS, EVENTS, EVENT_TYPES, clubOf, eventCertificates, loadEventState, saveEventState } from '../../data/eventsData';
import { Button, Card, Chips, Empty, Field, Modal, Pill, Stat, fmtDate, fmtTime, fromNow, inputClass } from '../pages/ui';

export const PRINT_CSS = `@media print {
  body *:not(:has(.print-area)):not(.print-area):not(.print-area *) { display: none !important; }
  html, body, #root, body *:has(.print-area) { height: auto !important; min-height: 0 !important; overflow: visible !important; background: #fff !important; padding: 0 !important; margin: 0 !important; border: 0 !important; box-shadow: none !important; position: static !important; transform: none !important; }
  .print-area { position: static !important; margin: 0 !important; box-shadow: none !important; width: 100% !important; min-height: 0 !important; }
  .resume-scale { transform: none !important; width: auto !important; }
  @page { size: A4; margin: 10mm; }
}`;

function useEventState() {
  const [s, setS] = useState(loadEventState);
  const update = (fn) =>
    setS((prev) => {
      const next = fn(prev);
      saveEventState(next);
      return next;
    });
  return [s, update];
}

const TYPE_TONE = { Hackathon: 'violet', Workshop: 'blue', Fest: 'red', Talk: 'amber', Competition: 'green' };
const dateRange = (e) =>
  e.start.toDateString() === e.end.toDateString()
    ? `${e.start.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}, ${fmtTime(e.start)} – ${fmtTime(e.end)}`
    : `${e.start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${e.end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;

/* ================================================================== */
/* Register                                                            */
/* ================================================================== */

function RegisterModal({ e, userName, onClose, onDone }) {
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState(['']);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');

  const submit = () => {
    if (e.team) {
      const filled = members.filter((m) => m.trim());
      if (!teamName.trim()) return setError('Give your team a name');
      if (filled.length + 1 < e.team.min) return setError(`Add at least ${e.team.min - 1} teammate${e.team.min > 2 ? 's' : ''}`);
    }
    if (!agree) return setError('Confirm that you’ll attend');
    onDone({ teamName: teamName.trim(), members: members.filter((m) => m.trim()) });
  };

  return (
    <Modal
      title={`Register: ${e.title}`}
      subtitle={`${dateRange(e)} · ${e.venue}`}
      onClose={onClose}
      footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" onClick={submit}><Ticket className="w-4 h-4" />Confirm registration</Button></>}
    >
      <p className="text-sm text-zinc-700 mb-5">{e.about}</p>
      {e.team && (
        <>
          <Field label="Team name">
            <input value={teamName} onChange={(x) => { setTeamName(x.target.value); setError(''); }} className={inputClass} placeholder="Null Pointers" />
          </Field>
          <Field label={`Team members (${e.team.min} to ${e.team.max} including you)`} hint="Enter roll numbers or university emails. They get an invite to confirm.">
            <div className="space-y-2">
              <div className="px-3.5 py-2.5 rounded-xl bg-zinc-50 text-sm text-zinc-600">{userName} (you)</div>
              {members.map((m, i) => (
                <div key={i} className="flex gap-2">
                  <input value={m} onChange={(x) => { setMembers((l) => l.map((v, j) => (j === i ? x.target.value : v))); setError(''); }} className={inputClass} placeholder="2411021061xxx" />
                  {members.length > 1 && <button onClick={() => setMembers((l) => l.filter((_, j) => j !== i))} className="px-2 text-zinc-400 hover:text-red-500" aria-label="Remove member"><X className="w-4 h-4" /></button>}
                </div>
              ))}
              {members.length + 1 < e.team.max && (
                <button onClick={() => setMembers((l) => [...l, ''])} className="text-sm text-[#6D3FC0] inline-flex items-center gap-1"><Plus className="w-4 h-4" />Add member</button>
              )}
            </div>
          </Field>
        </>
      )}
      <label className="flex items-start gap-2.5 text-sm text-zinc-800 cursor-pointer">
        <input type="checkbox" checked={agree} onChange={(x) => { setAgree(x.target.checked); setError(''); }} className="w-4 h-4 mt-0.5 accent-[#6D3FC0]" />
        I’ll attend. If my plans change, I’ll cancel so someone else can take the seat.
      </label>
      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
      {e.certificate && <p className="text-xs text-zinc-500 mt-4 flex items-center gap-1.5"><Award className="w-3.5 h-3.5" />Attendees get a certificate, added to Achievements and your resume automatically.</p>}
    </Modal>
  );
}

/* ================================================================== */
/* Certificate                                                         */
/* ================================================================== */

export function CertificateModal({ cert, name, onClose }) {
  return (
    <Modal wide title="Certificate" subtitle={cert.title} onClose={onClose} footer={<Button variant="primary" onClick={() => window.print()}><Printer className="w-4 h-4" />Print or save as PDF</Button>}>
      <style>{PRINT_CSS}</style>
      <div className="print-area bg-white">
        <div className="relative aspect-[1.414/1] rounded-2xl border-[10px] border-double border-[#6D3FC0]/70 p-8 sm:p-12 flex flex-col items-center justify-center text-center" style={{ fontFamily: 'Georgia, serif' }}>
          <p className="text-sm tracking-[0.3em] uppercase text-[#6D3FC0] mb-1">Alliance University</p>
          <p className="text-xs text-zinc-500 mb-6">{cert.by}</p>
          <p className="text-3xl sm:text-4xl text-zinc-900 mb-2">Certificate of {cert.score === 'Participation' ? 'Participation' : 'Achievement'}</p>
          <p className="text-sm text-zinc-500 mb-4">This is to certify that</p>
          <p className="text-2xl sm:text-3xl italic text-zinc-900 border-b border-zinc-300 px-8 pb-1 mb-4">{name}</p>
          <p className="text-[15px] text-zinc-700 max-w-lg">
            {cert.score === 'Participation' ? 'participated in' : `achieved “${cert.score}” in`} <span className="font-semibold">{cert.title}</span>, held on {fmtDate(cert.date)}.
          </p>
          <div className="flex justify-between w-full max-w-md mt-10 text-xs text-zinc-500">
            <span className="border-t border-zinc-400 pt-1 px-4">Faculty coordinator</span>
            <span className="border-t border-zinc-400 pt-1 px-4">Dean, Student Affairs</span>
          </div>
          <p className="absolute bottom-3 right-5 text-[10px] text-zinc-400" style={{ fontFamily: 'Inter, sans-serif' }}>Verify: AU-CERT-{cert.eventId.toUpperCase()}-{name.split(' ')[0].toUpperCase()}</p>
        </div>
      </div>
    </Modal>
  );
}

/* ================================================================== */
/* Pages                                                               */
/* ================================================================== */

function EventCard({ e, state, onRegister, onCancel }) {
  const reg = state.registered[e.id];
  const club = clubOf(e.club);
  const left = e.seats - e.registered - (reg ? 1 : 0);
  const closed = e.deadline < new Date();
  const full = left <= 0;
  return (
    <Card className="!p-0 overflow-hidden flex flex-col">
      <div className="h-24 relative flex items-end p-4" style={{ background: `linear-gradient(135deg, ${club.color}, ${club.color}99)` }}>
        <Pill tone={TYPE_TONE[e.type]} className="absolute top-3 left-3 !bg-white/90">{e.type}</Pill>
        {reg && <Pill tone="green" className="absolute top-3 right-3"><CircleCheck className="w-3 h-3" />Registered</Pill>}
        <p className="text-white/90 text-xs font-medium">{club.name}</p>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-zinc-900 leading-snug mb-2">{e.title}</h3>
        <p className="text-sm text-zinc-600 flex items-center gap-1.5"><Calendar className="w-4 h-4 text-zinc-400" />{dateRange(e)}</p>
        <p className="text-sm text-zinc-600 flex items-center gap-1.5 mb-3"><MapPin className="w-4 h-4 text-zinc-400" />{e.venue}</p>
        <p className="text-sm text-zinc-600 line-clamp-2 mb-3">{e.about}</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {e.team && <Pill><Users className="w-3 h-3" />Teams of {e.team.min}–{e.team.max}</Pill>}
          {e.prizes && <Pill tone="amber"><Trophy className="w-3 h-3" />{e.prizes}</Pill>}
          {(e.tags || []).filter((t) => t !== 'Prizes' && t !== 'Team event').map((t) => <Pill key={t}>{t}</Pill>)}
        </div>
        <div className="mt-auto">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-zinc-500">{full ? 'Full' : `${left} of ${e.seats} seats left`}</span>
            <span className={closed ? 'text-red-600' : 'text-zinc-500'}>{closed ? 'Registration closed' : `Closes ${fromNow(e.deadline)}`}</span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden mb-4">
            <div className="h-full rounded-full" style={{ width: `${Math.min(100, ((e.seats - left) / e.seats) * 100)}%`, background: club.color }} />
          </div>
          {reg ? (
            <Button className="w-full" onClick={() => onCancel(e)}>Cancel registration</Button>
          ) : (
            <Button variant="primary" className="w-full" disabled={closed || full} onClick={() => onRegister(e)}>
              <Ticket className="w-4 h-4" />{closed ? 'Closed' : full ? 'Full' : 'Register'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export function EventsUpcoming({ userProfile, onNavigate }) {
  const [state, update] = useEventState();
  const [type, setType] = useState('All');
  const [query, setQuery] = useState('');
  const [registering, setRegistering] = useState(null);
  const [toast, setToast] = useState('');

  const q = query.trim().toLowerCase();
  const upcoming = EVENTS.filter((e) => e.end > new Date()).sort((a, b) => a.start - b.start);
  const shown = upcoming.filter((e) => (type === 'All' || e.type === type) && (!q || `${e.title} ${e.about} ${clubOf(e.club).name}`.toLowerCase().includes(q)));
  const featured = upcoming.find((e) => e.featured);

  const flash = (t) => {
    setToast(t);
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="space-y-5">
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white text-sm px-4 py-2.5 rounded-full shadow-lg">{toast}</div>}
      {featured && type === 'All' && !q && (
        <Card className="!p-0 overflow-hidden">
          <div className="grid md:grid-cols-[1.4fr_1fr]">
            <div className="p-6 sm:p-8 text-white" style={{ background: 'linear-gradient(135deg, #4C2E8A, #6D3FC0 60%, #8B5CF6)' }}>
              <Pill className="!bg-white/20 !text-white mb-3">Featured · {featured.type}</Pill>
              <h2 className="text-2xl font-semibold mb-2">{featured.title}</h2>
              <p className="text-white/80 text-sm mb-4">{featured.about}</p>
              <p className="text-sm flex items-center gap-1.5"><Calendar className="w-4 h-4" />{dateRange(featured)} · {featured.venue}</p>
            </div>
            <div className="p-6 flex flex-col justify-center gap-3">
              <Stat label="Starts" value={fromNow(featured.start)} />
              <p className="text-sm text-zinc-600 flex items-center gap-1.5"><Trophy className="w-4 h-4 text-amber-500" />{featured.prizes}</p>
              <p className="text-sm text-zinc-600 flex items-center gap-1.5"><Users className="w-4 h-4 text-zinc-400" />{featured.registered} registered · {featured.seats - featured.registered} seats left</p>
              {state.registered[featured.id] ? (
                <Button onClick={() => onNavigate('events-mine')}><CircleCheck className="w-4 h-4 text-emerald-600" />You’re registered · View ticket</Button>
              ) : (
                <Button variant="primary" onClick={() => setRegistering(featured)}><Ticket className="w-4 h-4" />Register your team</Button>
              )}
            </div>
          </div>
        </Card>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <Chips value={type} onChange={setType} options={['All', ...EVENT_TYPES].map((t) => ({ id: t, label: t === 'All' ? 'All events' : `${t}s` }))} />
        <label className="relative lg:ml-auto">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search events" className={`${inputClass} !rounded-full pl-9 lg:w-56`} />
        </label>
      </div>

      {shown.length === 0 ? (
        <Card><Empty icon={PartyPopper} title="No events here yet" text="Check back soon, or join a club to hear about events first." /></Card>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {shown.map((e) => (
            <EventCard
              key={e.id}
              e={e}
              state={state}
              onRegister={setRegistering}
              onCancel={(x) => { update((s) => { const r = { ...s.registered }; delete r[x.id]; return { ...s, registered: r }; }); flash('Registration cancelled'); }}
            />
          ))}
        </div>
      )}

      {registering && (
        <RegisterModal
          e={registering}
          userName={userProfile?.fullName || 'You'}
          onClose={() => setRegistering(null)}
          onDone={(d) => {
            const id = `REG-${String(new Date().getFullYear()).slice(2)}${registering.id.toUpperCase()}-${String(Math.floor(1000 + Math.random() * 9000))}`;
            update((s) => ({ ...s, registered: { ...s.registered, [registering.id]: { id, at: new Date().toISOString(), ...d } } }));
            flash(`Registered for ${registering.title}. It’s on your Planner.`);
            setRegistering(null);
          }}
        />
      )}
    </div>
  );
}

export function MyEvents({ userProfile, onNavigate }) {
  const [state] = useEventState();
  const [cert, setCert] = useState(null);
  const name = userProfile?.fullName || 'Student';
  const upcoming = EVENTS.filter((e) => state.registered[e.id] && e.end > new Date()).sort((a, b) => a.start - b.start);
  const certs = eventCertificates();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Upcoming" value={upcoming.length} tone="text-[#4C2E8A]" />
        <Stat label="Events attended" value={state.attended.length} />
        <Stat label="Certificates" value={certs.length} />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-zinc-900 mb-3">Your tickets</h3>
        {upcoming.length === 0 ? (
          <Card><Empty icon={Ticket} title="No upcoming registrations" action={<Button variant="primary" onClick={() => onNavigate('events')}>Browse events</Button>} /></Card>
        ) : (
          <div className="space-y-3">
            {upcoming.map((e) => {
              const r = state.registered[e.id];
              const club = clubOf(e.club);
              return (
                <div key={e.id} className="flex bg-white rounded-3xl border border-[#E4E4E7] overflow-hidden">
                  <div className="w-24 sm:w-28 shrink-0 flex flex-col items-center justify-center text-white" style={{ background: club.color }}>
                    <p className="text-xs uppercase opacity-80">{e.start.toLocaleDateString('en-IN', { month: 'short' })}</p>
                    <p className="text-3xl font-semibold leading-none">{e.start.getDate()}</p>
                    <p className="text-xs opacity-80">{e.start.toLocaleDateString('en-IN', { weekday: 'short' })}</p>
                  </div>
                  <div className="flex-1 p-4 sm:p-5 min-w-0 border-r-2 border-dashed border-zinc-200">
                    <p className="font-semibold text-zinc-900">{e.title}</p>
                    <p className="text-sm text-zinc-500 flex items-center gap-1.5"><Clock className="w-4 h-4" />{dateRange(e)}</p>
                    <p className="text-sm text-zinc-500 flex items-center gap-1.5"><MapPin className="w-4 h-4" />{e.venue}</p>
                    {r.teamName && <p className="text-sm text-zinc-700 mt-1">Team <span className="font-medium">{r.teamName}</span> · {r.members.length + 1} members</p>}
                  </div>
                  <div className="hidden sm:flex w-40 shrink-0 flex-col items-center justify-center p-4 text-center">
                    <p className="text-[11px] text-zinc-500">Show at entry</p>
                    <p className="font-mono text-sm font-semibold text-zinc-900 mt-1">{r.id}</p>
                    <Pill tone="violet" className="mt-2">{fromNow(e.start)}</Pill>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-zinc-900 mb-3">Certificates</h3>
        <Card className="!p-0 overflow-hidden">
          <ul className="divide-y divide-zinc-100">
            {certs.map((c) => (
              <li key={c.eventId} className="flex items-center gap-4 px-5 py-4">
                <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><Award className="w-5 h-5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-zinc-900">{c.title}</p>
                  <p className="text-xs text-zinc-500">{c.by} · {fmtDate(c.date)}</p>
                </div>
                <Pill tone={c.score === 'Participation' ? 'zinc' : 'green'}>{c.score}</Pill>
                <Button onClick={() => setCert(c)}>View</Button>
              </li>
            ))}
          </ul>
        </Card>
        <p className="text-xs text-zinc-500 mt-2">Certificates also appear under Achievements and on your resume.</p>
      </div>
      {cert && <CertificateModal cert={cert} name={name} onClose={() => setCert(null)} />}
    </div>
  );
}

export function Clubs({ onNavigate }) {
  const [state, update] = useEventState();
  const toggle = (id) => update((s) => ({ ...s, clubs: s.clubs.includes(id) ? s.clubs.filter((c) => c !== id) : [...s.clubs, id] }));
  return (
    <div className="space-y-5">
      <p className="text-sm text-zinc-600">Join clubs to hear about their events first. You’re in {state.clubs.length} club{state.clubs.length === 1 ? '' : 's'}.</p>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {CLUBS.map((c) => {
          const joined = state.clubs.includes(c.id);
          const next = EVENTS.filter((e) => e.club === c.id && e.end > new Date()).length;
          return (
            <Card key={c.id} className="flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-12 h-12 rounded-2xl text-white text-lg font-semibold flex items-center justify-center" style={{ background: c.color }}>{c.name[0]}</span>
                <div>
                  <p className="font-semibold text-zinc-900">{c.name}</p>
                  <p className="text-xs text-zinc-500">{c.members + (joined ? 1 : 0)} members · Lead: {c.lead}</p>
                </div>
              </div>
              <p className="text-sm text-zinc-600 mb-4">{c.about}</p>
              <div className="mt-auto flex items-center gap-2">
                <Button variant={joined ? 'secondary' : 'primary'} onClick={() => toggle(c.id)}>{joined ? <><CircleCheck className="w-4 h-4 text-emerald-600" />Joined</> : <><Plus className="w-4 h-4" />Join</>}</Button>
                {next > 0 && <button onClick={() => onNavigate('events')} className="text-sm text-[#6D3FC0] hover:underline ml-auto">{next} upcoming event{next > 1 ? 's' : ''}</button>}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
