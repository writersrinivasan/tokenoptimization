"use client";

import { useMemo, useState } from "react";
import { fmt } from "./CaseFile";

type Opt = "search" | "ptc" | "clear" | "compact" | "cache";
const OPTS: { id: Opt; label: string; hint: string }[] = [
  { id: "search", label: "🔎 Tool search", hint: "20k of tool schemas → 2k" },
  { id: "ptc", label: "🧑‍💻 Code filters tool results", hint: "results shrink ~90%" },
  { id: "clear", label: "🧹 Clear stale tool results", hint: "keep only the last 3 in full" },
  { id: "compact", label: "🗜️ Compaction", hint: "summarize history past 80k" },
  { id: "cache", label: "🧊 Prompt caching", hint: "re-read prefix billed at ~10%" },
];

const SYSTEM = 3000, TOOLS = 20000, ASSIST = 400;

function simulate(turns: number, result: number, o: Record<Opt, boolean>) {
  const tools = o.search ? 2000 : TOOLS;
  const r = o.ptc ? Math.round(result * 0.1) : result;
  let summary = 0;
  let hist: number[] = []; // tool result sizes for past turns
  const ctx: number[] = [];
  let billed = 0;
  let prev = 0;
  for (let t = 0; t < turns; t++) {
    const histTokens = hist.reduce((s, x, i) => s + ASSIST + (o.clear && i < hist.length - 3 ? 60 : x), 0);
    let c = SYSTEM + tools + summary + histTokens;
    if (o.compact && c > 80000) {
      summary = 6000;
      hist = hist.slice(-2);
      c = SYSTEM + tools + summary + hist.reduce((s, x) => s + ASSIST + x, 0);
    }
    ctx.push(c);
    const fresh = Math.max(c - prev, ASSIST);
    billed += o.cache ? (c - fresh) * 0.1 + fresh : c;
    prev = c;
    hist.push(r);
  }
  return { ctx, billed };
}

export default function AgentLoopSim() {
  const [turns, setTurns] = useState(40);
  const [result, setResult] = useState(4000);
  const [on, setOn] = useState<Record<Opt, boolean>>({ search: false, ptc: false, clear: false, compact: false, cache: false });
  const none = { search: false, ptc: false, clear: false, compact: false, cache: false };

  const base = useMemo(() => simulate(turns, result, none), [turns, result]); // eslint-disable-line react-hooks/exhaustive-deps
  const opt = useMemo(() => simulate(turns, result, on), [turns, result, on]);

  const W = 640, H = 260, P = 36;
  const maxY = Math.max(...base.ctx, 1);
  const pt = (arr: number[]) =>
    arr.map((v, i) => `${P + (i / Math.max(arr.length - 1, 1)) * (W - P - 10)},${H - P - (v / maxY) * (H - P - 14)}`).join(" ");
  const saved = Math.round((1 - opt.billed / base.billed) * 100);

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>🌀 The agent-loop snowball</h3>
      <p className="note">
        An agent re-sends its whole context on every step: system prompt + tool schemas + every previous thought and tool result. Cost grows with every step, so total spend grows roughly with the <b>square</b> of the number of steps. Switch techniques on to flatten the curve.
      </p>
      <div className="grid g2" style={{ alignItems: "start" }}>
        <div>
          <div className="ctrl"><label>Agent steps (tool calls) <b>{turns}</b></label>
            <input type="range" min={5} max={80} value={turns} onChange={(e) => setTurns(+e.target.value)} /></div>
          <div className="ctrl"><label>Avg tool-result size <b>{fmt(result)} tokens</b></label>
            <input type="range" min={300} max={20000} step={100} value={result} onChange={(e) => setResult(+e.target.value)} /></div>
          {OPTS.map((x) => (
            <div key={x.id} className={`switch ${on[x.id] ? "on" : ""}`} onClick={() => setOn({ ...on, [x.id]: !on[x.id] })}>
              <div className="knob" /><div>{x.label}<small>{x.hint}</small></div>
            </div>
          ))}
        </div>
        <div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "#07071a", borderRadius: 14 }}>
            {[0.25, 0.5, 0.75, 1].map((f) => (
              <g key={f}>
                <line x1={P} x2={W - 10} y1={H - P - f * (H - P - 14)} y2={H - P - f * (H - P - 14)} stroke="rgba(255,255,255,.07)" />
                <text x={4} y={H - P - f * (H - P - 14) + 4} fill="#a9a6d0" fontSize="10">{fmt(maxY * f)}</text>
              </g>
            ))}
            <text x={W / 2} y={H - 8} fill="#a9a6d0" fontSize="11" textAnchor="middle">agent step →  (y = context tokens sent on that step)</text>
            <polyline points={pt(base.ctx)} fill="none" stroke="#ff5d6c" strokeWidth="3" />
            <polyline points={pt(opt.ctx)} fill="none" stroke="#3ee69b" strokeWidth="3" style={{ transition: "all .4s" }} />
            <g fontSize="12" fontWeight="700">
              <rect x={P + 8} y={10} width={12} height={4} fill="#ff5d6c" /><text x={P + 26} y={16} fill="#ff5d6c">naïve agent</text>
              <rect x={P + 120} y={10} width={12} height={4} fill="#3ee69b" /><text x={P + 138} y={16} fill="#3ee69b">optimized agent</text>
            </g>
          </svg>
          <div className="grid g3" style={{ marginTop: 12 }}>
            <div className="stat card"><div className="num" style={{ color: "var(--red)", fontSize: 26 }}>{fmt(base.billed)}</div><div className="lbl">tokens billed (naïve)</div></div>
            <div className="stat card"><div className="num" style={{ color: "var(--green)", fontSize: 26 }}>{fmt(opt.billed)}</div><div className="lbl">tokens billed (optimized)*</div></div>
            <div className="stat card"><div className="num grad" style={{ fontSize: 26 }}>−{saved}%</div><div className="lbl">per agent run</div></div>
          </div>
          <p className="note">*With caching, cached tokens are counted at their ~10% price-equivalent. Simplified model: 3k system prompt, 400-token reasoning per step.</p>
        </div>
      </div>
    </div>
  );
}
