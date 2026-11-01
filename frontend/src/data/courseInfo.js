// Course details shown on the course page: introduction, objectives,
// outcomes, outline, syllabus, references. Sample content for Semester 5.
import { subjectByCode, UNIT_TITLES } from './materialsData';

const ASSESSMENT = [
  { part: 'Mid-term test 1', marks: 15, kind: 'CIE' },
  { part: 'Mid-term test 2', marks: 15, kind: 'CIE' },
  { part: 'Assignments', marks: 10, kind: 'CIE' },
  { part: 'Quizzes', marks: 10, kind: 'CIE' },
  { part: 'End-semester exam', marks: 50, kind: 'SEE' },
];
const LAB_ASSESSMENT = [
  { part: 'Weekly lab records', marks: 20, kind: 'CIE' },
  { part: 'Lab viva', marks: 10, kind: 'CIE' },
  { part: 'Lab assessment', marks: 20, kind: 'CIE' },
  { part: 'End-semester practical', marks: 50, kind: 'SEE' },
];

const INFO = {
  CSE302: {
    ltp: '3-0-1',
    intro:
      'This course introduces how data is modelled, stored, queried and protected in a database system. You will design databases using ER models, query them with relational algebra and SQL, remove redundancy through normalisation, and learn how transactions keep data correct when many users work at the same time.',
    prerequisites: ['Data Structures', 'Discrete Mathematics'],
    objectives: [
      'Explain the role of a DBMS and the three-schema architecture.',
      'Model real-world requirements using ER diagrams and map them to relations.',
      'Write relational algebra expressions and SQL queries, including joins, sub-queries and views.',
      'Apply functional dependencies to normalise relations up to BCNF.',
      'Describe transaction properties, concurrency control and recovery.',
    ],
    outcomes: [
      ['Describe database architecture, data models and the role of a DBMS.', 'Understand'],
      ['Design an ER model for a given application and convert it into a relational schema.', 'Apply'],
      ['Formulate queries using relational algebra and SQL.', 'Apply'],
      ['Normalise a relational schema using functional dependencies.', 'Analyse'],
      ['Analyse schedules for serialisability and choose suitable concurrency control.', 'Analyse'],
    ],
    syllabus: [
      [9, ['Purpose of database systems', 'Data models and three-schema architecture', 'ER model: entities, attributes, relationships', 'Cardinality and participation', 'Extended ER features', 'ER to relational mapping']],
      [9, ['Relational model concepts and keys', 'Integrity constraints', 'Relational algebra operations', 'Joins and division', 'Tuple and domain relational calculus']],
      [9, ['DDL and DML', 'Aggregate functions, GROUP BY, HAVING', 'Nested queries and joins', 'Views, triggers and stored procedures', 'Embedded and dynamic SQL']],
      [9, ['Functional dependencies and closure', 'Canonical cover', '1NF, 2NF, 3NF and BCNF', 'Lossless join and dependency preservation', 'Multivalued dependencies and 4NF']],
      [9, ['ACID properties', 'Schedules and serialisability', 'Lock-based protocols and two-phase locking', 'Timestamp ordering', 'Recovery and log-based techniques']],
    ],
    textbooks: [
      ['Database System Concepts', 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan', 'McGraw Hill', '7th edition', 2019],
      ['Fundamentals of Database Systems', 'Ramez Elmasri, Shamkant B. Navathe', 'Pearson', '7th edition', 2016],
    ],
    references: [
      ['Database Management Systems', 'Raghu Ramakrishnan, Johannes Gehrke', 'McGraw Hill', '3rd edition', 2003],
      ['An Introduction to Database Systems', 'C. J. Date', 'Pearson', '8th edition', 2004],
    ],
    online: [['NPTEL: Data Base Management System', 'IIT Kharagpur']],
  },
  CSE303: {
    ltp: '3-1-0',
    intro:
      'This course studies what computers can and cannot do, using simple mathematical models of computation. Starting with finite automata and regular languages, it moves to context-free grammars and pushdown automata, and ends with Turing machines and the limits of computation.',
    prerequisites: ['Discrete Mathematics', 'Data Structures'],
    objectives: [
      'Build finite automata and regular expressions for given languages.',
      'Prove that a language is not regular using the pumping lemma.',
      'Design context-free grammars and pushdown automata.',
      'Construct Turing machines for simple problems.',
      'Explain decidability and identify undecidable problems.',
    ],
    outcomes: [
      ['Design DFA and NFA for a regular language and convert between them.', 'Apply'],
      ['Write regular expressions and apply closure properties and the pumping lemma.', 'Apply'],
      ['Construct CFGs and PDAs, and simplify grammars into normal forms.', 'Apply'],
      ['Design Turing machines and compare variants of the model.', 'Analyse'],
      ['Distinguish decidable from undecidable problems using reductions.', 'Evaluate'],
    ],
    syllabus: [
      [9, ['Alphabets, strings and languages', 'Deterministic finite automata', 'Non-deterministic finite automata', 'NFA to DFA conversion', 'Minimisation of DFA']],
      [9, ['Regular expressions', 'Equivalence of regular expressions and FA', 'Closure properties', 'Pumping lemma for regular languages', 'Moore and Mealy machines']],
      [10, ['Context-free grammars and derivations', 'Ambiguity', 'Simplification, CNF and GNF', 'Pushdown automata', 'Equivalence of CFG and PDA', 'Pumping lemma for CFLs']],
      [9, ['Turing machine model', 'Designing Turing machines', 'Variants: multi-tape, non-deterministic', 'Church–Turing thesis']],
      [8, ['Recursive and recursively enumerable languages', 'Halting problem', 'Reductions', 'Post correspondence problem', 'Introduction to P and NP']],
    ],
    textbooks: [
      ['Introduction to Automata Theory, Languages, and Computation', 'John E. Hopcroft, Rajeev Motwani, Jeffrey D. Ullman', 'Pearson', '3rd edition', 2007],
      ['Introduction to the Theory of Computation', 'Michael Sipser', 'Cengage Learning', '3rd edition', 2013],
    ],
    references: [
      ['An Introduction to Formal Languages and Automata', 'Peter Linz', 'Jones and Bartlett', '6th edition', 2016],
      ['Introduction to Languages and the Theory of Computation', 'John C. Martin', 'McGraw Hill', '4th edition', 2011],
    ],
    online: [['NPTEL: Theory of Computation', 'IIT Kanpur']],
  },
  CSE301: {
    ltp: '3-0-0',
    intro:
      'This course teaches object-oriented programming in Java, from the basics of the language to inheritance, interfaces, collections, exception handling, multithreading and database connectivity. The focus is on writing clean, working programs.',
    prerequisites: ['Programming in C', 'Object Oriented Programming in C++'],
    objectives: [
      'Write Java programs using classes, objects and core language features.',
      'Use inheritance, polymorphism, interfaces and packages to structure code.',
      'Work with strings and the collections framework.',
      'Handle errors with exceptions and write multithreaded programs.',
      'Connect Java programs to a database using JDBC.',
    ],
    outcomes: [
      ['Explain Java language features and the JVM execution model.', 'Understand'],
      ['Apply object-oriented principles to design Java classes.', 'Apply'],
      ['Use the collections framework to solve data-handling problems.', 'Apply'],
      ['Develop robust programs using exception handling and threads.', 'Apply'],
      ['Build simple applications with JDBC and a graphical interface.', 'Create'],
    ],
    syllabus: [
      [9, ['Features of Java and the JVM', 'Data types, operators, control statements', 'Classes, objects and constructors', 'Arrays and command-line arguments', 'static and this']],
      [9, ['Inheritance and super', 'Method overriding and dynamic dispatch', 'Abstract classes and interfaces', 'Packages and access control']],
      [9, ['String, StringBuilder', 'Wrapper classes', 'Collections: List, Set, Map', 'Iterators and generics']],
      [9, ['Exception hierarchy, try-catch-finally', 'Custom exceptions', 'Thread life cycle', 'Synchronisation and inter-thread communication']],
      [9, ['JDBC architecture and drivers', 'Executing queries and prepared statements', 'Introduction to Swing / JavaFX', 'Event handling']],
    ],
    textbooks: [['Java: The Complete Reference', 'Herbert Schildt', 'McGraw Hill', '12th edition', 2021]],
    references: [
      ['Core Java, Volume I: Fundamentals', 'Cay S. Horstmann', 'Pearson', '12th edition', 2022],
      ['Effective Java', 'Joshua Bloch', 'Addison-Wesley', '3rd edition', 2018],
    ],
    online: [['NPTEL: Programming in Java', 'IIT Kharagpur']],
  },
  CSE304: {
    ltp: '3-0-0',
    intro:
      'This course explains how computer networks move data from one machine to another. It follows the layered model from the physical and data link layers through IP addressing and routing to TCP, UDP and common application protocols.',
    prerequisites: ['Computer Organization and Architecture'],
    objectives: [
      'Explain the OSI and TCP/IP reference models.',
      'Describe framing, error control and medium access at the data link layer.',
      'Design IP addressing schemes using subnetting.',
      'Compare TCP and UDP and explain congestion and flow control.',
      'Describe how DNS, HTTP and email work.',
    ],
    outcomes: [
      ['Describe network models, topologies and transmission media.', 'Understand'],
      ['Apply error detection and correction techniques.', 'Apply'],
      ['Design subnets and explain routing algorithms.', 'Apply'],
      ['Analyse transport-layer protocols for reliability and congestion control.', 'Analyse'],
      ['Explain the working of common application-layer protocols.', 'Understand'],
    ],
    syllabus: [
      [8, ['Uses of networks and topologies', 'OSI and TCP/IP models', 'Transmission media', 'Switching']],
      [9, ['Framing', 'Error detection: parity, CRC', 'Flow control: stop-and-wait, sliding window', 'MAC protocols: ALOHA, CSMA/CD', 'Ethernet']],
      [10, ['IPv4 addressing and subnetting', 'CIDR', 'Routing: distance vector, link state', 'ICMP, ARP', 'Introduction to IPv6']],
      [9, ['UDP', 'TCP segment and connection management', 'Flow control', 'Congestion control']],
      [9, ['DNS', 'HTTP and the web', 'Email: SMTP, POP, IMAP', 'Introduction to network security']],
    ],
    textbooks: [
      ['Computer Networks', 'Andrew S. Tanenbaum, Nick Feamster, David J. Wetherall', 'Pearson', '6th edition', 2021],
      ['Data Communications and Networking', 'Behrouz A. Forouzan', 'McGraw Hill', '5th edition', 2013],
    ],
    references: [
      ['Computer Networking: A Top-Down Approach', 'James F. Kurose, Keith W. Ross', 'Pearson', '8th edition', 2021],
      ['Computer Networks: A Systems Approach', 'Larry L. Peterson, Bruce S. Davie', 'Morgan Kaufmann', '5th edition', 2011],
    ],
    online: [['NPTEL: Computer Networks and Internet Protocol', 'IIT Kharagpur']],
  },
  CSE305: {
    ltp: '3-0-0',
    intro:
      'This course explains how an operating system manages a computer: running processes, scheduling the CPU, keeping concurrent programs in step, avoiding deadlock, and managing memory and files.',
    prerequisites: ['Data Structures', 'Computer Organization and Architecture'],
    objectives: [
      'Explain operating system structure and services.',
      'Compare CPU scheduling algorithms.',
      'Solve synchronisation problems using semaphores and monitors.',
      'Detect, avoid and recover from deadlocks.',
      'Describe paging, virtual memory and file systems.',
    ],
    outcomes: [
      ['Describe OS structure, system calls and process management.', 'Understand'],
      ['Evaluate CPU scheduling algorithms for given workloads.', 'Evaluate'],
      ['Apply synchronisation tools to classical problems.', 'Apply'],
      ['Apply the banker’s algorithm and deadlock handling techniques.', 'Apply'],
      ['Analyse memory management and page replacement strategies.', 'Analyse'],
    ],
    syllabus: [
      [8, ['OS functions and structure', 'System calls', 'Processes and process states', 'Threads']],
      [9, ['Scheduling criteria', 'FCFS, SJF, priority, round robin', 'Multilevel queue scheduling', 'Real-time scheduling']],
      [10, ['Critical-section problem', 'Peterson’s solution', 'Semaphores and mutex locks', 'Monitors', 'Classical synchronisation problems']],
      [9, ['Deadlock characterisation', 'Prevention and avoidance', 'Banker’s algorithm', 'Detection and recovery']],
      [9, ['Paging and segmentation', 'Virtual memory and demand paging', 'Page replacement algorithms', 'File system structure and allocation']],
    ],
    textbooks: [['Operating System Concepts', 'Abraham Silberschatz, Peter B. Galvin, Greg Gagne', 'Wiley', '10th edition', 2018]],
    references: [
      ['Operating Systems: Internals and Design Principles', 'William Stallings', 'Pearson', '9th edition', 2018],
      ['Modern Operating Systems', 'Andrew S. Tanenbaum, Herbert Bos', 'Pearson', '4th edition', 2015],
    ],
    online: [['NPTEL: Operating System Fundamentals', 'IIT Kharagpur']],
  },
  CSE301L: {
    ltp: '0-0-2',
    lab: true,
    intro:
      'Hands-on lab that goes with Java Programming. Each week you write, run and record programs on the topic covered in class, building up to a small JDBC application.',
    prerequisites: ['Java Programming (taken alongside)'],
    objectives: [
      'Practise core Java syntax and object-oriented design.',
      'Write programs that use collections, files and exceptions.',
      'Build multithreaded and database-connected programs.',
    ],
    outcomes: [
      ['Implement Java programs using classes, inheritance and interfaces.', 'Apply'],
      ['Develop programs using collections, file handling and exceptions.', 'Apply'],
      ['Build a small application using threads and JDBC.', 'Create'],
    ],
    textbooks: [['Java: The Complete Reference', 'Herbert Schildt', 'McGraw Hill', '12th edition', 2021]],
    references: [],
    online: [],
  },
  CSE306: {
    ltp: '0-0-4',
    lab: true,
    intro:
      'In the mini project you work in a team of three or four to plan, design, build and present a small software product, following basic software engineering practice.',
    prerequisites: ['Software Engineering', 'Java Programming'],
    objectives: [
      'Identify a real problem and write a clear proposal.',
      'Design and build a working solution as a team.',
      'Test, document and present the work.',
    ],
    outcomes: [
      ['Formulate a problem statement and project plan.', 'Create'],
      ['Design and implement a working software solution.', 'Create'],
      ['Communicate the work through a report and presentation.', 'Apply'],
    ],
    textbooks: [
      ['Software Engineering', 'Ian Sommerville', 'Pearson', '10th edition', 2021],
      ['Software Engineering: A Practitioner’s Approach', 'Roger S. Pressman', 'McGraw Hill', '9th edition', 2019],
    ],
    references: [],
    online: [],
  },
};

const daysAgo = (n, hour = 11) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d;
};

export function courseInfo(code) {
  const subject = subjectByCode(code);
  const info = INFO[code] || {
    ltp: subject?.type === 'Lab' ? '0-0-2' : '3-0-0',
    intro: 'The faculty has not added a course introduction yet.',
    prerequisites: [],
    objectives: [],
    outcomes: [],
    textbooks: [],
    references: [],
    online: [],
  };
  const titles = UNIT_TITLES[code] || [1, 2, 3, 4, 5].map((n) => `Unit ${n}`);
  const syllabus = titles.map((title, i) => ({
    unit: i + 1,
    title,
    hours: info.syllabus?.[i]?.[0] ?? (info.lab ? 6 : 9),
    topics: info.syllabus?.[i]?.[1] ?? [],
  }));

  // Recorded live classes: one per topic taught so far, newest first.
  const isCurrent = subject?.progress !== undefined;
  const taughtUnits = isCurrent ? (subject.unitsDone || 0) + 1 : syllabus.length;
  const recordings = [];
  let lecture = 0;
  syllabus.slice(0, taughtUnits).forEach((u, ui) => {
    const topics = u.topics.length ? u.topics : [u.title];
    const upto = isCurrent && ui === taughtUnits - 1 ? Math.min(2, topics.length) : topics.length;
    topics.slice(0, upto).forEach((topic) => {
      lecture += 1;
      recordings.push({ id: `${code}-rec-${lecture}`, lecture, unit: u.unit, topic, minutes: 45 + ((lecture * 7) % 15) });
    });
  });
  const total = recordings.length;
  recordings.forEach((r, i) => {
    r.date = daysAgo(isCurrent ? (total - 1 - i) * 2 + 1 : 200 + (total - i) * 2);
  });
  recordings.reverse();

  return {
    ...info,
    outcomes: info.outcomes.map(([text, level], i) => ({ id: `CO${i + 1}`, text, level })),
    textbooks: info.textbooks.map(([title, authors, publisher, edition, year]) => ({ title, authors, publisher, edition, year })),
    references: info.references.map(([title, authors, publisher, edition, year]) => ({ title, authors, publisher, edition, year })),
    online: info.online.map(([title, by]) => ({ title, by })),
    syllabus,
    recordings,
    assessment: info.lab ? LAB_ASSESSMENT : ASSESSMENT,
    totalHours: syllabus.reduce((n, u) => n + u.hours, 0),
  };
}
