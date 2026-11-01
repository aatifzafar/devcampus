// Sample data for the student pages. Times are built relative to "now"
// so the demo always looks current. Replace with API calls later.
import { SUBMISSIONS, TESTS } from './homeData';

const at = (dayOffset, hour, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
};

/* ------------------------------------------------------------------ */
/* Assignments                                                         */
/* ------------------------------------------------------------------ */

const DETAILS = {
  s1: 'Draw a complete ER diagram for a college library: books, copies, members, loans and fines. Show keys, cardinality and participation. Submit as a PDF.',
  s2: 'Write and run programs 6.1 to 6.4 from the lab manual (custom exceptions, try-with-resources, multi-catch). Upload the record with output screenshots.',
  s3: 'Solve questions 1 to 6 from the problem set. Show the partition table for every step of minimisation.',
  s4: 'Complete the subnetting worksheet: 8 questions on /24 to /28 networks. Show working for each.',
  s5: 'Compare FCFS, SJF and Round Robin on the given process set. Draw Gantt charts and compute average waiting time.',
  s6: 'One-page proposal: problem, users, features, tech stack and team roles.',
  s7: 'Normalise the three given relations to BCNF. List all functional dependencies first.',
};

export const ASSIGNMENTS = [
  ...SUBMISSIONS.map((s) => ({ ...s, code: s.subject.code, details: DETAILS[s.id], status: 'pending' })),
  { id: 'g1', title: 'Pumping lemma proofs', type: 'Assignment', code: 'CSE303', due: at(-9, 23, 59), teacher: 'Dr. Devika P', marks: 10, status: 'graded', score: 9, submittedAt: at(-10, 20, 12), feedback: 'Clear proofs. In Q3, state the choice of string before splitting it.', details: 'Prove that the four given languages are not regular.' },
  { id: 'g2', title: 'SQL queries on the company schema', type: 'Assignment', code: 'CSE302', due: at(-12, 23, 59), teacher: 'Prof. Rao', marks: 10, status: 'graded', score: 8, submittedAt: at(-12, 18, 40), feedback: 'Good use of joins. Q7 needed GROUP BY with HAVING, not WHERE.', details: 'Write 10 SQL queries on the given company schema.' },
  { id: 'g3', title: 'Lab 5: Collections programs', type: 'Lab record', code: 'CSE301L', due: at(-7, 17, 0), teacher: 'Dr. Kumar', marks: 15, status: 'graded', score: 14, submittedAt: at(-7, 15, 5), feedback: 'Well documented.', details: 'Programs 5.1 to 5.5 using ArrayList, HashMap and TreeSet.' },
  { id: 'd1', title: 'Process synchronisation worksheet', type: 'Worksheet', code: 'CSE305', due: at(-3, 23, 59), teacher: 'Dr. Iyer', marks: 5, status: 'submitted', submittedAt: at(-4, 21, 30), fileName: 'os_sync_worksheet.pdf', details: 'Solve the producer–consumer and readers–writers questions.' },
  { id: 'd2', title: 'Error detection: CRC problems', type: 'Assignment', code: 'CSE304', due: at(-2, 23, 59), teacher: 'Prof. Shenoy', marks: 10, status: 'submitted', submittedAt: at(-2, 19, 2), fileName: 'crc_problems.pdf', details: 'Compute CRC for the five given messages.' },
];

/* ------------------------------------------------------------------ */
/* Question bank (MCQ) per subject                                     */
/* ------------------------------------------------------------------ */

const q = (text, options, answer, explain, topic) => ({ text, options, answer, explain, topic });

export const QUESTION_BANK = {
  CSE304: [
    q('Which layer is responsible for end-to-end delivery between processes?', ['Network', 'Transport', 'Data link', 'Session'], 1, 'The transport layer (TCP/UDP) delivers data between processes using port numbers.', 'Models'),
    q('How many usable hosts are there in a /26 subnet?', ['64', '62', '30', '126'], 1, '6 host bits give 64 addresses; minus network and broadcast leaves 62.', 'Subnetting'),
    q('TCP uses which mechanism to set up a connection?', ['Two-way handshake', 'Three-way handshake', 'Token passing', 'Polling'], 1, 'SYN, SYN-ACK, ACK: the three-way handshake.', 'TCP'),
    q('Which protocol maps an IP address to a MAC address?', ['DNS', 'DHCP', 'ARP', 'ICMP'], 2, 'ARP resolves an IPv4 address to a link-layer (MAC) address.', 'Network layer'),
    q('UDP is preferred over TCP for live video mainly because it…', ['Guarantees delivery', 'Has lower overhead and no retransmission delay', 'Encrypts data', 'Orders packets'], 1, 'A late retransmitted frame is useless for live video, so UDP’s low overhead wins.', 'UDP'),
    q('The default port for HTTPS is…', ['80', '21', '443', '25'], 2, 'HTTPS uses port 443; HTTP uses 80.', 'Application layer'),
    q('In sliding window flow control, the window size limits…', ['Packet size', 'Unacknowledged frames in flight', 'Number of routers', 'Bandwidth'], 1, 'The sender may have at most “window size” frames sent but not yet acknowledged.', 'Data link'),
    q('Which address is a private IPv4 address?', ['8.8.8.8', '172.16.5.4', '100.1.1.1', '193.0.2.1'], 1, '172.16.0.0/12 is one of the private ranges (RFC 1918).', 'Subnetting'),
    q('TCP congestion window grows exponentially during…', ['Congestion avoidance', 'Slow start', 'Fast recovery', 'Timeout'], 1, 'In slow start, cwnd doubles every RTT until it reaches the threshold.', 'TCP'),
    q('DNS mainly runs over which transport protocol for queries?', ['TCP', 'UDP', 'ICMP', 'SCTP'], 1, 'Ordinary DNS queries use UDP port 53; TCP is used for large responses and zone transfers.', 'Application layer'),
  ],
  CSE303: [
    q('Which of these languages is NOT regular?', ['Strings ending in "ab"', 'aⁿbⁿ for n ≥ 0', 'Even number of a’s', 'a*b*'], 1, 'aⁿbⁿ needs unbounded counting, which a finite automaton cannot do.', 'Regular languages'),
    q('Every NFA can be converted to an equivalent…', ['PDA only', 'DFA', 'Turing machine only', 'Regular grammar only'], 1, 'Subset construction converts any NFA to a DFA.', 'Finite automata'),
    q('A PDA accepts exactly the…', ['Regular languages', 'Context-free languages', 'Recursive languages', 'Context-sensitive languages'], 1, 'PDAs and CFGs describe the same class: context-free languages.', 'PDA'),
    q('The halting problem is…', ['Decidable', 'Undecidable', 'Regular', 'Context-free'], 1, 'Turing proved no TM can decide halting for all program–input pairs.', 'Decidability'),
    q('In Chomsky normal form, every rule is of the form…', ['A → aB', 'A → BC or A → a', 'A → a only', 'A → BCD'], 1, 'CNF allows only A → BC and A → a (plus S → ε if needed).', 'CFG'),
  ],
  CSE302: [
    q('A relation is in BCNF if for every non-trivial FD X → Y…', ['Y is prime', 'X is a superkey', 'There are no partial dependencies', 'X is non-prime'], 1, 'BCNF requires every determinant to be a superkey.', 'Normalisation'),
    q('Which SQL clause filters groups after aggregation?', ['WHERE', 'HAVING', 'ORDER BY', 'GROUP BY'], 1, 'HAVING filters groups; WHERE filters rows before grouping.', 'SQL'),
    q('The “I” in ACID stands for…', ['Integrity', 'Isolation', 'Indexing', 'Inheritance'], 1, 'Isolation: concurrent transactions must not see each other’s partial work.', 'Transactions'),
    q('A weak entity is identified using…', ['Its own key only', 'A partial key and its owner’s key', 'A foreign key only', 'A surrogate key'], 1, 'A weak entity needs its owner entity’s key plus its own partial key.', 'ER model'),
    q('Two-phase locking guarantees…', ['Deadlock freedom', 'Conflict serialisability', 'Recoverability only', 'No starvation'], 1, '2PL ensures conflict-serialisable schedules but can still deadlock.', 'Concurrency'),
  ],
  CSE301: [
    q('Which keyword stops a method from being overridden?', ['static', 'private', 'final', 'abstract'], 2, 'A final method cannot be overridden in a subclass.', 'Inheritance'),
    q('Which collection does not allow duplicate elements?', ['ArrayList', 'LinkedList', 'HashSet', 'Vector'], 2, 'Set implementations such as HashSet reject duplicates.', 'Collections'),
    q('Checked exceptions must be…', ['Ignored', 'Caught or declared with throws', 'Subclasses of RuntimeException', 'Thrown only by the JVM'], 1, 'The compiler forces you to catch or declare checked exceptions.', 'Exceptions'),
    q('Which method starts a new thread?', ['run()', 'start()', 'execute()', 'init()'], 1, 'start() creates a new thread which then calls run().', 'Threads'),
    q('String objects in Java are…', ['Mutable', 'Immutable', 'Primitive', 'Synchronized'], 1, 'Strings are immutable; use StringBuilder for repeated changes.', 'Strings'),
  ],
  CSE305: [
    q('Which scheduling algorithm can starve long processes?', ['FCFS', 'Round robin', 'Shortest job first', 'None'], 2, 'SJF keeps picking short jobs; ageing fixes it.', 'Scheduling'),
    q('The banker’s algorithm is used for deadlock…', ['Prevention', 'Avoidance', 'Detection', 'Recovery'], 1, 'It checks each request keeps the system in a safe state: avoidance.', 'Deadlocks'),
    q('A semaphore initialised to 1 behaves like a…', ['Counter', 'Mutex lock', 'Monitor', 'Pipe'], 1, 'A binary semaphore gives mutual exclusion, like a mutex.', 'Synchronisation'),
    q('Belady’s anomaly can occur with which page replacement?', ['LRU', 'Optimal', 'FIFO', 'LFU'], 2, 'FIFO can produce more faults with more frames: Belady’s anomaly.', 'Memory'),
    q('A context switch saves the state of a process in its…', ['Page table', 'PCB', 'Stack segment', 'Inode'], 1, 'The process control block holds registers, state and scheduling info.', 'Processes'),
  ],
};

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */

const minutesFromNow = (m) => new Date(Date.now() + m * 60000);

// Live test is defined in homeData TESTS (id t0); here we add rules and
// the questions each test draws from.
const TEST_EXTRA = {
  t0: { syllabus: 'Units 3 and 4: IP addressing, subnetting, TCP and UDP', marks: 10, bank: 'CSE304', negative: false },
  t1: { syllabus: 'Unit 3: Context-free grammars and PDA', marks: 15, bank: 'CSE303' },
  t2: { syllabus: 'Units 3 and 4: SQL and normalisation', marks: 40, bank: 'CSE302' },
  t3: { syllabus: 'Experiments 1 to 9', marks: 30, bank: 'CSE301' },
};

export const ALL_TESTS = TESTS.map((t) => ({ ...t, code: t.subject.code, ...(TEST_EXTRA[t.id] || {}) }));

// Tests already taken this semester, with the student's answers.
export const PAST_ATTEMPTS = [
  { id: 'p1', title: 'Unit 2 quiz', code: 'CSE303', date: at(-6, 10), minutes: 30, bank: 'CSE303', answers: [1, 1, 1, 1, 0], classAvg: 62, published: true },
  { id: 'p2', title: 'Mid-term 1', code: 'CSE302', date: at(-14, 10), minutes: 90, bank: 'CSE302', answers: [1, 1, 1, 0, 1], classAvg: 71, published: true },
  { id: 'p3', title: 'Weekly quiz 5', code: 'CSE304', date: at(-7, 15), minutes: 30, bank: 'CSE304', answers: [1, 1, 1, 2, 1, 2, 1, 0, 1, 1], classAvg: 68, published: true },
  { id: 'p4', title: 'Unit 3 quiz', code: 'CSE305', date: at(-4, 11), minutes: 30, bank: 'CSE305', answers: [2, 1, 1, 0, 1], classAvg: 66, published: true },
  { id: 'p5', title: 'Mid-term 1', code: 'CSE301', date: at(-2, 14), minutes: 90, bank: 'CSE301', answers: [2, 2, 1, 1, 1], classAvg: 0, published: false },
];

export const scoreOf = (attempt) => {
  const bank = attempt.questions || QUESTION_BANK[attempt.bank] || [];
  const correct = attempt.answers.filter((a, i) => bank[i] && a === bank[i].answer).length;
  return { correct, total: attempt.answers.length, percent: Math.round((correct / attempt.answers.length) * 100) };
};

/* ------------------------------------------------------------------ */
/* Classes: timetable and attendance                                   */
/* ------------------------------------------------------------------ */

export const PERIODS = [];
export const TIMETABLE = [];
export const DAYS = [];
export const ATTENDANCE = {};
export const MIN_ATTENDANCE = 0;

/* ------------------------------------------------------------------ */
/* Community                                                           */
/* ------------------------------------------------------------------ */

export const THREADS = [
  {
    id: 'th1', code: 'CSE303', title: 'Why is aⁿbⁿ not regular but a*b* is?', author: 'Rahul M', at: at(-1, 21, 10), votes: 14, mine: false,
    body: 'Both have a’s followed by b’s. I don’t get why one needs a PDA and the other doesn’t.',
    replies: [
      { author: 'Dr. Devika P', role: 'faculty', at: at(-1, 22, 5), votes: 21, accepted: true, body: 'a*b* lets the counts differ, so the machine only needs to remember “am I still reading a’s?”. aⁿbⁿ forces equal counts, so it must remember how many a’s it saw: unbounded memory, which a DFA does not have. Try the pumping lemma with the string aᵖbᵖ.' },
      { author: 'Sneha K', role: 'student', at: at(0, 8, 30), votes: 3, body: 'The pumping lemma part in Sipser chapter 1.4 explains this exact example.' },
    ],
  },
  {
    id: 'th2', code: 'CSE302', title: 'Is every BCNF relation also in 3NF?', author: 'You', at: at(-2, 19, 45), votes: 6, mine: true,
    body: 'Asking for the mid-term. My notes say yes but I want to be sure.',
    replies: [{ author: 'Prof. Arvind Rao', role: 'faculty', at: at(-2, 20, 30), votes: 9, accepted: true, body: 'Yes. BCNF is stricter than 3NF, so any relation in BCNF is automatically in 3NF. The reverse is not always true.' }],
  },
  {
    id: 'th3', code: 'CSE304', title: 'How do I quickly find the broadcast address of a subnet?', author: 'Arjun P', at: at(0, 9, 15), votes: 4, mine: false,
    body: 'In the worksheet there are many /27 and /28 questions and I’m slow at it.',
    replies: [],
  },
  {
    id: 'th4', code: 'CSE301', title: 'Difference between wait() and sleep()?', author: 'Meera S', at: at(-3, 17, 0), votes: 9, mine: false,
    body: 'Both pause a thread. When should I use which?',
    replies: [
      { author: 'Karthik R', role: 'student', at: at(-3, 18, 20), votes: 5, body: 'sleep() pauses without releasing locks. wait() releases the monitor lock and waits for notify(). wait() must be called inside synchronized.' },
    ],
  },
  {
    id: 'th5', code: 'CSE305', title: 'Banker’s algorithm: safe sequence not unique?', author: 'Divya N', at: at(-4, 20, 0), votes: 7, mine: false,
    body: 'My answer has a different safe sequence than the solution. Is it still right?',
    replies: [{ author: 'Dr. Iyer', role: 'faculty', at: at(-4, 21, 15), votes: 8, accepted: true, body: 'Yes, there can be more than one safe sequence. Any valid one gets full marks if your Need and Available steps are shown.' }],
  },
];

export const PROJECT = {
  title: 'CampusEats: canteen pre-ordering app',
  code: 'CSE306',
  mentor: 'Dr. Sandeep Kumar',
  team: [
    { name: 'Anna Sharma', role: 'Team lead, backend', you: true },
    { name: 'Rahul M', role: 'Frontend' },
    { name: 'Sneha K', role: 'Database' },
    { name: 'Arjun P', role: 'Testing and docs' },
  ],
  milestones: [
    { title: 'Topic selection', due: at(-20, 23, 59), status: 'done', score: '5/5', feedback: 'Good, practical topic.' },
    { title: 'Proposal document', due: at(6, 23, 59), status: 'current' },
    { title: 'Design (ER + UI wireframes)', due: at(20, 23, 59), status: 'upcoming' },
    { title: 'Implementation demo', due: at(40, 23, 59), status: 'upcoming' },
    { title: 'Final report and viva', due: at(55, 23, 59), status: 'upcoming' },
  ],
  files: [
    { name: 'topic_approval.pdf', by: 'Anna Sharma', at: at(-21, 18) },
    { name: 'proposal_draft_v1.docx', by: 'Rahul M', at: at(-1, 22) },
  ],
};

/* ------------------------------------------------------------------ */
/* Practice: coding problems                                           */
/* ------------------------------------------------------------------ */

export const CODING_PROBLEMS = [
  { id: 'c1', title: 'Reverse words in a sentence', level: 'Easy', topic: 'Strings', code: 'CSE301', solved: true, statement: 'Given a sentence, print the words in reverse order. Words are separated by single spaces.', example: { input: 'java is fun', output: 'fun is java' } },
  { id: 'c2', title: 'Balanced brackets', level: 'Easy', topic: 'Stacks', code: 'CSE301', solved: true, statement: 'Given a string of brackets ()[]{}, print YES if they are balanced, otherwise NO.', example: { input: '{[()]}', output: 'YES' } },
  { id: 'c3', title: 'Second highest salary', level: 'Medium', topic: 'SQL', code: 'CSE302', solved: false, statement: 'Write a query on Employee(id, name, salary) that returns the second highest distinct salary.', example: { input: 'salaries: 300, 200, 300, 100', output: '200' } },
  { id: 'c4', title: 'Simulate a DFA', level: 'Medium', topic: 'Automata', code: 'CSE303', solved: false, statement: 'Read a DFA (states, alphabet, transitions, start, accepting) and a string. Print ACCEPT or REJECT.', example: { input: 'DFA for even number of 0s, string 1001', output: 'ACCEPT' } },
  { id: 'c5', title: 'Round robin scheduler', level: 'Medium', topic: 'Scheduling', code: 'CSE305', solved: false, statement: 'Given burst times and a time quantum, print the average waiting time under round robin, to two decimals.', example: { input: 'bursts 5 3 8, quantum 2', output: '6.33' } },
  { id: 'c6', title: 'Subnet calculator', level: 'Hard', topic: 'Networks', code: 'CSE304', solved: false, statement: 'Given an IPv4 address in CIDR form, print the network address, broadcast address and number of usable hosts.', example: { input: '192.168.10.77/27', output: '192.168.10.64 192.168.10.95 30' } },
];

export const STARTER_CODE = {
  Java: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // write your code here\n    }\n}\n',
  Python: '# write your code here\n',
  C: '#include <stdio.h>\n\nint main() {\n    // write your code here\n    return 0;\n}\n',
  SQL: '-- write your query here\nSELECT\n',
};

/* ------------------------------------------------------------------ */
/* Profile                                                             */
/* ------------------------------------------------------------------ */

export const ACHIEVEMENTS = [
  { id: 'a1', title: 'First steps', text: 'Complete your first quiz of the day', earned: true, at: at(-60, 9) },
  { id: 'a2', title: 'On time', text: 'Submit 10 assignments before the deadline', earned: true, at: at(-20, 9) },
  { id: 'a3', title: 'Week warrior', text: 'Keep a 7-day streak', earned: true, at: at(-1, 9) },
  { id: 'a4', title: 'Helping hand', text: 'Get 5 upvotes on your discussion answers', earned: true, at: at(-9, 9) },
  { id: 'a5', title: 'Month of focus', text: 'Keep a 30-day streak', earned: false, progress: 7, goal: 30 },
  { id: 'a6', title: 'Problem solver', text: 'Solve 25 coding problems', earned: false, progress: 2, goal: 25 },
  { id: 'a7', title: 'Quiz Master', text: 'Score 100% on two quizzes', earned: false, progress: 1, goal: 2 },
  { id: 'a8', title: 'Top marks', text: 'Score 90% or more in a mid-term', earned: false, progress: 0, goal: 1 },
];

export const CERTIFICATES = [
  { title: 'NPTEL: Programming in Java', by: 'IIT Kharagpur', year: 2026, score: 'Elite' },
  { title: 'Python for Data Science', by: 'Alliance University', year: 2025, score: 'Completed' },
];

export const PERSONALITY_ITEMS = [
  { trait: 'Openness', text: 'I enjoy trying new ways of solving problems.' },
  { trait: 'Openness', text: 'I like learning topics outside my syllabus.' },
  { trait: 'Conscientiousness', text: 'I plan my study time in advance.' },
  { trait: 'Conscientiousness', text: 'I finish assignments well before the deadline.' },
  { trait: 'Extraversion', text: 'I enjoy studying in groups.' },
  { trait: 'Extraversion', text: 'I am comfortable asking questions in class.' },
  { trait: 'Agreeableness', text: 'I help classmates when they are stuck.' },
  { trait: 'Agreeableness', text: 'I listen to other ideas before sharing mine.' },
  { trait: 'Emotional stability', text: 'I stay calm before exams.' },
  { trait: 'Emotional stability', text: 'A low mark does not upset me for long.' },
];

export const TRAIT_TEXT = {
  Openness: 'How curious you are and how much you enjoy new ideas.',
  Conscientiousness: 'How organised and steady you are with your work.',
  Extraversion: 'How much energy you get from working with other people.',
  Agreeableness: 'How cooperative and considerate you are with others.',
  'Emotional stability': 'How calm you stay under pressure.',
};

/* ------------------------------------------------------------------ */
/* Help                                                                */
/* ------------------------------------------------------------------ */

export const FAQ = [
  { topic: 'Tests', q: 'What happens if my internet drops during a test?', a: 'Every answer is saved the moment you pick it. Reopen the test from Tests → Live now and you continue where you stopped. The timer keeps running, so reconnect quickly.' },
  { topic: 'Tests', q: 'Why does a proctored test need my camera?', a: 'Proctored tests take an occasional photo and note when you leave the test tab. Your faculty reviews any flags; nothing is decided automatically.' },
  { topic: 'Tests', q: 'When will I see my marks?', a: 'Quizzes usually show your score right after you submit. Mid-terms are shown once your faculty publishes results; you get a notification.' },
  { topic: 'Assignments', q: 'Can I resubmit an assignment?', a: 'Yes, until the deadline. Open the assignment and upload a new file; the latest one counts.' },
  { topic: 'Assignments', q: 'I missed a deadline. Can I still submit?', a: 'Overdue work can still be uploaded. It is marked late, and your faculty decides on any penalty.' },
  { topic: 'Materials', q: 'How do I download lecture notes offline?', a: 'Open any subject under Courses → Materials and click the download icon next to the file.' },
  { topic: 'Account', q: 'How do I change my phone number?', a: 'Go to your name at the bottom of the sidebar → Settings. Your name and roll number come from the university records and can only be changed by the exam cell.' },
];

export const CHANGELOG = [
  { date: at(0, 9), tag: 'New', title: 'A cleaner Home screen', text: 'Home now shows only what matters today: what is due, your next test, new material from faculty and the quiz of the day.' },
  { date: at(-3, 9), tag: 'New', title: 'Pending submissions, sorted by urgency', text: 'Open Pending submissions on Home to see everything you owe, most urgent first.' },
  { date: at(-7, 9), tag: 'Improved', title: 'Simpler menu', text: 'The menu is now seven clear sections. Every page from the old menu is still there.' },
  { date: at(-12, 9), tag: 'Improved', title: 'Proctored tests are calmer', text: 'A quick camera and connection check before the test, autosave on every answer, and gentle warnings instead of instant disqualification.' },
  { date: at(-20, 9), tag: 'Fixed', title: 'Notes open inside the platform', text: 'PDFs, slides and videos now open in a viewer instead of downloading every time.' },
];
