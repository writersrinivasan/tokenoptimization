"use client";

import { useEffect, useState } from "react";
import { fmt } from "./CaseFile";
import { useXP } from "./XP";

type Note = { id: string; path: string; tokens: number };
const NOTES: Note[] = [
  { id: "index", path: "00-Index.md", tokens: 350 },
  { id: "handoff", path: "Sessions/handoff-latest.md", tokens: 300 },
  { id: "thermal", path: "Projects/Battery-Thermal-Mgmt.md", tokens: 900 },
  { id: "app", path: "Projects/Charging-App.md", tokens: 800 },
  { id: "adr12", path: "Decisions/ADR-012 Use LFP cells.md", tokens: 400 },
  { id: "adr19", path: "Decisions/ADR-019 BLE over Wi-Fi.md", tokens: 350 },
  { id: "suppA", path: "Research/Supplier-A cells.md", tokens: 600 },
  { id: "papers", path: "Research/Thermal-runaway papers.md", tokens: 900 },
  { id: "meet", path: "Meetings/2026-10-21 Design review.md", tokens: 700 },
  { id: "people", path: "People/Supplier contacts.md", tokens: 250 },
  { id: "gloss", path: "Glossary.md", tokens: 400 },
];
const VAULT_TOTAL = 410000; // the full 312-note vault
const byId = Object.fromEntries(NOTES.map((n) => [n.id, n]));

const QUESTIONS = [
  {
    q: "Why did we choose LFP cells, and what's our thermal limit?",
    path: ["index", "adr12", "suppA", "thermal"],
    raw: 198000,
    rawWhat: "48-page datasheet PDF + 12 research papers + Slack export",
  },
  {
    q: "Resume yesterday's charging-app work.",
    path: ["handoff", "app", "adr19"],
    raw: 45000,
    rawWhat: "re-explore the repo, git log, and re-explain decisions in chat",
  },
  {
    q: "Prep me for tomorrow's Supplier-A call.",
    path: ["index", "people", "suppA", "meet"],
    raw: 61000,
    rawWhat: "email threads + datasheet PDF + meeting recording transcript",
  },
];

const INDEX_PREVIEW = `---
summary: Entry point for the VoltRide EV R&D vault
---
# 00 · Index
## Projects
- [[Battery-Thermal-Mgmt]] — cooling plate v3, limits
- [[Charging-App]] — rider app, BLE pairing
## Decisions
- [[ADR-012 Use LFP cells]] · [[ADR-019 BLE over Wi-Fi]]
## Research (distilled — read these, not PDFs)
- [[Supplier-A cells]] · [[Thermal-runaway papers]]
## People & meetings
- [[Supplier contacts]] · [[2026-10-21 Design review]]`;

type Mode = "raw" | "dump" | "links";

export default function VaultExplorer() {
  const [qi, setQi] = useState(0);
  const [mode, setMode] = useState<Mode>("links");
  const [step, setStep] = useState(0);
  const { claimed, claim } = useXP();
  const Q = QUESTIONS[qi];

  useEffect(() => {
    setStep(0);
    if (mode !== "links") return;
    const timers = Q.path.map((_, k) => setTimeout(() => setStep(k + 1), 500 * (k + 1)));
    return () => timers.forEach(clearTimeout);
  }, [qi, mode, Q.path]);

  const linkTokens = Q.path.reduce((s, id) => s + byId[id].tokens, 0);
  const cost = { raw: Q.raw, dump: VAULT_TOTAL, links: linkTokens };
  const MODES: { id: Mode; label: string; emoji: string }[] = [
    { id: "raw", label: "No vault: re-discover from raw sources", emoji: "😩" },
    { id: "dump", label: "Dump the whole vault into context", emoji: "🤯" },
    { id: "links", label: "Start at index → follow [[links]]", emoji: "😎" },
  ];

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>📓 VoltRide EV&apos;s R&amp;D vault: 312 notes, 11 shown</h3>
      <p className="note">Pick a question, then compare three ways the AI could answer it.</p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0" }}>
        {QUESTIONS.map((x, k) => (
          <button key={x.q} className={qi === k ? "btn" : "btn ghost"} style={{ padding: "8px 14px", fontSize: 14 }} onClick={() => setQi(k)}>
            ❓ {x.q}
          </button>
        ))}
      </div>
      <div className="toggle" style={{ flexWrap: "wrap" }}>
        {MODES.map((m) => (
          <button key={m.id} className={mode === m.id ? (m.id === "links" ? "on-good" : "on-bad") : ""} onClick={() => setMode(m.id)}>
            {m.emoji} {m.label}
          </button>
        ))}
      </div>

      <div className="grid g2" style={{ alignItems: "start" }}>
        <div className="grid" style={{ gap: 6 }}>
          {NOTES.map((n) => {
            const order = Q.path.indexOf(n.id);
            const loaded = mode === "links" && order >= 0 && order < step;
            return (
              <div key={n.id} className={`vault-note ${loaded ? "loaded" : ""} ${mode === "dump" ? "dumped" : ""}`}
                style={{ opacity: mode === "raw" ? 0.3 : 1 }}>
                <span>{loaded && <span className="step-n">{order + 1}</span>}📄 {n.path}</span>
                <span className="note">{fmt(n.tokens)}</span>
              </div>
            );
          })}
          <div className="vault-note" style={{ justifyContent: "center", opacity: 0.6 }}>… 301 more notes · {fmt(VAULT_TOTAL)} tokens in total</div>
        </div>

        <div>
          {mode === "links" && (
            <>
              <p className="note" style={{ margin: "0 0 6px" }}>Reading path:</p>
              <p style={{ margin: "0 0 10px" }}>
                {Q.path.map((id, k) => (
                  <span key={id}>{k > 0 && " → "}<span className="wikilink" style={{ opacity: k < step ? 1 : 0.3 }}>[[{byId[id].path.split("/").pop()!.replace(".md", "")}]]</span></span>
                ))}
              </p>
              <pre className="code" style={{ minHeight: 0, fontSize: 12 }}>{INDEX_PREVIEW}</pre>
            </>
          )}
          {mode === "raw" && (
            <div className="why"><b>No vault:</b> the AI re-reads {Q.rawWhat}, every time anyone asks. You pay for all the raw material, not just the knowledge in it.</div>
          )}
          {mode === "dump" && (
            <div className="why"><b>Whole vault in context:</b> all 312 notes are billed on every request and the answer is buried in noise. A library is useful because you don&apos;t read all of it.</div>
          )}

          {MODES.map((m) => (
            <div key={m.id} className="meter">
              <div className="meter-label"><span>{m.emoji} {m.label}</span><b>{fmt(cost[m.id])} tokens</b></div>
              <div className="meter-track">
                <div className={`meter-fill ${m.id === "links" ? "good" : "bad"}`} style={{ width: `${Math.max((cost[m.id] / VAULT_TOTAL) * 100, 1)}%` }} />
              </div>
            </div>
          ))}
          <p style={{ fontSize: 18, margin: "12px 0" }}>
            Following links is <b className="grad">{Math.round(Q.raw / linkTokens)}× cheaper</b> than re-discovering from raw sources for this question.
          </p>
          {claimed["vault-explorer"] ? <span className="claimed">✅ Vault power-up collected</span> :
            <button className="btn" disabled={mode !== "links"} onClick={() => claim("vault-explorer", 100, "Obsidian Vault")}>⚡ Collect Vault power-up (+100 XP)</button>}
        </div>
      </div>
      <p className="note">Illustrative numbers for a fictional company.</p>
    </div>
  );
}
