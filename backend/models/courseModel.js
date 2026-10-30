// Course Model & Mock Data for Alliance.ai
let courses = [
  {
    id: "crs_uiux",
    code: "DES201",
    title: "UI/UX design for beginner",
    instructor: "Prof. Arvind Rao",
    department: "Alliance Design School",
    progress: 70,
    lessonsCount: 12,
    completedLessons: 8,
    category: "Design",
    color: "#EAB308", // Amber
    bgTint: "#FEF9C3",
    icon: "Layout",
    description: "Foundations of user interface design, user personas, wireframing, and Figma design tokens.",
    currentTopic: "Auto-layout & Responsive Components",
    modules: [
      { id: "m1", title: "Introduction to Design Thinking", completed: true },
      { id: "m2", title: "Information Architecture & User Flows", completed: true },
      { id: "m3", title: "Wireframing & Prototyping in Figma", completed: true },
      { id: "m4", title: "Design Systems & Token Standards", completed: false }
    ]
  },
  {
    id: "crs_frontend",
    code: "CSE204",
    title: "Front End developer for beginner",
    instructor: "Dr. Sandeep Kumar",
    department: "School of Engineering & Technology",
    progress: 45,
    lessonsCount: 16,
    completedLessons: 7,
    category: "Engineering",
    color: "#0D9488", // Teal
    bgTint: "#CCFBF1",
    icon: "Code",
    description: "Modern web frontend with React, component architecture, state management, and modern CSS tooling.",
    currentTopic: "React Hooks, Context & Side Effects",
    modules: [
      { id: "m1", title: "DOM & Modern ES6+ JavaScript", completed: true },
      { id: "m2", title: "React Component Lifecycle & JSX", completed: true },
      { id: "m3", title: "Hooks: useState, useEffect & useRef", completed: false },
      { id: "m4", title: "Client-Side Routing & State Management", completed: false }
    ]
  },
  {
    id: "crs_usability",
    code: "DES304",
    title: "Usability testing for beginner",
    instructor: "Prof. Malini Shenoy",
    department: "Alliance Design School",
    progress: 85,
    lessonsCount: 9,
    completedLessons: 8,
    category: "Research",
    color: "#6366F1", // Indigo
    bgTint: "#E0E7FF",
    icon: "FlaskConical",
    description: "User testing methodologies, heatmaps, cognitive walkthroughs, and quantitative metric analysis.",
    currentTopic: "Synthesizing SUS (System Usability Scale) Scores",
    modules: [
      { id: "m1", title: "Qualitative vs Quantitative Testing", completed: true },
      { id: "m2", title: "Moderated & Unmoderated Session Scripts", completed: true },
      { id: "m3", title: "A/B Testing & Eye Tracking Heatmaps", completed: true },
      { id: "m4", title: "Actionable UX Recommendation Reports", completed: false }
    ]
  },
  {
    id: "crs_dsa",
    code: "CSE201",
    title: "Data Structures & Algorithms",
    instructor: "Dr. Ramesh Babu",
    department: "School of Engineering & Technology",
    progress: 60,
    lessonsCount: 24,
    completedLessons: 14,
    category: "Core Engineering",
    color: "#F97316", // Coral
    bgTint: "#FFEDD5",
    icon: "Binary",
    description: "Asymptotic complexity analysis, trees, graph algorithms, dynamic programming, and greedy heuristics.",
    currentTopic: "Graph Shortest Path Algorithms (Dijkstra & Bellman-Ford)",
    modules: [
      { id: "m1", title: "Time Complexity & Big-O Notation", completed: true },
      { id: "m2", title: "Trees: BST, AVL, & Segment Trees", completed: true },
      { id: "m3", title: "Graph Traversals & Min Spanning Trees", completed: false },
      { id: "m4", title: "Dynamic Programming Memoization", completed: false }
    ]
  },
  {
    id: "crs_os",
    code: "CSE305",
    title: "Operating Systems & Virtualization",
    instructor: "Prof. Geetha V.",
    department: "School of Engineering & Technology",
    progress: 50,
    lessonsCount: 18,
    completedLessons: 9,
    category: "Core Engineering",
    color: "#8B5CF6", // Violet
    bgTint: "#EDE9FE",
    icon: "Cpu",
    description: "Process synchronization, multi-threading, virtual memory paging, deadlock avoidance, and file systems.",
    currentTopic: "Virtual Memory & Demand Paging",
    modules: [
      { id: "m1", title: "Kernel Architectures & System Calls", completed: true },
      { id: "m2", title: "CPU Scheduling & Concurrency", completed: true },
      { id: "m3", title: "Deadlocks & Semaphores", completed: false },
      { id: "m4", title: "Virtual Memory & Page Replacement", completed: false }
    ]
  }
];

const getAllCourses = () => courses;

const getCourseById = (id) => courses.find((c) => c.id === id || c.code.toLowerCase() === id.toLowerCase());

const updateCourseProgress = (id, progressDelta) => {
  const course = courses.find((c) => c.id === id);
  if (course) {
    course.progress = Math.min(100, Math.max(0, course.progress + progressDelta));
  }
  return course;
};

module.exports = {
  getAllCourses,
  getCourseById,
  updateCourseProgress
};

