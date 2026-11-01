// Real, downloadable documents for the sample course content.
//
// Sample materials have no uploaded file behind them, so these build a PDF
// from the course data (syllabus, outcomes, question bank). Anything a faculty
// member uploads replaces this with their own file.
import { makePdf } from './pdf';
import { courseInfo } from '../data/courseInfo';
import { subjectByCode } from '../data/materialsData';
import { QUESTION_BANK } from '../data/appData';
import { PAPERS } from '../data/featuresData';

const SAMPLE_NOTE = 'Sample generated from the course syllabus on Alliance.ai. Faculty uploads replace it.';

const unitOf = (code, unit) => {
  const info = courseInfo(code);
  const u = info.syllabus.find((x) => x.unit === Number(unit)) || info.syllabus[0];
  return { info, u, topics: u?.topics?.length ? u.topics : [u?.title || 'Overview'] };
};

// Question-bank explanations whose topic matches words in a syllabus topic.
const related = (code, topic) => {
  const words = topic.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3);
  return (QUESTION_BANK[code] || []).filter((q) => words.some((w) => `${q.topic} ${q.text}`.toLowerCase().includes(w)));
};

const outcomeFor = (info, unit) => info.outcomes[Math.min(info.outcomes.length, unit) - 1];

export function notesPdf(code, unit, title) {
  const s = subjectByCode(code) || { code, name: code };
  const { info, u, topics } = unitOf(code, unit);
  const co = outcomeFor(info, u.unit);
  const blocks = [
    { h: `Unit ${u.unit}: ${u.title}` },
    { p: `${u.hours} teaching hours. This unit covers ${topics.length} topics.${co ? ` It supports ${co.id}: ${co.text}` : ''}` },
    ...topics.map((t) => ({ li: t })),
  ];
  topics.forEach((t, i) => {
    blocks.push({ h: `${i + 1}. ${t}` });
    const qs = related(code, t);
    if (qs.length) qs.slice(0, 3).forEach((q) => blocks.push({ p: q.explain }));
    else blocks.push({ p: `Read the textbook section on ${t.toLowerCase()} and work through the examples discussed in class.` });
  });
  if (info.textbooks.length) {
    blocks.push({ h: 'Read more' });
    info.textbooks.forEach((b) => blocks.push({ li: `${b.title}, ${b.authors} (${b.publisher}, ${b.edition})` }));
  }
  return makePdf({ title: title || `Unit ${u.unit} lecture notes`, subtitle: `${s.code} ${s.name} - ${s.faculty || 'Faculty'}`, footer: SAMPLE_NOTE, blocks });
}

export function slidesPdf(code, unit, title) {
  const s = subjectByCode(code) || { code, name: code };
  const { info, u, topics } = unitOf(code, unit);
  const co = outcomeFor(info, u.unit);
  const blocks = [
    { slide: { title: 'In this unit', points: topics } },
    ...topics.map((t) => {
      const qs = related(code, t).slice(0, 2).map((q) => q.explain);
      return { slide: { title: t, points: qs.length ? qs : [`What ${t.toLowerCase()} means`, 'A worked example from class', 'Common mistakes to avoid'] } };
    }),
    { slide: { title: 'After this unit you can', points: [co ? co.text : `Explain the main ideas of ${u.title.toLowerCase()}.`, 'Practise with the unit question bank on Alliance.ai'] } },
  ];
  return makePdf({ slides: true, title: title || `Unit ${u.unit}: ${u.title}`, subtitle: `${s.code} ${s.name} - ${s.faculty || ''}`, footer: SAMPLE_NOTE, blocks });
}

export function questionBankPdf(code, unit, title) {
  const s = subjectByCode(code) || { code, name: code };
  const { u, topics } = unitOf(code, unit);
  const papers = PAPERS.filter((p) => p.code === code);
  const fromPapers = papers.flatMap((p) => [...p.partA, ...p.partB]).filter((q) => q.unit === u.unit);
  const seen = new Set();
  const uniq = fromPapers.filter((q) => (seen.has(q.text) ? false : seen.add(q.text)));
  const mcq = (QUESTION_BANK[code] || []).filter((q) => topics.some((t) => related(code, t).includes(q)));
  const blocks = [{ p: `Practice questions for Unit ${u.unit}: ${u.title}.` }];
  if (uniq.length) {
    blocks.push({ h: 'Descriptive questions' });
    uniq.slice(0, 20).forEach((q, i) => blocks.push({ li: `${i + 1}. ${q.text.charAt(0).toUpperCase()}${q.text.slice(1)} (${q.marks} marks, ${q.co})` }));
  }
  if (mcq.length) {
    blocks.push({ h: 'Multiple choice' });
    mcq.forEach((q, i) => {
      blocks.push({ p: `${i + 1}. ${q.text}` });
      q.options.forEach((o, j) => blocks.push({ li: `${String.fromCharCode(65 + j)}. ${o}` }));
    });
    blocks.push({ h: 'Answers' });
    mcq.forEach((q, i) => blocks.push({ li: `${i + 1}. ${String.fromCharCode(65 + q.answer)} - ${q.explain}` }));
  }
  if (!uniq.length && !mcq.length) topics.forEach((t, i) => blocks.push({ li: `${i + 1}. Explain ${t.toLowerCase()} with an example.` }));
  return makePdf({ title: title || `Unit ${u.unit} question bank`, subtitle: `${s.code} ${s.name}`, footer: SAMPLE_NOTE, blocks });
}

export function labManualPdf(code, unit, title) {
  const s = subjectByCode(code) || { code, name: code };
  const { u, topics } = unitOf(code, unit);
  const blocks = [{ p: `Experiments for ${u.title}.` }];
  topics.forEach((t, i) => {
    blocks.push({ h: `Experiment ${i + 1}: ${t}` });
    ['Aim', 'Procedure: write, compile and run the program; test it with the sample inputs', 'Record the output and write the observation in your lab record'].forEach((x) => blocks.push({ li: x === 'Aim' ? `Aim: to implement ${t.toLowerCase()}` : x }));
  });
  return makePdf({ title: title || `Lab manual: ${u.title}`, subtitle: `${s.code} ${s.name}`, footer: SAMPLE_NOTE, blocks });
}

export function samplePrograms(code, unit) {
  const { u, topics } = unitOf(code, unit);
  const body = topics
    .map((t, i) => `// Program ${i + 1}: ${t}\npublic class Program${i + 1} {\n    public static void main(String[] args) {\n        System.out.println("${t.replace(/"/g, "'")}");\n        // TODO: complete during the lab session\n    }\n}\n`)
    .join('\n');
  return new Blob([`// ${code} - ${u.title}\n// Sample programs (generated). Faculty uploads replace this.\n\n${body}`], { type: 'text/plain' });
}

export function syllabusPdf(code) {
  const s = subjectByCode(code) || { code, name: code };
  const info = courseInfo(code);
  const blocks = [];
  if (info.intro) blocks.push({ h: 'Introduction' }, { p: info.intro });
  if (info.prerequisites?.length) blocks.push({ h: 'Prerequisites' }, ...info.prerequisites.map((p) => ({ li: p })));
  if (info.objectives?.length) blocks.push({ h: 'Course objectives' }, ...info.objectives.map((o) => ({ li: o })));
  if (info.outcomes.length) blocks.push({ h: 'Course outcomes' }, ...info.outcomes.map((o) => ({ li: `${o.id}: ${o.text} (${o.level})` })));
  blocks.push({ h: 'Syllabus' });
  info.syllabus.forEach((u) => {
    blocks.push({ p: `Unit ${u.unit}: ${u.title} (${u.hours} hours)` });
    if (u.topics.length) blocks.push({ li: u.topics.join('; ') });
  });
  if (info.assessment?.length) blocks.push({ h: 'Assessment' }, ...info.assessment.map((a) => ({ li: `${a.part}: ${a.marks} marks (${a.kind})` })));
  if (info.textbooks.length) blocks.push({ h: 'Textbooks' }, ...info.textbooks.map((b) => ({ li: `${b.title}, ${b.authors}, ${b.publisher}, ${b.edition}, ${b.year}` })));
  if (info.references.length) blocks.push({ h: 'References' }, ...info.references.map((b) => ({ li: `${b.title}, ${b.authors}, ${b.publisher}, ${b.edition}, ${b.year}` })));
  return makePdf({ title: `${s.code}: ${s.name}`, subtitle: `Course syllabus - L-T-P ${info.ltp} - ${s.credits ? `${s.credits} credits - ` : ''}${info.totalHours} hours`, footer: 'Alliance University - Alliance School of Advanced Computing', blocks });
}

// A stand-in answer sheet for sample students who never uploaded a real file.
export function sampleSubmissionPdf(student, assignment) {
  const s = subjectByCode(assignment.code) || { code: assignment.code, name: assignment.code };
  return makePdf({
    title: assignment.title,
    subtitle: `${student.name} - ${student.roll} - Section ${student.section} - ${s.name}`,
    footer: 'Sample submission for the demo roster. Real student uploads open as the original file.',
    blocks: [
      { h: 'Answers' },
      { p: assignment.details || 'Answers to the assignment questions.' },
      { p: 'Q1. Worked solution with the construction shown step by step.' },
      { p: 'Q2. Proof using the method discussed in class, with each step justified.' },
      { p: 'Q3. Final answer with a short explanation of why it is correct.' },
    ],
  });
}

// The right generated document for a sample material item.
export function sampleMaterial(code, unit, item) {
  switch (item.type) {
    case 'slides':
      return { blob: slidesPdf(code, unit, item.title), name: `${code} ${item.title}.pdf` };
    case 'questions':
      return { blob: questionBankPdf(code, unit, item.title), name: `${code} ${item.title}.pdf` };
    case 'manual':
      return { blob: labManualPdf(code, unit, item.title), name: `${code} ${item.title}.pdf` };
    case 'code':
      return { blob: samplePrograms(code, unit), name: `${code} unit ${unit} sample programs.java` };
    default:
      return { blob: notesPdf(code, unit, item.title), name: `${code} ${item.title}.pdf` };
  }
}

// External reference link for a subject (NPTEL lectures).
export const referenceLink = (code) => {
  const s = subjectByCode(code);
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`NPTEL ${s?.name || code}`)}`;
};
