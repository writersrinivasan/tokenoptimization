export type Case = {
  id: string;
  industry: string;
  emoji: string;
  company: string;
  title: string;
  technique: string;
  story: string;
  unit: string; // "tokens", "$/day" etc. Units starting with "$" render as currency.
  before: { label: string; value: number; code: string };
  after: { label: string; value: number; code: string };
  why: string;
  how: string[];
};

// Reference prices (USD per 1M tokens) used in the illustrations.
// Snapshot Oct 2026 — always verify on the official pricing page.
export const PRICES = {
  sonnet: { in: 2, out: 10, cacheRead: 0.2, cacheWrite: 2.5 },
  haiku: { in: 0.1, out: 0.5 },
  opus: { in: 4, out: 20 },
  batchDiscount: 0.5,
};

/* ------------------------------------------------------------------ */
/* WORLD 1 — DEV FORGE: token habits while BUILDING an app with an AI  */
/* ------------------------------------------------------------------ */
export const devCases: Case[] = [
  {
    id: "dev-memory",
    industry: "Fintech",
    emoji: "💳",
    company: "PayNova — UPI payments app (14 developers)",
    title: "The 5,000-token rulebook nobody reads",
    technique: "Lean project memory (CLAUDE.md)",
    story:
      "PayNova's tech lead pasted the whole onboarding wiki into CLAUDE.md: company history, the full REST reference, every lint rule, 6 years of release notes. The assistant loads that file into every session — so every single conversation started 4,800 tokens in debt.",
    unit: "tokens / session",
    before: {
      label: "CLAUDE.md — 412 lines",
      value: 4800,
      code: `# CLAUDE.md
## Our company story (2019 → today)
## Full REST API reference   ← 180 lines copy-pasted
## Every ESLint rule, explained
## Release notes v1.0 … v9.4
## Meeting notes we might need someday
...`,
    },
    after: {
      label: "CLAUDE.md — 18 lines, pointers instead of payloads",
      value: 600,
      code: `# CLAUDE.md
- Run: pnpm dev | Test one file: pnpm test -- <path>
- Money = integer paise. NEVER floats.
- Never edit /generated/** (codegen output)
- API contracts: docs/api.md  (read only when needed)
- PR style: small, one concern, tests required`,
    },
    why: "Memory files ride along with every session. Keep only the rules the AI cannot infer from the code and link to the rest — the docs get read only when a task actually needs them.",
    how: [
      "Audit: would the AI make a mistake without this line? If not, delete it.",
      "Replace pasted docs with a file path ('see docs/api.md').",
      "Put team-specific, rarely used workflows into on-demand skills instead of global memory.",
    ],
  },
  {
    id: "dev-precise",
    industry: "Healthcare",
    emoji: "🏥",
    company: "MediTrack — hospital EHR & appointment system",
    title: "“Fix the bug” vs. a GPS coordinate",
    technique: "Precise prompts with file + symbol pointers",
    story:
      "A nurse reported that doctors on leave still show free slots. The developer typed “there's a bug in appointments, fix it”. The assistant had to go detective: grep, open 14 files, read the scheduler, the calendar, the leave module… before writing one line.",
    unit: "tokens / task",
    before: {
      label: "Vague prompt → AI explores the whole module",
      value: 38000,
      code: `> there's a bug in appointments, fix it

  ⏺ Searching "appointment" … 212 matches
  ⏺ Reading 14 files (scheduler, calendar, leave,
    notifications, billing hooks, …)`,
    },
    after: {
      label: "Precise prompt → AI goes straight to the spot",
      value: 4200,
      code: `> In src/appointments/slots.ts → getAvailableSlots(),
  doctors with an approved row in leave_requests still
  get slots. Exclude them. Add a case to slots.test.ts.

  ⏺ Reading slots.ts, slots.test.ts … done`,
    },
    why: "Every file the AI opens to 'find' the problem is paid for — and stays in context for the rest of the session. You already know where the bug is; hand over the coordinates.",
    how: [
      "Name the file, function and expected behaviour.",
      "Paste the exact error line, not the whole screen.",
      "Say what 'done' looks like (a test, a command that must pass).",
    ],
  },
  {
    id: "dev-clear",
    industry: "Retail",
    emoji: "🛍️",
    company: "StyleCart — fashion e-commerce storefront",
    title: "The context that never forgets",
    technique: "/clear between tasks, /compact inside long ones",
    story:
      "One marathon session: refactor checkout → write a DB migration → fix a button colour. By task 3, every tiny CSS question re-sent ~92k tokens of payment code and SQL that had nothing to do with buttons.",
    unit: "tokens per message",
    before: {
      label: "One endless session",
      value: 92000,
      code: `> refactor the checkout payment flow     (40k ctx)
> now write the orders DB migration       (75k ctx)
> also the Buy button colour is wrong     (92k ctx 😱)
  every message re-sends ALL of the above`,
    },
    after: {
      label: "Fresh context per task",
      value: 9000,
      code: `> refactor the checkout payment flow
> /clear
> write the orders DB migration
> /clear
> Buy button colour is wrong in Button.module.css
                                           (9k ctx ✅)`,
    },
    why: "A conversation is re-read on each turn. Unrelated history is pure dead weight — and it also makes answers worse because the AI is distracted by irrelevant code.",
    how: [
      "/clear when you switch to an unrelated task.",
      "/compact (optionally with a focus: '/compact keep the migration plan') when a single task runs long.",
      "Write a short TODO.md before clearing if you need to resume later.",
    ],
  },
  {
    id: "dev-logs",
    industry: "Manufacturing",
    emoji: "🏭",
    company: "TorqueWorks — factory MES (manufacturing execution system)",
    title: "Pasting a 3,000-line build log",
    technique: "Filter tool output before it hits context",
    story:
      "CI failed. The developer copied the entire Gradle + Jest log — 3,000 lines of green ticks, download progress and warnings — and asked “why?”. Exactly 8 lines mattered.",
    unit: "tokens",
    before: {
      label: "Whole log pasted",
      value: 26000,
      code: `> why did CI fail? [pastes 3,112 lines]
  > Task :compileJava UP-TO-DATE
  > Downloading https://repo… 37%  52%  81% …
  PASS src/line/Station.test.ts
  PASS src/line/Shift.test.ts   … (2,900 more)`,
    },
    after: {
      label: "Only the failure",
      value: 1100,
      code: `$ npm test 2>&1 | grep -B2 -A12 "FAIL"
$ ./gradlew build -q 2>&1 | tail -40

> Here's the failing test + stack trace. Fix it.`,
    },
    why: "Logs are the #1 silent token hog. Let a shell filter (grep, tail, --quiet flags) do the cheap work before the expensive model sees anything.",
    how: [
      "Use quiet/summary flags: -q, --silent, --reporter=dot.",
      "grep for FAIL / ERROR / Exception with a few lines of context.",
      "Ask the AI to run tests with output piped through tail, not raw.",
    ],
  },
  {
    id: "dev-subagent",
    industry: "Telecom",
    emoji: "📡",
    company: "SignalOne — 9,000-file billing monorepo",
    title: "Exploring a giant codebase without drowning",
    technique: "Delegate exploration to a sub-agent",
    story:
      "“Where do we calculate roaming charges?” The assistant grepped and read 31 files directly in the main conversation. The answer was useful — but 64k tokens of search noise then followed the developer for the rest of the day.",
    unit: "tokens left in main context",
    before: {
      label: "Main session does the digging",
      value: 64000,
      code: `> find all roaming-charge logic and explain the flow
  ⏺ grep "roam" → 388 hits
  ⏺ Read 31 files into THIS conversation
  (all of it stays here for every next message)`,
    },
    after: {
      label: "Sub-agent digs, main session gets a brief",
      value: 1800,
      code: `> Use a sub-agent to locate roaming-charge logic.
  Report only: file paths + a 3-line summary each.

  ⏺ Sub-agent (own context) → returns 1.8k summary
  main context stays clean ✅`,
    },
    why: "A sub-agent has its own throw-away context window. It still reads files, but the main conversation only receives the distilled answer — so every later message is cheaper and sharper.",
    how: [
      "Use sub-agents for search, research and 'read a lot, report a little' jobs.",
      "Ask for a strict output shape: paths + summary, max N lines.",
      "Keep design decisions and edits in the main session.",
    ],
  },
  {
    id: "dev-plan",
    industry: "Automotive",
    emoji: "🚗",
    company: "AutoServ — dealer service-booking app",
    title: "Code first, think later = 3 rewrites",
    technique: "Plan mode before big changes",
    story:
      "“Add multi-branch support.” The AI started editing immediately, picked the wrong data model, then had to undo and redo — twice. Each attempt re-read and rewrote the same 20 files.",
    unit: "tokens / feature",
    before: {
      label: "Jump straight into edits",
      value: 48000,
      code: `> add multi-branch support
  attempt 1: branch_id on bookings  ❌ wrong
  attempt 2: separate DB per branch ❌ too heavy
  attempt 3: tenants table          ✅ finally`,
    },
    after: {
      label: "Agree on a plan, then one clean pass",
      value: 17000,
      code: `> [Plan mode] propose 2 designs for multi-branch
  support, with trade-offs. Don't edit yet.
  → you pick "tenants table" (5k tokens)
> implement option B                (12k tokens)`,
    },
    why: "Thinking is cheap; rewriting is expensive. A short plan catches wrong assumptions before the AI pays to read and rewrite dozens of files.",
    how: [
      "Use plan mode (Shift+Tab in Claude Code) for multi-file features.",
      "Ask for options + trade-offs, then choose.",
      "Save the plan to a file so a fresh session can execute it.",
    ],
  },
  {
    id: "dev-model",
    industry: "EdTech",
    emoji: "🎓",
    company: "LearnLoop — online course platform",
    title: "Hiring a rocket to deliver a postcard",
    technique: "Match model & effort to the task",
    story:
      "Renaming 300 i18n keys is mechanical. Doing it with the biggest model at maximum reasoning effort burned thousands of 'thinking' tokens deliberating over a find-and-replace.",
    unit: "$ per task",
    before: {
      label: "Top model, max effort, for everything",
      value: 1.9,
      code: `model: largest   effort: max
> rename all "course_*" i18n keys to "lesson_*"
  ✻ thinking… (long deliberation on a rename)`,
    },
    after: {
      label: "Right-sized model & effort",
      value: 0.12,
      code: `model: small/fast   effort: low
> rename all "course_*" i18n keys to "lesson_*"
  (save the big model + high effort for
   architecture, tricky bugs, security reviews)`,
    },
    why: "Reasoning depth and model size are dials, not defaults. Mechanical edits, formatting and simple lookups rarely need deep thinking.",
    how: [
      "Small/fast model + low effort: renames, boilerplate, docs, tests from a template.",
      "Large model + high effort: architecture, debugging races, security review.",
      "In Claude Code switch with /model; lower effort on routine sub-agents.",
    ],
  },
];

export const devHabits = [
  { id: "memory", label: "Lean CLAUDE.md", hint: "pointers, not payloads", cut: 0.08 },
  { id: "precise", label: "Precise prompts", hint: "file + function + expected result", cut: 0.22 },
  { id: "clear", label: "/clear between tasks", hint: "no unrelated history", cut: 0.25 },
  { id: "logs", label: "Filtered logs", hint: "grep / tail before pasting", cut: 0.12 },
  { id: "sub", label: "Sub-agents for exploration", hint: "main context stays clean", cut: 0.15 },
  { id: "plan", label: "Plan mode first", hint: "fewer rewrites", cut: 0.1 },
  { id: "model", label: "Right model & effort", hint: "small for mechanical work", cut: 0.12 },
];

/* ------------------------------------------------------------------ */
/* WORLD 2 — API HARBOR: token usage in production API calls          */
/* ------------------------------------------------------------------ */
export const apiCases: Case[] = [
  {
    id: "api-cache",
    industry: "Insurance",
    emoji: "🛡️",
    company: "SecureLife — claims-assistant bot, 40,000 requests/day",
    title: "Re-reading the same 9,000-token handbook 40,000 times a day",
    technique: "Prompt caching",
    story:
      "Every claim question carried the full policy handbook (9,000 tokens) as the system prompt — identical bytes, every time, billed at full price. The actual customer question was only ~400 tokens.",
    unit: "$/day",
    before: {
      label: "Handbook billed at full input price on every call",
      value: 752,
      code: `client.messages.create({
  model: "claude-sonnet-5-5",
  system: POLICY_HANDBOOK,       // 9k tokens, every call
  messages: [{ role: "user", content: question }],
})
// 40k × 9.4k = 376M input tokens/day × $2/M`,
    },
    after: {
      label: "Handbook cached; only the question is new",
      value: 104,
      code: `client.messages.create({
  model: "claude-sonnet-5-5",
  system: [{
    type: "text", text: POLICY_HANDBOOK,
    cache_control: { type: "ephemeral" },  // ✅
  }],
  messages: [{ role: "user", content: question }],
})
// cached reads ≈ 10% of input price`,
    },
    why: "Caching works on an exact prefix match: stable content first (tools → system → old messages), changing content last. Cache reads cost a fraction of normal input and are faster too.",
    how: [
      "Put big, unchanging context (manuals, schemas, few-shot examples) at the start.",
      "Never put timestamps or request IDs before the cache breakpoint.",
      "Verify with usage.cache_read_input_tokens in the response.",
    ],
  },
  {
    id: "api-silent",
    industry: "Media",
    emoji: "📰",
    company: "NewsPulse — article tagging service",
    title: "The silent cache killer",
    technique: "Measure first: usage logs & count_tokens",
    story:
      "NewsPulse turned caching on… and the bill didn't move. Their usage logs showed cache_read_input_tokens = 0 on every call. The culprit: the system prompt began with “Current time: 10:42:07”. A different first line every second = a brand-new prefix every request.",
    unit: "$/day",
    before: {
      label: "Timestamp at the top → 0% cache hits",
      value: 410,
      code: `system: \`Current time: \${new Date().toISOString()}
You are NewsPulse's tagging assistant…
[6,000 tokens of taxonomy]\`

usage.cache_read_input_tokens → 0  😭`,
    },
    after: {
      label: "Stable prefix; volatile data moved to the end",
      value: 95,
      code: `system: [{ type: "text", text: TAXONOMY_PROMPT,
           cache_control: { type: "ephemeral" } }],
messages: [{ role: "user",
  content: \`Time: \${now}\\nArticle: \${article}\` }]

usage.cache_read_input_tokens → 6,012  🎉`,
    },
    why: "You can't optimize what you don't measure. Log the usage block of every response; use the token-counting endpoint to profile prompts before they ship.",
    how: [
      "Log input, output, cache_read and cache_creation tokens per route.",
      "Hunt silent invalidators: timestamps, random IDs, unsorted JSON, shuffled tool lists.",
      "Use count_tokens in CI to catch prompt bloat in pull requests.",
    ],
  },
  {
    id: "api-batch",
    industry: "Banking",
    emoji: "🏦",
    company: "NorthBank — nightly categorization of 2M card transactions",
    title: "Paying express shipping for overnight mail",
    technique: "Batch API (50% off)",
    story:
      "Every night NorthBank categorizes 2 million transactions (“Swiggy → Food”, “IRCTC → Travel”). Nobody needs the answer in 2 seconds — the report is read at 9 AM. Yet they were sent as 2M real-time requests.",
    unit: "$/night",
    before: {
      label: "2M synchronous requests",
      value: 1800,
      code: `for (const txn of transactions) {
  await client.messages.create({ … txn … })
}
// 600M in × $2 + 60M out × $10 = $1,800`,
    },
    after: {
      label: "One batch job, results by morning",
      value: 900,
      code: `await client.messages.batches.create({
  requests: transactions.map((t) => ({
    custom_id: t.id,
    params: { model, max_tokens: 50, messages: [...] },
  })),
})
// same tokens, 50% price ✅  (+ caching stacks!)`,
    },
    why: "If it can wait minutes or hours — reports, enrichment, evals, back-fills — batch it. Same model, same quality, half the price, and it doesn't eat your real-time rate limits.",
    how: [
      "Good fits: nightly ETL, document enrichment, evals, content moderation backlogs.",
      "Key results by custom_id (they arrive in any order).",
      "Combine with prompt caching for the shared instructions.",
    ],
  },
  {
    id: "api-route",
    industry: "E-commerce",
    emoji: "🛒",
    company: "ShopKart — customer support, 50,000 tickets/day",
    title: "Sending a professor to answer “where is my order?”",
    technique: "Model routing (small model triage)",
    story:
      "70% of ShopKart's tickets are simple: order status, return window, COD questions. All 50k went to a mid-tier model. A tiny, cheap classifier now routes easy tickets to a small model (or a plain database lookup!) and only hard ones — angry customers, fraud, multi-order mix-ups — to the stronger model.",
    unit: "$/day",
    before: {
      label: "Every ticket → the same mid-tier model",
      value: 300,
      code: `ticket ──▶ Sonnet  (50,000 / day)
  "where is my order #4521?"   → Sonnet
  "refund for damaged phone"   → Sonnet
  "change delivery address"    → Sonnet`,
    },
    after: {
      label: "Triage → small model or lookup; escalate the rest",
      value: 102,
      code: `ticket ──▶ Haiku triage (≈200 tokens)
   ├─ 70% simple  ─▶ Haiku / DB lookup  ⚡
   └─ 30% complex ─▶ Sonnet             🧠

const tier = await classify(ticket) // "simple" | "complex"`,
    },
    why: "Different questions deserve different brains. A small model is ~20× cheaper per token; most traffic in real products is routine.",
    how: [
      "Measure quality on a sample before routing — never route blindly.",
      "Some 'AI' questions need no AI at all: order status is an SQL query.",
      "Escalate on low confidence or negative sentiment.",
    ],
  },
  {
    id: "api-output",
    industry: "Healthcare",
    emoji: "🧪",
    company: "MedLab Diagnostics — lab-report summaries for doctors",
    title: "Three paragraphs nobody reads",
    technique: "Structured, concise outputs",
    story:
      "Doctors wanted: which values are abnormal, and how urgent. The model politely wrote 850 tokens of prose — and output tokens cost 5× input tokens.",
    unit: "output tokens / report",
    before: {
      label: "Free-form prose",
      value: 850,
      code: `"Thank you for sharing this report. Overall the
patient's results are largely within normal limits,
however there are several observations worth noting.
Firstly, the haemoglobin level … (continues)"`,
    },
    after: {
      label: "JSON schema, only what the doctor needs",
      value: 160,
      code: `output_config: { format: { type: "json_schema",
  schema: LabFlags } }
→ { "abnormal": [
     { "test": "HbA1c", "value": 8.2, "flag": "HIGH" } ],
    "urgency": "review_within_48h" }`,
    },
    why: "Output tokens are the expensive ones (often 5× input). A schema forces brevity, removes pleasantries, and makes the result machine-readable for the hospital system.",
    how: [
      "Use structured outputs / JSON schemas for anything a program consumes.",
      "Ask for 'only flagged items' instead of a full narrative.",
      "Set a sensible max_tokens — a safety net, not a style guide.",
    ],
  },
  {
    id: "api-rag",
    industry: "Legal",
    emoji: "⚖️",
    company: "LexBridge — contract Q&A for a corporate law firm",
    title: "Stuffing 15 contracts to answer one question",
    technique: "Smart retrieval (RAG) with re-ranking",
    story:
      "“What's the termination notice period with Vendor X?” The app sent all 15 related contracts (140k tokens) “just to be safe”. The answer lived in a single clause.",
    unit: "input tokens / question",
    before: {
      label: "Send everything",
      value: 140000,
      code: `context = allContracts.join("\\n")   // 15 docs
ask(\`\${context}\\n\\nQ: termination notice period?\`)`,
    },
    after: {
      label: "Retrieve → re-rank → send top clauses",
      value: 5200,
      code: `const hits = await vectorSearch(q, { k: 30 })
const top = rerank(q, hits).slice(0, 6)   // ~6 clauses
ask(\`\${top.map(c => c.text).join("\\n")}
Q: \${q}  — cite clause ids\`)`,
    },
    why: "More context is not more accuracy — irrelevant text dilutes attention and costs money. Retrieve small, well-labelled chunks and send only the best few.",
    how: [
      "Chunk by meaning (clauses, sections), not by fixed character counts.",
      "Re-rank before sending; keep top-k small and measure answer quality.",
      "Ask for citations so you can verify the chunks were enough.",
    ],
  },
  {
    id: "api-history",
    industry: "Travel",
    emoji: "✈️",
    company: "TripMate — trip-planning chatbot",
    title: "The snowball conversation",
    technique: "Rolling summaries / compaction",
    story:
      "A family planning a Kerala trip chatted for 40 turns. Each turn re-sent the entire conversation. Turn 40 alone carried 24k tokens — most of it about hotels they had already rejected.",
    unit: "input tokens / conversation",
    before: {
      label: "Resend full history every turn (grows like a snowball)",
      value: 492000,
      code: `messages = [...allPreviousTurns, newTurn]
// turn 1: 600 · turn 10: 6k · turn 40: 24k
// total over 40 turns ≈ 492k tokens`,
    },
    after: {
      label: "Summary of old turns + last 6 turns verbatim",
      value: 164000,
      code: `messages = [
  { role: "user", content: \`Trip so far: \${summary}\` },
  ...lastSixTurns,
  newTurn,
]
// or enable server-side compaction`,
    },
    why: "Conversation cost grows with every turn because history is re-sent. Summarize what's settled (dates, budget, decisions) and keep only recent turns word-for-word.",
    how: [
      "Keep decisions & facts in a compact 'state' summary.",
      "Keep the last N turns verbatim for natural flow.",
      "Combine with caching — the summary + system prompt is a great cached prefix.",
    ],
  },
  {
    id: "api-tools",
    industry: "SaaS",
    emoji: "🧩",
    company: "CloudDesk CRM — AI assistant with 90 integrations",
    title: "Reading the whole menu before ordering tea",
    technique: "Tool search / deferred tool loading",
    story:
      "CloudDesk exposed 90 tools (Salesforce, Jira, Gmail, invoices…). Their JSON definitions — 27k tokens — were sent on every request, even for “hi”.",
    unit: "tokens / request",
    before: {
      label: "All 90 tool schemas on every call",
      value: 27000,
      code: `tools: [create_invoice, update_invoice, void_invoice,
  list_jira_issues, create_jira_issue, send_gmail,
  … 84 more …]   // 27k tokens, every request`,
    },
    after: {
      label: "A search tool + load only what's needed",
      value: 2500,
      code: `tools: [
  { type: "tool_search_tool_bm25_20251119",
    name: "tool_search_tool_bm25" },
  { ...create_invoice, defer_loading: true },
  … 89 more, all deferred …
]  // model searches, loads 2–3 relevant tools`,
    },
    why: "Tool definitions are input tokens too. When you have dozens of tools, let the model discover the few it needs instead of shipping the whole catalogue.",
    how: [
      "Keep 3–5 most-used tools always loaded; defer the long tail.",
      "Write crisp tool names & descriptions so search finds them.",
      "Merge near-duplicate tools (one 'invoice' tool with an action field).",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* WORLD 3 — AGENT GALAXY: agentic frameworks & multi-agent systems   */
/* ------------------------------------------------------------------ */
export const agentCases: Case[] = [
  {
    id: "ag-isolate",
    industry: "Pharma",
    emoji: "💊",
    company: "GenoCure — drug-interaction research agent",
    title: "One agent reading 120 papers by itself",
    technique: "Context isolation with worker sub-agents",
    story:
      "The orchestrator agent read all 120 papers itself. By paper 60 its context was a swamp: every new step re-read everything before it, and quality dropped as the window filled up.",
    unit: "tokens in orchestrator context",
    before: {
      label: "Orchestrator reads everything",
      value: 380000,
      code: `orchestrator:
  for paper in papers: read(paper)   # all in ONE context
  synthesize()
# each step re-reads all prior papers`,
    },
    after: {
      label: "6 workers × 20 papers, each returns a 1.5k brief",
      value: 9000,
      code: `orchestrator:
  briefs = parallel([
    worker(papers[0:20]),  …  worker(papers[100:120])
  ])            # each worker has its own context
  synthesize(briefs)   # 6 × 1.5k = 9k tokens`,
    },
    why: "Workers burn tokens in disposable contexts and hand back distilled briefs. The orchestrator stays small, fast and focused on decisions.",
    how: [
      "Fan out 'read a lot, report a little' work.",
      "Define a strict brief format (findings, evidence ids, confidence).",
      "Use a cheaper model for workers when the task is extraction.",
    ],
  },
  {
    id: "ag-ptc",
    industry: "Manufacturing",
    emoji: "⚙️",
    company: "VoltForge — predictive-maintenance agent for 400 turbines",
    title: "Making the model read 50,000 sensor rows",
    technique: "Programmatic tool calling (code filters data)",
    story:
      "“Which turbines show bearing-vibration anomalies this week?” The tool returned 50,000 raw rows — 210k tokens — for the model to eyeball. A 6-line script could have found the 25 rows that matter.",
    unit: "tokens entering context",
    before: {
      label: "Raw tool result dumped into the model",
      value: 210000,
      code: `tool_result: get_sensor_data(week=42)
→ [{turbine:"T-001", ts:"…", vib:0.21, temp:61}, …
   … 50,000 rows …]          # all into context 😵`,
    },
    after: {
      label: "Model writes code; code calls the tool and filters",
      value: 1200,
      code: `# runs inside code execution, not in the context
rows = get_sensor_data(week=42)
z = zscore([r.vib for r in rows])
anomalies = [r for r, s in zip(rows, z) if s > 3]
print(summarize(anomalies))   # 25 rows → 1.2k tokens`,
    },
    why: "Let code do what code is good at — filtering, joining, counting. Only the final, small result enters the model's context.",
    how: [
      "Enable code execution and allow your tool to be called from it.",
      "Great for logs, telemetry, spreadsheets, large API responses.",
      "Return aggregates and top-N, never full dumps.",
    ],
  },
  {
    id: "ag-clear",
    industry: "Cybersecurity",
    emoji: "🔐",
    company: "SentinelSOC — security-alert triage agent",
    title: "Hoarding every log it ever looked at",
    technique: "Context editing (clear stale tool results)",
    story:
      "Triaging one incident takes ~60 tool calls: firewall logs, EDR events, user lookups. Old results from step 3 were still in context at step 58 — re-billed on every call.",
    unit: "peak context tokens",
    before: {
      label: "All tool results kept forever",
      value: 160000,
      code: `step  3: firewall_logs   (8k) ─┐
step 12: edr_events      (11k) ├─ still in context
step 27: dns_queries      (9k) ─┘   at step 58
step 58: "is host-17 compromised?"`,
    },
    after: {
      label: "Old tool results auto-cleared; notes kept",
      value: 35000,
      code: `context_management: { edits: [
  { type: "clear_tool_uses_20250919" } ] }
+ agent writes key findings to a notes/memory file
step 58 sees: notes + last few tool results ✅`,
    },
    why: "Most tool results are only needed for a moment. Clear them once they've been used and keep a compact note of what was learned.",
    how: [
      "Turn on automatic clearing of old tool results.",
      "Have the agent jot findings into a memory/notes file.",
      "Compaction (summarizing) is the next level when even that grows.",
    ],
  },
  {
    id: "ag-handoff",
    industry: "Logistics",
    emoji: "🚚",
    company: "LogiChain — procurement → inventory → routing agents",
    title: "Agents gossiping full transcripts",
    technique: "Structured hand-offs between agents",
    story:
      "The procurement agent forwarded its entire 40k-token conversation to the inventory agent, which forwarded both to the routing agent. By the third hop, 90% of the context was chatter.",
    unit: "tokens per hand-off",
    before: {
      label: "Forward the whole transcript",
      value: 40000,
      code: `routing_agent.run(
  procurement.transcript + inventory.transcript
)   # every hop adds the previous hop's baggage`,
    },
    after: {
      label: "Pass a typed brief",
      value: 800,
      code: `{
  "po_id": "PO-88213", "sku": "STEEL-ROD-12",
  "qty": 1200, "warehouse": "Chennai-2",
  "ready_by": "2026-11-04", "constraints": ["no rail"]
}`,
    },
    why: "Agents need decisions and facts, not each other's internal monologue. A schema'd hand-off is tiny, testable, and stops errors from snowballing.",
    how: [
      "Define a hand-off schema per edge in your agent graph.",
      "Include ids/links so the next agent can fetch details on demand.",
      "Validate briefs — a bad brief fails fast instead of costing a whole run.",
    ],
  },
  {
    id: "ag-tier",
    industry: "Insurance",
    emoji: "📋",
    company: "UnderwriteAI — commercial-policy underwriting crew",
    title: "Every crew member is a senior partner",
    technique: "Model tiering (smart lead, cheap workers)",
    story:
      "Five agents (document reader, risk scorer, compliance checker, pricing, lead) all ran on the top model. Reading PDFs and checking field formats doesn't need a genius.",
    unit: "$ per 1,000 applications",
    before: {
      label: "Top model everywhere",
      value: 420,
      code: `lead       → top model
doc_reader → top model   (80% of the tokens!)
compliance → top model
pricing    → top model`,
    },
    after: {
      label: "Lead on the strong model, workers on a small one",
      value: 95,
      code: `lead       → strong model, high effort  🧠
doc_reader → small model, low effort    ⚡
compliance → small model + rules engine ⚡
pricing    → strong model (money decisions)`,
    },
    why: "In most crews, the readers and extractors consume the bulk of the tokens. Put them on a small model and keep the strong model for judgement.",
    how: [
      "Profile which agent consumes which share of tokens first.",
      "Downgrade the high-volume, low-judgement roles.",
      "Also try: the strong model at lower effort — sometimes simpler than a cascade.",
    ],
  },
  {
    id: "ag-memory",
    industry: "Customer Success",
    emoji: "🤝",
    company: "Helix SaaS — account-manager agent",
    title: "Re-reading 6 months of emails every morning",
    technique: "Persistent memory instead of re-reading",
    story:
      "Every session, the agent re-read the client's whole email history to ‘remember’ them — 70k tokens before even saying hello.",
    unit: "tokens to warm up a session",
    before: {
      label: "Re-ingest raw history each session",
      value: 70000,
      code: `session.start():
  context += fetch_all_emails(client, months=6)`,
    },
    after: {
      label: "Read a curated memory file; update it at the end",
      value: 2000,
      code: `/memories/acme-corp.md
- Renewal: 2027-03-31, champion = Priya (VP Ops)
- Pain: SSO outages in Q2 → fixed, promised SLA report
- Next: QBR on Nov 12, upsell analytics add-on`,
    },
    why: "Memory is a cache for understanding. Pay once to distil knowledge, then reuse the distilled version.",
    how: [
      "Give the agent a memory tool / folder and tell it to keep it tidy.",
      "Store facts & decisions, not transcripts.",
      "Fetch raw history only when the memory says it's needed.",
    ],
  },
  {
    id: "ag-budget",
    industry: "Finance",
    emoji: "📈",
    company: "QuantLeaf — equity-research agent",
    title: "The agent that couldn't stop double-checking",
    technique: "Task budgets & clear stop conditions",
    story:
      "Asked for a one-page brief on a mid-cap stock, the agent kept fetching ‘one more source’ — 47 tool calls and 300k tokens for a page that was good after 12.",
    unit: "tokens per brief",
    before: {
      label: "Open-ended goal, no budget",
      value: 300000,
      code: `"Research ACME Ltd thoroughly."
→ 47 searches, 31 fetches, 4 re-verifications…`,
    },
    after: {
      label: "Clear deliverable + budget",
      value: 90000,
      code: `"One-page brief: thesis, 3 risks, valuation range.
 Max 10 sources. Stop when every section is filled."
output_config: { task_budget: { type: "tokens",
                                 total: 90000 } }`,
    },
    why: "Agents optimize for what you ask. Define 'done', cap the effort, and the model paces itself instead of wandering.",
    how: [
      "State the deliverable and the stopping rule up front.",
      "Use task budgets so the agent knows how much it has left.",
      "Cap tool calls / iterations in your own loop as a safety net.",
    ],
  },
];


/* ------------------------------------------------------------------ */
/* OBSIDIAN VAULT: a linked-notes "second brain" the AI reads instead  */
/* of re-discovering everything from raw sources                       */
/* ------------------------------------------------------------------ */
export const vaultCases: Case[] = [
  {
    id: "vault-moc",
    industry: "Consulting",
    emoji: "🗺️",
    company: "Northstar Advisory — 300-note client-engagement vault",
    title: "Opening every drawer to find one file",
    technique: "Index note (Map of Content) + progressive disclosure",
    story:
      "The team pointed their AI at the vault and asked about the retail client's pricing project. With no entry point, the assistant globbed the folder and read 64 notes to orient itself. A single index note would have pointed straight to the 3 that mattered.",
    unit: "tokens / question",
    before: {
      label: "No index: the AI reads its way around the vault",
      value: 52000,
      code: `> what did we recommend on pricing for RetailCo?
  ⏺ Glob **/*.md → 312 notes
  ⏺ Reading 64 notes to find the right ones…`,
    },
    after: {
      label: "Start at the index and follow [[links]]",
      value: 2400,
      code: `00-Index.md
## Clients
- RetailCo → [[RetailCo MOC]]
     ## Pricing project
     - Final recommendation → [[2026-09 Pricing deck notes]]
     - Decision log → [[ADR-007 Value-based tiers]]
  ⏺ Read 3 notes. Done.`,
    },
    why: "An index note is a table of contents for the AI. It reads a 300-token map, then opens only the linked notes it needs. This is progressive disclosure: start broad and cheap, go deep only where needed.",
    how: [
      "Create 00-Index.md, plus one Map of Content (MOC) note per client, project or topic.",
      "Tell the AI in CLAUDE.md: “start at 00-Index.md, follow [[links]], never read the whole vault”.",
      "Keep MOCs short, with links and one-line descriptions only.",
    ],
  },
  {
    id: "vault-distill",
    industry: "Energy",
    emoji: "⚡",
    company: "VoltRide EV — battery R&D team",
    title: "Re-reading a 48-page datasheet every Monday",
    technique: "Distill sources once into literature notes",
    story:
      "Every time an engineer asked about cell limits, the AI re-read the supplier's 48-page PDF (38k tokens). The same 6 numbers were extracted, again and again, for months.",
    unit: "tokens / question",
    before: {
      label: "Raw PDF re-read on every question",
      value: 38000,
      code: `> what's the max charge temperature for Supplier-A cells?
  ⏺ Reading attachments/SupplierA_datasheet.pdf
    (48 pages, 38k tokens)… again.`,
    },
    after: {
      label: "Read the distilled note (made once)",
      value: 600,
      code: `Research/Supplier-A cells.md
---
summary: LFP 280Ah; charge 0–45°C; discharge −20–60°C
source: attachments/SupplierA_datasheet.pdf (p.12, p.31)
---
| Param | Value | Page |
| Max charge temp | 45 °C | 12 |  …`,
    },
    why: "Pay once to distill a source into a short note with page citations, then reuse that note forever. The AI goes back to the PDF only when the note says it needs to.",
    how: [
      "One literature note per source: summary, key numbers, page references.",
      "Ask the AI to write the note the first time it reads the source.",
      "Add a rule: “never open /attachments if a Research note exists”.",
    ],
  },
  {
    id: "vault-handoff",
    industry: "Gaming",
    emoji: "🎮",
    company: "PixelForge — indie studio, AI-assisted game development",
    title: "“Where were we?” costs 12k tokens every morning",
    technique: "Session hand-off notes",
    story:
      "Each new session began with 20 minutes of the AI re-exploring the code and the developer re-explaining yesterday's decisions. A 150-word note written at the end of each session replaced all of it.",
    unit: "tokens to resume work",
    before: {
      label: "Cold start every session",
      value: 12000,
      code: `> continue the inventory system from yesterday
  ⏺ Exploring src/inventory/** …
  ⏺ Reading git log, 9 files, old TODOs …
  (and you re-explain the stacking rule decision)`,
    },
    after: {
      label: "Read the hand-off note, then resume",
      value: 900,
      code: `Sessions/handoff-latest.md
- Done: item stacking (max 99), save/load v2
- Decided: stack by itemId+rarity → [[ADR-021]]
- Next: drag-drop between bags (src/ui/Bag.tsx)
- Watch out: SaveSystem migration test is flaky`,
    },
    why: "The most expensive context is context you've already built once and then thrown away. A hand-off note carries it across sessions for a few hundred tokens.",
    how: [
      "End each session with: “update Sessions/handoff-latest.md (max 150 words)”.",
      "Keep a dated archive in Sessions/ for history; the AI reads only the latest one.",
      "Combine with /clear: clear the chat, keep the note.",
    ],
  },
  {
    id: "vault-adr",
    industry: "Aerospace",
    emoji: "🛩️",
    company: "SkyMRO — aircraft maintenance-scheduling platform",
    title: "Re-litigating the database decision every sprint",
    technique: "Decision records (ADRs) in the vault",
    story:
      "“Why Postgres and not MongoDB?” Nobody remembered, so the AI dug through three months of exported Slack threads and meeting transcripts to reconstruct the reasoning. Every few weeks.",
    unit: "tokens / question",
    before: {
      label: "Reconstruct the decision from chat history",
      value: 30000,
      code: `> why did we pick Postgres over Mongo?
  ⏺ Searching exports/slack-*.json …
  ⏺ Reading 14 threads + 3 meeting transcripts`,
    },
    after: {
      label: "Read one short decision record",
      value: 400,
      code: `Decisions/ADR-004 Postgres.md
---
summary: Postgres chosen — FAA audit trail needs ACID + joins
status: accepted · 2026-03-14
---
Options: Postgres ✅ · MongoDB ❌ (audit joins painful)
Revisit if: >50M work orders/yr`,
    },
    why: "Decisions are the most re-asked knowledge in any team. Record each one once, in a fixed shape, and the AI answers in 400 tokens instead of 30,000. It also stops the AI from undoing a decision it doesn't know about.",
    how: [
      "Template: context, options, decision, consequences, when to revisit.",
      "Link each ADR from its project's MOC.",
      "Tell the AI to check Decisions/ before proposing architecture changes.",
    ],
  },
  {
    id: "vault-frontmatter",
    industry: "Publishing",
    emoji: "📚",
    company: "InkWell Media — 1,200-article editorial vault",
    title: "Opening 40 notes to check if they're relevant",
    technique: "Summary front-matter + grep before reading",
    story:
      "To find past articles on EV subsidies, the AI opened 40 candidate notes in full. Only 5 were relevant. If every note started with a one-line summary, a single grep could have filtered them first.",
    unit: "tokens / search",
    before: {
      label: "Open every candidate note fully",
      value: 32000,
      code: `> find our past coverage on EV subsidies
  ⏺ grep -l "EV" → 40 notes
  ⏺ Reading all 40 in full (avg 800 tokens)…`,
    },
    after: {
      label: "Grep the summaries, open only the matches",
      value: 2100,
      code: `$ grep -H "^summary:" Articles/*.md | grep -i subsid
Articles/ev-fame3.md: summary: FAME-III subsidy cut, 2026…
Articles/ev-state.md: summary: State EV subsidies compared…
  ⏺ 40 summary lines (~800 tokens) → open 5 notes`,
    },
    why: "One summary line per note turns the vault into a cheap, searchable catalogue. The AI scans 40 lines instead of 40 documents.",
    how: [
      "Add summary, tags and updated fields to every note's front-matter.",
      "Ask the AI to keep summaries current whenever it edits a note.",
      "Search front-matter first and open full notes second.",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* DETECTIVE ARENA                                                     */
/* ------------------------------------------------------------------ */
export type World = "dev" | "api" | "agent" | "graph" | "vault";
export type Q = { id: string; world: World; scene: string; industry: string; q: string; options: string[]; answer: number; explain: string };

export const WORLD_INFO: Record<World, { label: string; href: string }> = {
  dev: { label: "🔥 Dev Forge", href: "/dev" },
  api: { label: "⚓ API Harbor", href: "/api-harbor" },
  agent: { label: "🚀 Agent Galaxy", href: "/agents" },
  graph: { label: "🕸️ Graphify Lab", href: "/graphify" },
  vault: { label: "📓 Obsidian Vault", href: "/obsidian" },
};

export const quiz: Q[] = [
  {
    id: "api-timestamp", world: "api", industry: "🏦 Banking",
    scene: "A support bot's system prompt starts with “Current time: 10:42:07 IST”. Caching is enabled but the cache hit rate is 0%.",
    q: "What's the leak?",
    options: ["The model is too big", "The timestamp changes the prefix every request, so the cache never matches", "Caching only works on weekends", "The system prompt is too short"],
    answer: 1,
    explain: "Caching is an exact prefix match. Move volatile data (time, IDs) after the cached part — usually into the user message.",
  },
  {
    id: "dev-memory", world: "dev", industry: "🏥 Healthcare",
    scene: "A hospital-software team's CLAUDE.md is 400 lines long: company history, the full REST API reference, every lint rule and six years of release notes.",
    q: "What's the best fix?",
    options: ["Split it into four CLAUDE.md files", "Keep only rules the AI can't infer from the code, and link to docs instead of pasting them", "Move it all into the first chat message instead", "Write it in shorter words"],
    answer: 1,
    explain: "Memory files load at the start of every session. Keep them small and use pointers like “see docs/api.md” so the docs are read only when a task needs them.",
  },
  {
    id: "agent-snowball", world: "agent", industry: "🧠 Fundamentals",
    scene: "An agent run with 10 steps costs 50k tokens. The team expects 40 steps to cost about 200k, but the bill shows about 2M.",
    q: "Why does cost grow faster than the number of steps?",
    options: ["The provider charges a penalty after 10 steps", "Every step re-sends the whole growing context, so total cost grows roughly with the square of the steps", "Tool calls are billed at double price", "Long runs switch to a more expensive model"],
    answer: 1,
    explain: "Step 40 re-reads everything from steps 1–39. That snowball is why clearing, compaction, isolation and caching matter so much for agents.",
  },
  {
    id: "api-batch", world: "api", industry: "🛍️ Retail",
    scene: "You must summarize 500,000 product reviews. The marketing team needs it by tomorrow morning.",
    q: "What's the biggest single saving?",
    options: ["Batch API: same model, about 50% cheaper, results arrive asynchronously", "Send them one by one, faster", "Use a bigger model to be safe", "Increase max_tokens"],
    answer: 0,
    explain: "Non-urgent bulk work belongs in the Batch API. Add prompt caching for the shared instructions and save even more.",
  },
  {
    id: "graph-breakeven", world: "graph", industry: "🏦 Banking IT",
    scene: "Building a knowledge graph of the codebase costs 400k tokens once. Each question answered through the graph saves about 115k tokens compared with grepping raw files.",
    q: "After how many questions has the graph paid for itself?",
    options: ["About 4 questions", "About 40 questions", "About 400 questions", "It never pays off"],
    answer: 0,
    explain: "400k ÷ 115k ≈ 3.5, so from the 4th question on, every question is pure savings. Graphs pay off quickly when the same codebase gets asked about repeatedly.",
  },
  {
    id: "dev-logs", world: "dev", industry: "🏭 Manufacturing",
    scene: "A developer pastes a 4,000-line CI log into the coding assistant and asks why the build failed.",
    q: "What should they do instead?",
    options: ["Paste it twice for emphasis", "Switch to a model with a bigger context window", "Pipe it through grep/tail and share only the failure and the stack trace", "Take a screenshot instead"],
    answer: 2,
    explain: "Shell filters cost nothing; model tokens don't. 8 relevant lines beat 4,000 noisy ones, for both cost and accuracy.",
  },
  {
    id: "agent-isolate", world: "agent", industry: "💊 Pharma",
    scene: "A research orchestrator reads all 120 papers itself. By paper 60 its context is huge, every step is slow, and answer quality is dropping.",
    q: "What's the better architecture?",
    options: ["Ask it to read faster", "Worker sub-agents read 20 papers each in their own context and return a short brief to the orchestrator", "Give the orchestrator a bigger model", "Read the papers in alphabetical order"],
    answer: 1,
    explain: "Context isolation: workers spend tokens in throwaway contexts and hand back distilled briefs. The orchestrator stays small and focused on decisions.",
  },
  {
    id: "api-cache-order", world: "api", industry: "🛡️ Insurance",
    scene: "A claims bot sends a 9,000-token policy handbook plus the customer's question on every call. You're adding prompt caching.",
    q: "Where should the customer's question go?",
    options: ["At the very beginning, so the model sees it first", "In the middle of the handbook", "After the stable handbook, at the end of the prompt", "In a separate API call"],
    answer: 2,
    explain: "Caching matches from the start: stable content first (tools → system → old messages), changing content last. Anything that changes before the breakpoint breaks the cache.",
  },
  {
    id: "agent-handoff", world: "agent", industry: "🚚 Logistics",
    scene: "In a 4-agent pipeline, each agent forwards its full conversation transcript to the next.",
    q: "What's the fix?",
    options: ["Give every agent a bigger context window", "Pass a small structured brief (JSON) with decisions and IDs", "Merge everything into one giant agent", "Run them sequentially twice"],
    answer: 1,
    explain: "Structured hand-offs carry the decisions, not the chatter — often 50× smaller.",
  },
  {
    id: "dev-subagent", world: "dev", industry: "📡 Telecom",
    scene: "“Find everywhere we calculate roaming charges.” The assistant greps and reads 31 files in the main chat. The 64k tokens of search results then follow the developer for the rest of the day.",
    q: "What would have kept the main session light?",
    options: ["Delegate the search to a sub-agent and ask for only file paths plus a short summary", "Ask the same question three times", "Turn off file reading", "Use a larger context window"],
    answer: 0,
    explain: "A sub-agent explores in its own context. The main conversation receives only the distilled answer, so every later message stays cheaper.",
  },
  {
    id: "graph-search", world: "graph", industry: "🏦 Banking IT",
    scene: "An agent asked “what calls calculateInterest()?” in a 2M-line legacy codebase greps and reads 40 files every time someone asks a similar question.",
    q: "What's the most token-efficient strategy for repeated questions?",
    options: ["Read all the files once per question, more carefully", "Build a knowledge graph of the code once (graphify-style) and query the graph", "Ask the user to read the files", "Use a higher temperature"],
    answer: 1,
    explain: "A code/knowledge graph is built once and queried many times. The agent gets the exact neighbourhood (callers, callees, docs) instead of re-reading raw files.",
  },
  {
    id: "api-route", world: "api", industry: "🛒 E-commerce",
    scene: "85% of chatbot questions are “Where is my order #1234?”.",
    q: "What's the smartest move?",
    options: ["Use the strongest model with max effort", "Route them to a DB lookup or a small model, and escalate only complex tickets", "Add more examples to the system prompt", "Disable the bot"],
    answer: 1,
    explain: "Routing is often the biggest win in production. Sometimes the best token is the one you never send.",
  },
  {
    id: "agent-clear", world: "agent", industry: "🔐 Cybersecurity",
    scene: "A security-triage agent makes 60 tool calls per incident. At step 58 it still carries firewall and EDR log dumps from steps 3–27, re-billed on every call.",
    q: "Which technique targets this directly?",
    options: ["Context editing: clear stale tool results and keep short notes of what was learned", "Raise max_tokens", "Restart the incident from scratch", "Use a bigger model so it can hold more"],
    answer: 0,
    explain: "Most tool results matter for a moment. Clear them once used, keep findings in a notes/memory file, and use compaction if the history still grows.",
  },
  {
    id: "dev-plan", world: "dev", industry: "🚗 Automotive",
    scene: "“Add multi-branch support.” The assistant starts editing immediately, picks the wrong data model, and rewrites the same 20 files three times.",
    q: "What would have saved the most tokens?",
    options: ["Typing faster", "Plan mode first: get 2 design options with trade-offs, choose one, then implement once", "Using /clear after every file", "Disabling tests"],
    answer: 1,
    explain: "Thinking is cheap and rewriting is expensive. A short plan catches wrong assumptions before the AI pays to read and rewrite dozens of files.",
  },
  {
    id: "api-tools", world: "api", industry: "🧩 SaaS",
    scene: "Your agent has 120 tool definitions — 30k tokens — attached to every request, even “hello”.",
    q: "What's the fix?",
    options: ["Delete all tools", "Tool search with deferred loading, so the model loads only the tools it needs", "Shorten the user's message", "Use streaming"],
    answer: 1,
    explain: "Tool definitions are input tokens. Keep a few core tools loaded; defer the long tail behind a search tool.",
  },
  {
    id: "graph-ast", world: "graph", industry: "🏭 Manufacturing IT",
    scene: "Your team worries that building a knowledge graph of a 5,000-file codebase will cost millions of LLM tokens.",
    q: "Which part of the build can usually cost zero LLM tokens?",
    options: ["Writing community summaries", "Parsing code structure (functions, calls, imports) with an AST parser such as tree-sitter", "Answering the user's questions", "Reading PDFs and diagrams"],
    answer: 1,
    explain: "Code structure is deterministic: a parser extracts symbols and call edges for free. Save the LLM for unstructured docs and short community summaries.",
  },
  {
    id: "agent-ptc", world: "agent", industry: "⚙️ Manufacturing",
    scene: "A maintenance agent's tool returns 50,000 sensor rows so the model can find anomalies.",
    q: "What's the better approach?",
    options: ["Ask the model to read faster", "Split into 50 messages of 1,000 rows", "Programmatic tool calling: the model writes code that fetches and filters the data, and only the anomalies come back", "Convert rows to emojis"],
    answer: 2,
    explain: "Code is the right tool for filtering big data. Only the small final result enters the context.",
  },
  {
    id: "api-rag", world: "api", industry: "⚖️ Legal",
    scene: "To answer “What's the termination notice period with Vendor X?”, the app sends all 15 related contracts (140k tokens) “just to be safe”.",
    q: "What's the better approach?",
    options: ["Send them twice for accuracy", "Retrieve the relevant clauses, re-rank them, and send only the top few, with citations", "Summarize all 15 contracts on every question", "Use a model with a 2M context window"],
    answer: 1,
    explain: "More context isn't more accuracy. Small, well-labelled chunks plus re-ranking cut input by 90%+ and often improve the answer.",
  },
  {
    id: "dev-precise", world: "dev", industry: "🛍️ Retail",
    scene: "A developer types: “the checkout is broken, fix it”. The assistant opens 14 files to find the problem.",
    q: "Which prompt costs the fewest tokens?",
    options: ["“Please fix the checkout, it's really important”", "“In cart/total.ts calculateTotal(), coupons are applied twice. Apply once and add a test in total.test.ts.”", "“Fix all bugs in the repo”", "“Read the whole project, then fix the checkout”"],
    answer: 1,
    explain: "File + function + expected behaviour + a definition of done. You already know where to look, so give the AI coordinates instead of a treasure hunt.",
  },
  {
    id: "agent-tier", world: "agent", industry: "📋 Insurance",
    scene: "An underwriting crew of 5 agents all runs on the top model. Profiling shows the document-reader agent uses 80% of the tokens.",
    q: "Where should you cut first?",
    options: ["Move the high-volume document reader to a small model and keep the strong model for judgement", "Downgrade the lead agent first", "Remove the compliance agent", "Add a sixth agent to supervise"],
    answer: 0,
    explain: "Profile first, then downgrade the high-volume, low-judgement roles. Reading and extraction rarely need the biggest model.",
  },
  {
    id: "api-output", world: "api", industry: "🧪 Healthcare",
    scene: "Lab-report summaries come back as 3 polite paragraphs; the hospital system only needs abnormal values and urgency.",
    q: "Which change cuts the most cost?",
    options: ["Structured output (JSON schema) with only the needed fields", "Ask for a 'shorter' answer in caps", "Raise max_tokens", "Translate the report first"],
    answer: 0,
    explain: "Output tokens cost several times more than input. A schema makes answers short, consistent and machine-readable.",
  },
  {
    id: "graph-small", world: "graph", industry: "🎨 Startup",
    scene: "A designer has a 12-file portfolio site and one question about where the contact form is handled.",
    q: "Should they build a knowledge graph first?",
    options: ["Yes, always build a graph before asking anything", "No — for a tiny project and a one-off question, just let the agent read the few files", "Yes, but only with the most expensive model", "Only if the files are in COBOL"],
    answer: 1,
    explain: "Graphs pay off with large codebases and repeated questions. For tiny projects or one-off questions, the build cost never pays back.",
  },
  {
    id: "agent-budget", world: "agent", industry: "📈 Finance",
    scene: "Asked for a one-page stock brief, a research agent makes 47 tool calls and burns 300k tokens. The page was already good after 12 calls.",
    q: "What prevents this?",
    options: ["A clear deliverable, a stopping rule, and a task budget / max-steps limit", "A friendlier system prompt", "More tools", "Higher temperature"],
    answer: 0,
    explain: "Agents optimize for what you ask. Define what 'done' looks like and cap the effort, and the agent paces itself instead of wandering.",
  },
  {
    id: "dev-clear", world: "dev", industry: "🎓 EdTech",
    scene: "You finished a payment bug in your coding session and now start an unrelated UI feature.",
    q: "What do you type first?",
    options: ["Nothing, just keep going", "/clear (or start a new session)", "Paste the whole repo", "Ask it to remember everything"],
    answer: 1,
    explain: "Unrelated history is re-read on every turn. Clear it and the next 50 messages are cheaper and more focused.",
  },
  {
    id: "api-history", world: "api", industry: "✈️ Travel",
    scene: "A trip-planning chatbot conversation reaches 40 turns. Turn 40 alone re-sends 24k tokens, mostly about hotels the family already rejected.",
    q: "What's the fix?",
    options: ["Ask users to type less", "Keep a rolling summary of settled decisions plus the last few turns verbatim (or enable compaction)", "Start a brand-new chat every turn and forget everything", "Switch to a bigger model"],
    answer: 1,
    explain: "Summarize what's settled (dates, budget, choices), keep recent turns word-for-word, and cache the summary + system prompt as a stable prefix.",
  },
  {
    id: "graph-fresh", world: "graph", industry: "📡 Telecom",
    scene: "The team's code graph was built last month. Since then, 60 files have changed and the agent sometimes follows edges that no longer exist.",
    q: "What's the token-smart fix?",
    options: ["Rebuild the entire graph from scratch every hour", "Incrementally re-process only the changed files (e.g. in CI or a git hook)", "Stop using the graph", "Ask the agent to guess"],
    answer: 1,
    explain: "Incremental updates keep the graph fresh for a tiny fraction of the full build cost. A stale map is worse than no map.",
  },
  {
    id: "agent-memory", world: "agent", industry: "🤝 Customer Success",
    scene: "Every morning an account-manager agent re-reads six months of a client's emails (70k tokens) just to “remember” them.",
    q: "What's the better design?",
    options: ["Re-read only the last three months", "Keep a curated memory file of key facts and decisions, update it at the end of each session, and fetch raw emails only when needed", "Paste the emails into the system prompt", "Use a model with a bigger window"],
    answer: 1,
    explain: "Memory is a cache for understanding: pay once to distil, then reuse the distilled version. Store facts and decisions, not transcripts.",
  },
  {
    id: "api-measure", world: "api", industry: "📰 Media",
    scene: "You turned on prompt caching for a tagging service, but you're not sure it's working.",
    q: "How do you verify it?",
    options: ["Wait for next month's invoice", "Check usage.cache_read_input_tokens in API responses (and log it per route)", "Ask the model whether it cached", "Responses will be visibly shorter"],
    answer: 1,
    explain: "Measure before and after. If cache_read_input_tokens stays 0 across repeated calls, something in your prefix (timestamps, IDs, shuffled tools) is changing.",
  },
  {
    id: "graph-output", world: "graph", industry: "⚖️ Legal Tech",
    scene: "You expose a query_graph tool to your agent. A teammate suggests it should return the full source code of every connected node “to be helpful”.",
    q: "What should the tool return instead?",
    options: ["The entire repository", "A compact neighbourhood (node names, relations, short summaries) plus file pointers, so the agent opens only what it needs", "Only a yes/no answer", "A screenshot of the graph"],
    answer: 1,
    explain: "Pointers, not payloads. Returning full files would bring back the very token cost the graph was built to avoid.",
  },
  {
    id: "vault-index", world: "vault", industry: "📊 Consulting",
    scene: "Your team points the AI at a 300-note Obsidian vault. To answer one question it globs the whole folder and reads 64 notes to “get oriented”.",
    q: "What's the cheapest fix?",
    options: ["Delete half the notes", "Add an index note (Map of Content) and tell the AI to start there and follow [[links]]", "Move all notes into one giant file", "Use a bigger context window"],
    answer: 1,
    explain: "Progressive disclosure: a 300-token map points to the 2–3 notes that matter. The rule goes in CLAUDE.md: start at 00-Index.md and never read the whole vault.",
  },
  {
    id: "vault-distill", world: "vault", industry: "⚡ Energy",
    scene: "Every week the AI re-reads the same 48-page supplier PDF (38k tokens) to answer questions about the same 6 numbers.",
    q: "Which vault habit fixes this?",
    options: ["Distill the PDF once into a short literature note with page citations, and read the note from then on", "Print the PDF", "Convert the PDF to images", "Ask the question less often"],
    answer: 0,
    explain: "Pay once to distill and reuse forever. The note keeps page references so the AI can still check the source when it really needs to.",
  },
  {
    id: "vault-handoff", world: "vault", industry: "🎮 Gaming",
    scene: "Every morning your coding session starts with the AI re-exploring the repo and you re-explaining yesterday's decisions (~12k tokens).",
    q: "What should you do at the END of each session?",
    options: ["Leave the chat open overnight", "Have the AI update a short hand-off note (done / decided / next / watch out), then /clear", "Copy the whole chat into a text file", "Nothing; re-explaining is unavoidable"],
    answer: 1,
    explain: "A 150-word hand-off note carries the context you already paid for into tomorrow's session for under 1k tokens.",
  },
  {
    id: "vault-dump", world: "vault", industry: "🏥 Healthcare",
    scene: "A teammate wants to paste the entire Obsidian vault (410k tokens) into the system prompt “so the AI knows everything”.",
    q: "Why is that a bad idea?",
    options: ["Obsidian files can't be read by AI", "It's billed on every request, dilutes attention, and defeats the point of linked notes; the AI should load notes on demand", "Markdown is too expensive", "It would work perfectly"],
    answer: 1,
    explain: "A vault works because notes are loaded on demand. Dumping it in wholesale turns a cheap library into the most expensive prompt you own.",
  },
];
