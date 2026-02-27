import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { RightDrawer } from "@/components/right-drawer";

export const metadata: Metadata = {
  title: "applykit",
  description: "Application tracker and resume manager"
};

const navItems = [
  { href: "/tracker", label: "Tracker" },
  { href: "/resume", label: "Resume" }
];

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen">
          <aside className="w-56 border-r bg-white p-4">
            <h1 className="mb-6 text-xl font-semibold">applykit</h1>
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-md px-3 py-2 text-sm hover:bg-slate-100"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          <div className="flex min-h-screen flex-1 flex-col">
            <header className="flex h-14 items-center border-b bg-white px-4">
              <div className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input className="pl-9" placeholder="Search applications, contacts, events..." />
              </div>
            </header>
            <main className="flex flex-1">
              <section className="flex-1 p-6">{children}</section>
              <RightDrawer />
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
