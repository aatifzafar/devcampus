// Study materials shared by faculty, per subject and unit (sample data).
import { SEMESTERS } from './subjectsData';
import { storeMaterials } from './store';

const daysAgo = (n, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d;
};

// Unit titles for current-semester subjects. Others fall back to "Unit n".
export const UNIT_TITLES = {
  CSE301: ['Java basics and OOP', 'Inheritance, interfaces and packages', 'Strings and collections', 'Exception handling and multithreading', 'JDBC and GUI programming'],
  CSE301L: ['Experiments 1–3: Basics', 'Experiments 4–6: OOP', 'Experiments 7–9: Files and exceptions', 'Experiments 10–11: Threads and JDBC'],
  CSE302: ['Introduction and ER model', 'Relational model and algebra', 'SQL', 'Normalisation', 'Transactions and concurrency'],
  CSE303: ['Finite automata', 'Regular expressions and languages', 'Context-free grammars and PDA', 'Turing machines', 'Decidability'],
  CSE304: ['Network models and physical layer', 'Data link layer', 'Network layer and IP addressing', 'Transport layer, TCP and UDP', 'Application layer'],
  CSE305: ['OS structure and processes', 'CPU scheduling', 'Process synchronisation', 'Deadlocks', 'Memory and file management'],
  CSE306: ['Topic selection', 'Proposal', 'Design', 'Implementation', 'Final report'],
};

// What each unit typically gets, newest units have fewer items so far.
const TEMPLATE = [
  { type: 'notes', name: (u) => `Unit ${u} lecture notes`, meta: '24 pages · PDF' },
  { type: 'slides', name: (u) => `Unit ${u} class slides`, meta: '38 slides · PPT' },
  { type: 'video', name: (u, t) => `${t}: recorded explanation`, meta: '42 min video' },
  { type: 'questions', name: (u) => `Unit ${u} question bank`, meta: '30 questions · PDF' },
  { type: 'link', name: () => 'Reference reading (NPTEL)', meta: 'External link' },
];

const allSubjects = SEMESTERS.flatMap((s) => s.subjects.map((x) => ({ ...x, semester: s.number })));

export const subjectByCode = (code) => allSubjects.find((x) => x.code === code);

// forFaculty: include materials sent to every section, not only the demo student's.
export function materialsFor(code, { forFaculty = false } = {}) {
  const subject = subjectByCode(code);
  if (!subject) return [];
  const titles = UNIT_TITLES[code] || ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5'].map((t, i) => `Topic ${i + 1}`);
  const isCurrent = subject.progress !== undefined;
  // Past subjects: everything shared. Current: up to the unit being taught now.
  const sharedUpTo = isCurrent ? Math.min(titles.length, (subject.unitsDone || 0) + 1) : titles.length;
  const isLab = subject.type === 'Lab';

  const units = titles.map((title, i) => {
    const unit = i + 1;
    const shared = unit <= sharedUpTo;
    const unitAge = isCurrent ? (sharedUpTo - unit) * 14 : 200 + (titles.length - unit) * 14;
    let items = [];
    if (shared) {
      const template = isLab
        ? [
            { type: 'manual', name: () => `Lab manual: ${title}`, meta: '12 pages · PDF' },
            { type: 'code', name: () => 'Sample programs', meta: 'ZIP · 6 files' },
            { type: 'video', name: () => 'Demo walkthrough', meta: '18 min video' },
          ]
        : TEMPLATE;
      // The unit in progress only has its first few items so far.
      const count = isCurrent && unit === sharedUpTo ? 2 : template.length;
      items = template.slice(0, count).map((t, j) => ({
        id: `${code}-u${unit}-${j}`,
        unit,
        type: t.type,
        title: t.name(unit, title),
        meta: t.meta,
        faculty: subject.faculty,
        sharedAt: daysAgo(Math.max(0, unitAge - j * 2), 9 + j),
        note: j === 0 && unit === sharedUpTo && isCurrent ? 'Read before Monday’s class.' : null,
      }));
    }
    return { unit, title, shared, current: isCurrent && unit === sharedUpTo, items };
  });
  // Material faculty shared on the platform.
  const extra = storeMaterials(code, forFaculty);
  return units.map((u) => {
    const add = extra.filter((m) => m.unit === u.unit).map((m) => ({ id: m.id, unit: u.unit, type: m.type, title: m.title, meta: m.meta, faculty: m.faculty, sharedAt: m.sharedAt, note: m.note, sections: m.sections, fileId: m.fileId, fileName: m.fileName, url: m.url, fromFaculty: true }));
    return add.length ? { ...u, shared: true, items: [...u.items, ...add] } : u;
  });
}
