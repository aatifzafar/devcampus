import React, { useMemo, useState } from 'react';
import { ArrowLeftRight, CalendarClock, Check, CircleCheck, Clock, HandHeart, MapPin, Search, Star, Users, Video, X } from 'lucide-react';
import { MY_SKILLS, PAST_SESSIONS, PEERS, RULE_CHECKS, TUTOR_RULES, isSelected, subjectAny } from '../../data/featuresData';
import { Button, Card, CardTitle, Chips, Empty, Field, Modal, Pill, Stat, SubjectTag, CURRENT_SUBJECTS, fmtWhen, inputClass, useStoredState } from '../pages/ui';

const useSessions = () => useStoredState('alliance-peer-sessions', PAST_SESSIONS.map((s) => ({ ...s, when: s.when.toISOString() })));
const useMyTutoring = () => useStoredState('alliance-my-tutoring', { willing: false, subjects: [], slots: [] });

const initials = (n) => n.split(' ').map((w) => w[0]).join('').slice(0, 2);

function Stars({ value, size = 'w-4 h-4' }) {
  return (
    <span className="inline-flex">
      {[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`${size} ${n <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'}`} />)}
    </span>
  );
}

function RuleBadges({ checks }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {TUTOR_RULES.map((r) => {
        const v = checks[r.id];
        const tone = v === true ? 'green' : v === 'trial' ? 'amber' : 'zinc';
        return (
          <Pill key={r.id} tone={tone} className={v === false ? 'opacity-60' : ''}>
            {v === true ? <Check className="w-3 h-3" /> : v === 'trial' ? <Clock className="w-3 h-3" /> : <X className="w-3 h-3" />}
            {r.label}
          </Pill>
        );
      })}
    </div>
  );
}

/* ================================================================== */
/* Request a session                                                   */
/* ================================================================== */

function RequestModal({ peer, code, onClose, onSend }) {
  const [topic, setTopic] = useState('');
  const [slot, setSlot] = useState(peer.slots[0]);
  const [mode, setMode] = useState('Online');
  const [error, setError] = useState('');
  const send = () => {
    if (topic.trim().length < 3) {
      setError('Say which topic you need help with');
      return;
    }
    onSend({ topic: topic.trim(), slot, mode });
  };
  return (
    <Modal
      title={`Ask ${peer.name.split(' ')[0]} for help`}
      subtitle={`${subjectAny(code).name} · Free, peer-to-peer`}
      onClose={onClose}
      footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" onClick={send}>Send request</Button></>}
    >
      <Field label="Topic">
        <input value={topic} onChange={(e) => { setTopic(e.target.value); setError(''); }} className={inputClass} placeholder="Converting an NFA to a DFA" />
        {error && <span className="block text-sm text-red-600 mt-1.5">{error}</span>}
      </Field>
      <Field label="When">
        <div className="flex flex-wrap gap-2">
          {peer.slots.map((s) => (
            <button key={s} onClick={() => setSlot(s)} className={`px-3.5 py-2 rounded-full border text-sm ${slot === s ? 'border-[#6D3FC0] bg-[#F7F5FD] text-[#4C2E8A] font-medium' : 'border-zinc-200 text-zinc-700'}`}>{s}</button>
          ))}
        </div>
      </Field>
      <Field label="Where">
        <div className="flex gap-2">
          {['Online', 'Library, group room'].map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-sm ${mode === m ? 'border-[#6D3FC0] bg-[#F7F5FD] text-[#4C2E8A] font-medium' : 'border-zinc-200 text-zinc-700'}`}>
              {m === 'Online' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}{m}
            </button>
          ))}
        </div>
      </Field>
      <p className="text-xs text-zinc-500">{peer.name.split(' ')[0]} gets a notification and confirms the time. After the session you can leave a review.</p>
    </Modal>
  );
}

/* ================================================================== */
/* Find a peer tutor                                                   */
/* ================================================================== */

function TutorCard({ peer, code, onRequest }) {
  const checks = RULE_CHECKS(peer, code);
  const grade = peer.teaches.find(([c]) => c === code)?.[1];
  return (
    <Card className="flex flex-col">
      <div className="flex items-start gap-3 mb-3">
        <span className="w-12 h-12 rounded-2xl bg-[#F1EEFB] text-[#4C2E8A] font-semibold flex items-center justify-center shrink-0">{initials(peer.name)}</span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-zinc-900">{peer.name}</p>
          <p className="text-xs text-zinc-500">Semester {peer.sem} · Section {peer.section}{peer.sem > 5 ? ' · Senior' : ''}</p>
          <div className="flex items-center gap-1.5 mt-1">
            {peer.rating ? (
              <>
                <Stars value={peer.rating} size="w-3.5 h-3.5" />
                <span className="text-xs text-zinc-600">{peer.rating.toFixed(1)} · {peer.reviews} reviews</span>
              </>
            ) : (
              <Pill tone="amber">New tutor</Pill>
            )}
          </div>
        </div>
        <span className="text-right shrink-0">
          <span className="block text-lg font-semibold text-zinc-900">{grade}</span>
          <span className="block text-[11px] text-zinc-500">{grade?.endsWith('%') ? 'test avg' : 'grade'}</span>
        </span>
      </div>
      <p className="text-sm text-zinc-700 mb-3">“{peer.bio}”</p>
      <RuleBadges checks={checks} />
      <div className="flex items-center gap-3 mt-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{peer.sessions} sessions</span>
        <span className="flex items-center gap-1"><CalendarClock className="w-3.5 h-3.5" />{peer.slots.join(', ')}</span>
      </div>
      <Button variant="primary" className="mt-4" onClick={() => onRequest(peer)}><HandHeart className="w-4 h-4" />Ask for help</Button>
    </Card>
  );
}

export function FindTutor({ onNavigate }) {
  const [code, setCode] = useState('CSE302');
  const [query, setQuery] = useState('');
  const [asking, setAsking] = useState(null);
  const [, setSessions] = useSessions();
  const [sent, setSent] = useState('');

  const q = query.trim().toLowerCase();
  const tutors = PEERS.filter((p) => p.teaches.some(([c]) => c === code))
    .map((p) => ({ p, checks: RULE_CHECKS(p, code) }))
    .filter(({ checks }) => isSelected(checks))
    .filter(({ p }) => !q || `${p.name} ${p.bio}`.toLowerCase().includes(q))
    .sort((a, b) => (b.p.rating || 4) - (a.p.rating || 4));
  const hidden = PEERS.filter((p) => p.teaches.some(([c]) => c === code)).length - tutors.length;

  return (
    <div className="space-y-5">
      <Card className="!p-5 bg-gradient-to-br from-[#F1EEFB] to-white">
        <p className="font-semibold text-zinc-900 mb-1">Learn from classmates and seniors who are strong in the subject</p>
        <p className="text-sm text-zinc-600 mb-3">Only students who volunteer and meet the selection rules are listed:</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1.5">
          {TUTOR_RULES.map((r) => <p key={r.id} className="text-xs text-zinc-600"><span className="font-medium text-zinc-900">{r.label}:</span> {r.text}</p>)}
        </div>
      </Card>

      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <Chips value={code} onChange={setCode} options={CURRENT_SUBJECTS.filter((s) => s.type === 'Theory').map((s) => ({ id: s.code, label: s.name }))} />
        <label className="relative lg:ml-auto">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tutors" className={`${inputClass} !rounded-full pl-9 lg:w-52`} />
        </label>
      </div>

      {sent && <p className="text-sm text-emerald-800 bg-emerald-50 rounded-2xl px-4 py-3 flex items-center gap-2"><CircleCheck className="w-4 h-4" />{sent} <button onClick={() => onNavigate('friends-sessions')} className="underline ml-auto">My sessions</button></p>}

      {tutors.length === 0 ? (
        <Card><Empty icon={Users} title="No peer tutors for this subject yet" text="Strong in it yourself? Volunteer under Become a peer tutor." action={<Button onClick={() => onNavigate('friends-teach')}>Become a peer tutor</Button>} /></Card>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tutors.map(({ p }) => <TutorCard key={p.id} peer={p} code={code} onRequest={setAsking} />)}
        </div>
      )}
      {hidden > 0 && <p className="text-xs text-zinc-500">{hidden} other student{hidden > 1 ? 's' : ''} offered to teach this subject but don’t meet the selection rules yet.</p>}

      {asking && (
        <RequestModal
          peer={asking}
          code={code}
          onClose={() => setAsking(null)}
          onSend={(r) => {
            setSessions((l) => [{ id: `s${Date.now()}`, tutorId: asking.id, code, topic: r.topic, slot: r.slot, mode: r.mode, status: 'requested', when: null }, ...l]);
            setSent(`Request sent to ${asking.name.split(' ')[0]} for ${r.slot}.`);
            setAsking(null);
          }}
        />
      )}
    </div>
  );
}

/* ================================================================== */
/* Skill swap                                                          */
/* ================================================================== */

export function SkillSwap() {
  const [mine, setMine] = useStoredState('alliance-swap', { give: MY_SKILLS.strong.map(([c]) => c), need: ['CSE302', 'CSE304'] });
  const [proposed, setProposed] = useStoredState('alliance-swap-proposed', []);
  const options = [...new Set([...CURRENT_SUBJECTS.filter((s) => s.type === 'Theory').map((s) => s.code), ...MY_SKILLS.strong.map(([c]) => c)])];
  const toggle = (key, c) => setMine((m) => ({ ...m, [key]: m[key].includes(c) ? m[key].filter((x) => x !== c) : [...m[key], c] }));

  const matches = useMemo(
    () =>
      PEERS.map((p) => {
        const theyTeach = p.teaches.map(([c]) => c).filter((c) => mine.need.includes(c));
        const theyWant = p.wants.filter((c) => mine.give.includes(c));
        return { p, theyTeach, theyWant, perfect: theyTeach.length && theyWant.length };
      })
        .filter((m) => m.theyTeach.length)
        .sort((a, b) => (b.perfect ? 1 : 0) - (a.perfect ? 1 : 0) || (b.p.rating || 4) - (a.p.rating || 4)),
    [mine]
  );

  const Picker = ({ title, hint, k }) => (
    <Card>
      <CardTitle hint={hint}>{title}</CardTitle>
      <div className="flex flex-wrap gap-2">
        {options.map((c) => {
          const on = mine[k].includes(c);
          return (
            <button key={c} onClick={() => toggle(k, c)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm ${on ? 'border-[#6D3FC0] bg-[#F7F5FD] text-[#4C2E8A] font-medium' : 'border-zinc-200 text-zinc-600'}`}>
              {on && <Check className="w-3.5 h-3.5" />}{subjectAny(c).name}
            </button>
          );
        })}
      </div>
    </Card>
  );

  return (
    <div className="space-y-5">
      <div className="grid lg:grid-cols-2 gap-5">
        <Picker title="I can help with" hint="Subjects you are strong in" k="give" />
        <Picker title="I need help with" hint="Subjects you want to improve" k="need" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-zinc-900 mb-3">{matches.length} match{matches.length === 1 ? '' : 'es'}</h3>
        {matches.length === 0 ? (
          <Card><Empty icon={ArrowLeftRight} title="No matches yet" text="Pick the subjects you need help with above." /></Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {matches.map(({ p, theyTeach, theyWant, perfect }) => (
              <Card key={p.id} className={perfect ? '!border-[#6D3FC0]' : ''}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-10 h-10 rounded-full bg-[#F1EEFB] text-[#4C2E8A] text-sm font-semibold flex items-center justify-center">{initials(p.name)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-zinc-900">{p.name}</p>
                    <p className="text-xs text-zinc-500">Semester {p.sem}{p.rating ? ` · ${p.rating.toFixed(1)}★` : ' · New tutor'}</p>
                  </div>
                  {perfect ? <Pill tone="violet"><ArrowLeftRight className="w-3 h-3" />Perfect swap</Pill> : <Pill>Can help you</Pill>}
                </div>
                <p className="text-sm text-zinc-700"><span className="text-zinc-500">Teaches you:</span> {theyTeach.map((c) => subjectAny(c).name).join(', ')}</p>
                {theyWant.length > 0 && <p className="text-sm text-zinc-700"><span className="text-zinc-500">You teach them:</span> {theyWant.map((c) => subjectAny(c).name).join(', ')}</p>}
                <Button className="mt-4 w-full" variant={proposed.includes(p.id) ? 'secondary' : 'primary'} disabled={proposed.includes(p.id)} onClick={() => setProposed((l) => [...l, p.id])}>
                  {proposed.includes(p.id) ? <><CircleCheck className="w-4 h-4" />Swap proposed</> : perfect ? 'Propose a swap' : 'Ask for help'}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/* My sessions                                                         */
/* ================================================================== */

export function MySessions({ onNavigate }) {
  const [sessions, setSessions] = useSessions();
  const [reviewing, setReviewing] = useState(null);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const peer = (id) => PEERS.find((p) => p.id === id);

  const requested = sessions.filter((s) => s.status === 'requested');
  const past = sessions.filter((s) => s.status !== 'requested');

  if (!sessions.length) return <Card><Empty icon={Users} title="No sessions yet" text="Find a peer tutor to get started." action={<Button variant="primary" onClick={() => onNavigate('friends-find')}>Find a peer tutor</Button>} /></Card>;

  return (
    <div className="space-y-5 max-w-3xl">
      {requested.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 mb-3">Waiting for confirmation</h3>
          <div className="space-y-3">
            {requested.map((s) => (
              <Card key={s.id} className="flex items-center gap-4">
                <span className="w-10 h-10 rounded-full bg-[#F1EEFB] text-[#4C2E8A] text-sm font-semibold flex items-center justify-center">{initials(peer(s.tutorId).name)}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-zinc-900">{s.topic}</p>
                  <p className="text-xs text-zinc-500">{peer(s.tutorId).name} · {subjectAny(s.code).name} · {s.slot} · {s.mode}</p>
                </div>
                <Pill tone="amber">Requested</Pill>
                <button onClick={() => setSessions((l) => l.filter((x) => x.id !== s.id))} className="text-sm text-zinc-500 hover:text-red-600">Cancel</button>
              </Card>
            ))}
          </div>
        </div>
      )}
      <div>
        <h3 className="text-sm font-semibold text-zinc-900 mb-3">Past sessions</h3>
        <div className="space-y-3">
          {past.map((s) => (
            <Card key={s.id} className="flex items-center gap-4">
              <span className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-600 text-sm font-semibold flex items-center justify-center">{initials(peer(s.tutorId).name)}</span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-zinc-900">{s.topic}</p>
                <p className="text-xs text-zinc-500">{peer(s.tutorId).name} · {subjectAny(s.code).name} · {fmtWhen(new Date(s.when))} · {s.mode}</p>
              </div>
              {s.reviewed ? <Stars value={s.stars} /> : <Button variant="primary" onClick={() => { setReviewing(s); setStars(0); setComment(''); }}><Star className="w-4 h-4" />Review</Button>}
            </Card>
          ))}
        </div>
      </div>
      {reviewing && (
        <Modal
          title={`How was your session with ${peer(reviewing.tutorId).name.split(' ')[0]}?`}
          subtitle={reviewing.topic}
          onClose={() => setReviewing(null)}
          footer={<><Button onClick={() => setReviewing(null)}>Later</Button><Button variant="primary" disabled={!stars} onClick={() => { setSessions((l) => l.map((x) => (x.id === reviewing.id ? { ...x, reviewed: true, stars, comment } : x))); setReviewing(null); }}>Submit review</Button></>}
        >
          <div className="flex justify-center gap-2 mb-5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setStars(n)} aria-label={`${n} stars`}><Star className={`w-9 h-9 ${n <= stars ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'}`} /></button>
            ))}
          </div>
          <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} className={inputClass} placeholder="What helped? (shown to the tutor)" />
          <p className="text-xs text-zinc-500 mt-2">Reviews decide whether a tutor keeps being listed.</p>
        </Modal>
      )}
    </div>
  );
}

/* ================================================================== */
/* Become a peer tutor                                                 */
/* ================================================================== */

export function BecomeTutor() {
  const [me, setMe] = useMyTutoring();
  const [saved, setSaved] = useState(false);
  const meAsPeer = { ...MY_SKILLS.stats, willing: true, teaches: MY_SKILLS.strong };
  const rows = MY_SKILLS.strong.map(([code, grade]) => ({ code, grade, checks: { ...RULE_CHECKS(meAsPeer, code), willing: me.subjects.includes(code) } }));
  const slots = ['Mon 5 pm', 'Tue 5 pm', 'Wed 5 pm', 'Thu 5 pm', 'Fri 5 pm', 'Sat 11 am', 'Sun 11 am'];

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Subjects you qualify for" value={rows.filter((r) => isSelected({ ...r.checks, willing: true })).length} tone="text-[#4C2E8A]" />
        <Stat label="Your streak" value={`${MY_SKILLS.stats.streak} days`} />
        <Stat label="Class position" value={`Top ${MY_SKILLS.stats.topPercent}%`} />
      </div>
      <Card>
        <CardTitle hint="Tick the subjects you are willing to teach. You are listed once you meet the rules.">Your subjects</CardTitle>
        <ul className="divide-y divide-zinc-100">
          {rows.map((r) => {
            const ok = isSelected({ ...r.checks, willing: true });
            const on = me.subjects.includes(r.code);
            return (
              <li key={r.code} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="checkbox"
                    checked={on}
                    disabled={!ok}
                    onChange={() => setMe((m) => ({ ...m, subjects: on ? m.subjects.filter((c) => c !== r.code) : [...m.subjects, r.code] }))}
                    className="w-5 h-5 accent-[#6D3FC0]"
                    aria-label={`Teach ${subjectAny(r.code).name}`}
                  />
                  <SubjectTag subject={subjectAny(r.code)} />
                  <span className="text-sm text-zinc-500">· {r.grade}</span>
                  <span className="ml-auto">{ok ? <Pill tone="green">Eligible</Pill> : <Pill>Not yet eligible</Pill>}</span>
                </div>
                <RuleBadges checks={r.checks} />
              </li>
            );
          })}
        </ul>
      </Card>
      <Card>
        <CardTitle hint="Learners can only request these times">When can you help?</CardTitle>
        <div className="flex flex-wrap gap-2 mb-5">
          {slots.map((s) => {
            const on = me.slots.includes(s);
            return <button key={s} onClick={() => setMe((m) => ({ ...m, slots: on ? m.slots.filter((x) => x !== s) : [...m.slots, s] }))} className={`px-3.5 py-2 rounded-full border text-sm ${on ? 'border-[#6D3FC0] bg-[#F7F5FD] text-[#4C2E8A] font-medium' : 'border-zinc-200 text-zinc-600'}`}>{s}</button>;
          })}
        </div>
        <label className="flex items-center gap-2.5 text-sm text-zinc-800 mb-5 cursor-pointer">
          <input type="checkbox" checked={me.willing} onChange={(e) => setMe((m) => ({ ...m, willing: e.target.checked }))} className="w-4 h-4 accent-[#6D3FC0]" />
          I’m willing to answer questions and teach peers. I can pause this any time.
        </label>
        <div className="flex items-center gap-3">
          <Button variant="primary" disabled={!me.willing || !me.subjects.length || !me.slots.length} onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}>
            {me.willing && me.subjects.length ? 'Save and list me' : 'Choose subjects and times'}
          </Button>
          {saved && <span className="text-sm text-emerald-700 flex items-center gap-1.5"><CircleCheck className="w-4 h-4" />You’re listed as a peer tutor.</span>}
        </div>
      </Card>
    </div>
  );
}
