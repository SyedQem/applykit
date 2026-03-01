import type { Metadata } from "next";
import "./globals.css";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NavLink } from "@/components/nav-link";

export const metadata: Metadata = {
  title: "applykit",
  description: "Application tracker and resume manager"
};

const navItems = [
  { href: "/tracker", label: "Tracker" },
  { href: "/resume", label: "Resume" }
] as const;

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen">
          <aside className="w-56 border-r border-slate-200/80 bg-slate-50/80 p-4">
            <h1 className="mb-6 text-xl font-semibold">applykit</h1>
            <nav className="space-y-2">
              {navItems.map((item) => (
                <NavLink key={item.href} href={item.href} label={item.label} />
              ))}
            </nav>
          </aside>

          <div className="flex min-h-screen flex-1 flex-col">
            <header className="flex h-16 items-center border-b border-slate-200/80 bg-white/90 px-6">
              <div className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input className="pl-9" placeholder="Search applications, contacts, events..." />
              </div>
            </header>
            <main className="flex flex-1">
              <section className="flex-1 p-6">{children}</section>
            </main>
            <footer className="border-t border-slate-200/70 bg-white/70 px-6 py-2 text-xs text-slate-400">
              <p>Qurb E Muhammad Syed · Built with Next.js · Ottawa, 🇨🇦</p>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
