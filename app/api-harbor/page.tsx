import Link from "next/link";
import CaseFile from "@/components/CaseFile";
import CostCalc from "@/components/CostCalc";
import { apiCases } from "@/lib/content";

export default function ApiHarbor() {
  return (
    <div className="w-api">
      <section className="hero container">
        <span className="eyebrow">World 2 · API Harbor</span>
        <h1>Every API call is a <span className="grad">shipment</span>.<br />Stop paying for empty containers.</h1>
        <p className="lead">In production, one wasteful prompt is multiplied by thousands of requests a day. Small fixes here turn into big savings on the monthly invoice.</p>
      </section>

      <section className="container section" style={{ paddingTop: 0 }}>
        <div className="card story">
          <div className="avatar">⚓</div>
          <div className="bubble">
            <b>The harbor analogy.</b> Each API request is a ship. The <b>cargo</b> is your input tokens (instructions, documents,
            history, tool schemas) and the <b>return cargo</b> is the output. You pay per container, both ways — and return containers (output) cost about 5× more.
            The harbor master's job: <b>don't ship the same crates twice (cache)</b>, <b>use small boats for small loads (routing)</b>,
            <b>ship overnight when nobody's waiting (batch)</b>, and <b>pack only what the customer ordered (RAG, schemas)</b>.
          </div>
        </div>
      </section>

      <section className="container section">
        <h2 className="title">🧪 Anatomy of a request</h2>
        <div className="card">
          <div style={{ display: "flex", height: 46, borderRadius: 12, overflow: "hidden", fontSize: 13, fontWeight: 700, color: "#0b0b1e" }}>
            <div style={{ flex: 18, background: "var(--purple)", display: "grid", placeItems: "center" }}>tools 18%</div>
            <div style={{ flex: 32, background: "var(--cyan)", display: "grid", placeItems: "center" }}>system prompt 32%</div>
            <div style={{ flex: 30, background: "var(--blue)", display: "grid", placeItems: "center" }}>history / docs 30%</div>
            <div style={{ flex: 8, background: "var(--yellow)", display: "grid", placeItems: "center" }}>question</div>
            <div style={{ flex: 12, background: "var(--pink)", display: "grid", placeItems: "center" }}>output</div>
          </div>
          <p className="note" style={{ marginTop: 10 }}>
            A typical enterprise chatbot request: the actual user question is often under 10% of the tokens. Everything to the
            left of it is the same on most calls, which makes it a perfect candidate for <b>caching</b>. Order matters: caching matches
            prefixes in the order <b>tools → system → messages</b>.
          </p>
        </div>
      </section>

      <section className="container section"><CostCalc /></section>

      <section className="container section">
        <h2 className="title">📁 Case files</h2>
        <p className="sub">Eight production systems, eight levers. Every case shows real-shaped code.</p>
        <div className="grid g2">{apiCases.map((c) => <CaseFile key={c.id} c={c} />)}</div>
      </section>

      <section className="container section">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>🧭 Which lever first?</h3>
          <table className="table">
            <thead><tr><th>Your situation</th><th>Pull this lever</th><th>Typical saving</th></tr></thead>
            <tbody>
              <tr><td>Big, repeated system prompt / documents</td><td>Prompt caching</td><td>up to ~90% on the cached part</td></tr>
              <tr><td>Results not needed in real time</td><td>Batch API</td><td>50%</td></tr>
              <tr><td>Many easy questions</td><td>Routing to a small model / no model</td><td>60–95% on that traffic</td></tr>
              <tr><td>Long answers nobody reads</td><td>Structured / concise output</td><td>50–80% of output cost</td></tr>
              <tr><td>Sending whole documents</td><td>Retrieval + re-ranking</td><td>80–97% of input</td></tr>
              <tr><td>Long chats</td><td>Rolling summary / compaction</td><td>50–70% per conversation</td></tr>
              <tr><td>Dozens of tools</td><td>Tool search with deferred loading</td><td>80–90% of tool tokens</td></tr>
            </tbody>
          </table>
          <p className="note">Order of attack: measure → free wins (caching, trimming, batch) → trade-offs (smaller models, lower effort) — and always check quality with an eval set.</p>
        </div>
      </section>

      <section className="container section" style={{ textAlign: "center" }}>
        <Link className="btn" href="/agents">Next world: 🚀 Agent Galaxy →</Link>
      </section>
    </div>
  );
}
