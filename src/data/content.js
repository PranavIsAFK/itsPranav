// ═══════════════════════════════════════════════════════════════
// PROJECT DOSSIERS  ·  "SIGNAL" transmission archive
// ═══════════════════════════════════════════════════════════════
export const PROJECTS = {
  vision: {
    tag: 'AI · ASSISTIVE TECH',
    title: 'VISION BUDDY',
    subtitle: '“Giving sight through sound.”',
    problem:
      'Hundreds of millions of people live with visual impairment. Everyday tasks the rest of us never think about — reading a label, recognizing a friend, knowing what is directly in front of you, calling for help in an emergency — become real barriers.',
    solution:
      'Vision Buddy turns an ordinary phone camera into a real-time narrator. Point it at anything and it describes the scene out loud, reads text aloud, recognizes familiar faces, and can fire a one-tap emergency SOS — all through a fully voice-driven, hands-free interface.',
    features: [
      'Real-time AI scene description, spoken aloud',
      'Face recognition to identify known people',
      'One-tap emergency SOS for urgent situations',
      'Reads text from labels, signs and documents',
      'Hands-free, voice-first interaction for accessibility',
    ],
    stack: ['AI Vision', 'React', 'TypeScript', 'Web Speech API', 'Lovable'],
    link: 'https://yourvisionbuddy.lovable.app',
    linkLabel: 'LAUNCH PROJECT',
  },
  olab: {
    tag: 'DSA · LOGISTICS',
    title: 'OLAB',
    subtitle: '“Algorithms you can watch think.”',
    problem:
      'Logistics operations leak profit every single day by loading trucks inefficiently — packing too much low-value cargo and leaving high-value freight behind, all under a hard weight limit.',
    solution:
      'OLAB models truck loading as a classic 0/1 Knapsack problem and solves it with dynamic programming to maximize profit per load. The twist: it visualizes the entire DP table filling in cell by cell, so you can literally SEE the optimization reasoning happen instead of trusting a black box.',
    features: [
      '0/1 Knapsack dynamic-programming solver',
      'Live DP table visualization, cell by cell',
      'Maximizes load profit under weight constraints',
      'Step-through tracing of the optimal selection',
      'Turns an abstract algorithm into something visible',
    ],
    stack: ['Knapsack DP', 'JavaScript', 'Dynamic Programming', 'DOM Visualization'],
    link: 'https://github.com/PranavIsAFK/OLAB',
    linkLabel: 'VIEW ON GITHUB',
  },
  promptforge: {
    tag: 'AI · DEV TOOLING',
    title: 'PROMPTFORGE',
    subtitle: '“From idea to build-kit in minutes.”',
    problem:
      "Most people with an app idea stall at step zero. They don't know which stack to pick, which APIs to use, how to deploy, or even how to prompt an AI builder properly. That planning gap kills projects before a single line of code is written.",
    solution:
      'PromptForge asks six smart questions about your idea, then forges a complete build kit: a senior-developer-quality prompt for Claude Code, Lovable or Bolt, the right tech stack with reasoning, the exact APIs (with free tiers), common pitfalls, a step-by-step deploy guide, a business brief and communities to launch into.',
    features: [
      'Six contextual questions → seven actionable build sections',
      'Senior-grade prompt, ready to paste into any AI builder',
      'Tech stack chosen and explained in plain English',
      'API list with free tiers + deployment walkthrough',
      'Business brief and community launch targets',
    ],
    stack: ['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Groq (LLaMA 3)', 'Vercel'],
    link: 'https://github.com/PranavIsAFK/PromptForge',
    linkLabel: 'VIEW ON GITHUB',
  },
};

export const CARDS = [
  { key: 'vision', tag: 'AI · ASSISTIVE TECH', title: 'VISION BUDDY', desc: 'AI eyes for the visually impaired — real-time scene narration, face recognition and one-tap emergency SOS.', chips: ['AI Vision', 'React', 'Speech'] },
  { key: 'olab', tag: 'DSA · LOGISTICS', title: 'OLAB', desc: 'Smart truck-loading optimizer powered by 0/1 Knapsack DP — watch the algorithm fill its table in real time.', chips: ['Knapsack DP', 'JavaScript', 'Visualization'] },
  { key: 'promptforge', tag: 'AI · DEV TOOLING', title: 'PROMPTFORGE', desc: 'Turn any app idea into a complete build kit in minutes — senior-grade AI prompt, stack, APIs, deploy guide and go-to-market brief.', chips: ['Next.js 14', 'Groq AI', 'TypeScript'] },
];
