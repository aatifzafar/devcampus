import { readSaved, writeSaved } from '../utils/session';
// Events, clubs and the certificates students earn from them (sample data).
// Registrations are saved per user in the database (key "alliance-events").

const at = (dayOffset, hour, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
};

export const EVENT_TYPES = ['Hackathon', 'Workshop', 'Fest', 'Talk', 'Competition'];

export const CLUBS = [
  { id: 'coding', name: 'Coding Club', color: '#6D3FC0', members: 412, about: 'Weekly contests, DSA study circles and the annual 24-hour hackathon.', lead: 'Karthik Rao' },
  { id: 'aiml', name: 'AI and ML Club', color: '#0F9D76', members: 286, about: 'Paper reading sessions, Kaggle teams and hands-on model building.', lead: 'Ananya Iyer' },
  { id: 'robotics', name: 'Robotics Club', color: '#D85A30', members: 154, about: 'Build robots, drones and IoT projects; compete in national contests.', lead: 'Pooja Hegde' },
  { id: 'ecell', name: 'Entrepreneurship Cell', color: '#CA8A04', members: 198, about: 'Startup talks, pitch days and mentoring from founders.', lead: 'Siddharth Jain' },
  { id: 'cultural', name: 'Cultural Committee', color: '#DB2777', members: 530, about: 'Music, dance, theatre and the annual fest.', lead: 'Meera Shetty' },
  { id: 'cyber', name: 'Cyber Security Club', color: '#2563EB', members: 143, about: 'Capture-the-flag practice, security talks and bug bounty basics.', lead: 'Kavya Menon' },
];

const ev = (id, title, type, club, start, end, venue, seats, registered, deadline, about, extra = {}) => ({
  id, title, type, club, start, end, venue, seats, registered, deadline, about, certificate: true, ...extra,
});

export const EVENTS = [
  ev('e1', 'HackAlliance 2026: 24-hour hackathon', 'Hackathon', 'coding', at(9, 9), at(10, 9), 'Main auditorium and labs', 300, 238, at(5, 23, 59),
    'Build a working product in 24 hours on themes like campus life, sustainability and fintech. Teams of 2 to 4. Mentors from industry, prizes for the top three teams.',
    { team: { min: 2, max: 4 }, prizes: '₹50,000 total prize pool', featured: true, tags: ['Team event', 'Prizes', 'Food provided'] }),
  ev('e2', 'Hands-on Generative AI workshop', 'Workshop', 'aiml', at(3, 14), at(3, 17), 'Lab 4, Block B', 60, 54, at(2, 18),
    'Build a small chatbot with an LLM API, learn prompt design and retrieval. Bring a laptop.', { tags: ['Bring a laptop', 'Beginner friendly'] }),
  ev('e3', 'Capture the Flag: beginner round', 'Competition', 'cyber', at(6, 10), at(6, 13), 'Online', 150, 88, at(5, 23, 59),
    'Solve security puzzles in web, crypto and forensics. No prior experience needed.', { tags: ['Online', 'Solo'] }),
  ev('e4', 'Founders talk: from campus project to startup', 'Talk', 'ecell', at(4, 16), at(4, 17, 30), 'Seminar hall 2', 200, 120, at(4, 12),
    'Two alumni founders share how they turned college projects into funded startups, followed by Q&A.', { tags: ['Alumni speakers'] }),
  ev('e5', 'Spandana: annual cultural fest', 'Fest', 'cultural', at(16, 10), at(18, 22), 'Campus grounds', 3000, 1840, at(14, 23, 59),
    'Three days of music, dance, theatre, food stalls and a pro-show on the final night.', { tags: ['3 days', 'Pro-show'], featured: false }),
  ev('e6', 'Line-follower robot race', 'Competition', 'robotics', at(12, 10), at(12, 15), 'Robotics lab', 40, 31, at(9, 23, 59),
    'Build and race a line-follower robot. Kits available for first-timers.', { team: { min: 1, max: 3 }, tags: ['Kits provided'] }),
  // Past events (for certificates)
  ev('p1', 'Code Sprint: monthly contest', 'Competition', 'coding', at(-18, 10), at(-18, 13), 'Online', 200, 176, at(-19, 23), 'Two-hour DSA contest.', { result: 'Rank 14 of 176' }),
  ev('p2', 'Git and GitHub workshop', 'Workshop', 'coding', at(-35, 14), at(-35, 17), 'Lab 2', 80, 80, at(-36, 23), 'Version control from scratch.'),
  ev('p3', 'Smart India Hackathon internal round', 'Hackathon', 'ecell', at(-52, 9), at(-51, 9), 'Main auditorium', 250, 212, at(-55, 23), 'Internal selection round for SIH.', { result: 'Finalist' }),
];

export const clubOf = (id) => CLUBS.find((c) => c.id === id) || { name: id, color: '#71717A' };

const KEY = 'alliance-events';
const DEFAULT = { registered: { e2: { id: 'REG-24E2-0381', at: at(-2, 19).toISOString() } }, attended: ['p1', 'p2', 'p3'], clubs: ['coding', 'aiml'] };

export const loadEventState = () => {
  const saved = readSaved(KEY, null);
  return saved ? { ...DEFAULT, ...saved } : DEFAULT;
};
export const saveEventState = (s) => {
  writeSaved(KEY, s);
};

// Certificates from events the student attended. Used by Achievements and the resume.
export const eventCertificates = () =>
  loadEventState()
    .attended.map((id) => EVENTS.find((e) => e.id === id))
    .filter((e) => e && e.certificate && e.end < new Date())
    .map((e) => ({
      title: e.title,
      by: `${clubOf(e.club).name}, Alliance University`,
      year: e.start.getFullYear(),
      score: e.result || 'Participation',
      eventId: e.id,
      date: e.end,
      type: e.type,
    }));

// Registered upcoming events, for the Planner calendar.
export const registeredEvents = () => {
  const s = loadEventState();
  return EVENTS.filter((e) => s.registered[e.id] && e.end > new Date());
};
