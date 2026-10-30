import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Users2,
  FileQuestion,
  GraduationCap,
  BotMessageSquare,
  Box,
  Settings,
  HelpCircle,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, userProfile }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'studygroups', label: 'Study Groups', icon: Users2, badge: 'Live' },
    { id: 'pyq', label: 'PYQ Papers', icon: FileQuestion },
    { id: 'alumni', label: 'Alumni Network', icon: GraduationCap },
    { id: 'chatbot', label: 'EDUX AI Tutor', icon: BotMessageSquare, badge: 'AI' },
    { id: 'threeD', label: '3D Lab', icon: Box, badge: 'WebGL' },
  ];

  return (
    <aside className="w-20 md:w-20 lg:w-24 shrink-0 flex flex-col items-center py-6 px-3 bg-white/80 backdrop-blur-md border-r border-[#E4E4E7] min-h-screen select-none transition-all">
      {/* Alliance.ai Brand Mark (Stylized orange floral badge from screenshot) */}
      <div 
        onClick={() => setActiveTab('dashboard')}
        className="mb-8 cursor-pointer group flex flex-col items-center"
        title="Alliance.ai (EDUX 2.0)"
      >
        <div className="w-12 h-12 rounded-2xl bg-[#EA580C] hover:bg-[#C2410C] transition-all flex items-center justify-center text-white shadow-sm shadow-orange-500/20 group-hover:scale-105">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C13.1 2 14 2.9 14 4V8C14 9.1 13.1 10 12 10C10.9 10 10 9.1 10 8V4C10 2.9 10.9 2 12 2Z" />
            <path d="M12 14C13.1 14 14 14.9 14 16V20C14 21.1 13.1 22 12 22C10.9 22 10 21.1 10 20V16C10 14.9 10.9 14 12 14Z" />
            <path d="M22 12C22 13.1 21.1 14 20 14H16C14.9 14 14 13.1 14 12C14 10.9 14.9 10 16 10H20C21.1 10 22 10.9 22 12Z" />
            <path d="M10 12C10 13.1 9.1 14 8 14H4C2.9 14 2 13.1 2 12C2 10.9 2.9 10 4 10H8C9.1 10 10 10.9 10 12Z" />
            <circle cx="12" cy="12" r="2.5" fill="white" />
          </svg>
        </div>
        <span className="text-[10px] font-semibold text-zinc-600 mt-1.5 tracking-tight group-hover:text-zinc-900">
          Alliance
        </span>
      </div>

      {/* Main Navigation Icons */}
      <nav className="flex-1 flex flex-col items-center gap-3 w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative group w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                isActive
                  ? 'bg-[#18181B] text-white shadow-md shadow-zinc-900/15 scale-105'
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/90'
              }`}
              title={item.label}
            >
              <Icon className="w-5 h-5 stroke-[1.8]" />

              {/* Status Badge */}
              {item.badge && !isActive && (
                <span className="absolute -top-1 -right-1 px-1 py-0.2 text-[8px] font-bold font-code bg-indigo-600 text-white rounded-full leading-tight">
                  {item.badge}
                </span>
              )}

              {/* Hover Floating Tooltip */}
              <div className="absolute left-full ml-3 px-2.5 py-1 bg-zinc-900 text-white text-xs font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-50 flex items-center gap-1.5">
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] px-1 py-0.5 bg-zinc-700 rounded text-zinc-200 font-code">
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions & User Avatar */}
      <div className="flex flex-col items-center gap-3 pt-4 border-t border-zinc-200/80 w-full">
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
            activeTab === 'settings'
              ? 'bg-[#18181B] text-white'
              : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
          title="Settings & System"
        >
          <Settings className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* User Avatar Mini Pill */}
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="relative cursor-pointer group mt-1"
          title={`${userProfile?.fullName || 'Anna'} (${userProfile?.program || 'CSE'})`}
        >
          <img
            src={userProfile?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"}
            alt="Anna"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-zinc-300 group-hover:ring-indigo-500 transition-all"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
        </div>
      </div>
    </aside>
  );
}

