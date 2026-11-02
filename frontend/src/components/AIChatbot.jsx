import React, { useState, useEffect, useRef } from 'react';
import {
  BotMessageSquare,
  Sparkles,
  Send,
  RotateCcw,
  BookOpen,
  Copy,
  Check,
  BrainCircuit,
  Lightbulb,
  HelpCircle,
  Code,
  Flame,
  ArrowRight
} from 'lucide-react';
import { api } from '../utils/api';

export default function AIChatbot({ initialQuestion, initialCourseCode }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome_1',
      sender: 'bot',
      text: `### Welcome to Alliance AI — Academic Reasoning Assistant
I am grounded in the **Alliance University curriculum**, MSE/ESE past question papers, and syllabus topics.

**How would you like to learn today?**
- In **Socratic Mode**, I guide you step-by-step with targeted hints so you master the concepts yourself.
- In **Direct Mode**, I provide full code solutions and architectural breakdowns immediately.`,
      hints: [
        "Toggle Socratic vs Direct Mode anytime with the switch above.",
        "Select your course to ground answers in that syllabus."
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(initialCourseCode || 'CSE201');
  const [socraticMode, setSocraticMode] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState(null);

  const messagesEndRef = useRef(null);

  const quickPrompts = [
    { label: "Dijkstra vs Bellman-Ford", query: "Explain Dijkstra vs Bellman-Ford when graphs have negative edge weights" },
    { label: "React useEffect loop", query: "How to fix infinite re-render loops in React useEffect?" },
    { label: "Virtual Memory & TLB", query: "Explain how TLB cache misses work during page address translation in OS" },
    { label: "Dynamic Programming Tips", query: "What is the pattern to identify 0/1 Knapsack variations in exam questions?" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // If passed initial question from PYQ preview
  useEffect(() => {
    if (initialQuestion) {
      if (initialCourseCode) setSelectedCourse(initialCourseCode);
      handleSend(initialQuestion);
    }
  }, [initialQuestion]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim() || isTyping) return;

    const userMsg = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: text.trim()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const mode = socraticMode ? 'socratic' : 'direct';
      const res = await api.sendChatQuery(text.trim(), selectedCourse, mode);

      if (res.success && res.data) {
        setMessages(prev => [
          ...prev,
          {
            id: 'bot_' + Date.now(),
            sender: 'bot',
            text: res.data.reply,
            hints: res.data.hints || [],
            codeSnippet: res.data.codeSnippet
          }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: 'bot_err_' + Date.now(),
          sender: 'bot',
          text: "I encountered a minor network delay communicating with the Alliance AI gateway. Please try asking again!"
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome_reset',
        sender: 'bot',
        text: "Chat cleared! Select a course and ask any academic doubt or exam problem.",
        hints: []
      }
    ]);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-editorial text-zinc-900">
              EDUX AI Socratic Tutor
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-code font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              Syllabus-Grounded
            </span>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            Course-grounded AI tutor trained on Alliance University curricula, lecture notes, and past examination patterns.
          </p>
        </div>

        {/* Mode & Course Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Socratic Mode Toggle */}
          <div className="flex items-center gap-2 bg-white border border-[#E4E4E7] px-3 py-1.5 rounded-full text-xs font-code">
            <Lightbulb className={`w-3.5 h-3.5 ${socraticMode ? 'text-amber-500' : 'text-zinc-400'}`} />
            <span className="font-semibold text-zinc-800">
              {socraticMode ? 'Socratic Hints' : 'Direct Solutions'}
            </span>
            <button
              onClick={() => setSocraticMode(!socraticMode)}
              className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                socraticMode ? 'bg-indigo-600' : 'bg-zinc-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  socraticMode ? 'translate-x-4' : 'translate-x-0'
                }`}
              ></div>
            </button>
          </div>

          {/* Course Selector Dropdown */}
          <div className="relative">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="bg-white border border-[#E4E4E7] text-zinc-800 text-xs font-code font-semibold px-3 py-1.5 rounded-full focus:outline-none"
            >
              <option value="CSE201">CSE201: Data Structures</option>
              <option value="CSE305">CSE305: Operating Systems</option>
              <option value="DES201">DES201: UI/UX Design</option>
              <option value="CSE204">CSE204: Frontend Engineering</option>
              <option value="CSE401">CSE401: AI & Neural Networks</option>
            </select>
          </div>

          <button
            onClick={handleClearChat}
            className="w-8 h-8 rounded-full bg-white border border-[#E4E4E7] flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-all"
            title="Clear Chat"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="bg-white rounded-3xl border border-[#E4E4E7] shadow-xs flex flex-col h-[650px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#FAF9F6]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'bot' && (
                <div className="w-9 h-9 rounded-2xl bg-[#18181B] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-3xl p-5 text-xs leading-relaxed space-y-3 ${
                  msg.sender === 'user'
                    ? 'bg-zinc-900 text-white rounded-br-none shadow-sm'
                    : 'bg-white text-zinc-800 border border-[#E4E4E7] rounded-bl-none shadow-xs'
                }`}
              >
                {/* Render Markdown-like content */}
                <div className="whitespace-pre-line prose-sm font-sans space-y-2">
                  {msg.text}
                </div>

                {/* Socratic Hints Box */}
                {msg.hints && msg.hints.length > 0 && (
                  <div className="pt-2 border-t border-zinc-100">
                    <span className="text-[10px] font-code font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1 mb-1">
                      <Lightbulb className="w-3 h-3 text-amber-500" /> Socratic Key Hints
                    </span>
                    <ul className="space-y-1 text-[11px] text-zinc-600 font-code">
                      {msg.hints.map((h, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
                  alt="Alex"
                  className="w-9 h-9 rounded-2xl object-cover shrink-0 ring-2 ring-zinc-200"
                />
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3.5 items-center">
              <div className="w-9 h-9 rounded-2xl bg-[#18181B] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
              </div>
              <div className="bg-white border border-[#E4E4E7] rounded-2xl px-4 py-3 flex items-center gap-1.5 text-zinc-400 text-xs">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></span>
                <span className="ml-2 font-code text-[11px] text-zinc-500">
                  Formulating Socratic guidance...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Strip */}
        <div className="px-6 py-2.5 bg-white border-t border-zinc-100 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-code text-zinc-400 uppercase tracking-wider shrink-0">
            Suggested:
          </span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p.query)}
              className="px-3 py-1 rounded-full bg-[#FAF9F6] hover:bg-zinc-100 border border-zinc-200 text-[11px] font-code text-zinc-700 whitespace-nowrap transition-all"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 bg-white border-t border-zinc-200/80 flex items-center gap-3"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask EDUX AI about ${selectedCourse} algorithms, formulas, or past exam doubts...`}
            className="flex-1 bg-[#FAF9F6] text-xs text-zinc-800 placeholder:text-zinc-400 px-4 py-3 rounded-2xl border border-zinc-200 focus:outline-none focus:border-indigo-500"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="px-5 py-3 rounded-2xl bg-[#18181B] hover:bg-zinc-800 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-xs shrink-0"
          >
            <span>Ask Tutor</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

