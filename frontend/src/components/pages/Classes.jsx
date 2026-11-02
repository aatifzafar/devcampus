import React, { useEffect, useState } from 'react';
import { STUDENT_ROLL, liveForStudent, useStore } from '../../data/store';
// STUDENT_ROLL is the signed-in student's roll number.
import { CircleCheck, MapPin, Mic, MicOff, Users, Video, VideoOff } from 'lucide-react';
import { CLASSES_TODAY } from '../../data/homeData';
import { Button, Card, Empty, Pill, CURRENT_SUBJECTS, fmtTime, fromNow, subjectOf } from './ui';

function useNow(ms = 30000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

/* ================================================================== */
/* Live class room (demo)                                              */
/* ================================================================== */

function LiveRoom({ cls, onLeave }) {
  const [store, update] = useStore();
  const [mic, setMic] = useState(false);
  const [cam, setCam] = useState(false);
  const [vote, setVote] = useState(null);
  const live = cls.storeLive ? store.live : null;

  // Faculty poll when this is a class started from the faculty portal.
  const facultyPoll = live?.poll;
  const pollKey = facultyPoll?.launchedAt;
  useEffect(() => {
    setVote(live?.votes?.[STUDENT_ROLL] ?? null);
  }, [pollKey]); // eslint-disable-line react-hooks/exhaustive-deps

  if (cls.storeLive && !live) {
    return (
      <div className="fixed inset-0 z-50 bg-zinc-950 text-white flex flex-col items-center justify-center gap-4">
        <p className="text-lg">The class has ended.</p>
        <button onClick={onLeave} className="px-5 h-11 rounded-full bg-white text-zinc-900 text-sm font-medium">Back to classes</button>
      </div>
    );
  }

  const poll = cls.storeLive
    ? facultyPoll && { q: facultyPoll.q, options: facultyPoll.options, results: facultyPoll.options.map(() => 0), answer: facultyPoll.answer }
    : {
        q: 'Which condition must hold for a deadlock to occur?',
        options: ['Mutual exclusion only', 'All four Coffman conditions together', 'Any one Coffman condition', 'Preemption'],
        results: [8, 41, 9, 2],
        answer: 1,
      };
  const total = poll ? poll.results.reduce((a, b) => a + b, 0) + (vote !== null ? 1 : 0) : 0;
  const choose = (i) => {
    setVote(i);
    if (cls.storeLive) update((s) => ({ ...s, live: s.live && { ...s.live, votes: { ...s.live.votes, [STUDENT_ROLL]: i } } }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 text-white flex flex-col">
      <header className="px-5 py-3 flex items-center gap-3 border-b border-white/10">
        <Pill tone="red"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />Live</Pill>
        <div className="min-w-0">
          <p className="font-semibold truncate">{subjectOf(cls.subject.code).name}</p>
          <p className="text-xs text-white/60">{cls.storeLive ? 'Demo Teacher' : subjectOf(cls.subject.code).faculty} · {fmtTime(cls.start)}{cls.end ? ` – ${fmtTime(cls.end)}` : ''}</p>
        </div>
        <span className="ml-auto text-sm text-white/60 flex items-center gap-1.5"><Users className="w-4 h-4" />{cls.storeLive ? 'Class in progress' : '61 joined'}</span>
      </header>
      <div className="flex-1 grid lg:grid-cols-[1fr_360px] min-h-0">
        <div className="flex items-center justify-center p-6">
          <div className="w-full max-w-4xl aspect-video rounded-2xl bg-zinc-800 flex items-center justify-center text-white/50 text-center p-6">
            The faculty’s screen and video appear here during the class.
          </div>
        </div>
        <aside className="bg-zinc-900 border-l border-white/10 p-5 overflow-y-auto">
          <p className="text-xs uppercase tracking-wide text-white/50 mb-2">Live poll from your faculty</p>
          {!poll ? (
            <p className="text-sm text-white/60">No poll right now. When your faculty asks a question, it appears here.</p>
          ) : (
            <>
              <p className="font-medium mb-4">{poll.q}</p>
              <div className="space-y-2">
                {poll.options.map((o, i) => {
                  const count = poll.results[i] + (vote === i ? 1 : 0);
                  const pct = total ? Math.round((count / total) * 100) : 0;
                  const showResults = vote !== null && !cls.storeLive;
                  return (
                    <button
                      key={i}
                      disabled={vote !== null}
                      onClick={() => choose(i)}
                      className={`relative w-full text-left rounded-xl border px-4 py-3 text-sm overflow-hidden ${vote === i ? 'border-violet-400 bg-violet-500/15' : 'border-white/15 hover:border-white/30'}`}
                    >
                      {showResults && <span className={`absolute inset-y-0 left-0 ${i === poll.answer ? 'bg-emerald-500/25' : 'bg-white/10'}`} style={{ width: `${pct}%` }} />}
                      <span className="relative flex justify-between gap-3">
                        <span>{o}</span>
                        {showResults && <span className="text-white/70">{pct}%</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
              {vote !== null && (
                <p className="text-sm mt-4 flex items-center gap-2 text-emerald-300"><CircleCheck className="w-4 h-4" />Answer sent{cls.storeLive ? '. Your faculty can see the results.' : '. The correct option is highlighted in green.'}</p>
              )}
            </>
          )}
        </aside>
      </div>
      <footer className="px-5 py-3 flex items-center justify-center gap-3 border-t border-white/10">
        <button onClick={() => setMic(!mic)} className={`w-11 h-11 rounded-full flex items-center justify-center ${mic ? 'bg-white/15' : 'bg-red-500/80'}`} aria-label="Microphone">{mic ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}</button>
        <button onClick={() => setCam(!cam)} className={`w-11 h-11 rounded-full flex items-center justify-center ${cam ? 'bg-white/15' : 'bg-red-500/80'}`} aria-label="Camera">{cam ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}</button>
        <button onClick={onLeave} className="px-5 h-11 rounded-full bg-red-600 hover:bg-red-700 text-sm font-medium">Leave class</button>
      </footer>
    </div>
  );
}

/* ================================================================== */
/* Pages                                                               */
/* ================================================================== */

export function LiveToday({ onNavigate }) {
  const now = useNow();
  const [joined, setJoined] = useState(null);
  const classes = [...CLASSES_TODAY].sort((a, b) => a.start - b.start);
  const [store, update] = useStore();
  const facultyLive = liveForStudent(store.live) && CURRENT_SUBJECTS.some((x) => x.code === store.live.code) ? store.live : null;
  const joinFaculty = () => {
    update((s2) => ({ ...s2, live: s2.live && { ...s2.live, demoJoined: true } }));
    setJoined({ storeLive: true, subject: { code: facultyLive.code }, start: new Date(facultyLive.startedAt) });
  };

  if (!classes.length && !facultyLive && !joined) return <Card><Empty icon={Video} title="No classes today" text="Enjoy the break. There are no live classes in session right now." /></Card>;

  return (
    <div className="space-y-3">
      {facultyLive && (
        <Card className="flex items-center gap-4 !border-emerald-400 bg-emerald-50/40">
          <span className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center"><Video className="w-5 h-5" /></span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-zinc-900">{subjectOf(facultyLive.code).name} is live now</p>
            <p className="text-sm text-zinc-600">Demo Teacher started the class {fromNow(new Date(facultyLive.startedAt))}</p>
          </div>
          <Button variant="primary" onClick={joinFaculty}><Video className="w-4 h-4" />Join now</Button>
        </Card>
      )}
      {classes.map((c) => {
        const live = c.start <= now && c.end > now;
        const over = c.end <= now;
        const s = subjectOf(c.subject.code);
        return (
          <Card key={c.id} className={`flex items-center gap-4 ${over ? 'opacity-60' : ''} ${live ? '!border-emerald-300' : ''}`}>
            <div className="w-20 shrink-0 text-center">
              <p className="text-sm font-semibold text-zinc-900">{fmtTime(c.start)}</p>
              <p className="text-xs text-zinc-500">{fmtTime(c.end)}</p>
            </div>
            <span className="w-1.5 self-stretch rounded-full" style={{ background: s.color }} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-zinc-900">{s.name}</p>
              <p className="text-sm text-zinc-500 flex items-center gap-1.5">
                {c.online ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                {c.room} · {s.faculty}
              </p>
            </div>
            {live && c.online && <Button variant="primary" onClick={() => setJoined(c)}><Video className="w-4 h-4" />Join now</Button>}
            {live && !c.online && <Pill tone="green" className="!text-xs">Happening now</Pill>}
            {!live && !over && <Pill tone="violet" className="!text-xs">{fromNow(c.start)}</Pill>}
            {over && <Button variant="ghost" onClick={() => onNavigate('recordings')}>Recording</Button>}
          </Card>
        );
      })}
      {joined && <LiveRoom cls={joined} onLeave={() => setJoined(null)} />}
    </div>
  );
}
