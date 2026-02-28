import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { NewApplicationForm } from "@/components/new-application-form";

const statusStyles: Record<string, string> = {
  APPLIED: "bg-blue-100 text-blue-700",
  INTERVIEW: "bg-amber-100 text-amber-700",
  OFFER: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
};

const statusLabel: Record<string, string> = {
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
};

export default async function TrackerPage() {
  const applications = await prisma.application.findMany({
    orderBy: { appliedAt: "desc" },
    include: { events: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Application Tracker</h2>
        <NewApplicationForm />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {applications.map((app) => (
          <Card key={app.id} className="surface-primary surface-hover rounded-2xl">
            <CardContent className="space-y-4 p-6">
              <h3 className="font-semibold text-slate-900">
                {app.role} @ {app.company}
              </h3>
              <div className="flex items-center justify-between gap-4">
                <span
                  className={`status-chip ${statusStyles[app.status] ?? "bg-slate-100 text-slate-700"}`}
                >
                  {statusLabel[app.status] ?? app.status}
                </span>
                <p className="text-sm text-slate-600">Events: {app.events.length}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
