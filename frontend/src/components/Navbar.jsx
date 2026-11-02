import { titleFor } from '../navigation';
import React, { useState } from 'react';
import {
  Search,
  Bell,
  Flame,
  Award,
  Sparkles,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';

export default function Navbar({
  userProfile,
  searchQuery,
  setSearchQuery,
  onOpenChatbot,
  activeTab,
  role = 'student'
}) {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: "Study Group Starting", desc: "Advanced Python Sec-J is active now", time: "5m ago", unread: true },
    { id: 2, title: "PYQ Paper Added", desc: "CSE305 MSE verified solutions indexed", time: "1h ago", unread: true },
    { id: 3, title: "Mentorship Confirmed", desc: "Rohan Varma accepted coffee chat", time: "3h ago", unread: false },
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-zinc-200 px-6 lg:px-10 py-3.5 flex items-center justify-between shadow-xs">
      {/* Left: Section Title or Greeting */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
          <span>{titleFor(activeTab)}</span>
        </h1>
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#EFF6FF] border border-[#BAE6FD] text-[#0077CC] text-xs font-mono font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0077CC]"></span>
          Alliance University
        </div>
      </div>

      {/* Middle: Sleek Search Bar (Elastic Enterprise style) */}
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses, curriculum, PYQ papers, or peers..."
            className="w-full bg-[#F8FAFC] hover:bg-white focus:bg-white text-zinc-800 text-sm pl-10 pr-12 py-2 rounded-lg border border-zinc-200 focus:border-[#0077CC] focus:ring-2 focus:ring-[#0077CC]/15 focus:outline-none transition-all placeholder:text-zinc-400"
          />
          <kbd className="absolute right-2.5 px-2 py-0.5 text-[10px] font-mono text-zinc-500 bg-zinc-200/70 rounded">
            Ctrl+K
          </kbd>
        </div>
      </div>

      {/* Right Side: Telemetry, AI Action & Profile */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Streak Counter */}
        {role !== 'faculty' && (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono font-medium">
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>{userProfile?.streakDays || 7}d Streak</span>
          </div>
        )}

        {/* XP Points */}
        {role !== 'faculty' && (
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-900 text-xs font-mono font-medium">
            <Award className="w-3.5 h-3.5 text-[#0077CC]" />
            <span>{userProfile?.skillRank?.xpPoints || 2450} XP</span>
          </div>
        )}

        {/* AI Quick Sparkle Button (Elastic Blue CTA) */}
        <button
          onClick={onOpenChatbot}
          className="elastic-btn-primary flex items-center gap-1.5 text-xs font-semibold py-2 px-3.5 shadow-sm cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ask Alliance AI</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-9 h-9 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 flex items-center justify-center text-zinc-600 hover:text-zinc-900 transition-all cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full"></span>
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-zinc-200 p-4 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <span className="text-sm font-bold text-zinc-900">Notifications</span>
                <span className="text-xs text-[#0077CC] hover:underline cursor-pointer">Mark all read</span>
              </div>
              <div className="mt-2 space-y-2.5">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-lg hover:bg-zinc-50 transition-colors flex gap-3">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-[#0077CC] shrink-0"></div>
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-900">{n.title}</h4>
                      <p className="text-[11px] text-zinc-500">{n.desc}</p>
                      <span className="text-[10px] text-zinc-400 font-mono">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2 pl-1 pr-2.5 py-1 bg-white border border-zinc-200 rounded-lg hover:border-zinc-300 transition-all cursor-pointer">
          {role === 'faculty' ? (
            <span className="w-7 h-7 rounded bg-[#EFF6FF] text-[#0077CC] text-xs font-bold flex items-center justify-center">DP</span>
          ) : userProfile?.avatar ? (
            <img src={userProfile.avatar} alt="" className="w-7 h-7 rounded object-cover" />
          ) : (
            <span className="w-7 h-7 rounded bg-[#EFF6FF] text-[#0077CC] text-xs font-bold flex items-center justify-center">
              {(userProfile?.fullName || 'S').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
            </span>
          )}
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-zinc-900 leading-tight">
              {userProfile?.name || 'Student'}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono leading-tight">
              {role === 'faculty' ? 'Faculty' : 'Student'}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400 ml-0.5" />
        </div>
      </div>
    </header>
  );
}
