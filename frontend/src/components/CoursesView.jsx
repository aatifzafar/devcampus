import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Play,
  ArrowRight,
  Sparkles,
  Search,
  Check,
  ChevronRight,
  Layers,
  GraduationCap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../utils/api';

export default function CoursesView({ courses, onUpdateProgress, onOpenChatbot }) {
  const [selectedCourse, setSelectedCourse] = useState(courses[0] || null);
  const [search, setSearch] = useState('');

  const filteredCourses = (courses || []).filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdvanceModule = async (courseId) => {
    try {
      await api.getCourseById(courseId);
      onUpdateProgress(courseId, 10);
      confetti({ particleCount: 35, spread: 60 });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-editorial text-zinc-900">
              Enrolled Courses & Syllabi
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-code font-semibold">
              Semester 5 Active
            </span>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            Access course syllabi, lecture progression, interactive modules, and curriculum tracking.
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter courses..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#E4E4E7] rounded-full focus:outline-none focus:border-indigo-400"
          />
        </div>
      </div>

      {/* Grid: Course List + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Course Cards */}
        <div className="lg:col-span-5 space-y-4">
          {filteredCourses.map((course) => {
            const isSelected = selectedCourse?.id === course.id;
            return (
              <div
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white border-zinc-900 shadow-md ring-1 ring-zinc-900/10'
                    : 'bg-white/70 hover:bg-white border-[#E4E4E7] hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800 text-[11px] font-code font-bold">
                    {course.code}
                  </span>
                  <span className="text-xs font-code font-semibold text-zinc-700">
                    {course.progress}%
                  </span>
                </div>

                <h3 className="text-sm font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">
                  {course.instructor} • {course.department}
                </p>

                {/* Progress bar */}
                <div className="w-full bg-zinc-100 rounded-full h-1.5 mt-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${course.progress}%`,
                      backgroundColor: course.color || '#4F46E5'
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Course Syllabus & Active Module */}
        {selectedCourse && (
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-[#E4E4E7] shadow-xs space-y-6">
            <div className="pb-5 border-b border-zinc-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#18181B] text-white text-xs font-code font-bold">
                  {selectedCourse.code}
                </span>
                <span className="text-xs text-zinc-500 font-code">
                  {selectedCourse.department}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">
                {selectedCourse.title}
              </h3>
              <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                {selectedCourse.description}
              </p>
              <div className="mt-3 flex items-center gap-4 text-xs font-code text-zinc-500">
                <span>Faculty: <strong>{selectedCourse.instructor}</strong></span>
                <span>Total: <strong>{selectedCourse.lessonsCount} Modules</strong></span>
              </div>
            </div>

            {/* Current Lesson In Progress */}
            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-zinc-200/80 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-code uppercase text-zinc-400 font-bold tracking-wider">
                  Active Topic
                </span>
                <h4 className="text-xs font-bold text-zinc-900 mt-0.5">
                  {selectedCourse.currentTopic}
                </h4>
              </div>
              <button
                onClick={() => handleAdvanceModule(selectedCourse.id)}
                className="px-4 py-2 rounded-full bg-[#18181B] hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs shrink-0"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark Lesson Done (+10%)</span>
              </button>
            </div>

            {/* Modules Curriculum Breakdown */}
            <div>
              <h4 className="text-xs font-bold font-code uppercase tracking-wider text-zinc-500 mb-3">
                Curriculum Breakdown
              </h4>
              <div className="space-y-2.5">
                {selectedCourse.modules?.map((mod, idx) => (
                  <div
                    key={mod.id || idx}
                    className="p-3.5 rounded-2xl bg-zinc-50/70 border border-zinc-200/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-code text-[11px] font-bold ${
                        mod.completed
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-zinc-200 text-zinc-600'
                      }`}>
                        {idx + 1}
                      </div>
                      <span className={`font-medium ${mod.completed ? 'text-zinc-800 line-through' : 'text-zinc-900'}`}>
                        {mod.title}
                      </span>
                    </div>

                    <span className={`text-[11px] font-code font-semibold ${
                      mod.completed ? 'text-emerald-600' : 'text-zinc-400'
                    }`}>
                      {mod.completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Socratic Ask */}
            <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                Stuck on a concept in this syllabus?
              </span>
              <button
                onClick={() => onOpenChatbot && onOpenChatbot(`Explain the core principles of ${selectedCourse.title}`, selectedCourse.code)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask EDUX AI about this course &rarr;</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

