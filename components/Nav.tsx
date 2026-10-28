"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { levelFor, useXP } from "./XP";

const LINKS = [
  { href: "/", label: "🗺️ Map" },
  { href: "/dev", label: "🔥 Dev Forge" },
  { href: "/api-harbor", label: "⚓ API Harbor" },
  { href: "/agents", label: "🚀 Agent Galaxy" },
  { href: "/graphify", label: "🕸️ Graphify Lab" },
  { href: "/obsidian", label: "📓 Obsidian Vault" },
  { href: "/arena", label: "🕵️ Detective Arena" },
];

export default function Nav() {
  const path = usePathname();
  const { xp } = useXP();
  const lvl = levelFor(xp);
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Link href="/" className="brand">🪙 <span>Token<b>Quest</b></span></Link>
        <div className="nav-links">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={path === l.href ? "active" : ""}>{l.label}</Link>
          ))}
        </div>
        <div className="xp" title={`${xp} XP`}>
          <div className="xp-top"><span>{lvl.emoji} {lvl.name}</span><b>{xp} XP</b></div>
          <div className="xp-bar"><div className="xp-fill" style={{ width: `${lvl.pct}%` }} /></div>
        </div>
      </div>
    </nav>
  );
}
