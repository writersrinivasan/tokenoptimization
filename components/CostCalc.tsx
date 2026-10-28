"use client";

import { useState } from "react";
import { PRICES } from "@/lib/content";

type Lever = "cache" | "route" | "concise" | "batch";
const LEVERS: { id: Lever; label: string; hint: string }[] = [
  { id: "cache", label: "Prompt caching", hint: "static part of the prompt billed at ~10%" },
  { id: "route", label: "Model routing", hint: "simple share → small model (+ tiny triage call)" },
  { id: "concise", label: "Concise / structured output", hint: "output tokens −60%" },
  { id: "batch", label: "Batch the non-urgent share", hint: "−50% on that share" },
];

export default function CostCalc() {
  const [reqs, setReqs] = useState(50000);
  const [inTok, setInTok] = useState(6000);
  const [staticPct, setStaticPct] = useState(80);
  const [outTok, setOutTok] = useState(500);
  const [simplePct, setSimplePct] = useState(60);
  const [batchPct, setBatchPct] = useState(30);
  const [on, setOn] = useState<Record<Lever, boolean>>({ cache: false, route: false, concise: false, batch: false });

  const cost = (lv: Record<Lever, boolean>) => {
    const s = PRICES.sonnet, h = PRICES.haiku;
    const effIn = lv.cache ? inTok * (1 - staticPct / 100) + inTok * (staticPct / 100) * 0.1 : inTok;
    const out = lv.concise ? outTok * 0.4 : outTok;
    const simple = lv.route ? simplePct / 100 : 0;
    const perReq =
      (1 - simple) * (effIn * s.in + out * s.out) +
      simple * (effIn * h.in + out * h.out) +
      (lv.route ? 200 * h.in + 5 * h.out : 0);
    const disc = lv.batch ? 1 - (batchPct / 100) * PRICES.batchDiscount : 1;
    return (perReq * disc * reqs * 30) / 1_000_000;
  };

  const none = { cache: false, route: false, concise: false, batch: false };
  const base = cost(none);
  // waterfall: apply active levers one at a time, in order
  const steps: { label: string; value: number }[] = [{ label: "Baseline", value: base }];
  const acc = { ...none };
  LEVERS.forEach((l) => {
    if (on[l.id]) { acc[l.id] = true; steps.push({ label: l.label, value: cost(acc) }); }
  });
  const final = steps[steps.length - 1].value;
  const money = (v: number) => "$" + Math.round(v).toLocaleString();

  const slider = (label: string, v: number, set: (n: number) => void, min: number, max: number, step: number, unit = "") => (
    <div className="ctrl">
      <label>{label} <b>{v.toLocaleString()}{unit}</b></label>
      <input type="range" min={min} max={max} step={step} value={v} onChange={(e) => set(+e.target.value)} />
    </div>
  );

  return (
    <div className="card">
      <div className="grid g2" style={{ alignItems: "start" }}>
        <div>
          <h3 style={{ marginTop: 0 }}>🧮 Your API bill simulator</h3>
          {slider("Requests per day", reqs, setReqs, 1000, 500000, 1000)}
          {slider("Input tokens per request", inTok, setInTok, 200, 50000, 100)}
          {slider("…of which static (same every call)", staticPct, setStaticPct, 0, 95, 5, "%")}
          {slider("Output tokens per request", outTok, setOutTok, 50, 4000, 50)}
          {slider("Simple requests (routable)", simplePct, setSimplePct, 0, 95, 5, "%")}
          {slider("Non-urgent requests (batchable)", batchPct, setBatchPct, 0, 100, 5, "%")}
        </div>
        <div>
          {LEVERS.map((l) => (
            <div key={l.id} className={`switch ${on[l.id] ? "on" : ""}`} onClick={() => setOn({ ...on, [l.id]: !on[l.id] })}>
              <div className="knob" />
              <div>{l.label}<small>{l.hint}</small></div>
            </div>
          ))}
          <h4 style={{ marginBottom: 6 }}>Monthly bill waterfall</h4>
          {steps.map((s, i) => (
            <div key={s.label} className="meter">
              <div className="meter-label"><span>{i === 0 ? "😬" : "⬇️"} {s.label}</span><b>{money(s.value)}</b></div>
              <div className="meter-track">
                <div className={`meter-fill ${i === 0 ? "bad" : "good"}`} style={{ width: `${Math.max((s.value / base) * 100, 1)}%` }} />
              </div>
            </div>
          ))}
          <div className="grid g2" style={{ marginTop: 12 }}>
            <div className="stat card"><div className="num" style={{ color: "var(--green)" }}>{money(base - final)}</div><div className="lbl">saved per month</div></div>
            <div className="stat card"><div className="num grad">−{Math.round((1 - final / base) * 100)}%</div><div className="lbl">of the bill</div></div>
          </div>
        </div>
      </div>
      <p className="note">
        Reference prices (USD per 1M tokens, Oct 2026 snapshot): mid-tier model ${PRICES.sonnet.in} in / ${PRICES.sonnet.out} out, small model ${PRICES.haiku.in} / ${PRICES.haiku.out}, cache reads ≈ 10% of input, Batch API 50% off. Cache writes (1.25× for the first call) are ignored for simplicity. Always check the official pricing page.
      </p>
    </div>
  );
}
