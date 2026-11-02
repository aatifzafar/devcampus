import React, { useState } from 'react';
import {
  ArrowRight,
  MoreHorizontal,
  ChevronDown,
  Star,
  Award,
  Check,
  Calendar as CalendarIcon,
  Sparkles,
  BookOpen,
  Users2,
  FileText,
  Clock,
  Layers,
  Code2,
  CheckCircle2,
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DashboardOverview({
  userProfile,
  courses,
  onNavigate,
  onToggleSubmission,
  onOpenCourse
}) {
  const [taskPeriod, setTaskPeriod] = useState('Monthly');
  const [submissionFilter, setSubmissionFilter] = useState('Active');
  const [activeDayIndex, setActiveDayIndex] = useState(4); // Friday selected by default matching screenshot
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(4); // Day 4 circled as in screenshot

  const daysData = userProfile?.taskCompletionWeekly || [
    { day: "Mon", tasks: 12, max: 20 },
    { day: "Tue", tasks: 8, max: 20 },
    { day: "Wed", tasks: 14, max: 20 },
    { day: "Thu", tasks: 10, max: 20 },
    { day: "Fri", tasks: 16, max: 20, active: true },
    { day: "Sat", tasks: 8, max: 20 },
    { day: "Sun", tasks: 12, max: 20 },
    { day: "Mon", tasks: 15, max: 20 },
    { day: "Tue", tasks: 9, max: 20 },
    { day: "Wed", tasks: 17, max: 20 }
  ];

  const submissions = userProfile?.upcomingSubmissions || [];

  const filteredSubmissions = submissions.filter((sub) => {
    if (submissionFilter === 'Active') return !sub.completed;
    if (submissionFilter === 'Completed') return sub.completed;
    return true;
  });

  const handleCheckboxToggle = (id) => {
    onToggleSubmission(id);
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  // January 2026 calendar data (matches screenshot layout)
  // Day 1 starts on Thursday (in Jan 2026)
  // Calendar grid: M T W T F S S
  const calendarDays = [
    { num: null, isCurrentMonth: false },
    { num: null, isCurrentMonth: false },
    { num: null, isCurrentMonth: false },
    { num: 1, isCurrentMonth: true },
    { num: 2, isCurrentMonth: true },
    { num: 3, isCurrentMonth: true },
    { num: 4, isCurrentMonth: true, isHighlighted: true }, // Highlighted as in screenshot
    { num: 5, isCurrentMonth: true },
    { num: 6, isCurrentMonth: true },
    { num: 7, isCurrentMonth: true },
    { num: 8, isCurrentMonth: true },
    { num: 9, isCurrentMonth: true },
    { num: 10, isCurrentMonth: true },
    { num: 11, isCurrentMonth: true, hasEvent: true },
    { num: 12, isCurrentMonth: true },
    { num: 13, isCurrentMonth: true },
    { num: 14, isCurrentMonth: true },
    { num: 15, isCurrentMonth: true, hasEvent: true },
    { num: 16, isCurrentMonth: true },
    { num: 17, isCurrentMonth: true },
    { num: 18, isCurrentMonth: true },
    { num: 19, isCurrentMonth: true },
    { num: 20, isCurrentMonth: true },
    { num: 21, isCurrentMonth: true },
    { num: 22, isCurrentMonth: true },
    { num: 23, isCurrentMonth: true },
    { num: 24, isCurrentMonth: true },
    { num: 25, isCurrentMonth: true },
    { num: 26, isCurrentMonth: true },
    { num: 27, isCurrentMonth: true },
    { num: 28, isCurrentMonth: true },
    { num: 29, isCurrentMonth: true },
    { num: 30, isCurrentMonth: true },
    { num: 31, isCurrentMonth: true }
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Editorial Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <h2 className="text-3xl lg:text-4xl font-editorial text-zinc-900 tracking-tight">
            Good evening, {userProfile?.name || 'Anna'}
          </h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Track your semester progress, study sessions, and university submissions.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-code text-zinc-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Alliance Academic Cloud: Synchronized
        </div>
      </div>

      {/* TOP ROW: Dark Welcome Hero + Course Cards Bento Grid (Matched to screenshot) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        {/* Welcome back hero card */}
        <div className="xl:col-span-5 bg-[#18181B] text-white rounded-3xl p-6 lg:p-7 flex flex-col justify-between relative overflow-hidden shadow-sm">
          {/* Subtle decorative background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-[11px] font-code font-medium mb-3">
              EDUX 2.0 • Sem 5
            </span>
            <h3 className="text-2xl font-bold tracking-tight text-white mb-2">
              Welcome back, {userProfile?.name || 'Anna'}
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
              Your progress this week is awesome! Lets keep it up and get a lot of points reward!
            </p>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => onNavigate('studygroups')}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white text-zinc-900 font-semibold text-xs hover:bg-zinc-100 transition-all group shadow-sm"
            >
              <span>Join now</span>
              <div className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>

            <button
              onClick={() => onNavigate('courses')}
              className="px-4 py-2.5 rounded-full bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-all"
            >
              View Syllabus
            </button>
          </div>
        </div>

        {/* 3 Quick Active Course Cards (Matched to screenshot) */}
        <div className="xl:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {courses?.slice(0, 3).map((course, idx) => (
            <div
              key={course.id || idx}
              onClick={() => onOpenCourse && onOpenCourse(course)}
              className="bg-white/75 backdrop-blur-xl rounded-3xl p-5 border border-white/70 flex flex-col justify-between hover:border-white/90 hover:bg-white/85 hover:shadow-[0_12px_36px_rgb(0,0,0,0.08)] transition-all cursor-pointer group shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              {/* Header: Icon badge & 3-dot menu */}
              <div className="flex items-center justify-between">
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105"
                  style={{ backgroundColor: course.bgTint || '#FEF9C3' }}
                >
                  {idx === 0 && <span className="text-base">🎨</span>}
                  {idx === 1 && <span className="text-base">💻</span>}
                  {idx === 2 && <span className="text-base">🔬</span>}
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); }} 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Title */}
              <div className="my-4">
                <span className="text-[10px] font-code text-zinc-400 uppercase tracking-wider block mb-1">
                  {course.code}
                </span>
                <h4 className="text-sm font-bold text-zinc-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                  {course.title}
                </h4>
              </div>

              {/* Progress & Lessons Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-code text-zinc-500">
                  <span>Progress</span>
                  <span className="font-semibold text-zinc-800">{course.progress}%</span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${course.progress}%`,
                      backgroundColor: course.color || '#4F46E5'
                    }}
                  ></div>
                </div>
                <div className="text-[11px] text-zinc-400 font-code pt-1 flex items-center justify-between">
                  <span>Lessons</span>
                  <span className="text-zinc-600 font-medium">{course.lessonsCount} lessons</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECOND ROW: Bento Middle (Task completed + Skill rank) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Task completed (Soft peach/coral card matching screenshot) */}
        <div className="lg:col-span-8 bg-[#FFEADB]/75 backdrop-blur-xl rounded-3xl p-6 lg:p-7 border border-white/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between relative">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-zinc-900 tracking-tight">
              Task completed
            </h3>
            <div className="relative">
              <select
                value={taskPeriod}
                onChange={(e) => setTaskPeriod(e.target.value)}
                className="appearance-none bg-white/70 hover:bg-white text-zinc-700 text-xs font-semibold pl-3 pr-7 py-1.5 rounded-full border border-zinc-200/60 focus:outline-none cursor-pointer"
              >
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Semester">Semester</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Bar Chart matching screenshot aesthetic */}
          <div className="relative pt-8 pb-2">
            <div className="grid grid-cols-10 gap-2 sm:gap-3 items-end h-36">
              {daysData.map((item, index) => {
                const heightPercent = Math.round((item.tasks / 20) * 100);
                const isSelected = activeDayIndex === index;

                return (
                  <div
                    key={index}
                    onClick={() => setActiveDayIndex(index)}
                    className="flex flex-col items-center h-full justify-end cursor-pointer group relative"
                  >
                    {/* Active Tooltip Bubble (Matched to Friday 16 tasks pill in screenshot) */}
                    {isSelected && (
                      <div className="absolute -top-7 px-2.5 py-1 bg-[#18181B] text-white text-[10px] font-code font-bold rounded-lg shadow-md whitespace-nowrap z-20 flex flex-col items-center">
                        <span>{item.tasks} tasks</span>
                        <div className="w-1.5 h-1.5 bg-[#18181B] rotate-45 -mb-1 mt-0.5"></div>
                      </div>
                    )}

                    {/* Background Bar Track */}
                    <div className="w-full max-w-[28px] h-full bg-white/60 rounded-full flex flex-col justify-end p-0.5 transition-all">
                      {/* Active Colored Fill Bar */}
                      <div
                        className={`w-full rounded-full transition-all duration-300 ${
                          isSelected
                            ? 'bg-[#FF6A3D] shadow-sm'
                            : 'bg-[#FF8865]/80 group-hover:bg-[#FF6A3D]'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      ></div>
                    </div>

                    {/* Day label */}
                    <span className={`text-[10px] font-code mt-2 font-medium ${
                      isSelected ? 'text-zinc-900 font-bold' : 'text-zinc-500'
                    }`}>
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Skill rank (Soft butter yellow card matching screenshot) */}
        <div className="lg:col-span-4 bg-[#FEF7D6]/80 backdrop-blur-xl rounded-3xl p-6 lg:p-7 border border-white/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-zinc-900 tracking-tight">
                Skill rank
              </h3>
              <span className="text-sm font-bold font-code text-zinc-900">
                {userProfile?.skillRank?.current || 10}/{userProfile?.skillRank?.total || 50}
              </span>
            </div>

            {/* Custom Interactive Slider Visual matching screenshot */}
            <div className="my-5 relative">
              <div className="w-full bg-zinc-900/10 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-zinc-900 h-full rounded-full"
                  style={{ width: `${((userProfile?.skillRank?.current || 10) / 50) * 100}%` }}
                ></div>
              </div>
              {/* Play icon indicator marker from screenshot */}
              <div 
                className="w-7 h-7 bg-zinc-900 text-white rounded-full flex items-center justify-center absolute -top-2.5 shadow-md cursor-grab"
                style={{ left: `calc(${((userProfile?.skillRank?.current || 10) / 50) * 100}% - 14px)` }}
              >
                <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-white border-b-[4px] border-b-transparent ml-0.5"></div>
              </div>
            </div>
          </div>

          {/* Sub-cards (Certificates & Achievements matching screenshot) */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-white/95 rounded-2xl p-3.5 border border-zinc-200/50 shadow-xs">
              <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold font-code text-zinc-900">4.380</span>
              </div>
              <span className="text-[11px] text-zinc-500 font-medium block">
                Certificates
              </span>
            </div>

            <div className="bg-white/95 rounded-2xl p-3.5 border border-zinc-200/50 shadow-xs">
              <div className="flex items-center gap-1.5 text-zinc-800 mb-1">
                <Award className="w-4 h-4 text-zinc-700" />
                <span className="text-xs font-bold font-code text-zinc-900">4.380</span>
              </div>
              <span className="text-[11px] text-zinc-500 font-medium block">
                Achievements
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* THIRD ROW: Bento Bottom (Upcoming submission + Calendar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Upcoming submission (Soft periwinkle/blue card matching screenshot) */}
        <div className="lg:col-span-8 bg-[#E9F2FE]/75 backdrop-blur-xl rounded-3xl p-6 lg:p-7 border border-white/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-zinc-900 tracking-tight">
                Upcoming submission
              </h3>
              <div className="relative">
                <select
                  value={submissionFilter}
                  onChange={(e) => setSubmissionFilter(e.target.value)}
                  className="appearance-none bg-white/70 hover:bg-white text-zinc-700 text-xs font-semibold pl-3 pr-7 py-1.5 rounded-full border border-zinc-200/60 focus:outline-none cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="All">All Tasks</option>
                  <option value="Completed">Completed</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Submissions Table matching screenshot headers & style */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200/60 text-zinc-500 font-medium font-code text-[11px]">
                    <th className="pb-3 w-8">
                      <span className="sr-only">Select</span>
                    </th>
                    <th className="pb-3 pr-4 font-semibold">Name</th>
                    <th className="pb-3 pr-4 font-semibold">Role/Course</th>
                    <th className="pb-3 pr-4 font-semibold">Due date</th>
                    <th className="pb-3 pr-2 font-semibold">Difficulty</th>
                    <th className="pb-3 w-8 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/40">
                  {filteredSubmissions.map((item) => (
                    <tr
                      key={item.id}
                      className="group hover:bg-white/40 transition-colors"
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 pr-2">
                        <button
                          onClick={() => handleCheckboxToggle(item.id)}
                          className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                            item.completed
                              ? 'bg-zinc-900 text-white'
                              : 'border border-zinc-300 hover:border-zinc-500 bg-white'
                          }`}
                        >
                          {item.completed && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                      </td>

                      {/* Name */}
                      <td className="py-3.5 pr-4 font-medium text-zinc-900">
                        <span className={item.completed ? 'line-through text-zinc-400' : ''}>
                          {item.name}
                        </span>
                      </td>

                      {/* Subject */}
                      <td className="py-3.5 pr-4 text-zinc-600 font-code text-[11px]">
                        {item.subject}
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 pr-4 text-zinc-600 font-code text-[11px] whitespace-nowrap">
                        {item.dueDate}
                      </td>

                      {/* Difficulty Badge */}
                      <td className="py-3.5 pr-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-code font-semibold ${
                          item.difficulty === 'Beginner'
                            ? 'bg-blue-100 text-blue-800'
                            : item.difficulty === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {item.difficulty}
                          <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                        </span>
                      </td>

                      {/* Action Menu */}
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => handleCheckboxToggle(item.id)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-white/70 ml-auto"
                          title="Toggle status"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Calendar (Soft mint/sage green card matching screenshot) */}
        <div className="lg:col-span-4 bg-[#EBF7EE]/80 backdrop-blur-xl rounded-3xl p-6 lg:p-7 border border-white/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-zinc-900 tracking-tight font-code">
                January 2026
              </h3>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] font-code text-zinc-500">Semester 5</span>
              </div>
            </div>

            {/* Days of week header: M T W T F S S */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <span key={i} className="text-[11px] font-code font-semibold text-zinc-500">
                  {d}
                </span>
              ))}
            </div>

            {/* Calendar Numbers Grid matching screenshot with Day 4 circled */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {calendarDays.map((day, idx) => {
                if (!day.num) {
                  return <div key={idx} className="h-8"></div>;
                }

                const isSelected = selectedCalendarDay === day.num;

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedCalendarDay(day.num)}
                    className={`h-8 w-8 mx-auto flex items-center justify-center rounded-full text-xs font-code transition-all relative ${
                      isSelected
                        ? 'bg-[#18181B] text-white font-bold shadow-sm'
                        : 'text-zinc-700 hover:bg-white/80'
                    }`}
                  >
                    <span>{day.num}</span>

                    {/* Deadline dot */}
                    {day.hasEvent && !isSelected && (
                      <span className="absolute bottom-1 w-1 h-1 bg-emerald-600 rounded-full"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Schedule Preview for Selected Day */}
          <div className="mt-4 pt-3 border-t border-emerald-900/10">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-zinc-800">
                Jan {selectedCalendarDay}: Python Async Session
              </span>
              <button 
                onClick={() => onNavigate('studygroups')}
                className="text-indigo-600 font-code hover:underline"
              >
                Join &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

