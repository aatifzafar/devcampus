import React, { useState, useEffect } from 'react';
import {
  Users2,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Send,
  Copy,
  Check,
  FileText,
  Clock,
  Sparkles,
  MessageSquare,
  Flame,
  Volume2,
  VolumeX,
  Share2,
  Radio,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../utils/api';

export default function StudyGroups({ activeRoomId, setActiveRoomId }) {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomForm, setNewRoomForm] = useState({
    title: '',
    courseCode: 'CSE312',
    courseName: 'Advanced Python & Distributed Computing',
    topic: '',
    maxPeers: 8,
    pomodoroMinutes: 25
  });

  // Pomodoro local state synchronized with current room
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState('work'); // 'work' | 'shortBreak' | 'longBreak'

  // Scratchpad state
  const [scratchpadText, setScratchpadText] = useState('');
  const [copiedNotes, setCopiedNotes] = useState(false);
  const [isSavingScratchpad, setIsSavingScratchpad] = useState(false);

  // Chat message state
  const [chatInput, setChatInput] = useState('');
  const [userMic, setUserMic] = useState(true);
  const [userCam, setUserCam] = useState(true);

  // Fetch all rooms
  const loadRooms = async () => {
    try {
      setLoading(true);
      const res = await api.getStudyRooms();
      if (res.success && res.data) {
        setRooms(res.data);
        const selected = res.data.find(r => r.id === activeRoomId) || res.data[0];
        if (selected) {
          setCurrentRoom(selected);
          setScratchpadText(selected.scratchpad || '');
          if (selected.pomodoro) {
            setPomodoroSeconds(selected.pomodoro.secondsRemaining || 25 * 60);
            setIsTimerRunning(selected.pomodoro.isRunning || false);
            setTimerMode(selected.pomodoro.mode || 'work');
          }
        }
      }
    } catch (err) {
      console.error("Failed to load study rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  // Pomodoro countdown timer tick
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && pomodoroSeconds > 0) {
      interval = setInterval(() => {
        setPomodoroSeconds(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            confetti({ particleCount: 50, spread: 70 });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, pomodoroSeconds]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = async () => {
    const nextRunningState = !isTimerRunning;
    setIsTimerRunning(nextRunningState);
    if (currentRoom) {
      await api.updatePomodoro(currentRoom.id, {
        isRunning: nextRunningState,
        secondsRemaining: pomodoroSeconds,
        mode: timerMode
      });
    }
  };

  const resetTimer = (mode = 'work') => {
    const defaultMins = mode === 'work' ? 25 : mode === 'shortBreak' ? 5 : 15;
    setTimerMode(mode);
    setPomodoroSeconds(defaultMins * 60);
    setIsTimerRunning(false);
  };

  const handleSelectRoom = (room) => {
    setCurrentRoom(room);
    setActiveRoomId && setActiveRoomId(room.id);
    setScratchpadText(room.scratchpad || '');
    if (room.pomodoro) {
      setPomodoroSeconds(room.pomodoro.secondsRemaining || 25 * 60);
      setIsTimerRunning(room.pomodoro.isRunning || false);
      setTimerMode(room.pomodoro.mode || 'work');
    }
  };

  const handleSaveScratchpad = async () => {
    if (!currentRoom) return;
    setIsSavingScratchpad(true);
    try {
      await api.updateScratchpad(currentRoom.id, scratchpadText);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsSavingScratchpad(false), 600);
    }
  };

  const handleCopyNotes = async () => {
    try {
      await navigator.clipboard.writeText(scratchpadText);
    } catch {
      // Clipboard API is blocked on plain http (e.g. a phone on the LAN): fall back.
      const t = document.createElement('textarea');
      t.value = scratchpadText;
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      t.remove();
    }
    setCopiedNotes(true);
    setTimeout(() => setCopiedNotes(false), 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentRoom) return;

    try {
      const res = await api.sendRoomMessage(currentRoom.id, chatInput.trim());
      if (res.success && res.data) {
        setCurrentRoom(prev => ({
          ...prev,
          messages: [...(prev.messages || []), res.data]
        }));
        setChatInput('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createRoom(newRoomForm);
      if (res.success && res.data) {
        setRooms(prev => [res.data, ...prev]);
        setCurrentRoom(res.data);
        setShowCreateModal(false);
        confetti({ particleCount: 40 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-editorial text-zinc-900">
              Learn with Friends
            </h2>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-code font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              Live Peer Study
            </span>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            Real-time peer study rooms, synchronized Pomodoro focus cycles, and live collaborative scratchpads.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#18181B] text-white hover:bg-zinc-800 text-xs font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Study Room</span>
        </button>
      </div>

      {/* Main Grid: Room List + Active Room Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Room Directory Cards */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider font-code">
              Active Study Rooms ({rooms.length})
            </span>
          </div>

          <div className="space-y-3">
            {rooms.map((room) => {
              const isSelected = currentRoom?.id === room.id;
              return (
                <div
                  key={room.id}
                  onClick={() => handleSelectRoom(room)}
                  className={`p-4 rounded-3xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-zinc-900 shadow-md ring-1 ring-zinc-900/10'
                      : 'bg-white/70 hover:bg-white border-[#E4E4E7] hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-code font-semibold">
                      {room.courseCode}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-code text-zinc-500">
                      <Users2 className="w-3.5 h-3.5 text-zinc-400" />
                      {room.peers?.length || room.activePeersCount}/{room.maxPeers}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-zinc-900 line-clamp-1">
                    {room.title}
                  </h4>
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-1">
                    {room.topic}
                  </p>

                  <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-zinc-500">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-code">{room.pomodoro?.durationMinutes || 25}m Pomodoro</span>
                    </div>
                    <span className={`font-semibold ${isSelected ? 'text-indigo-600' : 'text-zinc-600'}`}>
                      {isSelected ? 'Currently In' : 'Join room →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Room Workspace */}
        {currentRoom && (
          <div className="lg:col-span-8 space-y-6">
            {/* Room Banner & Pomodoro Controls */}
            <div className="elastic-card p-6 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-zinc-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-code font-semibold text-indigo-600">
                      {currentRoom.courseCode} • {currentRoom.courseName}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 tracking-tight">
                    {currentRoom.title}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Topic: {currentRoom.topic}
                  </p>
                </div>

                {/* Pomodoro Timer Pill Widget */}
                <div className="bg-[#18181B] text-white px-5 py-3 rounded-2xl flex items-center gap-4 shadow-sm self-start md:self-auto">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-code uppercase tracking-wider text-zinc-400">
                      {timerMode === 'work' ? 'Focus Interval' : 'Break Period'}
                    </span>
                    <span className="text-2xl font-bold font-code tracking-tight">
                      {formatTimer(pomodoroSeconds)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 border-l border-zinc-700 pl-3">
                    <button
                      onClick={toggleTimer}
                      className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all"
                      title={isTimerRunning ? 'Pause' : 'Start'}
                    >
                      {isTimerRunning ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                    </button>
                    <button
                      onClick={() => resetTimer(timerMode)}
                      className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-all"
                      title="Reset Timer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Peer Presence Strip */}
              <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-zinc-500 font-code">
                    Peers in Room:
                  </span>
                  <div className="flex items-center -space-x-2">
                    {currentRoom.peers?.map((peer) => (
                      <div
                        key={peer.id}
                        className="relative group cursor-pointer"
                        title={`${peer.name} (${peer.status})`}
                      >
                        <img
                          src={peer.avatar}
                          alt={peer.name}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-white"
                        />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-1 ring-white"></span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* My Audio/Video Quick Toggles */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setUserMic(!userMic)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                      userMic
                        ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                        : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                    }`}
                  >
                    {userMic ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                    <span>{userMic ? 'Mic On' : 'Muted'}</span>
                  </button>

                  <button
                    onClick={() => setUserCam(!userCam)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                      userCam
                        ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                        : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                    }`}
                  >
                    {userCam ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                    <span>{userCam ? 'Cam On' : 'Cam Off'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Split Grid: Collaborative Scratchpad + Live Chat */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Collaborative Scratchpad / Notes */}
              <div className="md:col-span-7 bg-white rounded-3xl p-5 border border-[#E4E4E7] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-zinc-900 tracking-tight">
                      Collaborative Scratchpad
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyNotes}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-xs font-code flex items-center gap-1 transition-all"
                    >
                      {copiedNotes ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedNotes ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={handleSaveScratchpad}
                      className="px-2.5 py-1 rounded-lg bg-[#18181B] hover:bg-zinc-800 text-white text-xs font-code flex items-center gap-1 transition-all"
                    >
                      {isSavingScratchpad ? 'Saving...' : 'Sync Notes'}
                    </button>
                  </div>
                </div>

                <textarea
                  value={scratchpadText}
                  onChange={(e) => setScratchpadText(e.target.value)}
                  placeholder="Type shared study notes, code blocks, or formulas here..."
                  rows={14}
                  className="w-full text-xs font-code text-zinc-800 bg-[#FAF9F6] p-3.5 rounded-2xl border border-zinc-200/80 focus:border-indigo-400 focus:outline-none resize-none leading-relaxed"
                ></textarea>
                <span className="text-[10px] text-zinc-400 font-code mt-2 block text-right">
                  Auto-synced with room peers
                </span>
              </div>

              {/* Room Live Chat Feed */}
              <div className="md:col-span-5 bg-white rounded-3xl p-5 border border-[#E4E4E7] shadow-xs flex flex-col justify-between h-[440px]">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-zinc-700" />
                    <span className="text-xs font-bold text-zinc-900">
                      Room Discussion
                    </span>
                  </div>
                  <span className="text-[10px] font-code text-zinc-400">
                    {currentRoom.messages?.length || 0} messages
                  </span>
                </div>

                {/* Messages scroll feed */}
                <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 text-xs">
                  {currentRoom.messages?.map((msg) => (
                    <div key={msg.id} className="flex gap-2.5 items-start">
                      <img
                        src={msg.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"}
                        alt={msg.sender}
                        className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                      />
                      <div className="flex-1 bg-zinc-50 rounded-2xl p-2.5 border border-zinc-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-zinc-800 text-[11px]">
                            {msg.sender}
                          </span>
                          <span className="text-[9px] font-code text-zinc-400">
                            {msg.time}
                          </span>
                        </div>
                        <p className="text-zinc-600 text-xs leading-relaxed">
                          {msg.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendMessage} className="pt-2 border-t border-zinc-100 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask peer or share link..."
                    className="flex-1 text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-400"
                  />
                  <button
                    type="submit"
                    className="w-9 h-9 rounded-xl bg-[#18181B] hover:bg-zinc-800 text-white flex items-center justify-center transition-all shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-zinc-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="text-lg font-bold text-zinc-900">
                Create Virtual Study Room
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Room Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems Lab Prep"
                  value={newRoomForm.title}
                  onChange={(e) => setNewRoomForm({ ...newRoomForm, title: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Course Code
                  </label>
                  <select
                    value={newRoomForm.courseCode}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, courseCode: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="CSE312">CSE312 (Advanced Python)</option>
                    <option value="CSE201">CSE201 (Data Structures)</option>
                    <option value="CSE305">CSE305 (Operating Systems)</option>
                    <option value="DES204">DES204 (Design Systems)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Max Peers
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={12}
                    value={newRoomForm.maxPeers}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, maxPeers: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Discussion Topic
                </label>
                <input
                  type="text"
                  placeholder="e.g. Solving MSE 2024 Shortest Path questions"
                  value={newRoomForm.topic}
                  onChange={(e) => setNewRoomForm({ ...newRoomForm, topic: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-full border border-zinc-200 text-zinc-600 hover:bg-zinc-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#18181B] text-white hover:bg-zinc-800 font-semibold shadow-sm"
                >
                  Launch Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

