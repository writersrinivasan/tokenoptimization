"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const LEVELS = [
  { min: 0, name: "Token Rookie", emoji: "🐣" },
  { min: 200, name: "Token Saver", emoji: "🪙" },
  { min: 500, name: "Cache Captain", emoji: "🧢" },
  { min: 900, name: "Agent Architect", emoji: "🤖" },
  { min: 1400, name: "Graph Guru", emoji: "🕸️" },
  { min: 2000, name: "Token Grandmaster", emoji: "👑" },
];

export function levelFor(xp: number) {
  let i = 0;
  LEVELS.forEach((l, idx) => { if (xp >= l.min) i = idx; });
  const cur = LEVELS[i];
  const next = LEVELS[i + 1];
  const pct = next ? ((xp - cur.min) / (next.min - cur.min)) * 100 : 100;
  return { ...cur, next, pct };
}

type XPState = {
  xp: number;
  claimed: Record<string, boolean>;
  claim: (id: string, amount: number, label: string) => void;
  reset: () => void;
};

const Ctx = createContext<XPState | null>(null);
const KEY = "token-quest-v1";

export function XPProvider({ children }: { children: React.ReactNode }) {
  const [claimed, setClaimed] = useState<Record<string, boolean>>({});
  const [xp, setXp] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        setXp(s.xp ?? 0);
        setClaimed(s.claimed ?? {});
      }
    } catch {}
  }, []);

  const persist = (x: number, c: Record<string, boolean>) => {
    try { localStorage.setItem(KEY, JSON.stringify({ xp: x, claimed: c })); } catch {}
  };

  const claim = useCallback((id: string, amount: number, label: string) => {
    if (claimed[id]) return;
    const c = { ...claimed, [id]: true };
    const nx = xp + amount;
    const after = levelFor(nx);
    setClaimed(c);
    setXp(nx);
    persist(nx, c);
    setToast(levelFor(xp).name !== after.name ? `${after.emoji} LEVEL UP! You are now a ${after.name}` : `+${amount} XP · ${label}`);
  }, [claimed, xp]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const reset = () => { setXp(0); setClaimed({}); persist(0, {}); };

  return (
    <Ctx.Provider value={{ xp, claimed, claim, reset }}>
      {children}
      {toast && <div className="toast">{toast}</div>}
    </Ctx.Provider>
  );
}

export function useXP() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useXP outside provider");
  return c;
}
