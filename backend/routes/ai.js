// AI features: "Ask Alliance AI" chat and AI-generated 3D learning scenes.
//
// Uses the Anthropic (Claude) API when ANTHROPIC_API_KEY is set in backend/.env.
// Without a key, every endpoint still works in demo mode, so the platform
// never breaks. The key stays on the server and is never sent to the browser.

const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = () => process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';
const hasKey = () => Boolean(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim());

// The university handbook the chatbot answers from. Edit this file to add
// official information (it is re-read on every request, no restart needed).
const KNOWLEDGE_FILE = path.join(__dirname, '..', 'data', 'alliance-knowledge.md');
const readKnowledge = () => {
  try {
    return fs.readFileSync(KNOWLEDGE_FILE, 'utf8');
  } catch {
    return '';
  }
};

async function callClaude({ system, messages, maxTokens = 1200 }) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY.trim(),
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model: MODEL(), max_tokens: maxTokens, system, messages }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || `Claude API error (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return (data.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();
}

// Keep only well-formed turns, newest last, and cap the history length.
const cleanMessages = (messages) =>
  (Array.isArray(messages) ? messages : [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-16)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 6000) }));

/* ------------------------------------------------------------------ */
/* Status                                                              */
/* ------------------------------------------------------------------ */

router.get('/status', (req, res) => {
  res.json({ connected: hasKey(), model: hasKey() ? MODEL() : null });
});

/* ------------------------------------------------------------------ */
/* Chat                                                                */
/* ------------------------------------------------------------------ */

// Demo mode: find the handbook section that best matches the question.
function demoAnswer(question) {
  const sections = readKnowledge()
    .split(/\n(?=## )/)
    .filter((s) => s.startsWith('## '));
  const words = question.toLowerCase().match(/[a-z]{4,}/g) || [];
  let best = null;
  let bestScore = 0;
  for (const s of sections) {
    const text = s.toLowerCase();
    const score = words.reduce((n, w) => n + (text.includes(w) ? 1 : 0), 0);
    if (score > bestScore) {
      best = s;
      bestScore = score;
    }
  }
  if (best && bestScore >= 1) {
    return `${best.replace(/^## /, '**').replace(/\n/, '**\n')}\n\n_Demo mode: this answer comes straight from the Alliance handbook. Add an Anthropic API key to get full answers to any question._`;
  }
  return "I'm running in demo mode, so I can only answer from the Alliance handbook (exams, marks, library, placements and so on). Try one of the suggested questions, or ask your administrator to add an Anthropic API key so I can help with any subject question.";
}

router.post('/chat', async (req, res) => {
  const messages = cleanMessages(req.body?.messages);
  const student = req.body?.student || {};
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return res.status(400).json({ error: 'Send at least one question.' });
  }
  const question = messages[messages.length - 1].content;

  if (!hasKey()) return res.json({ mode: 'demo', reply: demoAnswer(question) });

  const system = [
    'You are "Alliance AI", the study and campus assistant inside Alliance University\'s learning platform (Alliance.ai).',
    'You help students with two kinds of questions:',
    '1. Questions about Alliance University, its rules and services: answer ONLY from the handbook below. If the handbook does not cover it, say you do not have that information and suggest the right office to ask. Never invent dates, fees, names or rules.',
    '2. Study questions on their subjects: explain clearly, step by step, at undergraduate level, with a small example where it helps. Encourage understanding rather than just giving answers to assignment or test questions.',
    'Keep answers focused and well structured. Use short paragraphs and bullet points; use **bold** sparingly. Reply in the language the student writes in.',
    student.name ? `The student is ${student.name}, ${student.program || 'B.Tech'} semester ${student.semester || ''}. Current subjects: ${(student.subjects || []).join(', ')}.` : '',
    '',
    '<handbook>',
    readKnowledge(),
    '</handbook>',
  ].join('\n');

  try {
    const reply = await callClaude({ system, messages });
    res.json({ mode: 'live', reply });
  } catch (err) {
    res.status(502).json({ error: err.status === 401 ? 'The Anthropic API key was rejected. Check ANTHROPIC_API_KEY in backend/.env.' : err.message });
  }
});

/* ------------------------------------------------------------------ */
/* 3D scene generation                                                 */
/* ------------------------------------------------------------------ */

const SHAPES = ['sphere', 'box', 'cylinder', 'cone', 'torus'];
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, Number(v) || 0));
const hex = (c) => (/^#[0-9a-fA-F]{6}$/.test(c) ? c : '#6D3FC0');

// Make whatever the model returned safe to render.
function sanitizeScene(raw) {
  const objects = (raw.objects || []).slice(0, 40).map((o, i) => ({
    id: String(o.id || `o${i}`).slice(0, 40),
    label: String(o.label || '').slice(0, 40),
    info: String(o.info || '').slice(0, 300),
    shape: SHAPES.includes(o.shape) ? o.shape : 'sphere',
    position: [0, 1, 2].map((k) => clamp(o.position?.[k], -8, 8)),
    size: clamp(o.size || 1, 0.2, 3),
    color: hex(o.color),
  }));
  const ids = new Set(objects.map((o) => o.id));
  const links = (raw.links || [])
    .filter((l) => ids.has(String(l.from)) && ids.has(String(l.to)))
    .slice(0, 60)
    .map((l) => ({ from: String(l.from), to: String(l.to), label: String(l.label || '').slice(0, 30) }));
  const steps = (raw.steps || []).slice(0, 8).map((s) => ({
    title: String(s.title || '').slice(0, 60),
    text: String(s.text || '').slice(0, 500),
    focus: (s.focus || []).map(String).filter((id) => ids.has(id)),
  }));
  if (!objects.length) throw new Error('The generated model was empty. Try describing the topic differently.');
  return { title: String(raw.title || 'Model').slice(0, 80), summary: String(raw.summary || '').slice(0, 400), objects, links, steps };
}

router.post('/scene', async (req, res) => {
  const topic = String(req.body?.topic || '').trim().slice(0, 200);
  if (!topic) return res.status(400).json({ error: 'Describe what you want to see in 3D.' });
  if (!hasKey()) return res.json({ mode: 'demo', scene: null });

  const system = `You design simple, accurate 3D teaching models for engineering students. Reply with ONLY a JSON object, no prose and no code fences, in this exact shape:
{
  "title": "short title",
  "summary": "one or two sentences on what the model shows",
  "objects": [{ "id": "unique_id", "label": "short label", "info": "one sentence shown when clicked", "shape": "sphere|box|cylinder|cone|torus", "position": [x, y, z], "size": 0.5-2, "color": "#RRGGBB" }],
  "links": [{ "from": "id", "to": "id", "label": "optional short label" }],
  "steps": [{ "title": "step title", "text": "2-3 sentence explanation", "focus": ["ids highlighted in this step"] }]
}
Rules: 4 to 30 objects; coordinates between -6 and 6 with objects spread out so labels do not overlap; use colour to group related parts; 3 to 6 steps that walk through the concept in teaching order; keep labels under 20 characters. Model the real structure of the concept (for example a tree as a tree, layers as stacked boxes, a pipeline as a row).`;

  try {
    const text = await callClaude({ system, messages: [{ role: 'user', content: `Build a 3D teaching model of: ${topic}` }], maxTokens: 3000 });
    const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
    res.json({ mode: 'live', scene: sanitizeScene(JSON.parse(json)) });
  } catch (err) {
    res.status(502).json({ error: err instanceof SyntaxError ? 'The AI returned an unreadable model. Please try again.' : err.status === 401 ? 'The Anthropic API key was rejected. Check ANTHROPIC_API_KEY in backend/.env.' : err.message });
  }
});

module.exports = router;
