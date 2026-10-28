import Link from "next/link";
import { GraphExplorer, BreakEven } from "@/components/GraphLab";

const DIY = `# 1) Build once (deterministic parsing = no LLM tokens for code structure)
import networkx as nx
G = nx.DiGraph()
for f in repo_files():
    for sym in parse_ast(f):                 # tree-sitter, etc.
        G.add_node(sym.id, kind=sym.kind, file=f.path)
        for callee in sym.calls:
            G.add_edge(sym.id, callee, rel="calls")
summaries = summarize_communities(G)         # LLM, once, small
save(G, "graph.json")

# 2) Give your agent ONE cheap tool instead of grep-everything
def query_graph(symbol: str, depth: int = 2) -> str:
    """Callers, callees, docs and files for a symbol (≈ few hundred tokens)."""
    sub = nx.ego_graph(G.to_undirected(), symbol, radius=depth)
    return render_compact(sub, summaries)`;

const WORKFLOW = `# Example workflow with a graph tool such as graphify
# (check the project's README for exact install & commands)

/graphify .          # scan the repo once → graph + report
                     # e.g. graph.json, GRAPH_REPORT.md, graph.html

# then, in your agent / CLAUDE.md:
"Before searching files, consult GRAPH_REPORT.md and the
 graph to locate relevant modules. Open only the files
 the graph points to."

# after code changes: re-run on changed files only`;

export default function Graphify() {
  return (
    <div className="w-graph">
      <section className="hero container">
        <span className="eyebrow">Bonus level · Graphify Lab</span>
        <h1>Give your agent a <span className="grad">map</span>,<br />not a flashlight.</h1>
        <p className="lead">
          Without a map, an agent explores a codebase like a tourist with a flashlight in a dark city: grep, open, read, repeat —
          paying for every alley, every time. A knowledge graph is the city map: built once, read in seconds.
        </p>
      </section>

      <section className="container section" style={{ paddingTop: 0 }}>
        <div className="grid g2">
          <div className="card story">
            <div className="avatar">🔦</div>
            <div className="bubble">
              <b>Without a graph.</b> “What breaks if we change interest calculation?” → grep “interest” → 412 hits in 57 files →
              read them all → answer. Next day, a colleague asks a similar question → <b>the agent does it all again</b>.
            </div>
          </div>
          <div className="card story">
            <div className="avatar">🗺️</div>
            <div className="bubble">
              <b>With a graph.</b> The repo is turned into nodes (modules, functions, tables, docs) and edges (calls, reads, writes,
              documents). The agent asks <code>impact(InterestCalc)</code>, gets a 10-node neighbourhood + file pointers, opens 2–3 files.
            </div>
          </div>
        </div>
      </section>

      <section className="container section">
        <h2 className="title">🏦 Case: Meridian Bank&apos;s legacy modernization</h2>
        <p className="sub">
          A (fictional) bank is migrating 1,240 COBOL/Java/Python files from its 1998 core-banking system. Six engineers and an AI agent
          ask ~40 “where / what calls / what breaks” questions a day. Build the graph step by step, then ask it questions.
        </p>
        <GraphExplorer />
      </section>

      <section className="container section">
        <h2 className="title">🤔 Why does a graph save so many tokens?</h2>
        <div className="grid g3">
          {[
            ["♻️", "Pay once, reuse forever", "Raw exploration is paid on every question. Graph building is paid once (and code structure can be parsed for free, without an LLM)."],
            ["🎯", "Relationships are precomputed", "“Who calls X?” is the expensive question for a reader, but a one-hop lookup in a graph."],
            ["🏘️", "Communities = summaries", "Clustering gives the agent a high-level map (“Interest”, “Loans”) to orient itself before diving in."],
            ["📍", "Pointers, not payloads", "The graph returns file paths and symbols; the agent reads only the 2–3 files that matter."],
            ["🧠", "Better answers", "Less noise in context means fewer missed dependencies — the agent sees the edges it would have overlooked."],
            ["🖼️", "Multi-modal", "Docs, PDFs, diagrams and code can live in one graph, so the policy PDF links straight to the function that implements it."],
          ].map(([e, t, d]) => (
            <div key={t} className="card"><div style={{ fontSize: 30 }}>{e}</div><b>{t}</b><p className="note" style={{ fontSize: 14 }}>{d}</p></div>
          ))}
        </div>
      </section>

      <section className="container section"><BreakEven /></section>

      <section className="container section">
        <h2 className="title">🛠️ How to use it</h2>
        <div className="grid g2">
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Option A — ready-made tool</h3>
            <p className="note">Open-source tools like <b>graphify</b> plug into AI coding assistants as a skill/command: point it at a folder of code, docs, papers or images and it produces a queryable knowledge graph plus a human-readable report.</p>
            <pre className="code">{WORKFLOW}</pre>
          </div>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Option B — roll your own for agents</h3>
            <p className="note">For production agent frameworks: build the graph in your pipeline and expose it as a single small tool.</p>
            <pre className="code">{DIY}</pre>
          </div>
        </div>
      </section>

      <section className="container section">
        <h2 className="title">🌍 Graphs beyond code</h2>
        <div className="grid g4">
          {[
            ["💊", "Pharma", "Drug ↔ enzyme ↔ interaction graph; the agent pulls a 2-hop neighbourhood instead of 300 papers."],
            ["⚖️", "Legal", "Clause ↔ contract ↔ party graph; “which contracts have auto-renewal with Vendor X?” becomes a lookup."],
            ["🏭", "Manufacturing", "Bill-of-materials graph; impact of a recalled bolt across 40 assemblies in one query."],
            ["📡", "Telecom", "Network-topology graph; root-cause agent walks the affected path, not every device log."],
          ].map(([e, t, d]) => (
            <div key={t} className="card"><div style={{ fontSize: 30 }}>{e}</div><b>{t}</b><p className="note" style={{ fontSize: 14 }}>{d}</p></div>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>⚠️ When NOT to build a graph</h3>
          <ul className="how">
            <li>Tiny projects — the agent can just read the few files directly.</li>
            <li>One-off questions — the build cost never pays back (see the break-even slider).</li>
            <li>Code that changes faster than you can refresh the graph — use incremental updates, or skip.</li>
            <li>Purely semantic “find similar text” needs — plain retrieval (embeddings) may be simpler.</li>
          </ul>
        </div>
      </section>

      <section className="container section" style={{ textAlign: "center" }}>
        <Link className="btn" href="/obsidian">Next bonus: 📓 Obsidian Vault →</Link>
      </section>
    </div>
  );
}
