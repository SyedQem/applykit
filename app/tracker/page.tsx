import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { NewApplicationForm } from "@/components/new-application-form";

const statusStyles: Record<string, string> = {
  APPLIED: "bg-blue-100 text-blue-700",
  INTERVIEW: "bg-amber-100 text-amber-700",
  INTERVIEWING: "bg-amber-100 text-amber-700",
  OFFER: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
};

const statusLabel: Record<string, string> = {
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  INTERVIEWING: "Interviewing",
  OFFER: "Offer",
  REJECTED: "Rejected",
};

function toStatusKey(status: string) {
  return status.trim().toUpperCase().replaceAll(" ", "_");
}
const appliedDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default async function TrackerPage() {
  const applications = await prisma.application.findMany({
    orderBy: { appliedAt: "desc" },
    include: { events: true }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">Application Tracker</h2>
        <NewApplicationForm />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {applications.map((app) => {
          const statusKey = toStatusKey(app.status);

          return (
            <Card key={app.id} className="surface-primary surface-hover rounded-2xl">
              <CardContent className="space-y-4 p-6">
                <h3 className="font-semibold text-slate-900">
                  {app.role} @ {app.company}
                </h3>
                <div className="flex items-center justify-between gap-4">
                  <span className={`status-chip ${statusStyles[statusKey] ?? "bg-slate-100 text-slate-700"}`}>
                    {statusLabel[statusKey] ?? app.status}
                  </span>
                  <p className="text-sm text-slate-600">Events: {app.events.length}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      <div className="grid gap-4 md:grid-cols-2">
        {applications.map((app) => (
          <Card key={app.id}>
            <CardContent className="pt-6 space-y-1">
              <h3 className="font-semibold">
                {app.role} @ {app.company}
              </h3>
              <p className="text-sm text-slate-600">
                Applied on {appliedDateFormatter.format(app.appliedAt)} for {app.role} @ {app.company}
              </p>
              <p className="text-sm text-slate-600">Status: {app.status}</p>
              <p className="text-sm text-slate-600">Events: {app.events.length}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
