"use client";

import { useState } from "react";
import { devHabits, PRICES } from "@/lib/content";
import { fmt } from "./CaseFile";

const BASE = 2_400_000; // tokens per developer per day (heavy AI-assisted usage, illustrative)

export default function HabitSim() {
  const [on, setOn] = useState<Record<string, boolean>>({});
  const [devs, setDevs] = useState(20);
  const remaining = devHabits.reduce((acc, h) => (on[h.id] ? acc * (1 - h.cut) : acc), 1);
  const perDev = BASE * remaining;
  const monthly = (t: number) => (t * devs * 22 * PRICES.opus.in) / 1_000_000;
  const pct = Math.round((1 - remaining) * 100);
  const fuel = Math.round(remaining * 100);

  return (
    <div className="card">
      <div className="grid g2" style={{ alignItems: "start" }}>
        <div>
          <h3 style={{ marginTop: 0 }}>🎮 Build your team's token habits</h3>
          <p className="note">Switch habits on and watch a day of AI-assisted development shrink. Baseline: {fmt(BASE)} tokens per developer per day.</p>
          {devHabits.map((h) => (
            <div key={h.id} className={`switch ${on[h.id] ? "on" : ""}`} onClick={() => setOn({ ...on, [h.id]: !on[h.id] })}>
              <div className="knob" />
              <div style={{ flex: 1 }}>{h.label}<small>{h.hint}</small></div>
              <b style={{ color: "var(--green)" }}>−{Math.round(h.cut * 100)}%</b>
            </div>
          ))}
        </div>
        <div>
          <div className="ctrl">
            <label>Team size <b>{devs} developers</b></label>
            <input type="range" min={1} max={200} value={devs} onChange={(e) => setDevs(+e.target.value)} />
          </div>
          <div style={{ display: "flex", justifyContent: "center", margin: "18px 0" }}>
            <svg viewBox="0 0 200 120" width="100%" style={{ maxWidth: 320 }}>
              <defs>
                <linearGradient id="gauge" x1="0" x2="1">
                  <stop offset="0" stopColor="#3ee69b" /><stop offset=".5" stopColor="#ffd23f" /><stop offset="1" stopColor="#ff5d6c" />
                </linearGradient>
              </defs>
              <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="16" strokeLinecap="round" />
              <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="url(#gauge)" strokeWidth="16" strokeLinecap="round"
                strokeDasharray={`${(fuel / 100) * 251} 251`} style={{ transition: "stroke-dasharray .6s" }} />
              <text x="100" y="88" textAnchor="middle" fill="#fff" fontSize="26" fontWeight="900">{fuel}%</text>
              <text x="100" y="108" textAnchor="middle" fill="#a9a6d0" fontSize="10">of baseline token burn</text>
            </svg>
          </div>
          <div className="grid g2">
            <div className="stat card"><div className="num" style={{ color: "var(--red)" }}>${Math.round(monthly(BASE)).toLocaleString()}</div><div className="lbl">/month before</div></div>
            <div className="stat card"><div className="num" style={{ color: "var(--green)" }}>${Math.round(monthly(perDev)).toLocaleString()}</div><div className="lbl">/month with your habits</div></div>
          </div>
          <p style={{ textAlign: "center", fontSize: 18 }}>
            {pct === 0 ? "👈 Turn on a habit to start saving" : <>You saved <b className="grad">{pct}%</b> — {fmt((BASE - perDev) * devs * 22)} tokens every month 🎉</>}
          </p>
          <p className="note">Illustrative model: input-heavy usage at ${PRICES.opus.in}/1M tokens, 22 working days. Real savings depend on your workflow — measure with your tool's usage/cost view (e.g. /cost or /context in Claude Code).</p>
        </div>
      </div>
    </div>
  );
}
