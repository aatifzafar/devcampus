// Semester-wise subjects for B.Tech CSE (sample data).
// Current semester subjects carry live progress; past ones carry final grades.

export const CURRENT_SEMESTER = 5;

const c = (code, name, credits, faculty, type, color, extra = {}) => ({
  code, name, credits, faculty, type, color, ...extra,
});

export const SEMESTERS = [
  {
    number: 1,
    term: 'Odd 2024',
    sgpa: 8.2,
    subjects: [
      c('MAT101', 'Engineering Mathematics I', 4, 'Teacher 2', 'Theory', '#2563EB', { grade: 'A' }),
      c('PHY101', 'Engineering Physics', 3, 'Teacher 15', 'Theory', '#0891B2', { grade: 'B+' }),
      c('CSE101', 'Programming in C', 4, 'Teacher 9', 'Theory', '#6D3FC0', { grade: 'A+' }),
      c('CSE101L', 'Programming in C Lab', 2, 'Teacher 9', 'Lab', '#6D3FC0', { grade: 'O' }),
      c('EEE101', 'Basic Electrical Engineering', 3, 'Teacher 13', 'Theory', '#CA8A04', { grade: 'B' }),
      c('HSS101', 'Communication Skills', 2, 'Teacher 10', 'Theory', '#DB2777', { grade: 'A' }),
    ],
  },
  {
    number: 2,
    term: 'Even 2025',
    sgpa: 8.5,
    subjects: [
      c('MAT102', 'Engineering Mathematics II', 4, 'Teacher 2', 'Theory', '#2563EB', { grade: 'A' }),
      c('CHE101', 'Engineering Chemistry', 3, 'Teacher 14', 'Theory', '#0891B2', { grade: 'B+' }),
      c('CSE102', 'Object Oriented Programming in C++', 4, 'Teacher 7', 'Theory', '#6D3FC0', { grade: 'A+' }),
      c('CSE102L', 'C++ Lab', 2, 'Teacher 7', 'Lab', '#6D3FC0', { grade: 'O' }),
      c('ECE101', 'Digital Logic Design', 3, 'Teacher 4', 'Theory', '#D85A30', { grade: 'A' }),
      c('MEC101', 'Engineering Graphics', 2, 'Teacher 12', 'Lab', '#CA8A04', { grade: 'B+' }),
    ],
  },
  {
    number: 3,
    term: 'Odd 2025',
    sgpa: 8.7,
    subjects: [
      c('MAT201', 'Discrete Mathematics', 4, 'Teacher 2', 'Theory', '#2563EB', { grade: 'A' }),
      c('CSE201', 'Data Structures', 4, 'Demo Teacher', 'Theory', '#0F9D76', { grade: 'A+' }),
      c('CSE201L', 'Data Structures Lab', 2, 'Demo Teacher', 'Lab', '#0F9D76', { grade: 'O' }),
      c('CSE202', 'Computer Organization and Architecture', 3, 'Teacher 4', 'Theory', '#D85A30', { grade: 'B+' }),
      c('CSE203', 'Object Oriented Analysis and Design', 3, 'Teacher 5', 'Theory', '#6D3FC0', { grade: 'A' }),
      c('HSS201', 'Universal Human Values', 2, 'Teacher 10', 'Theory', '#DB2777', { grade: 'A+' }),
    ],
  },
  {
    number: 4,
    term: 'Even 2026',
    sgpa: 8.9,
    subjects: [
      c('MAT202', 'Probability and Statistics', 4, 'Teacher 2', 'Theory', '#2563EB', { grade: 'A' }),
      c('CSE204', 'Design and Analysis of Algorithms', 4, 'Teacher 3', 'Theory', '#0F9D76', { grade: 'A+' }),
      c('CSE204L', 'Algorithms Lab', 2, 'Teacher 3', 'Lab', '#0F9D76', { grade: 'O' }),
      c('CSE205', 'Microprocessors and Interfacing', 3, 'Teacher 4', 'Theory', '#D85A30', { grade: 'A' }),
      c('CSE206', 'Software Engineering', 3, 'Teacher 5', 'Theory', '#6D3FC0', { grade: 'A' }),
      c('CSE207', 'Python Programming', 3, 'Teacher 6', 'Theory', '#CA8A04', { grade: 'O' }),
    ],
  },
  {
    number: 5,
    term: 'Odd 2026',
    subjects: [
      c('CSE301', 'Java Programming', 4, 'Teacher 7', 'Theory', '#0F9D76', {
        progress: 62, unitsDone: 3, units: 5, currentTopic: 'Unit 4: Exception handling and multithreading',
        notes: 18, pendingWork: 2, nextUp: 'Lab assessment · Wed, 4 Nov',
      }),
      c('CSE301L', 'Java Programming Lab', 2, 'Teacher 7', 'Lab', '#0F9D76', {
        progress: 55, unitsDone: 6, units: 11, unitLabel: 'experiments', currentTopic: 'Experiment 7: File handling',
        notes: 11, pendingWork: 1, nextUp: 'Lab 6 record due today',
      }),
      c('CSE302', 'Database Management Systems', 4, 'Teacher 8', 'Theory', '#D85A30', {
        progress: 70, unitsDone: 3, units: 5, currentTopic: 'Unit 4: Normalisation and BCNF',
        notes: 22, pendingWork: 2, nextUp: 'Mid-term 2 · Sun, 1 Nov',
      }),
      c('CSE303', 'Theory of Computation', 4, 'Demo Teacher', 'Theory', '#6D3FC0', {
        progress: 58, unitsDone: 2, units: 5, currentTopic: 'Unit 3: Context-free grammars and PDA',
        notes: 15, pendingWork: 1, nextUp: 'Unit 3 quiz · Today',
      }),
      c('CSE304', 'Computer Networks', 3, 'Teacher 11', 'Theory', '#2563EB', {
        progress: 64, unitsDone: 3, units: 5, currentTopic: 'Unit 4: Transport layer, TCP and UDP',
        notes: 17, pendingWork: 1, nextUp: 'Subnetting worksheet · Tomorrow',
      }),
      c('CSE305', 'Operating Systems', 3, 'Teacher 6', 'Theory', '#CA8A04', {
        progress: 66, unitsDone: 3, units: 5, currentTopic: 'Unit 4: Deadlocks',
        notes: 14, pendingWork: 1, nextUp: 'CPU scheduling case study · Mon, 2 Nov',
      }),
      c('CSE306', 'Mini Project', 2, 'Teacher 7', 'Project', '#DB2777', {
        progress: 20, unitsDone: 1, units: 5, unitLabel: 'milestones', currentTopic: 'Milestone 2: Proposal document',
        notes: 3, pendingWork: 1, nextUp: 'Proposal due · Thu, 5 Nov',
      }),
    ],
  },
];
