import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Eye,
  Search,
  Filter,
  CheckCircle,
  Sparkles,
  BookOpen,
  Calendar,
  Clock,
  Award,
  ChevronRight,
  Printer,
  Share2,
  HelpCircle,
  FileDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../utils/api';

export default function PYQPortal({ initialCourseFilter, onOpenChatWithQuestion }) {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [selectedExamType, setSelectedExamType] = useState('All');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activePreviewPaper, setActivePreviewPaper] = useState(null);
  const [revealedHints, setRevealedHints] = useState({});
  const [downloadSuccessToast, setDownloadSuccessToast] = useState(null);

  const semesters = ['All', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 7'];
  const examTypes = ['All', 'MSE', 'ESE', 'Quiz'];

  const loadPapers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedSemester !== 'All') params.semester = selectedSemester;
      if (selectedExamType !== 'All') params.examType = selectedExamType;
      if (searchKeyword.trim()) params.search = searchKeyword.trim();

      const res = await api.getPYQs(params);
      if (res.success && res.data) {
        setPapers(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPapers();
  }, [selectedSemester, selectedExamType, searchKeyword]);

  const handleDownload = async (paper) => {
    try {
      await api.recordDownload(paper.id);
      confetti({ particleCount: 30, spread: 50 });
      setDownloadSuccessToast(`Downloaded: ${paper.courseCode} ${paper.examType} (${paper.academicYear})`);
      setTimeout(() => setDownloadSuccessToast(null), 3500);

      // Trigger actual mock file download blob
      const content = `ALLIANCE UNIVERSITY\nDEPARTMENT OF ${paper.department.toUpperCase()}\n\nCourse: ${paper.courseCode} - ${paper.courseTitle}\nExamination: ${paper.examType} (${paper.academicYear})\nTime: ${paper.duration} | Max Marks: ${paper.maxMarks}\n\n=========================================\nSECTIONS & QUESTIONS:\n` + 
        paper.sections.map(s => `\n[${s.sectionName}]\n` + s.questions.map(q => `${q.qNo} (${q.marks} Marks): ${q.text}`).join('\n')).join('\n');

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${paper.courseCode}_${paper.examType}_Alliance.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleHint = (questionKey) => {
    setRevealedHints(prev => ({
      ...prev,
      [questionKey]: !prev[questionKey]
    }));
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-editorial text-zinc-900">
              PYQ Question Repository
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-code font-semibold">
              Official Archive
            </span>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            Access past Alliance University MSE, ESE, and Mid-Term question papers with step-by-step AI solution hints.
          </p>
        </div>

        {/* Global Quick Stats */}
        <div className="flex items-center gap-3 text-xs font-code">
          <div className="px-3 py-1.5 bg-white border border-[#E4E4E7] rounded-xl flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
            <span className="font-semibold text-zinc-800">{papers.length} Papers</span>
          </div>
          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Solved</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E4E4E7] shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Search by course code, title, or topic (e.g. CSE201, Dijkstra)..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#FAF9F6] border border-zinc-200 rounded-full focus:outline-none focus:border-indigo-400"
          />
        </div>

        {/* Semester Filter Pill Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          <span className="text-[11px] font-code text-zinc-400 mr-1 hidden sm:inline">
            Sem:
          </span>
          {semesters.map((sem) => (
            <button
              key={sem}
              onClick={() => setSelectedSemester(sem)}
              className={`px-3 py-1.5 rounded-full text-xs font-code transition-all whitespace-nowrap ${
                selectedSemester === sem
                  ? 'bg-zinc-900 text-white font-semibold'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {sem === 'All' ? 'All Sem' : sem.replace('Semester ', 'Sem ')}
            </button>
          ))}
        </div>

        {/* Exam Type Filter */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-code text-zinc-400 mr-1 hidden sm:inline">
            Type:
          </span>
          {examTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedExamType(type)}
              className={`px-3 py-1.5 rounded-full text-xs font-code transition-all ${
                selectedExamType === type
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Question Papers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {papers.map((paper) => (
          <div
            key={paper.id}
            className="bg-white rounded-3xl p-5 border border-[#E4E4E7] hover:border-zinc-300 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-zinc-900 text-white font-code text-[11px] font-bold">
                    {paper.courseCode}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-code font-bold ${
                    paper.examType === 'ESE' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {paper.examType} Exam
                  </span>
                </div>
                <span className="text-xs font-code text-zinc-400">
                  {paper.academicYear}
                </span>
              </div>

              {/* Title & Department */}
              <h3 className="text-base font-bold text-zinc-900 leading-snug group-hover:text-indigo-600 transition-colors">
                {paper.courseTitle}
              </h3>
              <p className="text-xs text-zinc-500 mt-1 line-clamp-1">
                {paper.department} • {paper.semester}
              </p>

              {/* Exam Specs */}
              <div className="grid grid-cols-3 gap-2 my-4 p-3 rounded-2xl bg-[#FAF9F6] border border-zinc-100 text-center font-code text-[11px]">
                <div>
                  <span className="text-zinc-400 block text-[10px]">Duration</span>
                  <span className="font-semibold text-zinc-800">{paper.duration}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px]">Max Marks</span>
                  <span className="font-semibold text-zinc-800">{paper.maxMarks}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px]">Downloads</span>
                  <span className="font-semibold text-zinc-800">{paper.downloads}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => setActivePreviewPaper(paper)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Paper</span>
              </button>

              <button
                onClick={() => handleDownload(paper)}
                className="inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-full bg-[#18181B] hover:bg-zinc-800 text-white text-xs font-semibold transition-all"
                title="Download 1-Click PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Paper Preview Modal with Authentic Alliance University Exam Format */}
      {activePreviewPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full border border-zinc-200 shadow-2xl overflow-hidden my-6">
            {/* Modal Top Bar */}
            <div className="bg-[#18181B] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                <span className="font-code text-xs text-zinc-300">
                  {activePreviewPaper.courseCode} — {activePreviewPaper.examType} Official Paper
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(activePreviewPaper)}
                  className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-code flex items-center gap-1.5 transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Download / Print</span>
                </button>
                <button
                  onClick={() => setActivePreviewPaper(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* University Paper Paper Sheet Body */}
            <div className="p-8 max-h-[75vh] overflow-y-auto bg-[#FDFDFD] space-y-6">
              {/* Header Seal & Exam Details */}
              <div className="text-center border-b-2 border-zinc-800 pb-5">
                <div className="text-xl font-bold tracking-widest uppercase font-serif">
                  Alliance University
                </div>
                <div className="text-xs font-code text-zinc-600 uppercase tracking-wider mt-0.5">
                  {activePreviewPaper.department}
                </div>
                <div className="text-sm font-bold text-zinc-900 mt-2">
                  {activePreviewPaper.term} • {activePreviewPaper.academicYear}
                </div>
                <div className="text-base font-bold text-indigo-900 mt-1">
                  {activePreviewPaper.courseCode}: {activePreviewPaper.courseTitle}
                </div>

                <div className="mt-3 flex items-center justify-center gap-8 text-xs font-code text-zinc-700">
                  <span><strong>Duration:</strong> {activePreviewPaper.duration}</span>
                  <span><strong>Max Marks:</strong> {activePreviewPaper.maxMarks}</span>
                  <span><strong>Date:</strong> {activePreviewPaper.date}</span>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 text-xs text-zinc-600">
                <strong>General Instructions:</strong>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  {activePreviewPaper.instructions?.map((inst, i) => (
                    <li key={i}>{inst}</li>
                  ))}
                </ul>
              </div>

              {/* Sections Breakdown */}
              <div className="space-y-6">
                {activePreviewPaper.sections?.map((section, sIdx) => (
                  <div key={sIdx} className="space-y-3">
                    <h4 className="text-xs font-bold font-code uppercase tracking-wider bg-zinc-100 text-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-200">
                      {section.sectionName}
                    </h4>

                    <div className="space-y-3">
                      {section.questions?.map((q, qIdx) => {
                        const qKey = `${sIdx}_${qIdx}`;
                        const isHintOpen = revealedHints[qKey];

                        return (
                          <div
                            key={qIdx}
                            className="p-4 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 transition-all space-y-2"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <span className="font-code font-bold text-zinc-900 mr-2">
                                  {q.qNo}
                                </span>
                                <span className="text-xs text-zinc-800 font-medium leading-relaxed">
                                  {q.text}
                                </span>
                              </div>
                              <span className="text-xs font-code font-bold text-zinc-900 shrink-0 px-2 py-0.5 bg-zinc-100 rounded">
                                [{q.marks} Marks]
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs">
                              <span className="text-[11px] font-code text-zinc-400">
                                Topic: {q.topic}
                              </span>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleHint(qKey)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-code transition-all ${
                                    isHintOpen
                                      ? 'bg-amber-100 text-amber-900 font-semibold'
                                      : 'bg-zinc-100 text-zinc-700 hover:bg-amber-50'
                                  }`}
                                >
                                  <Sparkles className="w-3 h-3 text-amber-600" />
                                  <span>{isHintOpen ? 'Hide AI Solution Hint' : 'View AI Solution Hint'}</span>
                                </button>

                                <button
                                  onClick={() => onOpenChatWithQuestion && onOpenChatWithQuestion(q.text, activePreviewPaper.courseCode)}
                                  className="text-[11px] text-indigo-600 hover:underline font-code"
                                >
                                  Solve in EDUX AI &rarr;
                                </button>
                              </div>
                            </div>

                            {/* Revealed AI Solution Hint */}
                            {isHintOpen && (
                              <div className="mt-2 p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-xs text-amber-950 font-code leading-relaxed animate-in fade-in">
                                <strong>Step-by-Step Solution Methodology:</strong>
                                <p className="mt-1">{q.aiHint}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Download Toast */}
      {downloadSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#18181B] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-medium">{downloadSuccessToast}</span>
        </div>
      )}
    </div>
  );
}

