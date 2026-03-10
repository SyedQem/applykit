import Link from "next/link";
import { BriefcaseBusiness, FileText, LayoutGrid, Search, Sparkles } from "lucide-react";

import { LogoutButton } from "@/components/logout-button";
import { NavLink } from "@/components/nav-link";
import { Input } from "@/components/ui/input";

const navItems = [
  { href: "/tracker", label: "Tracker", icon: LayoutGrid },
  { href: "/resume", label: "Resume", icon: FileText },
] as const;

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div
        className="fixed inset-0 -z-20 bg-[radial-gradient(circle_at_top,#60a5fa_0%,#0f172a_28%,#020617_60%,#020617_100%)]"
        aria-hidden
      />
      <div
        className="fixed left-[-6rem] top-20 -z-10 h-72 w-72 rounded-full bg-blue-400/15 blur-3xl"
        aria-hidden
      />
      <div
        className="fixed right-0 top-32 -z-10 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl"
        aria-hidden
      />
      <div
        className="fixed bottom-0 left-1/3 -z-10 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl"
        aria-hidden
      />

      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-white/10 bg-white/[0.03] px-5 py-6 backdrop-blur-xl lg:block">
          <Link href="/" className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-400/15 text-blue-200 ring-1 ring-white/10">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-white">ApplyKit</p>
              <p className="text-xs text-slate-400">Job search command center</p>
            </div>
          </Link>

          <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-lg shadow-black/10">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl bg-white/10 p-2 text-blue-200">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Stay consistent</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Keep your applications, interviews, and follow-ups organized in one place.
                </p>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.href}
                  className="group rounded-2xl border border-transparent bg-transparent transition hover:border-white/10 hover:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-3 px-3 py-2.5">
                    <div className="rounded-xl bg-white/5 p-2 text-slate-300 transition group-hover:bg-white/10 group-hover:text-white">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <NavLink href={item.href} label={item.label} />
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Workspace</p>
            <p className="mt-2 text-sm font-medium text-white">Focused and organized</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Built to make your search process feel less chaotic and more intentional.
            </p>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/55 px-4 py-4 backdrop-blur-xl sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Dashboard
                </p>
                <h1 className="mt-1 text-lg font-semibold tracking-tight text-white">
                  Manage your job search with clarity
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative hidden w-full max-w-md md:block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    className="h-11 w-[320px] border-white/10 bg-white/[0.05] pl-9 text-white placeholder:text-slate-500 focus-visible:border-blue-300 focus-visible:ring-blue-300/30"
                    placeholder="Search applications, contacts, events..."
                  />
                </div>

                <LogoutButton />
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <section className="mx-auto w-full max-w-7xl">{children}</section>
          </main>

          <footer className="border-t border-white/10 bg-white/[0.03] px-6 py-3 text-xs text-slate-500 backdrop-blur">
            <p>Qurb E Muhammad Syed · Built with Next.js · Ottawa, 🇨🇦</p>
          </footer>
        </div>
      </div>
    </div>
  );
}