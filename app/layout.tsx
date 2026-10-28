import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import { XPProvider } from "@/components/XP";

export const metadata: Metadata = {
  title: "Token Quest — Learn AI Token Optimization",
  description: "A playful journey through token optimization for AI-assisted development, API usage and agentic systems.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <XPProvider>
          <Nav />
          <main>{children}</main>
          <footer className="footer">
            🪙 Token Quest · Companies in the case files are fictional; numbers are illustrative estimates for learning.
            Prices are an Oct 2026 snapshot — always check the provider&apos;s pricing page.
          </footer>
        </XPProvider>
      </body>
    </html>
  );
}
