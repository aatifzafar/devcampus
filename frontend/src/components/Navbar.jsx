import React, { useState } from 'react';
import {
  Search,
  Bell,
  Flame,
  Award,
  Sparkles,
  Command,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';

export default function Navbar({
  userProfile,
  searchQuery,
  setSearchQuery,
  onOpenChatbot,
  activeTab
}) {
  const [showNotifications, setShowNotifications] = useState(false);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const notifications = [
    { id: 1, title: "Study Group Starting", desc: "Advanced Python Sec-J is live now", time: "5m ago", unread: true },
    { id: 2, title: "PYQ Paper Added", desc: "CSE305 MSE 2024 solutions verified", time: "1h ago", unread: true },
    { id: 3, title: "Mentorship Confirmed", desc: "Rohan Varma accepted coffee chat", time: "3h ago", unread: false },
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-[#F6F5F0]/90 backdrop-blur-md px-6 lg:px-10 py-4 flex items-center justify-between border-b border-[#E4E4E7]/60">
      {/* Left: Section Title or Greeting */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-900 flex items-center gap-2">
          <span>{activeTab === 'dashboard' ? 'Dashboard' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
        </h1>
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-200/60 text-zinc-700 text-xs font-code font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Alliance University
        </div>
      </div>

      {/* Middle: Sleek Search Bar (Matched to screenshot style) */}
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-zinc-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses, PYQs, peers, or alumni..."
            className="w-full bg-[#EAE8E1]/80 hover:bg-[#EAE8E1] focus:bg-white text-zinc-800 text-sm pl-11 pr-12 py-2.5 rounded-full border border-transparent focus:border-zinc-300 focus:outline-none transition-all placeholder:text-zinc-400"
          />
          <kbd className="absolute right-3.5 px-2 py-0.5 text-[10px] font-code text-zinc-400 bg-zinc-200/80 rounded-md">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Side: Streaks, Points, Notifications & User Pill */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Streak Counter */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-100/70 border border-orange-200/60 text-orange-800 text-xs font-medium font-code">
          <Flame className="w-4 h-4 text-orange-600 fill-orange-500" />
          <span>{userProfile?.streakDays || 7}d Streak</span>
        </div>

        {/* XP Points */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs font-code font-medium">
          <Award className="w-3.5 h-3.5 text-indigo-600" />
          <span>{userProfile?.skillRank?.xpPoints || 2450} XP</span>
        </div>

        {/* AI Quick Sparkle Button */}
        <button
          onClick={onOpenChatbot}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#18181B] text-white hover:bg-zinc-800 text-xs font-medium shadow-sm transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Ask EDUX AI</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-10 h-10 rounded-full bg-white border border-[#E4E4E7] flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-all"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-zinc-200 p-4 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <span className="text-sm font-semibold text-zinc-900">Notifications</span>
                <span className="text-xs text-indigo-600 hover:underline cursor-pointer">Mark all read</span>
              </div>
              <div className="mt-2 space-y-2.5">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-xl hover:bg-zinc-50 transition-colors flex gap-3">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-indigo-600 shrink-0"></div>
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-900">{n.title}</h4>
                      <p className="text-[11px] text-zinc-500">{n.desc}</p>
                      <span className="text-[10px] text-zinc-400 font-code">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill (Matched to screenshot style) */}
        <div className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 bg-white border border-[#E4E4E7] rounded-full hover:border-zinc-300 transition-all cursor-pointer">
          <img
            src={userProfile?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"}
            alt="Anna"
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-zinc-900 leading-tight">
              {userProfile?.name || 'Anna'}
            </span>
            <span className="text-[10px] text-zinc-500 font-code leading-tight">
              Student
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400 ml-0.5" />
        </div>
      </div>
    </header>
  );
}

