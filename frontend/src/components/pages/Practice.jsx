import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CircleCheck, CircleX, Flame, Gamepad2, Lightbulb, Play, Send, Timer, Trophy, Zap } from 'lucide-react';
import { quizOfTheDay } from '../../data/homeData';
import { CODING_PROBLEMS, QUESTION_BANK, STARTER_CODE } from '../../data/appData';
import { Button, Card, CardTitle, Chips, Pill, Stat, SubjectTag, CURRENT_SUBJECTS, inputClass, subjectOf, useStoredState } from './ui';

/* ================================================================== */
/* Daily challenge                                                     */
/* ================================================================== */

export function DailyChallenge() {
  const quiz = useMemo(() => quizOfTheDay(), []);
  const key = `alliance-${quiz.id}`;
  const [saved, setSaved] = useStoredState(key, null);
  const [picked, setPicked] = useState(saved?.picked ?? null);
  const checked = saved !== null;
  const correct = checked && saved.picked === quiz.answer;

  // Last 28 days: a sample history plus today.
  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    const isToday = i === 27;
    const done = isToday ? checked : [0, 1, 2, 4, 5, 6, 9, 10, 11, 12, 15, 16, 18, 20, 21, 22, 23, 24, 25, 26].includes(i);
    return { d, done, isToday };
  });
  let streak = 0;
  for (let i = days.length - (checked ? 1 : 2); i >= 0 && days[i].done; i -= 1) streak += 1;

  const history = Object.entries(QUESTION_BANK)
    .flatMap(([code, qs]) => qs.slice(1, 2).map((q) => ({ code, q })))
    .map((x, i) => ({ ...x, right: i % 3 !== 1, daysAgo: i + 1 }));

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-5">
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><Lightbulb className="w-[18px] h-[18px]" /></span>
          <div>
            <p className="font-semibold text-zinc-900">Today’s challenge</p>
            <SubjectTag code={quiz.subject.code} />
          </div>
          <Pill tone="violet" className="ml-auto">+{quiz.xp} XP</Pill>
        </div>
        <p className="text-lg text-zinc-900 mb-5 leading-relaxed">{quiz.question}</p>
        <div className="space-y-2.5 mb-5">
          {quiz.options.map((o, i) => {
            let style = 'border-zinc-200 hover:bg-zinc-50';
            if (!checked && picked === i) style = 'border-[#6D3FC0] bg-[#F7F5FD] text-[#4C2E8A]';
            if (checked && i === quiz.answer) style = 'border-emerald-400 bg-emerald-50 text-emerald-800';
            if (checked && saved.picked === i && i !== quiz.answer) style = 'border-red-300 bg-red-50 text-red-700';
            return (
              <button key={i} disabled={checked} onClick={() => setPicked(i)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-left text-sm ${style}`}>
                <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs">{String.fromCharCode(65 + i)}</span>
                {o}
              </button>
            );
          })}
        </div>
        {checked ? (
          <div className={`rounded-2xl p-4 text-sm ${correct ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900'}`}>
            <p className="font-semibold mb-1">{correct ? `Correct, +${quiz.xp} XP` : 'Not quite. Here’s why:'}</p>
            <p>{quiz.explain}</p>
          </div>
        ) : (
          <Button variant="primary" disabled={picked === null} onClick={() => setSaved({ picked })}>Check answer</Button>
        )}
      </Card>

      <div className="space-y-5">
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Flame className="w-7 h-7 text-orange-500" />
            <div>
              <p className="text-2xl font-semibold text-zinc-900">{streak} days</p>
              <p className="text-xs text-zinc-500">Current streak</p>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {days.map(({ d, done, isToday }) => (
              <div
                key={d.toISOString()}
                title={d.toDateString()}
                className={`aspect-square rounded-xl ${done ? 'bg-orange-400' : 'bg-zinc-100'} ${isToday ? 'ring-2 ring-zinc-900 ring-offset-1' : ''}`}
              />
            ))}
          </div>
          <p className="text-xs text-zinc-500 mt-3">Last 4 weeks. Orange = challenge done.</p>
        </Card>
        <Card>
          <CardTitle>Recent challenges</CardTitle>
          <ul className="space-y-3">
            {history.map((h) => (
              <li key={h.code} className="flex items-start gap-2.5 text-sm">
                {h.right ? <CircleCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" /> : <CircleX className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />}
                <div className="min-w-0">
                  <p className="text-zinc-800 line-clamp-2">{h.q.text}</p>
                  <p className="text-xs text-zinc-500">{subjectOf(h.code).name} · {h.daysAgo} day{h.daysAgo > 1 ? 's' : ''} ago</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

/* ================================================================== */
/* Coding                                                              */
/* ================================================================== */

const LEVEL_TONE = { Easy: 'green', Medium: 'amber', Hard: 'red' };

function Editor({ problem, solved, onSolved, onBack }) {
  const languages = problem.topic === 'SQL' ? ['SQL'] : ['Java', 'Python', 'C'];
  const [lang, setLang] = useState(languages[0]);
  const [code, setCode] = useState(STARTER_CODE[languages[0]]);
  const [result, setResult] = useState(null);

  const run = (submit) => {
    setResult({ state: 'running' });
    setTimeout(() => {
      const wrote = code.trim().length - STARTER_CODE[lang].trim().length > 30;
      if (!wrote) setResult({ state: 'fail', text: `Expected "${problem.example.output}" but your program printed nothing.` });
      else if (submit) {
        setResult({ state: 'pass', text: 'All 8 hidden test cases passed.' });
        onSolved();
      } else setResult({ state: 'pass', text: `Sample test passed. Output: ${problem.example.output}` });
    }, 900);
  };

  return (
    <div>
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 mb-4"><ArrowLeft className="w-4 h-4" />All problems</button>
      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Pill tone={LEVEL_TONE[problem.level]}>{problem.level}</Pill>
            <Pill>{problem.topic}</Pill>
            <SubjectTag code={problem.code} />
            {solved && <Pill tone="green" className="ml-auto"><CircleCheck className="w-3 h-3" />Solved</Pill>}
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 mb-3">{problem.title}</h2>
          <p className="text-[15px] text-zinc-700 leading-relaxed mb-5">{problem.statement}</p>
          <p className="text-sm font-medium text-zinc-900 mb-2">Example</p>
          <div className="rounded-2xl bg-zinc-50 border border-zinc-100 p-4 font-mono text-sm space-y-2">
            <p><span className="text-zinc-500">Input: </span>{problem.example.input}</p>
            <p><span className="text-zinc-500">Output: </span>{problem.example.output}</p>
          </div>
        </Card>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <select value={lang} onChange={(e) => { setLang(e.target.value); setCode(STARTER_CODE[e.target.value]); setResult(null); }} className={`${inputClass} !w-40 !rounded-full`}>
              {languages.map((l) => <option key={l}>{l}</option>)}
            </select>
            <Button className="ml-auto" onClick={() => run(false)}><Play className="w-4 h-4" />Run</Button>
            <Button variant="primary" onClick={() => run(true)}><Send className="w-4 h-4" />Submit</Button>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="flex-1 min-h-[340px] w-full rounded-2xl bg-zinc-900 text-zinc-100 font-mono text-sm p-4 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#6D3FC0]"
          />
          {result && (
            <div className={`rounded-2xl px-4 py-3 text-sm ${result.state === 'running' ? 'bg-zinc-100 text-zinc-600' : result.state === 'pass' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>
              {result.state === 'running' ? 'Running your code…' : result.text}
            </div>
          )}
          <p className="text-xs text-zinc-500">Code runs on the university’s code judge. In this demo the result is simulated.</p>
        </div>
      </div>
    </div>
  );
}

export function Coding() {
  const [solvedIds, setSolvedIds] = useStoredState('alliance-solved', CODING_PROBLEMS.filter((p) => p.solved).map((p) => p.id));
  const [level, setLevel] = useState('All');
  const [open, setOpen] = useState(null);

  if (open) {
    return <Editor problem={open} solved={solvedIds.includes(open.id)} onSolved={() => setSolvedIds((s) => (s.includes(open.id) ? s : [...s, open.id]))} onBack={() => setOpen(null)} />;
  }
  const shown = CODING_PROBLEMS.filter((p) => level === 'All' || p.level === level);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Solved" value={`${solvedIds.length}/${CODING_PROBLEMS.length}`} tone="text-[#4C2E8A]" />
        <Stat label="Easy" value={CODING_PROBLEMS.filter((p) => p.level === 'Easy' && solvedIds.includes(p.id)).length} />
        <Stat label="Medium and hard" value={CODING_PROBLEMS.filter((p) => p.level !== 'Easy' && solvedIds.includes(p.id)).length} />
      </div>
      <Chips value={level} onChange={setLevel} options={['All', 'Easy', 'Medium', 'Hard']} />
      <Card className="!p-0 overflow-hidden">
        <ul className="divide-y divide-zinc-100">
          {shown.map((p) => (
            <li key={p.id}>
              <button onClick={() => setOpen(p)} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-zinc-50 text-left">
                {solvedIds.includes(p.id) ? <CircleCheck className="w-5 h-5 text-emerald-600 shrink-0" /> : <span className="w-5 h-5 rounded-full border-2 border-zinc-200 shrink-0" />}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-zinc-900">{p.title}</p>
                  <SubjectTag code={p.code} />
                </div>
                <Pill>{p.topic}</Pill>
                <Pill tone={LEVEL_TONE[p.level]}>{p.level}</Pill>
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* ================================================================== */
/* Play and learn: quick-fire quiz                                     */
/* ================================================================== */

const SECONDS = 15;

export function PlayLearn() {
  const subjects = CURRENT_SUBJECTS.filter((s) => QUESTION_BANK[s.code]);
  const [best, setBest] = useStoredState('alliance-quickfire-best', {});
  const [game, setGame] = useState(null); // { code, i, score, streak, picked, left, log }

  useEffect(() => {
    if (!game || game.picked !== null || game.over) return undefined;
    if (game.left <= 0) {
      setGame((g) => ({ ...g, picked: -1, streak: 0, log: [...g.log, false] }));
      return undefined;
    }
    const id = setTimeout(() => setGame((g) => ({ ...g, left: g.left - 1 })), 1000);
    return () => clearTimeout(id);
  }, [game]);

  const start = (code) => setGame({ code, i: 0, score: 0, streak: 0, picked: null, left: SECONDS, log: [], over: false });

  if (!game) {
    return (
      <div className="space-y-5">
        <Card className="bg-gradient-to-br from-[#F1EEFB] to-white">
          <div className="flex items-center gap-4">
            <span className="w-12 h-12 rounded-2xl bg-[#6D3FC0] text-white flex items-center justify-center"><Gamepad2 className="w-6 h-6" /></span>
            <div>
              <p className="text-lg font-semibold text-zinc-900">Quick-fire revision</p>
              <p className="text-sm text-zinc-600">5 questions, {SECONDS} seconds each. Faster answers and streaks score more.</p>
            </div>
          </div>
        </Card>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {subjects.map((s) => (
            <button key={s.code} onClick={() => start(s.code)} className="text-left bg-white rounded-3xl border border-[#E4E4E7] p-5 hover:border-zinc-300 hover:shadow-sm transition-all">
              <div className="h-1.5 w-12 rounded-full mb-4" style={{ background: s.color }} />
              <p className="font-semibold text-zinc-900">{s.name}</p>
              <p className="text-sm text-zinc-500 mb-4">{QUESTION_BANK[s.code].length} questions</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 flex items-center gap-1"><Trophy className="w-3.5 h-3.5" />Best: {best[s.code] ?? '—'}</span>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-[#6D3FC0]"><Play className="w-4 h-4" />Play</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const questions = QUESTION_BANK[game.code].slice(0, 5);
  if (game.over) {
    const right = game.log.filter(Boolean).length;
    return (
      <Card className="max-w-lg mx-auto text-center">
        <Trophy className="w-10 h-10 text-amber-500 mx-auto mb-2" />
        <p className="text-sm text-zinc-500">{subjectOf(game.code).name}</p>
        <p className="text-4xl font-semibold text-zinc-900 my-2">{game.score} points</p>
        <p className="text-zinc-600 mb-5">{right} of {questions.length} correct{game.score >= (best[game.code] || 0) ? ' · New personal best' : ''}</p>
        <div className="flex justify-center gap-2">
          <Button onClick={() => setGame(null)}>Choose subject</Button>
          <Button variant="primary" onClick={() => start(game.code)}>Play again</Button>
        </div>
      </Card>
    );
  }

  const q = questions[game.i];
  const answer = (i) => {
    if (game.picked !== null) return;
    const right = i === q.answer;
    const gained = right ? 10 + game.left + game.streak * 2 : 0;
    setGame((g) => ({ ...g, picked: i, score: g.score + gained, streak: right ? g.streak + 1 : 0, log: [...g.log, right] }));
  };
  const next = () => {
    if (game.i + 1 >= questions.length) {
      setBest((b) => ({ ...b, [game.code]: Math.max(b[game.code] || 0, game.score) }));
      setGame((g) => ({ ...g, over: true }));
    } else setGame((g) => ({ ...g, i: g.i + 1, picked: null, left: SECONDS }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setGame(null)} className="text-sm text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1"><ArrowLeft className="w-4 h-4" />Quit</button>
        <span className="ml-auto text-sm text-zinc-500">Question {game.i + 1}/{questions.length}</span>
        {game.streak > 1 && <Pill tone="orange"><Zap className="w-3 h-3" />{game.streak} in a row</Pill>}
        <Pill tone="violet">{game.score} pts</Pill>
      </div>
      <div className="h-1.5 rounded-full bg-zinc-200 overflow-hidden mb-5">
        <div className={`h-full transition-all duration-1000 ease-linear ${game.left <= 5 ? 'bg-red-500' : 'bg-[#6D3FC0]'}`} style={{ width: `${(game.left / SECONDS) * 100}%` }} />
      </div>
      <Card>
        <p className="text-sm text-zinc-500 flex items-center gap-1.5 mb-2"><Timer className="w-4 h-4" />{game.left}s</p>
        <p className="text-lg text-zinc-900 mb-5">{q.text}</p>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {q.options.map((o, i) => {
            let style = 'border-zinc-200 hover:bg-zinc-50';
            if (game.picked !== null && i === q.answer) style = 'border-emerald-400 bg-emerald-50 text-emerald-800';
            else if (game.picked === i) style = 'border-red-300 bg-red-50 text-red-700';
            return <button key={i} disabled={game.picked !== null} onClick={() => answer(i)} className={`px-4 py-3.5 rounded-2xl border text-left text-sm disabled:cursor-default ${style}`}>{o}</button>;
          })}
        </div>
        {game.picked !== null && (
          <div className="mt-5 flex items-center gap-3">
            <p className="text-sm text-zinc-600 flex-1">{game.picked === -1 ? 'Time’s up. ' : ''}{q.explain}</p>
            <Button variant="primary" onClick={next}>{game.i + 1 >= questions.length ? 'See score' : 'Next'}</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
