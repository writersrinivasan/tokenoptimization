import Link from "next/link";
import CaseFile from "@/components/CaseFile";
import HabitSim from "@/components/HabitSim";
import { devCases } from "@/lib/content";

export default function Dev() {
  return (
    <div className="w-dev">
      <section className="hero container">
        <span className="eyebrow">World 1 · Dev Forge</span>
        <h1>Building apps <span className="grad">with</span> AI<br />without burning tokens</h1>
        <p className="lead">Your coding assistant re-reads its whole context on every message. Here you learn to keep that context small, sharp and cheap.</p>
      </section>

      <section className="container section" style={{ paddingTop: 0 }}>
        <div className="card story">
          <div className="avatar">🧑‍💻</div>
          <div className="bubble">
            <b>Meet the PayNova team.</b> In March their AI-coding bill tripled — same team, same features. Their CTO opened the usage
            dashboard and found the culprits: a giant memory file, endless chat sessions, and full CI logs pasted into chat.
            Below are the seven fixes, each shown at a different company that hit the same wall. <b>Flip each case to “Optimized”</b> to collect its power-up.
          </div>
        </div>
      </section>

      <section className="container section">
        <h2 className="title">🧠 How a coding session actually spends tokens</h2>
        <div className="grid g4">
          {[
            ["📜", "Memory & system prompt", "Loaded at the start of every session"],
            ["🗂️", "Files the AI reads", "Every grep and every file read stays in context"],
            ["💬", "Conversation history", "Re-sent with every new message"],
            ["🧾", "Tool output", "Logs, test runs, command output"],
          ].map(([e, t, d]) => (
            <div key={t} className="card"><div style={{ fontSize: 32 }}>{e}</div><b>{t}</b><div className="note">{d}</div></div>
          ))}
        </div>
      </section>

      <section className="container section"><HabitSim /></section>

      <section className="container section">
        <h2 className="title">📁 Case files</h2>
        <p className="sub">Seven industries, seven habits. Toggle each one and watch the meter.</p>
        <div className="grid g2">{devCases.map((c) => <CaseFile key={c.id} c={c} />)}</div>
      </section>

      <section className="container section">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>🧾 Cheat sheet (Claude Code)</h3>
          <table className="table">
            <thead><tr><th>Command / habit</th><th>When</th><th>Token effect</th></tr></thead>
            <tbody>
              <tr><td><code>/clear</code></td><td>Switching to an unrelated task</td><td>Drops all history → small context again</td></tr>
              <tr><td><code>/compact [focus]</code></td><td>Long task, context getting heavy</td><td>Summarizes history, keeps what you name</td></tr>
              <tr><td><code>/context</code>, <code>/cost</code></td><td>Any time you're curious</td><td>Shows what fills the window / what you've spent</td></tr>
              <tr><td><code>/model</code></td><td>Mechanical vs. hard tasks</td><td>Cheaper model for simple work</td></tr>
              <tr><td>Plan mode (Shift+Tab)</td><td>Multi-file features</td><td>Fewer rewrites</td></tr>
              <tr><td>“Use a sub-agent to…”</td><td>Searching / researching large code</td><td>Main context receives only a summary</td></tr>
              <tr><td><code>cmd | tail -40</code></td><td>Tests, builds, logs</td><td>Only the useful lines enter context</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="container section" style={{ textAlign: "center" }}>
        <Link className="btn" href="/api-harbor">Next world: ⚓ API Harbor →</Link>
      </section>
    </div>
  );
}
