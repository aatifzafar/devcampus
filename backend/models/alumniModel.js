// Alumni Directory & Mentorship Model for Alliance University
let alumni = [
  {
    id: "alm_1",
    name: "Rohan Varma",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
    role: "Senior Staff Software Engineer",
    company: "Google",
    companyLogo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg",
    graduationBatch: 2020,
    degree: "B.Tech Computer Science",
    department: "School of Engineering & Technology",
    location: "Bengaluru, India",
    industry: "Cloud & Infrastructure",
    skills: ["Distributed Systems", "Go", "Kubernetes", "System Design", "gRPC"],
    linkedIn: "https://linkedin.com/in/rohanvarma-alliance",
    github: "https://github.com/rohanvarma-eng",
    openForMentorship: true,
    availableSlots: ["Tomorrow 6:00 PM", "Saturday 11:00 AM", "Sunday 4:00 PM"],
    mentorshipTopics: ["System Design & Scale", "Big Tech Interview Prep", "Transitioning to Cloud/Infra"],
    rating: 4.9,
    sessionsConducted: 42,
    bio: "Alliance '20 alumni. Tech lead at Google Cloud working on compute optimization. Passionate about helping Alliance juniors break into Tier-1 product tech."
  },
  {
    id: "alm_2",
    name: "Ananya Deshmukh",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250",
    role: "Lead Product Designer",
    company: "Atlassian",
    companyLogo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jira/jira-original.svg",
    graduationBatch: 2021,
    degree: "B.Des User Experience Design",
    department: "Alliance Design School",
    location: "Bengaluru (Hybrid)",
    industry: "Product Design & UX",
    skills: ["Figma Design Systems", "User Research", "Interaction Design", "Enterprise UX"],
    linkedIn: "https://linkedin.com/in/ananya-deshmukh-ux",
    github: "https://github.com/ananyaux",
    openForMentorship: true,
    availableSlots: ["Friday 5:30 PM", "Saturday 2:00 PM"],
    mentorshipTopics: ["Portfolio / Case Study Review", "Design Systems Thinking", "Hiring Bar at Atlassian"],
    rating: 5.0,
    sessionsConducted: 65,
    bio: "Ex-Swiggy, currently leading collaboration workflows at Atlassian Jira. Always open to review design portfolios and critique user journey maps."
  },
  {
    id: "alm_3",
    name: "Vikramaditya Hegde",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250",
    role: "Senior Machine Learning Engineer",
    company: "Amazon Web Services",
    companyLogo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg",
    graduationBatch: 2019,
    degree: "B.Tech CSE (AI Specialization)",
    department: "School of Engineering & Technology",
    location: "Seattle, WA / Remote",
    industry: "Artificial Intelligence & ML",
    skills: ["PyTorch", "LLM Fine-tuning", "vLLM", "MLOps", "C++"],
    linkedIn: "https://linkedin.com/in/vikram-hegde-ml",
    github: "https://github.com/vikramhegde-ai",
    openForMentorship: true,
    availableSlots: ["Thursday 9:00 PM IST", "Sunday 8:30 AM IST"],
    mentorshipTopics: ["LLM Inference Optimization", "AI Research to Production", "US Tech Relocation"],
    rating: 4.8,
    sessionsConducted: 29,
    bio: "Building large-scale foundational model serving at AWS Bedrock. Published at NeurIPS workshop. Mentoring passionate engineers in generative AI."
  },
  {
    id: "alm_4",
    name: "Sneha Nair",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250",
    role: "Staff Frontend Architect",
    company: "Razorpay",
    companyLogo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
    graduationBatch: 2022,
    degree: "B.Tech Computer Science",
    department: "School of Engineering & Technology",
    location: "Bengaluru, India",
    industry: "Fintech & Web Architecture",
    skills: ["React 19", "Micro-frontends", "Web Performance", "TypeScript", "Next.js"],
    linkedIn: "https://linkedin.com/in/snehanair-dev",
    github: "https://github.com/sneha-codes",
    openForMentorship: true,
    availableSlots: ["Wednesday 7:00 PM", "Saturday 10:00 AM"],
    mentorshipTopics: ["Frontend System Design", "Web Vitals & Performance", "Fintech Tech Stacks"],
    rating: 4.9,
    sessionsConducted: 51,
    bio: "Architecting payment checkout experiences handling 20,000+ RPS at Razorpay. Former GDSC Lead at Alliance University."
  },
  {
    id: "alm_5",
    name: "Karthik Subramanian",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=250",
    role: "Senior Product Manager",
    company: "Microsoft",
    companyLogo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg",
    graduationBatch: 2020,
    degree: "B.Tech + MBA Tech",
    department: "Alliance School of Business & Engineering",
    location: "Hyderabad, India",
    industry: "Product Management",
    skills: ["Product Strategy", "AI Agents", "User Analytics", "GTM Execution", "SQL"],
    linkedIn: "https://linkedin.com/in/karthik-subramanian-pm",
    github: "https://github.com/karthik-pm",
    openForMentorship: false,
    availableSlots: [],
    mentorshipTopics: ["Breaking into PM from Engineering", "PRD Writing", "Metrics & Analytics"],
    rating: 4.7,
    sessionsConducted: 38,
    bio: "Leading Azure AI Copilot agent integrations. Helps students navigate the bridge between engineering depth and customer-focused product leadership."
  },
  {
    id: "alm_6",
    name: "Meera Krishnan",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    role: "Senior Security Engineer",
    company: "CRED",
    companyLogo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg",
    graduationBatch: 2021,
    degree: "B.Tech Cyber Security",
    department: "School of Engineering & Technology",
    location: "Bengaluru, India",
    industry: "Cybersecurity & DevSecOps",
    skills: ["Cloud Security", "Penetration Testing", "Threat Modeling", "Zero Trust", "Rust"],
    linkedIn: "https://linkedin.com/in/meera-krishnan-sec",
    github: "https://github.com/meerak-sec",
    openForMentorship: true,
    availableSlots: ["Tomorrow 8:00 PM", "Sunday 5:00 PM"],
    mentorshipTopics: ["Offensive Security Roadmaps", "Bug Bounty & CTF Strategy", "DevSecOps Pipelines"],
    rating: 5.0,
    sessionsConducted: 33,
    bio: "Defending millions of transactions at CRED. Ranked Top 10 in national CTFs. Active mentor for women in cybersecurity and offensive engineering."
  }
];

let mentorshipBookings = [
  {
    id: "book_sample_1",
    alumniId: "alm_1",
    alumniName: "Rohan Varma",
    studentId: "usr_alex_2026",
    studentName: "Alex Sharma",
    topic: "System Design & Scale",
    dateTime: "Tomorrow, 6:00 PM IST",
    status: "Confirmed",
    meetingLink: "https://meet.google.com/edux-all-2026",
    note: "Looking for feedback on designing a real-time collaborative code editor."
  }
];

const getAllAlumni = (filters = {}) => {
  let list = [...alumni];

  if (filters.industry) {
    list = list.filter((a) => a.industry.toLowerCase().includes(filters.industry.toLowerCase()));
  }
  if (filters.graduationYear) {
    list = list.filter((a) => a.graduationBatch === parseInt(filters.graduationYear, 10));
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.company.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q) ||
        a.skills.some((s) => s.toLowerCase().includes(q))
    );
  }
  if (filters.mentorshipOnly === 'true' || filters.mentorshipOnly === true) {
    list = list.filter((a) => a.openForMentorship);
  }

  return list;
};

const getAlumniById = (id) => alumni.find((a) => a.id === id);

const bookMentorship = (bookingData) => {
  const newBooking = {
    id: "book_" + Date.now(),
    studentId: "usr_alex_2026",
    studentName: "Alex Sharma",
    createdAt: new Date().toISOString(),
    status: "Confirmed",
    meetingLink: "https://meet.google.com/edux-" + Math.random().toString(36).substring(2, 7),
    ...bookingData
  };
  mentorshipBookings.unshift(newBooking);
  return newBooking;
};

const getMentorshipBookings = () => mentorshipBookings;

module.exports = {
  getAllAlumni,
  getAlumniById,
  bookMentorship,
  getMentorshipBookings
};

