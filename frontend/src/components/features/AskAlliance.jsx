import React, { useEffect, useRef, useState } from 'react';
import { ArrowUp, CircleAlert, Plug, RotateCcw, Sparkles } from 'lucide-react';
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

/* Small, safe markdown: paragraphs, headings, lists, bold, inline code, code blocks. */
function inline(text, key) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|_[^_]+_)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={`${key}-${i}`} className="font-semibold">{p.slice(2, -2)}</strong>;
    if (p.startsWith('`') && p.endsWith('`')) return <code key={`${key}-${i}`} className="px-1 py-0.5 rounded bg-zinc-100 text-[13px] font-mono">{p.slice(1, -1)}</code>;
    if (p.startsWith('_') && p.endsWith('_') && p.length > 2) return <em key={`${key}-${i}`} className="text-zinc-500">{p.slice(1, -1)}</em>;
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
  const [status, setStatus] = useState(null); // { connected, model } | 'offline'
  const endRef = useRef(null);
  const sentPrompt = useRef(null);

  useEffect(() => {
    fetch('/api/ai/status')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setStatus)
      .catch(() => setStatus('offline'));
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
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          messages: next.filter((m) => !m.error),
          student: { name: userProfile?.fullName, program: STUDENT_INFO.program, semester: STUDENT_INFO.semester, subjects: CURRENT_SUBJECTS.map((s) => s.name) },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
      setMessages((m) => [...m, { role: 'assistant', content: data.reply, mode: data.mode }]);
    } catch (err) {
      const offline = err instanceof TypeError || /Failed to fetch|Unexpected token/.test(err.message);
      setMessages((m) => [...m, { role: 'assistant', error: true, content: offline ? 'I can’t reach the server. Make sure the backend is running (cd backend, then node server.js).' : err.message }]);
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

  const connected = status && status !== 'offline' && status.connected;

  return (
    <div className={`flex flex-col ${compact ? 'h-full' : 'h-[calc(100vh-15rem)] min-h-[480px]'} bg-white rounded-3xl border border-[#E4E4E7] overflow-hidden`}>
      <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-zinc-100">
        <span className="w-8 h-8 rounded-xl bg-[#6D3FC0] text-white flex items-center justify-center"><Sparkles className="w-4 h-4" /></span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-900">Alliance AI</p>
          <p className="text-xs text-zinc-500 truncate">
            {status === null ? 'Connecting…' : status === 'offline' ? 'Server offline' : connected ? `Connected to Claude` : 'Demo mode: answers from the Alliance handbook'}
          </p>
        </div>
        {status && !connected && (
          <span title="Add ANTHROPIC_API_KEY to backend/.env and restart the backend to enable full answers" className="ml-2 inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-800">
            <Plug className="w-3 h-3" />{status === 'offline' ? 'Offline' : 'No API key'}
          </span>
        )}
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} className="ml-auto inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 px-2 py-1 rounded-full hover:bg-zinc-100">
            <RotateCcw className="w-3.5 h-3.5" />New chat
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4">
        {messages.length === 0 && (
          <div className="max-w-xl mx-auto text-center pt-6">
            <span className="w-12 h-12 rounded-2xl bg-[#F1EEFB] text-[#6D3FC0] flex items-center justify-center mx-auto mb-3"><Sparkles className="w-6 h-6" /></span>
            <p className="text-lg font-semibold text-zinc-900">Ask anything about Alliance or your subjects</p>
            <p className="text-sm text-zinc-500 mb-5">Rules, exams, library and placements, plus help with any topic you’re studying.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.slice(0, compact ? 4 : 6).map((s) => (
                <button key={s} onClick={() => send(s)} className="px-3.5 py-2 rounded-full border border-zinc-200 text-sm text-zinc-700 hover:border-[#6D3FC0] hover:bg-[#F7F5FD]">{s}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) =>
          m.role === 'user' ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[#6D3FC0] text-white px-4 py-2.5 text-[15px] whitespace-pre-wrap">{m.content}</div>
            </div>
          ) : (
            <div key={i} className="flex gap-3">
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${m.error ? 'bg-red-50 text-red-600' : 'bg-[#F1EEFB] text-[#6D3FC0]'}`}>
                {m.error ? <CircleAlert className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </span>
              <div className={`max-w-[88%] text-[15px] ${m.error ? 'text-red-700' : 'text-zinc-800'}`}><Markdown text={m.content} /></div>
            </div>
          )
        )}
        {busy && (
          <div className="flex gap-3 items-center">
            <span className="w-7 h-7 rounded-lg bg-[#F1EEFB] text-[#6D3FC0] flex items-center justify-center"><Sparkles className="w-4 h-4" /></span>
            <span className="flex gap-1">{[0, 1, 2].map((d) => <span key={d} className="w-2 h-2 rounded-full bg-zinc-300 animate-bounce" style={{ animationDelay: `${d * 120}ms` }} />)}</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="p-3 sm:p-4 border-t border-zinc-100">
        <div className="flex items-end gap-2 rounded-2xl border border-zinc-200 focus-within:border-[#6D3FC0] px-3 py-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            rows={1}
            placeholder="Ask a question"
            className="flex-1 resize-none bg-transparent text-[15px] focus:outline-none py-1.5 max-h-40"
          />
          <button type="submit" disabled={!input.trim() || busy} className="w-9 h-9 rounded-xl bg-[#6D3FC0] text-white flex items-center justify-center disabled:opacity-40" aria-label="Send">
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[11px] text-zinc-400 mt-1.5 text-center">Alliance AI can make mistakes. Check important rules with your department.</p>
      </form>
    </div>
  );
}

export function AskAlliancePage(props) {
  return <AskAlliance {...props} />;
}
