import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardOverview from './components/DashboardOverview';
import StudyGroups from './components/StudyGroups';
import PYQPortal from './components/PYQPortal';
import AlumniDirectory from './components/AlumniDirectory';
import AIChatbot from './components/AIChatbot';
import ThreeDViewer from './components/ThreeDViewer';
import CoursesView from './components/CoursesView';
import { api } from './utils/api';
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

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
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
        const [profileRes, coursesRes] = await Promise.all([
          api.getProfile(),
          api.getCourses()
        ]);

        if (profileRes.success && profileRes.data) {
          setUserProfile(profileRes.data);
        }
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

  // Keyboard shortcut ⌘K / Ctrl+K
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

  return (
    <div className="flex min-h-screen bg-[#F6F5F0] text-[#18181B] font-sans antialiased">
      {/* Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userProfile={userProfile}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Navbar */}
        <Navbar
          userProfile={userProfile}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenChatbot={() => setIsFloatingChatOpen(true)}
          activeTab={activeTab}
        />

        {/* Dynamic Main Page Content */}
        <main className="flex-1 px-6 lg:px-10 py-6 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              userProfile={userProfile}
              courses={courses}
              onNavigate={(tab) => setActiveTab(tab)}
              onToggleSubmission={handleToggleSubmission}
              onOpenCourse={() => setActiveTab('courses')}
            />
          )}

          {activeTab === 'courses' && (
            <CoursesView
              courses={courses}
              onUpdateProgress={handleUpdateCourseProgress}
              onOpenChatbot={handleOpenChatWithQuestion}
            />
          )}

          {activeTab === 'studygroups' && (
            <StudyGroups
              activeRoomId={activeRoomId}
              setActiveRoomId={setActiveRoomId}
            />
          )}

          {activeTab === 'pyq' && (
            <PYQPortal
              onOpenChatWithQuestion={handleOpenChatWithQuestion}
            />
          )}

          {activeTab === 'alumni' && (
            <AlumniDirectory />
          )}

          {activeTab === 'chatbot' && (
            <AIChatbot
              initialQuestion={chatbotQuestion}
              initialCourseCode={chatbotCourse}
            />
          )}

          {activeTab === 'threeD' && (
            <ThreeDViewer />
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-3xl p-8 border border-[#E4E4E7] max-w-3xl space-y-6">
              <div className="pb-4 border-b border-zinc-100 flex items-center gap-3">
                <SettingsIcon className="w-5 h-5 text-zinc-700" />
                <h3 className="text-xl font-bold text-zinc-900">
                  Student Settings & University Profile
                </h3>
              </div>

              <div className="flex items-center gap-4">
                <img
                  src={userProfile?.avatar}
                  alt="Anna"
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-500"
                />
                <div>
                  <h4 className="text-base font-bold text-zinc-900">
                    {userProfile?.fullName || 'Anna Sharma'}
                  </h4>
                  <p className="text-xs font-code text-zinc-500">
                    {userProfile?.email} • Student ID: AU2026CSE092
                  </p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-code font-bold">
                    Alliance Active Student
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-code pt-4 border-t border-zinc-100">
                <div className="p-3 bg-zinc-50 rounded-xl">
                  <span className="text-zinc-400 block text-[10px]">Academic Year</span>
                  <span className="font-semibold text-zinc-800">2026 Batch (Sem 5)</span>
                </div>
                <div className="p-3 bg-zinc-50 rounded-xl">
                  <span className="text-zinc-400 block text-[10px]">Current CGPA</span>
                  <span className="font-semibold text-zinc-800">{userProfile?.cgpa || 9.24} / 10.0</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating EDUX AI Modal / Quick Drawer */}
      {isFloatingChatOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:p-6 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full h-[90vh] sm:h-[640px] border border-zinc-200 shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#18181B] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold tracking-tight">
                  EDUX AI • Quick Socratic Assistant
                </span>
              </div>
              <button
                onClick={() => setIsFloatingChatOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Embedded Chatbot Component */}
            <div className="flex-1 overflow-hidden p-2">
              <AIChatbot
                initialQuestion={chatbotQuestion}
                initialCourseCode={chatbotCourse}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
