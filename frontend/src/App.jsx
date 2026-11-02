import React, { useState, useEffect } from 'react';
import Sidebar, { MobileNav, SectionTabs } from './components/Sidebar';
import { PLACEHOLDERS, sectionOf, setNavRole } from './navigation';
import Login from './components/faculty/Login';
import { FACULTY } from './data/facultyData';
import Navbar from './components/Navbar';
import HomeOverview from './components/HomeOverview';
import StudyGroups from './components/StudyGroups';
import SubjectsView from './components/SubjectsView';
import NotesView from './components/NotesView';
import CourseView from './components/CourseView';
import { Page, PAGES } from './components/pages';
import { AskAlliance } from './components/features/AskAlliance';
import { api } from './utils/api';
import { AUTH_EVENT, SYNC_ERROR, getUser as getSessionUser, loadState, openStream, refreshUser, signOut } from './utils/session';
import { loadStore, resetStore, setCurrentStudent } from './data/store';
import {
  Sparkles,
  X,
  BookOpen,
  Settings as SettingsIcon,
  ShieldCheck,
  Bell,
  Cpu,
  GraduationCap
} from 'lucide-react';

function ComingSoon({ tabId }) {
  const tab = sectionOf(tabId).tabs.find((t) => t.id === tabId);
  return (
    <div className="elastic-card p-10 text-center max-w-2xl mx-auto mt-4">
      <p className="text-zinc-600 mb-2">{PLACEHOLDERS[tabId]}</p>
      <p className="text-sm text-zinc-400">This module is scheduled for the next deployment.</p>
    </div>
  );
}

const roleOf = (u) => (u?.role === 'faculty' || u?.role === 'admin' ? 'faculty' : u ? 'student' : null);

// Shown while the signed-in user's data loads, or if the server can't be reached.
function BootScreen({ error, onRetry, onSignOut }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="elastic-modal p-8 max-w-md w-full text-center">
        <span className="w-12 h-12 rounded-xl bg-[#0077CC] text-white flex items-center justify-center font-bold text-lg mx-auto mb-4 shadow-sm">A</span>
        {error ? (
          <>
            <p className="font-bold text-zinc-900 mb-1 text-base">Failed to synchronize academic state</p>
            <p className="text-sm text-zinc-600 mb-5">{error}</p>
            <div className="flex justify-center gap-2">
              <button onClick={onSignOut} className="elastic-btn-secondary text-sm">Sign out</button>
              <button onClick={onRetry} className="elastic-btn-primary text-sm">Try again</button>
            </div>
          </>
        ) : (
          <p className="text-sm text-zinc-500 font-medium">Synchronizing coursework and class schedules...</p>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(getSessionUser);
  const role = roleOf(user);
  const [ready, setReady] = useState(false);
  const [bootError, setBootError] = useState('');
  const [toast, setToast] = useState('');
  const [activeTab, setActiveTab] = useState(() => (roleOf(getSessionUser()) === 'faculty' ? 'f-home' : 'dashboard'));
  setNavRole(role || 'student');
  setCurrentStudent(user);

  // Load everything for the signed-in user from the backend.
  const boot = async () => {
    setBootError('');
    setReady(false);
    try {
      const fresh = await refreshUser();
      setCurrentStudent(fresh);
      await Promise.all([loadStore(), loadState()]);
      openStream();
      setUser(fresh);
      setReady(true);
    } catch (err) {
      if (err.status !== 401) setBootError(err.message);
    }
  };
  useEffect(() => {
    if (user) boot();
    const onAuth = () => {
      const u = getSessionUser();
      setUser(u);
      if (!u) { resetStore(); setReady(false); }
    };
    const onSyncError = (e) => { setToast(e.detail || 'Could not persist update.'); setTimeout(() => setToast(''), 6000); };
    window.addEventListener(AUTH_EVENT, onAuth);
    window.addEventListener(SYNC_ERROR, onSyncError);
    return () => { window.removeEventListener(AUTH_EVENT, onAuth); window.removeEventListener(SYNC_ERROR, onSyncError); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onSignedIn = (u) => {
    setUser(u);
    setActiveTab(roleOf(u) === 'faculty' ? 'f-home' : 'dashboard');
    boot();
  };
  const handleSignOut = () => {
    signOut();
    resetStore();
    setReady(false);
    setUser(null);
  };
  const [notesSubject, setNotesSubject] = useState(null);
  const [course, setCourse] = useState({ code: null, tab: 'units' });
  const [userProfile, setUserProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Chatbot handoff
  const [chatbotQuestion, setChatbotQuestion] = useState(null);
  const [chatbotCourse, setChatbotCourse] = useState(null);
  const [isFloatingChatOpen, setIsFloatingChatOpen] = useState(false);

  // Study room handoff
  const [activeRoomId, setActiveRoomId] = useState(null);

  // Initial data loading
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const coursesRes = await api.getCourses();
        if (coursesRes.success && coursesRes.data) {
          setCourses(coursesRes.data);
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]');
        searchInput?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers
  const handleToggleSubmission = async (id) => {
    try {
      const res = await api.toggleSubmission(id);
      if (res.success && res.data) {
        setUserProfile(prev => ({
          ...prev,
          upcomingSubmissions: res.data
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCourseProgress = (courseId, delta) => {
    setCourses(prev =>
      prev.map(c => {
        if (c.id === courseId) {
          return { ...c, progress: Math.min(100, c.progress + delta) };
        }
        return c;
      })
    );
  };

  const handleOpenChatWithQuestion = (questionText, courseCode) => {
    setChatbotQuestion(questionText);
    setChatbotCourse(courseCode);
    setActiveTab('chatbot');
  };

  const handleOpenFloatingChat = (questionText, courseCode) => {
    setChatbotQuestion(questionText || null);
    setChatbotCourse(courseCode || null);
    setIsFloatingChatOpen(true);
  };

  if (!user) return <Login onSignedIn={onSignedIn} />;
  if (!ready) return <BootScreen error={bootError} onRetry={boot} onSignOut={handleSignOut} />;
  const profile = role === 'faculty' ? { ...FACULTY, ...user } : user;

  return (
    <div className="flex min-h-screen bg-white text-[#18181B] font-sans antialiased">
      {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userProfile={profile}
          onOpenCourse={(code, tab = 'units') => {
            setCourse({ code, tab });
            setActiveTab('course');
          }}
          openCourseCode={course.code}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {/* Top Header Navbar */}
          <Navbar
            userProfile={profile}
            role={role}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenChatbot={() => setIsFloatingChatOpen(true)}
            activeTab={activeTab}
          />

          {/* Dynamic Main Page Content */}
          <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 pb-28 md:pb-6 max-w-7xl w-full mx-auto">
            {/* Sub-page tabs for the current sidebar section */}
            <SectionTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            {PLACEHOLDERS[activeTab] && !PAGES[activeTab] && <ComingSoon tabId={activeTab} />}

            <Page
              id={activeTab}
              onNavigate={setActiveTab}
              userProfile={profile}
              role={role}
              onSwitchRole={handleSignOut}
              onSignOut={handleSignOut}
              onAskAI={(text) => {
                setChatbotQuestion(text);
                setActiveTab('chatbot');
              }}
              initialPrompt={chatbotQuestion}
              onPromptUsed={() => setChatbotQuestion(null)}
            />

            {activeTab === 'dashboard' && role === 'student' && (
              <HomeOverview userProfile={profile} onNavigate={setActiveTab} />
            )}

            {activeTab === 'courses' && (
              <SubjectsView
                onNavigate={setActiveTab}
                onOpenCourse={(code, tab = 'units') => {
                  setCourse({ code, tab });
                  setActiveTab('course');
                }}
              />
            )}

            {activeTab === 'course' && course.code && (
              <CourseView code={course.code} initialTab={course.tab} onBack={() => setActiveTab('courses')} />
            )}

            {activeTab === 'notes' && (
              <NotesView
                subjectCode={notesSubject}
                setSubjectCode={setNotesSubject}
                onBack={() => setActiveTab('courses')}
              />
            )}

            {activeTab === 'studygroups' && (
              <StudyGroups
                activeRoomId={activeRoomId}
                setActiveRoomId={setActiveRoomId}
              />
            )}
          </main>
        </div>
      {/* Phone bottom navigation */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Floating AI Modal / Quick Drawer */}
      {isFloatingChatOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:p-6 bg-black/40" onClick={() => setIsFloatingChatOpen(false)}>
          <div className="relative max-w-lg w-full h-[90vh] sm:h-[640px]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsFloatingChatOpen(false)}
              className="absolute -top-10 right-0 w-8 h-8 rounded-lg bg-white border border-zinc-200 text-zinc-600 flex items-center justify-center shadow hover:bg-zinc-100 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <AskAlliance compact userProfile={profile} />
          </div>
        </div>
      )}
      {toast && (
        <div role="alert" className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[60] max-w-md w-[calc(100%-2rem)] bg-zinc-900 text-white text-sm rounded-xl px-4 py-3 shadow-lg flex items-start gap-3 border border-zinc-700">
          <span className="flex-1">{toast}</span>
          <button onClick={() => setToast('')} className="text-white/60 hover:text-white" aria-label="Dismiss"><X className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  );
}
