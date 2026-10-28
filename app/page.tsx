import Link from "next/link";
import TokenPlayground from "@/components/TokenPlayground";

const WORLDS = [
  { href: "/dev", cls: "w-dev", emoji: "🔥", name: "World 1 · Dev Forge", desc: "Building an app with an AI coding assistant? Stop paying for context you don't need.", tags: ["Lean memory", "/clear", "Sub-agents", "Plan mode"], cases: 7 },
  { href: "/api-harbor", cls: "w-api", emoji: "⚓", name: "World 2 · API Harbor", desc: "Your product calls an LLM API thousands of times a day. Every token is on the invoice.", tags: ["Caching", "Batch", "Routing", "RAG"], cases: 8 },
  { href: "/agents", cls: "w-agent", emoji: "🚀", name: "World 3 · Agent Galaxy", desc: "Agents loop, re-read and chat with each other — the biggest token black hole of all.", tags: ["Isolation", "Context editing", "Hand-offs", "Tiering"], cases: 7 },
  { href: "/graphify", cls: "w-graph", emoji: "🕸️", name: "Bonus · Graphify Lab", desc: "Turn a codebase into a knowledge graph once — then let agents query a map instead of wandering.", tags: ["Knowledge graph", "Communities", "Break-even"], cases: 1 },
  { href: "/obsidian", cls: "w-vault", emoji: "📓", name: "Bonus · Obsidian Vault", desc: "Give your AI a second brain of linked notes, so it stops re-reading the same PDFs, chats and code every session.", tags: ["Index notes", "Hand-offs", "Decision records"], cases: 5 },
  { href: "/arena", cls: "w-arena", emoji: "🕵️", name: "Boss · Detective Arena", desc: "33 real-world crime scenes across all worlds. Find the token leak, earn XP, get your detective rank.", tags: ["Quiz", "XP", "Ranks", "Review"], cases: 33 },
];

const SHRINK = [
  { l: "S", t: "Send less", d: "Precise prompts, filtered logs, top-k retrieval.", c: "var(--pink)" },
  { l: "H", t: "Hold the stable part", d: "Prompt caching for system prompts, tools, documents.", c: "var(--orange)" },
  { l: "R", t: "Route smartly", d: "Small model for easy work, batch for non-urgent work.", c: "var(--yellow)" },
  { l: "I", t: "Isolate contexts", d: "/clear, sub-agents, structured hand-offs.", c: "var(--green)" },
  { l: "N", t: "Never re-discover", d: "Memory files, Obsidian vaults, knowledge graphs.", c: "var(--cyan)" },
  { l: "K", t: "Keep outputs short", d: "Schemas, concise answers, task budgets.", c: "var(--purple)" },
];

export default function Home() {
  return (
    <>
      <section className="hero container w-dev">
        <span className="eyebrow">An interactive adventure in AI economics</span>
        <h1>Every token is a <span className="rainbow">coin</span>.<br />Stop leaking them.</h1>
        <p className="lead">
          Travel through three worlds where real industries — banks, hospitals, factories, airlines — learn to
          cut their AI token bills by 50–95%. Flip every case from <b style={{ color: "var(--red)" }}>leaky</b> to{" "}
          <b style={{ color: "var(--green)" }}>optimized</b>, collect power-ups and level up from Token Rookie to Grandmaster.
        </p>
        <div style={{ marginTop: 28, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link className="btn" href="/dev">🎮 Start the quest</Link>
          <Link className="btn ghost" href="/arena">🕵️ Jump to the quiz</Link>
        </div>
      </section>

      <section className="container section">
        <h2 className="title">🪣 Where do tokens leak?</h2>
        <p className="sub">Think of your AI budget as a water tank. These are the three holes — each world in this quest plugs one of them.</p>
        <div className="grid g3">
          {[
            { e: "👩‍💻", t: "While you build", d: "Bloated memory files, pasted logs, never-cleared chats, the AI exploring code you could have pointed to.", w: "Dev Forge" },
            { e: "🔌", t: "Every API call", d: "The same 10k-token instructions re-sent and fully billed 100,000 times a day; verbose answers; the wrong model.", w: "API Harbor" },
            { e: "🤖", t: "Inside agent loops", d: "Each step re-reads everything before it. 50 steps × a growing context = a token snowball.", w: "Agent Galaxy" },
          ].map((x) => (
            <div key={x.t} className="card">
              <div style={{ fontSize: 40 }}>{x.e} <span className="drip">💧</span></div>
              <h3 style={{ margin: "8px 0 6px" }}>{x.t}</h3>
              <p style={{ color: "var(--muted)", margin: 0 }}>{x.d}</p>
              <span className="chip" style={{ marginTop: 10 }}>Fixed in: {x.w}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="container section">
        <h2 className="title">🗺️ The quest map</h2>
        <p className="sub">Each world tells the story of real-world-style companies. Every case has a <b>before/after switch</b>, a cost meter and a power-up.</p>
        <div className="grid g3">
          {WORLDS.map((w) => (
            <Link key={w.href} href={w.href} className={`card world-card ${w.cls}`}>
              <div className="world-emoji float">{w.emoji}</div>
              <h3>{w.name}</h3>
              <p>{w.desc}</p>
              <div>{w.tags.map((t) => <span key={t} className="chip">{t}</span>)}</div>
              <div style={{ marginTop: 12 }}><span className="chip accent">{w.cases} {w.cases === 1 ? "lab" : w.href === "/arena" ? "cases to solve" : "case files"} →</span></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container section">
        <h2 className="title">🧠 Remember one word: <span className="rainbow">S.H.R.I.N.K.</span></h2>
        <p className="sub">Every technique in this quest belongs to one of six moves. You will see these letters on every case.</p>
        <div className="grid g3">
          {SHRINK.map((s) => (
            <div key={s.l} className="card" style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ fontSize: 44, fontWeight: 900, color: s.c, width: 50, textAlign: "center" }}>{s.l}</div>
              <div><b>{s.t}</b><div style={{ color: "var(--muted)", fontSize: 14 }}>{s.d}</div></div>
            </div>
          ))}
        </div>
      </section>

      <section className="container section w-api">
        <h2 className="title">🔬 First, what even is a token?</h2>
        <p className="sub">Models read and write in small chunks called tokens — roughly ¾ of an English word. You pay for every token in (your prompt + all context) and every token out (the answer). Output tokens usually cost ~5× more than input.</p>
        <TokenPlayground />
      </section>
    </>
  );
}
