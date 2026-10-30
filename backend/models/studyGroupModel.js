// Study Groups & Peer Collaboration Model for Alliance University
let studyRooms = [
  {
    id: "room_python_sec_j",
    title: "Advanced Python & Distributed Systems - Sec J",
    courseCode: "CSE312",
    courseName: "Advanced Python & Distributed Computing",
    host: "Rahul Sundaram (CSE '25)",
    topic: "Asynchronous I/O with asyncio and Celery task queues",
    activePeersCount: 6,
    maxPeers: 8,
    isLive: true,
    pomodoro: {
      mode: "work", // "work" | "shortBreak" | "longBreak"
      durationMinutes: 25,
      secondsRemaining: 18 * 60 + 34,
      isRunning: true,
      cyclesCompleted: 3
    },
    peers: [
      {
        id: "p1",
        name: "Rahul Sundaram",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
        role: "Host",
        status: "Coding async pipeline",
        micOn: true,
        camOn: true
      },
      {
        id: "p2",
        name: "Anna Sharma (You)",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
        role: "Member",
        status: "Active & Listening",
        micOn: false,
        camOn: true
      },
      {
        id: "p3",
        name: "Priya Krishnamurthy",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
        role: "Member",
        status: "Reviewing event loop slides",
        micOn: false,
        camOn: false
      },
      {
        id: "p4",
        name: "Aditya Hegde",
        avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150",
        role: "Member",
        status: "Debugging thread locks",
        micOn: true,
        camOn: false
      }
    ],
    scratchpad: `# Advanced Python - Section J Study Notes
### Topic: Asynchronous I/O & Event Loops
- **Key Insight**: \`asyncio\` uses cooperative multitasking via a single-threaded event loop.
- **Coroutines**: Must use \`await\` to surrender control back to the loop.
- **CPU-bound vs I/O-bound**:
  - For I/O bound tasks -> \`asyncio\` or threading.
  - For CPU bound heavy computations -> \`multiprocessing\` or ProcessPoolExecutor to bypass GIL.

\`\`\`python
import asyncio

async def fetch_telemetry(sensor_id: int):
    print(f"Polling sensor {sensor_id}...")
    await asyncio.sleep(1.5)  # non-blocking I/O simulation
    return {"sensor": sensor_id, "reading": 98.4}

async def main():
    tasks = [fetch_telemetry(i) for i in range(1, 6)]
    results = await asyncio.gather(*tasks)
    print("All sensor telemetry retrieved:", results)

asyncio.run(main())
\`\`\`
*Next discussion: Celery worker queues and Redis broker connection pool.*`,
    messages: [
      {
        id: "m_1",
        sender: "Rahul Sundaram",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
        time: "5:14 PM",
        text: "Hey everyone! We are diving into asyncio gather vs task groups in Python 3.12."
      },
      {
        id: "m_2",
        sender: "Priya Krishnamurthy",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
        time: "5:16 PM",
        text: "Make sure you check the MSE question from last year on event loop blocking calls."
      },
      {
        id: "m_3",
        sender: "Anna Sharma",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
        time: "5:18 PM",
        text: "I added the working code snippet to our collaborative scratchpad!"
      }
    ]
  },
  {
    id: "room_ds204_design",
    title: "Design Systems & Figma Tokens - DS204",
    courseCode: "DES204",
    courseName: "Design Systems & UI Engineering",
    host: "Tanvi Rao (Des '26)",
    topic: "Building accessible WCAG 2.1 AA token palettes",
    activePeersCount: 4,
    maxPeers: 6,
    isLive: true,
    pomodoro: {
      mode: "work",
      durationMinutes: 25,
      secondsRemaining: 12 * 60 + 10,
      isRunning: true,
      cyclesCompleted: 2
    },
    peers: [
      {
        id: "p20",
        name: "Tanvi Rao",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
        role: "Host",
        status: "Aligning typography scale",
        micOn: true,
        camOn: true
      },
      {
        id: "p21",
        name: "Anna Sharma (You)",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
        role: "Member",
        status: "Critiquing color contrast",
        micOn: false,
        camOn: false
      }
    ],
    scratchpad: `# Design Systems (DS204) - Token Spec
- Primary Action: Deep Indigo \`#4F46E5\`
- Contrast ratio on \`#FFFFFF\`: 7.4:1 (Passes AAA)
- Border hairline: \`#E4E4E7\`
- Typography scale: 12px (caption), 14px (body-sm), 16px (body), 20px (h3), 28px (h2)`,
    messages: [
      {
        id: "m_201",
        sender: "Tanvi Rao",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
        time: "4:40 PM",
        text: "Let's test the contrast ratios for all dark theme tokens before the review tomorrow."
      }
    ]
  },
  {
    id: "room_cs201_leetcode",
    title: "CSE201: Dynamic Programming & Graphs Sprint",
    courseCode: "CSE201",
    courseName: "Data Structures & Algorithms",
    host: "Kunal Jain (CSE '25)",
    topic: "Dijkstra, Bellman-Ford, and 0/1 Knapsack variations",
    activePeersCount: 5,
    maxPeers: 10,
    isLive: false,
    pomodoro: {
      mode: "shortBreak",
      durationMinutes: 5,
      secondsRemaining: 4 * 60 + 15,
      isRunning: false,
      cyclesCompleted: 4
    },
    peers: [],
    scratchpad: `# DP Practice Session
- Problem 1: Subset Sum
- Problem 2: Min Cost to Cut a Stick
- Problem 3: Shortest Path in DAG`,
    messages: []
  }
];

const getAllRooms = () => studyRooms;

const getRoomById = (id) => studyRooms.find((r) => r.id === id);

const createRoom = (roomData) => {
  const newRoom = {
    id: "room_" + Date.now(),
    activePeersCount: 1,
    maxPeers: roomData.maxPeers || 6,
    isLive: true,
    pomodoro: {
      mode: "work",
      durationMinutes: roomData.pomodoroMinutes || 25,
      secondsRemaining: (roomData.pomodoroMinutes || 25) * 60,
      isRunning: false,
      cyclesCompleted: 0
    },
    peers: [
      {
        id: "p_me",
        name: "Anna Sharma (You)",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
        role: "Host",
        status: "Leading discussion",
        micOn: true,
        camOn: true
      }
    ],
    scratchpad: `# ${roomData.title}\nWelcome to our live study room! Write down shared notes, key formulas, or code snippets here.`,
    messages: [
      {
        id: "msg_init_" + Date.now(),
        sender: "Anna Sharma",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
        time: "Just now",
        text: `Room created for ${roomData.courseCode}! Let's focus and get this done.`
      }
    ],
    ...roomData
  };
  studyRooms.unshift(newRoom);
  return newRoom;
};

const updateScratchpad = (roomId, content) => {
  const room = studyRooms.find((r) => r.id === roomId);
  if (room) {
    room.scratchpad = content;
  }
  return room;
};

const postMessage = (roomId, message) => {
  const room = studyRooms.find((r) => r.id === roomId);
  if (room) {
    const newMsg = {
      id: "msg_" + Date.now(),
      sender: "Anna Sharma",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: message
    };
    room.messages.push(newMsg);
    return newMsg;
  }
  return null;
};

const updatePomodoro = (roomId, pomodoroState) => {
  const room = studyRooms.find((r) => r.id === roomId);
  if (room) {
    room.pomodoro = { ...room.pomodoro, ...pomodoroState };
  }
  return room?.pomodoro;
};

module.exports = {
  getAllRooms,
  getRoomById,
  createRoom,
  updateScratchpad,
  postMessage,
  updatePomodoro
};

