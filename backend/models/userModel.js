// User Profile & Activity Model for Alliance.ai (EDUX 2.0)
let userProfile = {
  id: "usr_anna_2026",
  name: "PAVAN",
  fullName: "Pavan urs",
  email: "upavan@ced.alliance.edu.in",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
  role: "Student",
  department: "School of Engineering & Technology",
  university: "Alliance University",
  program: "B.Tech Computer Science & Engineering",
  graduationYear: 2026,
  semester: 5,
  cgpa: 9.24,
  streakDays: 7,
  skillRank: {
    current: 10,
    total: 50,
    certificates: 14,
    achievements: 4380,
    xpPoints: 2450
  },
  taskCompletionWeekly: [
    { day: "Mon", tasks: 12, max: 20, active: false },
    { day: "Tue", tasks: 8, max: 20, active: false },
    { day: "Wed", tasks: 14, max: 20, active: false },
    { day: "Thu", tasks: 10, max: 20, active: false },
    { day: "Fri", tasks: 16, max: 20, active: true },
    { day: "Sat", tasks: 8, max: 20, active: false },
    { day: "Sun", tasks: 12, max: 20, active: false },
    { day: "Mon", tasks: 15, max: 20, active: false },
    { day: "Tue", tasks: 9, max: 20, active: false },
    { day: "Wed", tasks: 17, max: 20, active: false }
  ],
  upcomingSubmissions: [
    {
      id: "sub_1",
      name: "Wireframe E-Course Dashboard",
      subject: "UI/UX Designer",
      dueDate: "12 April 2026",
      difficulty: "Beginner",
      completed: true,
      courseCode: "DES204"
    },
    {
      id: "sub_2",
      name: "Travel Booking Flow",
      subject: "Product Designer",
      dueDate: "15 August 2026",
      difficulty: "Medium",
      completed: false,
      courseCode: "DES301"
    },
    {
      id: "sub_3",
      name: "Fitness App Wireframe",
      subject: "UX Researcher",
      dueDate: "27 June 2026",
      difficulty: "Beginner",
      completed: false,
      courseCode: "DES102"
    },
    {
      id: "sub_4",
      name: "E-Learning Mobile UI",
      subject: "UI Designer",
      dueDate: "28 July 2026",
      difficulty: "Medium",
      completed: false,
      courseCode: "DES205"
    },
    {
      id: "sub_5",
      name: "Distributed Memory & MapReduce Lab",
      subject: "Cloud Computing",
      dueDate: "05 November 2026",
      difficulty: "Advanced",
      completed: false,
      courseCode: "CSE308"
    },
    {
      id: "sub_6",
      name: "Alliance AI Hackathon - Final Pitch Deck",
      subject: "Alliance Innovation Hub",
      dueDate: "18 November 2026",
      difficulty: "Medium",
      completed: false,
      courseCode: "INN101"
    }
  ]
};

const getUserProfile = () => userProfile;

const updateUserProfile = (updates) => {
  userProfile = { ...userProfile, ...updates };
  return userProfile;
};

const toggleSubmission = (submissionId) => {
  const item = userProfile.upcomingSubmissions.find((s) => s.id === submissionId);
  if (item) {
    item.completed = !item.completed;
  }
  return userProfile.upcomingSubmissions;
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  toggleSubmission
};

