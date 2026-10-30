// Course-Grounded Socratic AI Tutor Model (EDUX AI)
let conversationHistories = {};

const universityKnowledgeBase = {
  courses: {
    "CSE201": {
      name: "Data Structures & Algorithms",
      topics: ["Big-O Complexity", "Balanced BSTs & AVL", "Graph Traversals (BFS/DFS)", "Dijkstra & Bellman-Ford", "Dynamic Programming (Knapsack, LCS, LIS)"],
      sampleQuestions: [
        "Explain Bellman-Ford vs Dijkstra algorithm with negative edge weights",
        "How to balance an AVL tree after right-heavy rotation?",
        "Derive the recurrence relation for Longest Increasing Subsequence"
      ]
    },
    "CSE305": {
      name: "Operating Systems & Virtualization",
      topics: ["Process Scheduling (CFS, Round Robin)", "Mutex, Semaphores & Deadlock Banker's Algorithm", "Virtual Memory Page Replacement (FIFO, LRU, OPT)", "File Systems Inodes"],
      sampleQuestions: [
        "How does Demand Paging prevent out-of-memory crashes?",
        "Simulate Banker's algorithm safety test with 3 processes",
        "Explain Belady's anomaly in FIFO page replacement"
      ]
    },
    "DES201": {
      name: "UI/UX Design for Beginner",
      topics: ["Jakob Nielsen Heuristics", "Fitts's Law & Hick's Law", "Design Systems & Token Architecture", "WCAG 2.1 Contrast Ratios"],
      sampleQuestions: [
        "How do design tokens simplify dark mode implementations?",
        "Explain the 10 Usability Heuristics with examples from modern SaaS"
      ]
    },
    "CSE204": {
      name: "Front End Developer for Beginner",
      topics: ["React 19 Hooks", "Fiber Reconciler & Virtual DOM", "Performance Optimization & useMemo/useCallback", "State Architecture"],
      sampleQuestions: [
        "Why does an empty dependency array in useEffect run only once?",
        "How does React Fiber enable prioritized interruptible rendering?"
      ]
    }
  }
};

const getSocraticResponse = (query, courseCode, mode = "socratic") => {
  const normalizedQuery = query.toLowerCase();

  // Mode responses
  if (normalizedQuery.includes("bellman") || (normalizedQuery.includes("dijkstra") && normalizedQuery.includes("negative"))) {
    if (mode === "socratic") {
      return {
        reply: `### Socratic Guided Inquiry: Shortest Path with Negative Edges
**Let's think through this together:**

1. **Greedy Assumption in Dijkstra:**
   * Why does Dijkstra's algorithm immediately finalize the distance to the minimum-distance vertex extracted from the priority queue?
   * *Hint:* If all edge weights are positive (\(w \ge 0\)), could taking *further* hops ever decrease that node's distance?
   
2. **What happens when an edge weight is negative?**
   * Imagine node $A \to B$ has cost 5, and $A \to C \to B$ has costs $10 + (-8) = 2$.
   * If Dijkstra processes $B$ first with cost 5, will it ever revisit $B$ under standard implementations?

3. **How Bellman-Ford Fixes This:**
   * Bellman-Ford relaxes **all** $|V|-1$ edges. Why exactly $|V|-1$ times?
   * *Think about this:* What is the maximum number of edges in a simple path between any two vertices in a graph with $|V|$ vertices?

> **Your Turn:** Can you tell me what happens if Bellman-Ford relaxes edges on the $|V|$-th iteration and a distance still reduces? What does that detect?`,
        hints: [
          "Dijkstra assumes distances are monotonically increasing along paths.",
          "A simple path can have at most |V|-1 edges.",
          "If distances drop on iteration |V|, a negative-weight cycle exists!"
        ],
        codeSnippet: null
      };
    } else {
      return {
        reply: `### Detailed Comparison: Dijkstra vs. Bellman-Ford Algorithm

| Feature | Dijkstra's Algorithm | Bellman-Ford Algorithm |
| :--- | :--- | :--- |
| **Strategy** | Greedy (Min-Priority Queue) | Dynamic Programming (Edge Relaxation) |
| **Negative Edges** | **Fails** / Undefined behavior | **Supported** |
| **Negative Cycle Detection** | Cannot detect | Detects negative weight cycles on $|V|$-th pass |
| **Time Complexity** | $O((V + E) \log V)$ with binary heap | $O(V \cdot E)$ |

#### Bellman-Ford Core Implementation:
\`\`\`python
def bellman_ford(vertices, edges, source):
    # Step 1: Initialize distances
    dist = {v: float('inf') for v in vertices}
    dist[source] = 0

    # Step 2: Relax edges |V| - 1 times
    for _ in range(len(vertices) - 1):
        for u, v, weight in edges:
            if dist[u] != float('inf') and dist[u] + weight < dist[v]:
                dist[v] = dist[u] + weight

    # Step 3: Check for negative-weight cycles on |V|-th pass
    for u, v, weight in edges:
        if dist[u] != float('inf') and dist[u] + weight < dist[v]:
            raise ValueError("Graph contains a negative-weight cycle!")

    return dist
\`\`\`
*Key Takeaway for Alliance Exams:* Use Dijkstra for performance when edge weights are guaranteed non-negative; use Bellman-Ford when negative edges or cycle detection are required.`,
        hints: [],
        codeSnippet: "python"
      };
    }
  }

  if (normalizedQuery.includes("useeffect") || normalizedQuery.includes("dependency") || normalizedQuery.includes("infinite loop")) {
    if (mode === "socratic") {
      return {
        reply: `### Socratic Hint: React \`useEffect\` Dependency Loops
Let's trace how React triggers re-renders:

1. **State Update:** When you call \`setState(newVal)\`, React queues a re-render.
2. **Component Execution:** The component function executes top-to-bottom.
3. **Effect Trigger:** React compares the dependency array \`[dep1, dep2]\` with the previous render using \`Object.is()\`.

*Question for you:*
If you update state inside \`useEffect\` and that state is *also* listed in the dependency array (or if you generate a new object/array reference on each render without \`useMemo\`), what infinite chain occurs?

> **Checkpoint Question:** Are you passing a primitive (like an ID) or an object literal (\`{ id: 1 }\`) into the dependency array? Remember: \`{} !== {}\` in JavaScript!`,
        hints: [
          "Check if your effect sets state that is also included in its dependency array.",
          "Use functional state updater: `setCount(prev => prev + 1)` instead of depending on `count`."
        ]
      };
    } else {
      return {
        reply: `### Solving React \`useEffect\` Infinite Dependency Loops

#### 1. The Common Culprit: Updating state that is in dependencies
\`\`\`jsx
// BAD: Triggers infinite render loop!
const [data, setData] = useState([]);
useEffect(() => {
  fetchUserData().then(res => setData(res));
}, [data]); // 'data' changes -> triggers effect -> calls setData -> changes data...
\`\`\`

#### 2. The Solution:
\`\`\`jsx
// GOOD: Empty dependency array (runs once on mount)
useEffect(() => {
  let isMounted = true;
  fetchUserData().then(res => {
    if (isMounted) setData(res);
  });
  return () => { isMounted = false; };
}, []); // Empty array runs once on mount
\`\`\`

#### 3. Functional state updates to omit dependencies:
\`\`\`jsx
// Instead of [count]:
setCount(prevCount => prevCount + 1);
\`\`\``,
        hints: [],
        codeSnippet: "jsx"
      };
    }
  }

  if (normalizedQuery.includes("page table") || normalizedQuery.includes("virtual memory") || normalizedQuery.includes("tlb")) {
    return {
      reply: `### Virtual Memory & Paging Architecture (CSE305 Syllabus)
In a 32-bit or 64-bit architecture:
- **Virtual Address:** Composed of **Virtual Page Number (VPN)** and **Offset**.
- **Page Table Entry (PTE):** Translates VPN to a Physical Frame Number (PFN) in RAM.
- **Translation Lookaside Buffer (TLB):** A specialized hardware associative cache (MMU) that stores recent VPN-to-PFN mappings.

**Lookup Flow:**
1. CPU generates virtual address.
2. MMU checks TLB:
   - **TLB Hit:** Physical address is formed in $\approx 1$ CPU cycle.
   - **TLB Miss:** MMU traverses the multi-level page table in RAM (costing 2-4 memory cycles), loads entry into TLB, then accesses data.

*Would you like to solve an Alliance University MSE numerical calculating the Effective Memory Access Time (EMAT)?*`,
      hints: ["EMAT formula: EMAT = (Hit Ratio * (TLB_access + RAM_access)) + ((1 - Hit Ratio) * (TLB_access + 2 * RAM_access))"]
    };
  }

  // General course-grounded fallback
  return {
    reply: `### EDUX AI Socratic Tutor (${courseCode || "General Academic Support"})
I'm grounded in the official Alliance University syllabus and exam question patterns.

Regarding your query: **"${query}"**

${mode === "socratic" 
  ? `Here is how we can break this down:
1. **Core Concept:** What fundamental principle does this problem relate to in your course modules?
2. **Initial Hypothesis:** What approach would you consider trying first?
3. **Edge Cases:** What happens at the boundaries or base cases?

Tell me your line of reasoning so I can guide you through the next step!`
  : `Here is a structured explanation:
- **Overview:** Addressing the key requirements of your question with practical applications.
- **Alliance University Exam Tip:** Focus on clear step-by-step mathematical reasoning or modular software architecture.
- **Next Steps:** Would you like to review a past university PYQ related to this concept?`
}`,
    hints: [
      "You can toggle between Socratic Hint Mode and Direct Solution Mode anytime.",
      "Ask for a code example, proof, or PYQ problem breakdown."
    ]
  };
};

module.exports = {
  universityKnowledgeBase,
  getSocraticResponse
};

