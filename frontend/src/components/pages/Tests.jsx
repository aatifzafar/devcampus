import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlarmClock,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Camera,
  CameraOff,
  CircleCheck,
  CircleX,
  ClipboardCheck,
  Clock,
  ListChecks,
  ShieldCheck,
  TriangleAlert,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { ALL_TESTS as BASE_TESTS, PAST_ATTEMPTS, QUESTION_BANK, scoreOf } from '../../data/appData';
import { storeTests, testStartOverride, useStore } from '../../data/store';

// Sample tests (with any start time faculty changed) plus tests faculty created.
const allTests = () => [
  ...BASE_TESTS.map((t) => {
    const o = testStartOverride(t.id);
    return o ? { ...t, start: o } : t;
  }),
  ...storeTests(),
];
import { Button, Card, CardTitle, Chips, Empty, Modal, Pill, Stat, SubjectTag, fmtDate, fmtDay, fmtTime, fromNow, subjectOf, useStoredState } from './ui';

const endOf = (t) => new Date(t.start.getTime() + t.minutes * 60000);
const isLive = (t) => t.start <= new Date() && endOf(t) > new Date();
const questionsFor = (t) => t.customQuestions || (QUESTION_BANK[t.bank] || []).slice(0, t.questions || 10);

function useNow(ms = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

const mmss = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h ? `${h}:` : ''}${String(m).padStart(h ? 2 : 1, '0')}:${String(sec).padStart(2, '0')}`;
};

// Attempts made in this browser, keyed by test id.
const useAttempts = () => useStoredState('alliance-test-attempts', {});

/* ================================================================== */
/* Test runner: system check -> test -> submitted                      */
/* ================================================================== */

function SystemCheck({ test, onStart, onCancel }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [camera, setCamera] = useState(test.proctored ? 'checking' : 'skip');
  const [agree, setAgree] = useState(false);
  const online = navigator.onLine;

  useEffect(() => {
    if (!test.proctored) return undefined;
    let cancelled = false;
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamera('denied');
      return undefined;
    }
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCamera('ok');
      })
      .catch(() => setCamera('denied'));
    return () => {
      cancelled = true;
    };
  }, [test.proctored]);

  const stopCamera = () => streamRef.current?.getTracks().forEach((t) => t.stop());
  const ready = agree && online && (camera === 'ok' || camera === 'skip' || camera === 'continue');

  const checks = [
    { label: 'Internet connection', ok: online, okText: 'Connected', badText: 'You are offline', icon: online ? Wifi : WifiOff },
    ...(test.proctored
      ? [
          {
            label: 'Camera',
            ok: camera === 'ok',
            pending: camera === 'checking',
            okText: 'Working',
            badText: camera === 'continue' ? 'Continuing without camera' : 'Not available. Allow camera access in your browser.',
            icon: camera === 'ok' ? Camera : CameraOff,
          },
        ]
      : []),
    { label: 'Answers save automatically', ok: true, okText: 'On', icon: CircleCheck },
  ];

  return (
    <div className="max-w-3xl mx-auto w-full py-8 px-4">
      <button onClick={() => { stopCamera(); onCancel(); }} className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 mb-5">
        <ArrowLeft className="w-4 h-4" /> Back to tests
      </button>
      <p className="text-sm text-zinc-500 mb-1"><SubjectTag code={test.code} /></p>
      <h1 className="text-2xl font-semibold text-zinc-900 mb-1">{test.title}</h1>
      <p className="text-zinc-600 mb-6">
        {test.questions} questions · {test.minutes} minutes · {test.marks} marks{test.proctored ? ' · Proctored' : ''}
      </p>

      <div className="grid md:grid-cols-2 gap-5 mb-5">
        <Card>
          <CardTitle>Quick check</CardTitle>
          <ul className="space-y-3">
            {checks.map((c) => {
              const Icon = c.icon;
              return (
                <li key={c.label} className="flex items-center gap-3">
                  <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.pending ? 'bg-zinc-100 text-zinc-400' : c.ok ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    <Icon className="w-[18px] h-[18px]" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900">{c.label}</p>
                    <p className={`text-xs ${c.pending ? 'text-zinc-500' : c.ok ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {c.pending ? 'Checking…' : c.ok ? c.okText : c.badText}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
          {test.proctored && camera === 'denied' && (
            <button onClick={() => setCamera('continue')} className="mt-4 text-sm text-[#6D3FC0] hover:underline">
              Continue without camera (your faculty will be told)
            </button>
          )}
        </Card>
        {test.proctored ? (
          <Card className="!p-3">
            <div className="aspect-video rounded-2xl bg-zinc-900 overflow-hidden flex items-center justify-center relative">
              <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover ${camera === 'ok' ? '' : 'hidden'}`} />
              {camera !== 'ok' && <CameraOff className="w-10 h-10 text-zinc-600" />}
            </div>
            <p className="text-xs text-zinc-500 px-2 pt-2.5">Make sure your face is clearly visible and the room is well lit.</p>
          </Card>
        ) : (
          <Card>
            <CardTitle>Syllabus</CardTitle>
            <p className="text-sm text-zinc-700">{test.syllabus}</p>
          </Card>
        )}
      </div>

      <Card className="mb-5">
        <CardTitle>Before you start</CardTitle>
        <ul className="space-y-2 text-sm text-zinc-700 list-disc pl-5">
          <li>The timer starts when you press Start and cannot be paused.</li>
          <li>Every answer is saved as soon as you pick it. If you lose connection, reopen the test to continue.</li>
          <li>You can mark questions to review and change answers until you submit.</li>
          <li className="text-red-700 font-semibold bg-red-50/80 p-2 rounded-lg border border-red-200">
            ⚠️ Strict Proctoring: Do NOT change tabs or minimize windows. Leaving this tab or unfocusing the window will AUTO-SUBMIT the test immediately on the 1st attempt.
          </li>
          {test.proctored && <li>An occasional camera photo is taken during the test.</li>}
          <li>{test.negative ? 'Wrong answers lose marks.' : 'There is no negative marking.'}</li>
        </ul>
        <label className="flex items-center gap-2.5 mt-5 text-sm text-zinc-800 cursor-pointer">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="w-4 h-4 accent-[#6D3FC0]" />
          I have read the instructions
        </label>
      </Card>

      <div className="flex justify-end">
        <Button variant="primary" className="!px-6 !py-2.5" disabled={!ready} onClick={() => onStart(streamRef.current)}>
          Start test <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function TestScreen({ test, stream, saved, onSave, onSubmit }) {
  const questions = useMemo(() => questionsFor(test), [test]);
  const now = useNow();
  const left = endOf(test) - now;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState(saved?.answers || Array(questions.length).fill(null));
  const [marked, setMarked] = useState(saved?.marked || []);
  const [visited, setVisited] = useState([0]);
  const [warnings, setWarnings] = useState(saved?.warnings || 0);
  const [showWarning, setShowWarning] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  const armedRef = useRef(false);
  const submittedRef = useRef(false);

  // Arm security detection after 1.2s to prevent false trigger on initial mount/fullscreen
  useEffect(() => {
    const t = setTimeout(() => {
      armedRef.current = true;
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  const handleSecurityViolation = useCallback(
    (reason) => {
      if (!armedRef.current || submittedRef.current) return;
      submittedRef.current = true;
      onSubmit({
        answers,
        marked,
        warnings: 1,
        autoSubmitted: true,
        violationReason: reason || 'Tab switch or window unfocused'
      });
    },
    [answers, marked, onSubmit]
  );

  // Auto-submit immediately on the 1st tab change or window blur
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        handleSecurityViolation('Tab switch or browser minimized');
      }
    };

    const onBlur = () => {
      handleSecurityViolation('Window unfocused or application switched');
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
    };
  }, [handleSecurityViolation]);

  const persist = useCallback(
    (next) => {
      onSave({ answers: next.answers ?? answers, marked: next.marked ?? marked, warnings: next.warnings ?? warnings });
      setSavedAt(new Date());
    },
    [answers, marked, warnings, onSave]
  );

  useEffect(() => {
    persist({ warnings });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warnings]);

  const submit = useCallback(() => onSubmit({ answers, marked, warnings }), [answers, marked, warnings, onSubmit]);

  // Time up: submit automatically.
  useEffect(() => {
    if (left <= 0) submit();
  }, [left, submit]);

  const pick = (opt) => {
    const next = answers.map((a, i) => (i === index ? opt : a));
    setAnswers(next);
    persist({ answers: next });
  };
  const toggleMark = () => {
    const next = marked.includes(index) ? marked.filter((m) => m !== index) : [...marked, index];
    setMarked(next);
    persist({ marked: next });
  };
  const go = (i) => {
    setIndex(i);
    setVisited((v) => (v.includes(i) ? v : [...v, i]));
  };

  const q = questions[index];
  const answered = answers.filter((a) => a !== null).length;
  const lowTime = left < 5 * 60000;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <header className="bg-white border-b border-zinc-200 px-4 sm:px-6 py-3 flex items-center gap-4">
        <div className="min-w-0">
          <p className="font-semibold text-zinc-900 truncate">{test.title}</p>
          <p className="text-xs text-zinc-500 truncate">{subjectOf(test.code).name}</p>
        </div>
        <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
          Proctored: Tab Switch Auto-Submits (1st Attempt)
        </span>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-700 ml-auto">
          <CircleCheck className="w-4 h-4" />
          {savedAt ? `Saved ${fmtTime(savedAt)}` : 'Answers save automatically'}
        </span>
        <span className={`ml-auto sm:ml-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold tabular-nums ${lowTime ? 'bg-red-50 text-red-700' : 'bg-zinc-100 text-zinc-800'}`}>
          <AlarmClock className="w-4 h-4" />
          {mmss(left)}
        </span>
        {stream && (
          <video ref={videoRef} autoPlay muted playsInline className="w-16 h-12 rounded-lg object-cover bg-zinc-900 hidden sm:block" />
        )}
        <Button variant="primary" onClick={() => setConfirm(true)}>Submit</Button>
      </header>

      {showWarning && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-sm text-amber-900 flex items-center gap-2">
          <TriangleAlert className="w-4 h-4 shrink-0" />
          You left the test tab ({warnings} time{warnings === 1 ? '' : 's'}). This is noted for your faculty. Your test continues.
          <button onClick={() => setShowWarning(false)} className="ml-auto underline">OK</button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 grid lg:grid-cols-[1fr_260px] gap-6">
          {/* Question */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-zinc-500">Question {index + 1} of {questions.length}</span>
              <Pill>{q.topic}</Pill>
              <button
                onClick={toggleMark}
                className={`ml-auto inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full ${marked.includes(index) ? 'bg-amber-50 text-amber-800' : 'text-zinc-500 hover:bg-zinc-100'}`}
              >
                <Bookmark className="w-4 h-4" />
                {marked.includes(index) ? 'Marked for review' : 'Mark for review'}
              </button>
            </div>
            <Card>
              <p className="text-lg text-zinc-900 leading-relaxed mb-5">{q.text}</p>
              <div className="space-y-2.5">
                {q.options.map((opt, i) => {
                  const on = answers[index] === i;
                  return (
                    <button
                      key={i}
                      onClick={() => pick(i)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left transition-colors ${on ? 'border-[#6D3FC0] bg-[#F7F5FD] text-[#4C2E8A]' : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-800'}`}
                    >
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 ${on ? 'bg-[#6D3FC0] text-white' : 'border border-zinc-300'}`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {answers[index] !== null && (
                <button onClick={() => pick(null)} className="mt-4 text-sm text-zinc-500 hover:text-zinc-800">Clear answer</button>
              )}
            </Card>
            <div className="flex justify-between mt-4">
              <Button disabled={index === 0} onClick={() => go(index - 1)}><ArrowLeft className="w-4 h-4" /> Previous</Button>
              {index < questions.length - 1 ? (
                <Button variant="primary" onClick={() => go(index + 1)}>Next <ArrowRight className="w-4 h-4" /></Button>
              ) : (
                <Button variant="primary" onClick={() => setConfirm(true)}>Review and submit</Button>
              )}
            </div>
          </div>

          {/* Palette */}
          <aside>
            <Card className="lg:sticky lg:top-4">
              <p className="text-sm font-medium text-zinc-900 mb-1">{answered} of {questions.length} answered</p>
              <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden mb-4">
                <div className="h-full bg-[#6D3FC0]" style={{ width: `${(answered / questions.length) * 100}%` }} />
              </div>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {questions.map((_, i) => {
                  const isA = answers[i] !== null;
                  const isM = marked.includes(i);
                  const style = isM
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : isA
                      ? 'bg-[#6D3FC0] text-white border-[#6D3FC0]'
                      : visited.includes(i)
                        ? 'bg-white text-zinc-700 border-zinc-300'
                        : 'bg-zinc-50 text-zinc-400 border-zinc-200';
                  return (
                    <button
                      key={i}
                      onClick={() => go(i)}
                      className={`h-9 rounded-lg border text-sm font-medium ${style} ${i === index ? 'ring-2 ring-offset-1 ring-zinc-900' : ''}`}
                      aria-label={`Question ${i + 1}`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              <ul className="space-y-1.5 text-xs text-zinc-600">
                <li className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#6D3FC0]" /> Answered</li>
                <li className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-amber-100 border border-amber-300" /> Marked for review</li>
                <li className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-white border border-zinc-300" /> Seen, not answered</li>
                <li className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-zinc-50 border border-zinc-200" /> Not seen yet</li>
              </ul>
            </Card>
          </aside>
        </div>
      </div>

      {confirm && (
        <Modal
          title="Submit your test?"
          subtitle={`${mmss(left)} left`}
          onClose={() => setConfirm(false)}
          footer={
            <>
              <Button onClick={() => setConfirm(false)}>Keep working</Button>
              <Button variant="primary" onClick={submit}>Submit test</Button>
            </>
          }
        >
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Stat label="Answered" value={answered} tone="text-[#4C2E8A]" />
            <Stat label="Not answered" value={questions.length - answered} tone={questions.length - answered ? 'text-red-600' : undefined} />
            <Stat label="Marked" value={marked.length} tone={marked.length ? 'text-amber-700' : undefined} />
          </div>
          {questions.length - answered > 0 && (
            <p className="text-sm text-zinc-600">
              You have unanswered questions:{' '}
              {answers.map((a, i) => (a === null ? i + 1 : null)).filter(Boolean).join(', ')}. You can’t change answers after submitting.
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}

function Submitted({ test, attempt, onDone, onResults }) {
  const s = scoreOf({ bank: test.bank, questions: test.customQuestions, answers: (attempt?.answers || []).map((a) => (a === null ? -1 : a)) });
  const isViolation = Boolean(attempt?.autoSubmitted || attempt?.violationReason);

  return (
    <div className="max-w-lg mx-auto w-full py-16 px-4 text-center">
      {isViolation ? (
        <span className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 animate-in zoom-in-95">
          <CircleX className="w-9 h-9" />
        </span>
      ) : (
        <span className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CircleCheck className="w-9 h-9" />
        </span>
      )}
      <h1 className="text-2xl font-semibold text-zinc-900 mb-1">
        {isViolation ? 'Test Auto-Submitted' : 'Test submitted'}
      </h1>
      <p className="text-zinc-600 mb-6">{test.title} · {subjectOf(test.code).name}</p>

      {isViolation && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-left flex items-start gap-3 shadow-xs">
          <TriangleAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-900">Security Violation: Auto-Submitted on 1st Attempt</p>
            <p className="text-xs text-red-700 mt-1 leading-relaxed">
              Your test was automatically submitted because a tab switch or window change was detected ({attempt?.violationReason || 'Window switch'}).
              Your answers have been finalized.
            </p>
          </div>
        </div>
      )}

      <Card className="mb-6 text-left">
        <div className="flex items-center gap-5">
          <div className="text-center">
            <p className="text-4xl font-semibold text-zinc-900">{s.correct}<span className="text-xl text-zinc-400">/{s.total}</span></p>
            <p className="text-xs text-zinc-500">correct</p>
          </div>
          <div className="text-sm text-zinc-700 space-y-1">
            <p>Score: <span className="font-semibold">{s.percent}%</span></p>
            <p>Submitted at {fmtTime(new Date(attempt?.submittedAt || Date.now()))}</p>
            {isViolation && <p className="text-red-600 font-medium text-xs">Terminated on Tab/Window Switch</p>}
          </div>
        </div>
      </Card>
      <div className="flex justify-center gap-2">
        <Button onClick={onDone}>Back to tests</Button>
        <Button variant="primary" onClick={onResults}>See answers <ArrowRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}

function TestRunner({ test, attempts, setAttempts, onClose, onResults }) {
  const existing = attempts[test.id];
  const [step, setStep] = useState(existing?.submittedAt ? 'done' : existing ? 'test' : 'check');
  const [stream, setStream] = useState(null);

  useEffect(() => () => stream?.getTracks().forEach((t) => t.stop()), [stream]);

  const save = useCallback((data) => setAttempts((all) => ({ ...all, [test.id]: { ...all[test.id], ...data } })), [setAttempts, test.id]);

  const finish = (data) => {
    stream?.getTracks().forEach((t) => t.stop());
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    setAttempts((all) => ({ ...all, [test.id]: { ...all[test.id], ...data, submittedAt: new Date().toISOString() } }));
    setStep('done');
  };

  const start = (s) => {
    setStream(s);
    if (test.proctored) document.documentElement.requestFullscreen?.().catch(() => {});
    setStep('test');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F6F5F0] flex flex-col overflow-y-auto">
      {step === 'check' && <SystemCheck test={test} onStart={start} onCancel={onClose} />}
      {step === 'test' && <TestScreen test={test} stream={stream} saved={existing} onSave={save} onSubmit={finish} />}
      {step === 'done' && <Submitted test={test} attempt={attempts[test.id]} onDone={onClose} onResults={onResults} />}
    </div>
  );
}

/* ================================================================== */
/* Pages                                                               */
/* ================================================================== */

function TestMeta({ t }) {
  return (
    <p className="text-sm text-zinc-500 flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" />{t.minutes} min</span>
      <span className="inline-flex items-center gap-1"><ListChecks className="w-4 h-4" />{t.questions} questions</span>
      <span>{t.marks} marks</span>
      {t.proctored && <span className="inline-flex items-center gap-1 text-[#4C2E8A]"><ShieldCheck className="w-4 h-4" />Proctored</span>}
    </p>
  );
}

export function TestsLive({ onNavigate }) {
  useStore();
  const now = useNow();
  const [attempts, setAttempts] = useAttempts();
  const [running, setRunning] = useState(null);
  const live = allTests().filter(isLive);
  const soon = allTests().filter((t) => t.start > now && t.start - now < 24 * 3600000);

  return (
    <div className="space-y-6">
      {live.length === 0 ? (
        <Card><Empty icon={ClipboardCheck} title="No test is live right now" text="When a test opens, it appears here with a Start button. You also get a notification." /></Card>
      ) : (
        live.map((t) => {
          const a = attempts[t.id];
          const done = a?.submittedAt;
          return (
            <Card key={t.id} className="!p-0 overflow-hidden">
              <div className="h-1.5" style={{ background: subjectOf(t.code).color }} />
              <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center gap-5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Pill tone="red"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />Live now</Pill>
                    <SubjectTag code={t.code} />
                  </div>
                  <h2 className="text-xl font-semibold text-zinc-900 mb-1">{t.title}</h2>
                  <p className="text-sm text-zinc-600 mb-2">{t.syllabus}</p>
                  <TestMeta t={t} />
                </div>
                <div className="md:text-right shrink-0">
                  <p className="text-xs text-zinc-500">Closes in</p>
                  <p className="text-2xl font-semibold text-zinc-900 tabular-nums mb-3">{mmss(endOf(t) - now)}</p>
                  {done ? (
                    <Button onClick={() => onNavigate('tests-results')}><CircleCheck className="w-4 h-4 text-emerald-600" />Submitted · See result</Button>
                  ) : (
                    <Button variant="primary" className="!px-6" onClick={() => setRunning(t)}>{a ? 'Continue test' : 'Start test'} <ArrowRight className="w-4 h-4" /></Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })
      )}

      {soon.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 mb-3">Opening in the next 24 hours</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {soon.map((t) => (
              <Card key={t.id}>
                <SubjectTag code={t.code} />
                <p className="font-semibold text-zinc-900 mt-1">{t.title}</p>
                <p className="text-sm text-zinc-600 mb-2">{fmtDay(t.start)}, {fmtTime(t.start)} · opens {fromNow(t.start)}</p>
                <TestMeta t={t} />
              </Card>
            ))}
          </div>
        </div>
      )}

      {running && (
        <TestRunner
          test={running}
          attempts={attempts}
          setAttempts={setAttempts}
          onClose={() => setRunning(null)}
          onResults={() => { setRunning(null); onNavigate('tests-results'); }}
        />
      )}
    </div>
  );
}

export function TestsUpcoming({ onNavigate }) {
  useStore();
  const now = useNow(30000);
  const upcoming = allTests().filter((t) => t.start > now).sort((a, b) => a.start - b.start);
  if (!upcoming.length) return <Card><Empty icon={ClipboardCheck} title="No upcoming tests" text="Scheduled tests will show here with their syllabus and timing." /></Card>;
  return (
    <div className="space-y-4">
      {upcoming.map((t) => {
        const s = subjectOf(t.code);
        return (
          <Card key={t.id} className="flex flex-col sm:flex-row gap-5">
            <div className="w-16 shrink-0 text-center rounded-2xl border border-zinc-200 py-2 self-start" style={{ borderTopColor: s.color, borderTopWidth: 4 }}>
              <p className="text-xs uppercase text-zinc-500">{t.start.toLocaleDateString('en-IN', { month: 'short' })}</p>
              <p className="text-2xl font-semibold text-zinc-900 leading-tight">{t.start.getDate()}</p>
              <p className="text-xs text-zinc-500">{t.start.toLocaleDateString('en-IN', { weekday: 'short' })}</p>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <SubjectTag code={t.code} />
                <Pill tone="violet">{fromNow(t.start)}</Pill>
              </div>
              <h3 className="text-lg font-semibold text-zinc-900">{t.title}</h3>
              <p className="text-sm text-zinc-600 mb-2">{fmtTime(t.start)} · Syllabus: {t.syllabus}</p>
              <TestMeta t={t} />
              {t.proctored && (
                <p className="text-xs text-zinc-500 mt-3 bg-zinc-50 rounded-xl px-3 py-2">
                  Proctored: use a laptop with a working camera, sit in a quiet, well-lit room, and join 10 minutes early for the quick check.
                </p>
              )}
            </div>
            <div className="sm:self-center flex sm:flex-col gap-2 shrink-0">
              <Button onClick={() => onNavigate('notes')}>Revise notes</Button>
              <Button variant="ghost" onClick={() => onNavigate('playlearn')}>Practise questions</Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// All attempts: past ones plus any taken in this browser.
function useAllAttempts() {
  const [attempts] = useAttempts();
  const [store] = useStore();
  return useMemo(() => {
    const mine = Object.entries(attempts)
      .filter(([, a]) => a.submittedAt)
      .map(([id, a]) => {
        const t = allTests().find((x) => x.id === id);
        return t && { id, title: t.title, code: t.code, date: new Date(a.submittedAt), minutes: t.minutes, bank: t.bank, questions: t.customQuestions, answers: a.answers.map((x) => (x === null ? -1 : x)), classAvg: 64, published: true, warnings: a.warnings };
      })
      .filter(Boolean);
    return [...mine, ...PAST_ATTEMPTS].sort((a, b) => b.date - a.date);
  }, [attempts, store]); // eslint-disable-line react-hooks/exhaustive-deps
}

function ResultModal({ attempt, onClose }) {
  const bank = attempt.questions || QUESTION_BANK[attempt.bank] || [];
  const s = scoreOf(attempt);
  const topics = {};
  attempt.answers.forEach((a, i) => {
    const qq = bank[i];
    if (!qq) return;
    topics[qq.topic] = topics[qq.topic] || { right: 0, total: 0 };
    topics[qq.topic].total += 1;
    if (a === qq.answer) topics[qq.topic].right += 1;
  });
  return (
    <Modal wide title={`${attempt.title} · ${subjectOf(attempt.code).name}`} subtitle={fmtDate(attempt.date)} onClose={onClose}>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Stat label="Your score" value={`${s.percent}%`} hint={`${s.correct} of ${s.total} correct`} tone="text-[#4C2E8A]" />
        <Stat label="Class average" value={`${attempt.classAvg}%`} />
        <Stat label="Compared to class" value={`${s.percent >= attempt.classAvg ? '+' : ''}${s.percent - attempt.classAvg}`} tone={s.percent >= attempt.classAvg ? 'text-emerald-600' : 'text-amber-700'} />
      </div>
      <h4 className="text-sm font-semibold text-zinc-900 mb-2">By topic</h4>
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(topics).map(([topic, v]) => (
          <Pill key={topic} tone={v.right === v.total ? 'green' : v.right === 0 ? 'red' : 'amber'} className="!text-xs !px-3 !py-1">
            {topic}: {v.right}/{v.total}
          </Pill>
        ))}
      </div>
      <h4 className="text-sm font-semibold text-zinc-900 mb-2">Question by question</h4>
      <ol className="space-y-3">
        {bank.slice(0, attempt.answers.length).map((qq, i) => {
          const mine = attempt.answers[i];
          const right = mine === qq.answer;
          return (
            <li key={i} className={`rounded-2xl border p-4 ${right ? 'border-emerald-200' : 'border-red-200'}`}>
              <div className="flex items-start gap-2 mb-2">
                {right ? <CircleCheck className="w-5 h-5 text-emerald-600 shrink-0" /> : <CircleX className="w-5 h-5 text-red-500 shrink-0" />}
                <p className="text-sm font-medium text-zinc-900">{i + 1}. {qq.text}</p>
              </div>
              <p className="text-sm text-zinc-600 ml-7">
                Your answer: <span className={right ? 'text-emerald-700' : 'text-red-600'}>{mine >= 0 ? qq.options[mine] : 'Not answered'}</span>
                {!right && <> · Correct: <span className="text-emerald-700">{qq.options[qq.answer]}</span></>}
              </p>
              <p className="text-sm text-zinc-500 ml-7 mt-1">{qq.explain}</p>
            </li>
          );
        })}
      </ol>
    </Modal>
  );
}

export function TestsCompleted() {
  const all = useAllAttempts();
  const [open, setOpen] = useState(null);
  return (
    <Card className="!p-0 overflow-hidden">
      <ul className="divide-y divide-zinc-100">
        {all.map((a) => {
          const s = scoreOf(a);
          return (
            <li key={a.id} className="flex items-center gap-4 px-5 py-4">
              <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${subjectOf(a.code).color}14`, color: subjectOf(a.code).color }}>
                <ClipboardCheck className="w-5 h-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-zinc-900 truncate">{a.title}</p>
                <div className="flex items-center gap-2 flex-wrap"><SubjectTag code={a.code} /><span className="text-xs text-zinc-400">· {fmtDate(a.date)} · {a.minutes} min</span></div>
              </div>
              {a.published ? (
                <>
                  <span className="text-sm font-semibold text-zinc-900 hidden sm:block">{s.percent}%</span>
                  <Button onClick={() => setOpen(a)}>View result</Button>
                </>
              ) : (
                <Pill tone="amber">Result not published yet</Pill>
              )}
            </li>
          );
        })}
      </ul>
      {open && <ResultModal attempt={open} onClose={() => setOpen(null)} />}
    </Card>
  );
}

export function TestsResults() {
  const all = useAllAttempts().filter((a) => a.published);
  const [open, setOpen] = useState(null);
  const scores = all.map((a) => ({ a, s: scoreOf(a) }));
  const avg = scores.length ? Math.round(scores.reduce((n, x) => n + x.s.percent, 0) / scores.length) : 0;
  const best = scores.reduce((b, x) => (!b || x.s.percent > b.s.percent ? x : b), null);
  const above = scores.filter((x) => x.s.percent >= x.a.classAvg).length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Tests with results" value={scores.length} />
        <Stat label="Your average" value={`${avg}%`} tone="text-[#4C2E8A]" />
        <Stat label="Best score" value={best ? `${best.s.percent}%` : '—'} hint={best ? `${best.a.title} · ${subjectOf(best.a.code).name}` : ''} />
        <Stat label="At or above class average" value={`${above} of ${scores.length}`} />
      </div>
      <Card>
        <CardTitle hint="Your score and the class average for each test">Scores</CardTitle>
        <div className="space-y-4">
          {scores.map(({ a, s }) => (
            <button key={a.id} onClick={() => setOpen(a)} className="w-full text-left group">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-zinc-800 group-hover:text-[#4C2E8A] truncate pr-3">{a.title} · <span className="text-zinc-500">{subjectOf(a.code).name}</span></span>
                <span className="font-semibold text-zinc-900 shrink-0">{s.percent}%</span>
              </div>
              <div className="relative h-2.5 rounded-full bg-zinc-100">
                <div className="h-full rounded-full" style={{ width: `${s.percent}%`, background: subjectOf(a.code).color }} />
                <div className="absolute -top-1 h-[18px] w-0.5 bg-zinc-800" style={{ left: `${a.classAvg}%` }} title={`Class average ${a.classAvg}%`} />
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-zinc-500 mt-4 flex items-center gap-2"><span className="w-0.5 h-3 bg-zinc-800 inline-block" /> Class average · Click a test to see every question with explanations</p>
      </Card>
      {open && <ResultModal attempt={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
