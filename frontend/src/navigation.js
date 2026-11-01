import {
  ArrowLeftRight,
  Award,
  BookOpen,
  Box,
  Brain,
  Building2,
  CalendarClock,
  CalendarDays,
  ChartColumn,
  CircleCheck,
  CircleHelp,
  CirclePlay,
  ClipboardCheck,
  ClipboardList,
  CodeXml,
  FileQuestion,
  FileText,
  FileUser,
  FolderKanban,
  Gamepad2,
  GraduationCap,
  HandHeart,
  House,
  Library,
  LifeBuoy,
  ListChecks,
  ListTodo,
  Megaphone,
  MessageSquare,
  MessageSquareText,
  MessagesSquare,
  PartyPopper,
  Pencil,
  Radio,
  Search,
  Settings,
  Smartphone,
  Sparkles,
  Target,
  Ticket,
  TrendingUp,
  UserCheck,
  UserRound,
  Users,
  Video,
} from 'lucide-react';

// Single source of truth for the student navigation.
// Each section is one sidebar item; its `tabs` are the sub-pages shown as
// tabs at the top of that page. The first tab opens when the item is clicked.
// `place` decides where the item sits: main list, or the bottom of the sidebar.
export const SECTIONS = [
  {
    id: 'home',
    label: 'Home',
    icon: House,
    place: 'main',
    tabs: [{ id: 'dashboard', icon: House, label: 'Home' }],
  },
  {
    id: 'subjects',
    label: 'My subjects',
    short: 'Subjects',
    icon: BookOpen,
    place: 'main',
    tabs: [
      { id: 'courses', icon: Library, label: 'All subjects' },
      { id: 'notes', icon: FileText, label: 'Notes' },
      { id: 'assignments', icon: ClipboardList, label: 'Assignments' },
      { id: 'recordings', icon: CirclePlay, label: 'Recordings' },
      { id: 'course', label: 'Course', hidden: true },
    ],
  },
  {
    id: 'tests',
    label: 'Tests',
    icon: ClipboardCheck,
    place: 'main',
    badge: { text: 'Live', tone: 'live' },
    tabs: [
      { id: 'tests-live', icon: Radio, label: 'Live now', live: true },
      { id: 'tests-upcoming', icon: CalendarClock, label: 'Upcoming' },
      { id: 'tests-completed', icon: CircleCheck, label: 'Completed' },
      { id: 'tests-results', icon: ChartColumn, label: 'Results' },
    ],
  },
  {
    id: 'live',
    label: 'Live classes',
    short: 'Live',
    icon: Video,
    place: 'main',
    tabs: [
      { id: 'live-today', icon: Video, label: 'Today' },
    ],
  },
  {
    id: 'practice',
    label: 'Practice',
    icon: CodeXml,
    place: 'main',
    tabs: [
      { id: 'challenges', icon: Target, label: 'Daily challenge' },
      { id: 'coding', icon: CodeXml, label: 'Coding' },
      { id: 'playlearn', icon: Gamepad2, label: 'Play and learn' },
    ],
  },
  {
    id: 'community',
    label: 'Community',
    icon: Users,
    place: 'main',
    badge: { text: '3', tone: 'count' },
    tabs: [
      { id: 'discussions', icon: MessagesSquare, label: 'Discussions' },
      { id: 'projects', icon: FolderKanban, label: 'Projects' },
    ],
  },
  {
    id: 'planner',
    label: 'Planner',
    icon: CalendarDays,
    place: 'main',
    tabs: [
      { id: 'planner-calendar', icon: CalendarDays, label: 'Calendar' },
      { id: 'planner-todos', icon: ListTodo, label: 'My to-dos' },
    ],
  },
  {
    id: 'friends',
    label: 'Learn with friends',
    short: 'Friends',
    icon: HandHeart,
    place: 'featured',
    tabs: [
      { id: 'friends-find', icon: Search, label: 'Find a peer tutor' },
      { id: 'friends-swap', icon: ArrowLeftRight, label: 'Skill swap' },
      { id: 'friends-sessions', icon: CalendarClock, label: 'My sessions' },
      { id: 'friends-teach', icon: Award, label: 'Become a peer tutor' },
      { id: 'studygroups', icon: Users, label: 'Study rooms' },
    ],
  },
  {
    id: 'pyq-papers',
    label: 'PYQ papers',
    short: 'PYQ',
    icon: FileQuestion,
    place: 'featured',
    tabs: [
      { id: 'pyq', icon: FileQuestion, label: 'Question papers' },
      { id: 'pyq-topics', icon: TrendingUp, label: 'Most asked topics' },
    ],
  },
  {
    id: 'alumni-network',
    label: 'Connect with alumni',
    short: 'Alumni',
    icon: GraduationCap,
    place: 'featured',
    tabs: [
      { id: 'alumni', icon: GraduationCap, label: 'Alumni directory' },
      { id: 'alumni-companies', icon: Building2, label: 'Where they work' },
    ],
  },
  {
    id: 'events-clubs',
    label: 'Events and clubs',
    short: 'Events',
    icon: PartyPopper,
    place: 'featured',
    tabs: [
      { id: 'events', icon: PartyPopper, label: 'Upcoming events' },
      { id: 'events-mine', icon: Ticket, label: 'My registrations' },
      { id: 'clubs', icon: Users, label: 'Clubs' },
    ],
  },
  {
    id: 'resume-builder',
    label: 'Resume builder',
    short: 'Resume',
    icon: FileUser,
    place: 'featured',
    tabs: [{ id: 'resume', icon: FileUser, label: 'Resume builder' }],
  },
  {
    id: 'ask-ai',
    label: 'Ask Alliance AI',
    short: 'Ask AI',
    icon: Sparkles,
    place: 'featured',
    tabs: [{ id: 'chatbot', icon: Sparkles, label: 'Ask Alliance AI' }],
  },
  {
    id: 'learn-3d',
    label: '3D learning',
    short: '3D',
    icon: Box,
    place: 'featured',
    tabs: [{ id: 'threeD', icon: Box, label: '3D learning' }],
  },
  {
    id: 'profile',
    label: 'My progress and settings',
    icon: UserRound,
    place: 'bottom',
    tabs: [
      { id: 'progress', icon: TrendingUp, label: 'My progress' },
      { id: 'achievements', icon: Award, label: 'Achievements' },
      { id: 'personality', icon: Brain, label: 'Personality' },
      { id: 'settings', icon: Settings, label: 'Settings' },
    ],
  },
  {
    id: 'help',
    label: "Help and what's new",
    icon: CircleHelp,
    place: 'bottom',
    tabs: [
      { id: 'help', icon: LifeBuoy, label: 'Help center' },
      { id: 'whatsnew', icon: Megaphone, label: "What's new" },
      { id: 'feedback', icon: MessageSquareText, label: 'Give feedback' },
      { id: 'getapp', icon: Smartphone, label: 'Get the app' },
    ],
  },
];


// ------------------------------------------------------------------
// Faculty portal
// ------------------------------------------------------------------
export const FACULTY_SECTIONS = [
  { id: 'fhome', label: 'Home', icon: House, place: 'main', tabs: [{ id: 'f-home', icon: House, label: 'Home' }] },
  {
    id: 'fcourses', label: 'My courses', short: 'Courses', icon: BookOpen, place: 'main',
    tabs: [
      { id: 'f-courses', icon: Library, label: 'All courses' },
      { id: 'f-materials', icon: FileText, label: 'Course materials' },
      { id: 'f-announce', icon: Megaphone, label: 'Announcements' },
      { id: 'f-pyq', icon: FileQuestion, label: 'Question papers' },
    ],
  },
  {
    id: 'fassign', label: 'Assignments', short: 'Assign', icon: ClipboardList, place: 'main',
    tabs: [
      { id: 'f-assign', icon: ClipboardList, label: 'Manage assignments' },
      { id: 'f-grading', icon: Pencil, label: 'Grade submissions' },
    ],
  },
  {
    id: 'ftests', label: 'Tests', icon: ClipboardCheck, place: 'main',
    tabs: [
      { id: 'f-tests', icon: ClipboardCheck, label: 'All tests' },
      { id: 'f-qbank', icon: ListChecks, label: 'Question bank' },
      { id: 'f-monitor', icon: Radio, label: 'Live monitor' },
      { id: 'f-results', icon: ChartColumn, label: 'Results' },
    ],
  },
  {
    id: 'fclasses', label: 'Classes', icon: Video, place: 'main',
    tabs: [
      { id: 'f-classes', icon: Video, label: 'Live class' },
    ],
  },
  {
    id: 'fstudents', label: 'Students', icon: Users, place: 'main',
    tabs: [
      { id: 'f-students', icon: Users, label: 'Student list' },
      { id: 'f-doubts', icon: MessageSquare, label: 'Doubts' },
    ],
  },
  { id: 'freports', label: 'NBA reports', short: 'Reports', icon: Award, place: 'main', tabs: [{ id: 'f-co', icon: Award, label: 'CO attainment' }] },
  { id: 'profile', label: 'Profile and settings', icon: UserRound, place: 'bottom', tabs: [{ id: 'f-profile', icon: UserRound, label: 'My profile' }] },
];

let ROLE = 'student';
export const setNavRole = (r) => {
  ROLE = r === 'faculty' ? 'faculty' : 'student';
};
export const getNavRole = () => ROLE;
export const navSections = () => (ROLE === 'faculty' ? [...FACULTY_SECTIONS, SECTIONS.find((x) => x.id === 'help')] : SECTIONS);

export const sectionOf = (tabId) =>
  navSections().find((s) => s.tabs.some((t) => t.id === tabId)) || navSections()[0];

export const firstTab = (section) => section.tabs[0].id;

export const titleFor = (tabId) => {
  const section = sectionOf(tabId);
  return section.id === 'home' ? 'Home' : section.label;
};

// Sub-pages that are designed but not built yet.
export const PLACEHOLDERS = {
  assignments: 'Every assignment across your subjects, with due dates, what to submit, and your marks once graded.',
  recordings: 'Recordings of past live classes, so you can catch up on anything you missed.',
  'tests-live': 'Tests running right now. Proctored tests start with a quick camera and connection check and a practice question.',
  'tests-upcoming': 'Scheduled tests with date, time, syllabus and duration, so nothing comes as a surprise.',
  'tests-completed': "Tests you've already taken, with your answers saved.",
  'tests-results': 'Scores with an explanation for each question, and the topics worth revising.',
  'live-today': "Today's live classes with a Join button. Polls and surveys pop up during the class.",
  challenges: 'One fresh question a day from your own subjects, with XP for solving it.',
  coding: 'Coding problems with an in-browser editor and instant test results.',
  playlearn: 'Quick quiz games to revise topics with friends.',
  discussions: 'Ask doubts about any subject and get answers from classmates and teachers.',
  projects: 'Your project teams, milestones and submissions.',
  'planner-calendar': 'Classes, tests and deadlines together on one calendar.',
  'planner-todos': 'Your own to-do list, with reminders.',
  progress: 'How you are improving over time, compared with your own past, not with the class.',
  achievements: 'Badges, certificates and streaks you have earned.',
  personality: 'Your personality check-in results, which you can update each semester.',
  help: 'Guides and answers to common questions.',
  whatsnew: 'The latest updates to the platform.',
  feedback: 'Tell your teachers how a course is going, or report a problem with the platform.',
  getapp: 'Get the mobile app for Android and iPhone.',
};
