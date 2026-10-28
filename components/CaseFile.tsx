"use client";

import { useState } from "react";
import { useXP } from "./XP";
import type { Case } from "@/lib/content";

export function fmt(n: number): string {
  if (n < 0) return "−" + fmt(-n);
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1) + "M";
  if (n >= 10_000) return Math.round(n / 1000) + "k";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(Math.round(n));
}

function show(n: number, unit: string) {
  return unit.startsWith("$") ? `$${n.toLocaleString()}${unit.slice(1)}` : `${fmt(n)} ${unit}`;
}

export default function CaseFile({ c }: { c: Case }) {
  const [mode, setMode] = useState<"before" | "after">("before");
  const { claimed, claim } = useXP();
  const s = mode === "before" ? c.before : c.after;
  const max = Math.max(c.before.value, c.after.value);
  const saved = Math.round((1 - c.after.value / c.before.value) * 100);

  return (
    <article className="card case">
      <div className="case-head">
        <div className="case-emoji">{c.emoji}</div>
        <div>
          <div className="case-meta">{c.industry} · {c.technique}</div>
          <h3>{c.title}</h3>
          <div className="company">🏢 {c.company}</div>
        </div>
      </div>

      <p className="story">{c.story}</p>

      <div className="toggle">
        <button className={mode === "before" ? "on-bad" : ""} onClick={() => setMode("before")}>😬 Token-leaky way</button>
        <button className={mode === "after" ? "on-good" : ""} onClick={() => setMode("after")}>😎 Optimized way</button>
      </div>

      <div className="note" style={{ marginBottom: 6 }}>{s.label}</div>
      <pre className="code">{s.code}</pre>

      <div className="meter">
        <div className="meter-label"><span>😬 Before</span><b>{show(c.before.value, c.unit)}</b></div>
        <div className="meter-track"><div className="meter-fill bad" style={{ width: `${(c.before.value / max) * 100}%` }} /></div>
      </div>
      <div className="meter">
        <div className="meter-label"><span>😎 After</span><b>{show(c.after.value, c.unit)}</b></div>
        <div className="meter-track">
          <div className="meter-fill good" style={{ width: mode === "after" ? `${Math.max((c.after.value / max) * 100, 1.5)}%` : "0%" }} />
        </div>
      </div>

      <div className="why"><b>💡 Why it works: </b>{c.why}</div>
      <ul className="how">{c.how.map((h) => <li key={h}>{h}</li>)}</ul>

      <div className="case-foot">
        <div>
          <span className="saving grad">{mode === "after" ? `−${saved}%` : "??%"}</span>
          <span className="note"> {mode === "after" ? "tokens/cost saved" : "flip to the optimized way to reveal"}</span>
        </div>
        {claimed[c.id] ? (
          <span className="claimed">✅ Power-up collected</span>
        ) : (
          <button className="btn" disabled={mode !== "after"} onClick={() => claim(c.id, 50, c.technique)}>
            ⚡ Collect power-up (+50 XP)
          </button>
        )}
      </div>
    </article>
  );
}
