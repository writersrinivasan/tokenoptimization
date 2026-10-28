import Link from "next/link";
import CaseFile from "@/components/CaseFile";
import VaultExplorer from "@/components/VaultExplorer";
import { vaultCases } from "@/lib/content";

const STRUCTURE = `VoltRide-Vault/               ← an Obsidian vault is just a folder
├── CLAUDE.md                 ← rules for the AI (below)
├── 00-Index.md               ← the map: start here
├── Projects/                 ← one MOC per project
├── Decisions/ADR-0xx.md      ← one note per decision
├── Research/                 ← distilled notes from PDFs & papers
├── Meetings/                 ← dated, short, linked
├── Sessions/handoff-latest.md← "where we left off"
└── attachments/              ← raw PDFs (AI avoids these)`;

const RULES = `# CLAUDE.md: how to use this vault
1. Start at 00-Index.md. Follow [[links]].
   Never glob or read the whole vault.
2. Read a note's \`summary:\` front-matter before opening it.
3. Don't open /attachments if a Research/ note exists.
4. Before proposing a design, check Decisions/.
5. End every session: update Sessions/handoff-latest.md
   (done · decided · next · watch out, ≤150 words).
6. New knowledge → a new short note, linked from its MOC.`;

const TEMPLATE = `---
summary: LFP chosen over NMC for the 2027 scooter: safer, cheaper, −15% range
tags: [decision, battery]
status: accepted
updated: 2026-10-21
---
# ADR-012 Use LFP cells
**Context:** thermal incidents in NMC pilot fleet
**Decision:** LFP 280Ah from [[Supplier-A cells]]
**Consequences:** bigger pack, see [[Battery-Thermal-Mgmt]]
**Revisit if:** NMC price drops >20%`;

export default function Obsidian() {
  return (
    <div className="w-vault">
      <section className="hero container">
        <span className="eyebrow">Bonus level · Obsidian Vault</span>
        <h1>Give your AI a <span className="grad">second brain</span>,<br />so it stops re-learning everything.</h1>
        <p className="lead">
          The “Obsidian technique”: keep project knowledge as short, linked Markdown notes in an Obsidian vault. The AI reads and
          writes those notes instead of re-reading raw PDFs, chats and code every session.
        </p>
      </section>

      <section className="container section" style={{ paddingTop: 0 }}>
        <div className="card" style={{ borderColor: "var(--accent)" }}>
          <h3 style={{ marginTop: 0 }}>✅ Is this a token-optimization technique? Yes.</h3>
          <p style={{ margin: "0 0 10px" }}>
            It belongs to the <b className="grad">N</b> in S.H.R.I.N.K.: <b>Never re-discover</b>. The tokens it saves are
            the ones spent on <b>re-reading</b>: the same PDF, the same Slack thread, the same “where were we?” every session.
            It sits between two techniques you&apos;ve already seen:
          </p>
          <div className="grid g3">
            <div className="card"><b>📜 CLAUDE.md memory</b><div className="note">One small file of rules. Always loaded.</div></div>
            <div className="card" style={{ borderColor: "var(--accent)" }}><b>📓 Obsidian vault</b><div className="note">Hundreds of linked notes. Loaded on demand, curated by humans + AI.</div></div>
            <div className="card"><b>🕸️ Graphify</b><div className="note">An auto-generated graph of code/docs. Built by a tool.</div></div>
          </div>
        </div>
      </section>

      <section className="container section">
        <h2 className="title">🧩 Why it works</h2>
        <div className="grid g4">
          {[
            ["📁", "It's just files", "A vault is a plain folder of .md files. Claude Code (or any agent) can read and write it directly. No plugin required."],
            ["🔗", "[[Links]] are a free graph", "Wikilinks let the AI hop from note to note, like a hand-built knowledge graph."],
            ["🪜", "Progressive disclosure", "Index → MOC → note → source. Each level is cheaper than the next, and the AI stops as soon as it has enough."],
            ["✍️", "AI writes back", "Each session leaves distilled notes behind, so tomorrow's session starts smarter and cheaper."],
          ].map(([e, t, d]) => (
            <div key={t} className="card"><div style={{ fontSize: 30 }}>{e}</div><b>{t}</b><p className="note" style={{ fontSize: 14 }}>{d}</p></div>
          ))}
        </div>
      </section>

      <section className="container section"><VaultExplorer /></section>

      <section className="container section">
        <h2 className="title">📁 Case files</h2>
        <p className="sub">Five vault habits, five industries. Flip each case to see what it saves.</p>
        <div className="grid g2">{vaultCases.map((c) => <CaseFile key={c.id} c={c} />)}</div>
      </section>

      <section className="container section">
        <h2 className="title">🛠️ Set it up in 15 minutes</h2>
        <div className="grid g3">
          <div className="card"><h4 style={{ marginTop: 0 }}>1 · Vault structure</h4><pre className="code" style={{ fontSize: 12 }}>{STRUCTURE}</pre></div>
          <div className="card"><h4 style={{ marginTop: 0 }}>2 · Rules for the AI</h4><pre className="code" style={{ fontSize: 12 }}>{RULES}</pre></div>
          <div className="card"><h4 style={{ marginTop: 0 }}>3 · Note template</h4><pre className="code" style={{ fontSize: 12 }}>{TEMPLATE}</pre></div>
        </div>
        <p className="note">
          To use it: open a terminal in the vault folder and start Claude Code there, or add the vault as an extra directory to
          your project session. Community Obsidian plugins and MCP servers exist for search and editing, but plain file access is enough.
        </p>
      </section>

      <section className="container section">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>🧭 Which memory technique when?</h3>
          <table className="table">
            <thead><tr><th>Technique</th><th>Built by</th><th>Best for</th><th>Token pattern</th></tr></thead>
            <tbody>
              <tr><td>📜 CLAUDE.md</td><td>You</td><td>A few rules the AI must always follow</td><td>Small, loaded every session</td></tr>
              <tr><td>📓 Obsidian vault</td><td>You + the AI</td><td>Decisions, research, meetings, hand-offs: team knowledge</td><td>Tiny index, notes loaded on demand</td></tr>
              <tr><td>🕸️ Graphify / code graph</td><td>A tool, automatically</td><td>Large codebases and document sets: structure and dependencies</td><td>Build once, query small neighbourhoods</td></tr>
              <tr><td>🔎 RAG / vector search</td><td>A pipeline</td><td>Huge unstructured corpora, “find similar text”</td><td>Top-k chunks per question</td></tr>
            </tbody>
          </table>
          <p className="note">They combine well: CLAUDE.md tells the AI to start at the vault index, the vault links to the code graph report, and RAG covers the long tail.</p>
        </div>
      </section>

      <section className="container section">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>⚠️ Pitfalls that turn a vault into a token leak</h3>
          <ul className="how">
            <li><b>Dumping the vault into context:</b> the opposite of the technique. Load on demand only.</li>
            <li><b>No index:</b> without a map, the AI globs and reads everything to find its way.</li>
            <li><b>Long, rambling notes:</b> keep notes atomic (one idea each) with a one-line summary.</li>
            <li><b>Stale notes:</b> outdated notes mislead the AI. Add an <code>updated:</code> date and prune regularly.</li>
            <li><b>Secrets in notes:</b> anything in the vault can end up in a prompt. Keep credentials and patient or customer data out.</li>
          </ul>
        </div>
      </section>

      <section className="container section" style={{ textAlign: "center" }}>
        <Link className="btn" href="/arena">Test yourself: 🕵️ Detective Arena →</Link>
      </section>
    </div>
  );
}
