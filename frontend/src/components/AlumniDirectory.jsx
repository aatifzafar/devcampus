import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Briefcase,
  MapPin,
  Calendar,
  Star,
  ExternalLink,
  MessageSquare,
  Coffee,
  CheckCircle2,
  Filter,
  Search,
  Sparkles,
  Clock,
  Video,
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../utils/api';

// Crisp brand icon SVGs
function LinkedInIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c-.95 0-1.72-.78-1.72-1.73s.77-1.73 1.72-1.73 1.73.78 1.73 1.73-.78 1.73-1.73 1.73m1.39 9.74v-8.37H5.07v8.37h2.78z" />
    </svg>
  );
}

function GitHubIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
    </svg>
  );
}

export default function AlumniDirectory() {
  const [alumniList, setAlumniList] = useState([]);
  const [mySessions, setMySessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [mentorshipOnly, setMentorshipOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'mySessions'

  // Booking modal state
  const [bookingModalAlumni, setBookingModalAlumni] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [studentNote, setStudentNote] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  const industries = [
    'All',
    'Cloud & Infrastructure',
    'Product Design & UX',
    'Artificial Intelligence & ML',
    'Fintech & Web Architecture',
    'Cybersecurity & DevSecOps'
  ];

  const loadAlumni = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedIndustry !== 'All') params.industry = selectedIndustry;
      if (mentorshipOnly) params.mentorshipOnly = true;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.getAlumni(params);
      if (res.success && res.data) {
        setAlumniList(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMySessions = async () => {
    try {
      const res = await api.getMyMentorshipSessions();
      if (res.success && res.data) {
        setMySessions(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAlumni();
    loadMySessions();
  }, [selectedIndustry, mentorshipOnly, searchQuery]);

  const handleOpenBooking = (alumni) => {
    setBookingModalAlumni(alumni);
    setSelectedTopic(alumni.mentorshipTopics?.[0] || 'General Career Guidance');
    setSelectedSlot(alumni.availableSlots?.[0] || 'Tomorrow 6:00 PM IST');
    setStudentNote('');
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!bookingModalAlumni) return;

    setBookingSubmitting(true);
    try {
      const res = await api.bookMentorship({
        alumniId: bookingModalAlumni.id,
        alumniName: bookingModalAlumni.name,
        topic: selectedTopic,
        dateTime: selectedSlot,
        note: studentNote
      });

      if (res.success && res.data) {
        setMySessions(prev => [res.data, ...prev]);
        setBookingModalAlumni(null);
        confetti({ particleCount: 50, spread: 70 });
        setActiveTab('mySessions');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBookingSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-editorial text-zinc-900">
              Alliance Alumni & Mentorship
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-code font-semibold">
              Global Network
            </span>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            Connect directly with Alliance University alumni at Google, AWS, Atlassian, Razorpay, and CRED for 1-on-1 mentorship.
          </p>
        </div>

        {/* Tab Switcher: Directory vs My Sessions */}
        <div className="flex items-center bg-zinc-100 border border-zinc-300 p-1 rounded-md text-xs font-semibold">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-1.5 rounded-md transition-all cursor-pointer ${activeTab === 'directory'
                ? 'bg-white text-zinc-900 border border-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
              }`}
          >
            Alumni Directory ({alumniList.length})
          </button>
          <button
            onClick={() => setActiveTab('mySessions')}
            className={`px-4 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'mySessions'
                ? 'bg-white text-zinc-900 border border-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
              }`}
          >
            <span>My Sessions</span>
            {mySessions.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#005FB8] text-white text-[10px] flex items-center justify-center font-mono">
                {mySessions.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'directory' && (
        <>
          {/* Filter Bar */}
          <div className="elastic-card p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, company, skill (e.g. Google, Kubernetes, Figma)..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-zinc-300 rounded-md focus:outline-none focus:border-[#005FB8]"
              />
            </div>

            {/* Industry Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
              {industries.slice(0, 4).map((ind) => (
                <button
                  key={ind}
                  onClick={() => setSelectedIndustry(ind)}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all whitespace-nowrap cursor-pointer ${selectedIndustry === ind
                      ? 'bg-zinc-900 text-white font-semibold'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200'
                    }`}
                >
                  {ind}
                </button>
              ))}
            </div>

            {/* Mentorship Toggle */}
            <button
              onClick={() => setMentorshipOnly(!mentorshipOnly)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-mono font-medium flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${mentorshipOnly
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200'
                }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Available for Coffee Chat</span>
            </button>
          </div>

          {/* Alumni Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {alumniList.map((alumnus) => (
              <div
                key={alumnus.id}
                className="elastic-card p-5 hover:border-[#005FB8] transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top: Avatar, Name, Company Badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={alumnus.avatar}
                          alt={alumnus.name}
                          className="w-12 h-12 rounded-md object-cover ring-1 ring-zinc-200"
                        />
                        {alumnus.openForMentorship && (
                          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" title="Open for mentorship"></span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                          {alumnus.name}
                        </h4>
                        <span className="text-[11px] font-mono text-zinc-500 block">
                          Alliance '{alumnus.graduationBatch} • {alumnus.degree}
                        </span>
                      </div>
                    </div>

                    {/* Company Pill */}
                    <span className="px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-800 text-[11px] font-bold font-mono flex items-center gap-1">
                      {alumnus.company}
                    </span>
                  </div>

                  {/* Role & Location */}
                  <div className="my-2">
                    <p className="text-xs font-semibold text-indigo-700">
                      {alumnus.role}
                    </p>
                    <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-zinc-400" />
                      {alumnus.location}
                    </p>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-zinc-600 line-clamp-2 my-2.5 leading-relaxed">
                    "{alumnus.bio}"
                  </p>

                  {/* Core Skills Chips */}
                  <div className="flex flex-wrap gap-1.5 my-3">
                    {alumnus.skills?.slice(0, 4).map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded-md bg-[#FAF9F6] border border-zinc-200/80 text-[10px] font-code text-zinc-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Actions: Social Profiles + Request Mentorship Button */}
                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* LinkedIn Link */}
                    <a
                      href={alumnus.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-[#0A66C2] flex items-center justify-center transition-all"
                      title="LinkedIn Profile"
                    >
                      <LinkedInIcon className="w-3.5 h-3.5" />
                    </a>

                    {/* GitHub Link */}
                    <a
                      href={alumnus.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 flex items-center justify-center transition-all"
                      title="GitHub Profile"
                    >
                      <GitHubIcon className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {alumnus.openForMentorship ? (
                    <button
                      onClick={() => handleOpenBooking(alumnus)}
                      className="px-3.5 py-1.5 rounded-full bg-[#18181B] hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <Coffee className="w-3 h-3 text-amber-300" />
                      <span>Request Chat</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-code text-zinc-400">
                      Slots filled
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Tab: My Mentorship Sessions */}
      {activeTab === 'mySessions' && (
        <div className="space-y-4">
          <div className="elastic-card p-6">
            <h3 className="text-base font-bold text-zinc-900 mb-4">
              Scheduled Mentorship Sessions ({mySessions.length})
            </h3>

            {mySessions.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-xs font-mono">
                No mentorship sessions scheduled yet. Browse the directory to connect with alumni.
              </div>
            ) : (
              <div className="space-y-3">
                {mySessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-md bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                          {session.status}
                        </span>
                        <span className="text-xs font-bold text-zinc-900">
                          1-on-1 with {session.alumniName}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 font-medium">
                        Topic: {session.topic}
                      </p>
                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        Time: {session.dateTime}
                      </p>
                      {session.note && (
                        <p className="text-[11px] text-zinc-500 italic mt-1 font-sans">
                          "{session.note}"
                        </p>
                      )}
                    </div>

                    <a
                      href={session.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="elastic-btn-primary inline-flex items-center gap-1.5 text-xs font-semibold self-start sm:self-auto"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Google Meet</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mentorship Booking Modal */}
      {bookingModalAlumni && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="elastic-modal p-6 sm:p-7 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2.5">
                <img
                  src={bookingModalAlumni.avatar}
                  alt={bookingModalAlumni.name}
                  className="w-9 h-9 rounded-md object-cover ring-1 ring-zinc-200"
                />
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">
                    Request Chat with {bookingModalAlumni.name}
                  </h3>
                  <span className="text-[11px] text-zinc-500 font-code">
                    {bookingModalAlumni.role} @ {bookingModalAlumni.company}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setBookingModalAlumni(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitBooking} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Select Mentorship Topic
                </label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:border-[#005FB8]"
                >
                  {bookingModalAlumni.mentorshipTopics?.map((topic, i) => (
                    <option key={i} value={topic}>{topic}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Available Time Slots
                </label>
                <div className="space-y-2">
                  {bookingModalAlumni.availableSlots?.map((slot, i) => (
                    <label
                      key={i}
                      className={`flex items-center gap-2 p-2.5 rounded-md border cursor-pointer transition-all ${selectedSlot === slot
                          ? 'border-[#005FB8] bg-blue-50/50 text-[#005FB8] font-medium'
                          : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                        }`}
                    >
                      <input
                        type="radio"
                        name="slot"
                        value={slot}
                        checked={selectedSlot === slot}
                        onChange={() => setSelectedSlot(slot)}
                        className="text-[#005FB8] focus:ring-0"
                      />
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-mono text-xs">{slot}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Personal Note or Specific Questions
                </label>
                <textarea
                  rows={3}
                  value={studentNote}
                  onChange={(e) => setStudentNote(e.target.value)}
                  placeholder="e.g. Hi! I'm preparing for the upcoming Alliance campus placements and would love feedback on my backend portfolio..."
                  className="w-full bg-white border border-zinc-300 rounded-md p-3 text-xs focus:outline-none focus:border-[#005FB8] leading-relaxed"
                ></textarea>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBookingModalAlumni(null)}
                  className="elastic-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingSubmitting}
                  className="elastic-btn-primary inline-flex items-center gap-1.5 text-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{bookingSubmitting ? 'Confirming...' : 'Confirm Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
