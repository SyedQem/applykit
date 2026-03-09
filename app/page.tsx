"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, CalendarClock, FileText, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const featureCards = [
  {
    icon: Briefcase,
    title: "Organize every role",
    description: "Keep all your applications, companies, and statuses in one clean workflow.",
  },
  {
    icon: FileText,
    title: "Track interview notes",
    description: "Capture what happened, what was asked, and what to improve for the next round.",
  },
  {
    icon: CalendarClock,
    title: "Stay on top of follow-ups",
    description: "Never lose momentum when it’s time to send a check-in or prep for the next step.",
  },
];

const steps = [
  {
    number: "01",
    title: "Add applications",
    description: "Log the roles you’ve applied to and keep everything centralized.",
  },
  {
    number: "02",
    title: "Track progress",
    description: "Monitor interviews, updates, rejections, and offers with a clear timeline.",
  },
  {
    number: "03",
    title: "Stay consistent",
    description: "Use notes and reminders to keep your job search sharp and organized.",
  },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-900">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,#60a5fa_0%,#0f172a_30%,#020617_65%,#020617_100%)]"
        aria-hidden
      />

      <motion.div
        className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl"
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      <motion.div
        className="absolute right-0 top-32 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl"
        animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl"
        animate={{ y: [0, 16, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-12 sm:px-8 lg:px-12">
        <div className="flex flex-1 flex-col justify-center gap-16">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-blue-100 backdrop-blur-md">
                <Sparkles className="h-4 w-4" />
                Built for a cleaner, smarter job search
              </div>

              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Track every application in one place.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                ApplyKit helps you manage applications, interview notes, and follow-ups with a
                workflow that feels more like a product and less like a chaotic spreadsheet.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="min-w-44">
                  <Link href="/login">
                    Get started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="min-w-44 border-white/20 bg-white/5 text-white backdrop-blur hover:bg-white/10"
                >
                  <a href="#how-it-works">See how it works</a>
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-300">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  Application tracking
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  Interview notes
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  Follow-up reminders
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.12, ease: "easeOut" }}
            >
              <div className="relative rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
                <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <p className="text-sm text-slate-400">Your dashboard</p>
                      <h2 className="text-xl font-semibold text-white">Application Pipeline</h2>
                    </div>
                    <div className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-medium text-emerald-300">
                      12 active
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {[
                      ["Frontend Intern", "Interview scheduled", "Tomorrow"],
                      ["Software Developer Co-op", "Application sent", "2 days ago"],
                      ["Product Designer Intern", "Follow-up due", "Today"],
                    ].map(([role, status, time], index) => (
                      <motion.div
                        key={role}
                        initial={{ opacity: 0, x: 18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.45, delay: 0.2 + index * 0.12 }}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium text-white">{role}</p>
                            <p className="mt-1 text-sm text-slate-400">{status}</p>
                          </div>
                          <span className="text-xs text-slate-500">{time}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    {[
                      ["28", "Applications"],
                      ["6", "Interviews"],
                      ["4", "Follow-ups"],
                    ].map(([value, label], index) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.45 + index * 0.1 }}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center"
                      >
                        <p className="text-2xl font-semibold text-white">{value}</p>
                        <p className="mt-1 text-xs text-slate-400">{label}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <section id="how-it-works" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55 }}
              className="max-w-2xl"
            >
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-blue-200/80">
                How it works
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                A more structured way to manage your job search
              </h2>
              <p className="mt-4 text-slate-300">
                Keep your search process organized from first application to final offer without
                bouncing between notes, tabs, and spreadsheets.
              </p>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.45, delay: index * 0.12 }}
                >
                  <Card className="h-full border-white/10 bg-white/10 text-white shadow-lg backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white/[0.12]">
                    <CardContent className="p-6">
                      <p className="text-sm font-semibold text-blue-200">{step.number}</p>
                      <h3 className="mt-3 text-xl font-semibold">{step.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-slate-300">{step.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55 }}
              className="max-w-2xl"
            >
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-blue-200/80">
                Features
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                Everything you need to stay on top of the process
              </h2>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-3">
              {featureCards.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.45, delay: index * 0.12 }}
                  >
                    <Card className="h-full border-white/10 bg-white/10 text-white shadow-lg backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-950/30">
                      <CardContent className="p-6">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-400/15 text-blue-200">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
                        <p className="mt-3 text-sm leading-6 text-slate-300">
                          {feature.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </section>

          <motion.section
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55 }}
            className="rounded-[2rem] border border-white/10 bg-white/10 px-6 py-10 text-center shadow-2xl shadow-black/20 backdrop-blur-xl sm:px-10"
          >
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              Stop treating your job search like scattered notes.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-300">
              Bring your applications, interviews, and follow-ups into one flow that actually
              helps you stay consistent.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="min-w-44">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="min-w-44 border-white/20 bg-white/5 text-white hover:bg-white/10"
              >
                <a href="#how-it-works">Learn more</a>
              </Button>
            </div>
          </motion.section>
        </div>
      </section>
    </main>
  );
}