// Sample data for the Home screen. Dates are built relative to "now" so the
// demo always looks current. Replace with API calls once the backend exists.

const at = (dayOffset, hour, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
};

// Later today: `hours` from now, but never past 11:45 PM today.
const laterToday = (hours) => {
  const now = new Date();
  const t = new Date(now.getTime() + hours * 3600000);
  const cap = new Date(now);
  cap.setHours(23, 45, 0, 0);
  return t > cap && cap > now ? cap : t;
};
const minutesFromNow = (m) => new Date(Date.now() + m * 60000);

export const SUBJECTS = {
  JAVA: { code: 'CSE301', name: 'Java Programming', color: '#0F9D76' },
  DBMS: { code: 'CSE302', name: 'Database Management Systems', color: '#D85A30' },
  TOC: { code: 'CSE303', name: 'Theory of Computation', color: '#6D3FC0' },
  CN: { code: 'CSE304', name: 'Computer Networks', color: '#2563EB' },
  OS: { code: 'CSE305', name: 'Operating Systems', color: '#CA8A04' },
};

export const STUDENT_INFO = {
  rollNo: '2411021061234',
  program: 'B.Tech CSE',
  semester: 5,
  section: 'J',
  mentor: 'Demo Teacher',
  cgpa: 8.6,
};

export const ATTENDANCE_BY_SUBJECT = [];

// Done so far this week, for the profile tile.
export const WEEK_STATS = { submitted: 4 };

// Everything the student has to hand in. `submitted: false` = pending.
export const SUBMISSIONS = [
  { id: 's1', title: 'ER diagram for library system', type: 'Assignment', subject: SUBJECTS.DBMS, due: at(-2, 23, 59), teacher: 'Teacher 8', marks: 10 },
  { id: 's2', title: 'Lab 6: Exception handling programs', type: 'Lab record', subject: SUBJECTS.JAVA, due: laterToday(3), teacher: 'Teacher 7', marks: 15 },
  { id: 's3', title: 'DFA minimisation problem set', type: 'Assignment', subject: SUBJECTS.TOC, due: at(0, 23, 59), teacher: 'Demo Teacher', marks: 10 },
  { id: 's4', title: 'Subnetting worksheet', type: 'Worksheet', subject: SUBJECTS.CN, due: at(1, 23, 59), teacher: 'Teacher 11', marks: 5 },
  { id: 's5', title: 'CPU scheduling case study', type: 'Assignment', subject: SUBJECTS.OS, due: at(3, 23, 59), teacher: 'Teacher 6', marks: 10 },
  { id: 's6', title: 'Mini project: proposal document', type: 'Project', subject: SUBJECTS.JAVA, due: at(6, 23, 59), teacher: 'Teacher 7', marks: 20 },
  { id: 's7', title: 'Normalisation exercises (1NF to BCNF)', type: 'Assignment', subject: SUBJECTS.DBMS, due: at(11, 23, 59), teacher: 'Teacher 8', marks: 10 },
];

export const TESTS = [
  { id: 't0', title: 'Weekly quiz 6', subject: SUBJECTS.CN, start: minutesFromNow(-5), minutes: 40, proctored: true, questions: 10 },
  { id: 't1', title: 'Unit 3 quiz', subject: SUBJECTS.TOC, start: laterToday(1.5), minutes: 30, proctored: false, questions: 15 },
  { id: 't2', title: 'Mid-term 2', subject: SUBJECTS.DBMS, start: at(2, 10, 0), minutes: 90, proctored: true, questions: 40 },
  { id: 't3', title: 'Lab assessment', subject: SUBJECTS.JAVA, start: at(5, 11, 30), minutes: 60, proctored: true, questions: 3 },
];

export const CLASSES_TODAY = [];

// New things teachers shared recently.
export const RECENTLY_ASSIGNED = [
  { id: 'r1', kind: 'Notes', title: 'Unit 4 notes: Transport layer', subject: SUBJECTS.CN, when: at(0, 8, 15), teacher: 'Teacher 11' },
  { id: 'r2', kind: 'Assignment', title: 'DFA minimisation problem set', subject: SUBJECTS.TOC, when: at(-1, 16, 40), teacher: 'Demo Teacher' },
  { id: 'r3', kind: 'Test', title: 'Mid-term 2 scheduled', subject: SUBJECTS.DBMS, when: at(-1, 11, 5), teacher: 'Teacher 8' },
  { id: 'r4', kind: 'Recording', title: 'Deadlock avoidance class', subject: SUBJECTS.OS, when: at(-2, 20, 30), teacher: 'Teacher 6' },
];

// One question per day, picked by date so everyone gets the same one.
const QUIZ_BANK = [
  {
    subject: SUBJECTS.TOC,
    question: 'Which of these languages is NOT regular?',
    options: ['Strings over {a, b} ending in "ab"', 'aⁿbⁿ for n ≥ 0', 'Strings with an even number of a’s', 'a*b*'],
    answer: 1,
    explain: 'Recognising aⁿbⁿ needs the machine to count an unbounded number of a’s, which a finite automaton cannot do. The pumping lemma proves it is not regular.',
  },
  {
    subject: SUBJECTS.DBMS,
    question: 'A relation is in BCNF if, for every non-trivial dependency X → Y…',
    options: ['Y is a prime attribute', 'X is a superkey', 'X is a candidate key and Y is non-prime', 'There are no partial dependencies'],
    answer: 1,
    explain: 'BCNF requires the left side of every non-trivial functional dependency to be a superkey. 3NF is weaker: it also allows Y to be a prime attribute.',
  },
  {
    subject: SUBJECTS.JAVA,
    question: 'Which keyword stops a method from being overridden in a subclass?',
    options: ['static', 'private', 'final', 'abstract'],
    answer: 2,
    explain: 'A final method cannot be overridden. Private methods are not inherited at all, and static methods are hidden rather than overridden.',
  },
  {
    subject: SUBJECTS.CN,
    question: 'How many usable host addresses does a /27 subnet have?',
    options: ['32', '30', '27', '62'],
    answer: 1,
    explain: 'A /27 leaves 5 host bits: 2⁵ = 32 addresses, minus the network and broadcast addresses, gives 30 usable hosts.',
  },
  {
    subject: SUBJECTS.OS,
    question: 'Which scheduling algorithm can cause starvation of long processes?',
    options: ['First come, first served', 'Round robin', 'Shortest job first', 'None of these'],
    answer: 2,
    explain: 'Shortest job first keeps picking short jobs, so a long job can wait forever if short ones keep arriving. Ageing is the usual fix.',
  },
];

export const quizOfTheDay = () => {
  const d = new Date();
  const dayNumber = Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 86400000);
  return { ...QUIZ_BANK[dayNumber % QUIZ_BANK.length], id: `quiz-${dayNumber}`, xp: 20 };
};
