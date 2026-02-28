import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { NewApplicationForm } from "@/components/new-application-form";

export default async function TrackerPage() {
  const applications = await prisma.application.findMany({
    orderBy: { appliedAt: "desc" },
    include: { events: true },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Application Tracker</h2>
        <NewApplicationForm />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {applications.map((app) => (
          <Card key={app.id}>
            <CardContent className="space-y-2 pt-6">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{app.company}</h3>
                <p className="text-sm text-slate-700">{app.role}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-slate-100 px-2 py-0.5">Status: {app.status}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5">Events: {app.events.length}</span>
              </div>

              {app.appliedAt ? (
                <p className="text-xs text-slate-500">
                  Applied on {new Date(app.appliedAt).toLocaleDateString()}
                </p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
