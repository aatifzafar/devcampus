// Faculty-side sample data: the signed-in faculty member, her courses,
// class rosters and recorded marks. Replace with university records.
import { STUDENT_ROLL } from './store';

export const FACULTY = {
  name: 'Devika',
  fullName: 'Dr. Devika P',
  designation: 'Assistant Professor',
  department: 'Computer Science and Engineering',
  school: 'Alliance School of Advanced Computing',
  email: 'devika.p@alliance.edu.in',
  employeeId: 'AU-FAC-2311',
  cabin: 'Block B, Room 214',
};

export const FACULTY_COURSES = [
  { id: 'toc-5j', code: 'CSE303', name: 'Theory of Computation', section: '5J', semester: 5, color: '#6D3FC0' },
  { id: 'toc-5k', code: 'CSE303', name: 'Theory of Computation', section: '5K', semester: 5, color: '#6D3FC0' },
  { id: 'toc-5l', code: 'CSE303', name: 'Theory of Computation', section: '5L', semester: 5, color: '#6D3FC0' },
  { id: 'ds-3a', code: 'CSE201', name: 'Data Structures', section: '3A', semester: 3, color: '#0F9D76' },
  { id: 'ds-3b', code: 'CSE201', name: 'Data Structures', section: '3B', semester: 3, color: '#0F9D76' },
];
export const courseById = (id) => FACULTY_COURSES.find((c) => c.id === id);
export const FACULTY_CODES = [...new Set(FACULTY_COURSES.map((c) => c.code))];

/* ------------------------------------------------------------------ */
/* Rosters (deterministic sample students)                             */
/* ------------------------------------------------------------------ */

const FIRST = ['Aarav', 'Diya', 'Rohan', 'Isha', 'Kabir', 'Meera', 'Arjun', 'Sneha', 'Vikram', 'Ananya', 'Rahul', 'Priya', 'Karthik', 'Divya', 'Nikhil', 'Pooja', 'Siddharth', 'Kavya', 'Aditya', 'Neha', 'Varun', 'Riya', 'Harsh', 'Tanvi', 'Manish', 'Lakshmi', 'Imran', 'Fatima', 'Yash', 'Shreya', 'Gautam', 'Nandini', 'Pranav', 'Aisha', 'Dev', 'Sanjana'];
const LAST = ['Rao', 'Iyer', 'Menon', 'Kulkarni', 'Shetty', 'Nair', 'Reddy', 'Prakash', 'Joshi', 'Sharma', 'Gowda', 'Bhat', 'Khan', 'Patil', 'Hegde', 'Pillai', 'Das', 'Verma'];

const seeded = (seed) => () => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};

function buildRoster(section, prefix, count, seed) {
  const rand = seeded(seed);
  return Array.from({ length: count }, (_, i) => {
    const first = FIRST[Math.floor(rand() * FIRST.length)];
    const last = LAST[Math.floor(rand() * LAST.length)];
    const strength = 0.45 + rand() * 0.5; // 0.45..0.95 overall ability
    return {
      roll: `${prefix}${String(i + 1).padStart(2, '0')}`,
      name: `${first} ${last}`,
      section,
      strength,
      lastActiveDays: Math.floor(rand() * rand() * 14),
      submitsOnTime: rand() > 0.18,
    };
  });
}

const r5j = buildRoster('5J', '24110210612', 30, 11);
// The demo student, Anna Sharma, is in 5J.
r5j[29] = { roll: STUDENT_ROLL, name: 'Anna Sharma', section: '5J', strength: 0.8, lastActiveDays: 0, submitsOnTime: true, demo: true };

export const ROSTERS = {
  'toc-5j': r5j,
  'toc-5k': buildRoster('5K', '24110210622', 28, 23),
  'toc-5l': buildRoster('5L', '24110210623', 27, 29),
  'ds-3a': buildRoster('3A', '25110210631', 30, 37),
  'ds-3b': buildRoster('3B', '25110210632', 29, 41),
};

// Deterministic per-student score for an assessment (0..1).
export function scoreFor(student, key) {
  const rand = seeded([...`${student.roll}${key}`].reduce((n, c) => n * 31 + c.charCodeAt(0), 7) % 233280);
  return Math.max(0.1, Math.min(1, student.strength + (rand() - 0.5) * 0.35));
}

// Plain 0–1 random number, stable for a student and key (no ability bias).
export function noiseFor(student, key) {
  // FNV-1a hash with a final mix, so neighbouring keys give unrelated values.
  let h = 2166136261;
  for (const c of `${student.roll}|${key}`) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  h = Math.imul(h ^ (h >>> 15), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/* ------------------------------------------------------------------ */
/* Timetable                                                           */
/* ------------------------------------------------------------------ */

export const F_PERIODS = [];
export const F_DAYS = [];
export const FACULTY_TIMETABLE = [];

export const periodTime = (p) => new Date();
export const todaysClasses = () => [];

/* ------------------------------------------------------------------ */
/* Assessments used for CO attainment (Theory of Computation)          */
/* ------------------------------------------------------------------ */

export const CO_ASSESSMENTS = [
  { key: 'mid1', name: 'Mid-term 1', max: 15, cos: ['CO1', 'CO2'], done: true },
  { key: 'asg1', name: 'Assignment 1: Pumping lemma', max: 10, cos: ['CO2'], done: true },
  { key: 'quiz1', name: 'Unit 2 quiz', max: 10, cos: ['CO1', 'CO2'], done: true },
  { key: 'asg2', name: 'Assignment 2: DFA minimisation', max: 10, cos: ['CO1'], done: true },
  { key: 'quiz2', name: 'Unit 3 quiz', max: 15, cos: ['CO3'], done: false },
  { key: 'mid2', name: 'Mid-term 2', max: 15, cos: ['CO3', 'CO4'], done: false },
  { key: 'see', name: 'End-semester exam', max: 50, cos: ['CO1', 'CO2', 'CO3', 'CO4', 'CO5'], done: false },
];
