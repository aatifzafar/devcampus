import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowUp,
  Check,
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  Eye,
  EyeOff,
  Key,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  X
} from 'lucide-react';
import { STUDENT_INFO } from '../../data/homeData';
import { CURRENT_SUBJECTS, useStoredState } from '../pages/ui';

const SUGGESTIONS = [
  'How are my marks split between CIE and SEE?',
  'Where can I find syllabus and past question papers?',
  'How do I apply for re-evaluation?',
  'Explain BCNF with a small example',
  'What is the difference between TCP and UDP?',
  'How do I prepare for a proctored test?',
];

const STORAGE_KEY = 'alliance_gemini_api_key';

/* Small, safe markdown: paragraphs, headings, lists, bold, italic, code. */
function inline(text, key) {
  const parts = text.split(/(\*\*\*[^*]+?\*\*\*|\*\*[^*]+?\*\*|\*[^*]+?\*|`[^`]+?`|_[^_]+?_)/g);
  return parts.map((p, i) => {
    if (!p) return null;
    if (p.startsWith('***') && p.endsWith('***') && p.length > 6) {
      return (
        <strong key={`${key}-${i}`} className="font-semibold text-zinc-900">
          <em>{p.slice(3, -3)}</em>
        </strong>
      );
    }
    if (p.startsWith('**') && p.endsWith('**') && p.length > 4) {
      return (
        <strong key={`${key}-${i}`} className="font-semibold text-zinc-900">
          {p.slice(2, -2)}
        </strong>
      );
    }
    if (p.startsWith('*') && p.endsWith('*') && p.length > 2) {
      return (
        <em key={`${key}-${i}`} className="text-zinc-600">
          {p.slice(1, -1)}
        </em>
      );
    }
    if (p.startsWith('_') && p.endsWith('_') && p.length > 2) {
      return (
        <em key={`${key}-${i}`} className="text-zinc-600">
          {p.slice(1, -1)}
        </em>
      );
    }
    if (p.startsWith('`') && p.endsWith('`') && p.length > 2) {
      return (
        <code key={`${key}-${i}`} className="px-1.5 py-0.5 rounded bg-zinc-100 text-[13px] font-mono text-[#0077CC]">
          {p.slice(1, -1)}
        </code>
      );
    }
    return p;
  });
}

function Markdown({ text }) {
  const blocks = [];
  const lines = text.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('```')) {
      const code = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith('```')) code.push(lines[i++]);
      i += 1;
      blocks.push(<pre key={i} className="bg-zinc-900 text-zinc-100 rounded-xl p-3 text-[13px] overflow-x-auto font-mono">{code.join('\n')}</pre>);
      continue;
    }
    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items = [];
      while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*([-*]|\d+\.)\s+/, ''));
      const List = ordered ? 'ol' : 'ul';
      blocks.push(<List key={i} className={`${ordered ? 'list-decimal' : 'list-disc'} pl-5 space-y-1`}>{items.map((it, j) => <li key={j}>{inline(it, `${i}-${j}`)}</li>)}</List>);
      continue;
    }
    if (/^#{1,4}\s/.test(line)) {
      blocks.push(<p key={i} className="font-semibold text-zinc-900">{inline(line.replace(/^#+\s/, ''), i)}</p>);
      i += 1;
      continue;
    }
    if (line.trim()) blocks.push(<p key={i}>{inline(line, i)}</p>);
    i += 1;
  }
  return <div className="space-y-2.5 leading-relaxed">{blocks}</div>;
}

export function AskAlliance({ initialPrompt, onPromptUsed, compact = false, userProfile }) {
  const [messages, setMessages] = useStoredState('alliance-chat', []);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null); // { connected, model, hasClientKey, hasServerKey } | 'offline'
  
  // Custom Gemini API Key state
  const [customKey, setCustomKey] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [modalKeyInput, setModalKeyInput] = useState('');
  const [showKeyPassword, setShowKeyPassword] = useState(false);
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);
  const [keyFeedback, setKeyFeedback] = useState(null); // { type: 'success' | 'error', message }

  const endRef = useRef(null);
  const sentPrompt = useRef(null);

  const fetchStatus = (activeKey) => {
    const key = activeKey !== undefined ? activeKey : customKey;
    const headers = key ? { 'x-gemini-api-key': key } : {};
    fetch('/api/ai/status', { headers })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setStatus)
      .catch(() => setStatus('offline'));
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, busy]);

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    const next = [...messages, { role: 'user', content: q }];
    setMessages(next);
    setInput('');
    setBusy(true);

    const activeKey = customKey || (status?.hasServerKey ? undefined : '');

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(activeKey ? { 'x-gemini-api-key': activeKey } : {})
        },
        body: JSON.stringify({
          messages: next.filter((m) => !m.error),
          apiKey: activeKey || undefined,
          student: {
            name: userProfile?.fullName,
            program: STUDENT_INFO.program,
            semester: STUDENT_INFO.semester,
            subjects: CURRENT_SUBJECTS.map((s) => s.name)
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
      setMessages((m) => [...m, { role: 'assistant', content: data.reply, mode: data.mode }]);
    } catch (err) {
      const offline = err instanceof TypeError || /Failed to fetch|Unexpected token/.test(err.message);
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          error: true,
          content: offline
            ? 'I can’t reach the server. Make sure the backend is running (cd backend, then npm start).'
            : err.message
        }
      ]);
    } finally {
      setBusy(false);
    }
  };

  // Questions handed over from other pages (for example "Explain" on a PYQ).
  useEffect(() => {
    if (initialPrompt && sentPrompt.current !== initialPrompt) {
      sentPrompt.current = initialPrompt;
      send(initialPrompt);
      onPromptUsed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  const handleOpenKeyModal = () => {
    setModalKeyInput(customKey);
    setKeyFeedback(null);
    setShowKeyModal(true);
  };

  const handleVerifyAndSaveKey = async () => {
    const key = modalKeyInput.trim();
    if (!key) {
      setKeyFeedback({ type: 'error', message: 'Please enter a valid API key.' });
      return;
    }
    setIsVerifyingKey(true);
    setKeyFeedback(null);
    try {
      const res = await fetch('/api/ai/validate-key', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ apiKey: key })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.valid) {
        throw new Error(data.error || 'Google Gemini API key validation failed.');
      }

      // Save locally
      try {
        localStorage.setItem(STORAGE_KEY, key);
      } catch {
        /* ignore */
      }
      setCustomKey(key);

      // Persist to backend .env so other modules (e.g. 3D lab) also benefit
      await fetch('/api/ai/save-key', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ apiKey: key })
      }).catch(() => {});

      setKeyFeedback({
        type: 'success',
        message: 'Google Gemini Flash connected and active!'
      });

      fetchStatus(key);

      setTimeout(() => {
        setShowKeyModal(false);
      }, 1100);
    } catch (err) {
      setKeyFeedback({
        type: 'error',
        message: err.message || 'Failed to verify key. Check network and key permissions.'
      });
    } finally {
      setIsVerifyingKey(false);
    }
  };

  const handleClearKey = async () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setCustomKey('');
    setModalKeyInput('');
    await fetch('/api/ai/key', { method: 'DELETE' }).catch(() => {});
    setKeyFeedback({
      type: 'success',
      message: 'Key removed. Switched back to Offline Socratic Engine.'
    });
    fetchStatus('');
    setTimeout(() => {
      setShowKeyModal(false);
    }, 900);
  };

  const isLiveConnected = Boolean(customKey || (status && status !== 'offline' && status.connected));

  return (
    <div className={`flex flex-col ${compact ? 'h-full' : 'h-[calc(100vh-15rem)] min-h-[480px]'} bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden relative`}>
      {/* Header Bar */}
      <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-zinc-100 flex-wrap sm:flex-nowrap">
        <span className="w-8 h-8 rounded-xl bg-[#0077CC] text-white flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </span>
        <div className="min-w-0 mr-auto">
          <p className="text-sm font-semibold text-zinc-900">Alliance AI</p>
          <p className="text-xs text-zinc-500 truncate">
            {status === null
              ? 'Connecting…'
              : status === 'offline'
              ? 'Server offline'
              : isLiveConnected
              ? 'Google Gemini Flash · Active'
              : 'Gemini Socratic Engine · Active'}
          </p>
        </div>

        {/* API Key Action Pill */}
        <button
          type="button"
          onClick={handleOpenKeyModal}
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
            isLiveConnected
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
          }`}
          title="Configure Google Gemini API Key"
        >
          <Key className="w-3.5 h-3.5" />
          <span>{customKey ? 'API Key Active' : 'Enter API Key'}</span>
        </button>

        {isLiveConnected && (
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Gemini
          </span>
        )}

        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 px-2 py-1 rounded-full hover:bg-zinc-100"
          >
            <RotateCcw className="w-3.5 h-3.5" />New chat
          </button>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4">
        {messages.length === 0 && (
          <div className="max-w-xl mx-auto text-center pt-4">
            <span className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#0077CC] flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6" />
            </span>
            <p className="text-lg font-semibold text-zinc-900">Ask anything about Alliance or your subjects</p>
            <p className="text-sm text-zinc-500 mb-4">
              Rules, exams, grading, and coursework guidance grounded in your B.Tech syllabus.
            </p>

            {/* Enter API Key Prompt Card if no key is configured */}
            {!customKey && (!status || !status.hasServerKey) && (
              <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-[#EFF6FF]/90 to-amber-50/80 border border-indigo-100 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-white text-[#0077CC] shadow-xs flex items-center justify-center shrink-0">
                    <Key className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-zinc-900">Want live Google Gemini Flash responses?</p>
                    <p className="text-[11px] text-zinc-500">Add your free Gemini API key to activate live reasoning.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleOpenKeyModal}
                  className="px-3 py-1.5 rounded-xl bg-[#0077CC] hover:bg-[#005FA3] text-white text-xs font-medium transition-colors shrink-0 shadow-xs cursor-pointer"
                >
                  Enter Key
                </button>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.slice(0, compact ? 4 : 6).map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="px-3.5 py-2 rounded-full border border-zinc-200 text-sm text-zinc-700 hover:border-[#0077CC] hover:bg-[#F7F5FD] transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) =>
          m.role === 'user' ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] rounded-xl rounded-br-sm bg-[#0077CC] text-white px-4 py-2.5 text-[15px] whitespace-pre-wrap shadow-xs">
                {m.content}
              </div>
            </div>
          ) : (
            <div key={i} className="flex gap-3">
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  m.error ? 'bg-red-50 text-red-600' : 'bg-[#EFF6FF] text-[#0077CC]'
                }`}
              >
                {m.error ? <CircleAlert className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </span>
              <div className={`max-w-[88%] text-[15px] ${m.error ? 'text-red-700' : 'text-zinc-800'}`}>
                <Markdown text={m.content} />
              </div>
            </div>
          )
        )}

        {busy && (
          <div className="flex gap-3 items-center">
            <span className="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#0077CC] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="flex gap-1">
              {[0, 1, 2].map((d) => (
                <span
                  key={d}
                  className="w-2 h-2 rounded-full bg-zinc-300 animate-bounce"
                  style={{ animationDelay: `${d * 120}ms` }}
                />
              ))}
            </span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="p-3 sm:p-4 border-t border-zinc-200 bg-[#F8FAFC]">
        <div className="flex items-end gap-2 rounded-lg bg-white border border-zinc-200 focus-within:border-[#0077CC] focus-within:ring-2 focus-within:ring-[#0077CC]/15 px-3 py-2 shadow-xs">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Ask a question..."
            className="flex-1 resize-none bg-transparent text-[15px] focus:outline-none py-1.5 max-h-40"
          />
          <button
            type="submit"
            disabled={!input.trim() || busy}
            className="w-9 h-9 rounded-xl bg-[#0077CC] text-white flex items-center justify-center disabled:opacity-40 cursor-pointer"
            aria-label="Send"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[11px] text-zinc-400 mt-1.5 text-center">
          Alliance AI can make mistakes. Verify critical exam schedules with university circulars.
        </p>
      </form>

      {/* Google Gemini API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-zinc-200 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#0077CC] flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-zinc-900">Google Gemini API Key</h3>
                  <p className="text-xs text-zinc-500">Live Google Gemini Flash for Alliance AI</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="w-8 h-8 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  Enter Gemini API Key
                </label>
                <div className="relative">
                  <input
                    type={showKeyPassword ? 'text' : 'password'}
                    value={modalKeyInput}
                    onChange={(e) => {
                      setModalKeyInput(e.target.value);
                      setKeyFeedback(null);
                    }}
                    placeholder="AIzaSy..."
                    className="w-full px-3.5 py-2.5 pr-10 text-sm font-mono rounded-xl border border-zinc-200 focus:outline-none focus:border-[#0077CC] focus:ring-1 focus:ring-[#0077CC]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeyPassword(!showKeyPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 rounded cursor-pointer"
                    title={showKeyPassword ? 'Hide Key' : 'Show Key'}
                  >
                    {showKeyPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-500 mt-2 flex items-center gap-1">
                  <span>Don’t have a key?</span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0077CC] font-medium inline-flex items-center gap-0.5 hover:underline"
                  >
                    Get free key at Google AI Studio <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>

              {keyFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                    keyFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {keyFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span>{keyFeedback.message}</span>
                </div>
              )}

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  disabled={isVerifyingKey || !modalKeyInput.trim()}
                  onClick={handleVerifyAndSaveKey}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0077CC] hover:bg-[#005FA3] text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shadow-xs cursor-pointer"
                >
                  {isVerifyingKey ? (
                    <>
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                      <span>Verifying with Google...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save & Activate Live Mode</span>
                    </>
                  )}
                </button>

                {customKey && (
                  <button
                    type="button"
                    onClick={handleClearKey}
                    className="w-full py-2 px-4 rounded-xl text-xs text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    Remove Key & Revert to Offline Socratic Engine
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AskAlliancePage(props) {
  return <AskAlliance {...props} />;
}
