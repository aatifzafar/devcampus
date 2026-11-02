import React, { useState, useEffect } from 'react';
import { Search, ChevronsLeft, ChevronsRight, ChevronRight, Menu, X } from 'lucide-react';
import { navSections, getNavRole, sectionOf, firstTab } from '../navigation';

const MAIN_ = () => navSections().filter((s) => s.place === 'main');
const FEATURED_ = () => navSections().filter((s) => s.place === 'featured');
const HELP_ = () => navSections().find((s) => s.id === 'help');
const PROFILE_ = () => navSections().find((s) => s.id === 'profile');

const initials = (name = '') =>
  name.replace(/^(Dr|Prof|Mr|Ms|Mrs)\.? /i, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || 'ST';

function Badge({ badge }) {
  if (!badge) return null;
  if (badge.tone === 'live') {
    return (
      <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
        {badge.text}
      </span>
    );
  }
  return (
    <span className="ml-auto min-w-[20px] text-center px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-[11px] font-medium">
      {badge.text}
    </span>
  );
}

export default function Sidebar({ activeTab, setActiveTab, userProfile, onOpenCourse, openCourseCode }) {
  const MAIN = MAIN_();
  const FEATURED = FEATURED_();
  const HELP = HELP_();
  const PROFILE = PROFILE_();
  const faculty = getNavRole() === 'faculty';
  const [collapsed, setCollapsed] = useState(false);
  const current = sectionOf(activeTab).id;
  // Accordion: one section open at a time; follows the page you are on.
  const [openId, setOpenId] = useState(current);
  useEffect(() => {
    setOpenId(current);
  }, [current]);
  const name = userProfile?.fullName || 'Student';

  const focusSearch = () => {
    document.querySelector('input[placeholder*="Search"]')?.focus();
  };

  const itemSize = collapsed ? 'justify-center w-10 h-10 mx-auto' : 'px-3 py-2';

  return (
    <aside
      className={`hidden md:flex shrink-0 flex-col sticky top-0 h-screen bg-white border-r border-zinc-200 z-20 transition-all duration-200 py-4 px-3 ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Brand + collapse */}
      <div className={`flex items-center mb-4 ${collapsed ? 'justify-center' : 'justify-between px-2'}`}>
        <button onClick={() => setActiveTab(getNavRole() === 'faculty' ? 'f-home' : 'dashboard')} className="flex items-center gap-2.5 cursor-pointer" title="Alliance.ai">
          <span className="w-8 h-8 rounded-xl bg-[#0077CC] text-white flex items-center justify-center text-sm font-bold">
            A
          </span>
          {!collapsed && (
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-zinc-900 tracking-tight leading-none">Alliance.ai</span>
              <span className="text-[11px] text-zinc-500 mt-0.5">Academic OS</span>
            </div>
          )}
        </button>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 cursor-pointer"
            aria-label="Collapse sidebar"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="mx-auto mb-3 w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 cursor-pointer"
          aria-label="Expand sidebar"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      )}

      {/* Search Button */}
      {!collapsed ? (
        <button
          onClick={focusSearch}
          className="mx-1 mb-3 flex items-center gap-2 px-3 py-2 rounded-full border border-zinc-200 bg-white text-sm text-zinc-400 hover:border-zinc-300 transition-all cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search modules</span>
          <span className="ml-auto px-2 py-0.5 rounded-full bg-zinc-100 text-[10px] font-medium text-zinc-500">Ctrl+K</span>
        </button>
      ) : (
        <button
          onClick={focusSearch}
          className="mx-auto mb-3 w-10 h-10 rounded-full flex items-center justify-center text-zinc-500 hover:bg-zinc-100 cursor-pointer"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>
      )}

      {/* Main destinations: accordion with sub-pages */}
      <nav className="flex flex-col gap-0.5 overflow-y-auto -mx-1 px-1 min-h-0" aria-label="Main">
        {[...MAIN, ...(FEATURED.length ? ['divider', ...FEATURED] : [])].map((section) => {
          if (section === 'divider') {
            return collapsed ? (
              <div key="divider" className="my-2 mx-2 border-t border-zinc-200" />
            ) : (
              <p key="divider" className="px-3 pt-4 pb-1.5 text-[11px] font-mono uppercase tracking-wider text-zinc-400">Features & Hub</p>
            );
          }
          const Icon = section.icon;
          const active = current === section.id;
          const single = section.tabs.length < 2;
          const open = !collapsed && !single && openId === section.id;

          const onHeader = () => {
            if (collapsed || single) {
              setActiveTab(firstTab(section));
              return;
            }
            setOpenId(open ? null : section.id);
          };

          return (
            <div key={section.id}>
              <button
                onClick={onHeader}
                title={collapsed ? section.label : undefined}
                aria-expanded={single || collapsed ? undefined : open}
                aria-current={active && single ? 'page' : undefined}
                className={`relative w-full flex items-center gap-2.5 rounded-xl text-sm transition-colors cursor-pointer ${itemSize} ${
                  active && (single || collapsed || !open)
                    ? 'bg-[#EFF6FF] text-[#005FA3] font-medium'
                    : active
                      ? 'text-[#005FA3] font-medium hover:bg-zinc-50'
                      : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#0077CC]' : 'text-zinc-500'}`} strokeWidth={1.8} />
                {!collapsed && <span>{section.label}</span>}
                {!collapsed && section.badge && !open && <Badge badge={section.badge} />}
                {!collapsed && !single && (
                  <ChevronRight
                    className={`w-3.5 h-3.5 shrink-0 text-zinc-400 transition-transform duration-200 ${
                      section.badge && !open ? 'ml-1' : 'ml-auto'
                    } ${open ? 'rotate-90' : ''}`}
                  />
                )}
                {collapsed && section.badge?.tone === 'live' && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
                )}
              </button>

              {/* Sub-pages */}
              <div
                className={`grid transition-all duration-200 ease-out ${
                  open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="ml-5 pl-2.5 border-l border-zinc-200 my-1 flex flex-col gap-0.5">
                    {section.tabs.filter((t) => !t.hidden).map((t) => {
                      const SubIcon = t.icon;
                      const on = activeTab === t.id;
                      return (
                        <button
                          key={t.id}
                          tabIndex={open ? 0 : -1}
                          onClick={() => setActiveTab(t.id)}
                          aria-current={on ? 'page' : undefined}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[13px] text-left transition-colors cursor-pointer ${
                            on
                              ? 'bg-[#EFF6FF] text-[#005FA3] font-medium'
                              : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                          }`}
                        >
                          {SubIcon && (
                            <SubIcon
                              className={`w-3.5 h-3.5 shrink-0 ${on ? 'text-[#0077CC]' : 'text-zinc-400'}`}
                              strokeWidth={1.8}
                            />
                          )}
                          <span className="truncate">{t.label}</span>
                          {t.live && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Bottom: help + profile */}
      <div className="mt-auto pt-3 border-t border-zinc-200 flex flex-col gap-1">
        <button
          onClick={() => setActiveTab(firstTab(HELP))}
          title={collapsed ? HELP.label : undefined}
          className={`flex items-center gap-2.5 rounded-xl text-sm text-zinc-600 hover:bg-zinc-50 cursor-pointer ${
            collapsed ? 'justify-center w-10 h-10 mx-auto' : 'px-3 py-2'
          } ${current === 'help' ? 'bg-[#EFF6FF] text-[#0077CC]' : ''}`}
        >
          <HELP.icon className="w-4 h-4 text-zinc-500" strokeWidth={1.8} />
          {!collapsed && <span>{HELP.label}</span>}
        </button>

        <button
          onClick={() => setActiveTab(firstTab(PROFILE))}
          title={collapsed ? name : undefined}
          className={`flex items-center gap-2.5 rounded-2xl hover:border-zinc-300 border border-zinc-200 text-left cursor-pointer p-2 ${
            collapsed ? 'justify-center w-10 h-10 mx-auto' : ''
          } ${current === 'profile' ? 'border-transparent bg-[#EFF6FF]' : ''}`}
        >
          <span className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#005FA3] text-xs font-semibold flex items-center justify-center shrink-0">
            {initials(name)}
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="block text-xs font-semibold text-zinc-900 truncate">{name}</span>
              <span className="block text-[11px] text-zinc-500">{faculty ? 'Faculty Account' : 'Student Verified'}</span>
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}

// Sub-page tabs shown at the top of every page that has more than one.
export function SectionTabs({ activeTab, setActiveTab }) {
  const section = sectionOf(activeTab);
  const tab = section.tabs.find((t) => t.id === activeTab);
  if (section.tabs.length < 2 || tab?.hidden) return null;
  const showTabs = section.place === 'bottom';
  return (
    <div className="mb-6">
      <p className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-1">{section.label}</p>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mb-3">{tab?.label}</h1>
      <div className={`flex gap-1 border-b border-zinc-200 overflow-x-auto ${showTabs ? '' : 'md:hidden'}`} role="tablist">
        {section.tabs.filter((t) => !t.hidden).map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(t.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors cursor-pointer ${
                active
                  ? 'border-[#0077CC] text-[#0077CC] font-semibold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              {t.live && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function MobileNav({ activeTab, setActiveTab }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const current = sectionOf(activeTab).id;
  const primary = navSections().filter((s) => ['home', 'subjects', 'tests', 'practice'].includes(s.id));
  const extra = navSections().filter((s) => !['home', 'subjects', 'tests', 'practice'].includes(s.id));
  const moreActive = extra.some((s) => s.id === current);

  const go = (section) => {
    setActiveTab(firstTab(section));
    setMoreOpen(false);
  };

  return (
    <>
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setMoreOpen(false)}>
          <div
            className="absolute bottom-20 left-3 right-3 bg-white rounded-3xl border border-zinc-200 p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {extra.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => go(section)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-zinc-50 ${
                    current === section.id ? 'text-[#0077CC] font-semibold bg-[#EFF6FF]' : 'text-zinc-800'
                  }`}
                >
                  <Icon className="w-4 h-4 text-zinc-500" strokeWidth={1.8} />
                  <span>{section.label}</span>
                  <Badge badge={section.badge} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-zinc-200 flex px-1 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
        aria-label="Main"
      >
        {primary.map((section) => {
          const Icon = section.icon;
          const active = current === section.id;
          return (
            <button
              key={section.id}
              onClick={() => go(section)}
              className={`relative flex-1 flex flex-col items-center gap-1 text-[11px] ${
                active ? 'text-[#0077CC] font-semibold' : 'text-zinc-500'
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={1.8} />
              {section.short || section.label}
              {section.badge?.tone === 'live' && (
                <span className="absolute top-0 right-[30%] w-1.5 h-1.5 rounded-full bg-rose-500" />
              )}
            </button>
          );
        })}
        <button
          onClick={() => setMoreOpen((o) => !o)}
          className={`flex-1 flex flex-col items-center gap-1 text-[11px] ${
            moreActive || moreOpen ? 'text-[#0077CC] font-semibold' : 'text-zinc-500'
          }`}
        >
          {moreOpen ? <X className="w-4 h-4" strokeWidth={1.8} /> : <Menu className="w-4 h-4" strokeWidth={1.8} />}
          More
        </button>
      </nav>
    </>
  );
}
