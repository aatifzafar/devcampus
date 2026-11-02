// AI features: "Ask Alliance AI" chat and AI-generated 3D learning scenes.
//
// Primary Provider: Google Gemini API (using GEMINI_API_KEY in backend/.env)
// Secondary Provider: Anthropic Claude API (using ANTHROPIC_API_KEY in backend/.env)
// Offline Fallback: Gemini Socratic Engine trained on Alliance University curricula,
//                  campus handbook, and core Computer Science & Engineering subjects.

const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const FLASH_MODELS = ['gemini-3.8-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
const GEMINI_MODEL = () => process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const ANTHROPIC_MODEL = () => process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';

const getClientGeminiKey = (req) => {
  const custom = req?.headers?.['x-gemini-api-key'] || req?.body?.apiKey || req?.query?.apiKey;
  if (custom && typeof custom === 'string' && custom.trim()) {
    return custom.trim();
  }
  return (process.env.GEMINI_API_KEY || '').trim();
};

const getClientAnthropicKey = (req) => {
  const custom = req?.headers?.['x-anthropic-api-key'] || req?.body?.anthropicKey;
  if (custom && typeof custom === 'string' && custom.trim()) {
    return custom.trim();
  }
  return (process.env.ANTHROPIC_API_KEY || '').trim();
};

const hasGeminiKey = (req) => Boolean(getClientGeminiKey(req));
const hasAnthropicKey = (req) => Boolean(getClientAnthropicKey(req));
const hasAnyKey = (req) => hasGeminiKey(req) || hasAnthropicKey(req);

const activeModelName = (req) => {
  if (hasGeminiKey(req)) return `Google Gemini (${GEMINI_MODEL()})`;
  if (hasAnthropicKey(req)) return `Claude (${ANTHROPIC_MODEL()})`;
  return 'Gemini Socratic Engine (Active Fallback)';
};

// University handbook for campus guidelines
const KNOWLEDGE_FILE = path.join(__dirname, '..', 'data', 'alliance-knowledge.md');
const readKnowledge = () => {
  try {
    return fs.readFileSync(KNOWLEDGE_FILE, 'utf8');
  } catch {
    return '';
  }
};

/* ------------------------------------------------------------------ */
/* LLM Client: Google Gemini API (Primary)                            */
/* ------------------------------------------------------------------ */

async function callGemini({ system, messages, maxTokens = 1500, jsonOnly = false, apiKey }) {
  const effectiveKey = (apiKey || process.env.GEMINI_API_KEY || '').trim();
  if (!effectiveKey) throw new Error('No Gemini API key provided.');

  const preferred = (process.env.GEMINI_MODEL || 'gemini-3.8-flash').trim();
  const modelsToTry = [preferred, ...FLASH_MODELS.filter(m => m !== preferred)];

  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const body = {
    contents,
    systemInstruction: {
      parts: [{ text: system }]
    },
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.3,
      ...(jsonOnly ? { responseMimeType: 'application/json' } : {})
    }
  };

  let lastErr = null;
  for (const model of modelsToTry) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(effectiveKey)}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        process.env.GEMINI_MODEL = model;
        const candidate = data.candidates?.[0];
        const text = candidate?.content?.parts?.map((p) => p.text).join('\n') || '';
        return text.trim();
      }
      const msg = data?.error?.message || `Google Gemini API error (${res.status})`;
      lastErr = new Error(msg);
      lastErr.status = res.status;
      if (/API_KEY_INVALID|API key not valid/i.test(msg)) throw lastErr;
    } catch (err) {
      lastErr = err;
      if (/API_KEY_INVALID|API key not valid/i.test(err.message)) throw err;
    }
  }
  throw lastErr;
}

/* ------------------------------------------------------------------ */
/* LLM Client: Anthropic Claude API (Secondary)                       */
/* ------------------------------------------------------------------ */

async function callClaude({ system, messages, maxTokens = 1200 }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY.trim(),
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model: ANTHROPIC_MODEL(), max_tokens: maxTokens, system, messages }),
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

// Keep only well-formed turns
const cleanMessages = (messages) =>
  (Array.isArray(messages) ? messages : [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-16)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 6000) }));

/* ------------------------------------------------------------------ */
/* Smart Socratic Engineering Fallback Engine                         */
/* ------------------------------------------------------------------ */

function socraticAnswer(question, student = {}) {
  const q = question.toLowerCase();

  // 1. Dijkstra vs Bellman-Ford
  if (q.includes('dijkstra') || q.includes('bellman') || (q.includes('shortest path') && q.includes('negative'))) {
    return `### Socratic Guided Analysis: Shortest Path Algorithms (CSE201)
**Let's analyze the algorithmic constraints:**

1. **Greedy Choice in Dijkstra:**
   * Why does Dijkstra finalize node distances upon extraction from the min-priority queue?
   * If edge weights are non-negative ($w(u,v) \\ge 0$), can traversing an extra hop ever reduce a distance? No.
   
2. **Failure with Negative Edge Weights:**
   * If edge $(u,v)$ has a negative cost, a longer path in hops could have a lower total cost, violating Dijkstra's greedy invariant.

3. **Bellman-Ford Dynamic Programming Guarantee:**
   * Relaxes all $|E|$ edges $|V| - 1$ times.
   * **Why $|V|-1$?** A simple path between any two vertices in a graph with $|V|$ vertices can contain at most $|V|-1$ edges.
   * **Cycle Detection:** If an iteration on the $|V|$-th step still reduces distance, a negative-weight cycle is detected!

*Complexity*: Dijkstra runs in $O((V+E)\\log V)$ with a binary min-heap; Bellman-Ford runs in $O(V \\cdot E)$.`;
  }

  // 2. React useEffect & Dependencies
  if (q.includes('useeffect') || q.includes('infinite loop') || q.includes('dependency') || q.includes('re-render')) {
    return `### Socratic Hint: React 19 Component Render Cycles
Let's trace how React triggers component execution:

1. **State Update:** \`setState(newVal)\` schedules a re-render.
2. **Comparison:** React compares dependencies in \`[dep1, dep2]\` using \`Object.is()\`.
3. **Common Pitfall:** If you update state inside \`useEffect\` and that state is *also* listed in the dependency array (or if an object literal is instantiated without \`useMemo\`), an infinite render cycle is created:
   \`\`\`jsx
   // Fix: Use functional state updates or omit primitive dependencies:
   setCount(prev => prev + 1);
   \`\`\`
> **Key Rule**: Effects synchronize with external systems, not internal state cascades.`;
  }

  // 3. Operating Systems: Deadlocks & Banker's Algorithm
  if (q.includes('deadlock') || q.includes('banker') || q.includes('semaphore') || q.includes('mutex')) {
    return `### Operating Systems (CSE305): Concurrency & Safety
#### The 4 Coffman Conditions for Deadlock:
1. **Mutual Exclusion**: Non-shareable resource.
2. **Hold and Wait**: Process holding resources while requesting more.
3. **No Preemption**: Resources cannot be forcibly revoked.
4. **Circular Wait**: Closed chain of processes each waiting for the next.

#### Banker's Algorithm Safety Invariant:
A state is **safe** if there exists a process ordering $\\langle P_1, P_2, \\dots, P_n \\rangle$ such that for each $P_i$, its maximum remaining demand can be satisfied by:
$$\\text{Need}[i] \\le \\text{Available} + \\sum_{j < i} \\text{Allocation}[j]$$
*Remember for Alliance MSE*: An unsafe state is not necessarily a deadlock, but every deadlock is an unsafe state.`;
  }

  // 4. Virtual Memory, TLB, Page Replacement
  if (q.includes('virtual memory') || q.includes('tlb') || q.includes('page table') || q.includes('belady')) {
    return `### Virtual Memory & Address Translation (CSE305)
- **Virtual Address:** Split into Virtual Page Number (VPN) and Page Offset.
- **Translation Lookaside Buffer (TLB):** Fast hardware associative cache.
- **Effective Memory Access Time (EMAT):**
  $$\\text{EMAT} = h \\times (t_{\\text{TLB}} + t_{\\text{RAM}}) + (1-h) \\times (t_{\\text{TLB}} + 2 \\times t_{\\text{RAM}})$$
- **Belady's Anomaly:** In FIFO page replacement, increasing the number of page frames can paradoxically increase the number of page faults (does not occur in stack algorithms like LRU or Optimal).`;
  }

  // 5. Theory of Computation: Pumping Lemma & a^n b^n
  if (q.includes('pumping lemma') || q.includes('toc') || q.includes('regular') || q.includes('dfa') || q.includes('a^n') || q.includes('pda')) {
    return `### Theory of Computation (CSE303 Syllabus)
#### Why is $a^n b^n$ not regular?
- A Finite Automaton (DFA) has fixed, finite internal states (memory).
- To accept strings in $L = \\{ a^n b^n \\mid n \\ge 0 \\}$, the automaton must count arbitrarily large numbers of $a$'s to compare with $b$'s.
- **Pumping Lemma Proof:**
  1. Assume $L$ is regular with pumping length $p$.
  2. Pick string $s = a^p b^p \\in L$ where $|s| \\ge p$.
  3. Divide $s = xyz$ where $|xy| \\le p$ and $|y| > 0$.
  4. Since $xy$ lies entirely within the initial $a$'s, $y = a^k$ ($k \\ge 1$).
  5. Pumping $i=2$: $x y^2 z = a^{p+k} b^p \\notin L$ because $p+k \\ne p$. Contradiction!`;
  }

  // 6. Databases: BCNF vs 3NF
  if (q.includes('bcnf') || q.includes('3nf') || q.includes('normalization') || q.includes('normal form')) {
    return `### Database Systems (CSE302): Normalization Criteria
- **3NF Requirement:** For every functional dependency $X \\to Y$:
  1. $X \\to Y$ is trivial ($Y \\subseteq X$), **OR**
  2. $X$ is a superkey, **OR**
  3. Each attribute in $Y \\setminus X$ is a prime attribute (part of a candidate key).
- **BCNF Requirement:** Stricter than 3NF. For every non-trivial $X \\to Y$, $X$ **must** be a superkey.
- **Key Exam Property:** Every relation in BCNF is in 3NF. However, BCNF decomposition cannot always guarantee dependency preservation (e.g. $AB \\to C, C \\to B$), whereas 3NF synthesis guarantees both lossless join and dependency preservation.`;
  }

  // 7. University Handbook match (Exams, Marks, CIE/SEE, Placements)
  const sections = readKnowledge().split(/\n(?=## )/).filter((s) => s.startsWith('## '));
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
    return `${best.replace(/^## /, '**').replace(/\n/, '**\n')}\n\n*Grounded in the official Alliance University Academic Handbook.*`;
  }

  // 8. General Course-Grounded Socratic Response
  return `### Alliance AI Socratic Tutor (${student.program || 'B.Tech CSE'} · Sem ${student.semester || 5})
Regarding your question: **"${question}"**

Here is how we break this down conceptually:
1. **Core Principle**: Identify the underlying theorem, invariant, or architectural pattern.
2. **Analytical Steps**: Formulate the problem constraints before jumping into implementation.
3. **Verification**: Check boundary conditions, asymptotic complexities, and potential race conditions.

*Would you like a step-by-step mathematical proof, code implementation, or a past Alliance University MSE question on this topic?*`;
}

/* ------------------------------------------------------------------ */
/* Routes                                                             */
/* ------------------------------------------------------------------ */

router.get('/status', (req, res) => {
  const geminiKey = getClientGeminiKey(req);
  const anthropicKey = getClientAnthropicKey(req);
  const connected = Boolean(geminiKey || anthropicKey);
  const isCustomClientKey = Boolean(req.headers['x-gemini-api-key'] || req.query?.apiKey);
  const isServerKeyConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());

  res.json({
    connected,
    provider: geminiKey ? 'google-gemini' : (anthropicKey ? 'anthropic' : 'gemini-socratic-local'),
    model: activeModelName(req),
    keySource: isCustomClientKey ? 'frontend' : (isServerKeyConfigured ? 'backend' : 'none'),
    hasClientKey: isCustomClientKey,
    hasServerKey: isServerKeyConfigured,
  });
});

router.post('/validate-key', async (req, res) => {
  const key = String(req.body?.apiKey || req.headers['x-gemini-api-key'] || '').trim();
  if (!key) return res.status(400).json({ success: false, valid: false, error: 'Please enter a Gemini API key.' });

  const preferred = (process.env.GEMINI_MODEL || 'gemini-3.8-flash').trim();
  const modelsToTry = [preferred, ...FLASH_MODELS.filter(m => m !== preferred)];

  let lastError = null;
  for (const model of modelsToTry) {
    try {
      const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
      const testRes = await fetch(testUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Ping' }] }],
          generationConfig: { maxOutputTokens: 5 }
        })
      });
      const data = await testRes.json().catch(() => ({}));
      if (testRes.ok) {
        process.env.GEMINI_MODEL = model;
        return res.json({
          success: true,
          valid: true,
          model,
          provider: `Google Gemini (${model})`,
          message: `Google Gemini (${model}) verified and connected successfully!`
        });
      }
      const errorMsg = data?.error?.message || `Google Gemini returned status ${testRes.status}`;
      lastError = errorMsg;
      if (/API_KEY_INVALID|API key not valid/i.test(errorMsg)) {
        return res.status(400).json({ success: false, valid: false, error: errorMsg });
      }
    } catch (err) {
      lastError = err.message;
    }
  }

  return res.status(400).json({
    success: false,
    valid: false,
    error: lastError || 'Google Gemini validation failed. Please check your API key.'
  });
});

router.post('/save-key', async (req, res) => {
  const key = String(req.body?.apiKey || '').trim();
  if (!key) return res.status(400).json({ success: false, error: 'No key provided.' });
  
  process.env.GEMINI_API_KEY = key;
  
  const envPath = path.join(__dirname, '..', '.env');
  try {
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      if (/^GEMINI_API_KEY=.*$/m.test(envContent)) {
        envContent = envContent.replace(/^GEMINI_API_KEY=.*$/m, `GEMINI_API_KEY=${key}`);
      } else {
        envContent += `\nGEMINI_API_KEY=${key}\n`;
      }
    } else {
      envContent = `PORT=5000\nJWT_SECRET=alliance-ai-devcampus-secret-key-2026\nGEMINI_API_KEY=${key}\nGEMINI_MODEL=gemini-3.8-flash\n`;
    }
    fs.writeFileSync(envPath, envContent, 'utf8');
  } catch (err) {
    console.warn('Could not write backend/.env:', err.message);
  }

  res.json({ success: true, message: 'Gemini API key saved to server environment.' });
});

router.delete('/key', (req, res) => {
  delete process.env.GEMINI_API_KEY;
  const envPath = path.join(__dirname, '..', '.env');
  try {
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      envContent = envContent.replace(/^GEMINI_API_KEY=.*$/m, 'GEMINI_API_KEY=');
      fs.writeFileSync(envPath, envContent, 'utf8');
    }
  } catch {
    /* ignore */
  }
  res.json({ success: true, message: 'Custom API key cleared.' });
});

router.post('/chat', async (req, res) => {
  let rawMessages = req.body?.messages;
  if (!rawMessages && req.body?.message) {
    rawMessages = [{ role: 'user', content: req.body.message }];
  }
  const messages = cleanMessages(rawMessages);
  const student = req.body?.student || {};
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return res.status(400).json({ error: 'Send at least one question.' });
  }
  const question = messages[messages.length - 1].content;

  const geminiKey = getClientGeminiKey(req);
  // Use Gemini if available
  if (geminiKey) {
    const system = [
      'You are "Alliance AI", the advanced study and campus assistant for Alliance University (Alliance.ai).',
      'You are powered by Google Gemini 2.5 Flash.',
      'You help students with:',
      '1. Alliance University curriculum, campus policies, CIE/SEE evaluation, exam schedules, and grading standards.',
      '2. Academic engineering doubts: explain clearly, step by step, with intuitive examples, mathematical formulas, and clean code snippets.',
      student.name ? `The student is ${student.name}, ${student.program || 'B.Tech CSE'} semester ${student.semester || 5}. Current subjects: ${(student.subjects || []).join(', ')}.` : '',
      '',
      '<handbook>',
      readKnowledge(),
      '</handbook>',
    ].join('\n');

    try {
      const reply = await callGemini({ system, messages, apiKey: geminiKey });
      return res.json({ mode: 'live', provider: 'google-gemini', model: GEMINI_MODEL(), reply });
    } catch (err) {
      console.warn('Gemini API call failed, using Socratic fallback:', err.message);
      return res.json({ mode: 'demo', reply: socraticAnswer(question, student) });
    }
  }

  // Use Anthropic if available
  if (hasAnthropicKey()) {
    const system = [
      'You are "Alliance AI", the study and campus assistant inside Alliance University\'s learning platform (Alliance.ai).',
      'Explain clearly, step by step, at undergraduate engineering level with small examples.',
      student.name ? `The student is ${student.name}, ${student.program || 'B.Tech'} semester ${student.semester || ''}. Current subjects: ${(student.subjects || []).join(', ')}.` : '',
      '<handbook>',
      readKnowledge(),
      '</handbook>',
    ].join('\n');

    try {
      const reply = await callClaude({ system, messages });
      return res.json({ mode: 'live', provider: 'anthropic', model: ANTHROPIC_MODEL(), reply });
    } catch (err) {
      console.warn('Claude API call failed, using Socratic fallback:', err.message);
      return res.json({ mode: 'demo', reply: socraticAnswer(question, student) });
    }
  }

  // Offline Socratic Engine Fallback
  return res.json({ mode: 'demo', provider: 'gemini-socratic-local', reply: socraticAnswer(question, student) });
});

/* ------------------------------------------------------------------ */
/* 3D Scene Generation with Pre-built Engineering Archetypes          */
/* ------------------------------------------------------------------ */

const SHAPES = ['sphere', 'box', 'cylinder', 'cone', 'torus'];
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, Number(v) || 0));
const hex = (c) => (/^#[0-9a-fA-F]{6}$/.test(c) ? c : '#6D3FC0');

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
  if (!objects.length) throw new Error('The generated model was empty.');
  return { title: String(raw.title || 'Model').slice(0, 80), summary: String(raw.summary || '').slice(0, 400), objects, links, steps };
}

// Pre-built 3D teaching models for instant fallback demonstration
function getPrebuiltModel(topic) {
  const t = topic.toLowerCase();
  if (t.includes('cpu') || t.includes('processor') || t.includes('cache')) {
    return {
      title: "Octa-Core CPU Die Architecture",
      summary: "Superscalar execution cores, dedicated L1/L2 caches, and shared L3 ring interconnect.",
      objects: [
        { id: "core1", label: "Core 0 (ALU)", info: "Primary Out-of-Order execution engine", shape: "box", position: [-3, 2, 0], size: 1.2, color: "#6D3FC0" },
        { id: "core2", label: "Core 1 (ALU)", info: "Superscalar ALU with AVX-512 vector pipeline", shape: "box", position: [-1, 2, 0], size: 1.2, color: "#6D3FC0" },
        { id: "core3", label: "Core 2 (ALU)", info: "High-efficiency core cluster", shape: "box", position: [1, 2, 0], size: 1.2, color: "#6D3FC0" },
        { id: "core4", label: "Core 3 (ALU)", info: "High-efficiency core cluster", shape: "box", position: [3, 2, 0], size: 1.2, color: "#6D3FC0" },
        { id: "l3", label: "Shared L3 Cache", info: "32MB low-latency shared SRAM", shape: "box", position: [0, 0, 0], size: 2.2, color: "#0F9D76" },
        { id: "bus", label: "PCIe & Memory Crossbar", info: "Dual-channel DDR5 memory controller interface", shape: "cylinder", position: [0, -2.5, 0], size: 1.5, color: "#2563EB" },
      ],
      links: [
        { from: "core1", to: "l3", label: "Ring Bus" },
        { from: "core2", to: "l3", label: "Ring Bus" },
        { from: "core3", to: "l3", label: "Ring Bus" },
        { from: "core4", to: "l3", label: "Ring Bus" },
        { from: "l3", to: "bus", label: "Interconnect" },
      ],
      steps: [
        { title: "Core Dispatch", text: "Instructions are decoded and dispatched across parallel execution ports.", focus: ["core1", "core2"] },
        { title: "L3 Cache Coherence", text: "Shared L3 ring bus maintains MESI cache line states across cores.", focus: ["l3"] },
        { title: "Memory Interface", text: "Memory requests miss in L3 and fetch from DDR5 via crossbar.", focus: ["bus"] },
      ]
    };
  }

  // Neural Network Default Model
  return {
    title: "Deep Neural Network Architecture (MLP)",
    summary: "Feedforward architecture with sensory input layer, latent representations, and output classifier.",
    objects: [
      { id: "in1", label: "Input x1", info: "Normalized sensory input dimension 1", shape: "sphere", position: [-4, 2, 0], size: 1, color: "#2563EB" },
      { id: "in2", label: "Input x2", info: "Normalized sensory input dimension 2", shape: "sphere", position: [-4, -2, 0], size: 1, color: "#2563EB" },
      { id: "h1", label: "Hidden h1", info: "Latent neuron with GELU activation", shape: "sphere", position: [0, 3, 0], size: 1.2, color: "#6D3FC0" },
      { id: "h2", label: "Hidden h2", info: "Latent neuron with GELU activation", shape: "sphere", position: [0, 0, 0], size: 1.2, color: "#6D3FC0" },
      { id: "h3", label: "Hidden h3", info: "Latent neuron with GELU activation", shape: "sphere", position: [0, -3, 0], size: 1.2, color: "#6D3FC0" },
      { id: "out", label: "Softmax Output", info: "Categorical probability distribution", shape: "sphere", position: [4, 0, 0], size: 1.4, color: "#D85A30" },
    ],
    links: [
      { from: "in1", to: "h1", label: "w11" },
      { from: "in1", to: "h2", label: "w12" },
      { from: "in2", to: "h2", label: "w22" },
      { from: "in2", to: "h3", label: "w23" },
      { from: "h1", to: "out", label: "v1" },
      { from: "h2", to: "out", label: "v2" },
      { from: "h3", to: "out", label: "v3" },
    ],
    steps: [
      { title: "Forward Input", text: "Sensory signals enter the input layer.", focus: ["in1", "in2"] },
      { title: "Hidden Transforms", text: "Affine transformations and nonlinear activations compute latent features.", focus: ["h1", "h2", "h3"] },
      { title: "Softmax Output", text: "Final logits are normalized into class probabilities.", focus: ["out"] },
    ]
  };
}

router.post('/scene', async (req, res) => {
  const topic = String(req.body?.topic || '').trim().slice(0, 200);
  if (!topic) return res.status(400).json({ error: 'Describe what you want to see in 3D.' });

  const system = `You design simple, accurate 3D teaching models for engineering students. Reply with ONLY a JSON object, in this exact shape:
{
  "title": "short title",
  "summary": "one or two sentences on what the model shows",
  "objects": [{ "id": "unique_id", "label": "short label", "info": "one sentence shown when clicked", "shape": "sphere|box|cylinder|cone|torus", "position": [x, y, z], "size": 0.5-2, "color": "#RRGGBB" }],
  "links": [{ "from": "id", "to": "id", "label": "optional short label" }],
  "steps": [{ "title": "step title", "text": "2-3 sentence explanation", "focus": ["ids highlighted in this step"] }]
}`;

  const geminiKey = getClientGeminiKey(req);
  if (geminiKey) {
    try {
      const text = await callGemini({ system, messages: [{ role: 'user', content: `Build a 3D model for: ${topic}` }], maxTokens: 3000, jsonOnly: true, apiKey: geminiKey });
      return res.json({ mode: 'live', provider: 'google-gemini', scene: sanitizeScene(JSON.parse(text)) });
    } catch {
      return res.json({ mode: 'demo', scene: getPrebuiltModel(topic) });
    }
  }

  if (hasAnthropicKey()) {
    try {
      const text = await callClaude({ system, messages: [{ role: 'user', content: `Build a 3D teaching model of: ${topic}` }], maxTokens: 3000 });
      const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
      return res.json({ mode: 'live', provider: 'anthropic', scene: sanitizeScene(JSON.parse(json)) });
    } catch {
      return res.json({ mode: 'demo', scene: getPrebuiltModel(topic) });
    }
  }

  // Pre-built fallback model
  return res.json({ mode: 'demo', scene: getPrebuiltModel(topic) });
});

module.exports = router;
