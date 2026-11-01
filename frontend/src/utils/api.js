// API client for Alliance.ai (EDUX 2.0)
import { getToken } from './session';

const API_BASE = '/api';

// fetch() that sends the signed-in user's token.
const fetch = (url, opts = {}) => {
  const token = getToken();
  return window.fetch(url, { ...opts, headers: { ...(opts.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
};

export const api = {
  // Auth & Profile
  getProfile: async () => {
    const res = await fetch(`${API_BASE}/auth/profile`);
    return res.json();
  },
  toggleSubmission: async (id) => {
    const res = await fetch(`${API_BASE}/auth/submissions/${id}/toggle`, {
      method: 'PATCH'
    });
    return res.json();
  },

  // Courses
  getCourses: async () => {
    const res = await fetch(`${API_BASE}/courses`);
    return res.json();
  },
  getCourseById: async (id) => {
    const res = await fetch(`${API_BASE}/courses/${id}`);
    return res.json();
  },

  // PYQ Repository
  getPYQs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/pyq${query ? `?${query}` : ''}`);
    return res.json();
  },
  getPYQById: async (id) => {
    const res = await fetch(`${API_BASE}/pyq/${id}`);
    return res.json();
  },
  recordDownload: async (id) => {
    const res = await fetch(`${API_BASE}/pyq/${id}/download`, {
      method: 'POST'
    });
    return res.json();
  },

  // Alumni & Mentorship
  getAlumni: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/alumni${query ? `?${query}` : ''}`);
    return res.json();
  },
  bookMentorship: async (bookingData) => {
    const res = await fetch(`${API_BASE}/alumni/mentorship`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    return res.json();
  },
  getMyMentorshipSessions: async () => {
    const res = await fetch(`${API_BASE}/alumni/mentorship/my-sessions`);
    return res.json();
  },

  // Chatbot Socratic Tutor
  sendChatQuery: async (query, courseCode = 'CSE201', mode = 'socratic') => {
    const res = await fetch(`${API_BASE}/chatbot/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, courseCode, mode })
    });
    return res.json();
  },
  getChatTopics: async () => {
    const res = await fetch(`${API_BASE}/chatbot/topics`);
    return res.json();
  },

  // Study Groups
  getStudyRooms: async () => {
    const res = await fetch(`${API_BASE}/studygroups`);
    return res.json();
  },
  getRoomById: async (id) => {
    const res = await fetch(`${API_BASE}/studygroups/${id}`);
    return res.json();
  },
  createRoom: async (data) => {
    const res = await fetch(`${API_BASE}/studygroups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateScratchpad: async (roomId, content) => {
    const res = await fetch(`${API_BASE}/studygroups/${roomId}/scratchpad`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    return res.json();
  },
  sendRoomMessage: async (roomId, message) => {
    const res = await fetch(`${API_BASE}/studygroups/${roomId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    return res.json();
  },
  updatePomodoro: async (roomId, pomodoroState) => {
    const res = await fetch(`${API_BASE}/studygroups/${roomId}/pomodoro`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pomodoroState)
    });
    return res.json();
  }
};

