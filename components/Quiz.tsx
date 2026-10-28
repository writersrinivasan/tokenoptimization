"use client";

import Link from "next/link";
import { useState } from "react";
import { quiz, WORLD_INFO, type World } from "@/lib/content";
import { useXP } from "./XP";

const RANKS = [
  { min: 0, t: "🐣 Junior Token Detective", d: "Every expert started here. Revisit the worlds and try again!" },
  { min: 0.5, t: "🔍 Token Inspector", d: "You can spot the obvious leaks. Hunt down the sneaky ones next." },
  { min: 0.8, t: "🕵️ Chief Token Detective", d: "Leaks can't hide from you. Your CFO would like a word (a grateful one)." },
  { min: 1, t: "👑 Sherlock of Tokens", d: "Flawless. You could run a token-optimization practice." },
];

type Filter = "all" | World;
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "🌍 All worlds" },
  ...(Object.keys(WORLD_INFO) as World[]).map((w) => ({ id: w, label: WORLD_INFO[w].label })),
];

export default function Quiz() {
  const [filter, setFilter] = useState<Filter>("all");
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const { claim } = useXP();

  const set = filter === "all" ? quiz : quiz.filter((q) => q.world === filter);
  const done = results.length === set.length && picked === null;
  const q = set[Math.min(i, set.length - 1)];
  const score = results.filter(Boolean).length;

  const restart = (f: Filter = filter) => { setFilter(f); setI(0); setPicked(null); setResults([]); };
  const pick = (o: number) => {
    if (picked !== null) return;
    setPicked(o);
    const ok = o === q.answer;
    setResults([...results, ok]);
    if (ok) claim(`quiz-${q.id}`, 30, "Leak found");
  };
  const next = () => { setPicked(null); setI(i + 1); };

  const tabs = (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
      {FILTERS.map((f) => {
        const n = f.id === "all" ? quiz.length : quiz.filter((x) => x.world === f.id).length;
        return (
          <button key={f.id} className={filter === f.id ? "btn" : "btn ghost"} style={{ padding: "8px 14px", fontSize: 14 }} onClick={() => restart(f.id)}>
            {f.label} · {n}
          </button>
        );
      })}
    </div>
  );

  if (done) {
    const ratio = score / set.length;
    const rank = [...RANKS].reverse().find((r) => ratio >= r.min)!;
    const missed = set.filter((_, k) => !results[k]);
    return (
      <>
        {tabs}
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 70 }} className="float">{rank.t.split(" ")[0]}</div>
          <h2 className="title">{rank.t.split(" ").slice(1).join(" ")}</h2>
          <p className="lead">You found <b className="grad">{score} / {set.length}</b> token leaks. {rank.d}</p>
          <button className="btn" style={{ marginTop: 20 }} onClick={() => restart()}>🔁 Play again</button>
        </div>
        {missed.length > 0 && (
          <div className="card" style={{ marginTop: 18 }}>
            <h3 style={{ marginTop: 0 }}>📚 Case review: the leaks you missed</h3>
            {missed.map((m) => (
              <div key={m.id} className="why" style={{ marginBottom: 12 }}>
                <div className="note">{m.industry} · {WORLD_INFO[m.world].label}</div>
                <b>{m.q}</b> {m.scene}
                <div style={{ marginTop: 6 }}>✅ <b style={{ color: "var(--green)" }}>{m.options[m.answer]}</b></div>
                <div className="note" style={{ fontSize: 14, marginTop: 4 }}>{m.explain}</div>
                <Link href={WORLD_INFO[m.world].href} style={{ color: "var(--accent)", fontSize: 14, fontWeight: 700 }}>Revisit the lesson →</Link>
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {tabs}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div className="progress-dots">
            {set.map((_, k) => <div key={k} className={`dot ${k < results.length ? (results[k] ? "ok" : "ko") : k === i ? "cur" : ""}`} />)}
          </div>
          <span className="chip accent">Case {i + 1} / {set.length} · {q.industry}</span>
        </div>
        <div className="story" style={{ marginTop: 20 }}>
          <div className="avatar">🕵️</div>
          <div className="bubble">
            <span className="chip" style={{ marginBottom: 6 }}>{WORLD_INFO[q.world].label}</span><br />
            <b>The scene:</b> {q.scene}<br /><b style={{ color: "var(--yellow)" }}>{q.q}</b>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          {q.options.map((o, k) => (
            <button key={o} disabled={picked !== null}
              className={`opt ${picked !== null && k === q.answer ? "right" : ""} ${picked === k && k !== q.answer ? "wrong" : ""}`}
              onClick={() => pick(k)}>
              {String.fromCharCode(65 + k)}. {o}
            </button>
          ))}
        </div>
        {picked !== null && (
          <>
            <div className="why"><b>{picked === q.answer ? "✅ Leak found! +30 XP. " : "❌ Not quite. "}</b>{q.explain}</div>
            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              <button className="btn" onClick={next}>{i + 1 < set.length ? "Next case →" : "See my rank 🏆"}</button>
              <Link className="btn ghost" href={WORLD_INFO[q.world].href}>📚 Revisit the lesson</Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
