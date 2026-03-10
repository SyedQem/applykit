import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BriefcaseBusiness, CalendarClock, CircleCheckBig, Clock3 } from "lucide-react";

import { NewApplicationDialog } from "@/components/new-application-dialog";
import { ApplicationsTable } from "@/components/applications-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerUser } from "@/lib/supabase/get-server-user";

export const dynamic = "force-dynamic";

export default async function TrackerPage() {
  const auth = await getServerUser();

  if (!auth) {
    redirect("/login");
  }

  const applications = await prisma.application.findMany({
    where: { ownerId: auth.user.id },
    orderBy: { appliedAt: "desc" },
    include: { events: true },
  });

  const totalApplications = applications.length;

  const interviewCount = applications.filter((application) =>
    application.events.some((event) =>
      event.type.toLowerCase().includes("interview")
    )
  ).length;

  const followUpCount = applications.filter((application) =>
    application.events.some((event) =>
      event.type.toLowerCase().includes("follow")
    )
  ).length;

  const activeCount = applications.filter((application) => {
    const status = application.status.toLowerCase();
    return !["rejected", "offer accepted", "withdrawn"].includes(status);
  }).length;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/70 p-6 shadow-xl shadow-slate-200/60 backdrop-blur md:p-8 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(129,140,248,0.14),transparent_30%)]" />
        
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              Your job search dashboard
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Stay on top of every application.
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
              Track progress, manage follow-ups, and keep interview momentum going
              without juggling scattered notes and tabs.
            </p>
          </div>

          <div className="flex shrink-0">
            <NewApplicationDialog />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.05]">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Applications</p>
              <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">
                {totalApplications}
              </p>
            </div>
            <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-600 dark:text-blue-300">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.05]">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Interviews</p>
              <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">
                {interviewCount}
              </p>
            </div>
            <div className="rounded-2xl bg-violet-500/10 p-3 text-violet-600 dark:text-violet-300">
              <CalendarClock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.05]">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Active</p>
              <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">
                {activeCount}
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-300">
              <CircleCheckBig className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.05]">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Follow-ups</p>
              <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">
                {followUpCount}
              </p>
            </div>
            <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-600 dark:text-amber-300">
              <Clock3 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur md:p-6 dark:border-white/10 dark:bg-white/[0.04]">
        <div className="mb-4 flex flex-col gap-2 border-b border-slate-200/70 pb-4 dark:border-white/10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Application pipeline
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              A live view of your current job search activity.
            </p>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400">
            {totalApplications === 0
              ? "No applications yet"
              : `${totalApplications} total application${totalApplications === 1 ? "" : "s"}`}
          </div>
        </div>

        <ApplicationsTable applications={applications} />
      </section>
    </div>
  );
}