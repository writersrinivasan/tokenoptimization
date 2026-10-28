"use client";

import { useEffect, useState } from "react";
import { fmt } from "./CaseFile";
import { useXP } from "./XP";

type N = { id: string; label: string; x: number; y: number; c: keyof typeof COMM; file: string };
const COMM = {
  interest: { color: "#3ee69b", name: "Interest" },
  loans: { color: "#ff9a3c", name: "Loans" },
  accounts: { color: "#2fd3ff", name: "Accounts" },
  compliance: { color: "#ff4fa3", name: "Compliance" },
  batch: { color: "#ffd23f", name: "Batch jobs" },
  channels: { color: "#a66bff", name: "Channels" },
  docs: { color: "#ffffff", name: "Docs" },
};

const NODES: N[] = [
  { id: "int", label: "InterestCalc", x: 400, y: 220, c: "interest", file: "core/INTCALC.cbl" },
  { id: "rate", label: "RateTable", x: 540, y: 140, c: "interest", file: "core/RATETBL.cpy" },
  { id: "day", label: "DayCount", x: 545, y: 270, c: "interest", file: "core/DAYCNT.cbl" },
  { id: "emi", label: "EMIEngine", x: 250, y: 140, c: "loans", file: "loans/EMI.cbl" },
  { id: "orig", label: "LoanOrigination", x: 110, y: 80, c: "loans", file: "loans/ORIG.java" },
  { id: "pre", label: "Prepayment", x: 100, y: 200, c: "loans", file: "loans/PREPAY.cbl" },
  { id: "acct", label: "AccountMaster", x: 430, y: 400, c: "accounts", file: "acct/ACCTMST.cbl" },
  { id: "bal", label: "BalanceUpdate", x: 280, y: 360, c: "accounts", file: "acct/BALUPD.cbl" },
  { id: "stmt", label: "Statement", x: 590, y: 390, c: "accounts", file: "acct/STMT.java" },
  { id: "tds", label: "TaxTDS", x: 680, y: 200, c: "compliance", file: "comp/TDS.cbl" },
  { id: "reg", label: "RegReport", x: 720, y: 320, c: "compliance", file: "comp/REGRPT.py" },
  { id: "eod", label: "EODBatch", x: 230, y: 255, c: "batch", file: "batch/EOD.jcl" },
  { id: "sched", label: "Scheduler", x: 90, y: 330, c: "batch", file: "batch/SCHED.jcl" },
  { id: "mob", label: "MobileAPI", x: 350, y: 50, c: "channels", file: "api/mobile.ts" },
  { id: "branch", label: "BranchUI", x: 160, y: 430, c: "channels", file: "ui/branch.tsx" },
  { id: "pol", label: "InterestPolicy.pdf", x: 560, y: 50, c: "docs", file: "docs/InterestPolicy.pdf" },
];

const EDGES: [string, string, string][] = [
  ["emi", "int", "calls"], ["int", "rate", "reads"], ["int", "day", "calls"], ["eod", "int", "calls"],
  ["eod", "bal", "calls"], ["bal", "acct", "writes"], ["stmt", "acct", "reads"], ["stmt", "int", "calls"],
  ["tds", "int", "reads"], ["reg", "tds", "reads"], ["reg", "acct", "reads"], ["pre", "emi", "calls"],
  ["orig", "emi", "calls"], ["mob", "stmt", "calls"], ["mob", "orig", "calls"], ["branch", "acct", "reads"],
  ["pol", "int", "documents"], ["sched", "eod", "triggers"],
];

const QUERIES = [
  {
    q: "What breaks if we change the interest formula?",
    nodes: ["int", "emi", "eod", "stmt", "tds", "reg", "pre", "orig", "pol", "mob"],
    raw: 186000, graph: 4800, rawFiles: 57, graphFiles: 3,
    answer: `impact(InterestCalc)  community: Interest
  file: core/INTCALC.cbl
  ← called by : EMIEngine, EODBatch, Statement, TaxTDS
  ← documented: InterestPolicy.pdf §4.2
  ⇠ transitive: Prepayment, LoanOrigination,
                RegReport, MobileAPI
  → next: open INTCALC.cbl + EMI.cbl only`,
  },
  {
    q: "How does an EMI payment reach the customer statement?",
    nodes: ["sched", "eod", "emi", "int", "bal", "acct", "stmt"],
    raw: 142000, graph: 3900, rawFiles: 41, graphFiles: 2,
    answer: `path(EMIEngine → Statement)
  Scheduler ─triggers→ EODBatch ─calls→ InterestCalc
  EODBatch ─calls→ BalanceUpdate ─writes→ AccountMaster
  Statement ─reads→ AccountMaster
  EMIEngine ─calls→ InterestCalc
  → next: open EOD.jcl + BALUPD.cbl only`,
  },
  {
    q: "Which modules does the TDS (tax) audit touch?",
    nodes: ["tds", "int", "rate", "day", "reg", "acct"],
    raw: 98000, graph: 2600, rawFiles: 29, graphFiles: 2,
    answer: `neighbors(TaxTDS, depth=2)  community: Compliance
  TaxTDS ─reads→ InterestCalc ─reads→ RateTable
                              ─calls→ DayCount
  RegReport ─reads→ TaxTDS, AccountMaster
  → next: open TDS.cbl + REGRPT.py only`,
  },
];

const STAGES = [
  { t: "Scan", d: "Walk every file: code, SQL, JCL, PDFs, diagrams. Code structure is parsed with an AST parser (e.g. tree-sitter) — zero LLM tokens." },
  { t: "Extract", d: "Turn files into entities: modules, functions, tables, concepts. An LLM is used only for unstructured docs, once." },
  { t: "Connect", d: "Add relationships: calls, reads, writes, documents, triggers. This is the knowledge the agent used to re-discover every time." },
  { t: "Cluster", d: "Group tightly-linked nodes into communities and write a short summary per community — a 'map of the city'." },
  { t: "Query", d: "The agent asks the graph first, gets a tiny neighbourhood + file pointers, and opens only those files." },
];

export function GraphExplorer() {
  const [stage, setStage] = useState(4);
  const [qi, setQi] = useState<number | null>(0);
  const [playing, setPlaying] = useState(false);
  const { claimed, claim } = useXP();

  useEffect(() => {
    if (!playing) return;
    if (stage >= 4) { setPlaying(false); return; }
    const t = setTimeout(() => setStage((s) => s + 1), 1100);
    return () => clearTimeout(t);
  }, [playing, stage]);

  const query = stage === 4 && qi !== null ? QUERIES[qi] : null;
  const hit = (id: string) => !query || query.nodes.includes(id);
  const pos = Object.fromEntries(NODES.map((n) => [n.id, n]));

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <h3 style={{ margin: 0 }}>🕸️ Meridian Bank core-banking graph — 1,240 files → 16 key nodes shown</h3>
        <button className="btn ghost" onClick={() => { setStage(0); setPlaying(true); }}>▶ Watch it build</button>
      </div>

      <div className="pipeline" style={{ margin: "16px 0" }}>
        {STAGES.map((s, i) => (
          <div key={s.t} className={`step ${stage === i ? "on" : ""}`} onClick={() => { setPlaying(false); setStage(i); }}>
            <div className="n">STEP {i + 1}</div><h4>{s.t}</h4><p>{s.d}</p>
          </div>
        ))}
      </div>

      <div className="grid g2" style={{ alignItems: "start" }}>
        <div className="graph-wrap">
          <svg viewBox="0 0 800 480">
            <defs>
              <marker id="arr" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="rgba(255,255,255,.5)" />
              </marker>
            </defs>
            {stage >= 2 && EDGES.map(([a, b, rel]) => {
              const on = hit(a) && hit(b);
              const A = pos[a], B = pos[b];
              return (
                <g key={a + b} className="edge" opacity={query ? (on ? 1 : 0.08) : 0.55}>
                  <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={on && query ? "#3ee69b" : "rgba(255,255,255,.45)"} strokeWidth={on && query ? 2.5 : 1.3} markerEnd="url(#arr)" />
                  {query && on && <text x={(A.x + B.x) / 2} y={(A.y + B.y) / 2 - 4} fill="#3ee69b" fontSize="10" textAnchor="middle">{rel}</text>}
                </g>
              );
            })}
            {NODES.map((n) => {
              const col = stage >= 3 ? COMM[n.c].color : "#8c89b8";
              const on = hit(n.id);
              return (
                <g key={n.id} className="node" opacity={on ? 1 : 0.15}>
                  <circle cx={n.x} cy={n.y} r={stage === 0 ? 5 : 13} fill={col} fillOpacity={0.25} stroke={col} strokeWidth={2} />
                  {stage >= 1 && <text x={n.x} y={n.y + 28} fill="#f1f0ff" fontSize="12" textAnchor="middle" fontWeight={600}>{n.label}</text>}
                  {stage === 0 && <text x={n.x} y={n.y + 18} fill="#8c89b8" fontSize="9" textAnchor="middle">{n.file}</text>}
                </g>
              );
            })}
          </svg>
          {stage >= 3 && (
            <div style={{ padding: "8px 12px", display: "flex", gap: 6, flexWrap: "wrap" }}>
              {Object.values(COMM).map((c) => <span key={c.name} className="chip" style={{ borderLeft: `4px solid ${c.color}` }}>{c.name}</span>)}
            </div>
          )}
        </div>

        <div>
          <h4 style={{ marginTop: 0 }}>Ask the agent a question 👇</h4>
          {QUERIES.map((q, i) => (
            <button key={q.q} className={`opt ${qi === i && stage === 4 ? "right" : ""}`} onClick={() => { setStage(4); setQi(i); }}>
              {q.q}
            </button>
          ))}
          {query ? (
            <>
              <p className="note" style={{ margin: "10px 0 4px" }}>What the graph hands the agent:</p>
              <pre className="code" style={{ minHeight: 0 }}>{query.answer}</pre>
              <div className="meter">
                <div className="meter-label"><span>😬 grep + read raw files ({query.rawFiles} files)</span><b>{fmt(query.raw)} tokens</b></div>
                <div className="meter-track"><div className="meter-fill bad" style={{ width: "100%" }} /></div>
              </div>
              <div className="meter">
                <div className="meter-label"><span>😎 graph query + {query.graphFiles} targeted files</span><b>{fmt(query.graph)} tokens</b></div>
                <div className="meter-track"><div className="meter-fill good" style={{ width: `${Math.max((query.graph / query.raw) * 100, 2)}%` }} /></div>
              </div>
              <p style={{ fontSize: 18, margin: "10px 0" }}>≈ <b className="grad">{Math.round(query.raw / query.graph)}× fewer tokens</b> for this question</p>
              {claimed["graph-q"] ? <span className="claimed">✅ Graph power-up collected</span> :
                <button className="btn" onClick={() => claim("graph-q", 100, "Graphify")}>⚡ Collect Graph power-up (+100 XP)</button>}
            </>
          ) : (
            <p className="note">Finish the build (step 5) to query the graph.</p>
          )}
        </div>
      </div>
      <p className="note">Illustrative numbers for a fictional bank. Actual reduction depends on codebase size, question type, and how well the graph is built.</p>
    </div>
  );
}

export function BreakEven() {
  const [build, setBuild] = useState(400000);
  const [queries, setQueries] = useState(300);
  const [raw, setRaw] = useState(120000);
  const graph = 4500;
  const savedPerQ = raw - graph;
  const be = Math.ceil(build / savedPerQ);
  const net = queries * savedPerQ - build;
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>⚖️ Build once, query forever — when does a graph pay off?</h3>
      <div className="grid g2">
        <div>
          <div className="ctrl"><label>One-time graph build cost <b>{fmt(build)} tokens</b></label>
            <input type="range" min={50000} max={3000000} step={50000} value={build} onChange={(e) => setBuild(+e.target.value)} /></div>
          <div className="ctrl"><label>Agent questions per month <b>{queries}</b></label>
            <input type="range" min={5} max={5000} step={5} value={queries} onChange={(e) => setQueries(+e.target.value)} /></div>
          <div className="ctrl"><label>Tokens per question without graph <b>{fmt(raw)}</b></label>
            <input type="range" min={10000} max={300000} step={5000} value={raw} onChange={(e) => setRaw(+e.target.value)} /></div>
          <p className="note">With graph: ~{fmt(graph)} tokens per question. Incremental rebuilds (only changed files) keep the build cost low after day one.</p>
        </div>
        <div className="grid" style={{ alignContent: "start" }}>
          <div className="stat card"><div className="num grad">{be}</div><div className="lbl">questions to break even</div></div>
          <div className="stat card"><div className="num" style={{ color: net > 0 ? "var(--green)" : "var(--red)" }}>{net > 0 ? "+" : ""}{fmt(net)}</div><div className="lbl">net tokens saved in month 1</div></div>
        </div>
      </div>
    </div>
  );
}
