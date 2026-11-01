// Plays a class recording.
// - If faculty uploaded a video, it plays that file.
// - Sample recordings have no video, so they play as a narrated slide recap
//   built from the syllabus (play/pause, seek, speed, narration on/off).
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { courseInfo } from '../data/courseInfo';
import { QUESTION_BANK } from '../data/appData';

const SLIDE_MS = 7000;

function buildSlides(code, unit, topic) {
  const info = courseInfo(code);
  const u = info.syllabus.find((x) => x.unit === Number(unit)) || info.syllabus[0];
  const words = topic.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3);
  const qs = (QUESTION_BANK[code] || []).filter((q) => words.some((w) => `${q.topic} ${q.text}`.toLowerCase().includes(w)));
  const co = info.outcomes[Math.min(info.outcomes.length, u?.unit || 1) - 1];
  const slides = [
    { title: topic, body: `Unit ${u?.unit}: ${u?.title}`, kind: 'title' },
    { title: 'Where this fits', body: `This lecture is part of ${u?.title}. The unit covers: ${(u?.topics || []).join(', ')}.` },
    ...qs.slice(0, 3).map((q) => ({ title: q.topic || 'Key idea', body: q.explain })),
    { title: 'Check yourself', body: qs[0] ? `${qs[0].text} Answer: ${qs[0].options[qs[0].answer]}.` : `Explain ${topic.toLowerCase()} in your own words, with one example.` },
    { title: 'Takeaway', body: co ? co.text : `You should now be able to explain ${topic.toLowerCase()}.` },
  ];
  return slides;
}

export default function LessonPlayer({ code, unit, topic, color = '#6D3FC0' }) {
  const slides = useMemo(() => buildSlides(code, unit, topic), [code, unit, topic]);
  const [t, setT] = useState({ i: 0, elapsed: 0 }); // slide index, ms within it
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [voice, setVoice] = useState(() => typeof window !== 'undefined' && 'speechSynthesis' in window);
  const last = useRef(performance.now());
  const { i, elapsed } = t;
  const total = slides.length * SLIDE_MS;
  const pos = i * SLIDE_MS + elapsed;
  const atEnd = i === slides.length - 1 && elapsed >= SLIDE_MS - 1;

  // Clock
  useEffect(() => {
    if (!playing) return undefined;
    last.current = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const dt = (now - last.current) * speed;
      last.current = now;
      setT((cur) => {
        const e = cur.elapsed + dt;
        if (e < SLIDE_MS) return { ...cur, elapsed: e };
        if (cur.i + 1 >= slides.length) return { i: cur.i, elapsed: SLIDE_MS - 1 };
        return { i: cur.i + 1, elapsed: 0 };
      });
    }, 100);
    return () => clearInterval(id);
  }, [playing, speed, slides.length]);
  useEffect(() => { if (atEnd) setPlaying(false); }, [atEnd]);

  // Narration
  useEffect(() => {
    if (!('speechSynthesis' in window)) return undefined;
    window.speechSynthesis.cancel();
    if (voice && playing) {
      const s = slides[i];
      const u = new SpeechSynthesisUtterance(`${s.title}. ${s.body}`);
      u.rate = Math.min(2, 0.95 * speed);
      u.lang = 'en-IN';
      window.speechSynthesis.speak(u);
    }
    return () => window.speechSynthesis.cancel();
  }, [i, voice, playing, speed, slides]);

  const seek = (ms) => {
    const c = Math.max(0, Math.min(total - 1, ms));
    setT({ i: Math.floor(c / SLIDE_MS), elapsed: c % SLIDE_MS });
  };
  const go = (n) => setT({ i: Math.max(0, Math.min(slides.length - 1, n)), elapsed: 0 });
  const toggle = () => {
    if (!playing && atEnd) go(0);
    setPlaying((p) => !p);
  };
  const fmt = (ms) => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const s = slides[i];

  return (
    <div className="rounded-2xl overflow-hidden bg-zinc-950 text-white select-none">
      <button type="button" onClick={toggle} className="relative w-full aspect-video flex items-center justify-center text-left p-8 sm:p-12" style={{ background: s.kind === 'title' ? `linear-gradient(135deg, ${color}, #1f1235)` : '#18181B' }} aria-label={playing ? 'Pause' : 'Play'}>
        <div className="max-w-2xl w-full">
          <p className="text-xs uppercase tracking-wider text-white/50 mb-3">{s.kind === 'title' ? 'Class recording · slide recap' : `Slide ${i + 1} of ${slides.length}`}</p>
          <p className={`${s.kind === 'title' ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'} font-semibold mb-4`}>{s.title}</p>
          <p className="text-base sm:text-lg text-white/80 leading-relaxed">{s.body}</p>
        </div>
        {!playing && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/30">
            <span className="w-16 h-16 rounded-full bg-white/90 text-zinc-900 flex items-center justify-center"><Play className="w-8 h-8 ml-1" /></span>
          </span>
        )}
      </button>
      <div className="px-4 pt-3 pb-3 space-y-2">
        <input type="range" min="0" max={total} step="100" value={pos} onChange={(e) => seek(Number(e.target.value))} className="w-full accent-[#A78BFA]" aria-label="Seek" />
        <div className="flex items-center gap-2 text-sm">
          <button onClick={toggle} className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center" aria-label={playing ? 'Pause' : 'Play'}>{playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}</button>
          <button onClick={() => go(i - 1)} className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center" aria-label="Previous slide"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={() => go(i + 1)} className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center" aria-label="Next slide"><ChevronRight className="w-5 h-5" /></button>
          <span className="text-white/70 tabular-nums">{fmt(pos)} / {fmt(total)}</span>
          {'speechSynthesis' in window && (
            <button onClick={() => setVoice((v) => !v)} className="ml-auto w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center" aria-label={voice ? 'Mute narration' : 'Turn on narration'} title={voice ? 'Narration on' : 'Narration off'}>{voice ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}</button>
          )}
          <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className={`${'speechSynthesis' in window ? '' : 'ml-auto '}bg-white/10 rounded-lg px-2 py-1 text-sm`} aria-label="Playback speed">
            {[0.75, 1, 1.25, 1.5, 2].map((x) => <option key={x} value={x} className="text-zinc-900">{x}×</option>)}
          </select>
        </div>
        <p className="text-[11px] text-white/40">Sample recording: a narrated recap made from the syllabus. Videos faculty upload play here instead.</p>
      </div>
    </div>
  );
}
