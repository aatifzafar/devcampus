// PYQ (Previous Year Question Papers) Model for Alliance University
let pyqPapers = [
  {
    id: "pyq_dsa_2024_ese",
    courseCode: "CSE201",
    courseTitle: "Data Structures & Algorithms",
    department: "Computer Science & Engineering",
    semester: "Semester 3",
    examType: "ESE", // End-Semester Exam
    academicYear: "2023-2024",
    term: "Autumn 2024",
    date: "14 Dec 2024",
    duration: "3 Hours",
    maxMarks: 100,
    downloads: 1420,
    difficulty: "Medium",
    rating: 4.8,
    fileSize: "1.4 MB",
    pdfUrl: "/mock-papers/CSE201_ESE_2024.pdf",
    instructions: [
      "Answer any FIVE full questions choosing at least ONE from each Module.",
      "Draw neat labeled diagrams wherever necessary.",
      "Use of non-programmable scientific calculator is permitted."
    ],
    sections: [
      {
        sectionName: "Part A (Compulsory Core - 20 Marks)",
        questions: [
          {
            qNo: "1(a)",
            marks: 4,
            text: "Differentiate between Big-O, Big-Omega, and Big-Theta asymptotic notations with graphical sketches.",
            topic: "Asymptotic Analysis",
            aiHint: "Recall that Big-O gives the asymptotic upper bound, Omega gives the lower bound, and Theta gives the tight bound between constant multiples."
          },
          {
            qNo: "1(b)",
            marks: 4,
            text: "Explain how collision resolution is performed in Open Addressing using Quadratic Probing. Give the formula.",
            topic: "Hashing",
            aiHint: "Hash index formula: h(k, i) = (h'(k) + c1*i + c2*i^2) mod m."
          },
          {
            qNo: "1(c)",
            marks: 4,
            text: "State the conditions required for an AVL tree to remain balanced. Define the Balance Factor.",
            topic: "Self-Balancing Trees",
            aiHint: "BF = height(left subtree) - height(right subtree). Allowed balance factors are -1, 0, +1."
          },
          {
            qNo: "1(d)",
            marks: 4,
            text: "Show why Breadth First Search (BFS) on an unweighted graph computes the shortest path distances from a source vertex.",
            topic: "Graph Theory",
            aiHint: "BFS discovers nodes level-by-level using a FIFO queue, guaranteeing distance d is visited before d+1."
          },
          {
            qNo: "1(e)",
            marks: 4,
            text: "Compare 0/1 Knapsack with Fractional Knapsack in terms of optimal substructure and greedy choice property.",
            topic: "Dynamic Programming & Greedy",
            aiHint: "Fractional Knapsack exhibits the greedy choice property (sort by v_i/w_i); 0/1 Knapsack fails greedy choice and requires dynamic programming."
          }
        ]
      },
      {
        sectionName: "Part B (Analytical & Algorithmic Design - 40 Marks)",
        questions: [
          {
            qNo: "2(a)",
            marks: 10,
            text: "Trace Dijkstra's Algorithm on a directed graph with 6 vertices: V={A, B, C, D, E, F} starting from vertex A. Maintain the priority queue states and distance array after each extraction.",
            topic: "Shortest Path",
            aiHint: "Always extract vertex u with min dist[u], then relax edges (u, v) where dist[v] > dist[u] + w(u,v)."
          },
          {
            qNo: "2(b)",
            marks: 10,
            text: "Design an optimal dynamic programming algorithm for the Longest Common Subsequence (LCS) problem for strings X = 'ALLIANCE' and Y = 'ADVANCED'. Draw the 2D DP table and trace the backtrack path.",
            topic: "Dynamic Programming",
            aiHint: "Table dimensions (|X|+1) x (|Y|+1). If X[i] == Y[j], dp[i][j] = 1 + dp[i-1][j-1]; else max(dp[i-1][j], dp[i][j-1])."
          }
        ]
      },
      {
        sectionName: "Part C (System Implementation & Case Studies - 40 Marks)",
        questions: [
          {
            qNo: "3",
            marks: 20,
            text: "Alliance University requires an automated course scheduling engine to avoid classroom and faculty time clashes. Model this problem as a Graph Coloring or Maximum Bipartite Matching problem. Formulate the graph representation, write pseudo-code, and analyze its worst-case complexity.",
            topic: "Applied Graph Algorithms",
            aiHint: "Vertices = Course lecture sessions, Edges = Conflict (shared students or teacher). Colors = Available time-slots. Can be tackled using Welsh-Powell heuristic."
          }
        ]
      }
    ]
  },
  {
    id: "pyq_os_2024_mse",
    courseCode: "CSE305",
    courseTitle: "Operating Systems & Virtualization",
    department: "Computer Science & Engineering",
    semester: "Semester 5",
    examType: "MSE", // Mid-Semester Exam
    academicYear: "2024-2025",
    term: "Autumn 2024",
    date: "18 Oct 2024",
    duration: "1.5 Hours",
    maxMarks: 50,
    downloads: 980,
    difficulty: "Medium",
    rating: 4.9,
    fileSize: "950 KB",
    pdfUrl: "/mock-papers/CSE305_MSE_2024.pdf",
    instructions: [
      "Answer all questions from Section A and any two from Section B.",
      "Assume reasonable data wherever necessary."
    ],
    sections: [
      {
        sectionName: "Section A: Short Answer (15 Marks)",
        questions: [
          {
            qNo: "1",
            marks: 5,
            text: "Explain the four necessary conditions for a Deadlock to occur in an operating system.",
            topic: "Deadlocks",
            aiHint: "Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait."
          },
          {
            qNo: "2",
            marks: 5,
            text: "Differentiate between User-level threads and Kernel-level threads in terms of context switching overhead.",
            topic: "Threads",
            aiHint: "User threads don't involve kernel mode transitions, making switching fast; but if one blocks in I/O, the entire process may block."
          },
          {
            qNo: "3",
            marks: 5,
            text: "Explain the role of the Translation Lookaside Buffer (TLB) in virtual memory page address translation.",
            topic: "Memory Management",
            aiHint: "TLB is a fast hardware cache that stores recent virtual-to-physical page mappings, avoiding dual memory lookups."
          }
        ]
      },
      {
        sectionName: "Section B: Analytical Problems (35 Marks)",
        questions: [
          {
            qNo: "4",
            marks: 17.5,
            text: "Consider a paging system with page reference string: 7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1. For a memory with 3 page frames, compute the number of page faults using (i) FIFO, (ii) LRU, (iii) Optimal Page Replacement. Demonstrate Belady's anomaly if applicable.",
            topic: "Page Replacement Algorithms",
            aiHint: "Keep track of frame contents at each time step. Mark faults with an asterisk (*). FIFO suffers from Belady's anomaly, whereas LRU and OPT are stack algorithms."
          },
          {
            qNo: "5",
            marks: 17.5,
            text: "Evaluate the Producer-Consumer problem using Semaphores. Provide C/Pseudocode using wait() and signal() primitives to avoid race conditions and deadlocks with a bounded buffer of size N.",
            topic: "Process Synchronization",
            aiHint: "You need three semaphores: mutex (binary, init 1), empty (counting, init N), full (counting, init 0)."
          }
        ]
      }
    ]
  },
  {
    id: "pyq_uiux_2024_ese",
    courseCode: "DES201",
    courseTitle: "UI/UX Design for Beginner",
    department: "Alliance Design School",
    semester: "Semester 3",
    examType: "ESE",
    academicYear: "2023-2024",
    term: "Spring 2024",
    date: "22 May 2024",
    duration: "2 Hours",
    maxMarks: 50,
    downloads: 1120,
    difficulty: "Easy",
    rating: 4.7,
    fileSize: "1.2 MB",
    pdfUrl: "/mock-papers/DES201_ESE_2024.pdf",
    instructions: [
      "All visual design deliverables must include wireframe sketches and accessibility annotations.",
      "Follow WCAG 2.1 AA standards for contrast."
    ],
    sections: [
      {
        sectionName: "Section A: Design Principles & Heuristics (20 Marks)",
        questions: [
          {
            qNo: "1",
            marks: 10,
            text: "Discuss Jakob Nielsen's 10 Usability Heuristics with real-world examples from modern web platforms.",
            topic: "Heuristic Evaluation",
            aiHint: "Include visibility of system status, match between system and real world, user control & freedom, error prevention."
          },
          {
            qNo: "2",
            marks: 10,
            text: "Explain Fitts's Law and Hick's Law, and how they guide the design of mobile bottom navigation and checkout funnels.",
            topic: "Cognitive Ergonomics",
            aiHint: "Fitts's Law: MT = a + b * log2(2D/W); target size and distance dictate acquisition time. Hick's Law: decision time increases logarithmically with options."
          }
        ]
      },
      {
        sectionName: "Section B: Studio Project Case Study (30 Marks)",
        questions: [
          {
            qNo: "3",
            marks: 30,
            text: "Redesign the campus cafeteria mobile ordering flow for Alliance University students during peak lunch rush. Provide low-fidelity wireframes, information architecture map, and error state handling.",
            topic: "Product Design",
            aiHint: "Highlight quick reorder, pickup slot estimation, QR code token generation, and clear dietary filter toggles."
          }
        ]
      }
    ]
  },
  {
    id: "pyq_frontend_2024_mse",
    courseCode: "CSE204",
    courseTitle: "Front End Developer for Beginner",
    department: "Computer Science & Engineering",
    semester: "Semester 4",
    examType: "MSE",
    academicYear: "2024-2025",
    term: "Spring 2024",
    date: "12 Mar 2024",
    duration: "1.5 Hours",
    maxMarks: 50,
    downloads: 870,
    difficulty: "Medium",
    rating: 4.6,
    fileSize: "840 KB",
    pdfUrl: "/mock-papers/CSE204_MSE_2024.pdf",
    instructions: [
      "Write modern idiomatic JavaScript (ES2022+) and React functional components.",
      "Explain the time/memory implications of virtual DOM diffing."
    ],
    sections: [
      {
        sectionName: "Section A: Fundamentals & React Core (25 Marks)",
        questions: [
          {
            qNo: "1",
            marks: 12,
            text: "Explain React Reconciliation and the Diffing Algorithm. Why should list keys be stable, unique, and not array indices?",
            topic: "React Internals",
            aiHint: "Keys allow React to identify which items have changed, added, or removed, avoiding unnecessary re-renders."
          },
          {
            qNo: "2",
            marks: 13,
            text: "Write a custom React Hook `useDebounce(value, delay)` that debounces fast-changing search inputs. Provide an example usage.",
            topic: "React Hooks",
            aiHint: "Combine `useState` and `useEffect` with a `setTimeout` and cleanup function `clearTimeout`."
          }
        ]
      },
      {
        sectionName: "Section B: Component Engineering (25 Marks)",
        questions: [
          {
            qNo: "3",
            marks: 25,
            text: "Design a high-performance infinite scrolling grid in React that fetches paginated data from an API and recycles off-screen DOM nodes.",
            topic: "Performance Optimization",
            aiHint: "Use IntersectionObserver API or virtual windowing techniques like react-window."
          }
        ]
      }
    ]
  },
  {
    id: "pyq_ai_2024_ese",
    courseCode: "CSE401",
    courseTitle: "Artificial Intelligence & Neural Architectures",
    department: "School of Engineering & Technology",
    semester: "Semester 7",
    examType: "ESE",
    academicYear: "2023-2024",
    term: "Autumn 2024",
    date: "19 Dec 2024",
    duration: "3 Hours",
    maxMarks: 100,
    downloads: 1680,
    difficulty: "Hard",
    rating: 4.9,
    fileSize: "1.6 MB",
    pdfUrl: "/mock-papers/CSE401_ESE_2024.pdf",
    instructions: [
      "Mathematical derivations must show step-by-step vector calculus equations.",
      "Clear neural layer topology diagrams required."
    ],
    sections: [
      {
        sectionName: "Section A: Search & Heuristics (30 Marks)",
        questions: [
          {
            qNo: "1",
            marks: 15,
            text: "Prove that A* search is optimal if the heuristic function h(n) is admissible and consistent (monotonic).",
            topic: "Heuristic Search",
            aiHint: "Show that for any optimal path, f(n) <= C*, and any suboptimal node cannot be expanded before goal."
          },
          {
            qNo: "2",
            marks: 15,
            text: "Explain Alpha-Beta pruning in Minimax adversarial search. Trace pruning opportunities on a game tree with branching factor 2 and depth 4.",
            topic: "Game Theory",
            aiHint: "Alpha = best score max player can guarantee; Beta = best score min player can guarantee. Prune when alpha >= beta."
          }
        ]
      },
      {
        sectionName: "Section B: Deep Learning & Transformers (70 Marks)",
        questions: [
          {
            qNo: "3",
            marks: 35,
            text: "Derive backpropagation equations for a multi-layer perceptron (MLP) with Cross-Entropy Loss and Softmax activation output layer. Derive dL/dW and dL/dB.",
            topic: "Backpropagation",
            aiHint: "Apply chain rule: dL/dz = y_hat - y, then backpropagate delta to hidden layers through activation derivative."
          },
          {
            qNo: "4",
            marks: 35,
            text: "Explain Multi-Head Self-Attention in the Transformer architecture. Detail the mathematical formula Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) * V and why the scaling factor sqrt(d_k) is critical.",
            topic: "Transformer Attention",
            aiHint: "For large d_k, dot products grow large in magnitude, pushing softmax into regions with tiny gradients (vanishing gradient problem)."
          }
        ]
      }
    ]
  }
];

const getAllPYQs = (filters = {}) => {
  let result = [...pyqPapers];

  if (filters.semester) {
    result = result.filter((p) => p.semester.toLowerCase().includes(filters.semester.toLowerCase()));
  }
  if (filters.examType) {
    result = result.filter((p) => p.examType.toLowerCase() === filters.examType.toLowerCase());
  }
  if (filters.courseCode) {
    result = result.filter((p) => p.courseCode.toLowerCase().includes(filters.courseCode.toLowerCase()));
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.courseTitle.toLowerCase().includes(q) ||
        p.courseCode.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q)
    );
  }

  return result;
};

const getPYQById = (id) => pyqPapers.find((p) => p.id === id);

const recordDownload = (id) => {
  const paper = pyqPapers.find((p) => p.id === id);
  if (paper) {
    paper.downloads += 1;
  }
  return paper;
};

module.exports = {
  getAllPYQs,
  getPYQById,
  recordDownload
};

