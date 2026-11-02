// Sample data for the five signature features. Everything here is demo data
// for the proposal; replace with real records from the university systems.
import { SEMESTERS } from './subjectsData';
import { courseInfo } from './courseInfo';

const at = (dayOffset, hour, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
};

const allSubjects = SEMESTERS.flatMap((s) => s.subjects.map((x) => ({ ...x, semester: s.number })));
export const subjectAny = (code) => allSubjects.find((s) => s.code === code) || { code, name: code, color: '#71717A' };

/* ================================================================== */
/* 1. Learn with friends: peer tutors                                  */
/* ================================================================== */

// How a student is selected as a peer tutor for a subject.
export const TUTOR_RULES = [
  { id: 'willing', label: 'Willing', text: 'Has chosen to help others in this subject' },
  { id: 'academic', label: 'Academic', text: 'Grade A or above in the subject (or 80%+ in its tests so far)' },
  { id: 'reviews', label: 'Reviews', text: 'Average rating of 4.0 or more from learners (new tutors start on trial)' },
  { id: 'active', label: 'Active', text: 'Used the platform in the last 7 days' },
  { id: 'learning', label: 'Learning', text: 'Keeps learning: 5+ day streak or regular practice' },
  { id: 'best', label: 'Top of class', text: 'In the top 15% of the class for the subject' },
];

const tutor = (id, name, sem, section, teaches, wants, rating, reviews, sessions, lastActiveDays, streak, topPercent, bio, slots) => ({
  id, name, sem, section, teaches, wants, rating, reviews, sessions, lastActiveDays, streak, topPercent, bio, slots, willing: true,
});

// teaches: [code, grade or test %]
export const PEERS = [
  tutor('p1', 'Sneha Kulkarni', 5, 'J', [['CSE302', 'A+'], ['CSE201', 'O']], ['CSE304', 'CSE303'], 4.9, 23, 31, 0, 21, 3, 'I like explaining SQL with real examples from apps you use every day.', ['Mon 5 pm', 'Wed 4 pm', 'Sat 11 am']),
  tutor('p2', 'Rahul Menon', 5, 'J', [['CSE303', '92%'], ['MAT201', 'A+']], ['CSE302'], 4.7, 15, 19, 1, 9, 5, 'Automata finally clicked for me after drawing every machine. I’ll help you draw them too.', ['Tue 6 pm', 'Thu 5 pm']),
  tutor('p3', 'Ayesha Khan', 7, 'B', [['CSE304', 'O'], ['CSE305', 'A+'], ['CSE204', 'A+']], ['CSE301'], 4.8, 40, 52, 0, 34, 2, 'Senior, placement prep done. Networks and OS are my favourite.', ['Mon 6 pm', 'Fri 5 pm', 'Sun 10 am']),
  tutor('p4', 'Karthik Rao', 5, 'K', [['CSE301', '95%'], ['CSE102', 'O']], ['CSE303', 'CSE305'], 4.6, 12, 14, 2, 6, 8, 'Java and OOP. I’ll debug with you, not for you.', ['Wed 6 pm', 'Sat 3 pm']),
  tutor('p5', 'Meera Shetty', 5, 'J', [['CSE305', '88%'], ['CSE202', 'A+']], ['CSE301', 'CSE304'], 4.5, 9, 10, 1, 12, 12, 'Scheduling and deadlock problems step by step.', ['Tue 4 pm', 'Thu 6 pm']),
  tutor('p6', 'Arjun Prakash', 7, 'A', [['CSE302', 'O'], ['CSE301', 'A+']], ['CSE304'], 4.9, 31, 44, 0, 45, 1, 'Senior, did a DBMS internship. Happy to help with normalisation and queries.', ['Mon 7 pm', 'Thu 7 pm']),
  tutor('p7', 'Divya Nair', 5, 'L', [['CSE304', '90%']], ['CSE302', 'CSE305'], null, 0, 0, 0, 8, 10, 'New tutor. Subnetting is my thing.', ['Fri 4 pm', 'Sat 12 pm']),
  tutor('p8', 'Vikram Joshi', 5, 'K', [['CSE303', '84%']], ['CSE301'], 3.6, 7, 8, 9, 0, 22, 'Theory of computation practice problems.', ['Sun 5 pm']),
];

export const RULE_CHECKS = (peer, code) => {
  const t = peer.teaches.find(([c]) => c === code);
  const grade = t?.[1] || '';
  const academic = /^(O|A\+|A)$/.test(grade) || (grade.endsWith('%') && parseInt(grade, 10) >= 80);
  return {
    willing: peer.willing,
    academic,
    reviews: peer.rating === null ? 'trial' : peer.rating >= 4,
    active: peer.lastActiveDays <= 7,
    learning: peer.streak >= 5,
    best: peer.topPercent <= 15,
  };
};

// A tutor is listed when willing + academic + active, and reviews are good (or on trial).
export const isSelected = (checks) => checks.willing && checks.academic && checks.active && checks.reviews !== false;

export const MY_SKILLS = {
  // What the signed-in student is strong in (from past grades and test scores).
  strong: [['CSE201', 'A+'], ['CSE204', 'A+'], ['CSE303', '80%']],
  stats: { rating: null, lastActiveDays: 0, streak: 7, topPercent: 12 },
};

export const PAST_SESSIONS = [
  { id: 's1', tutorId: 'p6', code: 'CSE302', topic: 'BCNF decomposition', when: at(-5, 19), mode: 'Online', reviewed: true, stars: 5 },
  { id: 's2', tutorId: 'p3', code: 'CSE304', topic: 'Subnetting shortcuts', when: at(-2, 18), mode: 'Library, group room 2', reviewed: false },
];

/* ================================================================== */
/* 2. Previous year question papers                                    */
/* ================================================================== */

// Deterministic pseudo-random numbers so papers are the same on every load.
const seeded = (seed) => () => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};

const SHORT = ['Define {t}.', 'What is meant by {t}?', 'List any two properties of {t}.', 'Give an example of {t}.', 'State the purpose of {t}.', 'Differentiate between {t} and {u}.'];
const LONG = ['Explain {t} with a neat diagram.', 'With a suitable example, illustrate {t}.', 'Discuss {t} in detail. Mention its advantages and limitations.', 'Describe {t}. Solve a numerical problem to support your answer.', 'Compare {t} and {u} with examples.'];

const PYQ_SUBJECTS = ['CSE301', 'CSE302', 'CSE303', 'CSE304', 'CSE305'];
const YEARS = [2022, 2023, 2024, 2025];
const EXAMS = [
  { id: 'mid1', label: 'Mid-term 1', units: [1, 2], short: 5, long: 2, shortMarks: 2, longMarks: 10, minutes: 90 },
  { id: 'mid2', label: 'Mid-term 2', units: [3, 4], short: 5, long: 2, shortMarks: 2, longMarks: 10, minutes: 90 },
  { id: 'end', label: 'End semester', units: [1, 2, 3, 4, 5], short: 10, long: 5, shortMarks: 2, longMarks: 16, minutes: 180 },
];

function buildPaper(code, year, exam, idx) {
  const info = courseInfo(code);
  const rand = seeded(year * 31 + idx * 7 + code.length * 13 + code.charCodeAt(5));
  const pool = info.syllabus
    .filter((u) => exam.units.includes(u.unit))
    .flatMap((u) => (u.topics.length ? u.topics : [u.title]).map((t) => ({ unit: u.unit, topic: t })));
  const pick = () => pool[Math.floor(rand() * pool.length)];
  const fill = (tpl) => {
    const a = pick();
    const b = pick();
    return { text: tpl.replace('{t}', a.topic.toLowerCase()).replace('{u}', b.topic.toLowerCase()), unit: a.unit, topic: a.topic };
  };
  const partA = Array.from({ length: exam.short }, () => ({ ...fill(SHORT[Math.floor(rand() * SHORT.length)]), marks: exam.shortMarks }));
  const partB = Array.from({ length: exam.long }, () => ({ ...fill(LONG[Math.floor(rand() * LONG.length)]), marks: exam.longMarks }));
  partA.concat(partB).forEach((q) => { q.co = `CO${Math.min(5, q.unit)}`; });
  return {
    id: `${code}-${year}-${exam.id}`,
    code,
    year,
    exam: exam.label,
    examId: exam.id,
    minutes: exam.minutes,
    total: exam.short * exam.shortMarks + exam.long * exam.longMarks,
    partA,
    partB,
    downloads: 40 + Math.floor(rand() * 400),
  };
}

export const PAPERS = PYQ_SUBJECTS.flatMap((code) => YEARS.flatMap((year) => EXAMS.map((exam, i) => buildPaper(code, year, exam, i))));
export const PYQ_YEARS = YEARS;
export const PYQ_EXAMS = EXAMS.map((e) => ({ id: e.id, label: e.label }));
export const PYQ_SUBJECT_CODES = PYQ_SUBJECTS;

// How often each topic was asked across a subject's papers.
export function topicFrequency(code) {
  const papers = PAPERS.filter((p) => p.code === code);
  const counts = {};
  papers.forEach((p) => {
    const seen = new Set();
    [...p.partA, ...p.partB].forEach((q) => {
      counts[q.topic] = counts[q.topic] || { topic: q.topic, unit: q.unit, papers: 0, marks: 0 };
      counts[q.topic].marks += q.marks;
      if (!seen.has(q.topic)) {
        counts[q.topic].papers += 1;
        seen.add(q.topic);
      }
    });
  });
  return { total: papers.length, topics: Object.values(counts).sort((a, b) => b.papers - a.papers || b.marks - a.marks) };
}

/* ================================================================== */
/* 3. Alumni                                                           */
/* ================================================================== */

const alum = (id, name, batch, program, company, role, location, years, domains, story, advice, openToAdvice = true, github = null, linkedin = null) => ({
  id, name, batch, program, company, role, location, years, domains, story, advice, openToAdvice,
  linkedin: linkedin || "https://www.linkedin.com/search/results/people/?keywords=" + encodeURIComponent(name + " Alliance University"),
  github: github || "https://github.com/" + name.toLowerCase().replace(/[^a-z]/g, ""),
});

// linkedin: put the real profile URL here. When it is null, the app opens a
// LinkedIn people search for the alumnus instead.
export const ALUMNI = [
  alum('a1', 'Priya Raghavan', 2019, 'B.Tech CSE', 'Microsoft', 'Software Engineer II', 'Hyderabad', 6, ['Cloud', 'Backend'], 'Joined through campus placements after an internship in my third year. Moved from support tooling to Azure storage services.', 'Do one solid project end to end. Interviewers asked me more about my project than about DSA puzzles.'),
  alum('a2', 'Nikhil Sharma', 2020, 'B.Tech CSE', 'Amazon', 'SDE II', 'Bengaluru', 5, ['Backend', 'Distributed systems'], 'Started at a startup, switched to Amazon after two years. Work on order-routing services.', 'Practise explaining your thinking out loud. Writing code silently fails interviews.'),
  alum('a3', 'Ananya Iyer', 2021, 'B.Tech CSE', 'Flipkart', 'Data Scientist', 'Bengaluru', 4, ['Data science', 'ML'], 'Got into data science through a research project with a faculty member in my final year.', 'Statistics matters more than fancy models. Take probability seriously.'),
  alum('a4', 'Rohit Verma', 2018, 'B.Tech CSE', 'Goldman Sachs', 'Vice President, Engineering', 'Bengaluru', 8, ['Fintech', 'Backend'], 'Started as an analyst developer and grew into leading a platform team.', 'Learn to write clearly. Every promotion I got came after a good design document.'),
  alum('a5', 'Fatima Sheikh', 2022, 'B.Tech CSE', 'Razorpay', 'Frontend Engineer', 'Bengaluru', 3, ['Frontend', 'Product'], 'Built small web apps in college and contributed to open source, which got me noticed.', 'Ship things people use. Even a college club website counts.'),
  alum('a6', 'Sanjay Kumar', 2017, 'B.Tech CSE', 'Infosys', 'Technology Lead', 'Mysuru', 9, ['Enterprise', 'Java'], 'Joined Infosys from campus and moved through several client projects in banking.', 'Service companies give huge exposure early. Use it to learn domains, not just tools.'),
  alum('a7', 'Meghana Rao', 2023, 'B.Tech CSE', 'Zoho', 'Member Technical Staff', 'Chennai', 2, ['Backend', 'Product'], 'Cleared Zoho’s off-campus process in my final semester.', 'Zoho tests basics hard: C, data structures, and how you think. Don’t skip fundamentals.'),
  alum('a8', 'Aditya Bhat', 2020, 'B.Tech CSE', 'Cisco', 'Network Engineer', 'Bengaluru', 5, ['Networking', 'Security'], 'Computer Networks was my favourite subject; I did CCNA during college.', 'Certifications help in networking roles. Do labs, not just theory.'),
  alum('a9', 'Kavya Menon', 2021, 'B.Tech CSE', 'Deloitte', 'Cyber Security Consultant', 'Pune', 4, ['Security'], 'Took part in capture-the-flag contests from second year onwards.', 'Security is learned by doing. Start with CTFs and write about what you learn.'),
  alum('a10', 'Harsh Agarwal', 2019, 'B.Tech CSE', 'Swiggy', 'Engineering Manager', 'Bengaluru', 6, ['Backend', 'Leadership'], 'Joined a startup that Swiggy acquired; now manage a team of eight.', 'Be the person who finishes things. Reliability is noticed more than brilliance.'),
  alum('a11', 'Sowmya Reddy', 2022, 'B.Tech CSE', 'SAP Labs', 'Associate Developer', 'Bengaluru', 3, ['Enterprise', 'Cloud'], 'Placed through campus; work on SAP’s cloud integration suite.', 'Keep your CGPA steady. Many companies use a cut-off before you even get to interview.'),
  alum('a12', 'Imran Pasha', 2018, 'B.Tech CSE', 'Walmart Global Tech', 'Staff Engineer', 'Bengaluru', 8, ['Distributed systems', 'Backend'], 'Worked at two product companies before Walmart; focus on large-scale inventory systems.', 'Read system design case studies early. They change how you see every project.'),
  alum('a13', 'Neha Gupta', 2023, 'B.Tech CSE', 'TCS', 'Systems Engineer', 'Bengaluru', 2, ['Enterprise', 'Testing'], 'Joined TCS Digital through the national qualifier test.', 'Prepare aptitude alongside coding. Many first rounds are aptitude-heavy.'),
  alum('a14', 'Varun Desai', 2021, 'B.Tech CSE', 'Google', 'Software Engineer', 'Bengaluru', 4, ['ML', 'Backend'], 'Went to IISc for a master’s, then joined Google.', 'Higher studies are a great route. Talk to faculty early about research projects.'),
  alum('a15', 'Pooja Hegde', 2020, 'B.Tech CSE', 'Bosch', 'Embedded Software Engineer', 'Coimbatore', 5, ['Embedded', 'IoT'], 'Final-year IoT project led straight to my Bosch interview.', 'Electronics plus software is a rare mix. If you enjoy hardware, lean into it.'),
  alum('a16', 'Siddharth Jain', 2019, 'B.Tech CSE', 'PhonePe', 'Senior Product Manager', 'Bengaluru', 6, ['Product', 'Fintech'], 'Started as a developer, moved to product management after three years.', 'Product roles need empathy for users. Talk to real users of whatever you build.', false),
];

/* ================================================================== */
/* 5. 3D learning: built-in models                                     */
/* ================================================================== */

const o = (id, label, shape, position, color, size = 0.8, info = '') => ({ id, label, shape, position, color, size, info });

export const MODELS = [
  {
    id: 'bst',
    subject: 'Data Structures',
    title: 'Binary search tree',
    summary: 'Every node’s left subtree holds smaller keys and its right subtree holds larger keys.',
    keywords: ['tree', 'bst', 'binary', 'search tree'],
    objects: [
      o('n50', '50', 'sphere', [0, 4, 0], '#6D3FC0', 0.9, 'Root node'),
      o('n30', '30', 'sphere', [-3, 2, 0], '#8B5CF6', 0.8, 'Left child of 50: smaller than 50'),
      o('n70', '70', 'sphere', [3, 2, 0], '#8B5CF6', 0.8, 'Right child of 50: larger than 50'),
      o('n20', '20', 'sphere', [-4.5, 0, 0], '#A78BFA', 0.7, 'Leaf'),
      o('n40', '40', 'sphere', [-1.5, 0, 0], '#A78BFA', 0.7, 'Leaf'),
      o('n60', '60', 'sphere', [1.5, 0, 0], '#A78BFA', 0.7, 'Leaf'),
      o('n80', '80', 'sphere', [4.5, 0, 0], '#A78BFA', 0.7, 'Leaf'),
      o('n65', '65', 'sphere', [2.4, -2, 0], '#0F9D76', 0.7, 'Newly inserted key'),
    ],
    links: [['n50', 'n30'], ['n50', 'n70'], ['n30', 'n20'], ['n30', 'n40'], ['n70', 'n60'], ['n70', 'n80'], ['n60', 'n65']].map(([from, to]) => ({ from, to })),
    steps: [
      { title: 'The root', text: '50 is the root. Every search and insertion starts here.', focus: ['n50'] },
      { title: 'Smaller to the left', text: 'All keys in the left subtree (30, 20, 40) are smaller than 50.', focus: ['n30', 'n20', 'n40'] },
      { title: 'Larger to the right', text: 'All keys in the right subtree (70, 60, 80) are larger than 50.', focus: ['n70', 'n60', 'n80'] },
      { title: 'Inserting 65', text: '65 > 50 so go right; 65 < 70 so go left; 65 > 60 so it becomes 60’s right child. Each step halves the search space in a balanced tree: O(log n).', focus: ['n50', 'n70', 'n60', 'n65'] },
    ],
  },
  {
    id: 'osi',
    subject: 'Computer Networks',
    title: 'OSI reference model',
    summary: 'Seven layers, each providing services to the layer above and using the layer below.',
    keywords: ['osi', 'layer', 'network model', 'tcp/ip', 'protocol stack'],
    objects: [
      o('l7', 'Application', 'box', [0, 6, 0], '#DB2777', 1.4, 'HTTP, DNS, SMTP: services used by applications'),
      o('l6', 'Presentation', 'box', [0, 4, 0], '#C026D3', 1.4, 'Encoding, encryption, compression'),
      o('l5', 'Session', 'box', [0, 2, 0], '#7C3AED', 1.4, 'Opening, managing and closing sessions'),
      o('l4', 'Transport', 'box', [0, 0, 0], '#4F46E5', 1.4, 'TCP and UDP: process-to-process delivery, ports'),
      o('l3', 'Network', 'box', [0, -2, 0], '#2563EB', 1.4, 'IP addressing and routing between networks'),
      o('l2', 'Data link', 'box', [0, -4, 0], '#0891B2', 1.4, 'Framing, MAC addresses, error detection'),
      o('l1', 'Physical', 'box', [0, -6, 0], '#0F9D76', 1.4, 'Bits on the wire: cables, signals, radio'),
    ],
    links: [['l7', 'l6'], ['l6', 'l5'], ['l5', 'l4'], ['l4', 'l3'], ['l3', 'l2'], ['l2', 'l1']].map(([from, to]) => ({ from, to })),
    steps: [
      { title: 'Upper layers', text: 'Application, presentation and session deal with what the data means to the program.', focus: ['l7', 'l6', 'l5'] },
      { title: 'Transport', text: 'The transport layer delivers data between processes, using ports. TCP adds reliability; UDP is lightweight.', focus: ['l4'] },
      { title: 'Network', text: 'The network layer moves packets across networks using IP addresses and routing.', focus: ['l3'] },
      { title: 'Lower layers', text: 'Data link frames the data for one hop; the physical layer turns it into signals.', focus: ['l2', 'l1'] },
    ],
  },
  {
    id: 'tcp',
    subject: 'Computer Networks',
    title: 'TCP three-way handshake',
    summary: 'How a client and server agree to open a reliable TCP connection.',
    keywords: ['tcp', 'handshake', 'syn', 'connection'],
    objects: [
      o('client', 'Client', 'box', [-5, 0, 0], '#2563EB', 1.6, 'The side that opens the connection'),
      o('server', 'Server', 'box', [5, 0, 0], '#D85A30', 1.6, 'Listening on a port, waiting for connections'),
      o('syn', 'SYN', 'sphere', [-1.5, 2.5, 0], '#7C3AED', 0.6, 'Client → server: “I want to connect, my sequence number is x”'),
      o('synack', 'SYN-ACK', 'sphere', [1.5, 0, 0], '#C026D3', 0.6, 'Server → client: “OK, my sequence number is y, I got x+1”'),
      o('ack', 'ACK', 'sphere', [-1.5, -2.5, 0], '#0F9D76', 0.6, 'Client → server: “Got y+1”. Connection established'),
    ],
    links: [{ from: 'client', to: 'syn' }, { from: 'syn', to: 'server' }, { from: 'server', to: 'synack' }, { from: 'synack', to: 'client' }, { from: 'client', to: 'ack' }, { from: 'ack', to: 'server' }],
    steps: [
      { title: '1. SYN', text: 'The client sends a SYN segment with its initial sequence number.', focus: ['client', 'syn'] },
      { title: '2. SYN-ACK', text: 'The server replies with its own SYN and acknowledges the client’s sequence number + 1.', focus: ['server', 'synack'] },
      { title: '3. ACK', text: 'The client acknowledges the server’s sequence number + 1. Both sides can now send data.', focus: ['client', 'ack', 'server'] },
    ],
  },
  {
    id: 'pipeline',
    subject: 'Computer Organisation',
    title: '5-stage CPU pipeline',
    summary: 'Instructions overlap in five stages so a new one can finish almost every clock cycle.',
    keywords: ['cpu', 'pipeline', 'processor', 'instruction', 'risc'],
    objects: [
      o('if', 'Fetch', 'box', [-6, 0, 0], '#2563EB', 1.3, 'Read the next instruction from memory using the PC'),
      o('id', 'Decode', 'box', [-3, 0, 0], '#4F46E5', 1.3, 'Work out the operation and read registers'),
      o('ex', 'Execute', 'box', [0, 0, 0], '#7C3AED', 1.3, 'ALU does the arithmetic or computes an address'),
      o('mem', 'Memory', 'box', [3, 0, 0], '#C026D3', 1.3, 'Load or store data in memory'),
      o('wb', 'Write back', 'box', [6, 0, 0], '#DB2777', 1.3, 'Write the result into the destination register'),
      o('pc', 'PC', 'cylinder', [-6, 3, 0], '#0F9D76', 0.7, 'Program counter: address of the next instruction'),
      o('regs', 'Registers', 'cylinder', [-3, -3, 0], '#CA8A04', 0.8, 'Register file, read in decode and written in write back'),
    ],
    links: [['pc', 'if'], ['if', 'id'], ['id', 'ex'], ['ex', 'mem'], ['mem', 'wb'], ['regs', 'id'], ['wb', 'regs']].map(([from, to]) => ({ from, to })),
    steps: [
      { title: 'Fetch and decode', text: 'The PC points to the instruction; it is fetched, then decoded while registers are read.', focus: ['pc', 'if', 'id', 'regs'] },
      { title: 'Execute', text: 'The ALU performs the operation or calculates a memory address.', focus: ['ex'] },
      { title: 'Memory and write back', text: 'Loads and stores access memory; the result is written to a register.', focus: ['mem', 'wb', 'regs'] },
      { title: 'Overlap', text: 'While one instruction executes, the next is decoding and the one after is being fetched. Ideal throughput: one instruction per cycle.', focus: ['if', 'id', 'ex', 'mem', 'wb'] },
    ],
  },
  {
    id: 'dfa',
    subject: 'Theory of Computation',
    title: 'DFA: even number of 0s',
    summary: 'A two-state machine that accepts binary strings with an even number of 0s.',
    keywords: ['dfa', 'automata', 'finite automaton', 'state machine', 'regular'],
    objects: [
      o('start', 'start', 'cone', [-6, 0, 0], '#71717A', 0.5, 'Start arrow'),
      o('q0', 'q0 (even)', 'torus', [-2.5, 0, 0], '#0F9D76', 1.2, 'Start state and accepting state: even number of 0s so far'),
      o('q1', 'q1 (odd)', 'sphere', [2.5, 0, 0], '#D85A30', 1.1, 'Odd number of 0s so far: not accepting'),
      o('l0a', '0', 'sphere', [0, 1.8, 0], '#6D3FC0', 0.35, 'On 0: q0 → q1'),
      o('l0b', '0', 'sphere', [0, -1.8, 0], '#6D3FC0', 0.35, 'On 0: q1 → q0'),
      o('l1a', '1', 'sphere', [-2.5, 2.6, 0], '#2563EB', 0.35, 'On 1: q0 stays in q0'),
      o('l1b', '1', 'sphere', [2.5, 2.6, 0], '#2563EB', 0.35, 'On 1: q1 stays in q1'),
    ],
    links: [{ from: 'start', to: 'q0' }, { from: 'q0', to: 'l0a' }, { from: 'l0a', to: 'q1' }, { from: 'q1', to: 'l0b' }, { from: 'l0b', to: 'q0' }, { from: 'q0', to: 'l1a' }, { from: 'q1', to: 'l1b' }],
    steps: [
      { title: 'Two states', text: 'q0 means “even 0s so far” and is accepting (the ring). q1 means “odd 0s so far”.', focus: ['q0', 'q1'] },
      { title: 'Reading a 0', text: 'Each 0 flips the parity, so the machine moves between q0 and q1.', focus: ['l0a', 'l0b', 'q0', 'q1'] },
      { title: 'Reading a 1', text: 'A 1 does not change the count of 0s, so the machine stays in the same state.', focus: ['l1a', 'l1b'] },
      { title: 'Try “1001”', text: 'q0 →1→ q0 →0→ q1 →0→ q0 →1→ q0. It ends in q0, so the string is accepted.', focus: ['q0'] },
    ],
  },
  {
    id: 'nn',
    subject: 'Machine Learning',
    title: 'Neural network',
    summary: 'A small feed-forward network with an input layer, one hidden layer and an output layer.',
    keywords: ['neural', 'network', 'deep learning', 'perceptron', 'ml', 'ai'],
    objects: [
      ...[1.5, 0, -1.5].map((y, i) => o(`i${i}`, `x${i + 1}`, 'sphere', [-5, y * 1.6, 0], '#2563EB', 0.6, 'Input feature')),
      ...[3, 1, -1, -3].map((y, i) => o(`h${i}`, `h${i + 1}`, 'sphere', [0, y, 0], '#7C3AED', 0.6, 'Hidden neuron: weighted sum + activation')),
      ...[1, -1].map((y, i) => o(`y${i}`, `y${i + 1}`, 'sphere', [5, y * 1.5, 0], '#DB2777', 0.6, 'Output')),
    ],
    links: [
      ...[0, 1, 2].flatMap((i) => [0, 1, 2, 3].map((h) => ({ from: `i${i}`, to: `h${h}` }))),
      ...[0, 1, 2, 3].flatMap((h) => [0, 1].map((y) => ({ from: `h${h}`, to: `y${y}` }))),
    ],
    steps: [
      { title: 'Inputs', text: 'Each input neuron holds one feature of the example, such as a pixel value.', focus: ['i0', 'i1', 'i2'] },
      { title: 'Hidden layer', text: 'Each hidden neuron computes a weighted sum of all inputs, adds a bias and applies an activation such as ReLU.', focus: ['h0', 'h1', 'h2', 'h3'] },
      { title: 'Outputs', text: 'Output neurons combine the hidden layer into predictions, for example class probabilities.', focus: ['y0', 'y1'] },
      { title: 'Learning', text: 'Training adjusts every weight (each line) using backpropagation to reduce the error.', focus: ['h0', 'h1', 'h2', 'h3', 'y0', 'y1'] },
    ],
  },
];

export const findModel = (topic) => {
  const t = topic.toLowerCase();
  return MODELS.find((m) => m.keywords.some((k) => t.includes(k)) || t.includes(m.title.toLowerCase())) || null;
};
