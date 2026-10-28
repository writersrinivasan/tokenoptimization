"use client";

import { useMemo, useState } from "react";

const COLORS = ["#ff4fa3", "#ff9a3c", "#ffd23f", "#3ee69b", "#2fd3ff", "#a66bff"];

// Very rough visual tokenizer: real tokenizers differ, but ~4 chars/token is a good mental model for English.
function pseudoTokens(text: string) {
  return text.match(/\s?[A-Za-z]{1,5}|\s?\d{1,3}|\s?[^\sA-Za-z\d]|\s+/g) ?? [];
}

export default function TokenPlayground() {
  const [text, setText] = useState(
    "Hi! Could you please kindly help me to summarize the following customer complaint in a very detailed manner?"
  );
  const toks = useMemo(() => pseudoTokens(text), [text]);
  const lean = "Summarize this complaint in 2 bullets:";
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>🔬 See tokens with your own eyes</h3>
      <p className="note">Type anything. Each coloured block ≈ one token (an approximation — real tokenizers vary by model).</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} />
      <div style={{ margin: "12px 0", wordBreak: "break-word" }}>
        {toks.map((t, i) => (
          <span key={i} className="tok" style={{ background: COLORS[i % COLORS.length] + "40", borderBottom: `2px solid ${COLORS[i % COLORS.length]}` }}>
            {t.replace(/ /g, " ")}
          </span>
        ))}
      </div>
      <div className="grid g3">
        <div className="stat card"><div className="num grad">{toks.length}</div><div className="lbl">≈ tokens</div></div>
        <div className="stat card"><div className="num grad">{(toks.length * 1_000_000).toLocaleString()}</div><div className="lbl">tokens if 1M users send it</div></div>
        <div className="stat card"><div className="num grad">${((toks.length * 1_000_000 * 2) / 1_000_000).toFixed(0)}</div><div className="lbl">at $2 per 1M input tokens</div></div>
      </div>
      <button className="btn ghost" style={{ marginTop: 12 }} onClick={() => setText(lean)}>✂️ Show me a lean version</button>
    </div>
  );
}
