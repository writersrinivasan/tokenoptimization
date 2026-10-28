import Link from "next/link";
import CaseFile from "@/components/CaseFile";
import AgentLoopSim from "@/components/AgentLoopSim";
import { agentCases } from "@/lib/content";

const CREW = [
  { e: "🧭", n: "Orchestrator", m: "strong model", t: "plans, decides, delegates" },
  { e: "📦", n: "Procurement agent", m: "small model", t: "reads supplier quotes" },
  { e: "🏬", n: "Inventory agent", m: "small model + SQL", t: "checks stock" },
  { e: "🗺️", n: "Routing agent", m: "code + small model", t: "optimizes trucks" },
  { e: "📜", n: "Compliance agent", m: "rules + small model", t: "customs checks" },
];

export default function Agents() {
  return (
    <div className="w-agent">
      <section className="hero container">
        <span className="eyebrow">World 3 · Agent Galaxy</span>
        <h1>Agents are token <span className="grad">black holes</span>.<br />Let&apos;s bend the gravity.</h1>
        <p className="lead">
          A chatbot answers once. An agent thinks, calls a tool, reads the result, thinks again — 20, 50, 200 times — and every
          step re-reads everything before it. That's why agentic systems are where most tokens go.
        </p>
      </section>

      <section className="container section" style={{ paddingTop: 0 }}>
        <div className="card story">
          <div className="avatar">🚚</div>
          <div className="bubble">
            <b>Mission briefing: LogiChain.</b> A logistics company built a 5-agent crew to handle purchase orders end to end. The
            pilot worked brilliantly… and cost <b>₹38 per order</b>. At 20,000 orders a day, finance pulled the plug. The crew below
            is the redesigned version: same results at a fraction of the tokens. Play with the simulator to see why.
          </div>
        </div>
        <div className="grid g4" style={{ marginTop: 18 }}>
          {CREW.map((c) => (
            <div key={c.n} className="card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 36 }} className="float">{c.e}</div>
              <b>{c.n}</b>
              <div><span className="chip accent">{c.m}</span></div>
              <div className="note">{c.t}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="container section"><AgentLoopSim /></section>

      <section className="container section">
        <h2 className="title">📁 Case files</h2>
        <p className="sub">Seven agent architectures from seven industries — the before/after of each design decision.</p>
        <div className="grid g2">{agentCases.map((c) => <CaseFile key={c.id} c={c} />)}</div>
      </section>

      <section className="container section">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>🏗️ The token-efficient agent blueprint</h3>
          <div className="grid g3">
            {[
              ["1. Start simple", "Can a single call or a fixed workflow do it? Only use an agent when the path truly can't be scripted."],
              ["2. Small tool surface", "Few, well-described tools; defer the long tail behind tool search."],
              ["3. Code does the heavy lifting", "Filter, join and aggregate in code; the model sees only results."],
              ["4. Isolate & summarize", "Workers in their own context; orchestrator receives briefs."],
              ["5. Forget on purpose", "Clear stale tool results, compact long histories, keep a memory file."],
              ["6. Cache the skeleton", "System prompt + tool schemas are identical every step — cache them."],
              ["7. Right brain per role", "Strong model for judgement, small model for reading & extraction."],
              ["8. Define done", "Clear deliverable, stopping rule, task budget, max-steps guard."],
              ["9. Map, don't wander", "For big codebases & document sets, give the agent a knowledge graph (see Graphify Lab)."],
            ].map(([t, d]) => (
              <div key={t}><b style={{ color: "var(--accent)" }}>{t}</b><div className="note" style={{ fontSize: 14 }}>{d}</div></div>
            ))}
          </div>
        </div>
      </section>

      <section className="container section" style={{ textAlign: "center" }}>
        <Link className="btn" href="/graphify">Bonus level: 🕸️ Graphify Lab →</Link>
      </section>
    </div>
  );
}
